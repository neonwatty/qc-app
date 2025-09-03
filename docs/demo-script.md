# QC App - Demo Walkthrough Script

## Introduction (30 seconds)
"Welcome to QC - Quality Control for relationships. This app helps couples maintain healthy communication through regular, structured check-ins. Think of it as a relationship maintenance tool that makes difficult conversations easier and ensures both partners feel heard."

## Dashboard Overview (1 minute)

### Landing on Dashboard
1. **Open the app** - Navigate to http://localhost:3000
2. **Auto-login as demo couple** - "Alex & Jordan have been together for 3 years"
3. **Point out key metrics:**
   - Weekly streak counter (showing consistency)
   - Last check-in date
   - Total check-ins completed
   - Relationship milestones

### Activity Feed
- "Recent activities show both partners' engagement"
- "Color-coded entries distinguish between partners"
- "Quick access to recent notes and discussions"

### Quick Actions Bar
- **Start Check-in** - Primary CTA for weekly sessions
- **Add Note** - Quick thoughts between check-ins
- **View Growth** - Long-term relationship progress

## Check-in Flow Demo (3-4 minutes)

### 1. Starting a Check-in
- Click "Start Check-in" from dashboard
- "Check-ins are designed to take 15-20 minutes"
- Welcome screen sets positive tone

### 2. Category Selection
- **Show default categories:**
  - Communication (How we talk and listen)
  - Quality Time (Time together and apart)
  - Intimacy (Physical and emotional closeness)
  - Growth (Personal and relationship development)
  - Finances (Money matters and planning)
  - Conflict (Handling disagreements)
- "Partners can add custom categories for their specific needs"
- Select 2-3 categories for demo

### 3. Category Discussion
For each selected category:
- **Guided prompts** appear to facilitate discussion
- **Dual note-taking system:**
  - Private notes (personal reflections)
  - Shared notes (joint observations)
- "Privacy toggle ensures safe space for honest thoughts"
- Demonstrate adding both types of notes
- Show auto-save functionality

### 4. Mood & Energy Check
- "Quick emotional temperature check"
- Select current mood (5-point scale with emojis)
- Energy level assessment
- "Helps track emotional patterns over time"

### 5. Action Items
- "Convert discussions into concrete steps"
- Add 2-3 action items with assignments
- Set due dates
- "Accountability without nagging"

### 6. Completion Celebration
- Confetti animation
- Streak update
- "Positive reinforcement for maintaining the habit"

## Notes Management (1 minute)

### Navigate to Notes Section
- **Filter options:**
  - All notes
  - Private only
  - Shared only
  - By category
  - By date range
- **Privacy indicators** clearly shown
- **Search functionality** for finding past discussions

### Creating a Quick Note
- "Capture thoughts between check-ins"
- Show privacy selector
- Category tagging
- "Notes automatically linked to relevant check-ins"

## Growth Gallery (1 minute)

### Timeline View
- **Visual relationship journey**
- Milestones with photos
- "First date, moving in together, anniversaries"
- Progress indicators between milestones

### Adding a Milestone
- Click "Add Milestone"
- Upload photo (or use emoji)
- Add description
- "Celebrate wins together"

## Settings & Customization (30 seconds)

### Key Settings
- **Check-in reminders** (day and time)
- **Custom categories** creation
- **Privacy preferences**
- **Theme selection** (light/dark mode)
- **Data export** option

### Demo Reset Function
- "For presentations and testing"
- One-click restore to initial demo state
- Located in Settings > Developer Options

## Mobile Experience (1 minute)

### Responsive Design
- "Fully optimized for mobile devices"
- Show on phone/tablet if available
- **Touch-optimized interactions:**
  - Swipe gestures in check-ins
  - Touch feedback on buttons
  - Bottom navigation for easy thumb reach

### Mobile-Specific Features
- **Haptic feedback** on important actions
- **Pull-to-refresh** on dashboard
- **Offline capability** with local storage
- "Check in anywhere, anytime"

## Key Benefits Recap (30 seconds)

1. **Structure** - "Guided conversations prevent missed topics"
2. **Privacy** - "Safe space for honest reflection"
3. **Accountability** - "Action items create follow-through"
4. **Progress Tracking** - "See relationship growth over time"
5. **Habit Building** - "Streaks encourage consistency"

## Q&A Talking Points

### Common Questions:

**Q: How long do check-ins take?**
A: "Typically 15-20 minutes. The structure makes them efficient."

**Q: What about sensitive topics?**
A: "Private notes allow processing before sharing. The app creates a non-confrontational environment."

**Q: Can we customize categories?**
A: "Yes, fully customizable to match your relationship needs."

**Q: Is our data secure?**
A: "Currently uses local storage. Cloud sync with encryption planned for future release."

**Q: How often should we check in?**
A: "Weekly is recommended, but adjustable to your schedule."

## Technical Demo Points (for developer audience)

### Architecture Highlights
- **Next.js 14+ with App Router**
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Local Storage** for persistence
- **Framer Motion** for animations

### Performance Features
- **Static generation** where possible
- **Optimistic updates** for better UX
- **Lazy loading** of components
- **Mobile-first responsive design**

### Accessibility
- **WCAG 2.1 AA compliant**
- **Keyboard navigation** fully supported
- **Screen reader optimized**
- **High contrast mode** available

## Demo Reset Instructions

To reset the demo for next presentation:
1. Go to Settings (gear icon)
2. Scroll to "Demo Controls"  
3. Click "Reset Demo Data"
4. Confirm reset
5. App returns to initial demo state

## Closing
"QC makes relationship maintenance as routine as brushing your teeth - a small daily investment that prevents major problems down the road. It's not therapy, it's preventive care for your relationship."

---

## Quick Demo Checklist
- [ ] Clear browser cache if needed
- [ ] Reset demo data before starting
- [ ] Have both mobile and desktop views ready
- [ ] Test internet connection
- [ ] Prepare example action items
- [ ] Have backup screenshots ready
- [ ] Practice 5-minute and 10-minute versions

## Time Variations
- **2-minute pitch**: Intro → Check-in flow highlights → Benefits
- **5-minute demo**: Full check-in flow → Notes → Growth Gallery
- **10-minute deep dive**: Complete walkthrough with Q&A
- **Technical demo**: Add architecture and code highlights