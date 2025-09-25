namespace :data do
  desc "Migrate localStorage data from frontend to Rails database"
  task migrate_from_localstorage: :environment do
    require 'json'

    Rails.logger = Logger.new($stdout)
    Rails.logger.info "Starting localStorage data migration..."

    # This task would typically receive JSON data from the frontend
    # For demonstration, we'll show how to process localStorage structure
    def migrate_user_data(user_data)
      user = User.find_or_initialize_by(email: user_data['email'])
      user.assign_attributes(
        name: user_data['name'],
        pronouns: user_data['pronouns'],
        love_languages: user_data['loveLanguages'] || []
      )

      if user.new_record?
        # Set a temporary password for new users
        user.password = SecureRandom.hex(16)
        user.password_confirmation = user.password
      end

      user.save!
      Rails.logger.info "  ✓ Migrated user: #{user.email}"
      user
    end

    def migrate_couple_data(couple_data, users)
      couple = Couple.find_or_initialize_by(
        name: couple_data['name']
      )
      couple.anniversary = couple_data['anniversary'] if couple_data['anniversary']
      couple.save!

      # Associate users with couple
      users.each { |user| user.update!(couple: couple) }

      Rails.logger.info "  ✓ Migrated couple: #{couple.name}"
      couple
    end

    def migrate_categories(categories_data)
      categories_data.each_with_index do |cat_data, index|
        category = Category.find_or_initialize_by(
          name: cat_data['name'],
          is_custom: cat_data['isCustom'] || false
        )

        category.assign_attributes(
          icon: cat_data['icon'] || '📝',
          description: cat_data['description'],
          prompts: cat_data['prompts'] || [],
          order: index
        )

        category.save!
        Rails.logger.info "  ✓ Migrated category: #{category.name}"
      end
    end

    def migrate_checkins(checkins_data, couple)
      checkins_data.each do |checkin_data|
        checkin = CheckIn.find_or_initialize_by(
          id: checkin_data['id']
        )

        checkin.assign_attributes(
          couple: couple,
          participants: checkin_data['participants'] || [],
          started_at: checkin_data['startedAt'] || checkin_data['createdAt'],
          completed_at: checkin_data['completedAt'],
          status: checkin_data['status'] || 'completed',
          categories: checkin_data['categories'] || [],
          mood_before: checkin_data['moodBefore'],
          mood_after: checkin_data['moodAfter'],
          reflection: checkin_data['reflection']
        )

        checkin.save!
        Rails.logger.info "  ✓ Migrated check-in: #{checkin.id}"

        # Migrate associated notes
        migrate_notes(checkin_data['notes'] || [], checkin, couple) if checkin_data['notes']

        # Migrate associated action items
        migrate_action_items(checkin_data['actionItems'] || [], checkin) if checkin_data['actionItems']
      end
    end

    def migrate_notes(notes_data, checkin, couple)
      notes_data.each do |note_data|
        note = Note.find_or_initialize_by(
          id: note_data['id']
        )

        note.assign_attributes(
          content: note_data['content'],
          privacy_level: note_data['privacyLevel'] || 'private',
          check_in: checkin,
          couple: couple,
          category_id: note_data['categoryId'],
          user_id: note_data['userId'],
          sentiment_score: note_data['sentimentScore']
        )

        note.save!
      end
    end

    def migrate_action_items(action_items_data, checkin)
      action_items_data.each do |item_data|
        action_item = ActionItem.find_or_initialize_by(
          id: item_data['id']
        )

        action_item.assign_attributes(
          title: item_data['title'],
          description: item_data['description'],
          assigned_to_id: item_data['assignedToId'],
          due_date: item_data['dueDate'],
          completed: item_data['completed'] || false,
          check_in: checkin,
          priority: item_data['priority'] || 'medium',
          category: item_data['category'],
          created_by_id: item_data['createdById']
        )

        action_item.save!
      end
    end

    def migrate_milestones(milestones_data, couple)
      milestones_data.each do |milestone_data|
        milestone = Milestone.find_or_initialize_by(
          id: milestone_data['id']
        )

        milestone.assign_attributes(
          title: milestone_data['title'],
          description: milestone_data['description'],
          achieved_at: milestone_data['achievedAt'] || milestone_data['date'],
          couple: couple,
          category: milestone_data['category'] || 'general'
        )

        milestone.save!
        Rails.logger.info "  ✓ Migrated milestone: #{milestone.title}"
      end
    end

    # Example usage:
    # This would typically be called with JSON data from the frontend
    # rails data:migrate_from_localstorage DATA='{"users": [...], "couple": {...}}'

    if ENV['DATA'].present?
      begin
        data = JSON.parse(ENV['DATA'])

        ActiveRecord::Base.transaction do
          # Migrate users
          Rails.logger.info "Migrating users..."
          users = data['users'].map { |user_data| migrate_user_data(user_data) }

          # Migrate couple
          if data['couple'].present?
            Rails.logger.info "Migrating couple..."
            couple = migrate_couple_data(data['couple'], users)

            # Migrate categories
            if data['categories'].present?
              Rails.logger.info "Migrating categories..."
              migrate_categories(data['categories'])
            end

            # Migrate check-ins
            if data['checkins'].present?
              Rails.logger.info "Migrating check-ins..."
              migrate_checkins(data['checkins'], couple)
            end

            # Migrate milestones
            if data['milestones'].present?
              Rails.logger.info "Migrating milestones..."
              migrate_milestones(data['milestones'], couple)
            end
          end
        end

        Rails.logger.info "✅ Migration completed successfully!"
        Rails.logger.info "Summary:"
        Rails.logger.info "  • Users: #{User.count}"
        Rails.logger.info "  • Couples: #{Couple.count}"
        Rails.logger.info "  • Check-ins: #{CheckIn.count}"
        Rails.logger.info "  • Notes: #{Note.count}"
        Rails.logger.info "  • Action Items: #{ActionItem.count}"
        Rails.logger.info "  • Milestones: #{Milestone.count}"

      rescue JSON::ParserError => e
        Rails.logger.error "❌ Invalid JSON data: #{e.message}"
        exit 1
      rescue ActiveRecord::RecordInvalid => e
        Rails.logger.error "❌ Validation error: #{e.message}"
        exit 1
      rescue StandardError => e
        Rails.logger.error "❌ Migration failed: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        exit 1
      end
    else
      Rails.logger.info "Usage: rails data:migrate_from_localstorage DATA='{...}'"
      Rails.logger.info ""
      Rails.logger.info "Expected JSON structure:"
      Rails.logger.info "{"
      Rails.logger.info '  "users": [{"email": "...", "name": "...", ...}],'
      Rails.logger.info '  "couple": {"name": "...", "anniversary": "..."},'
      Rails.logger.info '  "categories": [{"name": "...", "icon": "...", ...}],'
      Rails.logger.info '  "checkins": [{"id": "...", "status": "...", ...}],'
      Rails.logger.info '  "milestones": [{"title": "...", "date": "...", ...}]'
      Rails.logger.info "}"
    end
  end

  desc "Export database data to localStorage format"
  task export_to_localstorage: :environment do
    Rails.logger = Logger.new($stdout)
    Rails.logger.info "Exporting database to localStorage format..."

    couple = Couple.first
    unless couple
      Rails.logger.error "No couple found in database"
      exit 1
    end

    users = couple.users

    export_data = {
      users: users.map do |user|
        {
          id: user.id,
          email: user.email,
          name: user.name,
          pronouns: user.pronouns,
          loveLanguages: user.love_languages,
          createdAt: user.created_at.iso8601
        }
      end,
      couple: {
        id: couple.id,
        name: couple.name,
        anniversary: couple.anniversary&.iso8601,
        createdAt: couple.created_at.iso8601
      },
      categories: Category.all.map do |category|
        {
          id: category.id,
          name: category.name,
          icon: category.icon,
          description: category.description,
          prompts: category.prompts,
          isCustom: category.is_custom,
          order: category.order
        }
      end,
      checkins: couple.check_ins.includes(:notes, :action_items).map do |checkin|
        {
          id: checkin.id,
          participants: checkin.participants,
          startedAt: checkin.started_at.iso8601,
          completedAt: checkin.completed_at&.iso8601,
          status: checkin.status,
          categories: checkin.categories,
          moodBefore: checkin.mood_before,
          moodAfter: checkin.mood_after,
          reflection: checkin.reflection,
          notes: checkin.notes.map do |note|
            {
              id: note.id,
              content: note.content,
              privacyLevel: note.privacy_level,
              categoryId: note.category_id,
              userId: note.user_id,
              createdAt: note.created_at.iso8601
            }
          end,
          actionItems: checkin.action_items.map do |item|
            {
              id: item.id,
              title: item.title,
              description: item.description,
              assignedToId: item.assigned_to_id,
              dueDate: item.due_date&.iso8601,
              completed: item.completed,
              priority: item.priority,
              category: item.category
            }
          end
        }
      end,
      milestones: couple.milestones.map do |milestone|
        {
          id: milestone.id,
          title: milestone.title,
          description: milestone.description,
          achievedAt: milestone.achieved_at.iso8601,
          category: milestone.category
        }
      end
    }

    # Output as JSON
    puts JSON.pretty_generate(export_data)

    # Optionally save to file
    if ENV['OUTPUT'].present?
      File.write(ENV['OUTPUT'], JSON.pretty_generate(export_data))
      Rails.logger.info "✅ Exported to #{ENV['OUTPUT']}"
    end
  end

  desc "Reset demo data to initial state"
  task reset_demo: :environment do
    Rails.logger = Logger.new($stdout)
    Rails.logger.info "Resetting demo data..."

    if Rails.env.production?
      Rails.logger.error "Cannot reset data in production!"
      exit 1
    end

    # Clear all data
    ActiveRecord::Base.transaction do
      ActionItem.destroy_all
      Note.destroy_all
      CheckIn.destroy_all
      Milestone.destroy_all
      Reminder.destroy_all
      SessionSetting.destroy_all
      Category.where(is_custom: true).destroy_all
      CoupleInvitation.destroy_all
      Couple.destroy_all
      User.destroy_all
    end

    # Run seeds
    Rails.application.load_seed

    Rails.logger.info "✅ Demo data reset complete!"
  end
end