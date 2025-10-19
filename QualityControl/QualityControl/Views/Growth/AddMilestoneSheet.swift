//
//  AddMilestoneSheet.swift
//  QualityControl
//
//  Week 5: Growth Gallery
//  Sheet for creating new milestones
//

import SwiftUI

struct AddMilestoneSheet: View {

    // MARK: - Properties

    @Environment(\.dismiss) private var dismiss
    @Bindable var viewModel: GrowthViewModel

    @State private var title = ""
    @State private var milestoneDescription = ""
    @State private var selectedCategory = "anniversary"
    @State private var showError = false
    @State private var errorMessage = ""

    private let categories = [
        ("anniversary", "Anniversary", "heart.fill"),
        ("consistency", "Consistency", "calendar.badge.checkmark"),
        ("growth", "Growth", "chart.line.uptrend.xyaxis"),
        ("quality", "Quality Time", "person.2.fill"),
        ("communication", "Communication", "bubble.left.and.bubble.right.fill"),
        ("milestone", "Special Milestone", "star.fill")
    ]

    // MARK: - Body

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Milestone Title", text: $title)
                        .font(QCTypography.body)

                    TextField("Description", text: $milestoneDescription, axis: .vertical)
                        .font(QCTypography.body)
                        .lineLimit(3...6)
                } header: {
                    Text("Details")
                }

                Section {
                    Picker("Category", selection: $selectedCategory) {
                        ForEach(categories, id: \.0) { category in
                            HStack {
                                Image(systemName: category.2)
                                Text(category.1)
                            }
                            .tag(category.0)
                        }
                    }
                    .pickerStyle(.menu)
                } header: {
                    Text("Category")
                } footer: {
                    Text("Choose a category that best represents this milestone")
                        .font(QCTypography.captionSmall)
                }

                Section {
                    Button(action: saveMilestone) {
                        HStack {
                            Spacer()
                            Text("Create Milestone")
                                .font(QCTypography.button)
                                .foregroundStyle(.white)
                            Spacer()
                        }
                        .padding(.vertical, QCSpacing.sm)
                        .background(isValid ? QCColors.primary : QCColors.textTertiary)
                        .cornerRadius(QCSpacing.md)
                    }
                    .disabled(!isValid)
                    .listRowInsets(EdgeInsets())
                    .listRowBackground(Color.clear)
                }
            }
            .navigationTitle("New Milestone")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
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

    // MARK: - Computed Properties

    private var isValid: Bool {
        !title.trimmingCharacters(in: .whitespaces).isEmpty &&
        !milestoneDescription.trimmingCharacters(in: .whitespaces).isEmpty
    }

    // MARK: - Actions

    private func saveMilestone() {
        do {
            try viewModel.addMilestone(
                title: title.trimmingCharacters(in: .whitespaces),
                description: milestoneDescription.trimmingCharacters(in: .whitespaces),
                category: selectedCategory
            )
            dismiss()
        } catch {
            errorMessage = "Failed to create milestone: \(error.localizedDescription)"
            showError = true
        }
    }
}

// MARK: - Preview

#Preview {
    @Previewable @State var viewModel: GrowthViewModel = {
        let container = PreviewContainer.create()
        let context = container.mainContext

        return GrowthViewModel(modelContext: context, coupleId: UUID())
    }()

    AddMilestoneSheet(viewModel: viewModel)
}
