class CreateSessionSettingsProposals < ActiveRecord::Migration[8.0]
  def change
    create_table :session_settings_proposals, id: :uuid do |t|
      t.uuid :proposed_by_id, null: false
      t.datetime :proposed_at, null: false
      t.jsonb :settings, null: false, default: {}
      t.string :status, default: 'pending', null: false
      t.uuid :reviewed_by_id
      t.datetime :reviewed_at
      t.uuid :couple_id, null: false

      t.timestamps
    end

    add_index :session_settings_proposals, :couple_id
    add_index :session_settings_proposals, :proposed_by_id
    add_index :session_settings_proposals, :status

    add_foreign_key :session_settings_proposals, :users, column: :proposed_by_id
    add_foreign_key :session_settings_proposals, :users, column: :reviewed_by_id
    add_foreign_key :session_settings_proposals, :couples
  end
end
