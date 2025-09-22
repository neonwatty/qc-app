class Note < ApplicationRecord
  # Constants
  PRIVACY_LEVELS = %w[private shared draft].freeze

  # Associations
  belongs_to :author, class_name: "User"
  belongs_to :category, optional: true
  belongs_to :check_in, optional: true

  # Validations
  validates :content, presence: true
  validates :privacy, inclusion: { in: PRIVACY_LEVELS }
  validate :validate_privacy_change
  validate :validate_author_belongs_to_couple

  # Callbacks
  before_create :set_defaults
  after_update :track_privacy_changes, if: :saved_change_to_privacy?

  # Scopes
  scope :private_notes, -> { where(privacy: "private") }
  scope :shared_notes, -> { where(privacy: "shared") }
  scope :drafts, -> { where(privacy: "draft") }
  scope :by_author, ->(user) { where(author: user) }
  scope :recent, -> { order(created_at: :desc) }
  scope :with_tags, ->(tags) { where("tags && ARRAY[?]::text[]", tags) }
  scope :viewable_by, ->(user) {
    joins(:check_in)
      .where(
        "notes.privacy = ? OR notes.author_id = ?",
        "shared", user.id
      )
  }

  # Instance methods
  def private?
    privacy == "private"
  end

  def shared?
    privacy == "shared"
  end

  def draft?
    privacy == "draft"
  end

  def publish!
    return false unless draft?
    update!(
      privacy: "shared",
      published_at: Time.current
    )
  end

  def make_private!
    update!(privacy: "private")
  end

  def can_be_viewed_by?(user)
    return true if author == user
    return true if shared?
    false
  end

  def can_be_edited_by?(user)
    author == user
  end

  def add_tag(tag)
    self.tags ||= []
    tags << tag unless tags.include?(tag)
    save
  end

  def remove_tag(tag)
    tags&.delete(tag)
    save
  end

  def word_count
    content.split.size
  end

  def reading_time_minutes
    (word_count / 200.0).ceil
  end

  private

  def set_defaults
    self.tags ||= []
    self.privacy ||= "draft"
  end

  def validate_privacy_change
    return unless privacy_changed? && persisted?

    # Can't change from shared back to draft
    if privacy_was == "shared" && privacy == "draft"
      errors.add(:privacy, "Cannot change shared note back to draft")
    end

    # Log when changing from shared to private
    if privacy_was == "shared" && privacy == "private"
      Rails.logger.info "Note #{id} privacy changed from shared to private by #{author.id}"
    end
  end

  def validate_author_belongs_to_couple
    return unless check_in.present?

    couple = check_in.couple
    unless couple.users.include?(author)
      errors.add(:author, "must be a member of the couple")
    end
  end

  def track_privacy_changes
    # Track when notes become shared for the first time
    if privacy == "shared" && privacy_was != "shared"
      update_column(:first_shared_at, Time.current) unless first_shared_at
    end
  end
end
