#!/usr/bin/env ruby

require 'minitest/autorun'
require 'json'

class TestPresenceTypingIndicators < Minitest::Test
  def setup
    @base_path = 'app/channels'
    @service_path = 'app/services'
  end

  def test_01_enhanced_presence_channel_structure
    puts "\n--- Test 1: Enhanced PresenceChannel Structure ---"

    file_path = "#{@base_path}/presence_channel.rb"
    assert File.exist?(file_path), "✗ PresenceChannel file should exist"
    puts "✓ PresenceChannel file exists"

    content = File.read(file_path)

    # Check for typing debounce constants
    assert content.include?('TYPING_DEBOUNCE_SECONDS'), "✗ Should define typing debounce constant"
    puts "✓ Has typing debounce constant"

    assert content.include?('IDLE_TIMEOUT_SECONDS'), "✗ Should define idle timeout constant"
    puts "✓ Has idle timeout constant"

    assert content.include?('STEPPED_AWAY_TIMEOUT_SECONDS'), "✗ Should define stepped away timeout"
    puts "✓ Has stepped away timeout constant"

    # Check for initialization methods
    assert content.include?('def initialize_presence_tracking'), "✗ Should have presence tracking initializer"
    puts "✓ Has presence tracking initializer"
  end

  def test_02_typing_indicator_enhancements
    puts "\n--- Test 2: Typing Indicator Enhancements ---"

    file_path = "#{@base_path}/presence_channel.rb"
    content = File.read(file_path)

    # Check for debounced typing methods
    assert content.include?('def handle_typing_start'), "✗ Should have typing start handler"
    puts "✓ Has typing start handler"

    assert content.include?('def handle_typing_stop'), "✗ Should have typing stop handler"
    puts "✓ Has typing stop handler"

    assert content.include?('def reset_typing_timer'), "✗ Should have typing timer reset"
    puts "✓ Has typing timer reset"

    assert content.include?('def clear_typing_timers'), "✗ Should have timer cleanup"
    puts "✓ Has typing timer cleanup"

    # Check for enhanced typing with preview
    assert content.include?('def typing_with_preview'), "✗ Should have typing with preview method"
    puts "✓ Has typing with preview"

    assert content.include?('preview_text'), "✗ Should handle preview text"
    puts "✓ Handles preview text"

    assert content.include?('character_count'), "✗ Should track character count"
    puts "✓ Tracks character count"
  end

  def test_03_idle_detection_features
    puts "\n--- Test 3: Idle Detection Features ---"

    file_path = "#{@base_path}/presence_channel.rb"
    content = File.read(file_path)

    # Check for idle detection methods
    assert content.include?('def schedule_idle_check'), "✗ Should schedule idle checks"
    puts "✓ Schedules idle checks"

    assert content.include?('def check_idle_status'), "✗ Should check idle status"
    puts "✓ Checks idle status"

    assert content.include?('def reset_idle_timer'), "✗ Should reset idle timer"
    puts "✓ Resets idle timer"

    assert content.include?('def calculate_idle_time'), "✗ Should calculate idle time"
    puts "✓ Calculates idle time"

    # Check for stepped away functionality
    assert content.include?('def stepped_away'), "✗ Should have stepped away method"
    puts "✓ Has stepped away method"

    assert content.include?('reason'), "✗ Should track stepped away reason"
    puts "✓ Tracks stepped away reason"

    assert content.include?('expected_return'), "✗ Should handle expected return time"
    puts "✓ Handles expected return time"
  end

  def test_04_user_activity_tracking
    puts "\n--- Test 4: User Activity Tracking ---"

    file_path = "#{@base_path}/presence_channel.rb"
    content = File.read(file_path)

    # Check for activity tracking
    assert content.include?('def user_active'), "✗ Should have user active method"
    puts "✓ Has user active method"

    assert content.include?('@last_activity_at'), "✗ Should track last activity time"
    puts "✓ Tracks last activity time"

    # Check for auto-recovery from away status
    assert content.match(/if current_user\.online_status != ['"]online['"]/), "✗ Should check if user was away"
    puts "✓ Checks if user was away"

    assert content.include?("appear"), "✗ Should auto-recover to online status"
    puts "✓ Auto-recovers to online status"
  end

  def test_05_enhanced_heartbeat
    puts "\n--- Test 5: Enhanced Heartbeat Functionality ---"

    file_path = "#{@base_path}/presence_channel.rb"
    content = File.read(file_path)

    # Check for enhanced heartbeat
    assert content.include?('def calculate_connection_quality'), "✗ Should calculate connection quality"
    puts "✓ Calculates connection quality"

    assert content.include?('connection_quality'), "✗ Should include connection quality in heartbeat"
    puts "✓ Includes connection quality in heartbeat"

    assert content.include?('idle_time'), "✗ Should include idle time in heartbeat"
    puts "✓ Includes idle time in heartbeat"

    # Check for auto-return from away
    assert content.match(/if current_user\.online_status == ['"]away['"]/), "✗ Should check away status in heartbeat"
    puts "✓ Checks away status in heartbeat"
  end

  def test_06_presence_service_exists
    puts "\n--- Test 6: Presence Service ---"

    file_path = "#{@service_path}/presence_service.rb"
    assert File.exist?(file_path), "✗ PresenceService file should exist"
    puts "✓ PresenceService file exists"

    content = File.read(file_path)

    # Check for singleton pattern
    assert content.include?('include Singleton'), "✗ Should use Singleton pattern"
    puts "✓ Uses Singleton pattern"

    # Check for status constants
    assert content.include?("ONLINE = 'online'"), "✗ Should define ONLINE constant"
    puts "✓ Defines ONLINE constant"

    assert content.include?("STEPPED_AWAY = 'stepped_away'"), "✗ Should define STEPPED_AWAY constant"
    puts "✓ Defines STEPPED_AWAY constant"
  end

  def test_07_presence_service_methods
    puts "\n--- Test 7: Presence Service Methods ---"

    file_path = "#{@service_path}/presence_service.rb"
    content = File.read(file_path)

    # Check for core methods
    methods = [
      'track_user_online',
      'track_user_offline',
      'track_user_activity',
      'track_typing',
      'stop_typing',
      'get_user_presence',
      'get_couple_presence',
      'check_idle_users'
    ]

    methods.each do |method|
      assert content.include?("def #{method}"), "✗ Should have #{method} method"
      puts "✓ Has #{method} method"
    end
  end

  def test_08_typing_cache_management
    puts "\n--- Test 8: Typing Cache Management ---"

    file_path = "#{@service_path}/presence_service.rb"
    content = File.read(file_path)

    # Check for typing cache
    assert content.include?('@typing_cache'), "✗ Should have typing cache"
    puts "✓ Has typing cache"

    assert content.include?('def typing_key'), "✗ Should generate typing keys"
    puts "✓ Generates typing keys"

    assert content.include?('schedule_typing_timeout'), "✗ Should schedule typing timeouts"
    puts "✓ Schedules typing timeouts"

    assert content.include?('broadcast_typing_indicator'), "✗ Should broadcast typing indicators"
    puts "✓ Broadcasts typing indicators"
  end

  def test_09_redis_integration
    puts "\n--- Test 9: Redis Integration ---"

    file_path = "#{@service_path}/presence_service.rb"
    content = File.read(file_path)

    # Check for Redis methods
    assert content.include?('def track_in_redis'), "✗ Should track in Redis"
    puts "✓ Tracks presence in Redis"

    assert content.include?('def get_from_redis'), "✗ Should get from Redis"
    puts "✓ Gets presence from Redis"

    assert content.include?('def remove_from_redis'), "✗ Should remove from Redis"
    puts "✓ Removes from Redis"

    assert content.include?('def redis_available?'), "✗ Should check Redis availability"
    puts "✓ Checks Redis availability"

    assert content.include?('expires_in:'), "✗ Should set expiry for Redis keys"
    puts "✓ Sets expiry for Redis keys"
  end

  def test_10_broadcast_patterns
    puts "\n--- Test 10: Broadcast Patterns ---"

    file_path = "#{@service_path}/presence_service.rb"
    content = File.read(file_path)

    # Check for broadcast methods
    assert content.include?('def broadcast_presence_change'), "✗ Should have presence change broadcaster"
    puts "✓ Has presence change broadcaster"

    assert content.include?('def broadcast_to_couple'), "✗ Should broadcast to couple"
    puts "✓ Broadcasts to couple"

    # Check for proper channel patterns
    assert content.include?('"presence_user_#{'), "✗ Should use user presence channel"
    puts "✓ Uses user presence channel"

    assert content.include?('"presence_couple_#{'), "✗ Should use couple presence channel"
    puts "✓ Uses couple presence channel"
  end

  def test_11_idle_user_management
    puts "\n--- Test 11: Idle User Management ---"

    file_path = "#{@service_path}/presence_service.rb"
    content = File.read(file_path)

    # Check for idle management
    assert content.include?('def mark_user_away'), "✗ Should mark users as away"
    puts "✓ Marks users as away"

    assert content.include?('def mark_user_stepped_away'), "✗ Should mark users as stepped away"
    puts "✓ Marks users as stepped away"

    assert content.include?('IDLE_TIMEOUT'), "✗ Should define idle timeout"
    puts "✓ Defines idle timeout"

    assert content.include?('STEPPED_AWAY_TIMEOUT'), "✗ Should define stepped away timeout"
    puts "✓ Defines stepped away timeout"
  end

  def test_12_typing_with_context
    puts "\n--- Test 12: Contextual Typing Indicators ---"

    file_path = "#{@base_path}/presence_channel.rb"
    content = File.read(file_path)

    # Check for context handling
    assert content.include?("context = data['context']"), "✗ Should extract typing context"
    puts "✓ Extracts typing context"

    assert content.include?("context_id = data['context_id']"), "✗ Should extract context ID"
    puts "✓ Extracts context ID"

    # Check context is used in broadcasts
    assert content.match(/context:.*context/), "✗ Should include context in broadcasts"
    puts "✓ Includes context in broadcasts"
  end

  def test_13_connection_lifecycle
    puts "\n--- Test 13: Connection Lifecycle Management ---"

    file_path = "#{@base_path}/presence_channel.rb"
    content = File.read(file_path)

    # Check for proper cleanup
    assert content.include?('def unsubscribed'), "✗ Should have unsubscribed handler"
    puts "✓ Has unsubscribed handler"

    assert content.include?('clear_typing_timers'), "✗ Should clear typing timers on disconnect"
    puts "✓ Clears typing timers on disconnect"

    assert content.include?('clear_idle_timers'), "✗ Should clear idle timers on disconnect"
    puts "✓ Clears idle timers on disconnect"

    assert content.include?('disappear'), "✗ Should call disappear on disconnect"
    puts "✓ Calls disappear on disconnect"
  end

  def test_14_partner_notifications
    puts "\n--- Test 14: Partner Notifications ---"

    file_path = "#{@base_path}/presence_channel.rb"
    content = File.read(file_path)

    # Check for partner events
    assert content.include?("'partner_stepped_away'"), "✗ Should notify partner stepped away"
    puts "✓ Notifies partner stepped away"

    assert content.include?("'partner_presence_changed'"), "✗ Should notify presence changes"
    puts "✓ Notifies presence changes"

    assert content.include?("'partner_heartbeat'"), "✗ Should send partner heartbeats"
    puts "✓ Sends partner heartbeats"
  end

  def test_15_presence_service_integration
    puts "\n--- Test 15: PresenceService Integration ---"

    file_path = "#{@base_path}/presence_channel.rb"
    content = File.read(file_path)

    # Check for service usage
    assert content.include?('PresenceService.track_user_online'), "✗ Should use PresenceService for online tracking"
    puts "✓ Uses PresenceService for online tracking"

    assert content.include?('PresenceService.track_user_offline'), "✗ Should use PresenceService for offline tracking"
    puts "✓ Uses PresenceService for offline tracking"
  end

  def run_summary
    puts "\n" + "=" * 60
    if failures.empty?
      puts "✅ ALL TESTS PASSED!"
    else
      puts "❌ #{failures.size} TESTS FAILED:"
      failures.each do |failure|
        puts "   - #{failure}"
      end
    end
    puts "=" * 60
  end
end

# Run the tests
if __FILE__ == $0
  # Change to Rails app directory if needed
  Dir.chdir('/Users/jeremywatt/Desktop/qc-app/qc-api') if Dir.exist?('/Users/jeremywatt/Desktop/qc-app/qc-api')

  puts "=" * 60
  puts "Testing Enhanced Presence and Typing Indicators"
  puts "=" * 60

  # Run tests
  result = Minitest.run(ARGV)

  exit(result ? 0 : 1)
end