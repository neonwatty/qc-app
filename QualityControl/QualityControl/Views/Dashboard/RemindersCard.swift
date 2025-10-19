//
//  RemindersCard.swift
//  QualityControl
//
//  Week 5-6: Reminders Integration
//  Dashboard card showing upcoming reminders
//

import SwiftUI
import SwiftData

struct RemindersCard: View {

    // MARK: - Properties

    @Environment(\.modelContext) private var modelContext
    let userId: UUID
    let onViewAll: () -> Void

    @State private var upcomingReminders: [Reminder] = []
    @State private var isLoading = true

    // MARK: - Body

    var body: some View {
        QCCard(header: "Upcoming Reminders") {
            VStack(spacing: QCSpacing.sm) {
                if isLoading {
                    ProgressView()
                        .padding()
                } else if upcomingReminders.isEmpty {
                    emptyState
                } else {
                    remindersList
                }

                Divider()

                // View All Button
                Button(action: onViewAll) {
                    HStack {
                        Text("View All Reminders")
                            .font(QCTypography.button)
                            .foregroundColor(QCColors.primary)

                        Spacer()

                        Image(systemName: "chevron.right")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(QCColors.primary)
                    }
                }
                .padding(.top, QCSpacing.xs)
            }
        }
        .task {
            await loadUpcomingReminders()
        }
    }

    // MARK: - View Components

    private var emptyState: some View {
        VStack(spacing: QCSpacing.sm) {
            Image(systemName: "bell.slash")
                .font(.system(size: 32))
                .foregroundColor(QCColors.textTertiary)

            Text("No upcoming reminders")
                .font(QCTypography.bodySmall)
                .foregroundColor(QCColors.textSecondary)
        }
        .padding(.vertical, QCSpacing.md)
    }

    private var remindersList: some View {
        VStack(spacing: 0) {
            ForEach(upcomingReminders.prefix(3)) { reminder in
                ReminderRow(reminder: reminder)

                if reminder.id != upcomingReminders.prefix(3).last?.id {
                    Divider()
                        .padding(.leading, 44)
                }
            }
        }
    }

    // MARK: - Data Loading

    private func loadUpcomingReminders() async {
        isLoading = true

        do {
            let descriptor = FetchDescriptor<Reminder>(
                sortBy: [SortDescriptor(\.scheduledFor, order: .forward)]
            )

            let allReminders = try modelContext.fetch(descriptor)

            // Filter active reminders for this user, scheduled in the future
            let now = Date()
            upcomingReminders = allReminders.filter {
                $0.userId == userId &&
                $0.isActive &&
                $0.scheduledFor > now
            }
        } catch {
            print("Error loading reminders: \(error)")
            upcomingReminders = []
        }

        isLoading = false
    }
}

// MARK: - Supporting Views

private struct ReminderRow: View {
    let reminder: Reminder

    var body: some View {
        HStack(spacing: QCSpacing.md) {
            // Category Icon
            Image(systemName: categoryIcon)
                .font(.system(size: 20))
                .foregroundColor(categoryColor)
                .frame(width: 28, height: 28)

            // Reminder Info
            VStack(alignment: .leading, spacing: 2) {
                Text(reminder.title)
                    .font(QCTypography.body)
                    .foregroundColor(QCColors.textPrimary)
                    .lineLimit(1)

                Text(timeText)
                    .font(QCTypography.captionSmall)
                    .foregroundColor(QCColors.textSecondary)
            }

            Spacer()

            // Frequency Badge
            if reminder.frequency != .once {
                Text(frequencyText)
                    .font(QCTypography.captionSmall)
                    .foregroundColor(QCColors.textSecondary)
                    .padding(.horizontal, QCSpacing.xs)
                    .padding(.vertical, 2)
                    .background(QCColors.backgroundTertiary)
                    .cornerRadius(4)
            }
        }
        .padding(.vertical, QCSpacing.sm)
    }

    private var categoryIcon: String {
        switch reminder.category {
        case .checkIn:
            return "heart.fill"
        case .habit:
            return "star.fill"
        case .actionItem:
            return "checklist"
        case .partnerMoment:
            return "person.2.fill"
        case .specialOccasion:
            return "gift.fill"
        }
    }

    private var categoryColor: Color {
        switch reminder.category {
        case .checkIn:
            return QCColors.primary
        case .habit:
            return QCColors.warning
        case .actionItem:
            return QCColors.info
        case .partnerMoment:
            return QCColors.success
        case .specialOccasion:
            return QCColors.error
        }
    }

    private var timeText: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .short
        return formatter.localizedString(for: reminder.scheduledFor, relativeTo: Date())
    }

    private var frequencyText: String {
        switch reminder.frequency {
        case .once:
            return "Once"
        case .daily:
            return "Daily"
        case .weekly:
            return "Weekly"
        case .monthly:
            return "Monthly"
        case .custom:
            return "Custom"
        }
    }
}

// MARK: - Preview

#Preview("RemindersCard - With Reminders") {
    let container = PreviewContainer.create()
    let context = container.mainContext

    // Get demo user
    let descriptor = FetchDescriptor<User>()
    let user = try? context.fetch(descriptor).first

    RemindersCard(userId: user?.id ?? UUID(), onViewAll: {})
        .modelContainer(container)
        .padding()
}

#Preview("RemindersCard - Empty") {
    let container = PreviewContainer.create()

    RemindersCard(userId: UUID(), onViewAll: {})
        .modelContainer(container)
        .padding()
}
