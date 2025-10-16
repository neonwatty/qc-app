//
//  RemindersViewModel.swift
//  QualityControl
//
//  Week 5: Reminders System
//  State management for reminders and notifications
//

import Foundation
import SwiftData

@MainActor
@Observable
class RemindersViewModel {

    // MARK: - Properties

    private let modelContext: ModelContext
    private let userId: UUID

    var reminders: [Reminder] = []
    var filteredReminders: [Reminder] = []
    var selectedFilter: ReminderFilter = .all
    var isLoading: Bool = false
    var error: Error?

    // MARK: - Initialization

    init(modelContext: ModelContext, userId: UUID) {
        self.modelContext = modelContext
        self.userId = userId
    }

    // MARK: - Data Loading

    func loadReminders() async {
        isLoading = true
        error = nil

        do {
            let descriptor = FetchDescriptor<Reminder>(
                sortBy: [SortDescriptor(\.scheduledFor, order: .forward)]
            )

            let allReminders = try modelContext.fetch(descriptor)
            reminders = allReminders.filter { $0.userId == userId }
            applyFilter()
        } catch {
            self.error = error
        }

        isLoading = false
    }

    func refresh() async {
        await loadReminders()
    }

    // MARK: - CRUD Operations

    func createReminder(
        title: String,
        message: String,
        scheduledFor: Date,
        frequency: ReminderFrequency,
        category: ReminderCategory
    ) throws -> Reminder {
        let reminder = Reminder(
            title: title,
            message: message,
            category: category,
            frequency: frequency,
            scheduledFor: scheduledFor,
            userId: userId
        )

        modelContext.insert(reminder)
        try modelContext.save()

        reminders.append(reminder)
        reminders.sort { $0.scheduledFor < $1.scheduledFor }
        applyFilter()

        return reminder
    }

    func updateReminder(
        _ reminder: Reminder,
        title: String,
        message: String,
        scheduledFor: Date,
        frequency: ReminderFrequency,
        category: ReminderCategory
    ) throws {
        reminder.title = title
        reminder.message = message
        reminder.scheduledFor = scheduledFor
        reminder.frequency = frequency
        reminder.category = category

        try modelContext.save()
        reminders.sort { $0.scheduledFor < $1.scheduledFor }
        applyFilter()
    }

    func deleteReminder(_ reminder: Reminder) throws {
        modelContext.delete(reminder)
        try modelContext.save()

        reminders.removeAll { $0.id == reminder.id }
        filteredReminders.removeAll { $0.id == reminder.id }
    }

    func deleteReminders(_ remindersToDelete: [Reminder]) throws {
        for reminder in remindersToDelete {
            modelContext.delete(reminder)
        }
        try modelContext.save()

        let idsToDelete = Set(remindersToDelete.map { $0.id })
        reminders.removeAll { idsToDelete.contains($0.id) }
        filteredReminders.removeAll { idsToDelete.contains($0.id) }
    }

    // MARK: - Reminder Actions

    func completeReminder(_ reminder: Reminder) throws {
        reminder.isActive = false
        reminder.completedAt = Date()

        try modelContext.save()
        applyFilter()
    }

    func snoozeReminder(_ reminder: Reminder, minutes: Int) throws {
        let newDate = Calendar.current.date(byAdding: .minute, value: minutes, to: Date()) ?? Date()
        reminder.scheduledFor = newDate

        try modelContext.save()
        reminders.sort { $0.scheduledFor < $1.scheduledFor }
        applyFilter()
    }

    func toggleReminder(_ reminder: Reminder) throws {
        reminder.isActive.toggle()

        try modelContext.save()
        applyFilter()
    }

    // MARK: - Filtering

    private func applyFilter() {
        let now = Date()

        switch selectedFilter {
        case .all:
            filteredReminders = reminders.filter { $0.isActive }
        case .upcoming:
            filteredReminders = reminders.filter { $0.isActive && $0.scheduledFor > now }
        case .overdue:
            filteredReminders = reminders.filter { $0.isActive && $0.scheduledFor <= now && $0.completedAt == nil }
        case .completed:
            filteredReminders = reminders.filter { !$0.isActive || $0.completedAt != nil }
        }
    }

    func setFilter(_ filter: ReminderFilter) {
        selectedFilter = filter
        applyFilter()
    }

    // MARK: - Statistics

    var upcomingCount: Int {
        let now = Date()
        return reminders.filter { $0.isActive && $0.scheduledFor > now }.count
    }

    var overdueCount: Int {
        let now = Date()
        return reminders.filter { $0.isActive && $0.scheduledFor <= now && $0.completedAt == nil }.count
    }

    var completedCount: Int {
        reminders.filter { !$0.isActive || $0.completedAt != nil }.count
    }

    var activeCount: Int {
        reminders.filter { $0.isActive }.count
    }

    // MARK: - Grouping

    func groupedReminders() -> [ReminderGroup] {
        let calendar = Calendar.current
        let now = Date()

        // Separate overdue
        let overdue = filteredReminders.filter { $0.scheduledFor <= now }

        // Group upcoming by day
        let upcoming = filteredReminders.filter { $0.scheduledFor > now }
        let grouped = Dictionary(grouping: upcoming) { reminder -> Date in
            calendar.startOfDay(for: reminder.scheduledFor)
        }

        var groups: [ReminderGroup] = []

        // Add overdue group if not empty
        if !overdue.isEmpty {
            groups.append(ReminderGroup(title: "Overdue", date: nil, reminders: overdue))
        }

        // Add upcoming groups sorted by date
        let sortedGroups = grouped.sorted { $0.key < $1.key }
        for (date, reminders) in sortedGroups {
            let title = formatGroupTitle(date)
            groups.append(ReminderGroup(title: title, date: date, reminders: reminders.sorted { $0.scheduledFor < $1.scheduledFor }))
        }

        return groups
    }

    private func formatGroupTitle(_ date: Date) -> String {
        let calendar = Calendar.current
        let now = Date()

        if calendar.isDateInToday(date) {
            return "Today"
        } else if calendar.isDateInTomorrow(date) {
            return "Tomorrow"
        } else if let daysFromNow = calendar.dateComponents([.day], from: calendar.startOfDay(for: now), to: date).day,
                  daysFromNow <= 7 {
            let formatter = DateFormatter()
            formatter.dateFormat = "EEEE" // Day name
            return formatter.string(from: date)
        } else {
            let formatter = DateFormatter()
            formatter.dateStyle = .medium
            return formatter.string(from: date)
        }
    }
}

// MARK: - Supporting Types

enum ReminderFilter: String, CaseIterable {
    case all = "All"
    case upcoming = "Upcoming"
    case overdue = "Overdue"
    case completed = "Completed"

    var icon: String {
        switch self {
        case .all: return "list.bullet"
        case .upcoming: return "clock"
        case .overdue: return "exclamationmark.triangle"
        case .completed: return "checkmark.circle"
        }
    }
}

struct ReminderGroup: Identifiable {
    let id = UUID()
    let title: String
    let date: Date?
    let reminders: [Reminder]
}
