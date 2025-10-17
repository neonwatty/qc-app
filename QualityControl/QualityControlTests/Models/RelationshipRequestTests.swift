//
//  RelationshipRequestTests.swift
//  QualityControlTests
//
//  Phase 1.1: Model Tests
//  Comprehensive tests for RelationshipRequest model
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class RelationshipRequestTests: XCTestCase {

    var modelContext: ModelContext!
    var modelContainer: ModelContainer!
    var testUser1: User!
    var testUser2: User!
    var testRequest: RelationshipRequest!

    override func setUp() async throws {
        (modelContainer, modelContext) = try TestModelContext.create()

        testUser1 = User(name: "User 1", email: "user1@example.com")
        testUser2 = User(name: "User 2", email: "user2@example.com")
        modelContext.insert(testUser1)
        modelContext.insert(testUser2)

        testRequest = RelationshipRequest(
            title: "Date Night Request",
            description: "Let's plan a date night this weekend",
            requestType: .dateNight,
            requestedBy: testUser1.id,
            requestedFor: testUser2.id
        )
        modelContext.insert(testRequest)

        try modelContext.save()
    }

    override func tearDown() async throws {
        testRequest = nil
        testUser1 = nil
        testUser2 = nil
        modelContext = nil
        modelContainer = nil
    }

    // MARK: - Initialization Tests

    func testRelationshipRequestInitialization() {
        // Given
        let title = "Can we talk about finances?"
        let description = "I'd like to discuss our budget planning"
        let requestType = RequestType.conversation
        let requestedBy = testUser1.id
        let requestedFor = testUser2.id

        // When
        let request = RelationshipRequest(
            title: title,
            description: description,
            requestType: requestType,
            requestedBy: requestedBy,
            requestedFor: requestedFor
        )

        // Then
        XCTAssertNotNil(request.id)
        XCTAssertEqual(request.title, title)
        XCTAssertEqual(request.requestDescription, description)
        XCTAssertEqual(request.requestType, requestType)
        XCTAssertEqual(request.requestedBy, requestedBy)
        XCTAssertEqual(request.requestedFor, requestedFor)
        XCTAssertEqual(request.priority, .medium) // Default
        XCTAssertEqual(request.status, .pending) // Default
        XCTAssertFalse(request.isRecurring) // Default
        XCTAssertNil(request.dueDate)
        XCTAssertNil(request.response)
        XCTAssertNil(request.respondedAt)
        XCTAssertEmpty(request.tags)
        XCTAssertNotNil(request.createdAt)
    }

    func testRelationshipRequestIdIsUnique() {
        // When
        let request1 = RelationshipRequest(title: "Request 1", description: "Desc 1", requestType: .conversation, requestedBy: testUser1.id, requestedFor: testUser2.id)
        let request2 = RelationshipRequest(title: "Request 2", description: "Desc 2", requestType: .conversation, requestedBy: testUser1.id, requestedFor: testUser2.id)

        // Then
        XCTAssertNotEqual(request1.id, request2.id)
    }

    func testRelationshipRequestCreatedAtIsSet() {
        // Given
        let beforeCreation = Date()

        // When
        let request = RelationshipRequest(title: "Test", description: "Test", requestType: .conversation, requestedBy: testUser1.id, requestedFor: testUser2.id)

        // Then
        let afterCreation = Date()
        XCTAssertGreaterThanOrEqual(request.createdAt, beforeCreation)
        XCTAssertLessThanOrEqual(request.createdAt, afterCreation)
    }

    // MARK: - Property Tests

    func testTitleUpdatePersists() throws {
        // Given
        let newTitle = "Updated Request Title"

        // When
        testRequest.title = newTitle
        try modelContext.save()

        // Then
        XCTAssertEqual(testRequest.title, newTitle)
    }

    func testDescriptionUpdatePersists() throws {
        // Given
        let newDescription = "Updated request description"

        // When
        testRequest.requestDescription = newDescription
        try modelContext.save()

        // Then
        XCTAssertEqual(testRequest.requestDescription, newDescription)
    }

    func testPriorityUpdatePersists() throws {
        // Given
        let newPriority = Priority.high

        // When
        testRequest.priority = newPriority
        try modelContext.save()

        // Then
        XCTAssertEqual(testRequest.priority, newPriority)
    }

    func testDueDateUpdatePersists() throws {
        // Given
        let dueDate = Date.daysFromNow(7)

        // When
        testRequest.dueDate = dueDate
        try modelContext.save()

        // Then
        assertDatesEqual(testRequest.dueDate!, dueDate)
    }

    func testIsRecurringUpdatePersists() throws {
        // When
        testRequest.isRecurring = true
        try modelContext.save()

        // Then
        XCTAssertTrue(testRequest.isRecurring)
    }

    // MARK: - Status Tests

    func testDefaultStatusIsPending() {
        // Then
        XCTAssertEqual(testRequest.status, .pending)
    }

    func testAcceptRequest() throws {
        // Given
        let response = "Yes, that sounds great!"
        let respondedTime = Date()

        // When
        testRequest.status = .accepted
        testRequest.response = response
        testRequest.respondedAt = respondedTime
        try modelContext.save()

        // Then
        XCTAssertEqual(testRequest.status, .accepted)
        XCTAssertEqual(testRequest.response, response)
        assertDatesEqual(testRequest.respondedAt!, respondedTime)
    }

    func testDeclineRequest() throws {
        // Given
        let response = "Sorry, I'm not available this weekend"
        let respondedTime = Date()

        // When
        testRequest.status = .declined
        testRequest.response = response
        testRequest.respondedAt = respondedTime
        try modelContext.save()

        // Then
        XCTAssertEqual(testRequest.status, .declined)
        XCTAssertEqual(testRequest.response, response)
        assertDatesEqual(testRequest.respondedAt!, respondedTime)
    }

    func testStatusColors() {
        // When/Then
        XCTAssertEqual(RequestStatus.pending.color, "orange")
        XCTAssertEqual(RequestStatus.accepted.color, "green")
        XCTAssertEqual(RequestStatus.declined.color, "red")
    }

    // MARK: - Response Tests

    func testResponseInitiallyNil() {
        // Then
        XCTAssertNil(testRequest.response)
        XCTAssertNil(testRequest.respondedAt)
    }

    func testCanAddResponse() throws {
        // Given
        let response = "Sure, let's do it!"
        let respondedTime = Date()

        // When
        testRequest.response = response
        testRequest.respondedAt = respondedTime
        try modelContext.save()

        // Then
        XCTAssertEqual(testRequest.response, response)
        assertDatesEqual(testRequest.respondedAt!, respondedTime)
    }

    func testCanUpdateResponse() throws {
        // Given
        testRequest.response = "Initial response"
        testRequest.respondedAt = Date()
        try modelContext.save()

        // When
        let newResponse = "Updated response"
        testRequest.response = newResponse
        try modelContext.save()

        // Then
        XCTAssertEqual(testRequest.response, newResponse)
    }

    func testCanClearResponse() throws {
        // Given
        testRequest.response = "Some response"
        testRequest.respondedAt = Date()
        try modelContext.save()

        // When
        testRequest.response = nil
        testRequest.respondedAt = nil
        try modelContext.save()

        // Then
        XCTAssertNil(testRequest.response)
        XCTAssertNil(testRequest.respondedAt)
    }

    // MARK: - Tags Tests

    func testTagsInitiallyEmpty() {
        // Then
        XCTAssertEmpty(testRequest.tags)
    }

    func testCanAddTag() throws {
        // Given
        let tag = "urgent"

        // When
        testRequest.tags.append(tag)
        try modelContext.save()

        // Then
        XCTAssertCount(testRequest.tags, 1)
        XCTAssertEqual(testRequest.tags.first, tag)
    }

    func testCanAddMultipleTags() throws {
        // Given
        let tags = ["urgent", "romantic", "weekend"]

        // When
        testRequest.tags.append(contentsOf: tags)
        try modelContext.save()

        // Then
        XCTAssertCount(testRequest.tags, 3)
        XCTAssertEqual(testRequest.tags, tags)
    }

    func testCanRemoveTag() throws {
        // Given
        testRequest.tags.append(contentsOf: ["tag1", "tag2"])
        try modelContext.save()

        // When
        testRequest.tags.removeFirst()
        try modelContext.save()

        // Then
        XCTAssertCount(testRequest.tags, 1)
    }

    // MARK: - Request Type Tests

    func testAllRequestTypes() {
        // When/Then
        let types: [RequestType] = [.conversation, .activity, .dateNight, .reminder]

        for type in types {
            let request = RelationshipRequest(
                title: "Test",
                description: "Test",
                requestType: type,
                requestedBy: testUser1.id,
                requestedFor: testUser2.id
            )
            XCTAssertEqual(request.requestType, type)
        }
    }

    func testRequestTypeUpdatePersists() throws {
        // When
        testRequest.requestType = .conversation
        try modelContext.save()

        // Then
        XCTAssertEqual(testRequest.requestType, .conversation)
    }

    // MARK: - Priority Tests

    func testAllPriorityLevels() {
        // When/Then
        let priorities: [Priority] = [.low, .medium, .high]

        for priority in priorities {
            testRequest.priority = priority
            XCTAssertEqual(testRequest.priority, priority)
        }
    }

    func testDefaultPriorityIsMedium() {
        // When
        let request = RelationshipRequest(title: "Test", description: "Test", requestType: .conversation, requestedBy: testUser1.id, requestedFor: testUser2.id)

        // Then
        XCTAssertEqual(request.priority, .medium)
    }

    // MARK: - Persistence Tests

    func testRelationshipRequestPersistsInContext() throws {
        // When
        let descriptor = FetchDescriptor<RelationshipRequest>()
        let requests = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(requests, 1)
        XCTAssertEqual(requests.first?.id, testRequest.id)
    }

    func testRelationshipRequestCanBeDeleted() throws {
        // When
        modelContext.delete(testRequest)
        try modelContext.save()

        // Then
        let descriptor = FetchDescriptor<RelationshipRequest>()
        let requests = try modelContext.fetch(descriptor)
        XCTAssertEmpty(requests)
    }

    func testMultipleRelationshipRequestsPersist() throws {
        // Given
        let request2 = RelationshipRequest(title: "Request 2", description: "Desc 2", requestType: .activity, requestedBy: testUser1.id, requestedFor: testUser2.id)
        let request3 = RelationshipRequest(title: "Request 3", description: "Desc 3", requestType: .conversation, requestedBy: testUser2.id, requestedFor: testUser1.id)
        modelContext.insert(request2)
        modelContext.insert(request3)

        // When
        try modelContext.save()

        // Then
        let descriptor = FetchDescriptor<RelationshipRequest>()
        let requests = try modelContext.fetch(descriptor)
        XCTAssertCount(requests, 3)
    }

    // MARK: - Query Tests

    func testFetchRelationshipRequestById() throws {
        // Given
        let targetId = testRequest.id

        // When
        let descriptor = FetchDescriptor<RelationshipRequest>(
            predicate: #Predicate { $0.id == targetId }
        )
        let requests = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(requests, 1)
        XCTAssertEqual(requests.first?.id, targetId)
    }

    func testFetchRequestsByRequestedBy() throws {
        // Given
        let request2 = RelationshipRequest(title: "Request 2", description: "Desc", requestType: .activity, requestedBy: testUser2.id, requestedFor: testUser1.id)
        modelContext.insert(request2)
        try modelContext.save()

        let targetUserId = testUser1.id

        // When
        let descriptor = FetchDescriptor<RelationshipRequest>(
            predicate: #Predicate { $0.requestedBy == targetUserId }
        )
        let requests = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(requests, 1)
        XCTAssertEqual(requests.first?.requestedBy, targetUserId)
    }

    func testFetchRequestsByRequestedFor() throws {
        // Given
        let request2 = RelationshipRequest(title: "Request 2", description: "Desc", requestType: .activity, requestedBy: testUser2.id, requestedFor: testUser1.id)
        modelContext.insert(request2)
        try modelContext.save()

        let targetUserId = testUser2.id

        // When
        let descriptor = FetchDescriptor<RelationshipRequest>(
            predicate: #Predicate { $0.requestedFor == targetUserId }
        )
        let requests = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(requests, 1)
        XCTAssertEqual(requests.first?.requestedFor, targetUserId)
    }

    func testFetchRequestsByStatus() throws {
        // Given
        testRequest.status = .accepted
        let pendingRequest = RelationshipRequest(title: "Pending", description: "Desc", requestType: .conversation, requestedBy: testUser1.id, requestedFor: testUser2.id)
        modelContext.insert(pendingRequest)
        try modelContext.save()

        let targetStatus: RequestStatus = .pending

        // When
        let descriptor = FetchDescriptor<RelationshipRequest>(
            predicate: #Predicate { $0.status == targetStatus }
        )
        let requests = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(requests, 1)
        XCTAssertEqual(requests.first?.status, .pending)
    }

    func testFetchRequestsByType() throws {
        // Given
        let conversationRequest = RelationshipRequest(title: "Conversation", description: "Desc", requestType: .conversation, requestedBy: testUser1.id, requestedFor: testUser2.id)
        let activityRequest = RelationshipRequest(title: "Activity", description: "Desc", requestType: .activity, requestedBy: testUser1.id, requestedFor: testUser2.id)
        modelContext.insert(conversationRequest)
        modelContext.insert(activityRequest)
        try modelContext.save()

        let targetType: RequestType = .dateNight

        // When
        let descriptor = FetchDescriptor<RelationshipRequest>(
            predicate: #Predicate { $0.requestType == targetType }
        )
        let requests = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(requests, 1)
        XCTAssertEqual(requests.first?.requestType, .dateNight)
    }

    func testFetchRequestsByPriority() throws {
        // Given
        testRequest.priority = .high
        let mediumRequest = RelationshipRequest(title: "Medium", description: "Desc", requestType: .conversation, requestedBy: testUser1.id, requestedFor: testUser2.id)
        mediumRequest.priority = .medium
        modelContext.insert(mediumRequest)
        try modelContext.save()

        let targetPriority: Priority = .high

        // When
        let descriptor = FetchDescriptor<RelationshipRequest>(
            predicate: #Predicate { $0.priority == targetPriority }
        )
        let requests = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(requests, 1)
        XCTAssertEqual(requests.first?.priority, .high)
    }
}
