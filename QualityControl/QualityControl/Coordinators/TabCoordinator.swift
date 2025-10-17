//
//  TabCoordinator.swift
//  QualityControl
//
//  Week 3: Tab Coordination
//  Manages tab navigation and deep linking
//

import Foundation
import Observation

/// Coordinates tab navigation and supports deep linking
@MainActor
@Observable
class TabCoordinator {

    // MARK: - Properties

    /// Currently selected tab
    var selectedTab: Tab

    /// Badge counts for each tab
    var badgeCounts: [Tab: Int] = [:]

    // MARK: - Initialization

    init(initialTab: Tab = .dashboard) {
        self.selectedTab = initialTab
    }

    // MARK: - Tab Navigation

    /// Navigate to a specific tab
    func navigateTo(_ tab: Tab) {
        selectedTab = tab
    }

    /// Navigate to Dashboard
    func showDashboard() {
        selectedTab = .dashboard
    }

    /// Navigate to Check-in
    func showCheckIn() {
        selectedTab = .checkIn
    }

    /// Navigate to Notes
    func showNotes() {
        selectedTab = .notes
    }

    /// Navigate to Growth
    func showGrowth() {
        selectedTab = .growth
    }

    /// Navigate to Settings
    func showSettings() {
        selectedTab = .settings
    }

    // MARK: - Badge Management

    /// Set badge count for a specific tab
    func setBadge(for tab: Tab, count: Int) {
        if count > 0 {
            badgeCounts[tab] = count
        } else {
            badgeCounts.removeValue(forKey: tab)
        }
    }

    /// Get badge count for a specific tab
    func getBadgeCount(for tab: Tab) -> Int? {
        badgeCounts[tab]
    }

    /// Clear badge for a specific tab
    func clearBadge(for tab: Tab) {
        badgeCounts.removeValue(forKey: tab)
    }

    /// Clear all badges
    func clearAllBadges() {
        badgeCounts.removeAll()
    }
}
