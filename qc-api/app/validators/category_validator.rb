class CategoryValidator < BaseValidator
  attr_accessor :name, :icon, :color, :order, :is_active, :prompts

  validates :name, presence: { message: "Category name is required" }
  validates :name, length: {
    minimum: 2,
    maximum: 50,
    too_short: "Category name must be at least 2 characters",
    too_long: "Category name cannot exceed 50 characters"
  }, if: -> { name.present? }

  validates :icon, presence: { message: "Please select an icon for the category" }
  validates :icon, inclusion: {
    in: %w[Heart Star Trophy Flag Target Calendar Clock Bell Gift Book
           Lightbulb MessageSquare Users Home Briefcase Globe Music
           Camera Smile Coffee Sun Moon Cloud Zap Shield Check],
    message: "Invalid icon. Please select from the available icon set"
  }, if: -> { icon.present? }

  validates :color, format: {
    with: /\A#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\z/,
    message: "Color must be a valid hex code (e.g., #FF5733 or #F57)"
  }, if: -> { color.present? }

  validates :order, numericality: {
    only_integer: true,
    greater_than_or_equal_to: 0,
    less_than_or_equal_to: 100,
    message: "Display order must be a number between 0 and 100"
  }, if: -> { order.present? }

  validate :prompts_are_valid

  private

  def prompts_are_valid
    return if prompts.blank?

    unless prompts.is_a?(Array)
      errors.add(:prompts, "Discussion prompts must be provided as a list")
      return
    end

    if prompts.empty?
      errors.add(:prompts, "Please provide at least one discussion prompt")
      return
    end

    if prompts.size > 20
      errors.add(:prompts, "Cannot have more than 20 prompts per category")
      return
    end

    prompts.each_with_index do |prompt, index|
      if prompt.blank?
        errors.add(:prompts, "Prompt #{index + 1} cannot be empty")
      elsif !prompt.is_a?(String)
        errors.add(:prompts, "Prompt #{index + 1} must be text")
      elsif prompt.length > 500
        errors.add(:prompts, "Prompt #{index + 1} exceeds 500 character limit")
      end
    end
  end
end