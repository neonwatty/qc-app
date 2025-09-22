# Production Implementation Plan with POC Component Reuse Strategy

## 🔄 REUSE STRATEGY: Maximizing POC Code

### Pre-Implementation Checklist (Use Before Each Phase)
Before implementing ANY new feature:
1. ✅ Check if component exists in POC at `src/components/`
2. ✅ Review existing types in `src/types/`
3. ✅ Check contexts in `src/contexts/`
4. ✅ Review utility functions in `src/lib/`
5. ✅ Look for similar patterns in test pages `src/app/test-*/`

### Component Reuse Reference Guide

#### 📁 **KEEP AS-IS** (100% Reusable)
```
src/components/ui/*           - ALL shadcn/ui components
src/components/layout/*        - Header, Navigation, ThemeProvider
src/components/dashboard/*     - StatsGrid, ActivityFeed, QuickActions
src/components/checkin/*       - ENTIRE check-in flow UI
src/components/notes/*         - NoteCard, PrivacyBadge, SearchBar
src/components/growth/*        - Timeline, MilestoneCard, PhotoGallery
src/components/settings/*      - ALL settings panels
src/components/bookends/*      - PrepBanner, ReflectionForm
src/components/reminders/*     - ReminderSchedule, NotificationPreview
src/lib/animations.ts          - ALL Framer Motion presets
src/lib/utils.ts              - cn() and utility functions
src/types/*                   - ALL TypeScript interfaces
```

#### 🔧 **ENHANCE** (Modify Slightly)
```
src/contexts/CheckInContext    → Add API calls, keep reducer logic
src/contexts/ThemeContext      → Add persistence to database
src/contexts/SessionSettings   → Add real-time sync
src/lib/storage.ts            → Replace with API client wrapper
src/lib/mock-data.ts          → Transform into seed data
```

## Executive Summary
The QC app currently has a complete frontend with rich UI/UX, state management, and mock data using localStorage. To make it production-ready, we need to implement a real backend API, database, authentication, real-time sync, and production infrastructure while maximizing reuse of existing components.

## Phase 0: Pre-Development Foundations (Week 0)

### 0.1 Legal & Compliance Framework
**Essential Before ANY Data Collection**:
- **Privacy Policy**: GDPR/CCPA compliant privacy policy
- **Terms of Service**: User agreement and liability limitations
- **Beta User Agreement**: NDA and feedback expectations
- **Cookie Policy**: Consent management system
- **Age Verification**: 18+ requirement with verification flow
- **Data Processing Agreements**: For third-party services

```typescript
// src/components/legal/ConsentManager.tsx
export function ConsentManager() {
  // Cookie consent UI
  // Privacy policy acceptance
  // Age verification check
  // Terms acceptance tracking
}
```

### 0.2 Security Planning & Threat Modeling
**Security Architecture Design**:
- **Threat Modeling Session**: Identify attack vectors
- **Security Requirements Document**: Define security controls
- **Penetration Testing Plan**: Schedule and scope
- **Incident Response Plan**: Security breach procedures
- **Vulnerability Disclosure Policy**: Responsible disclosure process

### 0.3 Testing Strategy Definition
**Comprehensive Test Planning**:
```typescript
// test-strategy.md
Testing Matrix:
- Unit Tests: Jest + React Testing Library (existing)
- E2E Tests: Playwright for user flows
- Load Tests: k6 for performance testing
- Security Tests: OWASP ZAP scanning
- Accessibility Tests: axe-core + manual testing
- Cross-browser: BrowserStack matrix
```

### 0.4 Support Infrastructure Planning
**User Support System Design**:
- **Support Channels**: Email, in-app chat, Discord
- **SLA Definition**: Response time commitments
- **Knowledge Base Structure**: Help articles organization
- **Escalation Procedures**: Issue severity levels
- **Support Dashboard**: Admin tools specification

## Phase 1: Backend Infrastructure & Security (Week 1-2)

### 1.1 Database Setup with Backup Strategy
**POC REUSE**:
- ✅ Copy ALL interfaces from `src/types/index.ts:1-282` directly to Prisma schema
- ✅ Use existing type definitions as source of truth

**Technical Stack**:
- **Local PostgreSQL** with Prisma ORM for all data storage and sessions
- **No Redis needed** - PostgreSQL handles session management via connect-pg-simple
- **Database Schema Migration** from TypeScript types to Prisma schema
- **Backup Strategy**:
  - Local PostgreSQL backups via pg_dump
  - Daily automated backups with cron
  - Simple restore procedures
  - Version control for schema migrations

```prisma
// Example: Direct translation from POC types
model User {
  id        String   @id // matches POC User interface line 1-9
  name      String
  email     String
  avatar    String?
  partnerId String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  // ... exact same structure as TypeScript interface
}

model CheckIn {
  // Direct copy from src/types/index.ts:124-147
  id          String   @id
  coupleId    String
  participants String[]
  startedAt   DateTime
  completedAt DateTime?
  status      String   // 'in-progress' | 'completed' | 'abandoned'
  categories  String[]
  // ... maintaining exact same structure
}
```

### 1.2 Authentication System with Enhanced Security
**POC REUSE**:
- ✅ Keep `src/app/onboarding/*` components completely
- ✅ Reuse `WelcomeStep`, `CompleteStep`, `LoveLanguagesStep` components
- ✅ Keep onboarding flow tests at `src/app/onboarding/__tests__/`
- ✅ Use existing User type from `src/types/index.ts:1-9`

**NEW Implementation**:
- **NextAuth.js v5** configuration
- Google OAuth only for beta (no email/password initially)
- Database sessions stored in PostgreSQL
- Session management with connect-pg-simple
- **Simplified Security for Beta**:
  - OAuth-only authentication (inherently secure)
  - Session token rotation every 15 minutes
  - Secure cookie settings (httpOnly, secure, sameSite)
  - PostgreSQL session storage with automatic cleanup
  - Session invalidation on logout

```typescript
// src/lib/auth.ts - NEW FILE
import { mockUsers } from '@/lib/mock-data' // Use for seed data
import type { User } from '@/types' // REUSE existing type

export const authOptions = {
  // NextAuth configuration
  callbacks: {
    session({ session, token }) {
      // Map to existing User type structure
      return session
    }
  }
}
```

**Couple Pairing System**:
```typescript
// REUSE existing Couple type from src/types/index.ts:202-220
// Just add API endpoints for:
- Invitation codes/links generation
- Email verification
- Partner acceptance flow
```

### 1.3 Socket.io Real-Time Server
**Two-Server Architecture for WebSocket Support**:
- **Separate Node.js server** running Socket.io (port 3001)
- **Maintains Next.js optimizations** - no custom server needed
- **Shares PostgreSQL** connection for session validation
- **Zero-cost solution** - completely self-hosted

```javascript
// socket-server.js - NEW FILE
const { Server } = require('socket.io');
const { Pool } = require('pg');

const io = new Server(3001, {
  cors: { origin: 'http://localhost:3000' }
});

const pool = new Pool({
  // Same PostgreSQL config as Next.js app
});

io.on('connection', async (socket) => {
  // Validate session from PostgreSQL
  const { sessionId } = socket.handshake.auth;
  const result = await pool.query(
    'SELECT * FROM sessions WHERE sid = $1',
    [sessionId]
  );

  if (!result.rows[0]) {
    socket.disconnect();
    return;
  }

  const session = result.rows[0];
  socket.join(`couple-${session.coupleId}`);

  // Real-time check-in sync
  socket.on('checkin:update', (data) => {
    socket.to(`couple-${session.coupleId}`).emit('checkin:sync', data);
  });
});
```

### 1.4 Beta User Management System
**NEW Implementation for Beta Phase**:
- **Invitation System**:
  - Unique invitation codes generation
  - Beta access control middleware
  - User tagging for beta cohort identification
  - Waitlist management with auto-invites
  - Admin dashboard for beta user oversight

```typescript
// src/lib/beta-access.ts
export async function validateBetaAccess(email: string) {
  // Check invitation codes or whitelist
  // Track beta cohort for analytics
  // Enforce user limits (e.g., 50-100 beta users)
}

// src/middleware.ts
export function middleware(request: NextRequest) {
  // Beta access gate for all routes
  // Redirect non-beta users to waitlist
}
```

### 1.4 Feedback & Analytics Infrastructure
**CRITICAL for Beta Testing**:
- **In-App Feedback Widget**:
  - Floating feedback button on all pages
  - Bug report with screenshot capability
  - Feature request submission
  - NPS-style satisfaction surveys

```typescript
// src/components/feedback/FeedbackWidget.tsx
// Integrates with PostHog or similar for privacy-first analytics
// Captures user context, page, and actions leading to feedback
```

- **Analytics Setup**:
  - PostHog for privacy-compliant tracking
  - Feature usage metrics
  - User journey tracking
  - Error tracking with Sentry
  - Performance monitoring

### 1.5 Feature Flags System
**Essential for Beta Iteration**:
```typescript
// src/lib/feature-flags.ts
// Simple environment-based flags for beta
export const flags = {
  NEW_CHECKIN_FLOW: process.env.NEXT_PUBLIC_NEW_CHECKIN_FLOW === 'true',
  LOVE_LANGUAGES: process.env.NEXT_PUBLIC_LOVE_LANGUAGES === 'true',
  ADVANCED_REMINDERS: process.env.NEXT_PUBLIC_ADVANCED_REMINDERS === 'true',
}

// Or database-driven flags for more control:
export async function getFeatureFlag(flag: string, userId: string) {
  const result = await db.query(
    'SELECT enabled FROM feature_flags WHERE flag = $1 AND user_id = $2',
    [flag, userId]
  )
  return result.rows[0]?.enabled ?? false
}
```

- **Implementation Options**:
  - Environment variables (simplest for beta)
  - PostgreSQL flags table (more flexible)
  - Custom solution with user/group targeting

### 1.6 API Development with Security
**POC REUSE**:
- ✅ Generate API from existing Context actions in `CheckInContext.tsx:69-200`
- ✅ Each reducer action becomes an API endpoint
- ✅ Use existing types for request/response validation

**Security Implementation**:
- **Input Validation**: Zod schemas for all endpoints
- **Rate Limiting**: 100 req/min per user, 10 req/min for auth
- **CORS Configuration**: Strict origin validation
- **API Versioning**: /api/v1/ structure
- **Request Sanitization**: XSS and SQL injection prevention
- **API Key Management**: For third-party integrations

**API Structure Based on POC**:
```typescript
// src/app/api/checkin/start/route.ts
import { createInitialSession } from '@/contexts/CheckInContext' // REUSE logic
import type { CheckInSession } from '@/types/checkin' // REUSE types

export async function POST(req: Request) {
  // Copy createInitialSession logic from CheckInContext.tsx:31-67
  const session = createInitialSession(categories)
  // Add database persistence
  await prisma.checkIn.create({ data: session.baseCheckIn })
  return NextResponse.json(session)
}

// src/app/api/checkin/[action]/route.ts
// Map each CheckInAction type to an endpoint:
// - GO_TO_STEP → PUT /api/checkin/step
// - COMPLETE_STEP → POST /api/checkin/step/complete
// - ADD_NOTE → POST /api/checkin/note
// - UPDATE_CATEGORY_PROGRESS → PUT /api/checkin/category
```

### 1.7 Operational Infrastructure
**Monitoring & Observability**:
```typescript
// src/lib/monitoring.ts
export const monitoring = {
  // Application Performance Monitoring
  apm: new ElasticAPM({
    serviceName: 'qc-app',
    environment: process.env.NODE_ENV
  }),
  // Custom metrics
  metrics: {
    checkInDuration: new Histogram(),
    apiLatency: new Histogram(),
    activeUsers: new Gauge()
  },
  // Distributed tracing
  tracing: new OpenTelemetry()
}
```

**Infrastructure Components**:
- **Uptime Monitoring**: Pingdom/UptimeRobot
- **Log Aggregation**: LogDNA/Datadog
- **Alert Management**: PagerDuty integration
- **Database Monitoring**: pg_stat_statements
- **Session Monitoring**: PostgreSQL session queries
- **Status Page**: status.qc-app.com

## Phase 2: Core Features Migration + Testing (Week 2-3)

### 2.1 Check-in System with E2E Testing
**POC REUSE - KEEP ENTIRE UI**:
- ✅ ALL components in `src/components/checkin/`:
  - `CategoryCard.tsx` - Category selection UI
  - `CategoryGrid.tsx` - Grid layout for categories
  - `DiscussionView.tsx` - Discussion interface
  - `NavigationControls.tsx` - Step navigation
  - `ProgressBar.tsx` - Visual progress indicator
  - `SessionTimer.tsx` - Session timing
  - `CompletionCelebration.tsx` - Completion animation with confetti
  - `NoteTabs.tsx` - Private/shared note tabs
  - `TurnIndicator.tsx` - Turn-based UI
  - `ActionItems.tsx` - Action item management

**E2E Testing Suite**:
```typescript
// e2e/checkin.spec.ts
test('complete check-in flow under 5 minutes', async ({ page }) => {
  await page.goto('/checkin')
  // Test entire flow from start to completion
  // Verify data persistence
  // Test error recovery
  // Verify concurrent user handling
})
```

**MINIMAL MODIFICATIONS**:
```typescript
// src/contexts/CheckInContext.tsx
// Keep ALL existing logic (lines 1-300+)
// Just add API integration:

import { api } from '@/lib/api-client' // NEW
import { useSWR, mutate } from 'swr' // NEW

// Modify save function (around line 260):
const saveSession = useCallback(async (session: CheckInSession) => {
  // Keep existing logic
  saveToStorage(STORAGE_KEY, session) // Keep for offline

  // ADD: Sync to backend
  try {
    await api.checkin.save(session)
    mutate(`/api/checkin/${session.id}`)
  } catch (error) {
    // Fallback to localStorage (already implemented)
  }
}, [])
```

**Real-time Sync Addition**:
```typescript
// src/hooks/useRealtimeCheckin.ts - NEW
import { useEffect } from 'react'
import { io } from 'socket.io-client'

const socket = io('http://localhost:3001', {
  auth: { sessionId: session.id }
})

export function useRealtimeCheckin(sessionId: string) {
  useEffect(() => {
    socket.on('checkin:sync', (data) => {
      // Update local state with partner's changes
    })
    return () => socket.off('checkin:sync')
  }, [sessionId])
}
```

### 2.2 Notes Management
**POC REUSE - ALL UI COMPONENTS**:
- ✅ `src/components/notes/NoteCard.tsx` - Note display
- ✅ `src/components/notes/NoteEditor.tsx` - Rich text editing
- ✅ `src/components/notes/PrivacyBadge.tsx` - Privacy indicators
- ✅ `src/components/notes/PrivacySelector.tsx` - Privacy controls
- ✅ `src/components/notes/SearchBar.tsx` - Search interface
- ✅ `src/components/notes/NoteFilters.tsx` - Filter UI
- ✅ `src/components/notes/TagManager.tsx` - Tag system
- ✅ `src/components/notes/BulkActions.tsx` - Bulk operations

**DATA FETCHING UPDATE**:
```typescript
// src/app/notes/page.tsx
// BEFORE (line ~10):
import { mockNotes } from '@/lib/mock-data'

// AFTER - minimal change:
import { useNotes } from '@/hooks/useNotes' // NEW SWR hook
const { notes, isLoading } = useNotes()
// Rest of component stays exactly the same!
```

**Database Features**:
- Full-text search using PostgreSQL FTS
- Version history for edits
- Soft delete with recovery
- Tag indexing for performance

### 2.3 Love Languages System
**POC REUSE - COMPLETE FEATURE**:
- ✅ `src/contexts/LoveLanguagesContext.tsx` - Full state management
- ✅ `src/components/Settings/LoveLanguagesSettings.tsx` - Settings UI
- ✅ `src/app/love-languages/*` - All pages implemented
- ✅ Types in `src/types/index.ts` - LoveLanguage interfaces

**Database Integration**:
```typescript
// Minimal change - just add persistence
model UserLoveLanguages {
  userId     String @id
  primary    String[]
  secondary  String[]
  actions    Json   // Custom actions per language
  visibility String // 'private' | 'partner' | 'public'
}
```

### 2.4 Session Bookends System
**POC REUSE - COMPLETE FEATURE**:
- ✅ `src/contexts/BookendsContext.tsx` - Preparation & reflection logic
- ✅ `src/components/bookends/PrepBanner.tsx` - Pre-session UI
- ✅ `src/components/bookends/ReflectionForm.tsx` - Post-session UI
- ✅ Integration in check-in flow already complete

**API Addition**:
```typescript
// Store bookend responses for insights
model SessionBookends {
  sessionId   String @id
  preparation Json   // Mood, energy, intentions
  reflection  Json   // Satisfaction, insights, gratitude
}
```

### 2.5 Partner Requests System
**POC REUSE - EXPAND EXISTING**:
- ✅ Types defined in `src/types/index.ts:99-122`
- ✅ Mock structure in `src/lib/mock-requests.ts`
- ✅ Dashboard integration exists

**Production Enhancement**:
```typescript
// src/app/api/requests/route.ts
// Full CRUD for partner requests
// Real-time notifications via WebSocket
// Request templates for common needs
// Approval/decline workflow with notes
```

### 2.6 Growth Gallery & Milestones
**POC REUSE - COMPLETE UI**:
- ✅ `src/components/growth/Timeline.tsx` - Timeline visualization
- ✅ `src/components/growth/TimelineItem.tsx` - Timeline entries
- ✅ `src/components/growth/MilestoneCard.tsx` - Achievement cards
- ✅ `src/components/growth/PhotoGallery.tsx` - Photo grid
- ✅ `src/components/growth/PhotoUpload.tsx` - Upload interface
- ✅ `src/components/growth/BasicChart.tsx` - Progress charts
- ✅ `src/components/growth/MemoryCard.tsx` - Memory display

**Storage Enhancement**:
```typescript
// src/components/growth/PhotoUpload.tsx
// Keep existing UI, just modify handleUpload:
const handleUpload = async (file: File) => {
  // REUSE existing preview logic
  // ADD: Upload to S3/Cloudinary
  const url = await uploadToS3(file)
  // Continue with existing logic
}
```

### 2.7 Content Moderation & Safety
**NEW Safety Features**:
```typescript
// src/lib/moderation.ts
export const moderation = {
  // Text content screening
  checkText: async (content: string) => {
    // Profanity filter
    // Harmful content detection
    // Crisis keyword detection
  },
  // Image moderation
  checkImage: async (file: File) => {
    // AWS Rekognition or similar
    // NSFW detection
    // Violence detection
  },
  // Crisis resources
  crisisResources: {
    mentalHealth: '988 Suicide & Crisis Lifeline',
    domesticViolence: 'National Domestic Violence Hotline',
    // Localized resources based on user location
  }
}
```

**Safety UI Components**:
- Report/flag button on all user content
- Crisis resources modal
- Content warning system
- Safe word trigger for immediate session end
- Moderation queue for admin review

## Phase 3: Communication Features (Week 3-4)

### 3.1 Notification System
**POC REUSE**:
- ✅ `src/components/reminders/NotificationPreview.tsx` - Preview UI ready
- ✅ `src/components/Settings/NotificationSettings.tsx` - Preferences UI complete
- ✅ Mock structure in `src/lib/mock-reminders.ts:1-50` for data model

**Service Worker Enhancement**:
```javascript
// public/sw.js - ENHANCE existing file
// Existing SW at public/sw.js - add push handling:
self.addEventListener('push', (event) => {
  // Add push notification logic
})
```

**Email Notifications**:
- Use Nodemailer with Gmail SMTP for transactional emails (free tier)
- Email templates based on existing UI components
- Digest emails for activity summaries

### 3.2 Reminders & Scheduling
**POC REUSE**:
- ✅ `src/components/Settings/ReminderScheduler.tsx` - Complete scheduling UI
- ✅ `src/lib/reminder-dates.ts` - Date calculation logic ready
- ✅ Reminder types in `src/types/index.ts:68-97`
- ✅ `src/app/reminders/page.tsx` - Reminders dashboard

**Background Jobs**:
```typescript
// src/lib/jobs/reminder-processor.ts - NEW
import { simplifiedMockReminders } from '@/lib/mock-reminders' // Use as template
import type { Reminder } from '@/types' // REUSE type

export async function processReminders() {
  // Logic based on mock reminder structure
}
```

### 3.3 Partner Requests
**POC REUSE**:
- ✅ Request types defined `src/types/index.ts:99-122`
- ✅ Mock structure in `src/lib/mock-requests.ts`
- ✅ Dashboard integration at `src/app/dashboard/page.tsx:35-40`
- ✅ Request count display already implemented

**NEW Features**:
- Real-time request notifications via WebSocket
- Accept/decline workflow API
- Request-to-reminder conversion logic

### 3.4 Support & Communication System
**User Support Infrastructure**:
```typescript
// src/components/support/SupportWidget.tsx
export function SupportWidget() {
  // Floating help button
  // In-app chat (Intercom/Crisp)
  // Knowledge base search
  // Ticket submission
  // FAQ quick access
}
```

**Support Channels**:
- **Email Support**: support@qc-app.com with auto-ticketing
- **In-App Chat**: Real-time support during business hours
- **Discord Community**: Beta user community
- **Knowledge Base**: Searchable help articles
- **Video Tutorials**: Onboarding and feature guides

**Email Templates (using Nodemailer + Gmail SMTP)**:
```typescript
// src/lib/email-templates/
- welcome.tsx          // New user welcome
- invitation.tsx       // Partner invitation
- reminder.tsx         // Check-in reminder
- weeklyDigest.tsx     // Activity summary
- betaFeedback.tsx     // Beta survey request
// Note: No password reset needed with Google OAuth only
```

## Phase 4: Error Recovery & Beta Monitoring (Week 4)

### 4.1 Comprehensive Error Recovery System
**Production Error Handling**:
```typescript
// src/components/ErrorBoundary.tsx
export function ErrorBoundary({ children }) {
  // User-friendly error messages
  // Automatic error reporting to Sentry
  // Fallback UI with recovery options
  // Local data preservation during crashes
}
```

**Edge Cases & Error Scenarios**:
```typescript
// src/lib/error-handling.ts
export const errorHandlers = {
  // Relationship changes
  coupleBreakup: async (coupleId: string) => {
    // Data ownership transfer
    // Access revocation
    // Archive shared content
    // Notify both parties
  },
  // Concurrent editing
  conflictResolution: {
    strategy: 'last-write-wins',
    mergeNotes: true,
    preserveVersions: true
  },
  // Account recovery
  accountRecovery: {
    methods: ['email', 'phone', 'securityQuestions'],
    dataRecovery: true,
    partnerVerification: optional
  },
  // Large data handling
  pagination: {
    notesPerPage: 50,
    checkInsPerPage: 20,
    lazyLoadImages: true
  },
  // Time zone handling
  timeZoneSync: {
    detectUserTZ: true,
    displayPartnerTZ: true,
    schedulingConversion: automatic
  }
}
```

**Offline & Sync Handling**:
- Optimistic updates with rollback
- Conflict resolution for concurrent edits
- Queue system for offline actions
- Auto-retry with exponential backoff
- Data recovery from localStorage backup
- Network status indicator
- Sync status for each data type

### 4.2 Beta Monitoring Infrastructure
**Real-time Monitoring**:
```typescript
// src/lib/monitoring.ts
import * as Sentry from '@sentry/nextjs'
import { PostHog } from 'posthog-node'

export const monitor = {
  error: (error, context) => {
    Sentry.captureException(error, {
      user: context.userId,
      beta_cohort: context.cohort
    })
  },
  feature: (name, properties) => {
    posthog.capture('feature_used', {
      feature: name,
      ...properties
    })
  },
  performance: (metric, value) => {
    // Track load times, API latency, etc.
  }
}
```

**Beta Dashboard**:
- Active user monitoring
- Feature usage heatmaps
- Error rate tracking
- Performance metrics
- Feedback aggregation

### 4.3 Basic Security for Beta
**POC REUSE**:
- ✅ Privacy levels in types
- ✅ Privacy UI components
- ✅ Session agreement system

**Beta-Appropriate Security**:
- HTTPS everywhere (Vercel handles)
- Row-level security in database
- API rate limiting
- Basic audit logging
- Password reset flow

**Deferred for Post-Beta**:
- End-to-end encryption
- Complex OAuth providers
- GDPR compliance tools
- Advanced audit systems

## Phase 5: Production Infrastructure & Testing (Week 5)

### 5.1 Deployment Configuration & CI/CD
**POC REUSE - Configuration Files**:
- ✅ `next.config.js` - Keep ALL optimization settings
- ✅ `tailwind.config.ts` - Complete theme system ready
- ✅ `postcss.config.js` - Production ready
- ✅ `jest.config.js` - Test configuration complete
- ✅ `tsconfig.json` - TypeScript config optimal

**Deployment Stack**:
- **Two-Server Architecture**:
  - Next.js app (Port 3000)
  - Socket.io server (Port 3001)
- **Local PostgreSQL** for development
- **Self-hosted or free tier** for production:
  - Option 1: Single VPS with Docker Compose
  - Option 2: Next.js on Vercel + Socket.io on Railway/Render
- **Local file storage** for images (or free Cloudinary tier)
- **Sentry** for error tracking (generous free tier)

**CI/CD Pipeline**:
```yaml
# .github/workflows/deploy.yml
name: Deploy Pipeline
steps:
  - lint              # ESLint checks
  - typecheck         # TypeScript validation
  - unit-tests        # Jest tests
  - e2e-tests         # Playwright tests
  - security-scan     # Snyk/Dependabot
  - build             # Next.js build
  - lighthouse        # Performance audit
  - deploy-preview    # Vercel preview
  - smoke-tests       # Production verification
```

**Environment Management**:
- Development: Local (Next.js:3000, Socket.io:3001, PostgreSQL:5432)
- Staging: Docker Compose on test VPS or free tiers
- Production: Self-hosted VPS or split hosting
- Database migrations: Prisma migrate deploy

**Docker Compose Setup**:
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: qc_app
    ports:
      - "5432:5432"

  nextjs:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres

  socketio:
    build: ./socket-server
    ports:
      - "3001:3001"
    depends_on:
      - postgres
```

### 5.2 Comprehensive Testing Strategy
**POC REUSE - ALL TESTS**:
- ✅ Component tests in `__tests__` folders
- ✅ Onboarding flow tests
- ✅ Test utilities in `src/test-utils/`
- ✅ Mock browser APIs setup

**Test Coverage Requirements**:
```typescript
// testing-matrix.ts
export const testingRequirements = {
  unit: {
    coverage: 80,
    tools: ['Jest', 'React Testing Library']
  },
  integration: {
    coverage: 70,
    tools: ['Jest', 'MSW for API mocking']
  },
  e2e: {
    criticalPaths: [
      'complete-checkin',
      'onboarding-flow',
      'partner-pairing',
      'note-creation'
    ],
    tools: ['Playwright']
  },
  performance: {
    metrics: {
      LCP: '<2.5s',
      FID: '<100ms',
      CLS: '<0.1',
      TTI: '<3.5s'
    },
    tools: ['Lighthouse', 'WebPageTest']
  },
  load: {
    targets: {
      concurrentUsers: 100,
      checkInsPerMinute: 50,
      responseTime: '<500ms'
    },
    tools: ['k6', 'Artillery']
  },
  accessibility: {
    standard: 'WCAG 2.1 Level AA',
    tools: ['axe-core', 'Pa11y']
  },
  security: {
    scans: ['OWASP Top 10', 'dependency audit'],
    tools: ['OWASP ZAP', 'Snyk']
  }
}
```

**Cross-Browser Testing Matrix**:
- Chrome (latest 2 versions)
- Safari (latest 2 versions)
- Firefox (latest 2 versions)
- Edge (latest version)
- iOS Safari (14+)
- Chrome Android (latest)

## Phase 6: Beta Iteration & Polish (Week 6)

### 6.1 Beta Feedback Integration
**Rapid Iteration Based on User Feedback**:
- Weekly beta user surveys
- Feature request prioritization
- Bug fix sprints
- UX improvements from session recordings
- A/B test results implementation

**Beta Communication**:
- In-app changelog
- Beta user newsletter
- Discord/Slack community
- Office hours with beta users

### 6.2 Performance & Optimization Strategy
**POC REUSE - Keep Simple**:
- ✅ All existing performance utilities
- ✅ Loading states and skeletons
- ✅ Lazy loading components

**Performance Optimization Details**:
```typescript
// src/lib/performance.ts
export const performanceConfig = {
  // Database optimization
  database: {
    indexes: [
      'checkin_couple_id_idx',
      'notes_user_id_created_at_idx',
      'reminders_due_date_idx'
    ],
    queryOptimization: {
      useProjection: true,
      limitJoins: 3,
      paginateResults: true
    }
  },
  // Caching strategy
  caching: {
    postgresql: {
      // Use PostgreSQL for all caching needs
      sessionTTL: 3600,
      userDataCache: 'materialized_views',
      queryCache: 'prepared_statements'
    },
    browser: {
      localStorage: 'offline_first',
      serviceWorker: 'cache_api_responses',
      strategy: 'stale-while-revalidate'
    }
  },
  // Bundle optimization
  bundleSize: {
    monitoring: 'bundlephobia',
    splitting: {
      vendor: true,
      routes: true,
      components: 'lazy'
    },
    compression: 'brotli'
  },
  // Image optimization
  images: {
    formats: ['webp', 'avif'],
    sizes: [640, 750, 1080, 1920],
    lazy: true,
    placeholder: 'blur'
  }
}
```

**Memory Management**:
- Cleanup timers and listeners
- Limit in-memory cache size
- Pagination for large lists
- Virtual scrolling for long feeds

### 6.3 Mobile Web Polish
**POC REUSE**:
- ✅ All mobile components
- ✅ Touch interactions
- ✅ Responsive design

**Beta Mobile Enhancements**:
- PWA basic setup (installable)
- Mobile Safari optimizations
- Touch gesture refinements
- Viewport meta adjustments

**Deferred Post-Beta**:
- Full offline mode
- Background sync
- Push notifications
- i18n/internationalization

### 6.4 Beta Program Management
**Beta-Specific Features**:
```typescript
// src/lib/beta-features.ts
export const betaProgram = {
  // User management
  cohorts: {
    alpha: { limit: 10, features: 'all' },
    beta1: { limit: 50, features: 'core' },
    beta2: { limit: 100, features: 'stable' }
  },
  // Feedback collection
  feedback: {
    inApp: true,
    surveys: 'weekly',
    interviews: 'biweekly',
    nps: 'monthly'
  },
  // Feature voting
  featureRequests: {
    voting: true,
    roadmapVisible: true,
    betaExclusive: ['early-access', 'beta-badge']
  },
  // Analytics
  tracking: {
    detailed: true,
    heatmaps: true,
    sessionRecording: 'with-consent',
    customEvents: true
  }
}
```

**Beta Graduation Process**:
- Performance metrics met
- Bug rate < 1%
- NPS score > 7
- Core features stable
- Support load manageable

## Phase 7: Future Considerations (Post-Beta)

### 7.1 Monetization Infrastructure
**Revenue Model Preparation**:
```typescript
// src/lib/billing.ts
export const subscriptionTiers = {
  free: {
    checkInsPerMonth: 4,
    notesLimit: 100,
    photoStorage: '500MB'
  },
  premium: {
    checkInsPerMonth: 'unlimited',
    notesLimit: 'unlimited',
    photoStorage: '10GB',
    features: ['themes', 'exports', 'analytics']
  },
  couples: {
    price: '$9.99/month',
    billing: 'per-couple',
    features: ['all-premium', 'counselor-tools']
  }
}
```

### 7.2 Advanced Features (Post-Beta)
**Deferred Enhancements**:
- AI-powered relationship insights
- Voice/video notes
- Counselor integration portal
- Multi-language support
- Native mobile apps
- Relationship coaching content
- Community features
- Gift features for anniversaries

## 📋 MIGRATION TRACKING SYSTEM

### Daily Checklist
```markdown
Before starting any task:
1. [ ] Check if component exists in POC
2. [ ] Review existing types
3. [ ] Look for similar patterns
4. [ ] Check test pages for examples
5. [ ] Review contexts for logic
```

### Component Migration Status Template
```markdown
## Component: [Name]
- **POC Location**: src/components/...
- **Status**: REUSED | MODIFIED | NEW
- **Changes Required**: None | List changes
- **Dependencies**: List POC dependencies
- **Tests**: Existing | Need update | New
```

### Git Commit Convention
```bash
# Use prefixes to track reuse:
git commit -m "feat: [REUSE] Implement check-in API using POC components"
git commit -m "feat: [MODIFY] Enhance storage.ts with API calls"
git commit -m "feat: [NEW] Add authentication system"
```

## 🚨 REMINDER SYSTEM

### Sprint Planning
1. Start each sprint by reviewing POC components
2. Create reuse checklist for sprint tasks
3. Assign "REUSE", "MODIFY", or "NEW" labels

### Code Review Checklist
- [ ] Checked for existing POC component?
- [ ] Maintained consistent styling?
- [ ] Preserved animation patterns?
- [ ] Reused TypeScript types?
- [ ] Kept test structure?

### Daily Standup Questions
1. "What POC components am I reusing today?"
2. "Am I recreating something that exists?"
3. "Have I checked test pages for patterns?"

## 💡 Key Success Metrics

### Code Reuse Targets
- **UI Components**: 95% reuse
- **TypeScript Types**: 100% reuse
- **Styling/Animations**: 100% reuse
- **Business Logic**: 80% reuse
- **Tests**: 90% reuse + expansion

### Development Time Savings
- **Estimated without reuse**: 10 weeks
- **With POC reuse**: 6 weeks
- **Time saved**: 4 weeks (40%)

## Example Migration Patterns

### Pattern 1: Data Source Swap
```typescript
// POC Version (localStorage):
import { mockData } from '@/lib/mock-data'
const data = mockData.checkIns

// Production Version (API):
import { useCheckIns } from '@/hooks/useCheckIns'
const { data } = useCheckIns()
// Component remains EXACTLY the same!
```

### Pattern 2: Context Enhancement
```typescript
// Keep existing reducer:
function checkInReducer(state, action) {
  // ENTIRE reducer stays the same
}

// Just add API sync:
useEffect(() => {
  if (state.session) {
    api.sync(state.session) // Only addition
  }
}, [state.session])
```

### Pattern 3: Progressive Enhancement
```typescript
// Keep component as-is, add features via composition:
<ExistingComponent>
  <NewRealtimeIndicator /> {/* Only addition */}
</ExistingComponent>
```

## Timeline Summary for Beta Phase

**Week 0**: Pre-Development Foundations (NEW)
  - Legal framework (Privacy Policy, ToS, Beta Agreement)
  - Security planning and threat modeling
  - Testing strategy definition
  - Support infrastructure planning

**Week 1-2**: Backend + Auth + Security (ENHANCED)
  - Local PostgreSQL setup with backup strategy
  - Google OAuth only authentication via NextAuth.js
  - Socket.io server setup (separate process)
  - Beta user management system
  - API development with input validation
  - Operational monitoring setup

**Week 2-3**: Core Features + Safety (REUSE + ENHANCE)
  - Check-in system with E2E testing
  - Notes, Love Languages, Bookends
  - Content moderation and safety features
  - Partner Requests, Growth Gallery

**Week 3-4**: Communication + Support (EXPAND)
  - Notifications and Reminders
  - Support system and help documentation
  - Email templates and communication
  - Socket.io integration for real-time features

**Week 4**: Error Recovery + Edge Cases (COMPREHENSIVE)
  - Complete error handling system
  - Edge case scenarios (breakup, recovery)
  - Beta monitoring infrastructure
  - Security implementation

**Week 5**: Testing + Deployment (THOROUGH)
  - Comprehensive testing suite
  - CI/CD pipeline setup
  - Cross-browser testing
  - Performance and load testing

**Week 6**: Beta Program + Optimization (FOCUSED)
  - Beta feedback integration
  - Performance optimization
  - Mobile web polish
  - Beta program management

## Beta Phase Focus

This beta-optimized plan:
1. **Adds critical beta infrastructure** (Week 1)
   - User management, feedback, analytics, feature flags
2. **Includes ALL POC features** (Week 2-3)
   - Love Languages, Session Bookends, Partner Requests
3. **Prioritizes beta monitoring** (Week 4)
   - Error recovery, monitoring, beta dashboard
4. **Defers unnecessary complexity** (Throughout)
   - Redis/external caching, i18n, full PWA, multiple OAuth providers
5. **Enables rapid iteration** (Week 6)
   - Feedback loops, A/B testing, quick fixes

### Beta Success Criteria
- 50-100 engaged beta users
- <5% error rate
- <3s page load times
- Weekly feature iterations
- High user satisfaction (NPS > 7)
- 80% test coverage
- Zero critical security vulnerabilities
- <1% data sync failures
- Support response time <24 hours

### Critical Path Items
**Must-Have Before Beta Launch**:
1. Privacy Policy & Terms of Service
2. PostgreSQL backup strategy (pg_dump automation)
3. Google OAuth setup and session management
4. Socket.io server running alongside Next.js
5. Basic security hardening (input validation, rate limiting)
6. E2E testing for critical flows
7. Support system beyond feedback widget
8. Content moderation basics
9. Error recovery mechanisms
10. User data export capability

### Post-Beta Roadmap
**Based on Beta Learnings**:
- Scale infrastructure (database, caching)
- Implement most-requested features
- Native iOS/Android apps
- Advanced AI features
- International expansion
- Counselor/therapist portal
- API for third-party integrations
- Enterprise/group offerings

The enhanced plan addresses all critical gaps while maintaining the POC reuse strategy. Week 0 foundations ensure legal compliance and security from day one, while comprehensive testing and support systems provide the operational readiness needed for a successful beta launch.