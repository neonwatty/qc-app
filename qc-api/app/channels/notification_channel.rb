class NotificationChannel < ApplicationCable::Channel
  def subscribed
    # Personal notification stream
    stream_from "notifications_user_#{current_user.id}"

    # Couple-wide notification stream
    if current_couple
      stream_from "notifications_couple_#{current_couple.id}"
    end

    # Send any pending notifications on connection
    deliver_pending_notifications
  end

  def unsubscribed
    # Clean up any notification tracking
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
          action_url: "/checkin/#{note.check_in_id}/notes/#{note.id}"
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