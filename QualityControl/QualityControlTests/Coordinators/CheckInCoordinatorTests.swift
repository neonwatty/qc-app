//
//  CheckInCoordinatorTests.swift
//  QualityControlTests
//
//  Week 3: Coordinator Tests
//  Tests for CheckInCoordinator navigation and flow logic
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class CheckInCoordinatorTests: XCTestCase {

    var modelContainer: ModelContainer!
    var modelContext: ModelContext!
    var testCouple: Couple!
    var testCategory: QualityControl.Category!
    var coordinator: CheckInCoordinator!

    override func setUp() async throws {
        // Use TestModelContext helper for consistent container management
        (modelContainer, modelContext) = try TestModelContext.create()

        // Create test couple
        testCouple = Couple(relationshipStartDate: Date().addingTimeInterval(-365 * 24 * 60 * 60))
        modelContext.insert(testCouple)

        // Create test category
        testCategory = QualityControl.Category(
            name: "Communication",
            description: "Talk about how you communicate",
            icon: "bubble.left.and.bubble.right.fill"
        )
        modelContext.insert(testCategory)

        try modelContext.save()

        // Initialize coordinator
        coordinator = CheckInCoordinator(modelContext: modelContext, couple: testCouple)
    }

    override func tearDown() async throws {
        coordinator = nil
        testCategory = nil
        testCouple = nil
        modelContext = nil
        modelContainer = nil
    }

    // MARK: - Initialization Tests

    func testInitialization() {
        XCTAssertNotNil(coordinator.viewModel)
        XCTAssertEqual(coordinator.currentStep, .welcome)
        XCTAssertFalse(coordinator.showCancelConfirmation)
        XCTAssertNil(coordinator.viewModel.session) // Session not created yet
    }

    // MARK: - Session Creation Tests

    func testStartCreatesSession() {
        // When
        coordinator.start()

        // Then
        XCTAssertNotNil(coordinator.viewModel.session)
        XCTAssertEqual(coordinator.currentStep, .welcome)
        XCTAssertEqual(coordinator.viewModel.session?.status, .inProgress)
    }

    // MARK: - Navigation Tests

    func testAdvanceFromWelcome() {
        // Given
        coordinator.start()

        // When
        coordinator.advance()

        // Then
        XCTAssertEqual(coordinator.currentStep, .categorySelection)
        XCTAssertEqual(coordinator.viewModel.currentStep, .categorySelection)
    }

    func testAdvanceCreatesSessionOnFirstAdvance() {
        // Given - no session created yet
        XCTAssertNil(coordinator.viewModel.session)

        // When - advance from welcome without calling start()
        coordinator.advance()

        // Then - session should be auto-created
        XCTAssertNotNil(coordinator.viewModel.session)
    }

    func testAdvanceProgressesThroughAllSteps() {
        // Given
        coordinator.start()

        // When - advance through all steps
        coordinator.advance() // welcome -> categorySelection

        // Add a category so we can proceed
        coordinator.viewModel.toggleCategory(testCategory)

        coordinator.advance() // categorySelection -> categoryDiscussion
        coordinator.advance() // categoryDiscussion -> reflection
        coordinator.advance() // reflection -> actionItems
        coordinator.advance() // actionItems -> completion

        // Then
        XCTAssertEqual(coordinator.currentStep, .completion)
    }

    func testCannotAdvanceWithoutCategories() {
        // Given
        coordinator.start()
        coordinator.advance() // Move to categorySelection

        // When - try to advance without selecting categories
        let canAdvance = coordinator.canAdvance

        // Then
        XCTAssertFalse(canAdvance)
    }

    func testCanAdvanceWithCategories() {
        // Given
        coordinator.start()
        coordinator.advance() // Move to categorySelection

        // Add a category
        coordinator.viewModel.toggleCategory(testCategory)

        // When
        let canAdvance = coordinator.canAdvance

        // Then
        XCTAssertTrue(canAdvance)
    }

    func testGoBack() {
        // Given
        coordinator.start()
        coordinator.advance() // welcome -> categorySelection
        XCTAssertEqual(coordinator.currentStep, .categorySelection)

        // When
        coordinator.goBack()

        // Then
        XCTAssertEqual(coordinator.currentStep, .welcome)
    }

    func testGoBackFromWelcomeShowsCancelConfirmation() {
        // Given
        coordinator.start()
        XCTAssertEqual(coordinator.currentStep, .welcome)
        XCTAssertFalse(coordinator.showCancelConfirmation)

        // When
        coordinator.goBack()

        // Then
        XCTAssertTrue(coordinator.showCancelConfirmation)
        XCTAssertEqual(coordinator.currentStep, .welcome) // Should stay on welcome
    }

    // MARK: - Progress Tests

    func testProgressAtWelcome() {
        // Given
        coordinator.start()

        // When
        let progress = coordinator.progress

        // Then
        XCTAssertEqual(progress, 1.0 / 6.0, accuracy: 0.01) // 1/6 steps complete
    }

    func testProgressAtCategorySelection() {
        // Given
        coordinator.start()
        coordinator.advance()

        // When
        let progress = coordinator.progress

        // Then
        XCTAssertEqual(progress, 2.0 / 6.0, accuracy: 0.01) // 2/6 steps complete
    }

    func testProgressAtCompletion() {
        // Given
        coordinator.start()
        coordinator.advance() // categorySelection

        if let category = try? modelContext.fetch(FetchDescriptor<QualityControl.Category>()).first {
            coordinator.viewModel.toggleCategory(category)
        }

        coordinator.advance() // categoryDiscussion
        coordinator.advance() // reflection
        coordinator.advance() // actionItems
        coordinator.advance() // completion

        // When
        let progress = coordinator.progress

        // Then
        XCTAssertEqual(progress, 1.0, accuracy: 0.01) // 100% complete
    }

    // MARK: - Cancellation Tests

    func testCancel() {
        // Given
        coordinator.start()
        var cancelCallbackInvoked = false
        coordinator.onCancel = {
            cancelCallbackInvoked = true
        }

        // When
        coordinator.cancel()

        // Then
        XCTAssertTrue(cancelCallbackInvoked)
        if let session = coordinator.viewModel.session {
            XCTAssertEqual(session.status, .abandoned)
        }
    }

    func testConfirmCancel() {
        // Given
        coordinator.start()
        coordinator.showCancelConfirmation = true
        var cancelCallbackInvoked = false
        coordinator.onCancel = {
            cancelCallbackInvoked = true
        }

        // When
        coordinator.confirmCancel()

        // Then
        XCTAssertFalse(coordinator.showCancelConfirmation)
        XCTAssertTrue(cancelCallbackInvoked)
    }

    func testDismissCancel() {
        // Given
        coordinator.start()
        coordinator.showCancelConfirmation = true

        // When
        coordinator.dismissCancel()

        // Then
        XCTAssertFalse(coordinator.showCancelConfirmation)
    }

    // MARK: - Completion Tests

    func testCompleteSession() {
        // Given
        coordinator.start()
        var completeCallbackInvoked = false
        coordinator.onComplete = {
            completeCallbackInvoked = true
        }

        // When
        coordinator.completeSession()

        // Then
        XCTAssertTrue(completeCallbackInvoked)
        if let session = coordinator.viewModel.session {
            XCTAssertEqual(session.status, .completed)
            XCTAssertNotNil(session.completedAt)
        }
    }

    func testAdvanceToCompletionAutoCompletes() {
        // Given
        coordinator.start()
        var completeCallbackInvoked = false
        coordinator.onComplete = {
            completeCallbackInvoked = true
        }

        // When - advance all the way to completion
        coordinator.advance() // categorySelection

        if let category = try? modelContext.fetch(FetchDescriptor<QualityControl.Category>()).first {
            coordinator.viewModel.toggleCategory(category)
        }

        coordinator.advance() // categoryDiscussion
        coordinator.advance() // reflection
        coordinator.advance() // actionItems
        coordinator.advance() // completion

        // Then - should auto-complete
        XCTAssertTrue(completeCallbackInvoked)
        XCTAssertEqual(coordinator.currentStep, .completion)
    }

    // MARK: - Step Info Tests

    func testStepTitle() {
        // Given
        coordinator.start()

        // When/Then
        XCTAssertEqual(coordinator.stepTitle, "Welcome")

        coordinator.advance()
        XCTAssertEqual(coordinator.stepTitle, "Choose Topics")

        if let category = try? modelContext.fetch(FetchDescriptor<QualityControl.Category>()).first {
            coordinator.viewModel.toggleCategory(category)
        }

        coordinator.advance()
        XCTAssertEqual(coordinator.stepTitle, "Discuss")
    }

    func testStepDescription() {
        // Given
        coordinator.start()

        // When/Then
        XCTAssertEqual(coordinator.stepDescription, "Prepare for meaningful conversation")

        coordinator.advance()
        XCTAssertEqual(coordinator.stepDescription, "Select topics to discuss together")
    }
}
