//
//  CheckInCompletionView.swift
//  QualityControl
//
//  Week 4: Check-In Flow
//  Completion screen - sixth and final step of check-in
//

import SwiftUI
import SwiftData

/// Check-In Completion View
/// Displays session summary and completion animation
struct CheckInCompletionView: View {

    // MARK: - Properties

    @Bindable var viewModel: CheckInViewModel
    let onComplete: () -> Void

    @State private var showCheckmark = false
    @State private var showSummary = false
    @State private var animateStats = false

    // MARK: - Body

    var body: some View {
        ScrollView {
            VStack(spacing: QCSpacing.xl) {
                // Completion Animation
                completionAnimation

                // Session Summary
                if showSummary {
                    sessionSummary
                        .transition(.opacity.combined(with: .move(edge: .top)))
                }
            }
            .padding(QCSpacing.lg)
        }
        .background(QCColors.backgroundPrimary)
        .navigationTitle("Complete")
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden(true)
        .safeAreaInset(edge: .bottom) {
            bottomBar
        }
        .onAppear {
            playCompletionAnimation()
        }
    }

    // MARK: - View Components

    private var completionAnimation: some View {
        VStack(spacing: QCSpacing.lg) {
            // Animated Checkmark
            ZStack {
                Circle()
                    .fill(QCColors.success.opacity(0.1))
                    .frame(width: 120, height: 120)

                Circle()
                    .stroke(QCColors.success, lineWidth: 3)
                    .frame(width: 120, height: 120)
                    .scaleEffect(showCheckmark ? 1 : 0)
                    .animation(.spring(response: 0.5, dampingFraction: 0.6), value: showCheckmark)

                Image(systemName: "checkmark")
                    .font(.system(size: 60, weight: .bold))
                    .foregroundColor(QCColors.success)
                    .scaleEffect(showCheckmark ? 1 : 0)
                    .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.2), value: showCheckmark)
            }

            // Congratulations Text
            VStack(spacing: QCSpacing.sm) {
                Text("Check-in Complete!")
                    .font(QCTypography.heading3)
                    .foregroundColor(QCColors.textPrimary)
                    .opacity(showCheckmark ? 1 : 0)
                    .animation(.easeIn(duration: 0.3).delay(0.4), value: showCheckmark)

                Text("Great work on staying connected")
                    .font(QCTypography.body)
                    .foregroundColor(QCColors.textSecondary)
                    .opacity(showCheckmark ? 1 : 0)
                    .animation(.easeIn(duration: 0.3).delay(0.5), value: showCheckmark)
            }
        }
        .padding(.top, QCSpacing.xl)
    }

    private var sessionSummary: some View {
        VStack(spacing: QCSpacing.md) {
            // Summary Header
            Text("Session Summary")
                .font(QCTypography.heading5)
                .foregroundColor(QCColors.textPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.bottom, QCSpacing.xs)

            // Stats Cards
            VStack(spacing: QCSpacing.sm) {
                // Duration
                SummaryStatCard(
                    icon: "clock.fill",
                    label: "Duration",
                    value: formattedDuration,
                    animate: animateStats
                )

                // Categories Discussed
                SummaryStatCard(
                    icon: "bubble.left.and.bubble.right.fill",
                    label: "Topics Discussed",
                    value: "\(viewModel.selectedCategories.count)",
                    animate: animateStats
                )

                // Action Items Created
                SummaryStatCard(
                    icon: "checkmark.circle.fill",
                    label: "Action Items",
                    value: "\(viewModel.actionItems.count)",
                    animate: animateStats
                )

                // Mood Rating
                if let session = viewModel.session, let mood = session.mood {
                    SummaryStatCard(
                        icon: "heart.fill",
                        label: "Session Mood",
                        value: mood.rawValue,
                        animate: animateStats
                    )
                }
            }

            // Categories List (if any)
            if !viewModel.selectedCategories.isEmpty {
                categoriesList
            }
        }
    }

    private var categoriesList: some View {
        QCCard(header: "Discussed Topics") {
            VStack(spacing: QCSpacing.xs) {
                ForEach(viewModel.selectedCategories) { category in
                    HStack(spacing: QCSpacing.sm) {
                        Image(systemName: category.icon)
                            .font(.system(size: 16))
                            .foregroundColor(QCColors.primary)
                            .frame(width: 24)

                        Text(category.name)
                            .font(QCTypography.body)
                            .foregroundColor(QCColors.textPrimary)

                        Spacer()
                    }
                    .padding(.vertical, QCSpacing.xs)
                }
            }
        }
    }

    private var bottomBar: some View {
        VStack(spacing: QCSpacing.sm) {
            QCButton.primary(
                "Return to Dashboard",
                icon: "house.fill",
                action: onComplete
            )
            .opacity(showSummary ? 1 : 0)
            .animation(.easeIn(duration: 0.3).delay(0.8), value: showSummary)
        }
        .padding(QCSpacing.lg)
        .background(QCColors.backgroundPrimary)
    }

    // MARK: - Computed Properties

    private var formattedDuration: String {
        guard let session = viewModel.session else { return "N/A" }

        let duration: TimeInterval
        if let completedAt = session.completedAt {
            duration = completedAt.timeIntervalSince(session.startedAt)
        } else {
            duration = Date().timeIntervalSince(session.startedAt)
        }

        let minutes = Int(duration) / 60
        let seconds = Int(duration) % 60
        return String(format: "%d:%02d", minutes, seconds)
    }

    // MARK: - Actions

    private func playCompletionAnimation() {
        // Animate checkmark
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            showCheckmark = true
        }

        // Show summary after checkmark animation
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.7) {
            withAnimation(.spring(response: 0.6, dampingFraction: 0.8)) {
                showSummary = true
            }
        }

        // Animate stats cards
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.9) {
            animateStats = true
        }
    }
}

// MARK: - Supporting Views

private struct SummaryStatCard: View {
    let icon: String
    let label: String
    let value: String
    let animate: Bool

    var body: some View {
        HStack(spacing: QCSpacing.md) {
            // Icon
            ZStack {
                Circle()
                    .fill(QCColors.primary.opacity(0.1))
                    .frame(width: 44, height: 44)

                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(QCColors.primary)
            }

            // Label & Value
            VStack(alignment: .leading, spacing: QCSpacing.xs) {
                Text(label)
                    .font(QCTypography.bodySmall)
                    .foregroundColor(QCColors.textSecondary)

                Text(value)
                    .font(QCTypography.heading6)
                    .foregroundColor(QCColors.textPrimary)
            }

            Spacer()
        }
        .padding(QCSpacing.md)
        .background(QCColors.backgroundSecondary)
        .qcCardCornerRadius()
        .scaleEffect(animate ? 1 : 0.8)
        .opacity(animate ? 1 : 0)
        .animation(.spring(response: 0.5, dampingFraction: 0.7), value: animate)
    }
}

// MARK: - Preview

#Preview("CheckInCompletionView") {
    @Previewable @State var viewModel: CheckInViewModel = {
        let container = PreviewContainer.create()
        let context = container.mainContext

        let descriptor = FetchDescriptor<CheckInSession>()
        let session = try? context.fetch(descriptor).first

        let vm = CheckInViewModel(modelContext: context, session: session)

        // Set up some mock data
        if let categories = try? context.fetch(FetchDescriptor<Category>()) {
            vm.selectedCategories = Array(categories.prefix(3))
        }

        // Add some mock action items
        if let session = session, let users = try? context.fetch(FetchDescriptor<User>()) {
            for i in 1...2 {
                let item = ActionItem(
                    title: "Action item \(i)",
                    checkInId: session.id
                )
                item.assignedTo = users.first?.id
                context.insert(item)
                vm.actionItems.append(item)
            }
        }

        return vm
    }()

    let container = PreviewContainer.create()

    NavigationStack {
        CheckInCompletionView(
            viewModel: viewModel,
            onComplete: { print("Complete tapped") }
        )
        .modelContainer(container)
    }
}
