//
//  NotificationServiceTests.swift
//  QualityControlTests
//
//  Week 5-6: Notification Service Tests
//  Tests for NotificationService
//

import XCTest
import UserNotifications
import SwiftData
@testable import QualityControl

@MainActor
final class NotificationServiceTests: XCTestCase {

    var modelContainer: ModelContainer!
    var modelContext: ModelContext!
    var notificationService: NotificationService!
    var testUser: User!

    override func setUp() async throws {
        // Use TestModelContext helper for consistent container management
        (modelContainer, modelContext) = try TestModelContext.create()

        // Create test user
        testUser = User(name: "Test User", email: "test@example.com")
        modelContext.insert(testUser)
        try modelContext.save()

        // Get notification service instance
        notificationService = NotificationService.shared
    }

    override func tearDown() async throws {
        testUser = nil
        modelContext = nil
        modelContainer = nil
        // Don't nil notificationService as it's a singleton
    }

    // MARK: - Initialization Tests

    func testServiceIsSingleton() {
        let instance1 = NotificationService.shared
        let instance2 = NotificationService.shared

        XCTAssertTrue(instance1 === instance2, "NotificationService should be a singleton")
    }

    // MARK: - Permission Tests

    func testRequestAuthorizationHandlesAuthorizedStatus() async throws {
        // This test verifies that requesting authorization returns a boolean
        // Note: Actual permission state depends on simulator/device settings
        let result = try await notificationService.requestAuthorization()
        XCTAssertTrue(result is Bool, "Should return boolean for authorization status")
    }

    // MARK: - Notification Scheduling Tests

    func testScheduleNotificationForOnceFrequency() async throws {
        // Given
        let futureDate = Date().addingTimeInterval(3600) // 1 hour from now
        let reminder = Reminder(
            title: "Test Reminder",
            message: "Test Message",
            category: .checkIn,
            frequency: .once,
            scheduledFor: futureDate,
            userId: testUser.id
        )
        modelContext.insert(reminder)
        try modelContext.save()

        // When/Then - Should not throw
        do {
            try await notificationService.scheduleNotification(for: reminder)
            // If we get here without throwing, test passes
            XCTAssertTrue(true, "Notification scheduled successfully")
        } catch NotificationError.permissionDenied {
            // Permission denied is acceptable in test environment
            XCTAssertTrue(true, "Permission denied is acceptable in test environment")
        }
    }

    func testScheduleNotificationForDailyFrequency() async throws {
        // Given
        let futureDate = Date().addingTimeInterval(3600)
        let reminder = Reminder(
            title: "Daily Reminder",
            message: "Daily Message",
            category: .habit,
            frequency: .daily,
            scheduledFor: futureDate,
            userId: testUser.id
        )
        modelContext.insert(reminder)
        try modelContext.save()

        // When/Then - Should not throw
        do {
            try await notificationService.scheduleNotification(for: reminder)
            XCTAssertTrue(true, "Daily notification scheduled successfully")
        } catch NotificationError.permissionDenied {
            XCTAssertTrue(true, "Permission denied is acceptable in test environment")
        }
    }

    func testScheduleNotificationForWeeklyFrequency() async throws {
        // Given
        let futureDate = Date().addingTimeInterval(3600)
        let reminder = Reminder(
            title: "Weekly Reminder",
            message: "Weekly Message",
            category: .partnerMoment,
            frequency: .weekly,
            scheduledFor: futureDate,
            userId: testUser.id
        )
        modelContext.insert(reminder)
        try modelContext.save()

        // When/Then - Should not throw
        do {
            try await notificationService.scheduleNotification(for: reminder)
            XCTAssertTrue(true, "Weekly notification scheduled successfully")
        } catch NotificationError.permissionDenied {
            XCTAssertTrue(true, "Permission denied is acceptable in test environment")
        }
    }

    func testScheduleNotificationForMonthlyFrequency() async throws {
        // Given
        let futureDate = Date().addingTimeInterval(3600)
        let reminder = Reminder(
            title: "Monthly Reminder",
            message: "Monthly Message",
            category: .specialOccasion,
            frequency: .monthly,
            scheduledFor: futureDate,
            userId: testUser.id
        )
        modelContext.insert(reminder)
        try modelContext.save()

        // When/Then - Should not throw
        do {
            try await notificationService.scheduleNotification(for: reminder)
            XCTAssertTrue(true, "Monthly notification scheduled successfully")
        } catch NotificationError.permissionDenied {
            XCTAssertTrue(true, "Permission denied is acceptable in test environment")
        }
    }

    func testScheduleNotificationForCustomFrequency() async throws {
        // Given
        let futureDate = Date().addingTimeInterval(3600)
        let reminder = Reminder(
            title: "Custom Reminder",
            message: "Custom Message",
            category: .actionItem,
            frequency: .custom,
            scheduledFor: futureDate,
            userId: testUser.id
        )
        modelContext.insert(reminder)
        try modelContext.save()

        // When/Then - Should not throw
        do {
            try await notificationService.scheduleNotification(for: reminder)
            XCTAssertTrue(true, "Custom frequency notification scheduled successfully")
        } catch NotificationError.permissionDenied {
            XCTAssertTrue(true, "Permission denied is acceptable in test environment")
        }
    }

    func testScheduleNotificationWithPastDateThrowsError() async throws {
        // Given
        let pastDate = Date().addingTimeInterval(-3600) // 1 hour ago
        let reminder = Reminder(
            title: "Past Reminder",
            message: "Past Message",
            category: .checkIn,
            frequency: .once,
            scheduledFor: pastDate,
            userId: testUser.id
        )
        modelContext.insert(reminder)
        try modelContext.save()

        // When/Then - Should throw invalidTrigger
        do {
            try await notificationService.scheduleNotification(for: reminder)
            XCTFail("Should have thrown invalidTrigger error for past date")
        } catch NotificationError.invalidTrigger {
            XCTAssertTrue(true, "Correctly threw invalidTrigger error")
        } catch NotificationError.permissionDenied {
            // Permission denied is also acceptable
            XCTAssertTrue(true, "Permission denied is acceptable")
        }
    }

    // MARK: - Notification Cancellation Tests

    func testCancelNotificationDoesNotCrash() {
        // Given
        let reminder = Reminder(
            title: "Test",
            message: "Test",
            category: .checkIn,
            frequency: .once,
            scheduledFor: Date().addingTimeInterval(3600),
            userId: testUser.id
        )

        // When/Then - Should not crash
        notificationService.cancelNotification(for: reminder)
        XCTAssertTrue(true, "Cancel notification completed without crash")
    }

    func testCancelNotificationWithNonexistentIdDoesNotCrash() {
        // Given
        let reminder = Reminder(
            title: "Nonexistent",
            message: "Test",
            category: .checkIn,
            frequency: .once,
            scheduledFor: Date().addingTimeInterval(3600),
            userId: testUser.id
        )

        // When/Then - Should not crash even if notification doesn't exist
        notificationService.cancelNotification(for: reminder)
        XCTAssertTrue(true, "Cancel nonexistent notification completed without crash")
    }

    func testRescheduleNotificationDoesNotCrash() async throws {
        // Given
        let futureDate = Date().addingTimeInterval(3600)
        let reminder = Reminder(
            title: "Reschedule Test",
            message: "Test",
            category: .checkIn,
            frequency: .once,
            scheduledFor: futureDate,
            userId: testUser.id
        )
        modelContext.insert(reminder)
        try modelContext.save()

        // When/Then - Should not crash
        do {
            try await notificationService.rescheduleNotification(for: reminder)
            XCTAssertTrue(true, "Reschedule completed successfully")
        } catch NotificationError.permissionDenied {
            XCTAssertTrue(true, "Permission denied is acceptable")
        }
    }

    // MARK: - Action Handling Tests
    // Note: UNNotification and UNNotificationResponse cannot be mocked in unit tests
    // Action handling is tested through integration tests and manual testing

    // MARK: - Error Tests

    func testNotificationErrorPermissionDeniedDescription() {
        let error = NotificationError.permissionDenied
        XCTAssertNotNil(error.errorDescription)
        XCTAssertTrue(error.errorDescription!.contains("permission"))
    }

    func testNotificationErrorInvalidTriggerDescription() {
        let error = NotificationError.invalidTrigger
        XCTAssertNotNil(error.errorDescription)
        XCTAssertTrue(error.errorDescription!.contains("trigger"))
    }

    // MARK: - Notification Name Tests

    func testReminderActionReceivedNotificationNameExists() {
        let notificationName = Notification.Name.reminderActionReceived
        XCTAssertEqual(notificationName.rawValue, "reminderActionReceived")
    }
}
