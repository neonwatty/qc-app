# Phase 1.2: ViewModel Tests - Implementation Plan

## Overview
Comprehensive test coverage for all 9 ViewModels in the QualityControl iOS app. ViewModels use the `@Observable` macro and `@MainActor` isolation, requiring specific testing patterns.

## Test Pattern for ViewModels

```swift
@MainActor
final class SomeViewModelTests: XCTestCase {

    var modelContainer: ModelContainer!
    var modelContext: ModelContext!
    var viewModel: SomeViewModel!

    // No setUp() override! Create inline in each test to avoid container lifecycle issues

    func testSomething() throws {
        // Setup
        (modelContainer, modelContext) = try TestModelContext.create()
        viewModel = SomeViewModel(modelContext: modelContext)

        // Test implementation
        // ...
    }
}
```

## ViewModels to Test (9 total, ~160 tests)

### 1. CheckInViewModel (~30 tests)
**File:** `QualityControl/ViewModels/CheckInViewModel.swift`

**Test Categories:**
- Initialization (5 tests)
  - testInitialization
  - testInitializationWithExistingSession
  - testLoadAvailableCategories
  - testInitialState
  - testSessionStateRestoration

- Flow Navigation (8 tests)
  - testNextStep
  - testPreviousStep
  - testGoToStep
  - testProgressCalculation
  - testCanProceedValidation
  - testStepTitles
  - testStepDescriptions
  - testCompletionStepNavigation

- Category Management (5 tests)
  - testToggleCategorySelection
  - testToggleCategoryDeselection
  - testIsCategorySelected
  - testCategoryPersistence
  - testMultipleCategorySelection

- Discussion Notes (3 tests)
  - testUpdateDiscussionNotes
  - testGetDiscussionNotes
  - testMultipleCategoryNotes

- Session Notes (2 tests)
  - testUpdateSessionNotes
  - testSessionNotesPersistence

- Action Items (4 tests)
  - testAddActionItem
  - testRemoveActionItem
  - testActionItemWithPriority
  - testActionItemAssignment

- Session Control (3 tests)
  - testCompleteSession
  - testAbandonSession
  - testSessionStatusUpdates

### 2. DashboardViewModel (~25 tests)
**File:** `QualityControl/ViewModels/DashboardViewModel.swift`

**Test Categories:**
- Initialization (3 tests)
  - testInitialization
  - testLoadDashboardData
  - testInitialLoadingState

- Upcoming Check-ins (5 tests)
  - testFetchUpcomingCheckIns
  - testUpcomingCheckInSorting
  - testEmptyUpcomingCheckIns
  - testCreateNewCheckIn
  - testResumeCheckIn

- Recent Activity (5 tests)
  - testFetchRecentActivity
  - testActivitySorting
  - testActivityLimiting
  - testEmptyRecentActivity
  - testMixedActivityTypes

- Statistics (5 tests)
  - testCheckInStreak
  - testCompletedCheckInsCount
  - testAverageSessionDuration
  - testMostDiscussedCategories
  - testProgressMetrics

- Refresh & Loading (4 tests)
  - testRefreshData
  - testLoadingStates
  - testErrorHandling
  - testConcurrentRefresh

- Quick Actions (3 tests)
  - testQuickStartCheckIn
  - testQuickAddNote
  - testQuickAddReminder

### 3. NotesViewModel (~20 tests)
**File:** `QualityControl/ViewModels/NotesViewModel.swift`

**Test Categories:**
- Initialization (2 tests)
  - testInitialization
  - testLoadNotes

- CRUD Operations (8 tests)
  - testCreateNote
  - testUpdateNote
  - testDeleteNote
  - testReadNote
  - testCreateDraftNote
  - testPublishDraft
  - testDiscardDraft
  - testAutoSaveDraft

- Privacy & Filtering (5 tests)
  - testFilterByPrivacy
  - testPrivateNotes
  - testSharedNotes
  - testDraftNotes
  - testPrivacyToggle

- Search & Sort (3 tests)
  - testSearchNotes
  - testSortByDate
  - testSortByTitle

- Note Attachment (2 tests)
  - testAttachToCheckIn
  - testDetachFromCheckIn

### 4. GrowthViewModel (~20 tests)
**File:** `QualityControl/ViewModels/GrowthViewModel.swift`

**Test Categories:**
- Initialization (2 tests)
  - testInitialization
  - testLoadMilestones

- Milestone Management (8 tests)
  - testCreateMilestone
  - testUpdateMilestone
  - testDeleteMilestone
  - testMarkAsAchieved
  - testUnmarkAchievement
  - testAddPhoto
  - testRemovePhoto
  - testMultiplePhotos

- Filtering & Sorting (5 tests)
  - testFilterByCategory
  - testFilterByAchieved
  - testFilterByUpcoming
  - testSortByDate
  - testSortByImportance

- Statistics (3 tests)
  - testTotalMilestones
  - testAchievementRate
  - testUpcomingMilestones

- Celebration (2 tests)
  - testCelebrationMode
  - testShareMilestone

### 5. RemindersViewModel (~20 tests)
**File:** `QualityControl/ViewModels/RemindersViewModel.swift`

**Test Categories:**
- Initialization (2 tests)
  - testInitialization
  - testLoadReminders

- CRUD Operations (6 tests)
  - testCreateReminder
  - testUpdateReminder
  - testDeleteReminder
  - testCompleteReminder
  - testSnoozeReminder
  - testDismissReminder

- Scheduling (5 tests)
  - testOneTimeReminder
  - testRecurringDaily
  - testRecurringWeekly
  - testRecurringMonthly
  - testCustomSchedule

- Filtering (4 tests)
  - testFilterByCategory
  - testFilterByDueDate
  - testFilterByCompleted
  - testFilterByActive

- Notifications (3 tests)
  - testScheduleNotification
  - testCancelNotification
  - testUpdateNotification

### 6. LoveLanguagesViewModel (~15 tests)
**File:** `QualityControl/ViewModels/LoveLanguagesViewModel.swift`

**Test Categories:**
- Initialization (2 tests)
  - testInitialization
  - testLoadLoveLanguages

- CRUD Operations (5 tests)
  - testAddLoveLanguage
  - testUpdateLoveLanguage
  - testDeleteLoveLanguage
  - testAddExample
  - testRemoveExample

- Ranking (4 tests)
  - testRankLanguages
  - testReorderLanguages
  - testTopLanguage
  - testRankingPersistence

- Categories (4 tests)
  - testWordsOfAffirmation
  - testQualityTime
  - testGifts
  - testActsOfService
  - testPhysicalTouch

### 7. RequestsViewModel (~15 tests)
**File:** `QualityControl/ViewModels/RequestsViewModel.swift`

**Test Categories:**
- Initialization (2 tests)
  - testInitialization
  - testLoadRequests

- CRUD Operations (5 tests)
  - testCreateRequest
  - testUpdateRequest
  - testDeleteRequest
  - testFulfillRequest
  - testDeclineRequest

- Request Types (4 tests)
  - testConversationRequest
  - testActivityRequest
  - testNeedRequest
  - testAppreciationRequest

- Filtering (4 tests)
  - testFilterByStatus
  - testFilterByType
  - testFilterByRequestedBy
  - testFilterByRequestedFor

### 8. OnboardingViewModel (~10 tests)
**File:** `QualityControl/ViewModels/OnboardingViewModel.swift`

**Test Categories:**
- Initialization (2 tests)
  - testInitialization
  - testWelcomeState

- Flow Navigation (4 tests)
  - testNextPage
  - testPreviousPage
  - testSkipToEnd
  - testProgressTracking

- Data Collection (3 tests)
  - testSaveUserProfile
  - testSavePartnerInfo
  - testSaveRelationshipDate

- Completion (1 test)
  - testCompleteOnboarding

### 9. SettingsViewModel (~10 tests)
**File:** `QualityControl/ViewModels/SettingsViewModel.swift`

**Test Categories:**
- Initialization (2 tests)
  - testInitialization
  - testLoadSettings

- User Profile (3 tests)
  - testUpdateName
  - testUpdateEmail
  - testUpdateAvatar

- Preferences (3 tests)
  - testToggleNotifications
  - testUpdateTheme
  - testUpdateLanguage

- Account Actions (2 tests)
  - testLogout
  - testDeleteAccount

## Implementation Strategy

### Phase A: Core ViewModels (Weeks 3-4)
1. ✅ CheckInViewModel (30 tests) - Most complex, start here
2. ✅ DashboardViewModel (25 tests) - Core functionality
3. ✅ NotesViewModel (20 tests) - Common patterns

### Phase B: Feature ViewModels (Week 5)
4. ✅ GrowthViewModel (20 tests)
5. ✅ RemindersViewModel (20 tests)
6. ✅ LoveLanguagesViewModel (15 tests)

### Phase C: Supporting ViewModels (Week 6)
7. ✅ RequestsViewModel (15 tests)
8. ✅ OnboardingViewModel (10 tests)
9. ✅ SettingsViewModel (10 tests)

## Testing Patterns & Best Practices

### 1. Test Structure
```swift
func testFeature() throws {
    // Setup - Create fresh context and viewModel
    (modelContainer, modelContext) = try TestModelContext.create()
    viewModel = SomeViewModel(modelContext: modelContext)

    // Given - Prepare test data
    let testData = createTestData()

    // When - Execute action
    viewModel.someAction(testData)

    // Then - Verify results
    XCTAssertEqual(viewModel.property, expectedValue)
}
```

### 2. Testing @Observable Properties
```swift
// Observable properties can be accessed directly
XCTAssertTrue(viewModel.isLoading)
XCTAssertNil(viewModel.error)
XCTAssertEqual(viewModel.items.count, 3)
```

### 3. Testing Service Integration
```swift
// ViewModels inject services, test service interactions
viewModel.loadData()
XCTAssertTrue(viewModel.dataLoaded)

// Verify data was fetched and stored
XCTAssertEqual(viewModel.items.count, expectedCount)
```

### 4. Testing Error Handling
```swift
// Test error states
viewModel.performAction(invalidData)
XCTAssertNotNil(viewModel.error)
XCTAssertTrue(viewModel.error is SomeError)
```

### 5. Testing Async Operations
```swift
func testAsyncLoad() async throws {
    (modelContainer, modelContext) = try TestModelContext.create()
    viewModel = SomeViewModel(modelContext: modelContext)

    await viewModel.loadDataAsync()

    XCTAssertFalse(viewModel.isLoading)
    XCTAssertNotEmpty(viewModel.data)
}
```

## Common Assertions

```swift
// State assertions
XCTAssertTrue(viewModel.isLoading)
XCTAssertFalse(viewModel.hasError)
XCTAssertNil(viewModel.error)

// Data assertions
XCTAssertNotEmpty(viewModel.items)
XCTAssertEqual(viewModel.items.count, 5)
XCTAssertContains(viewModel.items, where: { $0.id == expectedId })

// Service call verification
XCTAssertTrue(viewModel.dataWasLoaded)
XCTAssertEqual(viewModel.refreshCount, 1)
```

## Estimated Effort

- Total Tests: ~165 tests
- Time per Test: ~5-10 minutes (setup + implementation + verification)
- Total Estimated Time: 15-25 hours
- Realistic Timeline: 1-2 weeks (allowing for debugging and refinement)

## Dependencies

- ✅ TestModelContext helper (working, returns tuple)
- ✅ Model tests (all passing, validated patterns)
- ✅ Service layer (CheckInService, DashboardService exist)
- ⚠️ Mock services (may need to create for isolation)

## Success Criteria

- [ ] All 165 ViewModel tests passing
- [ ] No setUp()/tearDown() crashes (use inline context creation)
- [ ] ViewModels properly update @Observable state
- [ ] Service integration works correctly
- [ ] Error handling is robust
- [ ] Async operations complete successfully
- [ ] All tests run in <60 seconds total

## Next Steps

1. Start with CheckInViewModel (30 tests) - most complex
2. Validate pattern works for @Observable ViewModels
3. Apply pattern to remaining 8 ViewModels
4. Run complete suite and fix any issues
5. Commit and push to remote

---

**Status:** Ready to begin implementation
**Priority:** High - Core testing infrastructure for UI layer
**Blocked By:** None
