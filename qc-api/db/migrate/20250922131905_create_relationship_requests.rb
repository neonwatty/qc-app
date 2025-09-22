class CreateRelationshipRequests < ActiveRecord::Migration[8.0]
  def change
    create_table :relationship_requests, id: :uuid do |t|
      t.string :title, null: false
      t.text :description, null: false
      t.string :category, null: false
      t.uuid :requested_by_id, null: false
      t.uuid :requested_for_id, null: false
      t.string :priority, default: 'medium', null: false
      t.datetime :suggested_date
      t.string :suggested_frequency
      t.string :status, default: 'pending', null: false
      t.text :response
      t.datetime :responded_at
      t.uuid :converted_to_reminder_id
      t.text :tags, array: true, default: []
      t.uuid :related_check_in_id
      t.text :attachments, array: true, default: []

      t.timestamps
    end

    add_index :relationship_requests, :requested_by_id
    add_index :relationship_requests, :requested_for_id
    add_index :relationship_requests, :status
    add_index :relationship_requests, [:requested_for_id, :status]
    add_index :relationship_requests, :tags, using: 'gin'

    add_foreign_key :relationship_requests, :users, column: :requested_by_id
    add_foreign_key :relationship_requests, :users, column: :requested_for_id
    add_foreign_key :relationship_requests, :reminders, column: :converted_to_reminder_id
    add_foreign_key :relationship_requests, :check_ins, column: :related_check_in_id
  end
end