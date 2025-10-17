//
//  DiagnosticSwiftDataTest.swift
//  QualityControlTests
//
//  Diagnostic test to isolate save() crash location
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class DiagnosticSwiftDataTest: XCTestCase {

    // Test 1: No setUp, create everything inline, no save
    func testCreateWithoutSave() throws {
        print("🔍 Test 1: Creating container without saving")

        let schema = Schema([User.self])
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        let container = try ModelContainer(for: schema, configurations: [configuration])
        let context = container.mainContext

        let user = User(name: "Test", email: "test@test.com")
        context.insert(user)

        print("✅ Test 1: Insert successful (no save attempted)")
        XCTAssertNotNil(user.id)
    }

    // Test 2: No setUp, create everything inline, WITH save
    func testCreateWithSave() throws {
        print("🔍 Test 2: Creating container and saving")

        let schema = Schema([User.self])
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        let container = try ModelContainer(for: schema, configurations: [configuration])
        let context = container.mainContext

        let user = User(name: "Test", email: "test@test.com")
        context.insert(user)

        print("🔍 Test 2: About to save context...")
        try context.save()
        print("✅ Test 2: Save successful!")

        XCTAssertNotNil(user.id)
    }

    // Test 3: Save TWICE in same test
    func testSaveTwice() throws {
        print("🔍 Test 3: Testing multiple saves")

        let schema = Schema([User.self])
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        let container = try ModelContainer(for: schema, configurations: [configuration])
        let context = container.mainContext

        let user1 = User(name: "User1", email: "user1@test.com")
        context.insert(user1)

        print("🔍 Test 3: First save...")
        try context.save()
        print("✅ Test 3: First save successful!")

        let user2 = User(name: "User2", email: "user2@test.com")
        context.insert(user2)

        print("🔍 Test 3: Second save...")
        try context.save()
        print("✅ Test 3: Second save successful!")

        let descriptor = FetchDescriptor<User>()
        let users = try context.fetch(descriptor)
        XCTAssertEqual(users.count, 2)
    }
}
