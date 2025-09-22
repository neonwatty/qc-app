class ReminderDeliveryJob < ApplicationJob
  queue_as :reminders
  sidekiq_options retry: 3 if respond_to?(:sidekiq_options)

  def perform(reminder_id)
    reminder = Reminder.find_by(id: reminder_id)
    return unless reminder

    log_info "Processing reminder ##{reminder_id} for couple ##{reminder.couple_id}"

    # Check if reminder is still active
    return handle_inactive_reminder(reminder) unless reminder.active?

    # Check if it's the right time
    return reschedule_reminder(reminder) unless should_deliver_now?(reminder)

    # Create notifications for the reminder
    create_reminder_notifications(reminder)

    # Update reminder status
    update_reminder_status(reminder)

    # Schedule next occurrence if recurring
    schedule_next_occurrence(reminder) if reminder.recurring?

    log_info "Successfully processed reminder ##{reminder_id}"
  rescue StandardError => e
    log_error "Failed to process reminder ##{reminder_id}: #{e.message}", e
    raise
  end

  private

  def handle_inactive_reminder(reminder)
    log_info "Reminder ##{reminder.id} is inactive, skipping"
    reminder.update!(last_skipped_at: Time.current)
  end

  def should_deliver_now?(reminder)
    # Check if we're within the delivery window
    current_time = Time.current
    scheduled_time = reminder.next_scheduled_at || reminder.scheduled_for

    # Allow 5 minute window before and after scheduled time
    (scheduled_time - 5.minutes..scheduled_time + 5.minutes).cover?(current_time)
  end

  def reschedule_reminder(reminder)
    # Reschedule for the exact time
    scheduled_time = reminder.next_scheduled_at || reminder.scheduled_for

    self.class.perform_at(scheduled_time, reminder.id)

    log_info "Rescheduled reminder ##{reminder.id} for #{scheduled_time}"
  end

  def create_reminder_notifications(reminder)
    couple = reminder.couple

    # Create notifications for both partners
    couple.users.each do |user|
      notification = Notification.create_for_user!(
        user,
        'check_in_reminder',
        reminder.title,
        reminder.message || 'Time for your scheduled check-in!',
        {
          priority: determine_priority(reminder),
          data: {
            reminder_id: reminder.id,
            scheduled_time: reminder.scheduled_for,
            action_url: '/checkin/new'
          },
          expires_at: Time.current + 24.hours
        }
      )

      # Queue immediate delivery for high priority reminders
      if reminder.high_priority?
        NotificationDeliveryJob.perform_later(notification.id)
      end
    end

    log_info "Created notifications for reminder ##{reminder.id}"
  end

  def update_reminder_status(reminder)
    reminder.update!(
      last_triggered_at: Time.current,
      trigger_count: reminder.trigger_count + 1
    )
  end

  def schedule_next_occurrence(reminder)
    return unless reminder.recurring?

    next_time = calculate_next_occurrence(reminder)
    return unless next_time

    reminder.update!(next_scheduled_at: next_time)

    # Schedule the job
    self.class.perform_at(next_time, reminder.id)

    log_info "Scheduled next occurrence of reminder ##{reminder.id} for #{next_time}"
  end

  def calculate_next_occurrence(reminder)
    base_time = reminder.last_triggered_at || Time.current

    case reminder.frequency
    when 'daily'
      base_time + 1.day
    when 'weekly'
      base_time + 1.week
    when 'biweekly'
      base_time + 2.weeks
    when 'monthly'
      base_time + 1.month
    when 'custom'
      calculate_custom_next_time(reminder, base_time)
    else
      nil
    end
  end

  def calculate_custom_next_time(reminder, base_time)
    return unless reminder.custom_schedule

    # Parse custom schedule (e.g., specific days of week)
    days = reminder.custom_schedule['days_of_week'] || []
    time_of_day = reminder.custom_schedule['time'] || '19:00'

    # Find next matching day
    next_day = days.map do |day|
      target = base_time.next_occurring(day.to_sym)
      target.change(hour: time_of_day.split(':')[0].to_i, min: time_of_day.split(':')[1].to_i)
    end.min

    next_day if next_day > base_time
  end

  def determine_priority(reminder)
    return Notification::PRIORITIES[:urgent] if reminder.urgent?
    return Notification::PRIORITIES[:high] if reminder.high_priority?
    Notification::PRIORITIES[:normal]
  end
end