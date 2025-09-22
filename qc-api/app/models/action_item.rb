class ActionItem < ApplicationRecord
  # Constants
  PRIORITIES = %w[low medium high urgent].freeze
  CATEGORIES = %w[communication household financial personal shared].freeze

  # Associations
  belongs_to :check_in
  belongs_to :assigned_to, class_name: "User", optional: true
  belongs_to :created_by, class_name: "User", optional: true
  has_many :reminders, foreign_key: "related_action_item_id", dependent: :nullify

  # Validations
  validates :title, presence: true
  validates :priority, inclusion: { in: PRIORITIES }, allow_nil: true
  validates :category, inclusion: { in: CATEGORIES }, allow_nil: true
  validate :validate_due_date
  validate :validate_assignment

  # Callbacks
  before_create :set_defaults
  after_update :set_completed_at, if: :saved_change_to_completed?
  after_update :track_completion_stats, if: :saved_change_to_completed?

  # Scopes
  scope :pending, -> { where(completed: false) }
  scope :completed, -> { where(completed: true) }
  scope :overdue, -> { pending.where("due_date < ?", Date.current) }
  scope :upcoming, -> { pending.where("due_date >= ?", Date.current).order(:due_date) }
  scope :assigned_to_user, ->(user) { where(assigned_to_id: user.id) }
  scope :created_by_user, ->(user) { where(created_by_id: user.id) }
  scope :due_this_week, -> {
    pending.where(due_date: Date.current.beginning_of_week..Date.current.end_of_week)
  }
  scope :by_priority, -> {
    order(
      Arel.sql(
        "CASE priority
         WHEN 'urgent' THEN 0
         WHEN 'high' THEN 1
         WHEN 'medium' THEN 2
         WHEN 'low' THEN 3
         ELSE 4
         END"
      )
    )
  }

  # Instance methods
  def complete!
    return false if completed?
    update!(
      completed: true,
      completed_at: Time.current,
      completed_by_id: assigned_to_id
    )
  end

  def uncomplete!
    update!(
      completed: false,
      completed_at: nil,
      completed_by_id: nil
    )
  end

  def toggle!
    completed? ? uncomplete! : complete!
  end

  def overdue?
    !completed? && due_date && due_date < Date.current
  end

  def due_soon?
    !completed? && due_date && due_date <= 3.days.from_now.to_date
  end

  def days_until_due
    return nil unless due_date
    return 0 if overdue?
    (due_date - Date.current).to_i
  end

  def completion_time_days
    return nil unless completed? && completed_at
    ((completed_at - created_at) / 1.day).round
  end

  def reassign_to!(user)
    return false if completed?
    update!(assigned_to: user, reassigned_at: Time.current)
  end

  def set_priority!(new_priority)
    return false unless PRIORITIES.include?(new_priority)
    update!(priority: new_priority)
  end

  def add_note(content)
    self.notes ||= []
    notes << { content: content, created_at: Time.current.to_s }
    save
  end

  private

  def set_defaults
    self.priority ||= "medium"
    self.completed ||= false
    self.notes ||= []
  end

  def set_completed_at
    if completed? && completed_at.blank?
      update_column(:completed_at, Time.current)
    elsif !completed?
      update_columns(completed_at: nil, completed_by_id: nil)
    end
  end

  def track_completion_stats
    return unless completed?

    # Track whether it was completed on time
    if due_date
      was_on_time = completed_at.to_date <= due_date
      update_column(:completed_on_time, was_on_time)
    end
  end

  def validate_due_date
    return unless due_date.present?

    if due_date < Date.current && !completed?
      # Allow overdue items but log warning
      Rails.logger.warn "Action item #{id} has past due date: #{due_date}"
    end
  end

  def validate_assignment
    return unless assigned_to.present? && check_in.present?

    couple = check_in.couple
    unless couple.users.include?(assigned_to)
      errors.add(:assigned_to, "must be a member of the couple")
    end
  end
end
