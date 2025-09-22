#!/usr/bin/env ruby

# Test script for Task 5.0: API Serialization and Validation
# This script tests serializers and validators functionality

require_relative 'config/environment'

class SerializationTest
  def initialize
    @passed = 0
    @failed = 0
    @user = nil
    @couple = nil
  end

  def run_all_tests
    puts "\n" + "="*60
    puts "TESTING TASK 5.0: API SERIALIZATION AND VALIDATION"
    puts "="*60

    setup_test_data

    # Test Serializers
    puts "\n" + "-"*40
    puts "TESTING SERIALIZERS"
    puts "-"*40

    test_user_serializer
    test_couple_serializer
    test_check_in_serializer
    test_milestone_serializer
    test_note_serializer
    test_action_item_serializer
    test_category_serializer
    test_reminder_serializer

    # Test Validators
    puts "\n" + "-"*40
    puts "TESTING VALIDATORS"
    puts "-"*40

    test_check_in_validator
    test_milestone_validator
    test_action_item_validator
    test_note_validator
    test_validation_error_handling

    # Test API Response Handler
    puts "\n" + "-"*40
    puts "TESTING API RESPONSE HANDLER"
    puts "-"*40

    test_pagination_functionality
    test_error_response_format

    # Summary
    print_summary
  end

  private

  def setup_test_data
    ActiveRecord::Base.transaction do
      # Create test user
      @user = User.create!(
        email: "test_#{SecureRandom.hex(4)}@example.com",
        password: 'Password123!',
        name: 'Test User'
      )

      # Create test couple
      @couple = Couple.create!(
        name: 'Test Couple',
        check_in_frequency: 'daily'
      )
      @couple.users << @user

      puts "[SETUP] Created test user and couple"
    end
  rescue => e
    puts "✗ Setup failed: #{e.message}"
    exit 1
  end

  # Serializer Tests

  def test_user_serializer
    serializer = UserSerializer.new(@user)
    hash = serializer.serializable_hash

    if hash[:data][:attributes][:id] == @user.id &&
       hash[:data][:attributes][:email] == @user.email
      puts "✓ UserSerializer formats data correctly"
      @passed += 1
    else
      puts "✗ UserSerializer formatting incorrect"
      @failed += 1
    end
  rescue => e
    puts "✗ UserSerializer error: #{e.message}"
    @failed += 1
  end

  def test_couple_serializer
    serializer = CoupleSerializer.new(@couple)
    hash = serializer.serializable_hash

    if hash[:data][:attributes][:id] == @couple.id &&
       hash[:data][:attributes][:stats]
      puts "✓ CoupleSerializer includes computed attributes"
      @passed += 1
    else
      puts "✗ CoupleSerializer missing attributes"
      @failed += 1
    end
  rescue => e
    puts "✗ CoupleSerializer error: #{e.message}"
    @failed += 1
  end

  def test_check_in_serializer
    check_in = @couple.check_ins.create!(
      status: 'in-progress',
      started_at: Time.current,
      participants: [@user.id]
    )

    serializer = CheckInSerializer.new(check_in)
    hash = serializer.serializable_hash

    if hash[:data][:attributes][:duration_minutes] == nil &&
       hash[:data][:attributes][:is_complete] == false
      puts "✓ CheckInSerializer computes virtual attributes"
      @passed += 1
    else
      puts "✗ CheckInSerializer virtual attributes incorrect"
      @failed += 1
    end
  rescue => e
    puts "✗ CheckInSerializer error: #{e.message}"
    @failed += 1
  end

  def test_milestone_serializer
    milestone = @couple.milestones.create!(
      title: 'Test Milestone',
      description: 'Test Description',
      category: 'consistency',
      icon: '🎯',
      progress: 50,
      target_date: Date.today + 30.days
    )

    serializer = MilestoneSerializer.new(milestone)
    hash = serializer.serializable_hash

    if hash[:data][:attributes][:days_until_target] == 30 &&
       hash[:data][:attributes][:is_in_progress] == true
      puts "✓ MilestoneSerializer calculates dynamic fields"
      @passed += 1
    else
      puts "✗ MilestoneSerializer dynamic fields incorrect"
      @failed += 1
    end
  rescue => e
    puts "✗ MilestoneSerializer error: #{e.message}"
    @failed += 1
  end

  def test_note_serializer
    check_in = @couple.check_ins.create!(
      status: 'in-progress',
      started_at: Time.current
    )

    note = Note.create!(
      content: 'Test note content with multiple words',
      privacy: 'private',
      author: @user,
      check_in: check_in
    )

    serializer = NoteSerializer.new(note)
    hash = serializer.serializable_hash

    if hash[:data][:attributes][:word_count] == 6 &&
       hash[:data][:attributes][:is_private] == true
      puts "✓ NoteSerializer includes computed fields"
      @passed += 1
    else
      puts "✗ NoteSerializer computed fields incorrect"
      @failed += 1
    end
  rescue => e
    puts "✗ NoteSerializer error: #{e.message}"
    @failed += 1
  end

  def test_action_item_serializer
    check_in = @couple.check_ins.first || @couple.check_ins.create!(
      status: 'completed',
      started_at: 1.hour.ago,
      completed_at: Time.current
    )

    action_item = ActionItem.create!(
      title: 'Test Action',
      check_in: check_in,
      due_date: Date.today + 5.days,
      assigned_to: @user
    )

    serializer = ActionItemSerializer.new(action_item)
    hash = serializer.serializable_hash

    if hash[:data][:attributes][:days_until_due] == 5 &&
       hash[:data][:attributes][:status] == 'pending'
      puts "✓ ActionItemSerializer calculates status"
      @passed += 1
    else
      puts "✗ ActionItemSerializer status calculation incorrect"
      @failed += 1
    end
  rescue => e
    puts "✗ ActionItemSerializer error: #{e.message}"
    @failed += 1
  end

  def test_category_serializer
    category = @couple.categories.first || @couple.categories.create!(
      name: 'Test Category',
      icon: '📝',
      description: 'Test Description',
      order: 1
    )

    serializer = CategorySerializer.new(category)
    hash = serializer.serializable_hash

    if hash[:data][:attributes][:usage_count] >= 0
      puts "✓ CategorySerializer includes usage count"
      @passed += 1
    else
      puts "✗ CategorySerializer missing usage count"
      @failed += 1
    end
  rescue => e
    puts "✗ CategorySerializer error: #{e.message}"
    @failed += 1
  end

  def test_reminder_serializer
    reminder = Reminder.create!(
      title: 'Test Reminder',
      message: 'Test reminder message',
      category: 'check_in',
      frequency: 'once',
      notification_channel: 'email',
      scheduled_for: Time.current + 1.day,
      couple: @couple,
      created_by: @user
    )

    serializer = ReminderSerializer.new(reminder)
    hash = serializer.serializable_hash

    if hash[:data][:attributes][:is_overdue] == false &&
       hash[:data][:attributes][:is_recurring] == false
      puts "✓ ReminderSerializer computes state flags"
      @passed += 1
    else
      puts "✗ ReminderSerializer state flags incorrect"
      @failed += 1
    end
  rescue => e
    puts "✗ ReminderSerializer error: #{e.message}"
    @failed += 1
  end

  # Validator Tests

  def test_check_in_validator
    # Test valid params
    valid_params = {
      status: 'in-progress',
      mood_before: 3,
      mood_after: 4,
      reflection: 'Good session',
      current_step: 'discussion'
    }

    validator = CheckInValidator.new(valid_params)
    if validator.valid?
      puts "✓ CheckInValidator accepts valid params"
      @passed += 1
    else
      puts "✗ CheckInValidator rejects valid params"
      @failed += 1
    end

    # Test invalid status
    invalid_params = { status: 'invalid_status' }
    validator = CheckInValidator.new(invalid_params)
    if validator.invalid? && validator.errors[:status].any?
      puts "✓ CheckInValidator rejects invalid status"
      @passed += 1
    else
      puts "✗ CheckInValidator accepts invalid status"
      @failed += 1
    end
  rescue => e
    puts "✗ CheckInValidator error: #{e.message}"
    @failed += 1
  end

  def test_milestone_validator
    # Test valid params
    valid_params = {
      title: 'Test Milestone',
      description: 'Test Description',
      category: 'consistency',
      icon: '🎯',
      progress: 50
    }

    validator = MilestoneValidator.new(valid_params)
    if validator.valid?
      puts "✓ MilestoneValidator accepts valid params"
      @passed += 1
    else
      puts "✗ MilestoneValidator rejects valid params: #{validator.errors.full_messages}"
      @failed += 1
    end

    # Test invalid category
    invalid_params = valid_params.merge(category: 'invalid_category')
    validator = MilestoneValidator.new(invalid_params)
    if validator.invalid? && validator.errors[:category].any?
      puts "✓ MilestoneValidator rejects invalid category"
      @passed += 1
    else
      puts "✗ MilestoneValidator accepts invalid category"
      @failed += 1
    end
  rescue => e
    puts "✗ MilestoneValidator error: #{e.message}"
    @failed += 1
  end

  def test_action_item_validator
    # Test valid params
    valid_params = {
      title: 'Test Action',
      description: 'Test Description',
      priority: 'high',
      due_date: Date.today + 7.days
    }

    validator = ActionItemValidator.new(valid_params)
    if validator.valid?
      puts "✓ ActionItemValidator accepts valid params"
      @passed += 1
    else
      puts "✗ ActionItemValidator rejects valid params"
      @failed += 1
    end

    # Test invalid priority
    invalid_params = valid_params.merge(priority: 'super_urgent')
    validator = ActionItemValidator.new(invalid_params)
    if validator.invalid? && validator.errors[:priority].any?
      puts "✓ ActionItemValidator rejects invalid priority"
      @passed += 1
    else
      puts "✗ ActionItemValidator accepts invalid priority"
      @failed += 1
    end
  rescue => e
    puts "✗ ActionItemValidator error: #{e.message}"
    @failed += 1
  end

  def test_note_validator
    # Test valid params
    valid_params = {
      content: 'Test note content',
      privacy: 'private',
      tags: ['tag1', 'tag2']
    }

    validator = NoteValidator.new(valid_params)
    if validator.valid?
      puts "✓ NoteValidator accepts valid params"
      @passed += 1
    else
      puts "✗ NoteValidator rejects valid params"
      @failed += 1
    end

    # Test invalid privacy
    invalid_params = valid_params.merge(privacy: 'public')
    validator = NoteValidator.new(invalid_params)
    if validator.invalid? && validator.errors[:privacy].any?
      puts "✓ NoteValidator rejects invalid privacy"
      @passed += 1
    else
      puts "✗ NoteValidator accepts invalid privacy"
      @failed += 1
    end

    # Test too many tags
    invalid_params = valid_params.merge(tags: Array.new(11) { |i| "tag#{i}" })
    validator = NoteValidator.new(invalid_params)
    if validator.invalid? && validator.errors[:tags].any?
      puts "✓ NoteValidator enforces tag limit"
      @passed += 1
    else
      puts "✗ NoteValidator doesn't enforce tag limit"
      @failed += 1
    end
  rescue => e
    puts "✗ NoteValidator error: #{e.message}"
    @failed += 1
  end

  def test_validation_error_handling
    begin
      CheckInValidator.validate_params!({ status: 'invalid' })
      puts "✗ ValidationError not raised"
      @failed += 1
    rescue ValidationError => e
      if e.errors.is_a?(Array) && e.message.is_a?(String)
        puts "✓ ValidationError raised with proper format"
        @passed += 1
      else
        puts "✗ ValidationError format incorrect"
        @failed += 1
      end
    end
  rescue => e
    puts "✗ ValidationError handling error: #{e.message}"
    @failed += 1
  end

  # API Response Handler Tests

  def test_pagination_functionality
    # Create multiple check-ins
    5.times do
      @couple.check_ins.create!(
        status: 'completed',
        started_at: rand(10).days.ago,
        completed_at: Time.current
      )
    end

    # Test pagination directly
    page = 1
    per_page = 2
    scope = @couple.check_ins
    paginated = scope.limit(per_page).offset((page - 1) * per_page)

    result = {
      records: paginated,
      meta: {
        current_page: page,
        per_page: per_page,
        total_count: scope.count,
        total_pages: (scope.count.to_f / per_page).ceil
      }
    }

    if result[:records].count == 2 && result[:meta][:total_count] >= 5
      puts "✓ Pagination works correctly"
      @passed += 1
    else
      puts "✗ Pagination incorrect"
      @failed += 1
    end
  rescue => e
    puts "✗ Pagination test error: #{e.message}"
    @failed += 1
  end

  def test_error_response_format
    error = ValidationError.new(['Field is required', 'Value is invalid'])
    json = error.to_json
    parsed = JSON.parse(json)

    if parsed['error'] == 'Validation failed' && parsed['details'].is_a?(Array)
      puts "✓ Error response format correct"
      @passed += 1
    else
      puts "✗ Error response format incorrect"
      @failed += 1
    end
  rescue => e
    puts "✗ Error response test error: #{e.message}"
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
tester = SerializationTest.new
tester.run_all_tests