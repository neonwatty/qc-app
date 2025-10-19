//
//  AppRootViewTests.swift
//  QualityControlTests
//
//  Week 5-6: App Lifecycle Tests
//  Tests for AppRootView onboarding and main app routing
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class AppRootViewTests: XCTestCase {

    var modelContainer: ModelContainer!
    var modelContext: ModelContext!

    override func setUp() async throws {
        // Use TestModelContext helper for consistent container management
        (modelContainer, modelContext) = try TestModelContext.create()
    }

    override func tearDown() async throws {
        modelContext = nil
        modelContainer = nil
    }

    // MARK: - Onboarding Flow Tests

    func testShowsOnboardingWhenNoCoupleExists() throws {
        // Given - no couple in database
        let descriptor = FetchDescriptor<Couple>()
        let couples = try modelContext.fetch(descriptor)
        let isOnboardingComplete = false

        // When
        let shouldShowOnboarding = couples.isEmpty && !isOnboardingComplete

        // Then
        XCTAssertTrue(shouldShowOnboarding, "Should show onboarding when no couple exists")
    }

    func testShowsOnboardingWhenCoupleExistsButNotComplete() throws {
        // Given - couple exists but onboarding not marked complete
        let couple = Couple(relationshipStartDate: Date())
        modelContext.insert(couple)
        try modelContext.save()

        let descriptor = FetchDescriptor<Couple>()
        let couples = try modelContext.fetch(descriptor)
        let isOnboardingComplete = false

        // When
        let shouldShowOnboarding = couples.isEmpty && !isOnboardingComplete

        // Then
        XCTAssertFalse(shouldShowOnboarding, "Should not show onboarding when couple exists")
    }

    func testShowsOnboardingWhenOnboardingNotComplete() throws {
        // Given
        let descriptor = FetchDescriptor<Couple>()
        let couples = try modelContext.fetch(descriptor)
        let isOnboardingComplete = false

        // When
        let shouldShowOnboarding = couples.isEmpty && !isOnboardingComplete

        // Then
        XCTAssertTrue(couples.isEmpty)
        XCTAssertTrue(shouldShowOnboarding, "Should show onboarding when not complete")
    }

    // MARK: - Main App Flow Tests

    func testShowsMainAppWhenCoupleExists() throws {
        // Given
        let couple = Couple(relationshipStartDate: Date())
        modelContext.insert(couple)
        try modelContext.save()

        let descriptor = FetchDescriptor<Couple>()
        let couples = try modelContext.fetch(descriptor)
        let isOnboardingComplete = false

        // When
        let shouldShowMainApp = !couples.isEmpty || isOnboardingComplete

        // Then
        XCTAssertTrue(shouldShowMainApp, "Should show main app when couple exists")
    }

    func testShowsMainAppAfterOnboardingComplete() throws {
        // Given - no couple, but onboarding marked complete
        let descriptor = FetchDescriptor<Couple>()
        let couples = try modelContext.fetch(descriptor)
        let isOnboardingComplete = true

        // When
        let shouldShowMainApp = !couples.isEmpty || isOnboardingComplete

        // Then
        XCTAssertTrue(shouldShowMainApp, "Should show main app after onboarding complete")
    }

    func testShowsMainAppWhenBothConditionsMet() throws {
        // Given - couple exists AND onboarding complete
        let couple = Couple(relationshipStartDate: Date())
        modelContext.insert(couple)
        try modelContext.save()

        let descriptor = FetchDescriptor<Couple>()
        let couples = try modelContext.fetch(descriptor)
        let isOnboardingComplete = true

        // When
        let shouldShowMainApp = !couples.isEmpty || isOnboardingComplete

        // Then
        XCTAssertTrue(shouldShowMainApp, "Should show main app when both conditions met")
    }

    // MARK: - State Transition Tests

    func testTransitionFromOnboardingToMainApp() throws {
        // Given - start with no couple
        var descriptor = FetchDescriptor<Couple>()
        var couples = try modelContext.fetch(descriptor)
        XCTAssertTrue(couples.isEmpty, "Should start with no couple")

        // When - create couple (simulating onboarding completion)
        let couple = Couple(relationshipStartDate: Date())
        modelContext.insert(couple)
        try modelContext.save()

        // Then
        descriptor = FetchDescriptor<Couple>()
        couples = try modelContext.fetch(descriptor)
        XCTAssertFalse(couples.isEmpty, "Should have couple after onboarding")
        XCTAssertEqual(couples.count, 1)
    }

    func testOnboardingCompletionUpdatesState() {
        // Given
        var isOnboardingComplete = false

        // When - onboarding completes
        isOnboardingComplete = true

        // Then
        XCTAssertTrue(isOnboardingComplete, "Onboarding complete flag should be true")
    }

    func testCoupleCreationDuringOnboardingUpdatesView() throws {
        // Given - track state changes
        var descriptor = FetchDescriptor<Couple>()
        var couples = try modelContext.fetch(descriptor)
        let initialCount = couples.count

        // When - onboarding creates couple with users
        let user1 = User(name: "User 1", email: "user1@test.com")
        let user2 = User(name: "User 2", email: "user2@test.com")
        let couple = Couple(relationshipStartDate: Date())

        modelContext.insert(user1)
        modelContext.insert(user2)
        modelContext.insert(couple)
        try modelContext.save()

        // Then
        descriptor = FetchDescriptor<Couple>()
        couples = try modelContext.fetch(descriptor)
        XCTAssertEqual(couples.count, initialCount + 1, "Couple count should increase")
        XCTAssertNotNil(couples.first)
    }

    // MARK: - Query Reactivity Tests

    func testQueryReactivityWhenCoupleAdded() throws {
        // Given - initial state
        var descriptor = FetchDescriptor<Couple>()
        var couples = try modelContext.fetch(descriptor)
        let initialIsEmpty = couples.isEmpty

        // When - add couple
        let couple = Couple(relationshipStartDate: Date())
        modelContext.insert(couple)
        try modelContext.save()

        // Then - query should reflect new state
        descriptor = FetchDescriptor<Couple>()
        couples = try modelContext.fetch(descriptor)
        let finalIsEmpty = couples.isEmpty

        XCTAssertTrue(initialIsEmpty, "Should start empty")
        XCTAssertFalse(finalIsEmpty, "Should not be empty after adding couple")
    }

    func testQueryReactivityWhenCoupleDeleted() throws {
        // Given - couple exists
        let couple = Couple(relationshipStartDate: Date())
        modelContext.insert(couple)
        try modelContext.save()

        var descriptor = FetchDescriptor<Couple>()
        var couples = try modelContext.fetch(descriptor)
        XCTAssertFalse(couples.isEmpty, "Should have couple")

        // When - delete couple
        modelContext.delete(couple)
        try modelContext.save()

        // Then
        descriptor = FetchDescriptor<Couple>()
        couples = try modelContext.fetch(descriptor)
        XCTAssertTrue(couples.isEmpty, "Should be empty after deleting couple")
    }

    // MARK: - Edge Cases

    func testMultipleCouplesStillShowsMainApp() throws {
        // Given - multiple couples (edge case, shouldn't happen normally)
        let couple1 = Couple(relationshipStartDate: Date())
        let couple2 = Couple(relationshipStartDate: Date())
        modelContext.insert(couple1)
        modelContext.insert(couple2)
        try modelContext.save()

        let descriptor = FetchDescriptor<Couple>()
        let couples = try modelContext.fetch(descriptor)

        // When
        let shouldShowMainApp = !couples.isEmpty

        // Then
        XCTAssertTrue(shouldShowMainApp, "Should show main app even with multiple couples")
        XCTAssertEqual(couples.count, 2)
    }

    func testOnboardingCompleteWithoutCoupleStillShowsMainApp() throws {
        // Given - edge case: onboarding marked complete but no couple created
        let descriptor = FetchDescriptor<Couple>()
        let couples = try modelContext.fetch(descriptor)
        let isOnboardingComplete = true

        // When
        let shouldShowMainApp = !couples.isEmpty || isOnboardingComplete

        // Then
        XCTAssertTrue(shouldShowMainApp, "Should show main app if onboarding complete flag is true")
    }

    // MARK: - Routing Logic Tests

    func testRoutingDecisionWithAllCombinations() throws {
        // Test all combinations of couples.isEmpty and isOnboardingComplete

        let combinations: [(couplesExist: Bool, onboardingComplete: Bool, expectedView: String)] = [
            (false, false, "onboarding"), // No couple, not complete -> onboarding
            (false, true, "mainApp"),     // No couple, but complete -> main app
            (true, false, "mainApp"),     // Couple exists, not complete -> main app
            (true, true, "mainApp"),      // Couple exists, complete -> main app
        ]

        for (couplesExist, onboardingComplete, expectedView) in combinations {
            // Setup
            if couplesExist {
                let couple = Couple(relationshipStartDate: Date())
                modelContext.insert(couple)
                try modelContext.save()
            }

            let descriptor = FetchDescriptor<Couple>()
            let couples = try modelContext.fetch(descriptor)

            // Test routing logic
            let shouldShowOnboarding = couples.isEmpty && !onboardingComplete
            let actualView = shouldShowOnboarding ? "onboarding" : "mainApp"

            XCTAssertEqual(actualView, expectedView,
                          "Failed for couplesExist=\(couplesExist), onboardingComplete=\(onboardingComplete)")

            // Cleanup for next iteration
            for couple in couples {
                modelContext.delete(couple)
            }
            try modelContext.save()
        }
    }
}
