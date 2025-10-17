//
//  Couple.swift
//  QualityControl
//
//  Created by Jeremy Watt on 10/15/25.
//

import Foundation
import SwiftData

@Model
final class Couple {
    @Attribute(.unique) var id: UUID
    var relationshipStartDate: Date
    var createdAt: Date

    @Relationship(deleteRule: .nullify) var users: [User]?
    @Relationship(deleteRule: .cascade) var checkIns: [CheckInSession]?
    @Relationship(deleteRule: .cascade) var milestones: [Milestone]?
    @Relationship(deleteRule: .cascade) var requests: [RelationshipRequest]?

    init(id: UUID = UUID(), relationshipStartDate: Date) {
        self.id = id
        self.relationshipStartDate = relationshipStartDate
        self.createdAt = Date()
    }
}
