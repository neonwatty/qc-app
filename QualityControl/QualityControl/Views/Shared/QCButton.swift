//
//  QCButton.swift
//  QualityControl
//
//  Week 2: Design System
//  Reusable button component with variants and states
//

import SwiftUI

/// QualityControl button component
/// Supports multiple variants (primary, secondary, tertiary) and sizes (small, medium, large)
struct QCButton: View {
    // MARK: - Properties

    let title: String
    let action: () -> Void
    var variant: Variant = .primary
    var size: Size = .medium
    var isLoading: Bool = false
    var isDisabled: Bool = false
    var icon: String? = nil

    // MARK: - State

    @State private var isPressed = false

    // MARK: - Body

    var body: some View {
        Button(action: {
            guard !isDisabled && !isLoading else { return }
            action()
        }) {
            HStack(spacing: QCSpacing.xs) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: foregroundColor))
                        .scaleEffect(0.8)
                } else {
                    if let icon = icon {
                        Image(systemName: icon)
                            .font(iconFont)
                    }

                    Text(title)
                        .font(textFont)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: height)
            .foregroundColor(foregroundColor)
            .background(backgroundColor)
            .qcButtonCornerRadius()
            .overlay(
                RoundedRectangle(cornerRadius: QCSpacing.radiusSM)
                    .stroke(borderColor, lineWidth: borderWidth)
            )
            .opacity(opacity)
        }
        .buttonStyle(ScaleButtonStyle())
        .disabled(isDisabled || isLoading)
    }

    // MARK: - Computed Properties

    private var height: CGFloat {
        switch size {
        case .small:
            return QCSpacing.buttonHeightSmall
        case .medium:
            return QCSpacing.buttonHeight
        case .large:
            return QCSpacing.buttonHeightLarge
        }
    }

    private var textFont: Font {
        switch size {
        case .small:
            return QCTypography.buttonSmall
        case .medium:
            return QCTypography.button
        case .large:
            return QCTypography.buttonLarge
        }
    }

    private var iconFont: Font {
        switch size {
        case .small:
            return .system(size: 14, weight: .semibold)
        case .medium:
            return .system(size: 16, weight: .semibold)
        case .large:
            return .system(size: 18, weight: .semibold)
        }
    }

    private var foregroundColor: Color {
        switch variant {
        case .primary, .secondary:
            return .white
        case .tertiary:
            return QCColors.primary
        }
    }

    private var backgroundColor: Color {
        switch variant {
        case .primary:
            return QCColors.primary
        case .secondary:
            return QCColors.secondary
        case .tertiary:
            return Color.clear
        }
    }

    private var borderColor: Color {
        switch variant {
        case .primary, .secondary:
            return Color.clear
        case .tertiary:
            return QCColors.primary
        }
    }

    private var borderWidth: CGFloat {
        variant == .tertiary ? 2 : 0
    }

    private var opacity: Double {
        isDisabled ? 0.5 : 1.0
    }
}

// MARK: - Button Variants

extension QCButton {
    enum Variant {
        case primary    // Filled with primary color
        case secondary  // Outlined with primary color
        case tertiary   // Subtle background, no border
    }

    enum Size {
        case small
        case medium
        case large
    }
}

// MARK: - Custom Button Style

private struct ScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .animation(QCAnimations.buttonPress, value: configuration.isPressed)
    }
}

// MARK: - Convenience Initializers

extension QCButton {
    /// Create a primary button
    static func primary(
        _ title: String,
        icon: String? = nil,
        size: Size = .medium,
        isLoading: Bool = false,
        isDisabled: Bool = false,
        action: @escaping () -> Void
    ) -> QCButton {
        QCButton(
            title: title,
            action: action,
            variant: .primary,
            size: size,
            isLoading: isLoading,
            isDisabled: isDisabled,
            icon: icon
        )
    }

    /// Create a secondary button
    static func secondary(
        _ title: String,
        icon: String? = nil,
        size: Size = .medium,
        isLoading: Bool = false,
        isDisabled: Bool = false,
        action: @escaping () -> Void
    ) -> QCButton {
        QCButton(
            title: title,
            action: action,
            variant: .secondary,
            size: size,
            isLoading: isLoading,
            isDisabled: isDisabled,
            icon: icon
        )
    }

    /// Create a tertiary button
    static func tertiary(
        _ title: String,
        icon: String? = nil,
        size: Size = .medium,
        isLoading: Bool = false,
        isDisabled: Bool = false,
        action: @escaping () -> Void
    ) -> QCButton {
        QCButton(
            title: title,
            action: action,
            variant: .tertiary,
            size: size,
            isLoading: isLoading,
            isDisabled: isDisabled,
            icon: icon
        )
    }
}

// MARK: - Preview

#Preview("QCButton Variants") {
    ScrollView {
        VStack(spacing: 32) {
            // Primary Buttons
            ButtonSection(title: "Primary Buttons") {
                QCButton.primary("Continue", icon: "arrow.right") {}
                QCButton.primary("Loading", isLoading: true) {}
                QCButton.primary("Disabled", isDisabled: true) {}
            }

            // Secondary Buttons
            ButtonSection(title: "Secondary Buttons") {
                QCButton.secondary("Cancel") {}
                QCButton.secondary("Loading", isLoading: true) {}
                QCButton.secondary("Disabled", isDisabled: true) {}
            }

            // Tertiary Buttons
            ButtonSection(title: "Tertiary Buttons") {
                QCButton.tertiary("Skip", icon: "arrow.forward") {}
                QCButton.tertiary("Loading", isLoading: true) {}
                QCButton.tertiary("Disabled", isDisabled: true) {}
            }

            // Size Variants
            ButtonSection(title: "Sizes") {
                QCButton.primary("Small", size: .small) {}
                QCButton.primary("Medium", size: .medium) {}
                QCButton.primary("Large", size: .large) {}
            }

            // With Icons
            ButtonSection(title: "With Icons") {
                QCButton.primary("Start Check-in", icon: "heart.fill") {}
                QCButton.secondary("Add Note", icon: "note.text") {}
                QCButton.tertiary("View Growth", icon: "chart.line.uptrend.xyaxis") {}
            }
        }
        .padding()
    }
}

// MARK: - Preview Helper

private struct ButtonSection<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(QCTypography.heading6)
                .foregroundColor(QCColors.textSecondary)

            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
