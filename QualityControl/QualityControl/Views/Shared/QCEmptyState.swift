//
//  QCEmptyState.swift
//  QualityControl
//
//  Week 2: Design System
//  Empty state view with icon, title, subtitle, and optional action
//

import SwiftUI

/// QualityControl empty state component
/// Displays when no content is available with optional action button
struct QCEmptyState: View {
    // MARK: - Properties

    let icon: String
    let title: String
    let subtitle: String
    var actionTitle: String? = nil
    var action: (() -> Void)? = nil

    // MARK: - Body

    var body: some View {
        VStack(spacing: QCSpacing.lg) {
            Spacer()

            // Icon
            Image(systemName: icon)
                .font(.system(size: QCSpacing.iconSizeXL))
                .foregroundColor(QCColors.textTertiary)
                .padding(.bottom, QCSpacing.sm)

            // Title
            Text(title)
                .font(QCTypography.heading4)
                .foregroundColor(QCColors.textPrimary)
                .multilineTextAlignment(.center)

            // Subtitle
            Text(subtitle)
                .font(QCTypography.body)
                .foregroundColor(QCColors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, QCSpacing.xl)

            // Action Button
            if let actionTitle = actionTitle, let action = action {
                QCButton.primary(actionTitle, action: action)
                    .padding(.horizontal, QCSpacing.xl)
                    .padding(.top, QCSpacing.md)
            }

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .transition(.qcScaleFade)
    }
}

// MARK: - Convenience Initializers

extension QCEmptyState {
    /// Empty state for no check-ins
    static var noCheckIns: QCEmptyState {
        QCEmptyState(
            icon: "heart.text.square",
            title: "No Check-ins Yet",
            subtitle: "Start your first check-in to strengthen your relationship.",
            actionTitle: "Start Check-in",
            action: nil // Action will be provided by caller
        )
    }

    /// Empty state for no notes
    static var noNotes: QCEmptyState {
        QCEmptyState(
            icon: "note.text",
            title: "No Notes",
            subtitle: "Capture your thoughts and reflections here.",
            actionTitle: "Add Note",
            action: nil
        )
    }

    /// Empty state for no milestones
    static var noMilestones: QCEmptyState {
        QCEmptyState(
            icon: "star",
            title: "No Milestones Yet",
            subtitle: "Complete check-ins to unlock relationship milestones.",
            actionTitle: nil,
            action: nil
        )
    }

    /// Empty state for no reminders
    static var noReminders: QCEmptyState {
        QCEmptyState(
            icon: "bell",
            title: "No Reminders",
            subtitle: "Set up reminders to stay connected with your partner.",
            actionTitle: "Add Reminder",
            action: nil
        )
    }

    /// Empty state for no requests
    static var noRequests: QCEmptyState {
        QCEmptyState(
            icon: "envelope",
            title: "No Requests",
            subtitle: "Send thoughtful requests to your partner.",
            actionTitle: "New Request",
            action: nil
        )
    }

    /// Empty state for search results
    static func noSearchResults(query: String) -> QCEmptyState {
        QCEmptyState(
            icon: "magnifyingglass",
            title: "No Results",
            subtitle: "No results found for \"\(query)\". Try a different search.",
            actionTitle: nil,
            action: nil
        )
    }

    /// Empty state for filtered content
    static var noFilteredResults: QCEmptyState {
        QCEmptyState(
            icon: "line.3.horizontal.decrease.circle",
            title: "No Results",
            subtitle: "No items match the current filters. Try adjusting your filters.",
            actionTitle: nil,
            action: nil
        )
    }

    /// Generic empty state
    static func custom(
        icon: String,
        title: String,
        subtitle: String,
        actionTitle: String? = nil,
        action: (() -> Void)? = nil
    ) -> QCEmptyState {
        QCEmptyState(
            icon: icon,
            title: title,
            subtitle: subtitle,
            actionTitle: actionTitle,
            action: action
        )
    }
}

// MARK: - Preview

#Preview("QCEmptyState Variants") {
    TabView {
        // No Check-ins
        QCEmptyState.noCheckIns
            .tabItem { Label("Check-ins", systemImage: "heart.fill") }

        // No Notes
        QCEmptyState.noNotes
            .tabItem { Label("Notes", systemImage: "note.text") }

        // No Milestones
        QCEmptyState.noMilestones
            .tabItem { Label("Milestones", systemImage: "star") }

        // No Reminders
        QCEmptyState.noReminders
            .tabItem { Label("Reminders", systemImage: "bell") }

        // No Requests
        QCEmptyState.noRequests
            .tabItem { Label("Requests", systemImage: "envelope") }

        // No Search Results
        QCEmptyState.noSearchResults(query: "love languages")
            .tabItem { Label("Search", systemImage: "magnifyingglass") }

        // Custom Empty State
        QCEmptyState.custom(
            icon: "checkmark.circle",
            title: "All Caught Up!",
            subtitle: "You've completed all your tasks. Great job!",
            actionTitle: "View History",
            action: { print("View history tapped") }
        )
        .tabItem { Label("Custom", systemImage: "checkmark.circle") }
    }
}
