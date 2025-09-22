class CreateLoveLanguages < ActiveRecord::Migration[8.0]
  def change
    create_table :love_languages, id: :uuid do |t|
      t.uuid :user_id, null: false
      t.string :title, null: false
      t.text :description, null: false
      t.text :examples, array: true, default: []
      t.string :category, null: false
      t.string :privacy, default: 'shared', null: false
      t.string :importance, default: 'medium', null: false
      t.text :tags, array: true, default: []
      t.datetime :last_discussed_at

      t.timestamps
    end

    add_index :love_languages, :user_id
    add_index :love_languages, :category
    add_index :love_languages, [ :user_id, :category ]
    add_index :love_languages, :tags, using: 'gin'

    add_foreign_key :love_languages, :users
  end
end
