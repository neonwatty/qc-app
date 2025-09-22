class SessionSettingsProposal < ApplicationRecord
  # Constants
  STATUSES = %w[pending accepted rejected expired withdrawn].freeze
  EXPIRATION_DAYS = 7

  # Associations
  belongs_to :couple
  belongs_to :proposed_by, class_name: "User", foreign_key: "proposed_by"
  belongs_to :reviewed_by, class_name: "User", foreign_key: "reviewed_by", optional: true
  belongs_to :current_settings, class_name: "SessionSettings", optional: true
  has_many :comments, as: :commentable, dependent: :destroy

  # Validations
  validates :settings, presence: true
  validates :status, inclusion: { in: STATUSES }
  validates :proposed_at, presence: true
  validates :title, presence: true, length: { maximum: 100 }
  validates :reason, presence: true, length: { maximum: 500 }
  validate :settings_are_valid
  validate :cannot_review_own_proposal
  validate :proposal_not_expired

  # Callbacks
  before_validation :set_proposed_at, on: :create
  before_validation :set_default_status, on: :create
  after_update :create_session_settings, if: :accepted?
  after_update :notify_status_change

  # Scopes
  scope :pending, -> { where(status: "pending") }
  scope :accepted, -> { where(status: "accepted") }
  scope :rejected, -> { where(status: "rejected") }
  scope :expired, -> { where(status: "expired") }
  scope :withdrawn, -> { where(status: "withdrawn") }
  scope :active, -> { where(status: %w[pending]) }
  scope :recent, -> { order(proposed_at: :desc) }
  scope :expiring_soon, -> {
    pending.where("proposed_at < ?", (EXPIRATION_DAYS - 1).days.ago)
  }

  # Instance methods
  def accept!(user, message = nil)
    return false if proposed_by == user.id
    return false unless can_be_reviewed?

    transaction do
      update!(
        status: "accepted",
        reviewed_by: user,
        reviewed_at: Time.current,
        review_message: message
      )
      create_acceptance_comment(user, message) if message
    end
  end

  def reject!(user, reason = nil)
    return false if proposed_by == user.id
    return false unless can_be_reviewed?

    transaction do
      update!(
        status: "rejected",
        reviewed_by: user,
        reviewed_at: Time.current,
        rejection_reason: reason
      )
      create_rejection_comment(user, reason) if reason
    end
  end

  def withdraw!(reason = nil)
    return false unless pending?

    update!(
      status: "withdrawn",
      withdrawn_at: Time.current,
      withdrawal_reason: reason
    )
  end

  def expire!
    return false unless pending?
    return false unless expired?

    update!(
      status: "expired",
      expired_at: Time.current
    )
  end

  def pending?
    status == "pending"
  end

  def accepted?
    status == "accepted"
  end

  def rejected?
    status == "rejected"
  end

  def withdrawn?
    status == "withdrawn"
  end

  def expired?
    return false unless pending?
    proposed_at < EXPIRATION_DAYS.days.ago
  end

  def can_be_reviewed?
    pending? && !expired?
  end

  def days_until_expiration
    return 0 if expired?
    return nil unless pending?

    ((proposed_at + EXPIRATION_DAYS.days - Time.current) / 1.day).ceil
  end

  def changes_summary
    return {} unless current_settings && settings

    changes = {}
    settings.each do |key, value|
      current_value = current_settings.send(key) rescue nil
      changes[key] = { from: current_value, to: value } if current_value != value
    end
    changes
  end

  def add_comment(user, content)
    comments.create!(
      author: user,
      content: content,
      created_at: Time.current
    )
  end

  private

  def set_proposed_at
    self.proposed_at ||= Time.current
  end

  def set_default_status
    self.status ||= "pending"
  end

  def settings_are_valid
    return unless settings

    required_keys = %w[session_duration timeouts_per_partner timeout_duration cool_down_time]
    missing_keys = required_keys - settings.keys

    if missing_keys.any?
      errors.add(:settings, "missing required fields: #{missing_keys.join(', ')}")
    end

    # Validate numeric ranges
    if settings['session_duration'] && (settings['session_duration'] < 5 || settings['session_duration'] > 120)
      errors.add(:settings, "session_duration must be between 5 and 120 minutes")
    end
  end

  def cannot_review_own_proposal
    if reviewed_by && reviewed_by == proposed_by
      errors.add(:reviewed_by, "cannot review your own proposal")
    end
  end

  def proposal_not_expired
    if pending? && expired? && !status_changed?
      errors.add(:base, "proposal has expired and cannot be modified")
    end
  end

  def create_session_settings
    new_settings = couple.session_settings.create!(
      settings.merge(
        agreed_at: reviewed_at,
        agreed_by: [proposed_by, reviewed_by]
      )
    )
    update_column(:created_settings_id, new_settings.id)
  end

  def notify_status_change
    case status
    when "accepted"
      Rails.logger.info "Proposal #{id} accepted by #{reviewed_by}"
      # Send notification to proposed_by
    when "rejected"
      Rails.logger.info "Proposal #{id} rejected by #{reviewed_by}"
      # Send notification to proposed_by
    when "expired"
      Rails.logger.info "Proposal #{id} expired"
      # Send notification to both partners
    end
  end

  def create_acceptance_comment(user, message)
    add_comment(user, "Accepted proposal: #{message}")
  end

  def create_rejection_comment(user, reason)
    add_comment(user, "Rejected proposal: #{reason}")
  end
end
