class Comment < ApplicationRecord
  # Associations
  belongs_to :commentable, polymorphic: true
  belongs_to :author, class_name: 'User', foreign_key: 'author_id'

  # Validations
  validates :content, presence: true
  validates :author, presence: true

  # Scopes
  scope :recent, -> { order(created_at: :desc) }
end