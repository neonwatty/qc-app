//
//  LanguageCard.swift
//  QualityControl
//
//  Week 6: Love Languages System
//  Card component displaying a love language
//

import SwiftUI

struct LanguageCard: View {

    // MARK: - Properties

    let language: LoveLanguage
    let onEdit: () -> Void
    let onDelete: () -> Void

    // MARK: - Body

    var body: some View {
        VStack(alignment: .leading, spacing: QCSpacing.md) {
            // Header with icon and privacy
            HStack {
                Text(language.category.icon)
                    .font(.system(size: 32))

                Spacer()

                if language.privacy == .private {
                    Image(systemName: "lock.fill")
                        .font(.caption)
                        .foregroundStyle(QCColors.textSecondary)
                }
            }

            // Title
            Text(language.title)
                .font(QCTypography.heading3)
                .foregroundStyle(QCColors.textPrimary)

            // Description
            Text(language.languageDescription)
                .font(QCTypography.body)
                .foregroundStyle(QCColors.textSecondary)
                .fixedSize(horizontal: false, vertical: true)

            // Examples
            if !language.examples.isEmpty {
                VStack(alignment: .leading, spacing: QCSpacing.xs) {
                    Text("Examples:")
                        .font(QCTypography.bodySmall)
                        .foregroundStyle(QCColors.textSecondary)

                    ForEach(language.examples, id: \.self) { example in
                        HStack(alignment: .top, spacing: QCSpacing.xs) {
                            Text("•")
                                .foregroundStyle(QCColors.textSecondary)
                            Text(example)
                                .font(QCTypography.body)
                                .foregroundStyle(QCColors.textSecondary)
                        }
                    }
                }
            }

            // Tags
            HStack(spacing: QCSpacing.sm) {
                // Importance badge
                ImportanceBadge(importance: language.importance)

                // Category tag
                TagPill(text: language.category.displayName, style: .category)

                // Custom tags
                ForEach(language.tags.prefix(3), id: \.self) { tag in
                    TagPill(text: tag, style: .default)
                }
            }

            // Actions
            HStack(spacing: QCSpacing.md) {
                Button(action: onEdit) {
                    Label("Edit", systemImage: "pencil")
                        .font(QCTypography.bodySmall)
                        .foregroundStyle(QCColors.primary)
                }

                Button(action: onDelete) {
                    Image(systemName: "trash")
                        .font(QCTypography.bodySmall)
                        .foregroundStyle(QCColors.error)
                }
            }
        }
        .padding(QCSpacing.lg)
        .background(QCColors.surfaceCard)
        .cornerRadius(QCSpacing.md)
        .shadow(color: .black.opacity(0.05), radius: 4, y: 2)
    }
}

// MARK: - Supporting Views

struct ImportanceBadge: View {
    let importance: Importance

    var body: some View {
        Text(importance.displayName)
            .font(QCTypography.captionSmall)
            .fontWeight(.semibold)
            .padding(.horizontal, QCSpacing.sm)
            .padding(.vertical, QCSpacing.xs)
            .background(backgroundColor)
            .foregroundStyle(textColor)
            .cornerRadius(QCSpacing.xs)
    }

    private var backgroundColor: Color {
        switch importance {
        case .low: return QCColors.info.opacity(0.1)
        case .medium: return QCColors.warning.opacity(0.1)
        case .high: return QCColors.error.opacity(0.1)
        case .essential: return QCColors.primary.opacity(0.1)
        }
    }

    private var textColor: Color {
        switch importance {
        case .low: return QCColors.info
        case .medium: return QCColors.warning
        case .high: return QCColors.error
        case .essential: return QCColors.primary
        }
    }
}

struct TagPill: View {
    let text: String
    let style: TagStyle

    enum TagStyle {
        case category
        case `default`
    }

    var body: some View {
        Text(text)
            .font(QCTypography.captionSmall)
            .padding(.horizontal, QCSpacing.sm)
            .padding(.vertical, QCSpacing.xs)
            .background(backgroundColor)
            .foregroundStyle(textColor)
            .cornerRadius(QCSpacing.lg)
    }

    private var backgroundColor: Color {
        switch style {
        case .category: return QCColors.primary.opacity(0.1)
        case .default: return QCColors.surfaceCard.opacity(0.5)
        }
    }

    private var textColor: Color {
        switch style {
        case .category: return QCColors.primary
        case .default: return QCColors.textSecondary
        }
    }
}

// MARK: - Importance Extension

extension Importance {
    var displayName: String {
        switch self {
        case .low: return "Low"
        case .medium: return "Medium"
        case .high: return "High"
        case .essential: return "Essential"
        }
    }
}

// MARK: - Preview

#Preview("Language Card") {
    let language = LoveLanguage(
        category: .words,
        title: "Morning words of encouragement",
        description: "I feel most loved when Deb tells me they believe in me, especially before a big day",
        userId: UUID()
    )
    language.examples = [
        "You're going to do amazing today",
        "I'm so proud of how hard you're working",
        "You've got this, and I'm here for you"
    ]
    language.importance = .high
    language.tags = ["morning", "encouragement", "support"]

    return LanguageCard(
        language: language,
        onEdit: {},
        onDelete: {}
    )
    .padding()
}

#Preview("Private Language") {
    let language = LoveLanguage(
        category: .gifts,
        title: "Small thoughtful surprises",
        description: "Little gifts that show you were thinking of me during your day",
        userId: UUID()
    )
    language.examples = [
        "My favorite coffee on a tough morning",
        "A book you think I'd enjoy",
        "Flowers for no reason"
    ]
    language.importance = .medium
    language.privacy = .private
    language.tags = ["surprises", "thoughtfulness"]

    return LanguageCard(
        language: language,
        onEdit: {},
        onDelete: {}
    )
    .padding()
}
