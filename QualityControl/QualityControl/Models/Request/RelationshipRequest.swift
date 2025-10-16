//
//  RelationshipRequest.swift
//  QualityControl
//
//  Created by Jeremy Watt on 10/15/25.
//

import Foundation
import SwiftData

@Model
final class RelationshipRequest {
    @Attribute(.unique) var id: UUID
    var title: String
    var requestDescription: String
    var requestType: RequestType
    var priority: Priority
    var requestedBy: UUID
    var requestedFor: UUID
    var status: RequestStatus
    var dueDate: Date?
    var isRecurring: Bool
    var response: String?
    var respondedAt: Date?
    var tags: [String]
    var createdAt: Date

    init(id: UUID = UUID(), title: String, description: String, requestType: RequestType, requestedBy: UUID, requestedFor: UUID) {
        self.id = id
        self.title = title
        self.requestDescription = description
        self.requestType = requestType
        self.requestedBy = requestedBy
        self.requestedFor = requestedFor
        self.priority = .medium
        self.status = .pending
        self.isRecurring = false
        self.tags = []
        self.createdAt = Date()
    }
}

enum RequestType: String, Codable {
    case conversation
    case activity
    case dateNight
    case reminder
}

enum RequestStatus: String, Codable {
    case pending
    case accepted
    case declined

    var color: String {
        switch self {
        case .pending: return "orange"
        case .accepted: return "green"
        case .declined: return "red"
        }
    }
}
