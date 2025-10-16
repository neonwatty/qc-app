//
//  QCColorsTests.swift
//  QualityControlTests
//
//  Week 2: Design System Tests
//  Unit tests for QCColors design token
//

import XCTest
import SwiftUI
@testable import QualityControl

final class QCColorsTests: XCTestCase {

    // MARK: - Primary Colors Tests

    func testPrimaryColorExists() {
        XCTAssertNotNil(QCColors.primary)
    }

    func testSecondaryColorExists() {
        XCTAssertNotNil(QCColors.secondary)
    }

    // MARK: - Semantic Colors Tests

    func testSemanticColorsExist() {
        XCTAssertNotNil(QCColors.success)
        XCTAssertNotNil(QCColors.warning)
        XCTAssertNotNil(QCColors.error)
        XCTAssertNotNil(QCColors.info)
    }

    // MARK: - Background Colors Tests

    func testBackgroundColorsExist() {
        XCTAssertNotNil(QCColors.backgroundPrimary)
        XCTAssertNotNil(QCColors.backgroundSecondary)
        XCTAssertNotNil(QCColors.backgroundTertiary)
    }

    // MARK: - Surface Colors Tests

    func testSurfaceColorsExist() {
        XCTAssertNotNil(QCColors.surfaceCard)
        XCTAssertNotNil(QCColors.surfaceInput)
    }

    // MARK: - Text Colors Tests

    func testTextColorsExist() {
        XCTAssertNotNil(QCColors.textPrimary)
        XCTAssertNotNil(QCColors.textSecondary)
        XCTAssertNotNil(QCColors.textTertiary)
        XCTAssertNotNil(QCColors.textDisabled)
        XCTAssertNotNil(QCColors.textOnPrimary)
    }

    // MARK: - Border Colors Tests

    func testBorderColorsExist() {
        XCTAssertNotNil(QCColors.border)
        XCTAssertNotNil(QCColors.borderSubtle)
    }

    // MARK: - Utility Colors Tests

    func testUtilityColorsExist() {
        XCTAssertNotNil(QCColors.overlay)
    }

    // MARK: - Hex Initializer Tests

    func testHexInitializerWithValidHex() {
        let color = Color(hex: "#EC4899")
        XCTAssertNotNil(color)
    }

    func testHexInitializerWithoutHash() {
        let color = Color(hex: "EC4899")
        XCTAssertNotNil(color)
    }

    func testHexInitializerWithShortHex() {
        let color = Color(hex: "FFF")
        XCTAssertNotNil(color)
    }
}
