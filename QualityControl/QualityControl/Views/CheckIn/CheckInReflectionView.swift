//
//  CheckInReflectionView.swift
//  QualityControl
//
//  Week 4: Check-In Flow
//  Reflection screen - fourth step of check-in
//

import SwiftUI
import SwiftData

/// Check-In Reflection View
/// Allows partners to reflect on the session and rate their mood
struct CheckInReflectionView: View {

    // MARK: - Properties

    @Bindable var viewModel: CheckInViewModel
    let onContinue: () -> Void
    let onBack: () -> Void

    @State private var reflectionText: String = ""
    @State private var selectedMood: MoodRating?

    // MARK: - Body

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: QCSpacing.lg) {
                // Header
                headerSection

                // Mood Selection
                moodSection

                // Reflection Text
                reflectionSection
            }
            .padding(QCSpacing.lg)
        }
        .background(QCColors.backgroundPrimary)
        .navigationTitle("Reflect")
        .navigationBarTitleDisplayMode(.inline)
        .safeAreaInset(edge: .bottom) {
            bottomBar
        }
        .onAppear {
            reflectionText = viewModel.sessionNotes
            selectedMood = viewModel.session?.mood
        }
    }

    // MARK: - View Components

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: QCSpacing.sm) {
            Text("How did this check-in go?")
                .font(QCTypography.heading4)
                .foregroundColor(QCColors.textPrimary)

            Text("Take a moment to reflect on your conversation")
                .font(QCTypography.body)
                .foregroundColor(QCColors.textSecondary)
        }
    }

    private var moodSection: some View {
        QCCard(header: "Overall Mood") {
            VStack(spacing: QCSpacing.md) {
                Text("How are you feeling about the session?")
                    .font(QCTypography.bodySmall)
                    .foregroundColor(QCColors.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .leading)

                HStack(spacing: QCSpacing.sm) {
                    ForEach([MoodRating.veryNegative, .negative, .neutral, .positive, .veryPositive], id: \.self) { mood in
                        MoodButton(
                            mood: mood,
                            isSelected: selectedMood == mood,
                            action: {
                                selectedMood = mood
                                viewModel.session?.mood = mood
                            }
                        )
                    }
                }
            }
        }
    }

    private var reflectionSection: some View {
        QCCard(header: "Session Reflection") {
            VStack(alignment: .leading, spacing: QCSpacing.sm) {
                Text("What stood out to you in this check-in?")
                    .font(QCTypography.bodySmall)
                    .foregroundColor(QCColors.textSecondary)

                TextEditor(text: $reflectionText)
                    .font(QCTypography.body)
                    .foregroundColor(QCColors.textPrimary)
                    .frame(minHeight: 150)
                    .padding(QCSpacing.sm)
                    .background(QCColors.surfaceInput)
                    .qcCardCornerRadius()
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(QCColors.border, lineWidth: 1)
                    )
                    .onChange(of: reflectionText) { _, newValue in
                        viewModel.updateSessionNotes(newValue)
                    }

                Text("This is visible to both partners")
                    .font(QCTypography.captionSmall)
                    .foregroundColor(QCColors.textTertiary)
            }
        }
    }

    private var bottomBar: some View {
        VStack(spacing: QCSpacing.sm) {
            QCButton.primary(
                "Continue to Action Items",
                icon: "arrow.right",
                action: onContinue
            )
            .disabled(selectedMood == nil)

            QCButton.tertiary("Back", size: .small, action: onBack)
        }
        .padding(QCSpacing.lg)
        .background(QCColors.backgroundPrimary)
    }
}

// MARK: - Supporting Views

private struct MoodButton: View {
    let mood: MoodRating
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: QCSpacing.xs) {
                Text(mood.rawValue)
                    .font(.system(size: 32))

                Text(mood.label)
                    .font(QCTypography.captionSmall)
                    .foregroundColor(isSelected ? QCColors.primary : QCColors.textSecondary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, QCSpacing.sm)
            .background(isSelected ? QCColors.primary.opacity(0.1) : Color.clear)
            .qcCardCornerRadius()
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(isSelected ? QCColors.primary : QCColors.border, lineWidth: isSelected ? 2 : 1)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - MoodRating Extension

extension MoodRating {
    var label: String {
        switch self {
        case .veryPositive: return "Great"
        case .positive: return "Good"
        case .neutral: return "Okay"
        case .negative: return "Poor"
        case .veryNegative: return "Bad"
        }
    }
}

// MARK: - Preview

#Preview("CheckInReflectionView") {
    @Previewable @State var viewModel: CheckInViewModel = {
        let container = PreviewContainer.create()
        let context = container.mainContext

        let descriptor = FetchDescriptor<CheckInSession>()
        let session = try? context.fetch(descriptor).first

        return CheckInViewModel(modelContext: context, session: session)
    }()

    let container = PreviewContainer.create()

    NavigationStack {
        CheckInReflectionView(
            viewModel: viewModel,
            onContinue: { print("Continue tapped") },
            onBack: { print("Back tapped") }
        )
        .modelContainer(container)
    }
}
