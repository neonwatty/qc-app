//
//  GrowthProgressView.swift
//  QualityControl
//
//  Week 5: Growth Gallery
//  Progress bars and completion metrics
//

import SwiftUI
import SwiftData

struct GrowthProgressView: View {

    // MARK: - Properties

    @Bindable var viewModel: GrowthViewModel

    // MARK: - Body

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: QCSpacing.lg) {
                if let stats = viewModel.stats {
                    // Overall Progress
                    progressCard(
                        title: "Overall Completion",
                        value: stats.completionRate,
                        subtitle: "\(stats.achievedMilestones) of \(stats.totalMilestones) milestones"
                    )

                    // Streaks Section
                    streaksCard(stats)
                }
            }
            .padding(QCSpacing.lg)
        }
    }

    // MARK: - View Components

    private func progressCard(title: String, value: Double, subtitle: String) -> some View {
        QCCard(header: title) {
            VStack(alignment: .leading, spacing: QCSpacing.md) {
                // Progress Bar
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        // Background
                        RoundedRectangle(cornerRadius: 8)
                            .fill(QCColors.backgroundTertiary)
                            .frame(height: 32)

                        // Progress
                        RoundedRectangle(cornerRadius: 8)
                            .fill(QCColors.primary)
                            .frame(width: geometry.size.width * value, height: 32)

                        // Percentage Text
                        Text("\(Int(value * 100))%")
                            .font(QCTypography.heading6)
                            .foregroundColor(value > 0.5 ? QCColors.textOnPrimary : QCColors.textPrimary)
                            .frame(maxWidth: .infinity)
                    }
                }
                .frame(height: 32)

                Text(subtitle)
                    .font(QCTypography.bodySmall)
                    .foregroundColor(QCColors.textSecondary)
            }
        }
    }

    private func streaksCard(_ stats: GrowthStats) -> some View {
        QCCard(header: "Streaks") {
            HStack(spacing: QCSpacing.lg) {
                StreakStat(
                    title: "Current",
                    value: stats.currentStreak,
                    icon: "flame.fill",
                    color: QCColors.error
                )

                Divider()

                StreakStat(
                    title: "Longest",
                    value: stats.longestStreak,
                    icon: "trophy.fill",
                    color: QCColors.warning
                )
            }
            .padding(.vertical, QCSpacing.sm)
        }
    }

}

// MARK: - Supporting Views

private struct StreakStat: View {
    let title: String
    let value: Int
    let icon: String
    let color: Color

    var body: some View {
        HStack(spacing: QCSpacing.sm) {
            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundColor(color)

            VStack(alignment: .leading, spacing: 2) {
                Text("\(value)")
                    .font(QCTypography.heading4)
                    .foregroundColor(QCColors.textPrimary)

                Text(title)
                    .font(QCTypography.captionSmall)
                    .foregroundColor(QCColors.textSecondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

// MARK: - Preview

#Preview("GrowthProgressView") {
    @Previewable @State var viewModel: GrowthViewModel = {
        let container = PreviewContainer.create()
        let context = container.mainContext

        let coupleDescriptor = FetchDescriptor<Couple>()
        let couple = try? context.fetch(coupleDescriptor).first

        return GrowthViewModel(modelContext: context, coupleId: couple?.id ?? UUID())
    }()

    GrowthProgressView(viewModel: viewModel)
        .modelContainer(PreviewContainer.create())
}
