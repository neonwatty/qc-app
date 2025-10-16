//
//  QCEmptyStateTests.swift
//  QualityControlTests
//
//  Week 2: Design System Tests
//  Unit tests for QCEmptyState component
//

import XCTest
import SwiftUI
@testable import QualityControl

final class QCEmptyStateTests: XCTestCase {

    // MARK: - Initialization Tests

    func testEmptyStateInitialization() {
        let emptyState = QCEmptyState(
            icon: "heart",
            title: "Test Title",
            subtitle: "Test Subtitle"
        )

        XCTAssertEqual(emptyState.icon, "heart")
        XCTAssertEqual(emptyState.title, "Test Title")
        XCTAssertEqual(emptyState.subtitle, "Test Subtitle")
        XCTAssertNil(emptyState.actionTitle)
        XCTAssertNil(emptyState.action)
    }

    func testEmptyStateWithAction() {
        var actionCalled = false
        let emptyState = QCEmptyState(
            icon: "star",
            title: "Title",
            subtitle: "Subtitle",
            actionTitle: "Take Action",
            action: { actionCalled = true }
        )

        XCTAssertEqual(emptyState.actionTitle, "Take Action")
        XCTAssertNotNil(emptyState.action)

        // Call the action
        emptyState.action?()
        XCTAssertTrue(actionCalled)
    }

    // MARK: - Convenience Initializer Tests

    func testNoCheckInsState() {
        let state = QCEmptyState.noCheckIns

        XCTAssertEqual(state.icon, "heart.text.square")
        XCTAssertEqual(state.title, "No Check-ins Yet")
        XCTAssertTrue(state.subtitle.contains("check-in"))
        XCTAssertEqual(state.actionTitle, "Start Check-in")
    }

    func testNoNotesState() {
        let state = QCEmptyState.noNotes

        XCTAssertEqual(state.icon, "note.text")
        XCTAssertEqual(state.title, "No Notes")
        XCTAssertTrue(state.subtitle.contains("thoughts"))
        XCTAssertEqual(state.actionTitle, "Add Note")
    }

    func testNoMilestonesState() {
        let state = QCEmptyState.noMilestones

        XCTAssertEqual(state.icon, "star")
        XCTAssertEqual(state.title, "No Milestones Yet")
        XCTAssertTrue(state.subtitle.contains("milestone"))
        XCTAssertNil(state.actionTitle)
    }

    func testNoRemindersState() {
        let state = QCEmptyState.noReminders

        XCTAssertEqual(state.icon, "bell")
        XCTAssertEqual(state.title, "No Reminders")
        XCTAssertTrue(state.subtitle.contains("reminder"))
        XCTAssertEqual(state.actionTitle, "Add Reminder")
    }

    func testNoRequestsState() {
        let state = QCEmptyState.noRequests

        XCTAssertEqual(state.icon, "envelope")
        XCTAssertEqual(state.title, "No Requests")
        XCTAssertTrue(state.subtitle.contains("request"))
        XCTAssertEqual(state.actionTitle, "New Request")
    }

    func testNoSearchResultsState() {
        let query = "love languages"
        let state = QCEmptyState.noSearchResults(query: query)

        XCTAssertEqual(state.icon, "magnifyingglass")
        XCTAssertEqual(state.title, "No Results")
        XCTAssertTrue(state.subtitle.contains(query))
        XCTAssertNil(state.actionTitle)
    }

    func testNoFilteredResultsState() {
        let state = QCEmptyState.noFilteredResults

        XCTAssertEqual(state.icon, "line.3.horizontal.decrease.circle")
        XCTAssertEqual(state.title, "No Results")
        XCTAssertTrue(state.subtitle.contains("filter"))
        XCTAssertNil(state.actionTitle)
    }

    func testCustomEmptyState() {
        let state = QCEmptyState.custom(
            icon: "checkmark.circle",
            title: "Custom Title",
            subtitle: "Custom Subtitle",
            actionTitle: "Custom Action",
            action: {}
        )

        XCTAssertEqual(state.icon, "checkmark.circle")
        XCTAssertEqual(state.title, "Custom Title")
        XCTAssertEqual(state.subtitle, "Custom Subtitle")
        XCTAssertEqual(state.actionTitle, "Custom Action")
        XCTAssertNotNil(state.action)
    }

    // MARK: - Action Behavior Tests

    func testActionExecutes() {
        var executionCount = 0
        let state = QCEmptyState.custom(
            icon: "star",
            title: "Title",
            subtitle: "Subtitle",
            actionTitle: "Action",
            action: { executionCount += 1 }
        )

        XCTAssertEqual(executionCount, 0)
        state.action?()
        XCTAssertEqual(executionCount, 1)
        state.action?()
        XCTAssertEqual(executionCount, 2)
    }
}
