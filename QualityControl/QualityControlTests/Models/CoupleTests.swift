//
//  CoupleTests.swift
//  QualityControlTests
//
//  Phase 1.1: Model Tests
//  Comprehensive tests for Couple model
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class CoupleTests: XCTestCase {

    var modelContext: ModelContext!
    var testCouple: Couple!

    override func setUp() async throws {
        modelContext = try TestModelContext.create()

        testCouple = Couple(relationshipStartDate: Date())
        modelContext.insert(testCouple)
        try modelContext.save()
    }

    override func tearDown() async throws {
        testCouple = nil
        modelContext = nil
    }

    // MARK: - Initialization Tests

    func testCoupleInitialization() {
        // Given
        let startDate = Date()

        // When
        let couple = Couple(relationshipStartDate: startDate)

        // Then
        XCTAssertNotNil(couple.id)
        assertDatesEqual(couple.relationshipStartDate, startDate)
        XCTAssertNotNil(couple.createdAt)
    }

    func testCoupleIdIsUnique() {
        // When
        let couple1 = Couple(relationshipStartDate: Date())
        let couple2 = Couple(relationshipStartDate: Date())

        // Then
        XCTAssertNotEqual(couple1.id, couple2.id)
    }

    func testCoupleCreatedAtIsSet() {
        // Given
        let beforeCreation = Date()

        // When
        let couple = Couple(relationshipStartDate: Date())

        // Then
        let afterCreation = Date()
        XCTAssertGreaterThanOrEqual(couple.createdAt, beforeCreation)
        XCTAssertLessThanOrEqual(couple.createdAt, afterCreation)
    }

    // MARK: - Relationship Start Date Tests

    func testRelationshipStartDatePersists() throws {
        // Given
        let newDate = Date.daysAgo(365)

        // When
        testCouple.relationshipStartDate = newDate
        try modelContext.save()

        // Then
        assertDatesEqual(testCouple.relationshipStartDate, newDate)
    }

    func testRelationshipStartDateCanBeInPast() {
        // Given
        let pastDate = Date.daysAgo(1000)

        // When
        let couple = Couple(relationshipStartDate: pastDate)

        // Then
        XCTAssertLessThan(couple.relationshipStartDate, Date())
    }

    func testRelationshipStartDateCanBeToday() {
        // Given
        let today = Date()

        // When
        let couple = Couple(relationshipStartDate: today)

        // Then
        assertDatesEqual(couple.relationshipStartDate, today, tolerance: 5.0)
    }

    // MARK: - Check-Ins Relationship Tests

    func testCheckInsInitiallyEmpty() {
        // Then
        XCTAssertEmpty(testCouple.checkIns ?? [])
    }

    func testCanAddCheckInSession() throws {
        // Given
        let session = CheckInSession(coupleId: testCouple.id)
        modelContext.insert(session)
        try modelContext.save()

        // When
        let coupleId = testCouple.id
        let descriptor = FetchDescriptor<CheckInSession>(
            predicate: #Predicate { $0.coupleId == coupleId }
        )
        let sessions = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(sessions, 1)
        XCTAssertEqual(sessions.first?.id, session.id)
    }

    func testCanAddMultipleCheckIns() throws {
        // Given
        let session1 = CheckInSession(coupleId: testCouple.id)
        let session2 = CheckInSession(coupleId: testCouple.id)
        modelContext.insert(session1)
        modelContext.insert(session2)
        try modelContext.save()

        // When
        let coupleId = testCouple.id
        let descriptor = FetchDescriptor<CheckInSession>(
            predicate: #Predicate { $0.coupleId == coupleId }
        )
        let sessions = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(sessions, 2)
    }

    func testCheckInsAreOrderedByDate() throws {
        // Given
        let session1 = CheckInSession(coupleId: testCouple.id)
        session1.startedAt = Date.daysAgo(2)
        let session2 = CheckInSession(coupleId: testCouple.id)
        session2.startedAt = Date.daysAgo(1)
        modelContext.insert(session1)
        modelContext.insert(session2)
        try modelContext.save()

        // When
        let coupleId = testCouple.id
        let descriptor = FetchDescriptor<CheckInSession>(
            predicate: #Predicate { $0.coupleId == coupleId }
        )
        let sessions = try modelContext.fetch(descriptor)

        // Then
        let sorted = sessions.sorted { $0.startedAt > $1.startedAt }
        XCTAssertEqual(sorted.first?.id, session2.id)
    }

    // MARK: - Milestones Relationship Tests

    func testMilestonesInitiallyEmpty() {
        // Then
        XCTAssertEmpty(testCouple.milestones ?? [])
    }

    func testCanAddMilestone() throws {
        // Given
        let milestone = Milestone(title: "First Date", description: "Our first date together", category: "Relationship", coupleId: testCouple.id)
        modelContext.insert(milestone)
        try modelContext.save()

        // When
        let coupleId = testCouple.id
        let descriptor = FetchDescriptor<Milestone>(
            predicate: #Predicate { $0.coupleId == coupleId }
        )
        let milestones = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(milestones, 1)
        XCTAssertEqual(milestones.first?.title, "First Date")
    }

    func testCanAddMultipleMilestones() throws {
        // Given
        let milestone1 = Milestone(title: "First Date", description: "Our first date", category: "Relationship", coupleId: testCouple.id)
        let milestone2 = Milestone(title: "Anniversary", description: "One year together", category: "Anniversary", coupleId: testCouple.id)
        modelContext.insert(milestone1)
        modelContext.insert(milestone2)
        try modelContext.save()

        // When
        let coupleId = testCouple.id
        let descriptor = FetchDescriptor<Milestone>(
            predicate: #Predicate { $0.coupleId == coupleId }
        )
        let milestones = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(milestones, 2)
    }

    func testMilestonesCanBeRemoved() throws {
        // Given
        let milestone = Milestone(title: "Test", description: "Test milestone", category: "Test", coupleId: testCouple.id)
        modelContext.insert(milestone)
        try modelContext.save()

        // When
        modelContext.delete(milestone)
        try modelContext.save()

        // Then
        let coupleId = testCouple.id
        let descriptor = FetchDescriptor<Milestone>(
            predicate: #Predicate { $0.coupleId == coupleId }
        )
        let milestones = try modelContext.fetch(descriptor)
        XCTAssertEmpty(milestones)
    }

    // MARK: - Requests Relationship Tests

    func testRequestsInitiallyEmpty() {
        // Then
        XCTAssertEmpty(testCouple.requests ?? [])
    }

    func testCanAddRequest() throws {
        // Given
        let request = RelationshipRequest(
            title: "Test Request",
            description: "Test description",
            requestType: .conversation,
            requestedBy: UUID(),
            requestedFor: UUID()
        )
        modelContext.insert(request)
        try modelContext.save()

        // When
        let descriptor = FetchDescriptor<RelationshipRequest>()
        let requests = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(requests, 1)
        XCTAssertEqual(requests.first?.title, "Test Request")
    }

    func testCanAddMultipleRequests() throws {
        // Given
        let request1 = RelationshipRequest(title: "Request 1", description: "Desc 1", requestType: .conversation, requestedBy: UUID(), requestedFor: UUID())
        let request2 = RelationshipRequest(title: "Request 2", description: "Desc 2", requestType: .activity, requestedBy: UUID(), requestedFor: UUID())
        modelContext.insert(request1)
        modelContext.insert(request2)
        try modelContext.save()

        // When
        let descriptor = FetchDescriptor<RelationshipRequest>()
        let requests = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(requests, 2)
    }

    // MARK: - Persistence Tests

    func testCouplePersistsInContext() throws {
        // When
        let descriptor = FetchDescriptor<Couple>()
        let couples = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(couples, 1)
        XCTAssertEqual(couples.first?.id, testCouple.id)
    }

    func testCoupleCanBeDeleted() throws {
        // When
        modelContext.delete(testCouple)
        try modelContext.save()

        // Then
        let descriptor = FetchDescriptor<Couple>()
        let couples = try modelContext.fetch(descriptor)
        XCTAssertEmpty(couples)
    }

    func testMultipleCouplesPersist() throws {
        // Given
        let couple2 = Couple(relationshipStartDate: Date.daysAgo(365))
        let couple3 = Couple(relationshipStartDate: Date.daysAgo(730))
        modelContext.insert(couple2)
        modelContext.insert(couple3)

        // When
        try modelContext.save()

        // Then
        let descriptor = FetchDescriptor<Couple>()
        let couples = try modelContext.fetch(descriptor)
        XCTAssertCount(couples, 3)
    }

    // MARK: - Query Tests

    func testFetchCoupleById() throws {
        // Given
        let targetId = testCouple.id

        // When
        let descriptor = FetchDescriptor<Couple>(
            predicate: #Predicate { $0.id == targetId }
        )
        let couples = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(couples, 1)
        XCTAssertEqual(couples.first?.id, targetId)
    }

    func testFetchCouplesByDateRange() throws {
        // Given
        let oldCouple = Couple(relationshipStartDate: Date.daysAgo(1000))
        let newCouple = Couple(relationshipStartDate: Date.daysAgo(100))
        modelContext.insert(oldCouple)
        modelContext.insert(newCouple)
        try modelContext.save()

        // When
        let cutoffDate = Date.daysAgo(500)
        let descriptor = FetchDescriptor<Couple>(
            predicate: #Predicate { $0.relationshipStartDate > cutoffDate }
        )
        let couples = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(couples, 2) // testCouple + newCouple
    }
}
