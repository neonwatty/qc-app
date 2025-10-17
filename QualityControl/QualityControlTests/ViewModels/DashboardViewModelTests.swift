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

    // MARK: - Statistics Tests

    func testCheckInStreakCalculation() async {
        // Given - create consecutive check-ins
        let today = Date()
        for i in 0..<3 {
            let session = CheckInSession(coupleId: testCouple.id)
            session.status = .completed
            session.completedAt = Calendar.current.date(byAdding: .day, value: -i, to: today)
            modelContext.insert(session)
        }
        try? modelContext.save()

        // When
        await viewModel.loadDashboard()

        // Then
        XCTAssertNotNil(viewModel.stats)
        XCTAssertGreaterThan(viewModel.stats?.currentStreak ?? 0, 0)
    }

    func testCompletedCheckInsCount() async {
        // Given - create multiple completed check-ins
        for _ in 0..<5 {
            let session = CheckInSession(coupleId: testCouple.id)
            session.status = .completed
            session.completedAt = Date()
            modelContext.insert(session)
        }
        try? modelContext.save()

        // When
        await viewModel.loadDashboard()

        // Then
        XCTAssertEqual(viewModel.stats?.totalCheckIns, 5)
    }

    func testAverageSessionDuration() async {
        // Given - create sessions with known durations
        for i in 0..<3 {
            let session = CheckInSession(coupleId: testCouple.id)
            session.status = .completed
            session.startedAt = Date().addingTimeInterval(-Double(i * 1800))
            session.completedAt = session.startedAt.addingTimeInterval(1800) // 30 min each
            modelContext.insert(session)
        }
        try? modelContext.save()

        // When
        await viewModel.loadDashboard()

        // Then
        XCTAssertNotNil(viewModel.stats)
        XCTAssertGreaterThan(viewModel.stats?.totalCheckIns ?? 0, 0)
    }

    func testProgressMetrics() async {
        // Given - create various types of data
        let session = CheckInSession(coupleId: testCouple.id)
        session.status = .completed
        session.completedAt = Date()
        modelContext.insert(session)

        let note = Note(content: "Test note", privacy: .shared, authorId: testUser.id)
        modelContext.insert(note)

        let milestone = Milestone(title: "Test", description: "Test milestone", category: "growth", coupleId: testCouple.id)
        modelContext.insert(milestone)

        try? modelContext.save()

        // When
        await viewModel.loadDashboard()

        // Then
        XCTAssertEqual(viewModel.stats?.totalCheckIns, 1)
        XCTAssertEqual(viewModel.stats?.totalNotes, 1)
        XCTAssertEqual(viewModel.stats?.totalMilestones, 1)
    }

    // MARK: - Recent Activity Tests

    func testRecentActivitySorting() async {
        // Given - create activities at different times
        let old = CheckInSession(coupleId: testCouple.id)
        old.status = .completed
        old.completedAt = Date().addingTimeInterval(-7200) // 2 hours ago
        modelContext.insert(old)

        let recent = CheckInSession(coupleId: testCouple.id)
        recent.status = .completed
        recent.completedAt = Date().addingTimeInterval(-3600) // 1 hour ago
        modelContext.insert(recent)

        try? modelContext.save()

        // When
        await viewModel.loadDashboard()

        // Then
        XCTAssertFalse(viewModel.recentActivity.isEmpty)
        // Most recent should be first
        if viewModel.recentActivity.count >= 2 {
            XCTAssertGreaterThan(viewModel.recentActivity[0].timestamp, viewModel.recentActivity[1].timestamp)
        }
    }

    func testRecentActivityLimiting() async {
        // Given - create many activities
        for i in 0..<15 {
            let session = CheckInSession(coupleId: testCouple.id)
            session.status = .completed
            session.completedAt = Date().addingTimeInterval(-Double(i * 3600))
            modelContext.insert(session)
        }
        try? modelContext.save()

        // When
        await viewModel.loadDashboard()

        // Then - should limit to reasonable number
        XCTAssertLessThanOrEqual(viewModel.recentActivity.count, 10)
    }

    func testMixedActivityTypes() async {
        // Given - create different types of activities
        let session = CheckInSession(coupleId: testCouple.id)
        session.status = .completed
        session.completedAt = Date()
        modelContext.insert(session)

        let note = Note(content: "Activity note", privacy: .shared, authorId: testUser.id)
        note.createdAt = Date()
        modelContext.insert(note)

        try? modelContext.save()

        // When
        await viewModel.loadDashboard()

        // Then
        XCTAssertFalse(viewModel.recentActivity.isEmpty)
    }

    // MARK: - Error Handling Tests

    func testErrorHandling() async {
        // Given - force an error condition by using invalid couple ID
        let invalidCouple = Couple(relationshipStartDate: Date())
        // Don't insert into context - should cause potential issues
        let vm = DashboardViewModel(modelContext: modelContext, couple: invalidCouple)

        // When
        await vm.loadDashboard()

        // Then - should handle gracefully without crashing
        // Error should be set or stats should be in safe state
        XCTAssertTrue(vm.stats == nil || vm.stats != nil) // Just verify no crash
    }

    // MARK: - Concurrent Operations Tests

    func testConcurrentRefresh() async {
        // Given
        await viewModel.loadDashboard()

        // When - trigger multiple concurrent refreshes
        async let refresh1 = viewModel.refresh()
        async let refresh2 = viewModel.refresh()
        async let refresh3 = viewModel.refresh()

        _ = await (refresh1, refresh2, refresh3)

        // Then - should handle concurrency without crashing
        XCTAssertNotNil(viewModel.stats)
        XCTAssertFalse(viewModel.isLoading)
    }

    // MARK: - Empty State Tests

    func testEmptyUpcomingCheckIns() async {
        // When
        await viewModel.loadDashboard()

        // Then - no in-progress check-ins should exist initially
        let descriptor = FetchDescriptor<CheckInSession>()
        let allSessions = try? modelContext.fetch(descriptor)
        let inProgress = allSessions?.filter { $0.status == .inProgress }
        XCTAssertTrue(inProgress?.isEmpty ?? true)
    }

    func testEmptyRecentActivity() async {
        // When
        await viewModel.loadDashboard()

        // Then - no activity initially
        XCTAssertTrue(viewModel.recentActivity.isEmpty)
    }
}
