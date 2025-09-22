class NotificationDeliveryJob < ApplicationJob
  queue_as :notifications
  sidekiq_options retry: 5 if respond_to?(:sidekiq_options)

  # Advanced retry configuration
  retry_on ActiveRecord::RecordNotFound, wait: 5.seconds, attempts: 3
  retry_on ActiveRecord::ConnectionTimeoutError, wait: :exponentially_longer, attempts: 5
  retry_on Net::OpenTimeout, wait: :exponentially_longer, attempts: 3
  retry_on Net::ReadTimeout, wait: 30.seconds, attempts: 3

  # Discard if notification is deleted or invalid
  discard_on ActiveJob::DeserializationError do |job, error|
    job.log_error "Discarding job due to deserialization error: #{error.message}"
  end

  # Custom retry behavior for specific errors
  rescue_from(StandardError) do |exception|
    notification_id = arguments.first
    notification = Notification.find_by(id: notification_id)

    if notification && should_retry_delivery?(notification, exception)
      retry_with_backoff(notification, exception)
    else
      handle_permanent_failure(notification, exception) if notification
      raise exception
    end
  end

  # Job callbacks
  before_perform :validate_notification
  after_perform :update_delivery_metrics
  around_perform :monitor_performance

  def perform(notification_id, options = {})
    @notification = Notification.find(notification_id)
    @delivery_options = options.with_indifferent_access
    @delivery_results = {}

    log_info "Delivering notification ##{notification_id} to user ##{@notification.user_id}"

    # Check if notification is still valid
    return handle_expired_notification if @notification.expired?

    # Check user preferences
    return handle_disabled_notification if user_disabled_notification?

    # Attempt delivery through configured channels
    deliver_through_channels

    # Verify delivery success
    verify_delivery_success

    # Mark as delivered
    mark_as_delivered

    log_info "Successfully delivered notification ##{notification_id} via #{@delivery_results.keys.join(', ')}"
  rescue StandardError => e
    log_error "Failed to deliver notification ##{notification_id}: #{e.message}", e
    handle_delivery_failure(e)
    raise
  end

  private

  def handle_expired_notification
    log_info "Notification ##{@notification.id} has expired, skipping delivery"
    @notification.update!(
      metadata: @notification.metadata.merge('skipped_reason' => 'expired')
    )
  end

  def handle_disabled_notification
    log_info "User has disabled #{@notification.notification_type} notifications"
    @notification.update!(
      metadata: @notification.metadata.merge('skipped_reason' => 'user_disabled')
    )
  end

  def user_disabled_notification?
    user = @notification.user
    return false unless user.notification_preferences

    user.notification_preferences["disable_#{@notification.notification_type}"] == true
  end

  def deliver_through_channels
    # Deliver through primary channel first
    deliver_via_websocket

    # Then through secondary channels based on configuration
    deliver_via_push if should_send_push?
    deliver_via_email if should_send_email?
    deliver_via_sms if should_send_sms?
  end

  def deliver_via_websocket
    result = NotificationChannel.broadcast_new_notification(@notification)
    @delivery_results[:websocket] = { success: true, delivered_at: Time.current }
    result
  rescue StandardError => e
    @delivery_results[:websocket] = { success: false, error: e.message }
    log_error "WebSocket delivery failed: #{e.message}"
  end

  def deliver_via_push
    return unless should_send_push?

    PushNotificationJob.perform_later(
      @notification.user_id,
      @notification.title,
      @notification.body,
      @notification.data
    )
    @delivery_results[:push] = { success: true, queued_at: Time.current }
  rescue StandardError => e
    @delivery_results[:push] = { success: false, error: e.message }
    log_error "Push notification queueing failed: #{e.message}"
  end

  def deliver_via_email
    return unless should_send_email?

    EmailNotificationJob.perform_later(@notification.id)
    @delivery_results[:email] = { success: true, queued_at: Time.current }
  rescue StandardError => e
    @delivery_results[:email] = { success: false, error: e.message }
    log_error "Email notification queueing failed: #{e.message}"
  end

  def deliver_via_sms
    return unless should_send_sms?

    SmsNotificationJob.perform_later(@notification.id)
    @delivery_results[:sms] = { success: true, queued_at: Time.current }
  rescue StandardError => e
    @delivery_results[:sms] = { success: false, error: e.message }
    log_error "SMS notification queueing failed: #{e.message}"
  end

  def should_send_push?
    user = @notification.user
    user.push_notifications_enabled? &&
      user.push_token.present? &&
      (@notification.high_priority? || @notification.action_required? || @delivery_options[:force_push])
  end

  def should_send_email?
    user = @notification.user
    user.email_notifications_enabled? &&
      (@notification.action_required? || @delivery_options[:include_email]) &&
      user.notification_preferences['email_for_actions'] != false
  end

  def should_send_sms?
    user = @notification.user
    user.sms_notifications_enabled? &&
      user.phone_number.present? &&
      @notification.urgent? &&
      @delivery_options[:allow_sms] != false
  end

  def verify_delivery_success
    # Check if at least one channel succeeded
    successful_channels = @delivery_results.select { |_, result| result[:success] }

    if successful_channels.empty?
      raise DeliveryFailureError, "Failed to deliver through any channel"
    end
  end

  def mark_as_delivered
    @notification.update!(
      delivered: true,
      delivered_at: Time.current,
      delivery_channels: @delivery_results.select { |_, r| r[:success] }.keys,
      metadata: @notification.metadata.merge(
        'delivery_results' => @delivery_results,
        'delivered_by_job' => job_id
      )
    )
  end

  def handle_delivery_failure(error)
    @notification.metadata['delivery_attempts'] ||= 0
    @notification.metadata['delivery_attempts'] += 1
    @notification.metadata['last_delivery_error'] = error.message
    @notification.metadata['last_delivery_attempt'] = Time.current
    @notification.metadata['failed_channels'] = @delivery_results.reject { |_, r| r[:success] }.keys
    @notification.save!
  end

  def should_retry_delivery?(notification, exception)
    # Don't retry if max attempts reached
    attempts = notification.metadata['delivery_attempts'] || 0
    return false if attempts >= max_retry_attempts

    # Don't retry for certain error types
    return false if permanent_failure?(exception)

    # Don't retry expired notifications
    return false if notification.expired?

    true
  end

  def retry_with_backoff(notification, exception)
    attempts = notification.metadata['delivery_attempts'] || 0
    wait_time = calculate_backoff_time(attempts)

    self.class.set(wait: wait_time).perform_later(notification.id, @delivery_options)

    log_info "Scheduling retry #{attempts + 1} for notification ##{notification.id} in #{wait_time.inspect}"
  end

  def calculate_backoff_time(attempts)
    case attempts
    when 0 then 5.seconds
    when 1 then 30.seconds
    when 2 then 2.minutes
    when 3 then 10.minutes
    else 30.minutes
    end
  end

  def permanent_failure?(exception)
    exception.is_a?(ActiveRecord::RecordInvalid) ||
      exception.is_a?(ArgumentError) ||
      exception.message.include?('Invalid notification')
  end

  def handle_permanent_failure(notification, exception)
    notification.update!(
      failed: true,
      failed_at: Time.current,
      metadata: notification.metadata.merge(
        'permanent_failure' => true,
        'failure_reason' => exception.message
      )
    )

    # Alert admins for high-priority failures
    if notification.high_priority?
      AdminAlertJob.perform_later(
        'notification_permanent_failure',
        notification_id: notification.id,
        error: exception.message
      )
    end
  end

  def max_retry_attempts
    @delivery_options[:max_retries] || 5
  end

  # Job callbacks
  def validate_notification
    @notification = Notification.find(arguments.first)
    raise "Invalid notification" unless @notification.valid?
  end

  def update_delivery_metrics
    return unless defined?(DeliveryMetric)

    DeliveryMetric.create!(
      notification_id: @notification.id,
      delivered_at: Time.current,
      channels: @delivery_results.select { |_, r| r[:success] }.keys,
      attempts: @notification.metadata['delivery_attempts'] || 1
    )
  end

  def monitor_performance
    start_time = Time.current
    yield
    duration = Time.current - start_time

    log_info "Notification delivered in #{duration.round(3)}s"

    # Track slow deliveries
    if duration > 5.seconds
      log_warn "Slow notification delivery: #{duration.round(2)}s for notification ##{@notification.id}"
    end
  rescue StandardError => e
    duration = Time.current - start_time
    log_error "Notification delivery failed after #{duration.round(3)}s", e
    raise
  end

  class DeliveryFailureError < StandardError; end
end