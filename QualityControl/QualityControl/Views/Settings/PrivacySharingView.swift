//
//  PrivacySharingView.swift
//  QualityControl
//
//  Week 7: Settings System
//  Control privacy and data sharing between partners
//

import SwiftUI

struct PrivacySharingView: View {

    // MARK: - Properties

    @AppStorage("shareNotes") private var shareNotes = true
    @AppStorage("shareMilestones") private var shareMilestones = true
    @AppStorage("shareCheckInHistory") private var shareCheckInHistory = true
    @AppStorage("shareLoveLanguages") private var shareLoveLanguages = true
    @AppStorage("autoShareNotes") private var autoShareNotes = false
    @AppStorage("requireApproval") private var requireApproval = true

    // MARK: - Body

    var body: some View {
        Form {
            sharingSection
            privacySection
            dataSection
        }
        .navigationTitle("Privacy & Sharing")
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: - Sections

    private var sharingSection: some View {
        Section {
            Toggle("Share Notes", isOn: $shareNotes)
                .font(QCTypography.body)

            Toggle("Share Milestones", isOn: $shareMilestones)
                .font(QCTypography.body)

            Toggle("Share Check-in History", isOn: $shareCheckInHistory)
                .font(QCTypography.body)

            Toggle("Share Love Languages", isOn: $shareLoveLanguages)
                .font(QCTypography.body)
        } header: {
            Text("What To Share")
        } footer: {
            Text("Control what information is visible to your partner.")
                .font(QCTypography.captionSmall)
        }
    }

    private var privacySection: some View {
        Section {
            Toggle("Auto-share New Notes", isOn: $autoShareNotes)
                .font(QCTypography.body)
                .disabled(!shareNotes)

            Toggle("Require Approval for Sharing", isOn: $requireApproval)
                .font(QCTypography.body)
        } header: {
            Text("Privacy Settings")
        } footer: {
            VStack(alignment: .leading, spacing: QCSpacing.xs) {
                if autoShareNotes {
                    Text("• New notes will automatically be visible to your partner")
                } else {
                    Text("• You'll manually choose which notes to share")
                }
                if requireApproval {
                    Text("• Partner must approve before seeing shared content")
                }
            }
            .font(QCTypography.captionSmall)
        }
    }

    private var dataSection: some View {
        Section {
            NavigationLink(destination: Text("Download Your Data")) {
                HStack {
                    Image(systemName: "arrow.down.doc")
                        .foregroundStyle(QCColors.info)
                    Text("Download Your Data")
                        .font(QCTypography.body)
                }
            }

            NavigationLink(destination: Text("Delete Your Data")) {
                HStack {
                    Image(systemName: "trash")
                        .foregroundStyle(QCColors.error)
                    Text("Delete Your Data")
                        .font(QCTypography.body)
                        .foregroundStyle(QCColors.error)
                }
            }
        } header: {
            Text("Your Data")
        } footer: {
            Text("You can request a copy of your data or permanently delete your account.")
                .font(QCTypography.captionSmall)
        }
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        PrivacySharingView()
    }
}
