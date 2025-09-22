#!/usr/bin/env ruby

# Simple test for validators
require_relative 'config/environment'

puts "Testing validators..."

# Test CheckInValidator
validator = CheckInValidator.new
validator.status = 'completed'
validator.mood_before = 3
validator.mood_after = 4

if validator.valid?
  puts "✓ CheckInValidator works with valid data"
else
  puts "✗ CheckInValidator errors: #{validator.errors.full_messages}"
end

# Test with invalid data
validator = CheckInValidator.new
validator.status = 'invalid_status'

if validator.invalid?
  puts "✓ CheckInValidator rejects invalid data"
else
  puts "✗ CheckInValidator accepted invalid data"
end

# Test BaseValidator.validate_params!
begin
  result = CheckInValidator.validate_params!({status: 'completed', mood_before: 3})
  puts "✓ BaseValidator.validate_params! works"
rescue => e
  puts "✗ BaseValidator.validate_params! error: #{e.message}"
end

puts "\nDone!"