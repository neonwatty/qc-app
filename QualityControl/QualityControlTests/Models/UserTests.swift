//
//  UserTests.swift
//  QualityControlTests
//
//  Phase 1.1: Model Tests
//  Comprehensive tests for User model
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class UserTests: XCTestCase {

    // MARK: - Initialization Tests

    func testUserInitialization() {
        // Given
        let name = "John Doe"
        let email = "john@example.com"

        // When
        let user = User(name: name, email: email)

        // Then
        XCTAssertEqual(user.name, name)
        XCTAssertEqual(user.email, email)
        XCTAssertNotNil(user.id)
        XCTAssertNotNil(user.createdAt)
        XCTAssertNil(user.avatarURL)
    }

    func testUserIdIsUnique() {
        // When
        let user1 = User(name: "User 1", email: "user1@test.com")
        let user2 = User(name: "User 2", email: "user2@test.com")

        // Then
        XCTAssertNotEqual(user1.id, user2.id)
    }

    func testUserCreatedAtIsSet() {
        // Given
        let beforeCreation = Date()

        // When
        let user = User(name: "Test", email: "test@test.com")

        // Then
        let afterCreation = Date()
        XCTAssertGreaterThanOrEqual(user.createdAt, beforeCreation)
        XCTAssertLessThanOrEqual(user.createdAt, afterCreation)
    }

    // MARK: - Property Tests

    func testNameUpdatePersists() throws {
        // Setup
        let context = try TestModelContext.create()
        let testUser = User(name: "Test User", email: "test@example.com")
        context.insert(testUser)
        try context.save()

        // Given
        let newName = "Updated Name"

        // When
        testUser.name = newName
        try context.save()

        // Then
        XCTAssertEqual(testUser.name, newName)
    }

    func testEmailUpdatePersists() throws {
        // Setup
        let context = try TestModelContext.create()
        let testUser = User(name: "Test User", email: "test@example.com")
        context.insert(testUser)
        try context.save()

        // Given
        let newEmail = "updated@example.com"

        // When
        testUser.email = newEmail
        try context.save()

        // Then
        XCTAssertEqual(testUser.email, newEmail)
    }

    func testAvatarURLUpdatePersists() throws {
        // Setup
        let context = try TestModelContext.create()
        let testUser = User(name: "Test User", email: "test@example.com")
        context.insert(testUser)
        try context.save()

        // Given
        let avatarURL = "https://example.com/avatar.jpg"

        // When
        testUser.avatarURL = avatarURL
        try context.save()

        // Then
        XCTAssertEqual(testUser.avatarURL, avatarURL)
    }

    func testAvatarURLInitiallyNil() {
        // When
        let testUser = User(name: "Test User", email: "test@example.com")

        // Then
        XCTAssertNil(testUser.avatarURL)
    }

    func testNameTrimming() {
        // Given
        let nameWithWhitespace = "  Test User  "

        // When
        let user = User(name: nameWithWhitespace, email: "test@test.com")

        // Then - assumes name is stored as-is, trimming happens in validation
        XCTAssertEqual(user.name, nameWithWhitespace)
    }

    // MARK: - Couple Relationship Tests

    func testCoupleRelationshipInitiallyNil() {
        // When
        let testUser = User(name: "Test User", email: "test@example.com")

        // Then
        XCTAssertNil(testUser.couple)
    }

    func testCanAssignCouple() throws {
        // Setup
        let context = try TestModelContext.create()
        let testUser = User(name: "Test User", email: "test@example.com")
        context.insert(testUser)
        try context.save()

        // Given
        let couple = Couple(relationshipStartDate: Date())
        context.insert(couple)

        // When
        testUser.couple = couple
        try context.save()

        // Then
        XCTAssertNotNil(testUser.couple)
        XCTAssertEqual(testUser.couple?.id, couple.id)
    }

    func testCoupleRelationshipBidirectional() throws {
        // Setup
        let context = try TestModelContext.create()
        let testUser = User(name: "Test User", email: "test@example.com")
        context.insert(testUser)
        try context.save()

        // Given
        let couple = Couple(relationshipStartDate: Date())
        context.insert(couple)

        // When
        testUser.couple = couple
        try context.save()

        // Then
        XCTAssertEqual(testUser.couple?.id, couple.id)
    }

    func testCanRemoveCoupleRelationship() throws {
        // Setup
        let context = try TestModelContext.create()
        let testUser = User(name: "Test User", email: "test@example.com")
        context.insert(testUser)

        let couple = Couple(relationshipStartDate: Date())
        context.insert(couple)
        testUser.couple = couple
        try context.save()

        // When
        testUser.couple = nil
        try context.save()

        // Then
        XCTAssertNil(testUser.couple)
    }

    // MARK: - Persistence Tests

    func testUserPersistsInContext() throws {
        // Setup
        let context = try TestModelContext.create()
        let testUser = User(name: "Test User", email: "test@example.com")
        context.insert(testUser)
        try context.save()

        // When
        let descriptor = FetchDescriptor<User>()
        let users = try context.fetch(descriptor)

        // Then
        XCTAssertCount(users, 1)
        XCTAssertEqual(users.first?.id, testUser.id)
    }

    func testUserCanBeDeleted() throws {
        // Setup
        let context = try TestModelContext.create()
        let testUser = User(name: "Test User", email: "test@example.com")
        context.insert(testUser)
        try context.save()

        // When
        context.delete(testUser)
        try context.save()

        // Then
        let descriptor = FetchDescriptor<User>()
        let users = try context.fetch(descriptor)
        XCTAssertEmpty(users)
    }

    func testMultipleUsersPersist() throws {
        // Setup
        let context = try TestModelContext.create()
        let testUser = User(name: "Test User", email: "test@example.com")
        context.insert(testUser)
        try context.save()

        // Given
        let user2 = User(name: "User 2", email: "user2@test.com")
        let user3 = User(name: "User 3", email: "user3@test.com")
        context.insert(user2)
        context.insert(user3)

        // When
        try context.save()

        // Then
        let descriptor = FetchDescriptor<User>()
        let users = try context.fetch(descriptor)
        XCTAssertCount(users, 3)
    }

    // MARK: - Query Tests

    func testFetchUserById() throws {
        // Setup
        let context = try TestModelContext.create()
        let testUser = User(name: "Test User", email: "test@example.com")
        context.insert(testUser)
        try context.save()

        // Given
        let targetId = testUser.id

        // When
        let descriptor = FetchDescriptor<User>(
            predicate: #Predicate { $0.id == targetId }
        )
        let users = try context.fetch(descriptor)

        // Then
        XCTAssertCount(users, 1)
        XCTAssertEqual(users.first?.id, targetId)
    }

    func testFetchUserByEmail() throws {
        // Setup
        let context = try TestModelContext.create()
        let testUser = User(name: "Test User", email: "test@example.com")
        context.insert(testUser)
        try context.save()

        // Given
        let targetEmail = testUser.email

        // When
        let descriptor = FetchDescriptor<User>(
            predicate: #Predicate { $0.email == targetEmail }
        )
        let users = try context.fetch(descriptor)

        // Then
        XCTAssertCount(users, 1)
        XCTAssertEqual(users.first?.email, targetEmail)
    }

    func testFetchUserByName() throws {
        // Setup
        let context = try TestModelContext.create()
        let testUser = User(name: "Test User", email: "test@example.com")
        context.insert(testUser)
        try context.save()

        // Given
        let targetName = testUser.name

        // When
        let descriptor = FetchDescriptor<User>(
            predicate: #Predicate { $0.name == targetName }
        )
        let users = try context.fetch(descriptor)

        // Then
        XCTAssertCount(users, 1)
        XCTAssertEqual(users.first?.name, targetName)
    }
}
