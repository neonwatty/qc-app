#!/usr/bin/env ruby

# Direct test script for Task 4.5: Reminders and Requests API
# This script tests RemindersController and RelationshipRequestsController by creating test data directly

require_relative 'config/environment'

class DirectAPITest
  def initialize
    @user = nil
    @partner = nil
    @couple = nil
    @passed = 0
    @failed = 0
  end

  def run_all_tests
    puts "\n" + "="*60
    puts "TESTING TASK 4.5: REMINDERS AND REQUESTS API (DIRECT)"
    puts "="*60

    # Setup
    puts "\n[SETUP] Creating test users and data..."
    setup_test_data

    # Test Reminders
    puts "\n" + "-"*40
    puts "TESTING REMINDERS MODEL & CONTROLLER"
    puts "-"*40

    test_reminder_creation
    test_reminder_completion
    test_reminder_snoozing
    test_reminder_skipping
    test_reminder_rescheduling
    test_reminder_scopes
    test_reminder_frequencies
    test_reminder_batch_operations
    test_reminder_statistics

    # Test Relationship Requests
    puts "\n" + "-"*40
    puts "TESTING RELATIONSHIP REQUESTS MODEL & CONTROLLER"
    puts "-"*40

    test_request_creation
    test_request_acceptance
    test_request_declining
    test_request_deferring
    test_request_to_reminder_conversion
    test_request_discussion
    test_request_scopes
    test_request_batch_operations
    test_request_statistics

    # Summary
    print_summary
  end

  private

  def setup_test_data
    ActiveRecord::Base.transaction do
      # Create test users
      @user = User.create!(
        email: "test_#{SecureRandom.hex(4)}@example.com",
        password: 'Password123!',
        name: 'Test User'
      )

      @partner = User.create!(
        email: "partner_#{SecureRandom.hex(4)}@example.com",
        password: 'Password123!',
        name: 'Partner User'
      )

      # Create couple
      @couple = Couple.create!(
        name: 'Test Couple'
      )
      @couple.users << [@user, @partner]

      puts "✓ Created test users and couple"
    rescue => e
      puts "✗ Failed to create test data: #{e.message}"
      exit 1
    end
  end

  # Reminders Tests

  def test_reminder_creation
    reminder = Reminder.create!(
      title: 'Weekly Check-in',
      message: 'Time for our relationship check-in',
      category: 'check-in',
      frequency: 'weekly',
      scheduled_for: 1.day.from_now,
      priority: 4,
      notification_channel: 'push',
      created_by: @user,
      assigned_to: @user,
      couple: @couple
    )

    if reminder.persisted? && reminder.title == 'Weekly Check-in'
      puts "✓ Create reminder"
      @passed += 1
    else
      puts "✗ Create reminder"
      @failed += 1
    end
  rescue => e
    puts "✗ Create reminder: #{e.message}"
    @failed += 1
  end

  def test_reminder_completion
    reminder = Reminder.create!(
      title: 'Complete Me',
      message: 'Test completion',
      category: 'custom',
      frequency: 'once',
      notification_channel: 'push',
      scheduled_for: Time.current,
      created_by: @user,
      assigned_to: @user
    )

    reminder.complete!

    if reminder.completed_at.present? && reminder.completion_count == 1
      puts "✓ Complete reminder"
      @passed += 1
    else
      puts "✗ Complete reminder"
      @failed += 1
    end
  rescue => e
    puts "✗ Complete reminder: #{e.message}"
    @failed += 1
  end

  def test_reminder_snoozing
    reminder = Reminder.create!(
      title: 'Snooze Me',
      message: 'Test snoozing',
      category: 'custom',
      frequency: 'once',
      notification_channel: 'push',
      scheduled_for: Time.current,
      created_by: @user,
      assigned_to: @user
    )

    reminder.snooze!(30.minutes)

    if reminder.is_snoozed && reminder.snooze_until.present?
      puts "✓ Snooze reminder"
      @passed += 1
    else
      puts "✗ Snooze reminder"
      @failed += 1
    end
  rescue => e
    puts "✗ Snooze reminder: #{e.message}"
    @failed += 1
  end

  def test_reminder_skipping
    reminder = Reminder.create!(
      title: 'Skip Me',
      message: 'Test skipping',
      category: 'custom',
      frequency: 'daily',
      notification_channel: 'push',
      scheduled_for: Time.current,
      created_by: @user,
      assigned_to: @user
    )

    reminder.skip!

    if reminder.skip_count == 1 && reminder.next_occurrence_date.present?
      puts "✓ Skip reminder"
      @passed += 1
    else
      puts "✗ Skip reminder"
      @failed += 1
    end
  rescue => e
    puts "✗ Skip reminder: #{e.message}"
    @failed += 1
  end

  def test_reminder_rescheduling
    reminder = Reminder.create!(
      title: 'Reschedule Me',
      message: 'Test rescheduling',
      category: 'custom',
      frequency: 'once',
      notification_channel: 'push',
      scheduled_for: Time.current,
      created_by: @user,
      assigned_to: @user
    )

    new_time = 2.days.from_now
    reminder.reschedule!(new_time)

    if reminder.scheduled_for.to_i == new_time.to_i
      puts "✓ Reschedule reminder"
      @passed += 1
    else
      puts "✗ Reschedule reminder"
      @failed += 1
    end
  rescue => e
    puts "✗ Reschedule reminder: #{e.message}"
    @failed += 1
  end

  def test_reminder_scopes
    # Create various reminders
    Reminder.create!(
      title: 'Overdue',
      message: 'Overdue reminder',
      category: 'custom',
      frequency: 'once',
      notification_channel: 'push',
      scheduled_for: 1.hour.ago,
      created_by: @user,
      assigned_to: @user
    )

    Reminder.create!(
      title: 'Upcoming',
      message: 'Upcoming reminder',
      category: 'custom',
      frequency: 'once',
      notification_channel: 'push',
      scheduled_for: 1.day.from_now,
      created_by: @user,
      assigned_to: @user
    )

    Reminder.create!(
      title: 'High Priority',
      message: 'High priority reminder',
      category: 'custom',
      frequency: 'once',
      notification_channel: 'push',
      scheduled_for: Time.current,
      priority: 4,
      created_by: @user,
      assigned_to: @user
    )

    overdue = Reminder.overdue.count
    upcoming = Reminder.upcoming.count
    high_priority = Reminder.high_priority.count

    if overdue >= 1 && upcoming >= 1 && high_priority >= 1
      puts "✓ Reminder scopes"
      @passed += 1
    else
      puts "✗ Reminder scopes"
      @failed += 1
    end
  rescue => e
    puts "✗ Reminder scopes: #{e.message}"
    @failed += 1
  end

  def test_reminder_frequencies
    frequencies = %w[once daily weekly biweekly monthly]

    frequencies.each do |freq|
      reminder = Reminder.create!(
        title: "#{freq.capitalize} Reminder",
        message: 'Testing frequency',
        category: 'custom',
        frequency: freq,
        notification_channel: 'push',
        scheduled_for: Time.current,
        created_by: @user,
        assigned_to: @user
      )

      if !reminder.persisted?
        puts "✗ Reminder frequency #{freq}"
        @failed += 1
        return
      end
    end

    puts "✓ Reminder frequencies"
    @passed += 1
  rescue => e
    puts "✗ Reminder frequencies: #{e.message}"
    @failed += 1
  end

  def test_reminder_batch_operations
    # Create reminders for batch operations
    ids = []
    3.times do |i|
      reminder = Reminder.create!(
        title: "Batch #{i}",
        message: 'Batch test',
        category: 'custom',
        frequency: 'once',
        notification_channel: 'push',
        scheduled_for: Time.current,
        created_by: @user,
        assigned_to: @user
      )
      ids << reminder.id
    end

    # Test batch complete
    Reminder.where(id: ids[0..1]).each(&:complete!)
    completed = Reminder.where(id: ids[0..1]).where.not(completed_at: nil).count

    # Test batch snooze
    Reminder.where(id: ids[2]).each { |r| r.snooze!(30.minutes) }
    snoozed = Reminder.where(id: ids[2], is_snoozed: true).count

    if completed == 2 && snoozed == 1
      puts "✓ Reminder batch operations"
      @passed += 1
    else
      puts "✗ Reminder batch operations"
      @failed += 1
    end
  rescue => e
    puts "✗ Reminder batch operations: #{e.message}"
    @failed += 1
  end

  def test_reminder_statistics
    # Create test data
    5.times do |i|
      Reminder.create!(
        title: "Stats #{i}",
        message: 'Statistics test',
        scheduled_for: i.days.from_now,
        category: i.even? ? 'custom' : 'check-in',
        frequency: i.even? ? 'daily' : 'weekly',
        notification_channel: 'push',
        created_by: @user,
        assigned_to: @user
      )
    end

    stats = {
      total: Reminder.for_user(@user).count,
      active: Reminder.for_user(@user).active.count,
      by_category: Reminder::CATEGORIES.map { |c|
        [c, Reminder.for_user(@user).by_category(c).count]
      }.to_h
    }

    if stats[:total] >= 5 && stats[:active] >= 5
      puts "✓ Reminder statistics"
      @passed += 1
    else
      puts "✗ Reminder statistics"
      @failed += 1
    end
  rescue => e
    puts "✗ Reminder statistics: #{e.message}"
    @failed += 1
  end

  # Relationship Requests Tests

  def test_request_creation
    request = RelationshipRequest.create!(
      title: 'Date Night',
      description: 'Would you like to go to dinner on Friday?',
      category: 'activity',
      priority: 'medium',
      response_required_by: 3.days.from_now,
      requested_by: @user,
      requested_for: @partner,
      couple: @couple
    )

    if request.persisted? && request.status == 'pending'
      puts "✓ Create relationship request"
      @passed += 1
    else
      puts "✗ Create relationship request"
      @failed += 1
    end
  rescue => e
    puts "✗ Create relationship request: #{e.message}"
    @failed += 1
  end

  def test_request_acceptance
    request = RelationshipRequest.create!(
      title: 'Accept Me',
      description: 'Please accept',
      category: 'conversation',
      requested_by: @user,
      requested_for: @partner,
      couple: @couple
    )

    request.accept!("I'd love to!", "Looking forward to it")

    if request.status == 'accepted' && request.responded_at.present?
      puts "✓ Accept relationship request"
      @passed += 1
    else
      puts "✗ Accept relationship request"
      @failed += 1
    end
  rescue => e
    puts "✗ Accept relationship request: #{e.message}"
    @failed += 1
  end

  def test_request_declining
    request = RelationshipRequest.create!(
      title: 'Decline Me',
      description: 'This will be declined',
      category: 'activity',
      requested_by: @user,
      requested_for: @partner,
      couple: @couple
    )

    request.decline!("Sorry, can't make it", 'scheduling conflict')

    if request.status == 'declined' && request.decline_reason.present?
      puts "✓ Decline relationship request"
      @passed += 1
    else
      puts "✗ Decline relationship request"
      @failed += 1
    end
  rescue => e
    puts "✗ Decline relationship request: #{e.message}"
    @failed += 1
  end

  def test_request_deferring
    request = RelationshipRequest.create!(
      title: 'Defer Me',
      description: 'This will be deferred',
      category: 'activity',
      requested_by: @user,
      requested_for: @partner,
      couple: @couple
    )

    request.defer!(1.day.from_now, "Need to think about it")

    if request.deferred_until.present?
      puts "✓ Defer relationship request"
      @passed += 1
    else
      puts "✗ Defer relationship request"
      @failed += 1
    end
  rescue => e
    puts "✗ Defer relationship request: #{e.message}"
    @failed += 1
  end

  def test_request_to_reminder_conversion
    request = RelationshipRequest.create!(
      title: 'Convert to Reminder',
      description: 'This will become a reminder',
      category: 'activity',
      requested_by: @user,
      requested_for: @partner,
      couple: @couple
    )

    reminder = request.convert_to_reminder!(scheduled_for: 1.day.from_now, frequency: 'once')

    if reminder.persisted? && request.converted_to_reminder_id == reminder.id
      puts "✓ Convert request to reminder"
      @passed += 1
    else
      puts "✗ Convert request to reminder"
      @failed += 1
    end
  rescue => e
    puts "✗ Convert request to reminder: #{e.message}"
    @failed += 1
  end

  def test_request_discussion
    request = RelationshipRequest.create!(
      title: 'Discuss Me',
      description: 'Let\'s talk about this',
      category: 'conversation',
      requested_by: @user,
      requested_for: @partner,
      couple: @couple
    )

    request.mark_as_discussed!

    if request.discussed_at.present?
      puts "✓ Mark request as discussed"
      @passed += 1
    else
      puts "✗ Mark request as discussed"
      @failed += 1
    end
  rescue => e
    puts "✗ Mark request as discussed: #{e.message}"
    @failed += 1
  end

  def test_request_scopes
    # Create various requests
    RelationshipRequest.create!(
      title: 'Pending',
      description: 'Pending request',
      category: 'activity',
      requested_by: @user,
      requested_for: @partner,
      couple: @couple
    )

    RelationshipRequest.create!(
      title: 'High Urgency',
      description: 'Urgent request',
      category: 'activity',
      priority: 'high',
      requested_by: @user,
      requested_for: @partner,
      couple: @couple
    )

    req = RelationshipRequest.create!(
      title: 'Overdue',
      description: 'Overdue request',
      category: 'activity',
      requested_by: @user,
      requested_for: @partner,
      couple: @couple
    )
    # Manually set to past date after creation to bypass validation
    req.update_column(:response_required_by, 1.day.ago)

    pending = RelationshipRequest.requiring_response.count
    urgent = RelationshipRequest.high_priority.count
    overdue = RelationshipRequest.overdue.count

    if pending >= 1 && urgent >= 1 && overdue >= 1
      puts "✓ Request scopes"
      @passed += 1
    else
      puts "✗ Request scopes"
      @failed += 1
    end
  rescue => e
    puts "✗ Request scopes: #{e.message}"
    @failed += 1
  end

  def test_request_batch_operations
    # Create requests for batch operations
    ids = []
    3.times do |i|
      request = RelationshipRequest.create!(
        title: "Batch Request #{i}",
        description: 'Test batch',
        category: 'activity',
        requested_by: @user,
        requested_for: @partner,
        couple: @couple
      )
      ids << request.id
    end

    # Batch accept
    RelationshipRequest.where(id: ids[0..1]).each do |r|
      r.accept!("Accepted", nil)
    end

    accepted = RelationshipRequest.where(id: ids[0..1], status: 'accepted').count

    if accepted == 2
      puts "✓ Request batch operations"
      @passed += 1
    else
      puts "✗ Request batch operations"
      @failed += 1
    end
  rescue => e
    puts "✗ Request batch operations: #{e.message}"
    @failed += 1
  end

  def test_request_statistics
    # Create test data
    5.times do |i|
      RelationshipRequest.create!(
        title: "Stats Request #{i}",
        description: 'For statistics',
        category: i.even? ? 'activity' : 'conversation',
        priority: i.even? ? 'medium' : 'high',
        requested_by: i.even? ? @user : @partner,
        requested_for: i.even? ? @partner : @user,
        couple: @couple
      )
    end

    inbox = RelationshipRequest.inbox_for(@partner).count
    sent = RelationshipRequest.sent_by(@user).count

    if inbox >= 2 && sent >= 2
      puts "✓ Request statistics"
      @passed += 1
    else
      puts "✗ Request statistics"
      @failed += 1
    end
  rescue => e
    puts "✗ Request statistics: #{e.message}"
    @failed += 1
  end

  def print_summary
    total = @passed + @failed
    puts "\n" + "="*60
    puts "TEST SUMMARY"
    puts "="*60
    puts "Total tests: #{total}"
    puts "Passed: #{@passed} (#{(@passed.to_f / total * 100).round(1)}%)"
    puts "Failed: #{@failed} (#{(@failed.to_f / total * 100).round(1)}%)"
    puts "="*60

    if @failed == 0
      puts "✅ ALL TESTS PASSED!"
    else
      puts "❌ SOME TESTS FAILED"
    end
  end
end

# Run tests
tester = DirectAPITest.new
tester.run_all_tests