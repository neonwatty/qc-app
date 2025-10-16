//
//  LoveLanguage.swift
//  QualityControl
//
//  Created by Jeremy Watt on 10/15/25.
//

import Foundation
import SwiftData

@Model
final class LoveLanguage {
    @Attribute(.unique) var id: UUID
    var category: LoveLanguageCategory
    var title: String
    var languageDescription: String
    var examples: [String]
    var importance: Importance
    var privacy: NotePrivacy
    var tags: [String]
    var userId: UUID
    var createdAt: Date
    var updatedAt: Date

    init(id: UUID = UUID(), category: LoveLanguageCategory, title: String, description: String, userId: UUID) {
        self.id = id
        self.category = category
        self.title = title
        self.languageDescription = description
        self.examples = []
        self.importance = .medium
        self.privacy = .shared
        self.tags = []
        self.userId = userId
        self.createdAt = Date()
        self.updatedAt = Date()
    }
}

enum LoveLanguageCategory: String, Codable, CaseIterable {
    case words
    case time
    case gifts
    case touch
    case acts

    var icon: String {
        switch self {
        case .words: return "💬"
        case .time: return "⏰"
        case .gifts: return "🎁"
        case .touch: return "🤝"
        case .acts: return "✋"
        }
    }

    var displayName: String {
        switch self {
        case .words: return "Words of Affirmation"
        case .time: return "Quality Time"
        case .gifts: return "Gifts"
        case .touch: return "Physical Touch"
        case .acts: return "Acts of Service"
        }
    }
}

enum Importance: String, Codable {
    case low
    case medium
    case high
    case essential
}
