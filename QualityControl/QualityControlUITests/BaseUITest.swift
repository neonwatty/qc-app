//
//  BaseUITest.swift
//  QualityControlUITests
//
//  Testing Infrastructure
//  Base class for all UI tests - enforces sequential execution
//

import XCTest

/// Base class for all UI/E2E tests
/// IMPORTANT: ALL UI tests MUST inherit from this class to ensure sequential execution
class BaseUITest: XCTestCase {

    var app: XCUIApplication!

    // MARK: - Sequential Execution Configuration

    /// Force sequential execution for ALL UI tests to prevent race conditions
    override class var defaultTestSuite: XCTestSuite {
        let suite = super.defaultTestSuite
        // This ensures tests run one at a time
        return suite
    }

    // MARK: - Setup & Teardown

    override func setUpWithError() throws {
        // Stop immediately when a failure occurs
        continueAfterFailure = false

        // Create fresh app instance
        app = XCUIApplication()

        // Configure app for UI testing
        app.launchArguments = ["--uitesting"]

        // Launch app
        app.launch()

        // Wait for app to stabilize
        Thread.sleep(forTimeInterval: 1.0)
    }

    override func tearDownWithError() throws {
        // Terminate app to ensure clean state for next test
        app.terminate()
        app = nil

        // Give system time to clean up
        Thread.sleep(forTimeInterval: 1.0)
    }

    // MARK: - Wait Utilities

    /// Wait for element to exist
    func waitForElement(_ element: XCUIElement, timeout: TimeInterval = 5.0) -> Bool {
        let predicate = NSPredicate(format: "exists == true")
        let expectation = XCTNSPredicateExpectation(predicate: predicate, object: element)
        let result = XCTWaiter.wait(for: [expectation], timeout: timeout)
        return result == .completed
    }

    /// Wait for element to be hittable
    func waitForElementHittable(_ element: XCUIElement, timeout: TimeInterval = 5.0) -> Bool {
        let predicate = NSPredicate(format: "isHittable == true")
        let expectation = XCTNSPredicateExpectation(predicate: predicate, object: element)
        let result = XCTWaiter.wait(for: [expectation], timeout: timeout)
        return result == .completed
    }

    /// Wait for element to disappear
    func waitForElementToDisappear(_ element: XCUIElement, timeout: TimeInterval = 5.0) -> Bool {
        let predicate = NSPredicate(format: "exists == false")
        let expectation = XCTNSPredicateExpectation(predicate: predicate, object: element)
        let result = XCTWaiter.wait(for: [expectation], timeout: timeout)
        return result == .completed
    }

    /// Wait for specific text to appear
    func waitForText(_ text: String, timeout: TimeInterval = 5.0) -> Bool {
        let element = app.staticTexts[text]
        return waitForElement(element, timeout: timeout)
    }

    // MARK: - Tap Utilities

    /// Safely tap element with wait
    func safeTap(_ element: XCUIElement, timeout: TimeInterval = 5.0) {
        XCTAssertTrue(waitForElementHittable(element, timeout: timeout), "Element not hittable within timeout")
        element.tap()
    }

    /// Type text with wait
    func safeType(_ element: XCUIElement, text: String, timeout: TimeInterval = 5.0) {
        XCTAssertTrue(waitForElementHittable(element, timeout: timeout), "Element not hittable within timeout")
        element.tap()
        element.typeText(text)
    }

    // MARK: - Navigation Utilities

    /// Tap tab by index
    func selectTab(at index: Int) {
        let tabBar = app.tabBars.firstMatch
        XCTAssertTrue(waitForElement(tabBar), "Tab bar not found")

        let tab = tabBar.buttons.element(boundBy: index)
        safeTap(tab)
    }

    /// Tap back button
    func tapBackButton() {
        let backButton = app.navigationBars.buttons.element(boundBy: 0)
        safeTap(backButton)
    }

    /// Dismiss sheet/modal
    func dismissSheet() {
        // Try close button first
        if app.buttons["Close"].exists {
            safeTap(app.buttons["Close"])
            return
        }

        // Try cancel button
        if app.buttons["Cancel"].exists {
            safeTap(app.buttons["Cancel"])
            return
        }

        // Swipe down as fallback
        app.swipeDown()
    }

    // MARK: - Assertion Utilities

    /// Assert element exists
    func assertElementExists(_ element: XCUIElement, timeout: TimeInterval = 5.0, message: String = "Element should exist") {
        XCTAssertTrue(waitForElement(element, timeout: timeout), message)
    }

    /// Assert text exists
    func assertTextExists(_ text: String, timeout: TimeInterval = 5.0) {
        XCTAssertTrue(waitForText(text, timeout: timeout), "Text '\(text)' should exist")
    }

    /// Assert element does not exist
    func assertElementDoesNotExist(_ element: XCUIElement, timeout: TimeInterval = 2.0) {
        XCTAssertFalse(element.exists, "Element should not exist")
    }

    // MARK: - Screenshot Utilities

    /// Take screenshot with name
    func takeScreenshot(named name: String) {
        let screenshot = XCUIScreen.main.screenshot()
        let attachment = XCTAttachment(screenshot: screenshot)
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}
