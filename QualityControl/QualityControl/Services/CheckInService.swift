//
//  CheckInService.swift
//  QualityControl
//
//  Week 3: Services Layer
//  Business logic for check-in sessions
//

import Foundation
import SwiftData

/// Service for managing check-in sessions
/// Handles creating, updating, and querying check-in sessions
@MainActor
class CheckInService {

    // MARK: - Properties

    private let modelContext: ModelContext

    // MARK: - Initialization

    init(modelContext: ModelContext) {
        self.modelContext = modelContext
    }

    // MARK: - Session Management

    /// Create a new check-in session
    /// - Parameter couple: The couple performing the check-in
    /// - Returns: The newly created session
    func createSession(for couple: Couple) throws -> CheckInSession {
        let session = CheckInSession(coupleId: couple.id)
        modelContext.insert(session)
        try modelContext.save()
        return session
    }

    /// Update session step
    /// - Parameters:
    ///   - session: The session to update
    ///   - step: The new step
    func updateStep(_ session: CheckInSession, to step: CheckInStep) throws {
        session.currentStep = step
        try modelContext.save()
    }

    /// Add selected category to session
    /// - Parameters:
    ///   - session: The session to update
    ///   - category: The category to add
    func addCategory(_ category: Category, to session: CheckInSession) throws {
        if session.selectedCategories == nil {
            session.selectedCategories = []
        }
        session.selectedCategories?.append(category)
        try modelContext.save()
    }

    /// Remove category from session
    /// - Parameters:
    ///   - category: The category to remove
    ///   - session: The session to update
    func removeCategory(_ category: Category, from session: CheckInSession) throws {
        session.selectedCategories?.removeAll { $0.id == category.id }
        try modelContext.save()
    }

    /// Update session reflection
    /// - Parameters:
    ///   - session: The session to update
    ///   - reflection: The reflection text
    func updateReflection(_ session: CheckInSession, reflection: String) throws {
        session.reflection = reflection
        try modelContext.save()
    }

    /// Add action item to session
    /// - Parameters:
    ///   - session: The session to update
    ///   - actionItem: The action item to add
    func addActionItem(_ actionItem: ActionItem, to session: CheckInSession) throws {
        if session.actionItems == nil {
            session.actionItems = []
        }
        session.actionItems?.append(actionItem)
        try modelContext.save()
    }

    /// Complete a check-in session
    /// - Parameter session: The session to complete
    func completeSession(_ session: CheckInSession) throws {
        session.status = .completed
        session.completedAt = Date()
        session.durationSeconds = Int(Date().timeIntervalSince(session.startedAt))
        session.percentageComplete = 1.0
        try modelContext.save()
    }

    /// Abandon a check-in session
    /// - Parameter session: The session to abandon
    func abandonSession(_ session: CheckInSession) throws {
        session.status = .abandoned
        try modelContext.save()
    }

    // MARK: - Queries

    /// Get the current active session for a couple
    /// - Parameter couple: The couple to query
    /// - Returns: The active session, if any
    func getActiveSession(for couple: Couple) -> CheckInSession? {
        let coupleId = couple.id
        let descriptor = FetchDescriptor<CheckInSession>(
            sortBy: [SortDescriptor(\.startedAt, order: .reverse)]
        )

        let allSessions = (try? modelContext.fetch(descriptor)) ?? []
        return allSessions.first { $0.coupleId == coupleId && $0.status == .inProgress }
    }

    /// Get recent completed sessions for a couple
    /// - Parameters:
    ///   - couple: The couple to query
    ///   - limit: Maximum number of sessions to return
    /// - Returns: Array of completed sessions
    func getRecentSessions(for couple: Couple, limit: Int = 10) -> [CheckInSession] {
        let coupleId = couple.id
        let descriptor = FetchDescriptor<CheckInSession>(
            sortBy: [SortDescriptor(\.completedAt, order: .reverse)]
        )

        let allSessions = (try? modelContext.fetch(descriptor)) ?? []
        let filteredSessions = allSessions.filter { $0.coupleId == coupleId && $0.status == .completed }
        return Array(filteredSessions.prefix(limit))
    }

    /// Get total check-in count for a couple
    /// - Parameter couple: The couple to query
    /// - Returns: Total number of completed check-ins
    func getTotalCheckInCount(for couple: Couple) -> Int {
        let coupleId = couple.id
        let descriptor = FetchDescriptor<CheckInSession>()

        let allSessions = (try? modelContext.fetch(descriptor)) ?? []
        return allSessions.filter { $0.coupleId == coupleId && $0.status == .completed }.count
    }

    /// Get check-in streak (consecutive days with check-ins)
    /// - Parameter couple: The couple to query
    /// - Returns: Current streak count
    func getCheckInStreak(for couple: Couple) -> Int {
        let sessions = getRecentSessions(for: couple, limit: 365)
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

    /// Get average session duration for a couple
    /// - Parameter couple: The couple to query
    /// - Returns: Average duration in seconds
    func getAverageSessionDuration(for couple: Couple) -> Int {
        let sessions = getRecentSessions(for: couple, limit: 50)
        guard !sessions.isEmpty else { return 0 }

        let totalDuration = sessions.reduce(into: 0) { $0 += $1.durationSeconds ?? 0 }
        return totalDuration / sessions.count
    }
}
