//
//  QualityControlApp.swift
//  QualityControl
//
//  Created by Jeremy Watt on 10/15/25.
//

import SwiftUI
import SwiftData

@main
struct QualityControlApp: App {
    var sharedModelContainer: ModelContainer = {
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
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)

        do {
            let container = try ModelContainer(for: schema, configurations: [modelConfiguration])

            // Generate demo data on first launch
            Task { @MainActor in
                await initializeDemoData(container: container)
            }

            return container
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            MainTabView()
        }
        .modelContainer(sharedModelContainer)
    }

    // MARK: - Demo Data Initialization

    @MainActor
    private static func initializeDemoData(container: ModelContainer) async {
        let context = container.mainContext

        // Check if data already exists
        let coupleDescriptor = FetchDescriptor<Couple>()
        if let existingCouples = try? context.fetch(coupleDescriptor), !existingCouples.isEmpty {
            return // Data already exists
        }

        // Create demo data
        let (couple, users) = MockDataGenerator.createDemoCouple()
        context.insert(couple)
        users.forEach { context.insert($0) }

        // Add categories
        let categories = MockDataGenerator.createDefaultCategories()
        categories.forEach { context.insert($0) }

        // Add sample check-in sessions
        let sessions = MockDataGenerator.createSampleCheckInSessions(for: couple.id, count: 5)
        sessions.forEach { context.insert($0) }

        // Add sample notes
        if let firstUser = users.first, let firstSession = sessions.first {
            let notes = MockDataGenerator.createSampleNotes(for: firstUser.id, checkInId: firstSession.id, count: 3)
            notes.forEach { context.insert($0) }
        }

        // Add sample milestones
        let milestones = MockDataGenerator.createSampleMilestones(for: couple.id)
        milestones.forEach {
            $0.isAchieved = true
            $0.achievedAt = Date().addingTimeInterval(-86400 * Double.random(in: 1...30))
            context.insert($0)
        }

        // Save all demo data
        try? context.save()

        print("✅ Demo data initialized successfully")
    }
}
