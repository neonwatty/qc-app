class LoveLanguageDiscovery < ApplicationRecord
  # Constants
  SOURCES = %w[check_in conversation observation partner_feedback reflection].freeze
  CONFIDENCE_LEVELS = %w[low medium high very_high].freeze

  # Associations
  belongs_to :user
  belongs_to :check_in, optional: true
  belongs_to :discovered_by, class_name: "User", optional: true
  belongs_to :converted_to_language, class_name: "LoveLanguage", optional: true

  # Validations
  validates :discovery, presence: true
  validates :source, inclusion: { in: SOURCES }, allow_nil: true
  validates :confidence_level, inclusion: { in: CONFIDENCE_LEVELS }, allow_nil: true
  validate :validate_discovered_by

  # Callbacks
  before_create :set_defaults
  after_create :analyze_for_suggestions

  # Scopes
  scope :unconverted, -> { where(converted_to_language_id: nil) }
  scope :converted, -> { where.not(converted_to_language_id: nil) }
  scope :recent, -> { order(created_at: :desc) }
  scope :from_check_ins, -> { where.not(check_in_id: nil) }
  scope :high_confidence, -> { where(confidence_level: [ "high", "very_high" ]) }
  scope :by_source, ->(source) { where(source: source) }
  scope :pending_review, -> { unconverted.where(reviewed: false) }
  scope :reviewed, -> { where(reviewed: true) }

  # Instance methods
  def convert_to_language!(language_params = {})
    return false if converted?

    transaction do
      language = user.love_languages.create!(
        language_params.merge(
          title: suggested_title || "Custom Love Language",
          description: discovery,
          category: suggested_category || "custom",
          importance: suggested_importance || "medium"
        )
      )

      update!(
        converted_to_language_id: language.id,
        converted_at: Time.current
      )

      create_initial_actions_for_language!(language) if auto_generate_actions?
      language
    end
  end

  def reject!
    update!(
      reviewed: true,
      rejected: true,
      rejected_at: Time.current
    )
  end

  def mark_reviewed!
    update!(reviewed: true, reviewed_at: Time.current)
  end

  def converted?
    converted_to_language_id.present?
  end

  def rejected?
    rejected == true
  end

  def pending?
    !converted? && !rejected? && !reviewed
  end

  def suggest_category
    # Analyze discovery text to suggest a category
    text = discovery.downcase

    if text.include?("word") || text.include?("say") || text.include?("tell")
      "words"
    elsif text.include?("do") || text.include?("help") || text.include?("task")
      "acts"
    elsif text.include?("gift") || text.include?("surprise") || text.include?("buy")
      "gifts"
    elsif text.include?("time") || text.include?("together") || text.include?("date")
      "time"
    elsif text.include?("touch") || text.include?("hug") || text.include?("physical")
      "touch"
    else
      "custom"
    end
  end

  def suggest_importance
    return "high" if confidence_level == "very_high"
    return "medium" if confidence_level == "high"
    "low"
  end

  def similar_languages
    return [] unless user.present?

    user.love_languages.where(
      "similarity(title || ' ' || description, ?) > 0.3",
      discovery
    ).limit(3)
  rescue
    # Fallback if similarity function not available
    user.love_languages.where("description ILIKE ?", "%#{discovery.split.first(3).join(' ')}%").limit(3)
  end

  private

  def set_defaults
    self.source ||= "reflection"
    self.confidence_level ||= "medium"
    self.reviewed = false if reviewed.nil?
    self.rejected = false if rejected.nil?
    self.suggested_category = suggest_category if suggested_category.blank?
    self.suggested_importance = suggest_importance if suggested_importance.blank?
  end

  def analyze_for_suggestions
    # Could trigger background job for AI analysis here
    Rails.logger.info "New discovery created: #{id} - analyzing for suggestions"
  end

  def create_initial_actions_for_language!(language)
    # Create some starter actions based on the category
    base_actions = case language.category
    when "words"
      [
        { title: "Write a love note", difficulty: "easy" },
        { title: "Send encouraging text", difficulty: "easy" },
        { title: "Express gratitude verbally", difficulty: "moderate" }
      ]
    when "acts"
      [
        { title: "Complete a household task", difficulty: "easy" },
        { title: "Prepare favorite meal", difficulty: "moderate" },
        { title: "Run an errand for partner", difficulty: "easy" }
      ]
    when "gifts"
      [
        { title: "Bring home a small surprise", difficulty: "easy" },
        { title: "Plan a thoughtful gift", difficulty: "moderate" },
        { title: "Create a handmade gift", difficulty: "challenging" }
      ]
    when "time"
      [
        { title: "Plan a date night", difficulty: "moderate" },
        { title: "Have device-free conversation", difficulty: "easy" },
        { title: "Weekend getaway", difficulty: "challenging" }
      ]
    when "touch"
      [
        { title: "Morning hug", difficulty: "easy" },
        { title: "Hold hands during walk", difficulty: "easy" },
        { title: "Give a massage", difficulty: "moderate" }
      ]
    else
      [
        { title: "Custom action based on discovery", difficulty: "moderate" }
      ]
    end

    base_actions.each do |action_attrs|
      language.love_actions.create!(
        action_attrs.merge(
          for_user: user,
          created_by_user: user,
          suggested_by: "system",
          status: "suggested",
          frequency: "once"
        )
      )
    end
  end

  def auto_generate_actions?
    confidence_level == "very_high" || source == "partner_feedback"
  end

  def validate_discovered_by
    if source == "partner_feedback" && discovered_by_id.blank?
      errors.add(:discovered_by_id, "is required when source is partner_feedback")
    end
  end
end
