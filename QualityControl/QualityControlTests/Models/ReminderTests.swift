//
//  ReminderTests.swift
//  QualityControlTests
//
//  Phase 1.1: Model Tests
//  Comprehensive tests for Reminder model
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class ReminderTests: XCTestCase {

    var modelContext: ModelContext!
    var modelContainer: ModelContainer!
    var testUser: User!
    var testReminder: Reminder!

    override func setUp() async throws {
        (modelContainer, modelContext) = try TestModelContext.create()

        testUser = User(name: "Test User", email: "test@example.com")
        modelContext.insert(testUser)

        testReminder = Reminder(
            title: "Weekly Check-In",
            message: "Time for your relationship check-in",
            category: .checkIn,
            frequency: .weekly,
            scheduledFor: Date.daysFromNow(1),
            userId: testUser.id
        )
        modelContext.insert(testReminder)

        try modelContext.save()
    }

    override func tearDown() async throws {
        testReminder = nil
        testUser = nil
        modelContext = nil
        modelContainer = nil
    }

    // MARK: - Initialization Tests

    func testReminderInitialization() {
        // Given
        let title = "Daily Gratitude"
        let message = "Share something you're grateful for"
        let category = ReminderCategory.habit
        let frequency = ReminderFrequency.daily
        let scheduledFor = Date.daysFromNow(1)
        let userId = testUser.id

        // When
        let reminder = Reminder(
            title: title,
            message: message,
            category: category,
            frequency: frequency,
            scheduledFor: scheduledFor,
            userId: userId
        )

        // Then
        XCTAssertNotNil(reminder.id)
        XCTAssertEqual(reminder.title, title)
        XCTAssertEqual(reminder.message, message)
        XCTAssertEqual(reminder.category, category)
        XCTAssertEqual(reminder.frequency, frequency)
        assertDatesEqual(reminder.scheduledFor, scheduledFor)
        XCTAssertEqual(reminder.userId, userId)
        XCTAssertTrue(reminder.isActive) // Default
        XCTAssertFalse(reminder.isSnoozed) // Default
        XCTAssertNil(reminder.snoozeUntil)
        XCTAssertNil(reminder.completedAt)
        XCTAssertNotNil(reminder.createdAt)
    }

    func testReminderIdIsUnique() {
        // When
        let reminder1 = Reminder(title: "Reminder 1", message: "Msg 1", category: .checkIn, frequency: .once, scheduledFor: Date(), userId: testUser.id)
        let reminder2 = Reminder(title: "Reminder 2", message: "Msg 2", category: .checkIn, frequency: .once, scheduledFor: Date(), userId: testUser.id)

        // Then
        XCTAssertNotEqual(reminder1.id, reminder2.id)
    }

    func testReminderCreatedAtIsSet() {
        // Given
        let beforeCreation = Date()

        // When
        let reminder = Reminder(title: "Test", message: "Test", category: .checkIn, frequency: .once, scheduledFor: Date(), userId: testUser.id)

        // Then
        let afterCreation = Date()
        XCTAssertGreaterThanOrEqual(reminder.createdAt, beforeCreation)
        XCTAssertLessThanOrEqual(reminder.createdAt, afterCreation)
    }

    // MARK: - Property Tests

    func testTitleUpdatePersists() throws {
        // Given
        let newTitle = "Updated Reminder Title"

        // When
        testReminder.title = newTitle
        try modelContext.save()

        // Then
        XCTAssertEqual(testReminder.title, newTitle)
    }

    func testMessageUpdatePersists() throws {
        // Given
        let newMessage = "Updated reminder message"

        // When
        testReminder.message = newMessage
        try modelContext.save()

        // Then
        XCTAssertEqual(testReminder.message, newMessage)
    }

    func testScheduledForUpdatePersists() throws {
        // Given
        let newDate = Date.daysFromNow(7)

        // When
        testReminder.scheduledFor = newDate
        try modelContext.save()

        // Then
        assertDatesEqual(testReminder.scheduledFor, newDate)
    }

    // MARK: - Active/Inactive Tests

    func testReminderIsActiveByDefault() {
        // Then
        XCTAssertTrue(testReminder.isActive)
    }

    func testCanDeactivateReminder() throws {
        // When
        testReminder.isActive = false
        try modelContext.save()

        // Then
        XCTAssertFalse(testReminder.isActive)
    }

    func testCanReactivateReminder() throws {
        // Given
        testReminder.isActive = false
        try modelContext.save()

        // When
        testReminder.isActive = true
        try modelContext.save()

        // Then
        XCTAssertTrue(testReminder.isActive)
    }

    // MARK: - Snooze Tests

    func testReminderIsNotSnoozedByDefault() {
        // Then
        XCTAssertFalse(testReminder.isSnoozed)
        XCTAssertNil(testReminder.snoozeUntil)
    }

    func testCanSnoozeReminder() throws {
        // Given
        let snoozeUntil = Date.hoursFromNow(1)

        // When
        testReminder.isSnoozed = true
        testReminder.snoozeUntil = snoozeUntil
        try modelContext.save()

        // Then
        XCTAssertTrue(testReminder.isSnoozed)
        assertDatesEqual(testReminder.snoozeUntil!, snoozeUntil)
    }

    func testCanUnsnoozeReminder() throws {
        // Given
        testReminder.isSnoozed = true
        testReminder.snoozeUntil = Date.hoursFromNow(1)
        try modelContext.save()

        // When
        testReminder.isSnoozed = false
        testReminder.snoozeUntil = nil
        try modelContext.save()

        // Then
        XCTAssertFalse(testReminder.isSnoozed)
        XCTAssertNil(testReminder.snoozeUntil)
    }

    // MARK: - Completion Tests

    func testCompletedAtInitiallyNil() {
        // Then
        XCTAssertNil(testReminder.completedAt)
    }

    func testCanCompleteReminder() throws {
        // Given
        let completionTime = Date()

        // When
        testReminder.completedAt = completionTime
        try modelContext.save()

        // Then
        assertDatesEqual(testReminder.completedAt!, completionTime)
    }

    func testCanClearCompletion() throws {
        // Given
        testReminder.completedAt = Date()
        try modelContext.save()

        // When
        testReminder.completedAt = nil
        try modelContext.save()

        // Then
        XCTAssertNil(testReminder.completedAt)
    }

    // MARK: - Category Tests

    func testAllReminderCategories() {
        // When/Then
        let categories: [ReminderCategory] = [.checkIn, .habit, .actionItem, .partnerMoment, .specialOccasion]

        for category in categories {
            let reminder = Reminder(
                title: "Test",
                message: "Test",
                category: category,
                frequency: .once,
                scheduledFor: Date(),
                userId: testUser.id
            )
            XCTAssertEqual(reminder.category, category)
        }
    }

    func testCategoryUpdatePersists() throws {
        // When
        testReminder.category = .habit
        try modelContext.save()

        // Then
        XCTAssertEqual(testReminder.category, .habit)
    }

    // MARK: - Frequency Tests

    func testAllReminderFrequencies() {
        // When/Then
        let frequencies: [ReminderFrequency] = [.once, .daily, .weekly, .monthly, .custom]

        for frequency in frequencies {
            let reminder = Reminder(
                title: "Test",
                message: "Test",
                category: .checkIn,
                frequency: frequency,
                scheduledFor: Date(),
                userId: testUser.id
            )
            XCTAssertEqual(reminder.frequency, frequency)
        }
    }

    func testFrequencyUpdatePersists() throws {
        // When
        testReminder.frequency = .daily
        try modelContext.save()

        // Then
        XCTAssertEqual(testReminder.frequency, .daily)
    }

    // MARK: - Persistence Tests

    func testReminderPersistsInContext() throws {
        // When
        let descriptor = FetchDescriptor<Reminder>()
        let reminders = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(reminders, 1)
        XCTAssertEqual(reminders.first?.id, testReminder.id)
    }

    func testReminderCanBeDeleted() throws {
        // When
        modelContext.delete(testReminder)
        try modelContext.save()

        // Then
        let descriptor = FetchDescriptor<Reminder>()
        let reminders = try modelContext.fetch(descriptor)
        XCTAssertEmpty(reminders)
    }

    func testMultipleRemindersPersist() throws {
        // Given
        let reminder2 = Reminder(title: "Reminder 2", message: "Msg 2", category: .habit, frequency: .daily, scheduledFor: Date(), userId: testUser.id)
        let reminder3 = Reminder(title: "Reminder 3", message: "Msg 3", category: .actionItem, frequency: .once, scheduledFor: Date(), userId: testUser.id)
        modelContext.insert(reminder2)
        modelContext.insert(reminder3)

        // When
        try modelContext.save()

        // Then
        let descriptor = FetchDescriptor<Reminder>()
        let reminders = try modelContext.fetch(descriptor)
        XCTAssertCount(reminders, 3)
    }

    // MARK: - Query Tests

    func testFetchReminderById() throws {
        // Given
        let targetId = testReminder.id

        // When
        let descriptor = FetchDescriptor<Reminder>(
            predicate: #Predicate { $0.id == targetId }
        )
        let reminders = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(reminders, 1)
        XCTAssertEqual(reminders.first?.id, targetId)
    }

    func testFetchRemindersByUserId() throws {
        // Given
        let otherUser = User(name: "Other User", email: "other@example.com")
        modelContext.insert(otherUser)
        let otherReminder = Reminder(title: "Other", message: "Msg", category: .checkIn, frequency: .once, scheduledFor: Date(), userId: otherUser.id)
        modelContext.insert(otherReminder)
        try modelContext.save()

        let targetUserId = testUser.id

        // When
        let descriptor = FetchDescriptor<Reminder>(
            predicate: #Predicate { $0.userId == targetUserId }
        )
        let reminders = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(reminders, 1)
        XCTAssertEqual(reminders.first?.userId, targetUserId)
    }

    func testFetchRemindersByCategory() throws {
        // Given
        let habitReminder = Reminder(title: "Habit", message: "Msg", category: .habit, frequency: .daily, scheduledFor: Date(), userId: testUser.id)
        modelContext.insert(habitReminder)
        try modelContext.save()

        let targetCategory: ReminderCategory = .checkIn

        // When
        let descriptor = FetchDescriptor<Reminder>(
            predicate: #Predicate { $0.category == targetCategory }
        )
        let reminders = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(reminders, 1)
        XCTAssertEqual(reminders.first?.category, .checkIn)
    }

    func testFetchActiveReminders() throws {
        // Given
        let inactiveReminder = Reminder(title: "Inactive", message: "Msg", category: .checkIn, frequency: .once, scheduledFor: Date(), userId: testUser.id)
        inactiveReminder.isActive = false
        modelContext.insert(inactiveReminder)
        try modelContext.save()

        // When
        let descriptor = FetchDescriptor<Reminder>(
            predicate: #Predicate { $0.isActive == true }
        )
        let reminders = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(reminders, 1)
        XCTAssertTrue(reminders.first?.isActive ?? false)
    }

    func testFetchRemindersByScheduledDateRange() throws {
        // Given
        let tomorrow = Date.daysFromNow(1)
        let nextWeek = Date.daysFromNow(7)
        let nextMonth = Date.daysFromNow(30)

        testReminder.scheduledFor = nextWeek
        let tomorrowReminder = Reminder(title: "Tomorrow", message: "Msg", category: .checkIn, frequency: .once, scheduledFor: tomorrow, userId: testUser.id)
        let nextMonthReminder = Reminder(title: "Next Month", message: "Msg", category: .checkIn, frequency: .once, scheduledFor: nextMonth, userId: testUser.id)
        modelContext.insert(tomorrowReminder)
        modelContext.insert(nextMonthReminder)
        try modelContext.save()

        // When - Fetch all reminders and filter in Swift
        let descriptor = FetchDescriptor<Reminder>()
        let allReminders = try modelContext.fetch(descriptor)
        let now = Date()
        let twoWeeks = Date.daysFromNow(14)
        let reminders = allReminders.filter { $0.scheduledFor >= now && $0.scheduledFor <= twoWeeks }

        // Then
        XCTAssertCount(reminders, 2) // tomorrow and nextWeek, but not nextMonth
    }
}
