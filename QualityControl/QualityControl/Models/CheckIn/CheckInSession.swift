//
//  CheckInSession.swift
//  QualityControl
//
//  Created by Jeremy Watt on 10/15/25.
//

import Foundation
import SwiftData

@Model
final class CheckInSession {
    @Attribute(.unique) var id: UUID
    var coupleId: UUID
    var startedAt: Date
    var completedAt: Date?
    var status: CheckInStatus

    @Relationship(deleteRule: .cascade) var notes: [Note]?
    @Relationship(deleteRule: .cascade) var actionItems: [ActionItem]?
    @Relationship(deleteRule: .nullify) var selectedCategories: [Category]?

    // Progress tracking
    var currentStep: CheckInStep
    var completedSteps: [String] // Store as String array for simplicity
    var percentageComplete: Double

    // Session metadata
    var durationSeconds: Int?
    var mood: MoodRating?
    var reflection: String?

    init(id: UUID = UUID(), coupleId: UUID, categories: [Category] = []) {
        self.id = id
        self.coupleId = coupleId
        self.startedAt = Date()
        self.status = .inProgress
        self.selectedCategories = categories
        self.currentStep = .welcome
        self.completedSteps = []
        self.percentageComplete = 0
    }
}

enum CheckInStatus: String, Codable {
    case inProgress
    case completed
    case abandoned
}

enum CheckInStep: String, Codable, CaseIterable {
    case welcome
    case categorySelection
    case categoryDiscussion
    case reflection
    case actionItems
    case completion

    var displayName: String {
        switch self {
        case .welcome: return "Welcome"
        case .categorySelection: return "Category Selection"
        case .categoryDiscussion: return "Discussion"
        case .reflection: return "Reflection"
        case .actionItems: return "Action Items"
        case .completion: return "Completion"
        }
    }
}

enum MoodRating: String, Codable {
    case veryPositive = "😄"
    case positive = "🙂"
    case neutral = "😐"
    case negative = "🙁"
    case veryNegative = "😢"
}
