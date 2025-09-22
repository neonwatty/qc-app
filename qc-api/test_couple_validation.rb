#!/usr/bin/env ruby

require_relative 'config/environment'

puts "Testing Couple model validations and associations..."
puts "=" * 50

# Create test users
user1 = User.create!(
  email: "user1_#{Time.now.to_i}@example.com",
  password: "password123",
  name: "User One"
)
puts "✅ Created User 1: #{user1.email}"

user2 = User.create!(
  email: "user2_#{Time.now.to_i}@example.com",
  password: "password123",
  name: "User Two"
)
puts "✅ Created User 2: #{user2.email}"

user3 = User.create!(
  email: "user3_#{Time.now.to_i}@example.com",
  password: "password123",
  name: "User Three"
)
puts "✅ Created User 3: #{user3.email}"

# Test 1: Create a couple with two users
puts "\n1. Testing couple creation with two users..."
couple = Couple.create!(
  name: "Test Couple",
  check_in_frequency: "weekly",
  theme: "light"
)
couple.users << [user1, user2]
puts "   ✅ Couple created: #{couple.name}"
puts "   Partners: #{couple.users.pluck(:name).join(', ')}"
puts "   User count: #{couple.users.count}"

# Test 2: Check default categories were created
puts "\n2. Testing default categories creation..."
puts "   Categories created: #{couple.categories.count}"
couple.categories.each do |cat|
  puts "   - #{cat.icon} #{cat.name}: #{cat.description}"
end

# Test 3: Try to add a third user (should fail validation)
puts "\n3. Testing maximum two users validation..."
begin
  couple.users << user3
  couple.save!
  puts "   ❌ Validation failed - third user was added!"
rescue => e
  puts "   ✅ Validation worked - prevented third user"
  puts "   Error: #{e.message}"
end

# Test 4: Check partner_in_couple method
puts "\n4. Testing partner_in_couple method..."
partner = user1.partner_in_couple(couple)
if partner
  puts "   ✅ Partner of #{user1.name} is #{partner.name}"
else
  puts "   ❌ Partner not found"
end

# Test 5: Check current_couple method
puts "\n5. Testing current_couple method..."
current = user1.current_couple
if current
  puts "   ✅ Current couple for #{user1.name}: #{current.name}"
else
  puts "   ❌ No current couple found"
end

puts "\n" + "=" * 50
puts "Couple validation testing complete!"