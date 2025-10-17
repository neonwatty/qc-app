//
//  SettingsViewModelTests.swift
//  QualityControlTests
//
//  Phase 1.2: ViewModel Tests
//  Tests for SettingsViewModel
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class SettingsViewModelTests: XCTestCase {

    var modelContainer: ModelContainer!
    var modelContext: ModelContext!
    var viewModel: SettingsViewModel!
    var testUserId: UUID!
    var testCouple: Couple!
    var testUser: User!

    override func setUp() async throws {
        // Use TestModelContext helper for consistent container management
        (modelContainer, modelContext) = try TestModelContext.create()

        // Create test couple
        testCouple = Couple(relationshipStartDate: Date().addingTimeInterval(-365 * 24 * 60 * 60))
        modelContext.insert(testCouple)

        // Create test user
        testUserId = UUID()
        testUser = User(id: testUserId, name: "Test User", email: "test@example.com")
        testUser.couple = testCouple
        modelContext.insert(testUser)

        try modelContext.save()

        // Initialize view model
        viewModel = SettingsViewModel(modelContext: modelContext, currentUserId: testUserId)

        // Clear UserDefaults before each test
        UserDefaults.standard.removeObject(forKey: "sessionDuration")
        UserDefaults.standard.removeObject(forKey: "allowPauses")
        UserDefaults.standard.removeObject(forKey: "requireTimer")
    }

    override func tearDown() async throws {
        // Clean up UserDefaults
        UserDefaults.standard.removeObject(forKey: "sessionDuration")
        UserDefaults.standard.removeObject(forKey: "allowPauses")
        UserDefaults.standard.removeObject(forKey: "requireTimer")

        viewModel = nil
        testUser = nil
        testCouple = nil
        testUserId = nil
        modelContext = nil
        modelContainer = nil
    }

    // MARK: - Initialization Tests

    func testInitialization() {
        XCTAssertNil(viewModel.user)
        XCTAssertNil(viewModel.couple)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.error)
        XCTAssertEqual(viewModel.userName, "")
        XCTAssertEqual(viewModel.userEmail, "")
        XCTAssertEqual(viewModel.sessionDuration, 30)
        XCTAssertTrue(viewModel.allowPauses)
        XCTAssertFalse(viewModel.requireTimer)
    }

    // MARK: - Data Loading Tests

    func testLoadUserData() async {
        await viewModel.loadUserData()

        XCTAssertNotNil(viewModel.user)
        XCTAssertEqual(viewModel.user?.id, testUserId)
        XCTAssertEqual(viewModel.userName, "Test User")
        XCTAssertEqual(viewModel.userEmail, "test@example.com")
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.error)
    }

    func testLoadUserDataLoadsCouple() async {
        await viewModel.loadUserData()

        XCTAssertNotNil(viewModel.couple)
        XCTAssertEqual(viewModel.couple?.id, testCouple.id)
        XCTAssertEqual(viewModel.relationshipStartDate.timeIntervalSince1970,
                       testCouple.relationshipStartDate.timeIntervalSince1970,
                       accuracy: 1.0)
    }

    func testLoadUserDataWithNonexistentUser() async {
        // Create view model with non-existent user ID
        let nonexistentUserId = UUID()
        let vm = SettingsViewModel(modelContext: modelContext, currentUserId: nonexistentUserId)

        await vm.loadUserData()

        XCTAssertNil(vm.user)
        XCTAssertNil(vm.couple)
        XCTAssertFalse(vm.isLoading)
    }

    // MARK: - Save Profile Tests

    func testSaveProfile() async throws {
        await viewModel.loadUserData()

        // Update profile data
        viewModel.userName = "Updated Name"
        viewModel.userEmail = "updated@example.com"
        let newStartDate = Date().addingTimeInterval(-730 * 24 * 60 * 60) // 2 years ago
        viewModel.relationshipStartDate = newStartDate

        try viewModel.saveProfile()

        // Reload and verify changes were saved
        let descriptor = FetchDescriptor<User>(
            predicate: #Predicate { user in
                user.id == testUserId
            }
        )
        let users = try modelContext.fetch(descriptor)
        let savedUser = users.first

        XCTAssertEqual(savedUser?.name, "Updated Name")
        XCTAssertEqual(savedUser?.email, "updated@example.com")
        if let couple = savedUser?.couple {
            XCTAssertEqual(couple.relationshipStartDate.timeIntervalSince1970,
                           newStartDate.timeIntervalSince1970,
                           accuracy: 1.0)
        } else {
            XCTFail("Couple not found")
        }
    }

    func testSaveProfileTrimsWhitespace() async throws {
        await viewModel.loadUserData()

        viewModel.userName = "  Trimmed Name  "
        viewModel.userEmail = "  trimmed@example.com  "

        try viewModel.saveProfile()

        let descriptor = FetchDescriptor<User>(
            predicate: #Predicate { user in
                user.id == testUserId
            }
        )
        let users = try modelContext.fetch(descriptor)

        XCTAssertEqual(users.first?.name, "Trimmed Name")
        XCTAssertEqual(users.first?.email, "trimmed@example.com")
    }

    func testSaveProfileWithoutUser() throws {
        // Don't load user data, so user is nil
        XCTAssertNoThrow(try viewModel.saveProfile()) // Should not throw, just return
    }

    // MARK: - Session Rules Tests

    func testSaveSessionRules() {
        viewModel.sessionDuration = 45
        viewModel.allowPauses = false
        viewModel.requireTimer = true

        viewModel.saveSessionRules()

        XCTAssertEqual(UserDefaults.standard.integer(forKey: "sessionDuration"), 45)
        XCTAssertEqual(UserDefaults.standard.bool(forKey: "allowPauses"), false)
        XCTAssertEqual(UserDefaults.standard.bool(forKey: "requireTimer"), true)
    }

    func testLoadSessionRules() {
        // Set values in UserDefaults
        UserDefaults.standard.set(60, forKey: "sessionDuration")
        UserDefaults.standard.set(false, forKey: "allowPauses")
        UserDefaults.standard.set(true, forKey: "requireTimer")

        viewModel.loadSessionRules()

        XCTAssertEqual(viewModel.sessionDuration, 60)
        XCTAssertEqual(viewModel.allowPauses, false)
        XCTAssertEqual(viewModel.requireTimer, true)
    }

    func testLoadSessionRulesWithDefaults() {
        // Don't set any values in UserDefaults
        viewModel.loadSessionRules()

        XCTAssertEqual(viewModel.sessionDuration, 30) // Default value
        XCTAssertEqual(viewModel.allowPauses, false) // UserDefaults bool default
        XCTAssertEqual(viewModel.requireTimer, false) // UserDefaults bool default
    }

    func testSessionRulesPersistence() {
        // Save rules
        viewModel.sessionDuration = 90
        viewModel.allowPauses = true
        viewModel.requireTimer = false
        viewModel.saveSessionRules()

        // Create new view model and load rules
        let newViewModel = SettingsViewModel(modelContext: modelContext, currentUserId: testUserId)
        newViewModel.loadSessionRules()

        XCTAssertEqual(newViewModel.sessionDuration, 90)
        XCTAssertEqual(newViewModel.allowPauses, true)
        XCTAssertEqual(newViewModel.requireTimer, false)
    }

    // MARK: - Integration Tests

    func testFullProfileUpdateFlow() async throws {
        // Load data
        await viewModel.loadUserData()

        // Update all profile fields
        viewModel.userName = "New Name"
        viewModel.userEmail = "new@example.com"
        viewModel.relationshipStartDate = Date()

        // Save changes
        try viewModel.saveProfile()

        // Create new view model and verify changes persisted
        let newViewModel = SettingsViewModel(modelContext: modelContext, currentUserId: testUserId)
        await newViewModel.loadUserData()

        XCTAssertEqual(newViewModel.userName, "New Name")
        XCTAssertEqual(newViewModel.userEmail, "new@example.com")
    }

    func testFullSessionRulesUpdateFlow() {
        // Set custom values
        viewModel.sessionDuration = 75
        viewModel.allowPauses = false
        viewModel.requireTimer = true

        // Save
        viewModel.saveSessionRules()

        // Load in new view model
        let newViewModel = SettingsViewModel(modelContext: modelContext, currentUserId: testUserId)
        newViewModel.loadSessionRules()

        XCTAssertEqual(newViewModel.sessionDuration, 75)
        XCTAssertEqual(newViewModel.allowPauses, false)
        XCTAssertEqual(newViewModel.requireTimer, true)
    }
}
