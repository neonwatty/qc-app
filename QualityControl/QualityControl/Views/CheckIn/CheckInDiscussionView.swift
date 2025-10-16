//
//  CheckInDiscussionView.swift
//  QualityControl
//
//  Week 3: Check-In Flow
//  Discussion screen - third step of check-in (basic implementation)
//

import SwiftUI
import SwiftData

/// Check-In Discussion View
/// Basic discussion screen for selected categories
/// Full implementation with prompts will be in Week 4
struct CheckInDiscussionView: View {

    // MARK: - Properties

    @Bindable var viewModel: CheckInViewModel
    let onContinue: () -> Void
    let onBack: () -> Void

    @State private var currentCategoryIndex: Int = 0

    // MARK: - Body

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: QCSpacing.lg) {
                if viewModel.selectedCategories.isEmpty {
                    // Empty state (shouldn't happen, but safety)
                    QCEmptyState(
                        icon: "bubble.left.and.bubble.right",
                        title: "No Topics Selected",
                        subtitle: "Go back and select topics to discuss."
                    )
                } else {
                    discussionContent
                }
            }
            .padding(QCSpacing.lg)
        }
        .background(QCColors.backgroundPrimary)
        .navigationTitle("Discuss")
        .navigationBarTitleDisplayMode(.inline)
        .safeAreaInset(edge: .bottom) {
            bottomBar
        }
    }

    @ViewBuilder
    private var discussionContent: some View {
        let currentCategory = viewModel.selectedCategories[currentCategoryIndex]

        VStack(alignment: .leading, spacing: QCSpacing.lg) {
            // Current Category Header
            VStack(alignment: .leading, spacing: QCSpacing.md) {
                        // Progress Indicator
                        HStack(spacing: QCSpacing.xs) {
                            ForEach(0..<viewModel.selectedCategories.count, id: \.self) { index in
                                Circle()
                                    .fill(index == currentCategoryIndex ? QCColors.primary : QCColors.textTertiary.opacity(0.3))
                                    .frame(width: 8, height: 8)
                            }
                        }

                        // Category Info
                        HStack(spacing: QCSpacing.sm) {
                            Image(systemName: currentCategory.icon)
                                .font(.system(size: 32, weight: .medium))
                                .foregroundColor(QCColors.primary)

                            VStack(alignment: .leading, spacing: 4) {
                                Text(currentCategory.name)
                                    .font(QCTypography.heading4)
                                    .foregroundColor(QCColors.textPrimary)

                                Text(currentCategory.categoryDescription)
                                    .font(QCTypography.bodySmall)
                                    .foregroundColor(QCColors.textSecondary)
                            }
                        }
                    }
                    .padding(QCSpacing.md)
                    .background(QCColors.backgroundSecondary)
                    .qcCardCornerRadius()

                    // Discussion Prompt Section
                    VStack(alignment: .leading, spacing: QCSpacing.md) {
                        Text("Discussion Prompts")
                            .font(QCTypography.heading6)
                            .foregroundColor(QCColors.textPrimary)

                        if currentCategory.prompts.isEmpty {
                            // Default prompts if none are set
                            PromptCard(prompt: "How are you feeling about this area of our relationship?")
                            PromptCard(prompt: "What's one thing we're doing well here?")
                            PromptCard(prompt: "Is there anything you'd like to improve or change?")
                        } else {
                            ForEach(currentCategory.prompts, id: \.self) { prompt in
                                PromptCard(prompt: prompt)
                            }
                        }
                    }

                    // Notes Section (Basic - Week 3)
                    VStack(alignment: .leading, spacing: QCSpacing.sm) {
                        Text("Discussion Notes")
                            .font(QCTypography.heading6)
                            .foregroundColor(QCColors.textPrimary)

                        Text("Use this space to capture key points from your discussion.")
                            .font(QCTypography.captionSmall)
                            .foregroundColor(QCColors.textSecondary)

                        TextEditor(text: Binding(
                            get: { viewModel.getDiscussionNotes(for: currentCategory.id) },
                            set: { viewModel.updateDiscussionNotes(for: currentCategory.id, notes: $0) }
                        ))
                        .font(QCTypography.body)
                        .foregroundColor(QCColors.textPrimary)
                        .frame(minHeight: 120)
                        .padding(QCSpacing.sm)
                        .background(QCColors.surfaceInput)
                        .qcCardCornerRadius()
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(QCColors.border, lineWidth: 1)
                        )
                    }

            // Navigation between categories
            if viewModel.selectedCategories.count > 1 {
                HStack(spacing: QCSpacing.md) {
                    if currentCategoryIndex > 0 {
                        QCButton.secondary("Previous Topic", size: .small) {
                            withAnimation {
                                currentCategoryIndex -= 1
                            }
                        }
                    }

                    Spacer()

                    if currentCategoryIndex < viewModel.selectedCategories.count - 1 {
                        QCButton.secondary("Next Topic", size: .small) {
                            withAnimation {
                                currentCategoryIndex += 1
                            }
                        }
                    }
                }
            }
        }
    }

    private var bottomBar: some View {
        VStack(spacing: QCSpacing.sm) {
            QCButton.primary(
                "Continue to Next Step",
                icon: "arrow.right",
                action: onContinue
            )

            QCButton.tertiary("Back", size: .small, action: onBack)
        }
        .padding(QCSpacing.lg)
        .background(QCColors.backgroundPrimary)
    }
}

// MARK: - Supporting Views

private struct PromptCard: View {
    let prompt: String

    var body: some View {
        HStack(alignment: .top, spacing: QCSpacing.sm) {
            Image(systemName: "quote.bubble")
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(QCColors.info)

            Text(prompt)
                .font(QCTypography.body)
                .foregroundColor(QCColors.textPrimary)
        }
        .padding(QCSpacing.md)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(QCColors.info.opacity(0.1))
        .qcCardCornerRadius()
    }
}

// MARK: - Preview

#Preview("CheckInDiscussionView") {
    @Previewable @State var viewModel: CheckInViewModel = {
        let container = PreviewContainer.create()
        let context = container.mainContext

        // Fetch a demo session
        let descriptor = FetchDescriptor<CheckInSession>()
        let session = try? context.fetch(descriptor).first

        let vm = CheckInViewModel(
            modelContext: context,
            session: session
        )

        // Select some categories for preview
        let categoryDescriptor = FetchDescriptor<Category>()
        if let categories = try? context.fetch(categoryDescriptor) {
            vm.selectedCategories = Array(categories.prefix(3))
        }

        return vm
    }()

    let container = PreviewContainer.create()

    NavigationStack {
        CheckInDiscussionView(
            viewModel: viewModel,
            onContinue: { print("Continue tapped") },
            onBack: { print("Back tapped") }
        )
        .modelContainer(container)
    }
}
