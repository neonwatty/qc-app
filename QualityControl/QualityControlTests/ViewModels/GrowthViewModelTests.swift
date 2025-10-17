//
//  GrowthViewModelTests.swift
//  QualityControlTests
//
//  Week 5: Growth Gallery Tests
//  Tests for GrowthViewModel
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class GrowthViewModelTests: XCTestCase {

    var modelContainer: ModelContainer!
    var modelContext: ModelContext!
    var viewModel: GrowthViewModel!
    var testCoupleId: UUID!

    override func setUp() async throws {
        // Use TestModelContext helper for consistent container management
        (modelContainer, modelContext) = try TestModelContext.create()

        // Create test couple
        testCoupleId = UUID()
        let user1 = User(id: UUID(), name: "User 1", email: "user1@test.com")
        let user2 = User(id: UUID(), name: "User 2", email: "user2@test.com")
        let couple = Couple(id: testCoupleId, relationshipStartDate: Date())
        modelContext.insert(user1)
        modelContext.insert(user2)
        modelContext.insert(couple)
        try modelContext.save()

        // Initialize view model
        viewModel = GrowthViewModel(modelContext: modelContext, coupleId: testCoupleId)
    }

    override func tearDown() {
        viewModel = nil
        testCoupleId = nil
        modelContext = nil
        modelContainer = nil
    }

    // MARK: - Initialization Tests

    func testInitialization() {
        XCTAssertTrue(viewModel.milestones.isEmpty)
        XCTAssertNil(viewModel.stats)
        XCTAssertEqual(viewModel.selectedView, .timeline)
        XCTAssertEqual(viewModel.selectedTimeRange, .all)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.error)
    }

    // MARK: - Milestone CRUD Tests

    func testAddMilestone() throws {
        let title = "First Date Anniversary"
        let description = "Celebrating our first date"
        let category = "Anniversary"

        try viewModel.addMilestone(title: title, description: description, category: category)

        XCTAssertEqual(viewModel.milestones.count, 1)
        let milestone = viewModel.milestones.first!
        XCTAssertEqual(milestone.title, title)
        XCTAssertEqual(milestone.milestoneDescription, description)
        XCTAssertEqual(milestone.category, category)
        XCTAssertFalse(milestone.isAchieved)
        XCTAssertNil(milestone.achievedAt)
    }

    func testAddMultipleMilestones() throws {
        try viewModel.addMilestone(title: "Milestone 1", description: "First", category: "Growth")
        try viewModel.addMilestone(title: "Milestone 2", description: "Second", category: "Communication")
        try viewModel.addMilestone(title: "Milestone 3", description: "Third", category: "Trust")

        XCTAssertEqual(viewModel.milestones.count, 3)
    }

    func testMarkMilestoneAchieved() throws {
        try viewModel.addMilestone(title: "Test Milestone", description: "Test", category: "Growth")
        let milestone = viewModel.milestones.first!

        XCTAssertFalse(milestone.isAchieved)
        XCTAssertNil(milestone.achievedAt)

        try viewModel.markMilestoneAchieved(milestone)

        XCTAssertTrue(milestone.isAchieved)
        XCTAssertNotNil(milestone.achievedAt)
    }

    func testDeleteMilestone() throws {
        try viewModel.addMilestone(title: "To Delete", description: "Test", category: "Growth")
        XCTAssertEqual(viewModel.milestones.count, 1)

        let milestone = viewModel.milestones.first!
        try viewModel.deleteMilestone(milestone)

        XCTAssertEqual(viewModel.milestones.count, 0)
    }

    func testDeleteMultipleMilestones() throws {
        try viewModel.addMilestone(title: "M1", description: "D1", category: "Growth")
        try viewModel.addMilestone(title: "M2", description: "D2", category: "Communication")
        try viewModel.addMilestone(title: "M3", description: "D3", category: "Trust")
        XCTAssertEqual(viewModel.milestones.count, 3)

        let toDelete = Array(viewModel.milestones.prefix(2))
        for milestone in toDelete {
            try viewModel.deleteMilestone(milestone)
        }

        XCTAssertEqual(viewModel.milestones.count, 1)
        XCTAssertEqual(viewModel.milestones.first?.title, "M3")
    }

    // MARK: - Data Loading Tests

    func testLoadMilestones() async throws {
        // Create milestones directly in context
        let milestone1 = Milestone(title: "M1", description: "D1", category: "Growth", coupleId: testCoupleId)
        let milestone2 = Milestone(title: "M2", description: "D2", category: "Communication", coupleId: testCoupleId)
        modelContext.insert(milestone1)
        modelContext.insert(milestone2)
        try modelContext.save()

        await viewModel.loadData()

        XCTAssertEqual(viewModel.milestones.count, 2)
        XCTAssertFalse(viewModel.isLoading)
    }

    func testLoadMilestonesFiltersByCouple() async throws {
        let otherCoupleId = UUID()

        // Create milestones for different couples
        let myMilestone = Milestone(title: "My Milestone", description: "Mine", category: "Growth", coupleId: testCoupleId)
        let otherMilestone = Milestone(title: "Other Milestone", description: "Theirs", category: "Growth", coupleId: otherCoupleId)
        modelContext.insert(myMilestone)
        modelContext.insert(otherMilestone)
        try modelContext.save()

        await viewModel.loadData()

        XCTAssertEqual(viewModel.milestones.count, 1)
        XCTAssertEqual(viewModel.milestones.first?.title, "My Milestone")
    }

    func testRefresh() async throws {
        // Create initial milestone
        let milestone1 = Milestone(title: "M1", description: "D1", category: "Growth", coupleId: testCoupleId)
        modelContext.insert(milestone1)
        try modelContext.save()

        await viewModel.loadData()
        XCTAssertEqual(viewModel.milestones.count, 1)

        // Add another milestone
        let milestone2 = Milestone(title: "M2", description: "D2", category: "Communication", coupleId: testCoupleId)
        modelContext.insert(milestone2)
        try modelContext.save()

        await viewModel.refresh()
        XCTAssertEqual(viewModel.milestones.count, 2)
    }

    // MARK: - Statistics Tests

    func testStatsInitiallyNil() {
        XCTAssertNil(viewModel.stats)
    }

    func testLoadStatsCalculatesCorrectly() async throws {
        // Create milestones
        let achieved1 = Milestone(title: "Achieved 1", description: "D1", category: "Growth", coupleId: testCoupleId)
        achieved1.isAchieved = true
        achieved1.achievedAt = Date()

        let achieved2 = Milestone(title: "Achieved 2", description: "D2", category: "Communication", coupleId: testCoupleId)
        achieved2.isAchieved = true
        achieved2.achievedAt = Date()

        let pending = Milestone(title: "Pending", description: "D3", category: "Trust", coupleId: testCoupleId)

        modelContext.insert(achieved1)
        modelContext.insert(achieved2)
        modelContext.insert(pending)
        try modelContext.save()

        await viewModel.loadData()

        XCTAssertNotNil(viewModel.stats)
        guard let stats = viewModel.stats else {
            XCTFail("Stats should not be nil")
            return
        }
        XCTAssertEqual(stats.achievedMilestones, 2)
        XCTAssertEqual(stats.totalMilestones, 3)
        XCTAssertEqual(stats.completionRate, 2.0 / 3.0, accuracy: 0.01)
    }

    func testStatsWithNoMilestones() async throws {
        await viewModel.loadData()

        XCTAssertNotNil(viewModel.stats)
        XCTAssertEqual(viewModel.stats?.achievedMilestones, 0)
        XCTAssertEqual(viewModel.stats?.totalMilestones, 0)
        XCTAssertEqual(viewModel.stats?.completionRate, 0)
    }

    func testStatsWithCheckIns() async throws {
        // Create completed check-ins
        let checkIn1 = CheckInSession(coupleId: testCoupleId)
        checkIn1.status = .completed
        checkIn1.completedAt = Date()

        let checkIn2 = CheckInSession(coupleId: testCoupleId)
        checkIn2.status = .completed
        checkIn2.completedAt = Date()

        modelContext.insert(checkIn1)
        modelContext.insert(checkIn2)
        try modelContext.save()

        await viewModel.loadData()

        XCTAssertNotNil(viewModel.stats)
        XCTAssertEqual(viewModel.stats?.totalCheckIns, 2)
    }

    func testCurrentStreakWithConsecutiveDays() async throws {
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())

        // Create check-ins for today and yesterday
        let checkInToday = CheckInSession(coupleId: testCoupleId)
        checkInToday.status = .completed
        checkInToday.completedAt = today

        let checkInYesterday = CheckInSession(coupleId: testCoupleId)
        checkInYesterday.status = .completed
        checkInYesterday.completedAt = calendar.date(byAdding: .day, value: -1, to: today)!

        modelContext.insert(checkInToday)
        modelContext.insert(checkInYesterday)
        try modelContext.save()

        await viewModel.loadData()

        XCTAssertNotNil(viewModel.stats)
        XCTAssertGreaterThanOrEqual(viewModel.stats!.currentStreak, 2)
    }

    func testCurrentStreakWithGap() async throws {
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())

        // Create check-ins with a gap
        let checkInToday = CheckInSession(coupleId: testCoupleId)
        checkInToday.status = .completed
        checkInToday.completedAt = today

        let checkInOld = CheckInSession(coupleId: testCoupleId)
        checkInOld.status = .completed
        checkInOld.completedAt = calendar.date(byAdding: .day, value: -5, to: today)!

        modelContext.insert(checkInToday)
        modelContext.insert(checkInOld)
        try modelContext.save()

        await viewModel.loadData()

        XCTAssertNotNil(viewModel.stats)
        // Current streak should be 1 (only today)
        XCTAssertEqual(viewModel.stats!.currentStreak, 1)
    }

    // MARK: - Filtering Tests

    func testFilteredMilestonesByTimeRange() throws {
        let calendar = Calendar.current
        let now = Date()

        // Add three milestones in order: Recent, Old, Pending
        try viewModel.addMilestone(title: "Recent", description: "D1", category: "Growth")
        try viewModel.addMilestone(title: "Old", description: "D2", category: "Communication")
        try viewModel.addMilestone(title: "Pending", description: "D3", category: "Trust")

        // Now mark them as achieved with appropriate dates
        // milestones[0] = "Recent" - mark with recent date
        try viewModel.markMilestoneAchieved(viewModel.milestones[0])
        viewModel.milestones[0].achievedAt = calendar.date(byAdding: .day, value: -3, to: now)

        // milestones[1] = "Old" - mark with old date
        try viewModel.markMilestoneAchieved(viewModel.milestones[1])
        viewModel.milestones[1].achievedAt = calendar.date(byAdding: .day, value: -30, to: now)

        // milestones[2] = "Pending" - leave as pending (not marked as achieved)

        // Test week filter - should include:
        // - "Recent" (achieved within week)
        // - "Pending" (not achieved, so included regardless of time)
        // Should exclude:
        // - "Old" (achieved over a week ago)
        viewModel.selectedTimeRange = .week
        let weekFiltered = viewModel.filteredMilestones
        XCTAssertEqual(weekFiltered.count, 2)

        let titles = Set(weekFiltered.map { $0.title })
        XCTAssertTrue(titles.contains("Recent"))
        XCTAssertTrue(titles.contains("Pending"))
        XCTAssertFalse(titles.contains("Old"))
    }

    func testFilteredMilestonesAllTimeRange() throws {
        try viewModel.addMilestone(title: "M1", description: "D1", category: "Growth")
        try viewModel.addMilestone(title: "M2", description: "D2", category: "Communication")

        viewModel.selectedTimeRange = .all
        let filtered = viewModel.filteredMilestones

        XCTAssertEqual(filtered.count, 2)
    }

    func testAchievedMilestones() throws {
        try viewModel.addMilestone(title: "Achieved", description: "D1", category: "Growth")
        try viewModel.addMilestone(title: "Pending", description: "D2", category: "Communication")

        try viewModel.markMilestoneAchieved(viewModel.milestones.first!)

        let achieved = viewModel.achievedMilestones
        XCTAssertEqual(achieved.count, 1)
        XCTAssertEqual(achieved.first?.title, "Achieved")
    }

    func testPendingMilestones() throws {
        try viewModel.addMilestone(title: "Achieved", description: "D1", category: "Growth")
        try viewModel.addMilestone(title: "Pending", description: "D2", category: "Communication")

        try viewModel.markMilestoneAchieved(viewModel.milestones.first!)

        let pending = viewModel.pendingMilestones
        XCTAssertEqual(pending.count, 1)
        XCTAssertEqual(pending.first?.title, "Pending")
    }

    // MARK: - Chart Data Tests

    func testGetCheckInChartDataWithNoCheckIns() throws {
        let chartData = try viewModel.getCheckInChartData(range: .all)
        XCTAssertTrue(chartData.isEmpty)
    }

    func testGetCheckInChartDataGroupsByWeek() throws {
        let calendar = Calendar.current
        let now = Date()

        // Create check-ins in different weeks
        let checkIn1 = CheckInSession(coupleId: testCoupleId)
        checkIn1.status = .completed
        checkIn1.completedAt = now

        let checkIn2 = CheckInSession(coupleId: testCoupleId)
        checkIn2.status = .completed
        checkIn2.completedAt = now

        let checkIn3 = CheckInSession(coupleId: testCoupleId)
        checkIn3.status = .completed
        checkIn3.completedAt = calendar.date(byAdding: .day, value: -10, to: now)

        modelContext.insert(checkIn1)
        modelContext.insert(checkIn2)
        modelContext.insert(checkIn3)
        try modelContext.save()

        let chartData = try viewModel.getCheckInChartData(range: .all)

        XCTAssertGreaterThanOrEqual(chartData.count, 2)
        // Should have grouped the 2 check-ins from this week
        let thisWeekData = chartData.first { dataPoint in
            calendar.isDate(dataPoint.date, equalTo: now, toGranularity: .weekOfYear)
        }
        XCTAssertNotNil(thisWeekData)
        XCTAssertEqual(thisWeekData?.count, 2)
    }

    func testGetCheckInChartDataFiltersIncomplete() throws {
        // Create incomplete check-in
        let incompleteCheckIn = CheckInSession(coupleId: testCoupleId)
        incompleteCheckIn.status = .inProgress

        // Create complete check-in
        let completeCheckIn = CheckInSession(coupleId: testCoupleId)
        completeCheckIn.status = .completed
        completeCheckIn.completedAt = Date()

        modelContext.insert(incompleteCheckIn)
        modelContext.insert(completeCheckIn)
        try modelContext.save()

        let chartData = try viewModel.getCheckInChartData(range: .all)

        // Should only include the completed check-in
        XCTAssertEqual(chartData.count, 1)
        XCTAssertEqual(chartData.first?.count, 1)
    }

    func testGetCheckInChartDataWeekRange() throws {
        let calendar = Calendar.current
        let now = Date()

        // Create check-in within week
        let recentCheckIn = CheckInSession(coupleId: testCoupleId)
        recentCheckIn.status = .completed
        recentCheckIn.completedAt = calendar.date(byAdding: .day, value: -3, to: now)

        // Create check-in outside week
        let oldCheckIn = CheckInSession(coupleId: testCoupleId)
        oldCheckIn.status = .completed
        oldCheckIn.completedAt = calendar.date(byAdding: .day, value: -10, to: now)

        modelContext.insert(recentCheckIn)
        modelContext.insert(oldCheckIn)
        try modelContext.save()

        let chartData = try viewModel.getCheckInChartData(range: .week)

        // Should only include recent check-in
        XCTAssertEqual(chartData.count, 1)
    }

    // MARK: - View State Tests

    func testSelectedViewDefaultsToTimeline() {
        XCTAssertEqual(viewModel.selectedView, .timeline)
    }

    func testChangeSelectedView() {
        viewModel.selectedView = .progress
        XCTAssertEqual(viewModel.selectedView, .progress)

        viewModel.selectedView = .charts
        XCTAssertEqual(viewModel.selectedView, .charts)
    }

    func testSelectedTimeRangeDefaultsToAll() {
        XCTAssertEqual(viewModel.selectedTimeRange, .all)
    }

    func testChangeSelectedTimeRange() {
        viewModel.selectedTimeRange = .week
        XCTAssertEqual(viewModel.selectedTimeRange, .week)

        viewModel.selectedTimeRange = .month
        XCTAssertEqual(viewModel.selectedTimeRange, .month)
    }
}
