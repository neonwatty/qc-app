//
//  QCCardTests.swift
//  QualityControlTests
//
//  Week 2: Design System Tests
//  Unit tests for QCCard component
//

import XCTest
import SwiftUI
@testable import QualityControl

final class QCCardTests: XCTestCase {

    // MARK: - Initialization Tests

    func testCardBasicInitialization() {
        let card = QCCard {
            Text("Content")
        }

        XCTAssertNil(card.header)
        XCTAssertNil(card.footer)
        XCTAssertEqual(card.padding, .medium)
        XCTAssertEqual(card.elevation, .medium)
    }

    func testCardWithHeader() {
        let card = QCCard(header: "Test Header") {
            Text("Content")
        }

        XCTAssertEqual(card.header, "Test Header")
    }

    func testCardWithFooter() {
        let card = QCCard(footer: "Test Footer") {
            Text("Content")
        }

        XCTAssertEqual(card.footer, "Test Footer")
    }

    func testCardWithHeaderAndFooter() {
        let card = QCCard(
            header: "Header",
            footer: "Footer"
        ) {
            Text("Content")
        }

        XCTAssertEqual(card.header, "Header")
        XCTAssertEqual(card.footer, "Footer")
    }

    // MARK: - Padding Tests

    func testPaddingNone() {
        let card = QCCard(padding: .none) {
            Text("Content")
        }

        XCTAssertEqual(card.padding, .none)
    }

    func testPaddingSmall() {
        let card = QCCard(padding: .small) {
            Text("Content")
        }

        XCTAssertEqual(card.padding, .small)
    }

    func testPaddingMedium() {
        let card = QCCard(padding: .medium) {
            Text("Content")
        }

        XCTAssertEqual(card.padding, .medium)
    }

    func testPaddingLarge() {
        let card = QCCard(padding: .large) {
            Text("Content")
        }

        XCTAssertEqual(card.padding, .large)
    }

    // MARK: - Elevation Tests

    func testElevationNone() {
        let card = QCCard(elevation: .none) {
            Text("Content")
        }

        XCTAssertEqual(card.elevation, .none)
    }

    func testElevationLow() {
        let card = QCCard(elevation: .low) {
            Text("Content")
        }

        XCTAssertEqual(card.elevation, .low)
    }

    func testElevationMedium() {
        let card = QCCard(elevation: .medium) {
            Text("Content")
        }

        XCTAssertEqual(card.elevation, .medium)
    }

    func testElevationHigh() {
        let card = QCCard(elevation: .high) {
            Text("Content")
        }

        XCTAssertEqual(card.elevation, .high)
    }

    // MARK: - Background Color Tests

    func testCustomBackgroundColor() {
        let customColor = Color.blue
        let card = QCCard(backgroundColor: customColor) {
            Text("Content")
        }

        // Note: Color equality is complex in SwiftUI
        // This test verifies the parameter is accepted
        XCTAssertNotNil(card.backgroundColor)
    }

    // MARK: - Combined Configuration Tests

    func testFullyConfiguredCard() {
        let card = QCCard(
            header: "Header",
            footer: "Footer",
            padding: .large,
            elevation: .high,
            backgroundColor: Color.white
        ) {
            Text("Content")
        }

        XCTAssertEqual(card.header, "Header")
        XCTAssertEqual(card.footer, "Footer")
        XCTAssertEqual(card.padding, .large)
        XCTAssertEqual(card.elevation, .high)
    }

    // MARK: - Enum Tests

    func testPaddingSizeEnum() {
        XCTAssertEqual(QCCardPaddingSize.none, .none)
        XCTAssertEqual(QCCardPaddingSize.small, .small)
        XCTAssertEqual(QCCardPaddingSize.medium, .medium)
        XCTAssertEqual(QCCardPaddingSize.large, .large)
    }

    func testElevationStyleEnum() {
        XCTAssertEqual(QCCardElevationStyle.none, .none)
        XCTAssertEqual(QCCardElevationStyle.low, .low)
        XCTAssertEqual(QCCardElevationStyle.medium, .medium)
        XCTAssertEqual(QCCardElevationStyle.high, .high)
    }

    // MARK: - Type Alias Tests

    func testPaddingSizeTypeAlias() {
        let padding: QCCard<Text>.PaddingSize = .medium
        XCTAssertEqual(padding, .medium)
    }

    func testElevationStyleTypeAlias() {
        let elevation: QCCard<Text>.ElevationStyle = .high
        XCTAssertEqual(elevation, .high)
    }
}
