class CheckInValidator < BaseValidator
  attr_accessor :status, :mood_before, :mood_after, :reflection,
                :categories, :current_step, :participants

  validates :status, inclusion: { in: %w[in-progress paused completed cancelled] },
            allow_blank: true

  validates :mood_before, :mood_after,
            numericality: { in: 1..5 },
            allow_nil: true

  validates :reflection, length: { maximum: 5000 }

  validates :current_step, inclusion: {
    in: %w[welcome categories discussion reflection action_items completion]
  }, allow_blank: true

  validate :participants_are_valid_uuids
  validate :categories_are_valid_uuids

  private

  def participants_are_valid_uuids
    return if participants.blank?

    if participants.is_a?(Array)
      participants.each do |participant_id|
        unless valid_uuid?(participant_id)
          errors.add(:participants, "contains invalid UUID: #{participant_id}")
        end
      end
    else
      errors.add(:participants, "must be an array")
    end
  end

  def categories_are_valid_uuids
    return if categories.blank?

    if categories.is_a?(Array)
      categories.each do |category_id|
        unless valid_uuid?(category_id)
          errors.add(:categories, "contains invalid UUID: #{category_id}")
        end
      end
    else
      errors.add(:categories, "must be an array")
    end
  end

  def valid_uuid?(string)
    uuid_regex = /\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i
    string.to_s.match?(uuid_regex)
  end
end