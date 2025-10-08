'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProgressBar } from './ProgressBar'

interface OnboardingFlowProps {
  currentStep: number
  totalSteps: number
  onSkip: () => void
  children: ReactNode
}

export function OnboardingFlow({
  currentStep,
  totalSteps,
  onSkip,
  children
}: OnboardingFlowProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Skip
          </Button>
        </div>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}