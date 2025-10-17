//
//  SetUpSaveTest.swift
//  QualityControlTests
//
//  Test if saving in setUp vs not saving makes a difference
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class SetUpSaveTest: XCTestCase {

    var contextWithSave: ModelContext!
    var contextWithoutSave: ModelContext!

    // Pattern 1: setUp creates context and DOES save
    func testSetUpWithSave() throws {
        print("🔍 Pattern 1 setUp: Creating context and saving")

        let schema = Schema([User.self])
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        let container = try ModelContainer(for: schema, configurations: [configuration])
        contextWithSave = container.mainContext

        let user = User(name: "Setup", email: "setup@test.com")
        contextWithSave.insert(user)

        print("🔍 Pattern 1 setUp: Saving...")
        try contextWithSave.save()
        print("✅ Pattern 1 setUp: Save successful")

        // Now in the test, try to save again
        print("🔍 Pattern 1 test: Inserting another user")
        let user2 = User(name: "Test", email: "test@test.com")
        contextWithSave.insert(user2)

        print("🔍 Pattern 1 test: Saving...")
        try contextWithSave.save()
        print("✅ Pattern 1 test: Save successful")

        contextWithSave = nil
    }

    // Pattern 2: setUp creates context but DOES NOT save
    func testSetUpWithoutSave() throws {
        print("🔍 Pattern 2 setUp: Creating context WITHOUT saving")

        let schema = Schema([User.self])
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        let container = try ModelContainer(for: schema, configurations: [configuration])
        contextWithoutSave = container.mainContext

        let user = User(name: "Setup", email: "setup@test.com")
        contextWithoutSave.insert(user)

        print("🔍 Pattern 2 setUp: NOT saving (user only inserted)")

        // Now in the test, try to save
        print("🔍 Pattern 2 test: Saving for first time...")
        try contextWithoutSave.save()
        print("✅ Pattern 2 test: First save successful")

        let user2 = User(name: "Test", email: "test@test.com")
        contextWithoutSave.insert(user2)

        print("🔍 Pattern 2 test: Saving second time...")
        try contextWithoutSave.save()
        print("✅ Pattern 2 test: Second save successful")

        contextWithoutSave = nil
    }

    // Pattern 3: Split across setUp/tearDown exactly like original tests
    var context3: ModelContext!

    override func setUp() async throws {
        print("🔍 Pattern 3: setUp override called")

        let schema = Schema([User.self])
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        let container = try ModelContainer(for: schema, configurations: [configuration])
        context3 = container.mainContext

        // DON'T save in setUp, just create context
        print("✅ Pattern 3: setUp complete (no save)")
    }

    override func tearDown() async throws {
        print("🔍 Pattern 3: tearDown called")
        context3 = nil
    }

    func testSetUpOverrideNoSave() throws {
        print("🔍 Pattern 3 test: First save in test method")
        let user = User(name: "Test1", email: "test1@test.com")
        context3.insert(user)

        try context3.save()
        print("✅ Pattern 3 test: Save successful")
    }
}
