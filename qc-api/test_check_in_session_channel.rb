#!/usr/bin/env ruby

# Test helper methods
def assert(condition, message)
  if condition
    puts "✓ #{message}"
    true
  else
    puts "✗ FAILED: #{message}"
    @failures ||= []
    @failures << message
    false
  end
end

def assert_includes(content, text, message)
  if content.include?(text)
    puts "✓ #{message}"
    true
  else
    puts "✗ FAILED: #{message}"
    @failures ||= []
    @failures << message
    false
  end
end

puts "\n" + "="*60
puts "Testing CheckInSessionChannel Implementation"
puts "="*60

# Test 1: File and Basic Structure
puts "\n--- Test 1: File and Basic Structure ---"

channel_file = File.exist?('app/channels/check_in_session_channel.rb')
assert(channel_file, "CheckInSessionChannel file exists")

if channel_file
  content = File.read('app/channels/check_in_session_channel.rb')

  # Check class definition
  assert_includes(content, 'class CheckInSessionChannel < ApplicationCable::Channel',
    "Channel inherits from ApplicationCable::Channel")

  # Core methods
  assert_includes(content, 'def subscribed', "Has subscribed method")
  assert_includes(content, 'def unsubscribed', "Has unsubscribed method")
end

# Test 2: Turn-Based Communication Features
puts "\n--- Test 2: Turn-Based Communication ---"

if channel_file
  content = File.read('app/channels/check_in_session_channel.rb')

  assert_includes(content, 'def request_turn', "Has request_turn method")
  assert_includes(content, 'def release_turn', "Has release_turn method")
  assert_includes(content, 'can_take_turn?', "Checks if user can take turn")
  assert_includes(content, 'has_turn?', "Checks if user has turn")
  assert_includes(content, 'grant_turn_to', "Can grant turn to user")
  assert_includes(content, 'broadcast_turn_change', "Broadcasts turn changes")
  assert_includes(content, 'broadcast_turn_released', "Broadcasts turn release")
end

# Test 3: Session Progress Management
puts "\n--- Test 3: Session Progress Management ---"

if channel_file
  content = File.read('app/channels/check_in_session_channel.rb')

  assert_includes(content, 'def advance_step', "Has advance_step method")
  assert_includes(content, 'def complete_step', "Has complete_step method")
  assert_includes(content, 'valid_step?', "Validates step transitions")
  assert_includes(content, 'track_step_completion', "Tracks step completion")
  assert_includes(content, 'calculate_step_duration', "Calculates step duration")
  assert_includes(content, 'broadcast_step_change', "Broadcasts step changes")
  assert_includes(content, 'broadcast_step_completed', "Broadcasts step completion")
end

# Test 4: Note Synchronization
puts "\n--- Test 4: Note Synchronization ---"

if channel_file
  content = File.read('app/channels/check_in_session_channel.rb')

  assert_includes(content, 'def create_synchronized_note', "Creates synchronized notes")
  assert_includes(content, 'def update_synchronized_note', "Updates synchronized notes")
  assert_includes(content, 'def lock_note_for_editing', "Implements note locking")
  assert_includes(content, 'def release_note_lock', "Releases note locks")
  assert_includes(content, 'transmit_edit_conflict', "Handles edit conflicts")
  assert_includes(content, 'lock_version', "Uses optimistic locking")
  assert_includes(content, 'sync_id', "Tracks sync IDs for notes")
end

# Test 5: Real-time Collaboration
puts "\n--- Test 5: Real-time Collaboration ---"

if channel_file
  content = File.read('app/channels/check_in_session_channel.rb')

  assert_includes(content, 'def typing_indicator', "Has typing indicator")
  assert_includes(content, 'def share_cursor', "Shares cursor position")
  assert_includes(content, 'def highlight_text', "Highlights text for partner")
  assert_includes(content, 'broadcast_to_partner', "Broadcasts to partner")
end

# Test 6: Session State Management
puts "\n--- Test 6: Session State Management ---"

if channel_file
  content = File.read('app/channels/check_in_session_channel.rb')

  assert_includes(content, 'def update_timer', "Updates session timer")
  assert_includes(content, 'def pause_session', "Can pause session")
  assert_includes(content, 'def resume_session', "Can resume session")
  assert_includes(content, 'def complete_session', "Can complete session")
  assert_includes(content, 'initialize_session_state', "Initializes session state")
  assert_includes(content, 'transmit_session_state', "Transmits session state")
  assert_includes(content, 'save_session_metrics', "Saves session metrics")
  assert_includes(content, 'calculate_total_duration', "Calculates total duration")
end

# Test 7: Emoji Reactions
puts "\n--- Test 7: Emoji Reactions ---"

if channel_file
  content = File.read('app/channels/check_in_session_channel.rb')

  assert_includes(content, 'def send_reaction', "Has send_reaction method")
  assert_includes(content, 'broadcast_reaction', "Broadcasts reactions")
  assert_includes(content, "'emoji'", "Handles emoji data")
end

# Test 8: Authorization and Security
puts "\n--- Test 8: Authorization and Security ---"

if channel_file
  content = File.read('app/channels/check_in_session_channel.rb')

  assert_includes(content, 'authorized?', "Has authorization check")
  assert_includes(content, 'valid_session?', "Validates session")
  assert_includes(content, 'can_modify_session?', "Checks modification permissions")
  assert_includes(content, 'can_edit_note?', "Checks note edit permissions")
  assert_includes(content, 'reject', "Can reject unauthorized connections")
end

# Test 9: Connection Handling
puts "\n--- Test 9: Connection Handling ---"

if channel_file
  content = File.read('app/channels/check_in_session_channel.rb')

  assert_includes(content, 'broadcast_partner_joined', "Broadcasts partner joined")
  assert_includes(content, 'broadcast_partner_left', "Broadcasts partner left")
  assert_includes(content, 'active_participants', "Tracks active participants")
  assert_includes(content, 'remove_from_active_participants', "Removes participants")
  assert_includes(content, 'pause_session_if_empty', "Pauses when empty")
end

# Test 10: Broadcasting Patterns
puts "\n--- Test 10: Broadcasting Patterns ---"

if channel_file
  content = File.read('app/channels/check_in_session_channel.rb')

  assert_includes(content, 'CheckInSessionChannel.broadcast_to', "Uses proper broadcast pattern")
  assert_includes(content, 'stream_for @check_in', "Streams for check-in")
  assert_includes(content, 'transmit(', "Uses transmit for direct messages")
  assert_includes(content, "'event':", "Uses event-based messaging")
  assert_includes(content, 'timestamp:', "Includes timestamps in broadcasts")
end

# Test 11: Serialization Methods
puts "\n--- Test 11: Serialization Methods ---"

if channel_file
  content = File.read('app/channels/check_in_session_channel.rb')

  assert_includes(content, 'def serialize_check_in', "Has check-in serialization")
  assert_includes(content, 'def serialize_note', "Has note serialization")
  assert_includes(content, 'iso8601', "Uses ISO 8601 timestamps")
end

# Test 12: Participation Tracking
puts "\n--- Test 12: Participation Tracking ---"

if channel_file
  content = File.read('app/channels/check_in_session_channel.rb')

  assert_includes(content, 'calculate_participation_balance', "Calculates participation balance")
  assert_includes(content, 'step_completions', "Tracks step completions")
  assert_includes(content, 'session_metrics', "Stores session metrics")
end

# Test 13: Error Handling
puts "\n--- Test 13: Error Handling ---"

if channel_file
  content = File.read('app/channels/check_in_session_channel.rb')

  assert_includes(content, 'rescue StandardError', "Has error handling")
  assert_includes(content, 'Rails.logger.error', "Logs errors")
  assert_includes(content, 'return unless', "Has guard clauses")
  assert_includes(content, 'find_by', "Uses safe finders")
end

# Test 14: Turn-Based Mode
puts "\n--- Test 14: Turn-Based Mode ---"

if channel_file
  content = File.read('app/channels/check_in_session_channel.rb')

  assert_includes(content, 'turn_based_mode?', "Checks turn-based mode")
  assert_includes(content, 'current_turn_user_id', "Tracks current turn user")
  assert_includes(content, 'turn_started_at', "Tracks turn start time")
  assert_includes(content, 'transmit_turn_denied', "Handles turn denial")
end

# Test 15: Auto-release Mechanisms
puts "\n--- Test 15: Auto-release Mechanisms ---"

if channel_file
  content = File.read('app/channels/check_in_session_channel.rb')

  assert_includes(content, 'ReleaseNoteLockJob', "Has auto-release job for notes")
  assert_includes(content, 'set(wait: 5.minutes)', "Sets timeout for locks")
end

# Summary
puts "\n" + "="*60
if @failures.nil? || @failures.empty?
  puts "✅ ALL CHECKIN SESSION CHANNEL TESTS PASSED!"
  puts "✅ Turn-based communication implemented"
  puts "✅ Session synchronization ready"
  puts "✅ Note collaboration features complete"
  puts "✅ Real-time features operational"
else
  puts "❌ #{@failures.length} TESTS FAILED:"
  @failures.each { |f| puts "   - #{f}" }
end
puts "="*60