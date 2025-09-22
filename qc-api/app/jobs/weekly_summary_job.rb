class WeeklySummaryJob < ApplicationJob
  queue_as :reports

  def perform(couple_id = nil)
    if couple_id
      generate_summary_for_couple(couple_id)
    else
      generate_all_summaries
    end
  end

  private

  def generate_all_summaries
    log_info "Starting weekly summary generation for all couples"

    Couple.active.find_each do |couple|
      generate_summary_for_couple(couple.id)
    end

    log_info "Completed weekly summary generation"
  end

  def generate_summary_for_couple(couple_id)
    couple = Couple.find(couple_id)

    log_info "Generating weekly summary for couple ##{couple_id}"

    # Calculate date range
    end_date = Date.current
    start_date = end_date - 7.days

    # Gather statistics
    summary_data = {
      week_start: start_date.iso8601,
      week_end: end_date.iso8601,
      stats: gather_weekly_stats(couple, start_date, end_date),
      highlights: gather_highlights(couple, start_date, end_date),
      upcoming: gather_upcoming_items(couple)
    }

    # Create and send notification
    create_summary_notification(couple, summary_data)

    log_info "Generated weekly summary for couple ##{couple_id}"
  rescue StandardError => e
    log_error "Failed to generate summary for couple ##{couple_id}: #{e.message}", e
  end

  def gather_weekly_stats(couple, start_date, end_date)
    date_range = start_date.beginning_of_day..end_date.end_of_day

    {
      check_ins_completed: couple.check_ins
                                 .completed
                                 .where(completed_at: date_range)
                                 .count,

      notes_shared: couple.notes
                         .where(privacy_level: 'shared')
                         .where(created_at: date_range)
                         .count,

      action_items_completed: couple.action_items
                                   .completed
                                   .where(completed_at: date_range)
                                   .count,

      milestones_achieved: couple.milestones
                                .where(achieved_at: date_range)
                                .count,

      total_connection_time: calculate_connection_time(couple, date_range),

      categories_discussed: couple.check_ins
                                  .where(completed_at: date_range)
                                  .pluck(:categories_discussed)
                                  .flatten
                                  .uniq
                                  .count,

      current_streak: calculate_current_streak(couple)
    }
  end

  def gather_highlights(couple, start_date, end_date)
    date_range = start_date.beginning_of_day..end_date.end_of_day
    highlights = []

    # Best check-in
    best_check_in = couple.check_ins
                          .completed
                          .where(completed_at: date_range)
                          .order(satisfaction_rating: :desc)
                          .first

    if best_check_in
      highlights << {
        type: 'best_check_in',
        title: 'Most satisfying check-in',
        date: best_check_in.completed_at.to_date,
        rating: best_check_in.satisfaction_rating
      }
    end

    # Milestone achievement
    milestone = couple.milestones
                     .where(achieved_at: date_range)
                     .order(achieved_at: :desc)
                     .first

    if milestone
      highlights << {
        type: 'milestone',
        title: milestone.title,
        description: milestone.description,
        date: milestone.achieved_at.to_date
      }
    end

    # Most discussed category
    categories = couple.check_ins
                      .where(completed_at: date_range)
                      .pluck(:categories_discussed)
                      .flatten

    if categories.any?
      most_discussed = categories.tally.max_by { |_, count| count }
      highlights << {
        type: 'focus_area',
        title: 'Focus area this week',
        category: most_discussed[0],
        times_discussed: most_discussed[1]
      }
    end

    highlights
  end

  def gather_upcoming_items(couple)
    upcoming = []

    # Upcoming reminders
    reminders = couple.reminders
                     .active
                     .where(scheduled_for: Date.current..7.days.from_now)
                     .order(scheduled_for: :asc)
                     .limit(3)

    reminders.each do |reminder|
      upcoming << {
        type: 'reminder',
        title: reminder.title,
        scheduled_for: reminder.scheduled_for
      }
    end

    # Due action items
    action_items = couple.action_items
                        .pending
                        .where(due_date: Date.current..7.days.from_now)
                        .order(due_date: :asc)
                        .limit(3)

    action_items.each do |item|
      upcoming << {
        type: 'action_item',
        title: item.title,
        due_date: item.due_date,
        assigned_to: item.assigned_to.name
      }
    end

    upcoming
  end

  def calculate_connection_time(couple, date_range)
    # Sum up the duration of all completed check-ins
    total_minutes = couple.check_ins
                         .completed
                         .where(completed_at: date_range)
                         .sum(:duration_minutes) || 0

    {
      hours: total_minutes / 60,
      minutes: total_minutes % 60
    }
  end

  def calculate_current_streak(couple)
    check_ins = couple.check_ins
                     .completed
                     .order(completed_at: :desc)
                     .pluck(:completed_at)
                     .map(&:to_date)
                     .uniq

    return 0 if check_ins.empty?

    streak = 1
    current_date = check_ins.first

    check_ins[1..-1].each do |date|
      break unless (current_date - date).to_i == 1
      streak += 1
      current_date = date
    end

    # Only count if streak includes today or yesterday
    return 0 unless [Date.current, Date.current - 1].include?(check_ins.first)

    streak
  end

  def create_summary_notification(couple, summary_data)
    # Format the summary message
    stats = summary_data[:stats]

    body = build_summary_body(stats, summary_data[:highlights])

    # Send notification to both partners
    NotificationService.notify_weekly_summary(couple, summary_data)

    # Also store the summary for later reference
    couple.weekly_summaries.create!(
      week_start: summary_data[:week_start],
      week_end: summary_data[:week_end],
      data: summary_data
    ) if couple.respond_to?(:weekly_summaries)
  end

  def build_summary_body(stats, highlights)
    parts = []

    if stats[:check_ins_completed] > 0
      parts << "#{stats[:check_ins_completed]} check-ins completed"
    end

    if stats[:notes_shared] > 0
      parts << "#{stats[:notes_shared]} notes shared"
    end

    if stats[:action_items_completed] > 0
      parts << "#{stats[:action_items_completed]} action items done"
    end

    if stats[:current_streak] > 1
      parts << "#{stats[:current_streak]}-day streak!"
    end

    return "Keep up the great work on your relationship journey!" if parts.empty?

    "This week: #{parts.join(', ')}. Great progress!"
  end
end