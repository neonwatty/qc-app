//
//  PreviewContainer.swift
//  QualityControl
//
//  Created by Jeremy Watt on 10/15/25.
//

import Foundation
import SwiftData

/// Helper to create preview containers with sample data for SwiftUI previews
@MainActor
class PreviewContainer {

    static func create() -> ModelContainer {
        let schema = Schema([
            User.self,
            Couple.self,
            CheckInSession.self,
            Category.self,
            Note.self,
            ActionItem.self,
            Reminder.self,
            Milestone.self,
            LoveLanguage.self,
            RelationshipRequest.self
        ])

        let configuration = ModelConfiguration(isStoredInMemoryOnly: true)

        do {
            let container = try ModelContainer(for: schema, configurations: configuration)

            // Populate with demo data
            let context = container.mainContext

            // Create demo couple
            let (couple, users) = MockDataGenerator.createDemoCouple()
            context.insert(couple)
            users.forEach { context.insert($0) }

            // Create categories
            let categories = MockDataGenerator.createDefaultCategories()
            categories.forEach { context.insert($0) }

            // Create check-in sessions
            let sessions = MockDataGenerator.createSampleCheckInSessions(for: couple.id, count: 3)
            sessions.forEach { context.insert($0) }

            // Create notes for first user
            if let firstUser = users.first, let firstSession = sessions.first {
                let notes = MockDataGenerator.createSampleNotes(
                    for: firstUser.id,
                    checkInId: firstSession.id,
                    count: 2
                )
                notes.forEach { context.insert($0) }
            }

            // Create milestones
            let milestones = MockDataGenerator.createSampleMilestones(for: couple.id)
            milestones.forEach { context.insert($0) }

            // Create love languages for first user
            if let firstUser = users.first {
                let loveLanguages = MockDataGenerator.createSampleLoveLanguages(for: firstUser.id)
                loveLanguages.forEach { context.insert($0) }
            }

            try context.save()

            return container
        } catch {
            fatalError("Failed to create preview container: \(error)")
        }
    }
}
