//
//  XCTestExtensions.swift
//  QualityControlTests
//
//  Testing Infrastructure
//  Custom assertions and test utilities
//

import XCTest

extension XCTestCase {

    /// Unwrap optional or fail test
    func XCTUnwrap<T>(_ optional: T?, message: String = "Value was nil", file: StaticString = #file, line: UInt = #line) throws -> T {
        guard let value = optional else {
            XCTFail(message, file: file, line: line)
            throw XCTSkip("Value was nil")
        }
        return value
    }

    /// Assert that code throws a specific error
    func XCTAssertThrowsError<T, E: Error & Equatable>(
        _ expression: @autoclosure () throws -> T,
        expectedError: E,
        file: StaticString = #file,
        line: UInt = #line
    ) {
        do {
            _ = try expression()
            XCTFail("Expected error to be thrown", file: file, line: line)
        } catch let error as E {
            XCTAssertEqual(error, expectedError, "Wrong error thrown", file: file, line: line)
        } catch {
            XCTFail("Wrong error type thrown: \(error)", file: file, line: line)
        }
    }

    /// Assert that async code throws an error
    func XCTAssertThrowsErrorAsync<T>(
        _ expression: @autoclosure () async throws -> T,
        file: StaticString = #file,
        line: UInt = #line
    ) async {
        do {
            _ = try await expression()
            XCTFail("Expected error to be thrown", file: file, line: line)
        } catch {
            // Expected error was thrown
        }
    }

    /// Assert that async code does NOT throw an error
    func XCTAssertNoThrowAsync<T>(
        _ expression: @autoclosure () async throws -> T,
        file: StaticString = #file,
        line: UInt = #line
    ) async -> T? {
        do {
            return try await expression()
        } catch {
            XCTFail("Unexpected error thrown: \(error)", file: file, line: line)
            return nil
        }
    }

    /// Assert that collection is empty
    func XCTAssertEmpty<C: Collection>(
        _ collection: C,
        _ message: String = "Collection should be empty",
        file: StaticString = #file,
        line: UInt = #line
    ) {
        XCTAssertTrue(collection.isEmpty, message, file: file, line: line)
    }

    /// Assert that collection is not empty
    func XCTAssertNotEmpty<C: Collection>(
        _ collection: C,
        _ message: String = "Collection should not be empty",
        file: StaticString = #file,
        line: UInt = #line
    ) {
        XCTAssertFalse(collection.isEmpty, message, file: file, line: line)
    }

    /// Assert that collection has expected count
    func XCTAssertCount<C: Collection>(
        _ collection: C,
        _ expectedCount: Int,
        file: StaticString = #file,
        line: UInt = #line
    ) {
        XCTAssertEqual(collection.count, expectedCount, "Collection count mismatch", file: file, line: line)
    }

    /// Assert that string contains substring
    func XCTAssertContains(
        _ string: String,
        _ substring: String,
        file: StaticString = #file,
        line: UInt = #line
    ) {
        XCTAssertTrue(string.contains(substring), "\"\(string)\" does not contain \"\(substring)\"", file: file, line: line)
    }

    /// Assert that string does not contain substring
    func XCTAssertNotContains(
        _ string: String,
        _ substring: String,
        file: StaticString = #file,
        line: UInt = #line
    ) {
        XCTAssertFalse(string.contains(substring), "\"\(string)\" should not contain \"\(substring)\"", file: file, line: line)
    }

    /// Assert eventually true (polling)
    func XCTAssertEventually(
        timeout: TimeInterval = 1.0,
        pollInterval: TimeInterval = 0.1,
        file: StaticString = #file,
        line: UInt = #line,
        condition: @escaping () -> Bool
    ) {
        let expectation = XCTestExpectation(description: "Condition becomes true")

        let timer = Timer.scheduledTimer(withTimeInterval: pollInterval, repeats: true) { timer in
            if condition() {
                timer.invalidate()
                expectation.fulfill()
            }
        }

        let result = XCTWaiter.wait(for: [expectation], timeout: timeout)

        if result != .completed {
            timer.invalidate()
            XCTFail("Condition did not become true within \(timeout) seconds", file: file, line: line)
        }
    }
}
