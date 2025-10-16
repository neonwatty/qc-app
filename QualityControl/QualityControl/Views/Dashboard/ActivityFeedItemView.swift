//
//  ActivityFeedItemView.swift
//  QualityControl
//
//  Week 3: Dashboard Components
//  Recent activity feed item display
//

import SwiftUI

/// Activity feed item view
/// Displays a single activity with icon, title, and timestamp
struct ActivityFeedItemView: View {

    // MARK: - Properties

    let item: ActivityFeedItem

    // MARK: - Body

    var body: some View {
        HStack(spacing: QCSpacing.sm) {
            // Icon
            Image(systemName: item.icon)
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(iconColor)
                .frame(width: 32, height: 32)
                .background(iconColor.opacity(0.1))
                .clipShape(Circle())

            // Content
            VStack(alignment: .leading, spacing: 2) {
                Text(item.title)
                    .font(QCTypography.body)
                    .foregroundColor(QCColors.textPrimary)

                Text(item.subtitle)
                    .font(QCTypography.captionSmall)
                    .foregroundColor(QCColors.textTertiary)
            }

            Spacer()
        }
        .padding(.vertical, QCSpacing.xs)
    }

    // MARK: - Helpers

    private var iconColor: Color {
        switch item.type {
        case .checkIn:
            return QCColors.primary
        case .note:
            return QCColors.info
        case .milestone:
            return QCColors.warning
        case .reminder:
            return QCColors.secondary
        case .request:
            return QCColors.tertiary
        }
    }
}

// MARK: - Preview

#Preview("ActivityFeedItemView") {
    VStack(spacing: 0) {
        ActivityFeedItemView(
            item: ActivityFeedItem(
                id: UUID(),
                icon: "heart.fill",
                title: "Check-in completed",
                subtitle: "3 days ago",
                timestamp: Date().addingTimeInterval(-259200),
                type: .checkIn
            )
        )

        Divider()
            .padding(.leading, 44)

        ActivityFeedItemView(
            item: ActivityFeedItem(
                id: UUID(),
                icon: "note.text",
                title: "Shared note added",
                subtitle: "5 days ago",
                timestamp: Date().addingTimeInterval(-432000),
                type: .note
            )
        )

        Divider()
            .padding(.leading, 44)

        ActivityFeedItemView(
            item: ActivityFeedItem(
                id: UUID(),
                icon: "star.fill",
                title: "Milestone: 6 months of regular check-ins!",
                subtitle: "1 week ago",
                timestamp: Date().addingTimeInterval(-604800),
                type: .milestone
            )
        )

        Divider()
            .padding(.leading, 44)

        ActivityFeedItemView(
            item: ActivityFeedItem(
                id: UUID(),
                icon: "bell.fill",
                title: "3 reminders scheduled for today",
                subtitle: "Just now",
                timestamp: Date(),
                type: .reminder
            )
        )

        Divider()
            .padding(.leading, 44)

        ActivityFeedItemView(
            item: ActivityFeedItem(
                id: UUID(),
                icon: "envelope.fill",
                title: "0 pending partner requests",
                subtitle: "2 hours ago",
                timestamp: Date().addingTimeInterval(-7200),
                type: .request
            )
        )
    }
    .padding()
    .background(QCColors.backgroundPrimary)
}
