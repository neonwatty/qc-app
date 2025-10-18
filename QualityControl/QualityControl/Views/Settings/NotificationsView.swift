//
//  NotificationsView.swift
//  QualityControl
//
//  Week 7: Settings System
//  Configure app notifications and reminders
//

import SwiftUI

struct NotificationsView: View {

    // MARK: - Properties

    @AppStorage("notificationsEnabled") private var notificationsEnabled = true
    @AppStorage("checkInReminders") private var checkInReminders = true
    @AppStorage("partnerRequests") private var partnerRequests = true
    @AppStorage("milestoneNotifications") private var milestoneNotifications = true
    @AppStorage("noteSharing") private var noteSharing = true
    @AppStorage("dailyReminderTime") private var dailyReminderTime = Date()
    @AppStorage("reminderFrequency") private var reminderFrequency = "daily"

    @State private var showPermissionAlert = false

    // MARK: - Body

    var body: some View {
        Form {
            generalSection
            typesSection
            scheduleSection
            soundSection
        }
        .navigationTitle("Notifications")
        .navigationBarTitleDisplayMode(.inline)
        .alert("Notifications Disabled", isPresented: $showPermissionAlert) {
            Button("Open Settings", role: .cancel) {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Please enable notifications in your device settings to receive Quality Control reminders.")
        }
    }

    // MARK: - Sections

    private var generalSection: some View {
        Section {
            Toggle("Enable Notifications", isOn: $notificationsEnabled)
                .font(QCTypography.body)
                .onChange(of: notificationsEnabled) { oldValue, newValue in
                    if newValue {
                        requestNotificationPermission()
                    }
                }
        } header: {
            Text("General")
        } footer: {
            Text("Allow Quality Control to send you reminders and updates.")
                .font(QCTypography.captionSmall)
        }
    }

    private var typesSection: some View {
        Section {
            Toggle("Check-in Reminders", isOn: $checkInReminders)
                .font(QCTypography.body)
                .disabled(!notificationsEnabled)

            Toggle("Partner Requests", isOn: $partnerRequests)
                .font(QCTypography.body)
                .disabled(!notificationsEnabled)

            Toggle("Milestone Achievements", isOn: $milestoneNotifications)
                .font(QCTypography.body)
                .disabled(!notificationsEnabled)

            Toggle("Note Sharing", isOn: $noteSharing)
                .font(QCTypography.body)
                .disabled(!notificationsEnabled)
        } header: {
            Text("Notification Types")
        } footer: {
            VStack(alignment: .leading, spacing: QCSpacing.xs) {
                if checkInReminders {
                    Text("• Reminders for upcoming check-ins")
                }
                if partnerRequests {
                    Text("• Alerts when your partner sends a request")
                }
                if milestoneNotifications {
                    Text("• Celebrations when you reach milestones")
                }
                if noteSharing {
                    Text("• Updates when notes are shared")
                }
                if !notificationsEnabled {
                    Text("Enable notifications to customize types")
                        .foregroundStyle(QCColors.textTertiary)
                }
            }
            .font(QCTypography.captionSmall)
        }
    }

    private var scheduleSection: some View {
        Section {
            Picker("Reminder Frequency", selection: $reminderFrequency) {
                Text("Daily").tag("daily")
                Text("Every Other Day").tag("alternate")
                Text("Weekly").tag("weekly")
                Text("Bi-Weekly").tag("biweekly")
                Text("Monthly").tag("monthly")
            }
            .pickerStyle(.menu)
            .font(QCTypography.body)
            .disabled(!notificationsEnabled || !checkInReminders)

            DatePicker(
                "Reminder Time",
                selection: $dailyReminderTime,
                displayedComponents: .hourAndMinute
            )
            .font(QCTypography.body)
            .disabled(!notificationsEnabled || !checkInReminders)
        } header: {
            Text("Schedule")
        } footer: {
            if notificationsEnabled && checkInReminders {
                Text("You'll receive check-in reminders \(reminderFrequencyText) at \(timeString(from: dailyReminderTime)).")
                    .font(QCTypography.captionSmall)
            } else {
                Text("Enable check-in reminders to set a schedule.")
                    .font(QCTypography.captionSmall)
                    .foregroundStyle(QCColors.textTertiary)
            }
        }
    }

    private var soundSection: some View {
        Section {
            HStack {
                Text("Sound")
                    .font(QCTypography.body)

                Spacer()

                Text("Default")
                    .font(QCTypography.bodySmall)
                    .foregroundStyle(QCColors.textSecondary)

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundStyle(QCColors.textTertiary)
            }
            .disabled(!notificationsEnabled)
            .opacity(notificationsEnabled ? 1.0 : 0.5)

            Toggle("Badges", isOn: .constant(true))
                .font(QCTypography.body)
                .disabled(!notificationsEnabled)

            Toggle("Show in Lock Screen", isOn: .constant(true))
                .font(QCTypography.body)
                .disabled(!notificationsEnabled)
        } header: {
            Text("Notification Style")
        }
    }

    // MARK: - Computed Properties

    private var reminderFrequencyText: String {
        switch reminderFrequency {
        case "daily": return "daily"
        case "alternate": return "every other day"
        case "weekly": return "weekly"
        case "biweekly": return "bi-weekly"
        case "monthly": return "monthly"
        default: return "daily"
        }
    }

    // MARK: - Helper Methods

    private func timeString(from date: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }

    private func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            DispatchQueue.main.async {
                if !granted {
                    notificationsEnabled = false
                    showPermissionAlert = true
                }
            }
        }
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        NotificationsView()
    }
}
