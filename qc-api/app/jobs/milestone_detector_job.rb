class MilestoneDetectorJob < ApplicationJob
  queue_as :data_processing
  queue_with_priority 2

  # Retry configuration
  retry_on ActiveRecord::RecordNotFound, wait: 5.seconds, attempts: 3
  retry_on ActiveRecord::ConnectionTimeoutError, wait: :exponentially_longer, attempts: 5

  # Performance optimizations
  around_perform :track_performance
  before_perform :load_detection_rules

  def perform(detection_scope = 'all', options = {})
    case detection_scope
    when 'all'
      detect_all_milestones
    when 'couple'
      detect_couple_milestones(options[:couple_id])
    when 'category'
      detect_category_milestones(options[:category])
    when 'real_time'
      detect_real_time_milestone(options)
    when 'batch'
      detect_batch_milestones(options[:couple_ids])
    else
      log_error "Unknown detection scope: #{detection_scope}"
    end
  end

  private

  def detect_all_milestones
    log_info "Starting comprehensive milestone detection"

    # Process in batches for performance
    Couple.active.find_in_batches(batch_size: 50) do |couples|
      couples.each do |couple|
        detect_couple_milestones(couple.id)
      end
    end

    # Detect global milestones
    detect_global_milestones

    log_info "Completed comprehensive milestone detection"
  end

  def detect_couple_milestones(couple_id)
    couple = Couple.find(couple_id)

    log_info "Detecting milestones for couple ##{couple_id}"

    # Run all detection categories
    @detection_rules.each do |category, rules|
      detect_by_category(couple, category, rules)
    end

    # Run advanced pattern detection
    detect_advanced_patterns(couple)

    # Check for combination milestones
    detect_combination_milestones(couple)

    # Analyze milestone velocity
    analyze_milestone_velocity(couple)

    log_info "Completed milestone detection for couple ##{couple_id}"
  rescue StandardError => e
    log_error "Failed to detect milestones for couple ##{couple_id}: #{e.message}", e
  end

  def load_detection_rules
    @detection_rules = {
      frequency: load_frequency_rules,
      consistency: load_consistency_rules,
      quality: load_quality_rules,
      growth: load_growth_rules,
      special: load_special_rules,
      seasonal: load_seasonal_rules,
      collaborative: load_collaborative_rules,
      communication: load_communication_rules
    }
  end

  def load_frequency_rules
    [
      { threshold: 1, key: 'first_checkin', title: 'First Step', description: 'Your journey begins!' },
      { threshold: 10, key: 'checkin_10', title: 'Getting Started', description: '10 check-ins completed!' },
      { threshold: 25, key: 'checkin_25', title: 'Quarter Century', description: '25 meaningful conversations!' },
      { threshold: 50, key: 'checkin_50', title: 'Halfway to 100', description: '50 check-ins achieved!' },
      { threshold: 100, key: 'checkin_100', title: 'Century', description: '100 check-ins - Amazing commitment!' },
      { threshold: 200, key: 'checkin_200', title: 'Double Century', description: '200 check-ins and growing strong!' },
      { threshold: 365, key: 'checkin_365', title: 'Daily for a Year', description: 'A full year of check-ins!' },
      { threshold: 500, key: 'checkin_500', title: 'Half Thousand', description: '500 relationship investments!' },
      { threshold: 1000, key: 'checkin_1000', title: 'Thousand Strong', description: 'Four-digit commitment!' }
    ]
  end

  def load_consistency_rules
    [
      { days: 3, key: 'streak_3', title: 'Getting Consistent', description: '3-day streak started!' },
      { days: 7, key: 'streak_7', title: 'Week Warrior', description: 'Full week of daily check-ins!' },
      { days: 14, key: 'streak_14', title: 'Fortnight Focus', description: 'Two weeks straight!' },
      { days: 21, key: 'streak_21', title: 'Habit Forming', description: '21 days to build a habit!' },
      { days: 30, key: 'streak_30', title: 'Monthly Master', description: '30-day streak achieved!' },
      { days: 60, key: 'streak_60', title: 'Two Month Momentum', description: '60 consecutive days!' },
      { days: 90, key: 'streak_90', title: 'Quarter Champion', description: '90-day transformation!' },
      { days: 180, key: 'streak_180', title: 'Half Year Hero', description: 'Six months of consistency!' },
      { days: 365, key: 'streak_365', title: 'Year of Connection', description: 'Daily connection for a full year!' }
    ]
  end

  def load_quality_rules
    [
      { metric: 'satisfaction', threshold: 4.5, key: 'high_satisfaction', title: 'Satisfaction Stars', description: 'Consistently high satisfaction!' },
      { metric: 'depth', threshold: 80, key: 'deep_conversations', title: 'Deep Divers', description: 'Meaningful, deep discussions!' },
      { metric: 'vulnerability', threshold: 75, key: 'vulnerability_champions', title: 'Open Hearts', description: 'Embracing vulnerability together!' },
      { metric: 'growth_focus', threshold: 70, key: 'growth_oriented', title: 'Growth Mindset', description: 'Focused on continuous improvement!' },
      { metric: 'emotional_range', threshold: 85, key: 'emotional_intelligence', title: 'Emotional Masters', description: 'Full emotional expression!' }
    ]
  end

  def load_growth_rules
    [
      { metric: 'goals_completed', threshold: 5, key: 'goal_5', title: 'Goal Getters', description: '5 relationship goals achieved!' },
      { metric: 'goals_completed', threshold: 10, key: 'goal_10', title: 'Achievement Focused', description: '10 goals completed together!' },
      { metric: 'challenges_overcome', threshold: 3, key: 'challenge_3', title: 'Challenge Champions', description: 'Overcame 3 challenges together!' },
      { metric: 'skills_developed', threshold: 5, key: 'skill_5', title: 'Skill Builders', description: '5 new relationship skills!' },
      { metric: 'improvement_velocity', threshold: 80, key: 'rapid_growth', title: 'Rapid Growth', description: 'Exceptional improvement rate!' }
    ]
  end

  def load_special_rules
    [
      { condition: 'anniversary', key: 'anniversary', title: 'Anniversary Celebration', description: 'Celebrating your journey!' },
      { condition: 'perfect_week', key: 'perfect_week', title: 'Perfect Week', description: 'Check-ins every day this week!' },
      { condition: 'perfect_month', key: 'perfect_month', title: 'Perfect Month', description: 'Not a single day missed!' },
      { condition: 'recovery', key: 'comeback', title: 'Comeback Story', description: 'Back stronger after a break!' },
      { condition: 'marathon_session', key: 'marathon', title: 'Marathon Session', description: 'Extended deep connection!' }
    ]
  end

  def load_seasonal_rules
    [
      { season: 'new_year', key: 'new_year_resolution', title: 'New Year Strong', description: 'Starting the year right!' },
      { season: 'valentine', key: 'valentine_dedication', title: 'Valentine Dedication', description: 'Love in action!' },
      { season: 'spring', key: 'spring_renewal', title: 'Spring Renewal', description: 'Renewed commitment!' },
      { season: 'summer', key: 'summer_consistency', title: 'Summer Strong', description: 'Consistent through summer!' },
      { season: 'thanksgiving', key: 'gratitude_practice', title: 'Gratitude Champions', description: 'Thankful together!' },
      { season: 'year_end', key: 'year_end_reflection', title: 'Year-End Reflection', description: 'Reflecting on growth!' }
    ]
  end

  def load_collaborative_rules
    [
      { metric: 'shared_notes', threshold: 50, key: 'sharing_50', title: 'Sharing Souls', description: '50 shared notes!' },
      { metric: 'action_items_together', threshold: 20, key: 'teamwork_20', title: 'Team Players', description: '20 joint action items!' },
      { metric: 'participation_balance', threshold: 90, key: 'equal_partners', title: 'Equal Partners', description: 'Perfectly balanced participation!' },
      { metric: 'support_given', threshold: 100, key: 'support_100', title: 'Support System', description: '100 supportive interactions!' }
    ]
  end

  def load_communication_rules
    [
      { metric: 'appreciation_expressed', threshold: 50, key: 'appreciation_50', title: 'Appreciation Masters', description: '50 appreciations shared!' },
      { metric: 'conflicts_resolved', threshold: 10, key: 'resolution_10', title: 'Conflict Champions', description: '10 conflicts resolved!' },
      { metric: 'topics_discussed', threshold: 30, key: 'topics_30', title: 'Conversation Variety', description: '30 different topics explored!' },
      { metric: 'feedback_given', threshold: 25, key: 'feedback_25', title: 'Feedback Friends', description: '25 constructive feedbacks!' }
    ]
  end

  def detect_by_category(couple, category, rules)
    case category
    when :frequency
      detect_frequency_milestones(couple, rules)
    when :consistency
      detect_consistency_milestones(couple, rules)
    when :quality
      detect_quality_milestones(couple, rules)
    when :growth
      detect_growth_milestones(couple, rules)
    when :special
      detect_special_milestones(couple, rules)
    when :seasonal
      detect_seasonal_milestones(couple, rules)
    when :collaborative
      detect_collaborative_milestones(couple, rules)
    when :communication
      detect_communication_milestones(couple, rules)
    end
  end

  def detect_frequency_milestones(couple, rules)
    total_checkins = couple.check_ins.completed.count

    rules.each do |rule|
      next if total_checkins < rule[:threshold]
      next if milestone_exists?(couple, rule[:key])

      create_milestone(couple, 'frequency', rule)
    end
  end

  def detect_consistency_milestones(couple, rules)
    current_streak = calculate_streak(couple)

    rules.each do |rule|
      next if current_streak < rule[:days]
      next if milestone_exists?(couple, rule[:key])

      create_milestone(couple, 'consistency', rule)
    end
  end

  def detect_quality_milestones(couple, rules)
    quality_metrics = calculate_quality_metrics(couple)

    rules.each do |rule|
      metric_value = quality_metrics[rule[:metric].to_sym]
      next if metric_value.nil? || metric_value < rule[:threshold]
      next if milestone_exists?(couple, rule[:key])

      create_milestone(couple, 'quality', rule)
    end
  end

  def detect_advanced_patterns(couple)
    # Detect complex patterns that require multiple data points
    detect_growth_trajectory(couple)
    detect_communication_patterns(couple)
    detect_seasonal_achievements(couple)
    detect_recovery_milestones(couple)
  end

  def detect_combination_milestones(couple)
    # Milestones that require multiple conditions
    if has_streak?(couple, 30) && has_high_satisfaction?(couple) && has_balance?(couple)
      create_special_milestone(couple, 'triple_crown', 'Triple Crown',
                              'Consistency, satisfaction, and balance achieved!')
    end

    if milestone_velocity(couple) > 5 && recent_growth_rate(couple) > 80
      create_special_milestone(couple, 'momentum_master', 'Momentum Master',
                              'Exceptional growth and achievement rate!')
    end
  end

  def detect_global_milestones
    # Detect milestones across all couples
    total_global_checkins = CheckIn.completed.count

    if total_global_checkins >= 10000 && !global_milestone_exists?('global_10k')
      create_global_milestone('global_10k', '10,000 Check-ins',
                            'Community reached 10,000 check-ins!')
    end

    if total_global_checkins >= 100000 && !global_milestone_exists?('global_100k')
      create_global_milestone('global_100k', '100,000 Check-ins',
                            'Community reached 100,000 check-ins!')
    end
  end

  def calculate_streak(couple)
    check_ins = couple.check_ins.completed
                      .order(completed_at: :desc)
                      .pluck(:completed_at)
                      .map(&:to_date)
                      .uniq

    return 0 if check_ins.empty?
    return 0 unless [Date.current, Date.current - 1].include?(check_ins.first)

    streak = 1
    current_date = check_ins.first

    check_ins[1..-1].each do |date|
      break unless (current_date - date).to_i == 1
      streak += 1
      current_date = date
    end

    streak
  end

  def calculate_quality_metrics(couple)
    time_range = 30.days.ago..Time.current

    {
      satisfaction: calculate_average_satisfaction(couple, time_range),
      depth: calculate_conversation_depth(couple, time_range),
      vulnerability: calculate_vulnerability_index(couple, time_range),
      growth_focus: calculate_growth_focus(couple, time_range),
      emotional_range: calculate_emotional_range(couple, time_range)
    }
  end

  def milestone_exists?(couple, key)
    couple.milestones.exists?(milestone_key: key)
  end

  def create_milestone(couple, category, rule)
    milestone = couple.milestones.create!(
      category: category,
      milestone_key: rule[:key],
      title: rule[:title],
      description: rule[:description],
      achieved_at: Time.current,
      metadata: {
        detection_job: job_id,
        rule_matched: rule
      }
    )

    # Send notification
    NotificationService.send_milestone_notification(milestone)

    # Log achievement
    log_info "Created milestone '#{rule[:title]}' for couple ##{couple.id}"

    # Trigger celebration animation in real-time
    broadcast_milestone_achievement(couple, milestone)

    milestone
  end

  def create_special_milestone(couple, key, title, description)
    return if milestone_exists?(couple, key)

    create_milestone(couple, 'special', {
      key: key,
      title: title,
      description: description
    })
  end

  def broadcast_milestone_achievement(couple, milestone)
    ActionCable.server.broadcast(
      "couple_#{couple.id}_milestones",
      {
        event: 'milestone_achieved',
        milestone: {
          id: milestone.id,
          title: milestone.title,
          description: milestone.description,
          category: milestone.category,
          achieved_at: milestone.achieved_at
        }
      }
    )
  end

  def analyze_milestone_velocity(couple)
    recent_milestones = couple.milestones
                             .where(achieved_at: 30.days.ago..Time.current)
                             .count

    velocity = recent_milestones.to_f / 30

    if velocity > 0.5 # More than 0.5 milestones per day
      create_special_milestone(couple, 'high_velocity', 'Achievement Velocity',
                              'Rapid milestone achievement rate!')
    end
  end

  def detect_real_time_milestone(options)
    # Handle real-time milestone detection triggered by specific events
    couple = Couple.find(options[:couple_id])
    event_type = options[:event_type]

    case event_type
    when 'checkin_completed'
      check_immediate_milestones(couple)
    when 'note_shared'
      check_sharing_milestones(couple)
    when 'action_completed'
      check_action_milestones(couple)
    end
  end

  def detect_batch_milestones(couple_ids)
    # Efficient batch processing for multiple couples
    couples = Couple.where(id: couple_ids).includes(:check_ins, :notes, :milestones)

    couples.find_each do |couple|
      detect_couple_milestones(couple.id)
    end
  end

  # Performance tracking
  def track_performance
    start_time = Time.current
    @detection_count = 0

    yield

    duration = Time.current - start_time
    log_info "Milestone detection completed in #{duration.round(2)}s, detected #{@detection_count} new milestones"

    # Alert if detection is slow
    if duration > 30.seconds
      log_warn "Slow milestone detection: #{duration.round(2)}s"
    end
  rescue StandardError => e
    duration = Time.current - start_time
    log_error "Milestone detection failed after #{duration.round(2)}s", e
    raise
  end

  # Additional helper methods
  def calculate_average_satisfaction(couple, time_range)
    satisfactions = couple.check_ins
                         .completed
                         .where(completed_at: time_range)
                         .pluck(:satisfaction_rating)
                         .compact

    return 0 if satisfactions.empty?
    (satisfactions.sum.to_f / satisfactions.count).round(2)
  end

  def has_streak?(couple, days)
    calculate_streak(couple) >= days
  end

  def has_high_satisfaction?(couple)
    calculate_average_satisfaction(couple, 30.days.ago..Time.current) >= 4.0
  end

  def has_balance?(couple)
    # Check participation balance
    true # Implement actual balance check
  end

  def milestone_velocity(couple)
    couple.milestones.where(achieved_at: 30.days.ago..Time.current).count
  end

  def recent_growth_rate(couple)
    # Calculate growth rate
    80 # Placeholder - implement actual calculation
  end
end