#!/usr/bin/env ruby

require_relative 'config/environment'

puts "Testing CheckIn Session Models..."
puts "=" * 50

# Setup test data
couple = Couple.first || Couple.create!(
  name: "Test Couple",
  check_in_frequency: "weekly",
  theme: "light"
)

user1 = couple.users.first || User.create!(
  email: "user1_session_#{Time.now.to_i}@example.com",
  password: "password123",
  name: "User One"
)

user2 = couple.users.second || User.create!(
  email: "user2_session_#{Time.now.to_i}@example.com",
  password: "password123",
  name: "User Two"
)

couple.users << user1 unless couple.users.include?(user1)
couple.users << user2 unless couple.users.include?(user2)

# Test 1: CheckIn State Machine
puts "\n1. Testing CheckIn State Machine..."
check_in = couple.check_ins.create!(
  started_at: Time.current
)

puts "   Initial state: #{check_in.status}"
puts "   ✅ CheckIn created in '#{check_in.status}' state"

# Add participants
check_in.add_participant(user1.id)
check_in.add_participant(user2.id)
puts "   Participants: #{check_in.participants.count}"

# Try to start
if check_in.start!
  puts "   ✅ Transitioned to '#{check_in.status}' with step '#{check_in.current_step}'"
else
  puts "   ❌ Failed to start check-in"
end

# Move through steps
CheckIn::STEPS[1..-1].each do |step|
  if check_in.move_to_step!(step)
    puts "   ✅ Moved to step: #{step}"
  else
    puts "   ❌ Failed to move to step: #{step}"
  end
end

# Enter review phase
check_in.mood_before = 3
if check_in.enter_review!
  puts "   ✅ Entered review phase: #{check_in.status}"
end

# Complete the session
check_in.mood_after = 5
if check_in.complete!
  puts "   ✅ Completed! Duration: #{check_in.duration} minutes"
  puts "   Progress: #{check_in.calculate_progress_percentage}%"
end

# Test 2: Invalid State Transitions
puts "\n2. Testing Invalid State Transitions..."
completed_checkin = couple.check_ins.create!(
  started_at: 1.hour.ago,
  status: "completed",
  completed_at: Time.current
)

begin
  completed_checkin.update!(status: "in-progress")
  puts "   ❌ Validation failed - allowed invalid transition"
rescue ActiveRecord::RecordInvalid => e
  puts "   ✅ Validation prevented invalid transition: #{e.message}"
end

# Test 3: Note Privacy Levels
puts "\n3. Testing Note Privacy Levels..."

draft_note = check_in.notes.create!(
  author: user1,
  content: "This is a draft note",
  privacy: "draft"
)
puts "   ✅ Created draft note"

# Publish the draft
if draft_note.publish!
  puts "   ✅ Published draft note (privacy: #{draft_note.privacy})"
end

# Try to change back to draft (should fail)
begin
  draft_note.update!(privacy: "draft")
  puts "   ❌ Allowed changing shared note back to draft"
rescue ActiveRecord::RecordInvalid => e
  puts "   ✅ Prevented invalid privacy change: #{e.message}"
end

# Create private note
private_note = check_in.notes.create!(
  author: user1,
  content: "This is private",
  privacy: "private"
)
puts "   ✅ Created private note"

# Test viewability
puts "   Can #{user1.name} view their own private note? #{private_note.can_be_viewed_by?(user1)}"
puts "   Can #{user2.name} view partner's private note? #{private_note.can_be_viewed_by?(user2)}"

shared_note = check_in.notes.create!(
  author: user2,
  content: "This is shared",
  privacy: "shared"
)
puts "   Can #{user1.name} view partner's shared note? #{shared_note.can_be_viewed_by?(user1)}"

# Test 4: Action Item Tracking
puts "\n4. Testing Action Item Tracking..."

action1 = check_in.action_items.create!(
  title: "Schedule date night",
  assigned_to: user1,
  created_by: user2,
  due_date: 1.week.from_now,
  priority: "high",
  category: "shared"
)
puts "   ✅ Created action item: #{action1.title}"
puts "   Priority: #{action1.priority}, Due in: #{action1.days_until_due} days"

action2 = check_in.action_items.create!(
  title: "Pay electricity bill",
  assigned_to: user2,
  created_by: user1,
  due_date: 2.days.from_now,
  priority: "urgent",
  category: "household"
)

# Test overdue
overdue_action = check_in.action_items.create!(
  title: "Overdue task",
  assigned_to: user1,
  due_date: 2.days.ago
)
puts "   Is overdue task overdue? #{overdue_action.overdue?}"
puts "   Is upcoming task due soon? #{action2.due_soon?}"

# Complete an action
if action1.complete!
  puts "   ✅ Completed action item"
  puts "   Completion time: #{action1.completion_time_days} days"
end

# Test reassignment
if action2.reassign_to!(user1)
  puts "   ✅ Reassigned action to #{user1.name}"
end

# Test 5: Scopes and Queries
puts "\n5. Testing Scopes and Queries..."

puts "   Active check-ins: #{couple.check_ins.active.count}"
puts "   Completed check-ins: #{couple.check_ins.completed.count}"
puts "   Pending actions: #{ActionItem.pending.count}"
puts "   Overdue actions: #{ActionItem.overdue.count}"
puts "   Actions due this week: #{ActionItem.due_this_week.count}"

# Priority ordering
puts "   Actions by priority:"
ActionItem.pending.by_priority.limit(3).each do |action|
  puts "     - [#{action.priority}] #{action.title}"
end

# Notes by privacy
puts "   Note counts by privacy:"
puts "     Draft: #{Note.drafts.count}"
puts "     Private: #{Note.private_notes.count}"
puts "     Shared: #{Note.shared_notes.count}"

# Test 6: Participant Validation
puts "\n6. Testing Participant Validation..."

begin
  check_in.participants = [user1.id, user2.id, 999]
  check_in.save!
  puts "   ❌ Allowed more than 2 participants"
rescue ActiveRecord::RecordInvalid => e
  puts "   ✅ Validation prevented too many participants: #{e.message}"
end

# Test 7: Note Word Count and Reading Time
puts "\n7. Testing Note Analytics..."

long_note = check_in.notes.create!(
  author: user1,
  content: "Lorem ipsum " * 100,
  privacy: "shared"
)

puts "   Word count: #{long_note.word_count}"
puts "   Reading time: #{long_note.reading_time_minutes} minutes"

# Test 8: Action Item Notes
puts "\n8. Testing Action Item Notes..."

action = check_in.action_items.first
action.add_note("Initial discussion about this task")
action.add_note("Follow-up: Made progress today")

puts "   Action notes count: #{action.notes.count}"
action.notes.each_with_index do |note, i|
  puts "     #{i + 1}. #{note['content']}"
end

puts "\n" + "=" * 50
puts "CheckIn Session Model testing complete!"
puts "\nSummary:"
puts "  Total CheckIns: #{CheckIn.count}"
puts "  Active Sessions: #{CheckIn.active.count}"
puts "  Total Notes: #{Note.count}"
puts "  Total Action Items: #{ActionItem.count}"
puts "  Pending Actions: #{ActionItem.pending.count}"