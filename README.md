# Quality Control (QC) - iOS App

**A relationship check-in app built with Swift and SwiftUI**

![Platform](https://img.shields.io/badge/platform-iOS-blue.svg)
![Swift](https://img.shields.io/badge/Swift-5.0-orange.svg)
![iOS](https://img.shields.io/badge/iOS-17.0+-green.svg)
![Xcode](https://img.shields.io/badge/Xcode-16.0+-blue.svg)

## 🎯 Overview

Quality Control is a native iOS app designed to help couples maintain healthy relationships through regular, structured check-ins. The app provides tools for meaningful conversations, progress tracking, and relationship growth.

### Key Features

- **Structured Check-ins**: 6-step guided flow across customizable relationship categories
- **Dual Privacy System**: Private notes for personal reflection, shared notes for joint observations
- **Progress Tracking**: Visual Growth Gallery with milestones and relationship timeline
- **Action Items**: Convert discussions into concrete, trackable tasks
- **Love Languages**: Track and share preferred expressions of affection
- **Relationship Requests**: Asynchronous communication system for partners
- **SwiftData Persistence**: Local-first data storage with CloudKit sync (coming soon)

## 🏗 Architecture

**Pattern:** MVVM + Coordinators
**UI Framework:** SwiftUI 100%
**Persistence:** SwiftData (iOS 17+)
**Cloud Sync:** CloudKit (Phase 2)
**Minimum iOS:** 17.0+

### Project Structure

```
QualityControl/
├── Models/                # SwiftData models
│   ├── User/             # User & Couple
│   ├── CheckIn/          # Session, Category, ActionItem
│   ├── Note/             # Notes with privacy levels
│   ├── Reminder/         # Notification scheduling
│   ├── Growth/           # Milestones
│   ├── LoveLanguage/     # Love language tracking
│   └── Request/          # Relationship requests
├── Views/                # SwiftUI views
│   ├── Dashboard/        # Main hub
│   ├── CheckIn/          # Check-in flow
│   ├── Notes/            # Note management
│   ├── Growth/           # Growth Gallery
│   └── Settings/         # App settings
├── ViewModels/           # ObservableObject view models
├── Services/             # Business logic
├── Utilities/            # Helpers and extensions
└── Resources/            # Assets and configs
```

## 🚀 Getting Started

### Prerequisites

- macOS 15.0+ (Sequoia)
- Xcode 16.0+
- iOS 17.0+ device or simulator
- Apple Developer account (for device testing)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/neonwatty/qc-app.git
cd qc-app
```

2. **Open in Xcode:**
```bash
open QualityControl/QualityControl.xcodeproj
```

3. **Select a simulator:**
   - iPhone 16, 16 Pro, or 16 Pro Max recommended
   - iOS 18.1 simulator

4. **Build and run:**
   - Press `⌘R` or click the Play button
   - App will launch with demo data

### Development Commands

```bash
# Build for simulator
xcodebuild -project QualityControl.xcodeproj -scheme QualityControl -sdk iphonesimulator

# Run tests
xcodebuild test -project QualityControl.xcodeproj -scheme QualityControl -destination 'platform=iOS Simulator,name=iPhone 16'

# Clean build folder
xcodebuild clean -project QualityControl.xcodeproj -scheme QualityControl
```

## 📱 Current Status

**Week 1 Complete** ✅

- [x] SwiftData models (10 models)
- [x] Tab bar navigation
- [x] Mock data generator
- [x] Project structure
- [x] Builds successfully on simulator

**Next (Week 2)**

- [ ] Design system (colors, typography, spacing)
- [ ] Animation presets
- [ ] Common UI components
- [ ] Theme support (dark/light mode)

See `plans/` directory for the complete 12-week roadmap.

## 🛠 Development

### Tech Stack

| Component | Technology |
|-----------|-----------|
| UI Framework | SwiftUI |
| Data Persistence | SwiftData |
| Cloud Sync | CloudKit (planned) |
| Notifications | UNUserNotificationCenter |
| Architecture | MVVM + Coordinators |
| Testing | XCTest |

### Data Models

**Core Entities:**
- **User** - Individual user profile
- **Couple** - Relationship pairing
- **CheckInSession** - Check-in with progress tracking
- **Category** - Discussion topics
- **Note** - Content with privacy levels (private/shared/draft)
- **ActionItem** - Tasks with assignments
- **Reminder** - Scheduled notifications
- **Milestone** - Relationship achievements
- **LoveLanguage** - Preferred expressions of love
- **RelationshipRequest** - Partner communication

All models use SwiftData with type-safe relationships.

## 📊 Features Implementation Status

| Feature | Status | Week |
|---------|--------|------|
| Foundation | ✅ Complete | 1 |
| Design System | 📅 Planned | 2 |
| Dashboard | 📅 Planned | 3 |
| Check-in Flow | 📅 Planned | 3-4 |
| Notes System | 📅 Planned | 4 |
| Growth Gallery | 📅 Planned | 5 |
| Reminders | 📅 Planned | 5 |
| Love Languages | 📅 Planned | 6 |
| Requests | 📅 Planned | 7 |
| Settings | 📅 Planned | 7-8 |
| CloudKit Sync | 📅 Planned | 9 |
| Notifications | 📅 Planned | 10 |
| Widgets | 📅 Planned | 10 |

## 🧪 Testing

### Running Tests

```bash
# All tests
⌘U in Xcode

# Specific test file
xcodebuild test -project QualityControl.xcodeproj -scheme QualityControl -only-testing:QualityControlTests/YourTestFile

# UI tests
xcodebuild test -project QualityControl.xcodeproj -scheme QualityControl -only-testing:QualityControlUITests
```

### Test Coverage Goals

- Unit tests: 80%+ coverage
- Critical paths: 100% coverage
- UI tests for main flows

## 📖 Documentation

Comprehensive planning documentation available in `plans/`:

- **[README.md](./plans/README.md)** - Overview and table of contents
- **[01-overview.md](./plans/01-overview.md)** - Project goals and architecture
- **[02-current-state-analysis.md](./plans/02-current-state-analysis.md)** - POC analysis
- **[03-ios-architecture.md](./plans/03-ios-architecture.md)** - Technical specifications
- **[05-feature-roadmap.md](./plans/05-feature-roadmap.md)** - 12-week implementation plan
- **[06-production-features.md](./plans/06-production-features.md)** - MVP to production gap

## 🔗 Reference

**Next.js POC:**
The original web proof-of-concept is preserved in the `archive/web-poc` branch:
```bash
git checkout archive/web-poc
```

Live demo: https://neonwatty.github.io/qc-app/

**Screenshots:**
POC screenshots captured for reference are available in `plans/screenshots/`.

## 🤝 Contributing

We're in active development! Contributions welcome.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Follow Swift style guidelines
4. Write tests for new features
5. Commit changes (`git commit -m 'Add AmazingFeature'`)
6. Push to branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

### Code Style

- Follow Swift API Design Guidelines
- Use SwiftLint for style checking
- Prefer value types over reference types
- Write self-documenting code with clear names
- Add doc comments for public APIs

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [SwiftUI](https://developer.apple.com/xcode/swiftui/)
- Data persistence via [SwiftData](https://developer.apple.com/xcode/swiftdata/)
- Icons from SF Symbols
- Inspired by evidence-based relationship research

## 📧 Contact

- GitHub: [@neonwatty](https://github.com/neonwatty)
- Issues: [Report a bug](https://github.com/neonwatty/qc-app/issues)

## 🗺 Roadmap

### Phase 1: MVP (Weeks 1-8)
- ✅ Foundation
- 📅 Core UI implementation
- 📅 All POC features
- 📅 Polish and testing

### Phase 2: Integration (Weeks 9-10)
- 📅 CloudKit sync
- 📅 Push notifications
- 📅 Home Screen widgets
- 📅 Shortcuts support

### Phase 3: Launch (Weeks 11-12)
- 📅 TestFlight beta
- 📅 App Store submission
- 📅 Marketing materials
- 📅 Launch 🚀

### Future (Post-MVP)
- Apple Watch companion app
- Live Activities support
- Advanced analytics
- Multi-language support
- iPad optimization

---

**Made with ❤️ for healthier relationships**
