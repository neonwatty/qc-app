class QuickReflection < ApplicationRecord
  # Associations
  belongs_to :session, class_name: "CheckIn", foreign_key: "session_id"
  belongs_to :author, class_name: "User"

  # Validations
  validates :feeling_before, numericality: { in: 1..5 }
  validates :feeling_after, numericality: { in: 1..5 }
  validates_uniqueness_of :author_id, scope: :session_id

  # Scopes
  scope :shared, -> { where(share_with_partner: true) }
  scope :private_reflections, -> { where(share_with_partner: false) }
  scope :improved_mood, -> { where("feeling_after > feeling_before") }
  scope :by_author, ->(user) { where(author: user) }

  # Instance methods
  def mood_improved?
    feeling_after > feeling_before
  end

  def mood_declined?
    feeling_after < feeling_before
  end

  def mood_unchanged?
    feeling_after == feeling_before
  end

  def mood_change
    feeling_after - feeling_before
  end

  def share!
    update!(share_with_partner: true)
  end

  def make_private!
    update!(share_with_partner: false)
  end
end
