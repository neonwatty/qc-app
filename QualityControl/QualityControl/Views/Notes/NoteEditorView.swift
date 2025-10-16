//
//  NoteEditorView.swift
//  QualityControl
//
//  Week 4: Notes System
//  Editor for creating and editing notes with privacy controls
//

import SwiftUI
import SwiftData

struct NoteEditorView: View {

    // MARK: - Properties

    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @Query private var categories: [Category]
    @Query private var checkIns: [CheckInSession]

    @Bindable var viewModel: NotesViewModel
    let noteToEdit: Note?

    @State private var content: String = ""
    @State private var selectedPrivacy: NotePrivacy = .draft
    @State private var selectedCategoryId: UUID?
    @State private var selectedCheckInId: UUID?
    @State private var showError: Bool = false
    @State private var errorMessage: String = ""

    // MARK: - Initialization

    init(viewModel: NotesViewModel, noteToEdit: Note? = nil) {
        self.viewModel = viewModel
        self.noteToEdit = noteToEdit
    }

    // MARK: - Body

    var body: some View {
        NavigationStack {
            Form {
                // Content Section
                Section("Note") {
                    TextEditor(text: $content)
                        .font(QCTypography.body)
                        .frame(minHeight: 200)
                }

                // Privacy Section
                Section {
                    Picker("Privacy", selection: $selectedPrivacy) {
                        ForEach([NotePrivacy.draft, .private, .shared], id: \.self) { privacy in
                            HStack {
                                Image(systemName: privacyIcon(for: privacy))
                                Text(privacy.displayName)
                            }
                            .tag(privacy)
                        }
                    }
                    .pickerStyle(.menu)

                    privacyDescription
                } header: {
                    Text("Privacy")
                } footer: {
                    Text("Choose who can see this note")
                }

                // Category Section (Optional)
                if !categories.isEmpty {
                    Section("Category (Optional)") {
                        Picker("Category", selection: $selectedCategoryId) {
                            Text("None").tag(nil as UUID?)

                            ForEach(categories) { category in
                                HStack {
                                    Image(systemName: category.icon)
                                    Text(category.name)
                                }
                                .tag(category.id as UUID?)
                            }
                        }
                        .pickerStyle(.menu)
                    }
                }

                // Check-in Section (Optional)
                if !recentCheckIns.isEmpty {
                    Section("Link to Check-in (Optional)") {
                        Picker("Check-in", selection: $selectedCheckInId) {
                            Text("None").tag(nil as UUID?)

                            ForEach(recentCheckIns) { checkIn in
                                Text(formattedCheckInDate(checkIn))
                                    .tag(checkIn.id as UUID?)
                            }
                        }
                        .pickerStyle(.menu)
                    }
                }
            }
            .navigationTitle(isEditMode ? "Edit Note" : "New Note")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button(isEditMode ? "Save" : "Create") {
                        saveNote()
                    }
                    .disabled(!isValid)
                }
            }
            .alert("Error", isPresented: $showError) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(errorMessage)
            }
            .onAppear {
                loadExistingNote()
            }
        }
    }

    // MARK: - View Components

    private var privacyDescription: some View {
        HStack(spacing: QCSpacing.sm) {
            Image(systemName: privacyIcon(for: selectedPrivacy))
                .font(.system(size: 14))
                .foregroundColor(privacyColor(for: selectedPrivacy))

            Text(privacyExplanation(for: selectedPrivacy))
                .font(QCTypography.bodySmall)
                .foregroundColor(QCColors.textSecondary)
        }
        .padding(.vertical, QCSpacing.xs)
    }

    // MARK: - Computed Properties

    private var isEditMode: Bool {
        noteToEdit != nil
    }

    private var isValid: Bool {
        !content.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    private var recentCheckIns: [CheckInSession] {
        checkIns
            .filter { $0.status == .completed }
            .sorted { ($0.completedAt ?? $0.startedAt) > ($1.completedAt ?? $1.startedAt) }
            .prefix(10)
            .map { $0 }
    }

    // MARK: - Actions

    private func loadExistingNote() {
        guard let note = noteToEdit else { return }

        content = note.content
        selectedPrivacy = note.privacy
        selectedCategoryId = note.categoryId
        selectedCheckInId = note.checkInId
    }

    private func saveNote() {
        do {
            if let existingNote = noteToEdit {
                // Update existing note
                try viewModel.updateNote(
                    existingNote,
                    content: content.trimmingCharacters(in: .whitespacesAndNewlines),
                    privacy: selectedPrivacy,
                    categoryId: selectedCategoryId,
                    checkInId: selectedCheckInId
                )
            } else {
                // Create new note
                _ = try viewModel.createNote(
                    content: content.trimmingCharacters(in: .whitespacesAndNewlines),
                    privacy: selectedPrivacy,
                    categoryId: selectedCategoryId,
                    checkInId: selectedCheckInId
                )
            }

            dismiss()
        } catch {
            errorMessage = error.localizedDescription
            showError = true
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

    private func privacyColor(for privacy: NotePrivacy) -> Color {
        switch privacy {
        case .private: return QCColors.info
        case .shared: return QCColors.success
        case .draft: return QCColors.warning
        }
    }

    private func privacyExplanation(for privacy: NotePrivacy) -> String {
        switch privacy {
        case .private:
            return "Only you can see this note"
        case .shared:
            return "Both partners can see this note"
        case .draft:
            return "Saved but not finalized yet"
        }
    }

    private func formattedCheckInDate(_ checkIn: CheckInSession) -> String {
        let date = checkIn.completedAt ?? checkIn.startedAt
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

// MARK: - Preview

#Preview("NoteEditorView - New") {
    let container = PreviewContainer.create()
    let context = container.mainContext

    let userDescriptor = FetchDescriptor<User>()
    let user = try? context.fetch(userDescriptor).first

    let viewModel = NotesViewModel(
        modelContext: context,
        currentUserId: user?.id ?? UUID()
    )

    return NoteEditorView(viewModel: viewModel)
        .modelContainer(container)
}

#Preview("NoteEditorView - Edit") {
    let container = PreviewContainer.create()
    let context = container.mainContext

    let userDescriptor = FetchDescriptor<User>()
    let user = try? context.fetch(userDescriptor).first

    let viewModel = NotesViewModel(
        modelContext: context,
        currentUserId: user?.id ?? UUID()
    )

    let note = Note(
        content: "This is an existing note that we're editing. It has some important content that we want to preserve.",
        privacy: .shared,
        authorId: user?.id ?? UUID()
    )
    context.insert(note)

    return NoteEditorView(viewModel: viewModel, noteToEdit: note)
        .modelContainer(container)
}
