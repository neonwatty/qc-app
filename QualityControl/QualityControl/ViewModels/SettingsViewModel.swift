//
//  SettingsViewModel.swift
//  QualityControl
//
//  Week 7: Settings System
//  State management for app settings
//

import Foundation
import SwiftData

@MainActor
@Observable
class SettingsViewModel {

    // MARK: - Properties

    private let modelContext: ModelContext
    private let currentUserId: UUID

    var user: User?
    var couple: Couple?
    var isLoading: Bool = false
    var error: Error?

    // Settings state
    var userName: String = ""
    var userEmail: String = ""
    var partnerName: String = ""
    var relationshipStartDate: Date = Date()

    // Session rules
    var sessionDuration: Int = 30 // minutes
    var allowPauses: Bool = true
    var requireTimer: Bool = false

    // MARK: - Initialization

    init(modelContext: ModelContext, currentUserId: UUID) {
        self.modelContext = modelContext
        self.currentUserId = currentUserId
    }

    // MARK: - Data Loading

    func loadUserData() async {
        isLoading = true
        error = nil

        do {
            let userDescriptor = FetchDescriptor<User>(
                predicate: #Predicate { user in
                    user.id == currentUserId
                }
            )

            let users = try modelContext.fetch(userDescriptor)
            if let fetchedUser = users.first {
                user = fetchedUser
                userName = fetchedUser.name
                userEmail = fetchedUser.email

                // Load couple data
                if let fetchedCouple = fetchedUser.couple {
                    couple = fetchedCouple
                    relationshipStartDate = fetchedCouple.relationshipStartDate

                    // Get partner name from couple (simplified - would need more logic for real partner)
                    partnerName = "Partner" // Placeholder
                }
            }
        } catch {
            self.error = error
        }

        isLoading = false
    }

    // MARK: - Save Operations

    func saveProfile() throws {
        guard let user = user else { return }

        user.name = userName.trimmingCharacters(in: .whitespaces)
        user.email = userEmail.trimmingCharacters(in: .whitespaces)

        if let couple = couple {
            couple.relationshipStartDate = relationshipStartDate
        }

        try modelContext.save()
    }

    func saveSessionRules() {
        // Save to UserDefaults
        UserDefaults.standard.set(sessionDuration, forKey: "sessionDuration")
        UserDefaults.standard.set(allowPauses, forKey: "allowPauses")
        UserDefaults.standard.set(requireTimer, forKey: "requireTimer")
    }

    func loadSessionRules() {
        sessionDuration = UserDefaults.standard.integer(forKey: "sessionDuration")
        if sessionDuration == 0 { sessionDuration = 30 } // Default

        allowPauses = UserDefaults.standard.bool(forKey: "allowPauses")
        requireTimer = UserDefaults.standard.bool(forKey: "requireTimer")
    }
}
