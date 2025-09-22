class CoupleValidator < BaseValidator
  attr_accessor :name, :anniversary_date, :check_in_frequency, :time_zone, :settings

  validates :name, presence: { message: "Couple name is required" }
  validates :name, length: {
    minimum: 2,
    maximum: 100,
    too_short: "Couple name must be at least 2 characters",
    too_long: "Couple name cannot exceed 100 characters"
  }, if: -> { name.present? }

  validates :check_in_frequency, inclusion: {
    in: %w[daily weekly biweekly monthly],
    message: "Check-in frequency must be one of: daily, weekly, biweekly, or monthly"
  }, allow_blank: true

  validate :time_zone_is_valid
  validate :anniversary_date_is_valid
  validate :settings_are_valid

  private

  def time_zone_is_valid
    return if time_zone.blank?

    valid_zones = ActiveSupport::TimeZone.all.map(&:name)
    unless valid_zones.include?(time_zone)
      errors.add(:time_zone, "Invalid time zone. Please select a valid time zone from the list")
    end
  end

  def anniversary_date_is_valid
    return if anniversary_date.blank?

    begin
      date = Date.parse(anniversary_date.to_s)
      if date > Date.current
        errors.add(:anniversary_date, "Anniversary date cannot be in the future")
      elsif date < Date.current - 100.years
        errors.add(:anniversary_date, "Anniversary date seems invalid (over 100 years ago)")
      end
    rescue ArgumentError
      errors.add(:anniversary_date, "Invalid date format. Please use YYYY-MM-DD format")
    end
  end

  def settings_are_valid
    return if settings.blank?

    unless settings.is_a?(Hash)
      errors.add(:settings, "Settings must be a JSON object")
      return
    end

    # Validate specific settings if present
    if settings['reminder_time'].present?
      unless settings['reminder_time'].match?(/\A([01]?[0-9]|2[0-3]):[0-5][0-9]\z/)
        errors.add(:settings,
          "Reminder time must be in HH:MM format (e.g., 09:00 or 21:30)")
      end
    end

    if settings['max_session_duration'].present?
      duration = settings['max_session_duration'].to_i
      if duration < 5 || duration > 180
        errors.add(:settings,
          "Max session duration must be between 5 and 180 minutes")
      end
    end

    if settings['notification_preferences'].present?
      unless settings['notification_preferences'].is_a?(Hash)
        errors.add(:settings,
          "Notification preferences must be a JSON object with email, push, and sms settings")
      end
    end
  end
end