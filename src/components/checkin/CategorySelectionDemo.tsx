'use client'

import React from 'react'
import { CategoryGrid } from './CategoryGrid'
import { useCheckIn } from '@/hooks/useCheckIn'
import { Category } from '@/types'
import { MotionBox } from '@/components/ui/motion'

interface CategorySelectionDemoProps {
  categories: Category[]
  onStartCheckIn?: (categories: string[]) => void
}

export const CategorySelectionDemo: React.FC<CategorySelectionDemoProps> = ({
  categories,
  onStartCheckIn
}) => {
  const {
    session,
    selectedCategories,
    categoryProgress,
    getCompletedCategories,
    startCheckIn,
    updateCategoryProgress
  } = useCheckIn()

  const completedCategories = getCompletedCategories().map(cp => cp.categoryId)

  const handleCategorySelect = (categoryId: string) => {
    // Single selection mode - start check-in immediately
    if (!session) {
      startCheckIn([categoryId])
    }
    onStartCheckIn?.([categoryId])
  }

  const handleCategoryToggle = (categoryId: string) => {
    // Multi-selection mode logic would be handled by the context
    // This is a placeholder for future multi-select functionality
    if (selectedCategories.includes(categoryId)) {
      // Remove from selection
      const newSelection = selectedCategories.filter(id => id !== categoryId)
      updateCategoryProgress(categoryId, { isCompleted: false })
    } else {
      // Add to selection (if not already at max)
      const newSelection = [...selectedCategories, categoryId]
      startCheckIn(newSelection)
    }
  }

  const handleStartDiscussion = (selectedCategoryIds: string[]) => {
    if (!session) {
      startCheckIn(selectedCategoryIds)
    }
    onStartCheckIn?.(selectedCategoryIds)
  }

  return (
    <MotionBox variant="slideUp">
      <CategoryGrid
        categories={categories}
        categoryProgress={categoryProgress}
        selectedCategories={selectedCategories}
        completedCategories={completedCategories}
        onCategorySelect={handleCategorySelect}
        onCategoryToggle={handleCategoryToggle}
        onStartCheckIn={handleStartDiscussion}
        multiSelect={false}
        showProgress={!!session}
        showPromptPreviews={true}
        maxSelections={4}
      />
    </MotionBox>
  )
}