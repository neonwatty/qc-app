'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import {
  BookendsState,
  SessionPreparation,
  QuickReflection,
  PreparationTopic,
  PARTNER_TOPIC_TEMPLATES
} from '@/types/bookends'
import { toast } from 'sonner'
import { bookendsService } from '@/services/bookends.service'

const STORAGE_KEY = 'qc_session_bookends'

interface BookendsContextValue extends BookendsState {
  // Preparation actions
  addMyTopic: (content: string, isQuickTopic?: boolean) => void
  removeMyTopic: (topicId: string) => void
  reorderMyTopics: (topics: PreparationTopic[]) => void
  clearPreparation: () => void
  openPreparationModal: () => void
  closePreparationModal: () => void
  
  // Reflection actions
  saveReflection: (reflection: Omit<QuickReflection, 'id' | 'createdAt'>) => void
  openReflectionModal: () => void
  closeReflectionModal: () => void
  
  // Mock partner actions (for POC)
  simulatePartnerTopics: () => void
  simulatePartnerReflection: (sessionId: string) => void
}

type BookendsAction = 
  | { type: 'ADD_MY_TOPIC'; payload: { content: string; isQuickTopic: boolean } }
  | { type: 'REMOVE_MY_TOPIC'; payload: { topicId: string } }
  | { type: 'REORDER_MY_TOPICS'; payload: { topics: PreparationTopic[] } }
  | { type: 'SET_PARTNER_TOPICS'; payload: { topics: PreparationTopic[] } }
  | { type: 'CLEAR_PREPARATION' }
  | { type: 'SAVE_REFLECTION'; payload: QuickReflection }
  | { type: 'SET_PARTNER_REFLECTION'; payload: QuickReflection }
  | { type: 'OPEN_PREPARATION_MODAL' }
  | { type: 'CLOSE_PREPARATION_MODAL' }
  | { type: 'OPEN_REFLECTION_MODAL' }
  | { type: 'CLOSE_REFLECTION_MODAL' }
  | { type: 'MARK_PREP_REMINDER_SEEN' }
  | { type: 'INCREMENT_REFLECTION_STREAK' }
  | { type: 'LOAD_STATE'; payload: Partial<BookendsState> }

const initialState: BookendsState = {
  preparation: null,
  reflection: null,
  partnerReflection: null,
  isPreparationModalOpen: false,
  isReflectionModalOpen: false,
  hasSeenPrepReminder: false,
  reflectionStreak: 0
}

function bookEndsReducer(state: BookendsState, action: BookendsAction): BookendsState {
  switch (action.type) {
    case 'ADD_MY_TOPIC': {
      const newTopic: PreparationTopic = {
        id: `topic_${Date.now()}`,
        content: action.payload.content,
        authorId: 'demo-user-1',
        isQuickTopic: action.payload.isQuickTopic,
        priority: state.preparation?.myTopics.length || 0,
        createdAt: new Date()
      }

      const preparation = state.preparation || {
        id: `prep_${Date.now()}`,
        myTopics: [],
        partnerTopics: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      return {
        ...state,
        preparation: {
          ...preparation,
          myTopics: [...preparation.myTopics, newTopic],
          updatedAt: new Date()
        }
      }
    }

    case 'REMOVE_MY_TOPIC': {
      if (!state.preparation) return state
      
      return {
        ...state,
        preparation: {
          ...state.preparation,
          myTopics: state.preparation.myTopics.filter(t => t.id !== action.payload.topicId),
          updatedAt: new Date()
        }
      }
    }

    case 'REORDER_MY_TOPICS': {
      if (!state.preparation) return state
      
      return {
        ...state,
        preparation: {
          ...state.preparation,
          myTopics: action.payload.topics,
          updatedAt: new Date()
        }
      }
    }

    case 'SET_PARTNER_TOPICS': {
      const preparation = state.preparation || {
        id: `prep_${Date.now()}`,
        myTopics: [],
        partnerTopics: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      return {
        ...state,
        preparation: {
          ...preparation,
          partnerTopics: action.payload.topics,
          updatedAt: new Date()
        }
      }
    }

    case 'CLEAR_PREPARATION':
      return {
        ...state,
        preparation: null
      }

    case 'SAVE_REFLECTION':
      return {
        ...state,
        reflection: action.payload,
        reflectionStreak: state.reflectionStreak + 1
      }

    case 'SET_PARTNER_REFLECTION':
      return {
        ...state,
        partnerReflection: action.payload
      }

    case 'OPEN_PREPARATION_MODAL':
      return { ...state, isPreparationModalOpen: true }

    case 'CLOSE_PREPARATION_MODAL':
      return { ...state, isPreparationModalOpen: false }

    case 'OPEN_REFLECTION_MODAL':
      return { ...state, isReflectionModalOpen: true }

    case 'CLOSE_REFLECTION_MODAL':
      return { ...state, isReflectionModalOpen: false }

    case 'MARK_PREP_REMINDER_SEEN':
      return { ...state, hasSeenPrepReminder: true }

    case 'INCREMENT_REFLECTION_STREAK':
      return { ...state, reflectionStreak: state.reflectionStreak + 1 }

    case 'LOAD_STATE':
      return { ...state, ...action.payload }

    default:
      return state
  }
}

const BookendsContext = createContext<BookendsContextValue | null>(null)

export function BookendsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(bookEndsReducer, initialState)

  // Load from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [preparation, partnerPrep, reflections] = await Promise.all([
          bookendsService.getPreparation(),
          bookendsService.getPartnerPreparation(),
          bookendsService.getReflections()
        ])

        const currentReflection = reflections.length > 0 ? reflections[0] : null
        const partnerReflection = preparation && partnerPrep && preparation.sessionId ?
          await bookendsService.getPartnerReflection(preparation.sessionId) : null

        dispatch({ type: 'LOAD_STATE', payload: {
          preparation: preparation || null,
          reflection: currentReflection,
          partnerReflection,
          reflectionStreak: reflections.length
        }})
      } catch (error) {
        console.error('Failed to load bookends data:', error)
      }
    }

    loadData()
  }, [])

  // API operations are handled within each action function, no need for auto-save

  const addMyTopic = useCallback(async (content: string, isQuickTopic = false) => {
    try {
      const topic = await bookendsService.addTopic({ content, isQuickTopic })
      dispatch({ type: 'ADD_MY_TOPIC', payload: { content, isQuickTopic } })
      toast.success('Topic added')
    } catch (error) {
      console.error('Failed to add topic:', error)
      toast.error('Failed to add topic')
    }
  }, [])

  const removeMyTopic = useCallback(async (topicId: string) => {
    try {
      await bookendsService.removeTopic(topicId)
      dispatch({ type: 'REMOVE_MY_TOPIC', payload: { topicId } })
    } catch (error) {
      console.error('Failed to remove topic:', error)
      toast.error('Failed to remove topic')
    }
  }, [])

  const reorderMyTopics = useCallback(async (topics: PreparationTopic[]) => {
    try {
      await bookendsService.reorderTopics(topics)
      dispatch({ type: 'REORDER_MY_TOPICS', payload: { topics } })
    } catch (error) {
      console.error('Failed to reorder topics:', error)
      toast.error('Failed to reorder topics')
    }
  }, [])

  const clearPreparation = useCallback(async () => {
    try {
      await bookendsService.clearPreparation()
      dispatch({ type: 'CLEAR_PREPARATION' })
    } catch (error) {
      console.error('Failed to clear preparation:', error)
      toast.error('Failed to clear preparation')
    }
  }, [])

  const openPreparationModal = useCallback(() => {
    dispatch({ type: 'OPEN_PREPARATION_MODAL' })
  }, [])

  const closePreparationModal = useCallback(() => {
    dispatch({ type: 'CLOSE_PREPARATION_MODAL' })
  }, [])

  const saveReflection = useCallback(async (reflection: Omit<QuickReflection, 'id' | 'createdAt'>) => {
    try {
      const savedReflection = await bookendsService.saveReflection({
        sessionId: reflection.sessionId,
        mood: reflection.feelingAfter > reflection.feelingBefore ? 'better' :
              reflection.feelingAfter < reflection.feelingBefore ? 'worse' : 'same',
        highlight: reflection.keyTakeaway,
        gratitude: reflection.gratitude
      })
      dispatch({ type: 'SAVE_REFLECTION', payload: savedReflection })
      toast.success('Reflection saved')
    } catch (error) {
      console.error('Failed to save reflection:', error)
      toast.error('Failed to save reflection')
    }
  }, [])

  const openReflectionModal = useCallback(() => {
    dispatch({ type: 'OPEN_REFLECTION_MODAL' })
  }, [])

  const closeReflectionModal = useCallback(() => {
    dispatch({ type: 'CLOSE_REFLECTION_MODAL' })
  }, [])

  // Mock partner actions for POC
  const simulatePartnerTopics = useCallback(async () => {
    // Simulate partner adding topics with a delay
    setTimeout(() => {
      const randomTopics = PARTNER_TOPIC_TEMPLATES
        .sort(() => Math.random() - 0.5)
        .slice(0, 2 + Math.floor(Math.random() * 2))
        .map((content, index) => ({
          id: `partner_topic_${Date.now()}_${index}`,
          content,
          authorId: 'demo-user-2',
          isQuickTopic: false,
          priority: index,
          createdAt: new Date()
        }))

      dispatch({ type: 'SET_PARTNER_TOPICS', payload: { topics: randomTopics } })
      toast('Jordan added topics for discussion', {
        icon: '👥',
        duration: 4000
      })
    }, 3000 + Math.random() * 2000) // 3-5 second delay
  }, [])

  const simulatePartnerReflection = useCallback(async (sessionId: string) => {
    // Simulate partner completing reflection
    setTimeout(() => {
      const mockReflection: QuickReflection = {
        id: `partner_reflection_${Date.now()}`,
        sessionId,
        authorId: 'demo-user-2',
        feelingBefore: 3,
        feelingAfter: 5,
        gratitude: "I appreciated how you listened without judgment when I shared my concerns about work.",
        keyTakeaway: "We need to make more time for these check-ins - they really help us stay connected.",
        shareWithPartner: true,
        createdAt: new Date()
      }

      dispatch({ type: 'SET_PARTNER_REFLECTION', payload: mockReflection })
      toast('Jordan shared their reflection with you', {
        icon: '💭',
        duration: 4000
      })
    }, 2000 + Math.random() * 3000) // 2-5 second delay
  }, [])

  const value: BookendsContextValue = {
    ...state,
    addMyTopic,
    removeMyTopic,
    reorderMyTopics,
    clearPreparation,
    openPreparationModal,
    closePreparationModal,
    saveReflection,
    openReflectionModal,
    closeReflectionModal,
    simulatePartnerTopics,
    simulatePartnerReflection
  }

  return (
    <BookendsContext.Provider value={value}>
      {children}
    </BookendsContext.Provider>
  )
}

export function useBookends() {
  const context = useContext(BookendsContext)
  if (!context) {
    throw new Error('useBookends must be used within BookendsProvider')
  }
  return context
}