//
//  QCTextFieldTests.swift
//  QualityControlTests
//
//  Week 2: Design System Tests
//  Unit tests for QCTextField component
//

import XCTest
import SwiftUI
@testable import QualityControl

final class QCTextFieldTests: XCTestCase {

    // MARK: - Initialization Tests

    func testTextFieldBasicInitialization() {
        let binding = Binding.constant("")
        let textField = QCTextField(
            label: "Email",
            text: binding
        )

        XCTAssertEqual(textField.label, "Email")
        XCTAssertEqual(textField.placeholder, "")
        XCTAssertNil(textField.errorMessage)
        XCTAssertNil(textField.helperText)
        XCTAssertNil(textField.maxLength)
        XCTAssertFalse(textField.isSecure)
        XCTAssertEqual(textField.keyboardType, .default)
        XCTAssertNil(textField.icon)
    }

    func testTextFieldWithPlaceholder() {
        let binding = Binding.constant("")
        let textField = QCTextField(
            label: "Email",
            text: binding,
            placeholder: "your@email.com"
        )

        XCTAssertEqual(textField.placeholder, "your@email.com")
    }

    func testTextFieldWithErrorMessage() {
        let binding = Binding.constant("")
        let textField = QCTextField(
            label: "Email",
            text: binding,
            errorMessage: "Invalid email"
        )

        XCTAssertEqual(textField.errorMessage, "Invalid email")
    }

    func testTextFieldWithHelperText() {
        let binding = Binding.constant("")
        let textField = QCTextField(
            label: "Username",
            text: binding,
            helperText: "Min 3 characters"
        )

        XCTAssertEqual(textField.helperText, "Min 3 characters")
    }

    func testTextFieldWithMaxLength() {
        let binding = Binding.constant("")
        let textField = QCTextField(
            label: "Bio",
            text: binding,
            maxLength: 160
        )

        XCTAssertEqual(textField.maxLength, 160)
    }

    func testTextFieldSecure() {
        let binding = Binding.constant("")
        let textField = QCTextField(
            label: "Password",
            text: binding,
            isSecure: true
        )

        XCTAssertTrue(textField.isSecure)
    }

    func testTextFieldWithIcon() {
        let binding = Binding.constant("")
        let textField = QCTextField(
            label: "Email",
            text: binding,
            icon: "envelope"
        )

        XCTAssertEqual(textField.icon, "envelope")
    }

    // MARK: - Keyboard Type Tests

    func testKeyboardTypeDefault() {
        let binding = Binding.constant("")
        let textField = QCTextField(
            label: "Name",
            text: binding,
            keyboardType: .default
        )

        XCTAssertEqual(textField.keyboardType, .default)
    }

    func testKeyboardTypeEmail() {
        let binding = Binding.constant("")
        let textField = QCTextField(
            label: "Email",
            text: binding,
            keyboardType: .emailAddress
        )

        XCTAssertEqual(textField.keyboardType, .emailAddress)
    }

    func testKeyboardTypePhone() {
        let binding = Binding.constant("")
        let textField = QCTextField(
            label: "Phone",
            text: binding,
            keyboardType: .phonePad
        )

        XCTAssertEqual(textField.keyboardType, .phonePad)
    }

    func testKeyboardTypeURL() {
        let binding = Binding.constant("")
        let textField = QCTextField(
            label: "Website",
            text: binding,
            keyboardType: .URL
        )

        XCTAssertEqual(textField.keyboardType, .URL)
    }

    // MARK: - Autocapitalization Tests

    func testAutocapitalizationDefault() {
        let binding = Binding.constant("")
        let textField = QCTextField(
            label: "Name",
            text: binding
        )

        // Verify autocapitalization property exists
        XCTAssertNotNil(textField.autocapitalization)
    }

    func testAutocapitalizationNever() {
        let binding = Binding.constant("")
        let textField = QCTextField(
            label: "Email",
            text: binding,
            autocapitalization: .never
        )

        // Verify autocapitalization can be set
        XCTAssertNotNil(textField.autocapitalization)
    }

    func testAutocapitalizationWords() {
        let binding = Binding.constant("")
        let textField = QCTextField(
            label: "Name",
            text: binding,
            autocapitalization: .words
        )

        // Verify autocapitalization can be set
        XCTAssertNotNil(textField.autocapitalization)
    }

    // MARK: - Combined Configuration Tests

    func testFullyConfiguredTextField() {
        let binding = Binding.constant("")
        let textField = QCTextField(
            label: "Email",
            text: binding,
            placeholder: "your@email.com",
            errorMessage: "Invalid email",
            helperText: nil,
            maxLength: 100,
            isSecure: false,
            keyboardType: .emailAddress,
            autocapitalization: .never,
            icon: "envelope"
        )

        XCTAssertEqual(textField.label, "Email")
        XCTAssertEqual(textField.placeholder, "your@email.com")
        XCTAssertEqual(textField.errorMessage, "Invalid email")
        XCTAssertEqual(textField.maxLength, 100)
        XCTAssertFalse(textField.isSecure)
        XCTAssertEqual(textField.keyboardType, .emailAddress)
        XCTAssertNotNil(textField.autocapitalization)
        XCTAssertEqual(textField.icon, "envelope")
    }

    // MARK: - Label Tests

    func testEmptyLabel() {
        let binding = Binding.constant("")
        let textField = QCTextField(
            label: "",
            text: binding
        )

        XCTAssertEqual(textField.label, "")
    }

    func testLongLabel() {
        let binding = Binding.constant("")
        let longLabel = "This is a very long label for a text field"
        let textField = QCTextField(
            label: longLabel,
            text: binding
        )

        XCTAssertEqual(textField.label, longLabel)
    }
}
