//
//  LoveLanguagesViewModelTests.swift
//  QualityControlTests
//
//  Phase 1.2: ViewModel Tests
//  Tests for LoveLanguagesViewModel
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class LoveLanguagesViewModelTests: XCTestCase {

    var modelContainer: ModelContainer!
    var modelContext: ModelContext!
    var viewModel: LoveLanguagesViewModel!
    var testUserId: UUID!

    override func setUp() async throws {
        // Use TestModelContext helper for consistent container management
        (modelContainer, modelContext) = try TestModelContext.create()

        // Create test user
        testUserId = UUID()
        let user = User(id: testUserId, name: "Test User", email: "test@example.com")
        modelContext.insert(user)
        try modelContext.save()

        // Initialize view model
        viewModel = LoveLanguagesViewModel(modelContext: modelContext, userId: testUserId)
    }

    override func tearDown() async throws {
        viewModel = nil
        testUserId = nil
        modelContext = nil
        modelContainer = nil
    }

    // MARK: - Initialization Tests

    func testInitialization() {
        XCTAssertTrue(viewModel.myLanguages.isEmpty)
        XCTAssertTrue(viewModel.partnerLanguages.isEmpty)
        XCTAssertEqual(viewModel.selectedTab, .mine)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.error)
    }

    // MARK: - CRUD Operation Tests

    func testCreateLanguage() throws {
        let title = "Quality Time Together"
        let description = "Spending uninterrupted time together"
        let category = LoveLanguageCategory.time

        let language = try viewModel.createLanguage(
            category: category,
            title: title,
            description: description
        )

        XCTAssertEqual(language.title, title)
        XCTAssertEqual(language.languageDescription, description)
        XCTAssertEqual(language.category, category)
        XCTAssertEqual(language.userId, testUserId)
        XCTAssertEqual(viewModel.myLanguages.count, 1)
    }

    func testCreateLanguageWithExamples() throws {
        let examples = ["Weekly date nights", "Morning coffee together", "Evening walks"]

        let language = try viewModel.createLanguage(
            category: .time,
            title: "Quality Time",
            description: "Time together",
            examples: examples
        )

        XCTAssertEqual(language.examples.count, 3)
        XCTAssertEqual(language.examples, examples)
    }

    func testCreateLanguageWithImportance() throws {
        let language = try viewModel.createLanguage(
            category: .words,
            title: "Words",
            description: "Affirmations",
            importance: .high
        )

        XCTAssertEqual(language.importance, .high)
    }

    func testCreateLanguageWithPrivacy() throws {
        let privateLanguage = try viewModel.createLanguage(
            category: .touch,
            title: "Touch",
            description: "Physical affection",
            privacy: .private
        )

        XCTAssertEqual(privateLanguage.privacy, .private)
    }

    func testUpdateLanguage() throws {
        let language = try viewModel.createLanguage(
            category: .gifts,
            title: "Original",
            description: "Original description"
        )

        let newTitle = "Updated Title"
        let newDescription = "Updated description"
        let newExamples = ["Example 1", "Example 2"]

        try viewModel.updateLanguage(
            language,
            title: newTitle,
            description: newDescription,
            examples: newExamples,
            importance: .high,
            privacy: .shared,
            tags: ["love", "appreciation"]
        )

        XCTAssertEqual(language.title, newTitle)
        XCTAssertEqual(language.languageDescription, newDescription)
        XCTAssertEqual(language.examples, newExamples)
        XCTAssertEqual(language.importance, .high)
        XCTAssertEqual(language.tags, ["love", "appreciation"])
    }

    func testDeleteLanguage() throws {
        let language = try viewModel.createLanguage(
            category: .acts,
            title: "To Delete",
            description: "Test"
        )

        XCTAssertEqual(viewModel.myLanguages.count, 1)

        try viewModel.deleteLanguage(language)

        XCTAssertEqual(viewModel.myLanguages.count, 0)
    }

    // MARK: - Data Loading Tests

    func testLoadLanguages() async throws {
        // Create languages directly in context
        let language1 = LoveLanguage(
            category: .words,
            title: "Language 1",
            description: "Description 1",
            userId: testUserId
        )
        let language2 = LoveLanguage(
            category: .time,
            title: "Language 2",
            description: "Description 2",
            userId: testUserId
        )
        modelContext.insert(language1)
        modelContext.insert(language2)
        try modelContext.save()

        await viewModel.loadLanguages()

        XCTAssertEqual(viewModel.myLanguages.count, 2)
        XCTAssertFalse(viewModel.isLoading)
    }

    func testLoadLanguagesFiltersByUser() async throws {
        let otherUserId = UUID()

        // Create languages for different users
        let myLanguage = LoveLanguage(
            category: .gifts,
            title: "My Language",
            description: "Mine",
            userId: testUserId
        )
        let otherLanguage = LoveLanguage(
            category: .touch,
            title: "Other Language",
            description: "Theirs",
            userId: otherUserId
        )
        modelContext.insert(myLanguage)
        modelContext.insert(otherLanguage)
        try modelContext.save()

        await viewModel.loadLanguages()

        XCTAssertEqual(viewModel.myLanguages.count, 1)
        XCTAssertEqual(viewModel.myLanguages.first?.title, "My Language")
    }

    func testRefresh() async throws {
        // Create initial language
        let language1 = LoveLanguage(
            category: .words,
            title: "L1",
            description: "D1",
            userId: testUserId
        )
        modelContext.insert(language1)
        try modelContext.save()

        await viewModel.loadLanguages()
        XCTAssertEqual(viewModel.myLanguages.count, 1)

        // Add another language
        let language2 = LoveLanguage(
            category: .time,
            title: "L2",
            description: "D2",
            userId: testUserId
        )
        modelContext.insert(language2)
        try modelContext.save()

        await viewModel.refresh()
        XCTAssertEqual(viewModel.myLanguages.count, 2)
    }

    // MARK: - Filter Tests

    func testDisplayedLanguagesShowsMine() throws {
        _ = try viewModel.createLanguage(
            category: .words,
            title: "My Language",
            description: "Test"
        )

        viewModel.selectedTab = .mine

        XCTAssertEqual(viewModel.displayedLanguages.count, 1)
        XCTAssertEqual(viewModel.displayedLanguages.first?.title, "My Language")
    }

    func testDisplayedLanguagesShowsPartner() {
        viewModel.selectedTab = .partner

        // Partner languages currently empty (TODO in implementation)
        XCTAssertEqual(viewModel.displayedLanguages.count, 0)
    }

    func testSharedLanguages() throws {
        _ = try viewModel.createLanguage(
            category: .words,
            title: "Shared",
            description: "Test",
            privacy: .shared
        )
        _ = try viewModel.createLanguage(
            category: .time,
            title: "Private",
            description: "Test",
            privacy: .private
        )

        XCTAssertEqual(viewModel.sharedLanguages.count, 1)
        XCTAssertEqual(viewModel.sharedLanguages.first?.title, "Shared")
    }

    func testPrivateLanguages() throws {
        _ = try viewModel.createLanguage(
            category: .words,
            title: "Shared",
            description: "Test",
            privacy: .shared
        )
        _ = try viewModel.createLanguage(
            category: .time,
            title: "Private",
            description: "Test",
            privacy: .private
        )

        XCTAssertEqual(viewModel.privateLanguages.count, 1)
        XCTAssertEqual(viewModel.privateLanguages.first?.title, "Private")
    }

    // MARK: - Statistics Tests

    func testTotalMyLanguages() throws {
        XCTAssertEqual(viewModel.totalMyLanguages, 0)

        _ = try viewModel.createLanguage(
            category: .words,
            title: "L1",
            description: "D1"
        )
        XCTAssertEqual(viewModel.totalMyLanguages, 1)

        _ = try viewModel.createLanguage(
            category: .time,
            title: "L2",
            description: "D2"
        )
        XCTAssertEqual(viewModel.totalMyLanguages, 2)
    }

    func testSharedCount() throws {
        _ = try viewModel.createLanguage(
            category: .words,
            title: "Shared 1",
            description: "Test",
            privacy: .shared
        )
        _ = try viewModel.createLanguage(
            category: .time,
            title: "Private",
            description: "Test",
            privacy: .private
        )
        _ = try viewModel.createLanguage(
            category: .gifts,
            title: "Shared 2",
            description: "Test",
            privacy: .shared
        )

        XCTAssertEqual(viewModel.sharedCount, 2)
    }

    func testPrivateCount() throws {
        _ = try viewModel.createLanguage(
            category: .words,
            title: "Private 1",
            description: "Test",
            privacy: .private
        )
        _ = try viewModel.createLanguage(
            category: .time,
            title: "Shared",
            description: "Test",
            privacy: .shared
        )
        _ = try viewModel.createLanguage(
            category: .gifts,
            title: "Private 2",
            description: "Test",
            privacy: .private
        )

        XCTAssertEqual(viewModel.privateCount, 2)
    }

    // MARK: - Grouping Tests

    func testGroupedLanguagesWithSharedAndPrivate() throws {
        _ = try viewModel.createLanguage(
            category: .words,
            title: "Shared",
            description: "Test",
            privacy: .shared
        )
        _ = try viewModel.createLanguage(
            category: .time,
            title: "Private",
            description: "Test",
            privacy: .private
        )

        let groups = viewModel.groupedLanguages()

        XCTAssertEqual(groups.count, 2)
        XCTAssertTrue(groups.contains { $0.title == "Shared with Partner" })
        XCTAssertTrue(groups.contains { $0.title == "Private" })
    }

    func testGroupedLanguagesOnlyShared() throws {
        _ = try viewModel.createLanguage(
            category: .words,
            title: "Shared",
            description: "Test",
            privacy: .shared
        )

        let groups = viewModel.groupedLanguages()

        XCTAssertEqual(groups.count, 1)
        XCTAssertEqual(groups.first?.title, "Shared with Partner")
    }

    func testGroupedLanguagesOnlyPrivate() throws {
        _ = try viewModel.createLanguage(
            category: .touch,
            title: "Private",
            description: "Test",
            privacy: .private
        )

        let groups = viewModel.groupedLanguages()

        XCTAssertEqual(groups.count, 1)
        XCTAssertEqual(groups.first?.title, "Private")
    }

    func testGroupedLanguagesEmptyWhenNoLanguages() {
        let groups = viewModel.groupedLanguages()

        XCTAssertTrue(groups.isEmpty)
    }

    func testGroupCounts() throws {
        _ = try viewModel.createLanguage(
            category: .words,
            title: "Shared 1",
            description: "Test",
            privacy: .shared
        )
        _ = try viewModel.createLanguage(
            category: .time,
            title: "Shared 2",
            description: "Test",
            privacy: .shared
        )
        _ = try viewModel.createLanguage(
            category: .gifts,
            title: "Private",
            description: "Test",
            privacy: .private
        )

        let groups = viewModel.groupedLanguages()

        let sharedGroup = groups.first { $0.title == "Shared with Partner" }
        let privateGroup = groups.first { $0.title == "Private" }

        XCTAssertEqual(sharedGroup?.count, 2)
        XCTAssertEqual(privateGroup?.count, 1)
    }
}
