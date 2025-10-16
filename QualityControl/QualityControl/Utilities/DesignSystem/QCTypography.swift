//
//  QCTypography.swift
//  QualityControl
//
//  Week 2: Design System
//  Typography system with semantic text styles
//

import SwiftUI

/// QualityControl typography system using SF Pro
/// All styles support Dynamic Type for accessibility
struct QCTypography {

    // MARK: - Headings

    /// Large display heading (32pt, Bold)
    /// Usage: Hero sections, major page titles
    static let heading1 = Font.system(size: 32, weight: .bold, design: .default)

    /// Page heading (28pt, Bold)
    /// Usage: Main screen titles
    static let heading2 = Font.system(size: 28, weight: .bold, design: .default)

    /// Section heading (24pt, Semibold)
    /// Usage: Section headers, card titles
    static let heading3 = Font.system(size: 24, weight: .semibold, design: .default)

    /// Subsection heading (20pt, Semibold)
    /// Usage: Subsection headers
    static let heading4 = Font.system(size: 20, weight: .semibold, design: .default)

    /// Small heading (18pt, Semibold)
    /// Usage: List headers, small sections
    static let heading5 = Font.system(size: 18, weight: .semibold, design: .default)

    /// Tiny heading (16pt, Semibold)
    /// Usage: Inline headers, emphasized labels
    static let heading6 = Font.system(size: 16, weight: .semibold, design: .default)

    // MARK: - Body Text

    /// Large body text (17pt, Regular)
    /// Usage: Main content, default body text
    static let bodyLarge = Font.system(size: 17, weight: .regular, design: .default)

    /// Regular body text (15pt, Regular)
    /// Usage: Secondary content, descriptions
    static let body = Font.system(size: 15, weight: .regular, design: .default)

    /// Bold body text (15pt, Semibold)
    /// Usage: Emphasized body content
    static let bodyBold = Font.system(size: 15, weight: .semibold, design: .default)

    /// Small body text (13pt, Regular)
    /// Usage: Tertiary content, metadata
    static let bodySmall = Font.system(size: 13, weight: .regular, design: .default)

    // MARK: - Captions

    /// Large caption (13pt, Regular)
    /// Usage: Timestamps, secondary labels
    static let caption = Font.system(size: 13, weight: .regular, design: .default)

    /// Bold caption (13pt, Medium)
    /// Usage: Emphasized captions
    static let captionBold = Font.system(size: 13, weight: .medium, design: .default)

    /// Small caption (11pt, Regular)
    /// Usage: Very small labels, fine print
    static let captionSmall = Font.system(size: 11, weight: .regular, design: .default)

    // MARK: - UI Elements

    /// Button text (15pt, Semibold)
    /// Usage: Button labels
    static let button = Font.system(size: 15, weight: .semibold, design: .default)

    /// Large button text (17pt, Semibold)
    /// Usage: Primary action buttons
    static let buttonLarge = Font.system(size: 17, weight: .semibold, design: .default)

    /// Small button text (13pt, Semibold)
    /// Usage: Compact buttons, inline actions
    static let buttonSmall = Font.system(size: 13, weight: .semibold, design: .default)

    /// Label text (13pt, Medium)
    /// Usage: Form labels, input labels
    static let label = Font.system(size: 13, weight: .medium, design: .default)

    /// Placeholder text (15pt, Regular)
    /// Usage: TextField placeholders
    static let placeholder = Font.system(size: 15, weight: .regular, design: .default)

    // MARK: - Special

    /// Tab bar text (10pt, Medium)
    /// Usage: Tab bar item labels
    static let tabBar = Font.system(size: 10, weight: .medium, design: .default)

    /// Navigation title (17pt, Semibold)
    /// Usage: Navigation bar titles (inline mode)
    static let navigationTitle = Font.system(size: 17, weight: .semibold, design: .default)

    /// Large navigation title (34pt, Bold)
    /// Usage: Large navigation bar titles
    static let navigationTitleLarge = Font.system(size: 34, weight: .bold, design: .default)
}

// MARK: - Text Style Extensions

extension Text {
    /// Apply QC heading 1 style
    func qcHeading1() -> Text {
        self.font(QCTypography.heading1)
    }

    /// Apply QC heading 2 style
    func qcHeading2() -> Text {
        self.font(QCTypography.heading2)
    }

    /// Apply QC heading 3 style
    func qcHeading3() -> Text {
        self.font(QCTypography.heading3)
    }

    /// Apply QC heading 4 style
    func qcHeading4() -> Text {
        self.font(QCTypography.heading4)
    }

    /// Apply QC heading 5 style
    func qcHeading5() -> Text {
        self.font(QCTypography.heading5)
    }

    /// Apply QC heading 6 style
    func qcHeading6() -> Text {
        self.font(QCTypography.heading6)
    }

    /// Apply QC body large style
    func qcBodyLarge() -> Text {
        self.font(QCTypography.bodyLarge)
    }

    /// Apply QC body style
    func qcBody() -> Text {
        self.font(QCTypography.body)
    }

    /// Apply QC body bold style
    func qcBodyBold() -> Text {
        self.font(QCTypography.bodyBold)
    }

    /// Apply QC caption style
    func qcCaption() -> Text {
        self.font(QCTypography.caption)
    }

    /// Apply QC caption bold style
    func qcCaptionBold() -> Text {
        self.font(QCTypography.captionBold)
    }
}

// MARK: - Preview

#Preview("QCTypography Styles") {
    ScrollView {
        VStack(alignment: .leading, spacing: 24) {
            TypographySection(title: "Headings") {
                TypeSample(name: "Heading 1", font: QCTypography.heading1)
                TypeSample(name: "Heading 2", font: QCTypography.heading2)
                TypeSample(name: "Heading 3", font: QCTypography.heading3)
                TypeSample(name: "Heading 4", font: QCTypography.heading4)
                TypeSample(name: "Heading 5", font: QCTypography.heading5)
                TypeSample(name: "Heading 6", font: QCTypography.heading6)
            }

            TypographySection(title: "Body Text") {
                TypeSample(name: "Body Large", font: QCTypography.bodyLarge)
                TypeSample(name: "Body", font: QCTypography.body)
                TypeSample(name: "Body Bold", font: QCTypography.bodyBold)
                TypeSample(name: "Body Small", font: QCTypography.bodySmall)
            }

            TypographySection(title: "Captions") {
                TypeSample(name: "Caption", font: QCTypography.caption)
                TypeSample(name: "Caption Bold", font: QCTypography.captionBold)
                TypeSample(name: "Caption Small", font: QCTypography.captionSmall)
            }

            TypographySection(title: "UI Elements") {
                TypeSample(name: "Button", font: QCTypography.button)
                TypeSample(name: "Button Large", font: QCTypography.buttonLarge)
                TypeSample(name: "Button Small", font: QCTypography.buttonSmall)
                TypeSample(name: "Label", font: QCTypography.label)
            }

            TypographySection(title: "Navigation") {
                TypeSample(name: "Nav Title", font: QCTypography.navigationTitle)
                TypeSample(name: "Nav Title Large", font: QCTypography.navigationTitleLarge)
            }
        }
        .padding()
    }
}

// MARK: - Preview Helper Views

private struct TypographySection<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
                .foregroundColor(QCColors.textSecondary)

            content
        }
    }
}

private struct TypeSample: View {
    let name: String
    let font: Font

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(name)
                .font(.caption)
                .foregroundColor(QCColors.textTertiary)

            Text("The quick brown fox jumps over the lazy dog")
                .font(font)
                .foregroundColor(QCColors.textPrimary)
        }
        .padding(.vertical, 4)
    }
}
