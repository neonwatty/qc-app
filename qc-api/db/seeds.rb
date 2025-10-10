# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

require 'faker'

Rails.logger = Logger.new($stdout)
Rails.logger.info "🌱 Starting seed data generation..."

# Clear existing data in development/test environments only
if Rails.env.development? || Rails.env.test?
  Rails.logger.info "Cleaning existing data..."

  # Delete in correct order to respect foreign key constraints
  ActionItem.destroy_all
  Note.destroy_all
  CheckIn.destroy_all
  Milestone.destroy_all
  Reminder.destroy_all
  SessionSettings.destroy_all
  Category.destroy_all
  RelationshipRequest.destroy_all
  Couple.destroy_all
  User.destroy_all

  Rails.logger.info "Existing data cleaned"
end

# Create default categories
Rails.logger.info "Creating default categories..."

DEFAULT_CATEGORIES = [
  {
    name: 'Communication',
    icon: '💬',
    description: 'How we express ourselves and listen to each other',
    prompts: [
      'How well did we communicate this week?',
      'Were there any misunderstandings that need clarification?',
      'What communication patterns should we work on?'
    ]
  },
  {
    name: 'Trust',
    icon: '🤝',
    description: 'Building and maintaining trust in our relationship',
    prompts: [
      'Do we feel secure and trusting in our relationship?',
      'Have there been any trust concerns recently?',
      'How can we strengthen our trust?'
    ]
  },
  {
    name: 'Intimacy',
    icon: '❤️',
    description: 'Physical and emotional closeness',
    prompts: [
      'How connected do we feel emotionally?',
      'Are we satisfied with our physical intimacy?',
      'What would help us feel closer?'
    ]
  },
  {
    name: 'Finances',
    icon: '💰',
    description: 'Managing money and financial goals together',
    prompts: [
      'Are we aligned on our financial goals?',
      'Do we need to discuss any spending concerns?',
      'How are we progressing on our financial plans?'
    ]
  },
  {
    name: 'Future Goals',
    icon: '🎯',
    description: 'Our shared vision and dreams',
    prompts: [
      'Are our life goals still aligned?',
      'What steps are we taking toward our shared future?',
      'Do we need to adjust any of our plans?'
    ]
  },
  {
    name: 'Family',
    icon: '👨‍👩‍👧‍👦',
    description: 'Family relationships and planning',
    prompts: [
      'How are we managing family relationships?',
      'Are there any family issues to discuss?',
      'How do we feel about our family planning?'
    ]
  },
  {
    name: 'Work-Life Balance',
    icon: '⚖️',
    description: 'Balancing careers and personal time',
    prompts: [
      'Are we making enough time for each other?',
      'Is work stress affecting our relationship?',
      'How can we better support each other\'s careers?'
    ]
  },
  {
    name: 'Fun & Recreation',
    icon: '🎉',
    description: 'How we play and enjoy life together',
    prompts: [
      'Are we having enough fun together?',
      'What activities would we like to do more?',
      'When was the last time we really laughed together?'
    ]
  }
]

default_categories = DEFAULT_CATEGORIES.map.with_index do |cat_data, index|
  Category.create!(
    name: cat_data[:name],
    icon: cat_data[:icon],
    description: cat_data[:description],
    prompts: cat_data[:prompts],
    is_custom: false,
    order: index
  )
end

Rails.logger.info "✅ Created #{default_categories.count} default categories"

# Create demo users and couples for development
if Rails.env.development?
  Rails.logger.info "Creating demo users and couples..."

  # Load enhanced Alex & Jordan couple seeder
  require_relative 'seeds/alex_jordan_couple'

  # Create Alex & Jordan with comprehensive relationship data
  AlexJordanCouple::Seeder.new(default_categories).seed!

  # Get references to Alex and Jordan for backward compatibility
  alex = User.find_by(email: 'alex@example.com')
  jordan = User.find_by(email: 'jordan@example.com')
  couple1 = Couple.find_by(name: 'Alex & Jordan')

  # Demo couple 2: Sam & Riley
  sam = User.create!(
    email: 'sam@example.com',
    password: 'password123',
    password_confirmation: 'password123',
    name: 'Sam Martinez'
  )

  riley = User.create!(
    email: 'riley@example.com',
    password: 'password123',
    password_confirmation: 'password123',
    name: 'Riley Johnson'
  )

  couple2 = Couple.create!(
    name: 'Sam & Riley'
  )

  couple2.users << sam
  couple2.users << riley

  Rails.logger.info "✅ Created demo couples"

  # Alex & Jordan's comprehensive data is created by AlexJordanCouple::Seeder above
  # The following section creates additional demo data for Sam & Riley

  # Skip creating duplicate data for Alex & Jordan
  if false
    # Original Alex & Jordan data creation (now handled by AlexJordanCouple::Seeder)
    session_setting = SessionSettings.create!(
      couple: couple1,
      frequency: 'weekly',
      reminder_day: 'sunday',
      reminder_time: '19:00',
      default_categories: default_categories.first(4).map(&:id),
      session_duration_goal: 30,
      enable_preparation_prompt: true,
      enable_reflection_prompt: true,
      preparation_prompt: 'Take a moment to reflect on your week together.',
      reflection_prompt: 'How do you feel after this check-in?'
    )

    Rails.logger.info "✅ Created session settings"

    # Create check-ins with notes
    Rails.logger.info "Creating check-ins and notes..."

    5.times do |i|
      # Check-in for couple 1
      check_in = CheckIn.create!(
        participants: [alex.id, jordan.id],
        started_at: (5 - i).weeks.ago,
        completed_at: (5 - i).weeks.ago + 45.minutes,
        status: 'completed',
        categories: default_categories.sample(3).map(&:id),
        mood_before: rand(3..7),
        mood_after: rand(6..10),
        reflection: Faker::Lorem.paragraph(sentence_count: 4),
        session_settings: session_setting
      )

    # Create notes for this check-in
    3.times do
      Note.create!(
        content: Faker::Lorem.paragraph(sentence_count: 3),
        privacy: ['private', 'shared'].sample,
        check_in: check_in,
        category: default_categories.sample,
        author: [alex, jordan].sample,
      )
    end

    # Create action items
    2.times do
      ActionItem.create!(
        title: Faker::Lorem.sentence(word_count: 4),
        description: Faker::Lorem.paragraph(sentence_count: 2),
        assigned_to: [alex, jordan].sample,
        due_date: rand(1..14).days.from_now,
        check_in: check_in,
        priority: ['low', 'medium', 'high'].sample,
        category: ['personal', 'shared', 'household'].sample,
        created_by: [alex, jordan].sample,
        completed: [true, false].sample
      )
    end
  end

  # Create an in-progress check-in for couple 1
  in_progress_checkin = CheckIn.create!(
    couple: couple1,
    participants: [alex.id],
    started_at: 1.hour.ago,
    status: 'in-progress',
    categories: default_categories.first(2).map(&:id),
    mood_before: 5,
    session_settings: session_setting
  )

  Rails.logger.info "✅ Created check-ins with notes and action items"

  # Create milestones
  Rails.logger.info "Creating milestones..."

  milestones_data = [
    { title: 'First Check-in Together', date: 5.weeks.ago },
    { title: 'One Month Streak', date: 1.month.ago },
    { title: 'Resolved First Conflict', date: 3.weeks.ago },
    { title: 'Planned Vacation Together', date: 2.weeks.ago },
    { title: 'Met Each Other\'s Families', date: 6.weeks.ago }
  ]

  milestones_data.each do |milestone_data|
    Milestone.create!(
      title: milestone_data[:title],
      description: Faker::Lorem.sentence,
      achieved_at: milestone_data[:date],
      couple: couple1,
      category: ['communication', 'growth', 'celebration'].sample
    )
  end

  Rails.logger.info "✅ Created milestones"

  # Create reminders
  Rails.logger.info "Creating reminders..."

  Reminder.create!(
    couple: couple1,
    user: alex,
    reminder_type: 'check_in',
    frequency: 'weekly',
    day_of_week: 0, # Sunday
    time_of_day: '19:00',
    enabled: true,
    message: 'Time for your weekly check-in with Jordan!'
  )

  Reminder.create!(
    couple: couple1,
    user: jordan,
    reminder_type: 'action_item',
    frequency: 'daily',
    time_of_day: '09:00',
    enabled: true,
    message: 'Review your action items for today'
  )

  Rails.logger.info "✅ Created reminders"

    # Create custom categories for couple 1
    Rails.logger.info "Creating custom categories..."

    Category.create!(
      name: 'Household Chores',
      icon: '🏠',
      description: 'Managing household responsibilities',
      prompts: ['Are chores fairly distributed?', 'What needs attention this week?'],
      is_custom: true,
      couple: couple1,
      order: 10
    )

    Rails.logger.info "✅ Created custom categories"
  end # End of if false block for original Alex & Jordan data

  # Output summary
  Rails.logger.info "\n" + "="*50
  Rails.logger.info "🎉 Seed data generation complete!"
  Rails.logger.info "="*50
  Rails.logger.info "Created:"
  Rails.logger.info "  • #{User.count} users"
  Rails.logger.info "  • #{Couple.count} couples"
  Rails.logger.info "  • #{Category.count} categories (#{Category.where(is_custom: false).count} default)"
  Rails.logger.info "  • #{CheckIn.count} check-ins"
  Rails.logger.info "  • #{Note.count} notes"
  Rails.logger.info "  • #{ActionItem.count} action items"
  Rails.logger.info "  • #{Milestone.count} milestones"
  Rails.logger.info "  • #{Reminder.count} reminders"
  Rails.logger.info "="*50
  Rails.logger.info "\n📝 Demo credentials:"
  Rails.logger.info "  Email: alex@example.com / Password: password123"
  Rails.logger.info "  Email: jordan@example.com / Password: password123"
  Rails.logger.info "="*50
end