class Milestone < ApplicationRecord
  # Associations
  belongs_to :couple

  # Validations
  validates :title, presence: true
  validates :icon, presence: true
  validates :category, inclusion: {
    in: %w[communication trust growth celebration consistency goals connection]
  }
  validates :rarity, inclusion: { in: %w[common rare epic legendary] }, allow_nil: true
  validates :progress, numericality: { in: 0..100 }
  validates :points, numericality: { greater_than_or_equal_to: 0 }

  # Callbacks
  after_update :set_achieved_at, if: :saved_change_to_achieved?

  # Scopes
  scope :achieved, -> { where(achieved: true) }
  scope :pending, -> { where(achieved: false) }
  scope :by_category, ->(category) { where(category: category) }
  scope :by_rarity, -> { order(Arel.sql("CASE rarity WHEN 'legendary' THEN 1 WHEN 'epic' THEN 2 WHEN 'rare' THEN 3 WHEN 'common' THEN 4 ELSE 5 END")) }
  scope :recent, -> { achieved.order(achieved_at: :desc) }

  # Instance methods
  def achieve!
    update!(
      achieved: true,
      achieved_at: Time.current,
      progress: 100
    )
  end

  def update_progress!(new_progress)
    update!(progress: new_progress)
    achieve! if new_progress >= 100
  end

  def legendary?
    rarity == 'legendary'
  end

  def epic?
    rarity == 'epic'
  end

  def rare?
    rarity == 'rare'
  end

  private

  def set_achieved_at
    if achieved? && achieved_at.blank?
      update_column(:achieved_at, Time.current)
    elsif !achieved?
      update_column(:achieved_at, nil)
    end
  end
end