//
//  GrowthViewModel.swift
//  QualityControl
//
//  Week 5: Growth Gallery
//  State management for growth tracking and milestones
//

import Foundation
import SwiftData

@MainActor
@Observable
class GrowthViewModel {

    // MARK: - Properties

    private let modelContext: ModelContext
    private let coupleId: UUID

    var milestones: [Milestone] = []
    var stats: GrowthStats?
    var selectedView: GrowthViewType = .timeline
    var selectedTimeRange: TimeRange = .all
    var isLoading: Bool = false
    var error: Error?

    // MARK: - Initialization

    init(modelContext: ModelContext, coupleId: UUID) {
        self.modelContext = modelContext
        self.coupleId = coupleId
    }

    // MARK: - Data Loading

    func loadData() async {
        isLoading = true
        error = nil

        do {
            try await loadMilestones()
            try await loadStats()
        } catch {
            self.error = error
        }

        isLoading = false
    }

    func refresh() async {
        await loadData()
    }

    // MARK: - Milestones

    private func loadMilestones() async throws {
        let descriptor = FetchDescriptor<Milestone>(
            sortBy: [SortDescriptor(\.achievedAt, order: .reverse)]
        )

        let allMilestones = try modelContext.fetch(descriptor)
        milestones = allMilestones.filter { $0.coupleId == coupleId }
    }

    func addMilestone(title: String, description: String, category: String) throws {
        let milestone = Milestone(
            title: title,
            description: description,
            category: category,
            coupleId: coupleId
        )

        modelContext.insert(milestone)
        try modelContext.save()

        milestones.insert(milestone, at: 0)
    }

    func markMilestoneAchieved(_ milestone: Milestone) throws {
        milestone.isAchieved = true
        milestone.achievedAt = Date()

        try modelContext.save()
    }

    func deleteMilestone(_ milestone: Milestone) throws {
        modelContext.delete(milestone)
        try modelContext.save()

        milestones.removeAll { $0.id == milestone.id }
    }

    // MARK: - Statistics

    private func loadStats() async throws {
        let checkInCount = try getCheckInCount()
        let achievedMilestones = milestones.filter { $0.isAchieved }.count
        let totalMilestones = milestones.count
        let currentStreak = try getCurrentStreak()
        let longestStreak = try getLongestStreak()

        stats = GrowthStats(
            totalCheckIns: checkInCount,
            achievedMilestones: achievedMilestones,
            totalMilestones: totalMilestones,
            currentStreak: currentStreak,
            longestStreak: longestStreak,
            completionRate: totalMilestones > 0 ? Double(achievedMilestones) / Double(totalMilestones) : 0
        )
    }

    private func getCheckInCount() throws -> Int {
        let descriptor = FetchDescriptor<CheckInSession>()
        let allSessions = try modelContext.fetch(descriptor)
        return allSessions.filter { $0.coupleId == coupleId && $0.status == .completed }.count
    }

    private func getCurrentStreak() throws -> Int {
        let descriptor = FetchDescriptor<CheckInSession>(
            sortBy: [SortDescriptor(\.completedAt, order: .reverse)]
        )

        let allSessions = try modelContext.fetch(descriptor)
        let sessions = allSessions.filter { $0.coupleId == coupleId && $0.status == .completed }
        guard !sessions.isEmpty else { return 0 }

        var streak = 0
        var currentDate = Calendar.current.startOfDay(for: Date())

        for session in sessions {
            guard let completedDate = session.completedAt else { continue }
            let sessionDate = Calendar.current.startOfDay(for: completedDate)

            let daysDiff = Calendar.current.dateComponents([.day], from: sessionDate, to: currentDate).day ?? 0

            if daysDiff == 0 || daysDiff == 1 {
                streak += 1
                currentDate = sessionDate
            } else {
                break
            }
        }

        return streak
    }

    private func getLongestStreak() throws -> Int {
        let descriptor = FetchDescriptor<CheckInSession>(
            sortBy: [SortDescriptor(\.completedAt, order: .reverse)]
        )

        let allSessions = try modelContext.fetch(descriptor)
        let sessions = allSessions.filter { $0.coupleId == coupleId && $0.status == .completed }
        guard !sessions.isEmpty else { return 0 }

        var longestStreak = 0
        var currentStreak = 1
        var previousDate: Date?

        for session in sessions {
            guard let completedDate = session.completedAt else { continue }
            let sessionDate = Calendar.current.startOfDay(for: completedDate)

            if let prevDate = previousDate {
                let daysDiff = Calendar.current.dateComponents([.day], from: sessionDate, to: prevDate).day ?? 0

                if daysDiff == 1 {
                    currentStreak += 1
                } else {
                    longestStreak = max(longestStreak, currentStreak)
                    currentStreak = 1
                }
            }

            previousDate = sessionDate
        }

        return max(longestStreak, currentStreak)
    }

    // MARK: - Filtering

    var filteredMilestones: [Milestone] {
        var filtered = milestones

        // Filter by time range
        switch selectedTimeRange {
        case .week:
            let weekAgo = Calendar.current.date(byAdding: .day, value: -7, to: Date())!
            filtered = filtered.filter { milestone in
                guard let achievedAt = milestone.achievedAt else { return false }
                return achievedAt >= weekAgo
            }
        case .month:
            let monthAgo = Calendar.current.date(byAdding: .month, value: -1, to: Date())!
            filtered = filtered.filter { milestone in
                guard let achievedAt = milestone.achievedAt else { return false }
                return achievedAt >= monthAgo
            }
        case .year:
            let yearAgo = Calendar.current.date(byAdding: .year, value: -1, to: Date())!
            filtered = filtered.filter { milestone in
                guard let achievedAt = milestone.achievedAt else { return false }
                return achievedAt >= yearAgo
            }
        case .all:
            break
        }

        return filtered
    }

    var achievedMilestones: [Milestone] {
        filteredMilestones.filter { $0.isAchieved }
    }

    var pendingMilestones: [Milestone] {
        filteredMilestones.filter { !$0.isAchieved }
    }

    // MARK: - Chart Data

    func getCheckInChartData(range: TimeRange) throws -> [ChartDataPoint] {
        let descriptor = FetchDescriptor<CheckInSession>(
            sortBy: [SortDescriptor(\.completedAt, order: .forward)]
        )

        let allSessions = try modelContext.fetch(descriptor)
        let sessions = allSessions.filter { $0.coupleId == coupleId && $0.status == .completed }

        // Group by period based on range
        let calendar = Calendar.current
        var dataPoints: [ChartDataPoint] = []

        let startDate: Date
        switch range {
        case .week:
            startDate = calendar.date(byAdding: .day, value: -7, to: Date())!
        case .month:
            startDate = calendar.date(byAdding: .month, value: -1, to: Date())!
        case .year:
            startDate = calendar.date(byAdding: .year, value: -1, to: Date())!
        case .all:
            startDate = sessions.first?.completedAt ?? Date()
        }

        let filteredSessions = sessions.filter { session in
            guard let completedAt = session.completedAt else { return false }
            return completedAt >= startDate
        }

        // Group by week for the chart
        let grouped = Dictionary(grouping: filteredSessions) { session -> Date in
            guard let completedAt = session.completedAt else { return Date() }
            let components = calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: completedAt)
            return calendar.date(from: components) ?? Date()
        }

        dataPoints = grouped.map { date, sessions in
            ChartDataPoint(date: date, count: sessions.count)
        }.sorted { $0.date < $1.date }

        return dataPoints
    }
}

// MARK: - Supporting Types

struct GrowthStats {
    let totalCheckIns: Int
    let achievedMilestones: Int
    let totalMilestones: Int
    let currentStreak: Int
    let longestStreak: Int
    let completionRate: Double
}

enum GrowthViewType: String, CaseIterable {
    case timeline = "Timeline"
    case progress = "Progress"
    case charts = "Charts"

    var icon: String {
        switch self {
        case .timeline: return "clock.fill"
        case .progress: return "chart.bar.fill"
        case .charts: return "chart.line.uptrend.xyaxis"
        }
    }
}

enum TimeRange: String, CaseIterable {
    case week = "Week"
    case month = "Month"
    case year = "Year"
    case all = "All Time"
}

struct ChartDataPoint: Identifiable {
    let id = UUID()
    let date: Date
    let count: Int
}
