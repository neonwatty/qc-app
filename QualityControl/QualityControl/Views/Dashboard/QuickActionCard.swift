//
//  QuickActionCard.swift
//  QualityControl
//
//  Week 3: Dashboard Components
//  Quick action card for dashboard actions
//

import SwiftUI

/// Quick action card component
/// Shows icon, title, description, and action button
struct QuickActionCard: View {

    // MARK: - Properties

    let icon: String
    let title: String
    let description: String
    let buttonTitle: String
    let action: () -> Void
    var iconColor: Color = QCColors.primary

    // MARK: - Body

    var body: some View {
        QCCard(padding: .medium) {
            VStack(alignment: .leading, spacing: QCSpacing.md) {
                // Icon and Title
                HStack(spacing: QCSpacing.sm) {
                    Image(systemName: icon)
                        .font(.system(size: 24, weight: .medium))
                        .foregroundColor(iconColor)
                        .frame(width: 40, height: 40)

                    Text(title)
                        .font(QCTypography.heading6)
                        .foregroundColor(QCColors.textPrimary)

                    Spacer()
                }

                // Description
                Text(description)
                    .font(QCTypography.bodySmall)
                    .foregroundColor(QCColors.textSecondary)
                    .lineLimit(2)

                // Action Button
                QCButton.secondary(buttonTitle, size: .small, action: action)
            }
        }
    }
}

// MARK: - Convenience Initializers

extension QuickActionCard {
    /// Quick action for starting a check-in
    static func checkIn(action: @escaping () -> Void) -> QuickActionCard {
        QuickActionCard(
            icon: "heart.circle.fill",
            title: "Start Check-in",
            description: "Begin a new relationship check-in session",
            buttonTitle: "Start Check-in",
            action: action,
            iconColor: QCColors.primary
        )
    }

    /// Quick action for viewing notes
    static func notes(action: @escaping () -> Void) -> QuickActionCard {
        QuickActionCard(
            icon: "note.text",
            title: "View Notes",
            description: "Review your shared and private notes",
            buttonTitle: "View Notes",
            action: action,
            iconColor: QCColors.info
        )
    }

    /// Quick action for growth gallery
    static func growth(action: @escaping () -> Void) -> QuickActionCard {
        QuickActionCard(
            icon: "chart.line.uptrend.xyaxis",
            title: "Growth Gallery",
            description: "Track your relationship progress",
            buttonTitle: "View Growth",
            action: action,
            iconColor: QCColors.success
        )
    }

    /// Quick action for reminders
    static func reminders(action: @escaping () -> Void) -> QuickActionCard {
        QuickActionCard(
            icon: "bell.fill",
            title: "Reminders",
            description: "Manage your personal reminders",
            buttonTitle: "View Reminders",
            action: action,
            iconColor: QCColors.warning
        )
    }

    /// Quick action for requests
    static func requests(action: @escaping () -> Void) -> QuickActionCard {
        QuickActionCard(
            icon: "envelope.fill",
            title: "Requests",
            description: "Partner requests and suggestions",
            buttonTitle: "View Requests",
            action: action,
            iconColor: QCColors.secondary
        )
    }
}

// MARK: - Preview

#Preview("QuickActionCard Variants") {
    ScrollView {
        VStack(spacing: QCSpacing.md) {
            QuickActionCard.checkIn {}
            QuickActionCard.notes {}
            QuickActionCard.growth {}
            QuickActionCard.reminders {}
            QuickActionCard.requests {}

            // Custom
            QuickActionCard(
                icon: "star.fill",
                title: "Custom Action",
                description: "This is a custom quick action card with a different icon color",
                buttonTitle: "Take Action",
                action: {},
                iconColor: .purple
            )
        }
        .padding()
    }
    .background(QCColors.backgroundPrimary)
}
