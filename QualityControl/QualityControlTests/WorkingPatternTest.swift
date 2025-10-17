//
//  WorkingPatternTest.swift
//  QualityControlTests
//
//  Demonstrates the working pattern for SwiftData tests
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class WorkingPatternTest: XCTestCase {

    // Test 1: User model test
    func testUserCreation() throws {
        // Create context using shared helper (keeps container in scope!)
        let (container, context) = try TestModelContext.create()

        // Create and save user
        let user = User(name: "Test User", email: "test@test.com")
        context.insert(user)
        try context.save()

        // Fetch and verify
        let descriptor = FetchDescriptor<User>()
        let users = try context.fetch(descriptor)
        XCTAssertEqual(users.count, 1)
        XCTAssertEqual(users.first?.name, "Test User")
    }

    // Test 2: Couple model test
    func testCoupleCreation() throws {
        let (container, context) = try TestModelContext.create()

        let couple = Couple(relationshipStartDate: Date())
        context.insert(couple)
        try context.save()

        let descriptor = FetchDescriptor<Couple>()
        let couples = try context.fetch(descriptor)
        XCTAssertEqual(couples.count, 1)
    }

    // Test 3: Multiple models test
    func testMultipleModels() throws {
        let (container, context) = try TestModelContext.create()

        // Create user
        let user = User(name: "User 1", email: "user1@test.com")
        context.insert(user)

        // Create couple
        let couple = Couple(relationshipStartDate: Date())
        context.insert(couple)

        // Create check-in
        let checkIn = CheckInSession(coupleId: couple.id)
        context.insert(checkIn)

        // Save all
        try context.save()

        // Verify
        let userDescriptor = FetchDescriptor<User>()
        let users = try context.fetch(userDescriptor)
        XCTAssertEqual(users.count, 1)

        let coupleDescriptor = FetchDescriptor<Couple>()
        let couples = try context.fetch(coupleDescriptor)
        XCTAssertEqual(couples.count, 1)

        let checkInDescriptor = FetchDescriptor<CheckInSession>()
        let checkIns = try context.fetch(checkInDescriptor)
        XCTAssertEqual(checkIns.count, 1)
    }

    // Test 4: Multiple saves in one test
    func testMultipleSaves() throws {
        let (container, context) = try TestModelContext.create()

        // First save
        let user1 = User(name: "User 1", email: "user1@test.com")
        context.insert(user1)
        try context.save()

        // Second save
        let user2 = User(name: "User 2", email: "user2@test.com")
        context.insert(user2)
        try context.save()

        // Third save
        let user3 = User(name: "User 3", email: "user3@test.com")
        context.insert(user3)
        try context.save()

        // Verify all three
        let descriptor = FetchDescriptor<User>()
        let users = try context.fetch(descriptor)
        XCTAssertEqual(users.count, 3)
    }
}
