//
//  Note.swift
//  QualityControl
//
//  Created by Jeremy Watt on 10/15/25.
//

import Foundation
import SwiftData

@Model
final class Note {
    @Attribute(.unique) var id: UUID
    var content: String
    var privacy: NotePrivacy
    var authorId: UUID
    var categoryId: UUID?
    var checkInId: UUID?
    var createdAt: Date
    var updatedAt: Date
    var tags: [String]

    @Relationship(deleteRule: .nullify, inverse: \CheckInSession.notes)
    var checkInSession: CheckInSession?

    init(id: UUID = UUID(), content: String, privacy: NotePrivacy, authorId: UUID) {
        self.id = id
        self.content = content
        self.privacy = privacy
        self.authorId = authorId
        self.createdAt = Date()
        self.updatedAt = Date()
        self.tags = []
    }
}

enum NotePrivacy: String, Codable {
    case `private`
    case shared
    case draft

    var icon: String {
        switch self {
        case .private: return "eye.slash.fill"
        case .shared: return "eye.fill"
        case .draft: return "doc.text.fill"
        }
    }

    var color: String {
        switch self {
        case .private: return "blue"
        case .shared: return "green"
        case .draft: return "orange"
        }
    }
}
