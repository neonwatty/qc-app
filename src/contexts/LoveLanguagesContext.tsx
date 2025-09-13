'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { LoveLanguage, LoveAction, LoveLanguageDiscovery } from '@/types'
import { loadFromStorage, saveToStorage } from '@/lib/storage'

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

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = loadFromStorage<{
      languages?: LoveLanguage[]
      partnerLanguages?: LoveLanguage[]
      actions?: LoveAction[]
      discoveries?: LoveLanguageDiscovery[]
    }>(STORAGE_KEY)
    if (savedData) {
      dispatch({ type: 'SET_LANGUAGES', payload: savedData.languages || [] })
      dispatch({ type: 'SET_PARTNER_LANGUAGES', payload: savedData.partnerLanguages || [] })
      dispatch({ type: 'SET_ACTIONS', payload: savedData.actions || [] })
      dispatch({ type: 'SET_DISCOVERIES', payload: savedData.discoveries || [] })
    } else {
      // Initialize with demo data if no saved data
      loadDemoData()
    }
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (state.languages.length > 0 || state.actions.length > 0) {
      saveToStorage(STORAGE_KEY, {
        languages: state.languages,
        partnerLanguages: state.partnerLanguages,
        actions: state.actions,
        discoveries: state.discoveries,
      })
    }
  }, [state.languages, state.partnerLanguages, state.actions, state.discoveries])

  const addLanguage = (language: Omit<LoveLanguage, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLanguage: LoveLanguage = {
      ...language,
      id: `lang-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    dispatch({ type: 'ADD_LANGUAGE', payload: newLanguage })
  }

  const updateLanguage = (id: string, updates: Partial<LoveLanguage>) => {
    dispatch({ type: 'UPDATE_LANGUAGE', payload: { id, updates } })
  }

  const deleteLanguage = (id: string) => {
    dispatch({ type: 'DELETE_LANGUAGE', payload: id })
  }

  const toggleLanguagePrivacy = (id: string) => {
    const language = state.languages.find(l => l.id === id)
    if (language) {
      const newPrivacy = language.privacy === 'private' ? 'shared' : 'private'
      dispatch({ type: 'UPDATE_LANGUAGE', payload: { id, updates: { privacy: newPrivacy } } })
    }
  }

  const addAction = (action: Omit<LoveAction, 'id' | 'createdAt' | 'updatedAt' | 'completedCount'>) => {
    const newAction: LoveAction = {
      ...action,
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      completedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    dispatch({ type: 'ADD_ACTION', payload: newAction })
  }

  const updateAction = (id: string, updates: Partial<LoveAction>) => {
    dispatch({ type: 'UPDATE_ACTION', payload: { id, updates } })
  }

  const deleteAction = (id: string) => {
    dispatch({ type: 'DELETE_ACTION', payload: id })
  }

  const completeAction = (id: string) => {
    dispatch({ type: 'COMPLETE_ACTION', payload: id })
  }

  const addDiscovery = (discovery: string) => {
    const newDiscovery: LoveLanguageDiscovery = {
      id: `disc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: 'jeremy',
      discovery,
      createdAt: new Date(),
    }
    dispatch({ type: 'ADD_DISCOVERY', payload: newDiscovery })
  }

  const convertDiscoveryToLanguage = (
    discoveryId: string,
    language: Omit<LoveLanguage, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newLanguage: LoveLanguage = {
      ...language,
      id: `lang-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    dispatch({ type: 'ADD_LANGUAGE', payload: newLanguage })
    dispatch({ type: 'CONVERT_DISCOVERY', payload: { discoveryId, languageId: newLanguage.id } })
  }

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