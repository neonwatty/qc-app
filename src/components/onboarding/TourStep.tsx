'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Lock, TrendingUp, Bell, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TourStepProps {
  onNext: () => void
  onPrevious: () => void
}

const features = [
  {
    id: 'checkins',
    title: 'Structured Check-ins',
    description: 'Have meaningful conversations that strengthen your bond',
    icon: MessageCircle,
    color: 'from-blue-400 to-cyan-400',
    points: [
      'Guided conversation topics',
      'Time-boxed sessions',
      'Track progress over time'
    ],
    preview: '💬'
  },
  {
    id: 'privacy',
    title: 'Privacy Controls',
    description: 'Keep some notes private, share others with Deb',
    icon: Lock,
    color: 'from-purple-400 to-pink-400',
    points: [
      'Private personal reflections',
      'Shared relationship notes',
      'Draft mode for works-in-progress'
    ],
    preview: '🔒'
  },
  {
    id: 'growth',
    title: 'Growth Tracking',
    description: 'Celebrate your relationship milestones together',
    icon: TrendingUp,
    color: 'from-green-400 to-emerald-400',
    points: [
      'Relationship milestones',
      'Progress visualization',
      'Achievement celebrations'
    ],
    preview: '📈'
  },
  {
    id: 'reminders',
    title: 'Smart Reminders',
    description: 'Never forget what matters most',
    icon: Bell,
    color: 'from-amber-400 to-orange-400',
    points: [
      'Check-in reminders',
      'Partner appreciation prompts',
      'Important date notifications'
    ],
    preview: '🔔'
  }
]

export function TourStep({ onNext, onPrevious }: TourStepProps) {
  const [currentFeature, setCurrentFeature] = useState(0)
  const feature = features[currentFeature]
  const Icon = feature.icon

  const handleNext = () => {
    if (currentFeature < features.length - 1) {
      setCurrentFeature(currentFeature + 1)
    } else {
      onNext()
    }
  }

  const handlePrevious = () => {
    if (currentFeature > 0) {
      setCurrentFeature(currentFeature - 1)
    } else {
      onPrevious()
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Discover Key Features
        </h2>
        <p className="text-gray-600">
          Here's what makes Quality Control special
        </p>
      </div>

      <div className="flex justify-center space-x-2 mb-6">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentFeature(index)}
            className={`h-2 w-12 rounded-full transition-all ${
              index === currentFeature
                ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentFeature}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className={`w-24 h-24 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
            >
              <Icon className="w-12 h-12 text-white" />
            </motion.div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 mb-4">
              {feature.description}
            </p>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-6 border border-gray-200">
            <div className="space-y-3">
              {feature.points.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-purple-600">{index + 1}</span>
                  </div>
                  <span className="text-gray-700">{point}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 text-center"
          >
            <div className="text-4xl mb-2">{feature.preview}</div>
            <p className="text-sm text-gray-600">
              {currentFeature === 0 && "Start meaningful conversations"}
              {currentFeature === 1 && "Your thoughts, your control"}
              {currentFeature === 2 && "Watch your love grow"}
              {currentFeature === 3 && "Stay connected effortlessly"}
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {currentFeature === 0 ? 'Back' : 'Previous'}
        </Button>

        <div className="flex space-x-2">
          {currentFeature > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentFeature(currentFeature - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          <span className="flex items-center text-sm text-gray-500">
            {currentFeature + 1} / {features.length}
          </span>
          {currentFeature < features.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentFeature(currentFeature + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        <Button
          onClick={handleNext}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
        >
          {currentFeature === features.length - 1 ? 'Finish Tour' : 'Next Feature'}
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}