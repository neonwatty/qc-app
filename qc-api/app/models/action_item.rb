class ActionItem < ApplicationRecord
  # Associations
  belongs_to :check_in
  belongs_to :assigned_to, class_name: 'User', optional: true
  has_many :reminders, foreign_key: 'related_action_item_id', dependent: :nullify

  # Validations
  validates :title, presence: true

  # Callbacks
  after_update :set_completed_at, if: :saved_change_to_completed?

  # Scopes
  scope :pending, -> { where(completed: false) }
  scope :completed, -> { where(completed: true) }
  scope :overdue, -> { pending.where('due_date < ?', Date.current) }
  scope :upcoming, -> { pending.where('due_date >= ?', Date.current).order(:due_date) }
  scope :assigned_to_user, ->(user) { where(assigned_to_id: user.id) }

  # Instance methods
  def complete!
    update!(completed: true, completed_at: Time.current)
  end

  def uncomplete!
    update!(completed: false, completed_at: nil)
  end

  def toggle!
    completed? ? uncomplete! : complete!
  end

  def overdue?
    !completed? && due_date && due_date < Date.current
  end

  private

  def set_completed_at
    if completed? && completed_at.blank?
      update_column(:completed_at, Time.current)
    elsif !completed?
      update_column(:completed_at, nil)
    end
  end
end