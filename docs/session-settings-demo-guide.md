# Session Settings Feature - Demo Guide

## 🎯 Feature Overview

The Session Settings feature addresses a critical pain point in relationship discussions: **conversation imbalance and unstructured check-ins**. It provides couples with customizable rules that ensure fair, focused, and productive conversations.

## 📱 Responsive Design Verification

### Mobile (320px - 768px)
✅ **Optimized Elements:**
- Compact tab navigation with smaller text on mobile
- Single-column layout for timer and turn indicator
- Abbreviated button labels ("Edit" instead of "Configure")
- Touch-friendly slider controls
- Stacked templates in settings panel
- Responsive card layouts

### Desktop (768px+)
✅ **Enhanced Layout:**
- Side-by-side timer and turn indicator
- Full button labels with icons
- Wider sliders for precise control
- Grid layout for template selection
- More spacious component spacing

## 🚀 How to Demo the Feature

### 1. Interactive Walkthrough
**Navigate to:** `/checkin`

The demo card appears prominently on the check-in page:
- Click **"See Session Rules in Action"** to launch the interactive demo
- Step through 5 screens explaining:
  - Why session rules matter
  - Template selection (Quick/Standard/Deep Dive)
  - Live timer functionality
  - Turn-based discussion system
  - Partner agreement workflow

### 2. Test Page Demo
**Navigate to:** `/test-session-settings`

This dedicated test page provides:
- **Demo Tab**: Interactive walkthrough
- **Settings Tab**: Full configuration panel
- **Active Tab**: Live timer and turn indicator
- **Agreement Tab**: Partner approval simulation

#### Mobile/Desktop Toggle
Use the viewport switcher in the header to see responsive behavior:
- Click **Mobile** to see compact layouts
- Click **Desktop** to see expanded views

### 3. Settings Configuration
**Navigate to:** `/settings` → **Session Rules**

#### Try These Actions:
1. **Select a Template:**
   - Quick Check-in (5 min, no timeouts)
   - Standard Session (10 min, turn-based)
   - Deep Dive (20 min, all features)

2. **Customize Settings:**
   - Adjust session duration (5-30 minutes)
   - Set timeouts per partner (0-3)
   - Toggle turn-based mode
   - Configure turn duration (30s-3min)
   - Enable warm-up questions
   - Set cool-down reflection time

3. **Propose Changes:**
   - Make adjustments
   - Click "Propose Changes"
   - See the pending proposal notification

### 4. Live Session Experience
**Navigate to:** `/checkin` → Start any discussion

#### Features in Action:
1. **Session Timer:**
   - Real-time countdown display
   - Progress bar visualization
   - Color coding: Green → Yellow (20% left) → Red (< 1 min)
   - Pause/Resume functionality
   - Sound toggle

2. **Timeout System:**
   - Click timeout buttons (if enabled)
   - See remaining timeouts for each partner
   - Watch timeout timer countdown
   - Auto-resume after timeout

3. **Turn-Based Discussion:**
   - Active speaker indicator with avatar
   - Turn timer countdown
   - "Pass" button to skip turn
   - Next speaker preview
   - Round counter

4. **Session Extensions:**
   - At time-up, extension dialog appears
   - Add 5-minute increments
   - Extension counter badge

## 🎨 Visual Design Elements

### Color Coding System
- **Green**: Active/Speaking/Good time remaining
- **Yellow**: Warning (< 20% time)
- **Red**: Critical (< 1 minute)
- **Orange**: Timeout active
- **Blue**: Information/Templates

### Animations
- Smooth transitions between turns
- Pulsing indicators for active states
- Progress bar animations
- Modal slide-ins
- Card hover effects

## 📊 Key User Flows

### Flow 1: First-Time Setup
1. User opens check-in page
2. Sees demo card → clicks to learn
3. Steps through interactive tutorial
4. Goes to Settings → Session Rules
5. Selects Standard template
6. Reviews and saves

### Flow 2: Partner Agreement
1. Partner A adjusts settings
2. Clicks "Propose Changes"
3. Partner B receives notification
4. Opens agreement modal
5. Reviews changes (old vs new)
6. Accepts or declines
7. Both see confirmation

### Flow 3: Active Session
1. Couple starts check-in
2. Timer begins automatically
3. Turn indicator shows current speaker
4. Partner uses timeout when needed
5. System tracks turn switches
6. Session extends if needed at end

## 🔍 Technical Highlights

### State Management
- **SessionSettingsContext**: Centralized settings management
- **localStorage**: Persistent settings storage
- **Real-time sync**: Both partners see same rules

### Performance
- **Optimized timers**: Uses intervals efficiently
- **Lazy loading**: Components load as needed
- **Responsive images**: Avatars scale appropriately

### Accessibility
- **Keyboard navigation**: Full tab support
- **ARIA labels**: Screen reader friendly
- **Color contrast**: WCAG AA compliant
- **Touch targets**: 44x44px minimum

## 💡 Demo Tips

1. **Start with "Why"**: Explain the problem it solves
2. **Show Templates First**: Easy entry point
3. **Demonstrate Fairness**: Emphasize equal time
4. **Highlight Agreement**: Both partners must consent
5. **Test Responsiveness**: Resize browser or use device mode

## 🎯 Success Metrics to Highlight

- **Reduced anxiety**: Clear structure and expectations
- **Equal participation**: Measurable speaking time
- **Focused discussions**: Time limits prevent drift
- **Flexibility**: Timeouts and extensions when needed
- **Mutual agreement**: Both partners control rules

## 📱 Testing Checklist

### Mobile Testing
- [ ] Templates stack vertically
- [ ] Sliders are touch-friendly
- [ ] Timer text is readable
- [ ] Buttons show abbreviated text
- [ ] Modals are full-screen
- [ ] Turn indicator fits in viewport

### Desktop Testing
- [ ] Components use grid layouts
- [ ] Side-by-side timer/turn display
- [ ] Full button labels visible
- [ ] Hover states work
- [ ] Modals are centered
- [ ] Settings panel uses tabs effectively

## 🚨 Edge Cases Handled

1. **No settings configured**: Defaults to Standard template
2. **Timer expires**: Extension prompt appears
3. **All timeouts used**: Buttons disable
4. **Turn time expires**: Auto-switches speaker
5. **Partner offline**: Settings remain pending
6. **Browser refresh**: Timer state persists

## 🎬 Quick Demo Script

"Let me show you our new Session Settings feature that ensures both partners get equal time to share during check-ins.

[Open /checkin]
Here's an interactive demo that walks through the feature...

[Click demo, step through]
As you can see, couples can choose from templates or customize their own rules...

[Go to /settings, Session Rules tab]
Partners can configure session duration, timeouts for breaks, and even enable turn-based discussions...

[Show timer/turn indicator]
During check-ins, the timer keeps everyone on track, and the turn system ensures fair participation...

[Show agreement modal]
Most importantly, both partners must agree on any changes, ensuring mutual consent for the rules that govern your conversations."

---

This feature transforms potentially difficult conversations into structured, fair, and productive discussions that strengthen relationships.