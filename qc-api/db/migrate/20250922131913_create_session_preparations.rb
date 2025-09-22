class CreateSessionPreparations < ActiveRecord::Migration[8.0]
  def change
    create_table :session_preparations, id: :uuid do |t|
      t.uuid :session_id
      t.uuid :couple_id, null: false

      t.timestamps
    end

    add_index :session_preparations, :session_id
    add_index :session_preparations, :couple_id

    add_foreign_key :session_preparations, :check_ins, column: :session_id
    add_foreign_key :session_preparations, :couples

    # Update preparation_topics to add the foreign key
    add_foreign_key :preparation_topics, :session_preparations
  end
end