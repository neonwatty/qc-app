//
//  CreateRequestSheet.swift
//  QualityControl
//
//  Week 7: Requests System
//  Form for creating new relationship requests
//

import SwiftUI
import SwiftData

struct CreateRequestSheet: View {

    // MARK: - Properties

    @Environment(\.dismiss) private var dismiss
    let viewModel: RequestsViewModel
    let currentUserId: UUID

    @State private var title: String = ""
    @State private var description: String = ""
    @State private var requestType: RequestType = .conversation
    @State private var priority: Priority = .medium
    @State private var hasDueDate: Bool = false
    @State private var dueDate: Date = Date().addingTimeInterval(86400 * 7)
    @State private var isRecurring: Bool = false

    @State private var showError: Bool = false
    @State private var errorMessage: String = ""

    // MARK: - Computed Properties

    private var canSave: Bool {
        !title.trimmingCharacters(in: .whitespaces).isEmpty &&
        !description.trimmingCharacters(in: .whitespaces).isEmpty
    }

    // MARK: - Body

    var body: some View {
        NavigationStack {
            Form {
                detailsSection
                typeAndPrioritySection
                scheduleSection
            }
            .navigationTitle("New Request")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Send") {
                        sendRequest()
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

            TextField("Description", text: $description, axis: .vertical)
                .font(QCTypography.body)
                .lineLimit(4...8)
        } header: {
            Text("Details")
                .font(QCTypography.bodySmall)
        } footer: {
            Text("Describe what you're asking your partner for.")
                .font(QCTypography.captionSmall)
        }
    }

    private var typeAndPrioritySection: some View {
        Section {
            Picker("Type", selection: $requestType) {
                ForEach([RequestType.conversation, .activity, .dateNight, .reminder], id: \.self) { type in
                    HStack {
                        Image(systemName: type.icon)
                        Text(type.displayName)
                    }
                    .tag(type)
                }
            }
            .font(QCTypography.body)

            Picker("Priority", selection: $priority) {
                ForEach([Priority.low, .medium, .high], id: \.self) { pri in
                    Text(pri.displayName)
                        .tag(pri)
                }
            }
            .font(QCTypography.body)
        } header: {
            Text("Category")
                .font(QCTypography.bodySmall)
        }
    }

    private var scheduleSection: some View {
        Section {
            Toggle("Set Due Date", isOn: $hasDueDate)
                .font(QCTypography.body)

            if hasDueDate {
                DatePicker(
                    "Due Date",
                    selection: $dueDate,
                    in: Date()...,
                    displayedComponents: .date
                )
                .font(QCTypography.body)
            }

            Toggle("Recurring", isOn: $isRecurring)
                .font(QCTypography.body)
        } header: {
            Text("Schedule")
                .font(QCTypography.bodySmall)
        } footer: {
            Text(isRecurring ? "This request will repeat periodically." : "")
                .font(QCTypography.captionSmall)
        }
    }

    // MARK: - Actions

    private func sendRequest() {
        do {
            // TODO: Get partner ID from Couple relationship
            // For now, using a placeholder UUID
            let partnerId = UUID()

            _ = try viewModel.createRequest(
                title: title.trimmingCharacters(in: .whitespaces),
                description: description.trimmingCharacters(in: .whitespaces),
                requestType: requestType,
                requestedFor: partnerId,
                priority: priority,
                dueDate: hasDueDate ? dueDate : nil,
                isRecurring: isRecurring,
                tags: []
            )

            dismiss()
        } catch {
            errorMessage = "Failed to create request: \(error.localizedDescription)"
            showError = true
        }
    }
}

// MARK: - Preview

#Preview {
    CreateRequestSheet(
        viewModel: RequestsViewModel(modelContext: ModelContext(ModelContainer.shared), currentUserId: UUID()),
        currentUserId: UUID()
    )
}
