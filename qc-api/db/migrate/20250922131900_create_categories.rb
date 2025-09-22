class CreateCategories < ActiveRecord::Migration[8.0]
  def change
    create_table :categories, id: :uuid do |t|
      t.string :name, null: false
      t.string :icon, null: false
      t.text :description
      t.text :prompts, array: true, default: []
      t.boolean :is_custom, default: false, null: false
      t.integer :order, default: 0, null: false
      t.uuid :couple_id

      t.timestamps
    end

    add_index :categories, :couple_id
    add_index :categories, [:couple_id, :order]
    add_foreign_key :categories, :couples
  end
end