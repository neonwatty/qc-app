class LoveAction < ApplicationRecord
  # Constants
  STATUSES = %w[suggested planned completed recurring archived].freeze
  DIFFICULTIES = %w[easy moderate challenging].freeze
  FREQUENCIES = %w[once daily weekly monthly surprise].freeze
  SUGGESTED_BY = %w[self partner ai system].freeze

  # Associations
  belongs_to :linked_language, class_name: "LoveLanguage"
  belongs_to :for_user, class_name: "User"
  belongs_to :created_by_user, class_name: "User", foreign_key: "created_by"
  belongs_to :suggested_by_user, class_name: "User", foreign_key: "suggested_by_id", optional: true

  # Validations
  validates :title, presence: true
  validates :suggested_by, inclusion: { in: SUGGESTED_BY }
  validates :status, inclusion: { in: STATUSES }
  validates :frequency, inclusion: { in: FREQUENCIES }, allow_nil: true
  validates :difficulty, inclusion: { in: DIFFICULTIES }
  validates :completed_count, numericality: { greater_than_or_equal_to: 0 }
  validates :effectiveness_rating, numericality: { in: 1..5 }, allow_nil: true
  validate :validate_planned_date
  validate :validate_suggested_by_user

  # Callbacks
  before_create :set_defaults
  after_update :update_last_completed, if: :saved_change_to_completed_count?
  after_update :track_effectiveness, if: :saved_change_to_effectiveness_rating?

  # Scopes
  scope :suggested, -> { where(status: "suggested") }
  scope :planned, -> { where(status: "planned") }
  scope :completed, -> { where(status: "completed") }
  scope :recurring, -> { where(status: "recurring") }
  scope :archived, -> { where(status: "archived") }
  scope :active, -> { where.not(status: "archived") }
  scope :upcoming, -> { where(status: "planned").where("planned_for >= ?", Date.current).order(:planned_for) }
  scope :overdue, -> { where(status: "planned").where("planned_for < ?", Date.current) }
  scope :due_today, -> { where(status: "planned").where(planned_for: Date.current) }
  scope :easy, -> { where(difficulty: "easy") }
  scope :by_difficulty, -> {
    order(
      Arel.sql(
        "CASE difficulty
         WHEN 'easy' THEN 1
         WHEN 'moderate' THEN 2
         WHEN 'challenging' THEN 3
         END"
      )
    )
  }
  scope :by_effectiveness, -> { order(effectiveness_rating: :desc) }
  scope :highly_effective, -> { where("effectiveness_rating >= ?", 4) }

  # Instance methods
  def complete!(rating: nil, notes: nil)
    transaction do
      increment!(:completed_count)
      update!(
        last_completed_at: Time.current,
        status: determine_status_after_completion,
        effectiveness_rating: rating || effectiveness_rating,
        completion_notes: add_completion_note(notes)
      )
      create_next_occurrence! if recurring?
    end
  end

  def plan!(date)
    return false if archived?
    update!(status: "planned", planned_for: date)
  end

  def mark_recurring!(new_frequency = nil)
    return false if frequency == "once"
    update!(
      status: "recurring",
      frequency: new_frequency || frequency
    )
  end

  def archive!
    update!(status: "archived", archived_at: Time.current)
  end

  def unarchive!
    update!(status: "suggested", archived_at: nil)
  end

  def recurring?
    status == "recurring" && frequency && frequency != "once"
  end

  def overdue?
    status == "planned" && planned_for && planned_for < Date.current
  end

  def effectiveness_score
    return 0 unless completed_count > 0 && effectiveness_rating
    (effectiveness_rating * completed_count.to_f / (completed_count + 1)).round(2)
  end

  def next_suggested_date
    return nil unless last_completed_at && frequency

    case frequency
    when "daily"
      last_completed_at + 1.day
    when "weekly"
      last_completed_at + 1.week
    when "monthly"
      last_completed_at + 1.month
    else
      nil
    end
  end

  def duplicate_for_user(new_user)
    self.class.create!(
      linked_language: new_user.love_languages.find_by(category: linked_language.category),
      for_user: new_user,
      created_by_user: new_user,
      title: title,
      description: description,
      suggested_by: "system",
      status: "suggested",
      frequency: frequency,
      difficulty: difficulty
    )
  end

  private

  def set_defaults
    self.completed_count ||= 0
    self.status ||= "suggested"
    self.difficulty ||= "moderate"
    self.completion_notes ||= []
  end

  def determine_status_after_completion
    case frequency
    when "once"
      "completed"
    when "surprise"
      "suggested"
    else
      "recurring"
    end
  end

  def create_next_occurrence!
    return unless recurring? && next_suggested_date

    self.class.create!(
      linked_language: linked_language,
      for_user: for_user,
      created_by_user: created_by_user,
      title: title,
      description: description,
      suggested_by: "system",
      status: "planned",
      planned_for: next_suggested_date,
      frequency: frequency,
      difficulty: difficulty
    )
  end

  def add_completion_note(note)
    return completion_notes unless note.present?

    self.completion_notes ||= []
    completion_notes << {
      note: note,
      completed_at: Time.current.to_s,
      completed_by: created_by_user.name
    }
    completion_notes
  end

  def update_last_completed
    update_column(:last_completed_at, Time.current) if completed_count > 0
  end

  def track_effectiveness
    Rails.logger.info "Love action #{id} effectiveness: #{effectiveness_rating} (#{completed_count} completions)"
  end

  def validate_planned_date
    return unless status == "planned" && planned_for.blank?
    errors.add(:planned_for, "is required when status is planned")
  end

  def validate_suggested_by_user
    if suggested_by == "partner" && suggested_by_id.blank?
      errors.add(:suggested_by_id, "is required when suggested by partner")
    end

    if suggested_by != "partner" && suggested_by_id.present?
      errors.add(:suggested_by_id, "should be blank unless suggested by partner")
    end
  end
end
