//
//  AboutView.swift
//  QualityControl
//
//  Week 7: Settings System
//  App information, support, and legal
//

import SwiftUI

struct AboutView: View {

    // MARK: - Properties

    private let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
    private let buildNumber = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"

    @State private var showShareSheet = false

    // MARK: - Body

    var body: some View {
        Form {
            appInfoSection
            supportSection
            communitySection
            legalSection
        }
        .navigationTitle("About")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showShareSheet) {
            ShareSheet(items: ["Check out Quality Control - the relationship check-in app!"])
        }
    }

    // MARK: - Sections

    private var appInfoSection: some View {
        Section {
            VStack(spacing: QCSpacing.lg) {
                // App Icon
                Image(systemName: "heart.circle.fill")
                    .font(.system(size: 80))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [QCColors.primary, QCColors.secondary],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )

                VStack(spacing: QCSpacing.xs) {
                    Text("Quality Control")
                        .font(QCTypography.heading3)
                        .foregroundStyle(QCColors.textPrimary)

                    Text("Relationship Check-in App")
                        .font(QCTypography.body)
                        .foregroundStyle(QCColors.textSecondary)

                    Text("Version \(appVersion) (\(buildNumber))")
                        .font(QCTypography.captionSmall)
                        .foregroundStyle(QCColors.textTertiary)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, QCSpacing.md)
        }
        .listRowBackground(Color.clear)
    }

    private var supportSection: some View {
        Section {
            NavigationLink(destination: Text("Help Center")) {
                Label("Help Center", systemImage: "questionmark.circle")
                    .font(QCTypography.body)
            }

            NavigationLink(destination: Text("Contact Support")) {
                Label("Contact Support", systemImage: "envelope")
                    .font(QCTypography.body)
            }

            NavigationLink(destination: Text("FAQs")) {
                Label("Frequently Asked Questions", systemImage: "list.bullet.clipboard")
                    .font(QCTypography.body)
            }

            Button(action: { showShareSheet = true }) {
                HStack {
                    Label("Share Quality Control", systemImage: "square.and.arrow.up")
                        .font(QCTypography.body)
                        .foregroundStyle(QCColors.textPrimary)

                    Spacer()

                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundStyle(QCColors.textTertiary)
                }
            }
        } header: {
            Text("Support")
        }
    }

    private var communitySection: some View {
        Section {
            Link(destination: URL(string: "https://github.com")!) {
                HStack {
                    Label("Follow on Twitter", systemImage: "sparkles")
                        .font(QCTypography.body)

                    Spacer()

                    Image(systemName: "arrow.up.right")
                        .font(.caption)
                        .foregroundStyle(QCColors.textTertiary)
                }
            }

            Link(destination: URL(string: "https://github.com")!) {
                HStack {
                    Label("Join Community", systemImage: "person.3")
                        .font(QCTypography.body)

                    Spacer()

                    Image(systemName: "arrow.up.right")
                        .font(.caption)
                        .foregroundStyle(QCColors.textTertiary)
                }
            }

            Link(destination: URL(string: "https://github.com")!) {
                HStack {
                    Label("Rate on App Store", systemImage: "star")
                        .font(QCTypography.body)

                    Spacer()

                    Image(systemName: "arrow.up.right")
                        .font(.caption)
                        .foregroundStyle(QCColors.textTertiary)
                }
            }
        } header: {
            Text("Community")
        }
    }

    private var legalSection: some View {
        Section {
            NavigationLink(destination: Text("Privacy Policy")) {
                Label("Privacy Policy", systemImage: "hand.raised")
                    .font(QCTypography.body)
            }

            NavigationLink(destination: Text("Terms of Service")) {
                Label("Terms of Service", systemImage: "doc.text")
                    .font(QCTypography.body)
            }

            NavigationLink(destination: Text("Open Source Licenses")) {
                Label("Open Source Licenses", systemImage: "scroll")
                    .font(QCTypography.body)
            }

            NavigationLink(destination: Text("Acknowledgments")) {
                Label("Acknowledgments", systemImage: "heart.text.square")
                    .font(QCTypography.body)
            }
        } header: {
            Text("Legal")
        } footer: {
            VStack(alignment: .center, spacing: QCSpacing.xs) {
                Text("Made with ❤️ for couples everywhere")
                    .font(QCTypography.captionSmall)
                    .foregroundStyle(QCColors.textSecondary)

                Text("© 2025 Quality Control. All rights reserved.")
                    .font(QCTypography.captionSmall)
                    .foregroundStyle(QCColors.textTertiary)
            }
            .frame(maxWidth: .infinity)
            .padding(.top, QCSpacing.md)
        }
    }
}

// MARK: - Share Sheet

struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

// MARK: - Preview

#Preview {
    NavigationStack {
        AboutView()
    }
}
