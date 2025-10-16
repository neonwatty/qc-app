//
//  QCLoadingView.swift
//  QualityControl
//
//  Week 2: Design System
//  Loading indicator with optional message - full-screen and inline variants
//

import SwiftUI

/// QualityControl loading view component
/// Displays activity indicator with optional message in full-screen or inline mode
struct QCLoadingView: View {
    // MARK: - Properties

    var message: String? = nil
    var style: LoadingStyle = .fullScreen

    // MARK: - Body

    var body: some View {
        switch style {
        case .fullScreen:
            fullScreenView
        case .inline:
            inlineView
        case .overlay:
            overlayView
        }
    }

    // MARK: - View Variants

    private var fullScreenView: some View {
        VStack(spacing: QCSpacing.lg) {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle(tint: QCColors.primary))
                .scaleEffect(1.5)

            if let message = message {
                Text(message)
                    .font(QCTypography.body)
                    .foregroundColor(QCColors.textSecondary)
                    .multilineTextAlignment(.center)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(QCColors.backgroundPrimary)
    }

    private var inlineView: some View {
        HStack(spacing: QCSpacing.md) {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle(tint: QCColors.primary))

            if let message = message {
                Text(message)
                    .font(QCTypography.body)
                    .foregroundColor(QCColors.textSecondary)
            }
        }
        .padding(QCSpacing.md)
    }

    private var overlayView: some View {
        ZStack {
            // Background overlay
            QCColors.overlay
                .ignoresSafeArea()

            // Loading content
            VStack(spacing: QCSpacing.lg) {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: QCColors.textOnPrimary))
                    .scaleEffect(1.3)

                if let message = message {
                    Text(message)
                        .font(QCTypography.body)
                        .foregroundColor(QCColors.textOnPrimary)
                        .multilineTextAlignment(.center)
                }
            }
            .padding(QCSpacing.xl)
            .background(
                RoundedRectangle(cornerRadius: QCSpacing.radiusLG)
                    .fill(Color.black.opacity(0.7))
            )
        }
    }
}

// MARK: - Loading Style

extension QCLoadingView {
    enum LoadingStyle {
        case fullScreen  // Full screen loading state
        case inline      // Inline loading (in a list, etc.)
        case overlay     // Modal overlay with semi-transparent background
    }
}

// MARK: - Convenience Initializers

extension QCLoadingView {
    /// Full-screen loading with message
    static func fullScreen(_ message: String? = nil) -> QCLoadingView {
        QCLoadingView(message: message, style: .fullScreen)
    }

    /// Inline loading with message
    static func inline(_ message: String? = nil) -> QCLoadingView {
        QCLoadingView(message: message, style: .inline)
    }

    /// Overlay loading with message
    static func overlay(_ message: String? = nil) -> QCLoadingView {
        QCLoadingView(message: message, style: .overlay)
    }
}

// MARK: - View Extension

extension View {
    /// Add loading overlay when condition is true
    func qcLoading(_ isLoading: Bool, message: String? = nil) -> some View {
        ZStack {
            self

            if isLoading {
                QCLoadingView.overlay(message)
                    .transition(.opacity)
            }
        }
        .animation(QCAnimations.fade, value: isLoading)
    }
}

// MARK: - Preview

#Preview("QCLoadingView Variants") {
    TabView {
        // Full Screen
        QCLoadingView.fullScreen("Loading your data...")
            .tabItem { Label("Full Screen", systemImage: "arrow.down.circle") }

        // Full Screen (No Message)
        QCLoadingView.fullScreen()
            .tabItem { Label("No Message", systemImage: "arrow.down.circle.fill") }

        // Inline
        ScrollView {
            VStack(spacing: 16) {
                Text("Content Above")
                    .font(.title)

                QCLoadingView.inline("Loading more...")

                Text("Content Below")
                    .font(.title)
            }
            .padding()
        }
        .tabItem { Label("Inline", systemImage: "list.bullet") }

        // Overlay
        ZStack {
            // Background content
            ScrollView {
                VStack(spacing: 16) {
                    ForEach(0..<10) { index in
                        QCCard(header: "Item \(index + 1)") {
                            Text("Some content here...")
                                .font(QCTypography.body)
                        }
                    }
                }
                .padding()
            }

            // Loading overlay
            QCLoadingView.overlay("Syncing with partner...")
        }
        .tabItem { Label("Overlay", systemImage: "square.stack.3d.up") }

        // With View Modifier
        LoadingModifierDemo()
            .tabItem { Label("Modifier", systemImage: "wand.and.stars") }
    }
}

// MARK: - Preview Demo

private struct LoadingModifierDemo: View {
    @State private var isLoading = false

    var body: some View {
        VStack(spacing: 24) {
            Text("Loading Modifier Demo")
                .font(QCTypography.heading3)

            QCButton.primary("Toggle Loading") {
                isLoading.toggle()
            }

            ScrollView {
                VStack(spacing: 16) {
                    ForEach(0..<5) { index in
                        QCCard(header: "Card \(index + 1)") {
                            Text("This content will be covered by loading overlay")
                                .font(QCTypography.body)
                        }
                    }
                }
                .padding()
            }
        }
        .qcLoading(isLoading, message: "Processing...")
    }
}
