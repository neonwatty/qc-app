class RelationshipRequest < ApplicationRecord
  # Associations
  belongs_to :requested_by, class_name: 'User'
  belongs_to :requested_for, class_name: 'User'
  belongs_to :related_check_in, class_name: 'CheckIn', optional: true
  has_one :reminder, foreign_key: 'converted_from_request_id', dependent: :nullify

  # Validations
  validates :title, presence: true
  validates :description, presence: true
  validates :category, inclusion: { in: %w[activity task reminder conversation date-night custom] }
  validates :priority, inclusion: { in: %w[low medium high] }
  validates :status, inclusion: { in: %w[pending accepted declined converted] }
  validates :suggested_frequency, inclusion: { in: %w[once recurring] }, allow_nil: true

  # Callbacks
  after_update :set_responded_at, if: :saved_change_to_status?

  # Scopes
  scope :pending, -> { where(status: 'pending') }
  scope :accepted, -> { where(status: 'accepted') }
  scope :declined, -> { where(status: 'declined') }
  scope :converted, -> { where(status: 'converted') }
  scope :for_user, ->(user) { where('requested_by_id = ? OR requested_for_id = ?', user.id, user.id) }
  scope :inbox_for, ->(user) { where(requested_for_id: user.id, status: 'pending') }
  scope :by_priority, -> { order(Arel.sql("CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END")) }

  # Instance methods
  def accept!(response_message = nil)
    update!(status: 'accepted', response: response_message)
  end

  def decline!(response_message = nil)
    update!(status: 'declined', response: response_message)
  end

  def convert_to_reminder!(reminder_params = {})
    transaction do
      reminder = Reminder.create!(
        reminder_params.merge(
          title: title,
          message: description,
          created_by: requested_by,
          assigned_to: requested_for,
          converted_from_request_id: id
        )
      )
      update!(status: 'converted', converted_to_reminder_id: reminder.id)
      reminder
    end
  end

  private

  def set_responded_at
    if %w[accepted declined].include?(status)
      update_column(:responded_at, Time.current)
    end
  end
end