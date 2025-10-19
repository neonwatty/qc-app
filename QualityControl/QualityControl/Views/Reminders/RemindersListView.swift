//
//  RemindersListView.swift
//  QualityControl
//
//  Week 5: Reminders System
//  Main reminders list with filters and actions
//

import SwiftUI
import SwiftData

struct RemindersListView: View {

    // MARK: - Properties

    @Environment(\.modelContext) private var modelContext
    @Query private var users: [User]
    @State private var viewModel: RemindersViewModel?
    @State private var showingEditor = false
    @State private var reminderToEdit: Reminder?

    // MARK: - Body

    var body: some View {
        NavigationStack {
            Group {
                if let viewModel = viewModel {
                    if viewModel.isLoading && viewModel.reminders.isEmpty {
                        loadingView
                    } else if viewModel.filteredReminders.isEmpty {
                        emptyState
                    } else {
                        contentView
                    }
                } else {
                    loadingView
                }
            }
            .navigationTitle("Reminders")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    addButton
                }
            }
            .sheet(isPresented: $showingEditor) {
                if let viewModel = viewModel {
                    ReminderEditorView(viewModel: viewModel, reminderToEdit: reminderToEdit)
                }
            }
            .task {
                if viewModel == nil, let user = users.first {
                    let vm = RemindersViewModel(modelContext: modelContext, userId: user.id)
                    viewModel = vm
                    await vm.loadReminders()
                }
            }
            .refreshable {
                await viewModel?.refresh()
            }
        }
    }

    // MARK: - View Components

    private var contentView: some View {
        VStack(spacing: 0) {
            // Filter Picker
            filterPicker

            // Reminders List
            ScrollView {
                LazyVStack(spacing: QCSpacing.md) {
                    if let viewModel = viewModel {
                        ForEach(viewModel.groupedReminders()) { group in
                            groupSection(group)
                        }
                    }
                }
                .padding(QCSpacing.lg)
            }
        }
    }

    private var filterPicker: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: QCSpacing.sm) {
                ForEach(ReminderFilter.allCases, id: \.self) { filter in
                    FilterChip(
                        title: filter.rawValue,
                        icon: filter.icon,
                        count: filterCount(for: filter),
                        isSelected: viewModel?.selectedFilter == filter
                    ) {
                        viewModel?.setFilter(filter)
                    }
                }
            }
            .padding(.horizontal, QCSpacing.lg)
            .padding(.vertical, QCSpacing.md)
        }
        .background(QCColors.backgroundPrimary)
    }

    private func groupSection(_ group: ReminderGroup) -> some View {
        VStack(alignment: .leading, spacing: QCSpacing.sm) {
            // Group Header
            Text(group.title)
                .font(QCTypography.heading6)
                .foregroundColor(QCColors.textPrimary)
                .padding(.horizontal, QCSpacing.sm)

            // Reminders in group
            ForEach(group.reminders) { reminder in
                ReminderCard(
                    reminder: reminder,
                    onTap: {
                        reminderToEdit = reminder
                        showingEditor = true
                    },
                    onComplete: {
                        completeReminder(reminder)
                    },
                    onSnooze: {
                        snoozeReminder(reminder)
                    }
                )
            }
        }
    }

    private var loadingView: some View {
        VStack(spacing: QCSpacing.md) {
            ProgressView()
            Text("Loading reminders...")
                .font(QCTypography.body)
                .foregroundColor(QCColors.textSecondary)
        }
    }

    private var emptyState: some View {
        VStack(spacing: QCSpacing.lg) {
            Image(systemName: "bell.fill")
                .font(.system(size: 60))
                .foregroundColor(QCColors.textTertiary)

            VStack(spacing: QCSpacing.sm) {
                Text(emptyStateTitle)
                    .font(QCTypography.heading5)
                    .foregroundColor(QCColors.textPrimary)

                Text(emptyStateMessage)
                    .font(QCTypography.body)
                    .foregroundColor(QCColors.textSecondary)
                    .multilineTextAlignment(.center)
            }

            if viewModel?.selectedFilter == .all {
                QCButton.primary(
                    "Create Reminder",
                    icon: "plus.circle.fill",
                    size: .medium
                ) {
                    reminderToEdit = nil
                    showingEditor = true
                }
            }
        }
        .padding(QCSpacing.xl)
    }

    private var addButton: some View {
        Button {
            reminderToEdit = nil
            showingEditor = true
        } label: {
            Image(systemName: "plus.circle.fill")
                .font(.system(size: 20))
        }
    }

    // MARK: - Computed Properties

    private var emptyStateTitle: String {
        switch viewModel?.selectedFilter {
        case .all: return "No reminders"
        case .upcoming: return "No upcoming reminders"
        case .overdue: return "No overdue reminders"
        case .completed: return "No completed reminders"
        case .none: return "No reminders"
        }
    }

    private var emptyStateMessage: String {
        switch viewModel?.selectedFilter {
        case .all: return "Create your first reminder to stay on track"
        case .upcoming: return "All caught up!"
        case .overdue: return "Great job staying on top of everything"
        case .completed: return "Complete reminders will appear here"
        case .none: return "Create your first reminder"
        }
    }

    private func filterCount(for filter: ReminderFilter) -> Int? {
        guard let viewModel = viewModel else { return nil }

        switch filter {
        case .all: return viewModel.activeCount
        case .upcoming: return viewModel.upcomingCount
        case .overdue: return viewModel.overdueCount
        case .completed: return viewModel.completedCount
        }
    }

    // MARK: - Actions

    private func completeReminder(_ reminder: Reminder) {
        do {
            try viewModel?.completeReminder(reminder)
        } catch {
            print("Error completing reminder: \(error)")
        }
    }

    private func snoozeReminder(_ reminder: Reminder) {
        Task {
            do {
                try await viewModel?.snoozeReminder(reminder, minutes: 30)
            } catch {
                print("Error snoozing reminder: \(error)")
            }
        }
    }
}

// MARK: - Supporting Views

private struct FilterChip: View {
    let title: String
    let icon: String
    let count: Int?
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: QCSpacing.xs) {
                Image(systemName: icon)
                    .font(.system(size: 14))

                Text(title)
                    .font(QCTypography.bodySmall)

                if let count = count, count > 0 {
                    Text("\(count)")
                        .font(QCTypography.captionSmall)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(isSelected ? QCColors.textOnPrimary.opacity(0.3) : QCColors.primary.opacity(0.2))
                        .cornerRadius(8)
                }
            }
            .foregroundColor(isSelected ? QCColors.textOnPrimary : QCColors.textPrimary)
            .padding(.horizontal, QCSpacing.md)
            .padding(.vertical, QCSpacing.sm)
            .background(isSelected ? QCColors.primary : QCColors.backgroundSecondary)
            .cornerRadius(20)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Preview

#Preview("RemindersListView") {
    RemindersListView()
        .modelContainer(PreviewContainer.create())
}
