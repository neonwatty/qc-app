#!/usr/bin/env ruby

require 'net/http'
require 'json'
require 'uri'

BASE_URL = 'http://localhost:3001/api/auth'

def make_request(method, path, body = nil, headers = {})
  uri = URI("#{BASE_URL}#{path}")

  http = Net::HTTP.new(uri.host, uri.port)

  request = case method.upcase
  when 'POST'
    Net::HTTP::Post.new(uri)
  when 'DELETE'
    Net::HTTP::Delete.new(uri)
  when 'GET'
    Net::HTTP::Get.new(uri)
  end

  request['Content-Type'] = 'application/json'
  headers.each { |k, v| request[k] = v }
  request.body = body.to_json if body

  response = http.request(request)

  {
    code: response.code,
    body: response.body.empty? ? nil : JSON.parse(response.body),
    headers: response.to_hash
  }
rescue => e
  puts "Error: #{e.message}"
  nil
end

puts "Testing Authentication Endpoints..."
puts "=" * 50

# Test user data
test_user = {
  user: {
    email: "test_#{Time.now.to_i}@example.com",
    password: "password123",
    password_confirmation: "password123",
    name: "Test User"
  }
}

# 1. Test Sign Up
puts "\n1. Testing Sign Up..."
signup_response = make_request('POST', '/sign_up', test_user)

if signup_response
  puts "   Status: #{signup_response[:code]}"
  if signup_response[:code] == '200' || signup_response[:code] == '201'
    puts "   ✅ Sign up successful!"
    puts "   User ID: #{signup_response[:body]['data']['id']}" if signup_response[:body]['data']
    auth_token = signup_response[:headers]['authorization']&.first
    puts "   JWT Token: #{auth_token ? auth_token[0..30] + '...' : 'Not found'}"
  else
    puts "   ❌ Sign up failed: #{signup_response[:body]}"
  end
else
  puts "   ❌ Request failed"
end

# 2. Test Sign In
puts "\n2. Testing Sign In..."
signin_data = {
  user: {
    email: test_user[:user][:email],
    password: test_user[:user][:password]
  }
}

signin_response = make_request('POST', '/sign_in', signin_data)

if signin_response
  puts "   Status: #{signin_response[:code]}"
  if signin_response[:code] == '200' || signin_response[:code] == '201'
    puts "   ✅ Sign in successful!"
    auth_token = signin_response[:headers]['authorization']&.first
    puts "   JWT Token: #{auth_token ? auth_token[0..30] + '...' : 'Not found'}"

    # 3. Test Sign Out (with token)
    if auth_token
      puts "\n3. Testing Sign Out..."
      signout_response = make_request('DELETE', '/sign_out', nil, { 'Authorization' => auth_token })

      if signout_response
        puts "   Status: #{signout_response[:code]}"
        if signout_response[:code] == '200' || signout_response[:code] == '204'
          puts "   ✅ Sign out successful!"
        else
          puts "   ❌ Sign out failed: #{signout_response[:body]}"
        end
      else
        puts "   ❌ Request failed"
      end
    end
  else
    puts "   ❌ Sign in failed: #{signin_response[:body]}"
  end
else
  puts "   ❌ Request failed"
end

puts "\n" + "=" * 50
puts "Authentication testing complete!"
