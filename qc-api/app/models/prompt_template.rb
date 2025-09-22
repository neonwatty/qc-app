class PromptTemplate < ApplicationRecord
  # Associations
  belongs_to :category, optional: true
  belongs_to :couple, optional: true

  # Validations
  validates :title, presence: true
  validates :usage_count, numericality: { greater_than_or_equal_to: 0 }

  # Scopes
  scope :system_templates, -> { where(is_system: true) }
  scope :custom_templates, -> { where(is_system: false) }
  scope :for_couple, ->(couple) { where(couple: couple).or(where(is_system: true)) }
  scope :by_usage, -> { order(usage_count: :desc) }
  scope :with_tags, ->(tags) { where("tags && ARRAY[?]::text[]", tags) }
  scope :for_category, ->(category) { where(category: category) }

  # Callbacks
  after_initialize :set_defaults

  # Instance methods
  def use!
    increment!(:usage_count)
  end

  def add_prompt(prompt_text)
    prompts << prompt_text unless prompts.include?(prompt_text)
    save
  end

  def remove_prompt(prompt_text)
    prompts.delete(prompt_text)
    save
  end

  def add_tag(tag)
    tags << tag unless tags.include?(tag)
    save
  end

  def remove_tag(tag)
    tags.delete(tag)
    save
  end

  private

  def set_defaults
    self.prompts ||= []
    self.tags ||= []
  end
end
