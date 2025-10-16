//
//  LoveLanguagesView.swift
//  QualityControl
//
//  Week 6: Love Languages System
//  Main view for managing love languages
//

import SwiftUI
import SwiftData

struct LoveLanguagesView: View {

    // MARK: - Properties

    @Environment(\.modelContext) private var modelContext
    @State private var viewModel: LoveLanguagesViewModel
    @State private var showAddLanguage = false
    @State private var languageToEdit: LoveLanguage?
    @State private var showDeleteConfirmation = false
    @State private var languageToDelete: LoveLanguage?

    private let currentUserId: UUID

    // MARK: - Initialization

    init(currentUserId: UUID) {
        self.currentUserId = currentUserId
        _viewModel = State(initialValue: LoveLanguagesViewModel(
            modelContext: ModelContext(ModelContainer.shared),
            userId: currentUserId
        ))
    }

    // MARK: - Body

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: QCSpacing.xl) {
                    // Info banner
                    infoBanner

                    // Tab selector
                    tabSelector

                    // Language groups
                    if viewModel.isLoading {
                        ProgressView()
                            .padding()
                    } else if viewModel.displayedLanguages.isEmpty {
                        emptyState
                    } else {
                        languagesList
                    }
                }
                .padding()
            }
            .background(QCColors.backgroundPrimary)
            .navigationTitle("Love Languages")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button(action: { showAddLanguage = true }) {
                        Label("Add Language", systemImage: "plus")
                            .font(QCTypography.body)
                    }
                }
            }
            .sheet(isPresented: $showAddLanguage) {
                AddLanguageSheet(
                    viewModel: viewModel,
                    languageToEdit: nil
                )
            }
            .sheet(item: $languageToEdit) { language in
                AddLanguageSheet(
                    viewModel: viewModel,
                    languageToEdit: language
                )
            }
            .alert("Delete Language", isPresented: $showDeleteConfirmation) {
                Button("Cancel", role: .cancel) {}
                Button("Delete", role: .destructive) {
                    if let language = languageToDelete {
                        deleteLanguage(language)
                    }
                }
            } message: {
                Text("Are you sure you want to delete this love language? This action cannot be undone.")
            }
            .task {
                await viewModel.loadLanguages()
            }
            .refreshable {
                await viewModel.refresh()
            }
        }
    }

    // MARK: - Subviews

    private var infoBanner: some View {
        HStack(spacing: QCSpacing.md) {
            Image(systemName: "info.circle")
                .foregroundStyle(QCColors.info)

            VStack(alignment: .leading, spacing: QCSpacing.xs) {
                Text("Love Languages help your partner understand what makes you feel most loved and appreciated. Start with a few and refine them over time as you discover more about yourself.")
                    .font(QCTypography.body)
                    .foregroundStyle(QCColors.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(QCSpacing.md)
        .background(QCColors.info.opacity(0.1))
        .cornerRadius(QCSpacing.md)
    }

    private var tabSelector: some View {
        HStack(spacing: QCSpacing.md) {
            ForEach(LanguageTab.allCases, id: \.self) { tab in
                Button(action: { viewModel.selectedTab = tab }) {
                    HStack(spacing: QCSpacing.xs) {
                        Image(systemName: tab.icon)

                        Text(tab.rawValue)
                            .font(QCTypography.body)

                        Text("(\(tab == .mine ? viewModel.totalMyLanguages : viewModel.totalPartnerLanguages))")
                            .font(QCTypography.bodySmall)
                            .foregroundStyle(QCColors.textSecondary)
                    }
                    .padding(.horizontal, QCSpacing.md)
                    .padding(.vertical, QCSpacing.sm)
                    .background(viewModel.selectedTab == tab ? QCColors.primary : Color.clear)
                    .foregroundStyle(viewModel.selectedTab == tab ? .white : QCColors.textPrimary)
                    .cornerRadius(QCSpacing.lg)
                }
            }

            Spacer()
        }
    }

    private var languagesList: some View {
        VStack(alignment: .leading, spacing: QCSpacing.lg) {
            ForEach(viewModel.groupedLanguages()) { group in
                VStack(alignment: .leading, spacing: QCSpacing.md) {
                    // Section header
                    HStack {
                        Text(group.title)
                            .font(QCTypography.heading3)
                            .foregroundStyle(QCColors.textPrimary)

                        Text("\(group.count)")
                            .font(QCTypography.bodySmall)
                            .foregroundStyle(QCColors.textSecondary)
                            .padding(.horizontal, QCSpacing.sm)
                            .padding(.vertical, QCSpacing.xs)
                            .background(QCColors.surfaceCard)
                            .cornerRadius(QCSpacing.xs)
                    }

                    // Language cards
                    ForEach(group.languages) { language in
                        LanguageCard(
                            language: language,
                            onEdit: { languageToEdit = language },
                            onDelete: {
                                languageToDelete = language
                                showDeleteConfirmation = true
                            }
                        )
                    }
                }
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: QCSpacing.md) {
            Image(systemName: viewModel.selectedTab == .mine ? "heart" : "heart.circle")
                .font(.system(size: 48))
                .foregroundStyle(QCColors.textSecondary)

            Text(viewModel.selectedTab == .mine ? "No Love Languages Yet" : "No Partner Languages")
                .font(QCTypography.heading2)
                .foregroundStyle(QCColors.textPrimary)

            Text(viewModel.selectedTab == .mine
                ? "Add your first love language to help your partner understand what makes you feel loved."
                : "Your partner hasn't shared any love languages yet.")
                .font(QCTypography.body)
                .foregroundStyle(QCColors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, QCSpacing.xl)

            if viewModel.selectedTab == .mine {
                Button(action: { showAddLanguage = true }) {
                    Text("Add Love Language")
                        .font(QCTypography.body)
                        .foregroundStyle(.white)
                        .padding(.horizontal, QCSpacing.lg)
                        .padding(.vertical, QCSpacing.md)
                        .background(QCColors.primary)
                        .cornerRadius(QCSpacing.md)
                }
                .padding(.top, QCSpacing.md)
            }
        }
        .padding(.vertical, QCSpacing.xxl)
    }

    // MARK: - Actions

    private func deleteLanguage(_ language: LoveLanguage) {
        do {
            try viewModel.deleteLanguage(language)
        } catch {
            // TODO: Show error alert
            print("Failed to delete language: \(error)")
        }
    }
}

// MARK: - Model Container Extension

extension ModelContainer {
    static var shared: ModelContainer = {
        let schema = Schema([
            User.self,
            Couple.self,
            CheckInSession.self,
            Category.self,
            Note.self,
            ActionItem.self,
            Reminder.self,
            Milestone.self,
            LoveLanguage.self,
            RelationshipRequest.self
        ])
        let configuration = ModelConfiguration(isStoredInMemoryOnly: false)

        do {
            return try ModelContainer(for: schema, configurations: configuration)
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()
}

// MARK: - Preview

#Preview {
    LoveLanguagesView(currentUserId: UUID())
        .modelContainer(PreviewContainer.create())
}
