'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Repeat, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, addDays, addWeeks, addMonths, isAfter, isBefore, parseISO } from 'date-fns'

interface Reminder {
  id: string
  name: string
  type: 'one-time' | 'recurring'
  frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  time: string
  nextOccurrence: Date
  daysOfWeek?: number[]
  dayOfMonth?: number
  enabled: boolean
  category?: string
  notificationChannels: ('push' | 'email' | 'sms')[]
}

interface SchedulePreview {
  date: Date
  reminders: Reminder[]
}

export function ReminderScheduler() {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      name: 'Weekly Check-in',
      type: 'recurring',
      frequency: 'weekly',
      time: '19:00',
      nextOccurrence: new Date(),
      daysOfWeek: [0], // Sunday
      enabled: true,
      category: 'check-in',
      notificationChannels: ['push', 'email']
    },
    {
      id: '2',
      name: 'Monthly Relationship Review',
      type: 'recurring',
      frequency: 'monthly',
      time: '20:00',
      nextOccurrence: new Date(),
      dayOfMonth: 1,
      enabled: true,
      category: 'review',
      notificationChannels: ['push', 'email']
    }
  ])

  const [showAddReminder, setShowAddReminder] = useState(false)
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    name: '',
    type: 'recurring',
    frequency: 'weekly',
    time: '19:00',
    daysOfWeek: [0],
    enabled: true,
    notificationChannels: ['push']
  })

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const calculateNextOccurrence = (reminder: Reminder): Date => {
    const now = new Date()
    let next = new Date()
    const [hours, minutes] = reminder.time.split(':').map(Number)
    next.setHours(hours, minutes, 0, 0)

    if (reminder.type === 'recurring' && reminder.frequency) {
      switch (reminder.frequency) {
        case 'daily':
          if (isBefore(next, now)) {
            next = addDays(next, 1)
          }
          break
        case 'weekly':
          if (reminder.daysOfWeek && reminder.daysOfWeek.length > 0) {
            const today = now.getDay()
            let daysUntilNext = Infinity
            
            reminder.daysOfWeek.forEach(day => {
              let daysToAdd = (day - today + 7) % 7
              if (daysToAdd === 0 && isBefore(next, now)) {
                daysToAdd = 7
              }
              if (daysToAdd < daysUntilNext) {
                daysUntilNext = daysToAdd
              }
            })
            
            next = addDays(now, daysUntilNext)
            next.setHours(hours, minutes, 0, 0)
          }
          break
        case 'biweekly':
          if (isBefore(next, now)) {
            next = addWeeks(next, 2)
          }
          break
        case 'monthly':
          if (reminder.dayOfMonth) {
            next.setDate(reminder.dayOfMonth)
            if (isBefore(next, now)) {
              next = addMonths(next, 1)
            }
          }
          break
      }
    }

    return next
  }

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(reminder =>
      reminder.id === id ? { ...reminder, enabled: !reminder.enabled } : reminder
    ))
  }

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id))
  }

  const addReminder = () => {
    if (newReminder.name) {
      const reminder: Reminder = {
        id: Date.now().toString(),
        name: newReminder.name,
        type: newReminder.type || 'recurring',
        frequency: newReminder.frequency,
        time: newReminder.time || '19:00',
        nextOccurrence: new Date(),
        daysOfWeek: newReminder.daysOfWeek,
        dayOfMonth: newReminder.dayOfMonth,
        enabled: true,
        notificationChannels: newReminder.notificationChannels || ['push']
      }
      reminder.nextOccurrence = calculateNextOccurrence(reminder)
      setReminders(prev => [...prev, reminder])
      setShowAddReminder(false)
      setNewReminder({
        name: '',
        type: 'recurring',
        frequency: 'weekly',
        time: '19:00',
        daysOfWeek: [0],
        enabled: true,
        notificationChannels: ['push']
      })
    }
  }

  const toggleDayOfWeek = (day: number) => {
    const currentDays = newReminder.daysOfWeek || []
    const updatedDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day]
    setNewReminder(prev => ({ ...prev, daysOfWeek: updatedDays }))
  }

  const getUpcomingReminders = (): SchedulePreview[] => {
    const preview: SchedulePreview[] = []
    const today = new Date()
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i)
      const dayReminders = reminders.filter(reminder => {
        if (!reminder.enabled) return false
        const reminderDate = reminder.nextOccurrence
        return reminderDate.toDateString() === date.toDateString()
      })
      
      if (dayReminders.length > 0) {
        preview.push({ date, reminders: dayReminders })
      }
    }
    
    return preview
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'check-in': return 'bg-pink-100 text-pink-700'
      case 'review': return 'bg-purple-100 text-purple-700'
      case 'milestone': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Reminder Scheduler
        </h2>
        <p className="text-sm text-gray-600">
          Set up automated reminders for check-ins and relationship activities
        </p>
      </div>

      {/* Active Reminders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Active Reminders</CardTitle>
            <CardDescription>
              Your scheduled reminders and their next occurrence
            </CardDescription>
          </div>
          <Button 
            size="sm"
            onClick={() => setShowAddReminder(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Reminder
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {reminders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No reminders scheduled</p>
              <p className="text-sm mt-1">Add your first reminder to get started</p>
            </div>
          ) : (
            reminders.map((reminder) => (
              <div 
                key={reminder.id}
                className={`
                  p-4 rounded-lg border transition-all
                  ${reminder.enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {reminder.name}
                      </span>
                      {reminder.category && (
                        <Badge className={getCategoryColor(reminder.category)}>
                          {reminder.category}
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {reminder.type === 'one-time' ? 'One-time' : reminder.frequency}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{reminder.time}</span>
                      </div>

                      {reminder.daysOfWeek && reminder.daysOfWeek.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Repeat className="h-3 w-3" />
                          <span>
                            {reminder.daysOfWeek.map(d => daysOfWeek[d]).join(', ')}
                          </span>
                        </div>
                      )}

                      {reminder.dayOfMonth && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Day {reminder.dayOfMonth}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs font-medium text-gray-500">Next:</span>
                      <span className="text-xs text-gray-700">
                        {format(calculateNextOccurrence(reminder), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs font-medium text-gray-500">Notify via:</span>
                      <div className="flex items-center space-x-1">
                        {reminder.notificationChannels.map(channel => (
                          <Badge key={channel} variant="secondary" className="text-xs">
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleReminder(reminder.id)}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${reminder.enabled ? 'bg-pink-600' : 'bg-gray-200'}
                      `}
                    >
                      <span className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${reminder.enabled ? 'translate-x-6' : 'translate-x-1'}
                      `} />
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteReminder(reminder.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add Reminder Modal */}
      {showAddReminder && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Reminder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reminder Name
              </label>
              <input
                type="text"
                value={newReminder.name}
                onChange={(e) => setNewReminder(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Weekly Check-in"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['recurring', 'one-time'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setNewReminder(prev => ({ 
                      ...prev, 
                      type: type as 'recurring' | 'one-time' 
                    }))}
                    className={`
                      px-3 py-2 text-sm font-medium rounded-lg border-2 transition-colors capitalize
                      ${newReminder.type === type
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    {type.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {newReminder.type === 'recurring' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    value={newReminder.frequency}
                    onChange={(e) => setNewReminder(prev => ({ 
                      ...prev, 
                      frequency: e.target.value as any 
                    }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                {newReminder.frequency === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Days of Week
                    </label>
                    <div className="grid grid-cols-7 gap-1">
                      {daysOfWeek.map((day, index) => (
                        <button
                          key={day}
                          onClick={() => toggleDayOfWeek(index)}
                          className={`
                            p-2 text-xs font-medium rounded transition-colors
                            ${newReminder.daysOfWeek?.includes(index)
                              ? 'bg-pink-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }
                          `}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {newReminder.frequency === 'monthly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day of Month
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={newReminder.dayOfMonth || 1}
                      onChange={(e) => setNewReminder(prev => ({ 
                        ...prev, 
                        dayOfMonth: parseInt(e.target.value) 
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                value={newReminder.time}
                onChange={(e) => setNewReminder(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddReminder(false)
                  setNewReminder({
                    name: '',
                    type: 'recurring',
                    frequency: 'weekly',
                    time: '19:00',
                    daysOfWeek: [0],
                    enabled: true,
                    notificationChannels: ['push']
                  })
                }}
              >
                Cancel
              </Button>
              <Button onClick={addReminder}>
                Add Reminder
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Schedule Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming Reminders</CardTitle>
          <CardDescription>
            Preview of your reminders for the next 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {getUpcomingReminders().length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No reminders scheduled for the next 7 days</p>
            </div>
          ) : (
            <div className="space-y-3">
              {getUpcomingReminders().map((preview, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-20 text-sm font-medium text-gray-600">
                    {format(preview.date, 'EEE, MMM d')}
                  </div>
                  <div className="flex-1 space-y-1">
                    {preview.reminders.map((reminder) => (
                      <div 
                        key={reminder.id}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-gray-700">{reminder.name}</span>
                        <span className="text-gray-500">at {reminder.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}