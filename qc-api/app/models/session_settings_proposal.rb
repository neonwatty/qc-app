class SessionSettingsProposal < ApplicationRecord
  # Associations
  belongs_to :couple
  belongs_to :proposed_by, class_name: 'User'
  belongs_to :reviewed_by, class_name: 'User', optional: true

  # Validations
  validates :settings, presence: true
  validates :status, inclusion: { in: %w[pending accepted rejected] }
  validates :proposed_at, presence: true

  # Callbacks
  before_validation :set_proposed_at, on: :create
  after_update :create_session_settings, if: :accepted?

  # Scopes
  scope :pending, -> { where(status: 'pending') }
  scope :accepted, -> { where(status: 'accepted') }
  scope :rejected, -> { where(status: 'rejected') }
  scope :recent, -> { order(proposed_at: :desc) }

  # Instance methods
  def accept!(user)
    return false if proposed_by_id == user.id

    update!(
      status: 'accepted',
      reviewed_by: user,
      reviewed_at: Time.current
    )
  end

  def reject!(user, reason = nil)
    return false if proposed_by_id == user.id

    update!(
      status: 'rejected',
      reviewed_by: user,
      reviewed_at: Time.current
    )
  end

  def pending?
    status == 'pending'
  end

  def accepted?
    status == 'accepted'
  end

  private

  def set_proposed_at
    self.proposed_at ||= Time.current
  end

  def create_session_settings
    couple.session_settings.create!(
      settings.merge(
        agreed_at: reviewed_at,
        agreed_by: [proposed_by_id, reviewed_by_id]
      )
    )
  end
end