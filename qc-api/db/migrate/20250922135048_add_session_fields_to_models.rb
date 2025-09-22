class AddSessionFieldsToModels < ActiveRecord::Migration[8.0]
  def change
    # Add fields to check_ins
    add_column :check_ins, :current_step, :string
    add_column :check_ins, :step_durations, :jsonb, default: {}
    add_column :check_ins, :abandoned_at, :datetime

    # Add fields to notes
    add_column :notes, :published_at, :datetime
    add_column :notes, :first_shared_at, :datetime

    # Add fields to action_items
    add_column :action_items, :priority, :string
    add_column :action_items, :category, :string
    add_column :action_items, :created_by_id, :uuid
    add_column :action_items, :completed_by_id, :uuid
    add_column :action_items, :reassigned_at, :datetime
    add_column :action_items, :completed_on_time, :boolean
    add_column :action_items, :notes, :jsonb, default: []

    # Add indexes (check if they exist first)
    add_index :check_ins, :current_step unless index_exists?(:check_ins, :current_step)
    add_index :check_ins, :status unless index_exists?(:check_ins, :status)
    add_index :notes, :privacy unless index_exists?(:notes, :privacy)
    add_index :action_items, :priority unless index_exists?(:action_items, :priority)
    add_index :action_items, :category unless index_exists?(:action_items, :category)
    add_index :action_items, [:due_date, :completed] unless index_exists?(:action_items, [:due_date, :completed])

    # Add foreign keys
    add_foreign_key :action_items, :users, column: :created_by_id
    add_foreign_key :action_items, :users, column: :completed_by_id
  end
end