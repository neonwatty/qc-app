class Milestone < ApplicationRecord
  # Constants
  CATEGORIES = %w[
    communication trust growth celebration consistency
    goals connection conflict_resolution intimacy adventure
    support creativity wellness
  ].freeze

  RARITIES = %w[common rare epic legendary].freeze

  RARITY_POINTS = {
    'common' => 10,
    'rare' => 25,
    'epic' => 50,
    'legendary' => 100
  }.freeze

  ACHIEVEMENT_CRITERIA = {
    'first_checkin' => { type: :count, target: 1, category: 'communication' },
    'weekly_streak' => { type: :streak, target: 7, category: 'consistency' },
    'monthly_streak' => { type: :streak, target: 30, category: 'consistency' },
    'conflict_resolved' => { type: :event, category: 'conflict_resolution' },
    'goal_achieved' => { type: :event, category: 'goals' },
    'anniversary' => { type: :date_based, category: 'celebration' },
    'deep_conversation' => { type: :quality, threshold: 90, category: 'communication' },
    'perfect_month' => { type: :monthly, category: 'consistency' },
    'vulnerability_shared' => { type: :event, category: 'trust' },
    'growth_together' => { type: :progress, target: 10, category: 'growth' }
  }.freeze

  # Associations
  belongs_to :couple
  has_many :milestone_achievements, dependent: :destroy
  has_many :milestone_progress_updates, dependent: :destroy

  # Validations
  validates :title, presence: true, uniqueness: { scope: :couple_id }
  validates :description, presence: true
  validates :icon, presence: true
  validates :category, inclusion: { in: CATEGORIES }
  validates :rarity, inclusion: { in: RARITIES }
  validates :progress, numericality: { in: 0..100 }
  validates :points, numericality: { greater_than_or_equal_to: 0 }
  validates :target_value, numericality: { greater_than: 0 }, allow_nil: true
  validate :validate_criteria_format

  # Callbacks
  before_validation :set_default_rarity
  before_validation :calculate_points_from_rarity
  after_update :set_achieved_at, if: :saved_change_to_achieved?
  after_update :create_achievement_record, if: :saved_change_to_achieved?
  after_update :award_bonus_points, if: :newly_achieved?

  # Scopes
  scope :achieved, -> { where(achieved: true) }
  scope :pending, -> { where(achieved: false) }
  scope :in_progress, -> { pending.where("progress > 0") }
  scope :by_category, ->(category) { where(category: category) }
  scope :by_rarity, -> {
    order(
      Arel.sql(
        "CASE rarity
         WHEN 'legendary' THEN 1
         WHEN 'epic' THEN 2
         WHEN 'rare' THEN 3
         WHEN 'common' THEN 4
         ELSE 5 END"
      )
    )
  }
  scope :recent, -> { achieved.order(achieved_at: :desc) }
  scope :close_to_completion, -> { pending.where("progress >= 80") }

  # Instance methods
  def achieve!(achieved_by = nil, notes = nil)
    return false if achieved?

    transaction do
      update!(
        achieved: true,
        achieved_at: Time.current,
        progress: 100,
        achieved_by: achieved_by,
        achievement_notes: notes
      )
      true
    end
  end

  def update_progress!(new_progress, update_notes = nil)
    return false if achieved?

    transaction do
      milestone_progress_updates.create!(
        previous_progress: progress,
        new_progress: new_progress,
        update_notes: update_notes
      )

      update!(progress: new_progress)
      achieve! if new_progress >= 100
    end
  end

  def increment_progress!(amount = 1)
    new_value = [progress + amount, 100].min
    update_progress!(new_value)
  end

  def legendary?
    rarity == "legendary"
  end

  def epic?
    rarity == "epic"
  end

  def rare?
    rarity == "rare"
  end

  def common?
    rarity == "common"
  end

  def completion_percentage
    return 100 if achieved?
    return 0 if target_value.nil? || target_value == 0

    [(progress.to_f / target_value * 100).round, 100].min
  end

  def days_since_started
    return nil unless created_at
    ((Time.current - created_at) / 1.day).round
  end

  def days_to_achieve
    return nil unless achieved_at && created_at
    ((achieved_at - created_at) / 1.day).round
  end

  def check_auto_achievement(event_type, event_data = {})
    return false if achieved?
    return false unless criteria && criteria['type']

    case criteria['type']
    when 'count'
      check_count_achievement(event_data)
    when 'streak'
      check_streak_achievement(event_data)
    when 'event'
      check_event_achievement(event_type)
    when 'quality'
      check_quality_achievement(event_data)
    when 'progress'
      check_progress_achievement(event_data)
    else
      false
    end
  end

  def unlock_next_milestones
    return [] unless achieved?

    next_milestones = []
    if criteria && criteria['unlocks']
      criteria['unlocks'].each do |milestone_key|
        next_milestone = couple.milestones.create!(
          title: ACHIEVEMENT_CRITERIA[milestone_key][:title],
          category: ACHIEVEMENT_CRITERIA[milestone_key][:category],
          criteria: ACHIEVEMENT_CRITERIA[milestone_key]
        )
        next_milestones << next_milestone if next_milestone.persisted?
      end
    end
    next_milestones
  end

  private

  def set_default_rarity
    return if rarity.present?

    self.rarity = case category
                  when 'consistency', 'communication'
                    'common'
                  when 'trust', 'growth'
                    'rare'
                  when 'conflict_resolution', 'intimacy'
                    'epic'
                  when 'celebration', 'adventure'
                    'legendary'
                  else
                    'common'
                  end
  end

  def calculate_points_from_rarity
    self.points ||= RARITY_POINTS[rarity] || 10
  end

  def set_achieved_at
    if achieved? && achieved_at.blank?
      update_column(:achieved_at, Time.current)
    elsif !achieved?
      update_column(:achieved_at, nil)
    end
  end

  def create_achievement_record
    return unless achieved?

    milestone_achievements.create!(
      achieved_at: achieved_at,
      points_earned: points,
      bonus_points: calculate_bonus_points,
      couple: couple
    )
  end

  def award_bonus_points
    return unless achieved?

    bonus = calculate_bonus_points
    # TODO: Add total_points to Couple model if needed
    # couple.increment!(:total_points, points + bonus) if bonus > 0
  end

  def calculate_bonus_points
    bonus = 0
    bonus += 10 if days_since_started && days_since_started < 7  # Speed bonus
    bonus += 20 if couple.milestones.achieved.count % 10 == 0     # Milestone bonus
    bonus += 15 if legendary?                                      # Rarity bonus
    bonus
  end

  def newly_achieved?
    saved_change_to_achieved? && achieved?
  end

  def validate_criteria_format
    return unless criteria

    unless criteria.is_a?(Hash)
      errors.add(:criteria, "must be a hash")
      return
    end

    unless criteria['type'].present?
      errors.add(:criteria, "must include a type")
    end
  end

  def check_count_achievement(event_data)
    current_count = event_data[:count] || progress
    target = criteria['target'] || target_value

    if current_count >= target
      achieve!
      true
    else
      update_progress!(current_count)
      false
    end
  end

  def check_streak_achievement(event_data)
    current_streak = event_data[:streak] || progress
    target = criteria['target'] || target_value

    if current_streak >= target
      achieve!
      true
    else
      update_progress!(current_streak)
      false
    end
  end

  def check_event_achievement(event_type)
    if event_type.to_s == criteria['event_type']
      achieve!
      true
    else
      false
    end
  end

  def check_quality_achievement(event_data)
    quality_score = event_data[:quality_score] || 0
    threshold = criteria['threshold'] || 90

    if quality_score >= threshold
      achieve!
      true
    else
      false
    end
  end

  def check_progress_achievement(event_data)
    progress_amount = event_data[:progress] || 0
    target = criteria['target'] || target_value

    new_progress = progress + progress_amount
    if new_progress >= target
      achieve!
      true
    else
      update_progress!(new_progress)
      false
    end
  end
end
