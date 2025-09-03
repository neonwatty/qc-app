'use client'

import { useCallback, useMemo } from 'react'
import { useCheckInContext } from '@/contexts/CheckInContext'
import { CheckInStep, CategoryProgress } from '@/types/checkin'
import { Note } from '@/types'

export function useCheckIn() {
  const context = useCheckInContext()

  const {
    session,
    isLoading,
    error,
    startCheckIn,
    goToStep,
    completeStep,
    updateCategoryProgress,
    addDraftNote,
    updateDraftNote,
    removeDraftNote,
    saveSession,
    completeCheckIn,
    abandonCheckIn,
    canGoToStep,
    getStepIndex,
    isStepCompleted,
    getCurrentCategoryProgress
  } = context

  const isActive = !!session
  const currentStep = session?.progress.currentStep
  const progress = session?.progress
  
  const selectedCategories = useMemo(() => session?.selectedCategories || [], [session?.selectedCategories])
  const categoryProgress = useMemo(() => session?.categoryProgress || [], [session?.categoryProgress])
  const draftNotes = useMemo(() => session?.draftNotes || [], [session?.draftNotes])

  const getTimeElapsed = useCallback(() => {
    if (!session) return 0
    return Date.now() - session.startedAt.getTime()
  }, [session])

  const getEstimatedTimeRemaining = useCallback(() => {
    if (!session || !session.estimatedTimeRemaining) return null
    const elapsed = getTimeElapsed()
    return Math.max(0, session.estimatedTimeRemaining - elapsed)
  }, [session, getTimeElapsed])

  const getCategoryById = useCallback((categoryId: string) => {
    return categoryProgress.find(cp => cp.categoryId === categoryId)
  }, [categoryProgress])

  const getCompletedCategories = useCallback(() => {
    return categoryProgress.filter(cp => cp.isCompleted)
  }, [categoryProgress])

  const getPendingCategories = useCallback(() => {
    return categoryProgress.filter(cp => !cp.isCompleted)
  }, [categoryProgress])

  const getCurrentCategory = useCallback(() => {
    if (currentStep !== 'category-discussion') return null
    return getCurrentCategoryProgress()
  }, [currentStep, getCurrentCategoryProgress])

  const markCategoryComplete = useCallback((categoryId: string) => {
    updateCategoryProgress(categoryId, { isCompleted: true })
  }, [updateCategoryProgress])

  const addCategoryNote = useCallback((categoryId: string, noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'categoryId'>) => {
    addDraftNote({
      ...noteData,
      categoryId,
      checkInId: session?.id || ''
    })
  }, [addDraftNote, session?.id])

  const getCategoryNotes = useCallback((categoryId: string) => {
    return draftNotes.filter(note => note.categoryId === categoryId)
  }, [draftNotes])

  const getPrivateNotes = useCallback(() => {
    return draftNotes.filter(note => note.privacy === 'private')
  }, [draftNotes])

  const getSharedNotes = useCallback(() => {
    return draftNotes.filter(note => note.privacy === 'shared')
  }, [draftNotes])

  const getDraftNotes = useCallback(() => {
    return draftNotes.filter(note => note.privacy === 'draft')
  }, [draftNotes])

  const canCompleteCurrentStep = useCallback(() => {
    if (!session) return false

    switch (currentStep) {
      case 'welcome':
        return true
      case 'category-selection':
        return selectedCategories.length > 0
      case 'category-discussion':
        return getCompletedCategories().length === selectedCategories.length
      case 'reflection':
        return true
      case 'action-items':
        return true
      case 'completion':
        return true
      default:
        return false
    }
  }, [session, currentStep, selectedCategories, getCompletedCategories])

  const nextStep = useCallback(() => {
    if (!canCompleteCurrentStep() || !currentStep) return

    if (currentStep === 'completion') {
      completeCheckIn()
    } else {
      completeStep(currentStep)
    }
  }, [canCompleteCurrentStep, currentStep, completeStep, completeCheckIn])

  const previousStep = useCallback(() => {
    if (!session) return

    const currentIndex = getStepIndex(currentStep!)
    if (currentIndex > 0) {
      const previousStepName = ['welcome', 'category-selection', 'category-discussion', 'reflection', 'action-items', 'completion'][currentIndex - 1] as CheckInStep
      goToStep(previousStepName)
    }
  }, [session, currentStep, getStepIndex, goToStep])

  const jumpToStep = useCallback((step: CheckInStep) => {
    if (canGoToStep(step)) {
      goToStep(step)
    }
  }, [canGoToStep, goToStep])

  const getTotalNoteCount = useCallback(() => {
    return draftNotes.length
  }, [draftNotes])

  const hasUnsavedChanges = useCallback(() => {
    if (!session) return false
    const timeSinceLastSave = Date.now() - session.lastSavedAt.getTime()
    return timeSinceLastSave > 1000
  }, [session])

  const autoSave = useCallback(() => {
    if (hasUnsavedChanges()) {
      saveSession()
    }
  }, [hasUnsavedChanges, saveSession])

  return {
    isActive,
    isLoading,
    error,
    session,
    currentStep,
    progress,
    selectedCategories,
    categoryProgress,
    draftNotes,
    
    startCheckIn,
    goToStep,
    completeStep,
    nextStep,
    previousStep,
    jumpToStep,
    completeCheckIn,
    abandonCheckIn,
    
    updateCategoryProgress,
    markCategoryComplete,
    getCategoryById,
    getCompletedCategories,
    getPendingCategories,
    getCurrentCategory,
    
    addDraftNote,
    updateDraftNote,
    removeDraftNote,
    addCategoryNote,
    getCategoryNotes,
    getPrivateNotes,
    getSharedNotes,
    getDraftNotes,
    getTotalNoteCount,
    
    getTimeElapsed,
    getEstimatedTimeRemaining,
    
    canGoToStep,
    canCompleteCurrentStep,
    getStepIndex,
    isStepCompleted,
    
    saveSession,
    autoSave,
    hasUnsavedChanges
  }
}