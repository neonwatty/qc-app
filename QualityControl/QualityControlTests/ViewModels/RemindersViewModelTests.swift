//
//  RemindersViewModelTests.swift
//  QualityControlTests
//
//  Week 5: Reminders System Tests
//  Tests for RemindersViewModel
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class RemindersViewModelTests: XCTestCase {

    var modelContainer: ModelContainer!
    var modelContext: ModelContext!
    var viewModel: RemindersViewModel!
    var testUserId: UUID!

    override func setUp() async throws {
        // Use TestModelContext helper for consistent container management
        (modelContainer, modelContext) = try TestModelContext.create()

        // Create test user
        testUserId = UUID()
        let user = User(id: testUserId, name: "Test User", email: "test@example.com")
        modelContext.insert(user)
        try modelContext.save()

        // Initialize view model
        viewModel = RemindersViewModel(modelContext: modelContext, userId: testUserId)
    }

    override func tearDown() {
        viewModel = nil
        testUserId = nil
        modelContext = nil
        modelContainer = nil
    }

    // MARK: - Initialization Tests

    func testInitialization() {
        XCTAssertTrue(viewModel.reminders.isEmpty)
        XCTAssertTrue(viewModel.filteredReminders.isEmpty)
        XCTAssertEqual(viewModel.selectedFilter, .all)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.error)
    }

    // MARK: - CRUD Operation Tests

    func testCreateReminder() throws {
        let title = "Daily Check-in"
        let message = "Time for check-in"
        let scheduledFor = Date().addingTimeInterval(3600)
        let frequency = ReminderFrequency.daily
        let category = ReminderCategory.checkIn

        let reminder = try viewModel.createReminder(
            title: title,
            message: message,
            scheduledFor: scheduledFor,
            frequency: frequency,
            category: category
        )

        XCTAssertEqual(reminder.title, title)
        XCTAssertEqual(reminder.message, message)
        XCTAssertEqual(reminder.frequency, frequency)
        XCTAssertEqual(reminder.category, category)
        XCTAssertTrue(reminder.isActive)
        XCTAssertEqual(viewModel.reminders.count, 1)
        XCTAssertEqual(viewModel.filteredReminders.count, 1)
    }

    func testCreateMultipleReminders() throws {
        _ = try viewModel.createReminder(
            title: "Reminder 1",
            message: "Message 1",
            scheduledFor: Date().addingTimeInterval(3600),
            frequency: .once,
            category: .checkIn
        )

        _ = try viewModel.createReminder(
            title: "Reminder 2",
            message: "Message 2",
            scheduledFor: Date().addingTimeInterval(7200),
            frequency: .daily,
            category: .habit
        )

        XCTAssertEqual(viewModel.reminders.count, 2)
    }

    func testCreateReminderSortsByScheduledTime() throws {
        let later = Date().addingTimeInterval(7200)
        let earlier = Date().addingTimeInterval(3600)

        _ = try viewModel.createReminder(
            title: "Later",
            message: "Later reminder",
            scheduledFor: later,
            frequency: .once,
            category: .checkIn
        )

        _ = try viewModel.createReminder(
            title: "Earlier",
            message: "Earlier reminder",
            scheduledFor: earlier,
            frequency: .once,
            category: .checkIn
        )

        XCTAssertEqual(viewModel.reminders.first?.title, "Earlier")
        XCTAssertEqual(viewModel.reminders.last?.title, "Later")
    }

    func testUpdateReminder() throws {
        let reminder = try viewModel.createReminder(
            title: "Original",
            message: "Original message",
            scheduledFor: Date().addingTimeInterval(3600),
            frequency: .once,
            category: .checkIn
        )

        let newDate = Date().addingTimeInterval(7200)
        try viewModel.updateReminder(
            reminder,
            title: "Updated",
            message: "Updated message",
            scheduledFor: newDate,
            frequency: .daily,
            category: .habit
        )

        XCTAssertEqual(reminder.title, "Updated")
        XCTAssertEqual(reminder.message, "Updated message")
        XCTAssertEqual(reminder.frequency, .daily)
        XCTAssertEqual(reminder.category, .habit)
    }

    func testDeleteReminder() throws {
        let reminder = try viewModel.createReminder(
            title: "To Delete",
            message: "Delete me",
            scheduledFor: Date().addingTimeInterval(3600),
            frequency: .once,
            category: .checkIn
        )

        XCTAssertEqual(viewModel.reminders.count, 1)

        try viewModel.deleteReminder(reminder)

        XCTAssertEqual(viewModel.reminders.count, 0)
        XCTAssertEqual(viewModel.filteredReminders.count, 0)
    }

    func testDeleteMultipleReminders() throws {
        let reminder1 = try viewModel.createReminder(
            title: "R1",
            message: "M1",
            scheduledFor: Date().addingTimeInterval(3600),
            frequency: .once,
            category: .checkIn
        )

        let reminder2 = try viewModel.createReminder(
            title: "R2",
            message: "M2",
            scheduledFor: Date().addingTimeInterval(7200),
            frequency: .daily,
            category: .habit
        )

        let reminder3 = try viewModel.createReminder(
            title: "R3",
            message: "M3",
            scheduledFor: Date().addingTimeInterval(10800),
            frequency: .weekly,
            category: .actionItem
        )

        XCTAssertEqual(viewModel.reminders.count, 3)

        try viewModel.deleteReminders([reminder1, reminder3])

        XCTAssertEqual(viewModel.reminders.count, 1)
        XCTAssertEqual(viewModel.reminders.first?.id, reminder2.id)
    }

    // MARK: - Reminder Action Tests

    func testCompleteReminder() throws {
        let reminder = try viewModel.createReminder(
            title: "Complete me",
            message: "Test",
            scheduledFor: Date().addingTimeInterval(3600),
            frequency: .once,
            category: .checkIn
        )

        XCTAssertTrue(reminder.isActive)
        XCTAssertNil(reminder.completedAt)

        try viewModel.completeReminder(reminder)

        XCTAssertFalse(reminder.isActive)
        XCTAssertNotNil(reminder.completedAt)
    }

    func testSnoozeReminder() throws {
        let originalDate = Date().addingTimeInterval(3600)
        let reminder = try viewModel.createReminder(
            title: "Snooze me",
            message: "Test",
            scheduledFor: originalDate,
            frequency: .once,
            category: .checkIn
        )

        try viewModel.snoozeReminder(reminder, minutes: 30)

        // Scheduled time should be ~30 minutes from now
        let now = Date()
        let timeDifference = reminder.scheduledFor.timeIntervalSince(now)
        XCTAssertGreaterThan(timeDifference, 29 * 60) // At least 29 minutes
        XCTAssertLessThan(timeDifference, 31 * 60) // At most 31 minutes
    }

    func testToggleReminder() throws {
        let reminder = try viewModel.createReminder(
            title: "Toggle me",
            message: "Test",
            scheduledFor: Date().addingTimeInterval(3600),
            frequency: .once,
            category: .checkIn
        )

        XCTAssertTrue(reminder.isActive)

        try viewModel.toggleReminder(reminder)
        XCTAssertFalse(reminder.isActive)

        try viewModel.toggleReminder(reminder)
        XCTAssertTrue(reminder.isActive)
    }

    // MARK: - Data Loading Tests

    func testLoadReminders() async throws {
        // Create reminders directly in context
        let reminder1 = Reminder(
            title: "R1",
            message: "M1",
            category: .checkIn,
            frequency: .daily,
            scheduledFor: Date().addingTimeInterval(3600),
            userId: testUserId
        )
        let reminder2 = Reminder(
            title: "R2",
            message: "M2",
            category: .habit,
            frequency: .weekly,
            scheduledFor: Date().addingTimeInterval(7200),
            userId: testUserId
        )
        modelContext.insert(reminder1)
        modelContext.insert(reminder2)
        try modelContext.save()

        await viewModel.loadReminders()

        XCTAssertEqual(viewModel.reminders.count, 2)
        XCTAssertEqual(viewModel.filteredReminders.count, 2)
        XCTAssertFalse(viewModel.isLoading)
    }

    func testLoadRemindersFiltersByUser() async throws {
        let otherUserId = UUID()

        // Create reminders for different users
        let myReminder = Reminder(
            title: "My Reminder",
            message: "Mine",
            category: .checkIn,
            frequency: .daily,
            scheduledFor: Date().addingTimeInterval(3600),
            userId: testUserId
        )
        let otherReminder = Reminder(
            title: "Other Reminder",
            message: "Theirs",
            category: .habit,
            frequency: .daily,
            scheduledFor: Date().addingTimeInterval(3600),
            userId: otherUserId
        )
        modelContext.insert(myReminder)
        modelContext.insert(otherReminder)
        try modelContext.save()

        await viewModel.loadReminders()

        XCTAssertEqual(viewModel.reminders.count, 1)
        XCTAssertEqual(viewModel.reminders.first?.title, "My Reminder")
    }

    func testRefresh() async throws {
        // Create initial reminder
        let reminder1 = Reminder(
            title: "R1",
            message: "M1",
            category: .checkIn,
            frequency: .daily,
            scheduledFor: Date().addingTimeInterval(3600),
            userId: testUserId
        )
        modelContext.insert(reminder1)
        try modelContext.save()

        await viewModel.loadReminders()
        XCTAssertEqual(viewModel.reminders.count, 1)

        // Add another reminder
        let reminder2 = Reminder(
            title: "R2",
            message: "M2",
            category: .habit,
            frequency: .weekly,
            scheduledFor: Date().addingTimeInterval(7200),
            userId: testUserId
        )
        modelContext.insert(reminder2)
        try modelContext.save()

        await viewModel.refresh()
        XCTAssertEqual(viewModel.reminders.count, 2)
    }

    // MARK: - Filter Tests

    func testFilterAll() throws {
        _ = try viewModel.createReminder(
            title: "Active",
            message: "M1",
            scheduledFor: Date().addingTimeInterval(3600),
            frequency: .once,
            category: .checkIn
        )

        let completed = try viewModel.createReminder(
            title: "Completed",
            message: "M2",
            scheduledFor: Date().addingTimeInterval(7200),
            frequency: .once,
            category: .habit
        )
        try viewModel.completeReminder(completed)

        viewModel.setFilter(.all)

        // "All" should show only active reminders
        XCTAssertEqual(viewModel.filteredReminders.count, 1)
        XCTAssertEqual(viewModel.filteredReminders.first?.title, "Active")
    }

    func testFilterUpcoming() throws {
        let futureDate = Date().addingTimeInterval(3600)
        _ = try viewModel.createReminder(
            title: "Upcoming",
            message: "M1",
            scheduledFor: futureDate,
            frequency: .once,
            category: .checkIn
        )

        let pastDate = Date().addingTimeInterval(-3600)
        _ = try viewModel.createReminder(
            title: "Overdue",
            message: "M2",
            scheduledFor: pastDate,
            frequency: .once,
            category: .habit
        )

        viewModel.setFilter(.upcoming)

        XCTAssertEqual(viewModel.filteredReminders.count, 1)
        XCTAssertEqual(viewModel.filteredReminders.first?.title, "Upcoming")
    }

    func testFilterOverdue() throws {
        let futureDate = Date().addingTimeInterval(3600)
        _ = try viewModel.createReminder(
            title: "Upcoming",
            message: "M1",
            scheduledFor: futureDate,
            frequency: .once,
            category: .checkIn
        )

        let pastDate = Date().addingTimeInterval(-3600)
        _ = try viewModel.createReminder(
            title: "Overdue",
            message: "M2",
            scheduledFor: pastDate,
            frequency: .once,
            category: .habit
        )

        viewModel.setFilter(.overdue)

        XCTAssertEqual(viewModel.filteredReminders.count, 1)
        XCTAssertEqual(viewModel.filteredReminders.first?.title, "Overdue")
    }

    func testFilterCompleted() throws {
        _ = try viewModel.createReminder(
            title: "Active",
            message: "M1",
            scheduledFor: Date().addingTimeInterval(3600),
            frequency: .once,
            category: .checkIn
        )

        let completed = try viewModel.createReminder(
            title: "Completed",
            message: "M2",
            scheduledFor: Date().addingTimeInterval(7200),
            frequency: .once,
            category: .habit
        )
        try viewModel.completeReminder(completed)

        viewModel.setFilter(.completed)

        XCTAssertEqual(viewModel.filteredReminders.count, 1)
        XCTAssertEqual(viewModel.filteredReminders.first?.title, "Completed")
    }

    // MARK: - Statistics Tests

    func testUpcomingCount() throws {
        let futureDate1 = Date().addingTimeInterval(3600)
        let futureDate2 = Date().addingTimeInterval(7200)
        let pastDate = Date().addingTimeInterval(-3600)

        _ = try viewModel.createReminder(
            title: "Upcoming 1",
            message: "M1",
            scheduledFor: futureDate1,
            frequency: .once,
            category: .checkIn
        )

        _ = try viewModel.createReminder(
            title: "Upcoming 2",
            message: "M2",
            scheduledFor: futureDate2,
            frequency: .once,
            category: .habit
        )

        _ = try viewModel.createReminder(
            title: "Overdue",
            message: "M3",
            scheduledFor: pastDate,
            frequency: .once,
            category: .actionItem
        )

        XCTAssertEqual(viewModel.upcomingCount, 2)
    }

    func testOverdueCount() throws {
        let futureDate = Date().addingTimeInterval(3600)
        let pastDate1 = Date().addingTimeInterval(-3600)
        let pastDate2 = Date().addingTimeInterval(-7200)

        _ = try viewModel.createReminder(
            title: "Upcoming",
            message: "M1",
            scheduledFor: futureDate,
            frequency: .once,
            category: .checkIn
        )

        _ = try viewModel.createReminder(
            title: "Overdue 1",
            message: "M2",
            scheduledFor: pastDate1,
            frequency: .once,
            category: .habit
        )

        _ = try viewModel.createReminder(
            title: "Overdue 2",
            message: "M3",
            scheduledFor: pastDate2,
            frequency: .once,
            category: .actionItem
        )

        XCTAssertEqual(viewModel.overdueCount, 2)
    }

    func testCompletedCount() throws {
        let reminder1 = try viewModel.createReminder(
            title: "Completed 1",
            message: "M1",
            scheduledFor: Date().addingTimeInterval(3600),
            frequency: .once,
            category: .checkIn
        )
        try viewModel.completeReminder(reminder1)

        let reminder2 = try viewModel.createReminder(
            title: "Completed 2",
            message: "M2",
            scheduledFor: Date().addingTimeInterval(7200),
            frequency: .once,
            category: .habit
        )
        try viewModel.completeReminder(reminder2)

        _ = try viewModel.createReminder(
            title: "Active",
            message: "M3",
            scheduledFor: Date().addingTimeInterval(10800),
            frequency: .once,
            category: .actionItem
        )

        XCTAssertEqual(viewModel.completedCount, 2)
    }

    func testActiveCount() throws {
        _ = try viewModel.createReminder(
            title: "Active 1",
            message: "M1",
            scheduledFor: Date().addingTimeInterval(3600),
            frequency: .once,
            category: .checkIn
        )

        _ = try viewModel.createReminder(
            title: "Active 2",
            message: "M2",
            scheduledFor: Date().addingTimeInterval(7200),
            frequency: .once,
            category: .habit
        )

        let completed = try viewModel.createReminder(
            title: "Completed",
            message: "M3",
            scheduledFor: Date().addingTimeInterval(10800),
            frequency: .once,
            category: .actionItem
        )
        try viewModel.completeReminder(completed)

        XCTAssertEqual(viewModel.activeCount, 2)
    }

    // MARK: - Grouping Tests

    func testGroupedRemindersWithOverdue() throws {
        let futureDate = Date().addingTimeInterval(3600)
        let pastDate = Date().addingTimeInterval(-3600)

        _ = try viewModel.createReminder(
            title: "Upcoming",
            message: "M1",
            scheduledFor: futureDate,
            frequency: .once,
            category: .checkIn
        )

        _ = try viewModel.createReminder(
            title: "Overdue",
            message: "M2",
            scheduledFor: pastDate,
            frequency: .once,
            category: .habit
        )

        viewModel.setFilter(.all)
        let groups = viewModel.groupedReminders()

        // Should have at least an "Overdue" group
        XCTAssertTrue(groups.contains { $0.title == "Overdue" })
        let overdueGroup = groups.first { $0.title == "Overdue" }
        XCTAssertEqual(overdueGroup?.reminders.count, 1)
    }

    func testGroupedRemindersWithToday() throws {
        // Schedule reminder for later today (current time + 2 hours to ensure it's in future)
        let today = Date().addingTimeInterval(7200) // 2 hours from now

        _ = try viewModel.createReminder(
            title: "Today Reminder",
            message: "M1",
            scheduledFor: today,
            frequency: .once,
            category: .checkIn
        )

        viewModel.setFilter(.all)
        let groups = viewModel.groupedReminders()

        // Should have a "Today" group if the reminder is still today
        // (Only check if the scheduled time is still on the same day)
        let calendar = Calendar.current
        if calendar.isDateInToday(today) {
            XCTAssertTrue(groups.contains { $0.title == "Today" })
            let todayGroup = groups.first { $0.title == "Today" }
            XCTAssertEqual(todayGroup?.reminders.count, 1)
        } else {
            // If we're near midnight and adding 2 hours puts us in tomorrow,
            // check for Tomorrow group instead
            XCTAssertTrue(groups.contains { $0.title == "Tomorrow" })
            let tomorrowGroup = groups.first { $0.title == "Tomorrow" }
            XCTAssertEqual(tomorrowGroup?.reminders.count, 1)
        }
    }

    func testGroupedRemindersWithTomorrow() throws {
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: Date())!

        _ = try viewModel.createReminder(
            title: "Tomorrow Reminder",
            message: "M1",
            scheduledFor: tomorrow,
            frequency: .once,
            category: .checkIn
        )

        viewModel.setFilter(.all)
        let groups = viewModel.groupedReminders()

        // Should have a "Tomorrow" group
        XCTAssertTrue(groups.contains { $0.title == "Tomorrow" })
        let tomorrowGroup = groups.first { $0.title == "Tomorrow" }
        XCTAssertEqual(tomorrowGroup?.reminders.count, 1)
    }

    func testGroupedRemindersEmptyWhenNoReminders() {
        viewModel.setFilter(.all)
        let groups = viewModel.groupedReminders()

        XCTAssertTrue(groups.isEmpty)
    }

    func testGroupedRemindersSortsByDate() throws {
        let date1 = Date().addingTimeInterval(3600)
        let date2 = Date().addingTimeInterval(7200)

        _ = try viewModel.createReminder(
            title: "Later",
            message: "M1",
            scheduledFor: date2,
            frequency: .once,
            category: .checkIn
        )

        _ = try viewModel.createReminder(
            title: "Earlier",
            message: "M2",
            scheduledFor: date1,
            frequency: .once,
            category: .habit
        )

        viewModel.setFilter(.all)
        let groups = viewModel.groupedReminders()

        // Groups should be sorted, and within each group reminders should be sorted
        let firstGroup = groups.first
        XCTAssertNotNil(firstGroup)
        if let firstGroup = firstGroup, firstGroup.reminders.count > 1 {
            XCTAssertLessThan(
                firstGroup.reminders[0].scheduledFor,
                firstGroup.reminders[1].scheduledFor
            )
        }
    }
}
