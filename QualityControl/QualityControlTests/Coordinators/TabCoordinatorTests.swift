//
//  TabCoordinatorTests.swift
//  QualityControlTests
//
//  Week 3: Tab Coordinator Tests
//  Tests for TabCoordinator navigation and badge management
//

import XCTest
@testable import QualityControl

@MainActor
final class TabCoordinatorTests: XCTestCase {

    var coordinator: TabCoordinator!

    override func setUp() async throws {
        coordinator = TabCoordinator()
    }

    override func tearDown() async throws {
        coordinator = nil
    }

    // MARK: - Initialization Tests

    func testDefaultInitialization() {
        XCTAssertEqual(coordinator.selectedTab, .dashboard)
        XCTAssertTrue(coordinator.badgeCounts.isEmpty)
    }

    func testCustomInitialization() {
        let customCoordinator = TabCoordinator(initialTab: .notes)
        XCTAssertEqual(customCoordinator.selectedTab, .notes)
    }

    // MARK: - Navigation Tests

    func testNavigateToTab() {
        // When
        coordinator.navigateTo(.checkIn)

        // Then
        XCTAssertEqual(coordinator.selectedTab, .checkIn)
    }

    func testShowDashboard() {
        // Given
        coordinator.selectedTab = .notes

        // When
        coordinator.showDashboard()

        // Then
        XCTAssertEqual(coordinator.selectedTab, .dashboard)
    }

    func testShowCheckIn() {
        // When
        coordinator.showCheckIn()

        // Then
        XCTAssertEqual(coordinator.selectedTab, .checkIn)
    }

    func testShowNotes() {
        // When
        coordinator.showNotes()

        // Then
        XCTAssertEqual(coordinator.selectedTab, .notes)
    }

    func testShowGrowth() {
        // When
        coordinator.showGrowth()

        // Then
        XCTAssertEqual(coordinator.selectedTab, .growth)
    }

    func testShowSettings() {
        // When
        coordinator.showSettings()

        // Then
        XCTAssertEqual(coordinator.selectedTab, .settings)
    }

    func testNavigationBetweenTabs() {
        // Navigate through all tabs
        coordinator.showDashboard()
        XCTAssertEqual(coordinator.selectedTab, .dashboard)

        coordinator.showCheckIn()
        XCTAssertEqual(coordinator.selectedTab, .checkIn)

        coordinator.showNotes()
        XCTAssertEqual(coordinator.selectedTab, .notes)

        coordinator.showGrowth()
        XCTAssertEqual(coordinator.selectedTab, .growth)

        coordinator.showSettings()
        XCTAssertEqual(coordinator.selectedTab, .settings)

        // Navigate back to dashboard
        coordinator.showDashboard()
        XCTAssertEqual(coordinator.selectedTab, .dashboard)
    }

    // MARK: - Badge Management Tests

    func testSetBadgeCount() {
        // When
        coordinator.setBadge(for: .notes, count: 5)

        // Then
        XCTAssertEqual(coordinator.getBadgeCount(for: .notes), 5)
    }

    func testSetBadgeCountZeroRemovesBadge() {
        // Given
        coordinator.setBadge(for: .notes, count: 5)
        XCTAssertNotNil(coordinator.getBadgeCount(for: .notes))

        // When
        coordinator.setBadge(for: .notes, count: 0)

        // Then
        XCTAssertNil(coordinator.getBadgeCount(for: .notes))
    }

    func testSetBadgeCountNegativeRemovesBadge() {
        // Given
        coordinator.setBadge(for: .notes, count: 5)

        // When
        coordinator.setBadge(for: .notes, count: -1)

        // Then
        XCTAssertNil(coordinator.getBadgeCount(for: .notes))
    }

    func testGetBadgeCountReturnsNilWhenNoBadge() {
        XCTAssertNil(coordinator.getBadgeCount(for: .dashboard))
    }

    func testClearBadge() {
        // Given
        coordinator.setBadge(for: .notes, count: 5)
        XCTAssertEqual(coordinator.getBadgeCount(for: .notes), 5)

        // When
        coordinator.clearBadge(for: .notes)

        // Then
        XCTAssertNil(coordinator.getBadgeCount(for: .notes))
    }

    func testClearAllBadges() {
        // Given
        coordinator.setBadge(for: .notes, count: 3)
        coordinator.setBadge(for: .growth, count: 2)
        coordinator.setBadge(for: .dashboard, count: 1)
        XCTAssertEqual(coordinator.badgeCounts.count, 3)

        // When
        coordinator.clearAllBadges()

        // Then
        XCTAssertTrue(coordinator.badgeCounts.isEmpty)
        XCTAssertNil(coordinator.getBadgeCount(for: .notes))
        XCTAssertNil(coordinator.getBadgeCount(for: .growth))
        XCTAssertNil(coordinator.getBadgeCount(for: .dashboard))
    }

    func testMultipleBadges() {
        // When
        coordinator.setBadge(for: .notes, count: 5)
        coordinator.setBadge(for: .checkIn, count: 3)
        coordinator.setBadge(for: .growth, count: 1)

        // Then
        XCTAssertEqual(coordinator.getBadgeCount(for: .notes), 5)
        XCTAssertEqual(coordinator.getBadgeCount(for: .checkIn), 3)
        XCTAssertEqual(coordinator.getBadgeCount(for: .growth), 1)
        XCTAssertNil(coordinator.getBadgeCount(for: .dashboard))
        XCTAssertNil(coordinator.getBadgeCount(for: .settings))
    }

    func testUpdateExistingBadge() {
        // Given
        coordinator.setBadge(for: .notes, count: 5)
        XCTAssertEqual(coordinator.getBadgeCount(for: .notes), 5)

        // When
        coordinator.setBadge(for: .notes, count: 10)

        // Then
        XCTAssertEqual(coordinator.getBadgeCount(for: .notes), 10)
    }

    // MARK: - Combined Navigation and Badge Tests

    func testNavigationDoesNotAffectBadges() {
        // Given
        coordinator.setBadge(for: .notes, count: 5)
        coordinator.selectedTab = .dashboard

        // When
        coordinator.showNotes()

        // Then
        XCTAssertEqual(coordinator.selectedTab, .notes)
        XCTAssertEqual(coordinator.getBadgeCount(for: .notes), 5)
    }

    func testBadgesDoNotAffectNavigation() {
        // Given
        coordinator.selectedTab = .notes

        // When
        coordinator.setBadge(for: .growth, count: 3)

        // Then
        XCTAssertEqual(coordinator.selectedTab, .notes)
        XCTAssertEqual(coordinator.getBadgeCount(for: .growth), 3)
    }
}
