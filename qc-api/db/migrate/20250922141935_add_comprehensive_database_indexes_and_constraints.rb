class AddComprehensiveDatabaseIndexesAndConstraints < ActiveRecord::Migration[8.0]
  def change
    # Performance indexes for frequently queried fields

    # Users table - additional indexes for performance
    add_index :users, :created_at unless index_exists?(:users, :created_at)
    add_index :users, :updated_at unless index_exists?(:users, :updated_at)
    add_index :users, :remember_created_at unless index_exists?(:users, :remember_created_at)

    # Couples table - additional performance indexes
    add_index :couples, :created_at unless index_exists?(:couples, :created_at)
    add_index :couples, :current_streak unless index_exists?(:couples, :current_streak)
    add_index :couples, :total_check_ins unless index_exists?(:couples, :total_check_ins)
    add_index :couples, :updated_at unless index_exists?(:couples, :updated_at)

    # Check-ins table - comprehensive indexing
    add_index :check_ins, :completed_at unless index_exists?(:check_ins, :completed_at)
    add_index :check_ins, :created_at unless index_exists?(:check_ins, :created_at)
    add_index :check_ins, [:couple_id, :status, :created_at], name: "index_check_ins_couple_status_created" unless index_exists?(:check_ins, [:couple_id, :status, :created_at])
    add_index :check_ins, [:couple_id, :completed_at], name: "index_check_ins_couple_completed" unless index_exists?(:check_ins, [:couple_id, :completed_at])

    # Notes table - performance and search indexes
    add_index :notes, :created_at unless index_exists?(:notes, :created_at)
    add_index :notes, [:check_in_id, :privacy], name: "index_notes_checkin_privacy" unless index_exists?(:notes, [:check_in_id, :privacy])
    add_index :notes, [:author_id, :created_at], name: "index_notes_author_created" unless index_exists?(:notes, [:author_id, :created_at])
    add_index :notes, :published_at unless index_exists?(:notes, :published_at)
    add_index :notes, :first_shared_at unless index_exists?(:notes, :first_shared_at)

    # Action Items table - performance optimization
    add_index :action_items, :created_at unless index_exists?(:action_items, :created_at)
    add_index :action_items, [:assigned_to_id, :completed, :due_date], name: "index_action_items_assigned_status_due" unless index_exists?(:action_items, [:assigned_to_id, :completed, :due_date])
    add_index :action_items, [:check_in_id, :completed], name: "index_action_items_checkin_completed" unless index_exists?(:action_items, [:check_in_id, :completed])

    # Reminders table - scheduling and lookup optimization
    add_index :reminders, :created_at unless index_exists?(:reminders, :created_at)
    add_index :reminders, :completed_at unless index_exists?(:reminders, :completed_at)
    add_index :reminders, [:couple_id, :is_active, :scheduled_for], name: "index_reminders_couple_active_scheduled" unless index_exists?(:reminders, [:couple_id, :is_active, :scheduled_for])
    add_index :reminders, [:assigned_to, :is_snoozed, :snooze_until], name: "index_reminders_assigned_snoozed" unless index_exists?(:reminders, [:assigned_to, :is_snoozed, :snooze_until])
    add_index :reminders, :frequency unless index_exists?(:reminders, :frequency)

    # Relationship Requests - workflow optimization
    add_index :relationship_requests, :created_at unless index_exists?(:relationship_requests, :created_at)
    add_index :relationship_requests, :responded_at unless index_exists?(:relationship_requests, :responded_at)
    add_index :relationship_requests, :expires_at unless index_exists?(:relationship_requests, :expires_at)
    add_index :relationship_requests, [:couple_id, :status, :created_at], name: "index_requests_couple_status_created" unless index_exists?(:relationship_requests, [:couple_id, :status, :created_at])
    add_index :relationship_requests, [:requested_for, :status, :priority], name: "index_requests_for_status_priority" unless index_exists?(:relationship_requests, [:requested_for, :status, :priority])

    # Milestones - achievement tracking
    add_index :milestones, :created_at unless index_exists?(:milestones, :created_at)
    add_index :milestones, :progress unless index_exists?(:milestones, :progress)
    add_index :milestones, [:couple_id, :achieved, :rarity], name: "index_milestones_couple_achieved_rarity" unless index_exists?(:milestones, [:couple_id, :achieved, :rarity])
    add_index :milestones, [:couple_id, :category, :achieved], name: "index_milestones_couple_category_achieved" unless index_exists?(:milestones, [:couple_id, :category, :achieved])

    # Session Settings - version management
    add_index :session_settings, :created_at unless index_exists?(:session_settings, :created_at)
    add_index :session_settings, [:couple_id, :archived, :version], name: "index_settings_couple_archived_version" unless index_exists?(:session_settings, [:couple_id, :archived, :version])

    # Session Settings Proposals - workflow
    add_index :session_settings_proposals, :created_at unless index_exists?(:session_settings_proposals, :created_at)
    add_index :session_settings_proposals, :proposed_at unless index_exists?(:session_settings_proposals, :proposed_at)
    add_index :session_settings_proposals, [:couple_id, :status, :proposed_at], name: "index_proposals_couple_status_proposed" unless index_exists?(:session_settings_proposals, [:couple_id, :status, :proposed_at])

    # Love Actions - activity tracking
    if table_exists?(:love_actions)
      add_index :love_actions, :created_at unless index_exists?(:love_actions, :created_at)
      add_index :love_actions, [:created_by, :created_at], name: "index_love_actions_by_created" unless index_exists?(:love_actions, [:created_by, :created_at])
    end

    # Prompt Templates - lookup optimization
    if table_exists?(:prompt_templates)
      add_index :prompt_templates, :created_at unless index_exists?(:prompt_templates, :created_at)
      add_index :prompt_templates, :couple_id unless index_exists?(:prompt_templates, :couple_id)
      add_index :prompt_templates, :category_id unless index_exists?(:prompt_templates, :category_id)
    end

    # Custom Prompts - search optimization
    if table_exists?(:custom_prompts)
      add_index :custom_prompts, :created_at unless index_exists?(:custom_prompts, :created_at)
      add_index :custom_prompts, :couple_id unless index_exists?(:custom_prompts, :couple_id)
      add_index :custom_prompts, :category_id unless index_exists?(:custom_prompts, :category_id)
    end

    # Categories - ordering and lookup
    if table_exists?(:categories)
      add_index :categories, :created_at unless index_exists?(:categories, :created_at)
      # Categories already has couple_id and order indexes
    end

    # Unique constraints for data integrity
    add_index :users, :email, unique: true, name: "unique_index_users_on_email" unless index_exists?(:users, :email, unique: true)
    add_index :milestones, [:couple_id, :title], unique: true, name: "unique_index_milestones_couple_title" unless index_exists?(:milestones, [:couple_id, :title], unique: true)

    # Composite unique constraints
    if table_exists?(:couple_users)
      add_index :couple_users, [:couple_id, :user_id], unique: true, name: "unique_couple_users" unless index_exists?(:couple_users, [:couple_id, :user_id], unique: true)
    end

    # Foreign key constraints for referential integrity
    # Note: Many foreign keys already exist, only adding missing ones
    # Note: Some tables don't have couple_id - they relate through check_ins or users

    # Additional foreign keys for tables that have couple_id
    if table_exists?(:categories)
      unless foreign_key_exists?(:categories, :couples)
        add_foreign_key :categories, :couples
      end
    end

    if table_exists?(:custom_prompts)
      unless foreign_key_exists?(:custom_prompts, :couples)
        add_foreign_key :custom_prompts, :couples
      end
    end

    if table_exists?(:prompt_templates)
      unless foreign_key_exists?(:prompt_templates, :couples)
        add_foreign_key :prompt_templates, :couples
      end
    end

    if table_exists?(:session_preparations)
      unless foreign_key_exists?(:session_preparations, :couples)
        add_foreign_key :session_preparations, :couples
      end
    end

    # Add check constraints for data validation (PostgreSQL specific)
    if ActiveRecord::Base.connection.adapter_name == 'PostgreSQL'
      # Ensure non-negative values
      execute <<-SQL unless check_constraint_exists?(:couples, "check_total_check_ins_non_negative")
        ALTER TABLE couples ADD CONSTRAINT check_total_check_ins_non_negative
        CHECK (total_check_ins >= 0);
      SQL

      execute <<-SQL unless check_constraint_exists?(:couples, "check_current_streak_non_negative")
        ALTER TABLE couples ADD CONSTRAINT check_current_streak_non_negative
        CHECK (current_streak >= 0);
      SQL

      execute <<-SQL unless check_constraint_exists?(:milestones, "check_progress_range")
        ALTER TABLE milestones ADD CONSTRAINT check_progress_range
        CHECK (progress >= 0 AND progress <= 100);
      SQL

      execute <<-SQL unless check_constraint_exists?(:milestones, "check_points_non_negative")
        ALTER TABLE milestones ADD CONSTRAINT check_points_non_negative
        CHECK (points >= 0);
      SQL

      execute <<-SQL unless check_constraint_exists?(:session_settings, "check_session_duration_positive")
        ALTER TABLE session_settings ADD CONSTRAINT check_session_duration_positive
        CHECK (session_duration > 0);
      SQL

      execute <<-SQL unless check_constraint_exists?(:session_settings, "check_version_positive")
        ALTER TABLE session_settings ADD CONSTRAINT check_version_positive
        CHECK (version > 0);
      SQL
    end
  end

  private

  def check_constraint_exists?(table, constraint_name)
    if ActiveRecord::Base.connection.adapter_name == 'PostgreSQL'
      result = ActiveRecord::Base.connection.execute(
        "SELECT 1 FROM pg_constraint WHERE conname = '#{constraint_name}' AND conrelid = '#{table}'::regclass"
      )
      result.any?
    else
      false
    end
  end
end
