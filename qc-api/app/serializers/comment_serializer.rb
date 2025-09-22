class CommentSerializer
  include JSONAPI::Serializer

  attributes :id, :content, :created_at, :updated_at

  belongs_to :author, serializer: :user

  attribute :author_name do |comment|
    comment.author&.name
  end
end