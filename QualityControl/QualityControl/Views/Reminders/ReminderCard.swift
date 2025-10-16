//
//  ReminderCard.swift
//  QualityControl
//
//  Week 5: Reminders System
//  Individual reminder card with actions
//

import SwiftUI

struct ReminderCard: View {

    // MARK: - Properties

    let reminder: Reminder
    let onTap: () -> Void
    let onComplete: () -> Void
    let onSnooze: () -> Void

    // MARK: - Body

    var body: some View {
        QCCard {
            HStack(spacing: QCSpacing.md) {
                // Complete Button
                Button(action: onComplete) {
                    Image(systemName: reminder.isActive ? "circle" : "checkmark.circle.fill")
                        .font(.system(size: 24))
                        .foregroundColor(reminder.isActive ? QCColors.textTertiary : QCColors.success)
                }
                .buttonStyle(.plain)

                // Content
                VStack(alignment: .leading, spacing: QCSpacing.xs) {
                    Text(reminder.title)
                        .font(QCTypography.body)
                        .foregroundColor(QCColors.textPrimary)
                        .strikethrough(!reminder.isActive)

                    if !reminder.message.isEmpty {
                        Text(reminder.message)
                            .font(QCTypography.bodySmall)
                            .foregroundColor(QCColors.textSecondary)
                            .lineLimit(2)
                    }

                    HStack(spacing: QCSpacing.sm) {
                        // Time
                        Label(
                            formatTime(reminder.scheduledFor),
                            systemImage: "clock"
                        )
                        .font(QCTypography.captionSmall)
                        .foregroundColor(isOverdue ? QCColors.error : QCColors.textTertiary)

                        // Category
                        Text(reminder.category.rawValue)
                            .font(QCTypography.captionSmall)
                            .foregroundColor(QCColors.primary)
                            .padding(.horizontal, QCSpacing.xs)
                            .padding(.vertical, 2)
                            .background(QCColors.primary.opacity(0.1))
                            .cornerRadius(4)
                    }
                }

                Spacer()

                // Actions Menu
                if reminder.isActive {
                    Menu {
                        Button {
                            onSnooze()
                        } label: {
                            Label("Snooze 30min", systemImage: "clock.badge.fill")
                        }

                        Button {
                            onTap()
                        } label: {
                            Label("Edit", systemImage: "pencil")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                            .font(.system(size: 20))
                            .foregroundColor(QCColors.textTertiary)
                    }
                }
            }
            .padding(QCSpacing.sm)
            .contentShape(Rectangle())
            .onTapGesture {
                onTap()
            }
        }
    }

    // MARK: - Computed Properties

    private var isOverdue: Bool {
        reminder.isActive && reminder.scheduledFor <= Date()
    }

    // MARK: - Helpers

    private func formatTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

// MARK: - Preview

#Preview("ReminderCard") {
    let container = PreviewContainer.create()
    let context = container.mainContext

    let reminder = Reminder(
        title: "Daily Check-in",
        message: "Time for your daily relationship check-in",
        category: .checkIn,
        frequency: .daily,
        scheduledFor: Date().addingTimeInterval(3600),
        userId: UUID()
    )

    VStack(spacing: QCSpacing.md) {
        ReminderCard(
            reminder: reminder,
            onTap: { print("Tapped") },
            onComplete: { print("Complete") },
            onSnooze: { print("Snooze") }
        )

        // Overdue reminder
        let overdueReminder = Reminder(
            title: "Overdue Task",
            message: "",
            category: .habit,
            frequency: .once,
            scheduledFor: Date().addingTimeInterval(-3600),
            userId: UUID()
        )

        ReminderCard(
            reminder: overdueReminder,
            onTap: { print("Tapped") },
            onComplete: { print("Complete") },
            onSnooze: { print("Snooze") }
        )
    }
    .padding()
    .background(QCColors.backgroundPrimary)
    .modelContainer(container)
}
