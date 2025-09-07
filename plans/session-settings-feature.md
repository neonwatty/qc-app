# Session Settings Feature Implementation Plan

## Overview
Add a "Session Settings" feature that allows couples to define and agree upon ground rules for their quality control check-in sessions. These settings will govern how sessions run and ensure both partners have an equal, structured experience.

## Core Features

### 1. Session Settings Data Model
Create new type `SessionSettings` with fields:
- **Session duration** (5-30 minutes, default: 10)
- **Number of timeouts per partner** (0-3, default: 1)
- **Timeout duration** (1-5 minutes, default: 2)
- **Turn-based discussion mode** (boolean, default: true)
- **Turn duration if enabled** (30s-3min, default: 90s)
- **Allow session extensions** (boolean, default: true)
- **Pause notifications during session** (boolean, default: true)
- **Auto-save draft notes** (boolean, default: true)
- **Session warm-up questions** (boolean, default: false)
- **Cool-down reflection time** (0-5 minutes, default: 2)

### 2. Agreement System
- Both partners must agree on settings before they take effect
- Create `SessionSettingsProposal` type for pending changes
- Visual indicator when partner has proposed changes
- Notification system for settings proposals
- Version history of agreed settings

### 3. UI Components

#### New Components:
- `SessionSettingsPanel.tsx` - Main settings configuration panel
- `SessionRulesCard.tsx` - Visual display of current rules
- `SessionAgreementModal.tsx` - Partner agreement workflow
- `SessionTimer.tsx` - Enhanced timer with timeout controls
- `TurnIndicator.tsx` - Visual turn-based discussion indicator

#### Integration Points:
- Add "Session Rules" section to Settings page
- Add "Session Settings" quick access from check-in start page
- Display active rules during check-in sessions
- Show timer and timeout controls during discussions

### 4. Check-in Flow Integration

#### Pre-Session:
- Display session rules summary before starting
- Quick toggle for "Use custom settings" vs "Quick mode"
- Partner presence check before applying turn-based rules

#### During Session:
- Visual timer showing remaining session time
- Timeout button with remaining count
- Turn indicator for discussion mode
- Auto-pause when timeout activated
- Warning at 80% session time
- Extension prompt at session end

#### Post-Session:
- Track actual vs planned session time
- Log timeout usage
- Feedback on session settings effectiveness

### 5. Default Templates

#### Quick Check-in (5 min):
- No timeouts
- No turn-based discussion
- Focus on key topics only

#### Standard Session (10 min):
- 1 timeout per partner
- Turn-based discussion (90s turns)
- All selected categories

#### Deep Dive (20 min):
- 2 timeouts per partner
- Extended turns (2 min)
- Warm-up and cool-down included

### 6. Storage & Persistence
- Store in localStorage with CheckInContext
- Sync settings to `Couple` object
- Cache agreed settings for offline use
- Track settings usage analytics

### 7. Mobile Optimization
- Compact settings view for mobile
- Swipe gestures for timeout activation
- Haptic feedback for turn changes
- Full-screen timer mode option

## Implementation Steps

### Step 1: Update Type Definitions
- Add `SessionSettings` interface to types/index.ts
- Add `SessionSettingsProposal` type
- Extend `CheckInSession` with settings reference
- Add settings to `Couple` type

### Step 2: Create Session Settings Context
- New context for managing session settings
- Handles proposals, agreements, and active settings
- Integrates with CheckInContext

### Step 3: Build Core Components
- Session settings configuration panel
- Agreement workflow components
- Timer and timeout UI elements

### Step 4: Integrate with Check-in Flow
- Update CheckInContext to respect settings
- Add timer logic to discussion views
- Implement timeout functionality

### Step 5: Add to Settings Page
- New settings section for session rules
- Partner agreement UI
- Settings history view

### Step 6: Create Demo Experience
- Pre-configured templates
- Interactive tutorial
- Sample timeout scenario

### Step 7: Testing & Polish
- Edge cases (network issues during agreement)
- Accessibility for timer/timeout features
- Performance with real-time updates

## Benefits
- **Structured, fair discussions** - Ensures both partners get equal time to share
- **Prevents conversation dominance** - Turn-based system gives everyone a voice
- **Respects time boundaries** - Clear session limits prevent fatigue
- **Reduces session anxiety** - Clear rules create predictable structure
- **Encourages focused check-ins** - Time limits promote staying on topic
- **Builds healthy communication habits** - Regular practice with structure

## Technical Considerations

### State Management
```typescript
interface SessionSettings {
  id: string
  coupleId: string
  sessionDuration: number // minutes
  timeoutsPerPartner: number
  timeoutDuration: number // minutes
  turnBasedMode: boolean
  turnDuration?: number // seconds
  allowExtensions: boolean
  pauseNotifications: boolean
  autoSaveDrafts: boolean
  warmUpQuestions: boolean
  coolDownTime: number // minutes
  agreedAt: Date
  agreedBy: string[]
  version: number
}

interface SessionSettingsProposal {
  id: string
  proposedBy: string
  proposedAt: Date
  settings: Partial<SessionSettings>
  status: 'pending' | 'accepted' | 'rejected'
  reviewedBy?: string
  reviewedAt?: Date
}
```

### Session Timer Logic
- Use React hooks for timer management
- WebWorker for accurate background timing
- LocalStorage for timer persistence
- Audio/haptic alerts for turn changes

### Agreement Workflow
1. Partner A proposes settings changes
2. System notifies Partner B
3. Partner B reviews and accepts/rejects
4. If accepted, settings become active
5. Both partners see confirmation

## Future Enhancements
- AI-suggested settings based on session history
- Adaptive settings that adjust based on topic difficulty
- Session recording and transcript features
- Integration with calendar for scheduled sessions
- Analytics dashboard showing setting effectiveness
- Export session rules for sharing with other couples

## Success Metrics
- Session completion rate
- Average session duration vs planned
- Timeout usage frequency
- Partner satisfaction ratings
- Settings adjustment frequency
- Feature adoption rate

## Notes
This feature addresses a key pain point in relationship discussions where one partner may dominate conversation time or sessions run too long and become unproductive. By implementing structured rules that both partners agree to, we create a safe, fair environment for meaningful connection and growth.