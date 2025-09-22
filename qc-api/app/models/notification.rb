class Notification < ApplicationRecord
  # Associations
  belongs_to :user
  belongs_to :couple, optional: true
  belongs_to :related_user, class_name: 'User', optional: true

  # Notification types
  NOTIFICATION_TYPES = %w[
    check_in_reminder
    check_in_started
    check_in_completed
    note_shared
    note_mentioned
    milestone_achieved
    action_item_assigned
    action_item_due_soon
    action_item_completed
    relationship_request
    relationship_accepted
    partner_joined
    weekly_summary
    system_announcement
    feature_update
  ].freeze

  # Priority levels
  PRIORITIES = {
    low: 0,
    normal: 1,
    high: 2,
    urgent: 3
  }.freeze

  # Validations
  validates :notification_type, presence: true, inclusion: { in: NOTIFICATION_TYPES }
  validates :title, presence: true, length: { maximum: 255 }
  validates :body, presence: true, length: { maximum: 1000 }
  validates :priority, inclusion: { in: PRIORITIES.values }

  # Scopes
  scope :unread, -> { where(read: false) }
  scope :read, -> { where(read: true) }
  scope :recent, -> { order(created_at: :desc) }
  scope :by_type, ->(type) { where(notification_type: type) }
  scope :high_priority, -> { where(priority: [PRIORITIES[:high], PRIORITIES[:urgent]]) }
  scope :expired, -> { where('expires_at < ?', Time.current) }
  scope :active, -> { where('expires_at IS NULL OR expires_at > ?', Time.current) }

  # Scopes for grouping
  scope :today, -> { where('created_at >= ?', Time.current.beginning_of_day) }
  scope :this_week, -> { where('created_at >= ?', 1.week.ago) }
  scope :older, -> { where('created_at < ?', 1.week.ago) }

  # Callbacks
  before_validation :set_defaults
  after_create :broadcast_notification
  after_update :broadcast_update, if: :saved_change_to_read?

  # JSON field defaults
  attribute :data, :jsonb, default: {}
  attribute :metadata, :jsonb, default: {}

  # Instance methods
  def mark_as_read!(read_by = nil)
    update!(
      read: true,
      read_at: Time.current,
      read_by_id: read_by&.id
    )
  end

  def expired?
    expires_at.present? && expires_at < Time.current
  end

  def high_priority?
    priority >= PRIORITIES[:high]
  end

  def action_required?
    %w[action_item_assigned relationship_request action_item_due_soon].include?(notification_type)
  end

  def can_be_dismissed?
    !action_required? || read?
  end

  def formatted_time
    if created_at > 1.hour.ago
      "#{((Time.current - created_at) / 60).round} minutes ago"
    elsif created_at > 1.day.ago
      "#{((Time.current - created_at) / 3600).round} hours ago"
    elsif created_at > 1.week.ago
      "#{((Time.current - created_at) / 86400).round} days ago"
    else
      created_at.strftime('%B %d')
    end
  end

  def action_url
    data['action_url']
  end

  def related_id
    data['related_id']
  end

  def icon
    case notification_type
    when 'check_in_reminder', 'check_in_started', 'check_in_completed'
      'calendar'
    when 'note_shared', 'note_mentioned'
      'message-square'
    when 'milestone_achieved'
      'trophy'
    when 'action_item_assigned', 'action_item_due_soon', 'action_item_completed'
      'check-square'
    when 'relationship_request', 'relationship_accepted'
      'heart'
    when 'partner_joined'
      'users'
    when 'system_announcement', 'feature_update'
      'info'
    else
      'bell'
    end
  end

  def color
    case priority
    when PRIORITIES[:urgent]
      'red'
    when PRIORITIES[:high]
      'orange'
    when PRIORITIES[:normal]
      'blue'
    else
      'gray'
    end
  end

  # Class methods
  class << self
    def cleanup_old_notifications(days_to_keep = 30)
      where('created_at < ? AND read = ?', days_to_keep.days.ago, true).destroy_all
    end

    def create_for_user!(user, type, title, body, options = {})
      create!(
        user: user,
        notification_type: type,
        title: title,
        body: body,
        priority: options[:priority] || PRIORITIES[:normal],
        data: options[:data] || {},
        metadata: options[:metadata] || {},
        expires_at: options[:expires_at],
        couple_id: options[:couple_id] || user.couple_id,
        related_user_id: options[:related_user_id]
      )
    end

    def create_for_couple!(couple, type, title, body, options = {})
      couple.users.map do |user|
        create_for_user!(user, type, title, body, options.merge(couple_id: couple.id))
      end
    end

    def batch_create!(notifications_data)
      transaction do
        notifications_data.map do |data|
          create!(data)
        end
      end
    end
  end

  private

  def set_defaults
    self.priority ||= PRIORITIES[:normal]
    self.read ||= false
  end

  def broadcast_notification
    NotificationChannel.broadcast_new_notification(self)
  end

  def broadcast_update
    NotificationChannel.broadcast_notification_update(self)
  end
end