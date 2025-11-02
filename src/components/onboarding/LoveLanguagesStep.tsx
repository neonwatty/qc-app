'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Gift, Clock, Users, Sparkles, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OnboardingData } from '@/app/onboarding/page'

interface LoveLanguagesStepProps {
  preferences: OnboardingData['preferences']
  updatePreferences: (preferences: Partial<OnboardingData['preferences']>) => void
  onNext: () => void
  onPrevious: () => void
}

const loveLanguages = [
  {
    id: 'words',
    title: 'Words of Affirmation',
    description: 'Verbal acknowledgments, compliments, encouragement',
    icon: MessageCircle,
    examples: ['I love you', 'You did great', "I'm proud of you"],
    color: 'from-pink-400 to-rose-400'
  },
  {
    id: 'time',
    title: 'Quality Time',
    description: 'Undivided attention, meaningful conversations',
    icon: Clock,
    examples: ['Date nights', 'Phone-free dinners', 'Long walks'],
    color: 'from-purple-400 to-indigo-400'
  },
  {
    id: 'acts',
    title: 'Acts of Service',
    description: 'Helping with tasks, easing responsibilities',
    icon: Users,
    examples: ['Doing chores', 'Running errands', 'Making breakfast'],
    color: 'from-blue-400 to-cyan-400'
  },
  {
    id: 'touch',
    title: 'Physical Touch',
    description: 'Physical closeness and appropriate touch',
    icon: Heart,
    examples: ['Hugs', 'Holding hands', 'Back rubs'],
    color: 'from-rose-400 to-pink-400'
  },
  {
    id: 'gifts',
    title: 'Receiving Gifts',
    description: 'Thoughtful gifts and gestures',
    icon: Gift,
    examples: ['Surprise flowers', 'Favorite snacks', 'Handmade cards'],
    color: 'from-amber-400 to-orange-400'
  }
]

const debsLanguages = ['touch', 'acts', 'time'] // Deb's simulated preferences

export function LoveLanguagesStep({
  preferences,
  updatePreferences,
  onNext,
  onPrevious
}: LoveLanguagesStepProps) {
  const [selected, setSelected] = useState<string[]>(preferences.loveLanguages || [])
  const [showPartner, setShowPartner] = useState(false)

  const toggleLanguage = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(l => l !== id))
    } else if (selected.length < 3) {
      setSelected([...selected, id])
    }
  }

  const handleNext = () => {
    updatePreferences({ loveLanguages: selected })
    if (!showPartner && selected.length === 3) {
      setShowPartner(true)
    } else {
      onNext()
    }
  }

  const canProceed = selected.length >= 1

  if (showPartner) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Deb&apos;s Love Languages
          </h2>
          <p className="text-gray-600">
            Here&apos;s what makes your partner feel most loved
          </p>
        </div>

        <div className="space-y-3">
          {debsLanguages.map((langId, index) => {
            const language = loveLanguages.find(l => l.id === langId)!
            const Icon = language.icon
            return (
              <motion.div
                key={langId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200"
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${language.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{language.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{language.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {language.examples.map((example, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-white rounded-full text-gray-700">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            💡 <strong>Tip:</strong> Try expressing love in Deb&apos;s languages this week and see how they respond!
          </p>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setShowPartner(false)}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button
            onClick={onNext}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What makes you feel most loved?
        </h2>
        <p className="text-gray-600">
          Select up to 3 love languages (choose at least 1)
        </p>
        <div className="mt-2">
          <span className={`text-sm font-medium ${selected.length === 0 ? 'text-gray-500' : selected.length === 3 ? 'text-green-600' : 'text-purple-600'}`}>
            {selected.length}/3 selected
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {loveLanguages.map((language, index) => {
            const Icon = language.icon
            const isSelected = selected.includes(language.id)
            return (
              <motion.button
                key={language.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => toggleLanguage(language.id)}
                disabled={!isSelected && selected.length >= 3}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-pink-500 bg-pink-50'
                    : selected.length >= 3
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${language.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{language.title}</h3>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{language.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {language.examples.map((example, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-white rounded-full text-gray-500">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
        >
          {selected.length === 3 ? "See Deb's Languages" : 'Continue'}
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}