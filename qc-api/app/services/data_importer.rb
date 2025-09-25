# Service class for importing localStorage data from Next.js application to Rails database
class DataImporter
  attr_reader :data, :logger, :errors, :imported_counts

  def initialize(json_data, logger = Rails.logger)
    @data = parse_json(json_data)
    @logger = logger
    @errors = []
    @imported_counts = Hash.new(0)
  end

  def import!
    return false if @data.nil?

    logger.info "Starting data import..."

    ActiveRecord::Base.transaction do
      import_users if @data["users"].present?
      import_couple if @data["couple"].present?
      import_categories if @data["categories"].present?
      import_checkins if @data["checkins"].present?
      import_milestones if @data["milestones"].present?
      import_notes if @data["notes"].present?
      import_action_items if @data["actionItems"].present?
      import_reminders if @data["reminders"].present?

      if errors.any?
        logger.error "Import failed with #{errors.count} errors:"
        errors.each { |error| logger.error "  - #{error}" }
        raise ActiveRecord::Rollback
      end
    end

    log_summary
    errors.empty?
  rescue StandardError => e
    errors << "Import failed: #{e.message}"
    logger.error "Import failed: #{e.message}"
    logger.error e.backtrace.join("\n")
    false
  end

  def export_current_data(couple_id = nil)
    couple = couple_id ? Couple.find(couple_id) : Couple.first
    return {} unless couple

    {
      users: export_users(couple),
      couple: export_couple(couple),
      categories: export_categories(couple),
      checkins: export_checkins(couple),
      milestones: export_milestones(couple),
      notes: export_notes(couple),
      actionItems: export_action_items(couple),
      reminders: export_reminders(couple),
      metadata: {
        exported_at: Time.current.iso8601,
        rails_version: Rails.version,
        export_version: "1.0"
      }
    }
  end

  private

  def parse_json(json_data)
    return json_data if json_data.is_a?(Hash)

    JSON.parse(json_data)
  rescue JSON::ParserError => e
    errors << "Invalid JSON data: #{e.message}"
    logger.error "JSON parsing failed: #{e.message}"
    nil
  end

  def import_users
    return unless @data["users"].present?

    @data["users"].each do |user_data|
      begin
        user = User.find_or_initialize_by(email: user_data["email"])

        user.assign_attributes(
          name: user_data["name"] || user_data["displayName"],
          pronouns: user_data["pronouns"],
          love_languages: parse_love_languages(user_data["loveLanguages"])
        )

        # Set password for new users
        if user.new_record?
          temp_password = SecureRandom.hex(16)
          user.password = temp_password
          user.password_confirmation = temp_password
          user.reset_password_token = SecureRandom.urlsafe_base64
          user.reset_password_sent_at = Time.current
        end

        user.save!
        imported_counts[:users] += 1
        logger.info "  ✓ Imported user: #{user.email}"

        # Store mapping for later reference
        @user_mapping ||= {}
        @user_mapping[user_data["id"]] = user.id if user_data["id"]

      rescue ActiveRecord::RecordInvalid => e
        errors << "Failed to import user #{user_data['email']}: #{e.message}"
      end
    end
  end

  def import_couple
    return unless @data["couple"].present?

    couple_data = @data["couple"]

    begin
      @couple = Couple.find_or_initialize_by(
        name: couple_data["name"] || "Imported Couple"
      )

      @couple.assign_attributes(
        anniversary: parse_date(couple_data["anniversary"])
      )

      @couple.save!
      imported_counts[:couples] += 1
      logger.info "  ✓ Imported couple: #{@couple.name}"

      # Associate users with couple
      if @user_mapping && @couple
        User.where(id: @user_mapping.values).update_all(couple_id: @couple.id)
      end

    rescue ActiveRecord::RecordInvalid => e
      errors << "Failed to import couple: #{e.message}"
    end
  end

  def import_categories
    return unless @data["categories"].present?

    @data["categories"].each_with_index do |category_data, index|
      begin
        category = Category.find_or_initialize_by(
          name: category_data["name"],
          couple_id: category_data["isCustom"] ? @couple&.id : nil
        )

        category.assign_attributes(
          icon: category_data["icon"] || "📝",
          description: category_data["description"],
          prompts: Array(category_data["prompts"]),
          is_custom: category_data["isCustom"] || false,
          order: category_data["order"] || index
        )

        category.save!
        imported_counts[:categories] += 1
        logger.info "  ✓ Imported category: #{category.name}"

        # Store mapping
        @category_mapping ||= {}
        @category_mapping[category_data["id"]] = category.id if category_data["id"]

      rescue ActiveRecord::RecordInvalid => e
        errors << "Failed to import category #{category_data['name']}: #{e.message}"
      end
    end
  end

  def import_checkins
    return unless @data["checkins"].present? && @couple

    @data["checkins"].each do |checkin_data|
      begin
        checkin = CheckIn.find_or_initialize_by(
          couple_id: @couple.id,
          started_at: parse_datetime(checkin_data["startedAt"] || checkin_data["createdAt"])
        )

        # Map participant IDs
        participants = parse_participants(checkin_data["participants"])

        # Map category IDs
        categories = parse_category_ids(checkin_data["categories"])

        checkin.assign_attributes(
          participants: participants,
          completed_at: parse_datetime(checkin_data["completedAt"]),
          status: checkin_data["status"] || "completed",
          categories: categories,
          mood_before: checkin_data["moodBefore"],
          mood_after: checkin_data["moodAfter"],
          reflection: checkin_data["reflection"]
        )

        checkin.save!
        imported_counts[:checkins] += 1
        logger.info "  ✓ Imported check-in from #{checkin.started_at}"

        # Store mapping
        @checkin_mapping ||= {}
        @checkin_mapping[checkin_data["id"]] = checkin.id if checkin_data["id"]

        # Import nested notes if present
        if checkin_data["notes"].present?
          import_checkin_notes(checkin, checkin_data["notes"])
        end

        # Import nested action items if present
        if checkin_data["actionItems"].present?
          import_checkin_action_items(checkin, checkin_data["actionItems"])
        end

      rescue ActiveRecord::RecordInvalid => e
        errors << "Failed to import check-in: #{e.message}"
      end
    end
  end

  def import_checkin_notes(checkin, notes_data)
    notes_data.each do |note_data|
      begin
        note = Note.find_or_initialize_by(
          check_in_id: checkin.id,
          content: note_data["content"]
        )

        note.assign_attributes(
          privacy_level: note_data["privacyLevel"] || note_data["privacy"] || "private",
          category_id: map_category_id(note_data["categoryId"]),
          user_id: map_user_id(note_data["userId"] || note_data["authorId"]),
          couple_id: @couple.id,
          sentiment_score: note_data["sentimentScore"]
        )

        note.save!
        imported_counts[:notes] += 1

      rescue ActiveRecord::RecordInvalid => e
        errors << "Failed to import note: #{e.message}"
      end
    end
  end

  def import_checkin_action_items(checkin, action_items_data)
    action_items_data.each do |item_data|
      begin
        action_item = ActionItem.find_or_initialize_by(
          check_in_id: checkin.id,
          title: item_data["title"]
        )

        action_item.assign_attributes(
          description: item_data["description"],
          assigned_to_id: map_user_id(item_data["assignedToId"] || item_data["assignedTo"]),
          due_date: parse_date(item_data["dueDate"]),
          completed: item_data["completed"] || false,
          completed_at: parse_datetime(item_data["completedAt"]),
          priority: item_data["priority"] || "medium",
          category: item_data["category"],
          created_by_id: map_user_id(item_data["createdById"] || item_data["createdBy"])
        )

        action_item.save!
        imported_counts[:action_items] += 1

      rescue ActiveRecord::RecordInvalid => e
        errors << "Failed to import action item: #{e.message}"
      end
    end
  end

  def import_notes
    return unless @data["notes"].present? && @couple

    # Import standalone notes (not associated with check-ins)
    @data["notes"].each do |note_data|
      next if note_data["checkInId"] || note_data["checkin_id"] # Skip if already imported with check-in

      begin
        note = Note.find_or_initialize_by(
          couple_id: @couple.id,
          content: note_data["content"]
        )

        note.assign_attributes(
          privacy_level: note_data["privacyLevel"] || note_data["privacy"] || "private",
          category_id: map_category_id(note_data["categoryId"]),
          user_id: map_user_id(note_data["userId"] || note_data["authorId"]),
          sentiment_score: note_data["sentimentScore"],
          check_in_id: map_checkin_id(note_data["checkInId"])
        )

        note.save!
        imported_counts[:notes] += 1
        logger.info "  ✓ Imported standalone note"

      rescue ActiveRecord::RecordInvalid => e
        errors << "Failed to import note: #{e.message}"
      end
    end
  end

  def import_action_items
    return unless @data["actionItems"].present? && @couple

    # Import standalone action items (not associated with check-ins)
    @data["actionItems"].each do |item_data|
      next if item_data["checkInId"] || item_data["checkin_id"] # Skip if already imported with check-in

      begin
        # Try to find associated check-in if reference exists
        check_in_id = map_checkin_id(item_data["checkInId"])

        action_item = ActionItem.find_or_initialize_by(
          title: item_data["title"],
          check_in_id: check_in_id
        )

        action_item.assign_attributes(
          description: item_data["description"],
          assigned_to_id: map_user_id(item_data["assignedToId"] || item_data["assignedTo"]),
          due_date: parse_date(item_data["dueDate"]),
          completed: item_data["completed"] || false,
          completed_at: parse_datetime(item_data["completedAt"]),
          priority: item_data["priority"] || "medium",
          category: item_data["category"],
          created_by_id: map_user_id(item_data["createdById"] || item_data["createdBy"])
        )

        # If no check-in, create a placeholder one
        if action_item.check_in_id.nil? && @couple
          placeholder_checkin = CheckIn.create!(
            couple: @couple,
            participants: @user_mapping&.values || [],
            started_at: parse_datetime(item_data["createdAt"]) || 1.day.ago,
            completed_at: parse_datetime(item_data["createdAt"]) || 1.day.ago,
            status: "completed",
            categories: []
          )
          action_item.check_in = placeholder_checkin
        end

        action_item.save!
        imported_counts[:action_items] += 1
        logger.info "  ✓ Imported action item: #{action_item.title}"

      rescue ActiveRecord::RecordInvalid => e
        errors << "Failed to import action item #{item_data['title']}: #{e.message}"
      end
    end
  end

  def import_milestones
    return unless @data["milestones"].present? && @couple

    @data["milestones"].each do |milestone_data|
      begin
        milestone = Milestone.find_or_initialize_by(
          couple_id: @couple.id,
          title: milestone_data["title"]
        )

        milestone.assign_attributes(
          description: milestone_data["description"],
          achieved_at: parse_datetime(milestone_data["achievedAt"] || milestone_data["date"]),
          category: milestone_data["category"] || "general"
        )

        milestone.save!
        imported_counts[:milestones] += 1
        logger.info "  ✓ Imported milestone: #{milestone.title}"

      rescue ActiveRecord::RecordInvalid => e
        errors << "Failed to import milestone #{milestone_data['title']}: #{e.message}"
      end
    end
  end

  def import_reminders
    return unless @data["reminders"].present? && @couple

    @data["reminders"].each do |reminder_data|
      begin
        user_id = map_user_id(reminder_data["userId"])
        next unless user_id # Skip if user not found

        reminder = Reminder.find_or_initialize_by(
          couple_id: @couple.id,
          user_id: user_id,
          reminder_type: reminder_data["type"] || reminder_data["reminderType"] || "check_in"
        )

        reminder.assign_attributes(
          frequency: reminder_data["frequency"] || "weekly",
          day_of_week: reminder_data["dayOfWeek"],
          time_of_day: reminder_data["timeOfDay"] || reminder_data["time"],
          enabled: reminder_data["enabled"] != false,
          message: reminder_data["message"]
        )

        reminder.save!
        imported_counts[:reminders] += 1
        logger.info "  ✓ Imported reminder for user #{user_id}"

      rescue ActiveRecord::RecordInvalid => e
        errors << "Failed to import reminder: #{e.message}"
      end
    end
  end

  # Export methods

  def export_users(couple)
    couple.users.map do |user|
      {
        id: user.id,
        email: user.email,
        name: user.name,
        pronouns: user.pronouns,
        loveLanguages: user.love_languages,
        createdAt: user.created_at.iso8601,
        updatedAt: user.updated_at.iso8601
      }
    end
  end

  def export_couple(couple)
    {
      id: couple.id,
      name: couple.name,
      anniversary: couple.anniversary&.iso8601,
      createdAt: couple.created_at.iso8601,
      updatedAt: couple.updated_at.iso8601
    }
  end

  def export_categories(couple)
    categories = Category.where(couple_id: [ nil, couple.id ])
    categories.map do |category|
      {
        id: category.id,
        name: category.name,
        icon: category.icon,
        description: category.description,
        prompts: category.prompts,
        isCustom: category.is_custom,
        order: category.order,
        createdAt: category.created_at.iso8601
      }
    end
  end

  def export_checkins(couple)
    couple.check_ins.includes(:notes, :action_items).map do |checkin|
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
        notes: checkin.notes.map { |note| export_note(note) },
        actionItems: checkin.action_items.map { |item| export_action_item(item) },
        createdAt: checkin.created_at.iso8601
      }
    end
  end

  def export_milestones(couple)
    couple.milestones.map do |milestone|
      {
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        achievedAt: milestone.achieved_at.iso8601,
        category: milestone.category,
        createdAt: milestone.created_at.iso8601
      }
    end
  end

  def export_notes(couple)
    couple.notes.map { |note| export_note(note) }
  end

  def export_note(note)
    {
      id: note.id,
      content: note.content,
      privacyLevel: note.privacy_level,
      categoryId: note.category_id,
      userId: note.user_id,
      checkInId: note.check_in_id,
      sentimentScore: note.sentiment_score,
      createdAt: note.created_at.iso8601
    }
  end

  def export_action_items(couple)
    ActionItem.joins(:check_in).where(check_ins: { couple_id: couple.id }).map do |item|
      export_action_item(item)
    end
  end

  def export_action_item(item)
    {
      id: item.id,
      title: item.title,
      description: item.description,
      assignedToId: item.assigned_to_id,
      dueDate: item.due_date&.iso8601,
      completed: item.completed,
      completedAt: item.completed_at&.iso8601,
      priority: item.priority,
      category: item.category,
      createdById: item.created_by_id,
      checkInId: item.check_in_id,
      createdAt: item.created_at.iso8601
    }
  end

  def export_reminders(couple)
    couple.reminders.map do |reminder|
      {
        id: reminder.id,
        userId: reminder.user_id,
        reminderType: reminder.reminder_type,
        frequency: reminder.frequency,
        dayOfWeek: reminder.day_of_week,
        timeOfDay: reminder.time_of_day,
        enabled: reminder.enabled,
        message: reminder.message,
        createdAt: reminder.created_at.iso8601
      }
    end
  end

  # Helper methods

  def parse_love_languages(languages)
    return [] unless languages.present?

    Array(languages).map do |lang|
      lang.to_s.underscore.gsub(" ", "_")
    end.select { |lang| User::LOVE_LANGUAGES.include?(lang) }
  end

  def parse_date(date_string)
    return nil unless date_string.present?

    Date.parse(date_string)
  rescue ArgumentError
    nil
  end

  def parse_datetime(datetime_string)
    return nil unless datetime_string.present?

    DateTime.parse(datetime_string)
  rescue ArgumentError
    nil
  end

  def parse_participants(participants_data)
    return [] unless participants_data.present?

    Array(participants_data).map do |participant_id|
      map_user_id(participant_id)
    end.compact
  end

  def parse_category_ids(categories_data)
    return [] unless categories_data.present?

    Array(categories_data).map do |category_id|
      map_category_id(category_id)
    end.compact
  end

  def map_user_id(original_id)
    return nil unless original_id.present?

    @user_mapping&.[](original_id) || original_id
  end

  def map_category_id(original_id)
    return nil unless original_id.present?

    @category_mapping&.[](original_id) || original_id
  end

  def map_checkin_id(original_id)
    return nil unless original_id.present?

    @checkin_mapping&.[](original_id) || original_id
  end

  def log_summary
    logger.info "="*50
    logger.info "✅ Data import completed successfully!"
    logger.info "="*50
    logger.info "Imported:"
    imported_counts.each do |model, count|
      logger.info "  • #{count} #{model.to_s.humanize.downcase}"
    end
    logger.info "="*50
  end
end
