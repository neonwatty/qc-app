class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users, id: :uuid do |t|
      t.string :name, null: false
      t.string :email, null: false
      t.string :avatar
      t.uuid :partner_id

      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :partner_id
    add_foreign_key :users, :users, column: :partner_id
  end
end
