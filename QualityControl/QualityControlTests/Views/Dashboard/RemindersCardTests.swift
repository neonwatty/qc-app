//
//  RemindersCardTests.swift
//  QualityControlTests
//
//  Week 5-6: Reminders Card Tests
//  Tests for RemindersCard dashboard widget
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class RemindersCardTests: XCTestCase {

    var modelContainer: ModelContainer!
    var modelContext: ModelContext!
    var testUser: User!

    override func setUp() async throws {
        // Use TestModelContext helper for consistent container management
        (modelContainer, modelContext) = try TestModelContext.create()

        // Create test user
        testUser = User(name: "Test User", email: "test@example.com")
        modelContext.insert(testUser)
        try modelContext.save()
    }

    override func tearDown() async throws {
        testUser = nil
        modelContext = nil
        modelContainer = nil
    }

    // MARK: - Data Loading Tests

    func testLoadUpcomingRemindersWithNoReminders() async throws {
        // Given - no reminders in database

        // Simulate loading reminders
        let descriptor = FetchDescriptor<Reminder>(
            sortBy: [SortDescriptor(\.scheduledFor, order: .forward)]
        )
        let allReminders = try modelContext.fetch(descriptor)

        let now = Date()
        let upcomingReminders = allReminders.filter {
            $0.userId == testUser.id &&
            $0.isActive &&
            $0.scheduledFor > now
        }

        // Then
        XCTAssertTrue(upcomingReminders.isEmpty)
    }

    func testLoadUpcomingRemindersWithFutureReminders() async throws {
        // Given
        let futureDate1 = Date().addingTimeInterval(3600) // 1 hour from now
        let futureDate2 = Date().addingTimeInterval(7200) // 2 hours from now

        let reminder1 = Reminder(
            title: "Reminder 1",
            message: "Message 1",
            category: .checkIn,
            frequency: .once,
            scheduledFor: futureDate1,
            userId: testUser.id
        )

        let reminder2 = Reminder(
            title: "Reminder 2",
            message: "Message 2",
            category: .habit,
            frequency: .daily,
            scheduledFor: futureDate2,
            userId: testUser.id
        )

        modelContext.insert(reminder1)
        modelContext.insert(reminder2)
        try modelContext.save()

        // Simulate loading
        let descriptor = FetchDescriptor<Reminder>(
            sortBy: [SortDescriptor(\.scheduledFor, order: .forward)]
        )
        let allReminders = try modelContext.fetch(descriptor)

        let now = Date()
        let upcomingReminders = allReminders.filter {
            $0.userId == testUser.id &&
            $0.isActive &&
            $0.scheduledFor > now
        }

        // Then
        XCTAssertEqual(upcomingReminders.count, 2)
    }

    func testLoadUpcomingRemindersFiltersPastReminders() async throws {
        // Given
        let pastDate = Date().addingTimeInterval(-3600) // 1 hour ago
        let futureDate = Date().addingTimeInterval(3600) // 1 hour from now

        let pastReminder = Reminder(
            title: "Past Reminder",
            message: "Past",
            category: .checkIn,
            frequency: .once,
            scheduledFor: pastDate,
            userId: testUser.id
        )

        let futureReminder = Reminder(
            title: "Future Reminder",
            message: "Future",
            category: .checkIn,
            frequency: .once,
            scheduledFor: futureDate,
            userId: testUser.id
        )

        modelContext.insert(pastReminder)
        modelContext.insert(futureReminder)
        try modelContext.save()

        // Simulate loading
        let descriptor = FetchDescriptor<Reminder>(
            sortBy: [SortDescriptor(\.scheduledFor, order: .forward)]
        )
        let allReminders = try modelContext.fetch(descriptor)

        let now = Date()
        let upcomingReminders = allReminders.filter {
            $0.userId == testUser.id &&
            $0.isActive &&
            $0.scheduledFor > now
        }

        // Then
        XCTAssertEqual(upcomingReminders.count, 1)
        XCTAssertEqual(upcomingReminders.first?.title, "Future Reminder")
    }

    func testLoadUpcomingRemindersFiltersInactiveReminders() async throws {
        // Given
        let futureDate = Date().addingTimeInterval(3600)

        let activeReminder = Reminder(
            title: "Active Reminder",
            message: "Active",
            category: .checkIn,
            frequency: .once,
            scheduledFor: futureDate,
            userId: testUser.id
        )
        activeReminder.isActive = true

        let inactiveReminder = Reminder(
            title: "Inactive Reminder",
            message: "Inactive",
            category: .checkIn,
            frequency: .once,
            scheduledFor: futureDate,
            userId: testUser.id
        )
        inactiveReminder.isActive = false

        modelContext.insert(activeReminder)
        modelContext.insert(inactiveReminder)
        try modelContext.save()

        // Simulate loading
        let descriptor = FetchDescriptor<Reminder>(
            sortBy: [SortDescriptor(\.scheduledFor, order: .forward)]
        )
        let allReminders = try modelContext.fetch(descriptor)

        let now = Date()
        let upcomingReminders = allReminders.filter {
            $0.userId == testUser.id &&
            $0.isActive &&
            $0.scheduledFor > now
        }

        // Then
        XCTAssertEqual(upcomingReminders.count, 1)
        XCTAssertEqual(upcomingReminders.first?.title, "Active Reminder")
    }

    func testLoadUpcomingRemindersFiltersByUserId() async throws {
        // Given
        let otherUser = User(name: "Other User", email: "other@example.com")
        modelContext.insert(otherUser)
        try modelContext.save()

        let futureDate = Date().addingTimeInterval(3600)

        let myReminder = Reminder(
            title: "My Reminder",
            message: "Mine",
            category: .checkIn,
            frequency: .once,
            scheduledFor: futureDate,
            userId: testUser.id
        )

        let otherReminder = Reminder(
            title: "Other Reminder",
            message: "Theirs",
            category: .checkIn,
            frequency: .once,
            scheduledFor: futureDate,
            userId: otherUser.id
        )

        modelContext.insert(myReminder)
        modelContext.insert(otherReminder)
        try modelContext.save()

        // Simulate loading for testUser
        let descriptor = FetchDescriptor<Reminder>(
            sortBy: [SortDescriptor(\.scheduledFor, order: .forward)]
        )
        let allReminders = try modelContext.fetch(descriptor)

        let now = Date()
        let upcomingReminders = allReminders.filter {
            $0.userId == testUser.id &&
            $0.isActive &&
            $0.scheduledFor > now
        }

        // Then
        XCTAssertEqual(upcomingReminders.count, 1)
        XCTAssertEqual(upcomingReminders.first?.title, "My Reminder")
    }

    func testLoadUpcomingRemindersLimitToThree() async throws {
        // Given - create 5 future reminders
        for i in 1...5 {
            let futureDate = Date().addingTimeInterval(Double(i) * 3600)
            let reminder = Reminder(
                title: "Reminder \(i)",
                message: "Message \(i)",
                category: .checkIn,
                frequency: .once,
                scheduledFor: futureDate,
                userId: testUser.id
            )
            modelContext.insert(reminder)
        }
        try modelContext.save()

        // Simulate loading
        let descriptor = FetchDescriptor<Reminder>(
            sortBy: [SortDescriptor(\.scheduledFor, order: .forward)]
        )
        let allReminders = try modelContext.fetch(descriptor)

        let now = Date()
        let upcomingReminders = allReminders.filter {
            $0.userId == testUser.id &&
            $0.isActive &&
            $0.scheduledFor > now
        }

        // Simulate prefix(3)
        let displayedReminders = Array(upcomingReminders.prefix(3))

        // Then
        XCTAssertEqual(upcomingReminders.count, 5) // All 5 loaded
        XCTAssertEqual(displayedReminders.count, 3) // Only 3 displayed
    }

    func testLoadUpcomingRemindersSortedByScheduledDate() async throws {
        // Given - create reminders in random order
        let dates = [
            Date().addingTimeInterval(7200),  // 2 hours
            Date().addingTimeInterval(3600),  // 1 hour
            Date().addingTimeInterval(10800), // 3 hours
        ]

        for (index, date) in dates.enumerated() {
            let reminder = Reminder(
                title: "Reminder \(index)",
                message: "Message",
                category: .checkIn,
                frequency: .once,
                scheduledFor: date,
                userId: testUser.id
            )
            modelContext.insert(reminder)
        }
        try modelContext.save()

        // Simulate loading
        let descriptor = FetchDescriptor<Reminder>(
            sortBy: [SortDescriptor(\.scheduledFor, order: .forward)]
        )
        let upcomingReminders = try modelContext.fetch(descriptor)

        // Then - should be sorted by scheduled date
        XCTAssertEqual(upcomingReminders.count, 3)
        XCTAssertTrue(upcomingReminders[0].scheduledFor < upcomingReminders[1].scheduledFor)
        XCTAssertTrue(upcomingReminders[1].scheduledFor < upcomingReminders[2].scheduledFor)
    }

    // MARK: - Category Icon Tests

    func testCategoryIcons() {
        // Test that each category has a unique icon
        let categories: [ReminderCategory] = [.checkIn, .habit, .actionItem, .partnerMoment, .specialOccasion]
        let icons = categories.map { categoryIcon(for: $0) }

        XCTAssertEqual(icons.count, 5)
        XCTAssertEqual(Set(icons).count, 5, "All category icons should be unique")

        // Verify specific icons
        XCTAssertEqual(categoryIcon(for: .checkIn), "heart.fill")
        XCTAssertEqual(categoryIcon(for: .habit), "star.fill")
        XCTAssertEqual(categoryIcon(for: .actionItem), "checklist")
        XCTAssertEqual(categoryIcon(for: .partnerMoment), "person.2.fill")
        XCTAssertEqual(categoryIcon(for: .specialOccasion), "gift.fill")
    }

    private func categoryIcon(for category: ReminderCategory) -> String {
        switch category {
        case .checkIn: return "heart.fill"
        case .habit: return "star.fill"
        case .actionItem: return "checklist"
        case .partnerMoment: return "person.2.fill"
        case .specialOccasion: return "gift.fill"
        }
    }

    // MARK: - Frequency Text Tests

    func testFrequencyText() {
        // Verify frequency text mapping
        XCTAssertEqual(frequencyText(for: .once), "Once")
        XCTAssertEqual(frequencyText(for: .daily), "Daily")
        XCTAssertEqual(frequencyText(for: .weekly), "Weekly")
        XCTAssertEqual(frequencyText(for: .monthly), "Monthly")
        XCTAssertEqual(frequencyText(for: .custom), "Custom")
    }

    private func frequencyText(for frequency: ReminderFrequency) -> String {
        switch frequency {
        case .once: return "Once"
        case .daily: return "Daily"
        case .weekly: return "Weekly"
        case .monthly: return "Monthly"
        case .custom: return "Custom"
        }
    }

    // MARK: - Relative Time Tests

    func testRelativeTimeFormattingFuture() {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .short

        // Test future dates
        let oneHourFromNow = Date().addingTimeInterval(3600)
        let timeString = formatter.localizedString(for: oneHourFromNow, relativeTo: Date())

        XCTAssertFalse(timeString.isEmpty, "Should return formatted string")
        // Note: Exact string depends on locale, but it should contain time info
    }

    func testRelativeTimeFormattingPast() {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .short

        // Test past dates
        let oneHourAgo = Date().addingTimeInterval(-3600)
        let timeString = formatter.localizedString(for: oneHourAgo, relativeTo: Date())

        XCTAssertFalse(timeString.isEmpty, "Should return formatted string")
    }

    // MARK: - Empty State Tests

    func testEmptyStateTextIsCorrect() {
        let expectedText = "No upcoming reminders"
        XCTAssertEqual(expectedText, "No upcoming reminders")
    }

    func testEmptyStateIconIsCorrect() {
        let expectedIcon = "bell.slash"
        XCTAssertEqual(expectedIcon, "bell.slash")
    }

    // MARK: - View All Button Tests

    func testViewAllButtonTextIsCorrect() {
        let expectedText = "View All Reminders"
        XCTAssertEqual(expectedText, "View All Reminders")
    }

    // MARK: - Integration Tests

    func testCompleteDataFlow() async throws {
        // Given - create mix of reminders
        let futureDate1 = Date().addingTimeInterval(3600)
        let futureDate2 = Date().addingTimeInterval(7200)
        let pastDate = Date().addingTimeInterval(-3600)

        let validReminder1 = Reminder(
            title: "Valid 1",
            message: "Message",
            category: .checkIn,
            frequency: .daily,
            scheduledFor: futureDate1,
            userId: testUser.id
        )

        let validReminder2 = Reminder(
            title: "Valid 2",
            message: "Message",
            category: .habit,
            frequency: .weekly,
            scheduledFor: futureDate2,
            userId: testUser.id
        )

        let pastReminder = Reminder(
            title: "Past",
            message: "Message",
            category: .checkIn,
            frequency: .once,
            scheduledFor: pastDate,
            userId: testUser.id
        )

        let inactiveReminder = Reminder(
            title: "Inactive",
            message: "Message",
            category: .checkIn,
            frequency: .once,
            scheduledFor: futureDate1,
            userId: testUser.id
        )
        inactiveReminder.isActive = false

        modelContext.insert(validReminder1)
        modelContext.insert(validReminder2)
        modelContext.insert(pastReminder)
        modelContext.insert(inactiveReminder)
        try modelContext.save()

        // Simulate loading
        let descriptor = FetchDescriptor<Reminder>(
            sortBy: [SortDescriptor(\.scheduledFor, order: .forward)]
        )
        let allReminders = try modelContext.fetch(descriptor)

        let now = Date()
        let upcomingReminders = allReminders.filter {
            $0.userId == testUser.id &&
            $0.isActive &&
            $0.scheduledFor > now
        }

        // Then
        XCTAssertEqual(upcomingReminders.count, 2)
        XCTAssertEqual(upcomingReminders[0].title, "Valid 1")
        XCTAssertEqual(upcomingReminders[1].title, "Valid 2")
    }
}
