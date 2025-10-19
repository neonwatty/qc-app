//
//  NotificationService.swift
//  QualityControl
//
//  Week 5-6: Reminders Integration
//  Service for scheduling and managing local notifications
//

import Foundation
import UserNotifications

@MainActor
class NotificationService: NSObject, UNUserNotificationCenterDelegate {

    // MARK: - Singleton

    static let shared = NotificationService()

    // MARK: - Properties

    private let notificationCenter = UNUserNotificationCenter.current()

    // Notification categories and actions
    private let reminderCategoryIdentifier = "REMINDER_CATEGORY"

    // MARK: - Initialization

    override init() {
        super.init()
        setupNotificationCategories()
        notificationCenter.delegate = self
    }

    // MARK: - Setup

    private func setupNotificationCategories() {
        // Define notification actions
        let completeAction = UNNotificationAction(
            identifier: "COMPLETE_ACTION",
            title: "Complete",
            options: [.foreground]
        )

        let snooze15Action = UNNotificationAction(
            identifier: "SNOOZE_15_ACTION",
            title: "Snooze 15min",
            options: []
        )

        let snooze60Action = UNNotificationAction(
            identifier: "SNOOZE_60_ACTION",
            title: "Snooze 1hr",
            options: []
        )

        let dismissAction = UNNotificationAction(
            identifier: "DISMISS_ACTION",
            title: "Dismiss",
            options: [.destructive]
        )

        // Create category with actions
        let reminderCategory = UNNotificationCategory(
            identifier: reminderCategoryIdentifier,
            actions: [completeAction, snooze15Action, snooze60Action, dismissAction],
            intentIdentifiers: [],
            options: [.customDismissAction]
        )

        // Register category
        notificationCenter.setNotificationCategories([reminderCategory])
    }

    // MARK: - Permission

    func requestAuthorization() async throws -> Bool {
        let settings = await notificationCenter.notificationSettings()

        switch settings.authorizationStatus {
        case .authorized:
            return true
        case .notDetermined:
            return try await notificationCenter.requestAuthorization(options: [.alert, .badge, .sound])
        case .denied, .provisional, .ephemeral:
            return false
        @unknown default:
            return false
        }
    }

    // MARK: - Scheduling

    func scheduleNotification(for reminder: Reminder) async throws {
        // Request permission if needed
        guard try await requestAuthorization() else {
            throw NotificationError.permissionDenied
        }

        // Cancel existing notification if any
        cancelNotification(for: reminder)

        // Create notification content
        let content = createNotificationContent(from: reminder)

        // Create trigger based on frequency
        guard let trigger = createTrigger(from: reminder) else {
            throw NotificationError.invalidTrigger
        }

        // Create request
        let request = UNNotificationRequest(
            identifier: reminder.id.uuidString,
            content: content,
            trigger: trigger
        )

        // Schedule notification
        try await notificationCenter.add(request)
    }

    func cancelNotification(for reminder: Reminder) {
        notificationCenter.removePendingNotificationRequests(withIdentifiers: [reminder.id.uuidString])
        notificationCenter.removeDeliveredNotifications(withIdentifiers: [reminder.id.uuidString])
    }

    func rescheduleNotification(for reminder: Reminder) async throws {
        try await scheduleNotification(for: reminder)
    }

    // MARK: - Content Creation

    private func createNotificationContent(from reminder: Reminder) -> UNMutableNotificationContent {
        let content = UNMutableNotificationContent()
        content.title = reminder.title
        content.body = reminder.message
        content.sound = .default
        content.categoryIdentifier = reminderCategoryIdentifier

        // Add badge
        content.badge = 1

        // Add user info for action handling
        content.userInfo = [
            "reminderId": reminder.id.uuidString,
            "category": reminder.category.rawValue
        ]

        // Customize based on category
        switch reminder.category {
        case .checkIn:
            content.threadIdentifier = "check-in-reminders"
        case .habit:
            content.threadIdentifier = "habit-reminders"
        case .actionItem:
            content.threadIdentifier = "action-item-reminders"
        case .partnerMoment:
            content.threadIdentifier = "partner-moment-reminders"
        case .specialOccasion:
            content.threadIdentifier = "special-occasion-reminders"
        }

        return content
    }

    // MARK: - Trigger Creation

    private func createTrigger(from reminder: Reminder) -> UNNotificationTrigger? {
        let calendar = Calendar.current

        switch reminder.frequency {
        case .once:
            // One-time notification
            let timeInterval = reminder.scheduledFor.timeIntervalSinceNow
            guard timeInterval > 0 else { return nil }
            return UNTimeIntervalNotificationTrigger(timeInterval: timeInterval, repeats: false)

        case .daily:
            // Daily repeating notification
            let components = calendar.dateComponents([.hour, .minute], from: reminder.scheduledFor)
            return UNCalendarNotificationTrigger(dateMatching: components, repeats: true)

        case .weekly:
            // Weekly repeating notification
            let components = calendar.dateComponents([.weekday, .hour, .minute], from: reminder.scheduledFor)
            return UNCalendarNotificationTrigger(dateMatching: components, repeats: true)

        case .monthly:
            // Monthly repeating notification
            let components = calendar.dateComponents([.day, .hour, .minute], from: reminder.scheduledFor)
            return UNCalendarNotificationTrigger(dateMatching: components, repeats: true)

        case .custom:
            // Custom frequency - treat as one-time for now
            let timeInterval = reminder.scheduledFor.timeIntervalSinceNow
            guard timeInterval > 0 else { return nil }
            return UNTimeIntervalNotificationTrigger(timeInterval: timeInterval, repeats: false)
        }
    }

    // MARK: - UNUserNotificationCenterDelegate

    nonisolated func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        // Show notification even when app is in foreground
        completionHandler([.banner, .sound, .badge])
    }

    nonisolated func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        Task { @MainActor in
            await handleNotificationAction(response)
            completionHandler()
        }
    }

    // MARK: - Action Handling

    func handleNotificationAction(_ response: UNNotificationResponse) async {
        guard let reminderIdString = response.notification.request.content.userInfo["reminderId"] as? String,
              let reminderId = UUID(uuidString: reminderIdString) else {
            return
        }

        let actionIdentifier = response.actionIdentifier

        // Post notification for action to be handled by RemindersViewModel
        NotificationCenter.default.post(
            name: .reminderActionReceived,
            object: nil,
            userInfo: [
                "reminderId": reminderId,
                "action": actionIdentifier
            ]
        )
    }
}

// MARK: - Errors

enum NotificationError: LocalizedError {
    case permissionDenied
    case invalidTrigger

    var errorDescription: String? {
        switch self {
        case .permissionDenied:
            return "Notification permission denied. Please enable notifications in Settings."
        case .invalidTrigger:
            return "Invalid notification trigger. Please check the reminder schedule."
        }
    }
}

// MARK: - Notification Names

extension Notification.Name {
    static let reminderActionReceived = Notification.Name("reminderActionReceived")
}
