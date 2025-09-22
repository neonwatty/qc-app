class CheckInReminderJob < ApplicationJob
  queue_as :reminders

  def perform
    log_info "Starting check-in reminder processing"

    # Find all active couples
    active_couples = Couple.active.includes(:users, :check_ins)

    active_couples.find_each do |couple|
      process_couple_reminders(couple)
    end

    log_info "Completed check-in reminder processing for #{active_couples.count} couples"
  end

  private

  def process_couple_reminders(couple)
    # Check if couple needs a reminder
    return unless should_send_reminder?(couple)

    # Determine reminder type
    reminder_type = determine_reminder_type(couple)

    # Create and send reminder
    create_reminder_notification(couple, reminder_type)

    log_info "Sent #{reminder_type} reminder to couple ##{couple.id}"
  rescue StandardError => e
    log_error "Failed to process reminders for couple ##{couple.id}: #{e.message}", e
  end

  def should_send_reminder?(couple)
    last_check_in = couple.check_ins.completed.order(completed_at: :desc).first

    # No check-ins yet
    return true unless last_check_in

    # Check based on couple's preferred frequency
    days_since_last = (Date.current - last_check_in.completed_at.to_date).to_i

    case couple.check_in_frequency
    when 'daily'
      days_since_last >= 1
    when 'weekly'
      days_since_last >= 7
    when 'biweekly'
      days_since_last >= 14
    when 'monthly'
      days_since_last >= 30
    else
      days_since_last >= 7  # Default to weekly
    end
  end

  def determine_reminder_type(couple)
    last_check_in = couple.check_ins.completed.order(completed_at: :desc).first

    if last_check_in.nil?
      'first_check_in'
    else
      days_since = (Date.current - last_check_in.completed_at.to_date).to_i

      case days_since
      when 0..6
        'regular_reminder'
      when 7..13
        'overdue_reminder'
      else
        'long_overdue_reminder'
      end
    end
  end

  def create_reminder_notification(couple, reminder_type)
    title, body, priority = reminder_content(reminder_type)

    couple.users.each do |user|
      notification = Notification.create_for_user!(
        user,
        'check_in_reminder',
        title,
        body,
        {
          priority: priority,
          data: {
            reminder_type: reminder_type,
            couple_id: couple.id,
            action_url: '/checkin/new'
          }
        }
      )

      # Deliver immediately for urgent reminders
      if priority >= Notification::PRIORITIES[:high]
        NotificationDeliveryJob.perform_later(notification.id)
      end
    end
  end

  def reminder_content(reminder_type)
    case reminder_type
    when 'first_check_in'
      [
        'Welcome! Time for your first check-in',
        'Start building your relationship journey with your first check-in session.',
        Notification::PRIORITIES[:normal]
      ]
    when 'regular_reminder'
      [
        'Time for your check-in!',
        'Take a moment to connect and share with your partner.',
        Notification::PRIORITIES[:normal]
      ]
    when 'overdue_reminder'
      [
        "It's been a week since your last check-in",
        "Your partner is waiting. Let's reconnect and catch up!",
        Notification::PRIORITIES[:high]
      ]
    when 'long_overdue_reminder'
      [
        'We miss you! Time to reconnect',
        "It's been a while. Your relationship deserves this quality time.",
        Notification::PRIORITIES[:urgent]
      ]
    else
      [
        'Check-in Reminder',
        'Time for your regular check-in session.',
        Notification::PRIORITIES[:normal]
      ]
    end
  end
end