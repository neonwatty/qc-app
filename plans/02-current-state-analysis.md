# Current State Analysis - Next.js POC

## Overview

This document provides a comprehensive analysis of the existing Next.js proof-of-concept application, cataloging all features, screens, components, and functionality that must be replicated in the native iOS application.

**POC URL:** https://neonwatty.github.io/qc-app/
**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
**Data Layer:** localStorage (browser-based persistence)

---

## Screenshots Reference

All screenshots captured at iPhone 14 Pro dimensions (390x844):

- `screenshots/01-home-landing.png` - Landing page
- `screenshots/02-dashboard.png` - Main dashboard
- `screenshots/03-checkin.png` - Check-in start screen
- `screenshots/04-notes.png` - Notes list view
- `screenshots/05-growth.png` - Growth Gallery timeline
- `screenshots/06-love-languages.png` - Love Languages manager
- `screenshots/07-settings.png` - Settings page
- `screenshots/08-requests.png` - Requests inbox
- `screenshots/09-onboarding.png` - Onboarding welcome

---

## Core Features Inventory

### 1. Dashboard (Homepage)

**Purpose:** Relationship command center with quick actions and activity overview

**Features:**
- ✅ Personalized greeting ("Welcome Back, Deb!")
- ✅ Preparation banner for upcoming check-ins
  - Shows preparation status
  - "Prepare Topics" CTA
  - Dismissible
- ✅ Quick action cards (6 total):
  - Start Check-in
  - View Notes
  - Growth Gallery
  - Reminders (with count badge)
  - Requests (with pending count)
  - Love Languages
- ✅ Love Languages Widget
  - Personal stats (3 Languages, 2 Shared)
  - Weekly actions count
  - Sharing progress percentage
  - Today's suggested actions (2 items)
  - Partner's top language highlight
- ✅ Recent Activity feed
  - Reminders count
  - Pending requests count
  - Last check-in date
  - New notes count
  - Milestone achievements
- ✅ Stats grid (lazy-loaded)
  - Check-ins completed
  - Current streak
  - Consistency rate
- ✅ Pull-to-refresh functionality
- ✅ Mobile action bar (context-aware)

**Technical Notes:**
- Uses BookendsContext for preparation flow
- Real-time counts from localStorage
- Conditional rendering based on session state
- Stagger animations on load

**iOS Mapping:**
- TabView root (Dashboard tab)
- ScrollView with LazyVStack
- Pull-to-refresh native gesture
- Badge overlays on tab bar icons

---

### 2. Check-in Flow

**Purpose:** Guided 6-step relationship check-in session

**6 Steps:**
1. **Welcome** - Introduction and intention setting
2. **Category Selection** - Choose 2-4 discussion topics
3. **Category Discussion** - Structured conversation per topic
4. **Reflection** - Personal and shared insights
5. **Action Items** - Concrete next steps
6. **Completion** - Celebration and summary

**Features:**
- ✅ Progress bar (visual timeline)
- ✅ Session rules display
  - Time limit (10 min default)
  - Turn-based mode
  - Timeout warnings
  - Cool-down periods
- ✅ Category selection UI
  - 4 default categories (Emotional, Communication, Intimacy, Goals)
  - Multi-select with checkmarks
  - Custom category support
  - Card swipe alternative view (mobile)
- ✅ Preparation modal
  - Pre-session topic brainstorming
  - Topics visible to both partners
  - "Maybe Later" option
- ✅ Reflection form
  - Post-session thoughts
  - Mood rating
  - Key insights capture
- ✅ Session timer (real-time countdown)
- ✅ Turn indicator (whose turn to speak)
- ✅ Draft notes system during session
- ✅ Action item creation
- ✅ Session persistence (can resume)

**Technical Notes:**
- CheckInContext manages session state
- SessionSettingsContext for rules
- BookendsContext for prep/reflection
- localStorage auto-save every 30s
- Reducer pattern for complex state

**iOS Mapping:**
- NavigationStack for flow
- Custom ProgressView component
- Timer using Combine framework
- SwiftData for session persistence
- Haptic feedback on progress
- Dismiss confirmation alert

---

### 3. Notes System

**Purpose:** Capture and organize relationship insights with privacy controls

**Features:**
- ✅ Three-tier privacy system:
  - **Private** - Only visible to author
  - **Shared** - Visible to both partners
  - **Draft** - Work in progress
- ✅ Search functionality
  - Real-time text search
  - Searches title and content
- ✅ Filter chips
  - All notes
  - Shared only
  - Private only
  - Drafts only
- ✅ Note cards display
  - Title (line-clamp 2)
  - Content preview (line-clamp 3)
  - Privacy badge with icon
  - Category tag
  - Relative timestamp
- ✅ Long-press context menu
  - Edit note
  - Share note
  - Duplicate note
  - Delete note
- ✅ Create new note button
- ✅ Empty state messaging
- ✅ Privacy info panel (educational)
- ✅ Pull-to-refresh

**Data Structure:**
```typescript
interface Note {
  id: string
  title: string
  content: string
  type: 'shared' | 'private' | 'draft'
  date: string
  category: string
  createdAt: Date
  updatedAt: Date
  authorId: string
  checkInId?: string
  tags?: string[]
}
```

**iOS Mapping:**
- List with SearchBar
- Context menu on long press
- SF Symbols for privacy icons
- Swipe actions (edit, delete)
- Sheet for note editor
- Rich text support (NSAttributedString)

---

### 4. Growth Gallery

**Purpose:** Track relationship milestones and progress visualization

**Features:**
- ✅ Stats overview (4 cards)
  - Milestones reached
  - Check-ins completed
  - Months active
  - Consistency rate
- ✅ View toggle (segmented control)
  - Timeline view (default)
  - Progress view
  - Analytics view
  - Memories/Photos view
- ✅ **Timeline View**
  - Achieved milestones (checkmark icon)
  - Upcoming goals (target icon)
  - Date stamps
  - Category badges
  - Description text
- ✅ **Progress View**
  - Growth areas with progress bars
  - Percentage scores
  - Color-coded by area
  - Labels (Needs Work → Excellent)
- ✅ **Analytics View**
  - Chart visualization (lazy-loaded)
  - Trend data
- ✅ **Memories View**
  - Photo gallery (lazy-loaded)
  - Add memory button
  - Grid layout

**Data Structure:**
```typescript
interface Milestone {
  id: string
  title: string
  description: string
  date: string
  category: string
  achieved: boolean
}
```

**iOS Mapping:**
- Segmented picker for view switching
- Timeline with custom shapes
- Charts framework for analytics
- PhotosPicker for memories
- Achievement animations

---

### 5. Reminders System

**Purpose:** Scheduled notifications for check-ins, habits, and special moments

**Note:** The reminders page had an error when navigating, so features are inferred from code and context.

**Features (from code analysis):**
- ✅ Chat-like interface
- ✅ Reminder categories:
  - Check-in reminders
  - Habit reminders
  - Action item reminders
  - Partner moment reminders
  - Special occasion reminders
- ✅ Frequency options:
  - Daily
  - Weekly
  - Monthly
  - Custom schedule
- ✅ Snooze functionality
- ✅ Mark complete
- ✅ Today / This Week sections
- ✅ Completion status tracking

**Data Structure:**
```typescript
interface Reminder {
  id: string
  title: string
  message: string
  category: ReminderCategory
  frequency: ReminderFrequency
  scheduledFor: Date
  isActive: boolean
  isSnoozed: boolean
  snoozeUntil?: Date
  completedAt?: Date
}
```

**iOS Mapping:**
- UNUserNotificationCenter for scheduling
- Local notifications
- Rich notifications with actions
- Badge count updates
- Notification settings integration

---

### 6. Love Languages

**Purpose:** Help partners understand and express love in meaningful ways

**Features:**
- ✅ Dual tabs:
  - My Languages (3)
  - Partner's Languages (2)
- ✅ Language cards with:
  - Emoji icon
  - Title
  - Description
  - Examples (bulleted list)
  - Importance level (Essential, High, Medium, Low)
  - Category badge (Words, Time, Gifts, Touch, Acts)
  - Tags (searchable)
  - Privacy toggle
  - Edit/Delete actions
- ✅ Grouped by sharing status:
  - Shared with Partner
  - Private
- ✅ Add new language dialog
- ✅ Create action from partner's language
- ✅ Info banner (educational content)
- ✅ Privacy controls (make private/visible)

**Data Structure:**
```typescript
interface LoveLanguage {
  id: string
  category: 'words' | 'time' | 'gifts' | 'touch' | 'acts'
  title: string
  description: string
  examples: string[]
  importance: 'essential' | 'high' | 'medium' | 'low'
  privacy: 'shared' | 'private'
  tags: string[]
  createdAt: Date
  updatedAt: Date
  userId: string
}
```

**iOS Mapping:**
- Tabbed interface (custom tabs)
- Expandable cards
- Form sheet for add/edit
- Toggle buttons for privacy
- Tag chips

---

### 7. Requests System

**Purpose:** Send and receive thoughtful requests between partners

**Features:**
- ✅ Search bar for filtering
- ✅ Dual tabs:
  - Received (3)
  - Sent (2)
- ✅ Request cards showing:
  - From/To indicator
  - Title
  - Status badge (Pending, Accepted, Declined)
  - Description
  - Request type (Date Night, Activity, Conversation, Reminder)
  - Priority level (High, Medium, Low)
  - Due date
  - Recurrence indicator
  - Tags
  - Response message (if accepted/declined)
- ✅ Status indicators:
  - Color-coded badges
  - Visual status icons
- ✅ New request button
- ✅ Priority visualization
- ✅ Category icons

**Data Structure:**
```typescript
interface RelationshipRequest {
  id: string
  title: string
  description: string
  requestType: 'conversation' | 'activity' | 'date-night' | 'reminder'
  priority: 'low' | 'medium' | 'high'
  requestedBy: string
  requestedFor: string
  status: 'pending' | 'accepted' | 'declined'
  dueDate?: Date
  isRecurring: boolean
  response?: string
  tags: string[]
  createdAt: Date
}
```

**iOS Mapping:**
- List with sections
- Swipe actions (Accept, Decline)
- Sheet for new request
- Badge indicators
- Push notifications for new requests

---

### 8. Settings

**Purpose:** Customize app preferences and relationship configuration

**Features:**
- ✅ Sidebar navigation (desktop) / List (mobile)
- ✅ Seven settings sections:

#### **Profile & Relationship**
- Partner names (2 text fields)
- Relationship start date (date picker)
- "Redo Onboarding" button

#### **Session Rules**
- Time limit configuration
- Turn-based mode toggle
- Timeout warnings
- Cool-down periods
- Session agreement modal

#### **Discussion Categories**
- Default categories manager
- Custom category creation
- Category editor
- Prompt templates

#### **Notifications**
- Email notifications toggle
- Push notifications toggle
- Reminder preferences
- Quiet hours

#### **Privacy & Sharing**
- Private by default toggle
- Share progress toggle
- What's shared explanation

#### **Appearance**
- Theme selector (Light, Dark, Auto)
- Color scheme customization
- Font size
- Personalization panel

#### **Check-in Schedule**
- Frequency (Daily, Weekly, Monthly)
- Preferred time
- Preferred days
- Reminder scheduler

**iOS Mapping:**
- Grouped List (iOS style)
- NavigationStack for sections
- Form components
- UserDefaults persistence
- System settings integration

---

### 9. Onboarding Flow

**Purpose:** Welcome new users and personalize their experience

**Features:**
- ✅ 6-step wizard:
  1. **Welcome** - Introduction and demo users
  2. **Quiz** - Communication style assessment
  3. **Love Languages** - Initial love language selection
  4. **Reminders** - Set up first reminder
  5. **Tour** - Feature walkthrough
  6. **Complete** - Summary and start
- ✅ Progress indicator (step X of 6, % complete)
- ✅ Skip button (saves skipped state)
- ✅ Back/Next navigation
- ✅ Data persistence between steps
- ✅ Resume from last step
- ✅ Redirect to dashboard on completion

**Data Structure:**
```typescript
interface OnboardingData {
  completed: boolean
  completedAt?: Date
  preferences: {
    communicationStyle?: string
    checkInFrequency?: string
    sessionStyle?: string
    loveLanguages?: string[]
    reminderTime?: string
    reminderDay?: string
  }
  currentStep: number
}
```

**iOS Mapping:**
- PageTabViewStyle for steps
- onAppear to check completion
- Smooth page transitions
- Skip confirmation alert
- Welcome animation

---

## State Management Analysis

### Contexts Used
1. **CheckInContext** - Active check-in session state
2. **BookendsContext** - Pre/post session preparation
3. **SessionSettingsContext** - Check-in rules configuration
4. **ThemeContext** - Dark/light mode
5. **LoveLanguagesContext** - Love language management

### Data Flow Patterns
- **Reducer Pattern** for complex state (CheckInContext)
- **useState/useCallback** for simple state
- **useEffect** for side effects and persistence
- **localStorage** for all data persistence
- **Auto-save** on state changes (debounced)

### iOS Equivalent
- **@ObservableObject** classes for contexts
- **@Published** properties for reactive state
- **Combine** for data flow
- **SwiftData** for persistence
- **@EnvironmentObject** for app-wide state

---

## Technical Debt & Limitations

### Current POC Limitations
❌ No authentication system
❌ No backend/API
❌ No real-time partner sync
❌ No actual push notifications
❌ localStorage only (no cloud backup)
❌ Single device limitation
❌ No media upload (photos, voice)
❌ No data export
❌ No analytics tracking
❌ Limited error handling
❌ No offline mode (requires browser)

### POC → Production Gap
These must be addressed in iOS version:

**Must Have (MVP):**
1. User authentication (Sign in with Apple)
2. CloudKit sync for couple data
3. Local notifications
4. Data backup/restore
5. Error boundaries and handling
6. Accessibility support
7. Performance optimization

**Should Have (Phase 2):**
1. Push notifications for partner activity
2. Photo uploads for memories
3. Voice notes for check-ins
4. Data export (PDF reports)
5. Analytics (privacy-preserving)
6. Widgets
7. Shortcuts integration

**Could Have (Phase 3):**
1. Apple Watch app
2. Live Activities for check-ins
3. AI-powered insights
4. Calendar integration
5. Health app integration
6. Couple matching/discovery

---

## Component Inventory

### UI Components Used (shadcn/ui)
- Button
- Card
- Badge
- Input
- Textarea
- Dialog/Modal
- Sheet (mobile drawer)
- Tabs
- Alert
- Progress
- Switch/Toggle
- Select/Dropdown
- Calendar/DatePicker

### Custom Components
- MotionBox (Framer Motion wrapper)
- StaggerContainer/StaggerItem
- PullToRefresh
- LongPressCard (context menu)
- MobileActionBar
- PageTransition
- SwipeNavigation
- CardStack (swipeable cards)
- LazyComponents (viewport loading)

### iOS SwiftUI Equivalents
- Button → Button
- Card → Custom VStack with styling
- Badge → Custom view or overlay
- Input → TextField
- Textarea → TextEditor
- Dialog → .sheet() or .alert()
- Tabs → TabView or custom picker
- Progress → ProgressView
- Toggle → Toggle
- Picker → Picker
- DatePicker → DatePicker

---

## Animation Patterns

### Framer Motion Patterns Used
1. **Page transitions** - Fade in, slide up
2. **List items** - Stagger entrance
3. **Cards** - Scale on hover, lift on tap
4. **Progress bars** - Animated width
5. **Modals** - Slide from bottom
6. **Swipe gestures** - Card deck interactions

### iOS SwiftUI Animation Mapping
```swift
// Fade in
.transition(.opacity)

// Slide up
.transition(.move(edge: .bottom))

// Stagger
ForEach(items) { item in
    ItemView(item)
        .transition(.opacity)
        .animation(.easeOut.delay(Double(index) * 0.1))
}

// Scale
.scaleEffect(isPressed ? 0.95 : 1.0)

// Progress
.frame(width: progress * totalWidth)
    .animation(.spring())
```

---

## Routing Structure

### Next.js Routes
```
/                       → Landing page
/dashboard              → Main dashboard
/checkin                → Check-in start
/notes                  → Notes list
/growth                 → Growth Gallery
/reminders              → Reminders list
/love-languages         → Love Languages
/requests               → Requests inbox
/settings               → Settings
/onboarding             → Onboarding flow
```

### iOS Navigation Structure
```swift
TabView {
    DashboardView()
        .tabItem { Label("Home", systemImage: "house") }

    CheckInView()
        .tabItem { Label("Check-in", systemImage: "message") }

    NotesView()
        .tabItem { Label("Notes", systemImage: "note.text") }

    MoreView() // Contains Growth, Reminders, Languages, etc.
        .tabItem { Label("More", systemImage: "ellipsis") }
}
```

---

## Next Steps

With this analysis complete, we can now:
1. Map each feature to iOS implementation
2. Design SwiftData schema
3. Create detailed UI mockups
4. Estimate development timeline
5. Identify technical risks

See [03-ios-architecture.md](./03-ios-architecture.md) for technical implementation details.

---

**Last Updated:** 2025-10-15
**Analyzed By:** Claude Code Assistant
**POC Version:** 1.0 (GitHub Pages Deploy)
