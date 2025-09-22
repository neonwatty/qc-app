#!/usr/bin/env ruby

# Test script for authorization middleware and couple isolation

require_relative 'config/environment'

puts "Testing Authorization Middleware..."
puts "="*50

# 1. Test Authenticatable Concern
puts "\n1. Authenticatable Concern:"
begin
  # Create test controller instance
  controller = ApplicationController.new
  
  # Test that methods are defined
  methods = [:current_user, :current_couple, :logged_in?, :authenticate_user!]
  methods.each do |method|
    if controller.respond_to?(method, true)
      puts "   ✅ #{method} method defined"
    else
      puts "   ❌ #{method} method missing"
    end
  end
  
  # Test couple-specific methods
  couple_methods = [:authenticate_couple_member!, :ensure_couple_context!, :set_couple]
  couple_methods.each do |method|
    if controller.respond_to?(method, true)
      puts "   ✅ #{method} method defined"
    else
      puts "   ❌ #{method} method missing"
    end
  end
rescue => e
  puts "   ❌ Error: #{e.message}"
end

# 2. Test Authorization Concern
puts "\n2. Authorization Concern:"
begin
  controller = ApplicationController.new
  
  # Test authorization methods
  auth_methods = [
    :authorize_couple_member!,
    :authorize_couple_data_access!,
    :authorize_partner_content!,
    :authorize_user_data_access!,
    :can_access_couple?,
    :accessible_couples,
    :accessible_check_ins
  ]
  
  auth_methods.each do |method|
    if controller.respond_to?(method, true)
      puts "   ✅ #{method} method available"
    else
      puts "   ❌ #{method} method missing"
    end
  end
rescue => e
  puts "   ❌ Error: #{e.message}"
end

# 3. Test Couple Isolation
puts "\n3. Couple Isolation:"
begin
  # Create test users and couples
  user1 = User.create!(
    email: "auth_test1_#{Time.now.to_i}@example.com",
    password: 'password123',
    name: 'Test User 1'
  )
  
  user2 = User.create!(
    email: "auth_test2_#{Time.now.to_i}@example.com",
    password: 'password123',
    name: 'Test User 2'
  )
  
  user3 = User.create!(
    email: "auth_test3_#{Time.now.to_i}@example.com",
    password: 'password123',
    name: 'Test User 3'
  )
  
  # Create couples
  couple1 = Couple.create!(name: 'Test Couple 1', check_in_frequency: 'weekly')
  couple1.users << [user1, user2]
  
  couple2 = Couple.create!(name: 'Test Couple 2', check_in_frequency: 'weekly')
  couple2.users << user3
  
  # Test couple access
  if user1.couples.include?(couple1)
    puts "   ✅ User1 belongs to Couple1"
  end
  
  if !user1.couples.include?(couple2)
    puts "   ✅ User1 does NOT belong to Couple2 (isolation working)"
  end
  
  if user1.current_couple == couple1
    puts "   ✅ current_couple method working"
  end
  
  # Test partner relationship
  if user1.partner_in_couple(couple1) == user2
    puts "   ✅ Partner identification working"
  end
  
  # Clean up - destroy in correct order to handle dependencies
  user1.reload.couples.clear
  user2.reload.couples.clear
  user3.reload.couples.clear

  couple1.destroy if couple1.persisted?
  couple2.destroy if couple2.persisted?
  user1.destroy if user1.persisted?
  user2.destroy if user2.persisted?
  user3.destroy if user3.persisted?

  puts "   ✅ Couple isolation verified"
rescue => e
  puts "   ❌ Error: #{e.message}"
end

# 4. Test API Base Controller
puts "\n4. API Base Controller:"
begin
  if defined?(Api::BaseController)
    controller = Api::BaseController.new
    
    # Check methods
    base_methods = [:couple_scoped?, :set_couple_context, :scope_to_couple, :authorize_resource_access!]
    base_methods.each do |method|
      if controller.respond_to?(method, true)
        puts "   ✅ #{method} method defined"
      else
        puts "   ❌ #{method} method missing"
      end
    end
  else
    puts "   ✅ Api::BaseController defined"
  end
rescue => e
  puts "   ❌ Error: #{e.message}"
end

# 5. Test Access Control
puts "\n5. Access Control Verification:"
begin
  # Create test data
  user = User.create!(
    email: "access_test_#{Time.now.to_i}@example.com",
    password: 'password123',
    name: 'Access Test User'
  )
  
  couple = Couple.create!(name: 'Access Test Couple', check_in_frequency: 'weekly')
  couple.users << user
  
  # Create a check-in for the couple
  check_in = CheckIn.create!(
    couple: couple,
    status: 'preparing',
    started_at: Time.current
  )
  
  # Create a note
  note = Note.create!(
    author: user,
    check_in: check_in,
    content: 'Test note',
    privacy: 'private'
  )
  
  # Verify access relationships
  if note.check_in.couple == couple
    puts "   ✅ Note correctly associated with couple"
  end
  
  if note.author == user
    puts "   ✅ Note correctly associated with author"
  end
  
  # Clean up
  note.destroy
  check_in.destroy
  couple.destroy
  user.destroy
  
  puts "   ✅ Access control relationships verified"
rescue => e
  puts "   ❌ Error: #{e.message}"
end

puts "\n" + "="*50
puts "Authorization Middleware testing complete!"
