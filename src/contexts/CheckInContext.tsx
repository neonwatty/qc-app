'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react'
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
import { checkInService } from '@/services/checkin.service'
import { webSocketService, type WebSocketMessage } from '@/services/websocket.service'
import { useAuth } from '@/hooks/useAuth'

const STEPS: CheckInStep[] = [
  'welcome',
  'category-selection',
  'category-discussion',
  'reflection',
  'action-items',
  'completion'
]

const STORAGE_KEY = 'qc_checkin_session'
const SYNC_INTERVAL = 30000 // Sync every 30 seconds

function calculateProgress(completedSteps: CheckInStep[]): CheckInProgress['percentage'] {
  return Math.round((completedSteps.length / STEPS.length) * 100)
}

function createInitialSession(categories: string[], checkIn?: CheckIn): CheckInSession {
  const now = new Date()
  const baseCheckIn: CheckIn = checkIn || {
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

// Enhanced reducer with optimistic updates
function checkInReducer(state: CheckInContextState, action: CheckInAction): CheckInContextState {
  switch (action.type) {
    case 'START_CHECKIN': {
      const session = createInitialSession(action.payload.categories, action.payload.checkIn)
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
        session: newSession,
        pendingChanges: [...(state.pendingChanges || []), { type: 'progress', data: newSession.progress }]
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
        session: newSession,
        pendingChanges: [...(state.pendingChanges || []), { type: 'progress', data: newSession.progress }]
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
        session: newSession,
        pendingChanges: [...(state.pendingChanges || []), { type: 'categoryProgress', data: { categoryId, progress } }]
      }
    }

    case 'ADD_DRAFT_NOTE': {
      if (!state.session) return state

      const newNote: Note = {
        ...action.payload.note,
        id: action.payload.note.id || `note_${Date.now()}`,
        createdAt: action.payload.note.createdAt || new Date(),
        updatedAt: new Date()
      }

      const newSession: CheckInSession = {
        ...state.session,
        draftNotes: [...state.session.draftNotes, newNote],
        lastSavedAt: new Date()
      }

      return {
        ...state,
        session: newSession,
        pendingChanges: [...(state.pendingChanges || []), { type: 'note_added', data: newNote }]
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
        session: newSession,
        pendingChanges: [...(state.pendingChanges || []), { type: 'note_updated', data: { noteId, updates } }]
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
        session: newSession,
        pendingChanges: [...(state.pendingChanges || []), { type: 'note_removed', data: action.payload.noteId }]
      }
    }

    case 'ADD_ACTION_ITEM': {
      if (!state.session) return state

      const newActionItem: ActionItem = {
        ...action.payload.actionItem,
        id: action.payload.actionItem.id || `action_${Date.now()}`,
        createdAt: action.payload.actionItem.createdAt || new Date(),
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
        session: newSession,
        pendingChanges: [...(state.pendingChanges || []), { type: 'action_item_added', data: newActionItem }]
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
        session: newSession,
        pendingChanges: [...(state.pendingChanges || []), { type: 'action_item_updated', data: { actionItemId, updates } }]
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
        session: newSession,
        pendingChanges: [...(state.pendingChanges || []), { type: 'action_item_removed', data: action.payload.actionItemId }]
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
        session: newSession,
        pendingChanges: [...(state.pendingChanges || []), { type: 'action_item_toggled', data: action.payload.actionItemId }]
      }
    }

    case 'SAVE_SESSION': {
      if (!state.session) return state

      return {
        ...state,
        session: {
          ...state.session,
          lastSavedAt: new Date()
        },
        pendingChanges: []
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
        session: null,
        pendingChanges: []
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
        session: null,
        pendingChanges: []
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

    case 'SYNC_FROM_PARTNER': {
      if (!state.session) return state

      // Merge partner updates with current session
      const mergedSession = {
        ...state.session,
        ...action.payload.updates,
        lastSavedAt: new Date()
      }

      return {
        ...state,
        session: mergedSession,
        partnerConnected: true
      }
    }

    case 'SET_ERROR': {
      return {
        ...state,
        error: action.payload.error,
        isLoading: false
      }
    }

    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload.loading
      }
    }

    case 'SET_PARTNER_CONNECTED': {
      return {
        ...state,
        partnerConnected: action.payload.connected
      }
    }

    case 'ROLLBACK_CHANGE': {
      // Remove the failed change from pending and restore previous state
      const pendingChanges = state.pendingChanges?.filter(c => c !== action.payload.change) || []

      return {
        ...state,
        pendingChanges,
        error: 'Failed to save change. Please try again.'
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
    error: null,
    pendingChanges: [],
    partnerConnected: false
  })

  const { user } = useAuth()
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null)
  const wsConnectedRef = useRef(false)

  // Load session from API or localStorage on mount
  useEffect(() => {
    const loadSession = async () => {
      if (!user) {
        dispatch({ type: 'SET_LOADING', payload: { loading: false } })
        return
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: { loading: true } })

        // Try to get current session from API
        const response = await checkInService.getCurrentSession(user.coupleId || 'demo-couple')

        if (response) {
          dispatch({ type: 'RESTORE_SESSION', payload: { session: response.session } })

          // Connect WebSocket for real-time sync
          connectWebSocket(response.session.id)
        } else {
          // Fall back to localStorage
          const savedSession = localStorage.getItem(STORAGE_KEY)
          if (savedSession) {
            try {
              const session = JSON.parse(savedSession)
              dispatch({ type: 'RESTORE_SESSION', payload: { session } })
            } catch (error) {
              console.error('Failed to restore session from localStorage:', error)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load session:', error)

        // Fall back to localStorage
        const savedSession = localStorage.getItem(STORAGE_KEY)
        if (savedSession) {
          try {
            const session = JSON.parse(savedSession)
            dispatch({ type: 'RESTORE_SESSION', payload: { session } })
          } catch (err) {
            console.error('Failed to restore session:', err)
          }
        }
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { loading: false } })
      }
    }

    loadSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Connect WebSocket for real-time synchronization
  const connectWebSocket = useCallback((sessionId: string) => {
    if (!user || wsConnectedRef.current) return

    webSocketService.connect(sessionId, user.id, {
      onConnect: () => {
        wsConnectedRef.current = true
        dispatch({ type: 'SET_PARTNER_CONNECTED', payload: { connected: true } })
      },
      onDisconnect: () => {
        wsConnectedRef.current = false
        dispatch({ type: 'SET_PARTNER_CONNECTED', payload: { connected: false } })
      },
      onMessage: handleWebSocketMessage,
      onError: (error) => {
        console.error('WebSocket error:', error)
        dispatch({ type: 'SET_ERROR', payload: { error: 'Connection error. Changes will be synced when connection is restored.' } })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    // Don't process our own messages
    if (message.userId === user?.id) return

    switch (message.type) {
      case 'session:progress':
        dispatch({ type: 'SYNC_FROM_PARTNER', payload: { updates: { progress: message.data } } })
        break
      case 'session:category_progress':
        dispatch({ type: 'SYNC_FROM_PARTNER', payload: { updates: { categoryProgress: message.data.progress } } })
        break
      case 'session:note_added':
        if (state.session) {
          const newSession = {
            ...state.session,
            draftNotes: [...state.session.draftNotes, message.data.note]
          }
          dispatch({ type: 'SYNC_FROM_PARTNER', payload: { updates: newSession } })
        }
        break
      case 'session:action_item_added':
        if (state.session) {
          const newSession = {
            ...state.session,
            baseCheckIn: {
              ...state.session.baseCheckIn,
              actionItems: [...state.session.baseCheckIn.actionItems, message.data.actionItem]
            }
          }
          dispatch({ type: 'SYNC_FROM_PARTNER', payload: { updates: newSession } })
        }
        break
      case 'partner:joined':
        dispatch({ type: 'SET_PARTNER_CONNECTED', payload: { connected: true } })
        break
      case 'partner:left':
        dispatch({ type: 'SET_PARTNER_CONNECTED', payload: { connected: false } })
        break
    }
  }, [user, state.session])

  // Periodic sync with API
  useEffect(() => {
    if (!state.session || !user) return

    const syncSession = async () => {
      try {
        await checkInService.saveSession(state.session!)
        dispatch({ type: 'SAVE_SESSION' })
      } catch (error) {
        console.error('Failed to sync session:', error)
      }
    }

    syncTimerRef.current = setInterval(syncSession, SYNC_INTERVAL)

    return () => {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current)
      }
    }
  }, [state.session, user])

  // Save to localStorage for offline support
  useEffect(() => {
    if (state.session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [state.session])

  // Enhanced action creators with API integration
  const startCheckIn = useCallback(async (categories: string[]) => {
    if (!user) return

    try {
      dispatch({ type: 'SET_LOADING', payload: { loading: true } })

      const response = await checkInService.createSession({
        coupleId: user.coupleId || 'demo-couple',
        categories
      })

      dispatch({ type: 'START_CHECKIN', payload: { categories, checkIn: response.checkIn } })

      // Connect WebSocket
      connectWebSocket(response.session.id)

      // Notify partner
      webSocketService.sendMessage({
        type: 'session:started',
        sessionId: response.session.id,
        userId: user.id,
        timestamp: new Date().toISOString(),
        data: { categories }
      })
    } catch (error) {
      console.error('Failed to start check-in:', error)
      // Fall back to local creation
      dispatch({ type: 'START_CHECKIN', payload: { categories } })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { loading: false } })
    }
  }, [user, connectWebSocket])

  const goToStep = useCallback(async (step: CheckInStep) => {
    dispatch({ type: 'GO_TO_STEP', payload: { step } })

    // Notify partner via WebSocket
    if (state.session && wsConnectedRef.current) {
      webSocketService.notifyProgressUpdate(step, state.session.progress.completedSteps)
    }

    // Sync with API (non-blocking)
    if (state.session) {
      checkInService.updateProgress(state.session.id, {
        currentStep: step,
        completedSteps: state.session.progress.completedSteps,
        percentage: state.session.progress.percentage
      }).catch(console.error)
    }
  }, [state.session])

  const completeStep = useCallback(async (step: CheckInStep) => {
    dispatch({ type: 'COMPLETE_STEP', payload: { step } })

    // Calculate new completed steps
    const completedSteps = state.session ? [...state.session.progress.completedSteps] : []
    if (!completedSteps.includes(step)) {
      completedSteps.push(step)
    }

    // Notify partner via WebSocket
    if (state.session && wsConnectedRef.current) {
      const currentStepIndex = STEPS.indexOf(state.session.progress.currentStep)
      const nextStep = STEPS[currentStepIndex + 1] || state.session.progress.currentStep
      webSocketService.notifyProgressUpdate(nextStep, completedSteps)
    }

    // Sync with API (non-blocking)
    if (state.session) {
      checkInService.updateProgress(state.session.id, {
        currentStep: state.session.progress.currentStep,
        completedSteps,
        percentage: calculateProgress(completedSteps)
      }).catch(console.error)
    }
  }, [state.session])

  const updateCategoryProgress = useCallback(async (categoryId: string, progress: Partial<CategoryProgress>) => {
    dispatch({ type: 'SET_CATEGORY_PROGRESS', payload: { categoryId, progress } })

    // Notify partner via WebSocket
    if (wsConnectedRef.current) {
      webSocketService.notifyCategoryProgressUpdate(categoryId, progress)
    }

    // Sync with API (non-blocking)
    if (state.session) {
      checkInService.updateCategoryProgress(state.session.id, {
        categoryId,
        progress
      }).catch(console.error)
    }
  }, [state.session])

  const addDraftNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const tempId = `temp_${Date.now()}`
    const tempNote = { ...note, id: tempId } as Note

    // Optimistic update
    dispatch({ type: 'ADD_DRAFT_NOTE', payload: { note: tempNote } })

    try {
      if (state.session) {
        const savedNote = await checkInService.addNote(state.session.id, {
          content: note.content,
          isPrivate: note.isPrivate || false,
          categoryId: note.categoryId,
          tags: note.tags
        })

        // Replace temp note with saved note
        dispatch({ type: 'UPDATE_DRAFT_NOTE', payload: { noteId: tempId, updates: savedNote } })

        // Notify partner via WebSocket
        if (wsConnectedRef.current && !note.isPrivate) {
          webSocketService.notifyNoteAdded(savedNote)
        }
      }
    } catch (error) {
      console.error('Failed to save note:', error)
      dispatch({ type: 'ROLLBACK_CHANGE', payload: { change: { type: 'note_added', data: tempNote } } })
    }
  }, [state.session])

  const updateDraftNote = useCallback(async (noteId: string, updates: Partial<Note>) => {
    dispatch({ type: 'UPDATE_DRAFT_NOTE', payload: { noteId, updates } })

    // Sync with API (non-blocking)
    if (state.session) {
      checkInService.updateNote(state.session.id, noteId, updates)
        .then(() => {
          // Notify partner via WebSocket
          if (wsConnectedRef.current && !updates.isPrivate) {
            webSocketService.notifyNoteUpdated(noteId, updates)
          }
        })
        .catch(console.error)
    }
  }, [state.session])

  const removeDraftNote = useCallback(async (noteId: string) => {
    dispatch({ type: 'REMOVE_DRAFT_NOTE', payload: { noteId } })

    // Sync with API (non-blocking)
    if (state.session) {
      checkInService.removeNote(state.session.id, noteId)
        .then(() => {
          // Notify partner via WebSocket
          if (wsConnectedRef.current) {
            webSocketService.notifyNoteRemoved(noteId)
          }
        })
        .catch(console.error)
    }
  }, [state.session])

  const addActionItem = useCallback(async (actionItem: Omit<ActionItem, 'id' | 'createdAt' | 'checkInId'>) => {
    const tempId = `temp_${Date.now()}`
    const tempItem = { ...actionItem, id: tempId } as ActionItem

    // Optimistic update
    dispatch({ type: 'ADD_ACTION_ITEM', payload: { actionItem: tempItem } })

    try {
      if (state.session) {
        const savedItem = await checkInService.addActionItem(state.session.id, {
          description: actionItem.description || actionItem.title || '',
          assignedTo: actionItem.assignedTo || '',
          dueDate: actionItem.dueDate,
          priority: actionItem.priority || 'medium'
        })

        // Replace temp item with saved item
        dispatch({ type: 'UPDATE_ACTION_ITEM', payload: { actionItemId: tempId, updates: savedItem } })

        // Notify partner via WebSocket
        if (wsConnectedRef.current) {
          webSocketService.notifyActionItemAdded(savedItem)
        }
      }
    } catch (error) {
      console.error('Failed to save action item:', error)
      dispatch({ type: 'ROLLBACK_CHANGE', payload: { change: { type: 'action_item_added', data: tempItem } } })
    }
  }, [state.session])

  const updateActionItem = useCallback(async (actionItemId: string, updates: Partial<ActionItem>) => {
    dispatch({ type: 'UPDATE_ACTION_ITEM', payload: { actionItemId, updates } })

    // Sync with API (non-blocking)
    if (state.session) {
      checkInService.updateActionItem(state.session.id, actionItemId, updates)
        .then(() => {
          // Notify partner via WebSocket
          if (wsConnectedRef.current) {
            webSocketService.notifyActionItemUpdated(actionItemId, updates)
          }
        })
        .catch(console.error)
    }
  }, [state.session])

  const removeActionItem = useCallback(async (actionItemId: string) => {
    dispatch({ type: 'REMOVE_ACTION_ITEM', payload: { actionItemId } })

    // Sync with API (non-blocking)
    if (state.session) {
      checkInService.removeActionItem(state.session.id, actionItemId)
        .then(() => {
          // Notify partner via WebSocket
          if (wsConnectedRef.current) {
            webSocketService.notifyActionItemRemoved(actionItemId)
          }
        })
        .catch(console.error)
    }
  }, [state.session])

  const toggleActionItem = useCallback((actionItemId: string) => {
    dispatch({ type: 'TOGGLE_ACTION_ITEM', payload: { actionItemId } })

    // Sync with API (non-blocking)
    if (state.session) {
      const item = state.session.baseCheckIn.actionItems.find(i => i.id === actionItemId)
      if (item) {
        checkInService.updateActionItem(state.session.id, actionItemId, {
          completed: !item.completed,
          completedAt: !item.completed ? new Date() : undefined
        }).catch(console.error)
      }
    }
  }, [state.session])

  const saveSession = useCallback(async () => {
    if (!state.session) return

    try {
      await checkInService.saveSession(state.session)
      dispatch({ type: 'SAVE_SESSION' })
    } catch (error) {
      console.error('Failed to save session:', error)
      dispatch({ type: 'SET_ERROR', payload: { error: 'Failed to save session' } })
    }
  }, [state.session])

  const completeCheckIn = useCallback(async () => {
    if (!state.session) return

    try {
      await checkInService.completeSession(state.session.id)

      // Notify partner via WebSocket
      if (wsConnectedRef.current) {
        webSocketService.notifySessionCompleted()
      }

      dispatch({ type: 'COMPLETE_CHECKIN' })

      // Disconnect WebSocket
      webSocketService.disconnect()
      wsConnectedRef.current = false
    } catch (error) {
      console.error('Failed to complete check-in:', error)
      // Still complete locally
      dispatch({ type: 'COMPLETE_CHECKIN' })
    }
  }, [state.session])

  const abandonCheckIn = useCallback(async () => {
    if (!state.session) return

    try {
      await checkInService.abandonSession(state.session.id)

      // Notify partner via WebSocket
      if (wsConnectedRef.current) {
        webSocketService.notifySessionAbandoned()
      }

      dispatch({ type: 'ABANDON_CHECKIN' })

      // Disconnect WebSocket
      webSocketService.disconnect()
      wsConnectedRef.current = false
    } catch (error) {
      console.error('Failed to abandon check-in:', error)
      // Still abandon locally
      dispatch({ type: 'ABANDON_CHECKIN' })
    }
  }, [state.session])

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsConnectedRef.current) {
        webSocketService.disconnect()
      }
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current)
      }
    }
  }, [])

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