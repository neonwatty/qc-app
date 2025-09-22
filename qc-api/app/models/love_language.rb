class LoveLanguage < ApplicationRecord
  # Constants
  CATEGORIES = %w[words acts gifts time touch custom].freeze
  PRIVACY_LEVELS = %w[private shared couple_only].freeze
  IMPORTANCE_LEVELS = %w[low medium high essential].freeze
  DEFAULT_LOVE_LANGUAGES = {
    words: "Words of Affirmation",
    acts: "Acts of Service",
    gifts: "Receiving Gifts",
    time: "Quality Time",
    touch: "Physical Touch"
  }.freeze

  # Associations
  belongs_to :user
  belongs_to :couple, optional: true
  has_many :love_actions, foreign_key: "linked_language_id", dependent: :destroy
  has_many :discoveries, class_name: "LoveLanguageDiscovery", foreign_key: "converted_to_language_id"

  # Validations
  validates :title, presence: true, uniqueness: { scope: :user_id, message: "already exists for this user" }
  validates :description, presence: true
  validates :category, inclusion: { in: CATEGORIES }
  validates :privacy, inclusion: { in: PRIVACY_LEVELS }
  validates :importance, inclusion: { in: IMPORTANCE_LEVELS }
  validates :importance_rank, numericality: { in: 1..10 }, allow_nil: true
  validate :validate_couple_association
  validate :validate_examples_format

  # Callbacks
  before_create :set_defaults
  after_update :track_importance_changes, if: :saved_change_to_importance?

  # Scopes
  scope :shared, -> { where(privacy: "shared") }
  scope :couple_only, -> { where(privacy: "couple_only") }
  scope :private_languages, -> { where(privacy: "private") }
  scope :visible_to_partner, -> { where(privacy: [ "shared", "couple_only" ]) }
  scope :by_importance, -> {
    order(
      Arel.sql(
        "CASE importance
         WHEN 'essential' THEN 1
         WHEN 'high' THEN 2
         WHEN 'medium' THEN 3
         WHEN 'low' THEN 4
         END"
      )
    )
  }
  scope :by_rank, -> { order(importance_rank: :asc) }
  scope :by_category, ->(category) { where(category: category) }
  scope :recently_discussed, -> { where.not(last_discussed_at: nil).order(last_discussed_at: :desc) }
  scope :active, -> { where(is_active: true) }
  scope :top_languages, ->(limit = 5) { active.by_importance.limit(limit) }

  # Class methods
  def self.create_defaults_for_user!(user)
    DEFAULT_LOVE_LANGUAGES.each_with_index do |(category, title), index|
      user.love_languages.find_or_create_by!(category: category.to_s) do |lang|
        lang.title = title
        lang.description = "Express love through #{title.downcase}"
        lang.importance = "medium"
        lang.importance_rank = index + 1
        lang.privacy = "couple_only"
        lang.is_active = true
        lang.examples = []
      end
    end
  end

  # Instance methods
  def mark_discussed!
    update!(
      last_discussed_at: Time.current,
      discussion_count: (discussion_count || 0) + 1
    )
  end

  def add_example(example_text)
    self.examples ||= []
    unless examples.include?(example_text)
      examples << example_text
      save
    end
  end

  def remove_example(example_text)
    examples&.delete(example_text)
    save
  end

  def toggle_active!
    update!(is_active: !is_active)
  end

  def update_importance!(new_importance, new_rank = nil)
    update!(
      importance: new_importance,
      importance_rank: new_rank || importance_rank,
      importance_updated_at: Time.current
    )
  end

  def essential?
    importance == "essential"
  end

  def high_importance?
    importance == "high"
  end

  def can_be_viewed_by?(other_user)
    return true if user == other_user
    return true if privacy == "shared"
    return true if privacy == "couple_only" && same_couple?(other_user)
    false
  end

  def average_action_completion_rate
    return 0 if love_actions.empty?

    completed = love_actions.completed.count
    total = love_actions.count
    ((completed.to_f / total) * 100).round
  end

  def recent_examples(limit = 5)
    examples&.last(limit) || []
  end

  private

  def set_defaults
    self.examples ||= []
    self.is_active = true if is_active.nil?
    self.discussion_count ||= 0
    self.importance_rank ||= user.love_languages.count + 1
  end

  def validate_couple_association
    return unless privacy == "couple_only" && user.present?

    self.couple ||= user.current_couple
    unless couple.present?
      errors.add(:privacy, "cannot be couple_only without an active couple relationship")
    end
  end

  def validate_examples_format
    return unless examples.present?

    unless examples.is_a?(Array)
      errors.add(:examples, "must be an array")
    end

    if examples.any? { |e| !e.is_a?(String) }
      errors.add(:examples, "must contain only strings")
    end
  end

  def track_importance_changes
    Rails.logger.info "Love language #{id} importance changed from #{importance_was} to #{importance}"
  end

  def same_couple?(other_user)
    user.current_couple == other_user.current_couple if user.current_couple
  end
end
