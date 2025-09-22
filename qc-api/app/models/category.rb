class Category < ApplicationRecord
  # Associations
  belongs_to :couple, optional: true
  has_many :notes, dependent: :nullify
  has_many :prompt_templates, dependent: :nullify
  has_many :custom_prompts, dependent: :destroy

  # Validations
  validates :name, presence: true
  validates :icon, presence: true
  validates :order, numericality: { greater_than_or_equal_to: 0 }

  # Scopes
  scope :system_categories, -> { where(couple_id: nil, is_custom: false) }
  scope :custom_categories, -> { where(is_custom: true) }
  scope :ordered, -> { order(:order, :name) }

  # Instance methods
  def system?
    couple_id.nil? && !is_custom
  end

  def add_prompt(prompt_text)
    prompts << prompt_text unless prompts.include?(prompt_text)
    save
  end

  def remove_prompt(prompt_text)
    prompts.delete(prompt_text)
    save
  end
end
