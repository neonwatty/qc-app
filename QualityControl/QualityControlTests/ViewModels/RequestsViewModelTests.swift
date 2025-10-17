//
//  RequestsViewModelTests.swift
//  QualityControlTests
//
//  Phase 1.2: ViewModel Tests
//  Tests for RequestsViewModel
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class RequestsViewModelTests: XCTestCase {

    var modelContainer: ModelContainer!
    var modelContext: ModelContext!
    var viewModel: RequestsViewModel!
    var testUserId: UUID!
    var partnerUserId: UUID!

    override func setUp() async throws {
        // Use TestModelContext helper for consistent container management
        (modelContainer, modelContext) = try TestModelContext.create()

        // Create test users
        testUserId = UUID()
        partnerUserId = UUID()

        let user = User(id: testUserId, name: "Test User", email: "test@example.com")
        let partner = User(id: partnerUserId, name: "Partner User", email: "partner@example.com")
        modelContext.insert(user)
        modelContext.insert(partner)
        try modelContext.save()

        // Initialize view model
        viewModel = RequestsViewModel(modelContext: modelContext, currentUserId: testUserId)
    }

    override func tearDown() async throws {
        viewModel = nil
        partnerUserId = nil
        testUserId = nil
        modelContext = nil
        modelContainer = nil
    }

    // MARK: - Initialization Tests

    func testInitialization() {
        XCTAssertTrue(viewModel.receivedRequests.isEmpty)
        XCTAssertTrue(viewModel.sentRequests.isEmpty)
        XCTAssertEqual(viewModel.selectedTab, .received)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.error)
    }

    // MARK: - CRUD Operation Tests

    func testCreateRequest() throws {
        let title = "Movie Night"
        let description = "Let's watch a movie together"
        let requestType = RequestType.activity

        let request = try viewModel.createRequest(
            title: title,
            description: description,
            requestType: requestType,
            requestedFor: partnerUserId
        )

        XCTAssertEqual(request.title, title)
        XCTAssertEqual(request.requestDescription, description)
        XCTAssertEqual(request.requestType, requestType)
        XCTAssertEqual(request.requestedBy, testUserId)
        XCTAssertEqual(request.requestedFor, partnerUserId)
        XCTAssertEqual(request.status, .pending)
        XCTAssertEqual(viewModel.sentRequests.count, 1)
    }

    func testCreateRequestWithPriority() throws {
        let request = try viewModel.createRequest(
            title: "Important Talk",
            description: "We need to discuss something",
            requestType: .conversation,
            requestedFor: partnerUserId,
            priority: .high
        )

        XCTAssertEqual(request.priority, .high)
    }

    func testCreateRequestWithDueDate() throws {
        let dueDate = Date().addingTimeInterval(86400) // Tomorrow

        let request = try viewModel.createRequest(
            title: "Weekend Plans",
            description: "Let's plan the weekend",
            requestType: .activity,
            requestedFor: partnerUserId,
            dueDate: dueDate
        )

        XCTAssertNotNil(request.dueDate)
        if let requestDueDate = request.dueDate {
            XCTAssertEqual(requestDueDate.timeIntervalSince1970, dueDate.timeIntervalSince1970, accuracy: 1.0)
        } else {
            XCTFail("Due date is nil")
        }
    }

    func testCreateRequestWithRecurring() throws {
        let request = try viewModel.createRequest(
            title: "Weekly Date Night",
            description: "Regular date nights",
            requestType: .dateNight,
            requestedFor: partnerUserId,
            isRecurring: true
        )

        XCTAssertTrue(request.isRecurring)
    }

    func testCreateRequestWithTags() throws {
        let tags = ["quality time", "fun", "romantic"]

        let request = try viewModel.createRequest(
            title: "Date Night",
            description: "Special evening",
            requestType: .dateNight,
            requestedFor: partnerUserId,
            tags: tags
        )

        XCTAssertEqual(request.tags, tags)
    }

    func testAcceptRequest() throws {
        // Create request from partner to test user
        let request = RelationshipRequest(
            title: "Dinner Request",
            description: "Cook dinner together",
            requestType: .activity,
            requestedBy: partnerUserId,
            requestedFor: testUserId
        )
        modelContext.insert(request)
        try modelContext.save()

        let response = "Sounds great!"
        try viewModel.acceptRequest(request, response: response)

        XCTAssertEqual(request.status, .accepted)
        XCTAssertEqual(request.response, response)
        XCTAssertNotNil(request.respondedAt)
    }

    func testAcceptRequestWithoutResponse() throws {
        let request = RelationshipRequest(
            title: "Request",
            description: "Test",
            requestType: .activity,
            requestedBy: partnerUserId,
            requestedFor: testUserId
        )
        modelContext.insert(request)
        try modelContext.save()

        try viewModel.acceptRequest(request)

        XCTAssertEqual(request.status, .accepted)
        XCTAssertNil(request.response)
        XCTAssertNotNil(request.respondedAt)
    }

    func testDeclineRequest() throws {
        let request = RelationshipRequest(
            title: "Request",
            description: "Test",
            requestType: .activity,
            requestedBy: partnerUserId,
            requestedFor: testUserId
        )
        modelContext.insert(request)
        try modelContext.save()

        let response = "Maybe next time"
        try viewModel.declineRequest(request, response: response)

        XCTAssertEqual(request.status, .declined)
        XCTAssertEqual(request.response, response)
        XCTAssertNotNil(request.respondedAt)
    }

    func testDeclineRequestWithoutResponse() throws {
        let request = RelationshipRequest(
            title: "Request",
            description: "Test",
            requestType: .activity,
            requestedBy: partnerUserId,
            requestedFor: testUserId
        )
        modelContext.insert(request)
        try modelContext.save()

        try viewModel.declineRequest(request)

        XCTAssertEqual(request.status, .declined)
        XCTAssertNil(request.response)
        XCTAssertNotNil(request.respondedAt)
    }

    func testDeleteRequest() throws {
        let request = try viewModel.createRequest(
            title: "To Delete",
            description: "Test",
            requestType: .activity,
            requestedFor: partnerUserId
        )

        XCTAssertEqual(viewModel.sentRequests.count, 1)

        try viewModel.deleteRequest(request)

        XCTAssertEqual(viewModel.sentRequests.count, 0)
    }

    // MARK: - Data Loading Tests

    func testLoadRequests() async throws {
        // Create requests in both directions
        let received1 = RelationshipRequest(
            title: "Received 1",
            description: "Test",
            requestType: .activity,
            requestedBy: partnerUserId,
            requestedFor: testUserId
        )
        let sent1 = RelationshipRequest(
            title: "Sent 1",
            description: "Test",
            requestType: .conversation,
            requestedBy: testUserId,
            requestedFor: partnerUserId
        )
        modelContext.insert(received1)
        modelContext.insert(sent1)
        try modelContext.save()

        await viewModel.loadRequests()

        XCTAssertEqual(viewModel.receivedRequests.count, 1)
        XCTAssertEqual(viewModel.sentRequests.count, 1)
        XCTAssertEqual(viewModel.receivedRequests.first?.title, "Received 1")
        XCTAssertEqual(viewModel.sentRequests.first?.title, "Sent 1")
        XCTAssertFalse(viewModel.isLoading)
    }

    func testLoadRequestsFiltersByUser() async throws {
        let otherUserId = UUID()

        // Create requests for different users
        let myReceived = RelationshipRequest(
            title: "My Request",
            description: "For me",
            requestType: .activity,
            requestedBy: partnerUserId,
            requestedFor: testUserId
        )
        let otherReceived = RelationshipRequest(
            title: "Other Request",
            description: "For other",
            requestType: .activity,
            requestedBy: partnerUserId,
            requestedFor: otherUserId
        )
        modelContext.insert(myReceived)
        modelContext.insert(otherReceived)
        try modelContext.save()

        await viewModel.loadRequests()

        XCTAssertEqual(viewModel.receivedRequests.count, 1)
        XCTAssertEqual(viewModel.receivedRequests.first?.title, "My Request")
    }

    func testRefresh() async throws {
        // Create initial request
        let request1 = RelationshipRequest(
            title: "Request 1",
            description: "Test",
            requestType: .activity,
            requestedBy: partnerUserId,
            requestedFor: testUserId
        )
        modelContext.insert(request1)
        try modelContext.save()

        await viewModel.loadRequests()
        XCTAssertEqual(viewModel.receivedRequests.count, 1)

        // Add another request
        let request2 = RelationshipRequest(
            title: "Request 2",
            description: "Test",
            requestType: .conversation,
            requestedBy: partnerUserId,
            requestedFor: testUserId
        )
        modelContext.insert(request2)
        try modelContext.save()

        await viewModel.refresh()
        XCTAssertEqual(viewModel.receivedRequests.count, 2)
    }

    // MARK: - Tab Selection Tests

    func testDisplayedRequestsShowsReceived() async throws {
        let received = RelationshipRequest(
            title: "Received",
            description: "Test",
            requestType: .activity,
            requestedBy: partnerUserId,
            requestedFor: testUserId
        )
        let sent = RelationshipRequest(
            title: "Sent",
            description: "Test",
            requestType: .activity,
            requestedBy: testUserId,
            requestedFor: partnerUserId
        )
        modelContext.insert(received)
        modelContext.insert(sent)
        try modelContext.save()

        await viewModel.loadRequests()
        viewModel.selectedTab = .received

        XCTAssertEqual(viewModel.displayedRequests.count, 1)
        XCTAssertEqual(viewModel.displayedRequests.first?.title, "Received")
    }

    func testDisplayedRequestsShowsSent() async throws {
        let received = RelationshipRequest(
            title: "Received",
            description: "Test",
            requestType: .activity,
            requestedBy: partnerUserId,
            requestedFor: testUserId
        )
        let sent = RelationshipRequest(
            title: "Sent",
            description: "Test",
            requestType: .activity,
            requestedBy: testUserId,
            requestedFor: partnerUserId
        )
        modelContext.insert(received)
        modelContext.insert(sent)
        try modelContext.save()

        await viewModel.loadRequests()
        viewModel.selectedTab = .sent

        XCTAssertEqual(viewModel.displayedRequests.count, 1)
        XCTAssertEqual(viewModel.displayedRequests.first?.title, "Sent")
    }

    // MARK: - Statistics Tests

    func testTotalReceived() async throws {
        let request1 = RelationshipRequest(
            title: "R1",
            description: "Test",
            requestType: .activity,
            requestedBy: partnerUserId,
            requestedFor: testUserId
        )
        let request2 = RelationshipRequest(
            title: "R2",
            description: "Test",
            requestType: .conversation,
            requestedBy: partnerUserId,
            requestedFor: testUserId
        )
        modelContext.insert(request1)
        modelContext.insert(request2)
        try modelContext.save()

        await viewModel.loadRequests()

        XCTAssertEqual(viewModel.totalReceived, 2)
    }

    func testTotalSent() async throws {
        let request1 = RelationshipRequest(
            title: "S1",
            description: "Test",
            requestType: .activity,
            requestedBy: testUserId,
            requestedFor: partnerUserId
        )
        let request2 = RelationshipRequest(
            title: "S2",
            description: "Test",
            requestType: .conversation,
            requestedBy: testUserId,
            requestedFor: partnerUserId
        )
        modelContext.insert(request1)
        modelContext.insert(request2)
        try modelContext.save()

        await viewModel.loadRequests()

        XCTAssertEqual(viewModel.totalSent, 2)
    }

    func testAcceptedCount() async throws {
        let pending = RelationshipRequest(
            title: "Pending",
            description: "Test",
            requestType: .activity,
            requestedBy: partnerUserId,
            requestedFor: testUserId
        )
        let accepted = RelationshipRequest(
            title: "Accepted",
            description: "Test",
            requestType: .activity,
            requestedBy: partnerUserId,
            requestedFor: testUserId
        )
        accepted.status = .accepted

        modelContext.insert(pending)
        modelContext.insert(accepted)
        try modelContext.save()

        await viewModel.loadRequests()

        XCTAssertEqual(viewModel.acceptedCount, 1)
    }

    func testDeclinedCount() async throws {
        let pending = RelationshipRequest(
            title: "Pending",
            description: "Test",
            requestType: .activity,
            requestedBy: partnerUserId,
            requestedFor: testUserId
        )
        let declined = RelationshipRequest(
            title: "Declined",
            description: "Test",
            requestType: .activity,
            requestedBy: partnerUserId,
            requestedFor: testUserId
        )
        declined.status = .declined

        modelContext.insert(pending)
        modelContext.insert(declined)
        try modelContext.save()

        await viewModel.loadRequests()

        XCTAssertEqual(viewModel.declinedCount, 1)
    }

    func testPendingReceivedCount() async throws {
        let pending1 = RelationshipRequest(
            title: "Pending 1",
            description: "Test",
            requestType: .activity,
            requestedBy: partnerUserId,
            requestedFor: testUserId
        )
        let pending2 = RelationshipRequest(
            title: "Pending 2",
            description: "Test",
            requestType: .conversation,
            requestedBy: partnerUserId,
            requestedFor: testUserId
        )
        let accepted = RelationshipRequest(
            title: "Accepted",
            description: "Test",
            requestType: .activity,
            requestedBy: partnerUserId,
            requestedFor: testUserId
        )
        accepted.status = .accepted

        modelContext.insert(pending1)
        modelContext.insert(pending2)
        modelContext.insert(accepted)
        try modelContext.save()

        await viewModel.loadRequests()

        XCTAssertEqual(viewModel.pendingReceivedCount, 2)
    }

    func testPendingSentCount() async throws {
        let pending1 = RelationshipRequest(
            title: "Pending 1",
            description: "Test",
            requestType: .activity,
            requestedBy: testUserId,
            requestedFor: partnerUserId
        )
        let pending2 = RelationshipRequest(
            title: "Pending 2",
            description: "Test",
            requestType: .conversation,
            requestedBy: testUserId,
            requestedFor: partnerUserId
        )
        let declined = RelationshipRequest(
            title: "Declined",
            description: "Test",
            requestType: .activity,
            requestedBy: testUserId,
            requestedFor: partnerUserId
        )
        declined.status = .declined

        modelContext.insert(pending1)
        modelContext.insert(pending2)
        modelContext.insert(declined)
        try modelContext.save()

        await viewModel.loadRequests()

        XCTAssertEqual(viewModel.pendingSentCount, 2)
    }

    // MARK: - Request Type Tests

    func testCreateConversationRequest() throws {
        let request = try viewModel.createRequest(
            title: "Let's Talk",
            description: "We need to talk",
            requestType: .conversation,
            requestedFor: partnerUserId
        )

        XCTAssertEqual(request.requestType, .conversation)
    }

    func testCreateActivityRequest() throws {
        let request = try viewModel.createRequest(
            title: "Go Hiking",
            description: "Weekend hike",
            requestType: .activity,
            requestedFor: partnerUserId
        )

        XCTAssertEqual(request.requestType, .activity)
    }

    func testCreateDateNightRequest() throws {
        let request = try viewModel.createRequest(
            title: "Fancy Dinner",
            description: "Special date night",
            requestType: .dateNight,
            requestedFor: partnerUserId
        )

        XCTAssertEqual(request.requestType, .dateNight)
    }

    func testCreateReminderRequest() throws {
        let request = try viewModel.createRequest(
            title: "Don't Forget",
            description: "Remember to...",
            requestType: .reminder,
            requestedFor: partnerUserId
        )

        XCTAssertEqual(request.requestType, .reminder)
    }
}
