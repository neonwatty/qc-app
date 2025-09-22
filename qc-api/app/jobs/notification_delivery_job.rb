class NotificationDeliveryJob < ApplicationJob
  queue_as :notifications
  sidekiq_options retry: 5 if respond_to?(:sidekiq_options)

  def perform(notification_id)
    notification = Notification.find(notification_id)
    return if notification.blank?

    log_info "Delivering notification ##{notification_id} to user ##{notification.user_id}"

    # Check if notification is still valid
    return handle_expired_notification(notification) if notification.expired?

    # Check user preferences
    return handle_disabled_notification(notification) if user_disabled_notification?(notification)

    # Deliver via multiple channels
    deliver_via_websocket(notification)
    deliver_via_push(notification) if should_send_push?(notification)
    deliver_via_email(notification) if should_send_email?(notification)

    # Mark as delivered
    notification.update!(
      delivered: true,
      delivered_at: Time.current
    )

    log_info "Successfully delivered notification ##{notification_id}"
  rescue StandardError => e
    log_error "Failed to deliver notification ##{notification_id}: #{e.message}", e
    handle_delivery_failure(notification, e)
    raise
  end

  private

  def handle_expired_notification(notification)
    log_info "Notification ##{notification.id} has expired, skipping delivery"
    notification.update!(
      metadata: notification.metadata.merge('skipped_reason' => 'expired')
    )
  end

  def handle_disabled_notification(notification)
    log_info "User has disabled #{notification.notification_type} notifications"
    notification.update!(
      metadata: notification.metadata.merge('skipped_reason' => 'user_disabled')
    )
  end

  def user_disabled_notification?(notification)
    user = notification.user
    return false unless user.notification_preferences

    user.notification_preferences["disable_#{notification.notification_type}"] == true
  end

  def deliver_via_websocket(notification)
    NotificationChannel.broadcast_new_notification(notification)
  end

  def deliver_via_push(notification)
    return unless should_send_push?(notification)

    PushNotificationJob.perform_later(
      notification.user_id,
      notification.title,
      notification.body,
      notification.data
    )
  end

  def deliver_via_email(notification)
    return unless should_send_email?(notification)

    EmailNotificationJob.perform_later(notification.id)
  end

  def should_send_push?(notification)
    user = notification.user
    user.push_notifications_enabled? &&
      user.push_token.present? &&
      (notification.high_priority? || notification.action_required?)
  end

  def should_send_email?(notification)
    user = notification.user
    user.email_notifications_enabled? &&
      notification.action_required? &&
      user.notification_preferences['email_for_actions'] != false
  end

  def handle_delivery_failure(notification, error)
    notification.metadata['delivery_attempts'] ||= 0
    notification.metadata['delivery_attempts'] += 1
    notification.metadata['last_delivery_error'] = error.message
    notification.metadata['last_delivery_attempt'] = Time.current
    notification.save!
  end
end