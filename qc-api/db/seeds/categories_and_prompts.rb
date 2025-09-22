# Create system-wide categories first
puts "Creating system categories..."

system_categories = [
  { name: "Communication", icon: "💬", description: "How we talk and listen to each other", order: 1 },
  { name: "Intimacy", icon: "❤️", description: "Physical and emotional connection", order: 2 },
  { name: "Finances", icon: "💰", description: "Money matters and financial planning", order: 3 },
  { name: "Family", icon: "👨‍👩‍👧‍👦", description: "Extended family and parenting", order: 4 },
  { name: "Goals", icon: "🎯", description: "Personal and shared aspirations", order: 5 },
  { name: "Household", icon: "🏠", description: "Chores and home management", order: 6 }
]

system_categories.each do |attrs|
  category = Category.find_or_create_by!(
    name: attrs[:name],
    couple_id: nil,
    is_custom: false
  ) do |c|
    c.icon = attrs[:icon]
    c.description = attrs[:description]
    c.order = attrs[:order]
    c.prompts = []
  end
  puts "  ✅ Created system category: #{category.name}"
end

# System-wide prompt templates that are available to all couples
puts "Creating system prompt templates..."

# Communication category prompts
communication_prompts = [
  {
    title: "Active Listening Check-in",
    prompts: [
      "How well did I listen to you this week?",
      "What did I miss or misunderstand?",
      "How can I be a better listener for you?"
    ],
    tags: ["listening", "communication", "weekly"],
    is_system: true
  },
  {
    title: "Communication Style",
    prompts: [
      "What communication patterns are working well for us?",
      "Where do we tend to misunderstand each other?",
      "How can we communicate more effectively?"
    ],
    tags: ["communication", "patterns", "improvement"],
    is_system: true
  },
  {
    title: "Conflict Resolution",
    prompts: [
      "How did we handle disagreements this week?",
      "What triggered our conflicts?",
      "What can we do differently next time?"
    ],
    tags: ["conflict", "resolution", "weekly"],
    is_system: true
  }
]

# Intimacy category prompts
intimacy_prompts = [
  {
    title: "Emotional Connection",
    prompts: [
      "When did you feel most connected to me this week?",
      "What made you feel loved and appreciated?",
      "How can we deepen our emotional bond?"
    ],
    tags: ["emotional", "connection", "weekly"],
    is_system: true
  },
  {
    title: "Physical Affection",
    prompts: [
      "How satisfied are you with our physical affection?",
      "What type of physical touch do you need more of?",
      "How can we maintain physical connection during busy times?"
    ],
    tags: ["physical", "affection", "needs"],
    is_system: true
  },
  {
    title: "Quality Time",
    prompts: [
      "How much quality time did we spend together?",
      "What activities made us feel closest?",
      "How can we prioritize our time together?"
    ],
    tags: ["quality time", "activities", "priorities"],
    is_system: true
  }
]

# Finances category prompts
finance_prompts = [
  {
    title: "Financial Goals",
    prompts: [
      "What are our top financial priorities right now?",
      "How aligned are we on our spending?",
      "What financial goals should we work on together?"
    ],
    tags: ["finances", "goals", "planning"],
    is_system: true
  },
  {
    title: "Budget Review",
    prompts: [
      "How did we do with our budget this month?",
      "What unexpected expenses came up?",
      "Where can we adjust our spending?"
    ],
    tags: ["budget", "monthly", "review"],
    is_system: true
  },
  {
    title: "Financial Stress",
    prompts: [
      "What financial concerns are causing stress?",
      "How can we support each other financially?",
      "What steps can we take to reduce financial anxiety?"
    ],
    tags: ["finances", "stress", "support"],
    is_system: true
  }
]

# Family category prompts
family_prompts = [
  {
    title: "Family Dynamics",
    prompts: [
      "How are we managing relationships with extended family?",
      "What family situations need our attention?",
      "How can we better support each other with family matters?"
    ],
    tags: ["family", "relationships", "support"],
    is_system: true
  },
  {
    title: "Parenting Alignment",
    prompts: [
      "How aligned are we on parenting decisions?",
      "What parenting challenges are we facing?",
      "How can we be a better parenting team?"
    ],
    tags: ["parenting", "alignment", "teamwork"],
    is_system: true
  },
  {
    title: "Family Time",
    prompts: [
      "How well are we balancing couple time and family time?",
      "What family traditions do we want to maintain or create?",
      "How can we make family time more meaningful?"
    ],
    tags: ["family", "balance", "traditions"],
    is_system: true
  }
]

# Goals category prompts
goals_prompts = [
  {
    title: "Personal Growth",
    prompts: [
      "What personal goals are you working on?",
      "How can I support your individual growth?",
      "What growth have you noticed in yourself and in me?"
    ],
    tags: ["personal", "growth", "support"],
    is_system: true
  },
  {
    title: "Shared Dreams",
    prompts: [
      "What dreams do we share for our future?",
      "What steps are we taking toward our goals?",
      "How can we better align our individual and shared goals?"
    ],
    tags: ["dreams", "future", "alignment"],
    is_system: true
  },
  {
    title: "Progress Check",
    prompts: [
      "What progress have we made on our goals?",
      "What obstacles are we facing?",
      "How should we adjust our approach?"
    ],
    tags: ["progress", "obstacles", "adjustment"],
    is_system: true
  }
]

# Household category prompts
household_prompts = [
  {
    title: "Chore Distribution",
    prompts: [
      "How fair is our distribution of household tasks?",
      "What household responsibilities are being neglected?",
      "How can we better share the household load?"
    ],
    tags: ["chores", "fairness", "distribution"],
    is_system: true
  },
  {
    title: "Home Environment",
    prompts: [
      "How comfortable is our home environment?",
      "What changes would make our space better?",
      "How can we maintain a peaceful home together?"
    ],
    tags: ["home", "environment", "comfort"],
    is_system: true
  },
  {
    title: "Household Planning",
    prompts: [
      "What home projects need our attention?",
      "How can we better coordinate household schedules?",
      "What household systems need improvement?"
    ],
    tags: ["planning", "projects", "coordination"],
    is_system: true
  }
]

# Create the prompt templates
prompt_sets = {
  "Communication" => communication_prompts,
  "Intimacy" => intimacy_prompts,
  "Finances" => finance_prompts,
  "Family" => family_prompts,
  "Goals" => goals_prompts,
  "Household" => household_prompts
}

# Find or create system categories and add prompt templates
prompt_sets.each do |category_name, prompts|
  # System categories are created automatically, just find them
  category = Category.system_categories.find_by(name: category_name)

  if category
    prompts.each do |prompt_data|
      template = PromptTemplate.create!(
        title: prompt_data[:title],
        prompts: prompt_data[:prompts],
        tags: prompt_data[:tags],
        is_system: prompt_data[:is_system],
        category: category
      )
      puts "  Created prompt template: #{template.title} for #{category_name}"
    end
  else
    puts "  Warning: Category #{category_name} not found"
  end
end

puts "System prompt templates created successfully!"