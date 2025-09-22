#!/usr/bin/env ruby

require 'minitest/autorun'
require 'json'

class TestNotificationChannel < Minitest::Test
  def setup
    @base_path = 'app/channels'
    @model_path = 'app/models'
    @service_path = 'app/services'
  end

  def test_01_notification_model_exists
    puts "\n--- Test 1: Notification Model ---"

    file_path = "#{@model_path}/notification.rb"
    assert File.exist?(file_path), "✗ Notification model should exist"
    puts "✓ Notification model exists"

    content = File.read(file_path)

    # Check for notification types
    assert content.include?('NOTIFICATION_TYPES'), "✗ Should define notification types"
    puts "✓ Defines notification types"

    types = [
      'check_in_reminder',
      'note_shared',
      'milestone_achieved',
      'action_item_assigned',
      'relationship_request'
    ]

    types.each do |type|
      assert content.include?(type), "✗ Should include #{type} type"
    end
    puts "✓ Includes all required notification types"

    # Check for priority levels
    assert content.include?('PRIORITIES'), "✗ Should define priority levels"
    puts "✓ Defines priority levels"

    assert content.include?('urgent'), "✗ Should have urgent priority"
    puts "✓ Has urgent priority level"
  end

  def test_02_notification_model_scopes
    puts "\n--- Test 2: Notification Model Scopes ---"

    file_path = "#{@model_path}/notification.rb"
    content = File.read(file_path)

    scopes = ['unread', 'read', 'recent', 'by_type', 'high_priority', 'active', 'today', 'this_week']

    scopes.each do |scope|
      assert content.match(/scope :#{scope}/), "✗ Should have #{scope} scope"
      puts "✓ Has #{scope} scope"
    end
  end

  def test_03_notification_channel_structure
    puts "\n--- Test 3: Enhanced NotificationChannel Structure ---"

    file_path = "#{@base_path}/notification_channel.rb"
    content = File.read(file_path)

    # Check for batching configuration
    assert content.include?('BATCH_SIZE'), "✗ Should define batch size"
    puts "✓ Defines batch size"

    assert content.include?('BATCH_DELAY'), "✗ Should define batch delay"
    puts "✓ Defines batch delay"

    # Check for priority stream
    assert content.include?('notifications_priority_'), "✗ Should have priority notification stream"
    puts "✓ Has priority notification stream"

    # Check for initialization
    assert content.include?('initialize_notification_tracking'), "✗ Should initialize tracking"
    puts "✓ Initializes notification tracking"
  end

  def test_04_batch_operations
    puts "\n--- Test 4: Batch Operations ---"

    file_path = "#{@base_path}/notification_channel.rb"
    content = File.read(file_path)

    # Check for batch methods
    assert content.include?('def batch_mark_read'), "✗ Should have batch mark read"
    puts "✓ Has batch mark read method"

    assert content.include?('notification_ids'), "✗ Should handle multiple notification IDs"
    puts "✓ Handles multiple notification IDs"

    assert content.include?('batch_marked_read'), "✗ Should broadcast batch updates"
    puts "✓ Broadcasts batch updates"
  end

  def test_05_notification_history
    puts "\n--- Test 5: Notification History ---"

    file_path = "#{@base_path}/notification_channel.rb"
    content = File.read(file_path)

    # Check for history method
    assert content.include?('def request_history'), "✗ Should have request history method"
    puts "✓ Has request history method"

    # Check for pagination
    assert content.include?('page'), "✗ Should support pagination"
    puts "✓ Supports pagination"

    assert content.include?('per_page'), "✗ Should have per_page parameter"
    puts "✓ Has per_page parameter"

    # Check for filters
    assert content.include?("filter = data['filter']"), "✗ Should support filters"
    puts "✓ Supports filters"

    filters = ['unread', 'high_priority', 'today', 'this_week']
    filters.each do |filter|
      assert content.include?("when '#{filter}'"), "✗ Should support #{filter} filter"
    end
    puts "✓ Supports all required filters"
  end

  def test_06_notification_acknowledgment
    puts "\n--- Test 6: Notification Acknowledgment ---"

    file_path = "#{@base_path}/notification_channel.rb"
    content = File.read(file_path)

    # Check for acknowledgment
    assert content.include?('def acknowledge'), "✗ Should have acknowledge method"
    puts "✓ Has acknowledge method"

    assert content.include?('acknowledged: true'), "✗ Should set acknowledged flag"
    puts "✓ Sets acknowledged flag"

    assert content.include?('track_notification_metric'), "✗ Should track metrics"
    puts "✓ Tracks notification metrics"
  end

  def test_07_snooze_functionality
    puts "\n--- Test 7: Snooze Functionality ---"

    file_path = "#{@base_path}/notification_channel.rb"
    content = File.read(file_path)

    # Check for snooze method
    assert content.include?('def snooze_notification'), "✗ Should have snooze method"
    puts "✓ Has snooze method"

    assert content.include?('snooze_until'), "✗ Should calculate snooze until time"
    puts "✓ Calculates snooze until time"

    assert content.include?('NotificationReminderJob'), "✗ Should schedule reminder job"
    puts "✓ Schedules reminder job"

    assert content.include?('notification_snoozed'), "✗ Should broadcast snooze event"
    puts "✓ Broadcasts snooze event"
  end

  def test_08_broadcast_methods
    puts "\n--- Test 8: Enhanced Broadcast Methods ---"

    file_path = "#{@base_path}/notification_channel.rb"
    content = File.read(file_path)

    # Check for broadcast methods
    assert content.include?('def broadcast_new_notification'), "✗ Should have new notification broadcaster"
    puts "✓ Has new notification broadcaster"

    assert content.include?('def broadcast_notification_update'), "✗ Should have update broadcaster"
    puts "✓ Has update broadcaster"

    assert content.include?('def broadcast_unread_count_for'), "✗ Should have unread count broadcaster"
    puts "✓ Has unread count broadcaster"

    # Check for priority handling
    assert content.include?('if notification.high_priority?'), "✗ Should check notification priority"
    puts "✓ Checks notification priority"

    assert content.include?('priority_count'), "✗ Should track priority count"
    puts "✓ Tracks priority count"
  end

  def test_09_notification_types
    puts "\n--- Test 9: Notification Type Handlers ---"

    file_path = "#{@base_path}/notification_channel.rb"
    content = File.read(file_path)

    # Check for specific notification type handlers
    handlers = [
      'notify_relationship_request',
      'notify_reminder_due',
      'notify_weekly_summary'
    ]

    handlers.each do |handler|
      assert content.include?("def #{handler}"), "✗ Should have #{handler} method"
      puts "✓ Has #{handler} method"
    end
  end

  def test_10_notification_service_exists
    puts "\n--- Test 10: Notification Service ---"

    file_path = "#{@service_path}/notification_service.rb"
    assert File.exist?(file_path), "✗ NotificationService file should exist"
    puts "✓ NotificationService file exists"

    content = File.read(file_path)

    # Check for singleton pattern
    assert content.include?('include Singleton'), "✗ Should use Singleton pattern"
    puts "✓ Uses Singleton pattern"

    # Check for delivery strategies
    assert content.include?('DELIVERY_STRATEGIES'), "✗ Should define delivery strategies"
    puts "✓ Defines delivery strategies"

    strategies = ['immediate', 'batched', 'scheduled']
    strategies.each do |strategy|
      assert content.include?(strategy), "✗ Should have #{strategy} strategy"
    end
    puts "✓ Has all delivery strategies"
  end

  def test_11_notification_service_methods
    puts "\n--- Test 11: Notification Service Methods ---"

    file_path = "#{@service_path}/notification_service.rb"
    content = File.read(file_path)

    methods = [
      'send_notification',
      'send_bulk_notifications',
      'process_batch',
      'retry_failed_notification',
      'cleanup_old_notifications',
      'get_user_stats',
      'get_delivery_metrics'
    ]

    methods.each do |method|
      assert content.include?("def #{method}"), "✗ Should have #{method} method"
      puts "✓ Has #{method} method"
    end
  end

  def test_12_retry_mechanism
    puts "\n--- Test 12: Retry Mechanism ---"

    file_path = "#{@service_path}/notification_service.rb"
    content = File.read(file_path)

    # Check for retry configuration
    assert content.include?('MAX_RETRIES'), "✗ Should define max retries"
    puts "✓ Defines max retries"

    assert content.include?('RETRY_DELAYS'), "✗ Should define retry delays"
    puts "✓ Defines retry delays"

    # Check for retry logic
    assert content.include?('retry_failed_notification'), "✗ Should have retry method"
    puts "✓ Has retry method"

    assert content.include?('NotificationRetryJob'), "✗ Should use retry job"
    puts "✓ Uses retry job"
  end

  def test_13_delivery_metrics
    puts "\n--- Test 13: Delivery Metrics ---"

    file_path = "#{@service_path}/notification_service.rb"
    content = File.read(file_path)

    # Check for metrics tracking
    assert content.include?('@delivery_metrics'), "✗ Should track delivery metrics"
    puts "✓ Tracks delivery metrics"

    assert content.include?('track_delivery_metric'), "✗ Should have metric tracking method"
    puts "✓ Has metric tracking method"

    # Check for metric types
    metrics = ['sent', 'delivered', 'failed', 'bulk_sent']
    metrics.each do |metric|
      assert content.include?(":#{metric}"), "✗ Should track #{metric} metric"
    end
    puts "✓ Tracks all required metrics"
  end

  def test_14_notification_preferences
    puts "\n--- Test 14: Notification Preferences ---"

    file_path = "#{@service_path}/notification_service.rb"
    content = File.read(file_path)

    # Check for preference handling
    assert content.include?('user_has_disabled_notification?'), "✗ Should check user preferences"
    puts "✓ Checks user preferences"

    assert content.include?('notification_preferences'), "✗ Should access notification preferences"
    puts "✓ Accesses notification preferences"

    # Check for delivery conditions
    assert content.include?('should_send_push?'), "✗ Should check push conditions"
    puts "✓ Checks push notification conditions"

    assert content.include?('should_send_email?'), "✗ Should check email conditions"
    puts "✓ Checks email notification conditions"
  end

  def test_15_sync_and_cleanup
    puts "\n--- Test 15: Sync and Cleanup ---"

    file_path = "#{@base_path}/notification_channel.rb"
    content = File.read(file_path)

    # Check for sync functionality
    assert content.include?('def sync_notifications'), "✗ Should have sync method"
    puts "✓ Has sync notifications method"

    assert content.include?('missed_notifications'), "✗ Should check for missed notifications"
    puts "✓ Checks for missed notifications"

    # Check for cleanup
    assert content.include?('cleanup_notification_tracking'), "✗ Should have cleanup method"
    puts "✓ Has cleanup method"

    service_content = File.read("#{@service_path}/notification_service.rb")
    assert service_content.include?('cleanup_old_notifications'), "✗ Service should cleanup old notifications"
    puts "✓ Service cleans up old notifications"

    assert service_content.include?('archive_important_notifications'), "✗ Should archive important notifications"
    puts "✓ Archives important notifications"
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
  puts "Testing Notification Channel Implementation"
  puts "=" * 60

  # Run tests
  result = Minitest.run(ARGV)

  exit(result ? 0 : 1)
end