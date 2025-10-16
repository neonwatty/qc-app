//
//  RequestDetailView.swift
//  QualityControl
//
//  Week 7: Requests System
//  Detail view for viewing and responding to requests
//

import SwiftUI
import SwiftData

struct RequestDetailView: View {

    // MARK: - Properties

    @Environment(\.dismiss) private var dismiss
    let request: RelationshipRequest
    let viewModel: RequestsViewModel
    let isReceived: Bool

    @State private var responseText: String = ""
    @State private var showError: Bool = false
    @State private var errorMessage: String = ""

    // MARK: - Body

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: QCSpacing.xl) {
                    // Header
                    headerSection

                    // Type and Priority
                    metadataSection

                    // Description
                    descriptionSection

                    // Due date and recurring
                    if request.dueDate != nil || request.isRecurring {
                        scheduleSection
                    }

                    // Tags
                    if !request.tags.isEmpty {
                        tagsSection
                    }

                    // Response section (if already responded)
                    if let response = request.response, !response.isEmpty {
                        responseSection(response: response)
                    }

                    // Response input (if received and pending)
                    if isReceived && request.status == .pending {
                        responseInputSection
                    }

                    // Actions
                    actionsSection
                }
                .padding()
            }
            .background(QCColors.backgroundPrimary)
            .navigationTitle("Request Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") {
                        dismiss()
                    }
                }
            }
            .alert("Error", isPresented: $showError) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(errorMessage)
            }
        }
    }

    // MARK: - Subviews

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: QCSpacing.md) {
            HStack {
                // Avatar
                Circle()
                    .fill(QCColors.primary.opacity(0.2))
                    .frame(width: 60, height: 60)
                    .overlay(
                        Text(String(request.title.prefix(1)))
                            .font(QCTypography.heading3)
                            .foregroundStyle(QCColors.primary)
                    )

                Spacer()

                StatusBadge(status: request.status)
            }

            Text(request.title)
                .font(QCTypography.heading2)
                .foregroundStyle(QCColors.textPrimary)

            Text(isReceived ? "From your partner" : "To your partner")
                .font(QCTypography.body)
                .foregroundStyle(QCColors.textSecondary)
        }
        .padding(QCSpacing.lg)
        .background(QCColors.surfaceCard)
        .cornerRadius(QCSpacing.md)
    }

    private var metadataSection: some View {
        HStack(spacing: QCSpacing.md) {
            MetadataItem(
                icon: request.requestType.icon,
                label: "Type",
                value: request.requestType.displayName
            )

            Divider()
                .frame(height: 40)

            MetadataItem(
                icon: "flag.fill",
                label: "Priority",
                value: request.priority.displayName
            )
        }
        .padding(QCSpacing.lg)
        .background(QCColors.surfaceCard)
        .cornerRadius(QCSpacing.md)
    }

    private var descriptionSection: some View {
        VStack(alignment: .leading, spacing: QCSpacing.sm) {
            Text("Description")
                .font(QCTypography.heading5)
                .foregroundStyle(QCColors.textPrimary)

            Text(request.requestDescription)
                .font(QCTypography.body)
                .foregroundStyle(QCColors.textSecondary)
        }
        .padding(QCSpacing.lg)
        .background(QCColors.surfaceCard)
        .cornerRadius(QCSpacing.md)
    }

    private var scheduleSection: some View {
        VStack(alignment: .leading, spacing: QCSpacing.md) {
            Text("Schedule")
                .font(QCTypography.heading5)
                .foregroundStyle(QCColors.textPrimary)

            if let dueDate = request.dueDate {
                HStack {
                    Image(systemName: "calendar")
                        .foregroundStyle(QCColors.textSecondary)

                    Text("Due: \(dueDate.formatted(date: .long, time: .omitted))")
                        .font(QCTypography.body)
                        .foregroundStyle(QCColors.textSecondary)
                }
            }

            if request.isRecurring {
                HStack {
                    Image(systemName: "arrow.triangle.2.circlepath")
                        .foregroundStyle(QCColors.textSecondary)

                    Text("Recurring request")
                        .font(QCTypography.body)
                        .foregroundStyle(QCColors.textSecondary)
                }
            }
        }
        .padding(QCSpacing.lg)
        .background(QCColors.surfaceCard)
        .cornerRadius(QCSpacing.md)
    }

    private var tagsSection: some View {
        VStack(alignment: .leading, spacing: QCSpacing.sm) {
            Text("Tags")
                .font(QCTypography.heading5)
                .foregroundStyle(QCColors.textPrimary)

            FlowLayout(spacing: QCSpacing.sm) {
                ForEach(request.tags, id: \.self) { tag in
                    Text(tag)
                        .font(QCTypography.bodySmall)
                        .padding(.horizontal, QCSpacing.sm)
                        .padding(.vertical, QCSpacing.xs)
                        .background(QCColors.primary.opacity(0.1))
                        .foregroundStyle(QCColors.primary)
                        .cornerRadius(QCSpacing.lg)
                }
            }
        }
        .padding(QCSpacing.lg)
        .background(QCColors.surfaceCard)
        .cornerRadius(QCSpacing.md)
    }

    private func responseSection(response: String) -> some View {
        VStack(alignment: .leading, spacing: QCSpacing.sm) {
            HStack {
                Text("Response")
                    .font(QCTypography.heading5)
                    .foregroundStyle(QCColors.textPrimary)

                Spacer()

                if let respondedAt = request.respondedAt {
                    Text(respondedAt.formatted(date: .abbreviated, time: .shortened))
                        .font(QCTypography.caption)
                        .foregroundStyle(QCColors.textSecondary)
                }
            }

            Text(response)
                .font(QCTypography.body)
                .foregroundStyle(QCColors.textSecondary)
        }
        .padding(QCSpacing.lg)
        .background(QCColors.info.opacity(0.05))
        .cornerRadius(QCSpacing.md)
        .overlay(
            RoundedRectangle(cornerRadius: QCSpacing.md)
                .stroke(QCColors.info.opacity(0.3), lineWidth: 1)
        )
    }

    private var responseInputSection: some View {
        VStack(alignment: .leading, spacing: QCSpacing.sm) {
            Text("Your Response (Optional)")
                .font(QCTypography.bodySmall)
                .foregroundStyle(QCColors.textSecondary)

            TextField("Add a message with your response...", text: $responseText, axis: .vertical)
                .textFieldStyle(.roundedBorder)
                .font(QCTypography.body)
                .lineLimit(3...6)
        }
        .padding(QCSpacing.lg)
        .background(QCColors.surfaceCard)
        .cornerRadius(QCSpacing.md)
    }

    private var actionsSection: some View {
        VStack(spacing: QCSpacing.md) {
            if isReceived && request.status == .pending {
                // Accept/Decline buttons for received pending requests
                HStack(spacing: QCSpacing.md) {
                    Button(action: declineRequest) {
                        Label("Decline", systemImage: "xmark.circle")
                            .font(QCTypography.button)
                            .foregroundStyle(QCColors.error)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(QCColors.error.opacity(0.1))
                            .cornerRadius(QCSpacing.md)
                    }

                    Button(action: acceptRequest) {
                        Label("Accept", systemImage: "checkmark.circle")
                            .font(QCTypography.button)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(QCColors.success)
                            .cornerRadius(QCSpacing.md)
                    }
                }
            } else if !isReceived && request.status == .pending {
                // Delete button for sent pending requests
                Button(role: .destructive, action: deleteRequest) {
                    Label("Cancel Request", systemImage: "trash")
                        .font(QCTypography.button)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(QCColors.error.opacity(0.1))
                        .cornerRadius(QCSpacing.md)
                }
            }

            // Created date
            Text("Created \(request.createdAt.formatted(date: .long, time: .shortened))")
                .font(QCTypography.caption)
                .foregroundStyle(QCColors.textSecondary)
                .frame(maxWidth: .infinity)
        }
    }

    // MARK: - Actions

    private func acceptRequest() {
        do {
            try viewModel.acceptRequest(request, response: responseText.isEmpty ? nil : responseText)
            dismiss()
        } catch {
            errorMessage = "Failed to accept request: \(error.localizedDescription)"
            showError = true
        }
    }

    private func declineRequest() {
        do {
            try viewModel.declineRequest(request, response: responseText.isEmpty ? nil : responseText)
            dismiss()
        } catch {
            errorMessage = "Failed to decline request: \(error.localizedDescription)"
            showError = true
        }
    }

    private func deleteRequest() {
        do {
            try viewModel.deleteRequest(request)
            dismiss()
        } catch {
            errorMessage = "Failed to delete request: \(error.localizedDescription)"
            showError = true
        }
    }
}

// MARK: - Supporting Views

struct MetadataItem: View {
    let icon: String
    let label: String
    let value: String

    var body: some View {
        VStack(spacing: QCSpacing.xs) {
            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundStyle(QCColors.primary)

            Text(label)
                .font(QCTypography.captionSmall)
                .foregroundStyle(QCColors.textSecondary)

            Text(value)
                .font(QCTypography.bodySmall)
                .fontWeight(.semibold)
                .foregroundStyle(QCColors.textPrimary)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Preview

#Preview("Pending Request") {
    {
        let request = RelationshipRequest(
            title: "Plan Anniversary Dinner",
            description: "Can you handle planning our anniversary dinner next month? You always find the most romantic places and I trust your judgment completely!",
            requestType: .dateNight,
            requestedBy: UUID(),
            requestedFor: UUID()
        )
        request.priority = .high
        request.dueDate = Date().addingTimeInterval(86400 * 14)
        request.tags = ["romantic", "special"]

        let viewModel = RequestsViewModel(modelContext: ModelContext(ModelContainer.shared), currentUserId: UUID())

        return RequestDetailView(request: request, viewModel: viewModel, isReceived: true)
    }()
}
