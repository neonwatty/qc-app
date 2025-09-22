class CategorySerializer
  include JSONAPI::Serializer

  # Core attributes matching TypeScript interface
  attributes :id, :name, :description, :icon, :prompts, :order

  # isCustom field in TypeScript (camelCase will be applied)
  attribute :is_custom do |category|
    category.is_custom
  end

  # Timestamps are not in TypeScript interface but useful for API
  attributes :created_at, :updated_at

  # Relationships - optional includes for performance
  belongs_to :couple, if: proc { |_, params| params && params[:include_couple] }
  has_many :notes, if: proc { |_, params| params && params[:include_notes] }
  has_many :prompt_templates, if: proc { |_, params| params && params[:include_templates] }
  has_many :custom_prompts, if: proc { |_, params| params && params[:include_custom_prompts] }

  # Additional computed attribute
  attribute :usage_count do |category, params|
    # Only calculate if requested to avoid N+1
    if params && params[:include_usage]
      category.notes.count
    end
  end

  # Use camelCase for JSON output to match TypeScript
  set_key_transform :camel_lower
end