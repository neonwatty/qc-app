//
//  SchemaTest.swift
//  QualityControlTests
//
//  Test if issue is with schema size/relationships
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class SchemaTest: XCTestCase {

    // Test 1: Single model schema (User only)
    func testSingleModelSchema() throws {
        print("🔍 Test 1: Single model schema")

        let schema = Schema([User.self])
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        let container = try ModelContainer(for: schema, configurations: [configuration])
        let context = container.mainContext

        let user = User(name: "Test", email: "test@test.com")
        context.insert(user)

        print("🔍 Test 1: Saving...")
        try context.save()
        print("✅ Test 1: Save successful")

        XCTAssertNotNil(user.id)
    }

    // Test 2: Two models with NO relationship
    func testTwoModelsNoRelationship() throws {
        print("🔍 Test 2: Two models (User + Category - no relationship)")

        let schema = Schema([User.self, Category.self])
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        let container = try ModelContainer(for: schema, configurations: [configuration])
        let context = container.mainContext

        let user = User(name: "Test", email: "test@test.com")
        let category = Category(name: "Test Cat", description: "Test", icon: "heart")
        context.insert(user)
        context.insert(category)

        print("🔍 Test 2: Saving...")
        try context.save()
        print("✅ Test 2: Save successful")

        XCTAssertNotNil(user.id)
        XCTAssertNotNil(category.id)
    }

    // Test 3: Two models WITH bidirectional relationship (User + Couple)
    func testTwoModelsWithRelationship() throws {
        print("🔍 Test 3: Two models WITH relationship (User + Couple)")

        let schema = Schema([User.self, Couple.self])
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        let container = try ModelContainer(for: schema, configurations: [configuration])
        let context = container.mainContext

        let couple = Couple(relationshipStartDate: Date())
        context.insert(couple)

        print("🔍 Test 3: Saving...")
        try context.save()
        print("✅ Test 3: Save successful")

        XCTAssertNotNil(couple.id)
    }

    // Test 4: All 10 models
    func testFullSchema() throws {
        print("🔍 Test 4: Full schema with all 10 models")

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

        let user = User(name: "Test", email: "test@test.com")
        context.insert(user)

        print("🔍 Test 4: Saving...")
        try context.save()
        print("✅ Test 4: Save successful")

        XCTAssertNotNil(user.id)
    }
}
