//
//  NotesListView.swift
//  QualityControl
//
//  Week 4: Notes System
//  Main notes list view with search, filter, and sort
//

import SwiftUI
import SwiftData

struct NotesListView: View {

    // MARK: - Properties

    @Environment(\.modelContext) private var modelContext
    @State private var viewModel: NotesViewModel?
    @Query private var users: [User]

    @State private var showingEditor = false
    @State private var noteToEdit: Note?
    @State private var showingFilters = false
    @State private var showDeleteConfirmation = false
    @State private var noteToDelete: Note?

    // MARK: - Body

    var body: some View {
        NavigationStack {
            Group {
                if let viewModel = viewModel {
                    if viewModel.isLoading && viewModel.notes.isEmpty {
                        loadingView
                    } else if viewModel.filteredNotes.isEmpty {
                        emptyStateView
                    } else {
                        notesList
                    }
                } else {
                    loadingView
                }
            }
            .navigationTitle("Notes")
            .searchable(text: Binding(
                get: { viewModel?.searchText ?? "" },
                set: { viewModel?.searchText = $0 }
            ), prompt: "Search notes")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    filtersButton
                }

                ToolbarItem(placement: .topBarTrailing) {
                    addButton
                }
            }
            .sheet(isPresented: $showingEditor) {
                if let viewModel = viewModel {
                    NoteEditorView(viewModel: viewModel, noteToEdit: noteToEdit)
                }
            }
            .sheet(isPresented: $showingFilters) {
                filtersSheet
            }
            .alert("Delete Note", isPresented: $showDeleteConfirmation) {
                Button("Cancel", role: .cancel) {}
                Button("Delete", role: .destructive) {
                    if let note = noteToDelete {
                        deleteNote(note)
                    }
                }
            } message: {
                Text("Are you sure you want to delete this note? This action cannot be undone.")
            }
            .task {
                if viewModel == nil, let user = users.first {
                    let vm = NotesViewModel(
                        modelContext: modelContext,
                        currentUserId: user.id
                    )
                    viewModel = vm
                    await vm.loadNotes()
                }
            }
            .refreshable {
                await viewModel?.refresh()
            }
        }
    }

    // MARK: - View Components

    private var notesList: some View {
        ScrollView {
            LazyVStack(spacing: QCSpacing.md) {
                if let viewModel = viewModel {
                    // Stats Summary (if not searching/filtering)
                    if viewModel.searchText.isEmpty && viewModel.selectedPrivacy == nil {
                        statsSection
                    }

                    // Notes List
                    ForEach(viewModel.filteredNotes) { note in
                        NoteCard(
                            note: note,
                            category: viewModel.getCategory(for: note),
                            checkIn: viewModel.getCheckIn(for: note),
                            onEdit: {
                                noteToEdit = note
                                showingEditor = true
                            },
                            onDelete: {
                                noteToDelete = note
                                showDeleteConfirmation = true
                            }
                        )
                        .onTapGesture {
                            noteToEdit = note
                            showingEditor = true
                        }
                    }
                }
            }
            .padding(QCSpacing.lg)
        }
        .background(QCColors.backgroundPrimary)
    }

    private var statsSection: some View {
        HStack(spacing: QCSpacing.sm) {
            if let viewModel = viewModel {
                StatPill(
                    icon: "note.text",
                    label: "Total",
                    value: "\(viewModel.totalNotes)"
                )

                StatPill(
                    icon: "person.2.fill",
                    label: "Shared",
                    value: "\(viewModel.sharedNotes)"
                )

                StatPill(
                    icon: "lock.fill",
                    label: "Private",
                    value: "\(viewModel.privateNotes)"
                )

                StatPill(
                    icon: "doc.text.fill",
                    label: "Drafts",
                    value: "\(viewModel.draftNotes)"
                )
            }
        }
        .padding(.bottom, QCSpacing.xs)
    }

    private var loadingView: some View {
        VStack(spacing: QCSpacing.md) {
            ProgressView()
            Text("Loading notes...")
                .font(QCTypography.body)
                .foregroundColor(QCColors.textSecondary)
        }
    }

    private var emptyStateView: some View {
        VStack(spacing: QCSpacing.lg) {
            Image(systemName: "note.text")
                .font(.system(size: 60))
                .foregroundColor(QCColors.textTertiary)

            VStack(spacing: QCSpacing.sm) {
                Text(emptyStateTitle)
                    .font(QCTypography.heading5)
                    .foregroundColor(QCColors.textPrimary)

                Text(emptyStateMessage)
                    .font(QCTypography.body)
                    .foregroundColor(QCColors.textSecondary)
                    .multilineTextAlignment(.center)
            }

            if viewModel?.searchText.isEmpty == true && viewModel?.selectedPrivacy == nil {
                QCButton.primary(
                    "Create Your First Note",
                    icon: "plus.circle.fill",
                    size: .medium
                ) {
                    noteToEdit = nil
                    showingEditor = true
                }
            }
        }
        .padding(QCSpacing.xl)
    }

    private var addButton: some View {
        Button {
            noteToEdit = nil
            showingEditor = true
        } label: {
            Image(systemName: "plus.circle.fill")
                .font(.system(size: 20))
        }
    }

    private var filtersButton: some View {
        Button {
            showingFilters = true
        } label: {
            Image(systemName: "line.3.horizontal.decrease.circle")
                .font(.system(size: 20))
        }
    }

    private var filtersSheet: some View {
        NavigationStack {
            Form {
                // Privacy Filter
                Section("Filter by Privacy") {
                    Picker("Privacy", selection: Binding(
                        get: { viewModel?.selectedPrivacy },
                        set: { viewModel?.selectedPrivacy = $0 }
                    )) {
                        Text("All Notes").tag(nil as NotePrivacy?)

                        ForEach([NotePrivacy.draft, .private, .shared], id: \.self) { privacy in
                            HStack {
                                Image(systemName: privacyIcon(for: privacy))
                                Text(privacy.displayName)
                            }
                            .tag(privacy as NotePrivacy?)
                        }
                    }
                    .pickerStyle(.inline)
                }

                // Sort Order
                Section("Sort By") {
                    Picker("Sort Order", selection: Binding(
                        get: { viewModel?.sortOrder ?? .newest },
                        set: { viewModel?.sortOrder = $0 }
                    )) {
                        ForEach(SortOrder.allCases, id: \.self) { order in
                            HStack {
                                Image(systemName: order.systemImage)
                                Text(order.rawValue)
                            }
                            .tag(order)
                        }
                    }
                    .pickerStyle(.inline)
                }
            }
            .navigationTitle("Filters & Sort")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        showingFilters = false
                    }
                }
            }
        }
        .presentationDetents([.medium])
    }

    // MARK: - Computed Properties

    private var emptyStateTitle: String {
        if viewModel?.searchText.isEmpty == false {
            return "No matching notes"
        } else if viewModel?.selectedPrivacy != nil {
            return "No notes in this category"
        } else {
            return "No notes yet"
        }
    }

    private var emptyStateMessage: String {
        if viewModel?.searchText.isEmpty == false {
            return "Try adjusting your search terms"
        } else if viewModel?.selectedPrivacy != nil {
            return "Create a note with this privacy setting to see it here"
        } else {
            return "Start capturing your thoughts and reflections"
        }
    }

    // MARK: - Actions

    private func deleteNote(_ note: Note) {
        do {
            try viewModel?.deleteNote(note)
        } catch {
            print("Error deleting note: \(error.localizedDescription)")
        }
    }

    // MARK: - Helper Methods

    private func privacyIcon(for privacy: NotePrivacy) -> String {
        switch privacy {
        case .private: return "lock.fill"
        case .shared: return "person.2.fill"
        case .draft: return "doc.text.fill"
        }
    }
}

// MARK: - Supporting Views

private struct StatPill: View {
    let icon: String
    let label: String
    let value: String

    var body: some View {
        VStack(spacing: QCSpacing.xs) {
            HStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 12))
                Text(value)
                    .font(QCTypography.heading6)
            }
            .foregroundColor(QCColors.primary)

            Text(label)
                .font(QCTypography.captionSmall)
                .foregroundColor(QCColors.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, QCSpacing.sm)
        .background(QCColors.backgroundSecondary)
        .qcCardCornerRadius()
    }
}

// MARK: - Preview

#Preview("NotesListView - With Notes") {
    let container = PreviewContainer.create()
    let context = container.mainContext

    // Add some sample notes
    if let user = try? context.fetch(FetchDescriptor<User>()).first {
        for i in 1...5 {
            let note = Note(
                content: "This is the content of note \(i). It contains some important thoughts and reflections.",
                privacy: [NotePrivacy.shared, .private, .draft].randomElement()!,
                authorId: user.id
            )
            context.insert(note)
        }
    }

    return NotesListView()
        .modelContainer(container)
}

#Preview("NotesListView - Empty") {
    NotesListView()
        .modelContainer(PreviewContainer.create())
}
