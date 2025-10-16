//
//  Reminder.swift
//  QualityControl
//
//  Created by Jeremy Watt on 10/15/25.
//

import Foundation
import SwiftData

@Model
final class Reminder {
    @Attribute(.unique) var id: UUID
    var title: String
    var message: String
    var category: ReminderCategory
    var frequency: ReminderFrequency
    var scheduledFor: Date
    var isActive: Bool
    var isSnoozed: Bool
    var snoozeUntil: Date?
    var completedAt: Date?
    var userId: UUID
    var createdAt: Date

    init(id: UUID = UUID(), title: String, message: String, category: ReminderCategory, frequency: ReminderFrequency, scheduledFor: Date, userId: UUID) {
        self.id = id
        self.title = title
        self.message = message
        self.category = category
        self.frequency = frequency
        self.scheduledFor = scheduledFor
        self.isActive = true
        self.isSnoozed = false
        self.userId = userId
        self.createdAt = Date()
    }
}

enum ReminderCategory: String, Codable {
    case checkIn
    case habit
    case actionItem
    case partnerMoment
    case specialOccasion
}

enum ReminderFrequency: String, Codable {
    case once
    case daily
    case weekly
    case monthly
    case custom
}
