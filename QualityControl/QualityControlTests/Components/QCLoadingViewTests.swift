//
//  QCLoadingViewTests.swift
//  QualityControlTests
//
//  Week 2: Design System Tests
//  Unit tests for QCLoadingView component
//

import XCTest
import SwiftUI
@testable import QualityControl

final class QCLoadingViewTests: XCTestCase {

    // MARK: - Initialization Tests

    func testLoadingViewInitialization() {
        let loadingView = QCLoadingView()

        XCTAssertNil(loadingView.message)
        XCTAssertEqual(loadingView.style, .fullScreen)
    }

    func testLoadingViewWithMessage() {
        let loadingView = QCLoadingView(
            message: "Loading data...",
            style: .fullScreen
        )

        XCTAssertEqual(loadingView.message, "Loading data...")
        XCTAssertEqual(loadingView.style, .fullScreen)
    }

    // MARK: - Style Tests

    func testFullScreenStyle() {
        let loadingView = QCLoadingView(style: .fullScreen)

        XCTAssertEqual(loadingView.style, .fullScreen)
    }

    func testInlineStyle() {
        let loadingView = QCLoadingView(style: .inline)

        XCTAssertEqual(loadingView.style, .inline)
    }

    func testOverlayStyle() {
        let loadingView = QCLoadingView(style: .overlay)

        XCTAssertEqual(loadingView.style, .overlay)
    }

    // MARK: - Convenience Initializer Tests

    func testFullScreenConvenience() {
        let loadingView = QCLoadingView.fullScreen()

        XCTAssertEqual(loadingView.style, .fullScreen)
        XCTAssertNil(loadingView.message)
    }

    func testFullScreenConvenienceWithMessage() {
        let loadingView = QCLoadingView.fullScreen("Loading...")

        XCTAssertEqual(loadingView.style, .fullScreen)
        XCTAssertEqual(loadingView.message, "Loading...")
    }

    func testInlineConvenience() {
        let loadingView = QCLoadingView.inline()

        XCTAssertEqual(loadingView.style, .inline)
        XCTAssertNil(loadingView.message)
    }

    func testInlineConvenienceWithMessage() {
        let loadingView = QCLoadingView.inline("Processing...")

        XCTAssertEqual(loadingView.style, .inline)
        XCTAssertEqual(loadingView.message, "Processing...")
    }

    func testOverlayConvenience() {
        let loadingView = QCLoadingView.overlay()

        XCTAssertEqual(loadingView.style, .overlay)
        XCTAssertNil(loadingView.message)
    }

    func testOverlayConvenienceWithMessage() {
        let loadingView = QCLoadingView.overlay("Syncing...")

        XCTAssertEqual(loadingView.style, .overlay)
        XCTAssertEqual(loadingView.message, "Syncing...")
    }

    // MARK: - Loading Style Enum Tests

    func testLoadingStyleEnum() {
        XCTAssertEqual(QCLoadingView.LoadingStyle.fullScreen, .fullScreen)
        XCTAssertEqual(QCLoadingView.LoadingStyle.inline, .inline)
        XCTAssertEqual(QCLoadingView.LoadingStyle.overlay, .overlay)
    }

    // MARK: - Message Variations Tests

    func testEmptyMessage() {
        let loadingView = QCLoadingView(message: "", style: .fullScreen)

        XCTAssertEqual(loadingView.message, "")
    }

    func testLongMessage() {
        let longMessage = "This is a very long loading message that explains what is happening in great detail."
        let loadingView = QCLoadingView(message: longMessage, style: .fullScreen)

        XCTAssertEqual(loadingView.message, longMessage)
    }

    func testMessageWithNewlines() {
        let messageWithNewlines = "Loading data...\nPlease wait"
        let loadingView = QCLoadingView(message: messageWithNewlines, style: .fullScreen)

        XCTAssertEqual(loadingView.message, messageWithNewlines)
    }
}
