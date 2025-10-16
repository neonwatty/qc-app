//
//  CheckInWelcomeView.swift
//  QualityControl
//
//  Week 3: Check-In Flow
//  Welcome screen - first step of check-in
//

import SwiftUI

/// Check-In Welcome View
/// Introduces the check-in flow and sets expectations
struct CheckInWelcomeView: View {

    // MARK: - Properties

    let session: CheckInSession?
    let onContinue: () -> Void
    let onCancel: () -> Void

    // MARK: - Body

    var body: some View {
        ScrollView {
            VStack(spacing: QCSpacing.xl) {
                // Header Icon
                Image(systemName: "heart.circle.fill")
                    .font(.system(size: 80, weight: .medium))
                    .foregroundColor(QCColors.primary)
                    .padding(.top, QCSpacing.xl)

                // Title and Description
                VStack(spacing: QCSpacing.md) {
                    Text("Welcome to Your Check-In")
                        .font(QCTypography.heading2)
                        .foregroundColor(QCColors.textPrimary)
                        .multilineTextAlignment(.center)

                    Text("Take a moment to connect with your partner and strengthen your relationship.")
                        .font(QCTypography.body)
                        .foregroundColor(QCColors.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, QCSpacing.md)
                }

                // What to Expect Section
                VStack(alignment: .leading, spacing: QCSpacing.lg) {
                    Text("What to Expect")
                        .font(QCTypography.heading5)
                        .foregroundColor(QCColors.textPrimary)

                    VStack(spacing: QCSpacing.md) {
                        ExpectationRow(
                            icon: "list.bullet.circle.fill",
                            title: "Choose Topics",
                            description: "Select areas you'd like to discuss together"
                        )

                        ExpectationRow(
                            icon: "bubble.left.and.bubble.right.fill",
                            title: "Share Openly",
                            description: "Guided prompts to help the conversation flow"
                        )

                        ExpectationRow(
                            icon: "checkmark.circle.fill",
                            title: "Take Action",
                            description: "Set meaningful goals for your relationship"
                        )
                    }
                }
                .padding(QCSpacing.md)
                .background(QCColors.backgroundSecondary)
                .qcCardCornerRadius()

                // Duration Info
                HStack(spacing: QCSpacing.xs) {
                    Image(systemName: "clock")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(QCColors.textTertiary)

                    Text("Typically takes 15-20 minutes")
                        .font(QCTypography.captionSmall)
                        .foregroundColor(QCColors.textTertiary)
                }

                Spacer()

                // Action Buttons
                VStack(spacing: QCSpacing.sm) {
                    QCButton.primary("Let's Begin", icon: "arrow.right") {
                        onContinue()
                    }

                    QCButton.tertiary("Cancel", size: .small) {
                        onCancel()
                    }
                }
            }
            .padding(QCSpacing.lg)
        }
        .background(QCColors.backgroundPrimary)
        .navigationTitle("Check-In")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Supporting Views

private struct ExpectationRow: View {
    let icon: String
    let title: String
    let description: String

    var body: some View {
        HStack(alignment: .top, spacing: QCSpacing.sm) {
            Image(systemName: icon)
                .font(.system(size: 24, weight: .medium))
                .foregroundColor(QCColors.primary)
                .frame(width: 32)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(QCTypography.heading6)
                    .foregroundColor(QCColors.textPrimary)

                Text(description)
                    .font(QCTypography.bodySmall)
                    .foregroundColor(QCColors.textSecondary)
            }
        }
    }
}

// MARK: - Preview

#Preview("CheckInWelcomeView") {
    NavigationStack {
        CheckInWelcomeView(
            session: nil,
            onContinue: { print("Continue tapped") },
            onCancel: { print("Cancel tapped") }
        )
    }
}
