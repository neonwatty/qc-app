//
//  QCSpacingTests.swift
//  QualityControlTests
//
//  Week 2: Design System Tests
//  Unit tests for QCSpacing design token
//

import XCTest
import SwiftUI
@testable import QualityControl

final class QCSpacingTests: XCTestCase {

    // MARK: - Spacing Scale Tests

    func testSpacingScaleExists() {
        XCTAssertEqual(QCSpacing.xxs, 4)
        XCTAssertEqual(QCSpacing.xs, 8)
        XCTAssertEqual(QCSpacing.sm, 12)
        XCTAssertEqual(QCSpacing.md, 16)
        XCTAssertEqual(QCSpacing.lg, 24)
        XCTAssertEqual(QCSpacing.xl, 32)
        XCTAssertEqual(QCSpacing.xxl, 48)
        XCTAssertEqual(QCSpacing.xxxl, 64)
    }

    func testSpacingScaleIncreases() {
        // Verify spacing values increase
        XCTAssertLessThan(QCSpacing.xxs, QCSpacing.xs)
        XCTAssertLessThan(QCSpacing.xs, QCSpacing.sm)
        XCTAssertLessThan(QCSpacing.sm, QCSpacing.md)
        XCTAssertLessThan(QCSpacing.md, QCSpacing.lg)
        XCTAssertLessThan(QCSpacing.lg, QCSpacing.xl)
        XCTAssertLessThan(QCSpacing.xl, QCSpacing.xxl)
        XCTAssertLessThan(QCSpacing.xxl, QCSpacing.xxxl)
    }

    // MARK: - Corner Radius Tests

    func testCornerRadiusValues() {
        XCTAssertEqual(QCSpacing.radiusXS, 4)
        XCTAssertEqual(QCSpacing.radiusSM, 8)
        XCTAssertEqual(QCSpacing.radiusMD, 12)
        XCTAssertEqual(QCSpacing.radiusLG, 16)
        XCTAssertEqual(QCSpacing.radiusXL, 24)
        XCTAssertEqual(QCSpacing.radiusFull, 9999)
    }

    // MARK: - Component-Specific Spacing Tests

    func testButtonHeightValues() {
        XCTAssertEqual(QCSpacing.buttonHeightSmall, 36)
        XCTAssertEqual(QCSpacing.buttonHeight, 48)
        XCTAssertEqual(QCSpacing.buttonHeightLarge, 56)

        // Verify hierarchy
        XCTAssertLessThan(QCSpacing.buttonHeightSmall, QCSpacing.buttonHeight)
        XCTAssertLessThan(QCSpacing.buttonHeight, QCSpacing.buttonHeightLarge)
    }

    func testInputHeightValue() {
        XCTAssertEqual(QCSpacing.inputHeight, 48)
    }

    func testPaddingPresetsExist() {
        // Verify padding presets are EdgeInsets
        XCTAssertNotNil(QCSpacing.cardPadding)
        XCTAssertNotNil(QCSpacing.screenPadding)
        XCTAssertNotNil(QCSpacing.listItemPadding)
        XCTAssertNotNil(QCSpacing.sectionPadding)
    }

    // MARK: - Icon Size Tests

    func testIconSizeValues() {
        XCTAssertEqual(QCSpacing.iconSizeSmall, 16)
        XCTAssertEqual(QCSpacing.iconSize, 24)
        XCTAssertEqual(QCSpacing.iconSizeLarge, 32)
        XCTAssertEqual(QCSpacing.iconSizeXL, 48)

        // Verify hierarchy
        XCTAssertLessThan(QCSpacing.iconSizeSmall, QCSpacing.iconSize)
        XCTAssertLessThan(QCSpacing.iconSize, QCSpacing.iconSizeLarge)
        XCTAssertLessThan(QCSpacing.iconSizeLarge, QCSpacing.iconSizeXL)
    }

    // MARK: - Base Unit Test

    func testFourPointBaseUnit() {
        // Verify all spacing values are multiples of 4
        XCTAssertEqual(QCSpacing.xxs.truncatingRemainder(dividingBy: 4), 0)
        XCTAssertEqual(QCSpacing.xs.truncatingRemainder(dividingBy: 4), 0)
        XCTAssertEqual(QCSpacing.sm.truncatingRemainder(dividingBy: 4), 0)
        XCTAssertEqual(QCSpacing.md.truncatingRemainder(dividingBy: 4), 0)
        XCTAssertEqual(QCSpacing.lg.truncatingRemainder(dividingBy: 4), 0)
        XCTAssertEqual(QCSpacing.xl.truncatingRemainder(dividingBy: 4), 0)
        XCTAssertEqual(QCSpacing.xxl.truncatingRemainder(dividingBy: 4), 0)
        XCTAssertEqual(QCSpacing.xxxl.truncatingRemainder(dividingBy: 4), 0)
    }
}
