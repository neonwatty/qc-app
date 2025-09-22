class NoteSerializer
  include JSONAPI::Serializer

  attributes :id, :content, :privacy, :tags, :published_at,
             :first_shared_at, :is_favorite, :created_at, :updated_at

  belongs_to :author, serializer: :user
  belongs_to :category, optional: true
  belongs_to :check_in, optional: true
  has_many :comments

  attribute :is_private do |note|
    note.privacy == 'private'
  end

  attribute :is_shared do |note|
    note.privacy == 'shared'
  end

  attribute :is_draft do |note|
    note.privacy == 'draft'
  end

  attribute :word_count do |note|
    note.content.split.size
  end
end