'use client'

import { motion } from 'framer-motion'
import { Heart, Sparkles, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WelcomeStepProps {
  onNext: () => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto"
      >
        <Heart className="w-10 h-10 text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to Quality Control
        </h1>
        <p className="text-lg text-gray-600">
          Let's personalize your relationship check-in experience
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-pink-50 rounded-lg p-4 text-left space-y-3"
      >
        <p className="text-sm text-gray-700 font-medium">
          You'll be playing as <span className="font-semibold text-pink-600">Jeremy</span>, 
          with <span className="font-semibold text-purple-600">Deb</span> as your partner.
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1 text-pink-500" />
            <span>5 minute setup</span>
          </div>
          <div className="flex items-center">
            <Sparkles className="w-4 h-4 mr-1 text-purple-500" />
            <span>Personalized experience</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl mb-1">💬</div>
            <p className="text-xs text-gray-600">Communication</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl mb-1">💕</div>
            <p className="text-xs text-gray-600">Love Languages</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl mb-1">🔔</div>
            <p className="text-xs text-gray-600">Reminders</p>
          </div>
        </div>

        <Button
          onClick={onNext}
          size="lg"
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
        >
          Let's Get Started
        </Button>
      </motion.div>
    </div>
  )
}