class CategorySerializer
  include JSONAPI::Serializer

  attributes :id, :name, :description, :icon, :order, :is_custom,
             :prompts, :created_at, :updated_at

  belongs_to :couple
  has_many :notes
  has_many :prompt_templates
  has_many :custom_prompts

  attribute :usage_count do |category|
    category.notes.count
  end
end