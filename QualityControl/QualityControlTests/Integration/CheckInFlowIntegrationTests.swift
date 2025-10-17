//
//  CheckInFlowIntegrationTests.swift
//  QualityControlTests
//
//  Week 3: Integration Tests
//  End-to-end tests for the complete check-in flow
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class CheckInFlowIntegrationTests: XCTestCase {

    var modelContainer: ModelContainer!
    var modelContext: ModelContext!
    var testCouple: Couple!
    var testUser: User!
    var testCategory: QualityControl.Category!

    override func setUp() async throws {
        // Use TestModelContext helper for consistent container management
        (modelContainer, modelContext) = try TestModelContext.create()

        // Create test user
        testUser = User(
            name: "Test User",
            email: "test@example.com"
        )
        modelContext.insert(testUser)

        // Create test couple
        testCouple = Couple(relationshipStartDate: Date().addingTimeInterval(-365 * 24 * 60 * 60))
        modelContext.insert(testCouple)

        // Link user to couple
        testCouple.users = [testUser]
        testUser.couple = testCouple

        // Create test category
        testCategory = QualityControl.Category(
            name: "Communication",
            description: "Talk about how you communicate",
            icon: "bubble.left.and.bubble.right.fill"
        )
        modelContext.insert(testCategory)

        try modelContext.save()
    }

    override func tearDown() async throws {
        testCategory = nil
        testUser = nil
        testCouple = nil
        modelContext = nil
        modelContainer = nil
    }

    // MARK: - Complete Flow Tests

    func testCompleteCheckInFlow() async throws {
        // Test the complete check-in flow from start to finish

        // 1. Start: Create coordinator and start flow
        let coordinator = CheckInCoordinator(modelContext: modelContext, couple: testCouple)
        coordinator.start()

        XCTAssertNotNil(coordinator.viewModel.session)
        XCTAssertEqual(coordinator.currentStep, .welcome)
        XCTAssertEqual(coordinator.viewModel.session?.status, .inProgress)

        // 2. Welcome -> Category Selection
        coordinator.advance()
        XCTAssertEqual(coordinator.currentStep, .categorySelection)

        // 3. Select categories
        coordinator.viewModel.toggleCategory(testCategory)
        XCTAssertTrue(coordinator.viewModel.selectedCategories.contains(testCategory))
        XCTAssertTrue(coordinator.canAdvance)

        // 4. Category Selection -> Discussion
        coordinator.advance()
        XCTAssertEqual(coordinator.currentStep, .categoryDiscussion)

        // 5. Add discussion notes
        coordinator.viewModel.updateDiscussionNotes(for: testCategory.id, notes: "We talked about improving communication")
        XCTAssertFalse(coordinator.viewModel.getDiscussionNotes(for: testCategory.id).isEmpty)

        // 6. Discussion -> Reflection
        coordinator.advance()
        XCTAssertEqual(coordinator.currentStep, .reflection)

        // 7. Add reflection
        coordinator.viewModel.updateSessionNotes("We both feel heard and understood")
        XCTAssertFalse(coordinator.viewModel.sessionNotes.isEmpty)

        // 8. Reflection -> Action Items
        coordinator.advance()
        XCTAssertEqual(coordinator.currentStep, .actionItems)

        // 9. Add action item
        coordinator.viewModel.addActionItem(
            title: "Weekly check-ins",
            priority: .high,
            assignedTo: testUser
        )
        XCTAssertEqual(coordinator.viewModel.actionItems.count, 1)

        // 10. Action Items -> Completion
        var completionCallbackInvoked = false
        coordinator.onComplete = {
            completionCallbackInvoked = true
        }

        coordinator.advance()
        XCTAssertEqual(coordinator.currentStep, .completion)
        XCTAssertTrue(completionCallbackInvoked)

        // 11. Verify session completed
        XCTAssertEqual(coordinator.viewModel.session?.status, .completed)
        XCTAssertNotNil(coordinator.viewModel.session?.completedAt)

        // 12. Verify data persistence
        try modelContext.save()

        let fetchDescriptor = FetchDescriptor<CheckInSession>()
        let sessions = try modelContext.fetch(fetchDescriptor)

        XCTAssertEqual(sessions.count, 1)
        XCTAssertEqual(sessions.first?.status, .completed)
        XCTAssertEqual(sessions.first?.selectedCategories?.count, 1)
    }

    func testCheckInFlowWithBackNavigation() async throws {
        // Test navigating back and forth through the flow

        let coordinator = CheckInCoordinator(modelContext: modelContext, couple: testCouple)
        coordinator.start()

        // Move forward to category selection
        coordinator.advance()
        XCTAssertEqual(coordinator.currentStep, .categorySelection)

        // Select category and move to discussion
        coordinator.viewModel.toggleCategory(testCategory)
        coordinator.advance()
        XCTAssertEqual(coordinator.currentStep, .categoryDiscussion)

        // Go back to category selection
        coordinator.goBack()
        XCTAssertEqual(coordinator.currentStep, .categorySelection)

        // Verify category still selected
        XCTAssertTrue(coordinator.viewModel.selectedCategories.contains(testCategory))

        // Move forward again
        coordinator.advance()
        XCTAssertEqual(coordinator.currentStep, .categoryDiscussion)

        // Add discussion text
        coordinator.viewModel.updateDiscussionNotes(for: testCategory.id, notes: "Test discussion")

        // Move to reflection
        coordinator.advance()
        XCTAssertEqual(coordinator.currentStep, .reflection)

        // Go back to discussion
        coordinator.goBack()
        XCTAssertEqual(coordinator.currentStep, .categoryDiscussion)

        // Verify discussion text persisted
        XCTAssertEqual(coordinator.viewModel.getDiscussionNotes(for: testCategory.id), "Test discussion")
    }

    func testCheckInFlowCancellation() async throws {
        // Test canceling the flow at different steps

        let coordinator = CheckInCoordinator(modelContext: modelContext, couple: testCouple)
        coordinator.start()

        var cancelCallbackInvoked = false
        coordinator.onCancel = {
            cancelCallbackInvoked = true
        }

        // Move to category selection
        coordinator.advance()
        coordinator.viewModel.toggleCategory(testCategory)

        // Move to discussion
        coordinator.advance()
        coordinator.viewModel.updateDiscussionNotes(for: testCategory.id, notes: "Some discussion")

        // Cancel mid-flow
        coordinator.cancel()

        XCTAssertTrue(cancelCallbackInvoked)
        XCTAssertEqual(coordinator.viewModel.session?.status, .abandoned)

        // Verify session is marked as abandoned
        try modelContext.save()

        let fetchDescriptor = FetchDescriptor<CheckInSession>()
        let sessions = try modelContext.fetch(fetchDescriptor)

        XCTAssertEqual(sessions.count, 1)
        XCTAssertEqual(sessions.first?.status, .abandoned)
    }

    // MARK: - Data Persistence Tests

    func testDataPersistsAcrossSteps() async throws {
        let coordinator = CheckInCoordinator(modelContext: modelContext, couple: testCouple)
        coordinator.start()

        // Select category
        coordinator.advance()
        coordinator.viewModel.toggleCategory(testCategory)

        // Move through steps adding data
        coordinator.advance() // Discussion
        coordinator.viewModel.updateDiscussionNotes(for: testCategory.id, notes: "Discussion text")

        coordinator.advance() // Reflection
        coordinator.viewModel.updateSessionNotes("Reflection text")

        coordinator.advance() // Action Items
        coordinator.viewModel.addActionItem(title: "Action 1", priority: .high, assignedTo: testUser)

        // Verify all data is still present
        XCTAssertTrue(coordinator.viewModel.selectedCategories.contains(testCategory))
        XCTAssertEqual(coordinator.viewModel.getDiscussionNotes(for: testCategory.id), "Discussion text")
        XCTAssertEqual(coordinator.viewModel.sessionNotes, "Reflection text")
        XCTAssertEqual(coordinator.viewModel.actionItems.count, 1)

        // Complete and save
        coordinator.advance()
        try modelContext.save()

        // Fetch and verify persistence
        let fetchDescriptor = FetchDescriptor<CheckInSession>()
        let sessions = try modelContext.fetch(fetchDescriptor)

        XCTAssertEqual(sessions.count, 1)
        let session = try XCTUnwrap(sessions.first)

        XCTAssertEqual(session.selectedCategories?.count, 1)
        XCTAssertEqual(session.reflection, "Reflection text")
        XCTAssertEqual(session.actionItems?.count, 1)
    }

    // MARK: - Validation Tests

    func testCannotAdvanceWithoutCategories() throws {
        let coordinator = CheckInCoordinator(modelContext: modelContext, couple: testCouple)
        coordinator.start()

        // Move to category selection
        coordinator.advance()
        XCTAssertEqual(coordinator.currentStep, .categorySelection)

        // Try to advance without selecting categories
        XCTAssertFalse(coordinator.canAdvance)

        // Select a category
        coordinator.viewModel.toggleCategory(testCategory)
        XCTAssertTrue(coordinator.canAdvance)

        // Now advance should work
        coordinator.advance()
        XCTAssertEqual(coordinator.currentStep, .categoryDiscussion)
    }

    func testProgressCalculation() throws {
        let coordinator = CheckInCoordinator(modelContext: modelContext, couple: testCouple)
        coordinator.start()

        // Welcome: 1/6
        XCTAssertEqual(coordinator.progress, 1.0 / 6.0, accuracy: 0.01)

        // Category Selection: 2/6
        coordinator.advance()
        XCTAssertEqual(coordinator.progress, 2.0 / 6.0, accuracy: 0.01)

        // Discussion: 3/6
        coordinator.viewModel.toggleCategory(testCategory)
        coordinator.advance()
        XCTAssertEqual(coordinator.progress, 3.0 / 6.0, accuracy: 0.01)

        // Reflection: 4/6
        coordinator.advance()
        XCTAssertEqual(coordinator.progress, 4.0 / 6.0, accuracy: 0.01)

        // Action Items: 5/6
        coordinator.advance()
        XCTAssertEqual(coordinator.progress, 5.0 / 6.0, accuracy: 0.01)

        // Completion: 6/6 (100%)
        coordinator.advance()
        XCTAssertEqual(coordinator.progress, 1.0, accuracy: 0.01)
    }

    // MARK: - Multiple Sessions Tests

    func testMultipleCheckInSessions() async throws {
        // Create and complete first session
        let coordinator1 = CheckInCoordinator(modelContext: modelContext, couple: testCouple)
        coordinator1.start()
        coordinator1.advance() // categorySelection
        coordinator1.viewModel.toggleCategory(testCategory)
        coordinator1.advance() // discussion
        coordinator1.advance() // reflection
        coordinator1.advance() // actionItems
        coordinator1.advance() // completion

        try modelContext.save()

        // Create and complete second session
        let coordinator2 = CheckInCoordinator(modelContext: modelContext, couple: testCouple)
        coordinator2.start()
        coordinator2.advance() // categorySelection
        coordinator2.viewModel.toggleCategory(testCategory)
        coordinator2.advance() // discussion
        coordinator2.advance() // reflection
        coordinator2.advance() // actionItems
        coordinator2.advance() // completion

        try modelContext.save()

        // Verify both sessions exist
        let fetchDescriptor = FetchDescriptor<CheckInSession>(
            sortBy: [SortDescriptor(\.startedAt, order: .reverse)]
        )
        let sessions = try modelContext.fetch(fetchDescriptor)

        XCTAssertEqual(sessions.count, 2)
        XCTAssertTrue(sessions.allSatisfy { $0.status == .completed })
    }
}
