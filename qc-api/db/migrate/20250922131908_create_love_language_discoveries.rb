class CreateLoveLanguageDiscoveries < ActiveRecord::Migration[8.0]
  def change
    create_table :love_language_discoveries, id: :uuid do |t|
      t.uuid :user_id, null: false
      t.uuid :check_in_id
      t.text :discovery, null: false
      t.uuid :converted_to_language_id

      t.timestamps
    end

    add_index :love_language_discoveries, :user_id
    add_index :love_language_discoveries, :check_in_id

    add_foreign_key :love_language_discoveries, :users
    add_foreign_key :love_language_discoveries, :check_ins
    add_foreign_key :love_language_discoveries, :love_languages, column: :converted_to_language_id
  end
end