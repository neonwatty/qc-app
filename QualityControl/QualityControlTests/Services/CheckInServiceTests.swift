//
//  CheckInServiceTests.swift
//  QualityControlTests
//
//  Week 3: Service Layer Tests
//  Tests for CheckInService business logic
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class CheckInServiceTests: XCTestCase {

    var modelContainer: ModelContainer!
    var modelContext: ModelContext!
    var checkInService: CheckInService!
    var testCouple: Couple!
    var testCategory: QualityControl.Category!

    override func setUp() async throws {
        // Use TestModelContext helper for consistent container management
        (modelContainer, modelContext) = try TestModelContext.create()

        // Initialize service
        checkInService = CheckInService(modelContext: modelContext)

        // Create test data
        testCouple = Couple(
            relationshipStartDate: Date().addingTimeInterval(-365 * 24 * 60 * 60)
        )
        modelContext.insert(testCouple)

        testCategory = QualityControl.Category(
            name: "Test Category",
            description: "Test description",
            icon: "heart.fill"
        )
        modelContext.insert(testCategory)

        try modelContext.save()
    }

    override func tearDown() async throws {
        checkInService = nil
        testCouple = nil
        testCategory = nil
        modelContext = nil
        modelContainer = nil
    }

    // MARK: - Session Creation Tests

    func testCreateSession() throws {
        // When
        let session = try checkInService.createSession(for: testCouple)

        // Then
        XCTAssertNotNil(session)
        XCTAssertEqual(session.coupleId, testCouple.id)
        XCTAssertEqual(session.status, .inProgress)
        XCTAssertEqual(session.currentStep, .welcome)
        XCTAssertEqual(session.percentageComplete, 0)
    }

    func testCreateSessionPersistence() throws {
        // When
        let session = try checkInService.createSession(for: testCouple)

        // Then - verify it's persisted
        let descriptor = FetchDescriptor<CheckInSession>()
        let sessions = try modelContext.fetch(descriptor)
        XCTAssertEqual(sessions.count, 1)
        XCTAssertEqual(sessions.first?.id, session.id)
    }

    // MARK: - Step Management Tests

    func testUpdateStep() throws {
        // Given
        let session = try checkInService.createSession(for: testCouple)

        // When
        try checkInService.updateStep(session, to: .categorySelection)

        // Then
        XCTAssertEqual(session.currentStep, .categorySelection)
    }

    func testUpdateStepPersistence() throws {
        // Given
        let session = try checkInService.createSession(for: testCouple)

        // When
        try checkInService.updateStep(session, to: .categoryDiscussion)

        // Then - verify it's persisted
        let descriptor = FetchDescriptor<CheckInSession>()
        let sessions = try modelContext.fetch(descriptor)
        XCTAssertEqual(sessions.first?.currentStep, .categoryDiscussion)
    }

    // MARK: - Category Management Tests

    func testAddCategory() throws {
        // Given
        let session = try checkInService.createSession(for: testCouple)

        // When
        try checkInService.addCategory(testCategory, to: session)

        // Then
        XCTAssertEqual(session.selectedCategories?.count, 1)
        XCTAssertEqual(session.selectedCategories?.first?.id, testCategory.id)
    }

    func testAddMultipleCategories() throws {
        // Given
        let session = try checkInService.createSession(for: testCouple)
        let category2 = QualityControl.Category(name: "Category 2", description: "Desc", icon: "star")
        modelContext.insert(category2)

        // When
        try checkInService.addCategory(testCategory, to: session)
        try checkInService.addCategory(category2, to: session)

        // Then
        XCTAssertEqual(session.selectedCategories?.count, 2)
    }

    func testRemoveCategory() throws {
        // Given
        let session = try checkInService.createSession(for: testCouple)
        try checkInService.addCategory(testCategory, to: session)

        // When
        try checkInService.removeCategory(testCategory, from: session)

        // Then
        XCTAssertEqual(session.selectedCategories?.count, 0)
    }

    // MARK: - Reflection Tests

    func testUpdateReflection() throws {
        // Given
        let session = try checkInService.createSession(for: testCouple)
        let reflectionText = "This was a great check-in session"

        // When
        try checkInService.updateReflection(session, reflection: reflectionText)

        // Then
        XCTAssertEqual(session.reflection, reflectionText)
    }

    // MARK: - Action Item Tests

    func testAddActionItem() throws {
        // Given
        let session = try checkInService.createSession(for: testCouple)
        let actionItem = ActionItem(title: "Test Action", checkInId: session.id)
        modelContext.insert(actionItem)

        // When
        try checkInService.addActionItem(actionItem, to: session)

        // Then
        XCTAssertEqual(session.actionItems?.count, 1)
        XCTAssertEqual(session.actionItems?.first?.title, "Test Action")
    }

    // MARK: - Session Completion Tests

    func testCompleteSession() throws {
        // Given
        let session = try checkInService.createSession(for: testCouple)

        // When
        try checkInService.completeSession(session)

        // Then
        XCTAssertEqual(session.status, .completed)
        XCTAssertNotNil(session.completedAt)
        XCTAssertNotNil(session.durationSeconds)
        XCTAssertEqual(session.percentageComplete, 1.0)
    }

    func testAbandonSession() throws {
        // Given
        let session = try checkInService.createSession(for: testCouple)

        // When
        try checkInService.abandonSession(session)

        // Then
        XCTAssertEqual(session.status, .abandoned)
    }

    // MARK: - Query Tests

    func testGetActiveSession() throws {
        // Given
        let session = try checkInService.createSession(for: testCouple)

        // When
        let activeSession = checkInService.getActiveSession(for: testCouple)

        // Then
        XCTAssertNotNil(activeSession)
        XCTAssertEqual(activeSession?.id, session.id)
    }

    func testGetActiveSessionReturnsNilWhenCompleted() throws {
        // Given
        let session = try checkInService.createSession(for: testCouple)
        try checkInService.completeSession(session)

        // When
        let activeSession = checkInService.getActiveSession(for: testCouple)

        // Then
        XCTAssertNil(activeSession)
    }

    func testGetRecentSessions() throws {
        // Given - create multiple completed sessions
        for _ in 0..<5 {
            let session = try checkInService.createSession(for: testCouple)
            try checkInService.completeSession(session)
        }

        // When
        let recentSessions = checkInService.getRecentSessions(for: testCouple, limit: 3)

        // Then
        XCTAssertEqual(recentSessions.count, 3)
        XCTAssertTrue(recentSessions.allSatisfy { $0.status == .completed })
    }

    func testGetTotalCheckInCount() throws {
        // Given
        for _ in 0..<7 {
            let session = try checkInService.createSession(for: testCouple)
            try checkInService.completeSession(session)
        }

        // When
        let count = checkInService.getTotalCheckInCount(for: testCouple)

        // Then
        XCTAssertEqual(count, 7)
    }

    func testGetCheckInStreak() throws {
        // Given - create sessions on consecutive days
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())

        for i in 0..<3 {
            let session = try checkInService.createSession(for: testCouple)
            session.completedAt = calendar.date(byAdding: .day, value: -i, to: today)
            try checkInService.completeSession(session)
        }

        // When
        let streak = checkInService.getCheckInStreak(for: testCouple)

        // Then
        XCTAssertEqual(streak, 3)
    }

    func testGetCheckInStreakBreaksWithGap() throws {
        // Given - sessions with a gap
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())

        // Recent sessions
        for i in 0..<2 {
            let session = try checkInService.createSession(for: testCouple)
            try checkInService.completeSession(session)
            // Set completedAt after completing so it doesn't get overwritten
            session.completedAt = calendar.date(byAdding: .day, value: -i, to: today)
        }

        // Older session with gap
        let oldSession = try checkInService.createSession(for: testCouple)
        try checkInService.completeSession(oldSession)
        // Set completedAt after completing so it doesn't get overwritten
        oldSession.completedAt = calendar.date(byAdding: .day, value: -5, to: today)

        // When
        let streak = checkInService.getCheckInStreak(for: testCouple)

        // Then
        XCTAssertEqual(streak, 2) // Only counts consecutive days
    }

    func testGetAverageSessionDuration() throws {
        // Given
        for duration in [1800, 2400, 3000] { // 30, 40, 50 minutes in seconds
            let session = try checkInService.createSession(for: testCouple)
            try checkInService.completeSession(session)
            // Set duration after completing so it doesn't get overwritten
            session.durationSeconds = duration
        }

        // When
        let avgDuration = checkInService.getAverageSessionDuration(for: testCouple)

        // Then
        XCTAssertEqual(avgDuration, 2400) // Average of 30, 40, 50 is 40 minutes
    }
}
