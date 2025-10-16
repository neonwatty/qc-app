//
//  ChartsView.swift
//  QualityControl
//
//  Week 5: Growth Gallery
//  Charts showing check-in activity over time
//

import SwiftUI
import SwiftData
import Charts

struct ChartsView: View {

    // MARK: - Properties

    @Bindable var viewModel: GrowthViewModel
    @State private var chartData: [ChartDataPoint] = []

    // MARK: - Body

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: QCSpacing.lg) {
                // Time Range Picker
                timeRangePicker

                // Check-in Activity Chart
                if !chartData.isEmpty {
                    checkInChart
                } else {
                    emptyState
                }

                // Stats Summary
                if let stats = viewModel.stats {
                    statsSummary(stats)
                }
            }
            .padding(QCSpacing.lg)
        }
        .task {
            loadChartData()
        }
        .onChange(of: viewModel.selectedTimeRange) { _, _ in
            loadChartData()
        }
    }

    // MARK: - View Components

    private var timeRangePicker: some View {
        Picker("Time Range", selection: $viewModel.selectedTimeRange) {
            ForEach(TimeRange.allCases, id: \.self) { range in
                Text(range.rawValue).tag(range)
            }
        }
        .pickerStyle(.segmented)
    }

    private var checkInChart: some View {
        QCCard(header: "Check-in Activity") {
            VStack(alignment: .leading, spacing: QCSpacing.md) {
                Chart(chartData) { dataPoint in
                    BarMark(
                        x: .value("Week", dataPoint.date, unit: .weekOfYear),
                        y: .value("Count", dataPoint.count)
                    )
                    .foregroundStyle(QCColors.primary)
                    .cornerRadius(4)
                }
                .frame(height: 200)
                .chartXAxis {
                    AxisMarks(values: .stride(by: .weekOfYear)) { _ in
                        AxisGridLine()
                        AxisTick()
                        AxisValueLabel(format: .dateTime.month().day())
                    }
                }
                .chartYAxis {
                    AxisMarks(position: .leading)
                }

                Text("Weekly check-in frequency")
                    .font(QCTypography.bodySmall)
                    .foregroundColor(QCColors.textSecondary)
            }
        }
    }

    private func statsSummary(_ stats: GrowthStats) -> some View {
        QCCard(header: "Statistics") {
            VStack(spacing: QCSpacing.md) {
                StatRow(label: "Total Check-ins", value: "\(stats.totalCheckIns)")
                Divider()
                StatRow(label: "Current Streak", value: "\(stats.currentStreak) days")
                Divider()
                StatRow(label: "Longest Streak", value: "\(stats.longestStreak) days")
                Divider()
                StatRow(label: "Completion Rate", value: "\(Int(stats.completionRate * 100))%")
            }
        }
    }

    private var emptyState: some View {
        QCCard {
            VStack(spacing: QCSpacing.md) {
                Image(systemName: "chart.bar")
                    .font(.system(size: 48))
                    .foregroundColor(QCColors.textTertiary)

                Text("No data available")
                    .font(QCTypography.heading6)
                    .foregroundColor(QCColors.textSecondary)

                Text("Complete check-ins to see your activity chart")
                    .font(QCTypography.bodySmall)
                    .foregroundColor(QCColors.textTertiary)
                    .multilineTextAlignment(.center)
            }
            .padding(QCSpacing.lg)
        }
    }

    // MARK: - Actions

    private func loadChartData() {
        do {
            chartData = try viewModel.getCheckInChartData(range: viewModel.selectedTimeRange)
        } catch {
            print("Error loading chart data: \(error)")
        }
    }
}

// MARK: - Supporting Views

private struct StatRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .font(QCTypography.body)
                .foregroundColor(QCColors.textSecondary)

            Spacer()

            Text(value)
                .font(QCTypography.heading6)
                .foregroundColor(QCColors.textPrimary)
        }
    }
}

// MARK: - Preview

#Preview("ChartsView") {
    @Previewable @State var viewModel: GrowthViewModel = {
        let container = PreviewContainer.create()
        let context = container.mainContext

        let coupleDescriptor = FetchDescriptor<Couple>()
        let couple = try? context.fetch(coupleDescriptor).first

        return GrowthViewModel(modelContext: context, coupleId: couple?.id ?? UUID())
    }()

    ChartsView(viewModel: viewModel)
        .modelContainer(PreviewContainer.create())
}
