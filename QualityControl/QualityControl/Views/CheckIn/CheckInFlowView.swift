//
//  CheckInFlowView.swift
//  QualityControl
//
//  Week 3: Check-In Flow
//  Container view that orchestrates the 6-step check-in flow
//

import SwiftUI
import SwiftData

/// Check-In Flow View
/// Manages navigation through the 6-step check-in process using CheckInCoordinator
struct CheckInFlowView: View {

    // MARK: - Properties

    @State private var coordinator: CheckInCoordinator
    @Environment(\.dismiss) private var dismiss

    // MARK: - Initialization

    init(modelContext: ModelContext, couple: Couple, onComplete: @escaping () -> Void) {
        let coordinator = CheckInCoordinator(
            modelContext: modelContext,
            couple: couple,
            onComplete: {
                onComplete()
            },
            onCancel: nil
        )
        self._coordinator = State(initialValue: coordinator)
    }

    // MARK: - Body

    var body: some View {
        NavigationStack {
            ZStack {
                // Main content
                currentStepView
                    .id(coordinator.currentStep) // Force view refresh on step change

                // Progress indicator overlay
                VStack {
                    ProgressBar(progress: coordinator.progress)
                        .padding(.horizontal, QCSpacing.lg)
                        .padding(.top, QCSpacing.sm)

                    Spacer()
                }
            }
            .navigationTitle("Check-In")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        if coordinator.currentStep == .welcome {
                            coordinator.cancel()
                            dismiss()
                        } else {
                            coordinator.showCancelConfirmation = true
                        }
                    }
                }
            }
            .alert("Cancel Check-In?", isPresented: $coordinator.showCancelConfirmation) {
                Button("Continue Check-In", role: .cancel) {
                    coordinator.dismissCancel()
                }
                Button("Cancel", role: .destructive) {
                    coordinator.confirmCancel()
                    dismiss()
                }
            } message: {
                Text("Your progress will be lost. Are you sure you want to cancel this check-in?")
            }
        }
    }

    // MARK: - View Selection

    @ViewBuilder
    private var currentStepView: some View {
        switch coordinator.currentStep {
        case .welcome:
            CheckInWelcomeView(
                session: coordinator.viewModel.session,
                onContinue: { coordinator.advance() },
                onCancel: {
                    coordinator.cancel()
                    dismiss()
                }
            )

        case .categorySelection:
            CheckInCategorySelectionView(
                viewModel: coordinator.viewModel,
                onContinue: { coordinator.advance() },
                onBack: { coordinator.goBack() }
            )

        case .categoryDiscussion:
            CheckInDiscussionView(
                viewModel: coordinator.viewModel,
                onContinue: { coordinator.advance() },
                onBack: { coordinator.goBack() }
            )

        case .reflection:
            CheckInReflectionView(
                viewModel: coordinator.viewModel,
                onContinue: { coordinator.advance() },
                onBack: { coordinator.goBack() }
            )

        case .actionItems:
            CheckInActionItemsView(
                viewModel: coordinator.viewModel,
                onContinue: { coordinator.advance() },
                onBack: { coordinator.goBack() }
            )

        case .completion:
            CheckInCompletionView(
                viewModel: coordinator.viewModel,
                onComplete: {
                    coordinator.completeSession()
                    dismiss()
                }
            )
        }
    }
}

// MARK: - Supporting Views

private struct ProgressBar: View {
    let progress: Double

    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                // Background track
                Rectangle()
                    .fill(QCColors.backgroundTertiary)
                    .frame(height: 4)

                // Progress fill
                Rectangle()
                    .fill(QCColors.primary)
                    .frame(width: geometry.size.width * progress, height: 4)
                    .animation(QCAnimations.smoothSpring, value: progress)
            }
            .qcProgressBarCornerRadius()
        }
        .frame(height: 4)
    }
}

// MARK: - Preview

#Preview("CheckInFlowView") {
    let container = PreviewContainer.create()
    let context = container.mainContext

    // Fetch a demo couple
    let descriptor = FetchDescriptor<Couple>()
    guard let couple = try? context.fetch(descriptor).first else {
        return Text("No couple found for preview")
    }

    return CheckInFlowView(
        modelContext: context,
        couple: couple,
        onComplete: { print("Check-in completed!") }
    )
    .modelContainer(container)
}
