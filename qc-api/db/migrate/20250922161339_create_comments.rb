class CreateComments < ActiveRecord::Migration[8.0]
  def change
    create_table :comments do |t|
      t.text :content
      t.uuid :author_id, null: false
      t.references :commentable, polymorphic: true, null: false

      t.timestamps
    end

    add_foreign_key :comments, :users, column: :author_id
    add_index :comments, :author_id
  end
end
