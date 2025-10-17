//
//  CheckInCoordinator.swift
//  QualityControl
//
//  Week 3: Coordinators
//  Manages the 6-step check-in flow navigation and state
//

import Foundation
import SwiftData
import Observation

/// Coordinates the check-in flow, managing navigation between steps and handling completion
@MainActor
@Observable
class CheckInCoordinator {

    // MARK: - Properties

    var viewModel: CheckInViewModel
    var currentStep: CheckInStep
    var showCancelConfirmation = false

    // Callbacks
    var onComplete: (() -> Void)?
    var onCancel: (() -> Void)?

    private let modelContext: ModelContext
    private let couple: Couple

    // MARK: - Initialization

    init(modelContext: ModelContext, couple: Couple, onComplete: (() -> Void)? = nil, onCancel: (() -> Void)? = nil) {
        self.modelContext = modelContext
        self.couple = couple
        self.onComplete = onComplete
        self.onCancel = onCancel

        // Initialize view model with no session yet
        self.viewModel = CheckInViewModel(modelContext: modelContext, session: nil)
        self.currentStep = .welcome
    }

    // MARK: - Flow Control

    /// Start the check-in flow by creating a session
    func start() {
        do {
            let checkInService = CheckInService(modelContext: modelContext)
            let session = try checkInService.createSession(for: couple)
            viewModel = CheckInViewModel(modelContext: modelContext, session: session)
            currentStep = .welcome
        } catch {
            viewModel.error = error
        }
    }

    /// Advance to the next step
    func advance() {
        guard viewModel.canProceed else { return }

        // Create session on first advance if needed
        if viewModel.session == nil && currentStep == .welcome {
            start()
        }

        viewModel.nextStep()
        currentStep = viewModel.currentStep

        // Auto-complete on final step
        if currentStep == .completion {
            completeSession()
        }
    }

    /// Go back to the previous step
    func goBack() {
        guard currentStep.previous() != nil else {
            // On first step, show cancel confirmation
            showCancelConfirmation = true
            return
        }

        viewModel.previousStep()
        currentStep = viewModel.currentStep
    }

    /// Cancel the check-in flow
    func cancel() {
        viewModel.abandonSession()
        onCancel?()
    }

    /// Confirm cancellation after user confirms
    func confirmCancel() {
        showCancelConfirmation = false
        cancel()
    }

    /// Dismiss cancellation dialog
    func dismissCancel() {
        showCancelConfirmation = false
    }

    /// Complete the check-in session
    func completeSession() {
        viewModel.completeSession()
        onComplete?()
    }

    // MARK: - Computed Properties

    /// Overall progress through the flow (0.0 to 1.0)
    var progress: Double {
        viewModel.progress
    }

    /// Check if user can advance to next step
    var canAdvance: Bool {
        viewModel.canProceed
    }

    /// Get current step title
    var stepTitle: String {
        viewModel.getStepTitle()
    }

    /// Get current step description
    var stepDescription: String {
        viewModel.getStepDescription()
    }
}
