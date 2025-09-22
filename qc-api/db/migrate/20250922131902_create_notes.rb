class CreateNotes < ActiveRecord::Migration[8.0]
  def change
    create_table :notes, id: :uuid do |t|
      t.text :content, null: false
      t.string :privacy, null: false, default: 'draft'
      t.uuid :author_id, null: false
      t.uuid :category_id
      t.uuid :check_in_id
      t.text :tags, array: true, default: []

      t.timestamps
    end

    add_index :notes, :author_id
    add_index :notes, :check_in_id
    add_index :notes, :category_id
    add_index :notes, :privacy
    add_index :notes, [ :author_id, :privacy ]
    add_index :notes, :tags, using: 'gin'

    add_foreign_key :notes, :users, column: :author_id
    add_foreign_key :notes, :categories
    add_foreign_key :notes, :check_ins
  end
end
