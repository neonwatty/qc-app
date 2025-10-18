//
//  SettingsView.swift
//  QualityControl
//
//  Week 7: Settings System
//  Main settings view with all sections
//

import SwiftUI
import SwiftData

struct SettingsView: View {

    // MARK: - Properties

    @Environment(\.modelContext) private var modelContext
    @State private var viewModel: SettingsViewModel
    @State private var showLoveLanguages = false
    @State private var showOnboarding = false

    private let currentUserId: UUID

    // MARK: - Initialization

    init(currentUserId: UUID) {
        self.currentUserId = currentUserId
        _viewModel = State(initialValue: SettingsViewModel(
            modelContext: ModelContext(ModelContainer.shared),
            currentUserId: currentUserId
        ))
    }

    // MARK: - Body

    var body: some View {
        NavigationStack {
            List {
                profileSection
                sessionSection
                featuresSection
                preferencesSection
                aboutSection
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.large)
            .task {
                await viewModel.loadUserData()
            }
            .sheet(isPresented: $showLoveLanguages) {
                LoveLanguagesView(currentUserId: currentUserId)
            }
            .fullScreenCover(isPresented: $showOnboarding) {
                OnboardingFlowView(isOnboardingComplete: $showOnboarding)
            }
        }
    }

    // MARK: - Sections

    private var profileSection: some View {
        Section {
            NavigationLink(destination: ProfileSettingsView(viewModel: viewModel, showOnboarding: $showOnboarding)) {
                SettingsRow(
                    icon: "heart.fill",
                    iconColor: QCColors.primary,
                    title: "Profile & Relationship",
                    subtitle: "Manage your couple profile and relationship details"
                )
            }
        }
    }

    private var sessionSection: some View {
        Section {
            NavigationLink(destination: SessionRulesView(viewModel: viewModel)) {
                SettingsRow(
                    icon: "person.2.fill",
                    iconColor: QCColors.secondary,
                    title: "Session Rules",
                    subtitle: "Configure check-in session settings and rules"
                )
            }
        }
    }

    private var featuresSection: some View {
        Section {
            Button(action: { showLoveLanguages = true }) {
                SettingsRow(
                    icon: "heart.circle.fill",
                    iconColor: QCColors.tertiary,
                    title: "Love Languages",
                    subtitle: "Manage your love languages"
                )
            }

            NavigationLink(destination: DiscussionCategoriesView()) {
                SettingsRow(
                    icon: "square.grid.3x3.fill",
                    iconColor: QCColors.info,
                    title: "Discussion Categories",
                    subtitle: "Customize categories and prompts for check-ins"
                )
            }

            NavigationLink(destination: NotificationsView()) {
                SettingsRow(
                    icon: "bell.fill",
                    iconColor: QCColors.warning,
                    title: "Notifications",
                    subtitle: "Configure check-in reminders and app notifications"
                )
            }
        } header: {
            Text("Features")
        }
    }

    private var preferencesSection: some View {
        Section {
            NavigationLink(destination: PrivacySharingView()) {
                SettingsRow(
                    icon: "lock.shield.fill",
                    iconColor: QCColors.success,
                    title: "Privacy & Sharing",
                    subtitle: "Control what information is shared between partners"
                )
            }

            NavigationLink(destination: AppearanceView()) {
                SettingsRow(
                    icon: "paintbrush.fill",
                    iconColor: QCColors.secondary,
                    title: "Appearance",
                    subtitle: "Customize the app theme and display preferences"
                )
            }

            NavigationLink(destination: CheckInScheduleView()) {
                SettingsRow(
                    icon: "clock.fill",
                    iconColor: QCColors.primary,
                    title: "Check-in Schedule",
                    subtitle: "Set up regular check-in reminders and frequency"
                )
            }
        } header: {
            Text("Preferences")
        }
    }

    private var aboutSection: some View {
        Section {
            NavigationLink(destination: AboutView()) {
                SettingsRow(
                    icon: "info.circle.fill",
                    iconColor: QCColors.info,
                    title: "About",
                    subtitle: "Version, support, and legal information"
                )
            }
        } header: {
            Text("About")
        }
    }
}

// MARK: - Settings Row Component

struct SettingsRow: View {
    let icon: String
    let iconColor: Color
    let title: String
    let subtitle: String

    var body: some View {
        HStack(spacing: QCSpacing.md) {
            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundStyle(iconColor)
                .frame(width: 32)

            VStack(alignment: .leading, spacing: QCSpacing.xs) {
                Text(title)
                    .font(QCTypography.body)
                    .fontWeight(.semibold)
                    .foregroundStyle(QCColors.textPrimary)

                Text(subtitle)
                    .font(QCTypography.bodySmall)
                    .foregroundStyle(QCColors.textSecondary)
            }
        }
        .padding(.vertical, QCSpacing.xs)
    }
}

// MARK: - Preview

#Preview {
    SettingsView(currentUserId: UUID())
        .modelContainer(PreviewContainer.create())
}
