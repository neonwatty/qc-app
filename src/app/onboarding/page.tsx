'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import { WelcomeStep } from '@/components/onboarding/WelcomeStep'
import { QuizStep } from '@/components/onboarding/QuizStep'
import { LoveLanguagesStep } from '@/components/onboarding/LoveLanguagesStep'
import { ReminderStep } from '@/components/onboarding/ReminderStep'
import { TourStep } from '@/components/onboarding/TourStep'
import { CompleteStep } from '@/components/onboarding/CompleteStep'

export interface OnboardingData {
  completed: boolean
  completedAt?: Date
  preferences: {
    communicationStyle?: string
    checkInFrequency?: string
    sessionStyle?: string
    loveLanguages?: string[]
    reminderTime?: string
    reminderDay?: string
  }
  currentStep: number
}

const TOTAL_STEPS = 6

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    completed: false,
    preferences: {},
    currentStep: 1
  })

  useEffect(() => {
    const savedData = localStorage.getItem('qc-onboarding-data')
    if (savedData) {
      const parsed = JSON.parse(savedData)
      setOnboardingData(parsed)
      setCurrentStep(parsed.currentStep || 1)
    }

    const isComplete = localStorage.getItem('qc-onboarding-complete')
    if (isComplete === 'true') {
      router.push('/dashboard')
    }
  }, [router])

  const saveProgress = (data: Partial<OnboardingData>) => {
    const updated = { ...onboardingData, ...data, currentStep }
    setOnboardingData(updated)
    localStorage.setItem('qc-onboarding-data', JSON.stringify(updated))
  }

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
      saveProgress({ currentStep: currentStep + 1 })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      saveProgress({ currentStep: currentStep - 1 })
    }
  }

  const handleSkip = () => {
    localStorage.setItem('qc-onboarding-complete', 'true')
    localStorage.setItem('qc-onboarding-skipped', 'true')
    router.push('/dashboard')
  }

  const handleComplete = () => {
    const finalData = {
      ...onboardingData,
      completed: true,
      completedAt: new Date()
    }
    localStorage.setItem('qc-onboarding-data', JSON.stringify(finalData))
    localStorage.setItem('qc-onboarding-complete', 'true')
    router.push('/dashboard')
  }

  const updatePreferences = (preferences: Partial<OnboardingData['preferences']>) => {
    const updated = {
      ...onboardingData,
      preferences: { ...onboardingData.preferences, ...preferences }
    }
    setOnboardingData(updated)
    localStorage.setItem('qc-onboarding-data', JSON.stringify(updated))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={handleNext} />
      case 2:
        return (
          <QuizStep
            preferences={onboardingData.preferences}
            updatePreferences={updatePreferences}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 3:
        return (
          <LoveLanguagesStep
            preferences={onboardingData.preferences}
            updatePreferences={updatePreferences}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 4:
        return (
          <ReminderStep
            preferences={onboardingData.preferences}
            updatePreferences={updatePreferences}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 5:
        return (
          <TourStep
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 6:
        return (
          <CompleteStep
            preferences={onboardingData.preferences}
            onComplete={handleComplete}
            onPrevious={handlePrevious}
          />
        )
      default:
        return null
    }
  }

  return (
    <OnboardingFlow
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      onSkip={handleSkip}
    >
      {renderStep()}
    </OnboardingFlow>
  )
}