#!/usr/bin/env ruby

require 'minitest/autorun'
require 'json'

class TestAnalyticsMilestoneJobs < Minitest::Test
  def setup
    @jobs_path = 'app/jobs'
  end

  def test_01_analytics_processor_job_exists
    puts "\n--- Test 1: AnalyticsProcessorJob Structure ---"

    file_path = "#{@jobs_path}/analytics_processor_job.rb"
    assert File.exist?(file_path), "✗ AnalyticsProcessorJob should exist"
    puts "✓ AnalyticsProcessorJob exists"

    content = File.read(file_path)

    # Check for queue configuration
    assert content.include?('queue_as :data_processing'), "✗ Should use data_processing queue"
    puts "✓ Uses data_processing queue"

    assert content.include?('queue_with_priority'), "✗ Should set queue priority"
    puts "✓ Sets queue priority"

    # Check for retry configuration
    assert content.include?('retry_on ActiveRecord::RecordNotFound'), "✗ Should retry on RecordNotFound"
    puts "✓ Retries on RecordNotFound"

    assert content.include?('retry_on ActiveRecord::ConnectionTimeoutError'), "✗ Should retry on ConnectionTimeout"
    puts "✓ Retries on ConnectionTimeout"

    # Check for performance tracking
    assert content.include?('around_perform :track_performance'), "✗ Should track performance"
    puts "✓ Tracks performance"
  end

  def test_02_analytics_metrics_calculation
    puts "\n--- Test 2: Analytics Metrics Calculation ---"

    file_path = "#{@jobs_path}/analytics_processor_job.rb"
    content = File.read(file_path)

    metrics = [
      'calculate_engagement_metrics',
      'calculate_consistency_metrics',
      'calculate_quality_metrics',
      'calculate_growth_metrics',
      'calculate_streak_metrics',
      'analyze_patterns',
      'analyze_trends'
    ]

    metrics.each do |metric|
      assert content.include?("def #{metric}"), "✗ Should have #{metric} method"
      puts "✓ Has #{metric} method"
    end
  end

  def test_03_engagement_metrics
    puts "\n--- Test 3: Engagement Metrics ---"

    file_path = "#{@jobs_path}/analytics_processor_job.rb"
    content = File.read(file_path)

    engagement_metrics = [
      'check_in_frequency',
      'average_session_duration',
      'total_connection_time',
      'notes_per_session',
      'shared_note_ratio',
      'action_item_completion_rate',
      'participation_balance',
      'engagement_score'
    ]

    engagement_metrics.each do |metric|
      assert content.include?(metric), "✗ Should calculate #{metric}"
    end
    puts "✓ Calculates all engagement metrics"
  end

  def test_04_consistency_tracking
    puts "\n--- Test 4: Consistency Tracking ---"

    file_path = "#{@jobs_path}/analytics_processor_job.rb"
    content = File.read(file_path)

    consistency_metrics = [
      'current_streak',
      'longest_streak',
      'weekly_consistency',
      'monthly_consistency',
      'preferred_check_in_time',
      'consistency_score'
    ]

    consistency_metrics.each do |metric|
      assert content.include?(metric), "✗ Should track #{metric}"
    end
    puts "✓ Tracks all consistency metrics"
  end

  def test_05_quality_analysis
    puts "\n--- Test 5: Quality Analysis ---"

    file_path = "#{@jobs_path}/analytics_processor_job.rb"
    content = File.read(file_path)

    quality_metrics = [
      'average_satisfaction',
      'depth_of_discussions',
      'emotional_range',
      'vulnerability_index',
      'quality_score'
    ]

    quality_metrics.each do |metric|
      assert content.include?(metric), "✗ Should analyze #{metric}"
    end
    puts "✓ Analyzes all quality metrics"
  end

  def test_06_milestone_detector_job_exists
    puts "\n--- Test 6: MilestoneDetectorJob Structure ---"

    file_path = "#{@jobs_path}/milestone_detector_job.rb"
    assert File.exist?(file_path), "✗ MilestoneDetectorJob should exist"
    puts "✓ MilestoneDetectorJob exists"

    content = File.read(file_path)

    # Check for queue configuration
    assert content.include?('queue_as :data_processing'), "✗ Should use data_processing queue"
    puts "✓ Uses data_processing queue"

    assert content.include?('queue_with_priority 2'), "✗ Should have priority 2"
    puts "✓ Has priority 2"

    # Check for performance tracking
    assert content.include?('around_perform :track_performance'), "✗ Should track performance"
    puts "✓ Tracks performance"

    assert content.include?('before_perform :load_detection_rules'), "✗ Should load detection rules"
    puts "✓ Loads detection rules before perform"
  end

  def test_07_milestone_detection_rules
    puts "\n--- Test 7: Milestone Detection Rules ---"

    file_path = "#{@jobs_path}/milestone_detector_job.rb"
    content = File.read(file_path)

    rule_categories = [
      'load_frequency_rules',
      'load_consistency_rules',
      'load_quality_rules',
      'load_growth_rules',
      'load_special_rules',
      'load_seasonal_rules',
      'load_collaborative_rules',
      'load_communication_rules'
    ]

    rule_categories.each do |rule_method|
      assert content.include?("def #{rule_method}"), "✗ Should have #{rule_method}"
      puts "✓ Has #{rule_method}"
    end
  end

  def test_08_milestone_thresholds
    puts "\n--- Test 8: Milestone Thresholds ---"

    file_path = "#{@jobs_path}/milestone_detector_job.rb"
    content = File.read(file_path)

    # Check for various milestone thresholds
    thresholds = [
      "threshold: 1",    # First check-in
      "threshold: 100",  # 100 check-ins
      "threshold: 365",  # Year of check-ins
      "days: 30",        # 30-day streak
      "days: 365"        # Year streak
    ]

    thresholds.each do |threshold|
      assert content.include?(threshold), "✗ Should have milestone #{threshold}"
    end
    puts "✓ Has all milestone thresholds"
  end

  def test_09_advanced_pattern_detection
    puts "\n--- Test 9: Advanced Pattern Detection ---"

    file_path = "#{@jobs_path}/milestone_detector_job.rb"
    content = File.read(file_path)

    # Check for advanced detection methods
    assert content.include?('detect_advanced_patterns'), "✗ Should detect advanced patterns"
    puts "✓ Detects advanced patterns"

    assert content.include?('detect_combination_milestones'), "✗ Should detect combination milestones"
    puts "✓ Detects combination milestones"

    assert content.include?('detect_global_milestones'), "✗ Should detect global milestones"
    puts "✓ Detects global milestones"

    assert content.include?('analyze_milestone_velocity'), "✗ Should analyze milestone velocity"
    puts "✓ Analyzes milestone velocity"
  end

  def test_10_real_time_detection
    puts "\n--- Test 10: Real-time Detection ---"

    file_path = "#{@jobs_path}/milestone_detector_job.rb"
    content = File.read(file_path)

    # Check for real-time detection support
    assert content.include?('detect_real_time_milestone'), "✗ Should support real-time detection"
    puts "✓ Supports real-time detection"

    assert content.include?('checkin_completed'), "✗ Should handle check-in completion events"
    puts "✓ Handles check-in completion events"

    assert content.include?('broadcast_milestone_achievement'), "✗ Should broadcast achievements"
    puts "✓ Broadcasts milestone achievements"

    assert content.include?('ActionCable.server.broadcast'), "✗ Should use ActionCable for real-time"
    puts "✓ Uses ActionCable for real-time updates"
  end

  def test_11_batch_processing
    puts "\n--- Test 11: Batch Processing ---"

    file_path = "#{@jobs_path}/analytics_processor_job.rb"
    content = File.read(file_path)

    # Check for batch processing
    assert content.include?('find_in_batches'), "✗ Should use batch processing"
    puts "✓ Uses batch processing"

    assert content.include?('batch_size:'), "✗ Should specify batch size"
    puts "✓ Specifies batch size"

    # Check milestone detector batch processing
    detector_content = File.read("#{@jobs_path}/milestone_detector_job.rb")
    assert detector_content.include?('detect_batch_milestones'), "✗ Detector should support batch processing"
    puts "✓ Detector supports batch processing"
  end

  def test_12_performance_optimization
    puts "\n--- Test 12: Performance Optimization ---"

    file_path = "#{@jobs_path}/analytics_processor_job.rb"
    content = File.read(file_path)

    # Check for performance optimizations
    assert content.include?('track_performance'), "✗ Should track performance"
    puts "✓ Tracks performance"

    assert content.include?('if duration > 60.seconds'), "✗ Should alert on slow processing"
    puts "✓ Alerts on slow processing"

    # Check detector optimizations
    detector_content = File.read("#{@jobs_path}/milestone_detector_job.rb")
    assert detector_content.include?('if duration > 30.seconds'), "✗ Detector should alert on slow detection"
    puts "✓ Detector alerts on slow detection"
  end

  def test_13_streak_calculation
    puts "\n--- Test 13: Streak Calculation ---"

    file_path = "#{@jobs_path}/analytics_processor_job.rb"
    content = File.read(file_path)

    # Check for streak calculation methods
    assert content.include?('calculate_current_streak'), "✗ Should calculate current streak"
    puts "✓ Calculates current streak"

    assert content.include?('calculate_longest_streak'), "✗ Should calculate longest streak"
    puts "✓ Calculates longest streak"

    assert content.include?('Date.current - 1'), "✗ Should check for yesterday in streak"
    puts "✓ Checks for yesterday in streak calculation"

    assert content.scan('.to_date').count > 1, "✗ Should convert to dates for comparison"
    puts "✓ Converts to dates for comparison"
  end

  def test_14_milestone_notification
    puts "\n--- Test 14: Milestone Notifications ---"

    file_path = "#{@jobs_path}/milestone_detector_job.rb"
    content = File.read(file_path)

    # Check for notification integration
    assert content.include?('NotificationService.send_milestone_notification'), "✗ Should send notifications"
    puts "✓ Sends milestone notifications"

    assert content.include?('create_milestone'), "✗ Should create milestone records"
    puts "✓ Creates milestone records"

    assert content.include?('milestone_exists?'), "✗ Should check for existing milestones"
    puts "✓ Checks for existing milestones to avoid duplicates"
  end

  def test_15_analytics_storage
    puts "\n--- Test 15: Analytics Storage ---"

    file_path = "#{@jobs_path}/analytics_processor_job.rb"
    content = File.read(file_path)

    # Check for analytics storage
    assert content.include?('store_couple_analytics'), "✗ Should store analytics"
    puts "✓ Stores couple analytics"

    assert content.include?('analytics_snapshots'), "✗ Should create historical snapshots"
    puts "✓ Creates historical snapshots"

    assert content.include?('detect_metric_based_achievements'), "✗ Should detect achievements from metrics"
    puts "✓ Detects metric-based achievements"

    assert content.include?('create_achievement'), "✗ Should create achievement records"
    puts "✓ Creates achievement records"
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
  puts "Testing Analytics and Milestone Jobs Implementation"
  puts "=" * 60

  # Run tests
  result = Minitest.run(ARGV)

  exit(result ? 0 : 1)
end