class ReminderSerializer
  include JSONAPI::Serializer

  attributes :id, :title, :message, :category, :scheduled_for,
             :is_active, :frequency, :notification_channel,
             :last_notified_at, :custom_schedule, :custom_frequency_data,
             :priority, :snooze_until, :completed_at, :created_at, :updated_at

  belongs_to :couple
  belongs_to :created_by, serializer: :user
  belongs_to :assigned_to, serializer: :user, optional: true
  belongs_to :related_action_item, serializer: :action_item, optional: true
  belongs_to :related_check_in, serializer: :check_in, optional: true
  belongs_to :parent_reminder, serializer: :reminder, optional: true
  belongs_to :converted_from_request, serializer: :relationship_request, optional: true
  has_many :child_reminders, serializer: :reminder

  attribute :is_snoozed do |reminder|
    reminder.is_snoozed && reminder.snooze_until && reminder.snooze_until > Time.current
  end

  attribute :is_recurring do |reminder|
    reminder.frequency.present? && reminder.frequency != 'once'
  end

  attribute :is_overdue do |reminder|
    reminder.scheduled_for < Time.current && reminder.completed_at.nil?
  end
end