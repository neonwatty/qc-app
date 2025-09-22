#!/usr/bin/env ruby

require 'minitest/autorun'
require 'json'

class TestReminderProcessing < Minitest::Test
  def setup
    @jobs_path = 'app/jobs'
    @config_path = 'config'
  end

  def test_01_reminder_processor_job_exists
    puts "\n--- Test 1: ReminderProcessorJob ---"

    file_path = "#{@jobs_path}/reminder_processor_job.rb"
    assert File.exist?(file_path), "✗ ReminderProcessorJob should exist"
    puts "✓ ReminderProcessorJob exists"

    content = File.read(file_path)

    # Check for queue configuration
    assert content.include?('queue_as :reminders'), "✗ Should use reminders queue"
    puts "✓ Uses reminders queue"

    assert content.include?('queue_with_priority'), "✗ Should set queue priority"
    puts "✓ Sets queue priority"

    # Check for retry configuration
    assert content.include?('retry_on ActiveRecord::RecordNotFound'), "✗ Should retry on RecordNotFound"
    puts "✓ Retries on RecordNotFound"

    assert content.include?('retry_on ActiveRecord::ConnectionTimeoutError'), "✗ Should retry on ConnectionTimeout"
    puts "✓ Retries on ConnectionTimeout"

    assert content.include?('discard_on ActiveJob::DeserializationError'), "✗ Should discard on DeserializationError"
    puts "✓ Discards on DeserializationError"
  end

  def test_02_reminder_processing_methods
    puts "\n--- Test 2: Reminder Processing Methods ---"

    file_path = "#{@jobs_path}/reminder_processor_job.rb"
    content = File.read(file_path)

    processing_methods = [
      'process_all_reminders',
      'process_urgent_reminders',
      'process_scheduled_reminders',
      'process_recurring_reminders',
      'process_custom_reminders',
      'process_specific_reminder'
    ]

    processing_methods.each do |method|
      assert content.include?("def #{method}"), "✗ Should have #{method} method"
      puts "✓ Has #{method} method"
    end
  end

  def test_03_scheduling_logic
    puts "\n--- Test 3: Scheduling Logic ---"

    file_path = "#{@jobs_path}/reminder_processor_job.rb"
    content = File.read(file_path)

    # Check for scheduling methods
    assert content.include?('calculate_optimal_delivery_time'), "✗ Should calculate optimal delivery time"
    puts "✓ Calculates optimal delivery time"

    assert content.include?('calculate_next_occurrence'), "✗ Should calculate next occurrence"
    puts "✓ Calculates next occurrence"

    assert content.include?('should_process_recurring?'), "✗ Should check if recurring should process"
    puts "✓ Checks if recurring should process"

    assert content.include?('time_to_trigger?'), "✗ Should check if time to trigger"
    puts "✓ Checks if time to trigger"

    assert content.include?('update_next_occurrence'), "✗ Should update next occurrence"
    puts "✓ Updates next occurrence"
  end

  def test_04_custom_scheduling_support
    puts "\n--- Test 4: Custom Scheduling Support ---"

    file_path = "#{@jobs_path}/reminder_processor_job.rb"
    content = File.read(file_path)

    # Check for custom schedule handling
    assert content.include?('calculate_weekly_occurrence'), "✗ Should handle weekly occurrences"
    puts "✓ Handles weekly occurrences"

    assert content.include?('calculate_monthly_occurrence'), "✗ Should handle monthly occurrences"
    puts "✓ Handles monthly occurrences"

    assert content.include?('calculate_custom_occurrence'), "✗ Should handle custom occurrences"
    puts "✓ Handles custom occurrences"

    assert content.include?('parse_custom_rules'), "✗ Should parse custom rules"
    puts "✓ Parses custom rules"

    assert content.include?('evaluate_custom_conditions'), "✗ Should evaluate custom conditions"
    puts "✓ Evaluates custom conditions"
  end

  def test_05_job_callbacks
    puts "\n--- Test 5: Job Callbacks ---"

    file_path = "#{@jobs_path}/reminder_processor_job.rb"
    content = File.read(file_path)

    # Check for job callbacks
    assert content.include?('before_perform :log_job_start'), "✗ Should have before_perform callback"
    puts "✓ Has before_perform callback"

    assert content.include?('after_perform :log_job_completion'), "✗ Should have after_perform callback"
    puts "✓ Has after_perform callback"

    assert content.include?('around_perform :track_performance'), "✗ Should have around_perform callback"
    puts "✓ Has around_perform callback"
  end

  def test_06_enhanced_notification_delivery
    puts "\n--- Test 6: Enhanced NotificationDeliveryJob ---"

    file_path = "#{@jobs_path}/notification_delivery_job.rb"
    content = File.read(file_path)

    # Check for enhanced retry configuration
    assert content.include?('retry_on Net::OpenTimeout'), "✗ Should retry on network timeouts"
    puts "✓ Retries on network timeouts"

    assert content.include?('rescue_from(StandardError)'), "✗ Should have custom error handling"
    puts "✓ Has custom error handling"

    # Check for delivery callbacks
    assert content.include?('before_perform :validate_notification'), "✗ Should validate before delivery"
    puts "✓ Validates before delivery"

    assert content.include?('after_perform :update_delivery_metrics'), "✗ Should update metrics after delivery"
    puts "✓ Updates metrics after delivery"

    assert content.include?('around_perform :monitor_performance'), "✗ Should monitor performance"
    puts "✓ Monitors performance"
  end

  def test_07_multi_channel_delivery
    puts "\n--- Test 7: Multi-Channel Delivery ---"

    file_path = "#{@jobs_path}/notification_delivery_job.rb"
    content = File.read(file_path)

    channels = ['websocket', 'push', 'email', 'sms']

    channels.each do |channel|
      assert content.include?("deliver_via_#{channel}"), "✗ Should deliver via #{channel}"
      puts "✓ Delivers via #{channel}"
    end

    # Check for channel verification
    assert content.include?('verify_delivery_success'), "✗ Should verify delivery success"
    puts "✓ Verifies delivery success"

    assert content.include?('@delivery_results'), "✗ Should track delivery results"
    puts "✓ Tracks delivery results"
  end

  def test_08_retry_logic
    puts "\n--- Test 8: Advanced Retry Logic ---"

    file_path = "#{@jobs_path}/notification_delivery_job.rb"
    content = File.read(file_path)

    # Check for retry methods
    assert content.include?('should_retry_delivery?'), "✗ Should determine if retry needed"
    puts "✓ Determines if retry needed"

    assert content.include?('retry_with_backoff'), "✗ Should retry with backoff"
    puts "✓ Retries with backoff"

    assert content.include?('calculate_backoff_time'), "✗ Should calculate backoff time"
    puts "✓ Calculates backoff time"

    assert content.include?('permanent_failure?'), "✗ Should identify permanent failures"
    puts "✓ Identifies permanent failures"

    assert content.include?('handle_permanent_failure'), "✗ Should handle permanent failures"
    puts "✓ Handles permanent failures"
  end

  def test_09_recurring_configuration
    puts "\n--- Test 9: Recurring Job Configuration ---"

    file_path = "#{@config_path}/recurring.yml"
    assert File.exist?(file_path), "✗ recurring.yml should exist"
    puts "✓ recurring.yml exists"

    content = File.read(file_path)

    # Check for reminder processing jobs
    assert content.include?('process_scheduled_reminders:'), "✗ Should configure scheduled reminders"
    puts "✓ Configures scheduled reminders"

    assert content.include?('process_urgent_reminders:'), "✗ Should configure urgent reminders"
    puts "✓ Configures urgent reminders"

    assert content.include?('process_recurring_reminders:'), "✗ Should configure recurring reminders"
    puts "✓ Configures recurring reminders"

    # Check for schedules
    assert content.include?('schedule: every 5 minutes'), "✗ Should have 5-minute schedule"
    puts "✓ Has 5-minute schedule"

    assert content.include?('schedule: every minute'), "✗ Should have 1-minute schedule"
    puts "✓ Has 1-minute schedule"

    assert content.include?('schedule: every 15 minutes'), "✗ Should have 15-minute schedule"
    puts "✓ Has 15-minute schedule"
  end

  def test_10_environment_specific_config
    puts "\n--- Test 10: Environment-Specific Configuration ---"

    file_path = "#{@config_path}/recurring.yml"
    content = File.read(file_path)

    # Check for environment configurations
    assert content.include?('development:'), "✗ Should have development config"
    puts "✓ Has development config"

    assert content.include?('test:'), "✗ Should have test config"
    puts "✓ Has test config"

    assert content.include?('production:'), "✗ Should have production config"
    puts "✓ Has production config"

    # Check for production-only jobs
    assert content.include?('health_check:'), "✗ Should have health check in production"
    puts "✓ Has health check in production"

    assert content.include?('backup_data:'), "✗ Should have backup job in production"
    puts "✓ Has backup job in production"
  end

  def test_11_priority_handling
    puts "\n--- Test 11: Priority Handling ---"

    file_path = "#{@jobs_path}/reminder_processor_job.rb"
    content = File.read(file_path)

    # Check for priority determination
    assert content.include?('determine_priority'), "✗ Should determine priority"
    puts "✓ Determines priority"

    assert content.include?('process_reminder_with_priority'), "✗ Should process with priority"
    puts "✓ Processes with priority"

    # Check for urgent queue usage
    assert content.include?("queue: :urgent"), "✗ Should use urgent queue for high priority"
    puts "✓ Uses urgent queue for high priority"
  end

  def test_12_performance_tracking
    puts "\n--- Test 12: Performance Tracking ---"

    file_path = "#{@jobs_path}/reminder_processor_job.rb"
    content = File.read(file_path)

    # Check for performance tracking
    assert content.include?('track_performance'), "✗ Should track performance"
    puts "✓ Tracks performance"

    assert content.include?('JobMetric'), "✗ Should use JobMetric for tracking"
    puts "✓ Uses JobMetric for tracking"

    assert content.include?('duration = Time.current - start_time'), "✗ Should calculate duration"
    puts "✓ Calculates job duration"

    # Check notification delivery performance
    delivery_content = File.read("#{@jobs_path}/notification_delivery_job.rb")
    assert delivery_content.include?('monitor_performance'), "✗ Delivery should monitor performance"
    puts "✓ Delivery monitors performance"

    assert delivery_content.include?('Slow notification delivery'), "✗ Should track slow deliveries"
    puts "✓ Tracks slow deliveries"
  end

  def test_13_failure_handling
    puts "\n--- Test 13: Failure Handling ---"

    file_path = "#{@jobs_path}/notification_delivery_job.rb"
    content = File.read(file_path)

    # Check for failure handling
    assert content.include?('handle_delivery_failure'), "✗ Should handle delivery failures"
    puts "✓ Handles delivery failures"

    assert content.include?('DeliveryFailureError'), "✗ Should define custom error class"
    puts "✓ Defines custom error class"

    assert content.include?('AdminAlertJob'), "✗ Should alert admins on critical failures"
    puts "✓ Alerts admins on critical failures"

    # Check for metadata tracking
    assert content.include?("metadata['delivery_attempts']"), "✗ Should track delivery attempts"
    puts "✓ Tracks delivery attempts"

    assert content.include?("metadata['failed_channels']"), "✗ Should track failed channels"
    puts "✓ Tracks failed channels"
  end

  def test_14_validation_and_guards
    puts "\n--- Test 14: Validation and Guards ---"

    file_path = "#{@jobs_path}/notification_delivery_job.rb"
    content = File.read(file_path)

    # Check for validation
    assert content.include?('validate_notification'), "✗ Should validate notification"
    puts "✓ Validates notification"

    assert content.include?('@notification.valid?'), "✗ Should check notification validity"
    puts "✓ Checks notification validity"

    # Check for expired notification handling
    assert content.include?('handle_expired_notification'), "✗ Should handle expired notifications"
    puts "✓ Handles expired notifications"

    assert content.include?('handle_disabled_notification'), "✗ Should handle disabled notifications"
    puts "✓ Handles disabled notifications"
  end

  def test_15_metrics_and_monitoring
    puts "\n--- Test 15: Metrics and Monitoring ---"

    file_path = "#{@jobs_path}/notification_delivery_job.rb"
    content = File.read(file_path)

    # Check for metrics
    assert content.include?('update_delivery_metrics'), "✗ Should update delivery metrics"
    puts "✓ Updates delivery metrics"

    assert content.include?('DeliveryMetric'), "✗ Should use DeliveryMetric model"
    puts "✓ Uses DeliveryMetric model"

    # Check for logging
    assert content.include?('log_info'), "✗ Should log info messages"
    puts "✓ Logs info messages"

    assert content.include?('log_error'), "✗ Should log error messages"
    puts "✓ Logs error messages"

    assert content.include?('log_warn'), "✗ Should log warning messages"
    puts "✓ Logs warning messages"
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
  puts "Testing Reminder Processing Jobs Implementation"
  puts "=" * 60

  # Run tests
  result = Minitest.run(ARGV)

  exit(result ? 0 : 1)
end