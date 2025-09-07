'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Calendar, Clock, Sparkles, X } from 'lucide-react'
import { useBookends } from '@/contexts/BookendsContext'
import { format, addDays, isToday, isTomorrow } from 'date-fns'

export function PrepBanner() {
  const { 
    preparation, 
    hasSeenPrepReminder,
    openPreparationModal 
  } = useBookends()

  // Mock next session time (for demo)
  const nextSessionDate = addDays(new Date(), 1)
  nextSessionDate.setHours(19, 0, 0, 0) // 7 PM tomorrow

  const getTimeUntilSession = () => {
    if (isToday(nextSessionDate)) return 'Today'
    if (isTomorrow(nextSessionDate)) return 'Tomorrow'
    return format(nextSessionDate, 'EEEE')
  }

  // Don't show if already prepared or dismissed
  if (preparation?.myTopics?.length || hasSeenPrepReminder) {
    // Show compact version if topics are prepared
    if (preparation?.myTopics?.length) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-full p-2">
                  <Sparkles className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    You&apos;ve prepared {preparation.myTopics.length} {preparation.myTopics.length === 1 ? 'topic' : 'topics'} for your next check-in
                  </p>
                  <p className="text-xs text-gray-600">
                    {preparation.partnerTopics?.length 
                      ? `Jordan has added ${preparation.partnerTopics.length} ${preparation.partnerTopics.length === 1 ? 'topic' : 'topics'} too`
                      : 'Waiting for Jordan to add topics'}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={openPreparationModal}
              >
                View Topics
              </Button>
            </div>
          </Card>
        </motion.div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="relative overflow-hidden bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border-pink-200">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-pink-400 rounded-full blur-xl" />
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-400 rounded-full blur-xl" />
        </div>

        <div className="relative p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-pink-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Prepare for Your {getTimeUntilSession()} Check-In
                </h3>
              </div>
              
              <p className="text-sm text-gray-700 mb-4">
                Take a moment to think about what you&apos;d like to discuss with Jordan. 
                Adding topics beforehand helps make your check-in more focused and meaningful.
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Takes 2-3 minutes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  <span>Jordan can add topics too</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={openPreparationModal}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  Prepare Topics
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    // In a real app, this would update the context to dismiss
                    console.log('Reminder dismissed')
                  }}
                >
                  Maybe Later
                </Button>
              </div>
            </div>

            {/* Dismiss button */}
            <button
              onClick={() => {
                // In a real app, this would update the context
                console.log('Banner dismissed')
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}