class CreateCustomPrompts < ActiveRecord::Migration[8.0]
  def change
    create_table :custom_prompts, id: :uuid do |t|
      t.text :content, null: false
      t.uuid :category_id, null: false
      t.integer :order, default: 0, null: false
      t.boolean :is_active, default: true, null: false
      t.uuid :couple_id, null: false

      t.timestamps
    end

    add_index :custom_prompts, :category_id
    add_index :custom_prompts, :couple_id
    add_index :custom_prompts, [:couple_id, :category_id]
    add_index :custom_prompts, [:couple_id, :order]

    add_foreign_key :custom_prompts, :categories
    add_foreign_key :custom_prompts, :couples
  end
end