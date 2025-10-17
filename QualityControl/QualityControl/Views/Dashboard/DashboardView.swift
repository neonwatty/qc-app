//
//  DashboardView.swift
//  QualityControl
//
//  Week 3: Dashboard
//  Main dashboard view with stats, actions, and recent activity
//

import SwiftUI
import SwiftData

/// Dashboard view - relationship command center
/// Shows stats, quick actions, and recent activity
struct DashboardView: View {

    // MARK: - Properties

    @Environment(\.modelContext) private var modelContext
    @State private var viewModel: DashboardViewModel?
    @State private var showCheckIn = false
    @State private var showNotes = false
    @State private var showGrowth = false
    @State private var showReminders = false
    @State private var showRequests = false

    let couple: Couple?

    // MARK: - Initialization

    init(couple: Couple?) {
        self.couple = couple
    }

    // MARK: - Body

    var body: some View {
        NavigationStack {
            Group {
                if let viewModel = viewModel {
                    dashboardContent(viewModel: viewModel)
                } else {
                    QCLoadingView.fullScreen("Setting up dashboard...")
                }
            }
            .task {
                if viewModel == nil {
                    viewModel = DashboardViewModel(modelContext: modelContext, couple: couple)
                    await viewModel?.loadDashboard()
                }
            }
        }
    }

    @ViewBuilder
    private func dashboardContent(viewModel: DashboardViewModel) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: QCSpacing.lg) {
                // Header
                headerSection

                // Prep Banner
                if viewModel.showPrepBanner {
                    PrepBanner(
                        onPrepare: {
                            // Start check-in flow for prep
                            do {
                                let _ = try viewModel.startCheckIn()
                                showCheckIn = true
                            } catch {
                                print("Error starting check-in: \(error)")
                            }
                        },
                        onDismiss: {
                            viewModel.dismissPrepBanner()
                        }
                    )
                }

                // Quick Actions
                quickActionsSection(viewModel: viewModel)

                // Stats Summary (if available)
                if let stats = viewModel.stats {
                    statsSection(stats: stats, viewModel: viewModel)
                }

                // Recent Activity
                if viewModel.hasRecentActivity {
                    recentActivitySection(viewModel: viewModel)
                }
            }
            .padding()
        }
        .background(QCColors.backgroundPrimary)
        .navigationTitle("Dashboard")
        .navigationBarTitleDisplayMode(.inline)
        .refreshable {
            await viewModel.refresh()
        }
        .overlay {
            if viewModel.isLoading && viewModel.stats == nil {
                QCLoadingView.fullScreen("Loading dashboard...")
            }
        }
        .sheet(isPresented: $showCheckIn) {
            if let couple = couple {
                CheckInFlowView(
                    modelContext: modelContext,
                    couple: couple,
                    onComplete: {
                        showCheckIn = false
                        Task {
                            await viewModel.refresh()
                        }
                    }
                )
            }
        }
        .navigationDestination(isPresented: $showNotes) {
            NotesListView()
        }
        .navigationDestination(isPresented: $showGrowth) {
            GrowthView()
        }
        .navigationDestination(isPresented: $showReminders) {
            RemindersListView()
        }
        .navigationDestination(isPresented: $showRequests) {
            if let couple = couple, let user = couple.users?.first {
                RequestsListView(currentUserId: user.id)
            } else {
                Text("No user found")
            }
        }
    }

    // MARK: - View Components

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: QCSpacing.xs) {
            Text("Welcome to Your Dashboard")
                .font(QCTypography.heading3)
                .foregroundColor(QCColors.textPrimary)

            Text("Your relationship command center")
                .font(QCTypography.body)
                .foregroundColor(QCColors.textSecondary)
        }
    }

    private func quickActionsSection(viewModel: DashboardViewModel) -> some View {
        VStack(spacing: QCSpacing.md) {
            // Primary Check-in Action
            QCCard(padding: .medium, backgroundColor: QCColors.primary.opacity(0.1)) {
                VStack(alignment: .leading, spacing: QCSpacing.md) {
                    HStack(spacing: QCSpacing.sm) {
                        Image(systemName: "heart.circle.fill")
                            .font(.system(size: 32, weight: .medium))
                            .foregroundColor(QCColors.primary)

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Start Check-in")
                                .font(QCTypography.heading5)
                                .foregroundColor(QCColors.textPrimary)

                            Text("Begin a new relationship check-in session")
                                .font(QCTypography.bodySmall)
                                .foregroundColor(QCColors.textSecondary)
                        }
                    }

                    QCButton.primary("Start Check-in", icon: "heart.fill") {
                        do {
                            let _ = try viewModel.startCheckIn()
                            showCheckIn = true
                        } catch {
                            print("Error starting check-in: \(error)")
                        }
                    }
                }
            }

            // Other Quick Actions
            QuickActionCard.notes {
                showNotes = true
            }

            QuickActionCard.growth {
                showGrowth = true
            }

            QuickActionCard.reminders {
                showReminders = true
            }

            QuickActionCard.requests {
                showRequests = true
            }
        }
    }

    private func statsSection(stats: DashboardStats, viewModel: DashboardViewModel) -> some View {
        QCCard(header: "Your Progress") {
            VStack(spacing: QCSpacing.md) {
                // Stats Grid
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: QCSpacing.md) {
                    StatItem(
                        value: "\(stats.totalCheckIns)",
                        label: "Check-ins",
                        icon: "heart.fill",
                        color: QCColors.primary
                    )

                    StatItem(
                        value: "\(stats.currentStreak)",
                        label: "Day Streak",
                        icon: "flame.fill",
                        color: QCColors.warning
                    )

                    StatItem(
                        value: "\(stats.totalNotes)",
                        label: "Notes",
                        icon: "note.text",
                        color: QCColors.info
                    )
                }

                Divider()

                // Last Check-in
                HStack {
                    Text(viewModel.getLastCheckInText())
                        .font(QCTypography.bodySmall)
                        .foregroundColor(QCColors.textSecondary)

                    Spacer()
                }
            }
        }
    }

    private func recentActivitySection(viewModel: DashboardViewModel) -> some View {
        QCCard(header: "Recent Activity") {
            VStack(alignment: .leading, spacing: 0) {
                ForEach(viewModel.recentActivity) { item in
                    ActivityFeedItemView(item: item)

                    if item.id != viewModel.recentActivity.last?.id {
                        Divider()
                            .padding(.leading, 44)
                    }
                }
            }
        }
    }
}

// MARK: - Supporting Views

private struct StatItem: View {
    let value: String
    let label: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: QCSpacing.xs) {
            Image(systemName: icon)
                .font(.system(size: 20, weight: .medium))
                .foregroundColor(color)

            Text(value)
                .font(QCTypography.heading4)
                .foregroundColor(QCColors.textPrimary)

            Text(label)
                .font(QCTypography.captionSmall)
                .foregroundColor(QCColors.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, QCSpacing.sm)
        .background(color.opacity(0.05))
        .qcCardCornerRadius()
    }
}

// MARK: - Preview

#Preview("DashboardView") {
    let container = PreviewContainer.create()
    let context = container.mainContext

    // Fetch the demo couple from the preview container
    let descriptor = FetchDescriptor<Couple>()
    let couple = try? context.fetch(descriptor).first

    DashboardView(couple: couple)
        .modelContainer(container)
}
