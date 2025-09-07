import { Reminder } from '@/types'
import { mockUsers } from './mock-data'
import { getRelativeDate, getTodayAt, getTomorrowAt, getThisWeek } from './reminder-dates'

// Mock Reminders Data - Simplified for proof-of-concept with partner requests
export const simplifiedMockReminders: Reminder[] = [
  // Partner Request - Accepted (shows with special indicator)
  {
    id: 'reminder-accepted-1',
    title: 'Pick up flowers for Deb',
    message: 'Deb loves fresh flowers - grab their favorites (sunflowers) on the way home!',
    category: 'custom',
    frequency: 'weekly',
    scheduledFor: getTodayAt(17, 30), // 5:30 PM today
    notificationChannel: 'push',
    createdBy: mockUsers[1].id,
    assignedTo: mockUsers[0].id,
    isActive: true,
    isSnoozed: false,
    requestedBy: mockUsers[1].id,
    requestStatus: 'accepted',
    requestMessage: "Would love if you could surprise me with flowers sometimes 🌻",
    requestedAt: getRelativeDate(-7, 14),
    respondedAt: getRelativeDate(-7, 15),
    createdAt: getRelativeDate(-7, 14),
    updatedAt: getRelativeDate(-7, 15)
  },
  // Today's Reminders (2)
  {
    id: 'reminder-1',
    title: 'Daily Love Affirmation',
    message: 'Tell Jeremy you love them today! A simple "I love you" can make their whole day brighter. 💝',
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

  // This Week (1) - Another partner request
  {
    id: 'reminder-4',
    title: 'Plan Weekend Adventure',
    message: 'Research and book that hiking trail we talked about - Jeremy is excited to explore nature together!',
    category: 'custom',
    frequency: 'once',
    scheduledFor: getThisWeek(5, 18), // Friday at 6:00 PM
    notificationChannel: 'both',
    createdBy: mockUsers[1].id,
    assignedTo: mockUsers[0].id,
    isActive: true,
    isSnoozed: false,
    requestedBy: mockUsers[1].id,
    requestStatus: 'accepted',
    requestMessage: "Can you handle planning our weekend adventure? You always find the best trails! 🏔️",
    requestedAt: getRelativeDate(-3, 10),
    respondedAt: getRelativeDate(-3, 11),
    createdAt: getRelativeDate(-3, 10),
    updatedAt: getRelativeDate(-3, 11)
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