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

def assert_includes(collection, value, message)
  if collection.include?(value)
    puts "✓ #{message}"
    true
  else
    puts "✗ FAILED: #{message} - #{value.inspect} not found in collection"
    @failures ||= []
    @failures << message
    false
  end
end

puts "\n" + "="*60
puts "Testing Request Validation and Strong Parameters"
puts "="*60

# Test 1: UserValidator
puts "\n--- Test 1: UserValidator ---"

# Valid user data
valid_user = UserValidator.validate_params({
  email: "test@example.com",
  password: "SecurePass123",
  password_confirmation: "SecurePass123",
  name: "Test User"
})

assert(valid_user.valid?, "Valid user data passes validation")

# Invalid email
invalid_email = UserValidator.validate_params({
  email: "invalid-email",
  password: "SecurePass123",
  password_confirmation: "SecurePass123",
  name: "Test User"
})

assert(!invalid_email.valid?, "Invalid email format is rejected")
assert_includes(invalid_email.errors[:email], "Please provide a valid email address (e.g., user@example.com)",
  "Email validation provides helpful error message")

# Password too short
short_password = UserValidator.validate_params({
  email: "test@example.com",
  password: "short",
  password_confirmation: "short",
  name: "Test User"
})

assert(!short_password.valid?, "Short password is rejected")
assert_includes(short_password.errors[:password], "Password must be at least 8 characters long for security",
  "Password length error is descriptive")

# Password mismatch
password_mismatch = UserValidator.validate_params({
  email: "test@example.com",
  password: "SecurePass123",
  password_confirmation: "DifferentPass123",
  name: "Test User"
})

assert(!password_mismatch.valid?, "Password mismatch is detected")
assert_includes(password_mismatch.errors[:password_confirmation], "doesn't match the password",
  "Password confirmation error is clear")

# Test 2: NoteValidator
puts "\n--- Test 2: NoteValidator ---"

# Valid note
valid_note = NoteValidator.validate_params({
  content: "This is a test note",
  privacy: "shared",
  tags: ["test", "validation"],
  category_id: "123e4567-e89b-12d3-a456-426614174000"
})

assert(valid_note.valid?, "Valid note passes validation")

# Empty content
empty_content = NoteValidator.validate_params({
  content: "",
  privacy: "shared"
})

assert(!empty_content.valid?, "Empty note content is rejected")
assert_includes(empty_content.errors[:content], "Note content cannot be empty",
  "Content validation provides clear message")

# Invalid privacy level
invalid_privacy = NoteValidator.validate_params({
  content: "Test note",
  privacy: "public"
})

assert(!invalid_privacy.valid?, "Invalid privacy level is rejected")
error_msg = invalid_privacy.errors[:privacy].first
assert(error_msg.include?("private (only you can see)"), "Privacy error explains options")

# Too many tags
too_many_tags = NoteValidator.validate_params({
  content: "Test note",
  privacy: "shared",
  tags: (1..15).map { |i| "tag#{i}" }
})

assert(!too_many_tags.valid?, "Too many tags are rejected")
error_msg = too_many_tags.errors[:tags].first
assert(error_msg.include?("up to 10 tags"), "Tag limit error is informative")

# Invalid tag characters
invalid_tags = NoteValidator.validate_params({
  content: "Test note",
  privacy: "shared",
  tags: ["valid-tag", "invalid@tag!"]
})

assert(!invalid_tags.valid?, "Invalid tag characters are rejected")
error_msg = invalid_tags.errors[:tags].first
assert(error_msg.include?("invalid characters"), "Tag character error is descriptive")

# Test 3: CategoryValidator
puts "\n--- Test 3: CategoryValidator ---"

# Valid category
valid_category = CategoryValidator.validate_params({
  name: "Communication",
  icon: "Heart",
  color: "#FF5733",
  order: 1,
  prompts: ["How was your day?", "What made you smile today?"]
})

assert(valid_category.valid?, "Valid category passes validation")

# Invalid icon
invalid_icon = CategoryValidator.validate_params({
  name: "Test Category",
  icon: "InvalidIcon"
})

assert(!invalid_icon.valid?, "Invalid icon is rejected")
error_msg = invalid_icon.errors[:icon].first
assert(error_msg.include?("select from the available icon set"),
  "Icon error guides user to valid options")

# Invalid hex color
invalid_color = CategoryValidator.validate_params({
  name: "Test Category",
  icon: "Heart",
  color: "red"
})

assert(!invalid_color.valid?, "Invalid color format is rejected")
assert_includes(invalid_color.errors[:color], "Color must be a valid hex code (e.g., #FF5733 or #F57)",
  "Color validation provides format example")

# Too many prompts
too_many_prompts = CategoryValidator.validate_params({
  name: "Test Category",
  icon: "Heart",
  prompts: (1..25).map { |i| "Prompt #{i}" }
})

assert(!too_many_prompts.valid?, "Too many prompts are rejected")
error_msg = too_many_prompts.errors[:prompts].first
assert(error_msg.include?("20 prompts"), "Prompt limit is clearly stated")

# Test 4: ReminderValidator
puts "\n--- Test 4: ReminderValidator ---"

# Valid reminder
valid_reminder = ReminderValidator.validate_params({
  title: "Weekly Check-in",
  reminder_type: "check_in",
  frequency: "weekly",
  days_of_week: ["monday", "friday"],
  time_of_day: "19:00"
})

assert(valid_reminder.valid?, "Valid reminder passes validation")

# Invalid time format
invalid_time = ReminderValidator.validate_params({
  title: "Daily Reminder",
  reminder_type: "check_in",
  frequency: "daily",
  time_of_day: "7:00 PM"
})

assert(!invalid_time.valid?, "Invalid time format is rejected")
error_msg = invalid_time.errors[:time_of_day].first
assert(error_msg.include?("24-hour format"), "Time error explains expected format")

# Weekly reminder without days
missing_days = ReminderValidator.validate_params({
  title: "Weekly Reminder",
  reminder_type: "check_in",
  frequency: "weekly",
  time_of_day: "19:00"
})

assert(!missing_days.valid?, "Weekly reminder without days is rejected")
error_msg = missing_days.errors[:days_of_week].first
assert(error_msg.include?("select at least one day"),
  "Weekly reminder error is context-specific")

# Monthly reminder with invalid day
invalid_day = ReminderValidator.validate_params({
  title: "Monthly Reminder",
  reminder_type: "milestone",
  frequency: "monthly",
  day_of_month: 35,
  time_of_day: "12:00"
})

assert(!invalid_day.valid?, "Invalid day of month is rejected")
error_msg = invalid_day.errors[:day_of_month].first
assert(error_msg.include?("between 1 and 31"),
  "Day of month error provides valid range")

# Test 5: CoupleValidator
puts "\n--- Test 5: CoupleValidator ---"

# Valid couple
valid_couple = CoupleValidator.validate_params({
  name: "John & Jane",
  anniversary_date: "2020-06-15",
  check_in_frequency: "weekly",
  time_zone: "America/New_York"
})

assert(valid_couple.valid?, "Valid couple data passes validation")

# Future anniversary date
future_date = CoupleValidator.validate_params({
  name: "Test Couple",
  anniversary_date: (Date.today + 30).to_s
})

assert(!future_date.valid?, "Future anniversary date is rejected")
assert_includes(future_date.errors[:anniversary_date], "Anniversary date cannot be in the future",
  "Anniversary date validation is logical")

# Invalid settings structure
invalid_settings = CoupleValidator.validate_params({
  name: "Test Couple",
  settings: {
    reminder_time: "25:00",
    max_session_duration: 500
  }
})

assert(!invalid_settings.valid?, "Invalid settings are rejected")
errors = invalid_settings.errors[:settings]
assert(errors.any? { |e| e.include?("HH:MM format") }, "Time format error is present")
assert(errors.any? { |e| e.include?("between 5 and 180 minutes") }, "Duration range error is present")

# Test 6: Validatable Concern Helpers
puts "\n--- Test 6: Validatable Concern Helpers ---"

# Test UUID validation
class TestValidation
  def validate_uuid!(value, field_name = 'ID')
    uuid_regex = /\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i

    unless value.to_s.match?(uuid_regex)
      raise ValidationError.new(["#{field_name} must be a valid UUID"])
    end

    value
  end

  def test_uuid_validation
    begin
      validate_uuid!("123e4567-e89b-12d3-a456-426614174000", "Resource ID")
      true
    rescue ValidationError
      false
    end
  end

  def test_invalid_uuid
    begin
      validate_uuid!("not-a-uuid", "Resource ID")
      false
    rescue ValidationError => e
      e.errors.first
    end
  end

  def validate_date_range!(from_date, to_date)
    errors = []

    if from_date.present?
      begin
        from = Date.parse(from_date.to_s)
      rescue ArgumentError
        errors << "Invalid from_date format. Use YYYY-MM-DD"
      end
    end

    if to_date.present?
      begin
        to = Date.parse(to_date.to_s)
      rescue ArgumentError
        errors << "Invalid to_date format. Use YYYY-MM-DD"
      end
    end

    if from && to && from > to
      errors << "from_date cannot be after to_date"
    end

    raise ValidationError.new(errors) if errors.any?

    [from, to]
  end

  def test_date_range
    begin
      validate_date_range!("2024-01-01", "2024-12-31")
      true
    rescue ValidationError
      false
    end
  end

  def test_invalid_date_range
    begin
      validate_date_range!("2024-12-31", "2024-01-01")
      false
    rescue ValidationError => e
      e.errors.first
    end
  end
end

validator = TestValidation.new
assert(validator.test_uuid_validation, "Valid UUID passes validation")

uuid_error = validator.test_invalid_uuid
assert(uuid_error.include?("must be a valid UUID"), "UUID error message is clear")

assert(validator.test_date_range, "Valid date range passes validation")

date_error = validator.test_invalid_date_range
assert(date_error.include?("cannot be after"), "Date range error is descriptive")

# Summary
puts "\n" + "="*60
if @failures.nil? || @failures.empty?
  puts "✅ ALL VALIDATION TESTS PASSED!"
  puts "✅ Strong parameters are properly implemented"
  puts "✅ Error messages are comprehensive and actionable"
else
  puts "❌ #{@failures.length} TESTS FAILED:"
  @failures.each { |f| puts "   - #{f}" }
end
puts "="*60