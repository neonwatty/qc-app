import { User, Couple, CheckIn, Note, Milestone, Category } from '@/types'

// Diverse relationship personas and scenarios for compelling demos
export interface DemoScenario {
  id: string
  name: string
  description: string
  couple: Couple
  relationshipLength: string
  relationshipType: 'dating' | 'engaged' | 'married' | 'long-term'
  livingTogether: boolean
  hasKids: boolean
  communicationStyle: 'direct' | 'gentle' | 'analytical' | 'expressive'
  primaryChallenges: string[]
  strengths: string[]
  recentMilestones: string[]
}

// Enhanced user personas with diverse backgrounds
export const demoPersonas = {
  // Scenario 1: Young Professional Couple
  deb: {
    id: 'deb',
    name: 'Deb Chen',
    email: 'deb@example.com',
    avatar: '👩🏻‍💼',
    age: 28,
    occupation: 'Software Engineer',
    personalityTraits: ['analytical', 'introverted', 'goal-oriented'],
    communicationStyle: 'direct',
    interests: ['hiking', 'cooking', 'tech', 'fitness']
  } as User & { age: number; occupation: string; personalityTraits: string[]; communicationStyle: string; interests: string[] },

  jeremy: {
    id: 'jeremy',
    name: 'Jeremy Johnson',
    email: 'jeremy@example.com',
    avatar: '👨🏾‍🎨',
    age: 30,
    occupation: 'Graphic Designer',
    personalityTraits: ['creative', 'extroverted', 'empathetic'],
    communicationStyle: 'expressive',
    interests: ['art', 'music', 'travel', 'photography']
  } as User & { age: number; occupation: string; personalityTraits: string[]; communicationStyle: string; interests: string[] },

  // Scenario 2: Long-term Married Couple
  elena: {
    id: 'elena',
    name: 'Elena Rodriguez',
    email: 'elena@example.com',
    avatar: '👩🏽‍⚕️',
    age: 34,
    occupation: 'Nurse Practitioner',
    personalityTraits: ['caring', 'practical', 'resilient'],
    communicationStyle: 'gentle',
    interests: ['gardening', 'yoga', 'reading', 'family time']
  } as User & { age: number; occupation: string; personalityTraits: string[]; communicationStyle: string; interests: string[] },

  david: {
    id: 'david',
    name: 'David Kim',
    email: 'david@example.com',
    avatar: '👨🏻‍🏫',
    age: 36,
    occupation: 'High School Teacher',
    personalityTraits: ['patient', 'thoughtful', 'humorous'],
    communicationStyle: 'analytical',
    interests: ['sports', 'history', 'coaching', 'woodworking']
  } as User & { age: number; occupation: string; personalityTraits: string[]; communicationStyle: string; interests: string[] },

  // Scenario 3: New Parents
  jamie: {
    id: 'jamie',
    name: 'Jamie Taylor',
    email: 'jamie@example.com',
    avatar: '👤',
    age: 31,
    occupation: 'Marketing Manager',
    personalityTraits: ['organized', 'ambitious', 'adaptable'],
    communicationStyle: 'direct',
    interests: ['running', 'podcasts', 'cooking', 'baby care']
  } as User & { age: number; occupation: string; personalityTraits: string[]; communicationStyle: string; interests: string[] },

  alex: {
    id: 'alex',
    name: 'Alex Thompson',
    email: 'alex@example.com',
    avatar: '👤',
    age: 29,
    occupation: 'Freelance Writer',
    personalityTraits: ['creative', 'sensitive', 'flexible'],
    communicationStyle: 'gentle',
    interests: ['writing', 'movies', 'nature walks', 'parenting']
  } as User & { age: number; occupation: string; personalityTraits: string[]; communicationStyle: string; interests: string[] }
}

// Demo scenarios with rich context
export const demoScenarios: DemoScenario[] = [
  {
    id: 'young-professionals',
    name: 'Sarah & Marcus',
    description: 'Young professional couple navigating career growth and relationship building',
    couple: {
      id: 'couple-sarah-marcus',
      name: 'Sarah & Marcus',
      partners: [demoPersonas.sarah, demoPersonas.marcus],
      createdAt: new Date('2024-03-01'),
      settings: {
        checkInFrequency: 'weekly',
        reminderTime: '19:00',
        categories: [], // Will be populated with standard categories
        theme: 'system'
      },
      stats: {
        totalCheckIns: 28,
        currentStreak: 6,
        lastCheckIn: new Date('2024-08-31')
      }
    },
    relationshipLength: '2.5 years',
    relationshipType: 'dating',
    livingTogether: true,
    hasKids: false,
    communicationStyle: 'direct',
    primaryChallenges: [
      'Balancing demanding careers with relationship time',
      'Different communication styles (analytical vs expressive)',
      'Planning for future goals and timeline',
      'Managing stress from work pressures'
    ],
    strengths: [
      'Strong emotional support for each other',
      'Complementary skills and perspectives',
      'Shared commitment to growth',
      'Good conflict resolution skills'
    ],
    recentMilestones: [
      'Moved in together (6 months ago)',
      'Met each other\'s extended families',
      'Started joint savings account',
      'Adopted a rescue dog together'
    ]
  },

  {
    id: 'married-with-experience',
    name: 'Elena & David',
    description: 'Established married couple focusing on deepening connection after years together',
    couple: {
      id: 'couple-elena-david',
      name: 'Elena & David',
      partners: [demoPersonas.elena, demoPersonas.david],
      createdAt: new Date('2024-01-15'),
      settings: {
        checkInFrequency: 'weekly',
        reminderTime: '20:30',
        categories: [], // Will be populated with standard categories
        theme: 'system'
      },
      stats: {
        totalCheckIns: 35,
        currentStreak: 12,
        lastCheckIn: new Date('2024-08-30')
      }
    },
    relationshipLength: '8 years married, 11 years together',
    relationshipType: 'married',
    livingTogether: true,
    hasKids: false,
    communicationStyle: 'gentle',
    primaryChallenges: [
      'Keeping romance alive in long-term relationship',
      'Navigating different career priorities',
      'Deciding about having children',
      'Maintaining individual identity within marriage'
    ],
    strengths: [
      'Deep understanding of each other',
      'Strong foundation of trust and commitment',
      'Excellent at working through disagreements',
      'Shared values and life philosophy'
    ],
    recentMilestones: [
      'Bought their first house',
      '8th wedding anniversary celebration',
      'Elena got promoted to nurse practitioner',
      'Completed couples therapy program'
    ]
  },

  {
    id: 'new-parents',
    name: 'Jamie & Alex',
    description: 'New parents adjusting to life with a baby while maintaining their relationship',
    couple: {
      id: 'couple-jamie-alex',
      name: 'Jamie & Alex',
      partners: [demoPersonas.jamie, demoPersonas.alex],
      createdAt: new Date('2024-04-01'),
      settings: {
        checkInFrequency: 'weekly',
        reminderTime: '21:00',
        categories: [], // Will be populated with standard categories
        theme: 'system'
      },
      stats: {
        totalCheckIns: 22,
        currentStreak: 3,
        lastCheckIn: new Date('2024-08-28')
      }
    },
    relationshipLength: '4 years together, 2 years married',
    relationshipType: 'married',
    livingTogether: true,
    hasKids: true,
    communicationStyle: 'direct',
    primaryChallenges: [
      'Finding time for each other with new baby',
      'Managing sleep deprivation and stress',
      'Dividing parenting and household responsibilities',
      'Maintaining intimacy and connection'
    ],
    strengths: [
      'Excellent teamwork in parenting',
      'Strong communication about needs',
      'Mutual support during difficult times',
      'Shared joy and excitement about their child'
    ],
    recentMilestones: [
      'Baby Emma was born (4 months ago)',
      'Successfully navigated first months of parenthood',
      'Jamie returned to work part-time',
      'Established bedtime routine that works'
    ]
  }
]

// Scenario-specific note templates
export const scenarioNoteTemplates = {
  'young-professionals': {
    communication: [
      'Had a great conversation about our 5-year career goals - feeling aligned',
      'Discussed how to better support each other during busy work periods',
      'Marcus helped me process a difficult day at work - really appreciated the emotional support',
      'Working on giving each other space to vent without trying to "fix" everything',
      'Love how we can talk about money and future planning without it feeling stressful'
    ],
    'quality-time': [
      'Cooking dinner together has become our favorite way to reconnect after work',
      'Weekend hiking trip was perfect - no phones, just us and nature',
      'Started a new tradition of weekend breakfast in bed',
      'Movie nights are great but we want more active time together',
      'Planning a weekend getaway to celebrate Sarah\'s promotion'
    ],
    intimacy: [
      'Physical affection has been really meaningful during stressful work weeks',
      'Learning to be vulnerable about insecurities and career fears',
      'Appreciate how we support each other\'s individual growth',
      'Working on being more present during intimate moments',
      'Love language differences are becoming clearer - quality time vs physical touch'
    ]
  },

  'married-with-experience': {
    communication: [
      'Eight years in, we\'re still learning new things about each other',
      'Had a deep conversation about what we want the next decade to look like',
      'Elena\'s really good at helping me see other perspectives when I\'m stuck',
      'We\'re getting better at addressing small issues before they become big ones',
      'Appreciated how we handled the stress of house buying together'
    ],
    'quality-time': [
      'Date nights are non-negotiable now - we protect that time fiercely',
      'Love our weekend gardening projects - working on something together',
      'Travel planning has become one of our favorite shared activities',
      'Quiet evenings reading together feel just as connecting as going out',
      'Starting to talk about taking a sabbatical year together'
    ],
    growth: [
      'Supporting Elena through her career advancement has been rewarding',
      'Working on being more spontaneous and less routine-focused',
      'Individual therapy has really improved how we show up for each other',
      'Learning that it\'s okay to want different things sometimes',
      'Excited about the new challenges we\'re taking on together'
    ]
  },

  'new-parents': {
    communication: [
      'Learning to communicate needs clearly when we\'re both exhausted',
      'Check-ins are crucial now - we can\'t assume we know how the other is feeling',
      'Talking about parenting styles has brought up some surprising differences',
      'Alex is really good at helping me process the identity shift of becoming a parent',
      'We\'re getting better at asking for help instead of trying to do everything'
    ],
    'quality-time': [
      'Even 15 minutes together after Emma goes to bed feels precious now',
      'Morning coffee together before she wakes up has become sacred time',
      'Family walks are our new favorite way to spend time together',
      'Looking forward to when we can plan real dates again',
      'Finding joy in small moments - folding laundry together, quick hugs in the kitchen'
    ],
    intimacy: [
      'Physical intimacy is evolving - focusing on connection over frequency',
      'Emotional intimacy has actually deepened through parenting together',
      'Learning to be patient with each other during this adjustment period',
      'Small gestures mean everything - bringing coffee, letting the other sleep in',
      'Talking openly about the challenges has brought us closer'
    ]
  }
}

// Generate scenario-specific milestones
export const generateScenarioMilestones = (scenarioId: string): Milestone[] => {
  const baseMilestones = [
    { title: 'First Check-in', description: 'Started your relationship wellness journey', icon: '🎉' },
    { title: '5 Check-ins', description: 'Building healthy communication habits', icon: '🌟' },
    { title: '10 Check-ins', description: 'Committed to regular relationship maintenance', icon: '🏆' },
    { title: 'Communication Champion', description: 'Consistently working on communication', icon: '💬' },
    { title: 'Quality Time Masters', description: 'Prioritizing time together', icon: '⏰' }
  ]

  const scenarioSpecificMilestones = {
    'young-professionals': [
      { title: 'Career Support Star', description: 'Excellent at supporting each other\'s professional growth', icon: '💼' },
      { title: 'Future Planners', description: 'Aligned on long-term goals and dreams', icon: '🗺️' },
      { title: 'Stress Management Team', description: 'Great at helping each other through work stress', icon: '🧘‍♀️' }
    ],
    'married-with-experience': [
      { title: 'Relationship Veterans', description: 'Still growing after years together', icon: '🌳' },
      { title: 'Romance Renewers', description: 'Keeping the spark alive in long-term love', icon: '💕' },
      { title: 'Deep Connection', description: 'Maintaining intimacy and understanding', icon: '🔗' }
    ],
    'new-parents': [
      { title: 'Parenting Partnership', description: 'Excellent teamwork in raising your child', icon: '👶' },
      { title: 'Relationship Resilience', description: 'Maintaining connection through major life changes', icon: '💪' },
      { title: 'Family Foundation', description: 'Building a strong foundation for your growing family', icon: '🏠' }
    ]
  }

  const allMilestones = [
    ...baseMilestones,
    ...(scenarioSpecificMilestones[scenarioId as keyof typeof scenarioSpecificMilestones] || [])
  ]

  return allMilestones.map((milestone, index) => ({
    id: `${scenarioId}-milestone-${index + 1}`,
    title: milestone.title,
    description: milestone.description,
    achievedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000), // Random date within 6 months
    icon: milestone.icon,
    category: 'growth',
    coupleId: `couple-${scenarioId}`
  }))
}

// Communication style templates
export const communicationStyles = {
  direct: {
    traits: ['clear', 'honest', 'efficient', 'solution-focused'],
    noteStyle: 'straightforward and specific',
    examples: [
      'We need to talk about how we\'re splitting household chores',
      'I felt frustrated when you interrupted me during dinner',
      'Let\'s set a specific time each week for our check-ins'
    ]
  },
  gentle: {
    traits: ['empathetic', 'considerate', 'patient', 'nurturing'],
    noteStyle: 'warm and understanding',
    examples: [
      'I\'ve been thinking about how we might approach this together',
      'I really appreciated how you handled that situation',
      'I\'m wondering if there\'s a way we could both feel good about this'
    ]
  },
  analytical: {
    traits: ['thoughtful', 'detailed', 'logical', 'systematic'],
    noteStyle: 'thorough and structured',
    examples: [
      'I\'ve been reflecting on the patterns I\'ve noticed in our communication',
      'Let me break down what I think worked well and what we could improve',
      'I\'d like to understand the underlying reasons for this issue'
    ]
  },
  expressive: {
    traits: ['emotional', 'creative', 'passionate', 'storytelling'],
    noteStyle: 'vivid and emotionally rich',
    examples: [
      'That moment when we were dancing in the kitchen just filled my heart',
      'I felt like we were really seeing each other during that conversation',
      'The way you looked at me when I was talking about my dreams...'
    ]
  }
}

export const getScenarioById = (scenarioId: string): DemoScenario | undefined => {
  return demoScenarios.find(scenario => scenario.id === scenarioId)
}

export const getRandomScenario = (): DemoScenario => {
  return demoScenarios[Math.floor(Math.random() * demoScenarios.length)]
}