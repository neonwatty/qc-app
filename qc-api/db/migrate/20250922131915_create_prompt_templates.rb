class CreatePromptTemplates < ActiveRecord::Migration[8.0]
  def change
    create_table :prompt_templates, id: :uuid do |t|
      t.string :title, null: false
      t.text :description
      t.text :prompts, array: true, default: []
      t.uuid :category_id
      t.text :tags, array: true, default: []
      t.boolean :is_system, default: false, null: false
      t.integer :usage_count, default: 0, null: false
      t.uuid :couple_id

      t.timestamps
    end

    add_index :prompt_templates, :category_id
    add_index :prompt_templates, :couple_id
    add_index :prompt_templates, :is_system
    add_index :prompt_templates, :tags, using: 'gin'

    add_foreign_key :prompt_templates, :categories
    add_foreign_key :prompt_templates, :couples
  end
end
