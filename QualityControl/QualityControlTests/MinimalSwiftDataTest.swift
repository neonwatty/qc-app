//
//  MinimalSwiftDataTest.swift
//  QualityControlTests
//
//  Minimal test to isolate SwiftData setUp crash
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class MinimalSwiftDataTest: XCTestCase {

    var modelContext: ModelContext!

    override func setUp() async throws {
        print("🔍 MinimalTest: Starting setUp")

        // Create schema with just User model
        print("🔍 MinimalTest: Creating schema")
        let schema = Schema([User.self])

        print("🔍 MinimalTest: Creating configuration with schema")
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)

        print("🔍 MinimalTest: Creating ModelContainer")
        let container = try ModelContainer(for: schema, configurations: [configuration])

        print("🔍 MinimalTest: Accessing mainContext")
        modelContext = container.mainContext

        print("🔍 MinimalTest: Creating test user")
        let testUser = User(name: "Test", email: "test@test.com")

        print("🔍 MinimalTest: Inserting user into context")
        modelContext.insert(testUser)

        print("🔍 MinimalTest: Saving context")
        try modelContext.save()

        print("✅ MinimalTest: setUp completed successfully")
    }

    override func tearDown() async throws {
        print("🔍 MinimalTest: tearDown started")
        modelContext = nil
        print("✅ MinimalTest: tearDown completed")
    }

    func testSimpleUserCreation() {
        print("🔍 MinimalTest: Running testSimpleUserCreation")

        // Create a user
        let user = User(name: "John", email: "john@test.com")

        // Verify properties
        XCTAssertEqual(user.name, "John")
        XCTAssertEqual(user.email, "john@test.com")
        XCTAssertNotNil(user.id)

        print("✅ MinimalTest: testSimpleUserCreation passed")
    }

    func testUserPersistence() throws {
        print("🔍 MinimalTest: Running testUserPersistence")

        // Insert another user
        let user2 = User(name: "Jane", email: "jane@test.com")
        modelContext.insert(user2)
        try modelContext.save()

        // Fetch all users
        let descriptor = FetchDescriptor<User>()
        let users = try modelContext.fetch(descriptor)

        // Should have 2 users (one from setUp, one from this test)
        XCTAssertEqual(users.count, 2)

        print("✅ MinimalTest: testUserPersistence passed")
    }
}
