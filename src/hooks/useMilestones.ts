'use client'

import { useState, useEffect, useCallback } from 'react'
import { Milestone } from '@/types'
import { mockMilestones } from '@/lib/mock-data'

export interface MilestoneInput {
  title: string
  description: string
  category: 'communication' | 'trust' | 'growth' | 'celebration' | 'consistency' | 'goals' | 'connection'
  icon: string
  photo?: string
  targetDate?: Date
  points?: number
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface UseMilestonesReturn {
  milestones: Milestone[]
  isLoading: boolean
  error: string | null
  createMilestone: (input: MilestoneInput) => Promise<Milestone>
  updateMilestone: (id: string, updates: Partial<Milestone>) => Promise<Milestone>
  deleteMilestone: (id: string) => Promise<void>
  achieveMilestone: (id: string) => Promise<Milestone>
  getMilestonesByCategory: (category: string) => Milestone[]
  getUpcomingMilestones: () => Milestone[]
  getAchievedMilestones: () => Milestone[]
  getRecentMilestones: (days: number) => Milestone[]
  calculateProgress: (milestone: Milestone) => number
  refresh: () => Promise<void>
}

const MILESTONES_STORAGE_KEY = 'qc_milestones'

export const useMilestones = (): UseMilestonesReturn => {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMilestones = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const stored = localStorage.getItem(MILESTONES_STORAGE_KEY)
      if (stored) {
        const parsedMilestones = JSON.parse(stored).map((m: any) => ({
          ...m,
          achievedAt: new Date(m.achievedAt),
          achieved: m.achieved ?? false
        }))
        setMilestones(parsedMilestones)
      } else {
        setMilestones(mockMilestones)
        localStorage.setItem(MILESTONES_STORAGE_KEY, JSON.stringify(mockMilestones))
      }
    } catch (err) {
      setError('Failed to load milestones')
      console.error('Error loading milestones:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveMilestones = useCallback((updatedMilestones: Milestone[]) => {
    try {
      localStorage.setItem(MILESTONES_STORAGE_KEY, JSON.stringify(updatedMilestones))
      setMilestones(updatedMilestones)
    } catch (err) {
      setError('Failed to save milestones')
      console.error('Error saving milestones:', err)
    }
  }, [])

  const createMilestone = useCallback(async (input: MilestoneInput): Promise<Milestone> => {
    try {
      setError(null)
      const newMilestone: Milestone = {
        id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...input,
        achievedAt: input.targetDate || new Date(),
        achieved: false,
        coupleId: 'couple1', 
        ...(input.photo && { data: { photo: input.photo } })
      }

      const updatedMilestones = [...milestones, newMilestone]
      saveMilestones(updatedMilestones)
      
      return newMilestone
    } catch (err) {
      const errorMessage = 'Failed to create milestone'
      setError(errorMessage)
      console.error('Error creating milestone:', err)
      throw new Error(errorMessage)
    }
  }, [milestones, saveMilestones])

  const updateMilestone = useCallback(async (id: string, updates: Partial<Milestone>): Promise<Milestone> => {
    try {
      setError(null)
      const updatedMilestones = milestones.map(milestone => {
        if (milestone.id === id) {
          const updated = { 
            ...milestone, 
            ...updates,
            achievedAt: updates.achievedAt || milestone.achievedAt
          }
          return updated
        }
        return milestone
      })

      const updatedMilestone = updatedMilestones.find(m => m.id === id)
      if (!updatedMilestone) {
        throw new Error('Milestone not found')
      }

      saveMilestones(updatedMilestones)
      return updatedMilestone
    } catch (err) {
      const errorMessage = 'Failed to update milestone'
      setError(errorMessage)
      console.error('Error updating milestone:', err)
      throw new Error(errorMessage)
    }
  }, [milestones, saveMilestones])

  const deleteMilestone = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      const updatedMilestones = milestones.filter(milestone => milestone.id !== id)
      saveMilestones(updatedMilestones)
    } catch (err) {
      const errorMessage = 'Failed to delete milestone'
      setError(errorMessage)
      console.error('Error deleting milestone:', err)
      throw new Error(errorMessage)
    }
  }, [milestones, saveMilestones])

  const achieveMilestone = useCallback(async (id: string): Promise<Milestone> => {
    try {
      setError(null)
      return await updateMilestone(id, {
        achieved: true,
        achievedAt: new Date(),
        ...(milestones.find(m => m.id === id)?.data && {
          data: {
            ...milestones.find(m => m.id === id)?.data,
            celebrationShown: false
          }
        })
      })
    } catch (err) {
      const errorMessage = 'Failed to achieve milestone'
      setError(errorMessage)
      console.error('Error achieving milestone:', err)
      throw new Error(errorMessage)
    }
  }, [milestones, updateMilestone])

  const getMilestonesByCategory = useCallback((category: string): Milestone[] => {
    return milestones.filter(milestone => milestone.category === category)
  }, [milestones])

  const getUpcomingMilestones = useCallback((): Milestone[] => {
    return milestones.filter(milestone => {
      return milestone.achieved === false || !milestone.achieved
    })
  }, [milestones])

  const getAchievedMilestones = useCallback((): Milestone[] => {
    return milestones.filter(milestone => {
      return milestone.achieved === true
    }).sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime())
  }, [milestones])

  const getRecentMilestones = useCallback((days: number): Milestone[] => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return milestones.filter(milestone => {
      if (!milestone.achievedAt) return false
      const achievedDate = new Date(milestone.achievedAt)
      return achievedDate >= cutoffDate
    }).sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime())
  }, [milestones])

  const calculateProgress = useCallback((milestone: Milestone): number => {
    if (milestone.achieved) {
      return 100
    }

    if (milestone.progress !== undefined) {
      return milestone.progress
    }

    if (milestone.data?.steps) {
      const completedSteps = milestone.data.steps.filter((step: any) => step.completed).length
      return Math.round((completedSteps / milestone.data.steps.length) * 100)
    }

    return 0
  }, [])

  const refresh = useCallback(async () => {
    await loadMilestones()
  }, [loadMilestones])

  useEffect(() => {
    loadMilestones()
  }, [loadMilestones])

  return {
    milestones,
    isLoading,
    error,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    achieveMilestone,
    getMilestonesByCategory,
    getUpcomingMilestones,
    getAchievedMilestones,
    getRecentMilestones,
    calculateProgress,
    refresh
  }
}