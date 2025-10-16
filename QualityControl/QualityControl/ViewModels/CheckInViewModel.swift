//
//  CheckInViewModel.swift
//  QualityControl
//
//  Week 3: ViewModels
//  State management for Check-In flow
//

import Foundation
import SwiftData
import Observation

/// ViewModel for Check-In Flow
/// Manages multi-step check-in session state and navigation
@MainActor
@Observable
class CheckInViewModel {

    // MARK: - Properties

    private let checkInService: CheckInService
    private let modelContext: ModelContext

    var session: CheckInSession?
    var currentStep: CheckInStep = .welcome
    var selectedCategories: [Category] = []
    var sessionNotes: String = ""
    var discussionNotes: [String: String] = [:] // categoryId: notes
    var actionItems: [ActionItem] = []
    var isLoading: Bool = false
    var error: Error?

    // Available categories for selection
    var availableCategories: [Category] = []

    // MARK: - Initialization

    init(modelContext: ModelContext, session: CheckInSession? = nil) {
        self.modelContext = modelContext
        self.checkInService = CheckInService(modelContext: modelContext)
        self.session = session

        if let session = session {
            self.currentStep = session.currentStep
            self.selectedCategories = session.selectedCategories ?? []
            self.sessionNotes = session.reflection ?? ""
        }

        loadAvailableCategories()
    }

    // MARK: - Flow Navigation

    /// Move to next step in check-in flow
    func nextStep() {
        guard let nextStep = currentStep.next() else { return }

        currentStep = nextStep

        if let session = session {
            do {
                try checkInService.updateStep(session, to: nextStep)
            } catch {
                self.error = error
            }
        }
    }

    /// Move to previous step in check-in flow
    func previousStep() {
        guard let previousStep = currentStep.previous() else { return }

        currentStep = previousStep

        if let session = session {
            do {
                try checkInService.updateStep(session, to: previousStep)
            } catch {
                self.error = error
            }
        }
    }

    /// Navigate to specific step
    func goToStep(_ step: CheckInStep) {
        currentStep = step

        if let session = session {
            do {
                try checkInService.updateStep(session, to: step)
            } catch {
                self.error = error
            }
        }
    }

    // MARK: - Category Management

    /// Toggle category selection
    func toggleCategory(_ category: Category) {
        if let index = selectedCategories.firstIndex(where: { $0.id == category.id }) {
            selectedCategories.remove(at: index)

            if let session = session {
                do {
                    try checkInService.removeCategory(category, from: session)
                } catch {
                    self.error = error
                }
            }
        } else {
            selectedCategories.append(category)

            if let session = session {
                do {
                    try checkInService.addCategory(category, to: session)
                } catch {
                    self.error = error
                }
            }
        }
    }

    /// Check if category is selected
    func isCategorySelected(_ category: Category) -> Bool {
        selectedCategories.contains { $0.id == category.id }
    }

    // MARK: - Discussion Notes

    /// Update notes for a specific category discussion
    func updateDiscussionNotes(for categoryId: UUID, notes: String) {
        discussionNotes[categoryId.uuidString] = notes
    }

    /// Get notes for a specific category
    func getDiscussionNotes(for categoryId: UUID) -> String {
        discussionNotes[categoryId.uuidString] ?? ""
    }

    // MARK: - Session Notes

    /// Update session notes
    func updateSessionNotes(_ notes: String) {
        sessionNotes = notes

        if let session = session {
            do {
                try checkInService.updateReflection(session, reflection: notes)
            } catch {
                self.error = error
            }
        }
    }

    // MARK: - Action Items

    /// Add action item to session
    func addActionItem(title: String, priority: Priority, assignedTo: User?) {
        guard let session = session else { return }

        let actionItem = ActionItem(
            title: title,
            checkInId: session.id
        )
        actionItem.priority = priority
        actionItem.assignedTo = assignedTo?.id

        actionItems.append(actionItem)

        do {
            try checkInService.addActionItem(actionItem, to: session)
        } catch {
            self.error = error
        }
    }

    /// Remove action item
    func removeActionItem(_ actionItem: ActionItem) {
        actionItems.removeAll { $0.id == actionItem.id }
        modelContext.delete(actionItem)
    }

    // MARK: - Session Control

    /// Complete the check-in session
    func completeSession() {
        guard let session = session else { return }

        do {
            try checkInService.completeSession(session)
        } catch {
            self.error = error
        }
    }

    /// Abandon the check-in session
    func abandonSession() {
        guard let session = session else { return }

        do {
            try checkInService.abandonSession(session)
        } catch {
            self.error = error
        }
    }

    // MARK: - Helpers

    /// Get progress percentage (0.0 to 1.0)
    var progress: Double {
        let allSteps = CheckInStep.allCases
        guard let currentIndex = allSteps.firstIndex(of: currentStep) else { return 0.0 }
        return Double(currentIndex + 1) / Double(allSteps.count)
    }

    /// Check if user can proceed to next step
    var canProceed: Bool {
        switch currentStep {
        case .welcome:
            return true
        case .categorySelection:
            return !selectedCategories.isEmpty
        case .categoryDiscussion:
            return true // Can skip discussion
        case .reflection:
            return true
        case .actionItems:
            return true
        case .completion:
            return false // Final step
        }
    }

    /// Get step title
    func getStepTitle() -> String {
        switch currentStep {
        case .welcome:
            return "Welcome"
        case .categorySelection:
            return "Choose Topics"
        case .categoryDiscussion:
            return "Discuss"
        case .reflection:
            return "Reflect"
        case .actionItems:
            return "Action Items"
        case .completion:
            return "Complete"
        }
    }

    /// Get step description
    func getStepDescription() -> String {
        switch currentStep {
        case .welcome:
            return "Prepare for meaningful conversation"
        case .categorySelection:
            return "Select topics to discuss together"
        case .categoryDiscussion:
            return "Share your thoughts openly"
        case .reflection:
            return "Reflect on your conversation"
        case .actionItems:
            return "Set goals for growth"
        case .completion:
            return "Great work connecting!"
        }
    }

    // MARK: - Private Methods

    private func loadAvailableCategories() {
        let descriptor = FetchDescriptor<Category>(
            sortBy: [SortDescriptor(\.name, order: .forward)]
        )

        availableCategories = (try? modelContext.fetch(descriptor)) ?? []
    }
}

// MARK: - CheckInStep Extension

extension CheckInStep {
    /// Get the next step in the flow
    func next() -> CheckInStep? {
        switch self {
        case .welcome:
            return .categorySelection
        case .categorySelection:
            return .categoryDiscussion
        case .categoryDiscussion:
            return .reflection
        case .reflection:
            return .actionItems
        case .actionItems:
            return .completion
        case .completion:
            return nil
        }
    }

    /// Get the previous step in the flow
    func previous() -> CheckInStep? {
        switch self {
        case .welcome:
            return nil
        case .categorySelection:
            return .welcome
        case .categoryDiscussion:
            return .categorySelection
        case .reflection:
            return .categoryDiscussion
        case .actionItems:
            return .reflection
        case .completion:
            return .actionItems
        }
    }
}
