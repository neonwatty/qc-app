#!/usr/bin/env ruby

require 'minitest/autorun'
require 'json'

class TestBackgroundJobs < Minitest::Test
  def setup
    @jobs_path = 'app/jobs'
    @config_path = 'config'
  end

  def test_01_application_job_configuration
    puts "\n--- Test 1: ApplicationJob Configuration ---"

    file_path = "#{@jobs_path}/application_job.rb"
    assert File.exist?(file_path), "✗ ApplicationJob should exist"
    puts "✓ ApplicationJob exists"

    content = File.read(file_path)

    # Check for Sidekiq configuration
    assert content.include?('queue_as :default'), "✗ Should set default queue"
    puts "✓ Sets default queue"

    assert content.include?('retry_on ActiveRecord::Deadlocked'), "✗ Should retry on deadlock"
    puts "✓ Retries on deadlock"

    assert content.include?('sidekiq_options'), "✗ Should configure Sidekiq options"
    puts "✓ Configures Sidekiq options"

    # Check for logging helpers
    assert content.include?('def log_info'), "✗ Should have log_info helper"
    puts "✓ Has log_info helper"

    assert content.include?('def log_error'), "✗ Should have log_error helper"
    puts "✓ Has log_error helper"

    # Check for performance tracking
    assert content.include?('around_perform'), "✗ Should track job performance"
    puts "✓ Tracks job performance"
  end

  def test_02_notification_delivery_jobs
    puts "\n--- Test 2: Notification Delivery Jobs ---"

    # Check NotificationDeliveryJob
    file_path = "#{@jobs_path}/notification_delivery_job.rb"
    assert File.exist?(file_path), "✗ NotificationDeliveryJob should exist"
    puts "✓ NotificationDeliveryJob exists"

    content = File.read(file_path)

    assert content.include?('queue_as :notifications'), "✗ Should use notifications queue"
    puts "✓ Uses notifications queue"

    assert content.include?('def perform(notification_id)'), "✗ Should accept notification_id"
    puts "✓ Accepts notification_id parameter"

    assert content.include?('deliver_via_websocket'), "✗ Should deliver via websocket"
    puts "✓ Delivers via websocket"

    assert content.include?('deliver_via_push'), "✗ Should support push notifications"
    puts "✓ Supports push notifications"

    assert content.include?('deliver_via_email'), "✗ Should support email notifications"
    puts "✓ Supports email notifications"

    # Check NotificationRetryJob
    retry_file = "#{@jobs_path}/notification_retry_job.rb"
    assert File.exist?(retry_file), "✗ NotificationRetryJob should exist"
    puts "✓ NotificationRetryJob exists"

    retry_content = File.read(retry_file)

    assert retry_content.include?('MAX_RETRIES'), "✗ Should define max retries"
    puts "✓ Defines max retries"

    assert retry_content.include?('RETRY_DELAYS'), "✗ Should define retry delays"
    puts "✓ Defines retry delays"
  end

  def test_03_reminder_jobs
    puts "\n--- Test 3: Reminder Jobs ---"

    # Check ReminderDeliveryJob
    file_path = "#{@jobs_path}/reminder_delivery_job.rb"
    assert File.exist?(file_path), "✗ ReminderDeliveryJob should exist"
    puts "✓ ReminderDeliveryJob exists"

    content = File.read(file_path)

    assert content.include?('queue_as :reminders'), "✗ Should use reminders queue"
    puts "✓ Uses reminders queue"

    assert content.include?('should_deliver_now?'), "✗ Should check delivery timing"
    puts "✓ Checks delivery timing"

    assert content.include?('schedule_next_occurrence'), "✗ Should handle recurring reminders"
    puts "✓ Handles recurring reminders"

    # Check CheckInReminderJob
    checkin_file = "#{@jobs_path}/check_in_reminder_job.rb"
    assert File.exist?(checkin_file), "✗ CheckInReminderJob should exist"
    puts "✓ CheckInReminderJob exists"

    checkin_content = File.read(checkin_file)

    assert checkin_content.include?('should_send_reminder?'), "✗ Should check if reminder needed"
    puts "✓ Checks if reminder needed"

    assert checkin_content.include?('determine_reminder_type'), "✗ Should determine reminder type"
    puts "✓ Determines reminder type"
  end

  def test_04_data_processing_jobs
    puts "\n--- Test 4: Data Processing Jobs ---"

    # Check MilestoneCalculationJob
    file_path = "#{@jobs_path}/milestone_calculation_job.rb"
    assert File.exist?(file_path), "✗ MilestoneCalculationJob should exist"
    puts "✓ MilestoneCalculationJob exists"

    content = File.read(file_path)

    assert content.include?('queue_as :data_processing'), "✗ Should use data_processing queue"
    puts "✓ Uses data_processing queue"

    milestone_checks = [
      'check_check_in_milestones',
      'check_duration_milestones',
      'check_note_milestones',
      'check_action_item_milestones',
      'check_consistency_milestones'
    ]

    milestone_checks.each do |check|
      assert content.include?(check), "✗ Should have #{check}"
    end
    puts "✓ Has all milestone check methods"

    assert content.include?('calculate_check_in_streak'), "✗ Should calculate streaks"
    puts "✓ Calculates check-in streaks"
  end

  def test_05_maintenance_jobs
    puts "\n--- Test 5: Maintenance Jobs ---"

    # Check DataCleanupJob
    file_path = "#{@jobs_path}/data_cleanup_job.rb"
    assert File.exist?(file_path), "✗ DataCleanupJob should exist"
    puts "✓ DataCleanupJob exists"

    content = File.read(file_path)

    assert content.include?('queue_as :maintenance'), "✗ Should use maintenance queue"
    puts "✓ Uses maintenance queue"

    cleanup_methods = [
      'cleanup_old_notifications',
      'cleanup_abandoned_sessions',
      'cleanup_old_drafts',
      'cleanup_old_logs'
    ]

    cleanup_methods.each do |method|
      assert content.include?("def #{method}"), "✗ Should have #{method}"
    end
    puts "✓ Has all cleanup methods"

    assert content.include?('save_partial_session_data'), "✗ Should save partial data"
    puts "✓ Saves partial session data"
  end

  def test_06_weekly_summary_job
    puts "\n--- Test 6: Weekly Summary Job ---"

    file_path = "#{@jobs_path}/weekly_summary_job.rb"
    assert File.exist?(file_path), "✗ WeeklySummaryJob should exist"
    puts "✓ WeeklySummaryJob exists"

    content = File.read(file_path)

    assert content.include?('queue_as :reports'), "✗ Should use reports queue"
    puts "✓ Uses reports queue"

    assert content.include?('gather_weekly_stats'), "✗ Should gather statistics"
    puts "✓ Gathers weekly statistics"

    assert content.include?('gather_highlights'), "✗ Should gather highlights"
    puts "✓ Gathers weekly highlights"

    assert content.include?('gather_upcoming_items'), "✗ Should gather upcoming items"
    puts "✓ Gathers upcoming items"

    assert content.include?('calculate_connection_time'), "✗ Should calculate connection time"
    puts "✓ Calculates connection time"

    assert content.include?('calculate_current_streak'), "✗ Should calculate current streak"
    puts "✓ Calculates current streak"
  end

  def test_07_schedule_configuration
    puts "\n--- Test 7: Schedule Configuration ---"

    file_path = "#{@config_path}/schedule.rb"
    assert File.exist?(file_path), "✗ schedule.rb should exist"
    puts "✓ schedule.rb exists"

    content = File.read(file_path)

    # Check for job definitions
    assert content.include?('every 1.day'), "✗ Should have daily jobs"
    puts "✓ Has daily jobs"

    assert content.include?('every :monday'), "✗ Should have weekly jobs"
    puts "✓ Has weekly jobs"

    assert content.include?('every 1.hour'), "✗ Should have hourly jobs"
    puts "✓ Has hourly jobs"

    assert content.include?('every 30.minutes'), "✗ Should have 30-minute jobs"
    puts "✓ Has 30-minute jobs"

    # Check for specific scheduled jobs
    scheduled_jobs = [
      'CheckInReminderJob',
      'WeeklySummaryJob',
      'MilestoneCalculationJob',
      'DataCleanupJob'
    ]

    scheduled_jobs.each do |job|
      assert content.include?(job), "✗ Should schedule #{job}"
    end
    puts "✓ Schedules all required jobs"
  end

  def test_08_sidekiq_configuration
    puts "\n--- Test 8: Sidekiq Configuration ---"

    file_path = "#{@config_path}/sidekiq.yml"
    assert File.exist?(file_path), "✗ sidekiq.yml should exist"
    puts "✓ sidekiq.yml exists"

    content = File.read(file_path)

    # Check for queue definitions
    queues = ['urgent', 'default', 'notifications', 'reminders', 'data_processing', 'reports', 'maintenance']

    queues.each do |queue|
      assert content.include?(queue), "✗ Should define #{queue} queue"
    end
    puts "✓ Defines all required queues"

    # Check for environment-specific settings
    assert content.include?('development:'), "✗ Should have development settings"
    puts "✓ Has development settings"

    assert content.include?('test:'), "✗ Should have test settings"
    puts "✓ Has test settings"

    assert content.include?('production:'), "✗ Should have production settings"
    puts "✓ Has production settings"

    # Check for Redis configuration
    assert content.include?(':redis:'), "✗ Should configure Redis"
    puts "✓ Configures Redis"

    assert content.include?('REDIS_URL'), "✗ Should use REDIS_URL environment variable"
    puts "✓ Uses REDIS_URL environment variable"
  end

  def test_09_job_error_handling
    puts "\n--- Test 9: Job Error Handling ---"

    file_path = "#{@jobs_path}/notification_delivery_job.rb"
    content = File.read(file_path)

    # Check for error handling
    assert content.include?('handle_delivery_failure'), "✗ Should handle delivery failures"
    puts "✓ Handles delivery failures"

    assert content.include?('handle_expired_notification'), "✗ Should handle expired notifications"
    puts "✓ Handles expired notifications"

    assert content.include?('rescue StandardError'), "✗ Should rescue standard errors"
    puts "✓ Rescues standard errors"

    # Check retry job error handling
    retry_content = File.read("#{@jobs_path}/notification_retry_job.rb")

    assert retry_content.include?('handle_max_retries_exceeded'), "✗ Should handle max retries exceeded"
    puts "✓ Handles max retries exceeded"
  end

  def test_10_job_performance_tracking
    puts "\n--- Test 10: Job Performance Tracking ---"

    file_path = "#{@jobs_path}/application_job.rb"
    content = File.read(file_path)

    # Check for performance metrics
    assert content.include?('started_at = Time.current'), "✗ Should track start time"
    puts "✓ Tracks start time"

    assert content.include?('duration = Time.current - started_at'), "✗ Should calculate duration"
    puts "✓ Calculates job duration"

    assert content.include?('log_info "Completed in'), "✗ Should log completion time"
    puts "✓ Logs completion time"

    assert content.include?('log_error "Failed after'), "✗ Should log failure time"
    puts "✓ Logs failure time"
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
  puts "Testing Background Job Processing Implementation"
  puts "=" * 60

  # Run tests
  result = Minitest.run(ARGV)

  exit(result ? 0 : 1)
end