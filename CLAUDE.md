# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quality Control (QC) is a relationship check-in iOS app mockup project. The current phase involves creating a high-fidelity web prototype using Next.js to validate UX concepts before native iOS development.

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (built on Radix UI)
- **Animations**: Framer Motion
- **State Management**: React Context + useReducer + Local Storage
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Testing
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:ci       # Run tests in CI mode

# Run a single test file
npm test -- path/to/test.spec.ts
```

## Architecture Overview

The project follows a mobile-first design approach with these core systems:

### Check-in Flow System
- 6-step flow: Welcome → Category Selection → Category Discussion → Reflection → Action Items → Completion
- Dual-privacy note system (private vs shared notes)
- Progress tracking with visual timeline
- Managed via CheckInContext provider with session persistence in localStorage
- Session bookends (preparation and reflection) via BookendsContext

### State Management
- **CheckInContext**: Manages active check-in sessions with reducer pattern for complex state
- **ThemeContext**: Handles dark/light mode preferences
- **SessionSettingsContext**: Customizable check-in session settings
- **BookendsContext**: Pre and post-session prompts
- Session data persisted to localStorage with auto-save and SSR safety
- Demo data auto-initialized for "Alex & Jordan" couple

### Data Structure
- **CheckInSession**: Central state tracking flow progress, categories, notes, and completion
- **Category**: Discussion topics (default + custom) with associated prompts
- **Note**: Content with privacy levels (private/shared/draft) and timestamps
- **Milestone**: Relationship achievements tracked in Growth Gallery
- **ActionItem**: Tasks with assignment, due dates, priorities, and completion tracking
- **Reminder**: Scheduled prompts for check-ins and partner moments

### Project Structure
```
src/
├── app/                  # Next.js App Router pages
│   ├── dashboard/       # Main hub with stats
│   ├── checkin/         # Multi-step check-in flow
│   ├── notes/           # Notes management and search
│   ├── growth/          # Growth Gallery milestones
│   ├── settings/        # App customization
│   ├── reminders/       # Notification management
│   └── test-*/          # Development test pages
├── components/
│   ├── ui/              # shadcn/ui base components
│   ├── layout/          # Navigation and layout
│   ├── dashboard/       # Dashboard-specific components
│   ├── checkin/         # Check-in flow components
│   ├── notes/           # Note management components
│   ├── growth/          # Growth timeline components
│   └── providers/       # Context provider wrappers
├── contexts/            # React Context providers with reducers
├── types/               # TypeScript type definitions
├── lib/
│   ├── mock-data.ts     # Demo data generation
│   ├── storage.ts       # Local storage utilities with SSR safety
│   ├── animations.ts    # Framer Motion presets
│   └── utils.ts         # Utility functions and cn() helper
└── test-utils/          # Jest setup and browser API mocks
```

## Task Management

Tasks are tracked in multiple ways:
- `qc-tasks.json`: Structured task definitions with QC-X.X numbering and dependencies
- `.todoq/`: SQLite-based local task tracking
- Test pages at `/test-*` routes for component and feature validation

## Key Implementation Notes

1. **Mobile-First Design**: All components start with mobile viewport (375px) and scale up
2. **Mock Data**: Use localStorage for demo persistence, auto-login as demo couple on first visit
3. **Animations**: Consistent use of Framer Motion presets from `lib/animations.ts`
4. **Privacy Model**: Three-tier system (private/shared/draft) with visual indicators
5. **Responsive Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
6. **Type Safety**: Comprehensive TypeScript types in `src/types/` directory
7. **Error Boundaries**: Wrapped components for graceful error handling
8. **Performance**: Lazy loading, code splitting, and Turbopack for fast development

## Testing Approach

### Jest Configuration
- Test files: `src/**/*.{test,spec}.{ts,tsx}` or in `__tests__` folders
- Environment: jsdom with custom browser API mocks
- Coverage: Excludes Next.js pages, layouts, and generated files
- Mocks: Framer Motion, Next.js router, Lucide icons configured in setup

### Test Guidelines
- Component rendering verification with React Testing Library
- User flow completion testing (check-in should take < 5 minutes)
- Responsive design testing across viewports
- Animation performance monitoring
- LocalStorage persistence validation
- Mock browser APIs configured in `src/test-utils/mockBrowserAPIs.ts`

## Build Configuration

### Next.js Settings
- Static export enabled for GitHub Pages deployment
- Bundle optimization for large libraries (Framer Motion, Radix UI)
- Turbopack configuration for SVG loading
- Separated type checking from build process for speed
- Webpack customization for optimal chunk splitting