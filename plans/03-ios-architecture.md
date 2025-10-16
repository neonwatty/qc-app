# iOS Architecture - Technical Specification

## Architecture Overview

**Pattern:** MVVM (Model-View-ViewModel) + Coordinators
**UI Framework:** 100% SwiftUI
**Persistence:** SwiftData (iOS 17+) with CloudKit sync
**Minimum iOS Version:** iOS 17.0
**Target Devices:** iPhone only (iPad support Phase 2)

---

## Layer Breakdown

```
┌─────────────────────────────────────────────┐
│         PRESENTATION LAYER                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Views   │  │ViewModels│  │Coordinat.│  │
│  │ (SwiftUI)│  │ (@Observ)│  │(Navigate)│  │
│  └──────────┘  └──────────┘  └──────────┘  │
├─────────────────────────────────────────────┤
│         BUSINESS LOGIC LAYER                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Services │  │ Managers │  │Use Cases │  │
│  │ (Domain) │  │ (System) │  │ (Logic)  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
├─────────────────────────────────────────────┤
│         DATA LAYER                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │SwiftData │  │ CloudKit │  │UserDeflt │  │
│  │ (Local)  │  │  (Sync)  │  │(Settings)│  │
│  └──────────┘  └──────────┘  └──────────┘  │
├─────────────────────────────────────────────┤
│         PLATFORM SERVICES                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Notific. │  │ Widgets  │  │Shortcuts │  │
│  │  (UNNot) │  │(WidgetKit│  │(AppIntent│  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
```

---

## Project Structure

```
QualityControl/
├── App/
│   ├── QualityControlApp.swift      # App entry point
│   ├── AppDelegate.swift             # Lifecycle hooks
│   └── AppCoordinator.swift          # Root coordinator
├── Models/
│   ├── CheckIn/
│   │   ├── CheckInSession.swift
│   │   ├── CheckInProgress.swift
│   │   └── CategoryProgress.swift
│   ├── Note/
│   │   ├── Note.swift
│   │   └── NotePrivacy.swift
│   ├── Reminder/
│   │   ├── Reminder.swift
│   │   └── ReminderFrequency.swift
│   ├── User/
│   │   ├── User.swift
│   │   └── Couple.swift
│   └── Shared/
│       ├── ActionItem.swift
│       ├── Milestone.swift
│       ├── LoveLanguage.swift
│       └── RelationshipRequest.swift
├── Views/
│   ├── Dashboard/
│   │   ├── DashboardView.swift
│   │   ├── Components/
│   │   │   ├── QuickActionCard.swift
│   │   │   ├── ActivityFeedItem.swift
│   │   │   └── LoveLanguagesWidget.swift
│   │   └── PrepBanner.swift
│   ├── CheckIn/
│   │   ├── CheckInFlowView.swift
│   │   ├── Steps/
│   │   │   ├── WelcomeStepView.swift
│   │   │   ├── CategorySelectionView.swift
│   │   │   ├── DiscussionView.swift
│   │   │   ├── ReflectionView.swift
│   │   │   ├── ActionItemsView.swift
│   │   │   └── CompletionView.swift
│   │   └── Components/
│   │       ├── ProgressBarView.swift
│   │       ├── SessionTimerView.swift
│   │       └── SessionRulesCard.swift
│   ├── Notes/
│   │   ├── NotesListView.swift
│   │   ├── NoteDetailView.swift
│   │   ├── NoteEditorView.swift
│   │   └── Components/
│   │       ├── NoteCard.swift
│   │       ├── PrivacyBadge.swift
│   │       └── FilterChips.swift
│   ├── Growth/
│   │   ├── GrowthGalleryView.swift
│   │   ├── TimelineView.swift
│   │   ├── ProgressView.swift
│   │   └── Components/
│   │       ├── MilestoneCard.swift
│   │       └── ProgressBar.swift
│   ├── Reminders/
│   │   ├── RemindersListView.swift
│   │   ├── ReminderDetailView.swift
│   │   └── Components/
│   │       └── ReminderCard.swift
│   ├── LoveLanguages/
│   │   ├── LoveLanguagesView.swift
│   │   ├── AddLanguageView.swift
│   │   └── Components/
│   │       └── LanguageCard.swift
│   ├── Requests/
│   │   ├── RequestsListView.swift
│   │   ├── RequestDetailView.swift
│   │   └── Components/
│   │       └── RequestCard.swift
│   ├── Settings/
│   │   ├── SettingsView.swift
│   │   ├── Sections/
│   │   │   ├── ProfileSettingsView.swift
│   │   │   ├── SessionRulesView.swift
│   │   │   ├── NotificationSettingsView.swift
│   │   │   └── AppearanceSettingsView.swift
│   │   └── Components/
│   ├── Onboarding/
│   │   ├── OnboardingFlowView.swift
│   │   └── Steps/
│   │       ├── WelcomeStepView.swift
│   │       ├── QuizStepView.swift
│   │       ├── LoveLanguagesStepView.swift
│   │       ├── ReminderStepView.swift
│   │       ├── TourStepView.swift
│   │       └── CompleteStepView.swift
│   └── Common/
│       ├── TabBarView.swift
│       └── Components/
│           ├── PrimaryButton.swift
│           ├── SecondaryButton.swift
│           ├── SearchBar.swift
│           └── LoadingView.swift
├── ViewModels/
│   ├── DashboardViewModel.swift
│   ├── CheckInViewModel.swift
│   ├── NotesViewModel.swift
│   ├── GrowthViewModel.swift
│   ├── RemindersViewModel.swift
│   ├── LoveLanguagesViewModel.swift
│   ├── RequestsViewModel.swift
│   └── SettingsViewModel.swift
├── Services/
│   ├── CheckInService.swift
│   ├── NotesService.swift
│   ├── RemindersService.swift
│   ├── SyncService.swift
│   └── AnalyticsService.swift
├── Managers/
│   ├── NotificationManager.swift
│   ├── CloudKitManager.swift
│   ├── StorageManager.swift
│   └── HapticManager.swift
├── Utilities/
│   ├── Constants.swift
│   ├── Extensions/
│   │   ├── Date+Extensions.swift
│   │   ├── View+Extensions.swift
│   │   └── Color+Extensions.swift
│   └── Helpers/
│       ├── DateFormatter+Shared.swift
│       └── Logger.swift
├── DesignSystem/
│   ├── Colors.swift
│   ├── Typography.swift
│   ├── Spacing.swift
│   ├── Shadows.swift
│   └── AnimationPresets.swift
├── Resources/
│   ├── Assets.xcassets
│   ├── Localizable.strings
│   └── PrivacyInfo.xcprivacy
└── Tests/
    ├── UnitTests/
    ├── ViewModelTests/
    └── UITests/
```

---

## SwiftData Schema

### Core Models

```swift
import SwiftData
import Foundation

// MARK: - User & Couple

@Model
final class User {
    @Attribute(.unique) var id: UUID
    var name: String
    var email: String
    var createdAt: Date
    var avatarURL: String?

    @Relationship(deleteRule: .nullify, inverse: \Couple.users)
    var couple: Couple?

    @Relationship(deleteRule: .cascade) var notes: [Note]
    @Relationship(deleteRule: .cascade) var reminders: [Reminder]
    @Relationship(deleteRule: .cascade) var loveLanguages: [LoveLanguage]

    init(id: UUID = UUID(), name: String, email: String) {
        self.id = id
        self.name = name
        self.email = email
        self.createdAt = Date()
    }
}

@Model
final class Couple {
    @Attribute(.unique) var id: UUID
    var relationshipStartDate: Date
    var createdAt: Date

    @Relationship(deleteRule: .nullify) var users: [User]
    @Relationship(deleteRule: .cascade) var checkIns: [CheckInSession]
    @Relationship(deleteRule: .cascade) var milestones: [Milestone]
    @Relationship(deleteRule: .cascade) var requests: [RelationshipRequest]

    init(id: UUID = UUID(), relationshipStartDate: Date) {
        self.id = id
        self.relationshipStartDate = relationshipStartDate
        self.createdAt = Date()
        self.users = []
    }
}

// MARK: - Check-In System

@Model
final class CheckInSession {
    @Attribute(.unique) var id: UUID
    var coupleId: UUID
    var startedAt: Date
    var completedAt: Date?
    var status: CheckInStatus

    @Relationship(deleteRule: .cascade) var notes: [Note]
    @Relationship(deleteRule: .cascade) var actionItems: [ActionItem]
    @Relationship(deleteRule: .nullify) var selectedCategories: [Category]

    // Progress tracking
    var currentStep: CheckInStep
    var completedSteps: [CheckInStep]
    var percentageComplete: Double

    // Session metadata
    var durationSeconds: Int?
    var mood: MoodRating?
    var reflection: String?

    init(id: UUID = UUID(), coupleId: UUID, categories: [Category]) {
        self.id = id
        self.coupleId = coupleId
        self.startedAt = Date()
        self.status = .inProgress
        self.selectedCategories = categories
        self.currentStep = .welcome
        self.completedSteps = []
        self.percentageComplete = 0
    }
}

enum CheckInStatus: String, Codable {
    case inProgress
    case completed
    case abandoned
}

enum CheckInStep: String, Codable, CaseIterable {
    case welcome
    case categorySelection
    case categoryDiscussion
    case reflection
    case actionItems
    case completion
}

enum MoodRating: String, Codable {
    case veryPositive = "😄"
    case positive = "🙂"
    case neutral = "😐"
    case negative = "🙁"
    case veryNegative = "😢"
}

@Model
final class Category {
    @Attribute(.unique) var id: UUID
    var name: String
    var description: String
    var icon: String
    var colorHex: String
    var isDefault: Bool
    var prompts: [String]

    init(id: UUID = UUID(), name: String, description: String, icon: String) {
        self.id = id
        self.name = name
        self.description = description
        self.icon = icon
        self.colorHex = "#EC4899" // Pink default
        self.isDefault = false
        self.prompts = []
    }
}

// MARK: - Notes System

@Model
final class Note {
    @Attribute(.unique) var id: UUID
    var content: String
    var privacy: NotePrivacy
    var authorId: UUID
    var categoryId: UUID?
    var checkInId: UUID?
    var createdAt: Date
    var updatedAt: Date
    var tags: [String]

    @Relationship(deleteRule: .nullify, inverse: \CheckInSession.notes)
    var checkInSession: CheckInSession?

    init(id: UUID = UUID(), content: String, privacy: NotePrivacy, authorId: UUID) {
        self.id = id
        self.content = content
        self.privacy = privacy
        self.authorId = authorId
        self.createdAt = Date()
        self.updatedAt = Date()
        self.tags = []
    }
}

enum NotePrivacy: String, Codable {
    case `private`
    case shared
    case draft

    var icon: String {
        switch self {
        case .private: return "eye.slash.fill"
        case .shared: return "eye.fill"
        case .draft: return "doc.text.fill"
        }
    }

    var color: String {
        switch self {
        case .private: return "blue"
        case .shared: return "green"
        case .draft: return "orange"
        }
    }
}

// MARK: - Action Items

@Model
final class ActionItem {
    @Attribute(.unique) var id: UUID
    var title: String
    var description: String?
    var assignedTo: UUID?
    var dueDate: Date?
    var priority: Priority
    var completed: Boolean
    var completedAt: Date?
    var checkInId: UUID
    var createdAt: Date

    init(id: UUID = UUID(), title: String, checkInId: UUID) {
        self.id = id
        self.title = title
        self.checkInId = checkInId
        self.priority = .medium
        self.completed = false
        self.createdAt = Date()
    }
}

enum Priority: String, Codable {
    case low
    case medium
    case high

    var color: String {
        switch self {
        case .low: return "gray"
        case .medium: return "yellow"
        case .high: return "red"
        }
    }
}

// MARK: - Reminders

@Model
final class Reminder {
    @Attribute(.unique) var id: UUID
    var title: String
    var message: String
    var category: ReminderCategory
    var frequency: ReminderFrequency
    var scheduledFor: Date
    var isActive: Bool
    var isSnoozed: Bool
    var snoozeUntil: Date?
    var completedAt: Date?
    var userId: UUID
    var createdAt: Date

    init(id: UUID = UUID(), title: String, message: String, category: ReminderCategory, frequency: ReminderFrequency, scheduledFor: Date, userId: UUID) {
        self.id = id
        self.title = title
        self.message = message
        self.category = category
        self.frequency = frequency
        self.scheduledFor = scheduledFor
        self.isActive = true
        self.isSnoozed = false
        self.userId = userId
        self.createdAt = Date()
    }
}

enum ReminderCategory: String, Codable {
    case checkIn
    case habit
    case actionItem
    case partnerMoment
    case specialOccasion
}

enum ReminderFrequency: String, Codable {
    case once
    case daily
    case weekly
    case monthly
    case custom
}

// MARK: - Milestones

@Model
final class Milestone {
    @Attribute(.unique) var id: UUID
    var title: String
    var description: String
    var achievedAt: Date?
    var targetDate: Date?
    var category: String
    var isAchieved: Bool
    var coupleId: UUID

    init(id: UUID = UUID(), title: String, description: String, category: String, coupleId: UUID) {
        self.id = id
        self.title = title
        self.description = description
        self.category = category
        self.isAchieved = false
        self.coupleId = coupleId
    }
}

// MARK: - Love Languages

@Model
final class LoveLanguage {
    @Attribute(.unique) var id: UUID
    var category: LoveLanguageCategory
    var title: String
    var description: String
    var examples: [String]
    var importance: Importance
    var privacy: NotePrivacy
    var tags: [String]
    var userId: UUID
    var createdAt: Date
    var updatedAt: Date

    init(id: UUID = UUID(), category: LoveLanguageCategory, title: String, description: String, userId: UUID) {
        self.id = id
        self.category = category
        self.title = title
        self.description = description
        self.examples = []
        self.importance = .medium
        self.privacy = .shared
        self.tags = []
        self.userId = userId
        self.createdAt = Date()
        self.updatedAt = Date()
    }
}

enum LoveLanguageCategory: String, Codable {
    case words
    case time
    case gifts
    case touch
    case acts

    var icon: String {
        switch self {
        case .words: return "💬"
        case .time: return "⏰"
        case .gifts: return "🎁"
        case .touch: return "🤝"
        case .acts: return "✋"
        }
    }
}

enum Importance: String, Codable {
    case low
    case medium
    case high
    case essential
}

// MARK: - Relationship Requests

@Model
final class RelationshipRequest {
    @Attribute(.unique) var id: UUID
    var title: String
    var description: String
    var requestType: RequestType
    var priority: Priority
    var requestedBy: UUID
    var requestedFor: UUID
    var status: RequestStatus
    var dueDate: Date?
    var isRecurring: Bool
    var response: String?
    var respondedAt: Date?
    var tags: [String]
    var createdAt: Date

    init(id: UUID = UUID(), title: String, description: String, requestType: RequestType, requestedBy: UUID, requestedFor: UUID) {
        self.id = id
        self.title = title
        self.description = description
        self.requestType = requestType
        self.requestedBy = requestedBy
        self.requestedFor = requestedFor
        self.priority = .medium
        self.status = .pending
        self.isRecurring = false
        self.tags = []
        self.createdAt = Date()
    }
}

enum RequestType: String, Codable {
    case conversation
    case activity
    case dateNight
    case reminder
}

enum RequestStatus: String, Codable {
    case pending
    case accepted
    case declined

    var color: String {
        switch self {
        case .pending: return "orange"
        case .accepted: return "green"
        case .declined: return "red"
        }
    }
}
```

---

## ViewModel Pattern

### Example: DashboardViewModel

```swift
import Foundation
import SwiftUI
import Combine

@MainActor
final class DashboardViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var stats: DashboardStats = .empty
    @Published var recentActivity: [ActivityItem] = []
    @Published var todayReminders: [Reminder] = []
    @Published var pendingRequests: [RelationshipRequest] = []
    @Published var loveLanguageStats: LoveLanguageStats?
    @Published var isLoading = false
    @Published var errorMessage: String?

    // MARK: - Dependencies
    private let checkInService: CheckInService
    private let reminderService: ReminderService
    private let requestService: RequestService
    private let loveLanguageService: LoveLanguageService
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Initialization
    init(
        checkInService: CheckInService = .shared,
        reminderService: ReminderService = .shared,
        requestService: RequestService = .shared,
        loveLanguageService: LoveLanguageService = .shared
    ) {
        self.checkInService = checkInService
        self.reminderService = reminderService
        self.requestService = requestService
        self.loveLanguageService = loveLanguageService
    }

    // MARK: - Public Methods
    func loadData() async {
        isLoading = true
        defer { isLoading = false }

        do {
            async let stats = checkInService.getStats()
            async let activity = checkInService.getRecentActivity()
            async let reminders = reminderService.getTodayReminders()
            async let requests = requestService.getPendingRequests()
            async let loveStats = loveLanguageService.getStats()

            (self.stats, self.recentActivity, self.todayReminders, self.pendingRequests, self.loveLanguageStats) =
                try await (stats, activity, reminders, requests, loveStats)

            HapticManager.shared.notification(.success)
        } catch {
            errorMessage = error.localizedDescription
            HapticManager.shared.notification(.error)
        }
    }

    func refreshData() async {
        await loadData()
        HapticManager.shared.impact(.medium)
    }

    func openPreparationModal() {
        // Navigation handled by coordinator
        NotificationCenter.default.post(name: .openPreparationModal, object: nil)
    }
}

// MARK: - Supporting Types
struct DashboardStats {
    let totalCheckIns: Int
    let currentStreak: Int
    let monthsActive: Int
    let consistencyRate: Double

    static var empty: DashboardStats {
        DashboardStats(totalCheckIns: 0, currentStreak: 0, monthsActive: 0, consistencyRate: 0)
    }
}

struct ActivityItem: Identifiable {
    let id: UUID
    let icon: String
    let text: String
    let timestamp: Date
}

struct LoveLanguageStats {
    let totalLanguages: Int
    let sharedLanguages: Int
    let thisWeekActions: Int
    let sharingProgress: Double
    let topPartnerLanguage: LoveLanguage?
}
```

---

## Service Layer

### Example: CheckInService

```swift
import Foundation
import SwiftData

final class CheckInService {
    static let shared = CheckInService()

    private let modelContext: ModelContext
    private let syncService: SyncService

    init(modelContext: ModelContext = .shared, syncService: SyncService = .shared) {
        self.modelContext = modelContext
        self.syncService = syncService
    }

    // MARK: - Session Management
    func createSession(categories: [Category]) async throws -> CheckInSession {
        guard let coupleId = UserManager.shared.currentCouple?.id else {
            throw CheckInError.noCouple
        }

        let session = CheckInSession(coupleId: coupleId, categories: categories)
        modelContext.insert(session)
        try modelContext.save()

        // Sync to CloudKit
        await syncService.syncSession(session)

        return session
    }

    func updateSession(_ session: CheckInSession) async throws {
        session.updatedAt = Date()
        try modelContext.save()
        await syncService.syncSession(session)
    }

    func completeSession(_ session: CheckInSession) async throws {
        session.status = .completed
        session.completedAt = Date()
        try modelContext.save()

        // Create milestone if applicable
        await checkAndCreateMilestones(for: session)

        // Sync to CloudKit
        await syncService.syncSession(session)

        // Schedule post-session notification
        await NotificationManager.shared.scheduleReflectionReminder(for: session)
    }

    // MARK: - Stats & Analytics
    func getStats() async throws -> DashboardStats {
        let descriptor = FetchDescriptor<CheckInSession>(
            predicate: #Predicate { $0.status == .completed }
        )

        let completedSessions = try modelContext.fetch(descriptor)

        return DashboardStats(
            totalCheckIns: completedSessions.count,
            currentStreak: calculateStreak(from: completedSessions),
            monthsActive: calculateMonthsActive(from: completedSessions),
            consistencyRate: calculateConsistencyRate(from: completedSessions)
        )
    }

    // MARK: - Private Helpers
    private func calculateStreak(from sessions: [CheckInSession]) -> Int {
        // Implementation
        return 0
    }

    private func calculateMonthsActive(from sessions: [CheckInSession]) -> Int {
        // Implementation
        return 0
    }

    private func calculateConsistencyRate(from sessions: [CheckInSession]) -> Double {
        // Implementation
        return 0.0
    }

    private func checkAndCreateMilestones(for session: CheckInSession) async {
        // Check for milestone achievements
        // Create new milestones if thresholds met
    }
}

enum CheckInError: LocalizedError {
    case noCouple
    case sessionNotFound
    case invalidState

    var errorDescription: String? {
        switch self {
        case .noCouple: return "No couple found. Please complete setup."
        case .sessionNotFound: return "Check-in session not found."
        case .invalidState: return "Invalid check-in state."
        }
    }
}
```

---

## CloudKit Integration

### Schema Design

```swift
import CloudKit

enum RecordType: String {
    case couple = "Couple"
    case checkInSession = "CheckInSession"
    case note = "Note"
    case actionItem = "ActionItem"
    case reminder = "Reminder"
    case milestone = "Milestone"
    case loveLanguage = "LoveLanguage"
    case request = "RelationshipRequest"
}

final class CloudKitManager {
    static let shared = CloudKitManager()

    private let container: CKContainer
    private let privateDatabase: CKDatabase
    private let sharedDatabase: CKDatabase

    init() {
        container = CKContainer(identifier: "iCloud.com.yourcompany.qualitycontrol")
        privateDatabase = container.privateCloudDatabase
        sharedDatabase = container.sharedCloudDatabase
    }

    // MARK: - Sync Operations
    func syncSession(_ session: CheckInSession) async throws {
        let record = try session.toCKRecord()
        try await privateDatabase.save(record)
    }

    func fetchSharedData(for coupleId: UUID) async throws -> [CKRecord] {
        let query = CKQuery(
            recordType: RecordType.couple.rawValue,
            predicate: NSPredicate(format: "id == %@", coupleId.uuidString)
        )

        let (results, _) = try await sharedDatabase.records(matching: query)
        return results.compactMap { try? $0.1.get() }
    }

    // MARK: - Conflict Resolution
    func resolveConflict(_ conflict: CKRecord, localVersion: CKRecord) -> CKRecord {
        // Last-write-wins strategy
        return conflict.modificationDate ?? Date() > localVersion.modificationDate ?? Date()
            ? conflict
            : localVersion
    }
}

// MARK: - CKRecord Conversion
extension CheckInSession {
    func toCKRecord() throws -> CKRecord {
        let record = CKRecord(recordType: RecordType.checkInSession.rawValue)
        record["id"] = id.uuidString
        record["coupleId"] = coupleId.uuidString
        record["startedAt"] = startedAt
        record["completedAt"] = completedAt
        record["status"] = status.rawValue
        // ... other fields
        return record
    }

    static func fromCKRecord(_ record: CKRecord) throws -> CheckInSession {
        guard let idString = record["id"] as? String,
              let id = UUID(uuidString: idString),
              let coupleIdString = record["coupleId"] as? String,
              let coupleId = UUID(uuidString: coupleIdString)
        else {
            throw CloudKitError.invalidRecord
        }

        // Reconstruct model
        // ...
        return session
    }
}
```

---

## Notification System

```swift
import UserNotifications

final class NotificationManager {
    static let shared = NotificationManager()

    private let center = UNUserNotificationCenter.current()

    // MARK: - Authorization
    func requestAuthorization() async throws {
        try await center.requestAuthorization(options: [.alert, .sound, .badge])
    }

    // MARK: - Scheduling
    func scheduleCheckInReminder(at date: Date, frequency: ReminderFrequency) async throws {
        let content = UNMutableNotificationContent()
        content.title = "Time for Your Check-in"
        content.body = "Take a few minutes to connect with your partner"
        content.sound = .default
        content.categoryIdentifier = "CHECK_IN_REMINDER"

        let trigger = createTrigger(for: date, frequency: frequency)
        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: trigger
        )

        try await center.add(request)
    }

    func scheduleReflectionReminder(for session: CheckInSession) async {
        // Schedule 24hr after completion
        guard let completedAt = session.completedAt else { return }
        let reminderDate = completedAt.addingTimeInterval(86400) // 24 hours

        let content = UNMutableNotificationContent()
        content.title = "Reflect on Your Check-in"
        content.body = "How did yesterday's conversation go?"
        content.categoryIdentifier = "REFLECTION"

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 86400, repeats: false)
        let request = UNNotificationRequest(
            identifier: "reflection_\(session.id.uuidString)",
            content: content,
            trigger: trigger
        )

        try? await center.add(request)
    }

    // MARK: - Categories & Actions
    func registerCategories() {
        let checkInCategory = UNNotificationCategory(
            identifier: "CHECK_IN_REMINDER",
            actions: [
                UNNotificationAction(
                    identifier: "START_NOW",
                    title: "Start Now",
                    options: .foreground
                ),
                UNNotificationAction(
                    identifier: "SNOOZE",
                    title: "Remind me in 1 hour",
                    options: []
                )
            ],
            intentIdentifiers: []
        )

        center.setNotificationCategories([checkInCategory])
    }

    // MARK: - Private Helpers
    private func createTrigger(for date: Date, frequency: ReminderFrequency) -> UNNotificationTrigger {
        switch frequency {
        case .once:
            let components = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: date)
            return UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
        case .daily:
            let components = Calendar.current.dateComponents([.hour, .minute], from: date)
            return UNCalendarNotificationTrigger(dateMatching: components, repeats: true)
        case .weekly:
            let components = Calendar.current.dateComponents([.weekday, .hour, .minute], from: date)
            return UNCalendarNotificationTrigger(dateMatching: components, repeats: true)
        default:
            let components = Calendar.current.dateComponents([.hour, .minute], from: date)
            return UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
        }
    }
}
```

---

## Next Steps

- [04-data-models.md](./04-data-models.md) - Complete data model specifications
- [05-feature-roadmap.md](./05-feature-roadmap.md) - Week-by-week implementation plan
- [06-production-features.md](./06-production-features.md) - POC → Production enhancements

---

**Last Updated:** 2025-10-15
**Version:** 1.0
