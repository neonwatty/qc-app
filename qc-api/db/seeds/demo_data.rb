# Demo data seeder for creating realistic scenarios
module DemoData
  class Seeder
    attr_reader :logger

    def initialize(logger = Rails.logger)
      @logger = logger
    end

    def seed!
      logger.info "🎭 Creating demo scenarios..."

      create_happy_couple
      create_working_through_issues_couple
      create_new_relationship_couple
      create_long_term_couple

      logger.info "✅ Demo scenarios created!"
    end

    private

    def create_happy_couple
      logger.info "Creating happy couple scenario..."

      # Create users
      emma = User.create!(
        email: 'emma@demo.com',
        password: 'demo123456',
        password_confirmation: 'demo123456',
        name: 'Emma Wilson',
        pronouns: 'she/her',
        love_languages: ['quality_time', 'acts_of_service']
      )

      noah = User.create!(
        email: 'noah@demo.com',
        password: 'demo123456',
        password_confirmation: 'demo123456',
        name: 'Noah Davis',
        pronouns: 'he/him',
        love_languages: ['words_of_affirmation', 'physical_touch']
      )

      couple = Couple.create!(
        name: 'Emma & Noah',
        anniversary: 3.years.ago
      )

      emma.update!(couple: couple)
      noah.update!(couple: couple)

      # Create consistent positive check-ins
      categories = Category.where(is_custom: false).first(4)

      8.times do |i|
        checkin = CheckIn.create!(
          couple: couple,
          participants: [emma.id, noah.id],
          started_at: (8 - i).weeks.ago,
          completed_at: (8 - i).weeks.ago + 35.minutes,
          status: 'completed',
          categories: categories.map(&:id),
          mood_before: rand(6..8),
          mood_after: rand(8..10),
          reflection: positive_reflections.sample
        )

        # Create mostly positive notes
        create_positive_notes(checkin, emma, noah, categories.sample(2))

        # Few action items, mostly completed
        if i.even?
          ActionItem.create!(
            title: positive_action_items.sample,
            assigned_to: [emma, noah].sample,
            due_date: rand(3..7).days.from_now,
            check_in: checkin,
            priority: 'low',
            completed: i > 2
          )
        end
      end

      # Create positive milestones
      positive_milestones.each_with_index do |milestone, i|
        Milestone.create!(
          title: milestone[:title],
          description: milestone[:description],
          achieved_at: (milestones.length - i).weeks.ago,
          couple: couple,
          category: 'celebration'
        )
      end
    end

    def create_working_through_issues_couple
      logger.info "Creating couple working through issues..."

      maya = User.create!(
        email: 'maya@demo.com',
        password: 'demo123456',
        password_confirmation: 'demo123456',
        name: 'Maya Patel',
        pronouns: 'she/her',
        love_languages: ['quality_time', 'receiving_gifts']
      )

      james = User.create!(
        email: 'james@demo.com',
        password: 'demo123456',
        password_confirmation: 'demo123456',
        name: 'James Thompson',
        pronouns: 'he/him',
        love_languages: ['physical_touch', 'acts_of_service']
      )

      couple = Couple.create!(
        name: 'Maya & James',
        anniversary: 18.months.ago
      )

      maya.update!(couple: couple)
      james.update!(couple: couple)

      # Create check-ins showing improvement over time
      categories = Category.where(name: ['Communication', 'Trust', 'Work-Life Balance'])

      6.times do |i|
        mood_progression = i < 3 ? rand(3..5) : rand(5..8)

        checkin = CheckIn.create!(
          couple: couple,
          participants: [maya.id, james.id],
          started_at: (6 - i).weeks.ago,
          completed_at: (6 - i).weeks.ago + 50.minutes,
          status: 'completed',
          categories: categories.map(&:id),
          mood_before: mood_progression,
          mood_after: mood_progression + rand(1..2),
          reflection: i < 3 ? challenging_reflections.sample : improving_reflections.sample
        )

        # Mix of challenging and supportive notes
        create_mixed_notes(checkin, maya, james, categories)

        # More action items focused on improvement
        2.times do
          ActionItem.create!(
            title: improvement_action_items.sample,
            description: "Working together to improve our relationship",
            assigned_to: [maya, james].sample,
            due_date: rand(3..10).days.from_now,
            check_in: checkin,
            priority: ['medium', 'high'].sample,
            completed: i > 3 && rand(100) > 30
          )
        end
      end

      # Create improvement milestones
      Milestone.create!(
        title: 'Started couples therapy',
        description: 'Took the step to get professional support',
        achieved_at: 5.weeks.ago,
        couple: couple,
        category: 'growth'
      )

      Milestone.create!(
        title: 'Had breakthrough conversation',
        description: 'Finally understood each other\'s perspectives',
        achieved_at: 2.weeks.ago,
        couple: couple,
        category: 'communication'
      )
    end

    def create_new_relationship_couple
      logger.info "Creating new relationship couple..."

      sophia = User.create!(
        email: 'sophia@demo.com',
        password: 'demo123456',
        password_confirmation: 'demo123456',
        name: 'Sophia Kim',
        pronouns: 'she/her',
        love_languages: ['words_of_affirmation', 'quality_time']
      )

      alex = User.create!(
        email: 'alex.demo@demo.com',
        password: 'demo123456',
        password_confirmation: 'demo123456',
        name: 'Alex Rivera',
        pronouns: 'they/them',
        love_languages: ['physical_touch', 'receiving_gifts']
      )

      couple = Couple.create!(
        name: 'Sophia & Alex',
        anniversary: 4.months.ago
      )

      sophia.update!(couple: couple)
      alex.update!(couple: couple)

      # Only a few check-ins, showing excitement
      categories = Category.where(name: ['Future Goals', 'Fun & Recreation', 'Intimacy'])

      3.times do |i|
        checkin = CheckIn.create!(
          couple: couple,
          participants: [sophia.id, alex.id],
          started_at: (3 - i).weeks.ago,
          completed_at: (3 - i).weeks.ago + 25.minutes,
          status: 'completed',
          categories: categories.map(&:id),
          mood_before: rand(7..9),
          mood_after: 10,
          reflection: new_relationship_reflections.sample
        )

        create_excited_notes(checkin, sophia, alex, categories)

        # Fun action items
        ActionItem.create!(
          title: fun_action_items.sample,
          assigned_to: [sophia, alex, nil].sample, # Some assigned to both
          due_date: rand(1..7).days.from_now,
          check_in: checkin,
          priority: 'medium',
          completed: false
        )
      end

      # New relationship milestones
      Milestone.create!(
        title: 'First "I love you"',
        description: 'Said those three special words',
        achieved_at: 1.week.ago,
        couple: couple,
        category: 'celebration'
      )
    end

    def create_long_term_couple
      logger.info "Creating long-term stable couple..."

      robert = User.create!(
        email: 'robert@demo.com',
        password: 'demo123456',
        password_confirmation: 'demo123456',
        name: 'Robert Chen',
        pronouns: 'he/him',
        love_languages: ['acts_of_service', 'quality_time']
      )

      sarah = User.create!(
        email: 'sarah@demo.com',
        password: 'demo123456',
        password_confirmation: 'demo123456',
        name: 'Sarah Chen',
        pronouns: 'she/her',
        love_languages: ['words_of_affirmation', 'receiving_gifts']
      )

      couple = Couple.create!(
        name: 'Robert & Sarah',
        anniversary: 12.years.ago
      )

      robert.update!(couple: couple)
      sarah.update!(couple: couple)

      # Consistent monthly check-ins
      categories = Category.where(name: ['Family', 'Finances', 'Future Goals', 'Work-Life Balance'])

      12.times do |i|
        checkin = CheckIn.create!(
          couple: couple,
          participants: [robert.id, sarah.id],
          started_at: (12 - i).months.ago,
          completed_at: (12 - i).months.ago + 40.minutes,
          status: 'completed',
          categories: categories.sample(3).map(&:id),
          mood_before: rand(6..7),
          mood_after: rand(7..9),
          reflection: long_term_reflections.sample
        )

        create_mature_notes(checkin, robert, sarah, categories.sample(2))

        # Practical action items
        if i % 3 == 0
          ActionItem.create!(
            title: practical_action_items.sample,
            description: "Regular maintenance of our life together",
            assigned_to: [robert, sarah].sample,
            due_date: 1.month.from_now,
            check_in: checkin,
            priority: 'medium',
            completed: i > 6
          )
        end
      end

      # Long-term milestones
      long_term_milestones.each_with_index do |milestone, i|
        Milestone.create!(
          title: milestone[:title],
          description: milestone[:description],
          achieved_at: milestone[:date],
          couple: couple,
          category: milestone[:category]
        )
      end
    end

    # Helper methods for content generation

    def positive_reflections
      [
        "We're really in sync lately. Communication feels effortless and we're supporting each other well.",
        "Feeling grateful for how we handle challenges together. Our teamwork is getting stronger.",
        "This week reminded us why we fell in love. Small moments of connection mean everything.",
        "We're growing together beautifully. Each check-in helps us understand each other better."
      ]
    end

    def challenging_reflections
      [
        "It's been tough, but we're committed to working through this together.",
        "We identified some patterns that need work. It's uncomfortable but necessary.",
        "Not our best week, but being honest about it is a step forward.",
        "We're struggling with balance, but at least we're talking about it."
      ]
    end

    def improving_reflections
      [
        "We can feel the shift happening. Things that were hard are getting easier.",
        "The work we've been doing is paying off. Communication is improving.",
        "We're finding our rhythm again. It feels good to be on the same team.",
        "Progress isn't always linear, but we're definitely moving forward."
      ]
    end

    def new_relationship_reflections
      [
        "Everything feels exciting and new! We're learning so much about each other.",
        "Can't believe how compatible we are. Every check-in reveals more common ground.",
        "Still in that honeymoon phase but these check-ins are helping us build something real."
      ]
    end

    def long_term_reflections
      [
        "Another month of navigating life together. Our foundation is solid.",
        "After all these years, we still find new ways to support each other.",
        "Routine maintenance for our relationship. These check-ins keep us connected.",
        "Grateful for the life we've built. These conversations help us stay aligned."
      ]
    end

    def positive_action_items
      [
        "Plan surprise date night",
        "Write appreciation notes to each other",
        "Cook favorite meal together",
        "Take weekend trip"
      ]
    end

    def improvement_action_items
      [
        "Schedule weekly one-on-one time",
        "Practice active listening exercises",
        "Attend couples therapy session",
        "Create shared calendar for better coordination",
        "Establish device-free dinner time"
      ]
    end

    def fun_action_items
      [
        "Try that new restaurant",
        "Plan weekend adventure",
        "Take dance lessons",
        "Start watching new series together",
        "Book concert tickets"
      ]
    end

    def practical_action_items
      [
        "Review monthly budget",
        "Schedule home maintenance",
        "Plan holiday travel",
        "Update insurance policies",
        "Organize family calendar"
      ]
    end

    def positive_milestones
      [
        { title: "100 day streak", description: "Consistent daily connection" },
        { title: "Overcame first big challenge", description: "Handled it with grace" },
        { title: "Anniversary celebration", description: "Three amazing years" }
      ]
    end

    def long_term_milestones
      [
        {
          title: "10 year anniversary",
          description: "A decade of love and growth",
          date: 2.years.ago,
          category: 'celebration'
        },
        {
          title: "Kids started school",
          description: "New chapter as a family",
          date: 1.year.ago,
          category: 'family'
        },
        {
          title: "Bought our dream home",
          description: "Finally settled in our forever home",
          date: 6.months.ago,
          category: 'celebration'
        }
      ]
    end

    def create_positive_notes(checkin, user1, user2, categories)
      categories.each do |category|
        Note.create!(
          content: "Really appreciate how we're handling #{category.name.downcase}. Feeling connected and supported.",
          privacy_level: 'shared',
          check_in: checkin,
          category: category,
          user: [user1, user2].sample,
          couple: checkin.couple,
          sentiment_score: rand(0.7..0.95)
        )
      end
    end

    def create_mixed_notes(checkin, user1, user2, categories)
      categories.each do |category|
        # Shared note - constructive
        Note.create!(
          content: "We need to work on #{category.name.downcase}, but I believe we can figure this out together.",
          privacy_level: 'shared',
          check_in: checkin,
          category: category,
          user: user1,
          couple: checkin.couple,
          sentiment_score: rand(0.4..0.6)
        )

        # Private note - processing
        Note.create!(
          content: "Feeling frustrated about #{category.name.downcase} but trying to stay open and patient.",
          privacy_level: 'private',
          check_in: checkin,
          category: category,
          user: user2,
          couple: checkin.couple,
          sentiment_score: rand(0.3..0.5)
        )
      end
    end

    def create_excited_notes(checkin, user1, user2, categories)
      categories.each do |category|
        Note.create!(
          content: "So excited about our plans for #{category.name.downcase}! Can't wait to see where this goes.",
          privacy_level: 'shared',
          check_in: checkin,
          category: category,
          user: [user1, user2].sample,
          couple: checkin.couple,
          sentiment_score: rand(0.8..0.98)
        )
      end
    end

    def create_mature_notes(checkin, user1, user2, categories)
      categories.each do |category|
        Note.create!(
          content: "#{category.name} is stable. We have good systems in place and communicate well about changes.",
          privacy_level: 'shared',
          check_in: checkin,
          category: category,
          user: [user1, user2].sample,
          couple: checkin.couple,
          sentiment_score: rand(0.6..0.8)
        )
      end
    end
  end
end

# Run this seeder with: DemoData::Seeder.new.seed!