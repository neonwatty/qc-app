class SessionPreparation < ApplicationRecord
  # Associations
  belongs_to :session, class_name: "CheckIn", optional: true
  belongs_to :couple
  has_many :preparation_topics, dependent: :destroy

  # Validations

  # Scopes
  scope :with_session, -> { where.not(session_id: nil) }
  scope :without_session, -> { where(session_id: nil) }
  scope :recent, -> { order(created_at: :desc) }

  # Instance methods
  def add_topic(author, content, is_quick = false, priority = 0)
    preparation_topics.create!(
      author: author,
      content: content,
      is_quick_topic: is_quick,
      priority: priority
    )
  end

  def topics_for_user(user)
    preparation_topics.where(author: user)
  end

  def partner_topics_for(user)
    preparation_topics.where.not(author: user)
  end

  def quick_topics
    preparation_topics.where(is_quick_topic: true)
  end

  def detailed_topics
    preparation_topics.where(is_quick_topic: false)
  end
end
