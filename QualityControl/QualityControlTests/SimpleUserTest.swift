//
//  SimpleUserTest.swift
//  QualityControlTests
//
//  Test with FULLY INLINE context creation (no helper method)
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class SimpleUserTest: XCTestCase {

    func testUserWithInlineContext() throws {
        // Create context INLINE (no helper method)
        let schema = Schema([
            User.self,
            Couple.self,
            CheckInSession.self,
            Category.self,
            ActionItem.self,
            Note.self,
            Reminder.self,
            Milestone.self,
            LoveLanguage.self,
            RelationshipRequest.self
        ])
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        let container = try ModelContainer(for: schema, configurations: [configuration])
        let context = container.mainContext

        // Create and save user
        let user = User(name: "Test User", email: "test@test.com")
        context.insert(user)

        print("🔍 About to save...")
        try context.save()
        print("✅ Save successful!")

        // Fetch and verify
        let descriptor = FetchDescriptor<User>()
        let users = try context.fetch(descriptor)
        XCTAssertEqual(users.count, 1)
    }

    func testMultipleSavesInline() throws {
        // Create context INLINE
        let schema = Schema([
            User.self,
            Couple.self,
            CheckInSession.self,
            Category.self,
            ActionItem.self,
            Note.self,
            Reminder.self,
            Milestone.self,
            LoveLanguage.self,
            RelationshipRequest.self
        ])
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        let container = try ModelContainer(for: schema, configurations: [configuration])
        let context = container.mainContext

        // First save
        let user1 = User(name: "User 1", email: "user1@test.com")
        context.insert(user1)
        try context.save()

        // Second save
        let user2 = User(name: "User 2", email: "user2@test.com")
        context.insert(user2)
        try context.save()

        // Verify
        let descriptor = FetchDescriptor<User>()
        let users = try context.fetch(descriptor)
        XCTAssertEqual(users.count, 2)
    }
}
