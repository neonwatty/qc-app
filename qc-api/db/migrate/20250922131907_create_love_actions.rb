class CreateLoveActions < ActiveRecord::Migration[8.0]
  def change
    create_table :love_actions, id: :uuid do |t|
      t.string :title, null: false
      t.text :description
      t.uuid :linked_language_id, null: false
      t.string :linked_language_title
      t.string :suggested_by, null: false
      t.uuid :suggested_by_id
      t.string :status, default: 'suggested', null: false
      t.string :frequency
      t.integer :completed_count, default: 0, null: false
      t.datetime :last_completed_at
      t.datetime :planned_for
      t.string :difficulty, default: 'moderate', null: false
      t.text :notes
      t.uuid :for_user_id, null: false
      t.uuid :created_by_id, null: false

      t.timestamps
    end

    add_index :love_actions, :linked_language_id
    add_index :love_actions, :for_user_id
    add_index :love_actions, :created_by_id
    add_index :love_actions, :status
    add_index :love_actions, :planned_for

    add_foreign_key :love_actions, :love_languages, column: :linked_language_id
    add_foreign_key :love_actions, :users, column: :for_user_id
    add_foreign_key :love_actions, :users, column: :created_by_id
    add_foreign_key :love_actions, :users, column: :suggested_by_id
  end
end
