'use client'

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ArrowRight, CheckCircle, Users } from 'lucide-react'
import { StaggerContainer } from '@/components/ui/motion'
import { Button } from '@/components/ui/button'
import { CategoryCard } from './CategoryCard'
import { Category } from '@/types'
import { CategoryProgress } from '@/types/checkin'
import { cn } from '@/lib/utils'

interface CategoryGridProps {
  categories: Category[]
  categoryProgress?: CategoryProgress[]
  selectedCategories?: string[]
  completedCategories?: string[]
  onCategorySelect: (categoryId: string) => void
  onCategoryToggle?: (categoryId: string) => void
  onStartCheckIn?: (selectedCategories: string[]) => void
  onAddCustomCategory?: () => void
  multiSelect?: boolean
  showProgress?: boolean
  showPromptPreviews?: boolean
  maxSelections?: number
  className?: string
}

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  categoryProgress = [],
  selectedCategories = [],
  completedCategories = [],
  onCategorySelect,
  onCategoryToggle,
  onStartCheckIn,
  onAddCustomCategory,
  multiSelect = false,
  showProgress = false,
  showPromptPreviews = true,
  maxSelections,
  className
}) => {
  // Sort categories by order and completion status
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      // Completed categories first in multiselect mode
      if (multiSelect && showProgress) {
        const aCompleted = completedCategories.includes(a.id)
        const bCompleted = completedCategories.includes(b.id)
        if (aCompleted !== bCompleted) {
          return bCompleted ? 1 : -1
        }
      }
      
      // Then by order
      return a.order - b.order
    })
  }, [categories, completedCategories, multiSelect, showProgress])

  const getCategoryProgress = (categoryId: string) => {
    return categoryProgress.find(cp => cp.categoryId === categoryId)
  }

  const handleCategoryAction = (categoryId: string) => {
    if (multiSelect && onCategoryToggle) {
      // In multiselect mode, toggle selection
      if (selectedCategories.includes(categoryId)) {
        onCategoryToggle(categoryId)
      } else if (!maxSelections || selectedCategories.length < maxSelections) {
        onCategoryToggle(categoryId)
      }
    } else {
      // In single select mode, select and potentially start
      onCategorySelect(categoryId)
    }
  }

  const canStartCheckIn = multiSelect ? selectedCategories.length > 0 : selectedCategories.length === 1
  const hasReachedMaxSelections = maxSelections && selectedCategories.length >= maxSelections
  const completedCount = completedCategories.length
  const totalCount = categories.length

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Selection Summary */}
      {multiSelect && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center space-x-2">
            <Users className="h-5 w-5 text-gray-500" />
            <span className="text-lg font-medium text-gray-900">
              {selectedCategories.length === 0
                ? "Choose categories to discuss"
                : selectedCategories.length === 1
                ? "1 category selected"
                : `${selectedCategories.length} categories selected`
              }
            </span>
          </div>
          
          {showProgress && completedCount > 0 && (
            <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>
                {completedCount} of {totalCount} completed
              </span>
            </div>
          )}

          {hasReachedMaxSelections && (
            <div className="text-sm text-orange-600">
              Maximum {maxSelections} categories can be selected
            </div>
          )}
        </motion.div>
      )}

      {/* Category Grid */}
      <StaggerContainer className="space-y-4">
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {sortedCategories.map((category) => {
            const progress = getCategoryProgress(category.id)
            const isSelected = selectedCategories.includes(category.id)
            const isCompleted = completedCategories.includes(category.id)
            const isDisabled = hasReachedMaxSelections && !isSelected

            return (
              <motion.div
                key={category.id}
                initial={{ 
                  opacity: 0, 
                  y: 20,
                  scale: 0.9
                }}
                animate={{
                  opacity: isDisabled ? 0.5 : 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    duration: 0.4
                  }
                }}
                className="transition-opacity duration-200"
              >
                <CategoryCard
                  category={category}
                  progress={progress}
                  isSelected={isSelected}
                  isCompleted={isCompleted}
                  showPromptPreview={showPromptPreviews}
                  onSelect={handleCategoryAction}
                  onToggleSelection={onCategoryToggle}
                />
              </motion.div>
            )
          })}

          {/* Add Custom Category Card */}
          {onAddCustomCategory && (
            <motion.div
              initial={{ 
                opacity: 0, 
                y: 20,
                scale: 0.9
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  duration: 0.4
                }
              }}
            >
              <div 
                className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-6 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 min-h-[140px] flex items-center justify-center"
                onClick={onAddCustomCategory}
              >
                <div className="text-center">
                  <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-600">
                    Add Custom Category
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Create your own discussion topic
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </StaggerContainer>

      {/* Action Buttons */}
      <AnimatePresence>
        {canStartCheckIn && onStartCheckIn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { delay: 0.6, duration: 0.4 }
            }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col items-center space-y-4"
          >
            {/* Selected Categories Summary */}
            {multiSelect && selectedCategories.length > 1 && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  You&apos;ll discuss these {selectedCategories.length} categories:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {selectedCategories.map((categoryId) => {
                    const category = categories.find(c => c.id === categoryId)
                    return category ? (
                      <span
                        key={categoryId}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {category.icon} {category.name}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            )}

            {/* Start Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-4"
                onClick={() => onStartCheckIn(selectedCategories)}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold">
                    Start Discussion
                  </span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              </Button>
            </motion.div>

            {/* Time Estimate */}
            <div className="text-xs text-gray-500 text-center">
              Estimated time: {multiSelect ? selectedCategories.length * 3 : 5}-{multiSelect ? selectedCategories.length * 5 : 8} minutes
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}