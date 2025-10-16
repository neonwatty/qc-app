//
//  QCSpacing.swift
//  QualityControl
//
//  Week 2: Design System
//  Consistent spacing scale and layout constants
//

import SwiftUI

/// QualityControl spacing system
/// Uses 4pt base unit for consistent rhythm
struct QCSpacing {

    // MARK: - Spacing Scale (4pt base)

    /// Extra extra small spacing (4pt)
    static let xxs: CGFloat = 4

    /// Extra small spacing (8pt)
    static let xs: CGFloat = 8

    /// Small spacing (12pt)
    static let sm: CGFloat = 12

    /// Medium spacing (16pt) - Default
    static let md: CGFloat = 16

    /// Large spacing (24pt)
    static let lg: CGFloat = 24

    /// Extra large spacing (32pt)
    static let xl: CGFloat = 32

    /// Extra extra large spacing (48pt)
    static let xxl: CGFloat = 48

    /// Triple extra large spacing (64pt)
    static let xxxl: CGFloat = 64

    // MARK: - Padding Presets

    /// Card padding (16pt all sides)
    static let cardPadding = EdgeInsets(top: md, leading: md, bottom: md, trailing: md)

    /// Screen padding (20pt horizontal, 16pt vertical)
    static let screenPadding = EdgeInsets(top: md, leading: 20, bottom: md, trailing: 20)

    /// List item padding (16pt horizontal, 12pt vertical)
    static let listItemPadding = EdgeInsets(top: sm, leading: md, bottom: sm, trailing: md)

    /// Section padding (24pt top, 16pt horizontal)
    static let sectionPadding = EdgeInsets(top: lg, leading: md, bottom: 0, trailing: md)

    // MARK: - Corner Radius

    /// Extra small radius (4pt) - For small badges, tags
    static let radiusXS: CGFloat = 4

    /// Small radius (8pt) - For buttons, inputs
    static let radiusSM: CGFloat = 8

    /// Medium radius (12pt) - For cards
    static let radiusMD: CGFloat = 12

    /// Large radius (16pt) - For large cards, modals
    static let radiusLG: CGFloat = 16

    /// Extra large radius (24pt) - For special UI elements
    static let radiusXL: CGFloat = 24

    /// Full radius (9999pt) - For circular elements
    static let radiusFull: CGFloat = 9999

    // MARK: - Element Sizes

    /// Minimum touch target size (44x44pt) per Apple HIG
    static let minTouchTarget: CGFloat = 44

    /// Standard icon size (24x24pt)
    static let iconSize: CGFloat = 24

    /// Small icon size (16x16pt)
    static let iconSizeSmall: CGFloat = 16

    /// Large icon size (32x32pt)
    static let iconSizeLarge: CGFloat = 32

    /// Extra large icon size (48x48pt)
    static let iconSizeXL: CGFloat = 48

    /// Avatar size (40x40pt)
    static let avatarSize: CGFloat = 40

    /// Large avatar size (64x64pt)
    static let avatarSizeLarge: CGFloat = 64

    // MARK: - Layout Sizes

    /// Standard button height (48pt)
    static let buttonHeight: CGFloat = 48

    /// Small button height (36pt)
    static let buttonHeightSmall: CGFloat = 36

    /// Large button height (56pt)
    static let buttonHeightLarge: CGFloat = 56

    /// Standard input field height (48pt)
    static let inputHeight: CGFloat = 48

    /// Standard card elevation (shadow)
    static let cardElevation: CGFloat = 2

    // MARK: - Grid Spacing

    /// Grid spacing for 2-column layouts
    static let gridSpacing2Col: CGFloat = md

    /// Grid spacing for 3-column layouts
    static let gridSpacing3Col: CGFloat = sm

    /// Grid spacing for 4-column layouts
    static let gridSpacing4Col: CGFloat = xs
}

// MARK: - View Extensions

extension View {
    /// Apply card padding
    func qcCardPadding() -> some View {
        self.padding(QCSpacing.cardPadding)
    }

    /// Apply screen padding
    func qcScreenPadding() -> some View {
        self.padding(QCSpacing.screenPadding)
    }

    /// Apply list item padding
    func qcListItemPadding() -> some View {
        self.padding(QCSpacing.listItemPadding)
    }

    /// Apply section padding
    func qcSectionPadding() -> some View {
        self.padding(QCSpacing.sectionPadding)
    }

    /// Apply card corner radius
    func qcCardCornerRadius() -> some View {
        self.cornerRadius(QCSpacing.radiusMD)
    }

    /// Apply button corner radius
    func qcButtonCornerRadius() -> some View {
        self.cornerRadius(QCSpacing.radiusSM)
    }
}

// MARK: - Preview

#Preview("QCSpacing Scale") {
    ScrollView {
        VStack(alignment: .leading, spacing: 24) {
            SpacingSection(title: "Spacing Scale") {
                SpacingSample(name: "XXS (4pt)", spacing: QCSpacing.xxs)
                SpacingSample(name: "XS (8pt)", spacing: QCSpacing.xs)
                SpacingSample(name: "SM (12pt)", spacing: QCSpacing.sm)
                SpacingSample(name: "MD (16pt)", spacing: QCSpacing.md)
                SpacingSample(name: "LG (24pt)", spacing: QCSpacing.lg)
                SpacingSample(name: "XL (32pt)", spacing: QCSpacing.xl)
                SpacingSample(name: "XXL (48pt)", spacing: QCSpacing.xxl)
                SpacingSample(name: "XXXL (64pt)", spacing: QCSpacing.xxxl)
            }

            SpacingSection(title: "Corner Radius") {
                RadiusSample(name: "XS (4pt)", radius: QCSpacing.radiusXS)
                RadiusSample(name: "SM (8pt)", radius: QCSpacing.radiusSM)
                RadiusSample(name: "MD (12pt)", radius: QCSpacing.radiusMD)
                RadiusSample(name: "LG (16pt)", radius: QCSpacing.radiusLG)
                RadiusSample(name: "XL (24pt)", radius: QCSpacing.radiusXL)
            }

            SpacingSection(title: "Icon Sizes") {
                IconSizeSample(name: "Small (16pt)", size: QCSpacing.iconSizeSmall)
                IconSizeSample(name: "Standard (24pt)", size: QCSpacing.iconSize)
                IconSizeSample(name: "Large (32pt)", size: QCSpacing.iconSizeLarge)
                IconSizeSample(name: "XL (48pt)", size: QCSpacing.iconSizeXL)
            }
        }
        .padding()
    }
}

// MARK: - Preview Helper Views

private struct SpacingSection<Content: View>: View {
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

private struct SpacingSample: View {
    let name: String
    let spacing: CGFloat

    var body: some View {
        HStack(spacing: 12) {
            Rectangle()
                .fill(QCColors.primary)
                .frame(width: spacing, height: 24)

            Text(name)
                .font(.caption)

            Spacer()
        }
    }
}

private struct RadiusSample: View {
    let name: String
    let radius: CGFloat

    var body: some View {
        HStack(spacing: 12) {
            RoundedRectangle(cornerRadius: radius)
                .fill(QCColors.primary)
                .frame(width: 60, height: 40)

            Text(name)
                .font(.caption)

            Spacer()
        }
    }
}

private struct IconSizeSample: View {
    let name: String
    let size: CGFloat

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "heart.fill")
                .font(.system(size: size))
                .foregroundColor(QCColors.primary)
                .frame(width: size, height: size)

            Text(name)
                .font(.caption)

            Spacer()
        }
    }
}
