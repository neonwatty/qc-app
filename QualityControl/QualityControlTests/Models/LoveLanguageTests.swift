//
//  LoveLanguageTests.swift
//  QualityControlTests
//
//  Phase 1.1: Model Tests
//  Comprehensive tests for LoveLanguage model
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class LoveLanguageTests: XCTestCase {

    var modelContext: ModelContext!
    var modelContainer: ModelContainer!
    var testUser: User!
    var testLoveLanguage: LoveLanguage!

    override func setUp() async throws {
        (modelContainer, modelContext) = try TestModelContext.create()

        testUser = User(name: "Test User", email: "test@example.com")
        modelContext.insert(testUser)

        testLoveLanguage = LoveLanguage(
            category: .words,
            title: "Verbal Appreciation",
            description: "I appreciate when my partner tells me they appreciate me",
            userId: testUser.id
        )
        modelContext.insert(testLoveLanguage)

        try modelContext.save()
    }

    override func tearDown() async throws {
        testLoveLanguage = nil
        testUser = nil
        modelContext = nil
        modelContainer = nil
    }

    // MARK: - Initialization Tests

    func testLoveLanguageInitialization() {
        // Given
        let category = LoveLanguageCategory.time
        let title = "Quality Time Together"
        let description = "Spending uninterrupted time together is important to me"
        let userId = testUser.id

        // When
        let language = LoveLanguage(
            category: category,
            title: title,
            description: description,
            userId: userId
        )

        // Then
        XCTAssertNotNil(language.id)
        XCTAssertEqual(language.category, category)
        XCTAssertEqual(language.title, title)
        XCTAssertEqual(language.languageDescription, description)
        XCTAssertEqual(language.userId, userId)
        XCTAssertEmpty(language.examples) // Default
        XCTAssertEqual(language.importance, .medium) // Default
        XCTAssertEqual(language.privacy, .shared) // Default
        XCTAssertEmpty(language.tags) // Default
        XCTAssertNotNil(language.createdAt)
        XCTAssertNotNil(language.updatedAt)
    }

    func testLoveLanguageIdIsUnique() {
        // When
        let language1 = LoveLanguage(category: .words, title: "Language 1", description: "Desc 1", userId: testUser.id)
        let language2 = LoveLanguage(category: .words, title: "Language 2", description: "Desc 2", userId: testUser.id)

        // Then
        XCTAssertNotEqual(language1.id, language2.id)
    }

    func testLoveLanguageTimestampsAreSet() {
        // Given
        let beforeCreation = Date()

        // When
        let language = LoveLanguage(category: .words, title: "Test", description: "Test", userId: testUser.id)

        // Then
        let afterCreation = Date()
        XCTAssertGreaterThanOrEqual(language.createdAt, beforeCreation)
        XCTAssertLessThanOrEqual(language.createdAt, afterCreation)
        XCTAssertGreaterThanOrEqual(language.updatedAt, beforeCreation)
        XCTAssertLessThanOrEqual(language.updatedAt, afterCreation)
    }

    // MARK: - Property Tests

    func testTitleUpdatePersists() throws {
        // Given
        let newTitle = "Updated Love Language Title"

        // When
        testLoveLanguage.title = newTitle
        testLoveLanguage.updatedAt = Date()
        try modelContext.save()

        // Then
        XCTAssertEqual(testLoveLanguage.title, newTitle)
    }

    func testDescriptionUpdatePersists() throws {
        // Given
        let newDescription = "Updated love language description"

        // When
        testLoveLanguage.languageDescription = newDescription
        testLoveLanguage.updatedAt = Date()
        try modelContext.save()

        // Then
        XCTAssertEqual(testLoveLanguage.languageDescription, newDescription)
    }

    func testImportanceUpdatePersists() throws {
        // Given
        let newImportance = Importance.essential

        // When
        testLoveLanguage.importance = newImportance
        try modelContext.save()

        // Then
        XCTAssertEqual(testLoveLanguage.importance, newImportance)
    }

    func testPrivacyUpdatePersists() throws {
        // Given
        let newPrivacy = NotePrivacy.private

        // When
        testLoveLanguage.privacy = newPrivacy
        try modelContext.save()

        // Then
        XCTAssertEqual(testLoveLanguage.privacy, newPrivacy)
    }

    // MARK: - Examples Tests

    func testExamplesInitiallyEmpty() {
        // Then
        XCTAssertEmpty(testLoveLanguage.examples)
    }

    func testCanAddExample() throws {
        // Given
        let example = "Saying 'I love you' daily"

        // When
        testLoveLanguage.examples.append(example)
        try modelContext.save()

        // Then
        XCTAssertCount(testLoveLanguage.examples, 1)
        XCTAssertEqual(testLoveLanguage.examples.first, example)
    }

    func testCanAddMultipleExamples() throws {
        // Given
        let examples = [
            "Saying 'I love you' daily",
            "Complimenting specific things",
            "Writing love notes"
        ]

        // When
        testLoveLanguage.examples.append(contentsOf: examples)
        try modelContext.save()

        // Then
        XCTAssertCount(testLoveLanguage.examples, 3)
        XCTAssertEqual(testLoveLanguage.examples, examples)
    }

    func testCanRemoveExample() throws {
        // Given
        testLoveLanguage.examples.append(contentsOf: ["Example 1", "Example 2"])
        try modelContext.save()

        // When
        testLoveLanguage.examples.removeFirst()
        try modelContext.save()

        // Then
        XCTAssertCount(testLoveLanguage.examples, 1)
    }

    // MARK: - Tags Tests

    func testTagsInitiallyEmpty() {
        // Then
        XCTAssertEmpty(testLoveLanguage.tags)
    }

    func testCanAddTag() throws {
        // Given
        let tag = "important"

        // When
        testLoveLanguage.tags.append(tag)
        try modelContext.save()

        // Then
        XCTAssertCount(testLoveLanguage.tags, 1)
        XCTAssertEqual(testLoveLanguage.tags.first, tag)
    }

    func testCanAddMultipleTags() throws {
        // Given
        let tags = ["important", "daily", "relationship"]

        // When
        testLoveLanguage.tags.append(contentsOf: tags)
        try modelContext.save()

        // Then
        XCTAssertCount(testLoveLanguage.tags, 3)
        XCTAssertEqual(testLoveLanguage.tags, tags)
    }

    // MARK: - Timestamp Tests

    func testUpdatedAtCanBeModified() throws {
        // Given
        let originalUpdatedAt = testLoveLanguage.updatedAt
        Thread.sleep(forTimeInterval: 0.1)

        // When
        testLoveLanguage.title = "Modified title"
        testLoveLanguage.updatedAt = Date()
        try modelContext.save()

        // Then
        XCTAssertGreaterThan(testLoveLanguage.updatedAt, originalUpdatedAt)
    }

    // MARK: - Category Tests

    func testAllLoveLanguageCategories() {
        // When/Then
        let categories: [LoveLanguageCategory] = [.words, .time, .gifts, .touch, .acts]

        for category in categories {
            let language = LoveLanguage(category: category, title: "Test", description: "Test", userId: testUser.id)
            XCTAssertEqual(language.category, category)
        }
    }

    func testCategoryIcons() {
        // When/Then
        XCTAssertEqual(LoveLanguageCategory.words.icon, "💬")
        XCTAssertEqual(LoveLanguageCategory.time.icon, "⏰")
        XCTAssertEqual(LoveLanguageCategory.gifts.icon, "🎁")
        XCTAssertEqual(LoveLanguageCategory.touch.icon, "🤝")
        XCTAssertEqual(LoveLanguageCategory.acts.icon, "✋")
    }

    func testCategoryDisplayNames() {
        // When/Then
        XCTAssertEqual(LoveLanguageCategory.words.displayName, "Words of Affirmation")
        XCTAssertEqual(LoveLanguageCategory.time.displayName, "Quality Time")
        XCTAssertEqual(LoveLanguageCategory.gifts.displayName, "Gifts")
        XCTAssertEqual(LoveLanguageCategory.touch.displayName, "Physical Touch")
        XCTAssertEqual(LoveLanguageCategory.acts.displayName, "Acts of Service")
    }

    // MARK: - Importance Tests

    func testAllImportanceLevels() {
        // When/Then
        let levels: [Importance] = [.low, .medium, .high, .essential]

        for level in levels {
            testLoveLanguage.importance = level
            XCTAssertEqual(testLoveLanguage.importance, level)
        }
    }

    func testDefaultImportanceIsMedium() {
        // When
        let language = LoveLanguage(category: .words, title: "Test", description: "Test", userId: testUser.id)

        // Then
        XCTAssertEqual(language.importance, .medium)
    }

    // MARK: - Privacy Tests

    func testAllPrivacyLevels() {
        // When/Then
        let levels: [NotePrivacy] = [.private, .shared, .draft]

        for level in levels {
            testLoveLanguage.privacy = level
            XCTAssertEqual(testLoveLanguage.privacy, level)
        }
    }

    func testDefaultPrivacyIsShared() {
        // When
        let language = LoveLanguage(category: .words, title: "Test", description: "Test", userId: testUser.id)

        // Then
        XCTAssertEqual(language.privacy, .shared)
    }

    // MARK: - Persistence Tests

    func testLoveLanguagePersistsInContext() throws {
        // When
        let descriptor = FetchDescriptor<LoveLanguage>()
        let languages = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(languages, 1)
        XCTAssertEqual(languages.first?.id, testLoveLanguage.id)
    }

    func testLoveLanguageCanBeDeleted() throws {
        // When
        modelContext.delete(testLoveLanguage)
        try modelContext.save()

        // Then
        let descriptor = FetchDescriptor<LoveLanguage>()
        let languages = try modelContext.fetch(descriptor)
        XCTAssertEmpty(languages)
    }

    func testMultipleLoveLanguagesPersist() throws {
        // Given
        let language2 = LoveLanguage(category: .time, title: "Language 2", description: "Desc 2", userId: testUser.id)
        let language3 = LoveLanguage(category: .gifts, title: "Language 3", description: "Desc 3", userId: testUser.id)
        modelContext.insert(language2)
        modelContext.insert(language3)

        // When
        try modelContext.save()

        // Then
        let descriptor = FetchDescriptor<LoveLanguage>()
        let languages = try modelContext.fetch(descriptor)
        XCTAssertCount(languages, 3)
    }

    // MARK: - Query Tests

    func testFetchLoveLanguageById() throws {
        // Given
        let targetId = testLoveLanguage.id

        // When
        let descriptor = FetchDescriptor<LoveLanguage>(
            predicate: #Predicate { $0.id == targetId }
        )
        let languages = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(languages, 1)
        XCTAssertEqual(languages.first?.id, targetId)
    }

    func testFetchLoveLanguagesByUserId() throws {
        // Given
        let otherUser = User(name: "Other User", email: "other@example.com")
        modelContext.insert(otherUser)
        let otherLanguage = LoveLanguage(category: .words, title: "Other", description: "Other desc", userId: otherUser.id)
        modelContext.insert(otherLanguage)
        try modelContext.save()

        let targetUserId = testUser.id

        // When
        let descriptor = FetchDescriptor<LoveLanguage>(
            predicate: #Predicate { $0.userId == targetUserId }
        )
        let languages = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(languages, 1)
        XCTAssertEqual(languages.first?.userId, targetUserId)
    }

    func testFetchLoveLanguagesByCategory() throws {
        // Given
        let timeLanguage = LoveLanguage(category: .time, title: "Time", description: "Time desc", userId: testUser.id)
        let giftsLanguage = LoveLanguage(category: .gifts, title: "Gifts", description: "Gifts desc", userId: testUser.id)
        modelContext.insert(timeLanguage)
        modelContext.insert(giftsLanguage)
        try modelContext.save()

        let targetCategory: LoveLanguageCategory = .words

        // When - Fetch all and filter (enum predicates not supported)
        let descriptor = FetchDescriptor<LoveLanguage>()
        let allLanguages = try modelContext.fetch(descriptor)
        let languages = allLanguages.filter { $0.category == targetCategory }

        // Then
        XCTAssertCount(languages, 1)
        XCTAssertEqual(languages.first?.category, .words)
    }

    func testFetchLoveLanguagesByImportance() throws {
        // Given
        testLoveLanguage.importance = .essential
        let mediumLanguage = LoveLanguage(category: .time, title: "Medium", description: "Medium desc", userId: testUser.id)
        mediumLanguage.importance = .medium
        modelContext.insert(mediumLanguage)
        try modelContext.save()

        let targetImportance: Importance = .essential

        // When - Fetch all and filter (enum predicates not supported)
        let descriptor = FetchDescriptor<LoveLanguage>()
        let allLanguages = try modelContext.fetch(descriptor)
        let languages = allLanguages.filter { $0.importance == targetImportance }

        // Then
        XCTAssertCount(languages, 1)
        XCTAssertEqual(languages.first?.importance, .essential)
    }

    func testFetchLoveLanguagesByPrivacy() throws {
        // Given
        testLoveLanguage.privacy = .private
        let sharedLanguage = LoveLanguage(category: .time, title: "Shared", description: "Shared desc", userId: testUser.id)
        sharedLanguage.privacy = .shared
        modelContext.insert(sharedLanguage)
        try modelContext.save()

        let targetPrivacy: NotePrivacy = .private

        // When - Fetch all and filter (enum predicates not supported)
        let descriptor = FetchDescriptor<LoveLanguage>()
        let allLanguages = try modelContext.fetch(descriptor)
        let languages = allLanguages.filter { $0.privacy == targetPrivacy }

        // Then
        XCTAssertCount(languages, 1)
        XCTAssertEqual(languages.first?.privacy, .private)
    }
}
