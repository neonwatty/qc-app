//
//  ProfileSettingsView.swift
//  QualityControl
//
//  Week 7: Settings System
//  Profile and relationship settings with onboarding integration
//

import SwiftUI
import SwiftData

struct ProfileSettingsView: View {

    // MARK: - Properties

    @Bindable var viewModel: SettingsViewModel
    @Binding var showOnboarding: Bool

    @State private var showSaveConfirmation = false
    @State private var showError = false
    @State private var errorMessage = ""

    // MARK: - Body

    var body: some View {
        Form {
            onboardingSection
            profileSection
            relationshipSection
            saveSection
        }
        .navigationTitle("Profile & Relationship")
        .navigationBarTitleDisplayMode(.inline)
        .alert("Success", isPresented: $showSaveConfirmation) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Your profile has been updated successfully.")
        }
        .alert("Error", isPresented: $showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(errorMessage)
        }
    }

    // MARK: - Sections

    private var onboardingSection: some View {
        Section {
            Button(action: { showOnboarding = true }) {
                HStack {
                    Image(systemName: "arrow.triangle.2.circlepath")
                        .foregroundStyle(QCColors.primary)

                    Text("Redo Onboarding")
                        .font(QCTypography.button)
                        .foregroundStyle(QCColors.primary)

                    Spacer()

                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundStyle(QCColors.textSecondary)
                }
                .padding(.vertical, QCSpacing.xs)
            }
        } footer: {
            Text("Walk through the onboarding flow again to update your preferences.")
                .font(QCTypography.captionSmall)
        }
    }

    private var profileSection: some View {
        Section {
            HStack {
                Text("Your Name")
                    .frame(width: 100, alignment: .leading)

                TextField("Enter your name", text: $viewModel.userName)
                    .textFieldStyle(.roundedBorder)
            }

            HStack {
                Text("Your Email")
                    .frame(width: 100, alignment: .leading)

                TextField("Enter your email", text: $viewModel.userEmail)
                    .textFieldStyle(.roundedBorder)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
            }
        } header: {
            Text("Your Profile")
        }
    }

    private var relationshipSection: some View {
        Section {
            HStack {
                Text("Partner Name")
                    .frame(width: 120, alignment: .leading)

                TextField("Partner's name", text: $viewModel.partnerName)
                    .textFieldStyle(.roundedBorder)
            }

            DatePicker(
                "Relationship Start",
                selection: $viewModel.relationshipStartDate,
                displayedComponents: .date
            )
        } header: {
            Text("Relationship")
        }
    }

    private var saveSection: some View {
        Section {
            Button(action: saveProfile) {
                HStack {
                    Spacer()

                    Text("Save Changes")
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

    private func saveProfile() {
        do {
            try viewModel.saveProfile()
            showSaveConfirmation = true
        } catch {
            errorMessage = "Failed to save profile: \(error.localizedDescription)"
            showError = true
        }
    }
}

// MARK: - Preview

#Preview {
    {
        let viewModel = SettingsViewModel(
            modelContext: ModelContext(ModelContainer.shared),
            currentUserId: UUID()
        )
        viewModel.userName = "Jeremy"
        viewModel.userEmail = "jeremy@example.com"
        viewModel.partnerName = "Partner"

        return NavigationStack {
            ProfileSettingsView(viewModel: viewModel, showOnboarding: .constant(false))
        }
    }()
}
