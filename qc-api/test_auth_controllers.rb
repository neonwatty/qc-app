#!/usr/bin/env ruby

# Test script for registration and login controllers

require 'net/http'
require 'json'
require 'uri'
require 'securerandom'

BASE_URL = 'http://localhost:3000'

puts "Testing Registration and Login Controllers..."
puts "="*50

# Helper method for API requests
def make_request(method, path, body = nil, headers = {})
  uri = URI.parse("#{BASE_URL}#{path}")
  http = Net::HTTP.new(uri.host, uri.port)
  
  request = case method
  when :post
    Net::HTTP::Post.new(uri.path, { 'Content-Type' => 'application/json' }.merge(headers))
  when :delete
    Net::HTTP::Delete.new(uri.path, { 'Content-Type' => 'application/json' }.merge(headers))
  when :get
    Net::HTTP::Get.new(uri.path, { 'Content-Type' => 'application/json' }.merge(headers))
  when :put
    Net::HTTP::Put.new(uri.path, { 'Content-Type' => 'application/json' }.merge(headers))
  end
  
  request.body = body.to_json if body
  http.request(request)
end

# 1. Test User Registration
puts "\n1. Test User Registration:"
begin
  # Test basic registration
  email = "test_#{SecureRandom.hex(4)}@example.com"
  response = make_request(:post, '/api/auth/sign_up', {
    user: {
      email: email,
      password: 'password123',
      password_confirmation: 'password123',
      name: 'Test User'
    }
  })
  
  if response.code == '201' || response.code == '200'
    data = JSON.parse(response.body)
    puts "   ✅ Basic registration successful"
    puts "   - User created: #{data.dig('data', 'user', 'email')}"
    user_email = email
    jwt_token = response['Authorization']
  else
    puts "   ❌ Registration failed: #{response.code}"
    puts "   #{response.body}"
  end
  
  # Test registration with couple creation
  email2 = "test_#{SecureRandom.hex(4)}@example.com"
  response = make_request(:post, '/api/auth/sign_up', {
    user: {
      email: email2,
      password: 'password123',
      password_confirmation: 'password123',
      name: 'Test User 2'
    },
    create_couple: true,
    couple_name: 'Test Couple',
    check_in_frequency: 'weekly'
  })
  
  if response.code == '201' || response.code == '200'
    data = JSON.parse(response.body)
    puts "   ✅ Registration with couple creation successful"
    if data.dig('data', 'couple')
      puts "   - Couple created: #{data.dig('data', 'couple', 'name')}"
    end
  else
    puts "   ❌ Registration with couple failed: #{response.code}"
  end
  
  # Test registration with invalid data
  response = make_request(:post, '/api/auth/sign_up', {
    user: {
      email: 'invalid-email',
      password: '123',
      password_confirmation: '456',
      name: ''
    }
  })
  
  if response.code == '422'
    data = JSON.parse(response.body)
    puts "   ✅ Invalid registration properly rejected"
    puts "   - Errors: #{data['errors']&.first}"
  else
    puts "   ❌ Invalid registration not properly handled: #{response.code}"
  end
rescue => e
  puts "   ❌ Error: #{e.message}"
end

# 2. Test User Login
puts "\n2. Test User Login:"
begin
  # Test successful login
  response = make_request(:post, '/api/auth/sign_in', {
    user: {
      email: user_email,
      password: 'password123'
    }
  })
  
  if response.code == '200'
    data = JSON.parse(response.body)
    puts "   ✅ Login successful"
    puts "   - JWT Token: #{response['Authorization'] ? 'Present' : 'Missing'}"
    puts "   - Refresh Token: #{data.dig('data', 'refresh_token') ? 'Present' : 'Missing'}"
    
    jwt_token = response['Authorization']
    refresh_token = data.dig('data', 'refresh_token')
  else
    puts "   ❌ Login failed: #{response.code}"
  end
  
  # Test login with invalid credentials
  response = make_request(:post, '/api/auth/sign_in', {
    user: {
      email: user_email,
      password: 'wrongpassword'
    }
  })
  
  if response.code == '401'
    data = JSON.parse(response.body)
    puts "   ✅ Invalid login properly rejected"
    puts "   - Error: #{data.dig('status', 'message')}"
  else
    puts "   ❌ Invalid login not properly handled: #{response.code}"
  end
  
  # Test login without parameters
  response = make_request(:post, '/api/auth/sign_in', {})
  
  if response.code == '400'
    puts "   ✅ Missing parameters properly handled"
  else
    puts "   ❌ Missing parameters not properly handled: #{response.code}"
  end
rescue => e
  puts "   ❌ Error: #{e.message}"
end

# 3. Test Token Refresh
puts "\n3. Test Token Refresh:"
begin
  if refresh_token
    # Test successful refresh
    response = make_request(:post, '/api/auth/refresh', nil, {
      'X-Refresh-Token' => refresh_token
    })
    
    if response.code == '200'
      data = JSON.parse(response.body)
      puts "   ✅ Token refresh successful"
      puts "   - New token: #{data.dig('data', 'token') ? 'Present' : 'Missing'}"
      puts "   - New refresh token: #{data.dig('data', 'refresh_token') ? 'Present' : 'Missing'}"
    else
      puts "   ❌ Token refresh failed: #{response.code}"
    end
    
    # Test refresh with invalid token
    response = make_request(:post, '/api/auth/refresh', nil, {
      'X-Refresh-Token' => 'invalid.token.here'
    })
    
    if response.code == '401'
      puts "   ✅ Invalid refresh token properly rejected"
    else
      puts "   ❌ Invalid refresh token not properly handled: #{response.code}"
    end
    
    # Test refresh without token
    response = make_request(:post, '/api/auth/refresh')
    
    if response.code == '401'
      puts "   ✅ Missing refresh token properly handled"
    else
      puts "   ❌ Missing refresh token not properly handled: #{response.code}"
    end
  else
    puts "   ⚠ Skipping (no refresh token available)"
  end
rescue => e
  puts "   ❌ Error: #{e.message}"
end

# 4. Test Logout
puts "\n4. Test Logout:"
begin
  if jwt_token
    # Test successful logout
    response = make_request(:delete, '/api/auth/sign_out', nil, {
      'Authorization' => jwt_token
    })
    
    if response.code == '200'
      data = JSON.parse(response.body)
      puts "   ✅ Logout successful"
      puts "   - Message: #{data.dig('status', 'message')}"
    else
      puts "   ❌ Logout failed: #{response.code}"
    end
    
    # Test logout without session
    response = make_request(:delete, '/api/auth/sign_out')
    
    if response.code == '404' || response.code == '401'
      puts "   ✅ Logout without session properly handled"
    else
      puts "   ❌ Logout without session not properly handled: #{response.code}"
    end
  else
    puts "   ⚠ Skipping (no JWT token available)"
  end
rescue => e
  puts "   ❌ Error: #{e.message}"
end

# 5. Test Error Response Formatting
puts "\n5. Test Error Response Formatting:"
begin
  # Test various error scenarios
  response = make_request(:post, '/api/auth/sign_up', {
    user: {
      email: user_email,  # Duplicate email
      password: 'password123',
      password_confirmation: 'password123',
      name: 'Duplicate User'
    }
  })
  
  if response.code == '422'
    data = JSON.parse(response.body)
    if data['status'] && data['errors']
      puts "   ✅ Error response properly formatted"
      puts "   - Status code: #{data.dig('status', 'code')}"
      puts "   - Message: #{data.dig('status', 'message')}"
      puts "   - Has errors array: #{data['errors'].is_a?(Array)}"
    else
      puts "   ❌ Error response not properly formatted"
    end
  else
    puts "   ⚠ Duplicate registration returned: #{response.code}"
  end
rescue => e
  puts "   ❌ Error: #{e.message}"
end

puts "\n" + "="*50
puts "Registration and Login Controllers testing complete!"
