//
//  OnboardingFlowView.swift
//  QualityControl
//
//  Week 6: Onboarding System
//  Complete 6-step onboarding flow
//

import SwiftUI
import SwiftData

struct OnboardingFlowView: View {

    // MARK: - Properties

    @Environment(\.modelContext) private var modelContext
    @State private var viewModel: OnboardingViewModel?
    @Binding var isOnboardingComplete: Bool

    init(isOnboardingComplete: Binding<Bool>) {
        _isOnboardingComplete = isOnboardingComplete
    }

    // MARK: - Body

    var body: some View {
        Group {
            if let unwrappedViewModel = viewModel {
                OnboardingContentView(viewModel: unwrappedViewModel, onComplete: { completeOnboarding() })
            } else {
                ProgressView()
            }
        }
        .task {
            if viewModel == nil {
                viewModel = OnboardingViewModel(modelContext: modelContext)
            }
        }
    }

    // MARK: - Actions

    private func completeOnboarding() {
        Task {
            do {
                try await viewModel?.completeOnboarding()
                isOnboardingComplete = true
            } catch {
                print("Onboarding error: \(error)")
            }
        }
    }
}

// MARK: - Onboarding Content View

private struct OnboardingContentView: View {
    @Bindable var viewModel: OnboardingViewModel
    let onComplete: () -> Void

    var body: some View {
        ZStack {
            // Background
            LinearGradient(
                colors: [QCColors.primary.opacity(0.05), QCColors.secondary.opacity(0.05)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                // Progress header
                progressHeader

                // Content
                TabView(selection: $viewModel.currentStep) {
                    WelcomeStepView(viewModel: viewModel)
                        .tag(OnboardingStep.welcome)

                    ProfileSetupStepView(viewModel: viewModel)
                        .tag(OnboardingStep.profileSetup)

                    PartnerSetupStepView(viewModel: viewModel)
                        .tag(OnboardingStep.partnerSetup)

                    LoveLanguagesStepView(viewModel: viewModel)
                        .tag(OnboardingStep.loveLanguages)

                    RemindersStepView(viewModel: viewModel)
                        .tag(OnboardingStep.reminders)

                    CompletionStepView(viewModel: viewModel, onComplete: onComplete)
                        .tag(OnboardingStep.completion)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(.easeInOut, value: viewModel.currentStep)
            }
        }
    }

    private var progressHeader: some View {
        VStack(spacing: QCSpacing.sm) {
            HStack {
                Text(viewModel.progressText)
                    .font(QCTypography.body)
                    .foregroundStyle(QCColors.textSecondary)

                Spacer()

                Text(viewModel.progressPercentage)
                    .font(QCTypography.body)
                    .foregroundStyle(QCColors.textSecondary)

                Button(action: { viewModel.skip() }) {
                    HStack(spacing: QCSpacing.xs) {
                        Image(systemName: "xmark")
                        Text("Skip")
                    }
                    .font(QCTypography.body)
                    .foregroundStyle(QCColors.textSecondary)
                }
            }

            ProgressView(value: viewModel.progress)
                .tint(QCColors.primary)
        }
        .padding()
        .background(QCColors.surfaceCard)
    }
}

// MARK: - Step 1: Welcome

struct WelcomeStepView: View {
    @Bindable var viewModel: OnboardingViewModel

    var body: some View {
        ScrollView {
            VStack(spacing: QCSpacing.xl) {
                Spacer()

                // Icon
                ZStack {
                    Circle()
                        .fill(LinearGradient(
                            colors: [QCColors.primary, QCColors.secondary],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ))
                        .frame(width: 120, height: 120)

                    Image(systemName: "heart.fill")
                        .font(.system(size: 50))
                        .foregroundStyle(.white)
                }

                // Title
                Text("Welcome to Quality Control")
                    .font(QCTypography.heading1)
                    .foregroundStyle(QCColors.textPrimary)
                    .multilineTextAlignment(.center)

                // Subtitle
                Text("Let's personalize your relationship check-in experience")
                    .font(QCTypography.body)
                    .foregroundStyle(QCColors.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, QCSpacing.xl)

                // Features
                VStack(spacing: QCSpacing.md) {
                    HStack(spacing: QCSpacing.md) {
                        Image(systemName: "person.2.fill")
                            .foregroundStyle(QCColors.primary)
                        Text("5 minute setup")
                            .font(QCTypography.body)

                        Spacer()

                        Image(systemName: "sparkles")
                            .foregroundStyle(QCColors.secondary)
                        Text("Personalized experience")
                            .font(QCTypography.body)
                    }
                }
                .padding(QCSpacing.lg)
                .background(QCColors.surfaceCard)
                .cornerRadius(QCSpacing.md)
                .padding(.horizontal, QCSpacing.xl)

                // Feature cards
                HStack(spacing: QCSpacing.md) {
                    FeatureCard(icon: "message.fill", title: "Communication")
                    FeatureCard(icon: "heart.circle.fill", title: "Love Languages")
                    FeatureCard(icon: "bell.fill", title: "Reminders")
                }
                .padding(.horizontal, QCSpacing.xl)

                Spacer()

                // CTA button
                Button(action: { viewModel.nextStep() }) {
                    Text("Let's Get Started")
                        .font(QCTypography.heading3)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(LinearGradient(
                            colors: [QCColors.primary, QCColors.secondary],
                            startPoint: .leading,
                            endPoint: .trailing
                        ))
                        .cornerRadius(QCSpacing.md)
                }
                .padding(.horizontal, QCSpacing.xl)

                Spacer()
            }
            .padding()
        }
    }
}

struct FeatureCard: View {
    let icon: String
    let title: String

    var body: some View {
        VStack(spacing: QCSpacing.sm) {
            Image(systemName: icon)
                .font(.system(size: 32))
                .foregroundStyle(QCColors.primary)

            Text(title)
                .font(QCTypography.captionSmall)
                .foregroundStyle(QCColors.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(QCColors.surfaceCard)
        .cornerRadius(QCSpacing.md)
    }
}

// MARK: - Step 2: Profile Setup

struct ProfileSetupStepView: View {
    @Bindable var viewModel: OnboardingViewModel

    var body: some View {
        ScrollView {
            VStack(spacing: QCSpacing.xl) {
                Text("Tell us about yourself")
                    .font(QCTypography.heading2)
                    .foregroundStyle(QCColors.textPrimary)

                VStack(spacing: QCSpacing.lg) {
                    VStack(alignment: .leading, spacing: QCSpacing.sm) {
                        Text("Your Name")
                            .font(QCTypography.bodySmall)
                            .foregroundStyle(QCColors.textSecondary)

                        TextField("Enter your name", text: $viewModel.userName)
                            .textFieldStyle(.roundedBorder)
                            .font(QCTypography.body)
                    }

                    VStack(alignment: .leading, spacing: QCSpacing.sm) {
                        Text("Your Email")
                            .font(QCTypography.bodySmall)
                            .foregroundStyle(QCColors.textSecondary)

                        TextField("Enter your email", text: $viewModel.userEmail)
                            .textFieldStyle(.roundedBorder)
                            .font(QCTypography.body)
                            .keyboardType(.emailAddress)
                            .textInputAutocapitalization(.never)
                    }
                }
                .padding(.horizontal, QCSpacing.xl)

                Spacer()

                navigationButtons
            }
            .padding()
        }
    }

    private var navigationButtons: some View {
        HStack(spacing: QCSpacing.md) {
            Button(action: { viewModel.previousStep() }) {
                Text("Back")
                    .font(QCTypography.body)
                    .foregroundStyle(QCColors.textSecondary)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(QCColors.surfaceCard)
                    .cornerRadius(QCSpacing.md)
            }

            Button(action: { viewModel.nextStep() }) {
                Text("Continue")
                    .font(QCTypography.body)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(viewModel.canProceed ? QCColors.primary : QCColors.textSecondary)
                    .cornerRadius(QCSpacing.md)
            }
            .disabled(!viewModel.canProceed)
        }
        .padding(.horizontal, QCSpacing.xl)
    }
}

// MARK: - Step 3: Partner Setup

struct PartnerSetupStepView: View {
    @Bindable var viewModel: OnboardingViewModel

    var body: some View {
        ScrollView {
            VStack(spacing: QCSpacing.xl) {
                Text("Tell us about your partner")
                    .font(QCTypography.heading2)
                    .foregroundStyle(QCColors.textPrimary)

                VStack(spacing: QCSpacing.lg) {
                    VStack(alignment: .leading, spacing: QCSpacing.sm) {
                        Text("Partner's Name")
                            .font(QCTypography.bodySmall)
                            .foregroundStyle(QCColors.textSecondary)

                        TextField("Enter partner's name", text: $viewModel.partnerName)
                            .textFieldStyle(.roundedBorder)
                            .font(QCTypography.body)
                    }

                    VStack(alignment: .leading, spacing: QCSpacing.sm) {
                        Text("Partner's Email (Optional)")
                            .font(QCTypography.bodySmall)
                            .foregroundStyle(QCColors.textSecondary)

                        TextField("Enter partner's email", text: $viewModel.partnerEmail)
                            .textFieldStyle(.roundedBorder)
                            .font(QCTypography.body)
                            .keyboardType(.emailAddress)
                            .textInputAutocapitalization(.never)
                    }

                    VStack(alignment: .leading, spacing: QCSpacing.sm) {
                        Text("Relationship Start Date")
                            .font(QCTypography.bodySmall)
                            .foregroundStyle(QCColors.textSecondary)

                        DatePicker("", selection: $viewModel.relationshipStartDate, displayedComponents: .date)
                            .datePickerStyle(.compact)
                    }
                }
                .padding(.horizontal, QCSpacing.xl)

                Spacer()

                navigationButtons
            }
            .padding()
        }
    }

    private var navigationButtons: some View {
        HStack(spacing: QCSpacing.md) {
            Button(action: { viewModel.previousStep() }) {
                Text("Back")
                    .font(QCTypography.body)
                    .foregroundStyle(QCColors.textSecondary)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(QCColors.surfaceCard)
                    .cornerRadius(QCSpacing.md)
            }

            Button(action: { viewModel.nextStep() }) {
                Text("Continue")
                    .font(QCTypography.body)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(viewModel.canProceed ? QCColors.primary : QCColors.textSecondary)
                    .cornerRadius(QCSpacing.md)
            }
            .disabled(!viewModel.canProceed)
        }
        .padding(.horizontal, QCSpacing.xl)
    }
}

// MARK: - Step 4: Love Languages

struct LoveLanguagesStepView: View {
    @Bindable var viewModel: OnboardingViewModel

    var body: some View {
        ScrollView {
            VStack(spacing: QCSpacing.xl) {
                Text("Love Languages")
                    .font(QCTypography.heading2)
                    .foregroundStyle(QCColors.textPrimary)

                Text("You can add your specific love languages later")
                    .font(QCTypography.body)
                    .foregroundStyle(QCColors.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, QCSpacing.xl)

                Toggle("Set up Love Languages", isOn: $viewModel.setupLoveLanguages)
                    .padding(.horizontal, QCSpacing.xl)

                Spacer()

                navigationButtons
            }
            .padding()
        }
    }

    private var navigationButtons: some View {
        HStack(spacing: QCSpacing.md) {
            Button(action: { viewModel.previousStep() }) {
                Text("Back")
                    .font(QCTypography.body)
                    .foregroundStyle(QCColors.textSecondary)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(QCColors.surfaceCard)
                    .cornerRadius(QCSpacing.md)
            }

            Button(action: { viewModel.nextStep() }) {
                Text("Continue")
                    .font(QCTypography.body)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(QCColors.primary)
                    .cornerRadius(QCSpacing.md)
            }
        }
        .padding(.horizontal, QCSpacing.xl)
    }
}

// MARK: - Step 5: Reminders

struct RemindersStepView: View {
    @Bindable var viewModel: OnboardingViewModel

    var body: some View {
        ScrollView {
            VStack(spacing: QCSpacing.xl) {
                Text("Stay Connected")
                    .font(QCTypography.heading2)
                    .foregroundStyle(QCColors.textPrimary)

                Text("Get reminders for check-ins and important moments")
                    .font(QCTypography.body)
                    .foregroundStyle(QCColors.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, QCSpacing.xl)

                Toggle("Enable Reminders", isOn: $viewModel.setupReminders)
                    .padding(.horizontal, QCSpacing.xl)

                Spacer()

                navigationButtons
            }
            .padding()
        }
    }

    private var navigationButtons: some View {
        HStack(spacing: QCSpacing.md) {
            Button(action: { viewModel.previousStep() }) {
                Text("Back")
                    .font(QCTypography.body)
                    .foregroundStyle(QCColors.textSecondary)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(QCColors.surfaceCard)
                    .cornerRadius(QCSpacing.md)
            }

            Button(action: { viewModel.nextStep() }) {
                Text("Continue")
                    .font(QCTypography.body)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(QCColors.primary)
                    .cornerRadius(QCSpacing.md)
            }
        }
        .padding(.horizontal, QCSpacing.xl)
    }
}

// MARK: - Step 6: Completion

struct CompletionStepView: View {
    @Bindable var viewModel: OnboardingViewModel
    let onComplete: () -> Void

    var body: some View {
        ScrollView {
            VStack(spacing: QCSpacing.xl) {
                Spacer()

                // Success icon
                ZStack {
                    Circle()
                        .fill(QCColors.success.opacity(0.2))
                        .frame(width: 120, height: 120)

                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 60))
                        .foregroundStyle(QCColors.success)
                }

                Text("You're All Set!")
                    .font(QCTypography.heading1)
                    .foregroundStyle(QCColors.textPrimary)

                Text("Welcome to Quality Control, \(viewModel.userName)!")
                    .font(QCTypography.body)
                    .foregroundStyle(QCColors.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, QCSpacing.xl)

                Spacer()

                Button(action: onComplete) {
                    Text("Get Started")
                        .font(QCTypography.heading3)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(LinearGradient(
                            colors: [QCColors.primary, QCColors.secondary],
                            startPoint: .leading,
                            endPoint: .trailing
                        ))
                        .cornerRadius(QCSpacing.md)
                }
                .padding(.horizontal, QCSpacing.xl)

                Spacer()
            }
            .padding()
        }
    }
}

// MARK: - Preview

#Preview {
    OnboardingFlowView(isOnboardingComplete: .constant(false))
        .modelContainer(PreviewContainer.create())
}
