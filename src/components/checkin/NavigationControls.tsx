'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Home,
  Check,
  X,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  SkipForward
} from 'lucide-react'
import { CheckInStep } from '@/types/checkin'

interface NavigationControlsProps {
  currentStep: CheckInStep
  canGoBack?: boolean
  canGoNext?: boolean
  canSkip?: boolean
  onBack?: () => void
  onNext?: () => void
  onSkip?: () => void
  onCancel?: () => void
  isLoading?: boolean
  nextLabel?: string
  backLabel?: string
  skipLabel?: string
  className?: string
  variant?: 'default' | 'floating' | 'minimal' | 'mobile'
  showProgress?: boolean
  currentStepIndex?: number
  totalSteps?: number
}

export default function NavigationControls({
  currentStep,
  canGoBack = true,
  canGoNext = true,
  canSkip = false,
  onBack,
  onNext,
  onSkip,
  onCancel,
  isLoading = false,
  nextLabel = 'Next',
  backLabel = 'Back',
  skipLabel = 'Skip',
  className,
  variant = 'default',
  showProgress = false,
  currentStepIndex,
  totalSteps
}: NavigationControlsProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const handleCancel = () => {
    if (onCancel) {
      setShowCancelConfirm(true)
    }
  }

  const confirmCancel = () => {
    setShowCancelConfirm(false)
    onCancel?.()
  }

  // Different layouts based on variant
  if (variant === 'floating') {
    return (
      <>
        {/* Floating navigation bar */}
        <motion.div
          className={cn(
            'fixed bottom-0 left-0 right-0 z-40',
            'bg-white/95 backdrop-blur-sm border-t border-gray-200',
            'px-4 py-3 safe-area-bottom',
            className
          )}
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between gap-3">
              {/* Back button */}
              <Button
                variant="ghost"
                size="lg"
                onClick={onBack}
                disabled={!canGoBack || isLoading}
                className="flex-shrink-0"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">{backLabel}</span>
              </Button>

              {/* Progress indicator */}
              {showProgress && currentStepIndex !== undefined && totalSteps && (
                <div className="flex-1 text-center">
                  <span className="text-sm text-gray-600">
                    Step {currentStepIndex + 1} of {totalSteps}
                  </span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {canSkip && (
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={onSkip}
                    disabled={isLoading}
                    className="text-gray-500"
                  >
                    {skipLabel}
                    <SkipForward className="h-4 w-4 ml-1" />
                  </Button>
                )}
                <Button
                  size="lg"
                  onClick={onNext}
                  disabled={!canGoNext || isLoading}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">{nextLabel}</span>
                      <span className="sm:hidden">{nextLabel === 'Complete' ? <Check className="h-5 w-5" /> : 'Next'}</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cancel confirmation modal */}
        <CancelConfirmDialog
          isOpen={showCancelConfirm}
          onClose={() => setShowCancelConfirm(false)}
          onConfirm={confirmCancel}
        />
      </>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center justify-between', className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={!canGoBack || isLoading}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={!canGoNext || isLoading}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (variant === 'mobile') {
    return (
      <div className={cn('space-y-3', className)}>
        {/* Primary action */}
        <Button
          size="lg"
          onClick={onNext}
          disabled={!canGoNext || isLoading}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {nextLabel}
              {nextLabel !== 'Complete' && <ArrowRight className="h-4 w-4 ml-2" />}
            </>
          )}
        </Button>

        {/* Secondary actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={onBack}
            disabled={!canGoBack || isLoading}
            className="flex-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {backLabel}
          </Button>
          
          {canSkip && (
            <Button
              variant="ghost"
              size="lg"
              onClick={onSkip}
              disabled={isLoading}
              className="flex-1"
            >
              {skipLabel}
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      {/* Left section - Back/Cancel */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="default"
          onClick={onBack}
          disabled={!canGoBack || isLoading}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {backLabel}
        </Button>
        
        {onCancel && (
          <Button
            variant="ghost"
            size="default"
            onClick={handleCancel}
            disabled={isLoading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        )}
      </div>

      {/* Center - Progress */}
      {showProgress && currentStepIndex !== undefined && totalSteps && (
        <div className="flex-1 text-center">
          <span className="text-sm text-gray-600 font-medium">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
        </div>
      )}

      {/* Right section - Skip/Next */}
      <div className="flex items-center gap-2">
        {canSkip && (
          <Button
            variant="ghost"
            size="default"
            onClick={onSkip}
            disabled={isLoading}
          >
            {skipLabel}
            <SkipForward className="h-4 w-4 ml-1" />
          </Button>
        )}
        
        <Button
          size="default"
          onClick={onNext}
          disabled={!canGoNext || isLoading}
          className="min-w-[100px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Processing
            </>
          ) : (
            <>
              {nextLabel}
              {nextLabel === 'Complete' ? (
                <Check className="h-4 w-4 ml-1" />
              ) : (
                <ChevronRight className="h-4 w-4 ml-1" />
              )}
            </>
          )}
        </Button>
      </div>

      {/* Cancel confirmation modal */}
      <CancelConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={confirmCancel}
      />
    </div>
  )
}

/**
 * Cancel confirmation dialog
 */
function CancelConfirmDialog({
  isOpen,
  onClose,
  onConfirm
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Cancel Check-in?
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Are you sure you want to cancel? Your progress will be saved and you can continue later.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  Keep Going
                </Button>
                <Button
                  variant="ghost"
                  onClick={onConfirm}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Yes, Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * Quick navigation menu for jumping between steps
 */
export function QuickNavMenu({
  steps,
  currentStep,
  completedSteps,
  onNavigate,
  className
}: {
  steps: Array<{ id: CheckInStep; label: string; icon?: string }>
  currentStep: CheckInStep
  completedSteps: CheckInStep[]
  onNavigate: (step: CheckInStep) => void
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Home className="h-4 w-4" />
        Quick Nav
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full mt-2 right-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="p-2">
              {steps.map((step) => {
                const isCompleted = completedSteps.includes(step.id)
                const isCurrent = step.id === currentStep
                
                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      onNavigate(step.id)
                      setIsOpen(false)
                    }}
                    disabled={!isCompleted && !isCurrent}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left',
                      isCurrent && 'bg-purple-50 text-purple-900',
                      isCompleted && !isCurrent && 'hover:bg-gray-50',
                      !isCompleted && !isCurrent && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {step.icon && <span className="text-lg">{step.icon}</span>}
                    <div className="flex-1">
                      <div className="text-sm font-medium">{step.label}</div>
                      {isCurrent && (
                        <div className="text-xs text-purple-600">Current</div>
                      )}
                      {isCompleted && !isCurrent && (
                        <div className="text-xs text-green-600">Completed</div>
                      )}
                    </div>
                    {isCompleted && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}