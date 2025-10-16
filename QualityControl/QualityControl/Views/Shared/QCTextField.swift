//
//  QCTextField.swift
//  QualityControl
//
//  Week 2: Design System
//  Reusable text field component with label, error states, and validation
//

import SwiftUI

/// QualityControl text field component
/// Supports labels, error messages, character counts, and secure entry
struct QCTextField: View {
    // MARK: - Properties

    let label: String
    @Binding var text: String
    var placeholder: String = ""
    var errorMessage: String? = nil
    var helperText: String? = nil
    var maxLength: Int? = nil
    var isSecure: Bool = false
    var keyboardType: UIKeyboardType = .default
    var autocapitalization: TextInputAutocapitalization = .sentences
    var icon: String? = nil

    // MARK: - State

    @FocusState private var isFocused: Bool
    @State private var showPassword: Bool = false

    // MARK: - Body

    var body: some View {
        VStack(alignment: .leading, spacing: QCSpacing.xs) {
            // Label
            if !label.isEmpty {
                Text(label)
                    .font(QCTypography.label)
                    .foregroundColor(labelColor)
            }

            // Input Field
            HStack(spacing: QCSpacing.sm) {
                // Leading Icon
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: QCSpacing.iconSize))
                        .foregroundColor(iconColor)
                }

                // Text Input
                if isSecure && !showPassword {
                    SecureField(placeholder, text: $text)
                        .font(QCTypography.body)
                        .textInputAutocapitalization(.never)
                        .keyboardType(keyboardType)
                        .focused($isFocused)
                } else {
                    TextField(placeholder, text: $text)
                        .font(QCTypography.body)
                        .textInputAutocapitalization(autocapitalization)
                        .keyboardType(keyboardType)
                        .focused($isFocused)
                }

                // Trailing Actions
                HStack(spacing: QCSpacing.xs) {
                    // Clear Button
                    if !text.isEmpty && isFocused {
                        Button(action: {
                            text = ""
                        }) {
                            Image(systemName: "xmark.circle.fill")
                                .font(.system(size: 18))
                                .foregroundColor(QCColors.textTertiary)
                        }
                    }

                    // Password Toggle
                    if isSecure {
                        Button(action: {
                            showPassword.toggle()
                        }) {
                            Image(systemName: showPassword ? "eye.slash.fill" : "eye.fill")
                                .font(.system(size: 18))
                                .foregroundColor(QCColors.textTertiary)
                        }
                    }
                }
            }
            .padding(.horizontal, QCSpacing.md)
            .frame(height: QCSpacing.inputHeight)
            .background(backgroundColor)
            .overlay(
                RoundedRectangle(cornerRadius: QCSpacing.radiusSM)
                    .stroke(borderColor, lineWidth: borderWidth)
            )
            .cornerRadius(QCSpacing.radiusSM)

            // Error / Helper / Character Count
            HStack(spacing: QCSpacing.sm) {
                // Error or Helper Text
                if let errorMessage = errorMessage {
                    Label(errorMessage, systemImage: "exclamationmark.circle.fill")
                        .font(QCTypography.captionSmall)
                        .foregroundColor(QCColors.error)
                } else if let helperText = helperText {
                    Text(helperText)
                        .font(QCTypography.captionSmall)
                        .foregroundColor(QCColors.textTertiary)
                }

                Spacer()

                // Character Count
                if let maxLength = maxLength {
                    Text("\(text.count)/\(maxLength)")
                        .font(QCTypography.captionSmall)
                        .foregroundColor(characterCountColor)
                }
            }
            .frame(height: errorMessage != nil || helperText != nil || maxLength != nil ? nil : 0)
            .opacity(errorMessage != nil || helperText != nil || maxLength != nil ? 1 : 0)
        }
        .animation(QCAnimations.fade, value: errorMessage)
        .onChange(of: text) { _, newValue in
            if let maxLength = maxLength, newValue.count > maxLength {
                text = String(newValue.prefix(maxLength))
            }
        }
    }

    // MARK: - Computed Properties

    private var labelColor: Color {
        if errorMessage != nil {
            return QCColors.error
        } else if isFocused {
            return QCColors.primary
        } else {
            return QCColors.textSecondary
        }
    }

    private var iconColor: Color {
        if errorMessage != nil {
            return QCColors.error
        } else if isFocused {
            return QCColors.primary
        } else {
            return QCColors.textTertiary
        }
    }

    private var backgroundColor: Color {
        QCColors.surfaceInput
    }

    private var borderColor: Color {
        if errorMessage != nil {
            return QCColors.error
        } else if isFocused {
            return QCColors.primary
        } else {
            return Color.clear
        }
    }

    private var borderWidth: CGFloat {
        (errorMessage != nil || isFocused) ? 2 : 0
    }

    private var characterCountColor: Color {
        if let maxLength = maxLength {
            let percentage = Double(text.count) / Double(maxLength)
            if percentage >= 1.0 {
                return QCColors.error
            } else if percentage >= 0.8 {
                return QCColors.warning
            }
        }
        return QCColors.textTertiary
    }
}

// MARK: - Preview

#Preview("QCTextField States") {
    ScrollView {
        VStack(spacing: 32) {
            // Basic
            TextFieldSection(title: "Basic") {
                QCTextField(
                    label: "Name",
                    text: .constant(""),
                    placeholder: "Enter your name"
                )

                QCTextField(
                    label: "Email",
                    text: .constant("user@example.com"),
                    placeholder: "your@email.com",
                    icon: "envelope"
                )
            }

            // With Error
            TextFieldSection(title: "Error State") {
                QCTextField(
                    label: "Email",
                    text: .constant("invalid-email"),
                    placeholder: "your@email.com",
                    errorMessage: "Please enter a valid email address",
                    icon: "envelope"
                )
            }

            // With Helper Text
            TextFieldSection(title: "Helper Text") {
                QCTextField(
                    label: "Username",
                    text: .constant(""),
                    placeholder: "Choose a username",
                    helperText: "Minimum 3 characters, letters and numbers only"
                )
            }

            // With Character Count
            TextFieldSection(title: "Character Limit") {
                QCTextField(
                    label: "Bio",
                    text: .constant("Hello, I'm using QualityControl!"),
                    placeholder: "Tell us about yourself",
                    maxLength: 160
                )
            }

            // Secure Entry
            TextFieldSection(title: "Password Field") {
                QCTextField(
                    label: "Password",
                    text: .constant(""),
                    placeholder: "Enter password",
                    isSecure: true,
                    icon: "lock"
                )
            }

            // Different Keyboard Types
            TextFieldSection(title: "Keyboard Types") {
                QCTextField(
                    label: "Phone",
                    text: .constant(""),
                    placeholder: "(555) 123-4567",
                    keyboardType: .phonePad,
                    icon: "phone"
                )

                QCTextField(
                    label: "Website",
                    text: .constant(""),
                    placeholder: "https://example.com",
                    keyboardType: .URL,
                    autocapitalization: .never,
                    icon: "link"
                )
            }
        }
        .padding()
    }
}

// MARK: - Preview Helper

private struct TextFieldSection<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(title)
                .font(QCTypography.heading6)
                .foregroundColor(QCColors.textSecondary)

            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
