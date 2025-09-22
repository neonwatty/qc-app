class SessionSettings < ApplicationRecord
  # Associations
  belongs_to :couple
  has_many :check_ins, dependent: :nullify

  # Validations
  validates :session_duration, numericality: { greater_than: 0 }
  validates :timeouts_per_partner, numericality: { greater_than_or_equal_to: 0 }
  validates :timeout_duration, numericality: { greater_than: 0 }
  validates :cool_down_time, numericality: { greater_than_or_equal_to: 0 }
  validates :version, numericality: { greater_than: 0 }
  validate :turn_duration_if_turn_based

  # Callbacks
  before_create :set_version_number

  # Scopes
  scope :agreed, -> { where.not(agreed_at: nil) }
  scope :current, -> { agreed.order(version: :desc).limit(1) }

  # Instance methods
  def agreed?
    agreed_at.present? && agreed_by.present?
  end

  def agree!(user_id)
    transaction do
      agreed_by << user_id unless agreed_by.include?(user_id)
      if agreed_by.length == 2
        update!(agreed_at: Time.current)
      else
        save!
      end
    end
  end

  def duplicate_with_changes(changes = {})
    new_settings = dup
    new_settings.assign_attributes(changes)
    new_settings.agreed_at = nil
    new_settings.agreed_by = []
    new_settings.version = nil
    new_settings
  end

  private

  def turn_duration_if_turn_based
    if turn_based_mode && turn_duration.blank?
      errors.add(:turn_duration, "must be present when turn-based mode is enabled")
    end
  end

  def set_version_number
    self.version = (couple.session_settings.maximum(:version) || 0) + 1
  end
end
