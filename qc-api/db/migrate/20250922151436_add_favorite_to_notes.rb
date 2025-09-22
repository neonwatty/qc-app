class AddFavoriteToNotes < ActiveRecord::Migration[8.0]
  def change
    add_column :notes, :is_favorite, :boolean, default: false
    add_index :notes, :is_favorite
  end
end
