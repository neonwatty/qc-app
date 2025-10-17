//
//  CategoryTests.swift
//  QualityControlTests
//
//  Phase 1.1: Model Tests
//  Comprehensive tests for Category model
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class CategoryTests: XCTestCase {

    var modelContext: ModelContext!
    var modelContainer: ModelContainer!
    var testCategory: QualityControl.Category!

    override func setUp() async throws {
        (modelContainer, modelContext) = try TestModelContext.create()

        testCategory = QualityControl.Category(name: "Communication", description: "Test description", icon: "bubble.left.and.bubble.right")
        modelContext.insert(testCategory)
        try modelContext.save()
    }

    override func tearDown() async throws {
        testCategory = nil
        modelContext = nil
        modelContainer = nil
    }

    // MARK: - Initialization Tests

    func testCategoryInitialization() {
        // Given
        let name = "Intimacy"
        let description = "Physical and emotional connection"
        let icon = "heart.fill"

        // When
        let category = QualityControl.Category(name: name, description: description, icon: icon)

        // Then
        XCTAssertNotNil(category.id)
        XCTAssertEqual(category.name, name)
        XCTAssertEqual(category.categoryDescription, description)
        XCTAssertEqual(category.icon, icon)
        XCTAssertEqual(category.colorHex, "#EC4899") // Default pink
        XCTAssertFalse(category.isDefault)
        XCTAssertEmpty(category.prompts)
    }

    func testCategoryIdIsUnique() {
        // When
        let category1 = QualityControl.Category(name: "Cat 1", description: "Desc 1", icon: "icon1")
        let category2 = QualityControl.Category(name: "Cat 2", description: "Desc 2", icon: "icon2")

        // Then
        XCTAssertNotEqual(category1.id, category2.id)
    }

    func testCategoryWithCustomId() {
        // Given
        let customId = UUID()

        // When
        let category = QualityControl.Category(id: customId, name: "Test", description: "Test", icon: "circle")

        // Then
        XCTAssertEqual(category.id, customId)
    }

    // MARK: - Property Tests

    func testNameUpdatePersists() throws {
        // Given
        let newName = "Updated Communication"

        // When
        testCategory.name = newName
        try modelContext.save()

        // Then
        XCTAssertEqual(testCategory.name, newName)
    }

    func testDescriptionUpdatePersists() throws {
        // Given
        let newDescription = "Updated description"

        // When
        testCategory.categoryDescription = newDescription
        try modelContext.save()

        // Then
        XCTAssertEqual(testCategory.categoryDescription, newDescription)
    }

    func testIconUpdatePersists() throws {
        // Given
        let newIcon = "message.fill"

        // When
        testCategory.icon = newIcon
        try modelContext.save()

        // Then
        XCTAssertEqual(testCategory.icon, newIcon)
    }

    func testColorHexUpdatePersists() throws {
        // Given
        let newColor = "#3B82F6" // Blue

        // When
        testCategory.colorHex = newColor
        try modelContext.save()

        // Then
        XCTAssertEqual(testCategory.colorHex, newColor)
    }

    func testIsDefaultFlagUpdatePersists() throws {
        // When
        testCategory.isDefault = true
        try modelContext.save()

        // Then
        XCTAssertTrue(testCategory.isDefault)
    }

    // MARK: - Prompts Tests

    func testPromptsInitiallyEmpty() {
        // Then
        XCTAssertEmpty(testCategory.prompts)
    }

    func testCanAddPrompt() throws {
        // Given
        let prompt = "How do you feel about our communication?"

        // When
        testCategory.prompts.append(prompt)
        try modelContext.save()

        // Then
        XCTAssertCount(testCategory.prompts, 1)
        XCTAssertEqual(testCategory.prompts.first, prompt)
    }

    func testCanAddMultiplePrompts() throws {
        // Given
        let prompts = [
            "What went well this week?",
            "What could we improve?",
            "How are you feeling?"
        ]

        // When
        testCategory.prompts.append(contentsOf: prompts)
        try modelContext.save()

        // Then
        XCTAssertCount(testCategory.prompts, 3)
        XCTAssertEqual(testCategory.prompts, prompts)
    }

    func testCanRemovePrompt() throws {
        // Given
        let prompt1 = "Prompt 1"
        let prompt2 = "Prompt 2"
        testCategory.prompts.append(contentsOf: [prompt1, prompt2])
        try modelContext.save()

        // When
        testCategory.prompts.removeFirst()
        try modelContext.save()

        // Then
        XCTAssertCount(testCategory.prompts, 1)
        XCTAssertEqual(testCategory.prompts.first, prompt2)
    }

    func testCanClearAllPrompts() throws {
        // Given
        testCategory.prompts.append(contentsOf: ["Prompt 1", "Prompt 2", "Prompt 3"])
        try modelContext.save()

        // When
        testCategory.prompts.removeAll()
        try modelContext.save()

        // Then
        XCTAssertEmpty(testCategory.prompts)
    }

    // MARK: - Persistence Tests

    func testCategoryPersistsInContext() throws {
        // When
        let descriptor = FetchDescriptor<QualityControl.Category>()
        let categories = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(categories, 1)
        XCTAssertEqual(categories.first?.id, testCategory.id)
    }

    func testCategoryCanBeDeleted() throws {
        // When
        modelContext.delete(testCategory)
        try modelContext.save()

        // Then
        let descriptor = FetchDescriptor<QualityControl.Category>()
        let categories = try modelContext.fetch(descriptor)
        XCTAssertEmpty(categories)
    }

    func testMultipleCategoriesPersist() throws {
        // Given
        let category2 = QualityControl.Category(name: "Finances", description: "Money matters", icon: "dollarsign.circle")
        let category3 = QualityControl.Category(name: "Family", description: "Family planning", icon: "figure.2.and.child.holdinghands")
        modelContext.insert(category2)
        modelContext.insert(category3)

        // When
        try modelContext.save()

        // Then
        let descriptor = FetchDescriptor<QualityControl.Category>()
        let categories = try modelContext.fetch(descriptor)
        XCTAssertCount(categories, 3)
    }

    // MARK: - Query Tests

    func testFetchCategoryById() throws {
        // Given
        let targetId = testCategory.id

        // When
        let descriptor = FetchDescriptor<QualityControl.Category>(
            predicate: #Predicate { $0.id == targetId }
        )
        let categories = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(categories, 1)
        XCTAssertEqual(categories.first?.id, targetId)
    }

    func testFetchCategoryByName() throws {
        // Given
        let targetName = testCategory.name

        // When
        let descriptor = FetchDescriptor<QualityControl.Category>(
            predicate: #Predicate { $0.name == targetName }
        )
        let categories = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(categories, 1)
        XCTAssertEqual(categories.first?.name, targetName)
    }

    func testFetchDefaultCategories() throws {
        // Given
        testCategory.isDefault = true
        let customCategory = QualityControl.Category(name: "Custom", description: "User created", icon: "star")
        customCategory.isDefault = false
        modelContext.insert(customCategory)
        try modelContext.save()

        // When
        let descriptor = FetchDescriptor<QualityControl.Category>(
            predicate: #Predicate { $0.isDefault == true }
        )
        let categories = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(categories, 1)
        XCTAssertTrue(categories.first?.isDefault ?? false)
    }

    func testFetchCustomCategories() throws {
        // Given
        testCategory.isDefault = false
        let defaultCategory = QualityControl.Category(name: "Default", description: "System category", icon: "gear")
        defaultCategory.isDefault = true
        modelContext.insert(defaultCategory)
        try modelContext.save()

        // When
        let descriptor = FetchDescriptor<QualityControl.Category>(
            predicate: #Predicate { $0.isDefault == false }
        )
        let categories = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(categories, 1)
        XCTAssertFalse(categories.first?.isDefault ?? true)
    }
}
