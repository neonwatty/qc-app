//
//  TestHelpers.swift
//  QualityControlTests
//
//  Testing Infrastructure
//  Test helpers for ModelContext, data builders, and async utilities
//

import Foundation
import SwiftData
import XCTest
@testable import QualityControl

// MARK: - ModelContext Factory

enum TestModelContext {
    /// Creates an in-memory ModelContainer and ModelContext for testing
    ///
    /// IMPORTANT: SwiftData ModelContext requires its ModelContainer to remain in scope!
    /// This method returns BOTH to prevent the container from being deallocated.
    ///
    /// Working pattern:
    /// ```swift
    /// func testSomething() throws {
    ///     let (container, context) = try TestModelContext.create()
    ///     let user = User(name: "Test", email: "test@test.com")
    ///     context.insert(user)
    ///     try context.save()
    ///     // Container stays alive for entire test scope
    /// }
    /// ```
    ///
    /// Alternative (fully inline):
    /// ```swift
    /// func testSomething() throws {
    ///     let schema = Schema([User.self, Couple.self, ...])
    ///     let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
    ///     let container = try ModelContainer(for: schema, configurations: [configuration])
    ///     let context = container.mainContext
    ///     // ... use context
    /// }
    /// ```
    @MainActor
    static func create() throws -> (ModelContainer, ModelContext) {
        let schema = Schema([
            User.self,
            Couple.self,
            CheckInSession.self,
            Category.self,
            ActionItem.self,
            Note.self,
            Reminder.self,
            Milestone.self,
            LoveLanguage.self,
            RelationshipRequest.self
        ])
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        let container = try ModelContainer(for: schema, configurations: [configuration])
        return (container, container.mainContext)
    }
}

// MARK: - Test Data Builders

enum TestDataBuilder {

    static func createUser(name: String = "Test User", email: String = "test@example.com") -> User {
        User(name: name, email: email)
    }

    static func createCouple(relationshipStartDate: Date = Date()) -> Couple {
        Couple(relationshipStartDate: relationshipStartDate)
    }

    static func createCheckInSession(coupleId: UUID) -> CheckInSession {
        CheckInSession(coupleId: coupleId)
    }

    static func createCategory(
        name: String = "Test Category",
        description: String = "Test description",
        icon: String = "heart.fill"
    ) -> QualityControl.Category {
        QualityControl.Category(name: name, description: description, icon: icon)
    }

    static func createActionItem(
        title: String = "Test Action",
        checkInId: UUID
    ) -> ActionItem {
        ActionItem(title: title, checkInId: checkInId)
    }

    static func createNote(
        content: String = "Test note content",
        privacy: NotePrivacy = .shared,
        authorId: UUID
    ) -> Note {
        Note(content: content, privacy: privacy, authorId: authorId)
    }

    static func createReminder(
        title: String = "Test Reminder",
        message: String = "Test message",
        category: ReminderCategory = .checkIn,
        frequency: ReminderFrequency = .once,
        scheduledFor: Date = Date(),
        userId: UUID
    ) -> Reminder {
        Reminder(
            title: title,
            message: message,
            category: category,
            frequency: frequency,
            scheduledFor: scheduledFor,
            userId: userId
        )
    }

    static func createMilestone(
        title: String = "Test Milestone",
        description: String = "Test milestone description",
        category: String = "Anniversary",
        coupleId: UUID
    ) -> Milestone {
        Milestone(title: title, description: description, category: category, coupleId: coupleId)
    }

    static func createLoveLanguage(
        category: LoveLanguageCategory = .words,
        title: String = "Test Language",
        description: String = "Test description",
        userId: UUID
    ) -> LoveLanguage {
        LoveLanguage(
            category: category,
            title: title,
            description: description,
            userId: userId
        )
    }

    static func createRelationshipRequest(
        title: String = "Test Request",
        description: String = "Test description",
        requestType: RequestType = .conversation,
        requestedBy: UUID,
        requestedFor: UUID
    ) -> RelationshipRequest {
        RelationshipRequest(
            title: title,
            description: description,
            requestType: requestType,
            requestedBy: requestedBy,
            requestedFor: requestedFor
        )
    }
}

// MARK: - Async Test Utilities

extension XCTestCase {

    /// Wait for async operation with timeout
    func waitForAsync(timeout: TimeInterval = 1.0, operation: @escaping () async throws -> Void) async throws {
        let start = Date()
        try await operation()
        let elapsed = Date().timeIntervalSince(start)
        XCTAssertLessThan(elapsed, timeout, "Async operation took too long")
    }

    /// Wait for condition to be true
    func waitForCondition(
        timeout: TimeInterval = 1.0,
        pollingInterval: TimeInterval = 0.1,
        condition: @escaping () -> Bool
    ) {
        let expectation = XCTestExpectation(description: "Waiting for condition")

        Timer.scheduledTimer(withTimeInterval: pollingInterval, repeats: true) { timer in
            if condition() {
                timer.invalidate()
                expectation.fulfill()
            }
        }

        wait(for: [expectation], timeout: timeout)
    }
}

// MARK: - Custom Assertions

extension XCTestCase {

    /// Assert that a SwiftData model was persisted
    func assertModelPersisted<T: PersistentModel>(
        _ model: T,
        in context: ModelContext,
        file: StaticString = #file,
        line: UInt = #line
    ) {
        let descriptor = FetchDescriptor<T>()
        let results = (try? context.fetch(descriptor)) ?? []
        XCTAssertTrue(
            results.contains(where: { $0.persistentModelID == model.persistentModelID }),
            "Model not found in context",
            file: file,
            line: line
        )
    }

    /// Assert that two dates are approximately equal (within tolerance)
    func assertDatesEqual(
        _ date1: Date,
        _ date2: Date,
        tolerance: TimeInterval = 1.0,
        file: StaticString = #file,
        line: UInt = #line
    ) {
        let difference = abs(date1.timeIntervalSince(date2))
        XCTAssertLessThanOrEqual(
            difference,
            tolerance,
            "Dates differ by \(difference) seconds (tolerance: \(tolerance))",
            file: file,
            line: line
        )
    }

    /// Assert array contains elements matching predicate
    func assertContains<T>(
        _ array: [T],
        where predicate: (T) -> Bool,
        file: StaticString = #file,
        line: UInt = #line
    ) {
        XCTAssertTrue(
            array.contains(where: predicate),
            "Array does not contain matching element",
            file: file,
            line: line
        )
    }
}

// MARK: - Date Utilities

extension Date {
    static func daysAgo(_ days: Int) -> Date {
        Calendar.current.date(byAdding: .day, value: -days, to: Date())!
    }

    static func daysFromNow(_ days: Int) -> Date {
        Calendar.current.date(byAdding: .day, value: days, to: Date())!
    }

    static func hoursAgo(_ hours: Int) -> Date {
        Calendar.current.date(byAdding: .hour, value: -hours, to: Date())!
    }

    static func hoursFromNow(_ hours: Int) -> Date {
        Calendar.current.date(byAdding: .hour, value: hours, to: Date())!
    }
}
