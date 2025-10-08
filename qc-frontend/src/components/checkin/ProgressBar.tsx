'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Check, Circle } from 'lucide-react'
import { CheckInStep, CheckInProgress } from '@/types/checkin'

interface ProgressBarProps {
  progress: CheckInProgress
  currentStep: CheckInStep
  className?: string
  showLabels?: boolean
  animated?: boolean
}

interface StepInfo {
  id: CheckInStep
  label: string
  shortLabel: string
  icon?: string
}

const STEP_INFO: StepInfo[] = [
  { id: 'welcome', label: 'Welcome', shortLabel: 'Start', icon: '👋' },
  { id: 'category-selection', label: 'Choose Topics', shortLabel: 'Topics', icon: '📝' },
  { id: 'category-discussion', label: 'Discussion', shortLabel: 'Discuss', icon: '💬' },
  { id: 'reflection', label: 'Reflection', shortLabel: 'Reflect', icon: '💭' },
  { id: 'action-items', label: 'Action Items', shortLabel: 'Actions', icon: '✅' },
  { id: 'completion', label: 'Complete', shortLabel: 'Done', icon: '🎉' }
]

export default function ProgressBar({
  progress,
  currentStep,
  className,
  showLabels = true,
  animated = true
}: ProgressBarProps) {
  const currentStepIndex = STEP_INFO.findIndex(step => step.id === currentStep)
  
  return (
    <div className={cn('w-full', className)}>
      {/* Progress percentage bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progress
          </span>
          <span className="text-sm font-medium text-gray-900">
            {progress.percentage}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"
            initial={animated ? { width: 0 } : false}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="relative">
        {/* Connection line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-300" />
        <div className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-500"
          style={{ width: `${(currentStepIndex / (STEP_INFO.length - 1)) * 100}%` }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {STEP_INFO.map((step, index) => {
            const isCompleted = progress.completedSteps.includes(step.id)
            const isCurrent = step.id === currentStep
            const isPending = !isCompleted && !isCurrent

            return (
              <motion.div
                key={step.id}
                className="flex flex-col items-center"
                initial={animated ? { opacity: 0, y: 20 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Step indicator */}
                <div className="relative">
                  <motion.div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                      'border-2',
                      isCompleted && 'bg-gradient-to-r from-pink-500 to-purple-600 border-transparent',
                      isCurrent && 'bg-white border-purple-600 shadow-lg scale-110',
                      isPending && 'bg-white border-gray-300'
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : isCurrent ? (
                      <motion.div
                        className="w-3 h-3 bg-purple-600 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </motion.div>

                  {/* Step icon */}
                  {isCurrent && step.icon && (
                    <motion.div
                      className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    >
                      <span className="text-2xl">{step.icon}</span>
                    </motion.div>
                  )}
                </div>

                {/* Step label */}
                {showLabels && (
                  <div className="mt-2 text-center">
                    <div className={cn(
                      'text-xs font-medium transition-colors duration-300',
                      isCompleted && 'text-purple-600',
                      isCurrent && 'text-gray-900',
                      isPending && 'text-gray-400'
                    )}>
                      <span className="hidden sm:inline">{step.label}</span>
                      <span className="sm:hidden">{step.shortLabel}</span>
                    </div>
                    {isCurrent && (
                      <motion.div
                        className="text-[10px] text-gray-500 mt-0.5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        Current Step
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Mobile-friendly step info */}
      <motion.div 
        className="mt-6 p-3 bg-purple-50 rounded-lg sm:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-purple-900">
              Step {currentStepIndex + 1} of {STEP_INFO.length}
            </div>
            <div className="text-xs text-purple-700 mt-0.5">
              {STEP_INFO[currentStepIndex]?.label}
            </div>
          </div>
          <div className="text-2xl">
            {STEP_INFO[currentStepIndex]?.icon}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * Simplified linear progress bar variant
 */
export function SimpleProgressBar({
  percentage,
  className,
  showPercentage = true,
  color = 'purple'
}: {
  percentage: number
  className?: string
  showPercentage?: boolean
  color?: 'purple' | 'green' | 'blue' | 'pink'
}) {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    pink: 'from-pink-500 to-pink-600'
  }

  return (
    <div className={cn('w-full', className)}>
      {showPercentage && (
        <div className="flex justify-end mb-1">
          <span className="text-xs font-medium text-gray-600">
            {percentage}%
          </span>
        </div>
      )}
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={cn(
            'h-full rounded-full bg-gradient-to-r',
            colorClasses[color]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

/**
 * Circular progress indicator variant
 */
export function CircularProgress({
  percentage,
  size = 80,
  strokeWidth = 8,
  className,
  showPercentage = true,
  color = 'purple'
}: {
  percentage: number
  size?: number
  strokeWidth?: number
  className?: string
  showPercentage?: boolean
  color?: 'purple' | 'green' | 'blue' | 'pink'
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  const colorClasses = {
    purple: 'text-purple-600',
    green: 'text-green-600',
    blue: 'text-blue-600',
    pink: 'text-pink-600'
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={colorClasses[color]}
          strokeLinecap="round"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-900">
            {percentage}%
          </span>
        </div>
      )}
    </div>
  )
}