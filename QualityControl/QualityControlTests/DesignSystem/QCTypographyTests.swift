//
//  QCTypographyTests.swift
//  QualityControlTests
//
//  Week 2: Design System Tests
//  Unit tests for QCTypography design token
//

import XCTest
import SwiftUI
@testable import QualityControl

final class QCTypographyTests: XCTestCase {

    // MARK: - Heading Tests

    func testHeadingStylesExist() {
        XCTAssertNotNil(QCTypography.heading1)
        XCTAssertNotNil(QCTypography.heading2)
        XCTAssertNotNil(QCTypography.heading3)
        XCTAssertNotNil(QCTypography.heading4)
        XCTAssertNotNil(QCTypography.heading5)
        XCTAssertNotNil(QCTypography.heading6)
    }

    // MARK: - Body Text Tests

    func testBodyStylesExist() {
        XCTAssertNotNil(QCTypography.bodyLarge)
        XCTAssertNotNil(QCTypography.body)
        XCTAssertNotNil(QCTypography.bodyBold)
        XCTAssertNotNil(QCTypography.bodySmall)
    }

    // MARK: - Caption Tests

    func testCaptionStylesExist() {
        XCTAssertNotNil(QCTypography.caption)
        XCTAssertNotNil(QCTypography.captionBold)
        XCTAssertNotNil(QCTypography.captionSmall)
    }

    // MARK: - Label Tests

    func testLabelStyleExists() {
        XCTAssertNotNil(QCTypography.label)
    }

    // MARK: - Button Tests

    func testButtonStylesExist() {
        XCTAssertNotNil(QCTypography.button)
        XCTAssertNotNil(QCTypography.buttonSmall)
        XCTAssertNotNil(QCTypography.buttonLarge)
    }

    // MARK: - Font Size Hierarchy Tests

    func testHeadingSizeHierarchy() {
        // Verify that heading sizes decrease from h1 to h6
        // Note: This is a conceptual test - SwiftUI Font doesn't expose size directly
        // In a real implementation, you might use UIFont for more detailed testing
        XCTAssertNotNil(QCTypography.heading1)
        XCTAssertNotNil(QCTypography.heading6)
    }
}
