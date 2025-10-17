//
//  CheckInViewModelTests.swift
//  QualityControlTests
//
//  Week 3: ViewModel Tests
//  Tests for CheckInViewModel state management
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class CheckInViewModelTests: XCTestCase {

    var modelContainer: ModelContainer!
    var modelContext: ModelContext!
    var viewModel: CheckInViewModel!
    var testCouple: Couple!
    var testSession: CheckInSession!
    var testCategory: QualityControl.Category!

    override func setUp() async throws {
        // Use TestModelContext helper for consistent container management
        (modelContainer, modelContext) = try TestModelContext.create()

        // Create test data
        testCouple = Couple(
            relationshipStartDate: Date()
        )
        modelContext.insert(testCouple)

        testSession = CheckInSession(coupleId: testCouple.id)
        modelContext.insert(testSession)

        testCategory = QualityControl.Category(
            name: "Test Category",
            description: "Test description",
            icon: "heart.fill"
        )
        modelContext.insert(testCategory)

        try modelContext.save()

        // Initialize view model
        viewModel = CheckInViewModel(modelContext: modelContext, session: testSession)
    }

    override func tearDown() async throws {
        viewModel = nil
        testSession = nil
        testCouple = nil
        testCategory = nil
        modelContext = nil
        modelContainer = nil
    }

    // MARK: - Initialization Tests

    func testInitializationWithSession() {
        // Then
        XCTAssertNotNil(viewModel.session)
        XCTAssertEqual(viewModel.currentStep, .welcome)
        XCTAssertTrue(viewModel.selectedCategories.isEmpty)
        XCTAssertTrue(viewModel.actionItems.isEmpty)
    }

    func testInitializationWithNilSession() {
        // Given
        let vm = CheckInViewModel(modelContext: modelContext, session: nil)

        // Then
        XCTAssertNil(vm.session)
        XCTAssertEqual(vm.currentStep, .welcome)
    }

    func testLoadAvailableCategories() {
        // Then - should load categories during initialization
        XCTAssertFalse(viewModel.availableCategories.isEmpty)
    }

    // MARK: - Step Navigation Tests

    func testNextStep() {
        // Given
        viewModel.currentStep = .welcome

        // When
        viewModel.nextStep()

        // Then
        XCTAssertEqual(viewModel.currentStep, .categorySelection)
    }

    func testNextStepUpdatesSession() {
        // Given
        viewModel.currentStep = .welcome

        // When
        viewModel.nextStep()

        // Then
        XCTAssertEqual(testSession.currentStep, .categorySelection)
    }

    func testPreviousStep() {
        // Given
        viewModel.currentStep = .categorySelection

        // When
        viewModel.previousStep()

        // Then
        XCTAssertEqual(viewModel.currentStep, .welcome)
    }

    func testNextStepFromCompletion() {
        // Given
        viewModel.currentStep = .completion

        // When
        viewModel.nextStep()

        // Then - should stay at completion
        XCTAssertEqual(viewModel.currentStep, .completion)
    }

    func testPreviousStepFromWelcome() {
        // Given
        viewModel.currentStep = .welcome

        // When
        viewModel.previousStep()

        // Then - should stay at welcome
        XCTAssertEqual(viewModel.currentStep, .welcome)
    }

    func testGoToStep() {
        // Given
        viewModel.currentStep = .welcome

        // When
        viewModel.goToStep(.reflection)

        // Then
        XCTAssertEqual(viewModel.currentStep, .reflection)
        XCTAssertEqual(testSession.currentStep, .reflection)
    }

    // MARK: - Category Management Tests

    func testToggleCategoryAdd() {
        // When
        viewModel.toggleCategory(testCategory)

        // Then
        XCTAssertEqual(viewModel.selectedCategories.count, 1)
        XCTAssertTrue(viewModel.isCategorySelected(testCategory))
    }

    func testToggleCategoryRemove() {
        // Given
        viewModel.toggleCategory(testCategory)

        // When
        viewModel.toggleCategory(testCategory)

        // Then
        XCTAssertTrue(viewModel.selectedCategories.isEmpty)
        XCTAssertFalse(viewModel.isCategorySelected(testCategory))
    }

    func testIsCategorySelected() {
        // Given
        viewModel.selectedCategories.append(testCategory)

        // When
        let isSelected = viewModel.isCategorySelected(testCategory)

        // Then
        XCTAssertTrue(isSelected)
    }

    // MARK: - Discussion Notes Tests

    func testUpdateDiscussionNotes() {
        // When
        viewModel.updateDiscussionNotes(for: testCategory.id, notes: "Test notes")

        // Then
        let notes = viewModel.getDiscussionNotes(for: testCategory.id)
        XCTAssertEqual(notes, "Test notes")
    }

    func testGetDiscussionNotesEmpty() {
        // When
        let notes = viewModel.getDiscussionNotes(for: testCategory.id)

        // Then
        XCTAssertEqual(notes, "")
    }

    // MARK: - Session Notes Tests

    func testUpdateSessionNotes() {
        // When
        viewModel.updateSessionNotes("Session reflection")

        // Then
        XCTAssertEqual(viewModel.sessionNotes, "Session reflection")
        XCTAssertEqual(testSession.reflection, "Session reflection")
    }

    // MARK: - Action Items Tests

    func testAddActionItem() {
        // Given
        let testUser = User(name: "Test", email: "test@test.com")
        modelContext.insert(testUser)

        // When
        viewModel.addActionItem(title: "Test Action", priority: .high, assignedTo: testUser)

        // Then
        XCTAssertEqual(viewModel.actionItems.count, 1)
        XCTAssertEqual(viewModel.actionItems.first?.title, "Test Action")
    }

    func testRemoveActionItem() {
        // Given
        let actionItem = ActionItem(title: "Test", checkInId: testSession.id)
        modelContext.insert(actionItem)
        viewModel.actionItems.append(actionItem)

        // When
        viewModel.removeActionItem(actionItem)

        // Then
        XCTAssertTrue(viewModel.actionItems.isEmpty)
    }

    // MARK: - Session Control Tests

    func testCompleteSession() {
        // When
        viewModel.completeSession()

        // Then
        XCTAssertEqual(testSession.status, .completed)
        XCTAssertNotNil(testSession.completedAt)
    }

    func testAbandonSession() {
        // When
        viewModel.abandonSession()

        // Then
        XCTAssertEqual(testSession.status, .abandoned)
    }

    // MARK: - Progress Tests

    func testProgressAtWelcome() {
        // Given
        viewModel.currentStep = .welcome

        // When
        let progress = viewModel.progress

        // Then
        XCTAssertEqual(progress, 1.0 / 6.0) // 1st of 6 steps
    }

    func testProgressAtCompletion() {
        // Given
        viewModel.currentStep = .completion

        // When
        let progress = viewModel.progress

        // Then
        XCTAssertEqual(progress, 1.0) // Last step
    }

    // MARK: - Can Proceed Tests

    func testCanProceedFromWelcome() {
        // Given
        viewModel.currentStep = .welcome

        // Then
        XCTAssertTrue(viewModel.canProceed)
    }

    func testCannotProceedFromCategorySelectionWithoutCategories() {
        // Given
        viewModel.currentStep = .categorySelection
        viewModel.selectedCategories = []

        // Then
        XCTAssertFalse(viewModel.canProceed)
    }

    func testCanProceedFromCategorySelectionWithCategories() {
        // Given
        viewModel.currentStep = .categorySelection
        viewModel.selectedCategories = [testCategory]

        // Then
        XCTAssertTrue(viewModel.canProceed)
    }

    func testCannotProceedFromCompletion() {
        // Given
        viewModel.currentStep = .completion

        // Then
        XCTAssertFalse(viewModel.canProceed)
    }

    // MARK: - Step Title Tests

    func testGetStepTitle() {
        // Given
        let steps: [(CheckInStep, String)] = [
            (.welcome, "Welcome"),
            (.categorySelection, "Choose Topics"),
            (.categoryDiscussion, "Discuss"),
            (.reflection, "Reflect"),
            (.actionItems, "Action Items"),
            (.completion, "Complete")
        ]

        for (step, expectedTitle) in steps {
            // When
            viewModel.currentStep = step
            let title = viewModel.getStepTitle()

            // Then
            XCTAssertEqual(title, expectedTitle, "Step \(step) title mismatch")
        }
    }

    // MARK: - Step Description Tests

    func testGetStepDescription() {
        // Given
        viewModel.currentStep = .welcome

        // When
        let description = viewModel.getStepDescription()

        // Then
        XCTAssertFalse(description.isEmpty)
    }
}
