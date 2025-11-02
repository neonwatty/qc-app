'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Filter, Bell, Calendar, Search, Check, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ReminderMessage } from './ReminderMessage'
import { ReminderSchedule } from './ReminderSchedule'
import { NotificationDemo } from './NotificationPreview'
import { Reminder, ReminderCategory } from '@/types'
import { format, isToday, isTomorrow, isThisWeek, isPast } from 'date-fns'

interface RemindersChatProps {
  reminders: Reminder[]
}

const filterOptions = [
  { id: 'all', label: 'All', icon: null },
  { id: 'today', label: 'Today', icon: Calendar },
  { id: 'upcoming', label: 'Upcoming', icon: Bell },
  { id: 'completed', label: 'Completed', icon: Check },
  { id: 'overdue', label: 'Overdue', icon: null }
]

const categoryFilters: { id: ReminderCategory | 'all'; label: string; color: string }[] = [
  { id: 'all', label: 'All Categories', color: 'bg-gray-100' },
  { id: 'habit', label: 'Habits', color: 'bg-purple-100' },
  { id: 'check-in', label: 'Check-ins', color: 'bg-pink-100' },
  { id: 'action-item', label: 'Action Items', color: 'bg-blue-100' },
  { id: 'special-date', label: 'Special Dates', color: 'bg-amber-100' },
  { id: 'custom', label: 'Custom', color: 'bg-gray-100' }
]

export function RemindersChat({ reminders: initialReminders }: RemindersChatProps) {
  const [reminders, setReminders] = useState(initialReminders)
  const [filter, setFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState<ReminderCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleComplete = (id: string) => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, completedAt: new Date() } : r
    ))
  }

  const handleSnooze = (id: string, minutes: number) => {
    const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000)
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, isSnoozed: true, snoozeUntil, scheduledFor: snoozeUntil } : r
    ))
  }

  const handleReschedule = (id: string, newDate: Date) => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, scheduledFor: newDate, isSnoozed: false, snoozeUntil: undefined } : r
    ))
  }

  const handleCreateReminder = (reminder: any) => {
    // Create a new personal reminder
    const newReminder: Reminder = {
      id: `reminder-${Date.now()}`,
      title: reminder.title,
      message: reminder.message,
      category: reminder.category || 'custom',
      frequency: reminder.frequency || 'once',
      scheduledFor: reminder.scheduledFor || new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow by default
      notificationChannel: reminder.notificationChannel || 'both',
      createdBy: reminder.createdBy || 'user-1', // Current user
      assignedTo: reminder.assignedTo || 'user-1',
      isActive: true,
      isSnoozed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setReminders(prev => [newReminder, ...prev])
  }

  const filteredReminders = reminders.filter(reminder => {
    // Apply time filter
    const reminderDate = new Date(reminder.scheduledFor)
    switch (filter) {
      case 'today':
        if (!isToday(reminderDate) || reminder.completedAt) return false
        break
      case 'upcoming':
        if (isPast(reminderDate) || reminder.completedAt) return false
        break
      case 'completed':
        if (!reminder.completedAt) return false
        break
      case 'overdue':
        if (!isPast(reminderDate) || reminder.completedAt) return false
        break
    }

    // Apply category filter
    if (categoryFilter !== 'all' && reminder.category !== categoryFilter) {
      return false
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        reminder.title.toLowerCase().includes(query) ||
        reminder.message.toLowerCase().includes(query)
      )
    }

    return true
  }).sort((a, b) => {
    // Sort completed items to the bottom
    if (a.completedAt && !b.completedAt) return 1
    if (!a.completedAt && b.completedAt) return -1
    
    // Sort by scheduled time
    return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
  })

  const getFilterCount = (filterId: string) => {
    const active = reminders.filter(r => r.requestStatus !== 'pending')
    switch (filterId) {
      case 'all':
        return active.length
      case 'today':
        return active.filter(r => isToday(new Date(r.scheduledFor)) && !r.completedAt).length
      case 'upcoming':
        return active.filter(r => !isPast(new Date(r.scheduledFor)) && !r.completedAt).length
      case 'requests':
        return active.filter(r => r.requestedBy && r.requestStatus === 'accepted').length
      case 'completed':
        return active.filter(r => r.completedAt).length
      case 'overdue':
        return active.filter(r => isPast(new Date(r.scheduledFor)) && !r.completedAt).length
      default:
        return 0
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Relationship Reminders</h2>
              <div className="flex gap-2">
                {/* TODO: Implement partner reminder requests feature
                <Button
                  onClick={() => setShowRequestModal(true)}
                  variant="outline"
                  className="border-pink-600 text-pink-600 hover:bg-pink-50"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Request from Partner
                </Button>
                */}
                <Button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Reminder
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search reminders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {filterOptions.map(option => (
                <Button
                  key={option.id}
                  variant={filter === option.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(option.id)}
                  className={filter === option.id ? 'bg-pink-600 hover:bg-pink-700' : ''}
                >
                  {option.icon && <option.icon className="w-4 h-4 mr-1" />}
                  {option.label}
                  <Badge variant="secondary" className="ml-2">
                    {getFilterCount(option.id)}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto mt-2">
              {categoryFilters.map(cat => (
                <Badge
                  key={cat.id}
                  variant={categoryFilter === cat.id ? 'default' : 'outline'}
                  className={`cursor-pointer ${categoryFilter === cat.id ? 'bg-pink-600' : cat.color}`}
                  onClick={() => setCategoryFilter(cat.id)}
                >
                  {cat.label}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Pending Requests */}
          {/* TODO: Implement partner reminder requests feature
          {pendingRequests.length > 0 && (
            <div className="space-y-2 mb-4">
              {pendingRequests.map(request => (
                <ReminderRequestNotification
                  key={request.id}
                  request={request}
                  onAccept={handleAcceptRequest}
                  onDecline={handleDeclineRequest}
                  onModify={handleModifyRequest}
                />
              ))}
            </div>
          )}
          */}

          {/* Messages */}
          <div className="space-y-2">
            {filteredReminders.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No reminders found</p>
              </Card>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredReminders.map((reminder, index) => (
                  <ReminderMessage
                    key={reminder.id}
                    reminder={reminder}
                    onComplete={handleComplete}
                    onSnooze={handleSnooze}
                    onReschedule={handleReschedule}
                    isNew={index === 0 && filter === 'all'}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Quick Create Form */}
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Create New Reminder</h3>
                <div className="space-y-3">
                  <Input placeholder="What would you like to remember?" />
                  <Input placeholder="Add a message..." />
                  <div className="flex gap-2">
                    <Button size="sm">Daily</Button>
                    <Button size="sm" variant="outline">Weekly</Button>
                    <Button size="sm" variant="outline">Once</Button>
                    <Button size="sm" variant="outline">Custom</Button>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-pink-600 hover:bg-pink-700"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Create Reminder
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <ReminderSchedule reminders={reminders} />
          <NotificationDemo />
          
          {/* Stats */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Your Progress</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Completed this week</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completion rate</span>
                <span className="font-medium text-green-600">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active reminders</span>
                <span className="font-medium">{reminders.filter(r => !r.completedAt).length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Request Modal */}
      {/* TODO: Implement partner reminder requests feature
      <ReminderRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleNewRequest}
      />
      */}
    </div>
  )
}