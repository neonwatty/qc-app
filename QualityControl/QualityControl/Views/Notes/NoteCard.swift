//
//  NoteCard.swift
//  QualityControl
//
//  Week 4: Notes System
//  Reusable card component for displaying notes
//

import SwiftUI
import SwiftData

struct NoteCard: View {

    // MARK: - Properties

    let note: Note
    let category: Category?
    let checkIn: CheckInSession?
    let onEdit: () -> Void
    let onDelete: () -> Void

    // MARK: - Body

    var body: some View {
        QCCard {
            VStack(alignment: .leading, spacing: QCSpacing.sm) {
                // Header: Privacy Badge
                HStack(alignment: .top, spacing: QCSpacing.sm) {
                    privacyBadge

                    Spacer()
                }

                // Content Preview
                Text(note.content)
                    .font(QCTypography.body)
                    .foregroundColor(QCColors.textPrimary)
                    .lineLimit(4)
                    .padding(.bottom, QCSpacing.xs)

                // Footer: Metadata and Actions
                HStack(spacing: QCSpacing.md) {
                    // Category Badge (if applicable)
                    if let category = category {
                        HStack(spacing: QCSpacing.xs) {
                            Image(systemName: category.icon)
                                .font(.system(size: 12))
                            Text(category.name)
                                .font(QCTypography.captionSmall)
                        }
                        .foregroundColor(QCColors.textTertiary)
                    }

                    // Check-in Badge (if applicable)
                    if checkIn != nil {
                        HStack(spacing: QCSpacing.xs) {
                            Image(systemName: "heart.fill")
                                .font(.system(size: 12))
                            Text("Check-in")
                                .font(QCTypography.captionSmall)
                        }
                        .foregroundColor(QCColors.primary)
                    }

                    Spacer()

                    // Timestamp
                    Text(formattedDate)
                        .font(QCTypography.captionSmall)
                        .foregroundColor(QCColors.textTertiary)
                }
            }
            .padding(QCSpacing.sm)
        }
        .contextMenu {
            Button(action: onEdit) {
                Label("Edit", systemImage: "pencil")
            }

            Button(role: .destructive, action: onDelete) {
                Label("Delete", systemImage: "trash")
            }
        }
    }

    // MARK: - View Components

    private var privacyBadge: some View {
        HStack(spacing: QCSpacing.xs) {
            Image(systemName: privacyIcon)
                .font(.system(size: 10))

            Text(note.privacy.displayName)
                .font(QCTypography.captionSmall)
        }
        .foregroundColor(privacyColor)
        .padding(.horizontal, QCSpacing.xs)
        .padding(.vertical, 2)
        .background(privacyColor.opacity(0.1))
        .cornerRadius(4)
    }

    // MARK: - Computed Properties

    private var privacyIcon: String {
        switch note.privacy {
        case .private: return "lock.fill"
        case .shared: return "person.2.fill"
        case .draft: return "doc.text.fill"
        }
    }

    private var privacyColor: Color {
        switch note.privacy {
        case .private: return QCColors.info
        case .shared: return QCColors.success
        case .draft: return QCColors.warning
        }
    }

    private var formattedDate: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: note.updatedAt, relativeTo: Date())
    }
}

// MARK: - NotePrivacy Extension

extension NotePrivacy {
    var displayName: String {
        switch self {
        case .private: return "Private"
        case .shared: return "Shared"
        case .draft: return "Draft"
        }
    }
}

// MARK: - Preview

#Preview("NoteCard") {
    let container = PreviewContainer.create()
    let context = container.mainContext

    let categoryDescriptor = FetchDescriptor<Category>()
    let category = try? context.fetch(categoryDescriptor).first

    let note = Note(
        content: "We talked about our communication patterns and identified some areas for improvement. It was a really productive conversation.",
        privacy: .shared,
        authorId: UUID()
    )
    if let categoryId = category?.id {
        note.categoryId = categoryId
    }

    return VStack(spacing: QCSpacing.md) {
        NoteCard(
            note: note,
            category: category,
            checkIn: nil,
            onEdit: { print("Edit tapped") },
            onDelete: { print("Delete tapped") }
        )

        // Draft note
        NoteCard(
            note: Note(
                content: "This is a draft that I'm still working on...",
                privacy: .draft,
                authorId: UUID()
            ),
            category: nil,
            checkIn: nil,
            onEdit: { print("Edit tapped") },
            onDelete: { print("Delete tapped") }
        )

        // Private note
        NoteCard(
            note: Note(
                content: "Some personal reflections that I want to keep to myself for now.",
                privacy: .private,
                authorId: UUID()
            ),
            category: nil,
            checkIn: nil,
            onEdit: { print("Edit tapped") },
            onDelete: { print("Delete tapped") }
        )
    }
    .padding()
    .background(QCColors.backgroundPrimary)
    .modelContainer(container)
}
