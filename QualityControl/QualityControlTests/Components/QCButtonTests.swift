//
//  QCButtonTests.swift
//  QualityControlTests
//
//  Week 2: Design System Tests
//  Unit tests for QCButton component
//

import XCTest
import SwiftUI
@testable import QualityControl

final class QCButtonTests: XCTestCase {

    // MARK: - Initialization Tests

    func testButtonInitialization() {
        let button = QCButton(
            title: "Test Button",
            action: {},
            variant: .primary,
            size: .medium
        )

        XCTAssertEqual(button.title, "Test Button")
        XCTAssertEqual(button.variant, .primary)
        XCTAssertEqual(button.size, .medium)
        XCTAssertFalse(button.isLoading)
        XCTAssertFalse(button.isDisabled)
        XCTAssertNil(button.icon)
    }

    func testButtonWithIcon() {
        let button = QCButton(
            title: "Button",
            action: {},
            icon: "heart.fill"
        )

        XCTAssertEqual(button.icon, "heart.fill")
    }

    func testButtonLoadingState() {
        let button = QCButton(
            title: "Loading",
            action: {},
            isLoading: true
        )

        XCTAssertTrue(button.isLoading)
    }

    func testButtonDisabledState() {
        let button = QCButton(
            title: "Disabled",
            action: {},
            isDisabled: true
        )

        XCTAssertTrue(button.isDisabled)
    }

    // MARK: - Variant Tests

    func testPrimaryVariant() {
        let button = QCButton(
            title: "Primary",
            action: {},
            variant: .primary
        )

        XCTAssertEqual(button.variant, .primary)
    }

    func testSecondaryVariant() {
        let button = QCButton(
            title: "Secondary",
            action: {},
            variant: .secondary
        )

        XCTAssertEqual(button.variant, .secondary)
    }

    func testTertiaryVariant() {
        let button = QCButton(
            title: "Tertiary",
            action: {},
            variant: .tertiary
        )

        XCTAssertEqual(button.variant, .tertiary)
    }

    // MARK: - Size Tests

    func testSmallSize() {
        let button = QCButton(
            title: "Small",
            action: {},
            size: .small
        )

        XCTAssertEqual(button.size, .small)
    }

    func testMediumSize() {
        let button = QCButton(
            title: "Medium",
            action: {},
            size: .medium
        )

        XCTAssertEqual(button.size, .medium)
    }

    func testLargeSize() {
        let button = QCButton(
            title: "Large",
            action: {},
            size: .large
        )

        XCTAssertEqual(button.size, .large)
    }

    // MARK: - Convenience Initializer Tests

    func testPrimaryConvenience() {
        let button = QCButton.primary("Primary") {}

        XCTAssertEqual(button.variant, .primary)
        XCTAssertEqual(button.size, .medium)
    }

    func testSecondaryConvenience() {
        let button = QCButton.secondary("Secondary") {}

        XCTAssertEqual(button.variant, .secondary)
        XCTAssertEqual(button.size, .medium)
    }

    func testTertiaryConvenience() {
        let button = QCButton.tertiary("Tertiary") {}

        XCTAssertEqual(button.variant, .tertiary)
        XCTAssertEqual(button.size, .medium)
    }

    func testConvenienceWithIcon() {
        let button = QCButton.primary("With Icon", icon: "star.fill") {}

        XCTAssertEqual(button.icon, "star.fill")
    }

    func testConvenienceWithSize() {
        let button = QCButton.primary("Large", size: .large) {}

        XCTAssertEqual(button.size, .large)
    }

    func testConvenienceWithLoading() {
        let button = QCButton.primary("Loading", isLoading: true) {}

        XCTAssertTrue(button.isLoading)
    }

    func testConvenienceWithDisabled() {
        let button = QCButton.primary("Disabled", isDisabled: true) {}

        XCTAssertTrue(button.isDisabled)
    }

    // MARK: - Enum Tests

    func testButtonVariantEnum() {
        XCTAssertEqual(QCButton.Variant.primary, .primary)
        XCTAssertEqual(QCButton.Variant.secondary, .secondary)
        XCTAssertEqual(QCButton.Variant.tertiary, .tertiary)
    }

    func testButtonSizeEnum() {
        XCTAssertEqual(QCButton.Size.small, .small)
        XCTAssertEqual(QCButton.Size.medium, .medium)
        XCTAssertEqual(QCButton.Size.large, .large)
    }
}
