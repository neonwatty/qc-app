import { RelationshipRequest } from '@/types'
import { mockUsers } from './mock-data'

// Helper function to get relative dates
const getRelativeDate = (daysOffset: number, hours = 10, minutes = 0): Date => {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  date.setHours(hours, minutes, 0, 0)
  return date
}

export const mockRelationshipRequests: RelationshipRequest[] = [
  // Pending requests
  {
    id: 'request-1',
    title: 'Plan Anniversary Dinner',
    description: 'Can you handle planning our anniversary dinner next month? You always find the most romantic places and I want this year to be special.',
    category: 'date-night',
    requestedBy: mockUsers[1].id, // Jeremy
    requestedFor: mockUsers[0].id, // Deb
    priority: 'high',
    suggestedDate: getRelativeDate(30, 19), // 30 days from now at 7 PM
    suggestedFrequency: 'once',
    status: 'pending',
    tags: ['anniversary', 'special-occasion'],
    createdAt: getRelativeDate(-1),
    updatedAt: getRelativeDate(-1)
  },
  {
    id: 'request-2',
    title: 'Weekly Grocery Shopping',
    description: 'Could you take over grocery shopping this week? I have a busy work schedule with back-to-back meetings.',
    category: 'task',
    requestedBy: mockUsers[0].id, // Deb
    requestedFor: mockUsers[1].id, // Jeremy
    priority: 'medium',
    suggestedDate: getRelativeDate(2, 10), // 2 days from now at 10 AM
    suggestedFrequency: 'once',
    status: 'pending',
    tags: ['household', 'errands'],
    createdAt: getRelativeDate(-2),
    updatedAt: getRelativeDate(-2)
  },
  {
    id: 'request-3',
    title: 'Morning Coffee Ritual',
    description: 'Let\'s start having morning coffee together before work. Just 15 minutes to connect before the day gets busy.',
    category: 'activity',
    requestedBy: mockUsers[1].id, // Jeremy
    requestedFor: mockUsers[0].id, // Deb
    priority: 'low',
    suggestedDate: getRelativeDate(1, 7, 30), // Tomorrow at 7:30 AM
    suggestedFrequency: 'recurring',
    status: 'pending',
    tags: ['daily-ritual', 'connection'],
    createdAt: getRelativeDate(-3),
    updatedAt: getRelativeDate(-3)
  },

  // Accepted requests
  {
    id: 'request-4',
    title: 'Weekend Hiking Trip',
    description: 'Research and book that hiking trail we talked about. You always find the best outdoor adventures!',
    category: 'activity',
    requestedBy: mockUsers[0].id, // Deb
    requestedFor: mockUsers[1].id, // Jeremy
    priority: 'medium',
    suggestedDate: getRelativeDate(7, 8), // Next week at 8 AM
    suggestedFrequency: 'once',
    status: 'accepted',
    response: 'I\'d love to! I already have a few trails in mind. Let\'s make it happen!',
    respondedAt: getRelativeDate(-5, 14),
    tags: ['adventure', 'outdoor'],
    createdAt: getRelativeDate(-7),
    updatedAt: getRelativeDate(-5)
  },
  {
    id: 'request-5',
    title: 'Financial Planning Session',
    description: 'Can we sit down together and review our budget and savings goals? I think it\'s time we plan for our future.',
    category: 'conversation',
    requestedBy: mockUsers[1].id, // Jeremy
    requestedFor: mockUsers[0].id, // Deb
    priority: 'high',
    suggestedDate: getRelativeDate(3, 20), // 3 days from now at 8 PM
    suggestedFrequency: 'once',
    status: 'accepted',
    response: 'Yes, this is important. Let\'s do it after dinner when we can focus.',
    respondedAt: getRelativeDate(-4, 11),
    tags: ['finances', 'planning'],
    createdAt: getRelativeDate(-6),
    updatedAt: getRelativeDate(-4)
  },

  // Converted to reminder
  {
    id: 'request-6',
    title: 'Pick up flowers weekly',
    description: 'Would love if you could surprise me with fresh flowers sometimes. You know sunflowers are my favorite!',
    category: 'reminder',
    requestedBy: mockUsers[0].id, // Deb
    requestedFor: mockUsers[1].id, // Jeremy
    priority: 'low',
    suggestedDate: getRelativeDate(0, 17), // Today at 5 PM
    suggestedFrequency: 'recurring',
    status: 'converted',
    response: 'Setting a weekly reminder for this. You deserve all the flowers!',
    respondedAt: getRelativeDate(-10, 9),
    convertedToReminderId: 'reminder-flowers-1',
    tags: ['romance', 'surprise'],
    createdAt: getRelativeDate(-14),
    updatedAt: getRelativeDate(-10)
  },

  // Declined request
  {
    id: 'request-7',
    title: 'Host Game Night This Weekend',
    description: 'Can we host the game night at our place this Saturday? I know it\'s last minute but everyone is excited.',
    category: 'activity',
    requestedBy: mockUsers[1].id, // Jeremy
    requestedFor: mockUsers[0].id, // Deb
    priority: 'medium',
    suggestedDate: getRelativeDate(2, 18), // 2 days from now at 6 PM
    suggestedFrequency: 'once',
    status: 'declined',
    response: 'I\'m sorry, but I already have plans with my sister that day. Maybe next weekend?',
    respondedAt: getRelativeDate(-1, 16),
    tags: ['social', 'friends'],
    createdAt: getRelativeDate(-2),
    updatedAt: getRelativeDate(-1)
  },

  // More pending requests
  {
    id: 'request-8',
    title: 'Learn Dance Together',
    description: 'I found a salsa class starting next month. Want to sign up together? It could be our new date night activity!',
    category: 'activity',
    requestedBy: mockUsers[0].id, // Deb
    requestedFor: mockUsers[1].id, // Jeremy
    priority: 'low',
    suggestedDate: getRelativeDate(14, 19), // 2 weeks from now at 7 PM
    suggestedFrequency: 'recurring',
    status: 'pending',
    tags: ['learning', 'date-night', 'fun'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'request-9',
    title: 'Call Your Parents',
    description: 'Your mom mentioned she hasn\'t heard from you in a while. Can you give them a call this week?',
    category: 'reminder',
    requestedBy: mockUsers[1].id, // Jeremy
    requestedFor: mockUsers[0].id, // Deb
    priority: 'medium',
    suggestedDate: getRelativeDate(2, 14), // 2 days from now at 2 PM
    suggestedFrequency: 'once',
    status: 'pending',
    tags: ['family', 'communication'],
    createdAt: getRelativeDate(-1, 8),
    updatedAt: getRelativeDate(-1, 8)
  }
]