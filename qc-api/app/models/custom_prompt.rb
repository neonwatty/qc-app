class CustomPrompt < ApplicationRecord
  # Associations
  belongs_to :category
  belongs_to :couple

  # Validations
  validates :content, presence: true
  validates :order, numericality: { greater_than_or_equal_to: 0 }

  # Scopes
  scope :active, -> { where(is_active: true) }
  scope :inactive, -> { where(is_active: false) }
  scope :ordered, -> { order(:order, :created_at) }
  scope :for_category, ->(category) { where(category: category) }

  # Instance methods
  def activate!
    update!(is_active: true)
  end

  def deactivate!
    update!(is_active: false)
  end

  def toggle_active!
    update!(is_active: !is_active)
  end

  def move_to_position!(new_position)
    transaction do
      # Get all prompts for the same couple and category
      siblings = couple.custom_prompts.for_category(category).ordered

      # Remove current prompt from list
      current_list = siblings.to_a - [self]

      # Insert at new position
      current_list.insert(new_position, self)

      # Update order for all affected prompts
      current_list.each_with_index do |prompt, index|
        prompt.update_column(:order, index)
      end
    end
  end
end