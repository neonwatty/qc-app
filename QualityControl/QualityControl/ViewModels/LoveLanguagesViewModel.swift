//
//  LoveLanguagesViewModel.swift
//  QualityControl
//
//  Week 6: Love Languages System
//  State management for love languages
//

import Foundation
import SwiftData

@MainActor
@Observable
class LoveLanguagesViewModel {

    // MARK: - Properties

    private let modelContext: ModelContext
    private let userId: UUID

    var myLanguages: [LoveLanguage] = []
    var partnerLanguages: [LoveLanguage] = []
    var selectedTab: LanguageTab = .mine
    var isLoading: Bool = false
    var error: Error?

    // MARK: - Initialization

    init(modelContext: ModelContext, userId: UUID) {
        self.modelContext = modelContext
        self.userId = userId
    }

    // MARK: - Data Loading

    func loadLanguages() async {
        isLoading = true
        error = nil

        do {
            let descriptor = FetchDescriptor<LoveLanguage>(
                sortBy: [SortDescriptor(\.createdAt, order: .reverse)]
            )

            let allLanguages = try modelContext.fetch(descriptor)
            myLanguages = allLanguages.filter { $0.userId == userId }

            // TODO: Load partner languages when couple relationship is established
            partnerLanguages = []
        } catch {
            self.error = error
        }

        isLoading = false
    }

    func refresh() async {
        await loadLanguages()
    }

    // MARK: - CRUD Operations

    func createLanguage(
        category: LoveLanguageCategory,
        title: String,
        description: String,
        examples: [String] = [],
        importance: Importance = .medium,
        privacy: NotePrivacy = .shared,
        tags: [String] = []
    ) throws -> LoveLanguage {
        let language = LoveLanguage(
            category: category,
            title: title,
            description: description,
            userId: userId
        )
        language.examples = examples
        language.importance = importance
        language.privacy = privacy
        language.tags = tags

        modelContext.insert(language)
        try modelContext.save()

        myLanguages.insert(language, at: 0)

        return language
    }

    func updateLanguage(
        _ language: LoveLanguage,
        title: String,
        description: String,
        examples: [String],
        importance: Importance,
        privacy: NotePrivacy,
        tags: [String]
    ) throws {
        language.title = title
        language.languageDescription = description
        language.examples = examples
        language.importance = importance
        language.privacy = privacy
        language.tags = tags
        language.updatedAt = Date()

        try modelContext.save()
    }

    func deleteLanguage(_ language: LoveLanguage) throws {
        modelContext.delete(language)
        try modelContext.save()

        myLanguages.removeAll { $0.id == language.id }
    }

    // MARK: - Filtering

    var displayedLanguages: [LoveLanguage] {
        selectedTab == .mine ? myLanguages : partnerLanguages
    }

    var sharedLanguages: [LoveLanguage] {
        myLanguages.filter { $0.privacy == .shared }
    }

    var privateLanguages: [LoveLanguage] {
        myLanguages.filter { $0.privacy == .private }
    }

    // MARK: - Statistics

    var totalMyLanguages: Int {
        myLanguages.count
    }

    var totalPartnerLanguages: Int {
        partnerLanguages.count
    }

    var sharedCount: Int {
        sharedLanguages.count
    }

    var privateCount: Int {
        privateLanguages.count
    }

    // MARK: - Grouping

    func groupedLanguages() -> [LanguageGroup] {
        var groups: [LanguageGroup] = []

        let shared = sharedLanguages
        let privateLangs = privateLanguages

        if !shared.isEmpty {
            groups.append(LanguageGroup(title: "Shared with Partner", count: shared.count, languages: shared))
        }

        if !privateLangs.isEmpty {
            groups.append(LanguageGroup(title: "Private", count: privateLangs.count, languages: privateLangs))
        }

        return groups
    }
}

// MARK: - Supporting Types

enum LanguageTab: String, CaseIterable {
    case mine = "My Languages"
    case partner = "Partner's Languages"

    var icon: String {
        switch self {
        case .mine: return "heart.fill"
        case .partner: return "heart.circle.fill"
        }
    }
}

struct LanguageGroup: Identifiable {
    let id = UUID()
    let title: String
    let count: Int
    let languages: [LoveLanguage]
}
