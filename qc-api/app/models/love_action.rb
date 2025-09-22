class LoveAction < ApplicationRecord
  # Associations
  belongs_to :linked_language, class_name: 'LoveLanguage'
  belongs_to :for_user, class_name: 'User'
  belongs_to :created_by, class_name: 'User'
  belongs_to :suggested_by_user, class_name: 'User', foreign_key: 'suggested_by_id', optional: true

  # Validations
  validates :title, presence: true
  validates :suggested_by, inclusion: { in: %w[self partner ai] }
  validates :status, inclusion: { in: %w[suggested planned completed recurring] }
  validates :frequency, inclusion: { in: %w[once weekly monthly surprise] }, allow_nil: true
  validates :difficulty, inclusion: { in: %w[easy moderate challenging] }
  validates :completed_count, numericality: { greater_than_or_equal_to: 0 }

  # Callbacks
  after_update :update_last_completed, if: :saved_change_to_completed_count?

  # Scopes
  scope :suggested, -> { where(status: 'suggested') }
  scope :planned, -> { where(status: 'planned') }
  scope :completed, -> { where(status: 'completed') }
  scope :recurring, -> { where(status: 'recurring') }
  scope :upcoming, -> { where(status: 'planned').where('planned_for >= ?', Date.current).order(:planned_for) }
  scope :easy, -> { where(difficulty: 'easy') }
  scope :by_difficulty, -> { order(Arel.sql("CASE difficulty WHEN 'easy' THEN 1 WHEN 'moderate' THEN 2 WHEN 'challenging' THEN 3 END")) }

  # Instance methods
  def complete!
    transaction do
      increment!(:completed_count)
      update!(
        last_completed_at: Time.current,
        status: frequency == 'once' ? 'completed' : status
      )
    end
  end

  def plan!(date)
    update!(status: 'planned', planned_for: date)
  end

  def mark_recurring!
    update!(status: 'recurring') if frequency && frequency != 'once'
  end

  private

  def update_last_completed
    update_column(:last_completed_at, Time.current) if completed_count > 0
  end
end