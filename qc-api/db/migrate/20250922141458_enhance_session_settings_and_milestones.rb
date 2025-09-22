class EnhanceSessionSettingsAndMilestones < ActiveRecord::Migration[8.0]
  def change
    # Add fields to session_settings
    add_column :session_settings, :categories_enabled, :text, array: true, default: []
    add_column :session_settings, :notification_timing, :string
    add_column :session_settings, :reminder_frequency, :string
    add_column :session_settings, :break_intervals, :integer
    add_column :session_settings, :max_session_length, :integer
    add_column :session_settings, :allow_async_mode, :boolean, default: false
    add_column :session_settings, :require_both_present, :boolean, default: true
    add_column :session_settings, :auto_save_notes, :boolean, default: true
    add_column :session_settings, :privacy_mode, :string, default: 'shared'
    add_column :session_settings, :archived, :boolean, default: false

    # Add fields to session_settings_proposals
    add_column :session_settings_proposals, :title, :string
    add_column :session_settings_proposals, :reason, :text
    add_column :session_settings_proposals, :current_settings_id, :uuid
    add_column :session_settings_proposals, :review_message, :text
    add_column :session_settings_proposals, :rejection_reason, :text
    add_column :session_settings_proposals, :withdrawal_reason, :text
    add_column :session_settings_proposals, :withdrawn_at, :datetime
    add_column :session_settings_proposals, :expired_at, :datetime
    add_column :session_settings_proposals, :created_settings_id, :uuid

    # Add fields to milestones
    add_column :milestones, :target_value, :integer unless column_exists?(:milestones, :target_value)
    add_column :milestones, :criteria, :jsonb unless column_exists?(:milestones, :criteria)
    add_column :milestones, :achieved_by, :uuid unless column_exists?(:milestones, :achieved_by)
    add_column :milestones, :achievement_notes, :text unless column_exists?(:milestones, :achievement_notes)

    # Create milestone_achievements table
    create_table :milestone_achievements, id: :uuid do |t|
      t.uuid :milestone_id, null: false
      t.uuid :couple_id, null: false
      t.datetime :achieved_at, null: false
      t.integer :points_earned
      t.integer :bonus_points
      t.timestamps
    end

    # Create milestone_progress_updates table
    create_table :milestone_progress_updates, id: :uuid do |t|
      t.uuid :milestone_id, null: false
      t.integer :previous_progress
      t.integer :new_progress
      t.text :update_notes
      t.timestamps
    end

    # Add indexes
    add_index :session_settings, :archived unless index_exists?(:session_settings, :archived)
    add_index :session_settings, [:couple_id, :version] unless index_exists?(:session_settings, [:couple_id, :version])
    add_index :session_settings, [:couple_id, :agreed_at] unless index_exists?(:session_settings, [:couple_id, :agreed_at])

    add_index :session_settings_proposals, :current_settings_id unless index_exists?(:session_settings_proposals, :current_settings_id)
    add_index :session_settings_proposals, :created_settings_id unless index_exists?(:session_settings_proposals, :created_settings_id)
    add_index :session_settings_proposals, [:couple_id, :status] unless index_exists?(:session_settings_proposals, [:couple_id, :status])
    add_index :session_settings_proposals, [:proposed_by, :status] unless index_exists?(:session_settings_proposals, [:proposed_by, :status])

    add_index :milestones, :achieved_by unless index_exists?(:milestones, :achieved_by)
    add_index :milestones, [:couple_id, :category] unless index_exists?(:milestones, [:couple_id, :category])
    add_index :milestones, [:couple_id, :achieved] unless index_exists?(:milestones, [:couple_id, :achieved])
    add_index :milestones, :criteria, using: :gin unless index_exists?(:milestones, :criteria)

    add_index :milestone_achievements, :milestone_id
    add_index :milestone_achievements, :couple_id
    add_index :milestone_achievements, :achieved_at

    add_index :milestone_progress_updates, :milestone_id

    # Add foreign keys
    add_foreign_key :session_settings_proposals, :session_settings, column: :current_settings_id
    add_foreign_key :session_settings_proposals, :session_settings, column: :created_settings_id
    add_foreign_key :milestones, :users, column: :achieved_by
    add_foreign_key :milestone_achievements, :milestones
    add_foreign_key :milestone_achievements, :couples
    add_foreign_key :milestone_progress_updates, :milestones
  end
end
