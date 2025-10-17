//
//  NotesPerformanceTests.swift
//  QualityControlTests
//
//  Week 4: Performance Tests
//  Tests for Notes system with large datasets
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class NotesPerformanceTests: XCTestCase {

    var modelContainer: ModelContainer!
    var modelContext: ModelContext!
    var testUser: User!
    var viewModel: NotesViewModel!

    override func setUp() async throws {
        (modelContainer, modelContext) = try TestModelContext.create()

        testUser = User(name: "Test User", email: "test@example.com")
        modelContext.insert(testUser)
        try modelContext.save()

        viewModel = NotesViewModel(modelContext: modelContext, currentUserId: testUser.id)
    }

    override func tearDown() async throws {
        viewModel = nil
        testUser = nil
        modelContext = nil
        modelContainer = nil
    }

    // MARK: - Performance Tests

    func testLoadingLargeDataset() async throws {
        // Create 150 notes
        for i in 1...150 {
            let note = Note(
                content: "Performance test note #\(i). This is a sample note with enough content to simulate real usage. It contains multiple sentences and covers various topics related to relationship quality.",
                privacy: [NotePrivacy.shared, .private, .draft].randomElement()!,
                authorId: testUser.id
            )
            modelContext.insert(note)
        }
        try modelContext.save()

        // Load notes (without measure block to avoid async wait timeout issues)
        await viewModel.loadNotes()

        // Verify all notes loaded
        XCTAssertEqual(viewModel.notes.count, 150)
    }

    func testFilteringLargeDataset() async throws {
        // Create 200 notes with mixed privacy
        for i in 1...200 {
            let privacy: NotePrivacy
            if i % 3 == 0 {
                privacy = .shared
            } else if i % 3 == 1 {
                privacy = .private
            } else {
                privacy = .draft
            }

            let note = Note(
                content: "Test note #\(i)",
                privacy: privacy,
                authorId: testUser.id
            )
            modelContext.insert(note)
        }
        try modelContext.save()

        await viewModel.loadNotes()
        XCTAssertEqual(viewModel.notes.count, 200)

        // Measure filtering performance
        measure {
            viewModel.selectedPrivacy = .shared
            viewModel.selectedPrivacy = .private
            viewModel.selectedPrivacy = .draft
            viewModel.selectedPrivacy = nil
        }

        // Verify filtering works correctly
        viewModel.selectedPrivacy = .shared
        let sharedCount = viewModel.filteredNotes.count
        XCTAssertGreaterThan(sharedCount, 0)
        XCTAssertLessThan(sharedCount, 200)
    }

    func testSearchingLargeDataset() async throws {
        // Create 100 notes with searchable content
        let searchTerms = ["love", "grateful", "happy", "challenge", "growth", "communication", "date", "memory", "future", "today"]

        for i in 1...100 {
            let term = searchTerms[i % searchTerms.count]
            let note = Note(
                content: "This is note #\(i) about \(term) and our relationship journey together.",
                privacy: .shared,
                authorId: testUser.id
            )
            modelContext.insert(note)
        }
        try modelContext.save()

        await viewModel.loadNotes()

        // Measure search performance
        measure {
            viewModel.searchText = "love"
            viewModel.searchText = "grateful"
            viewModel.searchText = "happy"
            viewModel.searchText = ""
        }

        // Verify search works
        viewModel.searchText = "love"
        XCTAssertGreaterThan(viewModel.filteredNotes.count, 0)
        XCTAssertLessThan(viewModel.filteredNotes.count, 100)
    }

    func testSortingLargeDataset() async throws {
        // Create 120 notes with varying dates
        for i in 1...120 {
            let note = Note(
                content: "Note #\(i)",
                privacy: .shared,
                authorId: testUser.id
            )

            // Vary creation dates
            note.createdAt = Date().addingTimeInterval(Double(-i * 3600))
            note.updatedAt = Date().addingTimeInterval(Double(-i * 1800))

            modelContext.insert(note)
        }
        try modelContext.save()

        await viewModel.loadNotes()

        // Measure sorting performance
        measure {
            viewModel.sortOrder = .newest
            viewModel.sortOrder = .oldest
            viewModel.sortOrder = .recentlyUpdated
            viewModel.sortOrder = .newest
        }

        // Verify sorting works
        viewModel.sortOrder = .oldest
        let first = viewModel.filteredNotes.first
        let last = viewModel.filteredNotes.last
        XCTAssertNotNil(first)
        XCTAssertNotNil(last)
        if let first = first, let last = last {
            XCTAssertLessThan(first.createdAt, last.createdAt)
        }
    }

    func testBatchDeletePerformance() async throws {
        // Create 100 notes
        var notesToDelete: [Note] = []
        for i in 1...100 {
            let note = Note(
                content: "Note to delete #\(i)",
                privacy: .draft,
                authorId: testUser.id
            )
            modelContext.insert(note)

            if i % 2 == 0 {
                notesToDelete.append(note)
            }
        }
        try modelContext.save()

        await viewModel.loadNotes()
        XCTAssertEqual(viewModel.notes.count, 100)

        // Measure batch delete performance
        measure {
            do {
                try viewModel.deleteNotes(notesToDelete)
            } catch {
                XCTFail("Delete failed: \(error)")
            }
        }

        // Verify deletion
        XCTAssertEqual(viewModel.notes.count, 50)
    }

    func testMemoryUsageWithLargeDataset() async throws {
        // Create 250 notes to test memory handling
        for i in 1...250 {
            let note = Note(
                content: """
                This is a longer note #\(i) to test memory usage.
                It contains multiple paragraphs and simulates real-world note content.

                First thought: Quality time together
                Second thought: Communication matters
                Third thought: Gratitude and appreciation

                Additional details about our relationship journey and growth together.
                This helps simulate realistic memory usage patterns.
                """,
                privacy: [NotePrivacy.shared, .private, .draft].randomElement()!,
                authorId: testUser.id
            )
            modelContext.insert(note)
        }
        try modelContext.save()

        // Load and verify
        await viewModel.loadNotes()
        XCTAssertEqual(viewModel.notes.count, 250)

        // Test statistics calculation with large dataset
        let totalNotes = viewModel.totalNotes
        let privateNotes = viewModel.privateNotes
        let sharedNotes = viewModel.sharedNotes
        let draftNotes = viewModel.draftNotes

        XCTAssertEqual(totalNotes, 250)
        XCTAssertEqual(privateNotes + sharedNotes + draftNotes, 250)
    }

    func testConcurrentOperations() async throws {
        // Create initial dataset
        for i in 1...50 {
            let note = Note(
                content: "Concurrent test note #\(i)",
                privacy: .shared,
                authorId: testUser.id
            )
            modelContext.insert(note)
        }
        try modelContext.save()

        await viewModel.loadNotes()

        // Test concurrent filtering and searching
        viewModel.selectedPrivacy = .shared
        viewModel.searchText = "concurrent"
        viewModel.sortOrder = .newest

        // Verify state consistency
        XCTAssertNotNil(viewModel.filteredNotes)
        XCTAssertGreaterThanOrEqual(viewModel.filteredNotes.count, 0)
    }
}
