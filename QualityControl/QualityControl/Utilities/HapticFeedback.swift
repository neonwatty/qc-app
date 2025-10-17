//
//  HapticFeedback.swift
//  QualityControl
//
//  Week 4: Haptic Feedback System
//  Centralized haptic feedback for better UX
//

import UIKit

/// Haptic feedback manager for consistent tactile responses
enum HapticFeedback {

    // MARK: - Feedback Generators

    private static let impactLight = UIImpactFeedbackGenerator(style: .light)
    private static let impactMedium = UIImpactFeedbackGenerator(style: .medium)
    private static let impactHeavy = UIImpactFeedbackGenerator(style: .heavy)
    private static let notificationGenerator = UINotificationFeedbackGenerator()
    private static let selectionGenerator = UISelectionFeedbackGenerator()

    // MARK: - Public Methods

    /// Triggers a success haptic feedback
    /// Use for: Completing actions, saving data, successful operations
    static func success() {
        notificationGenerator.prepare()
        notificationGenerator.notificationOccurred(.success)
    }

    /// Triggers a warning haptic feedback
    /// Use for: Destructive actions (like delete), important warnings
    static func warning() {
        notificationGenerator.prepare()
        notificationGenerator.notificationOccurred(.warning)
    }

    /// Triggers an error haptic feedback
    /// Use for: Failed operations, errors, validation failures
    static func error() {
        notificationGenerator.prepare()
        notificationGenerator.notificationOccurred(.error)
    }

    /// Triggers a light impact haptic feedback
    /// Use for: Taps, button presses, light interactions
    static func lightImpact() {
        impactLight.prepare()
        impactLight.impactOccurred()
    }

    /// Triggers a medium impact haptic feedback
    /// Use for: Moderate interactions, card dismissals
    static func mediumImpact() {
        impactMedium.prepare()
        impactMedium.impactOccurred()
    }

    /// Triggers a heavy impact haptic feedback
    /// Use for: Major state changes, important actions
    static func heavyImpact() {
        impactHeavy.prepare()
        impactHeavy.impactOccurred()
    }

    /// Triggers a selection haptic feedback
    /// Use for: Selecting items, toggling switches, picker changes
    static func selection() {
        selectionGenerator.prepare()
        selectionGenerator.selectionChanged()
    }
}
