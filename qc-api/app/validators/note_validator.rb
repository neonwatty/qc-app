class NoteValidator < BaseValidator
  attr_accessor :content, :privacy, :tags, :category_id, :check_in_id

  validates :content, presence: true, length: { maximum: 10000 }

  validates :privacy, inclusion: { in: %w[private shared draft] },
            allow_blank: false

  validate :tags_are_valid
  validate :category_id_is_valid_uuid
  validate :check_in_id_is_valid_uuid

  private

  def tags_are_valid
    return if tags.blank?

    if tags.is_a?(Array)
      tags.each do |tag|
        unless tag.is_a?(String) && tag.length <= 50
          errors.add(:tags, "contains invalid tag: #{tag}")
        end
      end

      if tags.size > 10
        errors.add(:tags, "cannot have more than 10 tags")
      end
    else
      errors.add(:tags, "must be an array")
    end
  end

  def category_id_is_valid_uuid
    return if category_id.blank?

    unless valid_uuid?(category_id)
      errors.add(:category_id, "must be a valid UUID")
    end
  end

  def check_in_id_is_valid_uuid
    return if check_in_id.blank?

    unless valid_uuid?(check_in_id)
      errors.add(:check_in_id, "must be a valid UUID")
    end
  end

  def valid_uuid?(string)
    uuid_regex = /\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i
    string.to_s.match?(uuid_regex)
  end
end