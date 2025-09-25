# Comprehensive seed data for Alex & Jordan demo couple
module AlexJordanCouple
  class Seeder
    attr_reader :logger, :alex, :jordan, :couple, :categories

    def initialize(categories, logger = Rails.logger)
      @categories = categories
      @logger = logger
    end

    def seed!
      logger.info "Creating Alex & Jordan demo couple with realistic relationship data..."

      create_users_and_couple
      create_session_settings
      create_relationship_timeline
      create_check_ins_with_progression
      create_milestones
      create_reminders
      create_custom_categories

      logger.info "✅ Alex & Jordan demo couple created with comprehensive data"
    end

    private

    def create_users_and_couple
      # Create Alex with detailed profile
      @alex = User.find_or_create_by!(email: 'alex@example.com') do |user|
        user.password = 'password123'
        user.password_confirmation = 'password123'
        user.name = 'Alex Chen'
        user.pronouns = 'they/them'
        user.love_languages = ['quality_time', 'words_of_affirmation']
      end

      # Create Jordan with detailed profile
      @jordan = User.find_or_create_by!(email: 'jordan@example.com') do |user|
        user.password = 'password123'
        user.password_confirmation = 'password123'
        user.name = 'Jordan Smith'
        user.pronouns = 'she/her'
        user.love_languages = ['acts_of_service', 'physical_touch']
      end

      # Create their couple profile
      @couple = Couple.find_or_create_by!(name: 'Alex & Jordan') do |c|
        c.anniversary = 2.years.ago
      end

      alex.update!(couple: couple)
      jordan.update!(couple: couple)

      logger.info "  ✓ Created users and couple profile"
    end

    def create_session_settings
      SessionSetting.find_or_create_by!(couple: couple) do |settings|
        settings.frequency = 'weekly'
        settings.reminder_day = 'sunday'
        settings.reminder_time = '19:00'
        settings.default_categories = categories.first(4).map(&:id)
        settings.session_duration_goal = 30
        settings.enable_preparation_prompt = true
        settings.enable_reflection_prompt = true
        settings.preparation_prompt = 'Take a moment to reflect on your week together. What went well? What was challenging?'
        settings.reflection_prompt = 'How do you feel after this check-in? What insights did you gain?'
      end

      logger.info "  ✓ Created session settings"
    end

    def create_relationship_timeline
      # Create check-ins showing relationship progression over 3 months
      # Month 1: Getting into the rhythm
      create_early_check_ins

      # Month 2: Working through challenges
      create_challenge_period_check_ins

      # Month 3: Growing stronger together
      create_growth_period_check_ins

      # Current: Ongoing progress
      create_recent_check_ins
      create_in_progress_check_in

      logger.info "  ✓ Created relationship timeline with #{CheckIn.where(couple: couple).count} check-ins"
    end

    def create_early_check_ins
      # First check-in - figuring things out
      check_in = CheckIn.create!(
        couple: couple,
        participants: [alex.id, jordan.id],
        started_at: 12.weeks.ago,
        completed_at: 12.weeks.ago + 50.minutes,
        status: 'completed',
        categories: categories.where(name: ['Communication', 'Future Goals']).map(&:id),
        mood_before: 5,
        mood_after: 7,
        reflection: "Our first check-in! It felt a bit awkward at first, but we're glad we did it. We realized we need to be more intentional about making time for each other.",
        session_settings_id: SessionSetting.find_by(couple: couple).id
      )

      # Create notes showing initial discussions
      Note.create!(
        content: "We need to work on being more direct in our communication. Sometimes we both avoid difficult topics.",
        privacy_level: 'shared',
        check_in: check_in,
        category: categories.find_by(name: 'Communication'),
        user: alex,
        couple: couple,
        sentiment_score: 0.6
      )

      Note.create!(
        content: "I appreciate that Alex listens without judgment. I want to work on expressing my needs more clearly.",
        privacy_level: 'shared',
        check_in: check_in,
        category: categories.find_by(name: 'Communication'),
        user: jordan,
        couple: couple,
        sentiment_score: 0.7
      )

      # Early action items
      ActionItem.create!(
        title: "Schedule weekly date nights",
        description: "Block off Friday evenings for us time, no phones allowed",
        assigned_to: nil, # Both partners
        due_date: 1.week.from_now,
        check_in: check_in,
        priority: 'high',
        category: 'shared',
        created_by: jordan,
        completed: true,
        completed_at: 11.weeks.ago
      )
    end

    def create_challenge_period_check_ins
      # Check-in during a challenging period
      check_in = CheckIn.create!(
        couple: couple,
        participants: [alex.id, jordan.id],
        started_at: 8.weeks.ago,
        completed_at: 8.weeks.ago + 65.minutes,
        status: 'completed',
        categories: categories.where(name: ['Trust', 'Work-Life Balance', 'Communication']).map(&:id),
        mood_before: 4,
        mood_after: 6,
        reflection: "This was a tough one. We addressed some issues that have been brewing. Work stress has been affecting our relationship, but talking about it openly helped.",
        session_settings_id: SessionSetting.find_by(couple: couple).id
      )

      # Challenging but constructive notes
      Note.create!(
        content: "I've been bringing work stress home and it's not fair to Jordan. I need to create better boundaries.",
        privacy_level: 'shared',
        check_in: check_in,
        category: categories.find_by(name: 'Work-Life Balance'),
        user: alex,
        couple: couple,
        sentiment_score: 0.4
      )

      Note.create!(
        content: "I felt unheard when Alex canceled our plans twice this month for work. But I understand the pressure they're under.",
        privacy_level: 'shared',
        check_in: check_in,
        category: categories.find_by(name: 'Work-Life Balance'),
        user: jordan,
        couple: couple,
        sentiment_score: 0.5
      )

      Note.create!(
        content: "We both commit to protecting our weekend time together. No work emails after 6pm on Fridays.",
        privacy_level: 'shared',
        check_in: check_in,
        category: categories.find_by(name: 'Work-Life Balance'),
        user: alex,
        couple: couple,
        sentiment_score: 0.7
      )

      # Action items from challenging period
      ActionItem.create!(
        title: "Create work-life boundaries",
        description: "Set up 'do not disturb' on phones after 8pm, designate work-free zones at home",
        assigned_to: alex,
        due_date: 1.week.from_now,
        check_in: check_in,
        priority: 'high',
        category: 'personal',
        created_by: alex,
        completed: true,
        completed_at: 7.weeks.ago
      )

      ActionItem.create!(
        title: "Plan stress-relief activities together",
        description: "Find activities we both enjoy that help us decompress - maybe yoga or hiking?",
        assigned_to: nil, # Both
        due_date: 2.weeks.from_now,
        check_in: check_in,
        priority: 'medium',
        category: 'shared',
        created_by: jordan,
        completed: true,
        completed_at: 6.weeks.ago
      )
    end

    def create_growth_period_check_ins
      # Check-in showing growth and improvement
      check_in = CheckIn.create!(
        couple: couple,
        participants: [alex.id, jordan.id],
        started_at: 4.weeks.ago,
        completed_at: 4.weeks.ago + 40.minutes,
        status: 'completed',
        categories: categories.where(name: ['Intimacy', 'Future Goals', 'Fun & Recreation']).map(&:id),
        mood_before: 7,
        mood_after: 9,
        reflection: "What a difference from a month ago! The boundaries we set are working. We're feeling more connected and having fun together again. The hiking trips have been amazing for us.",
        session_settings_id: SessionSetting.find_by(couple: couple).id
      )

      # Positive growth notes
      Note.create!(
        content: "Our physical and emotional intimacy has improved so much since we started prioritizing quality time together.",
        privacy_level: 'shared',
        check_in: check_in,
        category: categories.find_by(name: 'Intimacy'),
        user: jordan,
        couple: couple,
        sentiment_score: 0.9
      )

      Note.create!(
        content: "I love our new Sunday morning hiking tradition! It's become my favorite part of the week.",
        privacy_level: 'shared',
        check_in: check_in,
        category: categories.find_by(name: 'Fun & Recreation'),
        user: alex,
        couple: couple,
        sentiment_score: 0.95
      )

      Note.create!(
        content: "We talked about potentially moving in together next year. Exciting but also nerve-wracking!",
        privacy_level: 'shared',
        check_in: check_in,
        category: categories.find_by(name: 'Future Goals'),
        user: alex,
        couple: couple,
        sentiment_score: 0.8
      )
    end

    def create_recent_check_ins
      # Most recent completed check-in
      check_in = CheckIn.create!(
        couple: couple,
        participants: [alex.id, jordan.id],
        started_at: 1.week.ago,
        completed_at: 1.week.ago + 35.minutes,
        status: 'completed',
        categories: categories.where(name: ['Communication', 'Finances', 'Family']).map(&:id),
        mood_before: 6,
        mood_after: 8,
        reflection: "Good productive session. We're getting better at discussing money without it becoming tense. Also made progress on holiday plans with both families.",
        session_settings_id: SessionSetting.find_by(couple: couple).id
      )

      Note.create!(
        content: "Created our first joint budget! It wasn't as scary as I thought it would be.",
        privacy_level: 'shared',
        check_in: check_in,
        category: categories.find_by(name: 'Finances'),
        user: jordan,
        couple: couple,
        sentiment_score: 0.8
      )

      Note.create!(
        content: "We're going to alternate holidays between families. This year: Thanksgiving with Jordan's family, Christmas with mine.",
        privacy_level: 'shared',
        check_in: check_in,
        category: categories.find_by(name: 'Family'),
        user: alex,
        couple: couple,
        sentiment_score: 0.75
      )

      # Current action items
      ActionItem.create!(
        title: "Open joint savings account",
        description: "For our future apartment fund",
        assigned_to: jordan,
        due_date: 1.week.from_now,
        check_in: check_in,
        priority: 'medium',
        category: 'shared',
        created_by: jordan,
        completed: false
      )

      ActionItem.create!(
        title: "Book flights for Thanksgiving",
        description: "Check for deals, coordinate with Jordan's parents on dates",
        assigned_to: alex,
        due_date: 3.days.from_now,
        check_in: check_in,
        priority: 'high',
        category: 'shared',
        created_by: alex,
        completed: false
      )
    end

    def create_in_progress_check_in
      # Current in-progress check-in
      CheckIn.create!(
        couple: couple,
        participants: [alex.id],
        started_at: 30.minutes.ago,
        status: 'in-progress',
        categories: categories.first(2).map(&:id),
        mood_before: 7,
        session_settings_id: SessionSetting.find_by(couple: couple).id
      )

      logger.info "  ✓ Created in-progress check-in"
    end

    def create_check_ins_with_progression
      # Handled by create_relationship_timeline method
    end

    def create_milestones
      milestones_data = [
        {
          title: 'First Check-in Together',
          description: 'Started our journey of intentional communication',
          date: 12.weeks.ago,
          category: 'communication'
        },
        {
          title: 'One Month Check-in Streak',
          description: 'Maintained weekly check-ins for a full month!',
          date: 8.weeks.ago,
          category: 'growth'
        },
        {
          title: 'Worked Through First Major Challenge',
          description: 'Addressed work-life balance issues honestly and constructively',
          date: 7.weeks.ago,
          category: 'growth'
        },
        {
          title: 'Started Sunday Hiking Tradition',
          description: 'Found our special activity that brings us joy',
          date: 6.weeks.ago,
          category: 'celebration'
        },
        {
          title: 'Created First Budget Together',
          description: 'Major step in planning our future together',
          date: 1.week.ago,
          category: 'growth'
        },
        {
          title: 'Two Year Anniversary',
          description: 'Two amazing years together and many more to come!',
          date: 2.days.ago,
          category: 'celebration'
        }
      ]

      milestones_data.each do |data|
        Milestone.find_or_create_by!(
          title: data[:title],
          couple: couple
        ) do |milestone|
          milestone.description = data[:description]
          milestone.achieved_at = data[:date]
          milestone.category = data[:category]
        end
      end

      logger.info "  ✓ Created #{milestones_data.length} milestones"
    end

    def create_reminders
      # Check-in reminder for Alex
      Reminder.find_or_create_by!(
        couple: couple,
        user: alex,
        reminder_type: 'check_in'
      ) do |reminder|
        reminder.frequency = 'weekly'
        reminder.day_of_week = 0 # Sunday
        reminder.time_of_day = '19:00'
        reminder.enabled = true
        reminder.message = 'Time for your weekly check-in with Jordan! 💑'
      end

      # Check-in reminder for Jordan
      Reminder.find_or_create_by!(
        couple: couple,
        user: jordan,
        reminder_type: 'check_in'
      ) do |reminder|
        reminder.frequency = 'weekly'
        reminder.day_of_week = 0 # Sunday
        reminder.time_of_day = '19:00'
        reminder.enabled = true
        reminder.message = 'Weekly check-in time with Alex! 💕'
      end

      # Action item reminder for Jordan
      Reminder.find_or_create_by!(
        couple: couple,
        user: jordan,
        reminder_type: 'action_item'
      ) do |reminder|
        reminder.frequency = 'daily'
        reminder.time_of_day = '09:00'
        reminder.enabled = true
        reminder.message = 'Review your action items for today'
      end

      logger.info "  ✓ Created reminders"
    end

    def create_custom_categories
      # Custom category specific to their needs
      Category.find_or_create_by!(
        name: 'Apartment Planning',
        couple: couple
      ) do |category|
        category.icon = '🏠'
        category.description = 'Planning our move-in together'
        category.prompts = [
          'What are our must-haves for an apartment?',
          'How will we divide household responsibilities?',
          'What\'s our budget and timeline?'
        ]
        category.is_custom = true
        category.order = 10
      end

      logger.info "  ✓ Created custom categories"
    end
  end
end