//
//  DashboardServiceTests.swift
//  QualityControlTests
//
//  Week 3: Service Layer Tests
//  Tests for DashboardService business logic
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class DashboardServiceTests: XCTestCase {

    var modelContainer: ModelContainer!
    var modelContext: ModelContext!
    var dashboardService: DashboardService!
    var testCouple: Couple!
    var testUser1: User!
    var testUser2: User!

    override func setUp() async throws {
        // Use TestModelContext helper for consistent container management
        (modelContainer, modelContext) = try TestModelContext.create()

        // Initialize service
        dashboardService = DashboardService(modelContext: modelContext)

        // Create test data
        testCouple = Couple(
            relationshipStartDate: Date().addingTimeInterval(-365 * 24 * 60 * 60)
        )
        modelContext.insert(testCouple)

        testUser1 = User(name: "User 1", email: "user1@test.com")
        testUser1.couple = testCouple
        modelContext.insert(testUser1)

        testUser2 = User(name: "User 2", email: "user2@test.com")
        testUser2.couple = testCouple
        modelContext.insert(testUser2)

        testCouple.users = [testUser1, testUser2]

        try modelContext.save()
    }

    override func tearDown() async throws {
        dashboardService = nil
        testCouple = nil
        testUser1 = nil
        testUser2 = nil
        modelContext = nil
        modelContainer = nil
    }

    // MARK: - Dashboard Stats Tests

    func testGetDashboardStatsInitial() {
        // When
        let stats = dashboardService.getDashboardStats(for: testCouple)

        // Then
        XCTAssertEqual(stats.totalCheckIns, 0)
        XCTAssertEqual(stats.currentStreak, 0)
        XCTAssertEqual(stats.totalNotes, 0)
        XCTAssertEqual(stats.totalMilestones, 0)
        XCTAssertNil(stats.lastCheckInDate)
    }

    func testGetDashboardStatsWithData() {
        // Given
        // Create completed sessions
        for _ in 0..<5 {
            let session = CheckInSession(coupleId: testCouple.id)
            session.status = .completed
            session.completedAt = Date()
            modelContext.insert(session)
        }

        // Create notes
        for _ in 0..<3 {
            let note = Note(
                content: "Test note",
                privacy: .shared,
                authorId: testUser1.id
            )
            modelContext.insert(note)
        }

        // Create milestones
        let milestone = Milestone(
            title: "Test Milestone",
            description: "Test",
            category: "test",
            coupleId: testCouple.id
        )
        modelContext.insert(milestone)

        try? modelContext.save()

        // When
        let stats = dashboardService.getDashboardStats(for: testCouple)

        // Then
        XCTAssertEqual(stats.totalCheckIns, 5)
        XCTAssertEqual(stats.totalNotes, 3)
        XCTAssertEqual(stats.totalMilestones, 1)
        XCTAssertNotNil(stats.lastCheckInDate)
    }

    func testGetCheckInStreakConsecutiveDays() {
        // Given - create sessions on consecutive days
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())

        for i in 0..<4 {
            let session = CheckInSession(coupleId: testCouple.id)
            session.status = .completed
            session.completedAt = calendar.date(byAdding: .day, value: -i, to: today)
            modelContext.insert(session)
        }

        try? modelContext.save()

        // When
        let stats = dashboardService.getDashboardStats(for: testCouple)

        // Then
        XCTAssertEqual(stats.currentStreak, 4)
    }

    func testGetCheckInStreakWithGap() {
        // Given
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())

        // Recent sessions
        for i in 0..<2 {
            let session = CheckInSession(coupleId: testCouple.id)
            session.status = .completed
            session.completedAt = calendar.date(byAdding: .day, value: -i, to: today)
            modelContext.insert(session)
        }

        // Old session with gap
        let oldSession = CheckInSession(coupleId: testCouple.id)
        oldSession.status = .completed
        oldSession.completedAt = calendar.date(byAdding: .day, value: -5, to: today)
        modelContext.insert(oldSession)

        try? modelContext.save()

        // When
        let stats = dashboardService.getDashboardStats(for: testCouple)

        // Then
        XCTAssertEqual(stats.currentStreak, 2) // Streak breaks at gap
    }

    // MARK: - Recent Activity Tests

    func testGetRecentActivityEmpty() {
        // When
        let activity = dashboardService.getRecentActivity(for: testCouple)

        // Then
        XCTAssertTrue(activity.isEmpty)
    }

    func testGetRecentActivityWithCheckIns() {
        // Given
        let session = CheckInSession(coupleId: testCouple.id)
        session.status = .completed
        session.completedAt = Date()
        modelContext.insert(session)
        try? modelContext.save()

        // When
        let activity = dashboardService.getRecentActivity(for: testCouple, limit: 10)

        // Then
        XCTAssertEqual(activity.count, 1)
        XCTAssertEqual(activity.first?.type, .checkIn)
    }

    func testGetRecentActivityWithNotes() {
        // Given
        let note = Note(
            content: "Test note",
            privacy: .shared,
            authorId: testUser1.id
        )
        modelContext.insert(note)
        try? modelContext.save()

        // When
        let activity = dashboardService.getRecentActivity(for: testCouple, limit: 10)

        // Then
        let noteActivities = activity.filter { $0.type == .note }
        XCTAssertFalse(noteActivities.isEmpty)
    }

    func testGetRecentActivityWithMilestones() {
        // Given
        let milestone = Milestone(
            title: "Test Milestone",
            description: "Test",
            category: "test",
            coupleId: testCouple.id
        )
        milestone.isAchieved = true
        milestone.achievedAt = Date()
        modelContext.insert(milestone)
        try? modelContext.save()

        // When
        let activity = dashboardService.getRecentActivity(for: testCouple, limit: 10)

        // Then
        let milestoneActivities = activity.filter { $0.type == .milestone }
        XCTAssertFalse(milestoneActivities.isEmpty)
    }

    func testGetRecentActivitySortedByTimestamp() {
        // Given - create items with different timestamps
        let now = Date()

        let oldSession = CheckInSession(coupleId: testCouple.id)
        oldSession.status = .completed
        oldSession.completedAt = now.addingTimeInterval(-3600) // 1 hour ago
        modelContext.insert(oldSession)

        let recentNote = Note(
            content: "Recent note",
            privacy: .shared,
            authorId: testUser1.id
        )
        recentNote.createdAt = now.addingTimeInterval(-1800) // 30 min ago
        modelContext.insert(recentNote)

        try? modelContext.save()

        // When
        let activity = dashboardService.getRecentActivity(for: testCouple, limit: 10)

        // Then
        XCTAssertTrue(activity.first!.timestamp > activity.last!.timestamp)
    }

    func testGetRecentActivityRespectsLimit() {
        // Given - create many items
        for _ in 0..<15 {
            let session = CheckInSession(coupleId: testCouple.id)
            session.status = .completed
            session.completedAt = Date()
            modelContext.insert(session)
        }
        try? modelContext.save()

        // When
        let activity = dashboardService.getRecentActivity(for: testCouple, limit: 5)

        // Then
        XCTAssertEqual(activity.count, 5)
    }

    // MARK: - Upcoming Reminders Tests

    func testGetUpcomingRemindersEmpty() {
        // When
        let reminders = dashboardService.getUpcomingReminders(for: testCouple)

        // Then
        XCTAssertTrue(reminders.isEmpty)
    }

    func testGetUpcomingRemindersWithFutureReminders() {
        // Given
        let futureDate = Date().addingTimeInterval(3600) // 1 hour from now
        let reminder = Reminder(
            title: "Test Reminder",
            message: "Test",
            category: .checkIn,
            frequency: .once,
            scheduledFor: futureDate,
            userId: testUser1.id
        )
        modelContext.insert(reminder)
        try? modelContext.save()

        // When
        let reminders = dashboardService.getUpcomingReminders(for: testCouple)

        // Then
        XCTAssertEqual(reminders.count, 1)
        XCTAssertEqual(reminders.first?.title, "Test Reminder")
    }

    func testGetUpcomingRemindersIgnoresPastReminders() {
        // Given
        let pastDate = Date().addingTimeInterval(-3600) // 1 hour ago
        let pastReminder = Reminder(
            title: "Past Reminder",
            message: "Test",
            category: .checkIn,
            frequency: .once,
            scheduledFor: pastDate,
            userId: testUser1.id
        )
        modelContext.insert(pastReminder)
        try? modelContext.save()

        // When
        let reminders = dashboardService.getUpcomingReminders(for: testCouple)

        // Then
        XCTAssertTrue(reminders.isEmpty)
    }

    func testGetUpcomingRemindersIgnoresInactive() {
        // Given
        let futureDate = Date().addingTimeInterval(3600)
        let reminder = Reminder(
            title: "Inactive Reminder",
            message: "Test",
            category: .checkIn,
            frequency: .once,
            scheduledFor: futureDate,
            userId: testUser1.id
        )
        reminder.isActive = false
        modelContext.insert(reminder)
        try? modelContext.save()

        // When
        let reminders = dashboardService.getUpcomingReminders(for: testCouple)

        // Then
        XCTAssertTrue(reminders.isEmpty)
    }

    // MARK: - Prep Banner Tests

    func testShouldShowPrepBannerNoCheckIns() {
        // When
        let shouldShow = dashboardService.shouldShowPrepBanner(for: testCouple)

        // Then
        XCTAssertTrue(shouldShow) // Should show if no check-ins yet
    }

    func testShouldShowPrepBannerRecentCheckIn() {
        // Given - recent check-in
        let session = CheckInSession(coupleId: testCouple.id)
        session.status = .completed
        session.completedAt = Date().addingTimeInterval(-3600) // 1 hour ago
        modelContext.insert(session)
        try? modelContext.save()

        // When
        let shouldShow = dashboardService.shouldShowPrepBanner(for: testCouple)

        // Then
        XCTAssertFalse(shouldShow) // Should not show if recent check-in
    }

    func testShouldShowPrepBannerOldCheckIn() {
        // Given - old check-in
        let session = CheckInSession(coupleId: testCouple.id)
        session.status = .completed
        session.completedAt = Date().addingTimeInterval(-20 * 3600) // 20 hours ago
        modelContext.insert(session)
        try? modelContext.save()

        // When
        let shouldShow = dashboardService.shouldShowPrepBanner(for: testCouple)

        // Then
        XCTAssertTrue(shouldShow) // Should show if >18 hours
    }
}
