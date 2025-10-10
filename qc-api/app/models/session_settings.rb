class SessionSettings < ApplicationRecord
  # Constants
  DEFAULT_SETTINGS = {
    session_duration: 30, # minutes
    timeouts_per_partner: 2,
    timeout_duration: 5, # minutes
    cool_down_time: 10, # minutes
    turn_based_mode: false,
    turn_duration: nil,
    categories_enabled: %w[communication trust growth intimacy],
    notification_timing: 'immediate',
    reminder_frequency: 'weekly',
    break_intervals: 15, # minutes
    max_session_length: 60, # minutes
    allow_async_mode: false,
    require_both_present: true,
    auto_save_notes: true,
    privacy_mode: 'shared'
  }.freeze

  NOTIFICATION_TIMINGS = %w[immediate 15min 30min 1hour 1day].freeze
  REMINDER_FREQUENCIES = %w[daily weekly biweekly monthly].freeze
  PRIVACY_MODES = %w[private shared selective].freeze

  # Associations
  belongs_to :couple
  has_many :check_ins, dependent: :nullify
  has_many :proposals, class_name: 'SessionSettingsProposal', foreign_key: 'current_settings_id', dependent: :destroy

  # Validations
  validates :session_duration, numericality: { greater_than: 0, less_than_or_equal_to: 120 }
  validates :timeouts_per_partner, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 5 }
  validates :timeout_duration, numericality: { greater_than: 0, less_than_or_equal_to: 30 }
  validates :cool_down_time, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 60 }
  validates :version, numericality: { greater_than: 0 }
  validates :notification_timing, inclusion: { in: NOTIFICATION_TIMINGS }, allow_nil: true
  validates :reminder_frequency, inclusion: { in: REMINDER_FREQUENCIES }, allow_nil: true
  validates :privacy_mode, inclusion: { in: PRIVACY_MODES }, allow_nil: true
  validate :turn_duration_if_turn_based
  validate :categories_must_be_valid
  validate :break_interval_validity

  # Callbacks
  before_create :set_version_number
  after_create :archive_previous_settings

  # Scopes
  scope :agreed, -> { where.not(agreed_at: nil) }
  scope :current, -> { agreed.order(version: :desc).limit(1) }
  scope :archived, -> { where(archived: true) }
  scope :active, -> { where(archived: false) }

  # Instance methods
  def agreed?
    agreed_at.present? && agreed_by.present?
  end

  def agree!(user_id)
    transaction do
      agreed_by << user_id unless agreed_by.include?(user_id)
      if agreed_by.length == 2
        update!(agreed_at: Time.current)
        notify_agreement_reached
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
    new_settings.archived = false
    new_settings
  end

  def apply_template!(template_name)
    template = load_template(template_name)
    return false unless template

    update!(template)
  end

  def export_as_template
    attributes.slice(
      'session_duration', 'timeouts_per_partner', 'timeout_duration',
      'cool_down_time', 'turn_based_mode', 'turn_duration',
      'categories_enabled', 'notification_timing', 'reminder_frequency',
      'break_intervals', 'max_session_length', 'allow_async_mode',
      'require_both_present', 'auto_save_notes', 'privacy_mode'
    )
  end

  def calculate_total_time
    base_time = session_duration
    base_time += (timeouts_per_partner * 2 * timeout_duration)
    base_time += cool_down_time
    base_time
  end

  def async_mode_allowed?
    allow_async_mode == true
  end

  def requires_both_partners?
    require_both_present == true
  end

  def auto_saves_notes?
    auto_save_notes == true
  end

  def notification_delay_minutes
    case notification_timing
    when 'immediate' then 0
    when '15min' then 15
    when '30min' then 30
    when '1hour' then 60
    when '1day' then 1440
    else 0
    end
  end

  def reminder_frequency_days
    case reminder_frequency
    when 'daily' then 1
    when 'weekly' then 7
    when 'biweekly' then 14
    when 'monthly' then 30
    else 7
    end
  end

  private

  def turn_duration_if_turn_based
    if turn_based_mode && turn_duration.blank?
      errors.add(:turn_duration, "must be present when turn-based mode is enabled")
    elsif turn_based_mode && turn_duration && turn_duration <= 0
      errors.add(:turn_duration, "must be positive when turn-based mode is enabled")
    end
  end

  def categories_must_be_valid
    return unless categories_enabled

    valid_categories = %w[communication trust growth intimacy conflict appreciation fun planning]
    invalid_categories = categories_enabled - valid_categories

    if invalid_categories.any?
      errors.add(:categories_enabled, "contains invalid categories: #{invalid_categories.join(', ')}")
    end
  end

  def break_interval_validity
    return unless break_intervals

    if break_intervals < 5
      errors.add(:break_intervals, "must be at least 5 minutes")
    elsif break_intervals > session_duration
      errors.add(:break_intervals, "cannot exceed session duration")
    end
  end

  def set_version_number
    self.version = (couple.session_settings.maximum(:version) || 0) + 1
  end

  def archive_previous_settings
    couple.session_settings
          .where.not(id: id)
          .active
          .update_all(archived: true)
  end

  def notify_agreement_reached
    # Notification logic here
    Rails.logger.info "Session settings #{id} agreed upon by both partners"
  end

  def load_template(template_name)
    case template_name
    when 'quick_checkin'
      DEFAULT_SETTINGS.merge(session_duration: 15, break_intervals: nil)
    when 'deep_dive'
      DEFAULT_SETTINGS.merge(session_duration: 60, break_intervals: 20)
    when 'conflict_resolution'
      DEFAULT_SETTINGS.merge(
        session_duration: 45,
        categories_enabled: %w[conflict communication trust],
        cool_down_time: 15
      )
    else
      nil
    end
  end
end
