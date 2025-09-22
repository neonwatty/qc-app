class CreateMilestones < ActiveRecord::Migration[8.0]
  def change
    create_table :milestones, id: :uuid do |t|
      t.string :title, null: false
      t.text :description
      t.datetime :achieved_at
      t.string :icon, null: false
      t.string :category, null: false
      t.uuid :couple_id, null: false
      t.boolean :achieved, default: false, null: false
      t.integer :points, default: 0
      t.string :rarity
      t.integer :progress, default: 0
      t.date :target_date
      t.jsonb :data, default: {}

      t.timestamps
    end

    add_index :milestones, :couple_id
    add_index :milestones, :category
    add_index :milestones, [ :couple_id, :achieved ]
    add_index :milestones, :achieved_at

    add_foreign_key :milestones, :couples
  end
end
