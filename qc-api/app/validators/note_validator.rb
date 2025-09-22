class NoteValidator < BaseValidator
  attr_accessor :content, :privacy, :tags, :category_id, :check_in_id

  validates :content, presence: { message: "Note content cannot be empty" }
  validates :content, length: {
    maximum: 10000,
    message: "Note content cannot exceed 10,000 characters (approximately 2,000 words)"
  }, if: -> { content.present? }

  validates :privacy, presence: { message: "Please specify the privacy level for this note" }
  validates :privacy, inclusion: {
    in: %w[private shared draft],
    message: "Privacy level must be one of: private (only you can see), shared (both partners can see), or draft (work in progress)"
  }, if: -> { privacy.present? }

  validate :tags_are_valid
  validate :category_id_is_valid_uuid
  validate :check_in_id_is_valid_uuid

  private

  def tags_are_valid
    return if tags.blank?

    unless tags.is_a?(Array)
      errors.add(:tags, "Tags must be provided as a list")
      return
    end

    if tags.size > 10
      errors.add(:tags, "You can add up to 10 tags per note (currently: #{tags.size})")
      return
    end

    tags.each_with_index do |tag, index|
      if !tag.is_a?(String)
        errors.add(:tags, "Tag ##{index + 1} must be text")
      elsif tag.blank?
        errors.add(:tags, "Tag ##{index + 1} cannot be empty")
      elsif tag.length > 50
        errors.add(:tags, "Tag '#{tag[0..20]}...' is too long (max 50 characters)")
      elsif !tag.match?(/\A[\w\s\-:]+\z/)
        errors.add(:tags, "Tag '#{tag}' contains invalid characters. Use letters, numbers, spaces, hyphens, and colons only")
      end
    end
  end

  def category_id_is_valid_uuid
    return if category_id.blank?

    unless valid_uuid?(category_id)
      errors.add(:category_id, "Invalid category ID format. Please select a valid category")
    end
  end

  def check_in_id_is_valid_uuid
    return if check_in_id.blank?

    unless valid_uuid?(check_in_id)
      errors.add(:check_in_id, "Invalid check-in session ID. Note must be associated with an active session")
    end
  end

  def valid_uuid?(string)
    uuid_regex = /\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i
    string.to_s.match?(uuid_regex)
  end
end