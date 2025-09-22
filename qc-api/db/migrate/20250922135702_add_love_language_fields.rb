class AddLoveLanguageFields < ActiveRecord::Migration[8.0]
  def change
    # Add fields to love_languages
    add_column :love_languages, :couple_id, :uuid unless column_exists?(:love_languages, :couple_id)
    add_column :love_languages, :importance_rank, :integer unless column_exists?(:love_languages, :importance_rank)
    add_column :love_languages, :is_active, :boolean, default: true unless column_exists?(:love_languages, :is_active)
    add_column :love_languages, :discussion_count, :integer, default: 0 unless column_exists?(:love_languages, :discussion_count)
    add_column :love_languages, :importance_updated_at, :datetime unless column_exists?(:love_languages, :importance_updated_at)

    # Add fields to love_actions
    add_column :love_actions, :effectiveness_rating, :integer unless column_exists?(:love_actions, :effectiveness_rating)
    add_column :love_actions, :completion_notes, :jsonb, default: [] unless column_exists?(:love_actions, :completion_notes)
    add_column :love_actions, :archived_at, :datetime unless column_exists?(:love_actions, :archived_at)

    # Add fields to love_language_discoveries
    add_column :love_language_discoveries, :source, :string unless column_exists?(:love_language_discoveries, :source)
    add_column :love_language_discoveries, :confidence_level, :string unless column_exists?(:love_language_discoveries, :confidence_level)
    add_column :love_language_discoveries, :discovered_by_id, :uuid unless column_exists?(:love_language_discoveries, :discovered_by_id)
    add_column :love_language_discoveries, :reviewed, :boolean, default: false unless column_exists?(:love_language_discoveries, :reviewed)
    add_column :love_language_discoveries, :reviewed_at, :datetime unless column_exists?(:love_language_discoveries, :reviewed_at)
    add_column :love_language_discoveries, :rejected, :boolean, default: false unless column_exists?(:love_language_discoveries, :rejected)
    add_column :love_language_discoveries, :rejected_at, :datetime unless column_exists?(:love_language_discoveries, :rejected_at)
    add_column :love_language_discoveries, :converted_at, :datetime unless column_exists?(:love_language_discoveries, :converted_at)
    add_column :love_language_discoveries, :suggested_category, :string unless column_exists?(:love_language_discoveries, :suggested_category)
    add_column :love_language_discoveries, :suggested_importance, :string unless column_exists?(:love_language_discoveries, :suggested_importance)
    add_column :love_language_discoveries, :suggested_title, :string unless column_exists?(:love_language_discoveries, :suggested_title)

    # Add indexes (check if they exist first)
    add_index :love_languages, :couple_id unless index_exists?(:love_languages, :couple_id)
    add_index :love_languages, [:user_id, :title], unique: true unless index_exists?(:love_languages, [:user_id, :title])
    add_index :love_languages, :importance_rank unless index_exists?(:love_languages, :importance_rank)
    add_index :love_actions, :effectiveness_rating unless index_exists?(:love_actions, :effectiveness_rating)
    add_index :love_actions, :archived_at unless index_exists?(:love_actions, :archived_at)
    add_index :love_language_discoveries, :discovered_by_id unless index_exists?(:love_language_discoveries, :discovered_by_id)
    add_index :love_language_discoveries, :reviewed unless index_exists?(:love_language_discoveries, :reviewed)
    add_index :love_language_discoveries, :source unless index_exists?(:love_language_discoveries, :source)

    # Add foreign keys (check if they exist first)
    unless foreign_key_exists?(:love_languages, :couples)
      add_foreign_key :love_languages, :couples
    end
    unless foreign_key_exists?(:love_language_discoveries, column: :discovered_by_id)
      add_foreign_key :love_language_discoveries, :users, column: :discovered_by_id
    end
  end
end