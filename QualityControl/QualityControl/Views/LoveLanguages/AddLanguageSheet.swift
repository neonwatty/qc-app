//
//  AddLanguageSheet.swift
//  QualityControl
//
//  Week 6: Love Languages System
//  Sheet for creating and editing love languages
//

import SwiftUI
import SwiftData

struct AddLanguageSheet: View {

    // MARK: - Properties

    @Environment(\.dismiss) private var dismiss
    @Bindable var viewModel: LoveLanguagesViewModel
    let languageToEdit: LoveLanguage?

    // Form state
    @State private var category: LoveLanguageCategory = .words
    @State private var title: String = ""
    @State private var description: String = ""
    @State private var examples: [String] = [""]
    @State private var importance: Importance = .medium
    @State private var privacy: NotePrivacy = .shared
    @State private var tagInput: String = ""
    @State private var tags: [String] = []

    @State private var showError: Bool = false
    @State private var errorMessage: String = ""

    // MARK: - Computed Properties

    private var isEditing: Bool {
        languageToEdit != nil
    }

    private var navigationTitle: String {
        isEditing ? "Edit Love Language" : "Add Love Language"
    }

    private var canSave: Bool {
        !title.trimmingCharacters(in: .whitespaces).isEmpty &&
        !description.trimmingCharacters(in: .whitespaces).isEmpty
    }

    // MARK: - Body

    var body: some View {
        NavigationStack {
            Form {
                categorySection
                detailsSection
                examplesSection
                settingsSection
                tagsSection
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
                        saveLanguage()
                    }
                    .disabled(!canSave)
                }
            }
            .alert("Error", isPresented: $showError) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(errorMessage)
            }
            .onAppear {
                loadLanguageData()
            }
        }
    }

    // MARK: - Form Sections

    private var categorySection: some View {
        Section {
            Picker("Category", selection: $category) {
                ForEach(LoveLanguageCategory.allCases, id: \.self) { cat in
                    HStack {
                        Text(cat.icon)
                        Text(cat.displayName)
                    }
                    .tag(cat)
                }
            }
            .pickerStyle(.navigationLink)
        } header: {
            Text("Category")
                .font(QCTypography.bodySmall)
        } footer: {
            Text(categoryDescription)
                .font(QCTypography.captionSmall)
        }
    }

    private var detailsSection: some View {
        Section {
            TextField("Title", text: $title)
                .font(QCTypography.body)

            TextField("Description", text: $description, axis: .vertical)
                .font(QCTypography.body)
                .lineLimit(3...6)
        } header: {
            Text("Details")
                .font(QCTypography.bodySmall)
        } footer: {
            Text("Describe what makes you feel loved in this category.")
                .font(QCTypography.captionSmall)
        }
    }

    private var examplesSection: some View {
        Section {
            ForEach(examples.indices, id: \.self) { index in
                HStack {
                    TextField("Example \(index + 1)", text: $examples[index])
                        .font(QCTypography.body)

                    if examples.count > 1 {
                        Button(action: { removeExample(at: index) }) {
                            Image(systemName: "minus.circle.fill")
                                .foregroundStyle(QCColors.error)
                        }
                    }
                }
            }

            Button(action: addExample) {
                Label("Add Example", systemImage: "plus.circle.fill")
                    .font(QCTypography.body)
                    .foregroundStyle(QCColors.primary)
            }
        } header: {
            Text("Examples (Optional)")
                .font(QCTypography.bodySmall)
        } footer: {
            Text("Provide specific examples to help your partner understand.")
                .font(QCTypography.captionSmall)
        }
    }

    private var settingsSection: some View {
        Section {
            Picker("Importance", selection: $importance) {
                ForEach([Importance.low, .medium, .high, .essential], id: \.self) { imp in
                    Text(imp.displayName)
                        .tag(imp)
                }
            }
            .font(QCTypography.body)

            Picker("Privacy", selection: $privacy) {
                Text("Shared with Partner").tag(NotePrivacy.shared)
                Text("Private").tag(NotePrivacy.private)
            }
            .font(QCTypography.body)
        } header: {
            Text("Settings")
                .font(QCTypography.bodySmall)
        } footer: {
            Text(privacy == .shared
                ? "Your partner can see this love language."
                : "Only you can see this love language.")
                .font(QCTypography.captionSmall)
        }
    }

    private var tagsSection: some View {
        Section {
            HStack {
                TextField("Add tag", text: $tagInput)
                    .font(QCTypography.body)
                    .textInputAutocapitalization(.never)
                    .onSubmit {
                        addTag()
                    }

                Button(action: addTag) {
                    Image(systemName: "plus.circle.fill")
                        .foregroundStyle(QCColors.primary)
                }
                .disabled(tagInput.trimmingCharacters(in: .whitespaces).isEmpty)
            }

            if !tags.isEmpty {
                FlowLayout(spacing: QCSpacing.sm) {
                    ForEach(tags, id: \.self) { tag in
                        HStack(spacing: QCSpacing.xs) {
                            Text(tag)
                                .font(QCTypography.captionSmall)

                            Button(action: { removeTag(tag) }) {
                                Image(systemName: "xmark.circle.fill")
                                    .font(.caption)
                            }
                        }
                        .padding(.horizontal, QCSpacing.sm)
                        .padding(.vertical, QCSpacing.xs)
                        .background(QCColors.primary.opacity(0.1))
                        .foregroundStyle(QCColors.primary)
                        .cornerRadius(QCSpacing.lg)
                    }
                }
            }
        } header: {
            Text("Tags (Optional)")
                .font(QCTypography.bodySmall)
        }
    }

    private var deleteSection: some View {
        Section {
            Button(role: .destructive) {
                deleteLanguage()
            } label: {
                HStack {
                    Spacer()
                    Label("Delete Love Language", systemImage: "trash")
                        .font(QCTypography.body)
                    Spacer()
                }
            }
        }
    }

    // MARK: - Helper Properties

    private var categoryDescription: String {
        switch category {
        case .words:
            return "Expressing love through spoken or written words of appreciation and encouragement."
        case .time:
            return "Giving someone your undivided attention and spending quality time together."
        case .gifts:
            return "Showing love through thoughtful presents that show you were thinking of them."
        case .touch:
            return "Expressing affection through physical touch, hugs, and closeness."
        case .acts:
            return "Doing things to help or ease their burden as a way of showing love."
        }
    }

    // MARK: - Actions

    private func loadLanguageData() {
        guard let language = languageToEdit else { return }

        category = language.category
        title = language.title
        description = language.languageDescription
        examples = language.examples.isEmpty ? [""] : language.examples
        importance = language.importance
        privacy = language.privacy
        tags = language.tags
    }

    private func saveLanguage() {
        do {
            let trimmedTitle = title.trimmingCharacters(in: .whitespaces)
            let trimmedDescription = description.trimmingCharacters(in: .whitespaces)
            let cleanExamples = examples
                .map { $0.trimmingCharacters(in: .whitespaces) }
                .filter { !$0.isEmpty }

            if let language = languageToEdit {
                // Update existing
                try viewModel.updateLanguage(
                    language,
                    title: trimmedTitle,
                    description: trimmedDescription,
                    examples: cleanExamples,
                    importance: importance,
                    privacy: privacy,
                    tags: tags
                )
            } else {
                // Create new
                _ = try viewModel.createLanguage(
                    category: category,
                    title: trimmedTitle,
                    description: trimmedDescription,
                    examples: cleanExamples,
                    importance: importance,
                    privacy: privacy,
                    tags: tags
                )
            }

            dismiss()
        } catch {
            errorMessage = "Failed to save love language: \(error.localizedDescription)"
            showError = true
        }
    }

    private func deleteLanguage() {
        guard let language = languageToEdit else { return }

        do {
            try viewModel.deleteLanguage(language)
            dismiss()
        } catch {
            errorMessage = "Failed to delete love language: \(error.localizedDescription)"
            showError = true
        }
    }

    private func addExample() {
        examples.append("")
    }

    private func removeExample(at index: Int) {
        examples.remove(at: index)
    }

    private func addTag() {
        let trimmed = tagInput.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty, !tags.contains(trimmed) else { return }

        tags.append(trimmed)
        tagInput = ""
    }

    private func removeTag(_ tag: String) {
        tags.removeAll { $0 == tag }
    }
}

// MARK: - Flow Layout

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = FlowResult(
            in: proposal.replacingUnspecifiedDimensions().width,
            subviews: subviews,
            spacing: spacing
        )
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = FlowResult(
            in: bounds.width,
            subviews: subviews,
            spacing: spacing
        )
        for (index, subview) in subviews.enumerated() {
            subview.place(at: CGPoint(x: bounds.minX + result.positions[index].x, y: bounds.minY + result.positions[index].y), proposal: .unspecified)
        }
    }

    struct FlowResult {
        var size: CGSize = .zero
        var positions: [CGPoint] = []

        init(in maxWidth: CGFloat, subviews: Subviews, spacing: CGFloat) {
            var x: CGFloat = 0
            var y: CGFloat = 0
            var lineHeight: CGFloat = 0

            for subview in subviews {
                let size = subview.sizeThatFits(.unspecified)

                if x + size.width > maxWidth && x > 0 {
                    x = 0
                    y += lineHeight + spacing
                    lineHeight = 0
                }

                positions.append(CGPoint(x: x, y: y))
                lineHeight = max(lineHeight, size.height)
                x += size.width + spacing
            }

            self.size = CGSize(width: maxWidth, height: y + lineHeight)
        }
    }
}

// MARK: - Preview

#Preview {
    let container = PreviewContainer.create()
    let context = container.mainContext

    let userDescriptor = FetchDescriptor<User>()
    let user = try? context.fetch(userDescriptor).first

    let viewModel = LoveLanguagesViewModel(
        modelContext: context,
        userId: user?.id ?? UUID()
    )

    AddLanguageSheet(viewModel: viewModel, languageToEdit: nil)
        .modelContainer(container)
}
