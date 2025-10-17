//
//  OnboardingViewModelTests.swift
//  QualityControlTests
//
//  Phase 1.2: ViewModel Tests
//  Tests for OnboardingViewModel
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class OnboardingViewModelTests: XCTestCase {

    var modelContainer: ModelContainer!
    var modelContext: ModelContext!
    var viewModel: OnboardingViewModel!

    override func setUp() async throws {
        // Use TestModelContext helper for consistent container management
        (modelContainer, modelContext) = try TestModelContext.create()

        // Initialize view model
        viewModel = OnboardingViewModel(modelContext: modelContext)
    }

    override func tearDown() async throws {
        viewModel = nil
        modelContext = nil
        modelContainer = nil
    }

    // MARK: - Initialization Tests

    func testInitialization() {
        XCTAssertEqual(viewModel.currentStep, .welcome)
        XCTAssertFalse(viewModel.isCompleted)
        XCTAssertEqual(viewModel.userName, "")
        XCTAssertEqual(viewModel.userEmail, "")
        XCTAssertEqual(viewModel.partnerName, "")
        XCTAssertEqual(viewModel.partnerEmail, "")
        XCTAssertTrue(viewModel.setupLoveLanguages)
        XCTAssertTrue(viewModel.setupReminders)
        XCTAssertTrue(viewModel.setupCommunication)
        XCTAssertNil(viewModel.error)
    }

    // MARK: - Navigation Tests

    func testNextStepFromWelcome() {
        viewModel.currentStep = .welcome
        viewModel.nextStep()
        XCTAssertEqual(viewModel.currentStep, .profileSetup)
    }

    func testNextStepFromProfileSetup() {
        viewModel.currentStep = .profileSetup
        viewModel.nextStep()
        XCTAssertEqual(viewModel.currentStep, .partnerSetup)
    }

    func testNextStepFromPartnerSetup() {
        viewModel.currentStep = .partnerSetup
        viewModel.nextStep()
        XCTAssertEqual(viewModel.currentStep, .loveLanguages)
    }

    func testNextStepFromLoveLanguages() {
        viewModel.currentStep = .loveLanguages
        viewModel.nextStep()
        XCTAssertEqual(viewModel.currentStep, .reminders)
    }

    func testNextStepFromReminders() {
        viewModel.currentStep = .reminders
        viewModel.nextStep()
        XCTAssertEqual(viewModel.currentStep, .completion)
    }

    func testNextStepFromCompletion() {
        viewModel.currentStep = .completion
        viewModel.nextStep()
        XCTAssertEqual(viewModel.currentStep, .completion) // Should stay at completion
    }

    func testPreviousStepFromProfileSetup() {
        viewModel.currentStep = .profileSetup
        viewModel.previousStep()
        XCTAssertEqual(viewModel.currentStep, .welcome)
    }

    func testPreviousStepFromPartnerSetup() {
        viewModel.currentStep = .partnerSetup
        viewModel.previousStep()
        XCTAssertEqual(viewModel.currentStep, .profileSetup)
    }

    func testPreviousStepFromLoveLanguages() {
        viewModel.currentStep = .loveLanguages
        viewModel.previousStep()
        XCTAssertEqual(viewModel.currentStep, .partnerSetup)
    }

    func testPreviousStepFromReminders() {
        viewModel.currentStep = .reminders
        viewModel.previousStep()
        XCTAssertEqual(viewModel.currentStep, .loveLanguages)
    }

    func testPreviousStepFromCompletion() {
        viewModel.currentStep = .completion
        viewModel.previousStep()
        XCTAssertEqual(viewModel.currentStep, .reminders)
    }

    func testPreviousStepFromWelcome() {
        viewModel.currentStep = .welcome
        viewModel.previousStep()
        XCTAssertEqual(viewModel.currentStep, .welcome) // Should stay at welcome
    }

    func testGoToStep() {
        viewModel.goToStep(.loveLanguages)
        XCTAssertEqual(viewModel.currentStep, .loveLanguages)

        viewModel.goToStep(.profileSetup)
        XCTAssertEqual(viewModel.currentStep, .profileSetup)
    }

    func testSkip() {
        viewModel.currentStep = .profileSetup
        viewModel.skip()
        XCTAssertEqual(viewModel.currentStep, .completion)
    }

    // MARK: - Validation Tests

    func testCanProceedFromWelcome() {
        viewModel.currentStep = .welcome
        XCTAssertTrue(viewModel.canProceed)
    }

    func testCanProceedFromProfileSetupWithValidData() {
        viewModel.currentStep = .profileSetup
        viewModel.userName = "John Doe"
        viewModel.userEmail = "john@example.com"
        XCTAssertTrue(viewModel.canProceed)
    }

    func testCannotProceedFromProfileSetupWithoutName() {
        viewModel.currentStep = .profileSetup
        viewModel.userName = ""
        viewModel.userEmail = "john@example.com"
        XCTAssertFalse(viewModel.canProceed)
    }

    func testCannotProceedFromProfileSetupWithoutEmail() {
        viewModel.currentStep = .profileSetup
        viewModel.userName = "John Doe"
        viewModel.userEmail = ""
        XCTAssertFalse(viewModel.canProceed)
    }

    func testCannotProceedFromProfileSetupWithWhitespace() {
        viewModel.currentStep = .profileSetup
        viewModel.userName = "   "
        viewModel.userEmail = "  "
        XCTAssertFalse(viewModel.canProceed)
    }

    func testCanProceedFromPartnerSetupWithValidData() {
        viewModel.currentStep = .partnerSetup
        viewModel.partnerName = "Jane Doe"
        XCTAssertTrue(viewModel.canProceed)
    }

    func testCannotProceedFromPartnerSetupWithoutName() {
        viewModel.currentStep = .partnerSetup
        viewModel.partnerName = ""
        XCTAssertFalse(viewModel.canProceed)
    }

    func testCannotProceedFromPartnerSetupWithWhitespace() {
        viewModel.currentStep = .partnerSetup
        viewModel.partnerName = "   "
        XCTAssertFalse(viewModel.canProceed)
    }

    func testCanProceedFromLoveLanguages() {
        viewModel.currentStep = .loveLanguages
        XCTAssertTrue(viewModel.canProceed)
    }

    func testCanProceedFromReminders() {
        viewModel.currentStep = .reminders
        XCTAssertTrue(viewModel.canProceed)
    }

    func testCannotProceedFromCompletion() {
        viewModel.currentStep = .completion
        XCTAssertFalse(viewModel.canProceed)
    }

    // MARK: - Progress Tests

    func testProgressAtWelcome() {
        viewModel.currentStep = .welcome
        XCTAssertEqual(viewModel.progress, 1.0 / 6.0, accuracy: 0.01)
    }

    func testProgressAtProfileSetup() {
        viewModel.currentStep = .profileSetup
        XCTAssertEqual(viewModel.progress, 2.0 / 6.0, accuracy: 0.01)
    }

    func testProgressAtPartnerSetup() {
        viewModel.currentStep = .partnerSetup
        XCTAssertEqual(viewModel.progress, 3.0 / 6.0, accuracy: 0.01)
    }

    func testProgressAtLoveLanguages() {
        viewModel.currentStep = .loveLanguages
        XCTAssertEqual(viewModel.progress, 4.0 / 6.0, accuracy: 0.01)
    }

    func testProgressAtReminders() {
        viewModel.currentStep = .reminders
        XCTAssertEqual(viewModel.progress, 5.0 / 6.0, accuracy: 0.01)
    }

    func testProgressAtCompletion() {
        viewModel.currentStep = .completion
        XCTAssertEqual(viewModel.progress, 1.0, accuracy: 0.01)
    }

    func testProgressText() {
        viewModel.currentStep = .welcome
        XCTAssertEqual(viewModel.progressText, "Step 1 of 6")

        viewModel.currentStep = .profileSetup
        XCTAssertEqual(viewModel.progressText, "Step 2 of 6")

        viewModel.currentStep = .completion
        XCTAssertEqual(viewModel.progressText, "Step 6 of 6")
    }

    func testProgressPercentage() {
        viewModel.currentStep = .welcome
        XCTAssertEqual(viewModel.progressPercentage, "16% complete")

        viewModel.currentStep = .partnerSetup
        XCTAssertEqual(viewModel.progressPercentage, "50% complete")

        viewModel.currentStep = .completion
        XCTAssertEqual(viewModel.progressPercentage, "100% complete")
    }

    // MARK: - Completion Tests

    func testCompleteOnboarding() async throws {
        // Set required data
        viewModel.userName = "John Doe"
        viewModel.userEmail = "john@example.com"
        viewModel.partnerName = "Jane Doe"
        viewModel.relationshipStartDate = Date()

        // Complete onboarding
        try await viewModel.completeOnboarding()

        // Verify isCompleted flag
        XCTAssertTrue(viewModel.isCompleted)

        // Verify user was created
        let userDescriptor = FetchDescriptor<User>()
        let users = try modelContext.fetch(userDescriptor)
        XCTAssertEqual(users.count, 1)
        XCTAssertEqual(users.first?.name, "John Doe")
        XCTAssertEqual(users.first?.email, "john@example.com")

        // Verify couple was created
        let coupleDescriptor = FetchDescriptor<Couple>()
        let couples = try modelContext.fetch(coupleDescriptor)
        XCTAssertEqual(couples.count, 1)

        // Verify user is linked to couple
        XCTAssertNotNil(users.first?.couple)
        XCTAssertEqual(users.first?.couple?.id, couples.first?.id)
    }

    func testCompleteOnboardingTrimsWhitespace() async throws {
        viewModel.userName = "  John Doe  "
        viewModel.userEmail = "  john@example.com  "

        try await viewModel.completeOnboarding()

        let descriptor = FetchDescriptor<User>()
        let users = try modelContext.fetch(descriptor)

        XCTAssertEqual(users.first?.name, "John Doe")
        XCTAssertEqual(users.first?.email, "john@example.com")
    }

    func testCompleteOnboardingSetsRelationshipStartDate() async throws {
        let startDate = Date().addingTimeInterval(-365 * 24 * 60 * 60) // 1 year ago
        viewModel.userName = "John Doe"
        viewModel.userEmail = "john@example.com"
        viewModel.relationshipStartDate = startDate

        try await viewModel.completeOnboarding()

        let descriptor = FetchDescriptor<Couple>()
        let couples = try modelContext.fetch(descriptor)

        if let couple = couples.first {
            XCTAssertEqual(couple.relationshipStartDate.timeIntervalSince1970,
                           startDate.timeIntervalSince1970,
                           accuracy: 1.0)
        } else {
            XCTFail("Couple not found")
        }
    }
}
