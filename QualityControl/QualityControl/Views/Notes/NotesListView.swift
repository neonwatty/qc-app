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

    // Batch operations
    @State private var isEditMode = false
    @State private var selectedNotes: Set<Note.ID> = []
    @State private var showBatchDeleteConfirmation = false

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
                    if isEditMode {
                        selectAllButton
                    } else {
                        filtersButton
                    }
                }

                ToolbarItem(placement: .topBarTrailing) {
                    if isEditMode {
                        doneEditingButton
                    } else {
                        addButton
                    }
                }

                ToolbarItem(placement: .bottomBar) {
                    if isEditMode {
                        batchActionsToolbar
                    }
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
            .alert("Delete Notes", isPresented: $showBatchDeleteConfirmation) {
                Button("Cancel", role: .cancel) {}
                Button("Delete \(selectedNotes.count)", role: .destructive) {
                    deleteBatchNotes()
                }
            } message: {
                Text("Are you sure you want to delete \(selectedNotes.count) note(s)? This action cannot be undone.")
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
                        if isEditMode {
                            NoteSelectionRow(
                                note: note,
                                isSelected: selectedNotes.contains(note.id),
                                category: viewModel.getCategory(for: note),
                                checkIn: viewModel.getCheckIn(for: note)
                            )
                            .onTapGesture {
                                toggleNoteSelection(note)
                            }
                        } else {
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
                            .onLongPressGesture {
                                // Enter edit mode with this note selected
                                HapticFeedback.mediumImpact()
                                isEditMode = true
                                selectedNotes.insert(note.id)
                            }
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
        VStack(spacing: QCSpacing.xl) {
            // Illustration
            ZStack {
                Circle()
                    .fill(QCColors.primary.opacity(0.1))
                    .frame(width: 120, height: 120)

                Circle()
                    .fill(QCColors.primary.opacity(0.05))
                    .frame(width: 100, height: 100)

                Image(systemName: emptyStateIcon)
                    .font(.system(size: 48, weight: .light))
                    .foregroundColor(QCColors.primary)
            }
            .padding(.top, QCSpacing.xl)

            VStack(spacing: QCSpacing.sm) {
                Text(emptyStateTitle)
                    .font(QCTypography.heading4)
                    .foregroundColor(QCColors.textPrimary)

                Text(emptyStateMessage)
                    .font(QCTypography.body)
                    .foregroundColor(QCColors.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, QCSpacing.md)
            }

            // Tips or action button
            if viewModel?.searchText.isEmpty == true && viewModel?.selectedPrivacy == nil {
                VStack(spacing: QCSpacing.md) {
                    QCButton.primary(
                        "Create Your First Note",
                        icon: "plus.circle.fill",
                        size: .medium
                    ) {
                        HapticFeedback.lightImpact()
                        noteToEdit = nil
                        showingEditor = true
                    }

                    // Tips
                    VStack(alignment: .leading, spacing: QCSpacing.sm) {
                        TipRow(icon: "lock.fill", text: "Keep private thoughts secure")
                        TipRow(icon: "person.2.fill", text: "Share insights with your partner")
                        TipRow(icon: "link", text: "Link notes to check-ins")
                    }
                    .padding()
                    .background(QCColors.backgroundSecondary)
                    .qcCardCornerRadius()
                }
            } else if viewModel?.searchText.isEmpty == false {
                // Search tips
                VStack(spacing: QCSpacing.xs) {
                    Text("Try:")
                        .font(QCTypography.bodySmall)
                        .foregroundColor(QCColors.textSecondary)

                    HStack(spacing: QCSpacing.xs) {
                        suggestionChip("Different keywords")
                        suggestionChip("Clear filters")
                    }
                }
            }
        }
        .padding(QCSpacing.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func suggestionChip(_ text: String) -> some View {
        Text(text)
            .font(QCTypography.captionSmall)
            .foregroundColor(QCColors.primary)
            .padding(.horizontal, QCSpacing.sm)
            .padding(.vertical, QCSpacing.xs)
            .background(QCColors.primary.opacity(0.1))
            .cornerRadius(12)
    }

    private var addButton: some View {
        Button {
            noteToEdit = nil
            showingEditor = true
        } label: {
            Image(systemName: "plus.circle.fill")
                .font(.system(size: 20))
        }
        .accessibilityLabel("Create new note")
        .accessibilityHint("Opens the note editor to create a new note")
    }

    private var filtersButton: some View {
        Button {
            showingFilters = true
        } label: {
            Image(systemName: "line.3.horizontal.decrease.circle")
                .font(.system(size: 20))
        }
        .accessibilityLabel("Filter and sort notes")
        .accessibilityHint("Opens options to filter by privacy and sort notes")
    }

    private var selectAllButton: some View {
        Button {
            HapticFeedback.selection()

            if selectedNotes.count == viewModel?.filteredNotes.count {
                // Deselect all
                selectedNotes.removeAll()
            } else {
                // Select all
                selectedNotes = Set(viewModel?.filteredNotes.map(\.id) ?? [])
            }
        } label: {
            Text(selectedNotes.count == viewModel?.filteredNotes.count ? "Deselect All" : "Select All")
        }
    }

    private var doneEditingButton: some View {
        Button("Done") {
            isEditMode = false
            selectedNotes.removeAll()
        }
    }

    private var batchActionsToolbar: some View {
        HStack {
            // Edit mode toggle
            Button {
                isEditMode = false
                selectedNotes.removeAll()
            } label: {
                Image(systemName: "xmark.circle.fill")
                    .font(.system(size: 20))
            }

            Spacer()

            Text("\(selectedNotes.count) selected")
                .font(QCTypography.body)
                .foregroundColor(QCColors.textSecondary)

            Spacer()

            // Delete selected
            Button {
                if !selectedNotes.isEmpty {
                    showBatchDeleteConfirmation = true
                }
            } label: {
                Image(systemName: "trash.fill")
                    .font(.system(size: 20))
            }
            .foregroundColor(selectedNotes.isEmpty ? QCColors.textTertiary : QCColors.error)
            .disabled(selectedNotes.isEmpty)
        }
        .padding(.horizontal)
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

    private var emptyStateIcon: String {
        if viewModel?.searchText.isEmpty == false {
            return "magnifyingglass"
        } else if viewModel?.selectedPrivacy == .private {
            return "lock.fill"
        } else if viewModel?.selectedPrivacy == .shared {
            return "person.2.fill"
        } else if viewModel?.selectedPrivacy == .draft {
            return "doc.text.fill"
        } else {
            return "note.text"
        }
    }

    private var emptyStateTitle: String {
        if viewModel?.searchText.isEmpty == false {
            return "No matching notes"
        } else if viewModel?.selectedPrivacy != nil {
            return "No \(viewModel?.selectedPrivacy?.displayName ?? "") notes"
        } else {
            return "Start Your Note Collection"
        }
    }

    private var emptyStateMessage: String {
        if viewModel?.searchText.isEmpty == false {
            return "Try different keywords or clear your filters"
        } else if viewModel?.selectedPrivacy != nil {
            return "Create a note with this privacy setting to see it here"
        } else {
            return "Capture thoughts, insights, and memories from your relationship journey"
        }
    }

    // MARK: - Actions

    private func deleteNote(_ note: Note) {
        HapticFeedback.warning()

        do {
            try viewModel?.deleteNote(note)
            HapticFeedback.success()
        } catch {
            HapticFeedback.error()
            print("Error deleting note: \(error.localizedDescription)")
        }
    }

    private func toggleNoteSelection(_ note: Note) {
        HapticFeedback.selection()

        if selectedNotes.contains(note.id) {
            selectedNotes.remove(note.id)
        } else {
            selectedNotes.insert(note.id)
        }
    }

    private func deleteBatchNotes() {
        guard let viewModel = viewModel else { return }

        HapticFeedback.warning()

        // Get notes to delete
        let notesToDelete = viewModel.filteredNotes.filter { selectedNotes.contains($0.id) }

        do {
            try viewModel.deleteNotes(notesToDelete)
            HapticFeedback.success()
            selectedNotes.removeAll()
            isEditMode = false
        } catch {
            HapticFeedback.error()
            print("Error deleting notes: \(error.localizedDescription)")
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

private struct NoteSelectionRow: View {
    let note: Note
    let isSelected: Bool
    let category: QualityControl.Category?
    let checkIn: CheckInSession?

    var body: some View {
        HStack(spacing: QCSpacing.md) {
            // Selection indicator
            Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                .font(.system(size: 24))
                .foregroundColor(isSelected ? QCColors.primary : QCColors.textTertiary)

            // Note preview
            VStack(alignment: .leading, spacing: QCSpacing.xs) {
                // Privacy indicator
                HStack(spacing: QCSpacing.xs) {
                    Image(systemName: privacyIcon)
                        .font(.system(size: 12))
                    Text(note.privacy.displayName)
                        .font(QCTypography.caption)
                }
                .foregroundColor(privacyColor)

                // Content preview
                Text(note.content)
                    .font(QCTypography.body)
                    .foregroundColor(QCColors.textPrimary)
                    .lineLimit(2)

                // Metadata
                HStack(spacing: QCSpacing.sm) {
                    if let category = category {
                        HStack(spacing: 4) {
                            Image(systemName: category.icon)
                            Text(category.name)
                        }
                        .font(QCTypography.captionSmall)
                        .foregroundColor(QCColors.textSecondary)
                    }

                    if category != nil && checkIn != nil {
                        Text("•")
                            .foregroundColor(QCColors.textTertiary)
                    }

                    if let checkIn = checkIn {
                        Text("Check-in: \(checkIn.startedAt.formatted(date: .abbreviated, time: .omitted))")
                            .font(QCTypography.captionSmall)
                            .foregroundColor(QCColors.textSecondary)
                    }
                }
            }
        }
        .padding(QCSpacing.md)
        .background(isSelected ? QCColors.primary.opacity(0.05) : QCColors.backgroundSecondary)
        .qcCardCornerRadius()
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(isSelected ? "Selected" : "Not selected"), \(note.privacy.displayName) note")
        .accessibilityValue(note.content)
        .accessibilityHint("Double tap to \(isSelected ? "deselect" : "select") this note")
    }

    private var privacyIcon: String {
        switch note.privacy {
        case .private: return "lock.fill"
        case .shared: return "person.2.fill"
        case .draft: return "doc.text.fill"
        }
    }

    private var privacyColor: Color {
        switch note.privacy {
        case .private: return QCColors.info
        case .shared: return QCColors.success
        case .draft: return QCColors.warning
        }
    }
}

private struct TipRow: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: QCSpacing.sm) {
            Image(systemName: icon)
                .font(.system(size: 14))
                .foregroundColor(QCColors.primary)
                .frame(width: 20)

            Text(text)
                .font(QCTypography.bodySmall)
                .foregroundColor(QCColors.textSecondary)

            Spacer()
        }
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
