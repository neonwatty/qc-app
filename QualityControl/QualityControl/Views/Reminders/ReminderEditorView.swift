//
//  ReminderEditorView.swift
//  QualityControl
//
//  Week 5: Reminders System
//  Form-based editor for creating and editing reminders
//

import SwiftUI
import SwiftData

struct ReminderEditorView: View {

    // MARK: - Properties

    @Environment(\.dismiss) private var dismiss
    @Bindable var viewModel: RemindersViewModel
    let reminderToEdit: Reminder?

    // Form State
    @State private var title: String = ""
    @State private var message: String = ""
    @State private var scheduledFor: Date = Date()
    @State private var frequency: ReminderFrequency = .once
    @State private var category: ReminderCategory = .checkIn
    @State private var showError: Bool = false
    @State private var errorMessage: String = ""

    // MARK: - Computed Properties

    private var isEditing: Bool {
        reminderToEdit != nil
    }

    private var navigationTitle: String {
        isEditing ? "Edit Reminder" : "New Reminder"
    }

    private var canSave: Bool {
        !title.trimmingCharacters(in: .whitespaces).isEmpty
    }

    // MARK: - Initialization

    init(viewModel: RemindersViewModel, reminderToEdit: Reminder? = nil) {
        self.viewModel = viewModel
        self.reminderToEdit = reminderToEdit

        // Initialize state from existing reminder
        if let reminder = reminderToEdit {
            _title = State(initialValue: reminder.title)
            _message = State(initialValue: reminder.message)
            _scheduledFor = State(initialValue: reminder.scheduledFor)
            _frequency = State(initialValue: reminder.frequency)
            _category = State(initialValue: reminder.category)
        }
    }

    // MARK: - Body

    var body: some View {
        NavigationStack {
            Form {
                detailsSection
                scheduleSection
                categorySection
                if isEditing {
                    deleteSection
                }
            }
            .navigationTitle(navigationTitle)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        saveReminder()
                    }
                    .disabled(!canSave)
                }
            }
            .alert("Error", isPresented: $showError) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(errorMessage)
            }
        }
    }

    // MARK: - Form Sections

    private var detailsSection: some View {
        Section {
            TextField("Title", text: $title)
                .font(QCTypography.body)

            TextField("Message (optional)", text: $message, axis: .vertical)
                .font(QCTypography.body)
                .lineLimit(3...6)
        } header: {
            Text("Details")
                .font(QCTypography.bodySmall)
        }
    }

    private var scheduleSection: some View {
        Section {
            DatePicker(
                "Time",
                selection: $scheduledFor,
                in: Date()...,
                displayedComponents: [.date, .hourAndMinute]
            )
            .font(QCTypography.body)

            Picker("Frequency", selection: $frequency) {
                ForEach(ReminderFrequency.allCases, id: \.self) { freq in
                    Text(freq.rawValue).tag(freq)
                }
            }
            .font(QCTypography.body)
        } header: {
            Text("Schedule")
                .font(QCTypography.bodySmall)
        } footer: {
            Text(frequencyDescription)
                .font(QCTypography.captionSmall)
        }
    }

    private var categorySection: some View {
        Section {
            Picker("Category", selection: $category) {
                ForEach(ReminderCategory.allCases, id: \.self) { cat in
                    Label(cat.rawValue, systemImage: cat.icon)
                        .tag(cat)
                }
            }
            .font(QCTypography.body)
            .pickerStyle(.navigationLink)
        } header: {
            Text("Category")
                .font(QCTypography.bodySmall)
        }
    }

    private var deleteSection: some View {
        Section {
            Button(role: .destructive) {
                deleteReminder()
            } label: {
                HStack {
                    Spacer()
                    Label("Delete Reminder", systemImage: "trash")
                        .font(QCTypography.body)
                    Spacer()
                }
            }
        }
    }

    // MARK: - Computed Properties

    private var frequencyDescription: String {
        switch frequency {
        case .once:
            return "This reminder will only appear once at the scheduled time."
        case .daily:
            return "This reminder will repeat every day at the scheduled time."
        case .weekly:
            return "This reminder will repeat every week at the scheduled time."
        case .monthly:
            return "This reminder will repeat every month at the scheduled time."
        case .custom:
            return "Custom reminder frequency."
        }
    }

    // MARK: - Actions

    private func saveReminder() {
        Task {
            do {
                let trimmedTitle = title.trimmingCharacters(in: .whitespaces)
                let trimmedMessage = message.trimmingCharacters(in: .whitespaces)

                if let reminder = reminderToEdit {
                    // Update existing reminder
                    try await viewModel.updateReminder(
                        reminder,
                        title: trimmedTitle,
                        message: trimmedMessage,
                        scheduledFor: scheduledFor,
                        frequency: frequency,
                        category: category
                    )
                } else {
                    // Create new reminder
                    _ = try await viewModel.createReminder(
                        title: trimmedTitle,
                        message: trimmedMessage,
                        scheduledFor: scheduledFor,
                        frequency: frequency,
                        category: category
                    )
                }

                dismiss()
            } catch {
                errorMessage = "Failed to save reminder: \(error.localizedDescription)"
                showError = true
            }
        }
    }

    private func deleteReminder() {
        guard let reminder = reminderToEdit else { return }

        do {
            try viewModel.deleteReminder(reminder)
            dismiss()
        } catch {
            errorMessage = "Failed to delete reminder: \(error.localizedDescription)"
            showError = true
        }
    }
}

// MARK: - Reminder Category Extension

extension ReminderCategory {
    var icon: String {
        switch self {
        case .checkIn: return "heart.text.square"
        case .habit: return "repeat"
        case .actionItem: return "checkmark.circle"
        case .partnerMoment: return "heart.circle"
        case .specialOccasion: return "gift"
        }
    }
}

// MARK: - Preview

#Preview("New Reminder") {
    let container = PreviewContainer.create()
    let context = container.mainContext

    // Get first user
    let userDescriptor = FetchDescriptor<User>()
    let user = try? context.fetch(userDescriptor).first

    let viewModel = RemindersViewModel(modelContext: context, userId: user?.id ?? UUID())

    ReminderEditorView(viewModel: viewModel)
        .modelContainer(container)
}

#Preview("Edit Reminder") {
    @Previewable @State var viewModel: RemindersViewModel = {
        let container = PreviewContainer.create()
        let context = container.mainContext

        // Get first user
        let userDescriptor = FetchDescriptor<User>()
        let user = try? context.fetch(userDescriptor).first

        return RemindersViewModel(modelContext: context, userId: user?.id ?? UUID())
    }()

    let container = PreviewContainer.create()
    let context = container.mainContext

    let reminder = Reminder(
        title: "Daily Check-in",
        message: "Time for your daily relationship check-in",
        category: .checkIn,
        frequency: .daily,
        scheduledFor: Date().addingTimeInterval(3600),
        userId: UUID()
    )

    ReminderEditorView(viewModel: viewModel, reminderToEdit: reminder)
        .modelContainer(container)
}
