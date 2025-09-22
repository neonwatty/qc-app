class Reminder < ApplicationRecord
  # Constants
  CATEGORIES = %w[habit check-in action-item special-date custom partner-request].freeze
  FREQUENCIES = %w[once daily weekly biweekly monthly quarterly yearly custom].freeze
  NOTIFICATION_CHANNELS = %w[in-app push email sms both all none].freeze
  DAYS_OF_WEEK = %w[sunday monday tuesday wednesday thursday friday saturday].freeze

  # Associations
  belongs_to :created_by, class_name: "User", foreign_key: "created_by"
  belongs_to :assigned_to, class_name: "User", foreign_key: "assigned_to", optional: true
  belongs_to :couple, optional: true
  belongs_to :related_check_in, class_name: "CheckIn", optional: true
  belongs_to :related_action_item, class_name: "ActionItem", optional: true
  belongs_to :converted_from_request, class_name: "RelationshipRequest", optional: true

  # Validations
  validates :title, presence: true
  validates :message, presence: true
  validates :category, inclusion: { in: CATEGORIES }
  validates :frequency, inclusion: { in: FREQUENCIES }
  validates :notification_channel, inclusion: { in: NOTIFICATION_CHANNELS }
  validates :scheduled_for, presence: true
  validates :priority, numericality: { in: 1..5 }, allow_nil: true
  validate :validate_custom_frequency
  validate :validate_scheduling_logic
  validate :validate_notification_preferences

  # Callbacks
  before_validation :set_defaults
  after_create :schedule_next_occurrence
  after_update :reschedule_if_needed, if: :saved_change_to_frequency?

  # Scopes
  scope :active, -> { where(is_active: true) }
  scope :inactive, -> { where(is_active: false) }
  scope :snoozed, -> { where(is_snoozed: true) }
  scope :not_snoozed, -> { where(is_snoozed: false) }
  scope :upcoming, -> { active.not_snoozed.where("scheduled_for > ?", Time.current).order(:scheduled_for) }
  scope :overdue, -> { active.not_snoozed.where("scheduled_for <= ? AND completed_at IS NULL", Time.current) }
  scope :for_user, ->(user) { where("created_by_id = ? OR assigned_to_id = ?", user.id, user.id) }
  scope :for_couple, ->(couple) { where(couple_id: couple.id) }
  scope :by_category, ->(category) { where(category: category) }
  scope :high_priority, -> { where("priority >= ?", 4) }
  scope :due_today, -> { where(scheduled_for: Time.current.beginning_of_day..Time.current.end_of_day) }
  scope :due_this_week, -> { where(scheduled_for: Time.current.beginning_of_week..Time.current.end_of_week) }

  # Instance methods
  def snooze!(duration = nil)
    duration ||= default_snooze_duration
    update!(
      is_snoozed: true,
      snooze_until: Time.current + duration,
      snooze_count: (snooze_count || 0) + 1
    )
  end

  def unsnooze!
    update!(is_snoozed: false, snooze_until: nil)
  end

  def complete!
    transaction do
      update!(
        completed_at: Time.current,
        completion_count: (completion_count || 0) + 1
      )
      create_next_reminder! if recurring?
    end
  end

  def skip!
    update!(
      skipped_at: Time.current,
      skip_count: (skip_count || 0) + 1
    )
    create_next_reminder! if recurring?
  end

  def should_notify?
    is_active &&
    !is_snoozed &&
    (snooze_until.nil? || snooze_until < Time.current) &&
    scheduled_for <= Time.current &&
    completed_at.nil?
  end

  def reschedule!(new_time)
    update!(
      scheduled_for: new_time,
      reschedule_count: (reschedule_count || 0) + 1
    )
  end

  def recurring?
    frequency != "once"
  end

  def next_occurrence_date
    return nil unless recurring?

    base_date = scheduled_for || Time.current

    case frequency
    when "daily"
      base_date + 1.day
    when "weekly"
      base_date + 1.week
    when "biweekly"
      base_date + 2.weeks
    when "monthly"
      base_date + 1.month
    when "quarterly"
      base_date + 3.months
    when "yearly"
      base_date + 1.year
    when "custom"
      calculate_custom_next_date(base_date)
    end
  end

  def notification_preferences
    {
      channel: notification_channel,
      advance_notice: advance_notice_minutes,
      quiet_hours: respects_quiet_hours?,
      priority: priority || 3
    }
  end

  def overdue?
    is_active &&
    !completed_at &&
    scheduled_for < Time.current
  end

  def due_soon?(within_hours = 24)
    is_active &&
    !completed_at &&
    scheduled_for.between?(Time.current, Time.current + within_hours.hours)
  end

  def completion_rate
    return 0 if completion_count.to_i == 0
    total_occurrences = completion_count.to_i + skip_count.to_i
    return 0 if total_occurrences == 0
    ((completion_count.to_f / total_occurrences) * 100).round
  end

  def duplicate_for_user(new_user)
    self.class.create!(
      attributes.except("id", "created_at", "updated_at", "completed_at").merge(
        created_by: new_user,
        assigned_to: new_user,
        is_template: false
      )
    )
  end

  private

  def set_defaults
    self.notification_channel ||= "both"
    self.is_active = true if is_active.nil?
    self.advance_notice_minutes ||= 15
    self.completion_count ||= 0
    self.skip_count ||= 0
    self.snooze_count ||= 0
    self.reschedule_count ||= 0
    self.couple ||= created_by.current_couple if created_by&.respond_to?(:current_couple) && created_by.current_couple
  end

  def create_next_reminder!
    return unless recurring? && next_occurrence_date

    self.class.create!(
      attributes.except("id", "created_at", "updated_at", "completed_at", "skipped_at").merge(
        scheduled_for: next_occurrence_date,
        parent_reminder_id: id
      )
    )
  end

  def calculate_custom_next_date(base_date)
    return nil unless custom_frequency_data.present?

    # Parse custom frequency data (e.g., specific days of week, nth day of month)
    data = custom_frequency_data

    if data["type"] == "days_of_week" && data["days"].present?
      # Find next occurrence based on selected days of week
      next_day = find_next_day_of_week(base_date, data["days"])
      next_day
    elsif data["type"] == "day_of_month" && data["day"].present?
      # Find next occurrence on specific day of month
      find_next_day_of_month(base_date, data["day"])
    else
      base_date + 1.week # Default fallback
    end
  end

  def find_next_day_of_week(from_date, days_array)
    days_array = Array(days_array).map(&:downcase)
    current_day = from_date + 1.day

    7.times do
      day_name = current_day.strftime("%A").downcase
      return current_day if days_array.include?(day_name)
      current_day += 1.day
    end

    from_date + 1.week
  end

  def find_next_day_of_month(from_date, target_day)
    target_day = target_day.to_i
    next_month = from_date.next_month

    begin
      Date.new(next_month.year, next_month.month, target_day).to_time
    rescue ArgumentError
      # If day doesn't exist in month (e.g., Feb 31), use last day
      next_month.end_of_month
    end
  end

  def default_snooze_duration
    case category
    when "habit"
      1.hour
    when "check-in"
      30.minutes
    when "action-item"
      2.hours
    when "special-date"
      1.day
    else
      1.hour
    end
  end

  def validate_custom_frequency
    return unless frequency == "custom"

    if custom_frequency_data.blank?
      errors.add(:custom_frequency_data, "is required when frequency is custom")
    end
  end

  def validate_scheduling_logic
    return unless scheduled_for.present?

    if scheduled_for < Time.current - 1.day && !persisted?
      errors.add(:scheduled_for, "cannot be more than 1 day in the past")
    end

    if scheduled_for > Time.current + 5.years
      errors.add(:scheduled_for, "cannot be more than 5 years in the future")
    end
  end

  def validate_notification_preferences
    if notification_channel == "sms" && assigned_to&.phone_number.blank?
      errors.add(:notification_channel, "SMS requires user to have a phone number")
    end

    if notification_channel == "email" && assigned_to&.email.blank?
      errors.add(:notification_channel, "Email requires user to have an email address")
    end
  end

  def schedule_next_occurrence
    # Could trigger background job for scheduling
    Rails.logger.info "Reminder #{id} scheduled for #{scheduled_for}"
  end

  def reschedule_if_needed
    if frequency_changed? && recurring?
      Rails.logger.info "Reminder #{id} frequency changed, may need rescheduling"
    end
  end

  def respects_quiet_hours?
    # Check user preferences for quiet hours
    true # Default implementation
  end
end