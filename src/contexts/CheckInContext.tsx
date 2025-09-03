'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { 
  CheckInContextValue, 
  CheckInContextState, 
  CheckInAction, 
  CheckInSession, 
  CheckInStep,
  CheckInProgress,
  CategoryProgress
} from '@/types/checkin'
import { CheckIn, Note, ActionItem } from '@/types'
import { storage } from '@/lib/storage'

const STEPS: CheckInStep[] = [
  'welcome',
  'category-selection',
  'category-discussion',
  'reflection',
  'action-items',
  'completion'
]

const STORAGE_KEY = 'qc_checkin_session'

function calculateProgress(completedSteps: CheckInStep[]): CheckInProgress['percentage'] {
  return Math.round((completedSteps.length / STEPS.length) * 100)
}

function createInitialSession(categories: string[]): CheckInSession {
  const now = new Date()
  const baseCheckIn: CheckIn = {
    id: `checkin_${Date.now()}`,
    coupleId: 'demo-couple',
    participants: ['demo-user-1', 'demo-user-2'],
    startedAt: now,
    status: 'in-progress',
    categories,
    notes: [],
    actionItems: []
  }

  const categoryProgress: CategoryProgress[] = categories.map(categoryId => ({
    categoryId,
    isCompleted: false,
    notes: [],
    timeSpent: 0,
    lastUpdated: now
  }))

  return {
    id: baseCheckIn.id,
    baseCheckIn,
    progress: {
      currentStep: 'welcome',
      completedSteps: [],
      totalSteps: STEPS.length,
      percentage: 0
    },
    selectedCategories: categories,
    categoryProgress,
    draftNotes: [],
    startedAt: now,
    lastSavedAt: now
  }
}

function checkInReducer(state: CheckInContextState, action: CheckInAction): CheckInContextState {
  switch (action.type) {
    case 'START_CHECKIN': {
      const session = createInitialSession(action.payload.categories)
      return {
        ...state,
        session,
        isLoading: false,
        error: null
      }
    }

    case 'GO_TO_STEP': {
      if (!state.session) return state
      
      const newSession: CheckInSession = {
        ...state.session,
        progress: {
          ...state.session.progress,
          currentStep: action.payload.step
        },
        lastSavedAt: new Date()
      }

      return {
        ...state,
        session: newSession
      }
    }

    case 'COMPLETE_STEP': {
      if (!state.session) return state

      const { step } = action.payload
      const completedSteps = [...state.session.progress.completedSteps]
      
      if (!completedSteps.includes(step)) {
        completedSteps.push(step)
      }

      const currentStepIndex = STEPS.indexOf(state.session.progress.currentStep)
      const nextStep = STEPS[currentStepIndex + 1] || state.session.progress.currentStep

      const newSession: CheckInSession = {
        ...state.session,
        progress: {
          ...state.session.progress,
          completedSteps,
          currentStep: nextStep,
          percentage: calculateProgress(completedSteps)
        },
        lastSavedAt: new Date()
      }

      return {
        ...state,
        session: newSession
      }
    }

    case 'SET_CATEGORY_PROGRESS': {
      if (!state.session) return state

      const { categoryId, progress } = action.payload
      const updatedCategoryProgress = state.session.categoryProgress.map(cp =>
        cp.categoryId === categoryId
          ? { ...cp, ...progress, lastUpdated: new Date() }
          : cp
      )

      const newSession: CheckInSession = {
        ...state.session,
        categoryProgress: updatedCategoryProgress,
        lastSavedAt: new Date()
      }

      return {
        ...state,
        session: newSession
      }
    }

    case 'ADD_DRAFT_NOTE': {
      if (!state.session) return state

      const newNote: Note = {
        ...action.payload.note,
        id: `note_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const newSession: CheckInSession = {
        ...state.session,
        draftNotes: [...state.session.draftNotes, newNote],
        lastSavedAt: new Date()
      }

      return {
        ...state,
        session: newSession
      }
    }

    case 'UPDATE_DRAFT_NOTE': {
      if (!state.session) return state

      const { noteId, updates } = action.payload
      const updatedDraftNotes = state.session.draftNotes.map(note =>
        note.id === noteId
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      )

      const newSession: CheckInSession = {
        ...state.session,
        draftNotes: updatedDraftNotes,
        lastSavedAt: new Date()
      }

      return {
        ...state,
        session: newSession
      }
    }

    case 'REMOVE_DRAFT_NOTE': {
      if (!state.session) return state

      const newSession: CheckInSession = {
        ...state.session,
        draftNotes: state.session.draftNotes.filter(note => note.id !== action.payload.noteId),
        lastSavedAt: new Date()
      }

      return {
        ...state,
        session: newSession
      }
    }

    case 'ADD_ACTION_ITEM': {
      if (!state.session) return state

      const newActionItem: ActionItem = {
        ...action.payload.actionItem,
        id: `action_${Date.now()}`,
        createdAt: new Date(),
        checkInId: state.session.baseCheckIn.id
      }

      const newSession: CheckInSession = {
        ...state.session,
        baseCheckIn: {
          ...state.session.baseCheckIn,
          actionItems: [...state.session.baseCheckIn.actionItems, newActionItem]
        },
        lastSavedAt: new Date()
      }

      return {
        ...state,
        session: newSession
      }
    }

    case 'UPDATE_ACTION_ITEM': {
      if (!state.session) return state

      const { actionItemId, updates } = action.payload
      const updatedActionItems = state.session.baseCheckIn.actionItems.map(item =>
        item.id === actionItemId
          ? { ...item, ...updates }
          : item
      )

      const newSession: CheckInSession = {
        ...state.session,
        baseCheckIn: {
          ...state.session.baseCheckIn,
          actionItems: updatedActionItems
        },
        lastSavedAt: new Date()
      }

      return {
        ...state,
        session: newSession
      }
    }

    case 'REMOVE_ACTION_ITEM': {
      if (!state.session) return state

      const newSession: CheckInSession = {
        ...state.session,
        baseCheckIn: {
          ...state.session.baseCheckIn,
          actionItems: state.session.baseCheckIn.actionItems.filter(
            item => item.id !== action.payload.actionItemId
          )
        },
        lastSavedAt: new Date()
      }

      return {
        ...state,
        session: newSession
      }
    }

    case 'TOGGLE_ACTION_ITEM': {
      if (!state.session) return state

      const updatedActionItems = state.session.baseCheckIn.actionItems.map(item =>
        item.id === action.payload.actionItemId
          ? { 
              ...item, 
              completed: !item.completed,
              completedAt: !item.completed ? new Date() : undefined
            }
          : item
      )

      const newSession: CheckInSession = {
        ...state.session,
        baseCheckIn: {
          ...state.session.baseCheckIn,
          actionItems: updatedActionItems
        },
        lastSavedAt: new Date()
      }

      return {
        ...state,
        session: newSession
      }
    }

    case 'SAVE_SESSION': {
      if (!state.session) return state

      return {
        ...state,
        session: {
          ...state.session,
          lastSavedAt: new Date()
        }
      }
    }

    case 'COMPLETE_CHECKIN': {
      if (!state.session) return state

      const completedCheckIn: CheckIn = {
        ...state.session.baseCheckIn,
        completedAt: new Date(),
        status: 'completed',
        notes: [...state.session.baseCheckIn.notes, ...state.session.draftNotes]
      }

      storage.saveCheckIn(completedCheckIn)
      storage.setActiveCheckIn(null)

      return {
        ...state,
        session: null
      }
    }

    case 'ABANDON_CHECKIN': {
      if (!state.session) return state

      const abandonedCheckIn: CheckIn = {
        ...state.session.baseCheckIn,
        completedAt: new Date(),
        status: 'abandoned'
      }

      storage.saveCheckIn(abandonedCheckIn)
      storage.setActiveCheckIn(null)

      return {
        ...state,
        session: null
      }
    }

    case 'RESTORE_SESSION': {
      return {
        ...state,
        session: action.payload.session,
        isLoading: false,
        error: null
      }
    }

    default:
      return state
  }
}

const CheckInContext = createContext<CheckInContextValue | null>(null)

export function CheckInProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(checkInReducer, {
    session: null,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    const savedSession = localStorage.getItem(STORAGE_KEY)
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        dispatch({ type: 'RESTORE_SESSION', payload: { session } })
      } catch (error) {
        console.error('Failed to restore check-in session:', error)
        dispatch({ type: 'ABANDON_CHECKIN' })
      }
    } else {
      dispatch({ type: 'SAVE_SESSION' })
    }
  }, [])

  useEffect(() => {
    if (state.session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [state.session])

  const startCheckIn = useCallback((categories: string[]) => {
    dispatch({ type: 'START_CHECKIN', payload: { categories } })
  }, [])

  const goToStep = useCallback((step: CheckInStep) => {
    dispatch({ type: 'GO_TO_STEP', payload: { step } })
  }, [])

  const completeStep = useCallback((step: CheckInStep) => {
    dispatch({ type: 'COMPLETE_STEP', payload: { step } })
  }, [])

  const updateCategoryProgress = useCallback((categoryId: string, progress: Partial<CategoryProgress>) => {
    dispatch({ type: 'SET_CATEGORY_PROGRESS', payload: { categoryId, progress } })
  }, [])

  const addDraftNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    dispatch({ type: 'ADD_DRAFT_NOTE', payload: { note: note as Note } })
  }, [])

  const updateDraftNote = useCallback((noteId: string, updates: Partial<Note>) => {
    dispatch({ type: 'UPDATE_DRAFT_NOTE', payload: { noteId, updates } })
  }, [])

  const removeDraftNote = useCallback((noteId: string) => {
    dispatch({ type: 'REMOVE_DRAFT_NOTE', payload: { noteId } })
  }, [])

  const addActionItem = useCallback((actionItem: Omit<ActionItem, 'id' | 'createdAt' | 'checkInId'>) => {
    dispatch({ type: 'ADD_ACTION_ITEM', payload: { actionItem: actionItem as ActionItem } })
  }, [])

  const updateActionItem = useCallback((actionItemId: string, updates: Partial<ActionItem>) => {
    dispatch({ type: 'UPDATE_ACTION_ITEM', payload: { actionItemId, updates } })
  }, [])

  const removeActionItem = useCallback((actionItemId: string) => {
    dispatch({ type: 'REMOVE_ACTION_ITEM', payload: { actionItemId } })
  }, [])

  const toggleActionItem = useCallback((actionItemId: string) => {
    dispatch({ type: 'TOGGLE_ACTION_ITEM', payload: { actionItemId } })
  }, [])

  const saveSession = useCallback(() => {
    dispatch({ type: 'SAVE_SESSION' })
  }, [])

  const completeCheckIn = useCallback(() => {
    dispatch({ type: 'COMPLETE_CHECKIN' })
  }, [])

  const abandonCheckIn = useCallback(() => {
    dispatch({ type: 'ABANDON_CHECKIN' })
  }, [])

  const canGoToStep = useCallback((step: CheckInStep) => {
    if (!state.session) return false
    
    const stepIndex = STEPS.indexOf(step)
    const currentIndex = STEPS.indexOf(state.session.progress.currentStep)
    
    return stepIndex <= currentIndex + 1
  }, [state.session])

  const getStepIndex = useCallback((step: CheckInStep) => {
    return STEPS.indexOf(step)
  }, [])

  const isStepCompleted = useCallback((step: CheckInStep) => {
    if (!state.session) return false
    return state.session.progress.completedSteps.includes(step)
  }, [state.session])

  const getCurrentCategoryProgress = useCallback(() => {
    if (!state.session || state.session.progress.currentStep !== 'category-discussion') {
      return undefined
    }
    
    return state.session.categoryProgress.find(cp => !cp.isCompleted)
  }, [state.session])

  const contextValue: CheckInContextValue = {
    ...state,
    dispatch,
    startCheckIn,
    goToStep,
    completeStep,
    updateCategoryProgress,
    addDraftNote,
    updateDraftNote,
    removeDraftNote,
    addActionItem,
    updateActionItem,
    removeActionItem,
    toggleActionItem,
    saveSession,
    completeCheckIn,
    abandonCheckIn,
    canGoToStep,
    getStepIndex,
    isStepCompleted,
    getCurrentCategoryProgress
  }

  return (
    <CheckInContext.Provider value={contextValue}>
      {children}
    </CheckInContext.Provider>
  )
}

export function useCheckInContext(): CheckInContextValue {
  const context = useContext(CheckInContext)
  if (!context) {
    throw new Error('useCheckInContext must be used within a CheckInProvider')
  }
  return context
}