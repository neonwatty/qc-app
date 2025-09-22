class ActionItemSerializer
  include JSONAPI::Serializer

  attributes :id, :title, :description, :due_date, :completed,
             :completed_at, :priority, :category, :reassigned_at,
             :completed_on_time, :notes, :created_at, :updated_at

  belongs_to :check_in
  belongs_to :assigned_to, serializer: :user, optional: true
  belongs_to :created_by, serializer: :user, optional: true
  belongs_to :completed_by, serializer: :user, optional: true
  has_many :reminders

  attribute :is_overdue do |action_item|
    !action_item.completed && action_item.due_date && action_item.due_date < Date.today
  end

  attribute :days_until_due do |action_item|
    if action_item.due_date && !action_item.completed
      (action_item.due_date - Date.today).to_i
    end
  end

  attribute :status do |action_item|
    if action_item.completed
      'completed'
    elsif action_item.due_date && action_item.due_date < Date.today
      'overdue'
    elsif action_item.due_date && action_item.due_date == Date.today
      'due_today'
    else
      'pending'
    end
  end
end