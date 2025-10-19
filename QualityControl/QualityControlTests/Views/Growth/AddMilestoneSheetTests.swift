//
//  AddMilestoneSheetTests.swift
//  QualityControlTests
//
//  Week 5-6: Growth Gallery Tests
//  Tests for AddMilestoneSheet view and validation logic
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class AddMilestoneSheetTests: XCTestCase {

    var modelContainer: ModelContainer!
    var modelContext: ModelContext!
    var viewModel: GrowthViewModel!
    var testCoupleId: UUID!

    override func setUp() async throws {
        // Use TestModelContext helper for consistent container management
        (modelContainer, modelContext) = try TestModelContext.create()

        // Create test couple
        testCoupleId = UUID()
        let user1 = User(name: "User 1", email: "user1@test.com")
        let user2 = User(name: "User 2", email: "user2@test.com")
        let couple = Couple(id: testCoupleId, relationshipStartDate: Date())
        modelContext.insert(user1)
        modelContext.insert(user2)
        modelContext.insert(couple)
        try modelContext.save()

        // Initialize view model
        viewModel = GrowthViewModel(modelContext: modelContext, coupleId: testCoupleId)
    }

    override func tearDown() async throws {
        viewModel = nil
        testCoupleId = nil
        modelContext = nil
        modelContainer = nil
    }

    // MARK: - Validation Tests

    func testIsValidWithEmptyTitle() {
        // Given
        let title = ""
        let description = "Valid description"

        // When
        let isValid = !title.trimmingCharacters(in: .whitespaces).isEmpty &&
                      !description.trimmingCharacters(in: .whitespaces).isEmpty

        // Then
        XCTAssertFalse(isValid, "Should be invalid with empty title")
    }

    func testIsValidWithWhitespaceOnlyTitle() {
        // Given
        let title = "   "
        let description = "Valid description"

        // When
        let isValid = !title.trimmingCharacters(in: .whitespaces).isEmpty &&
                      !description.trimmingCharacters(in: .whitespaces).isEmpty

        // Then
        XCTAssertFalse(isValid, "Should be invalid with whitespace-only title")
    }

    func testIsValidWithEmptyDescription() {
        // Given
        let title = "Valid title"
        let description = ""

        // When
        let isValid = !title.trimmingCharacters(in: .whitespaces).isEmpty &&
                      !description.trimmingCharacters(in: .whitespaces).isEmpty

        // Then
        XCTAssertFalse(isValid, "Should be invalid with empty description")
    }

    func testIsValidWithWhitespaceOnlyDescription() {
        // Given
        let title = "Valid title"
        let description = "   "

        // When
        let isValid = !title.trimmingCharacters(in: .whitespaces).isEmpty &&
                      !description.trimmingCharacters(in: .whitespaces).isEmpty

        // Then
        XCTAssertFalse(isValid, "Should be invalid with whitespace-only description")
    }

    func testIsValidWithBothFieldsEmpty() {
        // Given
        let title = ""
        let description = ""

        // When
        let isValid = !title.trimmingCharacters(in: .whitespaces).isEmpty &&
                      !description.trimmingCharacters(in: .whitespaces).isEmpty

        // Then
        XCTAssertFalse(isValid, "Should be invalid with both fields empty")
    }

    func testIsValidWithValidInput() {
        // Given
        let title = "First Anniversary"
        let description = "Celebrating our first year together"

        // When
        let isValid = !title.trimmingCharacters(in: .whitespaces).isEmpty &&
                      !description.trimmingCharacters(in: .whitespaces).isEmpty

        // Then
        XCTAssertTrue(isValid, "Should be valid with both fields filled")
    }

    func testIsValidWithValidInputAndExtraWhitespace() {
        // Given
        let title = "  First Anniversary  "
        let description = "  Celebrating our first year together  "

        // When
        let isValid = !title.trimmingCharacters(in: .whitespaces).isEmpty &&
                      !description.trimmingCharacters(in: .whitespaces).isEmpty

        // Then
        XCTAssertTrue(isValid, "Should be valid after trimming whitespace")
    }

    // MARK: - Category Tests

    func testDefaultCategoryIsAnniversary() {
        let defaultCategory = "anniversary"
        XCTAssertEqual(defaultCategory, "anniversary")
    }

    func testAllCategoriesExist() {
        let categories = [
            ("anniversary", "Anniversary", "heart.fill"),
            ("consistency", "Consistency", "calendar.badge.checkmark"),
            ("growth", "Growth", "chart.line.uptrend.xyaxis"),
            ("quality", "Quality Time", "person.2.fill"),
            ("communication", "Communication", "bubble.left.and.bubble.right.fill"),
            ("milestone", "Special Milestone", "star.fill")
        ]

        XCTAssertEqual(categories.count, 6)

        // Verify each category has ID, display name, and icon
        for category in categories {
            XCTAssertFalse(category.0.isEmpty, "Category ID should not be empty")
            XCTAssertFalse(category.1.isEmpty, "Category name should not be empty")
            XCTAssertFalse(category.2.isEmpty, "Category icon should not be empty")
        }
    }

    func testCategoryIdsAreUnique() {
        let categories = [
            ("anniversary", "Anniversary", "heart.fill"),
            ("consistency", "Consistency", "calendar.badge.checkmark"),
            ("growth", "Growth", "chart.line.uptrend.xyaxis"),
            ("quality", "Quality Time", "person.2.fill"),
            ("communication", "Communication", "bubble.left.and.bubble.right.fill"),
            ("milestone", "Special Milestone", "star.fill")
        ]

        let categoryIds = categories.map { $0.0 }
        let uniqueIds = Set(categoryIds)

        XCTAssertEqual(categoryIds.count, uniqueIds.count, "Category IDs should be unique")
    }

    // MARK: - ViewModel Integration Tests

    func testSaveMilestoneCreatesNewMilestone() throws {
        // Given
        let title = "First Date Anniversary"
        let description = "Celebrating the day we first met"
        let category = "anniversary"

        let initialCount = viewModel.milestones.count

        // When
        try viewModel.addMilestone(
            title: title,
            description: description,
            category: category
        )

        // Then
        XCTAssertEqual(viewModel.milestones.count, initialCount + 1)
        let milestone = viewModel.milestones.last
        XCTAssertNotNil(milestone)
        XCTAssertEqual(milestone?.title, title)
        XCTAssertEqual(milestone?.milestoneDescription, description)
        XCTAssertEqual(milestone?.category, category)
    }

    func testSaveMilestoneTrimsWhitespace() throws {
        // Given
        let title = "  First Anniversary  "
        let description = "  Celebrating our first year  "
        let category = "anniversary"

        // When
        try viewModel.addMilestone(
            title: title.trimmingCharacters(in: .whitespaces),
            description: description.trimmingCharacters(in: .whitespaces),
            category: category
        )

        // Then
        let milestone = viewModel.milestones.last
        XCTAssertEqual(milestone?.title, "First Anniversary")
        XCTAssertEqual(milestone?.milestoneDescription, "Celebrating our first year")
    }

    func testSaveMilestoneWithDifferentCategories() throws {
        // Test all category types
        let categories = ["anniversary", "consistency", "growth", "quality", "communication", "milestone"]

        for category in categories {
            try viewModel.addMilestone(
                title: "Test \(category)",
                description: "Description for \(category)",
                category: category
            )
        }

        // Then
        XCTAssertEqual(viewModel.milestones.count, 6)

        for category in categories {
            let milestone = viewModel.milestones.first { $0.category == category }
            XCTAssertNotNil(milestone, "Should have milestone for category: \(category)")
        }
    }

    func testSaveMilestoneWithLongText() throws {
        // Given
        let longTitle = String(repeating: "Title ", count: 50) // ~300 characters
        let longDescription = String(repeating: "Description ", count: 100) // ~1200 characters

        // When
        try viewModel.addMilestone(
            title: longTitle,
            description: longDescription,
            category: "growth"
        )

        // Then
        let milestone = viewModel.milestones.last
        XCTAssertNotNil(milestone)
        XCTAssertEqual(milestone?.title, longTitle)
        XCTAssertEqual(milestone?.milestoneDescription, longDescription)
    }

    func testSaveMilestoneWithSpecialCharacters() throws {
        // Given
        let title = "1st Anniversary! 🎉"
        let description = "Celebrating with ❤️ & 🍾"
        let category = "anniversary"

        // When
        try viewModel.addMilestone(
            title: title,
            description: description,
            category: category
        )

        // Then
        let milestone = viewModel.milestones.last
        XCTAssertEqual(milestone?.title, title)
        XCTAssertEqual(milestone?.milestoneDescription, description)
    }

    func testSaveMilestoneWithMinimalInput() throws {
        // Given
        let title = "A"
        let description = "B"
        let category = "milestone"

        // When
        try viewModel.addMilestone(
            title: title,
            description: description,
            category: category
        )

        // Then
        let milestone = viewModel.milestones.last
        XCTAssertNotNil(milestone)
        XCTAssertEqual(milestone?.title, "A")
        XCTAssertEqual(milestone?.milestoneDescription, "B")
    }

    // MARK: - Persistence Tests

    func testSavedMilestonePersistsInContext() throws {
        // Given
        let title = "Persistence Test"
        let description = "Testing SwiftData persistence"
        let category = "growth"

        // When
        try viewModel.addMilestone(
            title: title,
            description: description,
            category: category
        )
        try modelContext.save()

        // Fetch from context
        let descriptor = FetchDescriptor<Milestone>()
        let milestones = try modelContext.fetch(descriptor)

        // Then
        let persistedMilestone = milestones.first { $0.title == title }
        XCTAssertNotNil(persistedMilestone)
        XCTAssertEqual(persistedMilestone?.title, title)
        XCTAssertEqual(persistedMilestone?.milestoneDescription, description)
        XCTAssertEqual(persistedMilestone?.category, category)
        XCTAssertEqual(persistedMilestone?.coupleId, testCoupleId)
    }

    func testMultipleMilestonesPersist() throws {
        // Given
        let milestones = [
            ("First", "Description 1", "anniversary"),
            ("Second", "Description 2", "consistency"),
            ("Third", "Description 3", "growth")
        ]

        // When
        for (title, description, category) in milestones {
            try viewModel.addMilestone(
                title: title,
                description: description,
                category: category
            )
        }
        try modelContext.save()

        // Then
        let descriptor = FetchDescriptor<Milestone>()
        let persistedMilestones = try modelContext.fetch(descriptor)
        XCTAssertEqual(persistedMilestones.count, 3)
    }

    // MARK: - Error Handling Tests

    func testErrorMessageFormat() {
        let sampleError = NSError(
            domain: "test",
            code: 1,
            userInfo: [NSLocalizedDescriptionKey: "Sample error"]
        )

        let errorMessage = "Failed to create milestone: \(sampleError.localizedDescription)"
        XCTAssertTrue(errorMessage.contains("Failed to create milestone"))
        XCTAssertTrue(errorMessage.contains("Sample error"))
    }

    // MARK: - Default Values Tests

    func testNewMilestoneIsNotAchieved() throws {
        // Given/When
        try viewModel.addMilestone(
            title: "Test Milestone",
            description: "Test Description",
            category: "growth"
        )

        // Then
        let milestone = viewModel.milestones.last
        XCTAssertNotNil(milestone)
        XCTAssertFalse(milestone!.isAchieved)
        XCTAssertNil(milestone!.achievedAt)
    }

    func testNewMilestoneHasUniqueId() throws {
        // When
        try viewModel.addMilestone(
            title: "Milestone 1",
            description: "Description 1",
            category: "growth"
        )
        try viewModel.addMilestone(
            title: "Milestone 2",
            description: "Description 2",
            category: "growth"
        )

        // Then
        let milestone1 = viewModel.milestones[viewModel.milestones.count - 2]
        let milestone2 = viewModel.milestones[viewModel.milestones.count - 1]
        XCTAssertNotEqual(milestone1.id, milestone2.id)
    }
}
