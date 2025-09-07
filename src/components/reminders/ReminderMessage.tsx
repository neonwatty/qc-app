'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, BellOff, Check, Clock, Calendar, ChevronDown, ChevronUp, Sparkles, Users, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Reminder, NotificationChannel } from '@/types'
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns'

interface ReminderMessageProps {
  reminder: Reminder
  onComplete: (id: string) => void
  onSnooze: (id: string, duration: number) => void
  onReschedule: (id: string, newDate: Date) => void
  isNew?: boolean
}

const categoryColors = {
  habit: 'bg-purple-100 text-purple-800 border-purple-200',
  'check-in': 'bg-pink-100 text-pink-800 border-pink-200',
  'action-item': 'bg-blue-100 text-blue-800 border-blue-200',
  'special-date': 'bg-amber-100 text-amber-800 border-amber-200',
  custom: 'bg-gray-100 text-gray-800 border-gray-200'
}

const categoryIcons = {
  habit: '💜',
  'check-in': '💬',
  'action-item': '✅',
  'special-date': '🎉',
  custom: '⭐'
}

export function ReminderMessage({ reminder, onComplete, onSnooze, onReschedule, isNew = false }: ReminderMessageProps) {
  const [expanded, setExpanded] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const getTimeLabel = () => {
    const date = new Date(reminder.scheduledFor)
    if (isPast(date) && !reminder.completedAt) {
      return `Overdue by ${formatDistanceToNow(date)}`
    }
    if (reminder.completedAt) {
      return `Completed ${formatDistanceToNow(reminder.completedAt, { addSuffix: true })}`
    }
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`
    }
    if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'h:mm a')}`
    }
    return format(date, 'MMM d at h:mm a')
  }

  const getNotificationIcon = () => {
    switch (reminder.notificationChannel) {
      case 'both':
        return <Bell className="w-3 h-3" />
      case 'push':
        return <Bell className="w-3 h-3" />
      case 'in-app':
        return <BellOff className="w-3 h-3" />
      default:
        return null
    }
  }

  const getNotificationLabel = () => {
    switch (reminder.notificationChannel) {
      case 'both':
        return 'Lock screen + In-app'
      case 'push':
        return 'Lock screen only'
      case 'in-app':
        return 'In-app only'
      default:
        return 'No notifications'
    }
  }

  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 20 } : { opacity: 1 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-3"
    >
      <Card 
        className={`p-4 ${reminder.completedAt ? 'opacity-60' : ''} ${
          reminder.isSnoozed ? 'border-orange-200 bg-orange-50' : ''
        } ${isPast(new Date(reminder.scheduledFor)) && !reminder.completedAt ? 'border-red-200 bg-red-50' : ''} ${
          reminder.requestStatus === 'accepted' ? 'border-purple-200' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl mt-1">
            {categoryIcons[reminder.category]}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className={`font-medium ${reminder.completedAt ? 'line-through' : ''}`}>
                  {reminder.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {reminder.message}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="shrink-0"
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge variant="outline" className={categoryColors[reminder.category]}>
                {reminder.category.replace('-', ' ')}
              </Badge>
              
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {getTimeLabel()}
              </Badge>
              
              {reminder.notificationChannel !== 'none' && (
                <Badge variant="outline" className="text-xs">
                  {getNotificationIcon()}
                  <span className="ml-1">{getNotificationLabel()}</span>
                </Badge>
              )}
              
              {reminder.isSnoozed && (
                <Badge variant="outline" className="text-xs bg-orange-100">
                  Snoozed
                </Badge>
              )}
              
              {reminder.requestStatus === 'accepted' && (
                <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                  <Users className="w-3 h-3 mr-1" />
                  Deb request
                </Badge>
              )}
            </div>

            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-3"
              >
                <div className="text-sm text-gray-600">
                  <p><strong>Frequency:</strong> {reminder.frequency}</p>
                  {reminder.assignedTo && (
                    <p><strong>Assigned to:</strong> You</p>
                  )}
                  {reminder.customSchedule && (
                    <p><strong>Custom schedule:</strong> {reminder.customSchedule.time}</p>
                  )}
                  {reminder.requestMessage && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="flex items-start gap-2">
                        <Heart className="w-4 h-4 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-purple-700 mb-1">Deb's request:</p>
                          <p className="text-sm italic text-gray-700">"{reminder.requestMessage}"</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {!reminder.completedAt && (
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      onClick={() => onComplete(reminder.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowActions(!showActions)}
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Snooze
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onReschedule(reminder.id, new Date(Date.now() + 24 * 60 * 60 * 1000))}
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      Reschedule
                    </Button>
                  </div>
                )}

                {showActions && !reminder.completedAt && (
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSnooze(reminder.id, 60)}
                    >
                      1 hour
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSnooze(reminder.id, 240)}
                    >
                      4 hours
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSnooze(reminder.id, 1440)}
                    >
                      Tomorrow
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSnooze(reminder.id, 10080)}
                    >
                      Next week
                    </Button>
                  </div>
                )}

                {reminder.completedAt && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">Great job completing this reminder!</span>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}