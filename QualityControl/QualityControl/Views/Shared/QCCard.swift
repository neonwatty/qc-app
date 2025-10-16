//
//  QCCard.swift
//  QualityControl
//
//  Week 2: Design System
//  Reusable card container with elevation and optional header/footer
//

import SwiftUI

/// QualityControl card component
/// Container with elevation, optional header/footer, and customizable padding
struct QCCard<Content: View>: View {
    // MARK: - Properties

    let content: Content
    var header: String? = nil
    var footer: String? = nil
    var padding: PaddingSize = .medium
    var elevation: ElevationStyle = .medium
    var backgroundColor: Color = QCColors.surfaceCard

    // MARK: - Initializer

    init(
        header: String? = nil,
        footer: String? = nil,
        padding: PaddingSize = .medium,
        elevation: ElevationStyle = .medium,
        backgroundColor: Color = QCColors.surfaceCard,
        @ViewBuilder content: () -> Content
    ) {
        self.header = header
        self.footer = footer
        self.padding = padding
        self.elevation = elevation
        self.backgroundColor = backgroundColor
        self.content = content()
    }

    // MARK: - Body

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            if let header = header {
                Text(header)
                    .font(QCTypography.heading6)
                    .foregroundColor(QCColors.textPrimary)
                    .padding(headerFooterPadding)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.clear)

                Divider()
            }

            // Content
            content
                .padding(contentPadding)

            // Footer
            if let footer = footer {
                Divider()

                Text(footer)
                    .font(QCTypography.caption)
                    .foregroundColor(QCColors.textSecondary)
                    .padding(headerFooterPadding)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .background(backgroundColor)
        .qcCardCornerRadius()
        .modifier(ElevationModifier(style: elevation))
    }

    // MARK: - Computed Properties

    private var contentPadding: EdgeInsets {
        switch padding {
        case .none:
            return EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0)
        case .small:
            return EdgeInsets(top: QCSpacing.sm, leading: QCSpacing.sm, bottom: QCSpacing.sm, trailing: QCSpacing.sm)
        case .medium:
            return EdgeInsets(top: QCSpacing.md, leading: QCSpacing.md, bottom: QCSpacing.md, trailing: QCSpacing.md)
        case .large:
            return EdgeInsets(top: QCSpacing.lg, leading: QCSpacing.lg, bottom: QCSpacing.lg, trailing: QCSpacing.lg)
        }
    }

    private var headerFooterPadding: EdgeInsets {
        EdgeInsets(top: QCSpacing.sm, leading: QCSpacing.md, bottom: QCSpacing.sm, trailing: QCSpacing.md)
    }
}

// MARK: - Padding Size

enum QCCardPaddingSize {
    case none
    case small
    case medium
    case large
}

// MARK: - Elevation Style

enum QCCardElevationStyle {
    case none
    case low
    case medium
    case high
}

// MARK: - Type Aliases

extension QCCard {
    typealias PaddingSize = QCCardPaddingSize
    typealias ElevationStyle = QCCardElevationStyle
}

// MARK: - Elevation Modifier

private struct ElevationModifier: ViewModifier {
    let style: QCCardElevationStyle

    func body(content: Content) -> some View {
        switch style {
        case .none:
            content
        case .low:
            content
                .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
        case .medium:
            content
                .shadow(color: Color.black.opacity(0.1), radius: 4, x: 0, y: 2)
        case .high:
            content
                .shadow(color: Color.black.opacity(0.15), radius: 8, x: 0, y: 4)
        }
    }
}

// MARK: - Convenience Initializers
// (Removed - use QCCard directly with @ViewBuilder content parameter)

// MARK: - Preview

#Preview("QCCard Variants") {
    ScrollView {
        VStack(spacing: 24) {
            // Basic Card
            CardSection(title: "Basic Card") {
                QCCard {
                    Text("This is a basic card with default styling.")
                        .font(QCTypography.body)
                        .foregroundColor(QCColors.textPrimary)
                }
            }

            // Card with Header
            CardSection(title: "Card with Header") {
                QCCard(header: "Card Title") {
                    Text("Content goes here with a header title.")
                        .font(QCTypography.body)
                        .foregroundColor(QCColors.textPrimary)
                }
            }

            // Card with Header and Footer
            CardSection(title: "Card with Header & Footer") {
                QCCard(header: "Recent Activity", footer: "Last updated 5 minutes ago") {
                    VStack(alignment: .leading, spacing: 8) {
                        ForEach(0..<3) { index in
                            HStack {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(QCColors.success)
                                Text("Completed check-in #\(index + 1)")
                                    .font(QCTypography.body)
                                Spacer()
                            }
                        }
                    }
                }
            }

            // Different Padding Sizes
            CardSection(title: "Padding Variants") {
                QCCard(header: "Small Padding", padding: .small) {
                    Text("Compact content")
                        .font(QCTypography.bodySmall)
                }

                QCCard(header: "Medium Padding", padding: .medium) {
                    Text("Default padding")
                        .font(QCTypography.body)
                }

                QCCard(header: "Large Padding", padding: .large) {
                    Text("Spacious content")
                        .font(QCTypography.bodyLarge)
                }
            }

            // Elevation Variants
            CardSection(title: "Elevation Variants") {
                QCCard(header: "No Elevation", elevation: .none) {
                    Text("Flat card")
                }

                QCCard(header: "Low Elevation", elevation: .low) {
                    Text("Subtle shadow")
                }

                QCCard(header: "Medium Elevation", elevation: .medium) {
                    Text("Default shadow")
                }

                QCCard(header: "High Elevation", elevation: .high) {
                    Text("Strong shadow")
                }
            }

            // Complex Content
            CardSection(title: "Complex Content") {
                QCCard(header: "Check-in Summary", footer: "Completed today at 7:30 PM") {
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            VStack(alignment: .leading) {
                                Text("Duration")
                                    .font(QCTypography.caption)
                                    .foregroundColor(QCColors.textSecondary)
                                Text("45 minutes")
                                    .font(QCTypography.heading6)
                            }
                            Spacer()
                            VStack(alignment: .leading) {
                                Text("Categories")
                                    .font(QCTypography.caption)
                                    .foregroundColor(QCColors.textSecondary)
                                Text("3 topics")
                                    .font(QCTypography.heading6)
                            }
                        }

                        Divider()

                        HStack {
                            Image(systemName: "star.fill")
                                .foregroundColor(QCColors.warning)
                            Text("Great conversation!")
                                .font(QCTypography.body)
                        }
                    }
                }
            }
        }
        .padding()
    }
    .background(QCColors.backgroundPrimary)
}

// MARK: - Preview Helper

private struct CardSection<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(QCTypography.heading6)
                .foregroundColor(QCColors.textSecondary)
                .padding(.leading, 4)

            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
