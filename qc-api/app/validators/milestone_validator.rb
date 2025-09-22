class MilestoneValidator < BaseValidator
  attr_accessor :title, :description, :category, :rarity, :progress,
                :icon, :target_value, :target_date, :criteria

  validates :title, presence: true, length: { maximum: 200 }
  validates :description, presence: true, length: { maximum: 1000 }

  validates :category, inclusion: {
    in: %w[communication trust growth celebration consistency
           goals connection conflict_resolution intimacy adventure
           support creativity wellness]
  }, allow_blank: false

  validates :rarity, inclusion: { in: %w[common rare epic legendary] },
            allow_blank: true

  validates :progress, numericality: { in: 0..100 },
            allow_nil: true

  validates :icon, presence: true, length: { maximum: 10 }

  validates :target_value, numericality: { greater_than: 0 },
            allow_nil: true

  validate :target_date_is_future
  validate :criteria_is_valid_json

  private

  def target_date_is_future
    return if target_date.blank?

    begin
      date = Date.parse(target_date.to_s)
      if date < Date.today
        errors.add(:target_date, "must be in the future")
      end
    rescue
      errors.add(:target_date, "is not a valid date")
    end
  end

  def criteria_is_valid_json
    return if criteria.blank?

    unless criteria.is_a?(Hash)
      errors.add(:criteria, "must be a valid JSON object")
    end
  end
end