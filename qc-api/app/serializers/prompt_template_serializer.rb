class PromptTemplateSerializer
  include JSONAPI::Serializer

  attributes :id, :content, :order, :is_active, :created_at, :updated_at

  belongs_to :category
  belongs_to :couple
end