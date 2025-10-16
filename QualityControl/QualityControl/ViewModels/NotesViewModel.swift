//
//  NotesViewModel.swift
//  QualityControl
//
//  Week 4: Notes System
//  State management for notes list and editor
//

import Foundation
import SwiftData

@MainActor
@Observable
class NotesViewModel {

    // MARK: - Properties

    private let modelContext: ModelContext
    let currentUserId: UUID

    var notes: [Note] = []
    var filteredNotes: [Note] = []
    var searchText: String = "" {
        didSet {
            applyFilters()
        }
    }
    var selectedPrivacy: NotePrivacy? {
        didSet {
            applyFilters()
        }
    }
    var sortOrder: SortOrder = .newest {
        didSet {
            applyFilters()
        }
    }

    var isLoading: Bool = false
    var error: Error?

    // MARK: - Initialization

    init(modelContext: ModelContext, currentUserId: UUID) {
        self.modelContext = modelContext
        self.currentUserId = currentUserId
    }

    // MARK: - Data Loading

    func loadNotes() async {
        isLoading = true
        error = nil

        do {
            let descriptor = FetchDescriptor<Note>(
                sortBy: [SortDescriptor(\.createdAt, order: .reverse)]
            )

            let allNotes = try modelContext.fetch(descriptor)
            notes = allNotes.filter { $0.authorId == currentUserId }
            applyFilters()
        } catch {
            self.error = error
        }

        isLoading = false
    }

    func refresh() async {
        await loadNotes()
    }

    // MARK: - CRUD Operations

    func createNote(
        content: String,
        privacy: NotePrivacy,
        categoryId: UUID? = nil,
        checkInId: UUID? = nil
    ) throws -> Note {
        let note = Note(
            content: content,
            privacy: privacy,
            authorId: currentUserId
        )
        note.categoryId = categoryId
        note.checkInId = checkInId

        modelContext.insert(note)
        try modelContext.save()

        // Add to local list
        notes.insert(note, at: 0)
        applyFilters()

        return note
    }

    func updateNote(
        _ note: Note,
        content: String,
        privacy: NotePrivacy,
        categoryId: UUID?,
        checkInId: UUID?
    ) throws {
        note.content = content
        note.privacy = privacy
        note.categoryId = categoryId
        note.checkInId = checkInId
        note.updatedAt = Date()

        try modelContext.save()
        applyFilters()
    }

    func deleteNote(_ note: Note) throws {
        modelContext.delete(note)
        try modelContext.save()

        // Remove from local lists
        notes.removeAll { $0.id == note.id }
        filteredNotes.removeAll { $0.id == note.id }
    }

    func deleteNotes(_ notesToDelete: [Note]) throws {
        for note in notesToDelete {
            modelContext.delete(note)
        }
        try modelContext.save()

        // Remove from local lists
        let idsToDelete = Set(notesToDelete.map { $0.id })
        notes.removeAll { idsToDelete.contains($0.id) }
        filteredNotes.removeAll { idsToDelete.contains($0.id) }
    }

    // MARK: - Filtering and Sorting

    private func applyFilters() {
        var result = notes

        // Filter by privacy if selected
        if let privacy = selectedPrivacy {
            result = result.filter { $0.privacy == privacy }
        }

        // Filter by search text
        if !searchText.isEmpty {
            result = result.filter { note in
                note.content.localizedCaseInsensitiveContains(searchText)
            }
        }

        // Apply sort order
        switch sortOrder {
        case .newest:
            result.sort { $0.createdAt > $1.createdAt }
        case .oldest:
            result.sort { $0.createdAt < $1.createdAt }
        case .recentlyUpdated:
            result.sort { $0.updatedAt > $1.updatedAt }
        }

        filteredNotes = result
    }

    // MARK: - Statistics

    var totalNotes: Int {
        notes.count
    }

    var privateNotes: Int {
        notes.filter { $0.privacy == .private }.count
    }

    var sharedNotes: Int {
        notes.filter { $0.privacy == .shared }.count
    }

    var draftNotes: Int {
        notes.filter { $0.privacy == .draft }.count
    }

    // MARK: - Helpers

    func getCategory(for note: Note) -> Category? {
        guard let categoryId = note.categoryId else { return nil }

        let descriptor = FetchDescriptor<Category>()
        let categories = (try? modelContext.fetch(descriptor)) ?? []
        return categories.first { $0.id == categoryId }
    }

    func getCheckIn(for note: Note) -> CheckInSession? {
        guard let checkInId = note.checkInId else { return nil }

        let descriptor = FetchDescriptor<CheckInSession>()
        let sessions = (try? modelContext.fetch(descriptor)) ?? []
        return sessions.first { $0.id == checkInId }
    }
}

// MARK: - Supporting Types

enum SortOrder: String, CaseIterable {
    case newest = "Newest First"
    case oldest = "Oldest First"
    case recentlyUpdated = "Recently Updated"

    var systemImage: String {
        switch self {
        case .newest: return "arrow.down"
        case .oldest: return "arrow.up"
        case .recentlyUpdated: return "clock.arrow.circlepath"
        }
    }
}
