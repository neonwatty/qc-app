//
//  TimelineView.swift
//  QualityControl
//
//  Week 5: Growth Gallery
//  Timeline view showing milestones chronologically
//

import SwiftUI
import SwiftData

struct TimelineView: View {

    // MARK: - Properties

    @Bindable var viewModel: GrowthViewModel

    // MARK: - Body

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: QCSpacing.lg) {
                // Time Range Picker
                timeRangePicker

                // Achieved Milestones
                if !viewModel.achievedMilestones.isEmpty {
                    sectionHeader("Achieved")
                    milestonesSection(viewModel.achievedMilestones)
                }

                // Pending Milestones
                if !viewModel.pendingMilestones.isEmpty {
                    sectionHeader("In Progress")
                    milestonesSection(viewModel.pendingMilestones)
                }

                // Empty State
                if viewModel.filteredMilestones.isEmpty {
                    emptyState
                }
            }
            .padding(QCSpacing.lg)
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

    private func sectionHeader(_ title: String) -> some View {
        Text(title)
            .font(QCTypography.heading5)
            .foregroundColor(QCColors.textPrimary)
            .padding(.top, QCSpacing.sm)
    }

    private func milestonesSection(_ milestones: [Milestone]) -> some View {
        VStack(spacing: QCSpacing.md) {
            ForEach(milestones) { milestone in
                MilestoneCard(milestone: milestone)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: QCSpacing.md) {
            Image(systemName: "star.fill")
                .font(.system(size: 60))
                .foregroundColor(QCColors.textTertiary)

            Text("No milestones yet")
                .font(QCTypography.heading5)
                .foregroundColor(QCColors.textPrimary)

            Text("Create your first milestone to track your growth together")
                .font(QCTypography.body)
                .foregroundColor(QCColors.textSecondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(QCSpacing.xl)
    }
}

// MARK: - Milestone Card

struct MilestoneCard: View {
    let milestone: Milestone

    var body: some View {
        QCCard {
            HStack(spacing: QCSpacing.md) {
                // Icon
                ZStack {
                    Circle()
                        .fill(milestone.isAchieved ? QCColors.success.opacity(0.1) : QCColors.textTertiary.opacity(0.1))
                        .frame(width: 44, height: 44)

                    Image(systemName: milestone.isAchieved ? "checkmark.circle.fill" : "circle")
                        .font(.system(size: 24))
                        .foregroundColor(milestone.isAchieved ? QCColors.success : QCColors.textTertiary)
                }

                // Content
                VStack(alignment: .leading, spacing: QCSpacing.xs) {
                    Text(milestone.title)
                        .font(QCTypography.body)
                        .foregroundColor(QCColors.textPrimary)

                    Text(milestone.milestoneDescription)
                        .font(QCTypography.bodySmall)
                        .foregroundColor(QCColors.textSecondary)
                        .lineLimit(2)

                    if let achievedAt = milestone.achievedAt {
                        Text(formatDate(achievedAt))
                            .font(QCTypography.captionSmall)
                            .foregroundColor(QCColors.textTertiary)
                    }
                }

                Spacer()

                // Category Badge
                Text(milestone.category)
                    .font(QCTypography.captionSmall)
                    .foregroundColor(QCColors.primary)
                    .padding(.horizontal, QCSpacing.xs)
                    .padding(.vertical, 2)
                    .background(QCColors.primary.opacity(0.1))
                    .cornerRadius(4)
            }
            .padding(QCSpacing.sm)
        }
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}

// MARK: - Preview

#Preview("TimelineView") {
    @Previewable @State var viewModel: GrowthViewModel = {
        let container = PreviewContainer.create()
        let context = container.mainContext

        let coupleDescriptor = FetchDescriptor<Couple>()
        let couple = try? context.fetch(coupleDescriptor).first

        return GrowthViewModel(modelContext: context, coupleId: couple?.id ?? UUID())
    }()

    TimelineView(viewModel: viewModel)
        .modelContainer(PreviewContainer.create())
}
