# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quality Control (QC) is a native iOS relationship check-in app built with Swift and SwiftUI. This project is in active development, transforming a Next.js proof-of-concept into a production-ready iOS application.

## Tech Stack

- **Language**: Swift 5.0+
- **UI Framework**: SwiftUI 100%
- **Persistence**: SwiftData (iOS 17+)
- **Architecture**: MVVM + Coordinators
- **Minimum iOS**: 17.0+
- **Xcode**: 16.0+
- **Testing**: XCTest

## Development Commands

```bash
# Open project in Xcode
open QualityControl/QualityControl.xcodeproj

# Build for simulator (via xcodebuild MCP)
build_sim({
  projectPath: "/Users/jeremywatt/Desktop/qc-app/QualityControl/QualityControl.xcodeproj",
  scheme: "QualityControl",
  simulatorName: "iPhone 16"
})

# Build and run
build_run_sim({
  projectPath: "/Users/jeremywatt/Desktop/qc-app/QualityControl/QualityControl.xcodeproj",
  scheme: "QualityControl",
  simulatorName: "iPhone 16"
})

# Run tests
test_sim({
  projectPath: "/Users/jeremywatt/Desktop/qc-app/QualityControl/QualityControl.xcodeproj",
  scheme: "QualityControl",
  simulatorName: "iPhone 16"
})

# Clean build
clean({
  projectPath: "/Users/jeremywatt/Desktop/qc-app/QualityControl/QualityControl.xcodeproj",
  scheme: "QualityControl"
})
```

## Architecture Overview

The project follows MVVM + Coordinators pattern:

### Directory Structure

```
QualityControl/
├── Models/                  # SwiftData models
│   ├── User/               # User.swift, Couple.swift
│   ├── CheckIn/            # CheckInSession.swift, Category.swift, ActionItem.swift
│   ├── Note/               # Note.swift (with NotePrivacy enum)
│   ├── Reminder/           # Reminder.swift
│   ├── Growth/             # Milestone.swift
│   ├── LoveLanguage/       # LoveLanguage.swift
│   └── Request/            # RelationshipRequest.swift
├── Views/                  # SwiftUI views
│   ├── Dashboard/          # Main dashboard (Week 3)
│   ├── CheckIn/            # 6-step check-in flow (Week 3-4)
│   ├── Notes/              # Notes management (Week 4)
│   ├── Growth/             # Growth Gallery (Week 5)
│   ├── Settings/           # App settings (Week 7-8)
│   └── Shared/             # ContentView.swift, MainTabView.swift
├── ViewModels/             # ObservableObject VMs (start Week 3)
├── Services/               # Business logic layer (start Week 3)
├── Coordinators/           # Navigation coordination (TBD)
├── Utilities/              # MockDataGenerator.swift, PreviewContainer.swift
└── Resources/              # Assets, Info.plist

Tests/
├── QualityControlTests/    # Unit tests
└── QualityControlUITests/  # UI tests
```

## Data Models

All models use SwiftData `@Model` macro. Key models:

### Core Models
- **User** - User profile with relationships to Couple, Notes, Reminders, LoveLanguages
- **Couple** - Relationship entity with Users, CheckIns, Milestones, Requests
- **CheckInSession** - Check-in with status tracking, progress, notes, action items
- **Category** - Discussion topics with prompts and customization
- **Note** - Content with privacy levels (private/shared/draft)

### Supporting Models
- **ActionItem** - Tasks with priority, assignment, completion tracking
- **Reminder** - Scheduled notifications with categories and frequency
- **Milestone** - Relationship achievements tracked in Growth Gallery
- **LoveLanguage** - User preferences for expressions of love
- **RelationshipRequest** - Asynchronous partner communication

### Enums
- `NotePrivacy`: `.private`, `.shared`, `.draft`
- `CheckInStatus`: `.inProgress`, `.completed`, `.abandoned`
- `CheckInStep`: `.welcome`, `.categorySelection`, `.categoryDiscussion`, `.reflection`, `.actionItems`, `.completion`
- `Priority`: `.low`, `.medium`, `.high`
- `ReminderCategory`, `ReminderFrequency`, `LoveLanguageCategory`, `RequestType`, `RequestStatus`

## Current Status

**Week 1: COMPLETE ✅**
- SwiftData models defined (10 models)
- Tab bar navigation with 5 tabs
- Mock data generator utilities
- Project compiles and runs successfully
- All 741 tests passing (100%)

**Week 2: COMPLETE ✅**
- Design system (QCColors, QCTypography, QCSpacing, QCAnimations)
- Reusable components (QCButton, QCCard, QCTextField, QCEmptyState, QCLoadingView)
- HapticFeedback utility
- Theme support with dark mode
- Beautiful, consistent UI applied throughout

**Week 3-4: MOSTLY COMPLETE (~85-90%) 🔄**
- ✅ Dashboard with stats, quick actions, activity feed
- ✅ Check-in flow with 6-step coordinator
- ✅ Notes list/create with full CRUD operations
- ✅ ViewModels connected to real SwiftData persistence
- ✅ Navigation flows (tabs, sheets, stacks) working
- 🔄 Some features need additional testing/polish

## Key Implementation Notes

1. **SwiftData Relationships**: Use `@Relationship` macro with proper delete rules
2. **Model Properties**: Use distinct names (e.g., `categoryDescription` instead of `description` to avoid conflicts)
3. **Navigation**: Tab-based for main sections, NavigationStack for hierarchical flows
4. **Preview Support**: Use `PreviewContainer.create()` for SwiftUI previews with demo data
5. **Mock Data**: `MockDataGenerator` provides sample data for all models
6. **SF Symbols**: Use system icons (`systemImage:`) for consistency

## Development Workflow

### Week-by-Week Plan
See `plans/05-feature-roadmap.md` for detailed weekly breakdown:
- **Weeks 1-2**: Foundation & Design System
- **Weeks 3-4**: Core UI (Dashboard, Check-in, Notes)
- **Weeks 5-6**: Features Part 1 (Growth, Reminders, Love Languages, Onboarding)
- **Weeks 7-8**: Features Part 2 (Requests, Settings, Polish)
- **Weeks 9-10**: Integration (CloudKit, Notifications, Widgets)
- **Weeks 11-12**: Testing & Launch

### Adding New Features

1. **Model** (if needed):
   - Create SwiftData model in appropriate Models/ subdirectory
   - Add to schema in `QualityControlApp.swift`
   - Update `MockDataGenerator` with sample data

2. **View**:
   - Create SwiftUI view in appropriate Views/ subdirectory
   - Use `PreviewContainer.create()` for previews
   - Follow existing naming conventions

3. **ViewModel** (Week 3+):
   - Create `@Observable` or `ObservableObject` class
   - Inject services via initializer
   - Handle async operations with `@MainActor`

4. **Service** (Week 3+):
   - Business logic and data operations
   - Protocol-based for testability
   - Singleton pattern (`.shared`) when appropriate

### Testing Approach

- **Unit Tests**: XCTest for models, view models, services
- **UI Tests**: Test critical user flows
- **Preview Testing**: Use PreviewContainer for visual verification
- **Simulator Testing**: Use xcodebuild MCP for automated testing

## Reference Materials

### POC Reference
The Next.js proof-of-concept is preserved in `archive/web-poc` branch:
```bash
git checkout archive/web-poc
```

Screenshots from POC available in `plans/screenshots/`:
- Dashboard, Check-in flow, Notes, Growth Gallery, Love Languages, Settings, Requests, Onboarding

### Planning Documents
- **plans/README.md** - Overview and table of contents
- **plans/01-overview.md** - Project goals and high-level architecture
- **plans/02-current-state-analysis.md** - POC feature analysis
- **plans/03-ios-architecture.md** - Technical architecture with code examples
- **plans/05-feature-roadmap.md** - 12-week implementation timeline
- **plans/06-production-features.md** - POC → Production feature gaps

## Code Style Guidelines

### Swift Conventions
- Follow [Swift API Design Guidelines](https://swift.org/documentation/api-design-guidelines/)
- Use descriptive names (prefer clarity over brevity)
- Prefer value types (struct) over reference types (class) when possible
- Use `@MainActor` for UI-related code
- Document public APIs with doc comments

### SwiftUI Patterns
- Extract subviews for better readability
- Use `@State` for local view state
- Use `@Environment` for shared dependencies
- Prefer declarative over imperative
- Use ViewBuilder for conditional views

### File Organization
- One type per file
- Group related files in subdirectories
- Keep files under 300 lines when possible
- Use `// MARK: -` for section organization

## Common Tasks

### Running on Simulator
```swift
// Use xcodebuild MCP tools
build_run_sim({
  projectPath: "...",
  scheme: "QualityControl",
  simulatorName: "iPhone 16"
})
```

### Taking Screenshots
```swift
screenshot({ simulatorUuid: "UUID" })
```

### Interacting with UI
```swift
// Get UI hierarchy first
describe_ui({ simulatorUuid: "UUID" })

// Then tap/swipe using precise coordinates
tap({ simulatorUuid: "UUID", x: 100, y: 200 })
```

## Troubleshooting

### Build Errors
- Clean build folder: Use `clean()` MCP tool
- Verify all models are in schema (QualityControlApp.swift)
- Check for naming conflicts in model properties

### Simulator Issues
- List available simulators: `list_sims()`
- Boot specific simulator: `boot_sim({ simulatorUuid: "..." })`
- Open Simulator.app: `open_sim()`

### SwiftData Issues
- Check relationships have proper inverse
- Verify delete rules are set correctly
- Use `.unique` attribute for IDs
- Remember to add new models to ModelContainer schema

## Notes for Claude

- **Always use xcodebuild MCP** for building, running, and testing iOS projects
- **Check Week 1 commit** for examples of model implementation
- **Reference plans/** directory for feature specifications
- **POC screenshots** in plans/screenshots/ show expected UI/UX
- **Test on iPhone 16 simulator** (iOS 18.1) by default
- **Follow the 12-week plan** in plans/05-feature-roadmap.md for feature priority
