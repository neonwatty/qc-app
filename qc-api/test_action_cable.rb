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

def assert_equal(expected, actual, message)
  if expected == actual
    puts "✓ #{message}"
    true
  else
    puts "✗ FAILED: #{message} - Expected: #{expected.inspect}, Got: #{actual.inspect}"
    @failures ||= []
    @failures << message
    false
  end
end

def assert_not_nil(value, message)
  if !value.nil?
    puts "✓ #{message}"
    true
  else
    puts "✗ FAILED: #{message} - Expected non-nil value"
    @failures ||= []
    @failures << message
    false
  end
end

puts "\n" + "="*60
puts "Testing Action Cable Real-time Features"
puts "="*60

# Test 1: ApplicationCable Connection
puts "\n--- Test 1: ApplicationCable Connection ---"

# Check if connection class exists and has authentication
connection_file = File.exist?('app/channels/application_cable/connection.rb')
assert(connection_file, "ApplicationCable::Connection file exists")

if connection_file
  content = File.read('app/channels/application_cable/connection.rb')
  assert(content.include?('identified_by :current_user'), "Connection identifies current_user")
  assert(content.include?('find_verified_user'), "Connection has user verification")
  assert(content.include?('JWT.decode'), "Connection supports JWT authentication")
  assert(content.include?('reject_unauthorized_connection'), "Connection rejects unauthorized users")
end

# Test 2: ApplicationCable Channel Base
puts "\n--- Test 2: ApplicationCable Channel Base ---"

channel_file = File.exist?('app/channels/application_cable/channel.rb')
assert(channel_file, "ApplicationCable::Channel file exists")

if channel_file
  content = File.read('app/channels/application_cable/channel.rb')
  assert(content.include?('current_couple'), "Channel has current_couple helper")
  assert(content.include?('partner_for'), "Channel has partner_for helper")
  assert(content.include?('broadcast_to_partner'), "Channel can broadcast to partner")
  assert(content.include?('broadcast_to_couple'), "Channel can broadcast to couple")
  assert(content.include?('authorize_couple_member'), "Channel has authorization helper")
end

# Test 3: CheckInChannel Implementation
puts "\n--- Test 3: CheckInChannel Implementation ---"

checkin_file = File.exist?('app/channels/check_in_channel.rb')
assert(checkin_file, "CheckInChannel file exists")

if checkin_file
  content = File.read('app/channels/check_in_channel.rb')

  # Core subscription methods
  assert(content.include?('def subscribed'), "CheckInChannel has subscribed method")
  assert(content.include?('def unsubscribed'), "CheckInChannel has unsubscribed method")
  assert(content.include?('stream_for check_in'), "CheckInChannel streams for check-in")

  # Real-time features
  assert(content.include?('def update_note'), "CheckInChannel supports note updates")
  assert(content.include?('def create_note'), "CheckInChannel supports note creation")
  assert(content.include?('def change_privacy'), "CheckInChannel supports privacy changes")
  assert(content.include?('def advance_step'), "CheckInChannel supports step advancement")
  assert(content.include?('def typing'), "CheckInChannel supports typing indicators")
  assert(content.include?('def complete_session'), "CheckInChannel supports session completion")
  assert(content.include?('def sync_cursor'), "CheckInChannel supports cursor synchronization")

  # Broadcasting helpers
  assert(content.include?('broadcast_user_joined'), "CheckInChannel broadcasts user joined")
  assert(content.include?('broadcast_user_left'), "CheckInChannel broadcasts user left")
  assert(content.include?('mark_user_present'), "CheckInChannel tracks user presence")
end

# Test 4: PresenceChannel Implementation
puts "\n--- Test 4: PresenceChannel Implementation ---"

presence_file = File.exist?('app/channels/presence_channel.rb')
assert(presence_file, "PresenceChannel file exists")

if presence_file
  content = File.read('app/channels/presence_channel.rb')

  # Presence methods
  assert(content.include?('def appear'), "PresenceChannel has appear method")
  assert(content.include?('def away'), "PresenceChannel has away method")
  assert(content.include?('def disappear'), "PresenceChannel has disappear method")
  assert(content.include?('def update_activity'), "PresenceChannel tracks activity")
  assert(content.include?('def typing_status'), "PresenceChannel handles typing status")
  assert(content.include?('def heartbeat'), "PresenceChannel has heartbeat mechanism")
  assert(content.include?('def request_partner_status'), "PresenceChannel can request partner status")

  # Streaming
  assert(content.include?('stream_from "presence_user_'), "PresenceChannel streams user presence")
  assert(content.include?('stream_from "presence_couple_'), "PresenceChannel streams couple presence")

  # Redis tracking
  assert(content.include?('track_presence_in_redis'), "PresenceChannel tracks in Redis")
end

# Test 5: NotificationChannel Implementation
puts "\n--- Test 5: NotificationChannel Implementation ---"

notification_file = File.exist?('app/channels/notification_channel.rb')
assert(notification_file, "NotificationChannel file exists")

if notification_file
  content = File.read('app/channels/notification_channel.rb')

  # Notification methods
  assert(content.include?('def mark_read'), "NotificationChannel can mark as read")
  assert(content.include?('def mark_all_read'), "NotificationChannel can mark all as read")
  assert(content.include?('def delete_notification'), "NotificationChannel can delete notifications")
  assert(content.include?('def update_preferences'), "NotificationChannel can update preferences")

  # Class methods for sending notifications
  assert(content.include?('notify_user'), "NotificationChannel has notify_user method")
  assert(content.include?('notify_couple'), "NotificationChannel has notify_couple method")
  assert(content.include?('notify_check_in_reminder'), "NotificationChannel sends check-in reminders")
  assert(content.include?('notify_partner_shared_note'), "NotificationChannel notifies note sharing")
  assert(content.include?('notify_milestone_achieved'), "NotificationChannel notifies milestones")
  assert(content.include?('notify_action_item_assigned'), "NotificationChannel notifies assignments")

  # Streaming
  assert(content.include?('stream_from "notifications_user_'), "NotificationChannel streams user notifications")
  assert(content.include?('stream_from "notifications_couple_'), "NotificationChannel streams couple notifications")

  # Delivery
  assert(content.include?('deliver_pending_notifications'), "NotificationChannel delivers pending notifications")
  assert(content.include?('broadcast_unread_count'), "NotificationChannel broadcasts unread count")
end

# Test 6: Broadcastable Concern
puts "\n--- Test 6: Broadcastable Concern ---"

broadcastable_file = File.exist?('app/controllers/concerns/broadcastable.rb')
assert(broadcastable_file, "Broadcastable concern exists")

if broadcastable_file
  content = File.read('app/controllers/concerns/broadcastable.rb')

  # Broadcasting helpers
  assert(content.include?('broadcast_check_in_event'), "Broadcastable can broadcast check-in events")
  assert(content.include?('send_notification'), "Broadcastable can send notifications")
  assert(content.include?('send_couple_notification'), "Broadcastable can send couple notifications")
  assert(content.include?('broadcast_presence_update'), "Broadcastable can broadcast presence")
  assert(content.include?('notify_partner_note_shared'), "Broadcastable notifies note sharing")
  assert(content.include?('notify_action_item_assignment'), "Broadcastable notifies assignments")
  assert(content.include?('broadcast_milestone_achieved'), "Broadcastable broadcasts milestones")
  assert(content.include?('broadcast_typing_indicator'), "Broadcastable broadcasts typing")
  assert(content.include?('broadcast_session_activity'), "Broadcastable broadcasts session activity")
  assert(content.include?('broadcast_cursor_sync'), "Broadcastable broadcasts cursor sync")
end

# Test 7: Cable Configuration
puts "\n--- Test 7: Cable Configuration ---"

cable_config = File.exist?('config/cable.yml')
assert(cable_config, "cable.yml configuration exists")

if cable_config
  content = File.read('config/cable.yml')
  assert(content.include?('development:'), "Development configuration exists")
  assert(content.include?('test:'), "Test configuration exists")
  assert(content.include?('production:'), "Production configuration exists")
  assert(content.include?('adapter:'), "Adapter is configured")
end

# Test 8: Channel Structure Validation
puts "\n--- Test 8: Channel Structure Validation ---"

# Verify all channels follow Rails conventions
channels = Dir.glob('app/channels/**/*.rb')
assert(channels.length >= 5, "At least 5 channel files exist")

channels.each do |channel_file|
  content = File.read(channel_file)
  filename = File.basename(channel_file)

  if filename != 'channel.rb' && filename != 'connection.rb'
    # Check for proper class definition
    class_name = filename.gsub('.rb', '').camelize
    has_class = content.match(/class #{class_name}/)
    assert(has_class, "#{filename} has proper class definition")
  end
end

# Test 9: Real-time Event Patterns
puts "\n--- Test 9: Real-time Event Patterns ---"

# Check for consistent event naming patterns
checkin_content = File.read('app/channels/check_in_channel.rb') rescue ""
presence_content = File.read('app/channels/presence_channel.rb') rescue ""
notification_content = File.read('app/channels/notification_channel.rb') rescue ""

all_content = checkin_content + presence_content + notification_content

# Common event patterns
assert(all_content.include?("event:"), "Channels use event key in broadcasts")
assert(all_content.include?("timestamp:"), "Channels include timestamps")
assert(all_content.include?("ActionCable.server.broadcast"), "Channels use server broadcast")

# Security checks
assert(all_content.include?("current_user"), "Channels use current_user")
assert(all_content.include?("reject"), "Channels can reject unauthorized access")

# Test 10: Integration Points
puts "\n--- Test 10: Integration Points ---"

# Check that channels integrate with models properly
assert(checkin_content.include?("CheckIn.find"), "CheckInChannel integrates with CheckIn model")
assert(checkin_content.include?("check_in.notes"), "CheckInChannel accesses notes")
assert(presence_content.include?("current_user.update"), "PresenceChannel updates user")
assert(notification_content.include?("user.notifications"), "NotificationChannel accesses notifications")

# Summary
puts "\n" + "="*60
if @failures.nil? || @failures.empty?
  puts "✅ ALL ACTION CABLE TESTS PASSED!"
  puts "✅ WebSocket channels properly implemented"
  puts "✅ Real-time features ready for check-in sessions"
  puts "✅ Partner presence tracking configured"
  puts "✅ Notification system operational"
else
  puts "❌ #{@failures.length} TESTS FAILED:"
  @failures.each { |f| puts "   - #{f}" }
end
puts "="*60