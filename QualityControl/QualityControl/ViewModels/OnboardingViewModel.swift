//
//  OnboardingViewModel.swift
//  QualityControl
//
//  Week 6: Onboarding System
//  State management for onboarding flow
//

import Foundation
import SwiftData

@MainActor
@Observable
class OnboardingViewModel {

    // MARK: - Properties

    private let modelContext: ModelContext

    var currentStep: OnboardingStep = .welcome
    var isCompleted: Bool = false

    // User data
    var userName: String = ""
    var userEmail: String = ""

    // Partner data
    var partnerName: String = ""
    var partnerEmail: String = ""

    // Relationship data
    var relationshipStartDate: Date = Date()

    // Feature setup flags
    var setupLoveLanguages: Bool = true
    var setupReminders: Bool = true
    var setupCommunication: Bool = true

    var error: Error?

    // MARK: - Initialization

    init(modelContext: ModelContext) {
        self.modelContext = modelContext
    }

    // MARK: - Navigation

    func nextStep() {
        switch currentStep {
        case .welcome:
            currentStep = .profileSetup
        case .profileSetup:
            currentStep = .partnerSetup
        case .partnerSetup:
            currentStep = .loveLanguages
        case .loveLanguages:
            currentStep = .reminders
        case .reminders:
            currentStep = .completion
        case .completion:
            break
        }
    }

    func previousStep() {
        switch currentStep {
        case .welcome:
            break
        case .profileSetup:
            currentStep = .welcome
        case .partnerSetup:
            currentStep = .profileSetup
        case .loveLanguages:
            currentStep = .partnerSetup
        case .reminders:
            currentStep = .loveLanguages
        case .completion:
            currentStep = .reminders
        }
    }

    func goToStep(_ step: OnboardingStep) {
        currentStep = step
    }

    func skip() {
        // Skip to completion
        currentStep = .completion
    }

    // MARK: - Validation

    var canProceed: Bool {
        switch currentStep {
        case .welcome:
            return true
        case .profileSetup:
            return !userName.trimmingCharacters(in: .whitespaces).isEmpty &&
                   !userEmail.trimmingCharacters(in: .whitespaces).isEmpty
        case .partnerSetup:
            return !partnerName.trimmingCharacters(in: .whitespaces).isEmpty
        case .loveLanguages, .reminders:
            return true
        case .completion:
            return false
        }
    }

    // MARK: - Progress

    var progress: Double {
        let total = Double(OnboardingStep.allCases.count)
        let current = Double(OnboardingStep.allCases.firstIndex(of: currentStep) ?? 0) + 1
        return current / total
    }

    var progressText: String {
        let current = (OnboardingStep.allCases.firstIndex(of: currentStep) ?? 0) + 1
        let total = OnboardingStep.allCases.count
        return "Step \(current) of \(total)"
    }

    var progressPercentage: String {
        "\(Int(progress * 100))% complete"
    }

    // MARK: - Completion

    func completeOnboarding() async throws {
        // Create user
        let user = User(
            name: userName.trimmingCharacters(in: .whitespaces),
            email: userEmail.trimmingCharacters(in: .whitespaces)
        )
        modelContext.insert(user)

        // Create couple
        let couple = Couple(relationshipStartDate: relationshipStartDate)
        modelContext.insert(couple)

        // Link user to couple
        user.couple = couple

        // Save
        try modelContext.save()

        isCompleted = true
    }
}

// MARK: - Supporting Types

enum OnboardingStep: String, CaseIterable {
    case welcome
    case profileSetup
    case partnerSetup
    case loveLanguages
    case reminders
    case completion

    var title: String {
        switch self {
        case .welcome: return "Welcome"
        case .profileSetup: return "Your Profile"
        case .partnerSetup: return "Your Partner"
        case .loveLanguages: return "Love Languages"
        case .reminders: return "Reminders"
        case .completion: return "All Set!"
        }
    }

    var icon: String {
        switch self {
        case .welcome: return "heart.fill"
        case .profileSetup: return "person.fill"
        case .partnerSetup: return "person.2.fill"
        case .loveLanguages: return "heart.circle.fill"
        case .reminders: return "bell.fill"
        case .completion: return "checkmark.circle.fill"
        }
    }
}
