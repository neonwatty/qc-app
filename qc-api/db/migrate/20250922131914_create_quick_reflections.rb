class CreateQuickReflections < ActiveRecord::Migration[8.0]
  def change
    create_table :quick_reflections, id: :uuid do |t|
      t.uuid :session_id, null: false
      t.uuid :author_id, null: false
      t.integer :feeling_before, null: false
      t.integer :feeling_after, null: false
      t.text :gratitude
      t.text :key_takeaway
      t.boolean :share_with_partner, default: true, null: false

      t.timestamps
    end

    add_index :quick_reflections, :session_id
    add_index :quick_reflections, :author_id
    add_index :quick_reflections, [ :session_id, :author_id ], unique: true

    add_foreign_key :quick_reflections, :check_ins, column: :session_id
    add_foreign_key :quick_reflections, :users, column: :author_id
  end
end
