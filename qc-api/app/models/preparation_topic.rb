class PreparationTopic < ApplicationRecord
  # Associations
  belongs_to :author, class_name: 'User'
  belongs_to :session_preparation

  # Validations
  validates :content, presence: true
  validates :priority, numericality: { greater_than_or_equal_to: 0 }

  # Scopes
  scope :quick_topics, -> { where(is_quick_topic: true) }
  scope :detailed_topics, -> { where(is_quick_topic: false) }
  scope :by_priority, -> { order(priority: :desc, created_at: :asc) }
  scope :by_author, ->(user) { where(author: user) }

  # Instance methods
  def quick?
    is_quick_topic
  end

  def detailed?
    !is_quick_topic
  end
end