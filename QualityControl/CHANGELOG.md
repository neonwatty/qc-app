# Changelog

All notable changes to the Quality Control iOS app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Week 3 - Core UI & Navigation (October 15-17, 2025)

#### Added - Week 3 Day 1 (Check-in Coordinator)
- `CheckInCoordinator` for managing 6-step check-in flow navigation
- `CheckInViewModel` with comprehensive state management
- `CheckInService` for check-in business logic
- 6 check-in step views (Welcome, Category Selection, Discussion, Reflection, Action Items, Completion)
- Check-in flow integration with SwiftData persistence
- 47 coordinator and service tests

#### Added - Week 3 Day 2 (Dashboard)
- `DashboardView` with stats, quick actions, and activity feed
- `DashboardViewModel` for dashboard state management
- `DashboardService` for dashboard business logic
- `PrepBanner` component for check-in reminders
- `QuickActionCard` reusable component
- `ActivityFeedItemView` for recent activity display
- Dashboard to check-in navigation integration
- 38 dashboard-related tests

#### Added - Week 3 Day 3 (Tab Coordination & Polish)
- `TabCoordinator` for programmatic tab navigation
- Tab badge management system
- Enhanced `CheckInTabView` with educational intro screen
- Design system integration across all placeholder views
- CheckInStepRow component for flow visualization
- 22 tab coordinator tests

#### Added - Week 3 Day 4 (Integration Testing)
- 8 end-to-end check-in flow integration tests
- 19 navigation integration tests covering:
  - Tab navigation flows
  - Dashboard to check-in flows
  - Cross-view data sharing
  - ViewModel state management
  - Data persistence across navigation

#### Changed - Week 3
- Updated `MainTabView` to use `TabCoordinator`
- Replaced `.pink` accent color with `QCColors.primary` throughout
- Enhanced tab bar with badge support for all 5 tabs
- Improved check-in tab UX with onboarding content

#### Testing - Week 3
- **Total Tests**: 719 (up from 577 at start of Week 3)
- **New Tests Added**: 142 tests
- **Pass Rate**: 96.8% (696 passing)
- **Coverage**: Dashboard, Check-in flow, Tab navigation, Integration tests

### Week 2 - Design System (October 13-14, 2025)

#### Added
- `QCColors` with light/dark theme support
- `QCTypography` with 10 text styles
- `QCSpacing` with 6 spacing levels
- `QCAnimations` with 5 animation presets
- `QCButton` component with 4 variants
- `QCCard` component with flexible layouts
- `QCLoadingView` component
- Design system preview helpers
- 80+ design system tests

### Week 1 - Foundation (October 11-12, 2025)

#### Added
- SwiftData models (10 models total):
  - User, Couple
  - CheckInSession, Category, ActionItem
  - Note, Reminder
  - Milestone, LoveLanguage
  - RelationshipRequest
- Tab-based navigation with 5 tabs
- `MockDataGenerator` for preview data
- `PreviewContainer` helper for SwiftUI previews
- `TestModelContext` helper for tests
- Basic model tests (100+ tests)

## Version History

### [0.3.0] - Week 3 Complete - 2025-10-17
- Core UI implementation complete
- Dashboard, Check-in flow, Navigation
- 719 total tests

### [0.2.0] - Week 2 Complete - 2025-10-14
- Design system implementation complete
- 577 total tests

### [0.1.0] - Week 1 Complete - 2025-10-12
- Foundation setup complete
- SwiftData models and navigation
- 100+ initial tests

## Notes

- Pre-existing test failures (23 tests) are known SwiftData enum predicate limitations
- All new functionality is fully tested with no regressions
- App builds and runs successfully on iOS 17+ simulators and devices
