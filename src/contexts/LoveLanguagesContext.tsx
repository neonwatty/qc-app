'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react'
import { LoveLanguage, LoveAction, LoveLanguageDiscovery } from '@/types'
import { loveLanguagesService } from '@/services/love-languages.service'

interface LoveLanguagesState {
  languages: LoveLanguage[]
  partnerLanguages: LoveLanguage[]
  actions: LoveAction[]
  discoveries: LoveLanguageDiscovery[]
  isLoading: boolean
  error: string | null
}

type LoveLanguagesAction =
  | { type: 'SET_LANGUAGES'; payload: LoveLanguage[] }
  | { type: 'SET_PARTNER_LANGUAGES'; payload: LoveLanguage[] }
  | { type: 'SET_ACTIONS'; payload: LoveAction[] }
  | { type: 'SET_DISCOVERIES'; payload: LoveLanguageDiscovery[] }
  | { type: 'ADD_LANGUAGE'; payload: LoveLanguage }
  | { type: 'UPDATE_LANGUAGE'; payload: { id: string; updates: Partial<LoveLanguage> } }
  | { type: 'DELETE_LANGUAGE'; payload: string }
  | { type: 'ADD_ACTION'; payload: LoveAction }
  | { type: 'UPDATE_ACTION'; payload: { id: string; updates: Partial<LoveAction> } }
  | { type: 'DELETE_ACTION'; payload: string }
  | { type: 'COMPLETE_ACTION'; payload: string }
  | { type: 'ADD_DISCOVERY'; payload: LoveLanguageDiscovery }
  | { type: 'CONVERT_DISCOVERY'; payload: { discoveryId: string; languageId: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' }

const initialState: LoveLanguagesState = {
  languages: [],
  partnerLanguages: [],
  actions: [],
  discoveries: [],
  isLoading: false,
  error: null,
}

function loveLanguagesReducer(state: LoveLanguagesState, action: LoveLanguagesAction): LoveLanguagesState {
  switch (action.type) {
    case 'SET_LANGUAGES':
      return { ...state, languages: action.payload }
    
    case 'SET_PARTNER_LANGUAGES':
      return { ...state, partnerLanguages: action.payload }
    
    case 'SET_ACTIONS':
      return { ...state, actions: action.payload }
    
    case 'SET_DISCOVERIES':
      return { ...state, discoveries: action.payload }
    
    case 'ADD_LANGUAGE':
      return { ...state, languages: [...state.languages, action.payload] }
    
    case 'UPDATE_LANGUAGE':
      return {
        ...state,
        languages: state.languages.map(lang =>
          lang.id === action.payload.id
            ? { ...lang, ...action.payload.updates, updatedAt: new Date() }
            : lang
        ),
      }
    
    case 'DELETE_LANGUAGE':
      return {
        ...state,
        languages: state.languages.filter(lang => lang.id !== action.payload),
        actions: state.actions.filter(act => act.linkedLanguageId !== action.payload),
      }
    
    case 'ADD_ACTION':
      return { ...state, actions: [...state.actions, action.payload] }
    
    case 'UPDATE_ACTION':
      return {
        ...state,
        actions: state.actions.map(act =>
          act.id === action.payload.id
            ? { ...act, ...action.payload.updates, updatedAt: new Date() }
            : act
        ),
      }
    
    case 'DELETE_ACTION':
      return {
        ...state,
        actions: state.actions.filter(act => act.id !== action.payload),
      }
    
    case 'COMPLETE_ACTION':
      return {
        ...state,
        actions: state.actions.map(act =>
          act.id === action.payload
            ? {
                ...act,
                status: 'completed' as const,
                completedCount: act.completedCount + 1,
                lastCompletedAt: new Date(),
                updatedAt: new Date(),
              }
            : act
        ),
      }
    
    case 'ADD_DISCOVERY':
      return { ...state, discoveries: [...state.discoveries, action.payload] }
    
    case 'CONVERT_DISCOVERY':
      return {
        ...state,
        discoveries: state.discoveries.map(disc =>
          disc.id === action.payload.discoveryId
            ? { ...disc, convertedToLanguageId: action.payload.languageId }
            : disc
        ),
      }
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'RESET':
      return initialState
    
    default:
      return state
  }
}

interface LoveLanguagesContextType extends LoveLanguagesState {
  addLanguage: (language: Omit<LoveLanguage, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateLanguage: (id: string, updates: Partial<LoveLanguage>) => void
  deleteLanguage: (id: string) => void
  toggleLanguagePrivacy: (id: string) => void
  addAction: (action: Omit<LoveAction, 'id' | 'createdAt' | 'updatedAt' | 'completedCount'>) => void
  updateAction: (id: string, updates: Partial<LoveAction>) => void
  deleteAction: (id: string) => void
  completeAction: (id: string) => void
  addDiscovery: (discovery: string) => void
  convertDiscoveryToLanguage: (discoveryId: string, language: Omit<LoveLanguage, 'id' | 'createdAt' | 'updatedAt'>) => void
  loadDemoData: () => void
}

const LoveLanguagesContext = createContext<LoveLanguagesContextType | undefined>(undefined)

const STORAGE_KEY = 'qc-love-languages'

export function LoveLanguagesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(loveLanguagesReducer, initialState)

  // Load data from API on mount
  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        const [languages, partnerLanguages, actions, discoveries] = await Promise.all([
          loveLanguagesService.getLanguages(),
          loveLanguagesService.getPartnerLanguages(),
          loveLanguagesService.getActions(),
          loveLanguagesService.getDiscoveries()
        ])

        if (languages.length === 0 && actions.length === 0) {
          // Initialize with demo data if no saved data
          loadDemoData()
        } else {
          dispatch({ type: 'SET_LANGUAGES', payload: languages })
          dispatch({ type: 'SET_PARTNER_LANGUAGES', payload: partnerLanguages })
          dispatch({ type: 'SET_ACTIONS', payload: actions })
          dispatch({ type: 'SET_DISCOVERIES', payload: discoveries })
        }
      } catch (error) {
        console.error('Failed to load love languages data:', error)
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' })
        // Fallback to demo data on error
        loadDemoData()
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    loadData()
  }, [])

  // API operations are handled within each action function, no need for auto-save

  const addLanguage = useCallback(async (language: Omit<LoveLanguage, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const newLanguage = await loveLanguagesService.createLanguage({
        title: language.title,
        description: language.description,
        examples: language.examples,
        category: language.category,
        privacy: language.privacy,
        importance: language.importance,
        tags: language.tags
      })
      dispatch({ type: 'ADD_LANGUAGE', payload: newLanguage })
    } catch (error) {
      console.error('Failed to add language:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add language' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const updateLanguage = useCallback(async (id: string, updates: Partial<LoveLanguage>) => {
    try {
      const updatedLanguage = await loveLanguagesService.updateLanguage(id, updates)
      dispatch({ type: 'UPDATE_LANGUAGE', payload: { id, updates: updatedLanguage } })
    } catch (error) {
      console.error('Failed to update language:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update language' })
    }
  }, [])

  const deleteLanguage = useCallback(async (id: string) => {
    try {
      await loveLanguagesService.deleteLanguage(id)
      dispatch({ type: 'DELETE_LANGUAGE', payload: id })
    } catch (error) {
      console.error('Failed to delete language:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete language' })
    }
  }, [])

  const toggleLanguagePrivacy = (id: string) => {
    const language = state.languages.find(l => l.id === id)
    if (language) {
      const newPrivacy = language.privacy === 'private' ? 'shared' : 'private'
      dispatch({ type: 'UPDATE_LANGUAGE', payload: { id, updates: { privacy: newPrivacy } } })
    }
  }

  const addAction = useCallback(async (action: Omit<LoveAction, 'id' | 'createdAt' | 'updatedAt' | 'completedCount' | 'suggestedById' | 'linkedLanguageTitle' | 'createdBy'>) => {
    try {
      const newAction = await loveLanguagesService.createAction({
        title: action.title,
        description: action.description,
        linkedLanguageId: action.linkedLanguageId,
        suggestedBy: action.suggestedBy,
        frequency: action.frequency,
        difficulty: action.difficulty,
        forUserId: action.forUserId,
        plannedFor: action.plannedFor,
        notes: action.notes
      })
      dispatch({ type: 'ADD_ACTION', payload: newAction })
    } catch (error) {
      console.error('Failed to add action:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add action' })
    }
  }, [])

  const updateAction = useCallback(async (id: string, updates: Partial<LoveAction>) => {
    try {
      const updatedAction = await loveLanguagesService.updateAction(id, updates)
      dispatch({ type: 'UPDATE_ACTION', payload: { id, updates: updatedAction } })
    } catch (error) {
      console.error('Failed to update action:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update action' })
    }
  }, [])

  const deleteAction = useCallback(async (id: string) => {
    try {
      await loveLanguagesService.deleteAction(id)
      dispatch({ type: 'DELETE_ACTION', payload: id })
    } catch (error) {
      console.error('Failed to delete action:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete action' })
    }
  }, [])

  const completeAction = useCallback(async (id: string) => {
    try {
      const completedAction = await loveLanguagesService.completeAction(id)
      dispatch({ type: 'UPDATE_ACTION', payload: { id, updates: completedAction } })
    } catch (error) {
      console.error('Failed to complete action:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to complete action' })
    }
  }, [])

  const addDiscovery = useCallback(async (discovery: string, checkInId?: string) => {
    try {
      const newDiscovery = await loveLanguagesService.createDiscovery({
        discovery,
        checkInId
      })
      dispatch({ type: 'ADD_DISCOVERY', payload: newDiscovery })
    } catch (error) {
      console.error('Failed to add discovery:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add discovery' })
    }
  }, [])

  const convertDiscoveryToLanguage = useCallback(async (
    discoveryId: string,
    language: Omit<LoveLanguage, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
  ) => {
    try {
      const newLanguage = await loveLanguagesService.createLanguage({
        title: language.title,
        description: language.description,
        examples: language.examples,
        category: language.category,
        privacy: language.privacy,
        importance: language.importance,
        tags: language.tags
      })
      await loveLanguagesService.convertDiscovery(discoveryId, newLanguage.id)
      dispatch({ type: 'ADD_LANGUAGE', payload: newLanguage })
      dispatch({ type: 'CONVERT_DISCOVERY', payload: { discoveryId, languageId: newLanguage.id } })
    } catch (error) {
      console.error('Failed to convert discovery:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to convert discovery' })
    }
  }, [])

  const loadDemoData = () => {
    // Jeremy's love languages
    const jeremyLanguages: LoveLanguage[] = [
      {
        id: 'lang-jeremy-1',
        userId: 'jeremy',
        title: 'Morning words of encouragement',
        description: 'I feel most loved when Deb tells me they believe in me, especially before a big day',
        examples: [
          'You\'re going to do amazing today',
          'I\'m so proud of how hard you\'re working',
          'You\'ve got this, and I\'m here for you',
        ],
        category: 'words',
        privacy: 'shared',
        importance: 'high',
        tags: ['morning', 'encouragement', 'support'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'lang-jeremy-2',
        userId: 'jeremy',
        title: 'Uninterrupted quality time',
        description: 'Phone-free evenings where we just focus on each other',
        examples: [
          'Evening walks without distractions',
          'Cooking dinner together',
          'Board game nights',
        ],
        category: 'time',
        privacy: 'shared',
        importance: 'essential',
        tags: ['quality-time', 'presence', 'attention'],
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
      },
      {
        id: 'lang-jeremy-3',
        userId: 'jeremy',
        title: 'Small thoughtful surprises',
        description: 'Little gifts that show you were thinking of me during your day',
        examples: [
          'My favorite coffee on a tough morning',
          'A book you think I\'d enjoy',
          'Flowers for no reason',
        ],
        category: 'gifts',
        privacy: 'private',
        importance: 'medium',
        tags: ['surprises', 'thoughtfulness'],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
      },
    ]

    // Deb's love languages (as partner languages for Jeremy)
    const debLanguages: LoveLanguage[] = [
      {
        id: 'lang-deb-1',
        userId: 'deb',
        title: 'Physical touch throughout the day',
        description: 'Random hugs, holding hands, or a kiss on the forehead mean everything',
        examples: [
          'Morning hug before coffee',
          'Holding hands while watching TV',
          'Surprise back rub after work',
        ],
        category: 'touch',
        privacy: 'shared',
        importance: 'high',
        tags: ['affection', 'physical', 'connection'],
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18'),
      },
      {
        id: 'lang-deb-2',
        userId: 'deb',
        title: 'Help with daily tasks',
        description: 'Taking something off my plate when I\'m overwhelmed',
        examples: [
          'Doing the dishes when it\'s my turn',
          'Picking up groceries without being asked',
          'Handling a phone call I\'m dreading',
        ],
        category: 'acts',
        privacy: 'shared',
        importance: 'essential',
        tags: ['support', 'help', 'partnership'],
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-01-25'),
      },
    ]

    // Demo love actions
    const demoActions: LoveAction[] = [
      {
        id: 'action-1',
        title: 'Leave a loving note in their lunch',
        description: 'Write a short encouraging message and slip it into their work bag',
        linkedLanguageId: 'lang-deb-1',
        linkedLanguageTitle: 'Physical touch throughout the day',
        suggestedBy: 'partner',
        suggestedById: 'deb',
        status: 'planned',
        frequency: 'weekly',
        completedCount: 3,
        lastCompletedAt: new Date('2024-02-28'),
        difficulty: 'easy',
        forUserId: 'deb',
        createdBy: 'jeremy',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-28'),
      },
      {
        id: 'action-2',
        title: 'Plan a phone-free dinner date',
        description: 'Reserve a table at their favorite restaurant and keep phones in the car',
        linkedLanguageId: 'lang-jeremy-2',
        linkedLanguageTitle: 'Uninterrupted quality time',
        suggestedBy: 'self',
        status: 'completed',
        frequency: 'monthly',
        completedCount: 1,
        lastCompletedAt: new Date('2024-02-25'),
        plannedFor: new Date('2024-03-15'),
        difficulty: 'moderate',
        forUserId: 'jeremy',
        createdBy: 'deb',
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-25'),
      },
      {
        id: 'action-3',
        title: 'Morning coffee surprise',
        description: 'Bring their favorite coffee order to them in bed',
        linkedLanguageId: 'lang-jeremy-3',
        linkedLanguageTitle: 'Small thoughtful surprises',
        suggestedBy: 'ai',
        status: 'recurring',
        frequency: 'weekly',
        completedCount: 8,
        lastCompletedAt: new Date('2024-03-01'),
        difficulty: 'easy',
        forUserId: 'jeremy',
        createdBy: 'deb',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-03-01'),
      },
    ]

    dispatch({ type: 'SET_LANGUAGES', payload: jeremyLanguages })
    dispatch({ type: 'SET_PARTNER_LANGUAGES', payload: debLanguages })
    dispatch({ type: 'SET_ACTIONS', payload: demoActions })
  }

  const value: LoveLanguagesContextType = {
    ...state,
    addLanguage,
    updateLanguage,
    deleteLanguage,
    toggleLanguagePrivacy,
    addAction,
    updateAction,
    deleteAction,
    completeAction,
    addDiscovery,
    convertDiscoveryToLanguage,
    loadDemoData,
  }

  return <LoveLanguagesContext.Provider value={value}>{children}</LoveLanguagesContext.Provider>
}

export function useLoveLanguages() {
  const context = useContext(LoveLanguagesContext)
  if (context === undefined) {
    throw new Error('useLoveLanguages must be used within a LoveLanguagesProvider')
  }
  return context
}