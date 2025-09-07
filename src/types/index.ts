export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  partnerId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  icon: string
  description: string
  prompts: string[]
  isCustom: boolean
  order: number
}

export interface PromptTemplate {
  id: string
  title: string
  description: string
  prompts: string[]
  categoryId?: string
  tags: string[]
  isSystem: boolean
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

export interface CustomPrompt {
  id: string
  content: string
  categoryId: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Note {
  id: string
  content: string
  privacy: 'private' | 'shared' | 'draft'
  authorId: string
  categoryId?: string
  checkInId?: string
  createdAt: Date
  updatedAt: Date
  tags?: string[]
}

export interface ActionItem {
  id: string
  title: string
  description?: string
  assignedTo?: string
  dueDate?: Date
  completed: boolean
  checkInId: string
  createdAt: Date
  completedAt?: Date
}

export type ReminderCategory = 'habit' | 'check-in' | 'action-item' | 'special-date' | 'custom'
export type ReminderFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'custom'
export type NotificationChannel = 'in-app' | 'push' | 'both' | 'none'

export interface Reminder {
  id: string
  title: string
  message: string
  category: ReminderCategory
  frequency: ReminderFrequency
  scheduledFor: Date
  notificationChannel: NotificationChannel
  createdBy: string
  assignedTo?: string
  isActive: boolean
  isSnoozed: boolean
  snoozeUntil?: Date
  completedAt?: Date
  lastNotifiedAt?: Date
  relatedCheckInId?: string
  relatedActionItemId?: string
  customSchedule?: {
    daysOfWeek?: number[]
    time?: string
    dates?: Date[]
  }
  createdAt: Date
  updatedAt: Date
}

export interface CheckIn {
  id: string
  coupleId: string
  participants: string[]
  startedAt: Date
  completedAt?: Date
  status: 'in-progress' | 'completed' | 'abandoned'
  categories: string[]
  notes: Note[]
  actionItems: ActionItem[]
  mood?: {
    before: number
    after?: number
  }
  reflection?: string
  sessionSettingsId?: string
  timeouts?: {
    [userId: string]: {
      used: number
      remaining: number
    }
  }
  extensions?: number
}

export interface Milestone {
  id: string
  title: string
  description: string
  achievedAt: Date
  icon: string
  category: 'communication' | 'trust' | 'growth' | 'celebration' | 'consistency' | 'goals' | 'connection'
  coupleId: string
  achieved?: boolean
  points?: number
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
  progress?: number
  targetDate?: Date
  data?: any
}

export interface SessionSettings {
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

export interface SessionSettingsProposal {
  id: string
  proposedBy: string
  proposedAt: Date
  settings: Partial<SessionSettings>
  status: 'pending' | 'accepted' | 'rejected'
  reviewedBy?: string
  reviewedAt?: Date
}

export type SessionTemplate = 'quick' | 'standard' | 'deep-dive' | 'custom'

export interface SessionSettingsTemplate {
  name: string
  type: SessionTemplate
  description: string
  settings: Omit<SessionSettings, 'id' | 'coupleId' | 'agreedAt' | 'agreedBy' | 'version'>
}

export interface Couple {
  id: string
  name: string
  partners: User[]
  createdAt: Date
  settings: {
    checkInFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
    reminderTime?: string
    categories: Category[]
    theme?: 'light' | 'dark' | 'system'
    sessionSettings?: SessionSettings
    pendingSessionProposal?: SessionSettingsProposal
  }
  stats?: {
    totalCheckIns: number
    currentStreak: number
    lastCheckIn?: Date
  }
}

export interface AppState {
  currentUser: User | null
  currentCouple: Couple | null
  activeCheckIn: CheckIn | null
  isLoading: boolean
  error: string | null
}