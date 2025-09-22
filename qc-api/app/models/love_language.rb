class LoveLanguage < ApplicationRecord
  # Associations
  belongs_to :user
  has_many :love_actions, foreign_key: 'linked_language_id', dependent: :destroy
  has_many :discoveries, class_name: 'LoveLanguageDiscovery', foreign_key: 'converted_to_language_id'

  # Validations
  validates :title, presence: true
  validates :description, presence: true
  validates :category, inclusion: { in: %w[words acts gifts time touch custom] }
  validates :privacy, inclusion: { in: %w[private shared] }
  validates :importance, inclusion: { in: %w[low medium high essential] }

  # Scopes
  scope :shared, -> { where(privacy: 'shared') }
  scope :private_languages, -> { where(privacy: 'private') }
  scope :by_importance, -> { order(Arel.sql("CASE importance WHEN 'essential' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END")) }
  scope :by_category, ->(category) { where(category: category) }
  scope :recently_discussed, -> { where.not(last_discussed_at: nil).order(last_discussed_at: :desc) }

  # Instance methods
  def mark_discussed!
    update!(last_discussed_at: Time.current)
  end

  def add_example(example_text)
    examples << example_text unless examples.include?(example_text)
    save
  end

  def remove_example(example_text)
    examples.delete(example_text)
    save
  end

  def essential?
    importance == 'essential'
  end

  def high_importance?
    importance == 'high'
  end
end