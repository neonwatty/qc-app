class MilestoneProgressUpdate < ApplicationRecord
  # Associations
  belongs_to :milestone

  # Validations
  validates :new_progress, numericality: { in: 0..100 }
  validates :previous_progress, numericality: { in: 0..100 }, allow_nil: true

  # Callbacks
  before_validation :set_previous_progress

  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  scope :significant, -> { where("ABS(new_progress - COALESCE(previous_progress, 0)) >= 10") }

  # Instance methods
  def progress_change
    (new_progress || 0) - (previous_progress || 0)
  end

  def progress_percentage_change
    return 0 if previous_progress.nil? || previous_progress == 0
    ((progress_change.to_f / previous_progress) * 100).round(2)
  end

  private

  def set_previous_progress
    self.previous_progress ||= milestone&.progress || 0
  end
end