# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

puts "Seeding database..."
puts "=" * 50

# Create demo users and couple for testing
if Rails.env.development? || Rails.env.test?
  puts "Creating demo users and couple..."

  # Create demo users
  user1 = User.find_or_create_by!(email: "alex@example.com") do |u|
    u.password = "password123"
    u.name = "Alex Johnson"
  end

  user2 = User.find_or_create_by!(email: "jordan@example.com") do |u|
    u.password = "password123"
    u.name = "Jordan Smith"
  end

  # Create demo couple
  couple = Couple.find_or_create_by!(name: "Alex & Jordan") do |c|
    c.check_in_frequency = "weekly"
    c.theme = "light"
  end

  # Add users to couple if not already added
  unless couple.users.include?(user1)
    couple.users << user1
  end
  unless couple.users.include?(user2)
    couple.users << user2
  end

  puts "  ✅ Created demo users: #{user1.name} and #{user2.name}"
  puts "  ✅ Created demo couple: #{couple.name}"
end

# Load category and prompt seeds
require_relative 'seeds/categories_and_prompts'

puts "=" * 50
puts "Database seeding complete!"
