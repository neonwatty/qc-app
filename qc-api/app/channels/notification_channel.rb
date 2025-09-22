class NotificationChannel < ApplicationCable::Channel
  # Batching configuration
  BATCH_SIZE = 10
  BATCH_DELAY = 2.seconds

  def subscribed
    # Personal notification stream
    stream_from "notifications_user_#{current_user.id}"

    # Priority notification stream for urgent messages
    stream_from "notifications_priority_#{current_user.id}"

    # Couple-wide notification stream
    if current_couple
      stream_from "notifications_couple_#{current_couple.id}"
    end

    # Initialize notification tracking
    initialize_notification_tracking

    # Send any pending notifications on connection
    deliver_pending_notifications

    # Schedule notification sync
    schedule_notification_sync
  end

  def unsubscribed
    # Clean up notification tracking
    cleanup_notification_tracking
  end

  # Mark notification as read
  def mark_read(data)
    notification_id = data['notification_id']
    notification = current_user.notifications.find_by(id: notification_id)

    if notification && !notification.read?
      notification.update!(
        read: true,
        read_at: Time.current
      )

      # Broadcast read status update
      ActionCable.server.broadcast(
        "notifications_user_#{current_user.id}",
        {
          event: 'notification_read',
          notification_id: notification.id,
          read_at: notification.read_at.iso8601
        }
      )

      # Update unread count
      broadcast_unread_count
    end
  end

  # Mark all notifications as read
  def mark_all_read
    unread_notifications = current_user.notifications.unread

    if unread_notifications.any?
      unread_notifications.update_all(
        read: true,
        read_at: Time.current
      )

      ActionCable.server.broadcast(
        "notifications_user_#{current_user.id}",
        {
          event: 'all_notifications_read',
          count: unread_notifications.count,
          timestamp: Time.current.iso8601
        }
      )

      broadcast_unread_count
    end
  end

  # Delete a notification
  def delete_notification(data)
    notification_id = data['notification_id']
    notification = current_user.notifications.find_by(id: notification_id)

    if notification
      notification.destroy

      ActionCable.server.broadcast(
        "notifications_user_#{current_user.id}",
        {
          event: 'notification_deleted',
          notification_id: notification_id
        }
      )

      broadcast_unread_count
    end
  end

  # Batch mark as read
  def batch_mark_read(data)
    notification_ids = data['notification_ids'] || []
    return if notification_ids.empty?

    notifications = current_user.notifications.where(id: notification_ids, read: false)

    if notifications.any?
      notifications.update_all(
        read: true,
        read_at: Time.current
      )

      ActionCable.server.broadcast(
        "notifications_user_#{current_user.id}",
        {
          event: 'batch_marked_read',
          notification_ids: notifications.pluck(:id),
          timestamp: Time.current.iso8601
        }
      )

      broadcast_unread_count
    end
  end

  # Request notification history
  def request_history(data)
    page = data['page'] || 1
    per_page = data['per_page'] || 20
    filter = data['filter'] || 'all'

    notifications = current_user.notifications.active

    # Apply filters
    case filter
    when 'unread'
      notifications = notifications.unread
    when 'high_priority'
      notifications = notifications.high_priority
    when 'today'
      notifications = notifications.today
    when 'this_week'
      notifications = notifications.this_week
    end

    # Paginate
    notifications = notifications.recent.page(page).per(per_page)

    # Send paginated history
    ActionCable.server.broadcast(
      "notifications_user_#{current_user.id}",
      {
        event: 'history_response',
        notifications: notifications.map { |n| serialize_notification(n) },
        pagination: {
          current_page: notifications.current_page,
          total_pages: notifications.total_pages,
          total_count: notifications.total_count
        }
      }
    )
  end

  # Acknowledge notification receipt
  def acknowledge(data)
    notification_id = data['notification_id']
    notification = current_user.notifications.find_by(id: notification_id)

    if notification
      notification.update_columns(
        acknowledged: true,
        acknowledged_at: Time.current
      )

      # Track delivery metrics
      track_notification_metric(notification, 'acknowledged')
    end
  end

  # Snooze notification
  def snooze_notification(data)
    notification_id = data['notification_id']
    duration = data['duration'] || 60 # minutes
    notification = current_user.notifications.find_by(id: notification_id)

    if notification && !notification.read?
      snooze_until = Time.current + duration.minutes

      notification.update!(
        snoozed: true,
        snooze_until: snooze_until
      )

      # Schedule notification to reappear
      NotificationReminderJob.perform_at(
        snooze_until,
        notification.id
      )

      ActionCable.server.broadcast(
        "notifications_user_#{current_user.id}",
        {
          event: 'notification_snoozed',
          notification_id: notification.id,
          snooze_until: snooze_until.iso8601
        }
      )
    end
  end

  # Subscribe to specific notification types
  def update_preferences(data)
    preferences = data['preferences'] || {}

    current_user.update!(
      notification_preferences: current_user.notification_preferences.merge(preferences)
    )

    ActionCable.server.broadcast(
      "notifications_user_#{current_user.id}",
      {
        event: 'preferences_updated',
        preferences: current_user.notification_preferences
      }
    )
  end

  # Class method to send notifications from other parts of the app
  class << self
    def broadcast_new_notification(notification)
      # Determine broadcast channel based on priority
      channel = if notification.high_priority?
                  "notifications_priority_#{notification.user_id}"
                else
                  "notifications_user_#{notification.user_id}"
                end

      ActionCable.server.broadcast(
        channel,
        {
          event: 'new_notification',
          notification: serialize_notification(notification),
          priority: notification.priority
        }
      )

      # Update unread count
      broadcast_unread_count_for(notification.user)
    end

    def broadcast_notification_update(notification)
      ActionCable.server.broadcast(
        "notifications_user_#{notification.user_id}",
        {
          event: 'notification_updated',
          notification: serialize_notification(notification)
        }
      )
    end

    def broadcast_unread_count_for(user)
      count = user.notifications.unread.count
      priority_count = user.notifications.unread.high_priority.count

      ActionCable.server.broadcast(
        "notifications_user_#{user.id}",
        {
          event: 'unread_count_updated',
          count: count,
          priority_count: priority_count
        }
      )
    end
    def notify_user(user, type, title, body, data = {})
      notification = user.notifications.create!(
        notification_type: type,
        title: title,
        body: body,
        data: data,
        created_at: Time.current
      )

      # Broadcast to user's notification stream
      ActionCable.server.broadcast(
        "notifications_user_#{user.id}",
        {
          event: 'new_notification',
          notification: serialize_notification(notification)
        }
      )

      # Send push notification if enabled
      send_push_notification(user, notification) if user.push_notifications_enabled?

      notification
    end

    def notify_couple(couple, type, title, body, data = {})
      couple.users.each do |user|
        notify_user(user, type, title, body, data.merge(couple_id: couple.id))
      end
    end

    def notify_check_in_reminder(check_in)
      couple = check_in.couple

      notify_couple(
        couple,
        'check_in_reminder',
        'Time for your check-in!',
        "Your scheduled check-in session is ready to begin.",
        {
          check_in_id: check_in.id,
          action_url: "/checkin/#{check_in.id}"
        }
      )
    end

    def notify_partner_shared_note(note)
      author = note.author
      partner = author.partner
      return unless partner

      notify_user(
        partner,
        'note_shared',
        "#{author.name} shared a note",
        note.content[0..100],
        {
          note_id: note.id,
          check_in_id: note.check_in_id,
          author_id: author.id,
          action_url: "/checkin/#{note.check_in_id}/notes/#{note.id}",
          priority: Notification::PRIORITIES[:normal]
        }
      )
    end

    def notify_relationship_request(request)
      notify_user(
        request.recipient,
        'relationship_request',
        'New Relationship Request',
        "#{request.sender.name} wants to connect with you",
        {
          request_id: request.id,
          sender_id: request.sender_id,
          action_url: "/settings/relationships/requests/#{request.id}",
          priority: Notification::PRIORITIES[:high]
        }
      )
    end

    def notify_reminder_due(reminder)
      notify_couple(
        reminder.couple,
        'check_in_reminder',
        reminder.title,
        reminder.message,
        {
          reminder_id: reminder.id,
          scheduled_for: reminder.scheduled_for.iso8601,
          action_url: "/checkin/new",
          priority: Notification::PRIORITIES[:high]
        }
      )
    end

    def notify_weekly_summary(couple, summary_data)
      notify_couple(
        couple,
        'weekly_summary',
        'Your Weekly Relationship Summary',
        "Check out your progress from this week!",
        {
          week_start: summary_data[:week_start],
          week_end: summary_data[:week_end],
          stats: summary_data[:stats],
          action_url: "/dashboard",
          priority: Notification::PRIORITIES[:low]
        }
      )
    end

    def notify_milestone_achieved(milestone)
      notify_couple(
        milestone.couple,
        'milestone_achieved',
        'Milestone Achieved!',
        "Congratulations! You've reached: #{milestone.title}",
        {
          milestone_id: milestone.id,
          action_url: "/growth/milestones/#{milestone.id}"
        }
      )
    end

    def notify_action_item_assigned(action_item)
      assignee = action_item.assigned_to
      assigner = action_item.created_by

      notify_user(
        assignee,
        'action_item_assigned',
        'New Action Item',
        "#{assigner.name} assigned you: #{action_item.title}",
        {
          action_item_id: action_item.id,
          check_in_id: action_item.check_in_id,
          due_date: action_item.due_date&.iso8601,
          action_url: "/checkin/#{action_item.check_in_id}/action-items/#{action_item.id}"
        }
      )
    end

    def notify_action_item_completed(action_item)
      completer = action_item.completed_by
      partner = completer.partner
      return unless partner

      notify_user(
        partner,
        'action_item_completed',
        'Action Item Completed',
        "#{completer.name} completed: #{action_item.title}",
        {
          action_item_id: action_item.id,
          completed_at: action_item.completed_at.iso8601
        }
      )
    end

    private

    def serialize_notification(notification)
      {
        id: notification.id,
        type: notification.notification_type,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        read: notification.read,
        read_at: notification.read_at&.iso8601,
        created_at: notification.created_at.iso8601
      }
    end

    def send_push_notification(user, notification)
      # Integrate with push notification service (FCM, APNS, etc.)
      # This is a placeholder for actual push notification implementation
      Rails.logger.info "Would send push notification to user #{user.id}: #{notification.title}"
    end
  end

  private

  def initialize_notification_tracking
    @notification_batch = []
    @batch_timer = nil
    @sync_timer = nil
  end

  def cleanup_notification_tracking
    if @batch_timer
      @batch_timer.shutdown if @batch_timer.respond_to?(:shutdown)
      @batch_timer = nil
    end

    if @sync_timer
      @sync_timer.shutdown if @sync_timer.respond_to?(:shutdown)
      @sync_timer = nil
    end

    @notification_batch = []
  end

  def schedule_notification_sync
    return unless defined?(Concurrent::ScheduledTask)

    # Sync notifications every 30 seconds
    @sync_timer = Concurrent::ScheduledTask.execute(30) do
      sync_notifications
      schedule_notification_sync # Reschedule
    end
  end

  def sync_notifications
    # Check for any missed notifications
    last_sync = @last_sync_at || 1.minute.ago
    missed = current_user.notifications
                         .where('created_at > ?', last_sync)
                         .where.not(id: @synced_ids || [])

    if missed.any?
      notifications = missed.map { |n| serialize_notification(n) }

      ActionCable.server.broadcast(
        "notifications_user_#{current_user.id}",
        {
          event: 'missed_notifications',
          notifications: notifications
        }
      )

      @synced_ids = ((@synced_ids || []) + missed.pluck(:id)).last(100)
    end

    @last_sync_at = Time.current
  end

  def track_notification_metric(notification, action)
    # Track metrics for analytics
    Rails.logger.info "Notification metric: #{action} for notification #{notification.id}"

    # Could integrate with analytics service
    # Analytics.track(
    #   user_id: notification.user_id,
    #   event: "notification_#{action}",
    #   properties: {
    #     notification_id: notification.id,
    #     notification_type: notification.notification_type,
    #     time_to_action: Time.current - notification.created_at
    #   }
    # )
  end

  def deliver_pending_notifications
    # Send any unread notifications when user connects
    unread = current_user.notifications.unread.limit(20)

    if unread.any?
      notifications = unread.map { |n| serialize_notification(n) }

      ActionCable.server.broadcast(
        "notifications_user_#{current_user.id}",
        {
          event: 'pending_notifications',
          notifications: notifications,
          unread_count: current_user.notifications.unread.count
        }
      )
    end
  end

  def broadcast_unread_count
    count = current_user.notifications.unread.count

    ActionCable.server.broadcast(
      "notifications_user_#{current_user.id}",
      {
        event: 'unread_count_updated',
        count: count
      }
    )
  end

  def serialize_notification(notification)
    self.class.send(:serialize_notification, notification)
  end
end