//
//  QCAnimations.swift
//  QualityControl
//
//  Week 2: Design System
//  Animation presets and timing curves
//

import SwiftUI

/// QualityControl animation system
/// Consistent timing and easing for smooth interactions
struct QCAnimations {

    // MARK: - Duration Constants

    /// Extra fast duration (0.15s) - For micro-interactions
    static let durationFast: Double = 0.15

    /// Standard duration (0.3s) - Default for most animations
    static let durationMedium: Double = 0.3

    /// Slow duration (0.5s) - For complex transitions
    static let durationSlow: Double = 0.5

    /// Extra slow duration (0.8s) - For dramatic effects
    static let durationExtraSlow: Double = 0.8

    // MARK: - Easing Curves

    /// Spring animation - Natural, bouncy feel
    static let spring = Animation.spring(response: 0.4, dampingFraction: 0.7, blendDuration: 0)

    /// Smooth spring - Less bouncy, more controlled
    static let smoothSpring = Animation.spring(response: 0.3, dampingFraction: 0.8, blendDuration: 0)

    /// Ease out - Fast start, slow end (most common)
    static let easeOut = Animation.easeOut(duration: durationMedium)

    /// Ease in - Slow start, fast end
    static let easeIn = Animation.easeIn(duration: durationMedium)

    /// Ease in-out - Smooth both ends
    static let easeInOut = Animation.easeInOut(duration: durationMedium)

    /// Linear - Constant speed
    static let linear = Animation.linear(duration: durationMedium)

    // MARK: - Common Animation Presets

    /// Button press animation (quick spring)
    static let buttonPress = Animation.spring(response: 0.2, dampingFraction: 0.6)

    /// Card appearance (smooth ease out)
    static let cardAppear = Animation.easeOut(duration: durationMedium)

    /// Modal presentation (spring with slight bounce)
    static let modalPresent = Animation.spring(response: 0.4, dampingFraction: 0.75)

    /// Page transition (smooth ease in-out)
    static let pageTransition = Animation.easeInOut(duration: durationMedium)

    /// Loading indicator (linear, repeating)
    static let loading = Animation.linear(duration: 1.0).repeatForever(autoreverses: false)

    /// Fade in/out (ease in-out)
    static let fade = Animation.easeInOut(duration: durationFast)

    /// Slide in/out (ease out)
    static let slide = Animation.easeOut(duration: durationMedium)

    /// Success feedback (bouncy spring)
    static let success = Animation.spring(response: 0.3, dampingFraction: 0.6)

    /// Error shake (quick spring)
    static let errorShake = Animation.spring(response: 0.15, dampingFraction: 0.3)

    // MARK: - Delay Helpers

    /// Create staggered animation delay for list items
    /// - Parameter index: Item index in list
    /// - Parameter baseDelay: Base delay before first item (default: 0)
    /// - Parameter increment: Delay increment per item (default: 0.05s)
    /// - Returns: Total delay for item at index
    static func staggerDelay(for index: Int, baseDelay: Double = 0, increment: Double = 0.05) -> Double {
        return baseDelay + (Double(index) * increment)
    }
}

// MARK: - View Extensions

extension View {
    /// Apply button press animation on tap
    func qcButtonPressAnimation(isPressed: Bool) -> some View {
        self
            .scaleEffect(isPressed ? 0.95 : 1.0)
            .animation(QCAnimations.buttonPress, value: isPressed)
    }

    /// Apply fade in animation with optional delay
    func qcFadeIn(delay: Double = 0) -> some View {
        self
            .opacity(1.0)
            .animation(QCAnimations.fade.delay(delay), value: true)
    }

    /// Apply slide up transition
    func qcSlideUp() -> some View {
        self
            .transition(.move(edge: .bottom).combined(with: .opacity))
    }

    /// Apply slide down transition
    func qcSlideDown() -> some View {
        self
            .transition(.move(edge: .top).combined(with: .opacity))
    }

    /// Apply scale transition (grow/shrink)
    func qcScaleTransition() -> some View {
        self
            .transition(.scale.combined(with: .opacity))
    }
}

// MARK: - Transition Presets

extension AnyTransition {
    /// Card appearance transition (slide up + fade)
    static var qcCardAppear: AnyTransition {
        .asymmetric(
            insertion: .move(edge: .bottom).combined(with: .opacity),
            removal: .opacity
        )
    }

    /// Modal presentation transition (slide up)
    static var qcModalPresent: AnyTransition {
        .move(edge: .bottom)
    }

    /// Sheet presentation transition (slide up + fade)
    static var qcSheetPresent: AnyTransition {
        .asymmetric(
            insertion: .move(edge: .bottom).combined(with: .opacity),
            removal: .move(edge: .bottom).combined(with: .opacity)
        )
    }

    /// Fade transition
    static var qcFade: AnyTransition {
        .opacity
    }

    /// Scale and fade transition
    static var qcScaleFade: AnyTransition {
        .scale(scale: 0.8).combined(with: .opacity)
    }
}

// MARK: - Preview

#Preview("QCAnimations Demo") {
    AnimationDemoView()
}

// MARK: - Preview Demo View

private struct AnimationDemoView: View {
    @State private var showCard = false
    @State private var showModal = false
    @State private var isPressed = false
    @State private var showList = false
    @State private var rotate = false

    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                // Button Press Animation
                AnimationDemo(title: "Button Press") {
                    Button(action: {
                        isPressed.toggle()
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                            isPressed = false
                        }
                    }) {
                        Text("Press Me")
                            .font(QCTypography.button)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: QCSpacing.buttonHeight)
                            .background(QCColors.primary)
                            .qcButtonCornerRadius()
                    }
                    .qcButtonPressAnimation(isPressed: isPressed)
                }

                // Card Appearance
                AnimationDemo(title: "Card Appearance") {
                    Button("Toggle Card") {
                        withAnimation(QCAnimations.cardAppear) {
                            showCard.toggle()
                        }
                    }

                    if showCard {
                        RoundedRectangle(cornerRadius: QCSpacing.radiusMD)
                            .fill(QCColors.surfaceCard)
                            .frame(height: 100)
                            .overlay(
                                Text("Card Content")
                                    .foregroundColor(QCColors.textPrimary)
                            )
                            .transition(.qcCardAppear)
                    }
                }

                // Staggered List
                AnimationDemo(title: "Staggered List") {
                    Button("Toggle List") {
                        showList.toggle()
                    }

                    if showList {
                        VStack(spacing: 8) {
                            ForEach(0..<5, id: \.self) { index in
                                RoundedRectangle(cornerRadius: QCSpacing.radiusSM)
                                    .fill(QCColors.primary.opacity(0.8))
                                    .frame(height: 44)
                                    .overlay(
                                        Text("Item \(index + 1)")
                                            .foregroundColor(.white)
                                    )
                                    .transition(.asymmetric(
                                        insertion: .move(edge: .leading).combined(with: .opacity),
                                        removal: .opacity
                                    ))
                                    .animation(
                                        QCAnimations.slide.delay(QCAnimations.staggerDelay(for: index)),
                                        value: showList
                                    )
                            }
                        }
                    }
                }

                // Loading Animation
                AnimationDemo(title: "Loading Indicator") {
                    HStack(spacing: 8) {
                        ForEach(0..<3) { index in
                            Circle()
                                .fill(QCColors.primary)
                                .frame(width: 12, height: 12)
                                .offset(y: rotate ? -10 : 10)
                                .animation(
                                    Animation.easeInOut(duration: 0.5)
                                        .repeatForever(autoreverses: true)
                                        .delay(Double(index) * 0.15),
                                    value: rotate
                                )
                        }
                    }
                    .onAppear {
                        rotate = true
                    }
                }
            }
            .padding()
        }
        .navigationTitle("Animation Presets")
    }
}

private struct AnimationDemo<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(QCTypography.heading6)
                .foregroundColor(QCColors.textPrimary)

            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
