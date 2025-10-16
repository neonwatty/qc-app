//
//  GrowthView.swift
//  QualityControl
//
//  Week 5: Growth Gallery
//  Main growth tracking view with timeline, progress, and charts
//

import SwiftUI
import SwiftData
import Charts

struct GrowthView: View {

    // MARK: - Properties

    @Environment(\.modelContext) private var modelContext
    @Query private var couples: [Couple]
    @State private var viewModel: GrowthViewModel?

    // MARK: - Body

    var body: some View {
        NavigationStack {
            Group {
                if let viewModel = viewModel {
                    if viewModel.isLoading && viewModel.milestones.isEmpty {
                        loadingView
                    } else {
                        contentView
                    }
                } else {
                    loadingView
                }
            }
            .navigationTitle("Growth Gallery")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    if viewModel != nil {
                        addButton
                    }
                }
            }
            .task {
                if viewModel == nil, let couple = couples.first {
                    let vm = GrowthViewModel(modelContext: modelContext, coupleId: couple.id)
                    viewModel = vm
                    await vm.loadData()
                }
            }
            .refreshable {
                await viewModel?.refresh()
            }
        }
    }

    // MARK: - View Components

    private var contentView: some View {
        VStack(spacing: 0) {
            // Stats Cards
            if let stats = viewModel?.stats {
                statsSection(stats)
                    .padding(.horizontal, QCSpacing.lg)
                    .padding(.top, QCSpacing.lg)
            }

            // Segmented Picker
            if let viewModel = viewModel {
                Picker("View", selection: Binding(
                    get: { viewModel.selectedView },
                    set: { viewModel.selectedView = $0 }
                )) {
                    ForEach(GrowthViewType.allCases, id: \.self) { type in
                        Text(type.rawValue).tag(type)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal, QCSpacing.lg)
                .padding(.vertical, QCSpacing.md)
            }

            // Content based on selected view
            if let viewModel = viewModel {
                switch viewModel.selectedView {
                case .timeline:
                    TimelineView(viewModel: viewModel)
                case .progress:
                    GrowthProgressView(viewModel: viewModel)
                case .charts:
                    ChartsView(viewModel: viewModel)
                }
            }
        }
        .background(QCColors.backgroundPrimary)
    }

    private func statsSection(_ stats: GrowthStats) -> some View {
        HStack(spacing: QCSpacing.sm) {
            StatCard(
                title: "Check-ins",
                value: "\(stats.totalCheckIns)",
                icon: "heart.fill",
                color: QCColors.primary
            )

            StatCard(
                title: "Milestones",
                value: "\(stats.achievedMilestones)/\(stats.totalMilestones)",
                icon: "star.fill",
                color: QCColors.warning
            )

            StatCard(
                title: "Streak",
                value: "\(stats.currentStreak)",
                icon: "flame.fill",
                color: QCColors.error
            )
        }
    }

    private var loadingView: some View {
        VStack(spacing: QCSpacing.md) {
            ProgressView()
            Text("Loading growth data...")
                .font(QCTypography.body)
                .foregroundColor(QCColors.textSecondary)
        }
    }

    private var addButton: some View {
        Button {
            // TODO: Show add milestone sheet
        } label: {
            Image(systemName: "plus.circle.fill")
                .font(.system(size: 20))
        }
    }
}

// MARK: - Supporting Views

private struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: QCSpacing.xs) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundColor(color)

            Text(value)
                .font(QCTypography.heading5)
                .foregroundColor(QCColors.textPrimary)

            Text(title)
                .font(QCTypography.captionSmall)
                .foregroundColor(QCColors.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, QCSpacing.md)
        .background(QCColors.backgroundSecondary)
        .qcCardCornerRadius()
    }
}

// MARK: - Preview

#Preview("GrowthView") {
    GrowthView()
        .modelContainer(PreviewContainer.create())
}
