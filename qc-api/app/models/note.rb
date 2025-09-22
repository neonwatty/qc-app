class Note < ApplicationRecord
  # Associations
  belongs_to :author, class_name: 'User'
  belongs_to :category, optional: true
  belongs_to :check_in, optional: true

  # Validations
  validates :content, presence: true
  validates :privacy, inclusion: { in: %w[private shared draft] }

  # Scopes
  scope :private_notes, -> { where(privacy: 'private') }
  scope :shared_notes, -> { where(privacy: 'shared') }
  scope :drafts, -> { where(privacy: 'draft') }
  scope :by_author, ->(user) { where(author: user) }
  scope :recent, -> { order(created_at: :desc) }
  scope :with_tags, ->(tags) { where('tags && ARRAY[?]::text[]', tags) }

  # Instance methods
  def private?
    privacy == 'private'
  end

  def shared?
    privacy == 'shared'
  end

  def draft?
    privacy == 'draft'
  end

  def publish!
    update!(privacy: 'shared') if draft?
  end

  def make_private!
    update!(privacy: 'private')
  end

  def add_tag(tag)
    tags << tag unless tags.include?(tag)
    save
  end

  def remove_tag(tag)
    tags.delete(tag)
    save
  end
end