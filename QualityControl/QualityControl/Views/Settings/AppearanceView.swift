//
//  AppearanceView.swift
//  QualityControl
//
//  Week 7: Settings System
//  Customize app theme and appearance
//

import SwiftUI

struct AppearanceView: View {

    // MARK: - Properties

    @AppStorage("appearanceMode") private var appearanceMode = "system"
    @AppStorage("accentColor") private var accentColorHex = "EC4899" // Pink default
    @AppStorage("fontSize") private var fontSize = "medium"

    @State private var selectedAccentColor: Color = QCColors.primary

    private let accentColors: [(name: String, color: Color, hex: String)] = [
        ("Pink", Color(hex: "EC4899"), "EC4899"),
        ("Purple", Color(hex: "A855F7"), "A855F7"),
        ("Blue", Color(hex: "3B82F6"), "3B82F6"),
        ("Green", Color(hex: "10B981"), "10B981"),
        ("Orange", Color(hex: "F97316"), "F97316"),
        ("Red", Color(hex: "EF4444"), "EF4444")
    ]

    // MARK: - Body

    var body: some View {
        Form {
            themeSection
            accentColorSection
            textSizeSection
            previewSection
        }
        .navigationTitle("Appearance")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            selectedAccentColor = Color(hex: accentColorHex)
        }
    }

    // MARK: - Sections

    private var themeSection: some View {
        Section {
            Picker("Theme", selection: $appearanceMode) {
                HStack {
                    Image(systemName: "iphone")
                    Text("System")
                }
                .tag("system")

                HStack {
                    Image(systemName: "sun.max")
                    Text("Light")
                }
                .tag("light")

                HStack {
                    Image(systemName: "moon")
                    Text("Dark")
                }
                .tag("dark")
            }
            .pickerStyle(.inline)
            .font(QCTypography.body)
        } header: {
            Text("Theme Mode")
        } footer: {
            Text(themeDescription)
                .font(QCTypography.captionSmall)
        }
    }

    private var accentColorSection: some View {
        Section {
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: QCSpacing.md) {
                ForEach(accentColors, id: \.hex) { item in
                    Button(action: {
                        accentColorHex = item.hex
                        selectedAccentColor = item.color
                    }) {
                        VStack(spacing: QCSpacing.xs) {
                            Circle()
                                .fill(item.color)
                                .frame(width: 50, height: 50)
                                .overlay(
                                    Circle()
                                        .stroke(accentColorHex == item.hex ? Color.primary : Color.clear, lineWidth: 3)
                                        .padding(-4)
                                )

                            Text(item.name)
                                .font(QCTypography.captionSmall)
                                .foregroundStyle(QCColors.textSecondary)
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.vertical, QCSpacing.sm)
        } header: {
            Text("Accent Color")
        } footer: {
            Text("Choose your preferred accent color for buttons, icons, and highlights.")
                .font(QCTypography.captionSmall)
        }
    }

    private var textSizeSection: some View {
        Section {
            Picker("Text Size", selection: $fontSize) {
                Text("Small").tag("small")
                Text("Medium").tag("medium")
                Text("Large").tag("large")
            }
            .pickerStyle(.segmented)
        } header: {
            Text("Text Size")
        } footer: {
            Text("Adjust the size of text throughout the app.")
                .font(QCTypography.captionSmall)
        }
    }

    private var previewSection: some View {
        Section {
            VStack(alignment: .leading, spacing: QCSpacing.md) {
                HStack(spacing: QCSpacing.md) {
                    Image(systemName: "heart.fill")
                        .font(.system(size: 32))
                        .foregroundStyle(selectedAccentColor)

                    VStack(alignment: .leading, spacing: QCSpacing.xs) {
                        Text("Preview")
                            .font(previewTitleFont)
                            .foregroundStyle(QCColors.textPrimary)

                        Text("This is how your app will look with these settings.")
                            .font(previewBodyFont)
                            .foregroundStyle(QCColors.textSecondary)
                    }
                }

                Button(action: {}) {
                    HStack {
                        Spacer()
                        Text("Sample Button")
                            .font(previewButtonFont)
                            .foregroundStyle(.white)
                        Spacer()
                    }
                    .padding(.vertical, QCSpacing.sm)
                    .background(selectedAccentColor)
                    .cornerRadius(QCSpacing.md)
                }
                .buttonStyle(.plain)
            }
            .padding(.vertical, QCSpacing.sm)
        } header: {
            Text("Preview")
        }
    }

    // MARK: - Computed Properties

    private var themeDescription: String {
        switch appearanceMode {
        case "light":
            return "Always use light mode"
        case "dark":
            return "Always use dark mode"
        default:
            return "Automatically switch between light and dark based on your device settings"
        }
    }

    private var previewTitleFont: Font {
        switch fontSize {
        case "small": return .system(size: 18, weight: .semibold)
        case "large": return .system(size: 22, weight: .semibold)
        default: return .system(size: 20, weight: .semibold)
        }
    }

    private var previewBodyFont: Font {
        switch fontSize {
        case "small": return .system(size: 13)
        case "large": return .system(size: 17)
        default: return .system(size: 15)
        }
    }

    private var previewButtonFont: Font {
        switch fontSize {
        case "small": return .system(size: 14, weight: .semibold)
        case "large": return .system(size: 18, weight: .semibold)
        default: return .system(size: 16, weight: .semibold)
        }
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        AppearanceView()
    }
}
