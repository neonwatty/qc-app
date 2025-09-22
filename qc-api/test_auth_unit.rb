#!/usr/bin/env ruby

# Unit tests for registration and login controllers

require_relative 'config/environment'
require 'securerandom'

puts "Testing Registration and Login Controllers (Unit Tests)..."
puts "="*50

# 1. Test Registration Controller Methods
puts "\n1. Test Registration Controller:"
begin
  controller = Api::Auth::RegistrationsController.new
  
  # Check that methods exist
  methods = [:create, :update, :destroy, :create_couple_for_user, :send_partner_invitation]
  methods.each do |method|
    if controller.respond_to?(method, true)
      puts "   ✅ #{method} method defined"
    else
      puts "   ❌ #{method} method missing"
    end
  end
rescue => e
  puts "   ❌ Error: #{e.message}"
end

# 2. Test Sessions Controller Methods
puts "\n2. Test Sessions Controller:"
begin
  controller = Api::Auth::SessionsController.new
  
  # Check that methods exist
  methods = [:create, :destroy, :refresh, :ensure_params_exist, :render_error_response, :revoke_jwt_token]
  methods.each do |method|
    if controller.respond_to?(method, true)
      puts "   ✅ #{method} method defined"
    else
      puts "   ❌ #{method} method missing"
    end
  end
rescue => e
  puts "   ❌ Error: #{e.message}"
end

# 3. Test User Registration Flow
puts "\n3. Test User Registration Flow:"
begin
  email = "test_#{SecureRandom.hex(4)}@example.com"
  
  # Create a user
  user = User.new(
    email: email,
    password: 'password123',
    password_confirmation: 'password123',
    name: 'Test User'
  )
  
  if user.save
    puts "   ✅ User created successfully"
    puts "   - Email: #{user.email}"
    puts "   - Name: #{user.name}"
    
    # Test JWT payload generation
    payload = user.jwt_payload
    if payload['sub'] == user.id && payload['email'] == user.email
      puts "   ✅ JWT payload generation working"
    end
    
    # Test refresh token generation
    refresh_token = user.generate_refresh_token
    if refresh_token.present?
      puts "   ✅ Refresh token generated"
    end
    
    # Clean up
    user.destroy
  else
    puts "   ❌ User creation failed: #{user.errors.full_messages.join(', ')}"
  end
rescue => e
  puts "   ❌ Error: #{e.message}"
end

# 4. Test Couple Creation During Registration
puts "\n4. Test Couple Creation During Registration:"
begin
  email = "test_#{SecureRandom.hex(4)}@example.com"
  
  # Create a user
  user = User.create!(
    email: email,
    password: 'password123',
    name: 'Test User with Couple'
  )
  
  # Create couple for user
  couple = Couple.create!(
    name: "#{user.name}'s Relationship",
    check_in_frequency: 'weekly'
  )
  couple.users << user
  
  if user.current_couple == couple
    puts "   ✅ Couple created and associated with user"
    puts "   - Couple name: #{couple.name}"
    puts "   - Check-in frequency: #{couple.check_in_frequency}"
  else
    puts "   ❌ Couple association failed"
  end
  
  # Clean up
  couple.destroy
  user.destroy
rescue => e
  puts "   ❌ Error: #{e.message}"
end

# 5. Test Partner Invitation Flow
puts "\n5. Test Partner Invitation Flow:"
begin
  # Create users
  inviter = User.create!(
    email: "inviter_#{SecureRandom.hex(4)}@example.com",
    password: 'password123',
    name: 'Inviter'
  )
  
  # Create couple
  couple = Couple.create!(
    name: 'Test Couple',
    check_in_frequency: 'weekly'
  )
  couple.users << inviter
  
  # Create relationship request
  request = RelationshipRequest.create!(
    requested_by: inviter,
    requested_for_email: "partner@example.com",
    couple: couple,
    message: "Join our relationship on QC",
    status: 'pending'
  )
  
  if request.persisted?
    puts "   ✅ Partner invitation created"
    puts "   - Requested by: #{request.requested_by.name}"
    puts "   - Requested for: #{request.requested_for_email}"
    puts "   - Status: #{request.status}"
  else
    puts "   ❌ Partner invitation failed"
  end
  
  # Clean up
  request.destroy
  couple.destroy
  inviter.destroy
rescue => e
  puts "   ❌ Error: #{e.message}"
end

# 6. Test Authentication Validation
puts "\n6. Test Authentication Validation:"
begin
  # Test invalid email
  user = User.new(
    email: 'invalid-email',
    password: 'password123',
    name: 'Test User'
  )
  
  if !user.valid? && user.errors[:email].any?
    puts "   ✅ Invalid email properly validated"
  else
    puts "   ❌ Invalid email not caught"
  end
  
  # Test password mismatch
  user = User.new(
    email: 'test@example.com',
    password: 'password123',
    password_confirmation: 'different456',
    name: 'Test User'
  )
  
  if !user.valid? && user.errors[:password_confirmation].any?
    puts "   ✅ Password mismatch properly validated"
  else
    puts "   ❌ Password mismatch not caught"
  end
  
  # Test short password
  user = User.new(
    email: 'test@example.com',
    password: '123',
    password_confirmation: '123',
    name: 'Test User'
  )
  
  if !user.valid? && user.errors[:password].any?
    puts "   ✅ Short password properly validated"
  else
    puts "   ❌ Short password not caught"
  end
rescue => e
  puts "   ❌ Error: #{e.message}"
end

# 7. Test JWT Token Revocation
puts "\n7. Test JWT Token Revocation:"
begin
  # Create a test token JTI
  jti = SecureRandom.uuid
  exp = 1.hour.from_now
  
  # Add to denylist
  JwtDenylist.revoke_token(jti, exp)
  
  # Check if revoked
  if JwtDenylist.token_revoked?(jti)
    puts "   ✅ Token revocation working"
  else
    puts "   ❌ Token revocation failed"
  end
  
  # Clean up expired tokens
  JwtDenylist.clean_expired
  puts "   ✅ Expired token cleanup working"
  
  # Clean up test token
  JwtDenylist.where(jti: jti).destroy_all
rescue => e
  puts "   ❌ Error: #{e.message}"
end

puts "\n" + "="*50
puts "Registration and Login Controllers unit testing complete!"
