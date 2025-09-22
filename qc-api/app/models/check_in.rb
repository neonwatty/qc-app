class CheckIn < ApplicationRecord
  # Constants for state management
  STATUSES = %w[preparing in-progress reviewing completed abandoned].freeze
  STEPS = %w[welcome category_selection discussion reflection action_items completion].freeze

  # Associations
  belongs_to :couple
  belongs_to :session_settings, optional: true
  has_many :notes, dependent: :destroy
  has_many :action_items, dependent: :destroy
  has_one :session_preparation, foreign_key: "session_id", dependent: :destroy
  has_many :quick_reflections, foreign_key: "session_id", dependent: :destroy
  has_many :love_language_discoveries, dependent: :destroy
  has_many :relationship_requests, foreign_key: "related_check_in_id"
  has_many :reminders, foreign_key: "related_check_in_id"

  # Validations
  validates :status, inclusion: { in: STATUSES }
  validates :started_at, presence: true
  validates :mood_before, numericality: { in: 1..5 }, allow_nil: true
  validates :mood_after, numericality: { in: 1..5 }, allow_nil: true
  validates :current_step, inclusion: { in: STEPS }, allow_nil: true
  validate :validate_state_transition, on: :update
  validate :validate_participants_count

  # Callbacks
  before_create :set_initial_state
  after_update :update_couple_stats, if: :completed?
  after_update :track_step_completion, if: :saved_change_to_current_step?

  # Scopes
  scope :completed, -> { where(status: "completed") }
  scope :in_progress, -> { where(status: "in-progress") }
  scope :abandoned, -> { where(status: "abandoned") }
  scope :recent, -> { order(started_at: :desc) }
  scope :preparing, -> { where(status: "preparing") }
  scope :reviewing, -> { where(status: "reviewing") }
  scope :active, -> { where(status: [ "preparing", "in-progress", "reviewing" ]) }

  # State transition methods
  def start!
    return false unless can_start?
    update!(
      status: "in-progress",
      current_step: "welcome"
    )
  end

  def complete!
    return false unless can_complete?
    update!(
      status: "completed",
      completed_at: Time.current,
      current_step: "completion"
    )
  end

  def abandon!
    return false if completed?
    update!(
      status: "abandoned",
      abandoned_at: Time.current
    )
  end

  def move_to_step!(step)
    return false unless STEPS.include?(step)
    return false unless can_move_to_step?(step)

    update!(current_step: step)
  end

  def enter_review!
    return false unless in_progress?
    update!(status: "reviewing")
  end

  # Status check methods
  def completed?
    status == "completed"
  end

  def in_progress?
    status == "in-progress"
  end

  def preparing?
    status == "preparing"
  end

  def reviewing?
    status == "reviewing"
  end

  def abandoned?
    status == "abandoned"
  end

  def active?
    [ "preparing", "in-progress", "reviewing" ].include?(status)
  end

  def duration
    return nil unless completed_at
    ((completed_at - started_at) / 60).round
  end

  def add_participant(user_id)
    participants << user_id unless participants.include?(user_id)
    save
  end

  def add_category(category_id)
    categories << category_id unless categories.include?(category_id)
    save
  end

  def calculate_progress_percentage
    return 0 unless current_step.present?
    step_index = STEPS.index(current_step) || 0
    ((step_index + 1).to_f / STEPS.length * 100).round
  end

  private

  def set_initial_state
    self.status ||= "preparing"
    self.participants ||= []
    self.categories ||= []
    self.step_durations ||= {}
    self.started_at ||= Time.current
  end

  def update_couple_stats
    couple.update_stats!
  end

  def track_step_completion
    return unless current_step_previously_was.present?

    duration = Time.current - (step_durations[current_step_previously_was] || started_at)
    step_durations[current_step_previously_was] = duration.to_i
    save
  end

  def validate_state_transition
    return unless status_changed?

    valid_transitions = {
      "preparing" => [ "in-progress", "abandoned" ],
      "in-progress" => [ "reviewing", "abandoned" ],
      "reviewing" => [ "completed", "abandoned" ],
      "completed" => [],
      "abandoned" => []
    }

    unless valid_transitions[status_was]&.include?(status)
      errors.add(:status, "Invalid state transition from #{status_was} to #{status}")
    end
  end

  def validate_participants_count
    if participants.present? && participants.length > 2
      errors.add(:participants, "Cannot have more than 2 participants")
    end
  end

  def can_start?
    preparing? && participants.present?
  end

  def can_complete?
    reviewing? && mood_after.present?
  end

  def can_move_to_step?(step)
    return false unless in_progress?
    current_index = STEPS.index(current_step) || -1
    new_index = STEPS.index(step)
    new_index > current_index
  end
end
