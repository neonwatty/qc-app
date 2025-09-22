class CreateCheckIns < ActiveRecord::Migration[8.0]
  def change
    create_table :check_ins, id: :uuid do |t|
      t.uuid :couple_id, null: false
      t.uuid :participants, array: true, default: []
      t.datetime :started_at, null: false
      t.datetime :completed_at
      t.string :status, default: 'in-progress', null: false
      t.uuid :categories, array: true, default: []
      t.integer :mood_before
      t.integer :mood_after
      t.text :reflection
      t.uuid :session_settings_id
      t.jsonb :timeouts, default: {}
      t.integer :extensions, default: 0

      t.timestamps
    end

    add_index :check_ins, :couple_id
    add_index :check_ins, :status
    add_index :check_ins, [ :couple_id, :started_at ]
    add_foreign_key :check_ins, :couples
  end
end
