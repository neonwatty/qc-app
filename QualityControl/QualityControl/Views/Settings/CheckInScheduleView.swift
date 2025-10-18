//
//  CheckInScheduleView.swift
//  QualityControl
//
//  Week 7: Settings System
//  Configure recurring check-in schedule
//

import SwiftUI

struct CheckInScheduleView: View {

    // MARK: - Properties

    @AppStorage("checkInFrequency") private var checkInFrequency = "weekly"
    @AppStorage("checkInDay") private var checkInDay = 0 // Sunday = 0
    @AppStorage("checkInTime") private var checkInTime = Date()
    @AppStorage("enableFlexibleSchedule") private var enableFlexibleSchedule = false
    @AppStorage("reminderBefore") private var reminderBefore = 60 // minutes

    private let weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    // MARK: - Body

    var body: some View {
        Form {
            frequencySection
            scheduleSection
            reminderSection
            flexibilitySection
        }
        .navigationTitle("Check-in Schedule")
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: - Sections

    private var frequencySection: some View {
        Section {
            Picker("Frequency", selection: $checkInFrequency) {
                Text("Daily").tag("daily")
                Text("Every Other Day").tag("alternate")
                Text("Weekly").tag("weekly")
                Text("Bi-Weekly").tag("biweekly")
                Text("Monthly").tag("monthly")
                Text("Custom").tag("custom")
            }
            .pickerStyle(.inline)
            .font(QCTypography.body)
        } header: {
            Text("Check-in Frequency")
        } footer: {
            Text(frequencyDescription)
                .font(QCTypography.captionSmall)
        }
    }

    private var scheduleSection: some View {
        Section {
            if checkInFrequency == "weekly" || checkInFrequency == "biweekly" {
                Picker("Day of Week", selection: $checkInDay) {
                    ForEach(0..<7, id: \.self) { day in
                        Text(weekdays[day]).tag(day)
                    }
                }
                .pickerStyle(.menu)
                .font(QCTypography.body)
            }

            DatePicker(
                "Preferred Time",
                selection: $checkInTime,
                displayedComponents: .hourAndMinute
            )
            .font(QCTypography.body)
        } header: {
            Text("Schedule Details")
        } footer: {
            Text(scheduleDescription)
                .font(QCTypography.captionSmall)
        }
    }

    private var reminderSection: some View {
        Section {
            Picker("Reminder Before Check-in", selection: $reminderBefore) {
                Text("15 minutes").tag(15)
                Text("30 minutes").tag(30)
                Text("1 hour").tag(60)
                Text("2 hours").tag(120)
                Text("1 day").tag(1440)
            }
            .pickerStyle(.menu)
            .font(QCTypography.body)
        } header: {
            Text("Reminders")
        } footer: {
            Text("You'll receive a reminder \(reminderText) before your scheduled check-in.")
                .font(QCTypography.captionSmall)
        }
    }

    private var flexibilitySection: some View {
        Section {
            Toggle("Enable Flexible Schedule", isOn: $enableFlexibleSchedule)
                .font(QCTypography.body)
        } header: {
            Text("Flexibility")
        } footer: {
            Text(enableFlexibleSchedule ?
                "Check-ins can be completed within 24 hours of the scheduled time without breaking your streak." :
                "Check-ins must be completed at the scheduled time to maintain your streak.")
                .font(QCTypography.captionSmall)
        }
    }

    // MARK: - Computed Properties

    private var frequencyDescription: String {
        switch checkInFrequency {
        case "daily": return "A check-in every day"
        case "alternate": return "A check-in every other day"
        case "weekly": return "One check-in per week"
        case "biweekly": return "One check-in every two weeks"
        case "monthly": return "One check-in per month"
        case "custom": return "Create your own custom schedule"
        default: return ""
        }
    }

    private var scheduleDescription: String {
        let timeFormatter = DateFormatter()
        timeFormatter.timeStyle = .short

        let timeString = timeFormatter.string(from: checkInTime)

        if checkInFrequency == "weekly" {
            return "Check-in every \(weekdays[checkInDay]) at \(timeString)"
        } else if checkInFrequency == "biweekly" {
            return "Check-in every other \(weekdays[checkInDay]) at \(timeString)"
        } else if checkInFrequency == "daily" {
            return "Check-in every day at \(timeString)"
        } else if checkInFrequency == "alternate" {
            return "Check-in every other day at \(timeString)"
        } else if checkInFrequency == "monthly" {
            return "Check-in once per month at \(timeString)"
        }
        return "Check-in at \(timeString)"
    }

    private var reminderText: String {
        switch reminderBefore {
        case 15: return "15 minutes"
        case 30: return "30 minutes"
        case 60: return "1 hour"
        case 120: return "2 hours"
        case 1440: return "1 day"
        default: return "\(reminderBefore) minutes"
        }
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        CheckInScheduleView()
    }
}
