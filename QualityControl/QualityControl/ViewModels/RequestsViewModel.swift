//
//  RequestsViewModel.swift
//  QualityControl
//
//  Week 7: Requests System
//  State management for relationship requests
//

import Foundation
import SwiftData

@MainActor
@Observable
class RequestsViewModel {

    // MARK: - Properties

    private let modelContext: ModelContext
    private let currentUserId: UUID

    var receivedRequests: [RelationshipRequest] = []
    var sentRequests: [RelationshipRequest] = []
    var selectedTab: RequestTab = .received
    var isLoading: Bool = false
    var error: Error?

    // MARK: - Initialization

    init(modelContext: ModelContext, currentUserId: UUID) {
        self.modelContext = modelContext
        self.currentUserId = currentUserId
    }

    // MARK: - Data Loading

    func loadRequests() async {
        isLoading = true
        error = nil

        do {
            let descriptor = FetchDescriptor<RelationshipRequest>(
                sortBy: [SortDescriptor(\.createdAt, order: .reverse)]
            )

            let allRequests = try modelContext.fetch(descriptor)

            // Split into received and sent
            receivedRequests = allRequests.filter { $0.requestedFor == currentUserId }
            sentRequests = allRequests.filter { $0.requestedBy == currentUserId }
        } catch {
            self.error = error
        }

        isLoading = false
    }

    func refresh() async {
        await loadRequests()
    }

    // MARK: - CRUD Operations

    func createRequest(
        title: String,
        description: String,
        requestType: RequestType,
        requestedFor: UUID,
        priority: Priority = .medium,
        dueDate: Date? = nil,
        isRecurring: Bool = false,
        tags: [String] = []
    ) throws -> RelationshipRequest {
        let request = RelationshipRequest(
            title: title,
            description: description,
            requestType: requestType,
            requestedBy: currentUserId,
            requestedFor: requestedFor
        )
        request.priority = priority
        request.dueDate = dueDate
        request.isRecurring = isRecurring
        request.tags = tags

        modelContext.insert(request)
        try modelContext.save()

        // Add to appropriate list
        sentRequests.insert(request, at: 0)

        return request
    }

    func acceptRequest(_ request: RelationshipRequest, response: String? = nil) throws {
        request.status = .accepted
        request.response = response
        request.respondedAt = Date()

        try modelContext.save()
    }

    func declineRequest(_ request: RelationshipRequest, response: String? = nil) throws {
        request.status = .declined
        request.response = response
        request.respondedAt = Date()

        try modelContext.save()
    }

    func deleteRequest(_ request: RelationshipRequest) throws {
        modelContext.delete(request)
        try modelContext.save()

        receivedRequests.removeAll { $0.id == request.id }
        sentRequests.removeAll { $0.id == request.id }
    }

    // MARK: - Filtering

    var displayedRequests: [RelationshipRequest] {
        selectedTab == .received ? receivedRequests : sentRequests
    }

    var pendingReceivedCount: Int {
        receivedRequests.filter { $0.status == .pending }.count
    }

    var pendingSentCount: Int {
        sentRequests.filter { $0.status == .pending }.count
    }

    // MARK: - Statistics

    var totalReceived: Int {
        receivedRequests.count
    }

    var totalSent: Int {
        sentRequests.count
    }

    var acceptedCount: Int {
        receivedRequests.filter { $0.status == .accepted }.count
    }

    var declinedCount: Int {
        receivedRequests.filter { $0.status == .declined }.count
    }
}

// MARK: - Supporting Types

enum RequestTab: String, CaseIterable {
    case received = "Received"
    case sent = "Sent"

    var icon: String {
        switch self {
        case .received: return "tray.and.arrow.down.fill"
        case .sent: return "paperplane.fill"
        }
    }
}
