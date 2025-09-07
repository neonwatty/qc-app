import { Reminder } from '@/types'
import { mockUsers } from './mock-data'
import { getRelativeDate, getTodayAt, getTomorrowAt, getThisWeek } from './reminder-dates'

// Mock Reminders Data - Simplified for proof-of-concept (5 reminders total)
export const simplifiedMockReminders: Reminder[] = [
  // Today's Reminders (2)
  {
    id: 'reminder-1',
    title: 'Daily Love Affirmation',
    message: 'Tell Jordan you love them today! A simple "I love you" can make their whole day brighter. 💝',
    category: 'habit',
    frequency: 'daily',
    scheduledFor: getTodayAt(18, 0), // 6:00 PM today
    notificationChannel: 'both',
    createdBy: mockUsers[0].id,
    assignedTo: mockUsers[0].id,
    isActive: true,
    isSnoozed: false,
    createdAt: getRelativeDate(-30), // Created 30 days ago
    updatedAt: getRelativeDate(-1)
  },
  {
    id: 'reminder-2',
    title: 'Phone-Free Dinner',
    message: 'Put your phones away during dinner tonight. Focus on each other and meaningful conversation.',
    category: 'habit',
    frequency: 'daily',
    scheduledFor: getTodayAt(19, 0), // 7:00 PM today
    notificationChannel: 'push',
    createdBy: mockUsers[0].id,
    isActive: true,
    isSnoozed: false,
    createdAt: getRelativeDate(-20),
    updatedAt: getRelativeDate(-1)
  },

  // Tomorrow's Reminder (1)
  {
    id: 'reminder-3',
    title: 'Weekly Check-in',
    message: 'Time for your weekly relationship check-in! Set aside 30 minutes to connect and reflect together.',
    category: 'check-in',
    frequency: 'weekly',
    scheduledFor: getTomorrowAt(19, 0), // 7:00 PM tomorrow
    notificationChannel: 'both',
    createdBy: mockUsers[0].id,
    isActive: true,
    isSnoozed: false,
    createdAt: getRelativeDate(-60),
    updatedAt: getRelativeDate(-7)
  },

  // This Week (1)
  {
    id: 'reminder-4',
    title: 'Date Night Planning',
    message: 'Plan this week\'s date night! Take turns choosing the activity to keep things fresh and exciting.',
    category: 'custom',
    frequency: 'weekly',
    scheduledFor: getThisWeek(5, 18), // Friday at 6:00 PM
    notificationChannel: 'both',
    createdBy: mockUsers[0].id,
    isActive: true,
    isSnoozed: false,
    customSchedule: {
      daysOfWeek: [5], // Friday
      time: '18:00'
    },
    createdAt: getRelativeDate(-45),
    updatedAt: getRelativeDate(-2)
  },

  // Completed Today (1) - to show the feature works
  {
    id: 'reminder-5',
    title: 'Morning Coffee Chat',
    message: 'Start your day with 10 minutes of undivided attention over coffee.',
    category: 'habit',
    frequency: 'daily',
    scheduledFor: getTodayAt(8, 0), // 8:00 AM today
    notificationChannel: 'both',
    createdBy: mockUsers[0].id,
    assignedTo: mockUsers[0].id,
    isActive: true,
    isSnoozed: false,
    completedAt: getTodayAt(8, 30), // Completed at 8:30 AM
    createdAt: getRelativeDate(-90),
    updatedAt: getTodayAt(8, 30)
  }
]