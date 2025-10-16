//
//  ActionItem.swift
//  QualityControl
//
//  Created by Jeremy Watt on 10/15/25.
//

import Foundation
import SwiftData

@Model
final class ActionItem {
    @Attribute(.unique) var id: UUID
    var title: String
    var itemDescription: String?
    var assignedTo: UUID?
    var dueDate: Date?
    var priority: Priority
    var completed: Bool
    var completedAt: Date?
    var checkInId: UUID
    var createdAt: Date

    init(id: UUID = UUID(), title: String, checkInId: UUID) {
        self.id = id
        self.title = title
        self.checkInId = checkInId
        self.priority = .medium
        self.completed = false
        self.createdAt = Date()
    }
}

enum Priority: String, Codable {
    case low
    case medium
    case high

    var color: String {
        switch self {
        case .low: return "gray"
        case .medium: return "yellow"
        case .high: return "red"
        }
    }
}
