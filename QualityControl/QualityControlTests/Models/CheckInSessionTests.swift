//
//  CheckInSessionTests.swift
//  QualityControlTests
//
//  Phase 1.1: Model Tests
//  Comprehensive tests for CheckInSession model
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class CheckInSessionTests: XCTestCase {

    var modelContext: ModelContext!
    var modelContainer: ModelContainer!
    var testCouple: Couple!
    var testSession: CheckInSession!

    override func setUp() async throws {
        (modelContainer, modelContext) = try TestModelContext.create()

        testCouple = Couple(relationshipStartDate: Date())
        modelContext.insert(testCouple)

        testSession = CheckInSession(coupleId: testCouple.id)
        modelContext.insert(testSession)

        try modelContext.save()
    }

    override func tearDown() async throws {
        testSession = nil
        testCouple = nil
        modelContext = nil
        modelContainer = nil
    }

    // MARK: - Initialization Tests

    func testSessionInitialization() {
        // Given
        let coupleId = UUID()

        // When
        let session = CheckInSession(coupleId: coupleId)

        // Then
        XCTAssertNotNil(session.id)
        XCTAssertEqual(session.coupleId, coupleId)
        XCTAssertEqual(session.status, .inProgress)
        XCTAssertEqual(session.currentStep, .welcome)
        XCTAssertNil(session.completedAt)
        XCTAssertNotNil(session.startedAt)
    }

    func testSessionIdIsUnique() {
        // When
        let session1 = CheckInSession(coupleId: testCouple.id)
        let session2 = CheckInSession(coupleId: testCouple.id)

        // Then
        XCTAssertNotEqual(session1.id, session2.id)
    }

    func testSessionCreatedAtIsSet() {
        // Given
        let beforeCreation = Date()

        // When
        let session = CheckInSession(coupleId: testCouple.id)

        // Then
        let afterCreation = Date()
        XCTAssertGreaterThanOrEqual(session.startedAt, beforeCreation)
        XCTAssertLessThanOrEqual(session.startedAt, afterCreation)
    }

    // MARK: - Status Transition Tests

    func testInitialStatusIsInProgress() {
        // Then
        XCTAssertEqual(testSession.status, .inProgress)
    }

    func testCanCompleteSession() throws {
        // When
        testSession.status = .completed
        testSession.completedAt = Date()
        try modelContext.save()

        // Then
        XCTAssertEqual(testSession.status, .completed)
        XCTAssertNotNil(testSession.completedAt)
    }

    func testCanAbandonSession() throws {
        // When
        testSession.status = .abandoned
        try modelContext.save()

        // Then
        XCTAssertEqual(testSession.status, .abandoned)
    }

    func testCompletedAtIsNilForInProgressSession() {
        // Then
        XCTAssertNil(testSession.completedAt)
    }

    func testCompletedAtIsSetWhenCompleted() throws {
        // Given
        let completionTime = Date()

        // When
        testSession.status = .completed
        testSession.completedAt = completionTime
        try modelContext.save()

        // Then
        assertDatesEqual(testSession.completedAt!, completionTime)
    }

    // MARK: - Step Progression Tests

    func testInitialStepIsWelcome() {
        // Then
        XCTAssertEqual(testSession.currentStep, .welcome)
    }

    func testCanProgressToNextStep() throws {
        // When
        testSession.currentStep = .categorySelection
        try modelContext.save()

        // Then
        XCTAssertEqual(testSession.currentStep, .categorySelection)
    }

    func testCanProgressThroughAllSteps() throws {
        let steps: [CheckInStep] = [.welcome, .categorySelection, .categoryDiscussion, .reflection, .actionItems, .completion]

        for step in steps {
            // When
            testSession.currentStep = step
            try modelContext.save()

            // Then
            XCTAssertEqual(testSession.currentStep, step)
        }
    }

    func testCurrentStepPersists() throws {
        // Given
        let targetStep = CheckInStep.reflection

        // When
        testSession.currentStep = targetStep
        try modelContext.save()

        // Fetch again
        let descriptor = FetchDescriptor<CheckInSession>()
        let sessions = try modelContext.fetch(descriptor)

        // Then
        XCTAssertEqual(sessions.first?.currentStep, targetStep)
    }

    // MARK: - Reflection Notes Tests

    func testReflectionInitiallyNil() {
        // Then
        XCTAssertNil(testSession.reflection)
    }

    func testCanSetReflection() throws {
        // Given
        let reflectionText = "This was a productive session"

        // When
        testSession.reflection = reflectionText
        try modelContext.save()

        // Then
        XCTAssertEqual(testSession.reflection, reflectionText)
    }

    func testCanUpdateReflection() throws {
        // Given
        testSession.reflection = "Initial reflection"
        try modelContext.save()

        // When
        testSession.reflection = "Updated reflection"
        try modelContext.save()

        // Then
        XCTAssertEqual(testSession.reflection, "Updated reflection")
    }

    func testCanClearReflection() throws {
        // Given
        testSession.reflection = "Some reflection"
        try modelContext.save()

        // When
        testSession.reflection = nil
        try modelContext.save()

        // Then
        XCTAssertNil(testSession.reflection)
    }

    // MARK: - Session Duration Tests

    func testSessionDurationForInProgressSession() {
        // When
        let duration = testSession.startedAt.distance(to: Date())

        // Then
        XCTAssertGreaterThan(duration, 0)
    }

    func testSessionDurationForCompletedSession() throws {
        // Given
        let completionTime = Date().addingTimeInterval(3600) // 1 hour later
        testSession.completedAt = completionTime
        testSession.status = .completed
        try modelContext.save()

        // When
        let duration = testSession.startedAt.distance(to: completionTime)

        // Then
        XCTAssertEqual(duration, 3600, accuracy: 1.0)
    }

    // MARK: - Categories Tests

    func testSelectedCategoriesInitiallyEmpty() {
        // Then
        XCTAssertEmpty(testSession.selectedCategories ?? [])
    }

    func testCanAddCategory() throws {
        // Given
        let category = QualityControl.Category(name: "Communication", description: "Test", icon: "bubble.left.and.bubble.right")
        modelContext.insert(category)

        // Create new session with category
        let sessionWithCategory = CheckInSession(coupleId: testCouple.id, categories: [category])
        modelContext.insert(sessionWithCategory)
        try modelContext.save()

        // Then
        XCTAssertCount(sessionWithCategory.selectedCategories ?? [], 1)
        XCTAssertEqual(sessionWithCategory.selectedCategories?.first?.name, "Communication")
    }

    func testCanAddMultipleCategories() throws {
        // Given
        let cat1 = QualityControl.Category(name: "Communication", description: "Test 1", icon: "bubble")
        let cat2 = QualityControl.Category(name: "Intimacy", description: "Test 2", icon: "heart")
        modelContext.insert(cat1)
        modelContext.insert(cat2)

        // Create new session with categories
        let sessionWithCategories = CheckInSession(coupleId: testCouple.id, categories: [cat1, cat2])
        modelContext.insert(sessionWithCategories)
        try modelContext.save()

        // Then
        XCTAssertCount(sessionWithCategories.selectedCategories ?? [], 2)
    }

    func testCanRemoveCategory() throws {
        // Given
        let category = QualityControl.Category(name: "Test", description: "Test", icon: "circle")
        modelContext.insert(category)
        let sessionWithCategory = CheckInSession(coupleId: testCouple.id, categories: [category])
        modelContext.insert(sessionWithCategory)
        try modelContext.save()

        // When - Create new session without the category
        let newSession = CheckInSession(coupleId: testCouple.id, categories: [])
        modelContext.insert(newSession)
        try modelContext.save()

        // Then
        XCTAssertEmpty(newSession.selectedCategories ?? [])
    }

    // MARK: - Action Items Tests

    func testActionItemsInitiallyEmpty() {
        // Then
        XCTAssertEmpty(testSession.actionItems ?? [])
    }

    func testCanAddActionItem() throws {
        // Given
        let checkInId = testSession.id
        let actionItem = ActionItem(title: "Follow up on finances", checkInId: checkInId)
        modelContext.insert(actionItem)
        try modelContext.save()

        // When
        let descriptor = FetchDescriptor<ActionItem>(
            predicate: #Predicate { $0.checkInId == checkInId }
        )
        let actionItems = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(actionItems, 1)
        XCTAssertEqual(actionItems.first?.title, "Follow up on finances")
    }

    func testCanAddMultipleActionItems() throws {
        // Given
        let checkInId = testSession.id
        let item1 = ActionItem(title: "Item 1", checkInId: checkInId)
        let item2 = ActionItem(title: "Item 2", checkInId: checkInId)
        modelContext.insert(item1)
        modelContext.insert(item2)
        try modelContext.save()

        // When
        let descriptor = FetchDescriptor<ActionItem>(
            predicate: #Predicate { $0.checkInId == checkInId }
        )
        let actionItems = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(actionItems, 2)
    }

    func testActionItemsWithDifferentPriorities() throws {
        // Given
        let checkInId = testSession.id
        let lowItem = ActionItem(title: "Low Priority", checkInId: checkInId)
        lowItem.priority = .low
        let highItem = ActionItem(title: "High Priority", checkInId: checkInId)
        highItem.priority = .high
        modelContext.insert(lowItem)
        modelContext.insert(highItem)
        try modelContext.save()

        // When
        let descriptor = FetchDescriptor<ActionItem>(
            predicate: #Predicate { $0.checkInId == checkInId }
        )
        let actionItems = try modelContext.fetch(descriptor)
        let highPriorityItems = actionItems.filter { $0.priority == .high }

        // Then
        XCTAssertCount(highPriorityItems, 1)
    }

    // MARK: - Persistence Tests

    func testSessionPersistsInContext() throws {
        // When
        let descriptor = FetchDescriptor<CheckInSession>()
        let sessions = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(sessions, 1)
        XCTAssertEqual(sessions.first?.id, testSession.id)
    }

    func testSessionCanBeDeleted() throws {
        // When
        modelContext.delete(testSession)
        try modelContext.save()

        // Then
        let descriptor = FetchDescriptor<CheckInSession>()
        let sessions = try modelContext.fetch(descriptor)
        XCTAssertEmpty(sessions)
    }

    func testMultipleSessionsPersist() throws {
        // Given
        let session2 = CheckInSession(coupleId: testCouple.id)
        let session3 = CheckInSession(coupleId: testCouple.id)
        modelContext.insert(session2)
        modelContext.insert(session3)

        // When
        try modelContext.save()

        // Then
        let descriptor = FetchDescriptor<CheckInSession>()
        let sessions = try modelContext.fetch(descriptor)
        XCTAssertCount(sessions, 3)
    }

    // MARK: - Query Tests

    func testFetchSessionById() throws {
        // Given
        let targetId = testSession.id

        // When
        let descriptor = FetchDescriptor<CheckInSession>(
            predicate: #Predicate { $0.id == targetId }
        )
        let sessions = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(sessions, 1)
        XCTAssertEqual(sessions.first?.id, targetId)
    }

    func testFetchSessionsByStatus() throws {
        // Given
        let completedSession = CheckInSession(coupleId: testCouple.id)
        completedSession.status = .completed
        completedSession.completedAt = Date()
        modelContext.insert(completedSession)
        try modelContext.save()

        let targetStatus: CheckInStatus = .completed

        // When
        let descriptor = FetchDescriptor<CheckInSession>(
            predicate: #Predicate { $0.status == targetStatus }
        )
        let sessions = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(sessions, 1)
        XCTAssertEqual(sessions.first?.status, .completed)
    }

    func testFetchSessionsByCoupleId() throws {
        // Given
        let otherCouple = Couple(relationshipStartDate: Date())
        modelContext.insert(otherCouple)

        let otherSession = CheckInSession(coupleId: otherCouple.id)
        modelContext.insert(otherSession)
        try modelContext.save()

        let targetCoupleId = testCouple.id

        // When
        let descriptor = FetchDescriptor<CheckInSession>(
            predicate: #Predicate { $0.coupleId == targetCoupleId }
        )
        let sessions = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(sessions, 1)
        XCTAssertEqual(sessions.first?.coupleId, testCouple.id)
    }
}
