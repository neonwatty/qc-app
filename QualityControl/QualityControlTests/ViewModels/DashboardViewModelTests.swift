//
//  DashboardViewModelTests.swift
//  QualityControlTests
//
//  Week 3: ViewModel Tests
//  Tests for DashboardViewModel state management
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class DashboardViewModelTests: XCTestCase {

    var modelContainer: ModelContainer!
    var modelContext: ModelContext!
    var viewModel: DashboardViewModel!
    var testCouple: Couple!
    var testUser: User!

    override func setUp() async throws {
        // Use TestModelContext helper for consistent container management
        (modelContainer, modelContext) = try TestModelContext.create()

        // Create test data
        testCouple = Couple(
            relationshipStartDate: Date().addingTimeInterval(-365 * 24 * 60 * 60)
        )
        modelContext.insert(testCouple)

        testUser = User(name: "Test User", email: "test@test.com")
        testUser.couple = testCouple
        modelContext.insert(testUser)

        testCouple.users = [testUser]

        try modelContext.save()

        // Initialize view model
        viewModel = DashboardViewModel(modelContext: modelContext, couple: testCouple)
    }

    override func tearDown() async throws {
        viewModel = nil
        testCouple = nil
        testUser = nil
        modelContext = nil
        modelContainer = nil
    }

    // MARK: - Initialization Tests

    func testInitialization() {
        // Then
        XCTAssertNotNil(viewModel)
        XCTAssertNil(viewModel.stats) // Not loaded yet
        XCTAssertTrue(viewModel.recentActivity.isEmpty)
        XCTAssertFalse(viewModel.isLoading)
    }

    // MARK: - Load Dashboard Tests

    func testLoadDashboard() async {
        // When
        await viewModel.loadDashboard()

        // Then
        XCTAssertNotNil(viewModel.stats)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.error)
    }

    func testLoadDashboardSetsLoadingState() async {
        // When
        let expectation = XCTestExpectation(description: "Loading state changes")

        Task {
            await viewModel.loadDashboard()
            expectation.fulfill()
        }

        // Then - loading should be set temporarily
        await fulfillment(of: [expectation], timeout: 2.0)
    }

    func testLoadDashboardWithData() async {
        // Given - create some test data
        let session = CheckInSession(coupleId: testCouple.id)
        session.status = .completed
        session.completedAt = Date()
        modelContext.insert(session)
        try? modelContext.save()

        // When
        await viewModel.loadDashboard()

        // Then
        XCTAssertNotNil(viewModel.stats)
        XCTAssertEqual(viewModel.stats?.totalCheckIns, 1)
        XCTAssertFalse(viewModel.recentActivity.isEmpty)
    }

    // MARK: - Refresh Tests

    func testRefresh() async {
        // Given
        await viewModel.loadDashboard()
        let initialStats = viewModel.stats

        // Create new data
        let session = CheckInSession(coupleId: testCouple.id)
        session.status = .completed
        session.completedAt = Date()
        modelContext.insert(session)
        try? modelContext.save()

        // When
        await viewModel.refresh()

        // Then
        XCTAssertNotNil(viewModel.stats)
        XCTAssertNotEqual(viewModel.stats?.totalCheckIns, initialStats?.totalCheckIns)
    }

    // MARK: - Start Check-In Tests

    func testStartCheckIn() throws {
        // When
        let session = try viewModel.startCheckIn()

        // Then
        XCTAssertNotNil(session)
        XCTAssertEqual(session.coupleId, testCouple.id)
        XCTAssertEqual(session.status, .inProgress)
    }

    func testStartCheckInPersists() throws {
        // When
        let session = try viewModel.startCheckIn()

        // Then - verify it's persisted
        let descriptor = FetchDescriptor<CheckInSession>()
        let sessions = try modelContext.fetch(descriptor)
        XCTAssertEqual(sessions.count, 1)
        XCTAssertEqual(sessions.first?.id, session.id)
    }

    // MARK: - Prep Banner Tests

    func testDismissPrepBanner() {
        // Given
        viewModel.showPrepBanner = true

        // When
        viewModel.dismissPrepBanner()

        // Then
        XCTAssertFalse(viewModel.showPrepBanner)
    }

    func testPrepBannerShowsWithNoCheckIns() async {
        // When
        await viewModel.loadDashboard()

        // Then
        XCTAssertTrue(viewModel.showPrepBanner) // Should show if no check-ins
    }

    func testPrepBannerHidesWithRecentCheckIn() async {
        // Given - create recent check-in
        let session = CheckInSession(coupleId: testCouple.id)
        session.status = .completed
        session.completedAt = Date().addingTimeInterval(-3600) // 1 hour ago
        modelContext.insert(session)
        try? modelContext.save()

        // When
        await viewModel.loadDashboard()

        // Then
        XCTAssertFalse(viewModel.showPrepBanner)
    }

    // MARK: - Last Check-In Text Tests

    func testGetLastCheckInTextNoCheckIns() {
        // Given
        viewModel.stats = DashboardStats(
            totalCheckIns: 0,
            currentStreak: 0,
            totalNotes: 0,
            totalMilestones: 0,
            lastCheckInDate: nil
        )

        // When
        let text = viewModel.getLastCheckInText()

        // Then
        XCTAssertEqual(text, "No check-ins yet")
    }

    func testGetLastCheckInTextWithDate() {
        // Given
        let date = Date().addingTimeInterval(-86400) // 1 day ago
        viewModel.stats = DashboardStats(
            totalCheckIns: 1,
            currentStreak: 1,
            totalNotes: 0,
            totalMilestones: 0,
            lastCheckInDate: date
        )

        // When
        let text = viewModel.getLastCheckInText()

        // Then
        XCTAssertTrue(text.contains("Last check-in"))
        XCTAssertTrue(text.contains("ago"))
    }

    // MARK: - Has Recent Activity Tests

    func testHasRecentActivityFalseWhenEmpty() {
        // Given
        viewModel.recentActivity = []

        // Then
        XCTAssertFalse(viewModel.hasRecentActivity)
    }

    func testHasRecentActivityTrueWhenNotEmpty() async {
        // Given
        let session = CheckInSession(coupleId: testCouple.id)
        session.status = .completed
        session.completedAt = Date()
        modelContext.insert(session)
        try? modelContext.save()

        // When
        await viewModel.loadDashboard()

        // Then
        XCTAssertTrue(viewModel.hasRecentActivity)
    }
}
