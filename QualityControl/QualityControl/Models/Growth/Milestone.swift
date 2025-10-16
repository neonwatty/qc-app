//
//  Milestone.swift
//  QualityControl
//
//  Created by Jeremy Watt on 10/15/25.
//

import Foundation
import SwiftData

@Model
final class Milestone {
    @Attribute(.unique) var id: UUID
    var title: String
    var milestoneDescription: String
    var achievedAt: Date?
    var targetDate: Date?
    var category: String
    var isAchieved: Bool
    var coupleId: UUID

    init(id: UUID = UUID(), title: String, description: String, category: String, coupleId: UUID) {
        self.id = id
        self.title = title
        self.milestoneDescription = description
        self.category = category
        self.isAchieved = false
        self.coupleId = coupleId
    }
}
