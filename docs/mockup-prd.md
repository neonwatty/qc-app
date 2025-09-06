# Quality Control (QC) - Mockup PRD

## 1. Overview

### Purpose
Create a high-fidelity, interactive web prototype of the QC relationship check-in app to validate UX concepts, demonstrate core functionality, and gather feedback before native iOS development.

### Goals
- Demonstrate the complete check-in flow
- Showcase the dual-privacy note system
- Visualize the Growth Gallery concept
- Validate the customization capabilities
- Test mobile-responsive design patterns

### Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Animations:** Framer Motion
- **State Management:** React Context + Local Storage
- **Icons:** Lucide React
- **Date Handling:** date-fns

## 2. Information Architecture

```
/                   → Landing/Onboarding
/dashboard          → Main Dashboard
/checkin            → Active Check-in Session
  /checkin/[category]  → Category Discussion
/notes              → Notes Management
/growth             → Growth Gallery
/schedule           → Calendar & Scheduling
/settings           → Customization
  /settings/categories  → Manage Categories
  /settings/prompts     → Manage Prompts
  /settings/reminders  → Notification Settings
```

## 3. Detailed Screen Specifications

### 3.1 Landing/Onboarding (/)
**Purpose:** Welcome screen and demo entry point

**Components:**
- Hero section with app name and tagline
- "Try Demo" button (auto-login as demo couple)
- Feature highlights with icons
- Mobile-first responsive design

**Interactions:**
- Smooth scroll animations on feature cards
- Floating animation on hero elements
- Click "Try Demo" → redirect to /dashboard with mock session

### 3.2 Dashboard (/dashboard)

**Purpose:** Central hub showing relationship health at a glance

**Layout (Mobile-First):**
```
┌─────────────────────────┐
│ Header                  │
│ - QC Logo               │
│ - User Avatar Pair      │
├─────────────────────────┤
│ Next Check-in Card      │
│ - Countdown/Date        │
│ - "Start Now" button    │
├─────────────────────────┤
│ Quick Stats Grid        │
│ - Streak: 12 weeks      │
│ - Completed: 89%        │
│ - Growth Points: 24     │
│ - Next Milestone: 2     │
├─────────────────────────┤
│ Recent Activity Feed    │
│ - Shared notes preview  │
│ - Completed actions     │
│ - Milestones reached    │
├─────────────────────────┤
│ Quick Actions           │
│ - Daily Gratitude       │
│ - Add Note              │
│ - View Calendar         │
└─────────────────────────┘
```

**Key Components:**
- `CheckInCard` - Animated card with gradient background
- `StatsGrid` - 2x2 grid with animated number counters
- `ActivityFeed` - Scrollable list with staggered animations
- `QuickActionBar` - Fixed bottom navigation on mobile

**Animations:**
- Stagger children on load (Framer Motion)
- Pulse animation on "Start Now" button
- Number count-up animation for stats
- Slide-in for activity items

### 3.3 Check-in Flow (/checkin)

**Purpose:** Guided conversation experience

**Flow Structure:**
1. **Welcome Screen** → Set the mood
2. **Category Selection** → Choose or skip categories
3. **Category Discussion** → For each selected category
4. **Reflection** → Private notes opportunity
5. **Action Items** → Capture commitments
6. **Completion** → Celebration and summary

**3.3.1 Welcome Screen**
```
┌─────────────────────────┐
│ "Ready for your         │
│  check-in?"             │
│                         │
│ [Mood Selector]         │
│ 😊 😐 😔 😰 😡          │
│                         │
│ "How are you feeling?"  │
│                         │
│ [Continue Button]       │
└─────────────────────────┘
```

**3.3.2 Category Selection**
```
┌─────────────────────────┐
│ "What would you like    │
│  to discuss today?"     │
│                         │
│ ┌─────────────────┐     │
│ │ ✓ Finances      │     │
│ └─────────────────┘     │
│ ┌─────────────────┐     │
│ │ ✓ Intimacy      │     │
│ └─────────────────┘     │
│ ┌─────────────────┐     │
│ │   Household     │     │
│ └─────────────────┘     │
│ [+ Add Custom]          │
│                         │
│ [Continue →]            │
└─────────────────────────┘
```

**3.3.3 Category Discussion Screen**
```
┌─────────────────────────┐
│ [Progress Bar]          │
│ Category: Finances      │
│                         │
│ Prompt:                 │
│ "How do we feel about   │
│  our spending this      │
│  week?"                 │
│                         │
│ [Refresh Prompt ↻]      │
│                         │
│ ┌─────────────────┐     │
│ │ Partner 1 Notes │     │
│ │ [Private][Share]│     │
│ └─────────────────┘     │
│                         │
│ ┌─────────────────┐     │
│ │ Partner 2 Notes │     │
│ │ [Private][Share]│     │
│ └─────────────────┘     │
│                         │
│ [Skip] [Next →]         │
└─────────────────────────┘
```

**Interactions:**
- Swipe gestures between categories
- Toggle animation for private/shared notes
- Auto-save with debounce
- Prompt shuffle animation

### 3.4 Notes Management (/notes)

**Purpose:** Central repository for all notes

**Layout:**
```
┌─────────────────────────┐
│ Toggle: [Mine][Shared]  │
├─────────────────────────┤
│ Filter: [All][Category] │
├─────────────────────────┤
│ Note Card               │
│ - Date, Category        │
│ - Preview text          │
│ - [👁 Private]          │
├─────────────────────────┤
│ Note Card               │
│ - Date, Category        │
│ - Preview text          │
│ - [👥 Shared]           │
└─────────────────────────┘
```

**Features:**
- Search functionality
- Filter by date range
- Filter by category
- Tap to expand/edit
- Swipe to delete (with confirmation)
- Batch operations

### 3.5 Growth Gallery (/growth)

**Purpose:** Visual timeline of relationship progress

**Design Concepts:**

**Option A: Timeline View**
```
┌─────────────────────────┐
│     Growth Gallery      │
├─────────────────────────┤
│         2024            │
│          |              │
│    🏆 Milestone         │
│    Debt Free!           │
│          |              │
│    📈 Streak            │
│    10 weeks             │
│          |              │
│    💕 Moment            │
│    First "I love you"   │
│          |              │
│         2023            │
│          |              │
└─────────────────────────┘
```

**Option B: Card Grid**
```
┌─────────────────────────┐
│ ┌──────┐ ┌──────┐      │
│ │ 🏆   │ │ 📈   │      │
│ │ Debt │ │ 10wk │      │
│ │ Free │ │Streak│      │
│ └──────┘ └──────┘      │
│ ┌──────┐ ┌──────┐      │
│ │ 💕   │ │ 🎯   │      │
│ │First │ │ Goal │      │
│ │ ILY  │ │ Met  │      │
│ └──────┘ └──────┘      │
└─────────────────────────┘
```

**Animations:**
- Parallax scrolling on timeline
- Card flip animations to reveal details
- Confetti animation for new milestones

### 3.6 Settings & Customization (/settings)

**Sections:**

**Categories Management**
- Drag to reorder
- Toggle active/inactive
- Edit names and icons
- Add custom categories
- Set default prompts per category

**Prompts Library**
- Browse default prompts
- Create custom prompts
- Tag prompts to categories
- Set prompt rotation rules

**Schedule & Reminders**
- Check-in frequency
- Preferred day/time
- Reminder notifications (mock)
- Daily gratitude prompts

## 4. Component Architecture

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dashboard/
│   ├── checkin/
│   ├── notes/
│   ├── growth/
│   └── settings/
├── components/
│   ├── ui/           (shadcn components)
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── MobileNav.tsx
│   │   └── DesktopNav.tsx
│   ├── dashboard/
│   │   ├── CheckInCard.tsx
│   │   ├── StatsGrid.tsx
│   │   ├── ActivityFeed.tsx
│   │   └── QuickActions.tsx
│   ├── checkin/
│   │   ├── MoodSelector.tsx
│   │   ├── CategoryPicker.tsx
│   │   ├── PromptCard.tsx
│   │   ├── NotesEditor.tsx
│   │   └── ProgressBar.tsx
│   ├── notes/
│   │   ├── NoteCard.tsx
│   │   ├── NoteFilters.tsx
│   │   └── NoteEditor.tsx
│   └── growth/
│       ├── Timeline.tsx
│       ├── MilestoneCard.tsx
│       └── GrowthStats.tsx
├── lib/
│   ├── mock-data.ts
│   ├── animations.ts
│   └── utils.ts
└── contexts/
    ├── AppContext.tsx
    └── CheckInContext.tsx
```

## 5. Mock Data Structure

```typescript
interface User {
  id: string;
  name: string;
  avatar: string;
  isPartner1: boolean;
}

interface CheckIn {
  id: string;
  date: Date;
  status: 'scheduled' | 'in-progress' | 'completed';
  categories: Category[];
  notes: Note[];
  actionItems: ActionItem[];
  moodStart: Mood;
  moodEnd?: Mood;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  isCustom: boolean;
  prompts: Prompt[];
  order: number;
}

interface Note {
  id: string;
  content: string;
  authorId: string;
  categoryId?: string;
  checkInId?: string;
  visibility: 'private' | 'shared' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  date: Date;
  icon: string;
  category: 'streak' | 'goal' | 'moment' | 'achievement';
}
```

## 6. Animation Specifications

### Page Transitions
- **Type:** Slide + Fade
- **Duration:** 300ms
- **Easing:** ease-in-out

### Card Interactions
- **Hover:** Scale 1.02, shadow elevation
- **Tap:** Scale 0.98, then spring back
- **Loading:** Skeleton pulse

### Check-in Flow
- **Progress Bar:** Smooth width transition
- **Category Cards:** Stagger in with fade-up
- **Note Toggle:** Flip animation with privacy icon change
- **Completion:** Confetti burst + success message

### Mobile Gestures
- **Swipe Navigation:** Horizontal swipe between categories
- **Pull to Refresh:** Elastic bounce on dashboard
- **Bottom Sheet:** Settings and filters slide up

## 7. Responsive Breakpoints

```css
/* Mobile First Approach */
/* Base: 0-639px (Mobile) */
/* sm: 640px+ (Large Mobile) */
/* md: 768px+ (Tablet) */
/* lg: 1024px+ (Desktop) */
/* xl: 1280px+ (Large Desktop) */
```

### Layout Adaptations
- **Mobile:** Single column, bottom navigation, full-width cards
- **Tablet:** Two column grid for dashboard, side navigation option
- **Desktop:** Three column layout, persistent sidebar, modal dialogs

## 8. User Flows

### Primary Flow: Complete Weekly Check-in
1. Open app → Dashboard
2. Tap "Start Check-in"
3. Select mood
4. Choose categories (or use defaults)
5. For each category:
   - Read prompt
   - Write notes (private or shared)
   - Add action items if needed
6. Review summary
7. Celebrate completion
8. Return to dashboard with updated stats

### Secondary Flow: Review Growth
1. Navigate to Growth Gallery
2. Scroll through timeline
3. Tap milestone for details
4. Share or celebrate
5. Set new goals

## 9. Prototype Interactions

### Mock Behaviors
- **Login:** Auto-login as "Alex & Jordan" demo couple
- **Data Persistence:** Use localStorage for session
- **Notifications:** Show toast messages for actions
- **Sync Simulation:** Fake loading states with setTimeout
- **Partner Actions:** Simulate partner adding notes after delay

### Demo Scenarios
1. **First-time User:** Onboarding flow with tutorial tips
2. **Returning User:** Pre-populated with history
3. **Mid Check-in:** Resume in-progress check-in
4. **Milestone Celebration:** Trigger achievement animation

## 10. Success Metrics (Prototype)

### Usability Testing Goals
- Users can complete check-in in < 5 minutes
- Clear understanding of private vs shared notes
- Intuitive navigation between sections
- Positive emotional response to Growth Gallery
- Easy customization of categories/prompts

### Feedback Collection
- Embedded feedback widget
- Screen recording capability
- Quick survey after check-in completion
- A/B test different layouts

## 11. Development Phases

### Phase 1: Foundation (Week 1)
- Next.js setup with TypeScript
- Shadcn/ui component installation
- Basic routing structure
- Mock data structure
- Context providers

### Phase 2: Core Screens (Week 2)
- Dashboard implementation
- Check-in flow (basic)
- Notes management
- Responsive layouts

### Phase 3: Polish (Week 3)
- Framer Motion animations
- Growth Gallery
- Settings/customization
- Error states and loading states

### Phase 4: Testing & Refinement (Week 4)
- User testing sessions
- Bug fixes
- Performance optimization
- Deploy to Vercel

## 12. Technical Considerations

### Performance
- Lazy load routes
- Optimize images
- Minimize bundle size
- Use React.memo for expensive components

### Accessibility
- ARIA labels
- Keyboard navigation
- Focus management
- Color contrast compliance

### Browser Support
- Chrome/Safari (iOS primary)
- Firefox/Edge (secondary)
- Mobile Safari optimization

### Deployment
- Vercel for hosting
- Environment variables for feature flags
- Analytics integration (optional)