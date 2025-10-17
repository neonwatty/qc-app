//
//  MockServices.swift
//  QualityControlTests
//
//  Testing Infrastructure
//  Mock service implementations for testing
//

import Foundation
import SwiftData
@testable import QualityControl

// MARK: - Mock Check-In Service

@MainActor
class MockCheckInService {

    // Control mock behavior
    var shouldFail = false
    var mockError: Error?
    var mockSessions: [CheckInSession] = []
    var mockCategories: [QualityControl.Category] = []

    // Track method calls
    var createSessionCalled = false
    var fetchSessionsCalled = false
    var completeSessionCalled = false

    func createSession(for coupleId: UUID) throws -> CheckInSession {
        createSessionCalled = true

        if shouldFail {
            throw mockError ?? NSError(domain: "Mock", code: -1)
        }

        let session = CheckInSession(coupleId: coupleId)
        mockSessions.append(session)
        return session
    }

    func fetchActiveSessions() throws -> [CheckInSession] {
        fetchSessionsCalled = true

        if shouldFail {
            throw mockError ?? NSError(domain: "Mock", code: -1)
        }

        return mockSessions.filter { $0.status == .inProgress }
    }

    func completeSession(_ session: CheckInSession) throws {
        completeSessionCalled = true

        if shouldFail {
            throw mockError ?? NSError(domain: "Mock", code: -1)
        }

        session.status = .completed
        session.completedAt = Date()
    }

    func fetchCategories() throws -> [QualityControl.Category] {
        if shouldFail {
            throw mockError ?? NSError(domain: "Mock", code: -1)
        }

        return mockCategories
    }

    // Reset for next test
    func reset() {
        shouldFail = false
        mockError = nil
        mockSessions = []
        mockCategories = []
        createSessionCalled = false
        fetchSessionsCalled = false
        completeSessionCalled = false
    }
}

// MARK: - Mock Dashboard Service

@MainActor
class MockDashboardService {

    // Control mock behavior
    var shouldFail = false
    var mockError: Error?
    var mockActivities: [(String, Date)] = []
    var mockUpcomingReminders: [Reminder] = []

    // Track method calls
    var fetchRecentActivitiesCalled = false
    var fetchUpcomingRemindersCalled = false

    func fetchRecentActivities(limit: Int) throws -> [(String, Date)] {
        fetchRecentActivitiesCalled = true

        if shouldFail {
            throw mockError ?? NSError(domain: "Mock", code: -1)
        }

        return Array(mockActivities.prefix(limit))
    }

    func fetchUpcomingReminders(limit: Int) throws -> [Reminder] {
        fetchUpcomingRemindersCalled = true

        if shouldFail {
            throw mockError ?? NSError(domain: "Mock", code: -1)
        }

        return Array(mockUpcomingReminders.prefix(limit))
    }

    // Reset for next test
    func reset() {
        shouldFail = false
        mockError = nil
        mockActivities = []
        mockUpcomingReminders = []
        fetchRecentActivitiesCalled = false
        fetchUpcomingRemindersCalled = false
    }
}

// MARK: - Mock Notification Manager

class MockNotificationManager {

    // Control mock behavior
    var shouldFail = false
    var mockError: Error?
    var isAuthorized = true

    // Track method calls
    var requestAuthorizationCalled = false
    var scheduleNotificationCalled = false
    var cancelNotificationCalled = false
    var scheduledNotificationIds: [String] = []

    func requestAuthorization() async throws {
        requestAuthorizationCalled = true

        if shouldFail {
            throw mockError ?? NSError(domain: "Mock", code: -1)
        }
    }

    func scheduleNotification(id: String, title: String, body: String, date: Date) throws {
        scheduleNotificationCalled = true

        if shouldFail {
            throw mockError ?? NSError(domain: "Mock", code: -1)
        }

        scheduledNotificationIds.append(id)
    }

    func cancelNotification(id: String) {
        cancelNotificationCalled = true
        scheduledNotificationIds.removeAll { $0 == id }
    }

    // Reset for next test
    func reset() {
        shouldFail = false
        mockError = nil
        isAuthorized = true
        requestAuthorizationCalled = false
        scheduleNotificationCalled = false
        cancelNotificationCalled = false
        scheduledNotificationIds = []
    }
}

// MARK: - Mock Data Generator

enum MockDataGenerator {

    static func generateUsers(count: Int, context: ModelContext) -> [User] {
        (0..<count).map { index in
            let user = User(name: "User \(index)", email: "user\(index)@test.com")
            context.insert(user)
            return user
        }
    }

    static func generateNotes(count: Int, authorId: UUID, context: ModelContext) -> [Note] {
        (0..<count).map { index in
            let note = Note(
                content: "Note \(index) content",
                privacy: [.private, .shared, .draft].randomElement()!,
                authorId: authorId
            )
            note.tags = ["tag\(index % 3)"]
            context.insert(note)
            return note
        }
    }

    static func generateReminders(count: Int, userId: UUID, context: ModelContext) -> [Reminder] {
        let categories: [ReminderCategory] = [.checkIn, .habit, .actionItem, .partnerMoment, .specialOccasion]
        let frequencies: [ReminderFrequency] = [.once, .daily, .weekly, .monthly, .custom]

        return (0..<count).map { index in
            let reminder = Reminder(
                title: "Reminder \(index)",
                message: "Message \(index)",
                category: categories.randomElement()!,
                frequency: frequencies.randomElement()!,
                scheduledFor: Date().addingTimeInterval(Double(index) * 86400),
                userId: userId
            )
            context.insert(reminder)
            return reminder
        }
    }

    static func generateLoveLanguages(count: Int, userId: UUID, context: ModelContext) -> [LoveLanguage] {
        let categories: [LoveLanguageCategory] = [.words, .time, .gifts, .touch, .acts]
        let importanceLevels: [Importance] = [.low, .medium, .high, .essential]

        return (0..<count).map { index in
            let language = LoveLanguage(
                category: categories.randomElement()!,
                title: "Language \(index)",
                description: "Description \(index)",
                userId: userId
            )
            language.importance = importanceLevels.randomElement()!
            language.privacy = [.private, .shared].randomElement()!
            context.insert(language)
            return language
        }
    }

    static func generateRequests(count: Int, requestedBy: UUID, requestedFor: UUID, context: ModelContext) -> [RelationshipRequest] {
        let types: [RequestType] = [.conversation, .activity, .dateNight, .reminder]
        let priorities: [Priority] = [.low, .medium, .high]

        return (0..<count).map { index in
            let request = RelationshipRequest(
                title: "Request \(index)",
                description: "Description \(index)",
                requestType: types.randomElement()!,
                requestedBy: requestedBy,
                requestedFor: requestedFor
            )
            request.priority = priorities.randomElement()!
            context.insert(request)
            return request
        }
    }
}
