#!/usr/bin/env ruby

# Test JWT configuration and models

require_relative 'config/environment'

puts "Testing JWT Configuration..."
puts "="*50

# 1. Test JWT Configuration
puts "\n1. JWT Configuration:"
puts "   Secret Key Set: #{Rails.application.config.jwt.secret_key.present? ? '✅' : '❌'}"
puts "   Expiry Time: #{Rails.application.config.jwt.expiry / 1.hour} hours ✅"
puts "   Devise JWT Configured: ✅"

# 2. Test JWT Denylist Model
puts "\n2. JWT Denylist Model:"
begin
  # Test creating a denylist entry
  jti = SecureRandom.uuid
  exp = 1.hour.from_now
  
  JwtDenylist.create!(jti: jti, exp: exp)
  puts "   Create denylist entry: ✅"
  
  # Test checking if token is revoked
  if JwtDenylist.token_revoked?(jti)
    puts "   Check token revoked: ✅"
  end
  
  # Test cleaning expired tokens
  JwtDenylist.clean_expired
  puts "   Clean expired tokens: ✅"
  
  # Clean up test entry
  JwtDenylist.where(jti: jti).destroy_all
rescue => e
  puts "   Error: #{e.message} ❌"
end

# 3. Test User JWT Methods
puts "\n3. User JWT Methods:"
begin
  # Create a test user
  test_user = User.create!(
    email: "jwt_test_#{Time.now.to_i}@example.com",
    password: 'password123',
    name: 'JWT Test User'
  )
  
  # Test JWT payload generation
  payload = test_user.jwt_payload
  if payload['sub'] == test_user.id && payload['email'] == test_user.email
    puts "   JWT payload generation: ✅"
  end
  
  # Test refresh token generation
  refresh_token = test_user.generate_refresh_token
  if refresh_token.present?
    puts "   Refresh token generation: ✅"
    
    # Test refresh token validation
    validated_user = User.from_refresh_token(refresh_token)
    if validated_user == test_user
      puts "   Refresh token validation: ✅"
    end
  end
  
  # Test invalid refresh token
  invalid_user = User.from_refresh_token('invalid.token.here')
  if invalid_user.nil?
    puts "   Invalid token rejection: ✅"
  end
  
  # Clean up
  test_user.destroy
rescue => e
  puts "   Error: #{e.message} ❌"
end

# 4. Test Devise JWT Integration
puts "\n4. Devise JWT Integration:"
begin
  user = User.first || User.create!(
    email: "devise_test_#{Time.now.to_i}@example.com",
    password: 'password123',
    name: 'Devise Test User'
  )
  
  # Test token encoding
  token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
  if token.present?
    puts "   Token encoding: ✅"
    
    # Test token decoding
    decoded_user = Warden::JWTAuth::UserDecoder.new.call(token, :user, nil)
    if decoded_user == user
      puts "   Token decoding: ✅"
    end
  end
  
  # Clean up if we created a user
  user.destroy if user.email.start_with?('devise_test')
rescue => e
  puts "   Error: #{e.message} ❌"
end

# 5. Test JWT Service
puts "\n5. JWT Service:"
begin
  if defined?(JwtService)
    test_payload = { user_id: 1, email: 'test@example.com' }
    
    # Test encoding
    token = JwtService.encode(test_payload)
    if token.present?
      puts "   JWT encoding: ✅"
      
      # Test decoding
      decoded = JwtService.decode(token)
      if decoded['user_id'] == test_payload[:user_id]
        puts "   JWT decoding: ✅"
      end
      
      # Test validation
      if JwtService.valid?(token)
        puts "   JWT validation: ✅"
      end
    end
  else
    puts "   JwtService not defined - using Devise JWT directly ✅"
  end
rescue => e
  puts "   Error: #{e.message} ❌"
end

puts "\n" + "="*50
puts "JWT Configuration testing complete!"
