import { User, Couple, Category, CheckIn, Note, Milestone } from '@/types'

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Communication',
    icon: '💬',
    description: 'How we talk and listen to each other',
    prompts: [
      'How have we been communicating this week?',
      'What could we improve in our conversations?',
      'When did we feel most heard and understood?'
    ],
    isCustom: false,
    order: 1
  },
  {
    id: '2',
    name: 'Quality Time',
    icon: '⏰',
    description: 'Time spent together and apart',
    prompts: [
      'What quality time did we share recently?',
      'How can we make our time together more meaningful?',
      'What activities would we like to do together?'
    ],
    isCustom: false,
    order: 2
  },
  {
    id: '3',
    name: 'Intimacy',
    icon: '❤️',
    description: 'Physical and emotional closeness',
    prompts: [
      'How connected do we feel?',
      'What made us feel close this week?',
      'How can we deepen our connection?'
    ],
    isCustom: false,
    order: 3
  },
  {
    id: '4',
    name: 'Growth',
    icon: '🌱',
    description: 'Personal and relationship development',
    prompts: [
      'How have we grown individually and together?',
      'What goals are we working towards?',
      'How can we support each other better?'
    ],
    isCustom: false,
    order: 4
  },
  {
    id: '5',
    name: 'Conflict Resolution',
    icon: '🤝',
    description: 'How we handle disagreements',
    prompts: [
      'Were there any conflicts this week?',
      'How did we handle disagreements?',
      'What can we learn from recent challenges?'
    ],
    isCustom: false,
    order: 5
  }
]

export const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'Alex',
    email: 'alex@example.com',
    avatar: '👤',
    partnerId: 'user2',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'user2',
    name: 'Jordan',
    email: 'jordan@example.com',
    avatar: '👤',
    partnerId: 'user1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

export const mockCouple: Couple = {
  id: 'couple1',
  name: 'Alex & Jordan',
  partners: mockUsers,
  createdAt: new Date('2024-01-01'),
  settings: {
    checkInFrequency: 'weekly',
    reminderTime: '20:00',
    categories: mockCategories,
    theme: 'system'
  },
  stats: {
    totalCheckIns: 12,
    currentStreak: 4,
    lastCheckIn: new Date('2024-03-15')
  }
}

export const generateMockCheckIn = (): CheckIn => {
  return {
    id: `checkin-${Date.now()}`,
    coupleId: 'couple1',
    participants: ['user1', 'user2'],
    startedAt: new Date(),
    status: 'in-progress',
    categories: [],
    notes: [],
    actionItems: [],
    mood: {
      before: 3
    }
  }
}

export const generateMockNote = (content: string, privacy: 'private' | 'shared'): Note => {
  return {
    id: `note-${Date.now()}`,
    content,
    privacy,
    authorId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

// Generate 3 months of check-in history
const generateCheckInHistory = (): CheckIn[] => {
  const checkIns: CheckIn[] = []
  const startDate = new Date('2024-06-01')
  const endDate = new Date('2024-09-01')
  
  // Weekly check-ins for 3 months (12 check-ins)
  for (let i = 0; i < 12; i++) {
    const checkInDate = new Date(startDate)
    checkInDate.setDate(startDate.getDate() + (i * 7))
    
    const categories = mockCategories.slice(0, Math.floor(Math.random() * 3) + 1)
    const categoryIds = categories.map(c => c.id)
    
    const checkIn: CheckIn = {
      id: `checkin-${i + 1}`,
      coupleId: 'couple1',
      participants: ['user1', 'user2'],
      startedAt: checkInDate,
      completedAt: new Date(checkInDate.getTime() + 30 * 60000), // 30 mins later
      status: 'completed',
      categories: categoryIds,
      notes: generateNotesForCheckIn(`checkin-${i + 1}`, categoryIds),
      actionItems: generateActionItemsForCheckIn(`checkin-${i + 1}`),
      mood: {
        before: Math.floor(Math.random() * 3) + 2, // 2-4
        after: Math.floor(Math.random() * 2) + 4   // 4-5
      },
      reflection: generateReflection()
    }
    
    checkIns.push(checkIn)
  }
  
  return checkIns
}

const generateNotesForCheckIn = (checkInId: string, categoryIds: string[]): Note[] => {
  const notes: Note[] = []
  
  categoryIds.forEach((categoryId, index) => {
    const category = mockCategories.find(c => c.id === categoryId)
    if (!category) return
    
    // Shared note
    notes.push({
      id: `note-${checkInId}-${categoryId}-shared`,
      content: generateNoteContent(category.name, 'shared'),
      privacy: 'shared',
      authorId: Math.random() > 0.5 ? 'user1' : 'user2',
      categoryId,
      checkInId,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    // Private notes (sometimes)
    if (Math.random() > 0.6) {
      notes.push({
        id: `note-${checkInId}-${categoryId}-private-1`,
        content: generateNoteContent(category.name, 'private'),
        privacy: 'private',
        authorId: 'user1',
        categoryId,
        checkInId,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
    
    if (Math.random() > 0.7) {
      notes.push({
        id: `note-${checkInId}-${categoryId}-private-2`,
        content: generateNoteContent(category.name, 'private'),
        privacy: 'private',
        authorId: 'user2',
        categoryId,
        checkInId,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
  })
  
  return notes
}

const generateActionItemsForCheckIn = (checkInId: string) => {
  const actionItems = []
  const actionItemTemplates = [
    'Plan a date night this week',
    'Have deeper conversations during meals',
    'Practice active listening',
    'Schedule quality time together',
    'Express appreciation daily',
    'Try a new activity together',
    'Discuss future goals',
    'Work on conflict resolution skills',
    'Show more physical affection',
    'Support each other\'s personal growth'
  ]
  
  const numItems = Math.floor(Math.random() * 3) + 1 // 1-3 items
  
  for (let i = 0; i < numItems; i++) {
    const template = actionItemTemplates[Math.floor(Math.random() * actionItemTemplates.length)]
    actionItems.push({
      id: `action-${checkInId}-${i + 1}`,
      title: template,
      description: `Action item from check-in discussion`,
      assignedTo: Math.random() > 0.5 ? 'user1' : 'user2',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      completed: Math.random() > 0.3, // 70% completion rate
      checkInId,
      createdAt: new Date(),
      completedAt: Math.random() > 0.3 ? new Date() : undefined
    })
  }
  
  return actionItems
}

const generateNoteContent = (categoryName: string, privacy: 'shared' | 'private'): string => {
  const sharedNotes = {
    'Communication': [
      'We had great conversations this week about our future plans',
      'Need to work on listening more actively when the other person is speaking',
      'Appreciated how we handled the discussion about household responsibilities',
      'Should check in more regularly about our daily experiences'
    ],
    'Quality Time': [
      'Loved our weekend hiking trip - felt very connected',
      'Need to put phones away during dinner more consistently',
      'Movie nights have been a great way to unwind together',
      'Want to plan more adventures and try new activities'
    ],
    'Intimacy': [
      'Physical affection has been really meaningful lately',
      'Working on being more vulnerable with each other',
      'Appreciating the small gestures of care and attention',
      'Want to continue deepening our emotional connection'
    ],
    'Growth': [
      'Supporting each other\'s career goals has strengthened our bond',
      'Learning to celebrate individual achievements together',
      'Working on personal habits that benefit our relationship',
      'Excited about the progress we\'re both making'
    ],
    'Conflict Resolution': [
      'Handled our disagreement about finances much better this time',
      'Taking breaks during heated discussions really helps',
      'Getting better at seeing each other\'s perspectives',
      'Need to address issues sooner rather than letting them build up'
    ]
  }
  
  const privateNotes = {
    'Communication': [
      'Sometimes feel unheard during our conversations',
      'Want to share more about my day-to-day experiences',
      'Appreciate when my partner asks follow-up questions',
      'Working on expressing my needs more clearly'
    ],
    'Quality Time': [
      'Really value our quiet moments together in the evening',
      'Miss having longer conversations without distractions',
      'Feel most connected when we\'re exploring new places',
      'Need more one-on-one time without other commitments'
    ],
    'Intimacy': [
      'Feeling more comfortable expressing what I need',
      'Physical touch has been really comforting lately',
      'Working on being more present during intimate moments',
      'Appreciate the emotional safety in our relationship'
    ],
    'Growth': [
      'Proud of how I\'ve been handling stress lately',
      'Want to work on being more patient with myself',
      'Grateful for my partner\'s support with my goals',
      'Focusing on personal boundaries and self-care'
    ],
    'Conflict Resolution': [
      'Learning to take responsibility for my part in disagreements',
      'Want to get better at staying calm during difficult conversations',
      'Recognizing my patterns and triggers more clearly',
      'Appreciate when we can repair quickly after arguments'
    ]
  }
  
  const notes = privacy === 'shared' ? sharedNotes : privateNotes
  const categoryNotes = notes[categoryName as keyof typeof notes] || notes['Communication']
  
  return categoryNotes[Math.floor(Math.random() * categoryNotes.length)]
}

const generateReflection = (): string => {
  const reflections = [
    'This week felt really connecting and meaningful. We\'re getting better at having open conversations.',
    'Had some challenges but worked through them well. Feeling optimistic about our progress.',
    'Really appreciating the small moments of connection. Quality over quantity in our time together.',
    'Noticed we\'re both growing individually which is strengthening our relationship.',
    'Conflict resolution is improving. We\'re learning to address issues with more compassion.',
    'Feeling grateful for how supportive we are of each other\'s goals and dreams.',
    'Physical and emotional intimacy both feel healthy and fulfilling right now.',
    'Communication flows more naturally now. We\'re creating a safer space for vulnerability.',
    'The action items from our last check-in really made a positive difference this week.',
    'Looking forward to continuing this journey of growth together.'
  ]
  
  return reflections[Math.floor(Math.random() * reflections.length)]
}

// Generate additional standalone notes (not tied to check-ins)
const generateStandaloneNotes = (): Note[] => {
  const notes: Note[] = []
  const standaloneTopics = [
    'Random thought about our relationship',
    'Gratitude for something my partner did',
    'Personal reflection on growth',
    'Idea for a future date or activity',
    'Observation about our communication patterns',
    'Appreciation for a moment we shared',
    'Goal or intention for our relationship',
    'Memory that made me smile'
  ]
  
  // Generate 15-20 standalone notes
  for (let i = 0; i < 18; i++) {
    const topic = standaloneTopics[Math.floor(Math.random() * standaloneTopics.length)]
    const isPrivate = Math.random() > 0.4 // 60% private notes
    
    notes.push({
      id: `standalone-note-${i + 1}`,
      content: `${topic}: ${generateStandaloneNoteContent()}`,
      privacy: isPrivate ? 'private' : 'shared',
      authorId: Math.random() > 0.5 ? 'user1' : 'user2',
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date within 90 days
      updatedAt: new Date(),
      tags: Math.random() > 0.7 ? ['reflection', 'gratitude'] : undefined
    })
  }
  
  return notes
}

const generateStandaloneNoteContent = (): string => {
  const contents = [
    'Noticed how patient my partner was today when I was stressed about work.',
    'Want to plan a surprise weekend getaway soon.',
    'Grateful for the way we support each other\'s friendships and individual interests.',
    'Thinking about how much we\'ve grown since we started doing regular check-ins.',
    'Loved the spontaneous dance party we had in the kitchen tonight.',
    'Appreciating how we\'re learning to navigate differences with more grace.',
    'Want to try that new restaurant downtown for our next date night.',
    'Feeling thankful for the safety and trust we\'ve built in our relationship.',
    'Noticed we\'ve been laughing together more lately - it feels really good.',
    'Working on being more present during our conversations.',
    'Excited about the vacation we\'re planning for next month.',
    'Appreciate how my partner remembered something important to me today.',
    'Thinking about ways we can better support each other during busy periods.',
    'Grateful for the little rituals we\'ve created together.',
    'Want to have a deeper conversation about our long-term goals soon.'
  ]
  
  return contents[Math.floor(Math.random() * contents.length)]
}

// Export the generated data
export const mockCheckIns: CheckIn[] = generateCheckInHistory()
export const mockNotes: Note[] = [
  ...mockCheckIns.flatMap(checkIn => checkIn.notes),
  ...generateStandaloneNotes()
]

export const mockMilestones: Milestone[] = [
  {
    id: 'milestone1',
    title: 'First Check-in',
    description: 'Completed your first relationship check-in together',
    achievedAt: new Date('2024-06-01'),
    icon: '🎉',
    category: 'celebration',
    coupleId: 'couple1'
  },
  {
    id: 'milestone2',
    title: '5 Check-ins',
    description: 'Reached 5 check-ins milestone',
    achievedAt: new Date('2024-06-28'),
    icon: '🌟',
    category: 'growth',
    coupleId: 'couple1'
  },
  {
    id: 'milestone3',
    title: '10 Check-ins',
    description: 'Reached 10 check-ins milestone - building great habits!',
    achievedAt: new Date('2024-08-10'),
    icon: '🏆',
    category: 'growth',
    coupleId: 'couple1'
  },
  {
    id: 'milestone4',
    title: 'Communication Champion',
    description: 'Consistently worked on communication for 2 months',
    achievedAt: new Date('2024-08-01'),
    icon: '💬',
    category: 'communication',
    coupleId: 'couple1'
  },
  {
    id: 'milestone5',
    title: 'Quality Time Masters',
    description: 'Prioritized quality time together every week',
    achievedAt: new Date('2024-08-15'),
    icon: '⏰',
    category: 'celebration',
    coupleId: 'couple1'
  }
]

// Update couple stats
export const updatedMockCouple: Couple = {
  ...mockCouple,
  stats: {
    totalCheckIns: mockCheckIns.length,
    currentStreak: 12, // All check-ins completed
    lastCheckIn: new Date('2024-08-31')
  }
}