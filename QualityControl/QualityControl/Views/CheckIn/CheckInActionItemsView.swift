//
//  CheckInActionItemsView.swift
//  QualityControl
//
//  Week 4: Check-In Flow
//  Action items screen - fifth step of check-in
//

import SwiftUI
import SwiftData

/// Check-In Action Items View
/// Create and assign action items from the check-in
struct CheckInActionItemsView: View {

    // MARK: - Properties

    @Environment(\.modelContext) private var modelContext
    @Bindable var viewModel: CheckInViewModel
    @Query private var users: [User]

    let onContinue: () -> Void
    let onBack: () -> Void

    @State private var showingAddItem = false
    @State private var newItemTitle = ""
    @State private var newItemPriority: Priority = .medium
    @State private var selectedUserId: UUID?

    // MARK: - Body

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: QCSpacing.lg) {
                // Header
                headerSection

                // Action Items List
                if viewModel.actionItems.isEmpty {
                    emptyState
                } else {
                    actionItemsList
                }

                // Add Item Button
                addItemButton
            }
            .padding(QCSpacing.lg)
        }
        .background(QCColors.backgroundPrimary)
        .navigationTitle("Action Items")
        .navigationBarTitleDisplayMode(.inline)
        .safeAreaInset(edge: .bottom) {
            bottomBar
        }
        .sheet(isPresented: $showingAddItem) {
            addItemSheet
        }
        .onAppear {
            if let firstUser = users.first {
                selectedUserId = firstUser.id
            }
        }
    }

    // MARK: - View Components

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: QCSpacing.sm) {
            Text("Next Steps")
                .font(QCTypography.heading4)
                .foregroundColor(QCColors.textPrimary)

            Text("Create action items to work on together")
                .font(QCTypography.body)
                .foregroundColor(QCColors.textSecondary)
        }
    }

    private var emptyState: some View {
        QCCard {
            VStack(spacing: QCSpacing.md) {
                Image(systemName: "list.bullet.clipboard")
                    .font(.system(size: 48))
                    .foregroundColor(QCColors.textTertiary)

                Text("No action items yet")
                    .font(QCTypography.heading6)
                    .foregroundColor(QCColors.textSecondary)

                Text("Add specific, actionable steps from your discussion")
                    .font(QCTypography.bodySmall)
                    .foregroundColor(QCColors.textTertiary)
                    .multilineTextAlignment(.center)
            }
            .padding(QCSpacing.lg)
        }
    }

    private var actionItemsList: some View {
        VStack(spacing: QCSpacing.md) {
            ForEach(viewModel.actionItems) { item in
                ActionItemCard(
                    item: item,
                    onDelete: {
                        viewModel.removeActionItem(item)
                    }
                )
            }
        }
    }

    private var addItemButton: some View {
        QCButton.secondary(
            "Add Action Item",
            icon: "plus.circle.fill",
            size: .medium
        ) {
            showingAddItem = true
        }
    }

    private var bottomBar: some View {
        VStack(spacing: QCSpacing.sm) {
            QCButton.primary(
                "Complete Check-in",
                icon: "checkmark.circle.fill",
                action: onContinue
            )

            QCButton.tertiary("Back", size: .small, action: onBack)
        }
        .padding(QCSpacing.lg)
        .background(QCColors.backgroundPrimary)
    }

    // MARK: - Add Item Sheet

    private var addItemSheet: some View {
        NavigationStack {
            Form {
                Section("Action Item") {
                    TextField("Title", text: $newItemTitle)
                        .font(QCTypography.body)
                }

                Section("Priority") {
                    Picker("Priority", selection: $newItemPriority) {
                        Text("Low").tag(Priority.low)
                        Text("Medium").tag(Priority.medium)
                        Text("High").tag(Priority.high)
                    }
                    .pickerStyle(.segmented)
                }

                if !users.isEmpty {
                    Section("Assign To") {
                        Picker("Assign To", selection: Binding(
                            get: { selectedUserId ?? users.first?.id ?? UUID() },
                            set: { selectedUserId = $0 }
                        )) {
                            ForEach(users) { user in
                                Text(user.name).tag(user.id)
                            }
                        }
                        .pickerStyle(.menu)
                    }
                }
            }
            .navigationTitle("New Action Item")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        showingAddItem = false
                        resetForm()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        addActionItem()
                    }
                    .disabled(newItemTitle.isEmpty)
                }
            }
        }
        .presentationDetents([.medium])
    }

    // MARK: - Actions

    private func addActionItem() {
        guard !newItemTitle.isEmpty,
              let session = viewModel.session,
              let userId = selectedUserId,
              let user = users.first(where: { $0.id == userId }) else { return }

        viewModel.addActionItem(
            title: newItemTitle,
            priority: newItemPriority,
            assignedTo: user
        )

        showingAddItem = false
        resetForm()
    }

    private func resetForm() {
        newItemTitle = ""
        newItemPriority = .medium
    }
}

// MARK: - Supporting Views

private struct ActionItemCard: View {
    let item: ActionItem
    let onDelete: () -> Void

    var body: some View {
        QCCard {
            HStack(spacing: QCSpacing.md) {
                // Priority Indicator
                Circle()
                    .fill(priorityColor)
                    .frame(width: 12, height: 12)

                // Content
                VStack(alignment: .leading, spacing: QCSpacing.xs) {
                    Text(item.title)
                        .font(QCTypography.body)
                        .foregroundColor(QCColors.textPrimary)

                    Text("\(item.priority.rawValue.capitalized) priority")
                        .font(QCTypography.captionSmall)
                        .foregroundColor(QCColors.textSecondary)
                }

                Spacer()

                // Delete Button
                Button(action: onDelete) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 20))
                        .foregroundColor(QCColors.textTertiary)
                }
                .buttonStyle(.plain)
            }
            .padding(QCSpacing.sm)
        }
    }

    private var priorityColor: Color {
        switch item.priority {
        case .high: return QCColors.error
        case .medium: return QCColors.warning
        case .low: return QCColors.info
        }
    }
}

// MARK: - Preview

#Preview("CheckInActionItemsView") {
    @Previewable @State var viewModel: CheckInViewModel = {
        let container = PreviewContainer.create()
        let context = container.mainContext

        let descriptor = FetchDescriptor<CheckInSession>()
        let session = try? context.fetch(descriptor).first

        return CheckInViewModel(modelContext: context, session: session)
    }()

    let container = PreviewContainer.create()

    NavigationStack {
        CheckInActionItemsView(
            viewModel: viewModel,
            onContinue: { print("Continue tapped") },
            onBack: { print("Back tapped") }
        )
        .modelContainer(container)
    }
}
