#!/usr/bin/env ruby
require_relative 'config/environment'

puts "Testing Model Creation and Associations"
puts "=" * 50

# Clean database
User.destroy_all
Couple.destroy_all

# Test User creation
puts "\n1. Creating Users..."
user1 = User.create!(name: "Alex Chen", email: "alex@example.com")
user2 = User.create!(name: "Jordan Smith", email: "jordan@example.com")
puts "✓ Created #{User.count} users"

# Test Couple creation
puts "\n2. Creating Couple..."
couple = Couple.create!(name: "Alex & Jordan", check_in_frequency: "weekly", theme: "light")
couple.users << [user1, user2]
puts "✓ Created couple with #{couple.categories.count} default categories"

# Test Category
puts "\n3. Testing Categories..."
category = couple.categories.first
puts "✓ Found category: #{category.name} (#{category.icon})"

# Test CheckIn creation
puts "\n4. Creating Check-in..."
check_in = couple.check_ins.create!(
  started_at: Time.current,
  status: 'in-progress',
  participants: [user1.id, user2.id],
  categories: [category.id]
)
puts "✓ Created check-in with status: #{check_in.status}"

# Test Note creation
puts "\n5. Creating Notes..."
note = check_in.notes.create!(
  content: "We talked about our communication patterns",
  privacy: 'shared',
  author: user1,
  category: category
)
puts "✓ Created note with privacy: #{note.privacy}"

# Test ActionItem creation
puts "\n6. Creating Action Items..."
action_item = check_in.action_items.create!(
  title: "Schedule weekly check-in time",
  assigned_to: user2,
  due_date: 1.week.from_now
)
puts "✓ Created action item: #{action_item.title}"

# Test Reminder creation
puts "\n7. Creating Reminder..."
reminder = Reminder.create!(
  title: "Weekly Check-in",
  message: "Time for your weekly relationship check-in",
  category: 'check-in',
  frequency: 'weekly',
  scheduled_for: 1.week.from_now,
  created_by: user1,
  assigned_to: user2
)
puts "✓ Created reminder: #{reminder.title}"

# Test LoveLanguage creation
puts "\n8. Creating Love Language..."
love_language = user1.love_languages.create!(
  title: "Words of Affirmation",
  description: "I feel loved when you express your feelings verbally",
  category: 'words',
  privacy: 'shared',
  importance: 'high',
  examples: ["Saying 'I love you'", "Compliments", "Verbal appreciation"]
)
puts "✓ Created love language: #{love_language.title}"

# Test associations
puts "\n9. Testing Associations..."
puts "✓ Couple has #{couple.users.count} users"
puts "✓ User1 has #{user1.notes.count} notes"
puts "✓ Check-in has #{check_in.notes.count} notes and #{check_in.action_items.count} action items"

# Test validations
puts "\n10. Testing Validations..."
begin
  User.create!(name: nil, email: "test@test.com")
rescue ActiveRecord::RecordInvalid => e
  puts "✓ Validation working: #{e.message}"
end

puts "\n" + "=" * 50
puts "All tests passed successfully!"
puts "Database has been populated with test data."