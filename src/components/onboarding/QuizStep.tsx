'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Calendar, Clock, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OnboardingData } from '@/app/onboarding/page'

interface QuizStepProps {
  preferences: OnboardingData['preferences']
  updatePreferences: (preferences: Partial<OnboardingData['preferences']>) => void
  onNext: () => void
  onPrevious: () => void
}

const questions = [
  {
    id: 'communicationStyle',
    icon: MessageCircle,
    title: 'How do you prefer to discuss important topics?',
    options: [
      { value: 'face-to-face', label: 'Face-to-face', emoji: '👥' },
      { value: 'written', label: 'Written notes', emoji: '📝' },
      { value: 'activities', label: 'During activities', emoji: '🚶' },
      { value: 'mix', label: 'Mix of all', emoji: '🔄' }
    ]
  },
  {
    id: 'checkInFrequency',
    icon: Calendar,
    title: 'How often would you like to check in with Deb?',
    options: [
      { value: 'daily', label: 'Daily', emoji: '☀️' },
      { value: 'weekly', label: 'Weekly', emoji: '📅' },
      { value: 'biweekly', label: 'Bi-weekly', emoji: '📆' },
      { value: 'monthly', label: 'Monthly', emoji: '🗓️' }
    ]
  },
  {
    id: 'sessionStyle',
    icon: Clock,
    title: 'What kind of check-in sessions work best for you?',
    options: [
      { value: 'quick', label: 'Quick & focused (10 min)', emoji: '⚡' },
      { value: 'standard', label: 'Standard (20 min)', emoji: '⏰' },
      { value: 'deep', label: 'Deep dive (30+ min)', emoji: '🏊' }
    ]
  }
]

export function QuizStep({
  preferences,
  updatePreferences,
  onNext,
  onPrevious
}: QuizStepProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({
    communicationStyle: preferences.communicationStyle || '',
    checkInFrequency: preferences.checkInFrequency || '',
    sessionStyle: preferences.sessionStyle || ''
  })

  const question = questions[currentQuestion]
  const Icon = question.icon

  const handleAnswer = (value: string) => {
    const updated = { ...answers, [question.id]: value }
    setAnswers(updated)
    updatePreferences(updated)

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300)
    }
  }

  const canProceed = Object.values(answers).every(answer => answer !== '')

  const handleNext = () => {
    if (canProceed) {
      onNext()
    }
  }

  const handleQuestionNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    } else if (direction === 'next' && currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Quick Relationship Quiz
        </h2>
        <p className="text-gray-600">
          Help us understand your relationship style
        </p>
      </div>

      <div className="flex justify-center space-x-2 mb-6">
        {questions.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-16 rounded-full transition-colors ${
              index === currentQuestion
                ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                : index < currentQuestion
                ? 'bg-pink-200'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
            <Icon className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 text-center">
          {question.title}
        </h3>

        <div className="grid gap-3">
          {question.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className={`p-4 rounded-lg border-2 transition-all text-left flex items-center space-x-3 ${
                answers[question.id as keyof typeof answers] === option.value
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <span className="text-2xl">{option.emoji}</span>
              <span className="font-medium text-gray-900">{option.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <div className="flex justify-between items-center pt-4">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onPrevious}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          {currentQuestion > 0 && (
            <Button
              variant="ghost"
              onClick={() => handleQuestionNavigation('prev')}
              size="sm"
            >
              Previous Question
            </Button>
          )}
        </div>

        <div className="flex space-x-2">
          {currentQuestion < questions.length - 1 && (
            <Button
              variant="ghost"
              onClick={() => handleQuestionNavigation('next')}
              size="sm"
              disabled={!answers[question.id as keyof typeof answers]}
            >
              Next Question
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}