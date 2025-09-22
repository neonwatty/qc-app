class RelationshipRequest < ApplicationRecord
  # Constants
  CATEGORIES = %w[activity task reminder conversation date-night custom appreciation challenge].freeze
  PRIORITIES = %w[low medium high urgent].freeze
  STATUSES = %w[pending accepted declined converted expired].freeze
  FREQUENCIES = %w[once daily weekly biweekly monthly quarterly yearly].freeze
  NOTIFICATION_PREFERENCES = %w[immediate daily-digest weekly-digest none].freeze
  RESPONSE_ACTIONS = %w[accept decline convert defer discuss].freeze

  # Associations
  belongs_to :requested_by, class_name: "User", foreign_key: "requested_by"
  belongs_to :requested_for, class_name: "User", foreign_key: "requested_for"
  belongs_to :couple, optional: true
  belongs_to :related_check_in, class_name: "CheckIn", optional: true
  has_one :reminder, foreign_key: "converted_from_request_id", dependent: :nullify
  has_many :discussion_notes, class_name: "Note", foreign_key: "related_request_id", dependent: :destroy

  # Validations
  validates :title, presence: true
  validates :description, presence: true
  validates :category, inclusion: { in: CATEGORIES }
  validates :priority, inclusion: { in: PRIORITIES }
  validates :status, inclusion: { in: STATUSES }
  validates :suggested_frequency, inclusion: { in: FREQUENCIES }, allow_nil: true
  validates :notification_preference, inclusion: { in: NOTIFICATION_PREFERENCES }, allow_nil: true
  validates :expires_at, presence: true, if: :should_expire?
  validate :validate_status_transition, on: :update
  validate :validate_scheduling_data
  validate :validate_response_required
  validate :validate_users_in_couple

  # Callbacks
  before_validation :set_defaults
  after_update :set_responded_at, if: :saved_change_to_status?
  after_update :handle_status_change, if: :saved_change_to_status?
  after_create :schedule_expiration_reminder

  # Scopes
  scope :pending, -> { where(status: "pending") }
  scope :accepted, -> { where(status: "accepted") }
  scope :declined, -> { where(status: "declined") }
  scope :converted, -> { where(status: "converted") }
  scope :expired, -> { where(status: "expired") }
  scope :active, -> { where(status: %w[pending accepted]) }
  scope :requiring_response, -> { pending.where("response_required_by > ?", Time.current) }
  scope :overdue, -> { pending.where("response_required_by <= ?", Time.current) }
  scope :for_user, ->(user) { where("requested_by = ? OR requested_for = ?", user.id, user.id) }
  scope :inbox_for, ->(user) { where(requested_for: user.id, status: "pending") }
  scope :sent_by, ->(user) { where(requested_by: user) }
  scope :for_couple, ->(couple) { where(couple_id: couple.id) }
  scope :by_category, ->(category) { where(category: category) }
  scope :by_priority, -> {
    order(
      Arel.sql(
        "CASE priority
         WHEN 'urgent' THEN 0
         WHEN 'high' THEN 1
         WHEN 'medium' THEN 2
         WHEN 'low' THEN 3
         ELSE 4
         END"
      )
    )
  }
  scope :high_priority, -> { where(priority: %w[urgent high]) }
  scope :needs_immediate_attention, -> {
    pending.where("priority IN (?) OR response_required_by <= ?", %w[urgent high], 24.hours.from_now)
  }
  scope :upcoming_activities, -> {
    accepted.where(category: %w[activity date-night]).where("suggested_date >= ?", Time.current)
  }

  # Instance methods
  def accept!(response_message = nil, additional_notes = nil)
    return false unless can_accept?

    transaction do
      update!(
        status: "accepted",
        response: response_message,
        response_notes: additional_notes,
        accepted_at: Time.current
      )
      create_acceptance_reminder if should_create_reminder?
    end
  end

  def decline!(response_message = nil, reason = nil)
    return false unless can_decline?

    update!(
      status: "declined",
      response: response_message,
      decline_reason: reason,
      declined_at: Time.current
    )
  end

  def defer!(until_date, reason = nil)
    return false unless pending?

    update!(
      deferred_until: until_date,
      defer_reason: reason,
      defer_count: (defer_count || 0) + 1
    )
  end

  def expire!
    return false unless can_expire?

    update!(
      status: "expired",
      expired_at: Time.current
    )
  end

  def convert_to_reminder!(reminder_params = {})
    return false unless can_convert?

    transaction do
      # Build comprehensive reminder params
      default_params = build_reminder_params
      final_params = default_params.merge(reminder_params)

      reminder = Reminder.create!(final_params)

      update!(
        status: "converted",
        converted_to_reminder_id: reminder.id,
        converted_at: Time.current
      )

      reminder
    end
  end

  def mark_as_discussed!
    update!(
      discussed: true,
      discussed_at: Time.current
    )
  end

  def add_discussion_note(user, content)
    discussion_notes.create!(
      author: user,
      content: content,
      privacy: "shared"
    )
  end

  def pending?
    status == "pending"
  end

  def accepted?
    status == "accepted"
  end

  def declined?
    status == "declined"
  end

  def converted?
    status == "converted"
  end

  def expired?
    status == "expired"
  end

  def overdue?
    pending? && response_required_by && response_required_by < Time.current
  end

  def requires_urgent_response?
    pending? && (
      priority == "urgent" ||
      (response_required_by && response_required_by <= 24.hours.from_now)
    )
  end

  def can_be_deferred?
    pending? && defer_count.to_i < 3
  end

  def days_until_response_required
    return nil unless response_required_by
    return 0 if overdue?
    ((response_required_by - Time.current) / 1.day).ceil
  end

  def response_time_hours
    return nil unless responded_at
    ((responded_at - created_at) / 1.hour).round
  end

  def notification_schedule
    case notification_preference
    when "immediate"
      { send_at: Time.current }
    when "daily-digest"
      { send_at: Time.current.next_day.beginning_of_day + 8.hours }
    when "weekly-digest"
      { send_at: Time.current.next_week.beginning_of_week + 8.hours }
    else
      nil
    end
  end

  private

  def set_defaults
    self.status ||= "pending"
    self.priority ||= "medium"
    self.notification_preference ||= "immediate"
    self.couple ||= requested_by.current_couple if requested_by&.respond_to?(:current_couple) && requested_by.current_couple
    self.expires_at ||= 30.days.from_now if should_expire?
    self.response_required_by ||= calculate_response_deadline
  end

  def set_responded_at
    if %w[accepted declined converted].include?(status)
      update_column(:responded_at, Time.current) unless responded_at
    end
  end

  def handle_status_change
    case status
    when "accepted"
      Rails.logger.info "Request #{id} accepted by #{requested_for.id}"
      notify_requester_of_acceptance
    when "declined"
      Rails.logger.info "Request #{id} declined by #{requested_for.id}"
      notify_requester_of_decline
    when "expired"
      Rails.logger.info "Request #{id} expired"
      notify_both_users_of_expiration
    end
  end

  def schedule_expiration_reminder
    return unless expires_at
    # Could trigger background job for expiration handling
    Rails.logger.info "Request #{id} scheduled to expire at #{expires_at}"
  end

  def build_reminder_params
    {
      title: title,
      message: description,
      created_by: requested_by,
      assigned_to: requested_for,
      category: map_category_to_reminder,
      frequency: suggested_frequency || "once",
      scheduled_for: suggested_date || 1.day.from_now,
      priority: map_priority_to_reminder,
      notification_channel: map_notification_preference,
      converted_from_request_id: id,
      couple: couple
    }
  end

  def map_category_to_reminder
    case category
    when "activity", "date-night"
      "special-date"
    when "task"
      "action-item"
    when "reminder"
      "custom"
    when "conversation"
      "check-in"
    else
      "custom"
    end
  end

  def map_priority_to_reminder
    case priority
    when "urgent" then 5
    when "high" then 4
    when "medium" then 3
    when "low" then 2
    else 3
    end
  end

  def map_notification_preference
    case notification_preference
    when "immediate" then "both"
    when "daily-digest", "weekly-digest" then "in-app"
    when "none" then "none"
    else "both"
    end
  end

  def calculate_response_deadline
    case priority
    when "urgent"
      24.hours.from_now
    when "high"
      3.days.from_now
    when "medium"
      7.days.from_now
    when "low"
      14.days.from_now
    else
      7.days.from_now
    end
  end

  def should_expire?
    %w[pending].include?(status)
  end

  def should_create_reminder?
    suggested_date.present? || suggested_frequency.present?
  end

  def create_acceptance_reminder
    return unless should_create_reminder?

    Reminder.create!(
      title: "#{title} (Accepted Request)",
      message: "This was accepted from a partner request: #{description}",
      created_by: requested_for,
      assigned_to: requested_for,
      category: map_category_to_reminder,
      frequency: suggested_frequency || "once",
      scheduled_for: suggested_date || 1.week.from_now,
      notification_channel: "both",
      couple: couple,
      related_action_item_id: nil,
      converted_from_request_id: id
    )
  end

  def can_accept?
    pending? && !expired?
  end

  def can_decline?
    pending? && !expired?
  end

  def can_convert?
    %w[pending accepted].include?(status) && !expired?
  end

  def can_expire?
    pending? && expires_at && expires_at <= Time.current
  end

  def validate_status_transition
    return unless status_changed?

    valid_transitions = {
      "pending" => %w[accepted declined converted expired],
      "accepted" => %w[converted],
      "declined" => [],
      "converted" => [],
      "expired" => []
    }

    unless valid_transitions[status_was]&.include?(status)
      errors.add(:status, "Invalid status transition from #{status_was} to #{status}")
    end
  end

  def validate_scheduling_data
    if suggested_date.present? && suggested_date < Time.current
      errors.add(:suggested_date, "cannot be in the past")
    end

    if response_required_by.present? && response_required_by < Time.current && !persisted?
      errors.add(:response_required_by, "cannot be in the past")
    end
  end

  def validate_response_required
    if priority == "urgent" && response_required_by.nil?
      errors.add(:response_required_by, "is required for urgent requests")
    end
  end

  def validate_users_in_couple
    return unless couple.present?

    unless couple.users.include?(requested_by)
      errors.add(:requested_by, "must be a member of the couple")
    end

    unless couple.users.include?(requested_for)
      errors.add(:requested_for, "must be a member of the couple")
    end
  end

  def notify_requester_of_acceptance
    # Notification logic here
  end

  def notify_requester_of_decline
    # Notification logic here
  end

  def notify_both_users_of_expiration
    # Notification logic here
  end
end
