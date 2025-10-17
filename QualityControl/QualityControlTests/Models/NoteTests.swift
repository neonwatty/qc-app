//
//  NoteTests.swift
//  QualityControlTests
//
//  Phase 1.1: Model Tests
//  Comprehensive tests for Note model
//

import XCTest
import SwiftData
@testable import QualityControl

@MainActor
final class NoteTests: XCTestCase {

    var modelContext: ModelContext!
    var testUser: User!
    var testNote: Note!

    override func setUp() async throws {
        modelContext = try TestModelContext.create()

        testUser = User(name: "Test User", email: "test@example.com")
        modelContext.insert(testUser)

        testNote = Note(content: "Test note content", privacy: .shared, authorId: testUser.id)
        modelContext.insert(testNote)

        try modelContext.save()
    }

    override func tearDown() async throws {
        testNote = nil
        testUser = nil
        modelContext = nil
    }

    // MARK: - Initialization Tests

    func testNoteInitialization() {
        // Given
        let content = "This is a test note"
        let privacy = NotePrivacy.private
        let authorId = UUID()

        // When
        let note = Note(content: content, privacy: privacy, authorId: authorId)

        // Then
        XCTAssertNotNil(note.id)
        XCTAssertEqual(note.content, content)
        XCTAssertEqual(note.privacy, privacy)
        XCTAssertEqual(note.authorId, authorId)
        XCTAssertNil(note.categoryId)
        XCTAssertNil(note.checkInId)
        XCTAssertNotNil(note.createdAt)
        XCTAssertNotNil(note.updatedAt)
        XCTAssertEmpty(note.tags)
        XCTAssertNil(note.checkInSession)
    }

    func testNoteIdIsUnique() {
        // When
        let note1 = Note(content: "Note 1", privacy: .shared, authorId: testUser.id)
        let note2 = Note(content: "Note 2", privacy: .shared, authorId: testUser.id)

        // Then
        XCTAssertNotEqual(note1.id, note2.id)
    }

    func testNoteTimestampsAreSet() {
        // Given
        let beforeCreation = Date()

        // When
        let note = Note(content: "Test", privacy: .shared, authorId: testUser.id)

        // Then
        let afterCreation = Date()
        XCTAssertGreaterThanOrEqual(note.createdAt, beforeCreation)
        XCTAssertLessThanOrEqual(note.createdAt, afterCreation)
        XCTAssertGreaterThanOrEqual(note.updatedAt, beforeCreation)
        XCTAssertLessThanOrEqual(note.updatedAt, afterCreation)
    }

    // MARK: - Property Tests

    func testContentUpdatePersists() throws {
        // Given
        let newContent = "Updated note content"

        // When
        testNote.content = newContent
        testNote.updatedAt = Date()
        try modelContext.save()

        // Then
        XCTAssertEqual(testNote.content, newContent)
    }

    func testPrivacyUpdatePersists() throws {
        // Given
        let newPrivacy = NotePrivacy.private

        // When
        testNote.privacy = newPrivacy
        testNote.updatedAt = Date()
        try modelContext.save()

        // Then
        XCTAssertEqual(testNote.privacy, newPrivacy)
    }

    func testCategoryIdUpdatePersists() throws {
        // Given
        let categoryId = UUID()

        // When
        testNote.categoryId = categoryId
        try modelContext.save()

        // Then
        XCTAssertEqual(testNote.categoryId, categoryId)
    }

    func testCheckInIdUpdatePersists() throws {
        // Given
        let checkInId = UUID()

        // When
        testNote.checkInId = checkInId
        try modelContext.save()

        // Then
        XCTAssertEqual(testNote.checkInId, checkInId)
    }

    // MARK: - Timestamp Tests

    func testUpdatedAtCanBeModified() throws {
        // Given
        let originalUpdatedAt = testNote.updatedAt
        Thread.sleep(forTimeInterval: 0.1)

        // When
        testNote.content = "Modified content"
        testNote.updatedAt = Date()
        try modelContext.save()

        // Then
        XCTAssertGreaterThan(testNote.updatedAt, originalUpdatedAt)
    }

    func testCreatedAtDoesNotChange() throws {
        // Given
        let originalCreatedAt = testNote.createdAt

        // When
        testNote.content = "Modified content"
        testNote.updatedAt = Date()
        try modelContext.save()

        // Then
        assertDatesEqual(testNote.createdAt, originalCreatedAt)
    }

    // MARK: - Tags Tests

    func testTagsInitiallyEmpty() {
        // Then
        XCTAssertEmpty(testNote.tags)
    }

    func testCanAddTag() throws {
        // Given
        let tag = "important"

        // When
        testNote.tags.append(tag)
        try modelContext.save()

        // Then
        XCTAssertCount(testNote.tags, 1)
        XCTAssertEqual(testNote.tags.first, tag)
    }

    func testCanAddMultipleTags() throws {
        // Given
        let tags = ["important", "follow-up", "communication"]

        // When
        testNote.tags.append(contentsOf: tags)
        try modelContext.save()

        // Then
        XCTAssertCount(testNote.tags, 3)
        XCTAssertEqual(testNote.tags, tags)
    }

    func testCanRemoveTag() throws {
        // Given
        testNote.tags.append(contentsOf: ["tag1", "tag2", "tag3"])
        try modelContext.save()

        // When
        testNote.tags.removeFirst()
        try modelContext.save()

        // Then
        XCTAssertCount(testNote.tags, 2)
    }

    func testCanClearAllTags() throws {
        // Given
        testNote.tags.append(contentsOf: ["tag1", "tag2", "tag3"])
        try modelContext.save()

        // When
        testNote.tags.removeAll()
        try modelContext.save()

        // Then
        XCTAssertEmpty(testNote.tags)
    }

    // MARK: - Privacy Level Tests

    func testPrivateNoteProperties() {
        // Given
        let note = Note(content: "Private note", privacy: .private, authorId: testUser.id)

        // Then
        XCTAssertEqual(note.privacy, .private)
        XCTAssertEqual(note.privacy.icon, "eye.slash.fill")
        XCTAssertEqual(note.privacy.color, "blue")
    }

    func testSharedNoteProperties() {
        // Given
        let note = Note(content: "Shared note", privacy: .shared, authorId: testUser.id)

        // Then
        XCTAssertEqual(note.privacy, .shared)
        XCTAssertEqual(note.privacy.icon, "eye.fill")
        XCTAssertEqual(note.privacy.color, "green")
    }

    func testDraftNoteProperties() {
        // Given
        let note = Note(content: "Draft note", privacy: .draft, authorId: testUser.id)

        // Then
        XCTAssertEqual(note.privacy, .draft)
        XCTAssertEqual(note.privacy.icon, "doc.text.fill")
        XCTAssertEqual(note.privacy.color, "orange")
    }

    // MARK: - CheckInSession Relationship Tests

    func testCheckInSessionInitiallyNil() {
        // Then
        XCTAssertNil(testNote.checkInSession)
    }

    func testCanAssignCheckInSession() throws {
        // Given
        let couple = Couple(relationshipStartDate: Date())
        let session = CheckInSession(coupleId: couple.id)
        modelContext.insert(couple)
        modelContext.insert(session)

        // When
        testNote.checkInSession = session
        testNote.checkInId = session.id
        try modelContext.save()

        // Then
        XCTAssertNotNil(testNote.checkInSession)
        XCTAssertEqual(testNote.checkInSession?.id, session.id)
    }

    // MARK: - Persistence Tests

    func testNotePersistsInContext() throws {
        // When
        let descriptor = FetchDescriptor<Note>()
        let notes = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(notes, 1)
        XCTAssertEqual(notes.first?.id, testNote.id)
    }

    func testNoteCanBeDeleted() throws {
        // When
        modelContext.delete(testNote)
        try modelContext.save()

        // Then
        let descriptor = FetchDescriptor<Note>()
        let notes = try modelContext.fetch(descriptor)
        XCTAssertEmpty(notes)
    }

    func testMultipleNotesPersist() throws {
        // Given
        let note2 = Note(content: "Note 2", privacy: .private, authorId: testUser.id)
        let note3 = Note(content: "Note 3", privacy: .draft, authorId: testUser.id)
        modelContext.insert(note2)
        modelContext.insert(note3)

        // When
        try modelContext.save()

        // Then
        let descriptor = FetchDescriptor<Note>()
        let notes = try modelContext.fetch(descriptor)
        XCTAssertCount(notes, 3)
    }

    // MARK: - Query Tests

    func testFetchNoteById() throws {
        // Given
        let targetId = testNote.id

        // When
        let descriptor = FetchDescriptor<Note>(
            predicate: #Predicate { $0.id == targetId }
        )
        let notes = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(notes, 1)
        XCTAssertEqual(notes.first?.id, targetId)
    }

    func testFetchNotesByAuthor() throws {
        // Given
        let authorId = testUser.id
        let otherUser = User(name: "Other User", email: "other@example.com")
        modelContext.insert(otherUser)
        let otherNote = Note(content: "Other note", privacy: .shared, authorId: otherUser.id)
        modelContext.insert(otherNote)
        try modelContext.save()

        // When
        let descriptor = FetchDescriptor<Note>(
            predicate: #Predicate { $0.authorId == authorId }
        )
        let notes = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(notes, 1)
        XCTAssertEqual(notes.first?.authorId, authorId)
    }

    func testFetchNotesByPrivacy() throws {
        // Given
        let privateNote = Note(content: "Private", privacy: .private, authorId: testUser.id)
        let draftNote = Note(content: "Draft", privacy: .draft, authorId: testUser.id)
        modelContext.insert(privateNote)
        modelContext.insert(draftNote)
        try modelContext.save()

        let targetPrivacy: NotePrivacy = .shared

        // When
        let descriptor = FetchDescriptor<Note>(
            predicate: #Predicate { $0.privacy == targetPrivacy }
        )
        let notes = try modelContext.fetch(descriptor)

        // Then
        XCTAssertCount(notes, 1)
        XCTAssertEqual(notes.first?.privacy, .shared)
    }

    func testFetchNotesByCategoryId() throws {
        // Given
        let categoryId = UUID()
        testNote.categoryId = categoryId
        let uncategorizedNote = Note(content: "Uncategorized", privacy: .shared, authorId: testUser.id)
        modelContext.insert(uncategorizedNote)
        try modelContext.save()

        // When - Fetch all and filter in Swift (categoryId is optional)
        let descriptor = FetchDescriptor<Note>()
        let allNotes = try modelContext.fetch(descriptor)
        let notes = allNotes.filter { $0.categoryId == categoryId }

        // Then
        XCTAssertCount(notes, 1)
        XCTAssertEqual(notes.first?.categoryId, categoryId)
    }

    func testFetchNotesByCheckInId() throws {
        // Given
        let checkInId = UUID()
        testNote.checkInId = checkInId
        let unlinkedNote = Note(content: "Unlinked", privacy: .shared, authorId: testUser.id)
        modelContext.insert(unlinkedNote)
        try modelContext.save()

        // When - Fetch all and filter in Swift (checkInId is optional)
        let descriptor = FetchDescriptor<Note>()
        let allNotes = try modelContext.fetch(descriptor)
        let notes = allNotes.filter { $0.checkInId == checkInId }

        // Then
        XCTAssertCount(notes, 1)
        XCTAssertEqual(notes.first?.checkInId, checkInId)
    }
}
