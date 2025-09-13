'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Calendar, Clock, Heart, ArrowLeft, ArrowRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OnboardingData } from '@/app/onboarding/page'

interface ReminderStepProps {
  preferences: OnboardingData['preferences']
  updatePreferences: (preferences: Partial<OnboardingData['preferences']>) => void
  onNext: () => void
  onPrevious: () => void
}

const days = [
  { value: 'monday', label: 'Mon', short: 'M' },
  { value: 'tuesday', label: 'Tue', short: 'T' },
  { value: 'wednesday', label: 'Wed', short: 'W' },
  { value: 'thursday', label: 'Thu', short: 'T' },
  { value: 'friday', label: 'Fri', short: 'F' },
  { value: 'saturday', label: 'Sat', short: 'S' },
  { value: 'sunday', label: 'Sun', short: 'S' }
]

const times = [
  { value: '09:00', label: '9:00 AM', emoji: '☀️' },
  { value: '12:00', label: '12:00 PM', emoji: '🌞' },
  { value: '18:00', label: '6:00 PM', emoji: '🌅' },
  { value: '20:00', label: '8:00 PM', emoji: '🌙' }
]

const quickReminders = [
  { id: 1, text: 'Buy flowers for Deb', emoji: '🌹' },
  { id: 2, text: 'Plan date night', emoji: '💕' },
  { id: 3, text: 'Tell Deb you love them', emoji: '💌' },
  { id: 4, text: 'Give Deb a compliment', emoji: '✨' }
]

export function ReminderStep({
  preferences,
  updatePreferences,
  onNext,
  onPrevious
}: ReminderStepProps) {
  const [selectedDay, setSelectedDay] = useState(preferences.reminderDay || 'sunday')
  const [selectedTime, setSelectedTime] = useState(preferences.reminderTime || '20:00')
  const [additionalReminder, setAdditionalReminder] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const handleSave = () => {
    updatePreferences({
      reminderDay: selectedDay,
      reminderTime: selectedTime
    })
    setShowPreview(true)
    setTimeout(() => setShowPreview(false), 3000)
  }

  const handleNext = () => {
    updatePreferences({
      reminderDay: selectedDay,
      reminderTime: selectedTime
    })
    onNext()
  }

  const getTimeLabel = (time: string) => {
    return times.find(t => t.value === time)?.label || time
  }

  const getDayLabel = (day: string) => {
    return days.find(d => d.value === day)?.label || day
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Set Your First Reminder
        </h2>
        <p className="text-gray-600">
          When should we remind you to check in with Deb?
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Choose a day
          </label>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => (
              <button
                key={day.value}
                onClick={() => setSelectedDay(day.value)}
                className={`p-2 rounded-lg border-2 transition-all text-center ${
                  selectedDay === day.value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="text-xs font-medium text-gray-900">{day.short}</div>
                <div className="text-xs text-gray-500 hidden sm:block">{day.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Pick a time
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {times.map((time) => (
              <button
                key={time.value}
                onClick={() => setSelectedTime(time.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedTime === time.value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="text-lg mb-1">{time.emoji}</div>
                <div className="text-sm font-medium text-gray-900">{time.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add a personal reminder (optional)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {quickReminders.map((reminder) => (
              <button
                key={reminder.id}
                onClick={() => setAdditionalReminder(reminder.text)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  additionalReminder === reminder.text
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{reminder.emoji}</span>
                  <span className="text-sm text-gray-700">{reminder.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {showPreview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200"
        >
          <div className="flex items-start space-x-3">
            <Bell className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium text-gray-900">Reminder Preview</p>
              <p className="text-sm text-gray-600 mt-1">
                Every {getDayLabel(selectedDay)} at {getTimeLabel(selectedTime)}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                "Time for your check-in with Deb! 💕"
              </p>
              {additionalReminder && (
                <p className="text-sm text-pink-600 mt-1">
                  + {additionalReminder}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <div className="bg-purple-50 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <Heart className="w-4 h-4 inline mr-1 text-pink-500" />
          You can add more reminders and customize notifications later in Settings
        </p>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <div className="space-x-2">
          {!showPreview && (
            <Button
              variant="outline"
              onClick={handleSave}
            >
              Preview
            </Button>
          )}
          <Button
            onClick={handleNext}
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