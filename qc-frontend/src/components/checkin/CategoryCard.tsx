'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Clock, Edit } from 'lucide-react'
import { Category } from '@/types'
import { CategoryProgress } from '@/types/checkin'
import { cn } from '@/lib/utils'

interface CategoryCardProps {
  category: Category
  progress?: CategoryProgress
  isSelected?: boolean
  isCompleted?: boolean
  showPromptPreview?: boolean
  onSelect: (categoryId: string) => void
  onToggleSelection?: (categoryId: string) => void
  className?: string
}

const colorMapping = {
  pink: {
    border: 'border-pink-500',
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    gradient: 'from-pink-500 to-rose-500',
    ring: 'ring-pink-500/20',
    icon: 'text-pink-500'
  },
  blue: {
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    gradient: 'from-blue-500 to-indigo-500',
    ring: 'ring-blue-500/20',
    icon: 'text-blue-500'
  },
  purple: {
    border: 'border-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    gradient: 'from-purple-500 to-violet-500',
    ring: 'ring-purple-500/20',
    icon: 'text-purple-500'
  },
  green: {
    border: 'border-green-500',
    bg: 'bg-green-50',
    text: 'text-green-600',
    gradient: 'from-green-500 to-emerald-500',
    ring: 'ring-green-500/20',
    icon: 'text-green-500'
  },
  gray: {
    border: 'border-gray-300',
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    gradient: 'from-gray-500 to-gray-600',
    ring: 'ring-gray-500/20',
    icon: 'text-gray-500'
  }
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  progress,
  isSelected = false,
  isCompleted = false,
  showPromptPreview = true,
  onSelect,
  onToggleSelection,
  className
}) => {
  const colorKey = category.icon === '💕' ? 'pink' : 
                   category.icon === '💬' ? 'blue' :
                   category.icon === '🤗' ? 'purple' :
                   category.icon === '🎯' ? 'green' : 'gray'
  
  const colors = colorMapping[colorKey]

  const handleClick = () => {
    if (onToggleSelection && isSelected) {
      onToggleSelection(category.id)
    } else {
      onSelect(category.id)
    }
  }

  const timeSpent = progress?.timeSpent || 0
  const noteCount = progress?.notes?.length || 0
  const hasContent = timeSpent > 0 || noteCount > 0

  return (
    <motion.div
      initial={{ scale: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02, 
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      className={cn("relative", className)}
    >
      <div 
        className={cn(
          "relative bg-white rounded-xl border-2 p-6 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md",
          isSelected 
            ? `${colors.border} ${colors.bg} ring-4 ${colors.ring} shadow-lg` 
            : "border-gray-200 hover:border-gray-300",
          isCompleted && "ring-2 ring-green-500/20 bg-green-50/50"
        )}
        onClick={handleClick}
      >
        {/* Completion Indicator */}
        {isCompleted && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
            className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1.5 shadow-lg z-10"
          >
            <Check className="h-4 w-4 text-white" />
          </motion.div>
        )}

        {/* Category Icon and Header */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="text-3xl">{category.icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "text-lg font-semibold",
              isSelected ? colors.text : "text-gray-900"
            )}>
              {category.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              {category.description}
            </p>
          </div>
          <div className="flex-shrink-0">
            <ArrowRight className={cn(
              "h-5 w-5 transition-all duration-200",
              isSelected ? colors.icon : "text-gray-400",
              isSelected && "transform translate-x-1"
            )} />
          </div>
        </div>

        {/* Progress Indicators */}
        {hasContent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="border-t border-gray-200 pt-3 mt-4"
          >
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                {timeSpent > 0 && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{Math.round(timeSpent / 60000)} min</span>
                  </div>
                )}
                {noteCount > 0 && (
                  <div className="flex items-center space-x-1">
                    <Edit className="h-3 w-3" />
                    <span>{noteCount} note{noteCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
              {progress?.lastUpdated && (
                <span>
                  {new Date(progress.lastUpdated).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Prompt Preview */}
        {showPromptPreview && category.prompts && category.prompts.length > 0 && !hasContent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="border-t border-gray-200 pt-3 mt-4"
          >
            <p className="text-xs text-gray-500 italic leading-relaxed">
              &ldquo;{category.prompts[0]}&rdquo;
            </p>
            {category.prompts.length > 1 && (
              <p className="text-xs text-gray-400 mt-1">
                +{category.prompts.length - 1} more prompt{category.prompts.length > 2 ? 's' : ''}
              </p>
            )}
          </motion.div>
        )}

        {/* Custom Category Badge */}
        {category.isCustom && (
          <div className="absolute top-4 left-4">
            <div className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-medium">
              Custom
            </div>
          </div>
        )}

        {/* Selection Overlay */}
        {isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-10 rounded-xl pointer-events-none",
              colors.gradient
            )}
          />
        )}
      </div>
    </motion.div>
  )
}