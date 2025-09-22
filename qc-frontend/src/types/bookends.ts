// Session Bookends Types - Pre-session preparation and post-session reflection

export interface PreparationTopic {
  id: string
  content: string
  authorId: string
  priority?: number
  isQuickTopic: boolean
  createdAt: Date
}

export interface SessionPreparation {
  id: string
  sessionId?: string
  myTopics: PreparationTopic[]
  partnerTopics: PreparationTopic[] // Mock data in POC
  createdAt: Date
  updatedAt: Date
}

export interface QuickReflection {
  id: string
  sessionId: string
  authorId: string
  feelingBefore: number // 1-5 scale
  feelingAfter: number // 1-5 scale
  gratitude: string
  keyTakeaway: string
  shareWithPartner: boolean
  createdAt: Date
}

export interface BookendsState {
  preparation: SessionPreparation | null
  reflection: QuickReflection | null
  partnerReflection: QuickReflection | null // Mock in POC
  isPreparationModalOpen: boolean
  isReflectionModalOpen: boolean
  hasSeenPrepReminder: boolean
  reflectionStreak: number
}

// Quick topic templates
export const QUICK_TOPICS = [
  { id: 'wins', label: 'Weekly wins & challenges', icon: '🏆' },
  { id: 'emotional', label: 'Emotional check-in', icon: '💭' },
  { id: 'plans', label: 'Upcoming plans', icon: '📅' },
  { id: 'appreciation', label: 'Appreciation moment', icon: '🙏' },
  { id: 'concern', label: 'Something on my mind', icon: '💬' },
  { id: 'goals', label: 'Our shared goals', icon: '🎯' },
]

// Emoji scale for feelings
export const FEELING_EMOJIS = [
  { value: 1, emoji: '😔', label: 'Struggling' },
  { value: 2, emoji: '😕', label: 'Concerned' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '😍', label: 'Great' },
]

// Mock partner topic templates
export const PARTNER_TOPIC_TEMPLATES = [
  "How we handled last week's conflict",
  'Planning for the upcoming holiday',
  'Budget review and financial goals',
  'Family visit preparations',
  'Work-life balance check',
  'Intimacy and connection',
  'Household responsibilities',
  'Future dreams and aspirations',
]
