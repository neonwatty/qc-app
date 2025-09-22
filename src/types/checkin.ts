import { CheckIn, Note, ActionItem, Category } from './index'

export type CheckInStep = 
  | 'welcome'
  | 'category-selection'
  | 'category-discussion'
  | 'reflection'
  | 'action-items'
  | 'completion'

export type CheckInProgress = {
  currentStep: CheckInStep
  completedSteps: CheckInStep[]
  totalSteps: number
  percentage: number
}

export type CategoryProgress = {
  categoryId: string
  isCompleted: boolean
  notes: Note[]
  timeSpent: number
  lastUpdated: Date
}

export type CheckInSession = {
  id: string
  baseCheckIn: CheckIn
  progress: CheckInProgress
  selectedCategories: string[]
  categoryProgress: CategoryProgress[]
  draftNotes: Note[]
  startedAt: Date
  lastSavedAt: Date
  estimatedTimeRemaining?: number
}

export type CheckInAction =
  | { type: 'START_CHECKIN'; payload: { categories: string[]; checkIn?: CheckIn } }
  | { type: 'GO_TO_STEP'; payload: { step: CheckInStep } }
  | { type: 'COMPLETE_STEP'; payload: { step: CheckInStep } }
  | { type: 'SET_CATEGORY_PROGRESS'; payload: { categoryId: string; progress: Partial<CategoryProgress> } }
  | { type: 'ADD_DRAFT_NOTE'; payload: { note: Note } }
  | { type: 'UPDATE_DRAFT_NOTE'; payload: { noteId: string; updates: Partial<Note> } }
  | { type: 'REMOVE_DRAFT_NOTE'; payload: { noteId: string } }
  | { type: 'ADD_ACTION_ITEM'; payload: { actionItem: ActionItem } }
  | { type: 'UPDATE_ACTION_ITEM'; payload: { actionItemId: string; updates: Partial<ActionItem> } }
  | { type: 'REMOVE_ACTION_ITEM'; payload: { actionItemId: string } }
  | { type: 'TOGGLE_ACTION_ITEM'; payload: { actionItemId: string } }
  | { type: 'SAVE_SESSION' }
  | { type: 'COMPLETE_CHECKIN' }
  | { type: 'ABANDON_CHECKIN' }
  | { type: 'RESTORE_SESSION'; payload: { session: CheckInSession } }
  | { type: 'SYNC_FROM_PARTNER'; payload: { updates: any } }
  | { type: 'SET_ERROR'; payload: { error: string } }
  | { type: 'SET_LOADING'; payload: { loading: boolean } }
  | { type: 'SET_PARTNER_CONNECTED'; payload: { connected: boolean } }
  | { type: 'ROLLBACK_CHANGE'; payload: { change: any } }

export type CheckInContextState = {
  session: CheckInSession | null
  isLoading: boolean
  error: string | null
  pendingChanges?: any[]
  partnerConnected?: boolean
}

export type CheckInContextValue = CheckInContextState & {
  dispatch: (action: CheckInAction) => void
  startCheckIn: (categories: string[]) => void
  goToStep: (step: CheckInStep) => void
  completeStep: (step: CheckInStep) => void
  updateCategoryProgress: (categoryId: string, progress: Partial<CategoryProgress>) => void
  addDraftNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateDraftNote: (noteId: string, updates: Partial<Note>) => void
  removeDraftNote: (noteId: string) => void
  addActionItem: (actionItem: Omit<ActionItem, 'id' | 'createdAt' | 'checkInId'>) => void
  updateActionItem: (actionItemId: string, updates: Partial<ActionItem>) => void
  removeActionItem: (actionItemId: string) => void
  toggleActionItem: (actionItemId: string) => void
  saveSession: () => void
  completeCheckIn: () => void
  abandonCheckIn: () => void
  canGoToStep: (step: CheckInStep) => boolean
  getStepIndex: (step: CheckInStep) => number
  isStepCompleted: (step: CheckInStep) => boolean
  getCurrentCategoryProgress: () => CategoryProgress | undefined
}