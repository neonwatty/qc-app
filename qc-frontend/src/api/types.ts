/**
 * API-specific types and interfaces for service layer
 * These types extend and complement the main application types
 */

// Pagination types
export interface PaginationParams {
  page?: number
  perPage?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export interface PaginationMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

// API Response wrapper types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
  code?: string
  status?: number
}

// Filter types for various resources
export interface BaseFilter extends PaginationParams {
  search?: string
  startDate?: Date | string
  endDate?: Date | string
}

export interface CheckInFilter extends BaseFilter {
  status?: 'in-progress' | 'completed' | 'abandoned'
  participantId?: string
  categoryId?: string
}

export interface NoteFilter extends BaseFilter {
  privacy?: 'private' | 'shared' | 'draft'
  authorId?: string
  categoryId?: string
  checkInId?: string
  tags?: string[]
}

export interface ActionItemFilter extends BaseFilter {
  assignedTo?: string
  completed?: boolean
  overdue?: boolean
  dueDate?: Date | string
  checkInId?: string
}

export interface MilestoneFilter extends BaseFilter {
  achieved?: boolean
  category?: string
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface ReminderFilter extends BaseFilter {
  category?: string
  frequency?: string
  isActive?: boolean
  assignedTo?: string
  createdBy?: string
}

export interface LoveLanguageFilter extends BaseFilter {
  userId?: string
  category?: string
  privacy?: 'private' | 'shared'
  importance?: 'low' | 'medium' | 'high' | 'essential'
}

// Request types for creating/updating resources
export interface CreateCheckInRequest {
  coupleId: string
  categories?: string[]
  sessionSettingsId?: string
}

export interface UpdateCheckInRequest {
  status?: 'in-progress' | 'completed' | 'abandoned'
  categories?: string[]
  mood?: {
    before?: number
    after?: number
  }
  reflection?: string
}

export interface CreateNoteRequest {
  content: string
  privacy: 'private' | 'shared' | 'draft'
  authorId: string
  categoryId?: string
  checkInId?: string
  tags?: string[]
}

export interface UpdateNoteRequest {
  content?: string
  privacy?: 'private' | 'shared' | 'draft'
  categoryId?: string
  tags?: string[]
}

export interface CreateActionItemRequest {
  title: string
  description?: string
  assignedTo?: string
  dueDate?: Date | string
  checkInId: string
}

export interface UpdateActionItemRequest {
  title?: string
  description?: string
  assignedTo?: string
  dueDate?: Date | string
  completed?: boolean
  completedAt?: Date | string
}

export interface CreateMilestoneRequest {
  title: string
  description: string
  icon: string
  category: string
  coupleId: string
  targetDate?: Date | string
  points?: number
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface UpdateMilestoneRequest {
  title?: string
  description?: string
  achievedAt?: Date | string
  achieved?: boolean
  progress?: number
}

export interface CreateCategoryRequest {
  name: string
  icon: string
  description: string
  prompts?: string[]
  order?: number
}

export interface UpdateCategoryRequest {
  name?: string
  icon?: string
  description?: string
  prompts?: string[]
  order?: number
  isActive?: boolean
}

export interface CreateReminderRequest {
  title: string
  message: string
  category: string
  frequency: string
  scheduledFor: Date | string
  notificationChannel: 'in-app' | 'push' | 'both' | 'none'
  assignedTo?: string
  relatedCheckInId?: string
  relatedActionItemId?: string
}

export interface UpdateReminderRequest {
  title?: string
  message?: string
  scheduledFor?: Date | string
  isActive?: boolean
  isSnoozed?: boolean
  snoozeUntil?: Date | string
}

export interface CreateSessionSettingsRequest {
  sessionDuration: number
  timeoutsPerPartner: number
  timeoutDuration: number
  turnBasedMode: boolean
  turnDuration?: number
  allowExtensions: boolean
  pauseNotifications: boolean
  autoSaveDrafts: boolean
  warmUpQuestions: boolean
  coolDownTime: number
}

export type UpdateSessionSettingsRequest = Partial<CreateSessionSettingsRequest>

export interface CreateLoveLanguageRequest {
  title: string
  description: string
  examples: string[]
  category: string
  privacy: 'private' | 'shared'
  importance: 'low' | 'medium' | 'high' | 'essential'
  tags?: string[]
}

export interface UpdateLoveLanguageRequest {
  title?: string
  description?: string
  examples?: string[]
  privacy?: 'private' | 'shared'
  importance?: 'low' | 'medium' | 'high' | 'essential'
  tags?: string[]
}

export interface CreateLoveActionRequest {
  title: string
  description: string
  linkedLanguageId: string
  forUserId: string
  difficulty: 'easy' | 'moderate' | 'challenging'
  frequency?: 'once' | 'weekly' | 'monthly' | 'surprise'
  plannedFor?: Date | string
  notes?: string
}

export interface UpdateLoveActionRequest {
  title?: string
  description?: string
  status?: 'suggested' | 'planned' | 'completed' | 'recurring'
  plannedFor?: Date | string
  completedCount?: number
  lastCompletedAt?: Date | string
  notes?: string
}

// WebSocket/Real-time types
export interface RealtimeEvent<T = unknown> {
  type: string
  payload: T
  timestamp: Date
  userId?: string
}

export interface PresenceUpdate {
  userId: string
  status: 'online' | 'offline' | 'idle' | 'away'
  lastSeenAt?: Date
}

export interface TypingIndicator {
  userId: string
  isTyping: boolean
  context?: 'note' | 'chat' | 'checkin'
}

// Statistics types
export interface CoupleStatistics {
  totalCheckIns: number
  currentStreak: number
  longestStreak: number
  totalNotes: number
  sharedNotes: number
  privateNotes: number
  completedActionItems: number
  totalActionItems: number
  achievedMilestones: number
  upcomingReminders: number
  lastCheckInDate?: Date
  nextSuggestedCheckIn?: Date
}

export interface CheckInStatistics {
  averageDuration: number
  averageMoodImprovement: number
  mostDiscussedCategories: Array<{
    categoryId: string
    categoryName: string
    count: number
  }>
  completionRate: number
  abandonmentRate: number
}

// Batch operation types
export interface BatchUpdateRequest<T> {
  ids: string[]
  updates: T
}

export interface BatchDeleteRequest {
  ids: string[]
}

export interface BatchOperationResult {
  succeeded: string[]
  failed: Array<{
    id: string
    error: string
  }>
  total: number
}

// Export/Import types
export interface ExportDataRequest {
  resources: Array<'checkIns' | 'notes' | 'actionItems' | 'milestones' | 'reminders'>
  format: 'json' | 'csv' | 'pdf'
  dateRange?: {
    start: Date | string
    end: Date | string
  }
}

export interface ImportDataRequest {
  format: 'json' | 'csv'
  data: string | object
  overwrite?: boolean
}

// Notification types
export interface NotificationPreferences {
  checkInReminders: boolean
  actionItemDueDates: boolean
  milestoneAchievements: boolean
  partnerRequests: boolean
  systemUpdates: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  quietHours?: {
    enabled: boolean
    start: string // "HH:MM"
    end: string // "HH:MM"
  }
}

// Analytics types
export interface AnalyticsEvent {
  category: string
  action: string
  label?: string
  value?: number
  metadata?: Record<string, unknown>
}

export interface UserActivity {
  userId: string
  lastActiveAt: Date
  totalSessions: number
  averageSessionDuration: number
  mostActiveTime: string // "HH:MM"
  preferredDevice: 'mobile' | 'tablet' | 'desktop'
}