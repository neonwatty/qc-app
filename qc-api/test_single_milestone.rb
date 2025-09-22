#!/usr/bin/env ruby

require_relative 'config/environment'

# Test milestone auto achievement in isolation
couple = Couple.first || Couple.create!(
  name: 'Test Couple',
  check_in_frequency: 'daily'
)

puts "Testing milestone auto achievement..."

# Clean up any existing test milestone
couple.milestones.where(title: 'Test Auto Achievement').destroy_all

milestone = couple.milestones.create!(
  title: 'Test Auto Achievement',
  description: 'Test',
  category: 'consistency',
  rarity: 'common',
  progress: 95,
  icon: '🎯',
  criteria: { 'type' => 'count', 'target' => 100 }
)

puts "Created milestone with progress: #{milestone.progress}"

# Try to update progress
begin
  result = milestone.update_progress!(100)
  puts "Update result: #{result}"
  puts "Milestone achieved: #{milestone.reload.achieved?}"
rescue => e
  puts "Error: #{e.message}"
  puts e.backtrace.first(5)
end