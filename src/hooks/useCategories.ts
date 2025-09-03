'use client'

import { useState, useCallback, useEffect } from 'react'
import { Category } from '@/types'
import { v4 as uuidv4 } from 'uuid'

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'intimacy',
    name: 'Intimacy & Romance',
    icon: '💕',
    description: 'Discuss physical connection, romance, and emotional closeness',
    prompts: [
      'What made you feel most connected to me this week?',
      'What\'s one romantic gesture you\'d appreciate?',
      'How can we create more intimate moments together?'
    ],
    isCustom: false,
    order: 0
  },
  {
    id: 'communication',
    name: 'Communication',
    icon: '💬',
    description: 'Share thoughts on how we express ourselves and listen to each other',
    prompts: [
      'When did you feel most heard this week?',
      'What communication pattern should we work on?',
      'How can I better support you when you\'re stressed?'
    ],
    isCustom: false,
    order: 1
  },
  {
    id: 'support',
    name: 'Support & Care',
    icon: '🤗',
    description: 'Talk about emotional support, care, and being there for each other',
    prompts: [
      'What support did you need but didn\'t ask for?',
      'How can I show up better for you?',
      'What made you feel cared for recently?'
    ],
    isCustom: false,
    order: 2
  },
  {
    id: 'goals',
    name: 'Goals & Future',
    icon: '🎯',
    description: 'Align on shared dreams, goals, and future plans',
    prompts: [
      'What goal are you most excited about?',
      'How can we better support each other\'s dreams?',
      'What\'s one thing we should plan together?'
    ],
    isCustom: false,
    order: 3
  },
  {
    id: 'gratitude',
    name: 'Gratitude',
    icon: '🙏',
    description: 'Express appreciation and recognize positive moments',
    prompts: [
      'What are you most grateful for about us?',
      'What small gesture meant a lot to you?',
      'How has our relationship helped you grow?'
    ],
    isCustom: false,
    order: 4
  },
  {
    id: 'conflict',
    name: 'Conflict Resolution',
    icon: '🌉',
    description: 'Address disagreements and find solutions together',
    prompts: [
      'What conflict pattern should we address?',
      'How can we disagree more constructively?',
      'What trigger should I be more aware of?'
    ],
    isCustom: false,
    order: 5
  }
]

const AVAILABLE_ICONS = ['❤️', '💚', '💙', '💜', '💛', '🧡', '💖', '💝', '💗', '💘', '💟', '✨', '🌟', '⭐', '🌈', '🌺', '🌻', '🌹', '🎨', '🎭', '🎪', '🎯', '🎲', '🎮', '🎵', '🎶', '🎸', '📚', '📝', '💡', '🔮', '🔥', '💎', '🏆', '🎁', '🎉', '🎊', '🚀', '✈️', '🗺️', '🏝️', '🏔️', '🌅', '🌄', '🌠', '🌙', '☀️', '⛅', '🍀', '🌳', '🌲']

const AVAILABLE_COLORS = {
  pink: 'pink',
  blue: 'blue',
  purple: 'purple',
  green: 'green',
  yellow: 'yellow',
  orange: 'orange',
  red: 'red',
  indigo: 'indigo',
  gray: 'gray'
}

export interface CategoryWithColor extends Category {
  color?: string
}

export function useCategories() {
  const [categories, setCategories] = useState<CategoryWithColor[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load categories from localStorage on mount
  useEffect(() => {
    const loadCategories = () => {
      try {
        const stored = localStorage.getItem('qc_categories')
        if (stored) {
          const parsed = JSON.parse(stored) as CategoryWithColor[]
          // Ensure all default categories exist and maintain order
          const categoriesMap = new Map(parsed.map((c: CategoryWithColor) => [c.id, c]))
          const merged = DEFAULT_CATEGORIES.map(defaultCat => {
            const existing = categoriesMap.get(defaultCat.id)
            if (existing) {
              categoriesMap.delete(defaultCat.id)
              return { ...defaultCat, ...existing, order: existing.order ?? defaultCat.order }
            }
            return defaultCat
          })
          // Add custom categories
          const customCategories = Array.from(categoriesMap.values()).filter((c: CategoryWithColor) => c.isCustom)
          setCategories([...merged, ...customCategories].sort((a: CategoryWithColor, b: CategoryWithColor) => a.order - b.order))
        } else {
          setCategories(DEFAULT_CATEGORIES)
        }
      } catch (error) {
        console.error('Error loading categories:', error)
        setCategories(DEFAULT_CATEGORIES)
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [])

  // Save to localStorage whenever categories change
  useEffect(() => {
    if (!isLoading && categories.length > 0) {
      localStorage.setItem('qc_categories', JSON.stringify(categories))
    }
  }, [categories, isLoading])

  const addCategory = useCallback((category: Omit<CategoryWithColor, 'id' | 'order'>) => {
    const newCategory: CategoryWithColor = {
      ...category,
      id: uuidv4(),
      order: categories.length,
      isCustom: true
    }
    setCategories(prev => [...prev, newCategory])
    return newCategory
  }, [categories.length])

  const updateCategory = useCallback((id: string, updates: Partial<CategoryWithColor>) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ))
  }, [])

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => {
      const filtered = prev.filter(cat => cat.id !== id)
      // Reorder remaining categories
      return filtered.map((cat, index) => ({ ...cat, order: index }))
    })
  }, [])

  const reorderCategories = useCallback((startIndex: number, endIndex: number) => {
    setCategories(prev => {
      const result = Array.from(prev)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      
      // Update order property
      return result.map((cat, index) => ({ ...cat, order: index }))
    })
  }, [])

  const resetToDefaults = useCallback(() => {
    setCategories(DEFAULT_CATEGORIES)
  }, [])

  const getCategoryById = useCallback((id: string) => {
    return categories.find(cat => cat.id === id)
  }, [categories])

  const addPromptToCategory = useCallback((categoryId: string, prompt: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, prompts: [...cat.prompts, prompt] }
        : cat
    ))
  }, [])

  const removePromptFromCategory = useCallback((categoryId: string, promptIndex: number) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, prompts: cat.prompts.filter((_, i) => i !== promptIndex) }
        : cat
    ))
  }, [])

  const updatePromptInCategory = useCallback((categoryId: string, promptIndex: number, newPrompt: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { 
            ...cat, 
            prompts: cat.prompts.map((p, i) => i === promptIndex ? newPrompt : p)
          }
        : cat
    ))
  }, [])

  return {
    categories,
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    resetToDefaults,
    getCategoryById,
    addPromptToCategory,
    removePromptFromCategory,
    updatePromptInCategory,
    availableIcons: AVAILABLE_ICONS,
    availableColors: AVAILABLE_COLORS,
    defaultCategories: DEFAULT_CATEGORIES
  }
}