//
//  MainTabView.swift
//  QualityControl
//
//  Created by Jeremy Watt on 10/15/25.
//

import SwiftUI
import SwiftData

struct MainTabView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var couples: [Couple]
    @Query private var users: [User]
    @State private var tabCoordinator = TabCoordinator()

    var body: some View {
        TabView(selection: $tabCoordinator.selectedTab) {
            // Dashboard Tab
            DashboardViewWrapper(couple: couples.first)
                .tabItem {
                    Label("Dashboard", systemImage: "house.fill")
                }
                .badge(tabCoordinator.getBadgeCount(for: .dashboard) ?? 0)
                .tag(Tab.dashboard)

            // Check-in Tab
            CheckInTabView(couple: couples.first)
                .tabItem {
                    Label("Check-in", systemImage: "heart.text.square.fill")
                }
                .badge(tabCoordinator.getBadgeCount(for: .checkIn) ?? 0)
                .tag(Tab.checkIn)

            // Notes Tab
            NotesListView()
                .tabItem {
                    Label("Notes", systemImage: "note.text")
                }
                .badge(tabCoordinator.getBadgeCount(for: .notes) ?? 0)
                .tag(Tab.notes)

            // Growth Tab
            GrowthView()
                .tabItem {
                    Label("Growth", systemImage: "chart.line.uptrend.xyaxis")
                }
                .badge(tabCoordinator.getBadgeCount(for: .growth) ?? 0)
                .tag(Tab.growth)

            // Settings Tab
            if let currentUser = users.first {
                SettingsView(currentUserId: currentUser.id)
                    .tabItem {
                        Label("Settings", systemImage: "gearshape.fill")
                    }
                    .badge(tabCoordinator.getBadgeCount(for: .settings) ?? 0)
                    .tag(Tab.settings)
            } else {
                SettingsPlaceholderView()
                    .tabItem {
                        Label("Settings", systemImage: "gearshape.fill")
                    }
                    .badge(tabCoordinator.getBadgeCount(for: .settings) ?? 0)
                    .tag(Tab.settings)
            }
        }
        .tint(QCColors.primary)
        .environment(tabCoordinator)
    }
}

enum Tab: String, CaseIterable {
    case dashboard
    case checkIn
    case notes
    case growth
    case settings

    var title: String {
        switch self {
        case .dashboard: return "Dashboard"
        case .checkIn: return "Check-in"
        case .notes: return "Notes"
        case .growth: return "Growth"
        case .settings: return "Settings"
        }
    }
}

// MARK: - Placeholder Views (Week 1)

struct DashboardPlaceholderView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Image(systemName: "house.fill")
                    .font(.system(size: 60))
                    .foregroundColor(QCColors.primary)

                Text("Dashboard")
                    .font(.title)
                    .fontWeight(.bold)

                Text("Coming in Week 3")
                    .font(.caption)
                    .foregroundColor(QCColors.textSecondary)
            }
            .navigationTitle("Dashboard")
        }
    }
}

struct CheckInPlaceholderView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Image(systemName: "heart.text.square.fill")
                    .font(.system(size: 60))
                    .foregroundColor(QCColors.primary)

                Text("Check-in")
                    .font(.title)
                    .fontWeight(.bold)

                Text("Coming in Week 3-4")
                    .font(.caption)
                    .foregroundColor(QCColors.textSecondary)
            }
            .navigationTitle("Check-in")
        }
    }
}

struct NotesPlaceholderView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Image(systemName: "note.text")
                    .font(.system(size: 60))
                    .foregroundColor(QCColors.primary)

                Text("Notes")
                    .font(.title)
                    .fontWeight(.bold)

                Text("Coming in Week 4")
                    .font(.caption)
                    .foregroundColor(QCColors.textSecondary)
            }
            .navigationTitle("Notes")
        }
    }
}

struct SettingsPlaceholderView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Image(systemName: "gearshape.fill")
                    .font(.system(size: 60))
                    .foregroundColor(QCColors.primary)

                Text("Settings")
                    .font(.title)
                    .fontWeight(.bold)

                Text("Coming in Week 7-8")
                    .font(.caption)
                    .foregroundColor(QCColors.textSecondary)
            }
            .navigationTitle("Settings")
        }
    }
}

// MARK: - Dashboard Wrapper

struct DashboardViewWrapper: View {
    let couple: Couple?

    var body: some View {
        if let couple = couple {
            DashboardView(couple: couple)
        } else {
            // Onboarding placeholder - no couple yet
            NavigationStack {
                VStack(spacing: 20) {
                    Image(systemName: "heart.fill")
                        .font(.system(size: 60))
                        .foregroundColor(QCColors.primary)

                    Text("Welcome to Quality Control")
                        .font(.title)
                        .fontWeight(.bold)

                    Text("Onboarding flow coming in Week 6")
                        .font(.caption)
                        .foregroundColor(QCColors.textSecondary)
                }
                .navigationTitle("Welcome")
            }
        }
    }
}

// MARK: - Check-In Tab Wrapper

struct CheckInTabView: View {
    @Environment(\.modelContext) private var modelContext
    @State private var showCheckInFlow = false

    let couple: Couple?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: QCSpacing.lg) {
                    // Header
                    VStack(alignment: .leading, spacing: QCSpacing.xs) {
                        Text("Relationship Check-in")
                            .font(QCTypography.heading3)
                            .foregroundColor(QCColors.textPrimary)

                        Text("Connect deeply with your partner")
                            .font(QCTypography.body)
                            .foregroundColor(QCColors.textSecondary)
                    }

                    // Primary Check-in Action
                    QCCard(padding: .large, backgroundColor: QCColors.primary.opacity(0.1)) {
                        VStack(alignment: .leading, spacing: QCSpacing.md) {
                            HStack(spacing: QCSpacing.sm) {
                                Image(systemName: "heart.circle.fill")
                                    .font(.system(size: 48, weight: .medium))
                                    .foregroundColor(QCColors.primary)

                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Ready for a Check-in?")
                                        .font(QCTypography.heading4)
                                        .foregroundColor(QCColors.textPrimary)

                                    Text("6-step guided conversation")
                                        .font(QCTypography.bodySmall)
                                        .foregroundColor(QCColors.textSecondary)
                                }
                            }

                            QCButton.primary("Start Check-in", icon: "heart.fill") {
                                showCheckInFlow = true
                            }
                        }
                    }

                    // How it Works
                    QCCard(header: "How Check-ins Work") {
                        VStack(alignment: .leading, spacing: QCSpacing.md) {
                            CheckInStepRow(
                                number: 1,
                                title: "Choose Topics",
                                description: "Select categories to discuss"
                            )

                            Divider()

                            CheckInStepRow(
                                number: 2,
                                title: "Guided Discussion",
                                description: "Answer prompts together"
                            )

                            Divider()

                            CheckInStepRow(
                                number: 3,
                                title: "Reflect & Grow",
                                description: "Create action items and celebrate wins"
                            )
                        }
                    }
                }
                .padding()
            }
            .background(QCColors.backgroundPrimary)
            .navigationTitle("Check-in")
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showCheckInFlow) {
                if let couple = couple {
                    CheckInFlowView(
                        modelContext: modelContext,
                        couple: couple,
                        onComplete: {
                            showCheckInFlow = false
                        }
                    )
                }
            }
        }
    }
}

// MARK: - Check-In Step Row

private struct CheckInStepRow: View {
    let number: Int
    let title: String
    let description: String

    var body: some View {
        HStack(spacing: QCSpacing.md) {
            ZStack {
                Circle()
                    .fill(QCColors.primary.opacity(0.1))
                    .frame(width: 32, height: 32)

                Text("\(number)")
                    .font(QCTypography.heading6)
                    .foregroundColor(QCColors.primary)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(QCTypography.bodyBold)
                    .foregroundColor(QCColors.textPrimary)

                Text(description)
                    .font(QCTypography.bodySmall)
                    .foregroundColor(QCColors.textSecondary)
            }
        }
    }
}

#Preview {
    MainTabView()
        .modelContainer(PreviewContainer.create())
}
