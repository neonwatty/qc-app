//
//  NavigationIntegrationTests.swift
//  QualityControlTests
//
//  Week 3: Integration Tests
//  Tests for navigation flows between views and tabs
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class NavigationIntegrationTests: XCTestCase {

    var modelContainer: ModelContainer!
    var modelContext: ModelContext!
    var testCouple: Couple!
    var testUser: User!

    override func setUp() async throws {
        // Use TestModelContext helper for consistent container management
        (modelContainer, modelContext) = try TestModelContext.create()

        // Create test user
        testUser = User(
            name: "Test User",
            email: "test@example.com"
        )
        modelContext.insert(testUser)

        // Create test couple
        testCouple = Couple(relationshipStartDate: Date().addingTimeInterval(-365 * 24 * 60 * 60))
        modelContext.insert(testCouple)

        // Link user to couple
        testCouple.users = [testUser]
        testUser.couple = testCouple

        try modelContext.save()
    }

    override func tearDown() async throws {
        testUser = nil
        testCouple = nil
        modelContext = nil
        modelContainer = nil
    }

    // MARK: - Tab Navigation Tests

    func testTabCoordinatorInitialization() {
        let coordinator = TabCoordinator()

        XCTAssertEqual(coordinator.selectedTab, .dashboard)
        XCTAssertTrue(coordinator.badgeCounts.isEmpty)
    }

    func testTabCoordinatorNavigationFlow() {
        let coordinator = TabCoordinator()

        // Navigate through all tabs in sequence
        coordinator.showCheckIn()
        XCTAssertEqual(coordinator.selectedTab, .checkIn)

        coordinator.showNotes()
        XCTAssertEqual(coordinator.selectedTab, .notes)

        coordinator.showGrowth()
        XCTAssertEqual(coordinator.selectedTab, .growth)

        coordinator.showSettings()
        XCTAssertEqual(coordinator.selectedTab, .settings)

        coordinator.showDashboard()
        XCTAssertEqual(coordinator.selectedTab, .dashboard)
    }

    func testTabBadgeManagement() {
        let coordinator = TabCoordinator()

        // Set badges on multiple tabs
        coordinator.setBadge(for: .notes, count: 3)
        coordinator.setBadge(for: .checkIn, count: 1)

        XCTAssertEqual(coordinator.getBadgeCount(for: .notes), 3)
        XCTAssertEqual(coordinator.getBadgeCount(for: .checkIn), 1)
        XCTAssertNil(coordinator.getBadgeCount(for: .dashboard))

        // Clear specific badge
        coordinator.clearBadge(for: .notes)
        XCTAssertNil(coordinator.getBadgeCount(for: .notes))
        XCTAssertEqual(coordinator.getBadgeCount(for: .checkIn), 1)

        // Clear all badges
        coordinator.clearAllBadges()
        XCTAssertNil(coordinator.getBadgeCount(for: .checkIn))
    }

    func testTabNavigationPreservesBadges() {
        let coordinator = TabCoordinator()

        // Set badges
        coordinator.setBadge(for: .notes, count: 5)
        coordinator.setBadge(for: .growth, count: 2)

        // Navigate between tabs
        coordinator.showCheckIn()
        coordinator.showNotes()
        coordinator.showDashboard()

        // Verify badges persisted across navigation
        XCTAssertEqual(coordinator.getBadgeCount(for: .notes), 5)
        XCTAssertEqual(coordinator.getBadgeCount(for: .growth), 2)
    }

    // MARK: - Dashboard Navigation Tests

    func testDashboardViewModelInitialization() {
        let viewModel = DashboardViewModel(modelContext: modelContext, couple: testCouple)

        XCTAssertNotNil(viewModel)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.stats)
    }

    func testDashboardLoadData() async throws {
        let viewModel = DashboardViewModel(modelContext: modelContext, couple: testCouple)

        await viewModel.loadDashboard()

        XCTAssertNotNil(viewModel.stats)
        XCTAssertFalse(viewModel.isLoading)
    }

    func testDashboardStartCheckIn() throws {
        let viewModel = DashboardViewModel(modelContext: modelContext, couple: testCouple)

        let session = try viewModel.startCheckIn()

        XCTAssertNotNil(session)
        XCTAssertEqual(session.status, .inProgress)
        XCTAssertEqual(session.coupleId, testCouple.id)
        XCTAssertEqual(session.currentStep, .welcome)
    }

    func testDashboardRefresh() async throws {
        let viewModel = DashboardViewModel(modelContext: modelContext, couple: testCouple)

        // Initial load
        await viewModel.loadDashboard()
        let initialStats = viewModel.stats

        // Add some data
        let session = try viewModel.startCheckIn()
        session.status = .completed
        session.completedAt = Date()
        try modelContext.save()

        // Refresh
        await viewModel.refresh()

        // Stats should be updated
        XCTAssertNotNil(viewModel.stats)
        XCTAssertNotEqual(viewModel.stats?.totalCheckIns, initialStats?.totalCheckIns)
    }

    // MARK: - Check-In Navigation Tests

    func testCheckInCoordinatorFlowProgression() {
        let coordinator = CheckInCoordinator(modelContext: modelContext, couple: testCouple)
        coordinator.start()

        // Test progression through all steps
        let expectedSteps: [CheckInStep] = [
            .welcome,
            .categorySelection,
            .categoryDiscussion,
            .reflection,
            .actionItems,
            .completion
        ]

        for (index, expectedStep) in expectedSteps.enumerated() {
            if index == 0 {
                XCTAssertEqual(coordinator.currentStep, expectedStep)
            } else {
                if expectedStep == .categoryDiscussion {
                    // Need to select a category before advancing
                    let category = QualityControl.Category(
                        name: "Test Category",
                        description: "Test Description",
                        icon: "star.fill"
                    )
                    modelContext.insert(category)
                    coordinator.viewModel.toggleCategory(category)
                }
                coordinator.advance()
                XCTAssertEqual(coordinator.currentStep, expectedStep)
            }
        }
    }

    func testCheckInCoordinatorBackNavigation() {
        let coordinator = CheckInCoordinator(modelContext: modelContext, couple: testCouple)
        coordinator.start()

        // Move forward with proper category selection
        coordinator.advance() // categorySelection

        // Add category to allow advancement
        let category = QualityControl.Category(
            name: "Test Category",
            description: "Test Description",
            icon: "star.fill"
        )
        modelContext.insert(category)
        coordinator.viewModel.toggleCategory(category)

        coordinator.advance() // categoryDiscussion
        coordinator.advance() // reflection

        XCTAssertEqual(coordinator.currentStep, .reflection)

        // Navigate back
        coordinator.goBack()
        XCTAssertEqual(coordinator.currentStep, .categoryDiscussion)

        coordinator.goBack()
        XCTAssertEqual(coordinator.currentStep, .categorySelection)

        coordinator.goBack()
        XCTAssertEqual(coordinator.currentStep, .welcome)
    }

    func testCheckInCoordinatorProgressTracking() {
        let coordinator = CheckInCoordinator(modelContext: modelContext, couple: testCouple)
        coordinator.start()

        // Welcome (step 1/6)
        XCTAssertEqual(coordinator.progress, 1.0 / 6.0, accuracy: 0.01)

        // Category Selection (step 2/6)
        coordinator.advance()
        XCTAssertEqual(coordinator.progress, 2.0 / 6.0, accuracy: 0.01)

        // Add category and advance to discussion (step 3/6)
        let category = QualityControl.Category(
            name: "Test Category",
            description: "Test Description",
            icon: "star.fill"
        )
        modelContext.insert(category)
        coordinator.viewModel.toggleCategory(category)

        coordinator.advance()
        XCTAssertEqual(coordinator.progress, 3.0 / 6.0, accuracy: 0.01)

        // Reflection (step 4/6)
        coordinator.advance()
        XCTAssertEqual(coordinator.progress, 4.0 / 6.0, accuracy: 0.01)
    }

    // MARK: - Notes Navigation Tests

    func testNotesViewModelInitialization() {
        let viewModel = NotesViewModel(modelContext: modelContext, currentUserId: testUser.id)

        XCTAssertNotNil(viewModel)
        XCTAssertTrue(viewModel.notes.isEmpty)
    }

    func testNotesViewModelCreateNote() throws {
        let viewModel = NotesViewModel(modelContext: modelContext, currentUserId: testUser.id)

        let note = try viewModel.createNote(
            content: "Test note",
            privacy: NotePrivacy.private
        )

        XCTAssertNotNil(note)
        XCTAssertEqual(note.content, "Test note")
        XCTAssertEqual(note.privacy, NotePrivacy.private)
        XCTAssertEqual(note.authorId, testUser.id)
    }

    // MARK: - Growth Navigation Tests

    func testGrowthViewModelInitialization() {
        let viewModel = GrowthViewModel(modelContext: modelContext, coupleId: testCouple.id)

        XCTAssertNotNil(viewModel)
        XCTAssertFalse(viewModel.isLoading)
    }

    func testGrowthViewModelLoadMilestones() async throws {
        let viewModel = GrowthViewModel(modelContext: modelContext, coupleId: testCouple.id)

        await viewModel.loadData()

        XCTAssertFalse(viewModel.isLoading)
        // Milestones array exists (may be empty for new couple)
        XCTAssertNotNil(viewModel.milestones)
    }

    // MARK: - Cross-Tab Data Sharing Tests

    func testDataPersistsAcrossViews() async throws {
        // Create a check-in session in dashboard
        let dashboardVM = DashboardViewModel(modelContext: modelContext, couple: testCouple)
        let session = try dashboardVM.startCheckIn()
        session.status = .completed
        session.completedAt = Date()
        try modelContext.save()

        // Verify data is accessible in Growth view
        let growthVM = GrowthViewModel(modelContext: modelContext, coupleId: testCouple.id)
        await growthVM.loadData()

        // Fetch sessions to verify persistence
        let fetchDescriptor = FetchDescriptor<CheckInSession>()
        let sessions = try modelContext.fetch(fetchDescriptor)

        XCTAssertEqual(sessions.count, 1)
        XCTAssertEqual(sessions.first?.id, session.id)
    }

    func testNotesAccessibleFromMultipleViews() throws {
        // Create note via Notes view model
        let notesVM = NotesViewModel(modelContext: modelContext, currentUserId: testUser.id)
        _ = try notesVM.createNote(
            content: "Shared note",
            privacy: NotePrivacy.shared
        )

        // Verify note is accessible via fetch
        let fetchDescriptor = FetchDescriptor<Note>()
        let notes = try modelContext.fetch(fetchDescriptor)

        XCTAssertEqual(notes.count, 1)
        XCTAssertEqual(notes.first?.content, "Shared note")
    }

    // MARK: - Navigation State Management Tests

    func testViewModelStateIndependence() {
        // Create multiple view models
        let dashboardVM = DashboardViewModel(modelContext: modelContext, couple: testCouple)
        let notesVM = NotesViewModel(modelContext: modelContext, currentUserId: testUser.id)
        let growthVM = GrowthViewModel(modelContext: modelContext, coupleId: testCouple.id)

        // Verify each maintains independent state
        XCTAssertNotNil(dashboardVM)
        XCTAssertNotNil(notesVM)
        XCTAssertNotNil(growthVM)

        // Changes to one shouldn't affect others
        dashboardVM.isLoading = true
        XCTAssertTrue(dashboardVM.isLoading)
        XCTAssertFalse(growthVM.isLoading)
    }

    func testCoordinatorStatePreservation() {
        let coordinator = CheckInCoordinator(modelContext: modelContext, couple: testCouple)
        coordinator.start()

        // Add data at each step
        coordinator.advance() // categorySelection

        let category = QualityControl.Category(
            name: "Communication",
            description: "Test",
            icon: "star"
        )
        modelContext.insert(category)
        coordinator.viewModel.toggleCategory(category)

        coordinator.advance() // categoryDiscussion
        coordinator.viewModel.updateDiscussionNotes(for: category.id, notes: "Discussion")

        coordinator.advance() // reflection
        coordinator.viewModel.updateSessionNotes("Reflection")

        // Navigate back
        coordinator.goBack() // categoryDiscussion
        coordinator.goBack() // categorySelection

        // Verify state preserved
        XCTAssertTrue(coordinator.viewModel.selectedCategories.contains(category))
        XCTAssertEqual(coordinator.viewModel.getDiscussionNotes(for: category.id), "Discussion")
        XCTAssertEqual(coordinator.viewModel.sessionNotes, "Reflection")
    }
}
