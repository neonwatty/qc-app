//
//  MilestoneTests.swift
//  QualityControlTests
//
//  Phase 1.1: Model Tests
//  Comprehensive tests for Milestone model
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class MilestoneTests: XCTestCase {

    var modelContext: ModelContext!
    var testCouple: Couple!
    var testMilestone: Milestone!

    override func setUp() async throws {
        modelContext = try TestModelContext.create()

        testCouple = Couple(relationshipStartDate: Date())
        modelContext.insert(testCouple)

        testMilestone = Milestone(
            title: "First Anniversary",
            description: "Celebrating one year together",
            category: "Anniversary",
            coupleId: testCouple.id
        )
        modelContext.insert(testMilestone)

        try modelContext.save()
    }

    override func tearDown() async throws {
        testMilestone = nil
        testCouple = nil
        modelContext = nil
    }

    // MARK: - Initialization Tests

    func testMilestoneInitialization() {
        // Given
        let title = "First Date"
        let description = "Our very first date together"
        let category = "Relationship"
        let coupleId = testCouple.id

        // When
        let milestone = Milestone(
            title: title,
            description: description,
            category: category,
            coupleId: coupleId
        )

        // Then
        XCTAssertNotNil(milestone.id)
        XCTAssertEqual(milestone.title, title)
        XCTAssertEqual(milestone.milestoneDescription, description)
        XCTAssertEqual(milestone.category, category)
        XCTAssertEqual(milestone.coupleId, coupleId)
        XCTAssertFalse(milestone.isAchieved) // Default
        XCTAssertNil(milestone.achievedAt)
        XCTAssertNil(milestone.targetDate)
    }

    func testMilestoneIdIsUnique() {
        // When
        let milestone1 = Milestone(title: "Milestone 1", description: "Desc 1", category: "Cat 1", coupleId: testCouple.id)
        let milestone2 = Milestone(title: "Milestone 2", description: "Desc 2", category: "Cat 2", coupleId: testCouple.id)

        // Then
        XCTAssertNotEqual(milestone1.id, milestone2.id)
    }

    // MARK: - Property Tests

    func testTitleUpdatePersists() throws {
        // Given
        let newTitle = "Updated Milestone Title"

        // When
        testMilestone.title = newTitle
        try modelContext.save()

        // Then
        XCTAssertEqual(testMilestone.title, newTitle)
    }

    func testDescriptionUpdatePersists() throws {
        // Given
        let newDescription = "Updated milestone description"

        // When
        testMilestone.milestoneDescription = newDescription
        try modelContext.save()

        // Then
        XCTAssertEqual(testMilestone.milestoneDescription, newDescription)
    }

    func testCategoryUpdatePersists() throws {
        // Given
        let newCategory = "Achievement"

        // When
        testMilestone.category = newCategory
        try modelContext.save()

        // Then
        XCTAssertEqual(testMilestone.category, newCategory)
    }

    // MARK: - Achievement Tests

    func testMilestoneNotAchievedByDefault() {
        // Then
        XCTAssertFalse(testMilestone.isAchieved)
        XCTAssertNil(testMilestone.achievedAt)
    }

    func testMarkMilestoneAsAchieved() throws {
        // Given
        let achievedDate = Date()

        // When
        testMilestone.isAchieved = true
        testMilestone.achievedAt = achievedDate
        try modelContext.save()

        // Then
        XCTAssertTrue(testMilestone.isAchieved)
        assertDatesEqual(testMilestone.achievedAt!, achievedDate)
    }

    func testUnmarkMilestoneAchievement() throws {
        // Given
        testMilestone.isAchieved = true
        testMilestone.achievedAt = Date()
        try modelContext.save()

        // When
        testMilestone.isAchieved = false
        testMilestone.achievedAt = nil
        try modelContext.save()

        // Then
        XCTAssertFalse(testMilestone.isAchieved)
        XCTAssertNil(testMilestone.achievedAt)
    }

    func testAchievedAtDateTracking() throws {
        // Given
        let beforeAchievement = Date()
        Thread.sleep(forTimeInterval: 0.1)

        // When
        let achievedTime = Date()
        testMilestone.isAchieved = true
        testMilestone.achievedAt = achievedTime
        try modelContext.save()

        // Then
        XCTAssertGreaterThan(testMilestone.achievedAt!, beforeAchievement)
    }

    // MARK: - Target Date Tests

    func testTargetDateInitiallyNil() {
        // Then
        XCTAssertNil(testMilestone.targetDate)
    }

    func testSetTargetDate() throws {
        // Given
        let targetDate = Date.daysFromNow(30)

        // When
        testMilestone.targetDate = targetDate
        try modelContext.save()

        // Then
        assertDatesEqual(testMilestone.targetDate!, targetDate)
    }

    func testClearTargetDate() throws {
        // Given
        testMilestone.targetDate = Date.daysFromNow(30)
        try modelContext.save()

        // When
        testMilestone.targetDate = nil
        try modelContext.save()

        // Then
        XCTAssertNil(testMilestone.targetDate)
    }

    func testTargetDateInFuture() throws {
        // Given
        let futureDate = Date.daysFromNow(60)

        // When
        testMilestone.targetDate = futureDate
        try modelContext.save()

        // Then
        XCTAssertGreaterThan(testMilestone.targetDate!, Date())
    }

    // MARK: - Category Tests

    func testMultipleMilestonesWithDifferentCategories() throws {
        // Given
        let anniversary = Milestone(title: "Anniversary", description: "Yearly celebration", category: "Anniversary", coupleId: testCouple.id)
        let achievement = Milestone(title: "Achievement", description: "Major accomplishment", category: "Achievement", coupleId: testCouple.id)
        let travel = Milestone(title: "Travel", description: "First trip together", category: "Travel", coupleId: testCouple.id)
        modelContext.insert(anniversary)
        modelContext.insert(achievement)
        modelContext.insert(travel)

        // When
        try modelContext.save()

        // Then
        XCTAssertEqual(anniversary.category, "Anniversary")
        XCTAssertEqual(achievement.category, "Achievement")
        XCTAssertEqual(travel.category, "Travel")
    }

    // MARK: - Persistence Tests

    func testMilestonePersistsInContext() throws {
        // When
        let descriptor = FetchDescriptor<Milestone>()
        let milestones = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(milestones, 1)
        XCTAssertEqual(milestones.first?.id, testMilestone.id)
    }

    func testMilestoneCanBeDeleted() throws {
        // When
        modelContext.delete(testMilestone)
        try modelContext.save()

        // Then
        let descriptor = FetchDescriptor<Milestone>()
        let milestones = try modelContext.fetch(descriptor)
        XCTAssertEmpty(milestones)
    }

    func testMultipleMilestonesPersist() throws {
        // Given
        let milestone2 = Milestone(title: "Milestone 2", description: "Desc 2", category: "Cat 2", coupleId: testCouple.id)
        let milestone3 = Milestone(title: "Milestone 3", description: "Desc 3", category: "Cat 3", coupleId: testCouple.id)
        modelContext.insert(milestone2)
        modelContext.insert(milestone3)

        // When
        try modelContext.save()

        // Then
        let descriptor = FetchDescriptor<Milestone>()
        let milestones = try modelContext.fetch(descriptor)
        XCTAssertCount(milestones, 3)
    }

    // MARK: - Query Tests

    func testFetchMilestoneById() throws {
        // Given
        let targetId = testMilestone.id

        // When
        let descriptor = FetchDescriptor<Milestone>(
            predicate: #Predicate { $0.id == targetId }
        )
        let milestones = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(milestones, 1)
        XCTAssertEqual(milestones.first?.id, targetId)
    }

    func testFetchMilestonesByCoupleId() throws {
        // Given
        let otherCouple = Couple(relationshipStartDate: Date())
        modelContext.insert(otherCouple)
        let otherMilestone = Milestone(title: "Other Milestone", description: "Other desc", category: "Other", coupleId: otherCouple.id)
        modelContext.insert(otherMilestone)
        try modelContext.save()

        let targetCoupleId = testCouple.id

        // When
        let descriptor = FetchDescriptor<Milestone>(
            predicate: #Predicate { $0.coupleId == targetCoupleId }
        )
        let milestones = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(milestones, 1)
        XCTAssertEqual(milestones.first?.coupleId, targetCoupleId)
    }

    func testFetchAchievedMilestones() throws {
        // Given
        testMilestone.isAchieved = true
        testMilestone.achievedAt = Date()
        let unachievedMilestone = Milestone(title: "Unachieved", description: "Not yet achieved", category: "Future", coupleId: testCouple.id)
        modelContext.insert(unachievedMilestone)
        try modelContext.save()

        // When
        let descriptor = FetchDescriptor<Milestone>(
            predicate: #Predicate { $0.isAchieved == true }
        )
        let milestones = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(milestones, 1)
        XCTAssertTrue(milestones.first?.isAchieved ?? false)
    }

    func testFetchUnachievedMilestones() throws {
        // Given
        testMilestone.isAchieved = false
        let achievedMilestone = Milestone(title: "Achieved", description: "Already done", category: "Past", coupleId: testCouple.id)
        achievedMilestone.isAchieved = true
        achievedMilestone.achievedAt = Date()
        modelContext.insert(achievedMilestone)
        try modelContext.save()

        // When
        let descriptor = FetchDescriptor<Milestone>(
            predicate: #Predicate { $0.isAchieved == false }
        )
        let milestones = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(milestones, 1)
        XCTAssertFalse(milestones.first?.isAchieved ?? true)
    }

    func testFetchMilestonesByCategory() throws {
        // Given
        let anniversary1 = Milestone(title: "1 Year", description: "First year", category: "Anniversary", coupleId: testCouple.id)
        let anniversary2 = Milestone(title: "2 Years", description: "Second year", category: "Anniversary", coupleId: testCouple.id)
        let achievement = Milestone(title: "Achievement", description: "Major win", category: "Achievement", coupleId: testCouple.id)
        modelContext.insert(anniversary1)
        modelContext.insert(anniversary2)
        modelContext.insert(achievement)
        try modelContext.save()

        // When
        let descriptor = FetchDescriptor<Milestone>(
            predicate: #Predicate { $0.category == "Anniversary" }
        )
        let milestones = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(milestones, 3) // testMilestone + anniversary1 + anniversary2
    }
}
