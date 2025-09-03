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