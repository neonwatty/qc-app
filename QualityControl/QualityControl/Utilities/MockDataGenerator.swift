//
//  MockDataGenerator.swift
//  QualityControl
//
//  Created by Jeremy Watt on 10/15/25.
//

import Foundation
import SwiftData

class MockDataGenerator {

    // MARK: - Demo Couple

    static func createDemoCouple() -> (couple: Couple, users: [User]) {
        let couple = Couple(
            id: UUID(),
            relationshipStartDate: Calendar.current.date(byAdding: .year, value: -3, to: Date()) ?? Date()
        )

        let alex = User(
            id: UUID(),
            name: "Alex",
            email: "alex@example.com"
        )

        let jordan = User(
            id: UUID(),
            name: "Jordan",
            email: "jordan@example.com"
        )

        alex.couple = couple
        jordan.couple = couple
        couple.users = [alex, jordan]

        return (couple, [alex, jordan])
    }

    // MARK: - Categories

    static func createDefaultCategories() -> [Category] {
        return [
            Category(
                name: "Financial Goals",
                description: "Discuss budget, savings, and financial planning",
                icon: "dollarsign.circle.fill"
            ),
            Category(
                name: "Intimacy & Connection",
                description: "Physical and emotional closeness",
                icon: "heart.fill"
            ),
            Category(
                name: "Appreciation",
                description: "Express gratitude for each other",
                icon: "star.fill"
            ),
            Category(
                name: "Household",
                description: "Chores, responsibilities, and home life",
                icon: "house.fill"
            ),
            Category(
                name: "Career Support",
                description: "Professional goals and mutual support",
                icon: "briefcase.fill"
            ),
            Category(
                name: "Family & Friends",
                description: "Relationships with loved ones",
                icon: "person.3.fill"
            ),
            Category(
                name: "Conflict Resolution",
                description: "Address disagreements constructively",
                icon: "bubble.left.and.bubble.right.fill"
            ),
            Category(
                name: "Future Planning",
                description: "Long-term goals and dreams",
                icon: "calendar.badge.plus"
            )
        ]
    }

    // MARK: - Check-in Sessions

    static func createSampleCheckInSessions(for coupleId: UUID, count: Int = 5) -> [CheckInSession] {
        var sessions: [CheckInSession] = []

        for i in 0..<count {
            let session = CheckInSession(
                id: UUID(),
                coupleId: coupleId,
                categories: []
            )

            // Set as completed for past sessions
            session.startedAt = Calendar.current.date(byAdding: .day, value: -(i * 7), to: Date()) ?? Date()
            session.completedAt = Calendar.current.date(byAdding: .hour, value: 1, to: session.startedAt)
            session.status = .completed
            session.currentStep = .completion
            session.completedSteps = CheckInStep.allCases.map { $0.rawValue }
            session.percentageComplete = 100
            session.durationSeconds = 3600 // 1 hour
            session.mood = [.veryPositive, .positive, .neutral].randomElement()

            sessions.append(session)
        }

        return sessions
    }

    // MARK: - Notes

    static func createSampleNotes(for userId: UUID, checkInId: UUID, count: Int = 3) -> [Note] {
        let sampleContent = [
            "We discussed our vacation plans and agreed on a budget.",
            "Need to be more mindful of quality time together during busy weeks.",
            "Grateful for the support during my work presentation.",
            "Planning a date night for this weekend.",
            "Working on better communication when we're stressed."
        ]

        var notes: [Note] = []

        for i in 0..<count {
            let note = Note(
                id: UUID(),
                content: sampleContent[i % sampleContent.count],
                privacy: [.private, .shared, .draft].randomElement() ?? .shared,
                authorId: userId
            )
            note.checkInId = checkInId
            note.createdAt = Calendar.current.date(byAdding: .day, value: -i, to: Date()) ?? Date()
            note.updatedAt = note.createdAt

            notes.append(note)
        }

        return notes
    }

    // MARK: - Milestones

    static func createSampleMilestones(for coupleId: UUID) -> [Milestone] {
        return [
            Milestone(
                id: UUID(),
                title: "First Check-in Completed",
                description: "Completed your first relationship check-in",
                category: "communication",
                coupleId: coupleId
            ),
            Milestone(
                id: UUID(),
                title: "5 Check-ins Streak",
                description: "Maintained 5 consecutive weekly check-ins",
                category: "consistency",
                coupleId: coupleId
            ),
            Milestone(
                id: UUID(),
                title: "3 Month Anniversary",
                description: "Using Quality Control for 3 months",
                category: "anniversary",
                coupleId: coupleId
            )
        ]
    }

    // MARK: - Love Languages

    static func createSampleLoveLanguages(for userId: UUID) -> [LoveLanguage] {
        return [
            LoveLanguage(
                id: UUID(),
                category: .words,
                title: "Morning Affirmations",
                description: "Love hearing 'I love you' first thing in the morning",
                userId: userId
            ),
            LoveLanguage(
                id: UUID(),
                category: .time,
                title: "Evening Walks",
                description: "Enjoy taking walks together after dinner",
                userId: userId
            ),
            LoveLanguage(
                id: UUID(),
                category: .acts,
                title: "Coffee in Bed",
                description: "Really appreciate when partner brings coffee in the morning",
                userId: userId
            )
        ]
    }

    // MARK: - Reminders

    static func createSampleReminders(for userId: UUID) -> [Reminder] {
        return [
            Reminder(
                id: UUID(),
                title: "Weekly Check-in",
                message: "Time for your weekly relationship check-in!",
                category: .checkIn,
                frequency: .weekly,
                scheduledFor: nextWeekday(.sunday, at: 19),
                userId: userId
            ),
            Reminder(
                id: UUID(),
                title: "Date Night",
                message: "Don't forget date night this Friday!",
                category: .partnerMoment,
                frequency: .weekly,
                scheduledFor: nextWeekday(.friday, at: 18),
                userId: userId
            )
        ]
    }

    // MARK: - Action Items

    static func createSampleActionItems(for checkInId: UUID, assignedTo: UUID) -> [ActionItem] {
        return [
            ActionItem(
                id: UUID(),
                title: "Research vacation destinations",
                checkInId: checkInId
            ),
            ActionItem(
                id: UUID(),
                title: "Schedule date night for this Friday",
                checkInId: checkInId
            ),
            ActionItem(
                id: UUID(),
                title: "Create monthly budget spreadsheet",
                checkInId: checkInId
            )
        ]
    }

    // MARK: - Helper Methods

    private static func nextWeekday(_ weekday: Weekday, at hour: Int) -> Date {
        let calendar = Calendar.current
        let today = Date()

        var components = calendar.dateComponents([.year, .month, .day, .hour, .minute], from: today)
        components.hour = hour
        components.minute = 0
        components.weekday = weekday.rawValue

        if let date = calendar.nextDate(after: today, matching: components, matchingPolicy: .nextTime) {
            return date
        }

        return calendar.date(byAdding: .day, value: 7, to: today) ?? today
    }
}

enum Weekday: Int {
    case sunday = 1
    case monday = 2
    case tuesday = 3
    case wednesday = 4
    case thursday = 5
    case friday = 6
    case saturday = 7
}
