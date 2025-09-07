import { User, Couple, Category, CheckIn, Note, Milestone, Reminder } from '@/types'
import { demoScenarios, demoPersonas, scenarioNoteTemplates, communicationStyles } from './demo-scenarios'

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

// Use diverse personas from demo scenarios - defaulting to Sarah & Marcus
export const mockUsers: User[] = [
  {
    ...demoPersonas.sarah,
    partnerId: demoPersonas.marcus.id,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-08-31')
  },
  {
    ...demoPersonas.marcus,
    partnerId: demoPersonas.sarah.id,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-08-31')
  }
]

export const mockCouple: Couple = {
  id: 'couple-sarah-marcus',
  name: 'Sarah & Marcus',
  partners: mockUsers,
  createdAt: new Date('2024-03-01'),
  settings: {
    checkInFrequency: 'weekly',
    reminderTime: '19:00',
    categories: mockCategories,
    theme: 'system'
  },
  stats: {
    totalCheckIns: 28,
    currentStreak: 6,
    lastCheckIn: new Date('2024-08-31')
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

// Generate 6+ months of comprehensive check-in history with varied scenarios
const generateCheckInHistory = (): CheckIn[] => {
  const checkIns: CheckIn[] = []
  const startDate = new Date('2024-03-01') // Started 6 months ago
  const endDate = new Date('2024-08-31')
  
  // Weekly check-ins for 6 months (26 check-ins) with some missed weeks for realism
  const totalWeeks = 26
  const completedCheckIns = 28 // Some weeks had multiple check-ins, some were missed
  
  // Generate timeline events that affect check-ins
  const timelineEvents = [
    { week: 3, event: 'work-stress', description: 'Sarah had a big project deadline' },
    { week: 8, event: 'vacation', description: 'Weekend getaway to Napa Valley' },
    { week: 12, event: 'family-visit', description: 'Marcus\'s parents visited for a week' },
    { week: 16, event: 'promotion', description: 'Sarah got promoted at work' },
    { week: 20, event: 'moved-in', description: 'Moved in together officially' },
    { week: 23, event: 'adopted-pet', description: 'Adopted rescue dog Milo' },
    { week: 25, event: 'relationship-milestone', description: '2.5 year anniversary' }
  ]
  
  for (let i = 0; i < completedCheckIns; i++) {
    // Some weeks have gaps to simulate real life
    const weekMultiplier = i < 20 ? i + (Math.random() > 0.8 ? 1 : 0) : i + Math.floor(Math.random() * 2)
    const checkInDate = new Date(startDate)
    checkInDate.setDate(startDate.getDate() + (weekMultiplier * 7))
    
    // Find relevant timeline event
    const relevantEvent = timelineEvents.find(event => 
      Math.abs(event.week - weekMultiplier) <= 1
    )
    
    // Categories vary based on life events and relationship stage
    const categoryIds = generateRealisticCategories(weekMultiplier, relevantEvent)
    
    // Session duration varies (15-60 minutes)
    const sessionDuration = (Math.random() * 45 + 15) * 60000
    
    const checkIn: CheckIn = {
      id: `checkin-${i + 1}`,
      coupleId: 'couple-sarah-marcus',
      participants: [demoPersonas.sarah.id, demoPersonas.marcus.id],
      startedAt: checkInDate,
      completedAt: new Date(checkInDate.getTime() + sessionDuration),
      status: 'completed',
      categories: categoryIds,
      notes: generateNotesForCheckIn(`checkin-${i + 1}`, categoryIds, weekMultiplier, relevantEvent),
      actionItems: generateActionItemsForCheckIn(`checkin-${i + 1}`, relevantEvent),
      mood: generateRealisticMood(relevantEvent),
      reflection: generateContextualReflection(weekMultiplier, relevantEvent)
    }
    
    checkIns.push(checkIn)
  }
  
  return checkIns.sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime())
}

const generateRealisticCategories = (weekNumber: number, event?: any): string[] => {
  const baseCategories = ['1'] // Always include Communication
  
  // Add categories based on relationship progression and events
  if (weekNumber < 8) {
    // Early relationship focus
    baseCategories.push('2', '3') // Quality Time, Intimacy
  } else if (weekNumber < 16) {
    // Building together phase
    baseCategories.push('2', '4') // Quality Time, Growth
  } else if (weekNumber < 24) {
    // Serious commitment phase
    baseCategories.push('4', '5') // Growth, Conflict Resolution
  } else {
    // Established couple phase
    baseCategories.push('2', '3', '4') // Quality Time, Intimacy, Growth
  }
  
  // Event-specific category emphasis
  if (event) {
    switch (event.event) {
      case 'work-stress':
      case 'promotion':
        baseCategories.push('5') // Conflict Resolution
        break
      case 'vacation':
      case 'moved-in':
        baseCategories.push('2', '3') // Quality Time, Intimacy
        break
      case 'family-visit':
        baseCategories.push('1', '5') // Communication, Conflict Resolution
        break
      case 'adopted-pet':
      case 'relationship-milestone':
        baseCategories.push('4') // Growth
        break
    }
  }
  
  // Remove duplicates and limit to 3 categories max
  return [...new Set(baseCategories)].slice(0, 3)
}

const generateRealisticMood = (event?: any) => {
  let baseBefore = 3.5
  let baseAfter = 4.2
  
  if (event) {
    switch (event.event) {
      case 'work-stress':
        baseBefore = 2.8
        baseAfter = 3.5
        break
      case 'vacation':
      case 'relationship-milestone':
        baseBefore = 4.0
        baseAfter = 4.8
        break
      case 'promotion':
      case 'moved-in':
      case 'adopted-pet':
        baseBefore = 3.8
        baseAfter = 4.6
        break
    }
  }
  
  return {
    before: Math.max(1, Math.min(5, Math.round(baseBefore + (Math.random() - 0.5) * 0.8))),
    after: Math.max(1, Math.min(5, Math.round(baseAfter + (Math.random() - 0.5) * 0.6)))
  }
}

const generateNotesForCheckIn = (checkInId: string, categoryIds: string[], weekNumber: number, event?: any): Note[] => {
  const notes: Note[] = []
  
  categoryIds.forEach((categoryId, index) => {
    const category = mockCategories.find(c => c.id === categoryId)
    if (!category) return
    
    // Shared note - always present
    const sharedAuthor = Math.random() > 0.5 ? demoPersonas.sarah.id : demoPersonas.marcus.id
    notes.push({
      id: `note-${checkInId}-${categoryId}-shared`,
      content: generateContextualNoteContent(category.name, 'shared', weekNumber, event, sharedAuthor),
      privacy: 'shared',
      authorId: sharedAuthor,
      categoryId,
      checkInId,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    // Sarah's private notes (analytical style)
    if (Math.random() > 0.5) {
      notes.push({
        id: `note-${checkInId}-${categoryId}-private-sarah`,
        content: generateContextualNoteContent(category.name, 'private', weekNumber, event, demoPersonas.sarah.id),
        privacy: 'private',
        authorId: demoPersonas.sarah.id,
        categoryId,
        checkInId,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
    
    // Marcus's private notes (expressive style)
    if (Math.random() > 0.6) {
      notes.push({
        id: `note-${checkInId}-${categoryId}-private-marcus`,
        content: generateContextualNoteContent(category.name, 'private', weekNumber, event, demoPersonas.marcus.id),
        privacy: 'private',
        authorId: demoPersonas.marcus.id,
        categoryId,
        checkInId,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
  })
  
  return notes
}

const generateActionItemsForCheckIn = (checkInId: string, event?: any) => {
  const actionItems = []
  
  // Enhanced action item templates by category and context
  const actionItemTemplates = {
    communication: [
      'Practice active listening during conversations',
      'Set aside phone-free time for deeper discussions',
      'Ask each other thoughtful questions about hopes and dreams',
      'Share one thing we\'re grateful for about each other daily',
      'Work on expressing needs clearly and kindly',
      'Practice conflict resolution - focus on understanding first'
    ],
    quality_time: [
      'Plan a weekly date night activity',
      'Try cooking a new recipe together this weekend',
      'Take evening walks together without phones',
      'Start a shared hobby or activity',
      'Create a morning coffee ritual together',
      'Plan a mini adventure for this weekend'
    ],
    intimacy: [
      'Increase daily physical affection (hugs, kisses, touches)',
      'Share something vulnerable we haven\'t talked about before',
      'Plan romantic surprise for each other',
      'Write love notes and leave them for each other',
      'Create sacred space for intimate conversations',
      'Practice expressing love in each other\'s love language'
    ],
    growth: [
      'Support each other\'s personal goals this week',
      'Read a relationship book together',
      'Attend a couples workshop or event',
      'Discuss our individual and shared dreams',
      'Try meditation or mindfulness practice together',
      'Set boundaries to protect our relationship time'
    ],
    fun: [
      'Plan a surprise date for each other',
      'Try a new restaurant or cuisine together',
      'Have a game night or movie marathon',
      'Take photos of our favorite memories this week',
      'Dance together in the living room',
      'Explore a new part of the city together'
    ],
    'building-trust': [
      'Share daily highlights and challenges openly',
      'Follow through on small promises we make',
      'Practice being vulnerable about insecurities',
      'Support each other during stressful times',
      'Show appreciation for efforts, not just results',
      'Create time for check-ins about relationship needs'
    ]
  }
  
  // Event-specific action items
  const eventSpecificItems = {
    'work-stress': [
      'Plan stress-relief activities together',
      'Create buffer time after work to decompress',
      'Practice supporting without trying to "fix" everything'
    ],
    'vacation': [
      'Plan our next adventure together',
      'Create photo album or scrapbook from our trip',
      'Incorporate vacation lessons into daily life'
    ],
    'moved-in': [
      'Establish household routines that work for both',
      'Create designated spaces for alone time',
      'Plan housewarming celebration with friends'
    ],
    'promotion': [
      'Celebrate this achievement in a meaningful way',
      'Discuss how this change affects our future plans',
      'Plan something special with the extra income'
    ]
  }
  
  const numItems = Math.floor(Math.random() * 3) + 1 // 1-3 items
  let availableTemplates = []
  
  // Add event-specific items if relevant
  if (event && eventSpecificItems[event.event as keyof typeof eventSpecificItems]) {
    availableTemplates.push(...eventSpecificItems[event.event as keyof typeof eventSpecificItems])
  }
  
  // Add general category items
  Object.values(actionItemTemplates).forEach(categoryItems => {
    availableTemplates.push(...categoryItems)
  })
  
  const usedTemplates = new Set()
  
  for (let i = 0; i < numItems && availableTemplates.length > usedTemplates.size; i++) {
    let template
    do {
      template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)]
    } while (usedTemplates.has(template))
    
    usedTemplates.add(template)
    
    // More varied descriptions
    const descriptions = [
      'Something we\'d like to work on together this week',
      'An area where we can grow closer as a couple',
      'A way to strengthen our connection and understanding',
      'Action step from our meaningful conversation today',
      'Goal to enhance our relationship this week'
    ]
    
    actionItems.push({
      id: `action-${checkInId}-${i + 1}`,
      title: template,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      assignedTo: Math.random() > 0.5 ? demoPersonas.sarah.id : demoPersonas.marcus.id,
      dueDate: new Date(Date.now() + (Math.floor(Math.random() * 7) + 3) * 24 * 60 * 60 * 1000), // 3-10 days
      completed: Math.random() > 0.25, // 75% completion rate
      checkInId,
      createdAt: new Date(),
      completedAt: Math.random() > 0.25 ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000) : undefined
    })
  }
  
  return actionItems
}

// New comprehensive contextual note generation
const generateContextualNoteContent = (
  categoryName: string, 
  privacy: 'shared' | 'private', 
  weekNumber: number, 
  event?: any, 
  authorId?: string
): string => {
  const isSarah = authorId === demoPersonas.sarah.id
  const isShared = privacy === 'shared'
  
  // Get base templates from scenario-specific content
  const baseTemplates = scenarioNoteTemplates['young-professionals']
  const categoryKey = categoryName.toLowerCase().replace(' ', '-') as keyof typeof baseTemplates
  
  // Event-specific content
  if (event) {
    return generateEventSpecificNote(categoryName, privacy, event, isSarah)
  }
  
  // Relationship progression-based content
  if (weekNumber < 8) {
    return generateEarlyRelationshipNote(categoryName, privacy, isSarah)
  } else if (weekNumber < 16) {
    return generateBuildingTogetherNote(categoryName, privacy, isSarah)
  } else if (weekNumber < 24) {
    return generateSeriousCommitmentNote(categoryName, privacy, isSarah)
  } else {
    return generateEstablishedCoupleNote(categoryName, privacy, isSarah)
  }
}

const generateEventSpecificNote = (categoryName: string, privacy: 'shared' | 'private', event: any, isSarah: boolean): string => {
  const eventNotes = {
    'work-stress': {
      Communication: {
        shared: [
          'Been supporting each other through this stressful work period - grateful for the patience',
          'Had to really work on communicating needs when we\'re both exhausted',
          'Learning to give space when one person is overwhelmed with deadlines'
        ],
        private: isSarah ? [
          'Really appreciated Marcus giving me space to vent about work without trying to fix everything',
          'Noticed I get more irritable when work stress builds up - need to communicate this better',
          'Grateful that Marcus checks in on how my project is going'
        ] : [
          'Trying to be supportive without being overwhelming when Sarah\'s stressed',
          'Sometimes feel shut out when work takes over, but understanding it\'s temporary',
          'Learning when to offer solutions vs just listening'
        ]
      },
      'Quality Time': {
        shared: [
          'Had to be creative about finding connection time during this busy work period',
          'Even short check-ins over coffee mean a lot when schedules are crazy',
          'Looking forward to celebrating when this project deadline passes'
        ],
        private: isSarah ? [
          'Miss our longer conversations but appreciate Marcus adapting to my schedule',
          'Quick morning hugs before work have been keeping me grounded',
          'Need to make sure I don\'t take Marcus for granted during busy times'
        ] : [
          'Been doing more cooking and household tasks to support Sarah through her deadline',
          'Missing our usual weekend adventures but know this is temporary',
          'Love seeing Sarah in her element even when she\'s stressed'
        ]
      }
    },
    'vacation': {
      Communication: {
        shared: [
          'The weekend away was perfect for having deeper conversations without distractions',
          'Loved having uninterrupted time to really listen to each other',
          'Talked about future travel dreams and made some exciting plans'
        ],
        private: isSarah ? [
          'Felt so connected during our long talks on the hiking trail',
          'Marcus was so present and engaged - no phone distractions',
          'Appreciated how we could just be silly and playful together'
        ] : [
          'Sarah seemed so relaxed and happy - love seeing this side of her',
          'Our conversations flowed so naturally without work stress',
          'Realized how much I missed having her full attention'
        ]
      },
      'Quality Time': {
        shared: [
          'Every moment felt intentional and connected during our getaway',
          'Loved trying new activities together - wine tasting was so fun!',
          'Want to make these weekend escapes a regular tradition'
        ],
        private: isSarah ? [
          'The sunset dinner was incredibly romantic - felt like early dating again',
          'Marcus planned such thoughtful surprises throughout the weekend',
          'Already looking forward to our next adventure together'
        ] : [
          'Watching Sarah light up during the wine tour made my heart so full',
          'Our spontaneous dance party in the hotel room was pure joy',
          'These unplanned moments of connection are what I treasure most'
        ]
      }
    },
    'moved-in': {
      Communication: {
        shared: [
          'Living together officially has brought up interesting conversations about space and routines',
          'Getting better at talking through household decisions together',
          'Navigating different morning routines and finding our rhythm'
        ],
        private: isSarah ? [
          'Adjusting to having less alone time but loving the constant connection',
          'Marcus is so respectful of my work-from-home space setup',
          'Learning to communicate when I need quiet time to recharge'
        ] : [
          'Sarah\'s organizational systems are helping me be more structured',
          'Love the casual conversations that happen when we\'re just sharing space',
          'Learning Sarah\'s subtle cues for when she needs space vs connection'
        ]
      },
      Intimacy: {
        shared: [
          'Physical closeness feels so natural now that we\'re sharing daily life',
          'Morning coffee together has become our favorite intimate ritual',
          'Emotional intimacy has deepened with all the small daily moments'
        ],
        private: isSarah ? [
          'Love falling asleep and waking up next to Marcus every day',
          'Even mundane tasks like grocery shopping feel romantic now',
          'Feeling so safe and secure in this next step we\'ve taken'
        ] : [
          'Sarah\'s little habits and quirks make me fall more in love daily',
          'The way she hums while cooking dinner melts my heart every time',
          'Never imagined how intimate it would feel to truly share a home'
        ]
      }
    }
  }
  
  const categoryNotes = eventNotes[event.event as keyof typeof eventNotes]
  if (!categoryNotes || !categoryNotes[categoryName as keyof typeof categoryNotes]) {
    return generateBasicNote(categoryName, privacy, isSarah)
  }
  
  const notes = categoryNotes[categoryName as keyof typeof categoryNotes][privacy]
  return notes[Math.floor(Math.random() * notes.length)]
}

const generateEarlyRelationshipNote = (categoryName: string, privacy: 'shared' | 'private', isSarah: boolean): string => {
  // Early relationship notes (weeks 1-8)
  const templates = {
    Communication: {
      shared: [
        'Still learning each other\'s communication styles - it\'s exciting to discover new things',
        'Had our first deeper conversation about family backgrounds and values',
        'Getting better at being vulnerable and sharing what\'s really on our minds'
      ],
      private: isSarah ? [
        'Marcus has such an expressive way of sharing feelings - so different from me',
        'Learning to open up more instead of just analyzing everything internally',
        'Love how curious Marcus is about my thoughts and perspectives'
      ] : [
        'Sarah\'s thoughtful questions help me process my emotions better',
        'Appreciate how Sarah really listens before responding',
        'Sometimes feel like I share too much too fast - working on pacing'
      ]
    },
    'Quality Time': {
      shared: [
        'Every moment together still feels new and exciting',
        'Discovered we both love trying new restaurants and exploring the city',
        'Weekend adventures are becoming our favorite tradition'
      ],
      private: isSarah ? [
        'Marcus brings out my spontaneous side in the best way',
        'Love how present Marcus is during our dates - no distractions',
        'Starting to crave our time together when we\'re apart'
      ] : [
        'Sarah\'s planning skills make our dates so much more interesting',
        'The way Sarah gets excited about little discoveries makes me smile',
        'Already thinking about her when we\'re not together'
      ]
    },
    Intimacy: {
      shared: [
        'Physical connection is building naturally as we get more comfortable',
        'Emotional intimacy is growing with each vulnerable conversation',
        'Learning what makes each other feel loved and appreciated'
      ],
      private: isSarah ? [
        'Marcus\'s gentle approach to physical intimacy makes me feel so safe',
        'Surprised by how easy it is to be affectionate with Marcus',
        'Feeling more confident expressing my needs and desires'
      ] : [
        'Sarah\'s thoughtful approach to intimacy is teaching me patience',
        'Love the little ways Sarah shows affection - holding hands, gentle touches',
        'Building emotional intimacy feels just as important as physical'
      ]
    }
  }
  
  const categoryNotes = templates[categoryName as keyof typeof templates]
  if (!categoryNotes) return generateBasicNote(categoryName, privacy, isSarah)
  
  const notes = categoryNotes[privacy]
  return notes[Math.floor(Math.random() * notes.length)]
}

const generateBasicNote = (categoryName: string, privacy: 'shared' | 'private', isSarah: boolean): string => {
  return `Reflecting on our ${categoryName.toLowerCase()} this week - grateful for how we\'re growing together.`
}

// Complete implementation for relationship stages
const generateBuildingTogetherNote = (categoryName: string, privacy: 'shared' | 'private', isSarah: boolean): string => {
  // Building together phase (weeks 8-16)
  const templates = {
    Communication: {
      shared: [
        'Our communication rhythm is really finding its groove - we know each other\'s patterns now',
        'Had a meaningful conversation about our different conflict styles and how to bridge them',
        'Starting to develop our own language and inside jokes that make us feel like a team',
        'Learning to balance honesty with kindness in our daily interactions'
      ],
      private: isSarah ? [
        'Marcus\'s expressive style is teaching me to be more open about my feelings',
        'I appreciate how Marcus gives me time to process before expecting responses',
        'Learning that my analytical approach can sometimes feel cold - working on warmth',
        'Love how we can communicate so much with just a look or gesture now'
      ] : [
        'Sarah\'s thoughtful communication style is helping me be more intentional with words',
        'Appreciating how Sarah processes things - her insights are always worth waiting for',
        'Learning to read Sarah\'s subtle cues better - she doesn\'t always need me to fill silence',
        'Our check-ins are becoming one of my favorite conversations each week'
      ]
    },
    'Quality Time': {
      shared: [
        'We\'ve found our favorite ways to spend time together - hiking, cooking, and long talks',
        'Quality time feels natural now - we don\'t have to plan everything, it just happens',
        'Balancing couple time with friend time and individual pursuits feels healthy',
        'Our weekend routines are becoming some of my favorite relationship traditions'
      ],
      private: isSarah ? [
        'Love how comfortable silence can be with Marcus - we don\'t need to fill every moment',
        'Marcus makes even mundane activities feel special and fun',
        'Really value the mix of adventure and cozy home time we\'ve created',
        'Looking forward to planning bigger adventures together - maybe a real vacation'
      ] : [
        'Sarah brings such thoughtful planning to our time together - I love her itineraries',
        'The way Sarah gets excited about small details makes everything more meaningful',
        'Love that we can be spontaneous but also make solid plans together',
        'Our shared interests are expanding - Sarah got me into hiking, I got her into concerts'
      ]
    },
    Intimacy: {
      shared: [
        'Physical and emotional intimacy are both deepening as we get more comfortable',
        'Learning each other\'s love languages and what makes us feel most connected',
        'Vulnerability is becoming easier - we\'re creating real safety together',
        'Intimacy isn\'t just physical - it\'s in the daily moments of care and attention'
      ],
      private: isSarah ? [
        'Feeling more confident expressing my physical needs and desires',
        'Marcus\'s patience and attentiveness make intimacy feel safe and joyful',
        'Love how emotional intimacy makes physical connection more meaningful',
        'Learning to be present instead of analyzing every moment'
      ] : [
        'Sarah\'s growing confidence in intimacy is beautiful to witness',
        'The emotional connection we\'re building makes everything else deeper',
        'Love how we can be both passionate and tender with each other',
        'Physical affection is becoming such a natural part of our daily life'
      ]
    },
    Growth: {
      shared: [
        'We\'re both growing individually while also growing as a couple',
        'Supporting each other\'s goals is making our bond stronger',
        'Learning that healthy relationships help you become your best self',
        'Our different strengths complement each other in really beautiful ways'
      ],
      private: isSarah ? [
        'Marcus encourages my career ambitions while helping me not lose myself in work',
        'Learning to balance my independent nature with being part of a team',
        'Growing in my ability to be spontaneous and go with the flow',
        'Proud of how I\'m becoming more emotionally expressive'
      ] : [
        'Sarah is helping me become more organized and intentional about my goals',
        'Learning to give Sarah space to process while still being supportive',
        'Growing in my patience and learning to appreciate different paces',
        'Love how we inspire each other to try new things and take healthy risks'
      ]
    }
  }
  
  const categoryNotes = templates[categoryName as keyof typeof templates]
  if (!categoryNotes) return generateBasicNote(categoryName, privacy, isSarah)
  
  const notes = categoryNotes[privacy]
  return notes[Math.floor(Math.random() * notes.length)]
}

const generateSeriousCommitmentNote = (categoryName: string, privacy: 'shared' | 'private', isSarah: boolean): string => {
  // Serious commitment phase (weeks 16-24)
  const templates = {
    Communication: {
      shared: [
        'Having deeper conversations about our future and what we want to build together',
        'Our communication during disagreements has really matured - we fight better now',
        'Talking about bigger life decisions feels natural and collaborative',
        'We\'ve learned to address issues quickly instead of letting them fester'
      ],
      private: isSarah ? [
        'Feel confident bringing up difficult topics - we can handle anything together',
        'Marcus really listens when I share my concerns about our future',
        'Love how we can dream together about what we want our life to look like',
        'Our communication about money and practical matters has gotten so much better'
      ] : [
        'Sarah makes me feel heard even when we disagree about important things',
        'We\'ve gotten really good at finding compromise on big decisions',
        'I can be completely honest with Sarah about my fears and dreams',
        'The way we talk through problems makes me feel like we can handle anything'
      ]
    },
    'Quality Time': {
      shared: [
        'Our time together feels intentional and precious as life gets busier',
        'We\'re great at protecting our couple time even when work and life demands increase',
        'Shared activities are becoming traditions - we have \'our things\' now',
        'Even busy weeks include meaningful moments of connection'
      ],
      private: isSarah ? [
        'Marcus is so good at making sure we prioritize us even during stressful periods',
        'Our weekend morning coffee talks have become sacred time',
        'Love planning future adventures and trips together - dreaming is bonding',
        'Quality time doesn\'t always need to be elaborate - simple moments matter most'
      ] : [
        'Sarah\'s planning skills make our time together feel special and thoughtful',
        'Love how we\'ve created traditions that are uniquely ours',
        'Even when we\'re busy, we find ways to connect that feel meaningful',
        'Looking forward to having more time together as we get more settled'
      ]
    },
    Intimacy: {
      shared: [
        'Intimacy keeps deepening as we become more secure in our commitment',
        'We\'re both more comfortable expressing our needs and desires',
        'Emotional and physical intimacy feel completely integrated now',
        'Trust has reached a level where vulnerability feels safe and natural'
      ],
      private: isSarah ? [
        'Feel completely safe being my authentic self with Marcus',
        'Physical intimacy reflects our emotional connection beautifully',
        'Love how we can be playful and serious, passionate and tender',
        'Never felt this level of acceptance and desire at the same time'
      ] : [
        'The depth of trust we\'ve built makes everything more passionate',
        'Sarah\'s confidence and openness continue to amaze me',
        'Intimacy isn\'t just about sex - it\'s about being completely known',
        'Love how we can communicate our needs without awkwardness'
      ]
    },
    Growth: {
      shared: [
        'We\'re making big decisions together and it feels natural and right',
        'Individual growth is strengthening our relationship rather than threatening it',
        'Ready to take the next steps because our foundation feels so solid',
        'Learning that commitment enhances freedom rather than limiting it'
      ],
      private: isSarah ? [
        'Ready to build a life with Marcus - it doesn\'t feel scary anymore',
        'My career goals feel more achievable with Marcus\'s support',
        'Growing into the person I want to be, and Marcus loves all of it',
        'Excited about the future we\'re creating together'
      ] : [
        'Never imagined I could feel this secure and excited about commitment',
        'Sarah believes in my dreams even when I doubt myself',
        'Growing in my ability to be dependable while staying creative',
        'Ready for whatever comes next because we\'re a real team now'
      ]
    }
  }
  
  const categoryNotes = templates[categoryName as keyof typeof templates]
  if (!categoryNotes) return generateBasicNote(categoryName, privacy, isSarah)
  
  const notes = categoryNotes[privacy]
  return notes[Math.floor(Math.random() * notes.length)]
}

const generateEstablishedCoupleNote = (categoryName: string, privacy: 'shared' | 'private', isSarah: boolean): string => {
  // Established couple phase (weeks 24+)
  const templates = {
    Communication: {
      shared: [
        'Our communication has a natural flow now - we know each other so well',
        'We can handle difficult conversations with grace and mutual respect',
        'Check-ins feel like a celebration of how far we\'ve come together',
        'We\'ve developed our own relationship language and ways of connecting'
      ],
      private: isSarah ? [
        'Communication with Marcus feels effortless most of the time',
        'Love how we can have serious talks that end with laughter',
        'Feel completely heard and understood in this relationship',
        'Marcus knows how to reach me even when I\'m stressed or withdrawn'
      ] : [
        'Sarah and I just get each other now - communication flows so naturally',
        'Even our disagreements feel productive and loving',
        'Love how we can talk for hours or sit in comfortable silence',
        'Sarah\'s way of listening makes me feel valued and understood'
      ]
    },
    'Quality Time': {
      shared: [
        'Time together feels precious and natural - we\'ve found our rhythm',
        'Our shared activities and traditions make us feel like a real team',
        'We balance together time and individual time really well now',
        'Even ordinary moments feel special when we\'re together'
      ],
      private: isSarah ? [
        'Love how we can enjoy both adventure and quiet domestic life',
        'Marcus makes everyday life feel romantic and meaningful',
        'Our weekend traditions are some of my favorite parts of the week',
        'Looking forward to many more adventures and quiet moments together'
      ] : [
        'Sarah brings such intentionality to our time together',
        'Love that we can be completely ourselves and still choose each other',
        'Our life together feels like the best kind of partnership',
        'Excited about all the experiences and seasons still ahead of us'
      ]
    },
    Intimacy: {
      shared: [
        'Intimacy feels secure and passionate at the same time',
        'We\'ve created such a safe space for vulnerability and connection',
        'Physical and emotional intimacy continue to deepen over time',
        'The trust and acceptance we have is the foundation for everything else'
      ],
      private: isSarah ? [
        'Never felt this combination of safety and passion in a relationship',
        'Marcus sees all of me and loves what he sees - it\'s incredible',
        'Our physical connection reflects the emotional bond we\'ve built',
        'Feel completely free to be myself in every way'
      ] : [
        'The level of trust and passion we\'ve built is beyond anything I imagined',
        'Sarah\'s confidence and openness inspire me to be my best self',
        'Love how intimate moments can be tender or playful or intense',
        'Never get tired of discovering new things about Sarah'
      ]
    },
    Growth: {
      shared: [
        'We\'re building something beautiful together while staying true to ourselves',
        'Individual growth enhances our relationship rather than competing with it',
        'Ready for whatever life brings because we\'ve proven we can handle it together',
        'The future looks bright because we\'ve built such a strong foundation'
      ],
      private: isSarah ? [
        'Marcus makes me want to be my best self while accepting me as I am',
        'Excited about growing old together and seeing what life brings',
        'Our relationship is my safe harbor and my greatest adventure',
        'Ready to take on new challenges because I know we\'re solid'
      ] : [
        'Sarah inspires me to be better while loving me exactly as I am',
        'Can\'t wait to see what we build together in the years ahead',
        'This relationship has taught me what real partnership looks like',
        'Feel so grateful we found each other and chose to build this together'
      ]
    }
  }
  
  const categoryNotes = templates[categoryName as keyof typeof templates]
  if (!categoryNotes) return generateBasicNote(categoryName, privacy, isSarah)
  
  const notes = categoryNotes[privacy]
  return notes[Math.floor(Math.random() * notes.length)]
}

const generateContextualReflection = (weekNumber: number, event?: any): string => {
  if (event) {
    const eventReflections = {
      'work-stress': [
        'This week tested our ability to support each other through stress, and we rose to the challenge.',
        'Grateful for how we adapted our connection to work around demanding schedules.',
        'Learning that love means being flexible and understanding during difficult periods.'
      ],
      'vacation': [
        'Our getaway reminded us why we fell in love and gave us renewed energy for our relationship.',
        'Time away from daily routines helped us reconnect and dream about our future together.',
        'Feeling so grateful we prioritize these moments of adventure and discovery together.'
      ],
      'moved-in': [
        'Living together feels like the natural next step - excited about building a home together.',
        'Each day brings new discoveries about our habits and rhythms as a couple.',
        'Feeling deeply connected and optimistic about this new chapter of our relationship.'
      ],
      'promotion': [
        'Celebrating wins together makes them even sweeter - so grateful for this supportive partnership.',
        'Success feels more meaningful when you have someone who truly understands your journey.',
        'Looking forward to how this positive change will benefit both of us.'
      ],
      'adopted-pet': [
        'Caring for Milo together has shown us new dimensions of partnership and responsibility.',
        'Watching each other with our dog reveals such tender, loving sides of our personalities.',
        'Our family of two just became three, and it feels perfectly right.'
      ]
    }
    
    const reflections = eventReflections[event.event as keyof typeof eventReflections]
    if (reflections) {
      return reflections[Math.floor(Math.random() * reflections.length)]
    }
  }
  
  // Relationship stage-based reflections
  if (weekNumber < 8) {
    const earlyReflections = [
      'Every week together reveals new layers of compatibility and connection.',
      'Still in the honeymoon phase but building real substance underneath the excitement.',
      'Learning each other\'s patterns and falling more in love with who you really are.'
    ]
    return earlyReflections[Math.floor(Math.random() * earlyReflections.length)]
  } else if (weekNumber < 16) {
    const buildingReflections = [
      'Finding our rhythm as a couple while maintaining our individual identities.',
      'The initial butterflies are evolving into deeper trust and understanding.',
      'Building traditions and inside jokes that make us feel like a true team.'
    ]
    return buildingReflections[Math.floor(Math.random() * buildingReflections.length)]
  } else if (weekNumber < 24) {
    const commitmentReflections = [
      'Making serious decisions together and discovering our shared values and dreams.',
      'Navigating challenges with more maturity and confidence in our bond.',
      'Ready to take the next steps because our foundation feels so solid.'
    ]
    return commitmentReflections[Math.floor(Math.random() * commitmentReflections.length)]
  } else {
    const establishedReflections = [
      'Feeling grateful for how far we\'ve come and excited about where we\'re heading.',
      'The comfort and security we\'ve built together is our greatest achievement.',
      'Still discovering new things about each other while feeling deeply known and loved.'
    ]
    return establishedReflections[Math.floor(Math.random() * establishedReflections.length)]
  }
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

// Generate scenario-specific milestones using the demo-scenarios function
export const mockMilestones: Milestone[] = [
  // Standard progression milestones
  {
    id: 'milestone-first-checkin',
    title: 'First Check-in',
    description: 'Started your relationship wellness journey together',
    achievedAt: new Date('2024-03-08'),
    icon: '🎉',
    category: 'celebration',
    coupleId: 'couple1',
    achieved: true,
    points: 50,
    rarity: 'common'
  },
  {
    id: 'milestone-5-checkins',
    title: '5 Check-ins',
    description: 'Building healthy communication habits - consistency is key!',
    achievedAt: new Date('2024-04-12'),
    icon: '🌟',
    category: 'growth',
    coupleId: 'couple1',
    achieved: true,
    points: 100,
    rarity: 'common'
  },
  {
    id: 'milestone-10-checkins',
    title: '10 Check-ins',
    description: 'Committed to regular relationship maintenance - you\'re building something beautiful!',
    achievedAt: new Date('2024-05-24'),
    icon: '🏆',
    category: 'growth',
    coupleId: 'couple1',
    achieved: true,
    points: 200,
    rarity: 'rare'
  },
  {
    id: 'milestone-communication-champion',
    title: 'Communication Champion',
    description: 'Consistently working on communication for 2 months straight',
    achievedAt: new Date('2024-06-15'),
    icon: '💬',
    category: 'communication',
    coupleId: 'couple1',
    achieved: true,
    points: 250,
    rarity: 'rare'
  },
  {
    id: 'milestone-quality-time-masters',
    title: 'Quality Time Masters',
    description: 'Prioritizing meaningful time together every single week',
    achievedAt: new Date('2024-07-08'),
    icon: '⏰',
    category: 'connection',
    coupleId: 'couple1',
    achieved: true,
    points: 300,
    rarity: 'rare'
  },
  // Young professional specific milestones
  {
    id: 'milestone-career-support',
    title: 'Career Support Star',
    description: 'Excellent at supporting each other\'s professional growth and ambitions',
    achievedAt: new Date('2024-05-10'),
    icon: '💼',
    category: 'growth',
    coupleId: 'couple1',
    achieved: true,
    points: 400,
    rarity: 'epic'
  },
  {
    id: 'milestone-future-planners',
    title: 'Future Planners',
    description: 'Aligned on long-term goals and dreams - you\'re building towards something amazing',
    achievedAt: new Date('2024-07-22'),
    icon: '🗺️',
    category: 'trust',
    coupleId: 'couple1',
    achieved: true,
    points: 350,
    rarity: 'epic'
  },
  {
    id: 'milestone-stress-management',
    title: 'Stress Management Team',
    description: 'Great at helping each other navigate work stress and pressure',
    achievedAt: new Date('2024-06-28'),
    icon: '🧘‍♀️',
    category: 'trust',
    coupleId: 'couple1',
    achieved: true,
    points: 275,
    rarity: 'rare'
  },
  {
    id: 'milestone-living-together',
    title: 'Home Sweet Home',
    description: 'Successfully moved in together and created a loving shared space',
    achievedAt: new Date('2024-02-14'),
    icon: '🏠',
    category: 'celebration',
    coupleId: 'couple1',
    achieved: true,
    points: 500,
    rarity: 'legendary'
  },
  {
    id: 'milestone-pet-parents',
    title: 'Pet Parents',
    description: 'Added a furry family member and learned new dimensions of partnership',
    achievedAt: new Date('2024-04-20'),
    icon: '🐕',
    category: 'growth',
    coupleId: 'couple1',
    achieved: true,
    points: 300,
    rarity: 'epic'
  },
  {
    id: 'milestone-first-vacation',
    title: 'Adventure Seekers',
    description: 'Took your first big trip together and made unforgettable memories',
    achievedAt: new Date('2024-07-04'),
    icon: '✈️',
    category: 'celebration',
    coupleId: 'couple1',
    achieved: true,
    points: 400,
    rarity: 'epic'
  },
  {
    id: 'milestone-financial-team',
    title: 'Financial Partnership',
    description: 'Started planning finances together and opened joint accounts',
    achievedAt: new Date('2024-05-15'),
    icon: '💰',
    category: 'trust',
    coupleId: 'couple1',
    achieved: true,
    points: 450,
    rarity: 'epic'
  },
  {
    id: 'milestone-conflict-resolution',
    title: 'Conflict Resolution Masters',
    description: 'Learned to work through disagreements with love and understanding',
    achievedAt: new Date('2024-08-01'),
    icon: '🤝',
    category: 'communication',
    coupleId: 'couple1',
    achieved: true,
    points: 600,
    rarity: 'legendary'
  },
  {
    id: 'milestone-intimacy-deepening',
    title: 'Deep Connection',
    description: 'Consistently nurturing emotional and physical intimacy',
    achievedAt: new Date('2024-08-20'),
    icon: '💕',
    category: 'connection',
    coupleId: 'couple1',
    achieved: true,
    points: 550,
    rarity: 'legendary'
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

// Mock Reminders Data
export const mockReminders: Reminder[] = [
  {
    id: 'reminder-1',
    title: 'Daily Love Affirmation',
    message: 'Tell Jordan you love them today! A simple "I love you" can make their whole day brighter. 💝',
    category: 'habit',
    frequency: 'daily',
    scheduledFor: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
    notificationChannel: 'both',
    createdBy: mockUsers[0].id,
    assignedTo: mockUsers[0].id,
    isActive: true,
    isSnoozed: false,
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-08-01')
  },
  {
    id: 'reminder-2',
    title: 'Weekly Check-in',
    message: 'Time for your weekly relationship check-in! Set aside 30 minutes to connect and reflect together.',
    category: 'check-in',
    frequency: 'weekly',
    scheduledFor: new Date('2024-09-08T19:00:00'),
    notificationChannel: 'both',
    createdBy: mockUsers[0].id,
    isActive: true,
    isSnoozed: false,
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-08-01')
  },
  {
    id: 'reminder-3',
    title: 'Review Finances Together',
    message: 'Follow up on your action item: Review monthly budget and savings goals with Jordan.',
    category: 'action-item',
    frequency: 'once',
    scheduledFor: new Date('2024-09-10T20:00:00'),
    notificationChannel: 'push',
    createdBy: mockUsers[0].id,
    assignedTo: mockUsers[0].id,
    isActive: true,
    isSnoozed: false,
    relatedActionItemId: 'action-checkin-w01-1',
    createdAt: new Date('2024-08-31'),
    updatedAt: new Date('2024-08-31')
  },
  {
    id: 'reminder-4',
    title: 'Anniversary Coming Up',
    message: 'Your 6-month anniversary is in 2 days! Don\'t forget to plan something special for Jordan.',
    category: 'special-date',
    frequency: 'once',
    scheduledFor: new Date('2024-09-12T09:00:00'),
    notificationChannel: 'both',
    createdBy: mockUsers[0].id,
    isActive: true,
    isSnoozed: false,
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-08-01')
  },
  {
    id: 'reminder-5',
    title: 'Gratitude Practice',
    message: 'Share one thing you\'re grateful for about Jordan today. It could be something small but meaningful.',
    category: 'habit',
    frequency: 'daily',
    scheduledFor: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    notificationChannel: 'in-app',
    createdBy: mockUsers[1].id,
    assignedTo: mockUsers[1].id,
    isActive: true,
    isSnoozed: false,
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-08-15')
  },
  {
    id: 'reminder-6',
    title: 'Date Night Planning',
    message: 'Plan this week\'s date night! Take turns choosing the activity to keep things fresh and exciting.',
    category: 'custom',
    frequency: 'weekly',
    scheduledFor: new Date('2024-09-09T18:00:00'),
    notificationChannel: 'both',
    createdBy: mockUsers[0].id,
    isActive: true,
    isSnoozed: false,
    customSchedule: {
      daysOfWeek: [1], // Monday
      time: '18:00'
    },
    createdAt: new Date('2024-08-20'),
    updatedAt: new Date('2024-08-20')
  },
  {
    id: 'reminder-7',
    title: 'Morning Coffee Chat',
    message: 'Completed! You had a great morning coffee chat today. Keep up the connection! ☕',
    category: 'habit',
    frequency: 'daily',
    scheduledFor: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    notificationChannel: 'both',
    createdBy: mockUsers[0].id,
    assignedTo: mockUsers[0].id,
    isActive: true,
    isSnoozed: false,
    completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    createdAt: new Date('2024-08-10'),
    updatedAt: new Date()
  },
  {
    id: 'reminder-8',
    title: 'Weekend Adventure',
    message: 'Snoozed: Plan a weekend adventure or day trip together. Explore somewhere new!',
    category: 'custom',
    frequency: 'monthly',
    scheduledFor: new Date('2024-09-15T10:00:00'),
    notificationChannel: 'push',
    createdBy: mockUsers[1].id,
    isActive: true,
    isSnoozed: true,
    snoozeUntil: new Date('2024-09-14T10:00:00'),
    createdAt: new Date('2024-08-05'),
    updatedAt: new Date('2024-09-01')
  }
]