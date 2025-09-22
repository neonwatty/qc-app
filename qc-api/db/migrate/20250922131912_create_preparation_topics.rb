class CreatePreparationTopics < ActiveRecord::Migration[8.0]
  def change
    create_table :preparation_topics, id: :uuid do |t|
      t.text :content, null: false
      t.uuid :author_id, null: false
      t.integer :priority, default: 0
      t.boolean :is_quick_topic, default: false, null: false
      t.uuid :session_preparation_id, null: false

      t.timestamps
    end

    add_index :preparation_topics, :author_id
    add_index :preparation_topics, :session_preparation_id

    add_foreign_key :preparation_topics, :users, column: :author_id
  end
end