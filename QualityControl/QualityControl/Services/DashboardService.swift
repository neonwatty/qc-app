//
//  DashboardService.swift
//  QualityControl
//
//  Week 3: Services Layer
//  Business logic for dashboard data aggregation
//

import Foundation
import SwiftData

/// Service for aggregating dashboard data
/// Provides stats, recent activity, and quick actions
@MainActor
class DashboardService {

    // MARK: - Properties

    private let modelContext: ModelContext

    // MARK: - Initialization

    init(modelContext: ModelContext) {
        self.modelContext = modelContext
    }

    // MARK: - Dashboard Stats

    /// Get dashboard statistics for a couple
    /// - Parameter couple: The couple to query
    /// - Returns: Dashboard statistics
    func getDashboardStats(for couple: Couple) -> DashboardStats {
        let checkInCount = getTotalCheckIns(for: couple)
        let streak = getCheckInStreak(for: couple)
        let notesCount = getNotesCount(for: couple)
        let milestonesCount = getMilestonesCount(for: couple)
        let lastCheckIn = getLastCheckInDate(for: couple)

        return DashboardStats(
            totalCheckIns: checkInCount,
            currentStreak: streak,
            totalNotes: notesCount,
            totalMilestones: milestonesCount,
            lastCheckInDate: lastCheckIn
        )
    }

    /// Get recent activity feed items
    /// - Parameters:
    ///   - couple: The couple to query
    ///   - limit: Maximum number of items
    /// - Returns: Array of activity feed items
    func getRecentActivity(for couple: Couple, limit: Int = 10) -> [ActivityFeedItem] {
        var activities: [ActivityFeedItem] = []

        // Fetch enough items of each type to potentially fill the limit
        // Add recent check-ins
        let checkIns = getRecentCheckIns(for: couple, limit: limit)
        activities.append(contentsOf: checkIns.map { session in
            ActivityFeedItem(
                id: UUID(),
                icon: "heart.fill",
                title: "Check-in completed",
                subtitle: formatRelativeDate(session.completedAt ?? session.startedAt),
                timestamp: session.completedAt ?? session.startedAt,
                type: .checkIn
            )
        })

        // Add recent notes
        let notes = getRecentNotes(for: couple, limit: limit)
        activities.append(contentsOf: notes.map { note in
            ActivityFeedItem(
                id: UUID(),
                icon: "note.text",
                title: note.privacy == .shared ? "Shared note added" : "Private note added",
                subtitle: formatRelativeDate(note.createdAt),
                timestamp: note.createdAt,
                type: .note
            )
        })

        // Add milestones
        let milestones = getRecentMilestones(for: couple, limit: limit)
        activities.append(contentsOf: milestones.compactMap { milestone in
            guard let achievedDate = milestone.achievedAt else { return nil }
            return ActivityFeedItem(
                id: UUID(),
                icon: "star.fill",
                title: "Milestone: \(milestone.title)",
                subtitle: formatRelativeDate(achievedDate),
                timestamp: achievedDate,
                type: .milestone
            )
        })

        // Sort by timestamp and limit
        return activities
            .sorted { $0.timestamp > $1.timestamp }
            .prefix(limit)
            .map { $0 }
    }

    /// Get upcoming reminders for couple's users
    /// - Parameters:
    ///   - couple: The couple to query
    ///   - limit: Maximum number of reminders
    /// - Returns: Array of upcoming reminders
    func getUpcomingReminders(for couple: Couple, limit: Int = 5) -> [Reminder] {
        // Get user IDs for the couple
        guard let users = couple.users else { return [] }
        let userIds = users.map { $0.id }

        // Fetch reminders for these users
        let now = Date()
        var allReminders: [Reminder] = []
        for userId in userIds {
            let descriptor = FetchDescriptor<Reminder>(
                predicate: #Predicate { reminder in
                    reminder.userId == userId &&
                    reminder.isActive &&
                    reminder.scheduledFor > now
                },
                sortBy: [SortDescriptor(\.scheduledFor, order: .forward)]
            )

            if let reminders = try? modelContext.fetch(descriptor) {
                allReminders.append(contentsOf: reminders)
            }
        }

        return Array(allReminders
            .sorted { $0.scheduledFor < $1.scheduledFor }
            .prefix(limit))
    }

    /// Check if couple should prep for tomorrow's check-in
    /// - Parameter couple: The couple to query
    /// - Returns: True if prep is recommended
    func shouldShowPrepBanner(for couple: Couple) -> Bool {
        // Show if last check-in was more than 18 hours ago
        guard let lastCheckIn = getLastCheckInDate(for: couple) else {
            return true // No check-ins yet, show banner
        }

        let hoursSinceLastCheckIn = Date().timeIntervalSince(lastCheckIn) / 3600
        return hoursSinceLastCheckIn >= 18
    }

    // MARK: - Private Helpers

    private func getTotalCheckIns(for couple: Couple) -> Int {
        let coupleId = couple.id
        let descriptor = FetchDescriptor<CheckInSession>()

        let allSessions = (try? modelContext.fetch(descriptor)) ?? []
        return allSessions.filter { $0.coupleId == coupleId && $0.status == .completed }.count
    }

    private func getCheckInStreak(for couple: Couple) -> Int {
        let coupleId = couple.id
        let descriptor = FetchDescriptor<CheckInSession>(
            sortBy: [SortDescriptor(\.completedAt, order: .reverse)]
        )

        let allSessions = (try? modelContext.fetch(descriptor)) ?? []
        let sessions = allSessions.filter { $0.coupleId == coupleId && $0.status == .completed }
        guard !sessions.isEmpty else { return 0 }

        var streak = 0
        var currentDate = Calendar.current.startOfDay(for: Date())

        for session in sessions {
            guard let completedDate = session.completedAt else { continue }
            let sessionDate = Calendar.current.startOfDay(for: completedDate)

            let daysDiff = Calendar.current.dateComponents([.day], from: sessionDate, to: currentDate).day ?? 0

            if daysDiff == 0 || daysDiff == 1 {
                streak += 1
                currentDate = sessionDate
            } else {
                break
            }
        }

        return streak
    }

    private func getNotesCount(for couple: Couple) -> Int {
        // Get user IDs for the couple
        guard let users = couple.users else { return 0 }
        let userIds = users.map { $0.id }

        // Count notes for all users in the couple
        var totalCount = 0
        for userId in userIds {
            let descriptor = FetchDescriptor<Note>(
                predicate: #Predicate { note in
                    note.authorId == userId
                }
            )
            totalCount += (try? modelContext.fetchCount(descriptor)) ?? 0
        }

        return totalCount
    }

    private func getMilestonesCount(for couple: Couple) -> Int {
        let coupleId = couple.id
        let descriptor = FetchDescriptor<Milestone>(
            predicate: #Predicate { milestone in
                milestone.coupleId == coupleId
            }
        )
        return (try? modelContext.fetchCount(descriptor)) ?? 0
    }

    private func getLastCheckInDate(for couple: Couple) -> Date? {
        let coupleId = couple.id
        let descriptor = FetchDescriptor<CheckInSession>(
            sortBy: [SortDescriptor(\.completedAt, order: .reverse)]
        )

        let allSessions = (try? modelContext.fetch(descriptor)) ?? []
        return allSessions.first { $0.coupleId == coupleId && $0.status == .completed }?.completedAt
    }

    private func getRecentCheckIns(for couple: Couple, limit: Int) -> [CheckInSession] {
        let coupleId = couple.id
        let descriptor = FetchDescriptor<CheckInSession>(
            sortBy: [SortDescriptor(\.completedAt, order: .reverse)]
        )

        let allSessions = (try? modelContext.fetch(descriptor)) ?? []
        let filteredSessions = allSessions.filter { $0.coupleId == coupleId && $0.status == .completed }
        return Array(filteredSessions.prefix(limit))
    }

    private func getRecentNotes(for couple: Couple, limit: Int) -> [Note] {
        // Get user IDs for the couple
        guard let users = couple.users else { return [] }
        let userIds = users.map { $0.id }

        // Fetch notes for all users
        var allNotes: [Note] = []
        for userId in userIds {
            let descriptor = FetchDescriptor<Note>(
                predicate: #Predicate { note in
                    note.authorId == userId
                },
                sortBy: [SortDescriptor(\.createdAt, order: .reverse)]
            )

            if let notes = try? modelContext.fetch(descriptor) {
                allNotes.append(contentsOf: notes)
            }
        }

        return Array(allNotes
            .sorted { $0.createdAt > $1.createdAt }
            .prefix(limit))
    }

    private func getRecentMilestones(for couple: Couple, limit: Int) -> [Milestone] {
        let coupleId = couple.id
        let descriptor = FetchDescriptor<Milestone>(
            predicate: #Predicate { milestone in
                milestone.coupleId == coupleId && milestone.isAchieved
            },
            sortBy: [SortDescriptor(\.achievedAt, order: .reverse)]
        )

        let milestones = (try? modelContext.fetch(descriptor)) ?? []
        return Array(milestones.prefix(limit))
    }

    private func formatRelativeDate(_ date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .full
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}

// MARK: - Supporting Types

/// Dashboard statistics aggregation
struct DashboardStats {
    let totalCheckIns: Int
    let currentStreak: Int
    let totalNotes: Int
    let totalMilestones: Int
    let lastCheckInDate: Date?
}

/// Activity feed item
struct ActivityFeedItem: Identifiable {
    let id: UUID
    let icon: String
    let title: String
    let subtitle: String
    let timestamp: Date
    let type: ActivityType

    enum ActivityType {
        case checkIn
        case note
        case milestone
        case reminder
        case request
    }
}
