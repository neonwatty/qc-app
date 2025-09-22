#!/usr/bin/env ruby

# Script to fix all foreign key column naming issues
# Rails expects foreign key columns to end with _id

files_to_fix = [
  {
    file: "db/migrate/20250922131904_create_reminders.rb",
    replacements: [
      ["t.uuid :created_by,", "t.uuid :created_by_id,"],
      ["t.uuid :assigned_to", "t.uuid :assigned_to_id"],
      ["add_index :reminders, :created_by", "add_index :reminders, :created_by_id"],
      ["add_index :reminders, :assigned_to", "add_index :reminders, :assigned_to_id"],
      ["column: :created_by", "column: :created_by_id"],
      ["column: :assigned_to", "column: :assigned_to_id"]
    ]
  },
  {
    file: "db/migrate/20250922131905_create_relationship_requests.rb",
    replacements: [
      ["t.uuid :requested_by,", "t.uuid :requested_by_id,"],
      ["t.uuid :requested_for,", "t.uuid :requested_for_id,"],
      ["add_index :relationship_requests, :requested_by", "add_index :relationship_requests, :requested_by_id"],
      ["add_index :relationship_requests, :requested_for", "add_index :relationship_requests, :requested_for_id"],
      ["[:requested_for, :status]", "[:requested_for_id, :status]"],
      ["column: :requested_by", "column: :requested_by_id"],
      ["column: :requested_for", "column: :requested_for_id"]
    ]
  },
  {
    file: "db/migrate/20250922131907_create_love_actions.rb",
    replacements: [
      ["t.uuid :created_by,", "t.uuid :created_by_id,"],
      ["add_index :love_actions, :created_by", "add_index :love_actions, :created_by_id"],
      ["column: :created_by", "column: :created_by_id"]
    ]
  },
  {
    file: "db/migrate/20250922131910_create_session_settings_proposals.rb",
    replacements: [
      ["t.uuid :proposed_by,", "t.uuid :proposed_by_id,"],
      ["t.uuid :reviewed_by", "t.uuid :reviewed_by_id"],
      ["add_index :session_settings_proposals, :proposed_by", "add_index :session_settings_proposals, :proposed_by_id"],
      ["column: :proposed_by", "column: :proposed_by_id"],
      ["column: :reviewed_by", "column: :reviewed_by_id"]
    ]
  }
]

files_to_fix.each do |fix|
  file_path = fix[:file]
  if File.exist?(file_path)
    content = File.read(file_path)
    fix[:replacements].each do |old_text, new_text|
      content.gsub!(old_text, new_text)
    end
    File.write(file_path, content)
    puts "✓ Fixed #{file_path}"
  else
    puts "✗ File not found: #{file_path}"
  end
end

# Also need to update the models
model_files = [
  {
    file: "app/models/user.rb",
    replacements: [
      ["foreign_key: 'created_by'", "foreign_key: 'created_by_id'"],
      ["foreign_key: 'assigned_to'", "foreign_key: 'assigned_to_id'"],
      ["foreign_key: 'requested_by'", "foreign_key: 'requested_by_id'"],
      ["foreign_key: 'requested_for'", "foreign_key: 'requested_for_id'"],
      ["foreign_key: 'created_by'", "foreign_key: 'created_by_id'"]
    ]
  },
  {
    file: "app/models/reminder.rb",
    replacements: [
      ["requested_by = ? OR assigned_to = ?", "created_by_id = ? OR assigned_to_id = ?"]
    ]
  },
  {
    file: "app/models/relationship_request.rb",
    replacements: [
      ["requested_by = ? OR requested_for = ?", "requested_by_id = ? OR requested_for_id = ?"],
      ["where(requested_for: user,", "where(requested_for_id: user.id,"]
    ]
  },
  {
    file: "app/models/session_settings_proposal.rb",
    replacements: [
      ["proposed_by == user", "proposed_by_id == user.id"]
    ]
  }
]

model_files.each do |fix|
  file_path = fix[:file]
  if File.exist?(file_path)
    content = File.read(file_path)
    fix[:replacements].each do |old_text, new_text|
      content.gsub!(old_text, new_text)
    end
    File.write(file_path, content)
    puts "✓ Fixed model #{file_path}"
  else
    puts "✗ Model file not found: #{file_path}"
  end
end

puts "\nAll files updated! Now run:"
puts "  rails db:rollback:primary STEP=20"
puts "  rails db:migrate"