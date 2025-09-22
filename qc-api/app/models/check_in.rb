class CheckIn < ApplicationRecord
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
  validates :status, inclusion: { in: %w[in-progress completed abandoned] }
  validates :started_at, presence: true
  validates :mood_before, numericality: { in: 1..5 }, allow_nil: true
  validates :mood_after, numericality: { in: 1..5 }, allow_nil: true

  # Callbacks
  after_update :update_couple_stats, if: :completed?

  # Scopes
  scope :completed, -> { where(status: "completed") }
  scope :in_progress, -> { where(status: "in-progress") }
  scope :abandoned, -> { where(status: "abandoned") }
  scope :recent, -> { order(started_at: :desc) }

  # Instance methods
  def complete!
    update!(
      status: "completed",
      completed_at: Time.current
    )
  end

  def abandon!
    update!(status: "abandoned")
  end

  def duration
    return nil unless completed_at
    ((completed_at - started_at) / 60).round
  end

  def completed?
    status == "completed"
  end

  def in_progress?
    status == "in-progress"
  end

  def add_participant(user_id)
    participants << user_id unless participants.include?(user_id)
    save
  end

  def add_category(category_id)
    categories << category_id unless categories.include?(category_id)
    save
  end

  private

  def update_couple_stats
    couple.update_stats!
  end
end
