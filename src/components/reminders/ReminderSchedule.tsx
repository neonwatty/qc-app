'use client'

import { Card } from '@/components/ui/card'
import { Bell, BellOff, Clock } from 'lucide-react'
import { Reminder } from '@/types'
import { format, isToday } from 'date-fns'

interface ReminderScheduleProps {
  reminders: Reminder[]
}

export function ReminderSchedule({ reminders }: ReminderScheduleProps) {
  const todayReminders = reminders
    .filter(r => isToday(new Date(r.scheduledFor)) && !r.completedAt)
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())

  if (todayReminders.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Today&apos;s Schedule
        </h3>
        <p className="text-sm text-gray-500">No reminders scheduled for today</p>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Today&apos;s Schedule
      </h3>
      <div className="space-y-2">
        {todayReminders.map((reminder, index) => {
          const isNext = index === 0
          const time = format(new Date(reminder.scheduledFor), 'h:mm a')
          
          return (
            <div
              key={reminder.id}
              className={`flex items-center gap-3 text-sm ${
                isNext ? 'font-medium text-pink-600' : 'text-gray-600'
              }`}
            >
              <span className="w-16 text-right">{time}</span>
              <div className="w-px h-4 bg-gray-300" />
              <div className="flex items-center gap-2 flex-1">
                {reminder.notificationChannel === 'both' || reminder.notificationChannel === 'push' ? (
                  <Bell className="w-3 h-3" />
                ) : (
                  <BellOff className="w-3 h-3" />
                )}
                <span className="truncate">{reminder.title}</span>
                {isNext && (
                  <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full ml-auto">
                    Next
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}