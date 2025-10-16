//
//  RequestCard.swift
//  QualityControl
//
//  Week 7: Requests System
//  Card component for displaying a relationship request
//

import SwiftUI

struct RequestCard: View {

    // MARK: - Properties

    let request: RelationshipRequest
    let isReceived: Bool
    let onTap: () -> Void

    // MARK: - Body

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: QCSpacing.md) {
                // Header with initial and status
                HStack {
                    // Avatar initial
                    Circle()
                        .fill(QCColors.primary.opacity(0.2))
                        .frame(width: 40, height: 40)
                        .overlay(
                            Text(String(request.title.prefix(1)))
                                .font(QCTypography.heading5)
                                .foregroundStyle(QCColors.primary)
                        )

                    VStack(alignment: .leading, spacing: QCSpacing.xs) {
                        Text(request.title)
                            .font(QCTypography.heading5)
                            .foregroundStyle(QCColors.textPrimary)

                        Text(isReceived ? "From partner" : "To partner")
                            .font(QCTypography.caption)
                            .foregroundStyle(QCColors.textSecondary)
                    }

                    Spacer()

                    // Status badge
                    StatusBadge(status: request.status)
                }

                // Description
                Text(request.requestDescription)
                    .font(QCTypography.body)
                    .foregroundStyle(QCColors.textSecondary)
                    .lineLimit(2)

                // Tags
                HStack(spacing: QCSpacing.sm) {
                    // Type tag
                    RequestTagPill(
                        text: request.requestType.displayName,
                        icon: request.requestType.icon,
                        color: QCColors.primary
                    )

                    // Priority tag
                    if request.priority != .medium {
                        RequestTagPill(
                            text: request.priority.displayName,
                            color: priorityColor(request.priority)
                        )
                    }

                    // Due date
                    if let dueDate = request.dueDate {
                        RequestTagPill(
                            text: dueDate.formatted(date: .abbreviated, time: .omitted),
                            icon: "calendar",
                            color: QCColors.textSecondary
                        )
                    }

                    Spacer()
                }

                // Response if any
                if let response = request.response, !response.isEmpty {
                    HStack(spacing: QCSpacing.xs) {
                        Image(systemName: "bubble.left.fill")
                            .font(.caption)
                            .foregroundStyle(QCColors.info)

                        Text(response)
                            .font(QCTypography.bodySmall)
                            .foregroundStyle(QCColors.textSecondary)
                            .lineLimit(1)
                    }
                    .padding(QCSpacing.sm)
                    .background(QCColors.info.opacity(0.1))
                    .cornerRadius(QCSpacing.sm)
                }
            }
            .padding(QCSpacing.lg)
            .background(QCColors.surfaceCard)
            .cornerRadius(QCSpacing.md)
            .shadow(color: .black.opacity(0.05), radius: 4, y: 2)
        }
        .buttonStyle(.plain)
    }

    private func priorityColor(_ priority: Priority) -> Color {
        switch priority {
        case .low: return QCColors.info
        case .medium: return QCColors.warning
        case .high: return QCColors.error
        }
    }
}

// MARK: - Supporting Views

struct StatusBadge: View {
    let status: RequestStatus

    var body: some View {
        HStack(spacing: QCSpacing.xs) {
            Image(systemName: icon)
                .font(.caption2)

            Text(status.rawValue.capitalized)
                .font(QCTypography.captionSmall)
                .fontWeight(.semibold)
        }
        .padding(.horizontal, QCSpacing.sm)
        .padding(.vertical, QCSpacing.xs)
        .background(backgroundColor)
        .foregroundStyle(textColor)
        .cornerRadius(QCSpacing.lg)
    }

    private var icon: String {
        switch status {
        case .pending: return "clock.fill"
        case .accepted: return "checkmark.circle.fill"
        case .declined: return "xmark.circle.fill"
        }
    }

    private var backgroundColor: Color {
        switch status {
        case .pending: return QCColors.warning.opacity(0.1)
        case .accepted: return QCColors.success.opacity(0.1)
        case .declined: return QCColors.error.opacity(0.1)
        }
    }

    private var textColor: Color {
        switch status {
        case .pending: return QCColors.warning
        case .accepted: return QCColors.success
        case .declined: return QCColors.error
        }
    }
}

struct RequestTagPill: View {
    let text: String
    var icon: String? = nil
    let color: Color

    var body: some View {
        HStack(spacing: QCSpacing.xs) {
            if let icon = icon {
                Image(systemName: icon)
                    .font(.caption2)
            }

            Text(text)
                .font(QCTypography.captionSmall)
        }
        .padding(.horizontal, QCSpacing.sm)
        .padding(.vertical, QCSpacing.xs)
        .background(color.opacity(0.1))
        .foregroundStyle(color)
        .cornerRadius(QCSpacing.lg)
    }
}

// MARK: - Request Type Extension

extension RequestType {
    var displayName: String {
        switch self {
        case .conversation: return "Conversation"
        case .activity: return "Activity"
        case .dateNight: return "Date Night"
        case .reminder: return "Reminder"
        }
    }

    var icon: String {
        switch self {
        case .conversation: return "bubble.left.and.bubble.right.fill"
        case .activity: return "figure.walk"
        case .dateNight: return "heart.fill"
        case .reminder: return "bell.fill"
        }
    }
}

// MARK: - Priority Extension

extension Priority {
    var displayName: String {
        switch self {
        case .low: return "Low"
        case .medium: return "Medium"
        case .high: return "High"
        }
    }
}

// MARK: - Preview

#Preview("Pending Request") {
    {
        let request = RelationshipRequest(
            title: "Plan Anniversary Dinner",
            description: "Can you handle planning our anniversary dinner next month? You always find the most romantic places and...",
            requestType: .dateNight,
            requestedBy: UUID(),
            requestedFor: UUID()
        )
        request.priority = .high
        request.dueDate = Date().addingTimeInterval(86400 * 14)
        request.tags = ["high", "Nov 14"]

        return RequestCard(request: request, isReceived: true, onTap: {})
            .padding()
    }()
}

#Preview("Accepted Request") {
    {
        let request = RelationshipRequest(
            title: "Financial Planning Session",
            description: "From Jeremy Johnson\n\nCan we sit down and review our budget and savings goals?",
            requestType: .conversation,
            requestedBy: UUID(),
            requestedFor: UUID()
        )
        request.status = .accepted
        request.response = "Yes, this is important. Let's do it after dinner when we can focus."
        request.tags = ["Conversation", "High"]

        return RequestCard(request: request, isReceived: true, onTap: {})
            .padding()
    }()
}
