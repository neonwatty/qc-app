class MilestoneAchievement < ApplicationRecord
  # Associations
  belongs_to :milestone
  belongs_to :couple

  # Validations
  validates :achieved_at, presence: true
  validates :points_earned, numericality: { greater_than_or_equal_to: 0 }
  validates :bonus_points, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

  # Scopes
  scope :recent, -> { order(achieved_at: :desc) }
  scope :by_couple, ->(couple) { where(couple: couple) }
  scope :with_bonus, -> { where("bonus_points > 0") }

  # Instance methods
  def total_points
    (points_earned || 0) + (bonus_points || 0)
  end
end