class CreateReminders < ActiveRecord::Migration[8.0]
  def change
    create_table :reminders, id: :uuid do |t|
      t.string :title, null: false
      t.text :message, null: false
      t.string :category, null: false
      t.string :frequency, null: false
      t.datetime :scheduled_for, null: false
      t.string :notification_channel, default: 'both', null: false
      t.uuid :created_by_id, null: false
      t.uuid :assigned_to_id
      t.boolean :is_active, default: true, null: false
      t.boolean :is_snoozed, default: false, null: false
      t.datetime :snooze_until
      t.datetime :completed_at
      t.datetime :last_notified_at
      t.uuid :related_check_in_id
      t.uuid :related_action_item_id
      t.uuid :converted_from_request_id
      t.jsonb :custom_schedule, default: {}

      t.timestamps
    end

    add_index :reminders, :created_by_id
    add_index :reminders, :assigned_to_id
    add_index :reminders, :scheduled_for
    add_index :reminders, [:is_active, :scheduled_for]
    add_index :reminders, :category

    add_foreign_key :reminders, :users, column: :created_by_id
    add_foreign_key :reminders, :users, column: :assigned_to_id
    add_foreign_key :reminders, :check_ins, column: :related_check_in_id
    add_foreign_key :reminders, :action_items, column: :related_action_item_id
  end
end