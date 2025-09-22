class CreateSessionSettings < ActiveRecord::Migration[8.0]
  def change
    create_table :session_settings, id: :uuid do |t|
      t.uuid :couple_id, null: false
      t.integer :session_duration, default: 30, null: false
      t.integer :timeouts_per_partner, default: 2, null: false
      t.integer :timeout_duration, default: 5, null: false
      t.boolean :turn_based_mode, default: false, null: false
      t.integer :turn_duration
      t.boolean :allow_extensions, default: true, null: false
      t.boolean :pause_notifications, default: true, null: false
      t.boolean :auto_save_drafts, default: true, null: false
      t.boolean :warm_up_questions, default: true, null: false
      t.integer :cool_down_time, default: 5, null: false
      t.datetime :agreed_at
      t.uuid :agreed_by, array: true, default: []
      t.integer :version, default: 1, null: false

      t.timestamps
    end

    add_index :session_settings, :couple_id
    add_index :session_settings, [ :couple_id, :version ]

    add_foreign_key :session_settings, :couples
  end
end
