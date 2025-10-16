//
//  QCAnimationsTests.swift
//  QualityControlTests
//
//  Week 2: Design System Tests
//  Unit tests for QCAnimations design token
//

import XCTest
import SwiftUI
@testable import QualityControl

final class QCAnimationsTests: XCTestCase {

    // MARK: - Duration Tests

    func testDurationValues() {
        XCTAssertEqual(QCAnimations.durationFast, 0.15)
        XCTAssertEqual(QCAnimations.durationMedium, 0.3)
        XCTAssertEqual(QCAnimations.durationSlow, 0.5)
        XCTAssertEqual(QCAnimations.durationExtraSlow, 0.8)
    }

    func testDurationHierarchy() {
        XCTAssertLessThan(QCAnimations.durationFast, QCAnimations.durationMedium)
        XCTAssertLessThan(QCAnimations.durationMedium, QCAnimations.durationSlow)
        XCTAssertLessThan(QCAnimations.durationSlow, QCAnimations.durationExtraSlow)
    }

    // MARK: - Animation Preset Tests

    func testSpringAnimationExists() {
        XCTAssertNotNil(QCAnimations.spring)
    }

    func testSmoothSpringAnimationExists() {
        XCTAssertNotNil(QCAnimations.smoothSpring)
    }

    func testEaseOutAnimationExists() {
        XCTAssertNotNil(QCAnimations.easeOut)
    }

    func testButtonPressAnimationExists() {
        XCTAssertNotNil(QCAnimations.buttonPress)
    }

    func testCardAppearAnimationExists() {
        XCTAssertNotNil(QCAnimations.cardAppear)
    }

    func testModalPresentAnimationExists() {
        XCTAssertNotNil(QCAnimations.modalPresent)
    }

    func testFadeAnimationExists() {
        XCTAssertNotNil(QCAnimations.fade)
    }

    func testSlideAnimationExists() {
        XCTAssertNotNil(QCAnimations.slide)
    }

    // MARK: - Transition Tests

    func testScaleFadeTransitionExists() {
        let transition = AnyTransition.qcScaleFade
        XCTAssertNotNil(transition)
    }

    func testCardAppearTransitionExists() {
        let transition = AnyTransition.qcCardAppear
        XCTAssertNotNil(transition)
    }

    // MARK: - Stagger Delay Tests

    func testStaggerDelayWithDefaults() {
        let delay0 = QCAnimations.staggerDelay(for: 0)
        let delay1 = QCAnimations.staggerDelay(for: 1)
        let delay2 = QCAnimations.staggerDelay(for: 2)

        XCTAssertEqual(delay0, 0.0)
        XCTAssertEqual(delay1, 0.05)
        XCTAssertEqual(delay2, 0.10)
    }

    func testStaggerDelayWithCustomBaseDelay() {
        let delay0 = QCAnimations.staggerDelay(for: 0, baseDelay: 0.1)
        let delay1 = QCAnimations.staggerDelay(for: 1, baseDelay: 0.1)

        XCTAssertEqual(delay0, 0.1, accuracy: 0.0001)
        XCTAssertEqual(delay1, 0.15, accuracy: 0.0001)
    }

    func testStaggerDelayWithCustomIncrement() {
        let delay0 = QCAnimations.staggerDelay(for: 0, increment: 0.1)
        let delay1 = QCAnimations.staggerDelay(for: 1, increment: 0.1)

        XCTAssertEqual(delay0, 0.0)
        XCTAssertEqual(delay1, 0.1)
    }

    func testStaggerDelayIncreases() {
        let delay0 = QCAnimations.staggerDelay(for: 0)
        let delay1 = QCAnimations.staggerDelay(for: 1)
        let delay2 = QCAnimations.staggerDelay(for: 2)

        XCTAssertLessThan(delay0, delay1)
        XCTAssertLessThan(delay1, delay2)
    }
}
