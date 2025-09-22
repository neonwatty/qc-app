#!/usr/bin/env ruby

# Test script for JWT authentication and refresh tokens

require 'net/http'
require 'json'
require 'uri'

BASE_URL = 'http://localhost:3000'

puts "Testing JWT Authentication System..."
puts "="*50

# 1. Test User Sign Up
puts "\n1. Testing User Sign Up..."
uri = URI.parse("#{BASE_URL}/api/auth/sign_up")
http = Net::HTTP.new(uri.host, uri.port)
request = Net::HTTP::Post.new(uri.path, { 'Content-Type' => 'application/json' })
request.body = {
  user: {
    email: "jwt_test_#{Time.now.to_i}@example.com",
    password: 'password123',
    password_confirmation: 'password123',
    name: 'JWT Test User'
  }
}.to_json

response = http.request(request)
puts "   Status: #{response.code}"

if response.code == '200'
  data = JSON.parse(response.body)
  jwt_token = response['Authorization']
  puts "   ✅ Sign up successful!"
  puts "   JWT Token: #{jwt_token ? jwt_token[0..30] + '...' : 'Not found'}"
  user_email = data.dig('data', 'email')
else
  puts "   ❌ Sign up failed: #{JSON.parse(response.body)}"
  exit(1)
end

# 2. Test User Sign In with Refresh Token
puts "\n2. Testing Sign In with Refresh Token..."
uri = URI.parse("#{BASE_URL}/api/auth/sign_in")
request = Net::HTTP::Post.new(uri.path, { 'Content-Type' => 'application/json' })
request.body = {
  user: {
    email: user_email,
    password: 'password123'
  }
}.to_json

response = http.request(request)
puts "   Status: #{response.code}"

if response.code == '200'
  data = JSON.parse(response.body)
  access_token = response['Authorization']
  refresh_token = data.dig('data', 'refresh_token')
  puts "   ✅ Sign in successful!"
  puts "   Access Token: #{access_token ? access_token[0..30] + '...' : 'Not found'}"
  puts "   Refresh Token: #{refresh_token ? refresh_token[0..30] + '...' : 'Not found'}"
else
  puts "   ❌ Sign in failed: #{JSON.parse(response.body)}"
  exit(1)
end

# 3. Test Token Refresh
puts "\n3. Testing Token Refresh..."
uri = URI.parse("#{BASE_URL}/api/auth/refresh")
request = Net::HTTP::Post.new(uri.path, {
  'Content-Type' => 'application/json',
  'X-Refresh-Token' => refresh_token
})

response = http.request(request)
puts "   Status: #{response.code}"

if response.code == '200'
  data = JSON.parse(response.body)
  new_access_token = data.dig('data', 'token')
  new_refresh_token = data.dig('data', 'refresh_token')
  puts "   ✅ Token refresh successful!"
  puts "   New Access Token: #{new_access_token ? new_access_token[0..30] + '...' : 'Not generated'}"
  puts "   New Refresh Token: #{new_refresh_token ? new_refresh_token[0..30] + '...' : 'Not generated'}"
else
  puts "   ❌ Token refresh failed: #{response.body}"
end

# 4. Test Protected Endpoint with JWT
puts "\n4. Testing Protected Endpoint..."
uri = URI.parse("#{BASE_URL}/api/users/#{data.dig('data', 'user', 'id')}")
request = Net::HTTP::Get.new(uri.path, {
  'Authorization' => access_token,
  'Content-Type' => 'application/json'
})

response = http.request(request)
puts "   Status: #{response.code}"

if response.code == '200'
  puts "   ✅ Protected endpoint accessible with JWT!"
else
  puts "   ❌ Protected endpoint failed: #{response.code}"
end

# 5. Test Sign Out (Token Revocation)
puts "\n5. Testing Sign Out..."
uri = URI.parse("#{BASE_URL}/api/auth/sign_out")
request = Net::HTTP::Delete.new(uri.path, {
  'Authorization' => access_token,
  'Content-Type' => 'application/json'
})

response = http.request(request)
puts "   Status: #{response.code}"

if response.code == '200'
  puts "   ✅ Sign out successful (token revoked)!"
else
  puts "   ❌ Sign out failed: #{response.code}"
end

# 6. Test Invalid Refresh Token
puts "\n6. Testing Invalid Refresh Token..."
uri = URI.parse("#{BASE_URL}/api/auth/refresh")
request = Net::HTTP::Post.new(uri.path, {
  'Content-Type' => 'application/json',
  'X-Refresh-Token' => 'invalid.token.here'
})

response = http.request(request)
puts "   Status: #{response.code}"

if response.code == '401'
  puts "   ✅ Invalid refresh token correctly rejected!"
else
  puts "   ❌ Invalid token not properly rejected: #{response.code}"
end

puts "\n" + "="*50
puts "JWT Authentication testing complete!"
