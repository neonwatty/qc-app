//
//  SessionRulesView.swift
//  QualityControl
//
//  Week 7: Settings System
//  Configure check-in session rules and preferences
//

import SwiftUI
import SwiftData

struct SessionRulesView: View {

    // MARK: - Properties

    @Bindable var viewModel: SettingsViewModel
    @State private var showSaveConfirmation = false

    // MARK: - Body

    var body: some View {
        Form {
            durationSection
            optionsSection
            saveSection
        }
        .navigationTitle("Session Rules")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            viewModel.loadSessionRules()
        }
        .alert("Success", isPresented: $showSaveConfirmation) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Your session rules have been saved.")
        }
    }

    // MARK: - Sections

    private var durationSection: some View {
        Section {
            Picker("Session Duration", selection: $viewModel.sessionDuration) {
                Text("15 minutes").tag(15)
                Text("30 minutes").tag(30)
                Text("45 minutes").tag(45)
                Text("60 minutes").tag(60)
                Text("90 minutes").tag(90)
            }
            .pickerStyle(.menu)
        } header: {
            Text("Duration")
        } footer: {
            Text("Recommended session duration for check-ins.")
                .font(QCTypography.captionSmall)
        }
    }

    private var optionsSection: some View {
        Section {
            Toggle("Allow Pauses", isOn: $viewModel.allowPauses)
                .font(QCTypography.body)

            Toggle("Require Timer", isOn: $viewModel.requireTimer)
                .font(QCTypography.body)
        } header: {
            Text("Session Options")
        } footer: {
            VStack(alignment: .leading, spacing: QCSpacing.xs) {
                if viewModel.allowPauses {
                    Text("• Sessions can be paused and resumed")
                }
                if viewModel.requireTimer {
                    Text("• Timer must be used during sessions")
                }
                if !viewModel.allowPauses && !viewModel.requireTimer {
                    Text("No special rules configured.")
                }
            }
            .font(QCTypography.captionSmall)
        }
    }

    private var saveSection: some View {
        Section {
            Button(action: saveRules) {
                HStack {
                    Spacer()

                    Text("Save Session Rules")
                        .font(QCTypography.button)
                        .foregroundStyle(.white)

                    Spacer()
                }
                .padding(.vertical, QCSpacing.sm)
                .background(QCColors.primary)
                .cornerRadius(QCSpacing.md)
            }
            .listRowInsets(EdgeInsets())
            .listRowBackground(Color.clear)
        }
    }

    // MARK: - Actions

    private func saveRules() {
        viewModel.saveSessionRules()
        showSaveConfirmation = true
    }
}

// MARK: - Preview

#Preview {
    let viewModel = SettingsViewModel(
        modelContext: ModelContext(ModelContainer.shared),
        currentUserId: UUID()
    )

    NavigationStack {
        SessionRulesView(viewModel: viewModel)
    }
}
