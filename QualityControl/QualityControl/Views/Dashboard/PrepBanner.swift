//
//  PrepBanner.swift
//  QualityControl
//
//  Week 3: Dashboard Components
//  Banner recommending preparation for upcoming check-in
//

import SwiftUI

/// Prep banner for encouraging check-in preparation
/// Dismissible banner with action buttons
struct PrepBanner: View {

    // MARK: - Properties

    let onPrepare: () -> Void
    let onDismiss: () -> Void

    // MARK: - Body

    var body: some View {
        QCCard(
            padding: .medium,
            backgroundColor: QCColors.primary.opacity(0.1)
        ) {
            VStack(alignment: .leading, spacing: QCSpacing.md) {
                // Header
                HStack {
                    HStack(spacing: QCSpacing.xs) {
                        Image(systemName: "calendar")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(QCColors.primary)

                        Text("Prepare for Your Tomorrow Check-In")
                            .font(QCTypography.heading6)
                            .foregroundColor(QCColors.textPrimary)
                    }

                    Spacer()

                    Button(action: onDismiss) {
                        Image(systemName: "xmark")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(QCColors.textTertiary)
                    }
                }

                // Description
                Text("Take a moment to think about what you'd like to discuss with your partner. Adding topics beforehand helps make your check-in more focused and meaningful.")
                    .font(QCTypography.bodySmall)
                    .foregroundColor(QCColors.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)

                // Meta Info
                HStack(spacing: QCSpacing.lg) {
                    Label("Takes 2-3 minutes", systemImage: "clock")
                        .font(QCTypography.captionSmall)
                        .foregroundColor(QCColors.textTertiary)

                    Label("Jordan can add topics too", systemImage: "person.2")
                        .font(QCTypography.captionSmall)
                        .foregroundColor(QCColors.textTertiary)
                }

                // Actions
                HStack(spacing: QCSpacing.sm) {
                    QCButton.primary("Prepare Topics", size: .small, action: onPrepare)

                    QCButton.tertiary("Maybe Later", size: .small, action: onDismiss)
                }
            }
        }
    }
}

// MARK: - Preview

#Preview("PrepBanner") {
    VStack(spacing: 24) {
        PrepBanner(
            onPrepare: { print("Prepare tapped") },
            onDismiss: { print("Dismiss tapped") }
        )

        // In context
        ScrollView {
            VStack(spacing: 16) {
                PrepBanner(
                    onPrepare: {},
                    onDismiss: {}
                )

                QuickActionCard.checkIn {}
                QuickActionCard.notes {}
            }
            .padding()
        }
    }
    .background(QCColors.backgroundPrimary)
}
