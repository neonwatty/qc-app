class ReminderValidator < BaseValidator
  attr_accessor :title, :description, :reminder_type, :frequency, :time_of_day,
                :days_of_week, :day_of_month, :is_active, :next_occurrence

  validates :title, presence: { message: "Reminder title is required" }
  validates :title, length: {
    minimum: 2,
    maximum: 100,
    too_short: "Title must be at least 2 characters",
    too_long: "Title cannot exceed 100 characters"
  }, if: -> { title.present? }

  validates :description, length: {
    maximum: 500,
    message: "Description cannot exceed 500 characters"
  }, if: -> { description.present? }

  validates :reminder_type, presence: { message: "Please specify the reminder type" }
  validates :reminder_type, inclusion: {
    in: %w[check_in milestone anniversary special_occasion custom],
    message: "Reminder type must be one of: check_in, milestone, anniversary, special_occasion, or custom"
  }, if: -> { reminder_type.present? }

  validates :frequency, presence: { message: "Please specify how often this reminder should occur" }
  validates :frequency, inclusion: {
    in: %w[once daily weekly biweekly monthly quarterly yearly],
    message: "Frequency must be one of: once, daily, weekly, biweekly, monthly, quarterly, or yearly"
  }, if: -> { frequency.present? }

  validate :time_of_day_is_valid
  validate :days_of_week_are_valid
  validate :day_of_month_is_valid
  validate :next_occurrence_is_valid
  validate :frequency_specific_validations

  private

  def time_of_day_is_valid
    return if time_of_day.blank?

    unless time_of_day.match?(/\A([01]?[0-9]|2[0-3]):[0-5][0-9]\z/)
      errors.add(:time_of_day,
        "Time must be in 24-hour format (HH:MM), e.g., 09:00 or 18:30")
    end
  end

  def days_of_week_are_valid
    return if days_of_week.blank?

    unless days_of_week.is_a?(Array)
      errors.add(:days_of_week, "Days of week must be provided as a list")
      return
    end

    valid_days = %w[monday tuesday wednesday thursday friday saturday sunday]
    invalid_days = days_of_week.map(&:downcase) - valid_days

    if invalid_days.any?
      errors.add(:days_of_week,
        "Invalid days: #{invalid_days.join(', ')}. Use: #{valid_days.join(', ')}")
    end

    if days_of_week.size > 7
      errors.add(:days_of_week, "Cannot select more than 7 days")
    end
  end

  def day_of_month_is_valid
    return if day_of_month.blank?

    day = day_of_month.to_i
    if day < 1 || day > 31
      errors.add(:day_of_month, "Day of month must be between 1 and 31")
    elsif day > 28
      errors.add(:day_of_month,
        "Days 29-31 may not occur in all months. Consider using 28 or earlier for consistent reminders")
    end
  end

  def next_occurrence_is_valid
    return if next_occurrence.blank?

    begin
      datetime = DateTime.parse(next_occurrence.to_s)
      if datetime < DateTime.current
        errors.add(:next_occurrence, "Next occurrence cannot be in the past")
      elsif datetime > DateTime.current + 5.years
        errors.add(:next_occurrence, "Next occurrence cannot be more than 5 years in the future")
      end
    rescue ArgumentError
      errors.add(:next_occurrence, "Invalid datetime format. Use ISO 8601 format (YYYY-MM-DDTHH:MM:SS)")
    end
  end

  def frequency_specific_validations
    return if frequency.blank?

    case frequency
    when 'weekly', 'biweekly'
      if days_of_week.blank? || days_of_week.empty?
        errors.add(:days_of_week,
          "Please select at least one day of the week for #{frequency} reminders")
      end
    when 'monthly'
      if day_of_month.blank?
        errors.add(:day_of_month,
          "Please specify which day of the month for monthly reminders")
      end
    when 'once'
      if next_occurrence.blank?
        errors.add(:next_occurrence,
          "Please specify when this one-time reminder should occur")
      end
    end

    # All recurring reminders need a time
    if frequency != 'once' && time_of_day.blank?
      errors.add(:time_of_day,
        "Please specify what time of day for recurring reminders")
    end
  end
end