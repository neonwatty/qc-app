class MilestoneCalculationJob < ApplicationJob
  queue_as :data_processing

  def perform(couple_id = nil)
    if couple_id
      process_couple_milestones(couple_id)
    else
      process_all_milestones
    end
  end

  private

  def process_all_milestones
    log_info "Starting milestone calculation for all couples"

    Couple.active.find_each do |couple|
      process_couple_milestones(couple.id)
    end

    log_info "Completed milestone calculation for all couples"
  end

  def process_couple_milestones(couple_id)
    couple = Couple.find(couple_id)

    log_info "Calculating milestones for couple ##{couple_id}"

    # Check various milestone categories
    check_check_in_milestones(couple)
    check_duration_milestones(couple)
    check_note_milestones(couple)
    check_action_item_milestones(couple)
    check_consistency_milestones(couple)

    log_info "Completed milestone calculation for couple ##{couple_id}"
  rescue StandardError => e
    log_error "Failed to calculate milestones for couple ##{couple_id}: #{e.message}", e
  end

  def check_check_in_milestones(couple)
    total_check_ins = couple.check_ins.completed.count

    milestones = [
      { count: 1, title: "First Check-in", description: "Completed your first check-in together!" },
      { count: 10, title: "10 Check-ins", description: "Reached 10 check-in sessions!" },
      { count: 25, title: "Quarter Century", description: "25 check-ins and counting!" },
      { count: 50, title: "Half Century", description: "50 check-ins completed!" },
      { count: 100, title: "Century Mark", description: "Amazing! 100 check-ins together!" }
    ]

    milestones.each do |milestone_data|
      next if total_check_ins < milestone_data[:count]

      create_milestone_if_new(couple, 'check_in_count', milestone_data)
    end
  end

  def check_duration_milestones(couple)
    relationship_days = (Date.current - couple.created_at.to_date).to_i

    milestones = [
      { days: 30, title: "One Month Strong", description: "Using QC for 30 days!" },
      { days: 90, title: "Three Months", description: "Quarter year of growth!" },
      { days: 180, title: "Six Months", description: "Half a year of connection!" },
      { days: 365, title: "One Year Anniversary", description: "A full year with QC!" }
    ]

    milestones.each do |milestone_data|
      next if relationship_days < milestone_data[:days]

      create_milestone_if_new(couple, 'duration', milestone_data)
    end
  end

  def check_note_milestones(couple)
    total_shared_notes = couple.notes.where(privacy_level: 'shared').count

    milestones = [
      { count: 10, title: "Note Sharers", description: "Shared 10 notes with each other!" },
      { count: 50, title: "Communication Champions", description: "50 shared notes!" },
      { count: 100, title: "Open Books", description: "100 notes shared between you!" }
    ]

    milestones.each do |milestone_data|
      next if total_shared_notes < milestone_data[:count]

      create_milestone_if_new(couple, 'notes', milestone_data)
    end
  end

  def check_action_item_milestones(couple)
    completed_actions = couple.action_items.completed.count

    milestones = [
      { count: 5, title: "Action Takers", description: "Completed 5 action items!" },
      { count: 25, title: "Goal Getters", description: "25 action items completed!" },
      { count: 50, title: "Achievement Unlocked", description: "50 action items done!" }
    ]

    milestones.each do |milestone_data|
      next if completed_actions < milestone_data[:count]

      create_milestone_if_new(couple, 'action_items', milestone_data)
    end
  end

  def check_consistency_milestones(couple)
    # Check for streak milestones
    current_streak = calculate_check_in_streak(couple)

    milestones = [
      { days: 7, title: "Week Streak", description: "Check-ins for 7 days straight!" },
      { days: 14, title: "Two Week Streak", description: "14 consecutive days!" },
      { days: 30, title: "Monthly Streak", description: "30 days in a row!" }
    ]

    milestones.each do |milestone_data|
      next if current_streak < milestone_data[:days]

      create_milestone_if_new(couple, 'streak', milestone_data)
    end
  end

  def calculate_check_in_streak(couple)
    check_ins = couple.check_ins.completed
                      .order(completed_at: :desc)
                      .pluck(:completed_at)
                      .map(&:to_date)
                      .uniq

    return 0 if check_ins.empty?

    streak = 1
    current_date = check_ins.first

    check_ins[1..-1].each do |date|
      if (current_date - date).to_i == 1
        streak += 1
        current_date = date
      else
        break
      end
    end

    # Only count if the streak is current (includes today or yesterday)
    return 0 unless [Date.current, Date.current - 1].include?(check_ins.first)

    streak
  end

  def create_milestone_if_new(couple, category, milestone_data)
    # Check if milestone already exists
    existing = couple.milestones.find_by(
      category: category,
      milestone_key: milestone_key(category, milestone_data)
    )

    return if existing

    # Create new milestone
    milestone = couple.milestones.create!(
      category: category,
      milestone_key: milestone_key(category, milestone_data),
      title: milestone_data[:title],
      description: milestone_data[:description],
      achieved_at: Time.current
    )

    # Notify the couple
    NotificationService.send_milestone_notification(milestone)

    log_info "Created milestone '#{milestone.title}' for couple ##{couple.id}"
  end

  def milestone_key(category, data)
    case category
    when 'check_in_count', 'notes', 'action_items'
      "#{category}_#{data[:count]}"
    when 'duration', 'streak'
      "#{category}_#{data[:days]}"
    else
      "#{category}_#{data[:title].parameterize}"
    end
  end
end