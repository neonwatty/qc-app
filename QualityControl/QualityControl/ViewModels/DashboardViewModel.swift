//
//  DashboardViewModel.swift
//  QualityControl
//
//  Week 3: ViewModels
//  State management for Dashboard view
//

import Foundation
import SwiftData
import Observation

/// ViewModel for Dashboard
/// Manages dashboard state, stats, and user actions
@MainActor
@Observable
class DashboardViewModel {

    // MARK: - Properties

    private let dashboardService: DashboardService
    private let checkInService: CheckInService
    private let modelContext: ModelContext

    var couple: Couple?
    var stats: DashboardStats?
    var recentActivity: [ActivityFeedItem] = []
    var upcomingReminders: [Reminder] = []
    var showPrepBanner: Bool = false
    var isLoading: Bool = false
    var error: Error?

    // MARK: - Initialization

    init(modelContext: ModelContext, couple: Couple? = nil) {
        self.modelContext = modelContext
        self.dashboardService = DashboardService(modelContext: modelContext)
        self.checkInService = CheckInService(modelContext: modelContext)
        self.couple = couple
    }

    // MARK: - Actions

    /// Load dashboard data
    func loadDashboard() async {
        guard let couple = couple else { return }

        isLoading = true
        error = nil

        do {
            // Simulate async data loading
            try await Task.sleep(nanoseconds: 500_000_000) // 0.5s delay

            stats = dashboardService.getDashboardStats(for: couple)
            recentActivity = dashboardService.getRecentActivity(for: couple, limit: 10)
            upcomingReminders = dashboardService.getUpcomingReminders(for: couple, limit: 5)
            showPrepBanner = dashboardService.shouldShowPrepBanner(for: couple)

            isLoading = false
        } catch {
            self.error = error
            isLoading = false
        }
    }

    /// Refresh dashboard data
    func refresh() async {
        await loadDashboard()
    }

    /// Start a new check-in session
    func startCheckIn() throws -> CheckInSession {
        guard let couple = couple else {
            throw DashboardError.noCoupleFound
        }

        return try checkInService.createSession(for: couple)
    }

    /// Dismiss prep banner
    func dismissPrepBanner() {
        showPrepBanner = false
    }

    /// Get formatted stats text
    func getStreakText() -> String {
        guard let stats = stats else { return "0 day streak" }
        return stats.currentStreak == 1 ? "1 day streak" : "\(stats.currentStreak) day streak"
    }

    func getTotalCheckInsText() -> String {
        guard let stats = stats else { return "0 check-ins" }
        return stats.totalCheckIns == 1 ? "1 check-in" : "\(stats.totalCheckIns) check-ins"
    }

    func getLastCheckInText() -> String {
        guard let stats = stats, let lastDate = stats.lastCheckInDate else {
            return "No check-ins yet"
        }

        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .full
        return "Last check-in \(formatter.localizedString(for: lastDate, relativeTo: Date()))"
    }

    // MARK: - Helper Properties

    var hasRecentActivity: Bool {
        !recentActivity.isEmpty
    }

    var hasUpcomingReminders: Bool {
        !upcomingReminders.isEmpty
    }
}

// MARK: - Errors

enum DashboardError: LocalizedError {
    case noCoupleFound
    case loadFailed

    var errorDescription: String? {
        switch self {
        case .noCoupleFound:
            return "No couple found. Please complete onboarding first."
        case .loadFailed:
            return "Failed to load dashboard data. Please try again."
        }
    }
}
