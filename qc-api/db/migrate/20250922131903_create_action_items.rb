class CreateActionItems < ActiveRecord::Migration[8.0]
  def change
    create_table :action_items, id: :uuid do |t|
      t.string :title, null: false
      t.text :description
      t.uuid :assigned_to_id
      t.date :due_date
      t.boolean :completed, default: false, null: false
      t.uuid :check_in_id, null: false
      t.datetime :completed_at

      t.timestamps
    end

    add_index :action_items, :check_in_id
    add_index :action_items, :assigned_to_id
    add_index :action_items, :completed
    add_index :action_items, :due_date

    add_foreign_key :action_items, :check_ins
    add_foreign_key :action_items, :users, column: :assigned_to_id
  end
end