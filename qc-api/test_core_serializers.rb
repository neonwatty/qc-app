#!/usr/bin/env ruby

# Test script for Task 5.1: Core Model Serializers
# Tests User, Couple, Category, and CheckIn serializers

require_relative 'config/environment'

class CoreSerializerTest
  def initialize
    @passed = 0
    @failed = 0
    @user = nil
    @partner = nil
    @couple = nil
  end

  def run_all_tests
    puts "\n" + "="*60
    puts "TESTING TASK 5.1: CORE MODEL SERIALIZERS"
    puts "="*60

    setup_test_data

    puts "\n" + "-"*40
    puts "TESTING SERIALIZERS OUTPUT"
    puts "-"*40

    test_user_serializer
    test_couple_serializer
    test_category_serializer
    test_check_in_serializer

    puts "\n" + "-"*40
    puts "TESTING CAMELCASE CONVERSION"
    puts "-"*40

    test_camelcase_output
    test_nested_attributes

    puts "\n" + "-"*40
    puts "TESTING PERFORMANCE OPTIMIZATION"
    puts "-"*40

    test_conditional_includes
    test_n_plus_one_prevention

    puts "\n" + "-"*40
    puts "TESTING TYPESCRIPT INTERFACE MATCHING"
    puts "-"*40

    test_user_interface_match
    test_couple_interface_match
    test_category_interface_match
    test_check_in_interface_match

    print_summary
  end

  private

  def setup_test_data
    ActiveRecord::Base.transaction do
      # Create users
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
        name: 'Test Couple',
        check_in_frequency: 'weekly'
      )
      @couple.users << [@user, @partner]

      # Create categories
      @category = @couple.categories.create!(
        name: 'Communication',
        icon: '💬',
        description: 'Talk about communication',
        prompts: ['How are we doing?', 'What can we improve?'],
        order: 1,
        is_custom: false
      )

      puts "[SETUP] Created test data successfully"
    end
  rescue => e
    puts "✗ Setup failed: #{e.message}"
    exit 1
  end

  # Serializer Output Tests

  def test_user_serializer
    serializer = UserSerializer.new(@user)
    json = serializer.serializable_hash

    data = json[:data][:attributes]

    # Check core attributes
    if data[:id] == @user.id &&
       data[:email] == @user.email &&
       data[:name] == @user.name &&
       data.key?(:partnerId) && # Check camelCase
       data.key?(:createdAt)
      puts "✓ UserSerializer outputs correct structure"
      @passed += 1
    else
      puts "✗ UserSerializer structure incorrect"
      @failed += 1
    end
  rescue => e
    puts "✗ UserSerializer error: #{e.message}"
    @failed += 1
  end

  def test_couple_serializer
    serializer = CoupleSerializer.new(@couple)
    json = serializer.serializable_hash

    data = json[:data][:attributes]

    # Check nested settings object
    if data[:settings] &&
       data[:settings][:checkInFrequency] == 'weekly' &&
       data[:settings][:categories].is_a?(Array) &&
       data[:stats] &&
       data[:stats][:totalCheckIns] == 0
      puts "✓ CoupleSerializer outputs nested objects correctly"
      @passed += 1
    else
      puts "✗ CoupleSerializer nested structure incorrect"
      @failed += 1
    end
  rescue => e
    puts "✗ CoupleSerializer error: #{e.message}"
    @failed += 1
  end

  def test_category_serializer
    serializer = CategorySerializer.new(@category)
    json = serializer.serializable_hash

    data = json[:data][:attributes]

    if data[:name] == 'Communication' &&
       data[:icon] == '💬' &&
       data[:prompts].is_a?(Array) &&
       data[:isCustom] == false &&
       data[:order] == 1
      puts "✓ CategorySerializer outputs correct attributes"
      @passed += 1
    else
      puts "✗ CategorySerializer attributes incorrect"
      @failed += 1
    end
  rescue => e
    puts "✗ CategorySerializer error: #{e.message}"
    @failed += 1
  end

  def test_check_in_serializer
    check_in = @couple.check_ins.create!(
      status: 'in-progress',
      started_at: Time.current,
      participants: [@user.id, @partner.id],
      categories: [@category.id],
      mood_before: 3
    )

    serializer = CheckInSerializer.new(check_in)
    json = serializer.serializable_hash

    data = json[:data][:attributes]

    if data[:coupleId] == @couple.id &&
       data[:participants].include?(@user.id) &&
       data[:mood] &&
       data[:mood][:before] == 3 &&
       data[:categories].include?(@category.id)
      puts "✓ CheckInSerializer outputs TypeScript-matching structure"
      @passed += 1
    else
      puts "✗ CheckInSerializer structure doesn't match TypeScript"
      @failed += 1
    end
  rescue => e
    puts "✗ CheckInSerializer error: #{e.message}"
    @failed += 1
  end

  # CamelCase Conversion Tests

  def test_camelcase_output
    serializer = UserSerializer.new(@user)
    json = serializer.serializable_hash
    data = json[:data][:attributes]

    # Check that snake_case fields are converted to camelCase
    if data.key?(:partnerId) && !data.key?(:partner_id) &&
       data.key?(:createdAt) && !data.key?(:created_at)
      puts "✓ CamelCase conversion working"
      @passed += 1
    else
      puts "✗ CamelCase conversion not working"
      @failed += 1
    end
  rescue => e
    puts "✗ CamelCase test error: #{e.message}"
    @failed += 1
  end

  def test_nested_attributes
    serializer = CoupleSerializer.new(@couple)
    json = serializer.serializable_hash
    settings = json[:data][:attributes][:settings]

    if settings[:checkInFrequency] && !settings[:check_in_frequency]
      puts "✓ Nested attributes use camelCase"
      @passed += 1
    else
      puts "✗ Nested attributes not using camelCase"
      @failed += 1
    end
  rescue => e
    puts "✗ Nested attributes test error: #{e.message}"
    @failed += 1
  end

  # Performance Optimization Tests

  def test_conditional_includes
    # Test without includes
    serializer = CoupleSerializer.new(@couple, params: {})
    json = serializer.serializable_hash

    # Check that relationships are not included by default
    relationships = json[:data][:relationships]
    check_ins_included = relationships && relationships[:checkIns] && relationships[:checkIns][:data]

    if !check_ins_included
      puts "✓ Conditional includes working (relationships not loaded)"
      @passed += 1
    else
      puts "✗ Relationships loaded without request"
      @failed += 1
    end

    # Test with includes
    serializer = CoupleSerializer.new(@couple, params: { include_check_ins: true })
    json = serializer.serializable_hash
    relationships = json[:data][:relationships]

    if relationships && relationships[:checkIns]
      puts "✓ Conditional includes working (relationships loaded when requested)"
      @passed += 1
    else
      puts "✗ Relationships not loaded when requested"
      @failed += 1
    end
  rescue => e
    puts "✗ Conditional includes test error: #{e.message}"
    @failed += 1
  end

  def test_n_plus_one_prevention
    # Create multiple check-ins
    5.times do
      @couple.check_ins.create!(
        status: 'completed',
        started_at: rand(10).days.ago,
        completed_at: Time.current
      )
    end

    # Test that optional attributes don't cause N+1
    serializer = CategorySerializer.new(@category, params: {})
    json = serializer.serializable_hash

    # usage_count should not be included without params[:include_usage]
    if !json[:data][:attributes][:usageCount]
      puts "✓ N+1 prevention working (expensive calculations skipped)"
      @passed += 1
    else
      puts "✗ Expensive calculations performed without request"
      @failed += 1
    end
  rescue => e
    puts "✗ N+1 prevention test error: #{e.message}"
    @failed += 1
  end

  # TypeScript Interface Matching Tests

  def test_user_interface_match
    serializer = UserSerializer.new(@user)
    json = serializer.serializable_hash
    data = json[:data][:attributes]

    required_fields = [:id, :name, :email, :createdAt, :updatedAt]
    optional_fields = [:partnerId, :avatar]

    missing_required = required_fields.select { |f| !data.key?(f) }

    if missing_required.empty?
      puts "✓ User interface matches TypeScript"
      @passed += 1
    else
      puts "✗ User interface missing fields: #{missing_required}"
      @failed += 1
    end
  rescue => e
    puts "✗ User interface test error: #{e.message}"
    @failed += 1
  end

  def test_couple_interface_match
    serializer = CoupleSerializer.new(@couple)
    json = serializer.serializable_hash
    data = json[:data][:attributes]

    if data[:settings] && data[:stats] && data[:name] && data[:id]
      puts "✓ Couple interface matches TypeScript"
      @passed += 1
    else
      puts "✗ Couple interface doesn't match TypeScript"
      @failed += 1
    end
  rescue => e
    puts "✗ Couple interface test error: #{e.message}"
    @failed += 1
  end

  def test_category_interface_match
    serializer = CategorySerializer.new(@category)
    json = serializer.serializable_hash
    data = json[:data][:attributes]

    required_fields = [:id, :name, :icon, :description, :prompts, :isCustom, :order]
    missing = required_fields.select { |f| !data.key?(f) }

    if missing.empty?
      puts "✓ Category interface matches TypeScript"
      @passed += 1
    else
      puts "✗ Category interface missing fields: #{missing}"
      @failed += 1
    end
  rescue => e
    puts "✗ Category interface test error: #{e.message}"
    @failed += 1
  end

  def test_check_in_interface_match
    check_in = @couple.check_ins.create!(
      status: 'completed',
      started_at: 1.hour.ago,
      completed_at: Time.current,
      mood_before: 3,
      mood_after: 4
    )

    serializer = CheckInSerializer.new(check_in)
    json = serializer.serializable_hash
    data = json[:data][:attributes]

    required_fields = [:id, :coupleId, :participants, :startedAt, :status, :categories]
    missing = required_fields.select { |f| !data.key?(f) }

    if missing.empty? && data[:mood] && data[:mood][:before] == 3
      puts "✓ CheckIn interface matches TypeScript"
      @passed += 1
    else
      puts "✗ CheckIn interface missing fields or mood structure wrong"
      @failed += 1
    end
  rescue => e
    puts "✗ CheckIn interface test error: #{e.message}"
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
tester = CoreSerializerTest.new
tester.run_all_tests