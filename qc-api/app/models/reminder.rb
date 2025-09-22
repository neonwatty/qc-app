class Reminder < ApplicationRecord
  # Associations
  belongs_to :created_by, class_name: "User"
  belongs_to :assigned_to, class_name: "User", optional: true
  belongs_to :related_check_in, class_name: "CheckIn", optional: true
  belongs_to :related_action_item, class_name: "ActionItem", optional: true
  belongs_to :converted_from_request, class_name: "RelationshipRequest", optional: true

  # Validations
  validates :title, presence: true
  validates :message, presence: true
  validates :category, inclusion: { in: %w[habit check-in action-item special-date custom] }
  validates :frequency, inclusion: { in: %w[once daily weekly monthly custom] }
  validates :notification_channel, inclusion: { in: %w[in-app push both none] }
  validates :scheduled_for, presence: true

  # Callbacks
  before_validation :set_defaults

  # Scopes
  scope :active, -> { where(is_active: true) }
  scope :inactive, -> { where(is_active: false) }
  scope :snoozed, -> { where(is_snoozed: true) }
  scope :upcoming, -> { active.where("scheduled_for > ?", Time.current).order(:scheduled_for) }
  scope :overdue, -> { active.where("scheduled_for <= ? AND completed_at IS NULL", Time.current) }
  scope :for_user, ->(user) { where("created_by = ? OR assigned_to = ?", user.id, user.id) }

  # Instance methods
  def snooze!(duration = 1.hour)
    update!(
      is_snoozed: true,
      snooze_until: Time.current + duration
    )
  end

  def unsnooze!
    update!(is_snoozed: false, snooze_until: nil)
  end

  def complete!
    update!(completed_at: Time.current)
  end

  def should_notify?
    is_active && !is_snoozed && (snooze_until.nil? || snooze_until < Time.current)
  end

  def reschedule!(new_time)
    update!(scheduled_for: new_time)
  end

  private

  def set_defaults
    self.notification_channel ||= "both"
  end
end
