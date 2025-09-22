class AddFieldsToRemindersAndRequests < ActiveRecord::Migration[8.0]
  def change
    # Add fields to reminders table (only those that don't exist yet)
    add_column :reminders, :couple_id, :uuid unless column_exists?(:reminders, :couple_id)
    add_column :reminders, :parent_reminder_id, :uuid unless column_exists?(:reminders, :parent_reminder_id)
    add_column :reminders, :custom_frequency_data, :jsonb unless column_exists?(:reminders, :custom_frequency_data)
    add_column :reminders, :advance_notice_minutes, :integer, default: 15 unless column_exists?(:reminders, :advance_notice_minutes)
    add_column :reminders, :priority, :integer unless column_exists?(:reminders, :priority)
    add_column :reminders, :completion_count, :integer, default: 0 unless column_exists?(:reminders, :completion_count)
    add_column :reminders, :skip_count, :integer, default: 0 unless column_exists?(:reminders, :skip_count)
    add_column :reminders, :snooze_count, :integer, default: 0 unless column_exists?(:reminders, :snooze_count)
    add_column :reminders, :reschedule_count, :integer, default: 0 unless column_exists?(:reminders, :reschedule_count)
    add_column :reminders, :skipped_at, :datetime unless column_exists?(:reminders, :skipped_at)
    add_column :reminders, :is_template, :boolean, default: false unless column_exists?(:reminders, :is_template)

    # Add fields to relationship_requests table (only those that don't exist yet)
    add_column :relationship_requests, :couple_id, :uuid unless column_exists?(:relationship_requests, :couple_id)
    add_column :relationship_requests, :notification_preference, :string unless column_exists?(:relationship_requests, :notification_preference)
    add_column :relationship_requests, :expires_at, :datetime unless column_exists?(:relationship_requests, :expires_at)
    add_column :relationship_requests, :response_required_by, :datetime unless column_exists?(:relationship_requests, :response_required_by)
    add_column :relationship_requests, :response_notes, :text unless column_exists?(:relationship_requests, :response_notes)
    add_column :relationship_requests, :decline_reason, :string unless column_exists?(:relationship_requests, :decline_reason)
    add_column :relationship_requests, :accepted_at, :datetime unless column_exists?(:relationship_requests, :accepted_at)
    add_column :relationship_requests, :declined_at, :datetime unless column_exists?(:relationship_requests, :declined_at)
    add_column :relationship_requests, :converted_at, :datetime unless column_exists?(:relationship_requests, :converted_at)
    add_column :relationship_requests, :expired_at, :datetime unless column_exists?(:relationship_requests, :expired_at)
    add_column :relationship_requests, :deferred_until, :datetime unless column_exists?(:relationship_requests, :deferred_until)
    add_column :relationship_requests, :defer_reason, :string unless column_exists?(:relationship_requests, :defer_reason)
    add_column :relationship_requests, :defer_count, :integer, default: 0 unless column_exists?(:relationship_requests, :defer_count)
    add_column :relationship_requests, :discussed, :boolean, default: false unless column_exists?(:relationship_requests, :discussed)
    add_column :relationship_requests, :discussed_at, :datetime unless column_exists?(:relationship_requests, :discussed_at)

    # Add indexes for performance (check if they don't exist)
    add_index :reminders, :couple_id unless index_exists?(:reminders, :couple_id)
    add_index :reminders, :parent_reminder_id unless index_exists?(:reminders, :parent_reminder_id)
    add_index :reminders, [:created_by, :is_active] unless index_exists?(:reminders, [:created_by, :is_active])
    add_index :reminders, [:assigned_to, :is_active] unless index_exists?(:reminders, [:assigned_to, :is_active])

    add_index :relationship_requests, :couple_id unless index_exists?(:relationship_requests, :couple_id)
    add_index :relationship_requests, [:status, :expires_at] unless index_exists?(:relationship_requests, [:status, :expires_at])
    add_index :relationship_requests, [:priority, :status] unless index_exists?(:relationship_requests, [:priority, :status])

    # Add foreign key constraints (only if they don't exist)
    unless foreign_key_exists?(:reminders, :couples)
      add_foreign_key :reminders, :couples
    end
    unless foreign_key_exists?(:reminders, :reminders, column: :parent_reminder_id)
      add_foreign_key :reminders, :reminders, column: :parent_reminder_id
    end
    unless foreign_key_exists?(:reminders, :relationship_requests, column: :converted_from_request_id)
      add_foreign_key :reminders, :relationship_requests, column: :converted_from_request_id
    end
    unless foreign_key_exists?(:relationship_requests, :couples)
      add_foreign_key :relationship_requests, :couples
    end
  end
end
