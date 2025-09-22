class NotificationRetryJob < ApplicationJob
  queue_as :notifications
  sidekiq_options retry: false if respond_to?(:sidekiq_options)  # We handle retries manually

  MAX_RETRIES = 3
  RETRY_DELAYS = [5.seconds, 30.seconds, 2.minutes].freeze

  def perform(notification_id, attempt = 0)
    notification = Notification.find_by(id: notification_id)
    return unless notification

    log_info "Retrying notification ##{notification_id}, attempt #{attempt + 1}"

    # Check if we've exceeded max retries
    if attempt >= MAX_RETRIES
      handle_max_retries_exceeded(notification)
      return
    end

    # Try to deliver again
    deliver_notification(notification)

    log_info "Successfully delivered notification ##{notification_id} on retry #{attempt + 1}"
  rescue StandardError => e
    log_error "Retry #{attempt + 1} failed for notification ##{notification_id}: #{e.message}", e

    # Schedule next retry
    schedule_next_retry(notification, attempt + 1) if attempt + 1 < MAX_RETRIES
  end

  private

  def deliver_notification(notification)
    # Re-check validity
    raise "Notification expired" if notification.expired?

    # Attempt delivery through primary channel
    NotificationChannel.broadcast_new_notification(notification)

    # Update notification status
    notification.update!(
      delivered: true,
      delivered_at: Time.current,
      metadata: notification.metadata.merge(
        'retry_successful' => true,
        'retry_attempts' => notification.metadata['retry_attempts'] || 0
      )
    )
  end

  def schedule_next_retry(notification, next_attempt)
    delay = RETRY_DELAYS[next_attempt] || RETRY_DELAYS.last

    self.class.perform_in(delay, notification.id, next_attempt)

    notification.update!(
      metadata: notification.metadata.merge(
        'next_retry_at' => Time.current + delay,
        'retry_attempts' => next_attempt
      )
    )

    log_info "Scheduled retry #{next_attempt + 1} for notification ##{notification.id} in #{delay.inspect}"
  end

  def handle_max_retries_exceeded(notification)
    log_error "Max retries exceeded for notification ##{notification.id}"

    notification.update!(
      failed: true,
      metadata: notification.metadata.merge(
        'delivery_failed' => true,
        'max_retries_exceeded' => true,
        'failed_at' => Time.current
      )
    )

    # Notify admins about critical failures if high priority
    if notification.high_priority?
      AdminAlertJob.perform_later(
        'notification_delivery_failed',
        {
          notification_id: notification.id,
          user_id: notification.user_id,
          type: notification.notification_type
        }
      )
    end
  end
end