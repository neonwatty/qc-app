//
//  User.swift
//  QualityControl
//
//  Created by Jeremy Watt on 10/15/25.
//

import Foundation
import SwiftData

@Model
final class User {
    @Attribute(.unique) var id: UUID
    var name: String
    var email: String
    var createdAt: Date
    var avatarURL: String?

    @Relationship(deleteRule: .nullify, inverse: \Couple.users)
    var couple: Couple?

    @Relationship(deleteRule: .cascade) var notes: [Note]?
    @Relationship(deleteRule: .cascade) var reminders: [Reminder]?
    @Relationship(deleteRule: .cascade) var loveLanguages: [LoveLanguage]?

    init(id: UUID = UUID(), name: String, email: String) {
        self.id = id
        self.name = name
        self.email = email
        self.createdAt = Date()
    }
}
