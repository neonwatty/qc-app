//
//  QCColors.swift
//  QualityControl
//
//  Week 2: Design System
//  Semantic color palette with dark mode support
//

import SwiftUI

/// QualityControl color system with semantic naming
/// All colors support dark mode automatically via SwiftUI's adaptive color system
struct QCColors {

    // MARK: - Brand Colors

    /// Primary brand color (Pink) - Used for CTAs, active states, key UI elements
    static let primary = Color(hex: "#EC4899") // Pink-500

    /// Secondary brand color (Purple) - Used for accents and highlights
    static let secondary = Color(hex: "#9333EA") // Purple-600

    /// Tertiary brand color (Rose) - Used for subtle accents
    static let tertiary = Color(hex: "#F43F5E") // Rose-500

    // MARK: - Semantic Colors

    /// Success state color (Green)
    static let success = Color(hex: "#10B981") // Green-500

    /// Warning state color (Amber)
    static let warning = Color(hex: "#F59E0B") // Amber-500

    /// Error state color (Red)
    static let error = Color(hex: "#EF4444") // Red-500

    /// Info state color (Blue)
    static let info = Color(hex: "#3B82F6") // Blue-500

    // MARK: - Background Colors

    /// Primary background (adapts to light/dark mode)
    static let backgroundPrimary = Color(.systemBackground)

    /// Secondary background for cards, elevated surfaces
    static let backgroundSecondary = Color(.secondarySystemBackground)

    /// Tertiary background for grouped content
    static let backgroundTertiary = Color(.tertiarySystemBackground)

    /// Grouped background for List style
    static let backgroundGrouped = Color(.systemGroupedBackground)

    // MARK: - Surface Colors

    /// Card surface color with elevation
    static let surfaceCard = Color(.secondarySystemBackground)

    /// Modal/sheet surface color
    static let surfaceModal = Color(.systemBackground)

    /// Input field surface color
    static let surfaceInput = Color(.tertiarySystemBackground)

    // MARK: - Text Colors

    /// Primary text color (highest contrast)
    static let textPrimary = Color(.label)

    /// Secondary text color (medium contrast)
    static let textSecondary = Color(.secondaryLabel)

    /// Tertiary text color (lowest contrast, hints/placeholders)
    static let textTertiary = Color(.tertiaryLabel)

    /// Disabled text color
    static let textDisabled = Color(.quaternaryLabel)

    /// Text on primary brand color (white)
    static let textOnPrimary = Color.white

    // MARK: - Border Colors

    /// Default border color
    static let border = Color(.separator)

    /// Subtle border color
    static let borderSubtle = Color(.opaqueSeparator)

    // MARK: - Overlay Colors

    /// Modal overlay / backdrop
    static let overlay = Color.black.opacity(0.4)

    /// Subtle overlay for hover states
    static let overlaySubtle = Color.black.opacity(0.05)

    // MARK: - Privacy Indicator Colors

    /// Private note color (Blue)
    static let privacyPrivate = Color(hex: "#3B82F6") // Blue-500

    /// Shared note color (Green)
    static let privacyShared = Color(hex: "#10B981") // Green-500

    /// Draft note color (Orange)
    static let privacyDraft = Color(hex: "#F97316") // Orange-500
}

// MARK: - Color Extension (Hex Support)

extension Color {
    /// Initialize Color from hex string (e.g., "#EC4899")
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Preview

#Preview("QCColors Palette") {
    ScrollView {
        VStack(alignment: .leading, spacing: 24) {
            ColorSection(title: "Brand Colors") {
                ColorSwatch(name: "Primary", color: QCColors.primary)
                ColorSwatch(name: "Secondary", color: QCColors.secondary)
                ColorSwatch(name: "Tertiary", color: QCColors.tertiary)
            }

            ColorSection(title: "Semantic Colors") {
                ColorSwatch(name: "Success", color: QCColors.success)
                ColorSwatch(name: "Warning", color: QCColors.warning)
                ColorSwatch(name: "Error", color: QCColors.error)
                ColorSwatch(name: "Info", color: QCColors.info)
            }

            ColorSection(title: "Background Colors") {
                ColorSwatch(name: "Primary", color: QCColors.backgroundPrimary)
                ColorSwatch(name: "Secondary", color: QCColors.backgroundSecondary)
                ColorSwatch(name: "Tertiary", color: QCColors.backgroundTertiary)
            }

            ColorSection(title: "Text Colors") {
                ColorSwatch(name: "Primary", color: QCColors.textPrimary)
                ColorSwatch(name: "Secondary", color: QCColors.textSecondary)
                ColorSwatch(name: "Tertiary", color: QCColors.textTertiary)
                ColorSwatch(name: "Disabled", color: QCColors.textDisabled)
            }

            ColorSection(title: "Privacy Colors") {
                ColorSwatch(name: "Private", color: QCColors.privacyPrivate)
                ColorSwatch(name: "Shared", color: QCColors.privacyShared)
                ColorSwatch(name: "Draft", color: QCColors.privacyDraft)
            }
        }
        .padding()
    }
}

// MARK: - Preview Helper Views

private struct ColorSection<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)

            content
        }
    }
}

private struct ColorSwatch: View {
    let name: String
    let color: Color

    var body: some View {
        HStack {
            RoundedRectangle(cornerRadius: 8)
                .fill(color)
                .frame(width: 60, height: 40)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                )

            Text(name)
                .font(.body)

            Spacer()
        }
    }
}
