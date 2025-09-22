#!/usr/bin/env ruby

require_relative 'config/environment'

puts "Testing Love Language Models..."
puts "=" * 50

# Setup test data
couple = Couple.first || Couple.create!(
  name: "Test Couple",
  check_in_frequency: "weekly",
  theme: "light"
)

user1 = couple.users.first || User.create!(
  email: "user1_love_#{Time.now.to_i}@example.com",
  password: "password123",
  name: "Partner One"
)

user2 = couple.users.second || User.create!(
  email: "user2_love_#{Time.now.to_i}@example.com",
  password: "password123",
  name: "Partner Two"
)

couple.users << user1 unless couple.users.include?(user1)
couple.users << user2 unless couple.users.include?(user2)

# Test 1: Create Default Love Languages
puts "\n1. Testing Default Love Languages Creation..."
LoveLanguage.create_defaults_for_user!(user1)
puts "   Created #{user1.love_languages.count} default languages for #{user1.name}"
user1.love_languages.each do |lang|
  puts "     - #{lang.title} (#{lang.category}): #{lang.importance}"
end

# Test 2: Love Language Privacy and Visibility
puts "\n2. Testing Privacy Controls..."
private_lang = user1.love_languages.find_or_create_by!(
  title: "Secret Appreciation #{Time.now.to_i}"
) do |lang|
  lang.description = "Private ways I feel loved"
  lang.category = "custom"
  lang.privacy = "private"
  lang.importance = "high"
end
puts "   ✅ Created private language: #{private_lang.title}"

couple_lang = user1.love_languages.find_or_create_by!(
  title: "Couple Special #{Time.now.to_i}"
) do |lang|
  lang.description = "Our unique way of showing love"
  lang.category = "custom"
  lang.privacy = "couple_only"
  lang.couple = couple
  lang.importance = "essential"
end
puts "   ✅ Created couple-only language: #{couple_lang.title}"

puts "   Can #{user2.name} view partner's private language? #{private_lang.can_be_viewed_by?(user2)}"
puts "   Can #{user2.name} view couple-only language? #{couple_lang.can_be_viewed_by?(user2)}"

# Test 3: Love Language Importance Ranking
puts "\n3. Testing Importance Ranking..."
user1.love_languages.by_importance.limit(3).each_with_index do |lang, i|
  puts "   #{i + 1}. [#{lang.importance}] #{lang.title} (rank: #{lang.importance_rank})"
end

lang = user1.love_languages.first
lang.update_importance!("essential", 1)
puts "   ✅ Updated #{lang.title} to essential with rank 1"

# Test 4: Love Actions
puts "\n4. Testing Love Actions..."
love_lang = user1.love_languages.find_by(category: "words")

action1 = love_lang.love_actions.create!(
  title: "Write morning love note",
  description: "Leave a sweet note before work",
  for_user: user2,
  created_by_user: user1,
  suggested_by: "self",
  status: "planned",
  planned_for: Date.tomorrow,
  frequency: "daily",
  difficulty: "easy"
)
puts "   ✅ Created action: #{action1.title}"

action2 = love_lang.love_actions.create!(
  title: "Weekly love letter",
  for_user: user2,
  created_by_user: user1,
  suggested_by: "partner",
  suggested_by_id: user2.id,
  status: "suggested",
  frequency: "weekly",
  difficulty: "moderate"
)
puts "   ✅ Created partner-suggested action: #{action2.title}"

# Complete an action
action1.complete!(rating: 5, notes: "Left note on mirror")
puts "   ✅ Completed action with rating: #{action1.effectiveness_rating}"
puts "   Next suggested date: #{action1.next_suggested_date&.strftime('%Y-%m-%d')}"

# Test 5: Love Language Discovery
puts "\n5. Testing Love Language Discovery..."

discovery1 = user1.love_language_discoveries.create!(
  discovery: "I feel most loved when my partner helps with household tasks without being asked",
  source: "reflection",
  confidence_level: "high"
)
puts "   ✅ Created discovery: '#{discovery1.discovery[0..50]}...'"
puts "   Suggested category: #{discovery1.suggest_category}"
puts "   Suggested importance: #{discovery1.suggest_importance}"

discovery2 = user2.love_language_discoveries.create!(
  discovery: "Physical touch like holding hands makes me feel connected",
  source: "partner_feedback",
  discovered_by: user1,
  confidence_level: "very_high"
)
puts "   ✅ Created partner feedback discovery"

# Convert discovery to language
new_lang = discovery1.convert_to_language!(
  title: "Proactive Help",
  privacy: "couple_only"
)
if new_lang
  puts "   ✅ Converted discovery to language: #{new_lang.title}"
  puts "   Auto-generated #{new_lang.love_actions.count} starter actions"
end

# Test 6: Action Effectiveness Tracking
puts "\n6. Testing Action Effectiveness..."

# Create some completed actions with ratings
3.times do |i|
  action = love_lang.love_actions.create!(
    title: "Test Action #{i}",
    for_user: user2,
    created_by_user: user1,
    suggested_by: "system",
    difficulty: ["easy", "moderate", "challenging"][i]
  )
  action.complete!(rating: 3 + i)
end

effective_actions = LoveAction.highly_effective
puts "   Highly effective actions: #{effective_actions.count}"
puts "   Actions by effectiveness:"
LoveAction.by_effectiveness.limit(3).each do |action|
  puts "     - #{action.title}: #{action.effectiveness_rating}/5 (score: #{action.effectiveness_score})"
end

# Test 7: Scopes and Queries
puts "\n7. Testing Scopes and Queries..."

puts "   Love Languages:"
puts "     Total: #{LoveLanguage.count}"
puts "     Active: #{LoveLanguage.active.count}"
puts "     Essential: #{LoveLanguage.where(importance: 'essential').count}"
puts "     Visible to partner: #{user1.love_languages.visible_to_partner.count}"

puts "   Love Actions:"
puts "     Suggested: #{LoveAction.suggested.count}"
puts "     Planned: #{LoveAction.planned.count}"
puts "     Recurring: #{LoveAction.recurring.count}"
puts "     Due today: #{LoveAction.due_today.count}"
puts "     Overdue: #{LoveAction.overdue.count}"

puts "   Discoveries:"
puts "     Pending review: #{LoveLanguageDiscovery.pending_review.count}"
puts "     Converted: #{LoveLanguageDiscovery.converted.count}"
puts "     High confidence: #{LoveLanguageDiscovery.high_confidence.count}"

# Test 8: Validation Tests
puts "\n8. Testing Validations..."

begin
  invalid_lang = user1.love_languages.create!(
    title: user1.love_languages.first.title,  # Duplicate title
    description: "Test",
    category: "words"
  )
  puts "   ❌ Validation failed - allowed duplicate title"
rescue ActiveRecord::RecordInvalid => e
  puts "   ✅ Validation prevented duplicate: #{e.message}"
end

begin
  invalid_action = LoveAction.create!(
    title: "Invalid",
    suggested_by: "partner"  # Missing suggested_by_id
  )
  puts "   ❌ Validation failed - allowed partner suggestion without ID"
rescue ActiveRecord::RecordInvalid => e
  puts "   ✅ Validation prevented invalid partner suggestion"
end

# Test 9: Examples Management
puts "\n9. Testing Examples Management..."

lang = user1.love_languages.first
lang.add_example("Saying 'I love you' in the morning")
lang.add_example("Complimenting my appearance")
lang.add_example("Expressing gratitude for small things")

puts "   Added #{lang.examples.count} examples to #{lang.title}"
puts "   Recent examples:"
lang.recent_examples(2).each do |example|
  puts "     - #{example}"
end

# Test 10: Archiving Actions
puts "\n10. Testing Action Archiving..."

old_action = LoveAction.first
old_action.archive!
puts "   ✅ Archived action: #{old_action.title}"

active_count = LoveAction.active.count
archived_count = LoveAction.archived.count
puts "   Active actions: #{active_count}"
puts "   Archived actions: #{archived_count}"

puts "\n" + "=" * 50
puts "Love Language Model testing complete!"
puts "\nSummary:"
puts "  Total Love Languages: #{LoveLanguage.count}"
puts "  Total Love Actions: #{LoveAction.count}"
puts "  Total Discoveries: #{LoveLanguageDiscovery.count}"
puts "  Average completion rate: #{user1.love_languages.first.average_action_completion_rate}%"