//
//  CheckInCategorySelectionView.swift
//  QualityControl
//
//  Week 3: Check-In Flow
//  Category selection screen - second step of check-in
//

import SwiftUI
import SwiftData

/// Check-In Category Selection View
/// Allows users to select discussion topics for their check-in
struct CheckInCategorySelectionView: View {

    // MARK: - Properties

    @Bindable var viewModel: CheckInViewModel
    let onContinue: () -> Void
    let onBack: () -> Void

    // MARK: - Body

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: QCSpacing.lg) {
                // Header
                VStack(alignment: .leading, spacing: QCSpacing.xs) {
                    Text("Choose Topics")
                        .font(QCTypography.heading3)
                        .foregroundColor(QCColors.textPrimary)

                    Text("Select the areas you'd like to discuss together. You can choose as many as you'd like.")
                        .font(QCTypography.body)
                        .foregroundColor(QCColors.textSecondary)
                }

                // Category Grid
                if viewModel.availableCategories.isEmpty {
                    QCEmptyState(
                        icon: "tray",
                        title: "No Categories Available",
                        subtitle: "Categories will appear here once they are added to the system."
                    )
                } else {
                    LazyVGrid(
                        columns: [
                            GridItem(.flexible()),
                            GridItem(.flexible())
                        ],
                        spacing: QCSpacing.md
                    ) {
                        ForEach(viewModel.availableCategories) { category in
                            CategoryCard(
                                category: category,
                                isSelected: viewModel.isCategorySelected(category),
                                onTap: {
                                    withAnimation(QCAnimations.buttonPress) {
                                        viewModel.toggleCategory(category)
                                    }
                                }
                            )
                        }
                    }
                }

                // Selection Summary
                if !viewModel.selectedCategories.isEmpty {
                    VStack(alignment: .leading, spacing: QCSpacing.xs) {
                        Text("Selected: \(viewModel.selectedCategories.count)")
                            .font(QCTypography.bodySmall)
                            .foregroundColor(QCColors.textSecondary)

                        Text(viewModel.selectedCategories.map { $0.name }.joined(separator: ", "))
                            .font(QCTypography.captionSmall)
                            .foregroundColor(QCColors.textTertiary)
                            .lineLimit(2)
                    }
                    .padding(QCSpacing.sm)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(QCColors.primary.opacity(0.1))
                    .qcCardCornerRadius()
                }
            }
            .padding(QCSpacing.lg)
        }
        .background(QCColors.backgroundPrimary)
        .navigationTitle("Check-In")
        .navigationBarTitleDisplayMode(.inline)
        .safeAreaInset(edge: .bottom) {
            VStack(spacing: QCSpacing.sm) {
                QCButton.primary(
                    "Continue",
                    icon: "arrow.right",
                    action: onContinue
                )
                .disabled(!viewModel.canProceed)

                QCButton.tertiary("Back", size: .small, action: onBack)
            }
            .padding(QCSpacing.lg)
            .background(QCColors.backgroundPrimary)
        }
    }
}

// MARK: - Supporting Views

private struct CategoryCard: View {
    let category: Category
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(spacing: QCSpacing.sm) {
                // Icon
                Image(systemName: category.icon)
                    .font(.system(size: 32, weight: .medium))
                    .foregroundColor(isSelected ? .white : QCColors.primary)
                    .frame(height: 40)

                // Name
                Text(category.name)
                    .font(QCTypography.bodySmall)
                    .foregroundColor(isSelected ? .white : QCColors.textPrimary)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)

                // Description
                Text(category.categoryDescription)
                    .font(QCTypography.captionSmall)
                    .foregroundColor(isSelected ? .white.opacity(0.9) : QCColors.textSecondary)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
            }
            .padding(QCSpacing.md)
            .frame(maxWidth: .infinity, minHeight: 140)
            .background(
                isSelected
                    ? QCColors.primary
                    : QCColors.backgroundSecondary
            )
            .qcCardCornerRadius()
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(
                        isSelected ? QCColors.primary : Color.clear,
                        lineWidth: 2
                    )
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Preview

#Preview("CheckInCategorySelectionView") {
    let container = PreviewContainer.create()
    let context = container.mainContext

    // Fetch a demo session and create viewModel
    let descriptor = FetchDescriptor<CheckInSession>()
    let session = try? context.fetch(descriptor).first

    let viewModel = CheckInViewModel(
        modelContext: context,
        session: session
    )

    return NavigationStack {
        CheckInCategorySelectionView(
            viewModel: viewModel,
            onContinue: { print("Continue tapped") },
            onBack: { print("Back tapped") }
        )
        .modelContainer(container)
    }
}
