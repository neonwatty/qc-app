//
//  DiscussionCategoriesView.swift
//  QualityControl
//
//  Week 7: Settings System
//  Manage discussion categories for check-ins
//

import SwiftUI
import SwiftData

struct DiscussionCategoriesView: View {

    // MARK: - Properties

    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Category.name) private var categories: [Category]

    @State private var showAddCategory = false
    @State private var selectedCategory: Category?
    @State private var showEditPrompts = false

    // MARK: - Body

    var body: some View {
        List {
            defaultCategoriesSection
            customCategoriesSection
        }
        .navigationTitle("Discussion Categories")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button(action: { showAddCategory = true }) {
                    Image(systemName: "plus")
                        .foregroundStyle(QCColors.primary)
                }
            }
        }
        .sheet(isPresented: $showAddCategory) {
            AddCategorySheet(modelContext: modelContext)
        }
        .sheet(item: $selectedCategory) { category in
            EditPromptsSheet(category: category, modelContext: modelContext)
        }
    }

    // MARK: - Sections

    private var defaultCategoriesSection: some View {
        Section {
            ForEach(defaultCategories) { category in
                CategoryRow(category: category) {
                    selectedCategory = category
                }
            }
        } header: {
            Text("Default Categories")
        } footer: {
            Text("These categories are built-in and always available during check-ins.")
                .font(QCTypography.captionSmall)
        }
    }

    private var customCategoriesSection: some View {
        Section {
            if customCategories.isEmpty {
                Text("No custom categories yet")
                    .font(QCTypography.body)
                    .foregroundStyle(QCColors.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, QCSpacing.md)
            } else {
                ForEach(customCategories) { category in
                    CategoryRow(category: category) {
                        selectedCategory = category
                    }
                    .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                        Button(role: .destructive) {
                            deleteCategory(category)
                        } label: {
                            Label("Delete", systemImage: "trash")
                        }
                    }
                }
            }
        } header: {
            Text("Custom Categories")
        } footer: {
            Text("Create your own discussion categories tailored to your relationship.")
                .font(QCTypography.captionSmall)
        }
    }

    // MARK: - Computed Properties

    private var defaultCategories: [Category] {
        categories.filter { $0.isDefault }
    }

    private var customCategories: [Category] {
        categories.filter { !$0.isDefault }
    }

    // MARK: - Actions

    private func deleteCategory(_ category: Category) {
        modelContext.delete(category)
        do {
            try modelContext.save()
        } catch {
            print("Error deleting category: \(error)")
        }
    }
}

// MARK: - Category Row

private struct CategoryRow: View {
    let category: Category
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: QCSpacing.md) {
                // Icon
                Image(systemName: category.icon)
                    .font(.system(size: 24, weight: .medium))
                    .foregroundStyle(Color(hex: category.colorHex))
                    .frame(width: 32)

                // Name and Description
                VStack(alignment: .leading, spacing: QCSpacing.xs) {
                    Text(category.name)
                        .font(QCTypography.body)
                        .fontWeight(.semibold)
                        .foregroundStyle(QCColors.textPrimary)

                    Text(category.categoryDescription)
                        .font(QCTypography.bodySmall)
                        .foregroundStyle(QCColors.textSecondary)
                        .lineLimit(2)
                }

                Spacer()

                // Prompts count
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(category.prompts.count)")
                        .font(QCTypography.heading5)
                        .foregroundStyle(QCColors.primary)

                    Text("prompts")
                        .font(QCTypography.captionSmall)
                        .foregroundStyle(QCColors.textSecondary)
                }

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundStyle(QCColors.textTertiary)
            }
            .padding(.vertical, QCSpacing.xs)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Add Category Sheet

private struct AddCategorySheet: View {
    @Environment(\.dismiss) private var dismiss
    let modelContext: ModelContext

    @State private var name = ""
    @State private var description = ""
    @State private var icon = "circle.fill"
    @State private var showIconPicker = false

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Category Name", text: $name)
                        .textFieldStyle(.roundedBorder)

                    TextField("Description", text: $description)
                        .textFieldStyle(.roundedBorder)

                    Button(action: { showIconPicker = true }) {
                        HStack {
                            Text("Icon")
                            Spacer()
                            Image(systemName: icon)
                                .foregroundStyle(QCColors.primary)
                            Text(icon)
                                .font(QCTypography.bodySmall)
                                .foregroundStyle(QCColors.textSecondary)
                        }
                    }
                } header: {
                    Text("Category Details")
                }

                Section {
                    Button(action: saveCategory) {
                        HStack {
                            Spacer()
                            Text("Create Category")
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
            .navigationTitle("New Category")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .sheet(isPresented: $showIconPicker) {
                IconPickerView(selectedIcon: $icon)
            }
        }
    }

    private var isValid: Bool {
        !name.trimmingCharacters(in: .whitespaces).isEmpty &&
        !description.trimmingCharacters(in: .whitespaces).isEmpty
    }

    private func saveCategory() {
        let category = Category(
            name: name.trimmingCharacters(in: .whitespaces),
            description: description.trimmingCharacters(in: .whitespaces),
            icon: icon
        )
        category.isDefault = false

        modelContext.insert(category)

        do {
            try modelContext.save()
            dismiss()
        } catch {
            print("Error saving category: \(error)")
        }
    }
}

// MARK: - Edit Prompts Sheet

private struct EditPromptsSheet: View {
    @Environment(\.dismiss) private var dismiss
    let category: Category
    let modelContext: ModelContext

    @State private var prompts: [String] = []
    @State private var newPrompt = ""

    var body: some View {
        NavigationStack {
            List {
                Section {
                    if prompts.isEmpty {
                        Text("No prompts yet")
                            .font(QCTypography.body)
                            .foregroundStyle(QCColors.textSecondary)
                            .frame(maxWidth: .infinity, alignment: .center)
                            .padding(.vertical, QCSpacing.md)
                    } else {
                        ForEach(Array(prompts.enumerated()), id: \.offset) { index, prompt in
                            Text(prompt)
                                .font(QCTypography.body)
                                .foregroundStyle(QCColors.textPrimary)
                                .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                    Button(role: .destructive) {
                                        prompts.remove(at: index)
                                    } label: {
                                        Label("Delete", systemImage: "trash")
                                    }
                                }
                        }
                        .onMove { source, destination in
                            prompts.move(fromOffsets: source, toOffset: destination)
                        }
                    }
                } header: {
                    Text("Discussion Prompts")
                } footer: {
                    Text("These prompts will be randomly shown during check-ins for this category.")
                        .font(QCTypography.captionSmall)
                }

                Section {
                    HStack {
                        TextField("Add a new prompt...", text: $newPrompt)
                            .textFieldStyle(.roundedBorder)

                        Button(action: addPrompt) {
                            Image(systemName: "plus.circle.fill")
                                .font(.system(size: 24))
                                .foregroundStyle(newPrompt.trimmingCharacters(in: .whitespaces).isEmpty ? QCColors.textTertiary : QCColors.primary)
                        }
                        .disabled(newPrompt.trimmingCharacters(in: .whitespaces).isEmpty)
                    }
                } header: {
                    Text("Add New Prompt")
                }
            }
            .navigationTitle(category.name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        savePrompts()
                    }
                }

                ToolbarItem(placement: .topBarTrailing) {
                    EditButton()
                }
            }
            .onAppear {
                prompts = category.prompts
            }
        }
    }

    private func addPrompt() {
        let trimmed = newPrompt.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { return }

        prompts.append(trimmed)
        newPrompt = ""
    }

    private func savePrompts() {
        category.prompts = prompts

        do {
            try modelContext.save()
            dismiss()
        } catch {
            print("Error saving prompts: \(error)")
        }
    }
}

// MARK: - Icon Picker View

private struct IconPickerView: View {
    @Environment(\.dismiss) private var dismiss
    @Binding var selectedIcon: String

    private let icons = [
        "heart.fill", "star.fill", "bubble.left.and.bubble.right.fill",
        "person.2.fill", "house.fill", "calendar.fill",
        "gift.fill", "sparkles", "flame.fill",
        "leaf.fill", "moon.stars.fill", "sun.max.fill",
        "cloud.fill", "bolt.fill", "drop.fill",
        "circle.fill", "square.fill", "triangle.fill"
    ]

    private let columns = Array(repeating: GridItem(.flexible()), count: 4)

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVGrid(columns: columns, spacing: QCSpacing.md) {
                    ForEach(icons, id: \.self) { icon in
                        Button(action: {
                            selectedIcon = icon
                            dismiss()
                        }) {
                            VStack(spacing: QCSpacing.xs) {
                                Image(systemName: icon)
                                    .font(.system(size: 32))
                                    .foregroundStyle(selectedIcon == icon ? QCColors.primary : QCColors.textSecondary)
                                    .frame(width: 60, height: 60)
                                    .background(selectedIcon == icon ? QCColors.primary.opacity(0.1) : Color.clear)
                                    .qcCardCornerRadius()
                            }
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding()
            }
            .navigationTitle("Select Icon")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        DiscussionCategoriesView()
            .modelContainer(PreviewContainer.create())
    }
}
