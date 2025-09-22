class CreateCouples < ActiveRecord::Migration[8.0]
  def change
    create_table :couples, id: :uuid do |t|
      t.string :name, null: false
      t.string :check_in_frequency, default: 'weekly'
      t.string :reminder_time
      t.string :theme, default: 'system'
      t.integer :total_check_ins, default: 0, null: false
      t.integer :current_streak, default: 0, null: false
      t.datetime :last_check_in_at

      t.timestamps
    end

    add_index :couples, :last_check_in_at

    # Join table for many-to-many relationship
    create_table :couple_users, id: false do |t|
      t.uuid :couple_id, null: false
      t.uuid :user_id, null: false
      t.timestamps
    end

    add_index :couple_users, [:couple_id, :user_id], unique: true
    add_foreign_key :couple_users, :couples
    add_foreign_key :couple_users, :users
  end
end
