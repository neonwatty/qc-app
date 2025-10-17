//
//  SetUpLifecycleTest.swift
//  QualityControlTests
//
//  Test different setUp/tearDown patterns to isolate the crash
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class SetUpLifecycleTest: XCTestCase {

    // Test A: Store container AND context as instance variables
    var containerA: ModelContainer!
    var contextA: ModelContext!

    // Test B: Store BOTH container and context (fixed pattern)
    var containerB: ModelContainer!
    var contextB: ModelContext!

    // Test A1: Classic setUp/tearDown with stored container + context
    func testWithStoredContainerAndContext() throws {
        print("🔍 Test A: setUp with stored container and context")

        let schema = Schema([User.self])
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        containerA = try ModelContainer(for: schema, configurations: [configuration])
        contextA = containerA.mainContext

        let user1 = User(name: "A1", email: "a1@test.com")
        contextA.insert(user1)

        print("🔍 Test A: First save")
        try contextA.save()
        print("✅ Test A: First save successful")

        let user2 = User(name: "A2", email: "a2@test.com")
        contextA.insert(user2)

        print("🔍 Test A: Second save")
        try contextA.save()
        print("✅ Test A: Second save successful")

        // Cleanup
        containerA = nil
        contextA = nil
    }

    // Test B: setUp/tearDown pattern - FIXED to keep container in scope
    func testMatchingMinimalPattern() throws {
        print("🔍 Test B: Matching MinimalSwiftDataTest pattern - first test (FIXED)")

        let schema = Schema([User.self])
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        containerB = try ModelContainer(for: schema, configurations: [configuration])
        contextB = containerB.mainContext

        let user1 = User(name: "B1", email: "b1@test.com")
        contextB.insert(user1)

        print("🔍 Test B: Save in first test")
        try contextB.save()
        print("✅ Test B: Save successful in first test")

        // Cleanup
        containerB = nil
        contextB = nil
    }

    // Test C: Second test to check if multiple tests with same pattern work - FIXED
    func testMatchingMinimalPattern2() throws {
        print("🔍 Test C: Matching MinimalSwiftDataTest pattern - second test (FIXED)")

        let schema = Schema([User.self])
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        containerB = try ModelContainer(for: schema, configurations: [configuration])
        contextB = containerB.mainContext

        let user1 = User(name: "C1", email: "c1@test.com")
        contextB.insert(user1)

        print("🔍 Test C: Save in second test")
        try contextB.save()
        print("✅ Test C: Save successful in second test")

        // Cleanup
        containerB = nil
        contextB = nil
    }

    // Test D: Using setUp() method - FIXED to keep container in scope
    var containerD: ModelContainer!
    var contextD: ModelContext!

    override func setUp() async throws {
        print("🔍 Test D: setUp called (FIXED)")

        let schema = Schema([User.self])
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        containerD = try ModelContainer(for: schema, configurations: [configuration])
        contextD = containerD.mainContext

        let setupUser = User(name: "Setup", email: "setup@test.com")
        contextD.insert(setupUser)

        print("🔍 Test D: Saving in setUp")
        try contextD.save()
        print("✅ Test D: setUp save successful")
    }

    override func tearDown() async throws {
        print("🔍 Test D: tearDown called")
        containerD = nil
        contextD = nil
        print("✅ Test D: tearDown complete")
    }

    func testWithSetUp1() throws {
        print("🔍 Test D1: First test with setUp")
        let user = User(name: "D1", email: "d1@test.com")
        contextD.insert(user)
        try contextD.save()
        print("✅ Test D1: Save successful")
    }

    func testWithSetUp2() throws {
        print("🔍 Test D2: Second test with setUp")
        let user = User(name: "D2", email: "d2@test.com")
        contextD.insert(user)
        try contextD.save()
        print("✅ Test D2: Save successful")
    }
}
