export const testCheckInData = {
  categories: ['Communication', 'Trust', 'Intimacy', 'Future Goals'],

  notes: {
    communication: {
      shared: 'We had a great conversation about our communication styles this week.',
      private: 'I need to work on being more patient during discussions.',
    },
    trust: {
      shared: 'Building trust through transparency has been really positive.',
      private: 'Still feeling a bit uncertain about some financial decisions.',
    },
    intimacy: {
      shared: 'Quality time together has improved significantly.',
      private: 'Would like more emotional connection during busy weeks.',
    },
    futureGoals: {
      shared: 'Excited about our travel plans for next year!',
      private: 'Need to discuss career changes more openly.',
    },
  },

  reflection: {
    text: 'This check-in helped us identify key areas for growth. We\'re making progress on communication and feeling more connected.',
  },

  actionItems: [
    {
      title: 'Schedule weekly date nights',
      assignee: 'Both',
      priority: 'high' as const,
      dueDate: 7, // days from now
    },
    {
      title: 'Research vacation destinations',
      assignee: 'Alex',
      priority: 'medium' as const,
      dueDate: 14,
    },
    {
      title: 'Plan monthly budget review',
      assignee: 'Jordan',
      priority: 'high' as const,
      dueDate: 3,
    },
  ],
}

export const testMilestones = [
  {
    title: 'Completed first check-in',
    description: 'We took the first step towards better communication',
    date: 'Today',
  },
  {
    title: 'One week streak',
    description: 'Maintained consistent check-ins for a full week',
    date: '7 days ago',
  },
  {
    title: 'Resolved conflict peacefully',
    description: 'Worked through disagreement with understanding',
    date: '2 weeks ago',
  },
]

export const testReminders = [
  {
    title: 'Weekly Check-in',
    time: '7:00 PM',
    frequency: 'Weekly',
    days: ['Sunday'],
  },
  {
    title: 'Date Night Planning',
    time: '6:00 PM',
    frequency: 'Weekly',
    days: ['Wednesday'],
  },
  {
    title: 'Monthly Reflection',
    time: '8:00 PM',
    frequency: 'Monthly',
    date: 1, // 1st of each month
  },
]