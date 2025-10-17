//
//  ActionItemTests.swift
//  QualityControlTests
//
//  Phase 1.1: Model Tests
//  Comprehensive tests for ActionItem model
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class ActionItemTests: XCTestCase {

    var modelContext: ModelContext!
    var modelContainer: ModelContainer!
    var testCheckInSession: CheckInSession!
    var testActionItem: ActionItem!

    override func setUp() async throws {
        (modelContainer, modelContext) = try TestModelContext.create()

        let couple = Couple(relationshipStartDate: Date())
        modelContext.insert(couple)

        testCheckInSession = CheckInSession(coupleId: couple.id)
        modelContext.insert(testCheckInSession)

        testActionItem = ActionItem(title: "Test action item", checkInId: testCheckInSession.id)
        modelContext.insert(testActionItem)

        try modelContext.save()
    }

    override func tearDown() async throws {
        testActionItem = nil
        testCheckInSession = nil
        modelContext = nil
        modelContainer = nil
    }

    // MARK: - Initialization Tests

    func testActionItemInitialization() {
        // Given
        let title = "Follow up on finances"
        let checkInId = testCheckInSession.id

        // When
        let item = ActionItem(title: title, checkInId: checkInId)

        // Then
        XCTAssertNotNil(item.id)
        XCTAssertEqual(item.title, title)
        XCTAssertEqual(item.checkInId, checkInId)
        XCTAssertEqual(item.priority, .medium) // Default
        XCTAssertFalse(item.completed) // Default
        XCTAssertNil(item.completedAt)
        XCTAssertNil(item.itemDescription)
        XCTAssertNil(item.assignedTo)
        XCTAssertNil(item.dueDate)
        XCTAssertNotNil(item.createdAt)
    }

    func testActionItemIdIsUnique() {
        // When
        let item1 = ActionItem(title: "Item 1", checkInId: testCheckInSession.id)
        let item2 = ActionItem(title: "Item 2", checkInId: testCheckInSession.id)

        // Then
        XCTAssertNotEqual(item1.id, item2.id)
    }

    func testActionItemCreatedAtIsSet() {
        // Given
        let beforeCreation = Date()

        // When
        let item = ActionItem(title: "Test", checkInId: testCheckInSession.id)

        // Then
        let afterCreation = Date()
        XCTAssertGreaterThanOrEqual(item.createdAt, beforeCreation)
        XCTAssertLessThanOrEqual(item.createdAt, afterCreation)
    }

    // MARK: - Property Tests

    func testTitleUpdatePersists() throws {
        // Given
        let newTitle = "Updated action item"

        // When
        testActionItem.title = newTitle
        try modelContext.save()

        // Then
        XCTAssertEqual(testActionItem.title, newTitle)
    }

    func testDescriptionUpdatePersists() throws {
        // Given
        let description = "This is a detailed description"

        // When
        testActionItem.itemDescription = description
        try modelContext.save()

        // Then
        XCTAssertEqual(testActionItem.itemDescription, description)
    }

    func testAssignedToUpdatePersists() throws {
        // Given
        let userId = UUID()

        // When
        testActionItem.assignedTo = userId
        try modelContext.save()

        // Then
        XCTAssertEqual(testActionItem.assignedTo, userId)
    }

    func testDueDateUpdatePersists() throws {
        // Given
        let dueDate = Date.daysFromNow(7)

        // When
        testActionItem.dueDate = dueDate
        try modelContext.save()

        // Then
        assertDatesEqual(testActionItem.dueDate!, dueDate)
    }

    // MARK: - Completion Tests

    func testMarkActionItemAsCompleted() throws {
        // Given
        let completionTime = Date()

        // When
        testActionItem.completed = true
        testActionItem.completedAt = completionTime
        try modelContext.save()

        // Then
        XCTAssertTrue(testActionItem.completed)
        assertDatesEqual(testActionItem.completedAt!, completionTime)
    }

    func testMarkActionItemAsIncomplete() throws {
        // Given
        testActionItem.completed = true
        testActionItem.completedAt = Date()
        try modelContext.save()

        // When
        testActionItem.completed = false
        testActionItem.completedAt = nil
        try modelContext.save()

        // Then
        XCTAssertFalse(testActionItem.completed)
        XCTAssertNil(testActionItem.completedAt)
    }

    func testCompletedAtIsNilForIncompleteItem() {
        // Then
        XCTAssertFalse(testActionItem.completed)
        XCTAssertNil(testActionItem.completedAt)
    }

    // MARK: - Priority Tests

    func testDefaultPriorityIsMedium() {
        // Then
        XCTAssertEqual(testActionItem.priority, .medium)
    }

    func testSetPriorityToLow() throws {
        // When
        testActionItem.priority = .low
        try modelContext.save()

        // Then
        XCTAssertEqual(testActionItem.priority, .low)
        XCTAssertEqual(testActionItem.priority.color, "gray")
    }

    func testSetPriorityToHigh() throws {
        // When
        testActionItem.priority = .high
        try modelContext.save()

        // Then
        XCTAssertEqual(testActionItem.priority, .high)
        XCTAssertEqual(testActionItem.priority.color, "red")
    }

    func testPriorityColors() {
        // When/Then
        XCTAssertEqual(Priority.low.color, "gray")
        XCTAssertEqual(Priority.medium.color, "yellow")
        XCTAssertEqual(Priority.high.color, "red")
    }

    // MARK: - Persistence Tests

    func testActionItemPersistsInContext() throws {
        // When
        let descriptor = FetchDescriptor<ActionItem>()
        let items = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(items, 1)
        XCTAssertEqual(items.first?.id, testActionItem.id)
    }

    func testActionItemCanBeDeleted() throws {
        // When
        modelContext.delete(testActionItem)
        try modelContext.save()

        // Then
        let descriptor = FetchDescriptor<ActionItem>()
        let items = try modelContext.fetch(descriptor)
        XCTAssertEmpty(items)
    }

    func testMultipleActionItemsPersist() throws {
        // Given
        let item2 = ActionItem(title: "Item 2", checkInId: testCheckInSession.id)
        let item3 = ActionItem(title: "Item 3", checkInId: testCheckInSession.id)
        modelContext.insert(item2)
        modelContext.insert(item3)

        // When
        try modelContext.save()

        // Then
        let descriptor = FetchDescriptor<ActionItem>()
        let items = try modelContext.fetch(descriptor)
        XCTAssertCount(items, 3)
    }

    // MARK: - Query Tests

    func testFetchActionItemById() throws {
        // Given
        let targetId = testActionItem.id

        // When
        let descriptor = FetchDescriptor<ActionItem>(
            predicate: #Predicate { $0.id == targetId }
        )
        let items = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(items, 1)
        XCTAssertEqual(items.first?.id, targetId)
    }

    func testFetchActionItemsByCheckInId() throws {
        // Given
        let checkInId = testCheckInSession.id

        // When
        let descriptor = FetchDescriptor<ActionItem>(
            predicate: #Predicate { $0.checkInId == checkInId }
        )
        let items = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(items, 1)
        XCTAssertEqual(items.first?.checkInId, checkInId)
    }

    func testFetchCompletedActionItems() throws {
        // Given
        testActionItem.completed = true
        testActionItem.completedAt = Date()
        let incompleteItem = ActionItem(title: "Incomplete", checkInId: testCheckInSession.id)
        modelContext.insert(incompleteItem)
        try modelContext.save()

        // When
        let descriptor = FetchDescriptor<ActionItem>(
            predicate: #Predicate { $0.completed == true }
        )
        let items = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(items, 1)
        XCTAssertTrue(items.first?.completed ?? false)
    }

    func testFetchActionItemsByPriority() throws {
        // Given
        testActionItem.priority = .high
        let mediumItem = ActionItem(title: "Medium priority", checkInId: testCheckInSession.id)
        mediumItem.priority = .medium
        let lowItem = ActionItem(title: "Low priority", checkInId: testCheckInSession.id)
        lowItem.priority = .low
        modelContext.insert(mediumItem)
        modelContext.insert(lowItem)
        try modelContext.save()

        let targetPriority: Priority = .high

        // When - Fetch all and filter (enum predicates not supported)
        let descriptor = FetchDescriptor<ActionItem>()
        let allItems = try modelContext.fetch(descriptor)
        let items = allItems.filter { $0.priority == targetPriority }

        // Then
        XCTAssertCount(items, 1)
        XCTAssertEqual(items.first?.priority, .high)
    }

    func testFetchActionItemsByAssignee() throws {
        // Given
        let userId = UUID()
        testActionItem.assignedTo = userId
        let unassignedItem = ActionItem(title: "Unassigned", checkInId: testCheckInSession.id)
        modelContext.insert(unassignedItem)
        try modelContext.save()

        // When
        let descriptor = FetchDescriptor<ActionItem>(
            predicate: #Predicate { $0.assignedTo == userId }
        )
        let items = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(items, 1)
        XCTAssertEqual(items.first?.assignedTo, userId)
    }
}
