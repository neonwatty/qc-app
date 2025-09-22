# Service for managing notifications and delivery
class NotificationService
  include Singleton

  # Delivery strategies
  DELIVERY_STRATEGIES = {
    immediate: :deliver_immediately,
    batched: :add_to_batch,
    scheduled: :schedule_delivery
  }.freeze

  # Retry configuration
  MAX_RETRIES = 3
  RETRY_DELAYS = [5.seconds, 30.seconds, 2.minutes].freeze

  class << self
    delegate :send_notification, :send_bulk_notifications, :process_batch,
             :retry_failed_notification, :cleanup_old_notifications,
             :get_user_stats, :get_delivery_metrics, to: :instance
  end

  def initialize
    @notification_queue = []
    @delivery_metrics = Hash.new(0)
    @batch_processor = nil
  end

  # Send a single notification
  def send_notification(user, type, title, body, options = {})
    # Validate user preferences
    return if user_has_disabled_notification?(user, type)

    # Create notification record
    notification = Notification.create_for_user!(
      user, type, title, body, options
    )

    # Determine delivery strategy
    strategy = determine_delivery_strategy(notification)
    send(DELIVERY_STRATEGIES[strategy], notification)

    # Track metrics
    track_delivery_metric(:sent, notification)

    notification
  rescue StandardError => e
    Rails.logger.error "Failed to send notification: #{e.message}"
    handle_delivery_failure(notification, e) if notification
  end

  # Send notifications to multiple users
  def send_bulk_notifications(users, type, title, body, options = {})
    notifications = []

    users.each do |user|
      next if user_has_disabled_notification?(user, type)

      notifications << {
        user_id: user.id,
        notification_type: type,
        title: title,
        body: body,
        priority: options[:priority] || Notification::PRIORITIES[:normal],
        data: options[:data] || {},
        metadata: options[:metadata] || {},
        couple_id: options[:couple_id] || user.couple_id
      }
    end

    # Batch create for efficiency
    created = Notification.batch_create!(notifications)

    # Deliver notifications
    created.each do |notification|
      strategy = determine_delivery_strategy(notification)
      send(DELIVERY_STRATEGIES[strategy], notification)
    end

    track_delivery_metric(:bulk_sent, created.size)
    created
  end

  # Process batched notifications
  def process_batch
    return if @notification_queue.empty?

    batch = @notification_queue.shift(10) # Process up to 10 at a time

    batch.each do |notification|
      deliver_immediately(notification)
    end

    # Schedule next batch processing if queue not empty
    schedule_next_batch_processing if @notification_queue.any?
  end

  # Retry failed notification delivery
  def retry_failed_notification(notification, attempt = 0)
    return if attempt >= MAX_RETRIES

    delay = RETRY_DELAYS[attempt]

    NotificationRetryJob.perform_in(delay, notification.id, attempt + 1)

    notification.metadata['retry_attempts'] = attempt + 1
    notification.metadata['next_retry_at'] = Time.current + delay
    notification.save!

    Rails.logger.info "Scheduled retry #{attempt + 1} for notification #{notification.id}"
  end

  # Clean up old notifications
  def cleanup_old_notifications
    # Delete read notifications older than 30 days
    deleted_count = Notification.cleanup_old_notifications(30)

    # Archive important notifications
    archive_important_notifications

    Rails.logger.info "Cleaned up #{deleted_count} old notifications"
    deleted_count
  end

  # Get notification statistics for a user
  def get_user_stats(user)
    {
      total: user.notifications.count,
      unread: user.notifications.unread.count,
      high_priority_unread: user.notifications.unread.high_priority.count,
      today: user.notifications.today.count,
      this_week: user.notifications.this_week.count,
      by_type: user.notifications.group(:notification_type).count,
      average_read_time: calculate_average_read_time(user)
    }
  end

  # Get delivery metrics
  def get_delivery_metrics
    @delivery_metrics.merge(
      queue_size: @notification_queue.size,
      failed_today: Notification.where(
        'created_at > ? AND metadata @> ?',
        Time.current.beginning_of_day,
        { delivery_failed: true }.to_json
      ).count
    )
  end

  # Handle specific notification types
  def send_reminder_notification(reminder)
    return unless reminder.active?

    send_notification(
      reminder.user,
      'check_in_reminder',
      reminder.title,
      reminder.description,
      {
        data: {
          reminder_id: reminder.id,
          scheduled_time: reminder.scheduled_for
        },
        priority: Notification::PRIORITIES[:high]
      }
    )
  end

  def send_milestone_notification(milestone)
    users = milestone.couple.users

    send_bulk_notifications(
      users,
      'milestone_achieved',
      "Milestone Achieved: #{milestone.title}",
      milestone.description,
      {
        data: {
          milestone_id: milestone.id,
          achievement_date: milestone.achieved_at
        },
        priority: Notification::PRIORITIES[:normal]
      }
    )
  end

  def send_action_item_reminder(action_item)
    return if action_item.completed?
    return unless action_item.due_date

    days_until_due = (action_item.due_date - Date.current).to_i

    priority = case days_until_due
               when ..0 then Notification::PRIORITIES[:urgent]
               when 1 then Notification::PRIORITIES[:high]
               else Notification::PRIORITIES[:normal]
               end

    send_notification(
      action_item.assigned_to,
      'action_item_due_soon',
      "Action Item Due: #{action_item.title}",
      "This action item is due in #{days_until_due} days",
      {
        data: {
          action_item_id: action_item.id,
          due_date: action_item.due_date
        },
        priority: priority
      }
    )
  end

  private

  def user_has_disabled_notification?(user, type)
    return false unless user.notification_preferences

    # Check if user has disabled this notification type
    user.notification_preferences["disable_#{type}"] == true
  end

  def determine_delivery_strategy(notification)
    if notification.high_priority?
      :immediate
    elsif notification.priority == Notification::PRIORITIES[:low]
      :batched
    else
      :immediate
    end
  end

  def deliver_immediately(notification)
    # Send via WebSocket
    NotificationChannel.broadcast_new_notification(notification)

    # Send push notification if enabled
    send_push_notification(notification) if should_send_push?(notification)

    # Send email if configured
    send_email_notification(notification) if should_send_email?(notification)

    track_delivery_metric(:delivered, notification)
  end

  def add_to_batch(notification)
    @notification_queue << notification

    # Start batch processor if not running
    schedule_next_batch_processing if @notification_queue.size == 1
  end

  def schedule_delivery(notification, deliver_at)
    NotificationDeliveryJob.perform_at(deliver_at, notification.id)
  end

  def schedule_next_batch_processing
    return if @batch_processor&.pending?

    @batch_processor = Concurrent::ScheduledTask.execute(2.seconds) do
      process_batch
    end if defined?(Concurrent::ScheduledTask)
  end

  def send_push_notification(notification)
    return unless notification.user.push_token.present?

    # Integration with push service (FCM/APNS)
    # This is a placeholder for actual implementation
    Rails.logger.info "Would send push notification: #{notification.title}"
  end

  def send_email_notification(notification)
    return unless notification.user.email_notifications_enabled?

    # Queue email job
    NotificationMailer.notification_email(notification).deliver_later
  end

  def should_send_push?(notification)
    user = notification.user
    user.push_notifications_enabled? &&
      user.push_token.present? &&
      notification.high_priority?
  end

  def should_send_email?(notification)
    user = notification.user
    user.email_notifications_enabled? &&
      notification.action_required? &&
      user.notification_preferences['email_for_actions'] != false
  end

  def handle_delivery_failure(notification, error)
    notification.metadata['delivery_failed'] = true
    notification.metadata['delivery_error'] = error.message
    notification.metadata['failed_at'] = Time.current
    notification.save!

    # Schedule retry for high priority notifications
    retry_failed_notification(notification) if notification.high_priority?

    track_delivery_metric(:failed, notification)
  end

  def track_delivery_metric(action, notification_or_count)
    if notification_or_count.is_a?(Notification)
      @delivery_metrics["#{action}_#{notification_or_count.notification_type}"] += 1
    else
      @delivery_metrics[action] += notification_or_count
    end

    @delivery_metrics["#{action}_total"] += 1
  end

  def calculate_average_read_time(user)
    read_notifications = user.notifications.read.where.not(read_at: nil)
    return 0 if read_notifications.empty?

    total_time = read_notifications.sum { |n| n.read_at - n.created_at }
    (total_time / read_notifications.count).round
  end

  def archive_important_notifications
    # Archive milestone and relationship notifications
    important_types = ['milestone_achieved', 'relationship_request', 'relationship_accepted']

    to_archive = Notification.where(
      notification_type: important_types,
      created_at: 30.days.ago..90.days.ago
    )

    to_archive.each do |notification|
      notification.metadata['archived'] = true
      notification.metadata['archived_at'] = Time.current
      notification.save!
    end
  end
end