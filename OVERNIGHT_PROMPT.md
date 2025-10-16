# Task: Complete QualityControl iOS App Development (Weeks 2-12)

## Objective

Complete the remaining 11 weeks of development for QualityControl, a native iOS relationship check-in app built with Swift, SwiftUI, and SwiftData. Transform the current foundation (Week 1 complete, Week 2 in progress) into a production-ready iOS application following the detailed 12-week roadmap defined in the plans/ directory.

**Current State:**
- ✅ Week 1 COMPLETE: 10 SwiftData models, tab bar navigation, mock data utilities
- 🔄 Week 2 IN PROGRESS: Design system needs completion
- 📋 Weeks 3-12 REMAINING: All core features, CloudKit sync, notifications, widgets, testing, launch

**Working Directory:** `/Users/jeremywatt/Desktop/qc-app`
**Xcode Project:** `/Users/jeremywatt/Desktop/qc-app/QualityControl/QualityControl.xcodeproj`
**Scheme:** `QualityControl`
**Test Simulator:** iPhone 16 (iOS 18.1)
**Current Branch:** `docs/ios-transformation-plan`

## Technology Preferences

- **Language:** Swift 5.0+ (100% Swift, no Objective-C)
- **UI Framework:** SwiftUI (100% SwiftUI, no UIKit)
- **Persistence:** SwiftData with iOS 17+ features
- **Architecture:** MVVM + Coordinators pattern
- **Testing:** XCTest for unit, integration, and UI tests
- **Minimum iOS:** 17.0+
- **Xcode:** 16.0+

## Planning Phase

Before beginning implementation, perform these analysis steps:

### 1. Review Project Documentation (30-45 minutes)

**Read these files in order:**
1. `/Users/jeremywatt/Desktop/qc-app/CLAUDE.md` - Project instructions and commands
2. `/Users/jeremywatt/Desktop/qc-app/plans/README.md` - Documentation overview
3. `/Users/jeremywatt/Desktop/qc-app/plans/01-overview.md` - Project goals and vision
4. `/Users/jeremywatt/Desktop/qc-app/plans/02-current-state-analysis.md` - POC feature analysis
5. `/Users/jeremywatt/Desktop/qc-app/plans/03-ios-architecture.md` - Technical architecture **[CRITICAL - Contains code patterns]**
6. `/Users/jeremywatt/Desktop/qc-app/plans/05-feature-roadmap.md` - 12-week timeline **[CRITICAL - Your execution guide]**
7. `/Users/jeremywatt/Desktop/qc-app/plans/06-production-features.md` - Feature gaps and requirements

**Browse POC Screenshots:**
- Examine `/Users/jeremywatt/Desktop/qc-app/plans/screenshots/` directory
- Note UI patterns, layouts, color schemes, and interaction flows
- Reference these throughout development for visual fidelity

### 2. Analyze Current Codebase

**Verify Week 1 Completeness:**
```bash
# List all implemented models
ls -la /Users/jeremywatt/Desktop/qc-app/QualityControl/QualityControl/Models/

# Check existing views
ls -la /Users/jeremywatt/Desktop/qc-app/QualityControl/QualityControl/Views/

# Review utilities
ls -la /Users/jeremywatt/Desktop/qc-app/QualityControl/QualityControl/Utilities/
```

**Read and understand:**
- All 10 SwiftData models (User, Couple, CheckInSession, Category, ActionItem, Note, Reminder, Milestone, LoveLanguage, RelationshipRequest)
- MockDataGenerator.swift - Sample data patterns
- PreviewContainer.swift - Preview support mechanisms
- MainTabView.swift - Current navigation structure
- QualityControlApp.swift - App entry point and schema configuration

### 3. Create Detailed Execution Plan

**For each week (2-12), document:**

1. **Week Goals** - High-level objectives from plans/05-feature-roadmap.md
2. **Deliverables** - Specific files to create (Views, ViewModels, Services, Tests)
3. **Architecture Implementation** - Which MVVM components are needed
4. **Testing Requirements** - Unit tests, integration tests, UI tests
5. **Acceptance Criteria** - How to verify completion
6. **Dependencies** - What must be completed first
7. **Estimated Complexity** - Time/effort assessment

**Document your plan in this format:**

```markdown
# QualityControl Development Execution Plan

## Week 2: Design System Completion
**Status:** In Progress → Complete
**Goal:** Establish comprehensive design system with colors, typography, spacing, animations, and reusable components

### Deliverables
- [ ] QCColors.swift - Color palette with semantic naming
- [ ] QCTypography.swift - Text styles (heading1-6, body, caption, etc.)
- [ ] QCSpacing.swift - Consistent spacing values
- [ ] QCAnimations.swift - Animation presets for transitions
- [ ] QCButton.swift - Reusable button component
- [ ] QCTextField.swift - Reusable text input component
- [ ] QCCard.swift - Reusable card container
- [ ] Unit tests for all components

### Architecture
- Utilities/DesignSystem/ directory
- No ViewModels needed (static design tokens)
- Use @ViewBuilder for component variants

### Testing Requirements
- Unit tests: Component rendering, color contrast ratios
- Snapshot tests: Visual regression for components
- Preview tests: All variants display correctly

### Acceptance Criteria
- ✅ All design tokens documented and accessible
- ✅ All components render correctly in previews
- ✅ Tests pass with 100% coverage for design system
- ✅ App compiles and runs on iPhone 16 simulator

### Dependencies
- Week 1 models and utilities (already complete)

---

## Week 3: Dashboard + Check-in Flow (Steps 1-3)
[Continue for each week...]
```

### 4. Set Up Development Environment

**Verify simulator availability:**
```swift
// Use xcodebuild MCP to list simulators
list_sims()
```

**Boot iPhone 16 simulator:**
```swift
boot_sim({ simulatorUuid: "UUID-from-list" })
open_sim()
```

**Verify initial build:**
```swift
build_sim({
  projectPath: "/Users/jeremywatt/Desktop/qc-app/QualityControl/QualityControl.xcodeproj",
  scheme: "QualityControl",
  simulatorName: "iPhone 16"
})
```

**Run existing tests to establish baseline:**
```swift
test_sim({
  projectPath: "/Users/jeremywatt/Desktop/qc-app/QualityControl/QualityControl.xcodeproj",
  scheme: "QualityControl",
  simulatorName: "iPhone 16"
})
```

### 5. Establish Development Workflow

**For each feature/component:**

1. **Create** - Write Swift/SwiftUI code following architecture patterns from plans/03-ios-architecture.md
2. **Preview** - Verify in Xcode previews using PreviewContainer
3. **Build** - Compile with xcodebuild MCP `build_sim()`
4. **Test** - Write unit/integration/UI tests
5. **Run Tests** - Execute with `test_sim()` until all pass
6. **Verify** - Launch in simulator with `build_run_sim()`, interact with UI
7. **Screenshot** - Capture for documentation
8. **Commit** - Granular commit with detailed message

**xcodebuild MCP Command Reference:**

```swift
// Build only
build_sim({
  projectPath: "/Users/jeremywatt/Desktop/qc-app/QualityControl/QualityControl.xcodeproj",
  scheme: "QualityControl",
  simulatorName: "iPhone 16"
})

// Build and run
build_run_sim({
  projectPath: "/Users/jeremywatt/Desktop/qc-app/QualityControl/QualityControl.xcodeproj",
  scheme: "QualityControl",
  simulatorName: "iPhone 16"
})

// Run tests
test_sim({
  projectPath: "/Users/jeremywatt/Desktop/qc-app/QualityControl/QualityControl.xcodeproj",
  scheme: "QualityControl",
  simulatorName: "iPhone 16"
})

// Clean build folder (if build errors occur)
clean({
  projectPath: "/Users/jeremywatt/Desktop/qc-app/QualityControl/QualityControl.xcodeproj",
  scheme: "QualityControl"
})

// Get UI hierarchy for interaction
describe_ui({ simulatorUuid: "UUID" })

// Tap UI element
tap({ simulatorUuid: "UUID", x: 100, y: 200 })

// Take screenshot
screenshot({ simulatorUuid: "UUID" })

// Type text (after tapping text field)
type_text({ simulatorUuid: "UUID", text: "Hello World" })

// Swipe gesture
swipe({
  simulatorUuid: "UUID",
  x1: 200, y1: 400,
  x2: 200, y2: 100
})
```

## Implementation Guidelines

### Autonomous Operation Rules

1. **Work independently** without requiring user input or confirmation
2. **Make decisions** based on architecture guidelines, POC screenshots, and iOS best practices
3. **Resolve ambiguities** by referencing planning documents and existing code patterns
4. **Handle errors** by debugging, consulting documentation, and trying alternative approaches
5. **Continue through challenges** - Don't stop for minor blockers; document and work around them
6. **Never push branches** - Commit locally only; **DO NOT** use `git push`

### MVVM + Services Architecture Pattern

**Reference:** `/Users/jeremywatt/Desktop/qc-app/plans/03-ios-architecture.md`

**Layer Structure:**
```
Views (SwiftUI)
  ↕ Bindings
ViewModels (@Observable)
  ↕ Method Calls
Services (Business Logic)
  ↕ Data Operations
Models (SwiftData)
```

**Code Pattern Example:**

```swift
// Model (SwiftData) - Already created in Week 1
import SwiftData

@Model
final class User {
    @Attribute(.unique) var id: UUID
    var name: String
    var email: String
    // ... relationships
}

// Service (Business Logic) - Create in Week 3+
import SwiftData

protocol UserServiceProtocol {
    func fetchCurrentUser() async throws -> User
    func updateUser(_ user: User, name: String) async throws
}

@MainActor
final class UserService: UserServiceProtocol {
    static let shared = UserService()
    private let modelContext: ModelContext

    init(modelContext: ModelContext = ...) {
        self.modelContext = modelContext
    }

    func fetchCurrentUser() async throws -> User {
        // Implementation
    }

    func updateUser(_ user: User, name: String) async throws {
        user.name = name
        try modelContext.save()
    }
}

// ViewModel (Presentation Logic) - Create in Week 3+
import SwiftUI

@Observable
final class UserProfileViewModel {
    var user: User?
    var isLoading = false
    var errorMessage: String?

    private let userService: UserServiceProtocol

    init(userService: UserServiceProtocol = UserService.shared) {
        self.userService = userService
    }

    @MainActor
    func loadUser() async {
        isLoading = true
        defer { isLoading = false }

        do {
            user = try await userService.fetchCurrentUser()
        } catch {
            errorMessage = "Failed to load user: \(error.localizedDescription)"
        }
    }
}

// View (SwiftUI) - Create in Week 3+
import SwiftUI

struct UserProfileView: View {
    @State private var viewModel = UserProfileViewModel()

    var body: some View {
        VStack {
            if viewModel.isLoading {
                ProgressView()
            } else if let user = viewModel.user {
                Text(user.name)
            } else if let error = viewModel.errorMessage {
                Text(error)
                    .foregroundStyle(.red)
            }
        }
        .task {
            await viewModel.loadUser()
        }
    }
}

#Preview {
    UserProfileView()
        .modelContainer(PreviewContainer.create())
}
```

### Testing Strategy - MANDATORY After Every Feature

**Test Coverage Requirements:**
- **Unit Tests:** 80%+ coverage for ViewModels and Services
- **Integration Tests:** All critical data flows (Create, Read, Update, Delete operations)
- **UI Tests:** All primary user journeys (Onboarding, Check-in flow, Note creation, etc.)

**Testing Pattern:**

```swift
// Unit Test Example (for ViewModels)
import XCTest
@testable import QualityControl

final class UserProfileViewModelTests: XCTestCase {
    var sut: UserProfileViewModel!
    var mockUserService: MockUserService!

    override func setUp() {
        super.setUp()
        mockUserService = MockUserService()
        sut = UserProfileViewModel(userService: mockUserService)
    }

    override func tearDown() {
        sut = nil
        mockUserService = nil
        super.tearDown()
    }

    func testLoadUser_Success() async {
        // Given
        let expectedUser = User(id: UUID(), name: "Test User", email: "test@example.com")
        mockUserService.userToReturn = expectedUser

        // When
        await sut.loadUser()

        // Then
        XCTAssertEqual(sut.user?.name, "Test User")
        XCTAssertFalse(sut.isLoading)
        XCTAssertNil(sut.errorMessage)
    }

    func testLoadUser_Failure() async {
        // Given
        mockUserService.shouldThrowError = true

        // When
        await sut.loadUser()

        // Then
        XCTAssertNil(sut.user)
        XCTAssertFalse(sut.isLoading)
        XCTAssertNotNil(sut.errorMessage)
    }
}

// Integration Test Example (for Services + Models)
final class UserServiceIntegrationTests: XCTestCase {
    var modelContainer: ModelContainer!
    var modelContext: ModelContext!
    var sut: UserService!

    override func setUp() async throws {
        try await super.setUp()
        modelContainer = try ModelContainer(
            for: User.self, Couple.self,
            configurations: ModelConfiguration(isStoredInMemoryOnly: true)
        )
        modelContext = ModelContext(modelContainer)
        sut = UserService(modelContext: modelContext)
    }

    func testCreateAndFetchUser() async throws {
        // Given
        let user = User(id: UUID(), name: "Integration Test", email: "integration@test.com")
        modelContext.insert(user)
        try modelContext.save()

        // When
        let fetchedUser = try await sut.fetchCurrentUser()

        // Then
        XCTAssertEqual(fetchedUser.name, "Integration Test")
    }
}

// UI Test Example
final class CheckInFlowUITests: XCTestCase {
    var app: XCUIApplication!

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app = XCUIApplication()
        app.launchArguments = ["UI-Testing"]
        app.launch()
    }

    func testCompleteCheckInFlow() {
        // Navigate to Check-in tab
        app.tabBars.buttons["Check-in"].tap()

        // Start check-in
        app.buttons["Start Check-in"].tap()

        // Select category
        app.buttons["Communication"].tap()
        app.buttons["Continue"].tap()

        // Verify discussion screen appears
        XCTAssertTrue(app.staticTexts["Discussion Prompts"].exists)
    }
}
```

**After writing tests, ALWAYS run them:**

```swift
test_sim({
  projectPath: "/Users/jeremywatt/Desktop/qc-app/QualityControl/QualityControl.xcodeproj",
  scheme: "QualityControl",
  simulatorName: "iPhone 16"
})
```

**If tests fail:**
1. Read the failure output carefully
2. Debug the failing test or implementation
3. Fix the issue
4. Re-run tests until all pass
5. **DO NOT PROCEED** to next feature until tests are green

### Commit Strategy - Granular & Descriptive

**Commit after:**
- Each design system component completion (Week 2)
- Each view implementation with tests passing
- Each ViewModel + Service implementation with tests passing
- Each week's full deliverables completion
- Any significant refactoring or bug fix

**Commit Message Format:**

```
<type>(<scope>): <subject>

<body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:** `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`

**Example Commit Messages:**

```bash
# Week 2 - Design System Component
git add QualityControl/QualityControl/Utilities/DesignSystem/QCColors.swift
git add QualityControl/QualityControlTests/DesignSystem/QCColorsTests.swift
git commit -m "$(cat <<'EOF'
feat(design-system): Add QCColors with semantic color palette

Implemented comprehensive color system with:
- Primary/secondary brand colors
- Semantic colors (success, warning, error, info)
- Background/surface colors with elevation support
- Text colors with contrast-compliant hierarchy
- Dark mode support via @Environment(\.colorScheme)

All colors tested for WCAG AA contrast compliance.
Unit tests verify color initialization and accessibility.

Tests: 12 passed, 0 failed
Coverage: 100%

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# Week 3 - Dashboard View
git add QualityControl/QualityControl/Views/Dashboard/
git add QualityControl/QualityControl/ViewModels/DashboardViewModel.swift
git add QualityControl/QualityControl/Services/DashboardService.swift
git add QualityControl/QualityControlTests/ViewModels/DashboardViewModelTests.swift
git add QualityControl/QualityControlTests/Services/DashboardServiceTests.swift
git add QualityControl/QualityControlUITests/DashboardUITests.swift
git commit -m "$(cat <<'EOF'
feat(dashboard): Implement Dashboard view with recent activity

Implemented Dashboard screen with MVVM architecture:

Views:
- DashboardView: Main container with navigation
- RecentCheckInsCard: Displays last 3 check-ins
- UpcomingRemindersCard: Shows next scheduled reminders
- QuickActionsCard: Start check-in, add note shortcuts

ViewModels:
- DashboardViewModel: Manages dashboard state and data loading
- Handles async data fetching from DashboardService
- Error handling and loading states

Services:
- DashboardService: Business logic for dashboard data
- Fetches recent check-ins from SwiftData
- Fetches upcoming reminders with sorting

Tests:
- Unit tests: DashboardViewModel (14 tests)
- Unit tests: DashboardService (8 tests)
- UI tests: Dashboard navigation and interactions (6 tests)
- Total: 28 tests passed, 0 failed
- Coverage: 87% (ViewModels), 92% (Services)

Verified on iPhone 16 simulator - all interactions working correctly.
Screenshots captured in docs/screenshots/week3-dashboard.png

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# Week completion commit
git commit -m "$(cat <<'EOF'
feat(week-3): Complete Dashboard and Check-in Steps 1-3

Week 3 Deliverables - ALL COMPLETE ✅

Dashboard:
- DashboardView with 3 main cards (recent check-ins, reminders, quick actions)
- DashboardViewModel with async data loading
- DashboardService for business logic
- 28 tests (100% passing)

Check-in Flow (Steps 1-3):
- Step 1: WelcomeView with session initialization
- Step 2: CategorySelectionView with grid layout
- Step 3: CategoryDiscussionView with prompts and timer
- CheckInFlowCoordinator for navigation management
- CheckInViewModel for session state management
- CheckInService for session CRUD operations
- 47 tests (100% passing)

Total Tests This Week: 75 passed, 0 failed
Code Coverage: 85% overall
Build Status: ✅ Compiles and runs on iPhone 16
UI Verification: ✅ All screens tested manually

Reference: plans/05-feature-roadmap.md - Week 3 objectives
Next: Week 4 - Check-in Steps 4-6 + Notes system

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**Git Commands:**

```bash
# Stage files
git add <file-paths>

# Commit with message
git commit -m "$(cat <<'EOF'
<multiline commit message>
EOF
)"

# Check status
git status

# View recent commits
git log --oneline -10

# DO NOT PUSH - Local commits only
# NEVER run: git push
```

### Quality Gates - MUST PASS Before Proceeding

**After Each Feature Implementation:**

1. ✅ **Code compiles** - No build errors
   ```swift
   build_sim({ ... })
   ```

2. ✅ **All tests pass** - Unit, integration, UI tests green
   ```swift
   test_sim({ ... })
   ```

3. ✅ **App runs** - Launches successfully in simulator
   ```swift
   build_run_sim({ ... })
   ```

4. ✅ **UI verified** - Manual interaction confirms expected behavior
   ```swift
   describe_ui({ simulatorUuid: "UUID" })
   tap({ simulatorUuid: "UUID", x: X, y: Y })
   screenshot({ simulatorUuid: "UUID" })
   ```

5. ✅ **Code committed** - Changes saved to git with descriptive message

**If any quality gate fails:**
- **STOP** - Do not proceed to next feature
- **DEBUG** - Read error messages, check logs
- **FIX** - Correct the issue
- **RETRY** - Re-run quality gates
- **DOCUMENT** - Note the issue and resolution in commit message

### Week-by-Week Implementation Guide

**Execute weeks in strict sequential order: 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12**

Reference `/Users/jeremywatt/Desktop/qc-app/plans/05-feature-roadmap.md` for detailed requirements.

---

#### **WEEK 2: Design System Completion** (Currently In Progress)

**Goals:**
- Complete design system foundation
- Create reusable UI components
- Establish visual consistency

**Deliverables:**

**A. Design Tokens (Utilities/DesignSystem/):**
1. `QCColors.swift`
   - Primary/secondary brand colors
   - Semantic colors (success, warning, error, info)
   - Background/surface colors
   - Text colors with hierarchy
   - Dark mode support

2. `QCTypography.swift`
   - Font definitions (SF Pro Display/Text)
   - Text styles (heading1-6, body, bodyBold, caption, captionBold, etc.)
   - Line heights and letter spacing

3. `QCSpacing.swift`
   - Spacing scale (xs, sm, md, lg, xl, xxl)
   - Padding and margin constants
   - Corner radius values

4. `QCAnimations.swift`
   - Duration constants (fast, medium, slow)
   - Easing curves (spring, ease-in-out, linear)
   - Transition presets

**B. Reusable Components (Views/Shared/):**
1. `QCButton.swift`
   - Primary, secondary, tertiary variants
   - Sizes (small, medium, large)
   - Loading state
   - Disabled state

2. `QCTextField.swift`
   - Text input with label
   - Error state with message
   - Character count
   - Secure text entry support

3. `QCCard.swift`
   - Container with elevation
   - Optional header/footer
   - Padding variants

4. `QCEmptyState.swift`
   - Icon + title + subtitle
   - Optional action button

5. `QCLoadingView.swift`
   - Activity indicator with message
   - Full-screen and inline variants

**C. Tests (Tests/DesignSystem/):**
- Unit tests for all components
- Snapshot tests for visual regression
- Accessibility tests (VoiceOver labels, contrast)

**Acceptance Criteria:**
- [ ] All design tokens accessible throughout app
- [ ] All components render in previews with all variants
- [ ] Tests pass: 100% coverage for design system
- [ ] App compiles and runs with new design system
- [ ] Committed: "feat(week-2): Complete design system foundation"

**Estimated Time:** 4-6 hours

---

#### **WEEK 3: Dashboard + Check-in Flow (Steps 1-3)**

**Goals:**
- Implement main Dashboard screen
- Create Check-in flow Steps 1-3 (Welcome, Category Selection, Discussion)
- Introduce ViewModels and Services layers

**Deliverables:**

**A. Dashboard (Views/Dashboard/):**
1. `DashboardView.swift`
   - Recent check-ins card (last 3 sessions)
   - Upcoming reminders card (next 5 reminders)
   - Quick actions card (Start check-in, Add note)
   - Navigation to detail screens

2. `RecentCheckInsCard.swift`
   - List of CheckInSession items
   - Tap to view session detail
   - Empty state when no check-ins

3. `UpcomingRemindersCard.swift`
   - List of Reminder items with date/time
   - Tap to view reminder detail
   - Empty state when no reminders

4. `QuickActionsCard.swift`
   - Button grid for common actions
   - Start Check-in button
   - Add Note button

**B. Dashboard ViewModel & Service:**
1. `DashboardViewModel.swift` (ViewModels/)
   - `@Observable` class
   - Properties: recentCheckIns, upcomingReminders, isLoading, errorMessage
   - Methods: loadDashboardData(), refreshData()

2. `DashboardService.swift` (Services/)
   - `DashboardServiceProtocol` protocol
   - Methods: fetchRecentCheckIns(), fetchUpcomingReminders()
   - SwiftData queries with sorting and filtering

**C. Check-in Flow - Steps 1-3 (Views/CheckIn/):**
1. `CheckInFlowCoordinator.swift`
   - Manages navigation between steps
   - Tracks current step state
   - Handles forward/back navigation

2. `Step1_WelcomeView.swift`
   - Welcome message
   - Date/time display
   - "Start Check-in" button
   - Creates new CheckInSession

3. `Step2_CategorySelectionView.swift`
   - Grid of Category cards
   - Category icons and titles
   - Multi-select support
   - "Continue" button (enabled when ≥1 selected)

4. `Step3_CategoryDiscussionView.swift`
   - Selected category display
   - Discussion prompts list
   - Timer display (optional)
   - "Add Note" quick action
   - "Next Category" or "Continue to Reflection" buttons

**D. Check-in ViewModel & Service:**
1. `CheckInViewModel.swift` (ViewModels/)
   - `@Observable` class
   - Properties: currentSession, currentStep, selectedCategories, isLoading
   - Methods: createSession(), selectCategory(), proceedToStep(), saveProgress()

2. `CheckInService.swift` (Services/)
   - `CheckInServiceProtocol` protocol
   - Methods: createCheckInSession(), updateSession(), deleteSession(), fetchSessions()
   - SwiftData CRUD operations

**E. Tests:**
- Unit: DashboardViewModel (14 tests)
- Unit: DashboardService (8 tests)
- Unit: CheckInViewModel (22 tests)
- Unit: CheckInService (12 tests)
- UI: Dashboard navigation (6 tests)
- UI: Check-in flow Steps 1-3 (18 tests)
- **Total: ~80 tests, 100% passing required**

**Acceptance Criteria:**
- [ ] Dashboard displays recent check-ins and reminders correctly
- [ ] Quick actions navigate to appropriate screens
- [ ] Check-in flow Steps 1-3 navigate sequentially
- [ ] Category selection persists in session
- [ ] All tests pass
- [ ] App runs on iPhone 16 simulator
- [ ] Screenshots captured for documentation
- [ ] Committed: "feat(week-3): Complete Dashboard and Check-in Steps 1-3"

**Estimated Time:** 12-16 hours

---

#### **WEEK 4: Check-in Flow (Steps 4-6) + Notes System**

**Goals:**
- Complete Check-in flow with Reflection, Action Items, and Completion
- Implement Notes system with privacy controls
- Enable end-to-end check-in session completion

**Deliverables:**

**A. Check-in Flow - Steps 4-6 (Views/CheckIn/):**
1. `Step4_ReflectionView.swift`
   - Text editor for reflection notes
   - Word count display
   - Optional mood selector
   - "Save & Continue" button

2. `Step5_ActionItemsView.swift`
   - List of action items created during discussion
   - Add new action item form
   - Edit/delete existing items
   - Assign to partner toggle
   - Priority selector (low/medium/high)
   - "Complete Check-in" button

3. `Step6_CompletionView.swift`
   - Summary of check-in session
   - Categories discussed count
   - Action items created count
   - Reflection saved confirmation
   - "View Dashboard" button
   - "Start Another Check-in" button

**B. Notes System (Views/Notes/):**
1. `NotesListView.swift`
   - List of Note items grouped by date
   - Filter by privacy (All, Private, Shared, Drafts)
   - Search functionality
   - "Add Note" button
   - Tap to view/edit note

2. `NoteDetailView.swift`
   - Note content display/edit
   - Title and body text editors
   - Privacy toggle (Private/Shared/Draft)
   - Associated check-in session (if applicable)
   - Timestamp display
   - Delete note action

3. `NoteComposeView.swift`
   - Create new note form
   - Title and body text fields
   - Privacy selector
   - Link to check-in session (optional)
   - Save/Cancel buttons

**C. Notes ViewModel & Service:**
1. `NotesViewModel.swift` (ViewModels/)
   - Properties: notes, filteredNotes, searchText, selectedPrivacyFilter, isLoading
   - Methods: loadNotes(), createNote(), updateNote(), deleteNote(), filterNotes()

2. `NotesService.swift` (Services/)
   - Protocol: NotesServiceProtocol
   - Methods: fetchNotes(), saveNote(), deleteNote(), updateNotePrivacy()
   - SwiftData queries with privacy filtering

**D. Update Check-in ViewModel:**
- Add Step 4-6 handling
- Implement reflection saving
- Implement action items CRUD
- Mark session as completed
- Update session status to `.completed`

**E. Tests:**
- Unit: CheckInViewModel Steps 4-6 (18 tests)
- Unit: NotesViewModel (20 tests)
- Unit: NotesService (12 tests)
- UI: Check-in flow Steps 4-6 (15 tests)
- UI: Notes CRUD operations (12 tests)
- UI: End-to-end check-in completion (8 tests)
- **Total: ~85 tests, 100% passing required**

**Acceptance Criteria:**
- [ ] Complete check-in flow from Step 1-6 works end-to-end
- [ ] Reflection saves to CheckInSession
- [ ] Action items save and associate with session
- [ ] Session status updates to `.completed`
- [ ] Notes list displays all notes with filtering
- [ ] Note privacy controls work correctly
- [ ] All tests pass
- [ ] App runs on iPhone 16 simulator
- [ ] Screenshots captured
- [ ] Committed: "feat(week-4): Complete Check-in Steps 4-6 and Notes system"

**Estimated Time:** 14-18 hours

---

#### **WEEK 5: Growth Gallery + Reminders**

**Goals:**
- Implement Growth Gallery to track relationship milestones
- Create Reminders system with notifications scheduling
- Enable milestone creation and visualization

**Deliverables:**

**A. Growth Gallery (Views/Growth/):**
1. `GrowthGalleryView.swift`
   - Timeline/grid view of Milestone items
   - Filter by date range
   - Sort by date (newest/oldest)
   - "Add Milestone" button
   - Tap milestone to view detail

2. `MilestoneCardView.swift`
   - Milestone title and description
   - Date display
   - Optional photo/icon
   - Category badge (anniversary, achievement, memory, etc.)

3. `MilestoneDetailView.swift`
   - Full milestone content
   - Photo gallery (if multiple photos)
   - Edit/Delete actions
   - Share functionality

4. `MilestoneComposeView.swift`
   - Title and description fields
   - Date picker
   - Category selector
   - Photo picker (multiple photos support)
   - Save/Cancel buttons

**B. Reminders (Views/Reminders/):**
1. `RemindersListView.swift`
   - Upcoming reminders section
   - Past reminders section
   - "Add Reminder" button
   - Swipe to complete/delete
   - Tap to view/edit

2. `ReminderDetailView.swift`
   - Reminder title and description
   - Date/time display
   - Frequency (one-time, daily, weekly, monthly)
   - Category (check-in, date-night, anniversary, custom)
   - Edit/Delete actions
   - Mark as completed

3. `ReminderComposeView.swift`
   - Title and description fields
   - Date/time picker
   - Frequency selector
   - Category selector
   - Notification settings
   - Save/Cancel buttons

**C. ViewModels & Services:**
1. `GrowthViewModel.swift`
   - Properties: milestones, filteredMilestones, dateFilter, sortOrder
   - Methods: loadMilestones(), createMilestone(), updateMilestone(), deleteMilestone()

2. `GrowthService.swift`
   - Protocol: GrowthServiceProtocol
   - Methods: fetchMilestones(), saveMilestone(), deleteMilestone()
   - Photo storage handling (local for now, CloudKit in Week 9)

3. `RemindersViewModel.swift`
   - Properties: upcomingReminders, pastReminders, isLoading
   - Methods: loadReminders(), createReminder(), updateReminder(), deleteReminder(), completeReminder()

4. `RemindersService.swift`
   - Protocol: RemindersServiceProtocol
   - Methods: fetchReminders(), saveReminder(), deleteReminder(), scheduleNotification()
   - Local notification scheduling (UNUserNotificationCenter integration)

**D. Tests:**
- Unit: GrowthViewModel (16 tests)
- Unit: GrowthService (10 tests)
- Unit: RemindersViewModel (18 tests)
- Unit: RemindersService (14 tests - including notification scheduling)
- UI: Growth Gallery CRUD (12 tests)
- UI: Reminders CRUD (12 tests)
- **Total: ~82 tests, 100% passing required**

**Acceptance Criteria:**
- [ ] Growth Gallery displays milestones in timeline/grid
- [ ] Milestone creation with photo support works
- [ ] Reminders list shows upcoming and past reminders
- [ ] Reminder creation schedules local notifications
- [ ] Reminders can be completed/deleted
- [ ] All tests pass
- [ ] App runs on iPhone 16 simulator
- [ ] Screenshots captured
- [ ] Committed: "feat(week-5): Implement Growth Gallery and Reminders"

**Estimated Time:** 14-18 hours

---

#### **WEEK 6: Love Languages + Onboarding**

**Goals:**
- Implement Love Languages assessment and display
- Create smooth onboarding flow for new users
- Enable user and couple profile setup

**Deliverables:**

**A. Love Languages (Views/LoveLanguages/):**
1. `LoveLanguagesView.swift`
   - Display user's love languages with ranking
   - Visual representation (bar chart or ranked list)
   - "Retake Assessment" button
   - "Share with Partner" functionality
   - Partner's love languages display (if available)

2. `LoveLanguageAssessmentView.swift`
   - Multi-step questionnaire (5 categories, ~30 questions)
   - Question display with multiple choice
   - Progress indicator
   - Previous/Next navigation
   - Calculate scores on completion
   - Save results to User model

3. `LoveLanguageDetailView.swift`
   - Detailed explanation of selected love language
   - Examples and suggestions
   - Tips for partner communication

**B. Onboarding (Views/Onboarding/):**
1. `OnboardingCoordinator.swift`
   - Manages onboarding flow navigation
   - Tracks completion state
   - Routes to main app on completion

2. `OnboardingWelcomeView.swift`
   - App introduction
   - Value proposition
   - "Get Started" button

3. `OnboardingProfileSetupView.swift`
   - User name input
   - Email input (optional)
   - Profile photo picker (optional)
   - "Next" button

4. `OnboardingCoupleSetupView.swift`
   - Partner name input
   - Relationship start date picker
   - Anniversary date picker (optional)
   - "Next" button

5. `OnboardingLoveLanguagesPromptView.swift`
   - Explanation of Love Languages
   - "Take Assessment" button
   - "Skip for Now" button

6. `OnboardingCompletionView.swift`
   - Success message
   - Quick tips for getting started
   - "Start Using QualityControl" button

**C. ViewModels & Services:**
1. `LoveLanguagesViewModel.swift`
   - Properties: userLoveLanguages, partnerLoveLanguages, assessmentProgress, currentQuestion
   - Methods: loadLoveLanguages(), startAssessment(), submitAnswer(), calculateResults(), saveLoveLanguages()

2. `LoveLanguagesService.swift`
   - Protocol: LoveLanguagesServiceProtocol
   - Methods: fetchLoveLanguages(), saveLoveLanguages(), generateQuestions()
   - Assessment scoring logic (ranking algorithm)

3. `OnboardingViewModel.swift`
   - Properties: currentUser, currentCouple, onboardingStep, isComplete
   - Methods: createUser(), createCouple(), completeOnboarding()

4. `OnboardingService.swift`
   - Protocol: OnboardingServiceProtocol
   - Methods: initializeUser(), initializeCouple(), markOnboardingComplete()
   - UserDefaults for onboarding completion tracking

**D. App Entry Point Update:**
- Modify `QualityControlApp.swift` to check onboarding status
- Show onboarding flow if not completed
- Show main app (MainTabView) if completed

**E. Tests:**
- Unit: LoveLanguagesViewModel (20 tests - including scoring algorithm)
- Unit: LoveLanguagesService (12 tests)
- Unit: OnboardingViewModel (16 tests)
- Unit: OnboardingService (10 tests)
- UI: Love Languages assessment flow (14 tests)
- UI: Onboarding flow end-to-end (18 tests)
- **Total: ~90 tests, 100% passing required**

**Acceptance Criteria:**
- [ ] Love Languages assessment with 30 questions completes successfully
- [ ] Results calculated correctly with ranking
- [ ] Love Languages display shows user and partner data
- [ ] Onboarding flow guides new users through setup
- [ ] User and Couple created successfully
- [ ] Onboarding completion persists and routes to main app
- [ ] All tests pass
- [ ] App runs on iPhone 16 simulator
- [ ] Screenshots captured
- [ ] Committed: "feat(week-6): Implement Love Languages and Onboarding"

**Estimated Time:** 16-20 hours

---

#### **WEEK 7: Requests + Settings (Profile & Session)**

**Goals:**
- Implement asynchronous Requests system for partner communication
- Create Settings screens for Profile and Session preferences
- Enable user customization

**Deliverables:**

**A. Requests (Views/Requests/):**
1. `RequestsListView.swift`
   - Active requests section (pending, in-progress)
   - Completed requests section
   - Filter by type (emotional-support, quality-time, physical-touch, etc.)
   - "New Request" button
   - Tap to view detail

2. `RequestDetailView.swift`
   - Request title and description
   - Type badge
   - Status display (pending/in-progress/completed/declined)
   - Timestamp (created, updated)
   - Response section (if responded)
   - Actions: Respond (if partner's request), Edit, Delete, Complete

3. `RequestComposeView.swift`
   - Title and description fields
   - Type selector
   - Priority toggle (optional)
   - Send to partner
   - Save as draft

4. `RequestResponseView.swift`
   - Original request display
   - Response text field
   - Accept/Decline buttons
   - Status update to `.inProgress` or `.declined`

**B. Settings - Profile (Views/Settings/):**
1. `SettingsView.swift`
   - Main settings navigation hub
   - Profile section
   - Session Preferences section
   - Notifications section
   - Privacy & Data section
   - About section

2. `ProfileSettingsView.swift`
   - User name edit
   - Email edit
   - Profile photo update
   - Partner name display
   - Relationship start date display
   - "Edit Relationship Details" button

3. `RelationshipDetailsEditView.swift`
   - Partner name edit
   - Relationship start date picker
   - Anniversary date picker
   - Save/Cancel buttons

**C. Settings - Session Preferences (Views/Settings/):**
1. `SessionPreferencesView.swift`
   - Default check-in frequency picker (weekly, bi-weekly, monthly)
   - Default categories toggle (pre-select favorites)
   - Discussion timer default duration
   - Auto-save drafts toggle
   - Reminder default time picker

**D. ViewModels & Services:**
1. `RequestsViewModel.swift`
   - Properties: activeRequests, completedRequests, filteredRequests, isLoading
   - Methods: loadRequests(), createRequest(), updateRequest(), respondToRequest(), deleteRequest()

2. `RequestsService.swift`
   - Protocol: RequestsServiceProtocol
   - Methods: fetchRequests(), saveRequest(), deleteRequest(), updateStatus()
   - Notification logic for new requests (local for now, push in Week 10)

3. `SettingsViewModel.swift`
   - Properties: currentUser, currentCouple, sessionPreferences, isLoading
   - Methods: loadSettings(), updateProfile(), updateRelationship(), updateSessionPreferences()

4. `SettingsService.swift`
   - Protocol: SettingsServiceProtocol
   - Methods: fetchUser(), updateUser(), fetchCouple(), updateCouple(), savePreferences()
   - UserDefaults for preferences storage

**E. Tests:**
- Unit: RequestsViewModel (20 tests)
- Unit: RequestsService (12 tests)
- Unit: SettingsViewModel (18 tests)
- Unit: SettingsService (10 tests)
- UI: Requests CRUD and response flow (16 tests)
- UI: Settings profile updates (10 tests)
- UI: Session preferences updates (8 tests)
- **Total: ~94 tests, 100% passing required**

**Acceptance Criteria:**
- [ ] Requests list displays active and completed requests
- [ ] Request creation and sending works
- [ ] Request responses update status correctly
- [ ] Profile settings allow editing user and relationship details
- [ ] Session preferences save and persist
- [ ] All tests pass
- [ ] App runs on iPhone 16 simulator
- [ ] Screenshots captured
- [ ] Committed: "feat(week-7): Implement Requests and Settings (Profile & Session)"

**Estimated Time:** 14-18 hours

---

#### **WEEK 8: Settings (Notifications & Privacy) + Polish**

**Goals:**
- Complete Settings with Notifications and Privacy sections
- Polish existing UI/UX across all screens
- Optimize performance and fix bugs

**Deliverables:**

**A. Settings - Notifications (Views/Settings/):**
1. `NotificationSettingsView.swift`
   - Enable/disable notifications toggle
   - Notification categories (Check-ins, Reminders, Requests)
   - Quiet hours time range picker
   - Notification sound picker
   - Request notification permissions if needed

**B. Settings - Privacy & Data (Views/Settings/):**
1. `PrivacySettingsView.swift`
   - Export data button (JSON export of all user data)
   - Delete account button (with confirmation alert)
   - Privacy policy link
   - Terms of service link

2. `DataExportView.swift`
   - Generate JSON export of all models
   - Share sheet for exporting file
   - Progress indicator during export

**C. About Section (Views/Settings/):**
1. `AboutView.swift`
   - App version display
   - Credits and acknowledgments
   - Contact support button (email link)
   - App Store review link

**D. UI/UX Polish:**
1. **Animations:**
   - Add smooth transitions between views
   - Use QCAnimations presets throughout app
   - Add loading state animations
   - Add success/error feedback animations

2. **Accessibility:**
   - Ensure all buttons have accessibility labels
   - Verify VoiceOver support for all interactive elements
   - Check color contrast ratios (WCAG AA compliance)
   - Add Dynamic Type support for text scaling

3. **Error Handling:**
   - Graceful error messages throughout app
   - Retry mechanisms for failed operations
   - Offline state handling (for Week 9 CloudKit prep)

4. **Performance Optimization:**
   - Optimize SwiftData queries (indexes, batch fetching)
   - Lazy loading for large lists
   - Image caching for photos
   - Reduce view re-renders with `@Observable` optimizations

**E. Bug Fixes:**
- Review all previous weeks' features
- Fix any reported issues
- Test edge cases (empty states, max limits, etc.)

**F. ViewModels & Services:**
1. Update `SettingsViewModel`
   - Add notification preferences properties
   - Add privacy actions (export, delete)
   - Methods: updateNotificationPreferences(), exportData(), deleteAccount()

2. Update `SettingsService`
   - Methods: saveNotificationPreferences(), exportUserData(), deleteUserAccount()
   - UNUserNotificationCenter integration for permissions

**G. Tests:**
- Unit: SettingsViewModel notifications & privacy (16 tests)
- Unit: SettingsService export & delete (10 tests)
- UI: Notification settings (8 tests)
- UI: Privacy data export (6 tests)
- UI: About section (4 tests)
- Accessibility tests: VoiceOver labels (20 tests across all screens)
- **Total: ~64 tests, 100% passing required**

**Acceptance Criteria:**
- [ ] Notification settings save and request permissions
- [ ] Data export generates valid JSON file
- [ ] Delete account removes all user data (with confirmation)
- [ ] All animations smooth and consistent
- [ ] VoiceOver support verified on all screens
- [ ] No critical bugs remaining
- [ ] Performance optimizations implemented
- [ ] All tests pass
- [ ] App runs on iPhone 16 simulator
- [ ] Screenshots captured
- [ ] Committed: "feat(week-8): Complete Settings (Notifications & Privacy) + Polish"

**Estimated Time:** 12-16 hours

---

#### **WEEK 9: CloudKit Sync**

**Goals:**
- Implement CloudKit integration for data synchronization
- Enable multi-device support
- Handle online/offline states

**Deliverables:**

**A. CloudKit Setup:**
1. Configure CloudKit container in Xcode project
2. Define CloudKit schema matching SwiftData models
3. Enable iCloud capability in project settings
4. Configure CloudKit dashboard (development/production environments)

**B. CloudKit Service Layer (Services/Sync/):**
1. `CloudKitService.swift`
   - Singleton service for CloudKit operations
   - Methods: syncUser(), syncCouple(), syncCheckIns(), syncNotes(), syncReminders(), syncMilestones(), syncLoveLanguages(), syncRequests()
   - Upload local changes to CloudKit
   - Download remote changes to SwiftData
   - Conflict resolution strategy (last-write-wins for MVP)

2. `SyncCoordinator.swift`
   - Orchestrates sync across all models
   - Handles sync scheduling (on app launch, background refresh)
   - Monitors network status
   - Retry failed syncs with exponential backoff

**C. Model Updates:**
- Add CloudKit metadata to all models:
  - `cloudKitRecordID: String?`
  - `lastSyncedAt: Date?`
  - `syncStatus: SyncStatus` enum (`.synced`, `.pendingUpload`, `.pendingDownload`, `.conflict`)

**D. Sync UI Indicators (Views/Shared/):**
1. `SyncStatusView.swift`
   - Small badge showing sync status
   - Display in navigation bar
   - Animations for syncing state
   - Tap to view sync details

2. `SyncDetailsView.swift` (Settings)
   - Last sync timestamp
   - Sync status per model
   - Manual sync trigger button
   - Sync logs (errors, conflicts)

**E. Offline Support:**
1. Detect network availability
2. Queue operations for later sync when offline
3. Display offline indicator in UI
4. Sync queued operations when back online

**F. Partner Sync:**
- Implement shared CloudKit records for Couple
- Enable partner access to shared data (check-ins, milestones, requests)
- Privacy enforcement (private notes remain private)

**G. ViewModels & Services Updates:**
- Modify all services to trigger CloudKit sync after CRUD operations
- Update ViewModels to display sync status
- Handle sync errors gracefully

**H. Tests:**
- Unit: CloudKitService sync operations (24 tests - mocked CloudKit)
- Unit: SyncCoordinator scheduling and conflict resolution (16 tests)
- Integration: Local → CloudKit → Local round-trip (10 tests per model = 80 tests)
- UI: Sync status display and manual trigger (8 tests)
- **Total: ~128 tests, 100% passing required**

**Acceptance Criteria:**
- [ ] CloudKit container configured correctly
- [ ] All models sync to CloudKit on create/update/delete
- [ ] Data syncs across devices (test with 2 simulator instances)
- [ ] Offline operations queue and sync when online
- [ ] Partner data sharing works (Couple, shared notes, requests)
- [ ] Sync status displayed in UI
- [ ] Conflicts resolved without data loss
- [ ] All tests pass
- [ ] App runs on iPhone 16 simulator
- [ ] Multi-device sync verified
- [ ] Committed: "feat(week-9): Implement CloudKit sync with multi-device support"

**Estimated Time:** 20-24 hours

---

#### **WEEK 10: Push Notifications + Widgets**

**Goals:**
- Implement push notifications for reminders and requests
- Create home screen widgets for quick insights
- Enhance app engagement

**Deliverables:**

**A. Push Notifications:**
1. **APNs Setup:**
   - Configure push notification capabilities
   - Register device for remote notifications
   - Handle notification authorization

2. **Notification Service (Services/Notifications/):**
   - `PushNotificationService.swift`
   - Register device token with APNs
   - Schedule local notifications (reminders, check-in prompts)
   - Receive remote notifications (partner requests, shared milestones)
   - Handle notification taps (deep linking to relevant screens)

3. **CloudKit Notifications:**
   - Subscribe to CloudKit database changes
   - Trigger push notifications on partner actions (new request, shared note)
   - Silent push for background sync

4. **Notification Categories:**
   - Check-in Reminder: "Start Now" action button
   - Partner Request: "View Request" action button
   - Milestone Shared: "View Milestone" action button

**B. Widgets (WidgetExtension/):**
1. **Widget Extension Setup:**
   - Create Widget Extension target in Xcode
   - Configure App Groups for shared data access
   - Share SwiftData models with widget target

2. **Widget: Dashboard Summary**
   - Small: Days since last check-in
   - Medium: Last check-in + next reminder
   - Large: Last check-in + upcoming reminders + recent milestone

3. **Widget: Upcoming Reminder**
   - Small: Next reminder time
   - Medium: Next 2 reminders with details
   - Large: Next 5 reminders with countdown timers

4. **Widget: Recent Milestone**
   - Small: Latest milestone icon + date
   - Medium: Latest milestone with title
   - Large: Latest 3 milestones with photos

5. **WidgetDataProvider.swift**
   - Fetch data from shared SwiftData container
   - Timeline provider for widget updates
   - Refresh intervals (hourly for reminders, daily for milestones)

**C. Deep Linking:**
1. `DeepLinkCoordinator.swift`
   - Handle notification taps
   - Handle widget taps
   - Navigate to specific screens (CheckInDetailView, ReminderDetailView, MilestoneDetailView, RequestDetailView)
   - URL scheme: `qualitycontrol://`

**D. Background App Refresh:**
- Enable background refresh capability
- Schedule background sync tasks
- Update widgets in background

**E. Tests:**
- Unit: PushNotificationService registration and handling (14 tests)
- Unit: WidgetDataProvider data fetching (12 tests)
- Unit: DeepLinkCoordinator routing (10 tests)
- Integration: Notification → Deep Link → Screen navigation (8 tests)
- UI: Widget display verification (12 tests - requires widget simulator testing)
- **Total: ~56 tests, 100% passing required**

**Acceptance Criteria:**
- [ ] Push notifications authorized and registered
- [ ] Local notifications scheduled for reminders
- [ ] Remote notifications received for partner actions
- [ ] Notification taps navigate to correct screens
- [ ] Widgets display current data
- [ ] Widgets update on timeline schedule
- [ ] Widget taps deep link to app screens
- [ ] Background refresh updates data
- [ ] All tests pass
- [ ] App runs on iPhone 16 simulator
- [ ] Widgets visible on home screen
- [ ] Committed: "feat(week-10): Implement push notifications and home screen widgets"

**Estimated Time:** 18-22 hours

---

#### **WEEK 11: Testing & Optimization**

**Goals:**
- Comprehensive testing of all features
- Performance optimization and profiling
- Bug fixes and edge case handling
- Prepare for production release

**Deliverables:**

**A. Testing:**
1. **End-to-End User Flows:**
   - New user onboarding → Profile setup → First check-in → Note creation → Milestone creation
   - Reminder creation → Notification received → Check-in triggered
   - Request sent → Partner responds → Request completed
   - Love Languages assessment → Results saved → Shared with partner

2. **Edge Case Testing:**
   - Empty states (no check-ins, no notes, no milestones)
   - Maximum limits (1000+ notes, 500+ check-ins)
   - Invalid inputs (empty required fields, past dates for future events)
   - Network failures during sync
   - Rapid user interactions (double taps, quick navigation)

3. **Device Testing:**
   - Test on multiple simulator devices (iPhone SE, iPhone 16, iPhone 16 Pro Max, iPad)
   - Test on different iOS versions (iOS 17.0, 17.5, 18.0, 18.1)
   - Dark mode testing
   - Landscape orientation testing (iPad)

4. **Accessibility Testing:**
   - VoiceOver navigation through all screens
   - Dynamic Type scaling (smallest to largest text sizes)
   - Reduce Motion support (disable animations)
   - Color contrast verification (WCAG AA compliance)

**B. Performance Optimization:**
1. **Instruments Profiling:**
   - Time Profiler: Identify CPU bottlenecks
   - Allocations: Memory leak detection
   - Leaks: SwiftData retain cycle detection
   - Energy Log: Battery usage optimization

2. **SwiftData Optimization:**
   - Add indexes to frequently queried properties
   - Batch fetch limits for large datasets
   - Lazy loading for relationship queries
   - Remove unused predicates and sorts

3. **UI Optimization:**
   - LazyVStack/LazyHStack for long lists
   - AsyncImage caching for photos
   - Reduce view hierarchy depth
   - Optimize @Observable dependencies

**C. Bug Fixes:**
- Prioritize critical bugs (crashes, data loss)
- Fix UI glitches (layout issues, animation jank)
- Resolve edge case failures
- Address TestFlight feedback (if beta testing started)

**D. Code Quality:**
1. **Code Review:**
   - Ensure consistent coding style
   - Remove commented-out code
   - Remove debug print statements
   - Add missing documentation comments

2. **Static Analysis:**
   - Enable all Xcode warnings
   - Fix analyzer warnings
   - Run SwiftLint (if configured)

**E. Security & Privacy:**
- Ensure sensitive data encrypted in SwiftData
- Verify private notes not shared via CloudKit
- Check for hardcoded secrets or API keys
- Review privacy manifest (required for App Store)

**F. Tests:**
- Review all existing tests (~600+ tests accumulated from weeks 2-10)
- Ensure 80%+ code coverage overall
- Add missing integration tests
- Fix flaky tests
- Snapshot tests for critical UI screens
- **Total: ~700+ tests, 100% passing required**

**Acceptance Criteria:**
- [ ] All end-to-end user flows complete successfully
- [ ] No critical or high-priority bugs remaining
- [ ] App performs smoothly on all tested devices
- [ ] Accessibility features verified
- [ ] Performance metrics within acceptable ranges (launch time <2s, 60fps UI)
- [ ] Code quality high with no warnings
- [ ] Test coverage ≥80%
- [ ] All tests pass
- [ ] Committed: "test(week-11): Comprehensive testing, optimization, and bug fixes"

**Estimated Time:** 16-20 hours

---

#### **WEEK 12: App Store Preparation + Submission**

**Goals:**
- Finalize app metadata for App Store
- Create marketing materials (screenshots, preview video)
- Submit to App Store for review
- Prepare launch plan

**Deliverables:**

**A. App Store Assets:**
1. **App Icon:**
   - Generate all required sizes (1024x1024 for App Store, various sizes for app)
   - Ensure icon follows Apple Human Interface Guidelines

2. **Screenshots:**
   - iPhone 6.9" display (iPhone 16 Pro Max): 6-10 screenshots
   - iPhone 6.7" display (iPhone 16 Plus): 6-10 screenshots
   - iPhone 6.5" display (older models): 6-10 screenshots
   - iPad Pro 12.9": 6-10 screenshots (optional but recommended)
   - Localized if supporting multiple languages

   **Screenshot Content:**
   - Dashboard with sample data
   - Check-in flow (Step 2 category selection)
   - Notes list
   - Growth Gallery
   - Love Languages results
   - Onboarding welcome screen

3. **App Preview Video (Optional but Recommended):**
   - 15-30 second video demonstrating app features
   - Voiceover or captions explaining value proposition
   - Export in required formats

**B. App Store Metadata:**
1. **App Store Connect Configuration:**
   - App name: "QualityControl - Relationship Check-ins"
   - Subtitle: "Strengthen your relationship together"
   - Category: Lifestyle (primary), Health & Fitness (secondary)
   - Age rating: 12+ (mild romantic/sexual content or themes)

2. **Description:**
   ```
   QualityControl helps couples strengthen their relationship through intentional check-ins, shared milestones, and meaningful communication.

   FEATURES:
   • Guided Check-ins: 6-step structured conversations with customizable categories
   • Private & Shared Notes: Capture thoughts and reflections with privacy controls
   • Growth Gallery: Celebrate relationship milestones and memories together
   • Smart Reminders: Never miss important dates or check-in times
   • Love Languages: Understand each other's communication preferences
   • Asynchronous Requests: Communicate needs thoughtfully and respectfully
   • CloudKit Sync: Seamless data sync across all your devices
   • Widgets: Quick insights right from your home screen

   BUILT FOR COUPLES:
   QualityControl is designed for partners who want to invest in their relationship. Whether you're navigating long distance, busy schedules, or just want to deepen your connection, our app provides the structure and tools to make it easy.

   PRIVACY FIRST:
   Your data is yours. All notes and reflections are stored securely with iCloud, and you control what's shared with your partner. Private notes stay private.

   TESTIMONIALS:
   [Add user testimonials if available from beta testing]

   Download QualityControl today and start building a stronger relationship together.
   ```

3. **Keywords:**
   - relationship, couples, check-in, communication, love, partnership, connection, intimacy, therapy, counseling, milestones, reminders, love languages, quality time

4. **Promotional Text:**
   "Start meaningful conversations with your partner. Track your growth together. Build a stronger relationship with QualityControl."

5. **Support URL:**
   - Create landing page or use GitHub repository

6. **Privacy Policy URL:**
   - Create privacy policy document (required)
   - Host on website or GitHub Pages

**C. App Configuration:**
1. **Version Number:**
   - Marketing Version: 1.0
   - Build Number: 1

2. **Privacy Manifest:**
   - Document required reasons for API usage (if applicable)
   - Nutrition label for App Store (data collection disclosure)

3. **App Store Review Information:**
   - Demo account credentials (for reviewers to test app)
   - Notes for reviewer explaining features and functionality

**D. Build & Submit:**
1. **Archive Build:**
   - Set scheme to Release configuration
   - Archive app in Xcode
   - Validate archive (check for warnings/errors)
   - Distribute to App Store Connect

2. **TestFlight (Optional but Recommended):**
   - Upload build to TestFlight
   - Invite internal testers (up to 100)
   - Gather feedback and fix critical issues
   - Upload revised build if necessary

3. **Submit for Review:**
   - Complete App Store Connect listing
   - Upload all assets (screenshots, preview video)
   - Select build version
   - Submit for review

**E. Launch Plan:**
1. **Post-Submission:**
   - Monitor App Store Connect for review status
   - Respond to App Review feedback promptly
   - Plan launch date (manual release vs. automatic)

2. **Marketing Materials:**
   - Prepare social media posts
   - Create landing page with download link
   - Write blog post or press release (optional)

3. **Post-Launch Monitoring:**
   - Monitor crash reports in Xcode Organizer
   - Review user feedback and ratings
   - Plan for version 1.1 with bug fixes and improvements

**F. Documentation:**
1. Update README.md with:
   - App Store link (once approved)
   - User guide
   - Feature highlights
   - Support contact

2. Create CHANGELOG.md documenting v1.0 features

**G. Tests:**
- Final sanity tests on Release build
- Verify no debug code or logging in Release
- Test on physical device if available
- **No new tests needed this week - ensure all previous tests still pass**

**Acceptance Criteria:**
- [ ] All App Store assets created (icon, screenshots, video)
- [ ] App Store metadata complete and compelling
- [ ] Privacy policy published
- [ ] Archive build validated successfully
- [ ] Build uploaded to App Store Connect
- [ ] TestFlight testing completed (optional)
- [ ] Submitted for App Store review
- [ ] Launch plan documented
- [ ] All tests pass (final verification)
- [ ] Committed: "release(v1.0): App Store submission ready"

**Estimated Time:** 10-14 hours

---

## Progress Tracking

**Maintain a running log in this format:**

### Progress Log

```markdown
# QualityControl Development Progress

## Week 2: Design System ✅ COMPLETE
**Started:** [ISO timestamp]
**Completed:** [ISO timestamp]
**Duration:** X hours

### Deliverables Completed:
- ✅ QCColors.swift - 15 semantic colors, dark mode support
- ✅ QCTypography.swift - 12 text styles with SF Pro
- ✅ QCSpacing.swift - 6-point spacing scale
- ✅ QCAnimations.swift - 5 animation presets
- ✅ QCButton.swift - 3 variants, 3 sizes, loading/disabled states
- ✅ QCTextField.swift - Label, error, character count, secure entry
- ✅ QCCard.swift - Elevation, header/footer, padding variants
- ✅ QCEmptyState.swift - Icon, title, subtitle, action
- ✅ QCLoadingView.swift - Full-screen and inline variants
- ✅ Tests: 42 passed, 0 failed (100% coverage)

### Commits:
- feat(design-system): Add QCColors with semantic palette (abc1234)
- feat(design-system): Add QCTypography with SF Pro text styles (def5678)
- feat(design-system): Add spacing scale and corner radius (ghi9012)
- feat(design-system): Add animation presets and easing curves (jkl3456)
- feat(design-system): Add reusable button component (mno7890)
- feat(design-system): Add text field component with validation (pqr1234)
- feat(design-system): Add card and empty state components (stu5678)
- test(design-system): Complete unit tests for all components (vwx9012)
- feat(week-2): Complete design system foundation (yz01234)

### Challenges & Resolutions:
- Challenge: Color contrast failing WCAG AA for secondary button text
  - Resolution: Adjusted secondary color from #6C757D to #5A6268 for 4.5:1 contrast ratio

### Screenshots:
- /docs/screenshots/week2-design-tokens.png
- /docs/screenshots/week2-button-variants.png
- /docs/screenshots/week2-text-field-states.png

---

## Week 3: Dashboard + Check-in Steps 1-3 🔄 IN PROGRESS
**Started:** [ISO timestamp]
**Current Status:** Implementing DashboardViewModel

### Deliverables Completed:
- ✅ DashboardView.swift
- ✅ RecentCheckInsCard.swift
- 🔄 DashboardViewModel.swift (60% complete)
- ⏳ DashboardService.swift (not started)
- ⏳ Check-in flow views (not started)

### Next Steps:
1. Complete DashboardViewModel
2. Implement DashboardService
3. Write unit tests for Dashboard
4. Begin Check-in flow Step 1 (WelcomeView)

### Blockers:
- None currently

---

[Continue logging for each week...]
```

**Before Context Window Refresh (Token Budget Approaching):**

Save this information to memory or a markdown file:
1. Current week number and status
2. Last completed deliverable
3. Next immediate task
4. Any blockers or issues
5. Test results summary
6. Recent commit hashes

Example:
```markdown
# Context Refresh Checkpoint - [ISO Timestamp]

## Current State:
- **Week:** 5 (Growth Gallery + Reminders)
- **Status:** 70% complete
- **Last Completed:** ReminderComposeView.swift with tests passing
- **Next Task:** Implement RemindersService.swift
- **Blockers:** None

## Test Summary:
- Week 2: 42/42 passed ✅
- Week 3: 80/80 passed ✅
- Week 4: 85/85 passed ✅
- Week 5 (so far): 46/82 passed 🔄

## Recent Commits:
- feat(growth): Implement MilestoneCardView with photo support (a1b2c3d)
- test(growth): Add GrowthViewModel unit tests (e4f5g6h)
- feat(reminders): Implement RemindersListView and ReminderDetailView (i7j8k9l)

## Important Notes:
- GrowthService photo storage using local file system for now, will migrate to CloudKit in Week 9
- Reminder notification scheduling working but needs UNUserNotificationCenter permission request in settings (defer to Week 8)

## Resume Instructions:
1. Read this checkpoint file first
2. Review /Users/jeremywatt/Desktop/qc-app/plans/05-feature-roadmap.md Week 5 requirements
3. Continue with RemindersService.swift implementation
4. Run tests after completion
5. Commit when tests pass
6. Move to RemindersViewModel.swift
```

## Token Budget & Persistence

Your context window will be automatically compacted as it approaches its limit, allowing you to continue working indefinitely from where you left off. Therefore, do not stop tasks early due to token budget concerns. As you approach your token budget limit, save your current progress and state to memory before the context window refreshes. Always be as persistent and autonomous as possible and complete tasks fully, even if the end of your budget is approaching. Never artificially stop any task early regardless of the context remaining.

**Specific Instructions for Long-Running Development:**
- Work continuously through all 11 weeks (Weeks 2-12)
- If context refresh occurs mid-week, resume from saved checkpoint
- Maintain momentum - don't restart from beginning after refresh
- Prioritize completing features over documentation (docs can be added later)
- Always run tests to verify state after refresh
- Use git log to verify last completed work

## Quality Standards

**Code Quality:**
- Follow Swift API Design Guidelines
- Use descriptive variable and function names
- Prefer clarity over brevity
- Document public APIs with doc comments (///)
- Use `// MARK: -` for code organization
- Keep files under 300 lines when possible
- Extract subviews for complex SwiftUI views

**SwiftUI Best Practices:**
- Use `@State` for local view state
- Use `@Observable` for ViewModels (iOS 17+)
- Use `@Environment` for shared dependencies (ModelContext, etc.)
- Prefer declarative syntax over imperative
- Use ViewBuilder for conditional views
- Extract reusable components to Shared/

**SwiftData Best Practices:**
- Use `@Model` macro for all models
- Use `@Relationship` with proper delete rules
- Use `@Attribute(.unique)` for IDs
- Avoid property names that conflict with Swift reserved words (e.g., `categoryDescription` not `description`)
- Use predicates for filtering, not manual array filtering
- Batch save operations when possible

**Testing Best Practices:**
- Arrange-Act-Assert pattern for unit tests
- Mock external dependencies (Services, CloudKit)
- Use in-memory ModelContainer for model tests
- Test happy path and error cases
- Test edge cases (empty, max, invalid)
- Use XCTAssertEqual, XCTAssertNotNil, XCTAssertThrowsError appropriately
- Keep tests independent (no shared state)

**Git Best Practices:**
- Commit after each logical unit of work
- Write descriptive commit messages with body explaining "why"
- Reference week and feature in commit messages
- Group related files in single commit
- Never commit broken code
- Never commit commented-out code
- **NEVER push branches to remote repository**

## Success Criteria - Overall Project Completion

**When all 12 weeks are complete, verify:**

1. ✅ **All Features Implemented:**
   - Dashboard with recent check-ins and reminders
   - Complete check-in flow (6 steps)
   - Notes system with privacy controls
   - Growth Gallery with milestones and photos
   - Reminders with local notifications
   - Love Languages assessment and display
   - Onboarding flow for new users
   - Requests system for partner communication
   - Settings (Profile, Session, Notifications, Privacy)
   - CloudKit sync with multi-device support
   - Push notifications for reminders and partner actions
   - Home screen widgets (3 types)

2. ✅ **All Tests Pass:**
   - Total test count: ~700+ tests
   - Overall coverage: ≥80%
   - No failing tests
   - No flaky tests

3. ✅ **App Quality:**
   - Builds without errors or warnings
   - Runs smoothly on iPhone 16 simulator
   - Tested on multiple device sizes
   - Accessibility verified (VoiceOver, Dynamic Type)
   - Dark mode supported
   - Performance optimized (launch <2s, 60fps UI)

4. ✅ **App Store Ready:**
   - All metadata complete
   - Screenshots and preview video created
   - Privacy policy published
   - Build archived and uploaded
   - Submitted for review

5. ✅ **Documentation:**
   - README.md updated with App Store link (when approved)
   - CHANGELOG.md created for v1.0
   - Code documented with comments
   - No debug code or print statements

6. ✅ **Git History:**
   - Granular commits throughout development
   - Descriptive commit messages
   - Clear progression from Week 2 → Week 12
   - All commits local (no pushes)

**Final Verification Commands:**

```bash
# Count total commits
git log --oneline | wc -l

# Verify last commit
git log -1 --stat

# Check for uncommitted changes
git status

# List all weeks completed (search commit messages)
git log --oneline | grep "feat(week-"

# Run final test suite
test_sim({
  projectPath: "/Users/jeremywatt/Desktop/qc-app/QualityControl/QualityControl.xcodeproj",
  scheme: "QualityControl",
  simulatorName: "iPhone 16"
})

# Build release archive (final step before submission)
# (Use Xcode GUI: Product → Archive)
```

---

## Summary

This prompt guides you through 11 weeks of autonomous iOS development for QualityControl:

- **Weeks 2-4:** Foundation (Design system, Dashboard, Check-in flow, Notes)
- **Weeks 5-6:** Core features (Growth, Reminders, Love Languages, Onboarding)
- **Weeks 7-8:** Advanced features (Requests, Settings, Polish)
- **Weeks 9-10:** Integration (CloudKit, Notifications, Widgets)
- **Weeks 11-12:** Launch (Testing, Optimization, App Store submission)

You will work autonomously, following MVVM architecture, writing comprehensive tests, committing frequently, and building towards a production-ready iOS app. Use xcodebuild MCP tools for all development, testing, and verification.

Reference the plans/ directory constantly. Build features incrementally. Test relentlessly. Commit granularly. Continue persistently through context refreshes.

**Your mission: Transform QualityControl from a 10-model foundation into a fully-featured, App Store-ready iOS relationship app.**

🚀 **Begin with Week 2 design system completion and proceed sequentially through Week 12.**
