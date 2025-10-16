//
//  NotesViewModelTests.swift
//  QualityControlTests
//
//  Week 4: Notes System Tests
//  Tests for NotesViewModel
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class NotesViewModelTests: XCTestCase {

    var modelContext: ModelContext!
    var viewModel: NotesViewModel!
    var testUserId: UUID!

    override func setUp() async throws {
        // Create in-memory model container with complete schema
        let schema = Schema([
            User.self,
            Couple.self,
            CheckInSession.self,
            QualityControl.Category.self,
            Note.self,
            ActionItem.self,
            Reminder.self,
            Milestone.self,
            LoveLanguage.self,
            RelationshipRequest.self
        ])
        let configuration = ModelConfiguration(isStoredInMemoryOnly: true)
        let container = try ModelContainer(for: schema, configurations: configuration)
        modelContext = container.mainContext

        // Create test user
        testUserId = UUID()
        let user = User(id: testUserId, name: "Test User", email: "test@example.com")
        modelContext.insert(user)
        try modelContext.save()

        // Initialize view model
        viewModel = NotesViewModel(modelContext: modelContext, currentUserId: testUserId)
    }

    override func tearDown() {
        viewModel = nil
        modelContext = nil
        testUserId = nil
    }

    // MARK: - Initialization Tests

    func testInitialization() {
        XCTAssertEqual(viewModel.currentUserId, testUserId)
        XCTAssertTrue(viewModel.notes.isEmpty)
        XCTAssertTrue(viewModel.filteredNotes.isEmpty)
        XCTAssertEqual(viewModel.searchText, "")
        XCTAssertNil(viewModel.selectedPrivacy)
        XCTAssertEqual(viewModel.sortOrder, .newest)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.error)
    }

    // MARK: - CRUD Operation Tests

    func testCreateNote() throws {
        let content = "Test note content"
        let privacy = NotePrivacy.shared

        let note = try viewModel.createNote(
            content: content,
            privacy: privacy
        )

        XCTAssertEqual(note.content, content)
        XCTAssertEqual(note.privacy, privacy)
        XCTAssertEqual(note.authorId, testUserId)
        XCTAssertEqual(viewModel.notes.count, 1)
        XCTAssertEqual(viewModel.filteredNotes.count, 1)
    }

    func testCreateNoteWithCategory() throws {
        // Create category
        let category = QualityControl.Category(name: "Test Category", description: "Test description", icon: "star.fill")
        modelContext.insert(category)
        try modelContext.save()

        let note = try viewModel.createNote(
            content: "Note with category",
            privacy: .shared,
            categoryId: category.id
        )

        XCTAssertEqual(note.categoryId, category.id)
    }

    func testCreateNoteWithCheckIn() throws {
        // Create check-in
        let checkIn = CheckInSession(coupleId: UUID())
        modelContext.insert(checkIn)
        try modelContext.save()

        let note = try viewModel.createNote(
            content: "Note with check-in",
            privacy: .shared,
            checkInId: checkIn.id
        )

        XCTAssertEqual(note.checkInId, checkIn.id)
    }

    func testUpdateNote() throws {
        let note = try viewModel.createNote(
            content: "Original content",
            privacy: .draft
        )

        try viewModel.updateNote(
            note,
            content: "Updated content",
            privacy: .shared,
            categoryId: nil,
            checkInId: nil
        )

        XCTAssertEqual(note.content, "Updated content")
        XCTAssertEqual(note.privacy, .shared)
    }

    func testDeleteNote() throws {
        let note = try viewModel.createNote(
            content: "Note to delete",
            privacy: .private
        )

        XCTAssertEqual(viewModel.notes.count, 1)

        try viewModel.deleteNote(note)

        XCTAssertEqual(viewModel.notes.count, 0)
        XCTAssertEqual(viewModel.filteredNotes.count, 0)
    }

    func testDeleteMultipleNotes() throws {
        let note1 = try viewModel.createNote(content: "Note 1", privacy: .shared)
        let note2 = try viewModel.createNote(content: "Note 2", privacy: .private)
        let note3 = try viewModel.createNote(content: "Note 3", privacy: .draft)

        XCTAssertEqual(viewModel.notes.count, 3)

        try viewModel.deleteNotes([note1, note3])

        XCTAssertEqual(viewModel.notes.count, 1)
        XCTAssertEqual(viewModel.notes.first?.id, note2.id)
    }

    // MARK: - Data Loading Tests

    func testLoadNotes() async throws {
        // Create notes directly in context
        let note1 = Note(content: "Note 1", privacy: .shared, authorId: testUserId)
        let note2 = Note(content: "Note 2", privacy: .private, authorId: testUserId)
        modelContext.insert(note1)
        modelContext.insert(note2)
        try modelContext.save()

        await viewModel.loadNotes()

        XCTAssertEqual(viewModel.notes.count, 2)
        XCTAssertEqual(viewModel.filteredNotes.count, 2)
        XCTAssertFalse(viewModel.isLoading)
    }

    func testLoadNotesFiltersByUser() async throws {
        let otherUserId = UUID()

        // Create notes for different users
        let myNote = Note(content: "My note", privacy: .shared, authorId: testUserId)
        let otherNote = Note(content: "Other note", privacy: .shared, authorId: otherUserId)
        modelContext.insert(myNote)
        modelContext.insert(otherNote)
        try modelContext.save()

        await viewModel.loadNotes()

        XCTAssertEqual(viewModel.notes.count, 1)
        XCTAssertEqual(viewModel.notes.first?.content, "My note")
    }

    func testRefresh() async throws {
        // Create initial note
        let note1 = Note(content: "Note 1", privacy: .shared, authorId: testUserId)
        modelContext.insert(note1)
        try modelContext.save()

        await viewModel.loadNotes()
        XCTAssertEqual(viewModel.notes.count, 1)

        // Add another note
        let note2 = Note(content: "Note 2", privacy: .private, authorId: testUserId)
        modelContext.insert(note2)
        try modelContext.save()

        await viewModel.refresh()
        XCTAssertEqual(viewModel.notes.count, 2)
    }

    // MARK: - Search Tests

    func testSearchByContent() throws {
        _ = try viewModel.createNote(content: "Important meeting notes", privacy: .shared)
        _ = try viewModel.createNote(content: "Random thoughts", privacy: .private)
        _ = try viewModel.createNote(content: "Meeting agenda for tomorrow", privacy: .shared)

        viewModel.searchText = "meeting"

        XCTAssertEqual(viewModel.filteredNotes.count, 2)
    }

    func testSearchCaseInsensitive() throws {
        _ = try viewModel.createNote(content: "Important Meeting Notes", privacy: .shared)

        viewModel.searchText = "meeting"

        XCTAssertEqual(viewModel.filteredNotes.count, 1)
    }

    func testSearchReturnsEmpty() throws {
        _ = try viewModel.createNote(content: "Some content", privacy: .shared)

        viewModel.searchText = "nonexistent"

        XCTAssertEqual(viewModel.filteredNotes.count, 0)
    }

    // MARK: - Filter Tests

    func testFilterByPrivacy() throws {
        _ = try viewModel.createNote(content: "Shared 1", privacy: .shared)
        _ = try viewModel.createNote(content: "Private 1", privacy: .private)
        _ = try viewModel.createNote(content: "Shared 2", privacy: .shared)
        _ = try viewModel.createNote(content: "Draft 1", privacy: .draft)

        viewModel.selectedPrivacy = .shared

        XCTAssertEqual(viewModel.filteredNotes.count, 2)
        XCTAssertTrue(viewModel.filteredNotes.allSatisfy { $0.privacy == .shared })
    }

    func testFilterByPrivateNotes() throws {
        _ = try viewModel.createNote(content: "Shared", privacy: .shared)
        _ = try viewModel.createNote(content: "Private", privacy: .private)

        viewModel.selectedPrivacy = .private

        XCTAssertEqual(viewModel.filteredNotes.count, 1)
        XCTAssertEqual(viewModel.filteredNotes.first?.privacy, .private)
    }

    func testCombinedSearchAndFilter() throws {
        _ = try viewModel.createNote(content: "Shared meeting", privacy: .shared)
        _ = try viewModel.createNote(content: "Private meeting", privacy: .private)
        _ = try viewModel.createNote(content: "Shared thoughts", privacy: .shared)

        viewModel.selectedPrivacy = .shared
        viewModel.searchText = "meeting"

        XCTAssertEqual(viewModel.filteredNotes.count, 1)
        XCTAssertEqual(viewModel.filteredNotes.first?.content, "Shared meeting")
    }

    // MARK: - Sort Tests

    func testSortByNewest() throws {
        let note1 = try viewModel.createNote(content: "First", privacy: .shared)
        Thread.sleep(forTimeInterval: 0.01)
        _ = try viewModel.createNote(content: "Second", privacy: .shared)
        Thread.sleep(forTimeInterval: 0.01)
        let note3 = try viewModel.createNote(content: "Third", privacy: .shared)

        viewModel.sortOrder = .newest

        XCTAssertEqual(viewModel.filteredNotes.first?.id, note3.id)
        XCTAssertEqual(viewModel.filteredNotes.last?.id, note1.id)
    }

    func testSortByOldest() throws {
        let note1 = try viewModel.createNote(content: "First", privacy: .shared)
        Thread.sleep(forTimeInterval: 0.01)
        _ = try viewModel.createNote(content: "Second", privacy: .shared)
        Thread.sleep(forTimeInterval: 0.01)
        let note3 = try viewModel.createNote(content: "Third", privacy: .shared)

        viewModel.sortOrder = .oldest

        XCTAssertEqual(viewModel.filteredNotes.first?.id, note1.id)
        XCTAssertEqual(viewModel.filteredNotes.last?.id, note3.id)
    }

    func testSortByRecentlyUpdated() throws {
        let note1 = try viewModel.createNote(content: "First", privacy: .shared)
        Thread.sleep(forTimeInterval: 0.01)
        _ = try viewModel.createNote(content: "Second", privacy: .shared)
        Thread.sleep(forTimeInterval: 0.01)

        // Update note1 to make it most recently updated
        try viewModel.updateNote(note1, content: "First updated", privacy: .shared, categoryId: nil, checkInId: nil)

        viewModel.sortOrder = .recentlyUpdated

        XCTAssertEqual(viewModel.filteredNotes.first?.id, note1.id)
    }

    // MARK: - Statistics Tests

    func testTotalNotes() throws {
        XCTAssertEqual(viewModel.totalNotes, 0)

        try viewModel.createNote(content: "Note 1", privacy: .shared)
        XCTAssertEqual(viewModel.totalNotes, 1)

        try viewModel.createNote(content: "Note 2", privacy: .private)
        XCTAssertEqual(viewModel.totalNotes, 2)
    }

    func testPrivateNotesCount() throws {
        try viewModel.createNote(content: "Private 1", privacy: .private)
        try viewModel.createNote(content: "Shared", privacy: .shared)
        try viewModel.createNote(content: "Private 2", privacy: .private)

        XCTAssertEqual(viewModel.privateNotes, 2)
    }

    func testSharedNotesCount() throws {
        try viewModel.createNote(content: "Shared 1", privacy: .shared)
        try viewModel.createNote(content: "Private", privacy: .private)
        try viewModel.createNote(content: "Shared 2", privacy: .shared)

        XCTAssertEqual(viewModel.sharedNotes, 2)
    }

    func testDraftNotesCount() throws {
        try viewModel.createNote(content: "Draft 1", privacy: .draft)
        try viewModel.createNote(content: "Shared", privacy: .shared)
        try viewModel.createNote(content: "Draft 2", privacy: .draft)

        XCTAssertEqual(viewModel.draftNotes, 2)
    }

    // MARK: - Helper Method Tests

    func testGetCategory() throws {
        let category = QualityControl.Category(name: "Test", description: "Test description", icon: "star.fill")
        modelContext.insert(category)
        try modelContext.save()

        let note = try viewModel.createNote(
            content: "Test",
            privacy: .shared,
            categoryId: category.id
        )

        let retrievedCategory = viewModel.getCategory(for: note)
        XCTAssertNotNil(retrievedCategory)
        XCTAssertEqual(retrievedCategory?.id, category.id)
    }

    func testGetCategoryReturnsNilWhenNoCategoryId() throws {
        let note = try viewModel.createNote(content: "Test", privacy: .shared)

        let category = viewModel.getCategory(for: note)
        XCTAssertNil(category)
    }

    func testGetCheckIn() throws {
        let checkIn = CheckInSession(coupleId: UUID())
        modelContext.insert(checkIn)
        try modelContext.save()

        let note = try viewModel.createNote(
            content: "Test",
            privacy: .shared,
            checkInId: checkIn.id
        )

        let retrievedCheckIn = viewModel.getCheckIn(for: note)
        XCTAssertNotNil(retrievedCheckIn)
        XCTAssertEqual(retrievedCheckIn?.id, checkIn.id)
    }

    func testGetCheckInReturnsNilWhenNoCheckInId() throws {
        let note = try viewModel.createNote(content: "Test", privacy: .shared)

        let checkIn = viewModel.getCheckIn(for: note)
        XCTAssertNil(checkIn)
    }
}
