'use client'

import { motion } from 'framer-motion'
import { CheckCircle, MessageCircle, LayoutDashboard, Heart, Sparkles, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OnboardingData } from '@/app/onboarding/page'
import confetti from 'canvas-confetti'
import { useEffect } from 'react'

interface CompleteStepProps {
  preferences: OnboardingData['preferences']
  onComplete: () => void
  onPrevious: () => void
}

export function CompleteStep({ preferences, onComplete, onPrevious }: CompleteStepProps) {
  useEffect(() => {
    // Trigger confetti animation
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const getSummary = () => {
    const items = []
    
    if (preferences.communicationStyle) {
      const styles: Record<string, string> = {
        'face-to-face': 'Face-to-face conversations',
        'written': 'Written notes',
        'activities': 'Discussions during activities',
        'mix': 'Mix of communication styles'
      }
      items.push({ icon: '💬', text: styles[preferences.communicationStyle] })
    }

    if (preferences.checkInFrequency) {
      const frequencies: Record<string, string> = {
        'daily': 'Daily check-ins',
        'weekly': 'Weekly check-ins',
        'biweekly': 'Bi-weekly check-ins',
        'monthly': 'Monthly check-ins'
      }
      items.push({ icon: '📅', text: frequencies[preferences.checkInFrequency] })
    }

    if (preferences.loveLanguages && preferences.loveLanguages.length > 0) {
      items.push({ icon: '💕', text: `${preferences.loveLanguages.length} love languages selected` })
    }

    if (preferences.reminderDay && preferences.reminderTime) {
      items.push({ icon: '🔔', text: 'Reminder scheduled' })
    }

    return items
  }

  const summary = getSummary()

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          You&apos;re All Set! 🎉
        </h2>
        <p className="text-lg text-gray-600">
          Your personalized experience is ready
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6"
      >
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
          Your Preferences
        </h3>
        <div className="space-y-2">
          {summary.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center space-x-3"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-gray-700">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg border border-gray-200 p-4"
      >
        <div className="flex items-start space-x-3">
          <Heart className="w-5 h-5 text-pink-500 flex-shrink-0 mt-1" />
          <div>
            <p className="font-medium text-gray-900">Welcome to your journey!</p>
            <p className="text-sm text-gray-600 mt-1">
              Jeremy &amp; Deb&apos;s relationship dashboard is ready. Start with your first check-in or explore the features at your own pace.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-3"
      >
        <Button
          onClick={() => {
            onComplete()
            window.location.href = '/checkin'
          }}
          size="lg"
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Start First Check-in
        </Button>

        <Button
          onClick={onComplete}
          variant="outline"
          size="lg"
          className="w-full"
        >
          <LayoutDashboard className="w-5 h-5 mr-2" />
          Explore Dashboard
        </Button>
      </motion.div>

      <div className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Go back
        </Button>
      </div>
    </div>
  )
}