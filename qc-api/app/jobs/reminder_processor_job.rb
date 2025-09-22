class ReminderProcessorJob < ApplicationJob
  queue_as :reminders
  queue_with_priority 2

  # Retry configuration for transient failures
  retry_on ActiveRecord::RecordNotFound, wait: 5.seconds, attempts: 3
  retry_on ActiveRecord::ConnectionTimeoutError, wait: :exponentially_longer, attempts: 5

  # Discard if reminder is deleted
  discard_on ActiveJob::DeserializationError

  # Job callbacks for monitoring
  before_perform :log_job_start
  after_perform :log_job_completion
  around_perform :track_performance

  def perform(reminder_type = 'all', options = {})
    case reminder_type
    when 'all'
      process_all_reminders
    when 'scheduled'
      process_scheduled_reminders(options)
    when 'recurring'
      process_recurring_reminders(options)
    when 'custom'
      process_custom_reminders(options)
    when 'specific'
      process_specific_reminder(options[:reminder_id])
    else
      log_error "Unknown reminder type: #{reminder_type}"
    end
  end

  private

  def process_all_reminders
    log_info "Processing all active reminders"

    # Process different types in priority order
    process_urgent_reminders
    process_scheduled_reminders
    process_recurring_reminders
    process_custom_reminders

    log_info "Completed processing all reminders"
  end

  def process_urgent_reminders
    urgent_reminders = Reminder.urgent
                              .where('scheduled_for <= ?', Time.current + 5.minutes)
                              .where(processed: false)

    urgent_reminders.find_each do |reminder|
      process_reminder_with_priority(reminder, :urgent)
    end

    log_info "Processed #{urgent_reminders.count} urgent reminders"
  end

  def process_scheduled_reminders(options = {})
    time_window = options[:time_window] || 15.minutes
    current_time = Time.current

    reminders = Reminder.scheduled
                       .where(scheduled_for: current_time..(current_time + time_window))
                       .where(processed: false)

    reminders.find_each do |reminder|
      schedule_reminder_delivery(reminder)
    end

    log_info "Scheduled #{reminders.count} reminders for delivery"
  end

  def process_recurring_reminders(options = {})
    reminders = Reminder.recurring.active

    reminders.find_each do |reminder|
      next unless should_process_recurring?(reminder)

      process_recurring_reminder(reminder)
      update_next_occurrence(reminder)
    end

    log_info "Processed #{reminders.count} recurring reminders"
  end

  def process_custom_reminders(options = {})
    reminders = Reminder.custom.active

    reminders.find_each do |reminder|
      next unless matches_custom_criteria?(reminder, options)

      process_custom_reminder(reminder)
    end
  end

  def process_specific_reminder(reminder_id)
    reminder = Reminder.find(reminder_id)

    log_info "Processing specific reminder ##{reminder_id}"

    # Determine processing strategy
    if reminder.urgent?
      process_reminder_with_priority(reminder, :urgent)
    elsif reminder.recurring?
      process_recurring_reminder(reminder)
    else
      schedule_reminder_delivery(reminder)
    end

    log_info "Completed processing reminder ##{reminder_id}"
  rescue ActiveRecord::RecordNotFound
    log_error "Reminder ##{reminder_id} not found"
  end

  def process_reminder_with_priority(reminder, priority)
    # Create high-priority notification
    notification = create_reminder_notification(reminder, priority)

    # Queue immediate delivery
    NotificationDeliveryJob.set(queue: :urgent).perform_later(notification.id)

    # Mark reminder as processed
    reminder.update!(
      processed: true,
      processed_at: Time.current,
      metadata: reminder.metadata.merge(
        'priority_processed' => true,
        'priority_level' => priority
      )
    )

    log_info "Processed priority reminder ##{reminder.id} with priority: #{priority}"
  end

  def schedule_reminder_delivery(reminder)
    # Calculate optimal delivery time
    delivery_time = calculate_optimal_delivery_time(reminder)

    # Schedule the delivery job
    ReminderDeliveryJob.set(wait_until: delivery_time).perform_later(reminder.id)

    # Update reminder status
    reminder.update!(
      scheduled_job_at: delivery_time,
      metadata: reminder.metadata.merge(
        'scheduled_for_delivery' => delivery_time,
        'scheduling_job_id' => job_id
      )
    )

    log_info "Scheduled reminder ##{reminder.id} for delivery at #{delivery_time}"
  end

  def process_recurring_reminder(reminder)
    # Check if it's time to trigger
    return unless time_to_trigger?(reminder)

    # Create notification for this occurrence
    notification = create_reminder_notification(reminder)

    # Queue delivery
    NotificationDeliveryJob.perform_later(notification.id)

    # Update trigger count and last triggered time
    reminder.update!(
      trigger_count: reminder.trigger_count + 1,
      last_triggered_at: Time.current
    )

    log_info "Triggered recurring reminder ##{reminder.id} (occurrence #{reminder.trigger_count})"
  end

  def process_custom_reminder(reminder)
    # Parse custom rules
    rules = parse_custom_rules(reminder.custom_rules)

    # Evaluate conditions
    return unless evaluate_custom_conditions(rules, reminder)

    # Process based on custom action
    case rules['action']
    when 'notify'
      create_and_deliver_notification(reminder, rules)
    when 'schedule'
      schedule_custom_delivery(reminder, rules)
    when 'batch'
      add_to_batch_queue(reminder, rules)
    else
      log_error "Unknown custom action: #{rules['action']}"
    end
  end

  def should_process_recurring?(reminder)
    return false unless reminder.active?

    # Check if enough time has passed since last trigger
    if reminder.last_triggered_at
      time_since_last = Time.current - reminder.last_triggered_at
      interval = calculate_recurrence_interval(reminder)
      return false if time_since_last < interval
    end

    # Check if within active period
    return false if reminder.end_date && Date.current > reminder.end_date

    true
  end

  def time_to_trigger?(reminder)
    current_time = Time.current
    scheduled_time = reminder.next_scheduled_at || reminder.scheduled_for

    # Allow 5-minute window
    (scheduled_time - 5.minutes..scheduled_time + 5.minutes).cover?(current_time)
  end

  def update_next_occurrence(reminder)
    next_time = calculate_next_occurrence(reminder)
    return unless next_time

    reminder.update!(next_scheduled_at: next_time)

    # Schedule the next processing
    self.class.set(wait_until: next_time).perform_later('specific', reminder_id: reminder.id)

    log_info "Scheduled next occurrence for reminder ##{reminder.id} at #{next_time}"
  end

  def calculate_next_occurrence(reminder)
    base_time = reminder.last_triggered_at || Time.current

    case reminder.frequency
    when 'daily'
      base_time + 1.day
    when 'weekly'
      calculate_weekly_occurrence(reminder, base_time)
    when 'monthly'
      calculate_monthly_occurrence(reminder, base_time)
    when 'custom'
      calculate_custom_occurrence(reminder, base_time)
    else
      nil
    end
  end

  def calculate_weekly_occurrence(reminder, base_time)
    # Handle specific days of week
    if reminder.days_of_week.present?
      next_day = reminder.days_of_week.map do |day|
        next_occurrence = base_time.next_occurring(day.to_sym)
        next_occurrence.change(
          hour: reminder.time_of_day.hour,
          min: reminder.time_of_day.min
        )
      end.min

      return next_day if next_day > base_time
    end

    base_time + 1.week
  end

  def calculate_monthly_occurrence(reminder, base_time)
    # Handle specific day of month
    if reminder.day_of_month.present?
      next_month = base_time.next_month
      next_occurrence = next_month.change(
        day: [reminder.day_of_month, next_month.end_of_month.day].min,
        hour: reminder.time_of_day.hour,
        min: reminder.time_of_day.min
      )

      return next_occurrence if next_occurrence > base_time
    end

    base_time + 1.month
  end

  def calculate_custom_occurrence(reminder, base_time)
    return unless reminder.custom_schedule

    # Parse custom cron-like expression or interval
    schedule = reminder.custom_schedule

    case schedule['type']
    when 'interval'
      base_time + schedule['interval'].to_i.send(schedule['unit'])
    when 'cron'
      parse_cron_expression(schedule['expression'], base_time)
    when 'conditional'
      evaluate_conditional_schedule(schedule, base_time)
    else
      nil
    end
  end

  def calculate_optimal_delivery_time(reminder)
    preferred_time = reminder.preferred_delivery_time || Time.current

    # Adjust for user timezone if available
    if reminder.user&.timezone
      preferred_time = preferred_time.in_time_zone(reminder.user.timezone)
    end

    # Don't deliver too early or too late
    hour = preferred_time.hour
    if hour < 8
      preferred_time = preferred_time.change(hour: 8)
    elsif hour > 22
      preferred_time = preferred_time.change(hour: 20)
    end

    # Ensure it's in the future
    preferred_time = Time.current + 5.minutes if preferred_time <= Time.current

    preferred_time
  end

  def create_reminder_notification(reminder, priority = nil)
    priority ||= determine_priority(reminder)

    Notification.create_for_user!(
      reminder.user,
      'reminder',
      reminder.title,
      reminder.message || reminder.description,
      {
        priority: priority,
        data: {
          reminder_id: reminder.id,
          reminder_type: reminder.reminder_type,
          scheduled_time: reminder.scheduled_for,
          action_url: reminder.action_url
        },
        expires_at: reminder.expires_at || Time.current + 24.hours
      }
    )
  end

  def determine_priority(reminder)
    return Notification::PRIORITIES[:urgent] if reminder.urgent?
    return Notification::PRIORITIES[:high] if reminder.high_priority?
    return Notification::PRIORITIES[:low] if reminder.low_priority?
    Notification::PRIORITIES[:normal]
  end

  def matches_custom_criteria?(reminder, options)
    return true if options.empty?

    criteria = reminder.custom_criteria || {}

    options.all? do |key, value|
      criteria[key.to_s] == value
    end
  end

  def parse_custom_rules(rules)
    return {} unless rules

    JSON.parse(rules.is_a?(String) ? rules : rules.to_json)
  rescue JSON::ParserError
    {}
  end

  def evaluate_custom_conditions(rules, reminder)
    return true unless rules['conditions']

    rules['conditions'].all? do |condition|
      evaluate_single_condition(condition, reminder)
    end
  end

  def evaluate_single_condition(condition, reminder)
    case condition['type']
    when 'time_based'
      evaluate_time_condition(condition)
    when 'user_based'
      evaluate_user_condition(condition, reminder.user)
    when 'data_based'
      evaluate_data_condition(condition, reminder)
    else
      true
    end
  end

  def calculate_recurrence_interval(reminder)
    case reminder.frequency
    when 'hourly' then 1.hour
    when 'daily' then 1.day
    when 'weekly' then 1.week
    when 'monthly' then 1.month
    else
      24.hours # Default to daily
    end
  end

  # Job lifecycle callbacks
  def log_job_start
    log_info "Starting reminder processing job"
  end

  def log_job_completion
    log_info "Completed reminder processing job"
  end

  def track_performance
    start_time = Time.current
    yield
    duration = Time.current - start_time

    # Track metrics
    JobMetric.create!(
      job_name: self.class.name,
      job_id: job_id,
      duration: duration,
      completed_at: Time.current
    ) if defined?(JobMetric)

    log_info "Job completed in #{duration.round(2)}s"
  rescue StandardError => e
    duration = Time.current - start_time
    log_error "Job failed after #{duration.round(2)}s: #{e.message}", e
    raise
  end
end