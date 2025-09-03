# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quality Control (QC) is a relationship check-in iOS app mockup project. The current phase involves creating a high-fidelity web prototype using Next.js to validate UX concepts before native iOS development.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **State Management**: React Context + Local Storage
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
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
```

## Architecture Overview

The project follows a mobile-first design approach with these core systems:

### Check-in Flow System
- Welcome → Category Selection → Category Discussion → Reflection → Action Items → Completion
- Dual-privacy note system (private vs shared notes)
- Progress tracking with visual timeline

### Data Structure
- **CheckIn**: Session data with categories, notes, action items, mood tracking
- **Category**: Discussion topics (default + custom) with associated prompts
- **Note**: Content with privacy levels (private/shared/draft)
- **Milestone**: Relationship achievements tracked in Growth Gallery

### Project Structure
```
src/
├── app/                  # Next.js App Router pages
│   ├── dashboard/       # Main hub
│   ├── checkin/         # Check-in flow
│   ├── notes/           # Notes management
│   ├── growth/          # Growth Gallery
│   └── settings/        # Customization
├── components/
│   ├── ui/              # shadcn/ui base components
│   ├── layout/          # Navigation and layout
│   ├── dashboard/       # Dashboard-specific components
│   ├── checkin/         # Check-in flow components
│   ├── notes/           # Note management components
│   └── growth/          # Growth timeline components
├── lib/
│   ├── mock-data.ts     # Demo data generation
│   ├── storage.ts       # Local storage utilities
│   └── animations.ts    # Framer Motion presets
└── contexts/            # React Context providers
```

## Task Management

Tasks are tracked in `qc-tasks.json` with a structured format including:
- Task numbering (QC-X.X format)
- Dependencies between tasks
- Testing strategies
- File references

The project also uses `.todoq` for local task tracking with a SQLite database.

## Key Implementation Notes

1. **Mobile-First**: All designs start with mobile viewport and scale up
2. **Mock Data**: Use localStorage for demo persistence, auto-login as demo couple
3. **Animations**: Consistent use of Framer Motion presets for page transitions and interactions
4. **Privacy Model**: Clear separation between private and shared notes with visual indicators
5. **Responsive Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)

## Code Search and Analysis

### ast-grep Usage

Use ast-grep for structural code search and refactoring. It's more powerful than text-based search for finding code patterns.

```bash
# Search for React components with specific props
ast-grep --pattern 'const $COMP = ({ $$$PROPS }) => { $$$ }' --lang tsx

# Find all useState hooks
ast-grep --pattern 'useState($$$)' --lang tsx

# Find specific JSX elements
ast-grep --pattern '<CheckInCard $$$>' --lang tsx

# Search for function calls
ast-grep --pattern '$FUNC($$$ARGS)' --lang ts

# Find and replace patterns
ast-grep --pattern 'old_pattern' --rewrite 'new_pattern' --lang tsx

# Search with multiple patterns
ast-grep --pattern 'pattern1' --pattern 'pattern2' --lang tsx

# Output JSON for programmatic use
ast-grep --pattern 'useState($$$)' --json --lang tsx
```

Common patterns for this codebase:
- Find components: `ast-grep --pattern 'export function $COMP($$$) { $$$ }' --lang tsx`
- Find imports: `ast-grep --pattern 'import { $$$IMPORTS } from "$MODULE"' --lang tsx`
- Find type definitions: `ast-grep --pattern 'interface $NAME { $$$ }' --lang ts`
- Find API routes: `ast-grep --pattern 'export async function $METHOD($$$) { $$$ }' app/api --lang ts`

Documentation: https://ast-grep.github.io/reference/cli.html

## Testing Approach

- Component rendering verification
- User flow completion (check-in should take < 5 minutes)
- Responsive design testing across viewports
- Animation performance monitoring
- LocalStorage persistence validation