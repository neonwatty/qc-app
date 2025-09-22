class ActionItemValidator < BaseValidator
  attr_accessor :title, :description, :assigned_to_id, :due_date,
                :priority, :category, :recurring_frequency

  validates :title, presence: true, length: { maximum: 200 }
  validates :description, length: { maximum: 1000 }

  validates :priority, inclusion: { in: %w[low medium high urgent] },
            allow_blank: true

  validates :category, inclusion: {
    in: %w[household financial health social work personal growth other]
  }, allow_blank: true

  validates :recurring_frequency, inclusion: {
    in: %w[daily weekly biweekly monthly quarterly yearly]
  }, allow_blank: true

  validate :assigned_to_is_valid_uuid
  validate :due_date_is_valid

  private

  def assigned_to_is_valid_uuid
    return if assigned_to_id.blank?

    unless valid_uuid?(assigned_to_id)
      errors.add(:assigned_to_id, "must be a valid UUID")
    end
  end

  def due_date_is_valid
    return if due_date.blank?

    begin
      date = Date.parse(due_date.to_s)
      if date < Date.today - 1.year
        errors.add(:due_date, "cannot be more than 1 year in the past")
      elsif date > Date.today + 2.years
        errors.add(:due_date, "cannot be more than 2 years in the future")
      end
    rescue
      errors.add(:due_date, "is not a valid date")
    end
  end

  def valid_uuid?(string)
    uuid_regex = /\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i
    string.to_s.match?(uuid_regex)
  end
end