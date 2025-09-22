class AnalyticsProcessorJob < ApplicationJob
  queue_as :data_processing
  queue_with_priority 3

  # Retry configuration
  retry_on ActiveRecord::RecordNotFound, wait: 5.seconds, attempts: 3
  retry_on ActiveRecord::ConnectionTimeoutError, wait: :exponentially_longer, attempts: 5

  # Performance tracking
  around_perform :track_performance

  def perform(scope = 'all', options = {})
    case scope
    when 'all'
      process_all_analytics
    when 'couple'
      process_couple_analytics(options[:couple_id])
    when 'daily'
      process_daily_analytics
    when 'weekly'
      process_weekly_analytics
    when 'monthly'
      process_monthly_analytics
    else
      log_error "Unknown analytics scope: #{scope}"
    end
  end

  private

  def process_all_analytics
    log_info "Starting comprehensive analytics processing"

    # Process analytics for all active couples
    Couple.active.find_in_batches(batch_size: 100) do |couples|
      couples.each do |couple|
        process_couple_analytics(couple.id)
      end
    end

    # Generate global statistics
    generate_global_statistics

    log_info "Completed comprehensive analytics processing"
  end

  def process_couple_analytics(couple_id)
    couple = Couple.find(couple_id)

    log_info "Processing analytics for couple ##{couple_id}"

    # Calculate various metrics
    metrics = {
      engagement: calculate_engagement_metrics(couple),
      consistency: calculate_consistency_metrics(couple),
      quality: calculate_quality_metrics(couple),
      growth: calculate_growth_metrics(couple),
      streak: calculate_streak_metrics(couple),
      patterns: analyze_patterns(couple),
      trends: analyze_trends(couple)
    }

    # Store analytics
    store_couple_analytics(couple, metrics)

    # Check for achievements based on new metrics
    detect_metric_based_achievements(couple, metrics)

    log_info "Completed analytics for couple ##{couple_id}"
  rescue StandardError => e
    log_error "Failed to process analytics for couple ##{couple_id}: #{e.message}", e
  end

  def calculate_engagement_metrics(couple)
    time_range = 30.days.ago..Time.current

    {
      check_in_frequency: calculate_check_in_frequency(couple, time_range),
      average_session_duration: calculate_average_duration(couple, time_range),
      total_connection_time: calculate_total_time(couple, time_range),
      notes_per_session: calculate_notes_per_session(couple, time_range),
      shared_note_ratio: calculate_shared_ratio(couple, time_range),
      action_item_completion_rate: calculate_completion_rate(couple, time_range),
      participation_balance: calculate_participation_balance(couple, time_range),
      categories_explored: count_unique_categories(couple, time_range),
      engagement_score: calculate_engagement_score(couple, time_range)
    }
  end

  def calculate_consistency_metrics(couple)
    {
      current_streak: calculate_current_streak(couple),
      longest_streak: calculate_longest_streak(couple),
      weekly_consistency: calculate_weekly_consistency(couple),
      monthly_consistency: calculate_monthly_consistency(couple),
      preferred_check_in_time: determine_preferred_time(couple),
      preferred_check_in_day: determine_preferred_day(couple),
      consistency_score: calculate_consistency_score(couple),
      missed_sessions: count_missed_sessions(couple),
      recovery_rate: calculate_recovery_rate(couple)
    }
  end

  def calculate_quality_metrics(couple)
    {
      average_satisfaction: calculate_average_satisfaction(couple),
      depth_of_discussions: analyze_discussion_depth(couple),
      emotional_range: analyze_emotional_range(couple),
      vulnerability_index: calculate_vulnerability_index(couple),
      growth_topics_ratio: calculate_growth_ratio(couple),
      conflict_resolution_rate: calculate_resolution_rate(couple),
      appreciation_frequency: count_appreciation_mentions(couple),
      quality_score: calculate_quality_score(couple)
    }
  end

  def calculate_growth_metrics(couple)
    {
      milestones_achieved: count_milestones(couple),
      goals_completed: count_completed_goals(couple),
      challenges_overcome: count_overcome_challenges(couple),
      skills_developed: identify_developed_skills(couple),
      relationship_trajectory: calculate_trajectory(couple),
      improvement_areas: identify_improvement_areas(couple),
      growth_velocity: calculate_growth_velocity(couple),
      growth_score: calculate_growth_score(couple)
    }
  end

  def calculate_streak_metrics(couple)
    check_ins = couple.check_ins.completed
                      .order(completed_at: :asc)
                      .pluck(:completed_at)
                      .map(&:to_date)

    {
      current_streak: calculate_current_streak_days(check_ins),
      longest_streak: calculate_longest_streak_days(check_ins),
      total_streaks: count_total_streaks(check_ins),
      average_streak_length: calculate_average_streak_length(check_ins),
      streak_breaks: count_streak_breaks(check_ins),
      recovery_time: calculate_average_recovery_time(check_ins),
      streak_momentum: calculate_streak_momentum(check_ins)
    }
  end

  def analyze_patterns(couple)
    {
      time_patterns: analyze_time_patterns(couple),
      topic_patterns: analyze_topic_patterns(couple),
      sentiment_patterns: analyze_sentiment_patterns(couple),
      interaction_patterns: analyze_interaction_patterns(couple),
      seasonal_patterns: analyze_seasonal_patterns(couple),
      weekly_patterns: analyze_weekly_patterns(couple)
    }
  end

  def analyze_trends(couple)
    {
      engagement_trend: calculate_engagement_trend(couple),
      satisfaction_trend: calculate_satisfaction_trend(couple),
      communication_trend: calculate_communication_trend(couple),
      conflict_trend: calculate_conflict_trend(couple),
      growth_trend: calculate_growth_trend(couple),
      overall_trend: calculate_overall_trend(couple)
    }
  end

  # Calculation helper methods
  def calculate_check_in_frequency(couple, time_range)
    check_ins = couple.check_ins.completed.where(completed_at: time_range)
    days_in_range = (time_range.end.to_date - time_range.begin.to_date).to_i

    return 0 if days_in_range == 0

    (check_ins.count.to_f / days_in_range * 7).round(2) # Per week
  end

  def calculate_average_duration(couple, time_range)
    durations = couple.check_ins
                     .completed
                     .where(completed_at: time_range)
                     .pluck(:duration_minutes)
                     .compact

    return 0 if durations.empty?

    (durations.sum.to_f / durations.count).round(1)
  end

  def calculate_total_time(couple, time_range)
    couple.check_ins
          .completed
          .where(completed_at: time_range)
          .sum(:duration_minutes) || 0
  end

  def calculate_notes_per_session(couple, time_range)
    sessions = couple.check_ins.completed.where(completed_at: time_range).count
    notes = couple.notes.where(created_at: time_range).count

    return 0 if sessions == 0

    (notes.to_f / sessions).round(2)
  end

  def calculate_shared_ratio(couple, time_range)
    total_notes = couple.notes.where(created_at: time_range).count
    shared_notes = couple.notes.where(created_at: time_range, privacy_level: 'shared').count

    return 0 if total_notes == 0

    (shared_notes.to_f / total_notes * 100).round(1)
  end

  def calculate_completion_rate(couple, time_range)
    total_items = couple.action_items.where(created_at: time_range).count
    completed_items = couple.action_items
                           .where(created_at: time_range)
                           .completed
                           .count

    return 100 if total_items == 0

    (completed_items.to_f / total_items * 100).round(1)
  end

  def calculate_participation_balance(couple, time_range)
    users = couple.users
    return 0 if users.count != 2

    user1_notes = couple.notes.where(author_id: users.first.id, created_at: time_range).count
    user2_notes = couple.notes.where(author_id: users.last.id, created_at: time_range).count

    total = user1_notes + user2_notes
    return 100 if total == 0

    # Calculate balance (100 = perfect balance, 0 = complete imbalance)
    min_participation = [user1_notes, user2_notes].min
    max_participation = [user1_notes, user2_notes].max

    return 100 if max_participation == 0

    (min_participation.to_f / max_participation * 100).round(1)
  end

  def calculate_current_streak(couple)
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

  def calculate_longest_streak(couple)
    check_ins = couple.check_ins.completed
                      .order(completed_at: :asc)
                      .pluck(:completed_at)
                      .map(&:to_date)
                      .uniq

    return 0 if check_ins.empty?

    longest = 1
    current_streak = 1
    previous_date = check_ins.first

    check_ins[1..-1].each do |date|
      if (date - previous_date).to_i == 1
        current_streak += 1
        longest = [longest, current_streak].max
      else
        current_streak = 1
      end
      previous_date = date
    end

    longest
  end

  def calculate_engagement_score(couple, time_range)
    # Weighted score based on multiple factors
    frequency_weight = 30
    duration_weight = 20
    sharing_weight = 20
    completion_weight = 15
    balance_weight = 15

    frequency_score = [calculate_check_in_frequency(couple, time_range) / 7 * 100, 100].min
    duration_score = [calculate_average_duration(couple, time_range) / 30 * 100, 100].min
    sharing_score = calculate_shared_ratio(couple, time_range)
    completion_score = calculate_completion_rate(couple, time_range)
    balance_score = calculate_participation_balance(couple, time_range)

    total_score = (
      frequency_score * frequency_weight +
      duration_score * duration_weight +
      sharing_score * sharing_weight +
      completion_score * completion_weight +
      balance_score * balance_weight
    ) / 100

    total_score.round(1)
  end

  def store_couple_analytics(couple, metrics)
    analytics = couple.analytics || couple.build_analytics

    analytics.update!(
      metrics: metrics,
      calculated_at: Time.current,
      period_start: 30.days.ago,
      period_end: Time.current
    )

    # Store historical snapshot
    couple.analytics_snapshots.create!(
      metrics: metrics,
      snapshot_date: Date.current
    ) if couple.respond_to?(:analytics_snapshots)
  end

  def detect_metric_based_achievements(couple, metrics)
    # Check for engagement achievements
    if metrics[:engagement][:engagement_score] >= 90
      create_achievement(couple, 'high_engagement', 'Engagement Champion')
    end

    # Check for consistency achievements
    if metrics[:consistency][:current_streak] >= 30
      create_achievement(couple, 'monthly_streak', 'Consistency Masters')
    end

    # Check for quality achievements
    if metrics[:quality][:average_satisfaction] >= 4.5
      create_achievement(couple, 'high_satisfaction', 'Relationship Excellence')
    end

    # Check for balanced participation
    if metrics[:engagement][:participation_balance] >= 80
      create_achievement(couple, 'balanced_participation', 'Equal Partners')
    end
  end

  def create_achievement(couple, key, title)
    return if couple.milestones.exists?(milestone_key: key)

    couple.milestones.create!(
      category: 'achievement',
      milestone_key: key,
      title: title,
      description: "Earned through exceptional relationship metrics",
      achieved_at: Time.current
    )

    NotificationService.send_milestone_notification(
      couple.milestones.last
    )
  end

  def process_daily_analytics
    log_info "Processing daily analytics"

    # Calculate daily summaries for all couples
    Couple.active.find_each do |couple|
      generate_daily_summary(couple)
    end

    # Update global daily metrics
    update_global_daily_metrics
  end

  def process_weekly_analytics
    log_info "Processing weekly analytics"

    # Generate weekly reports for all couples
    Couple.active.find_each do |couple|
      generate_weekly_report(couple)
    end

    # Identify weekly trends
    identify_weekly_trends
  end

  def process_monthly_analytics
    log_info "Processing monthly analytics"

    # Generate monthly insights for all couples
    Couple.active.find_each do |couple|
      generate_monthly_insights(couple)
    end

    # Calculate monthly benchmarks
    calculate_monthly_benchmarks
  end

  def generate_global_statistics
    {
      total_active_couples: Couple.active.count,
      average_engagement_score: calculate_global_average_engagement,
      total_check_ins_today: CheckIn.completed.where(completed_at: Date.current.all_day).count,
      total_milestones_achieved: Milestone.where(achieved_at: Date.current.all_day).count,
      global_satisfaction_average: calculate_global_satisfaction,
      most_discussed_categories: identify_trending_categories
    }
  end

  def track_performance
    start_time = Time.current
    yield
    duration = Time.current - start_time

    log_info "Analytics processing completed in #{duration.round(2)}s"

    # Alert if processing is too slow
    if duration > 60.seconds
      log_warn "Slow analytics processing: #{duration.round(2)}s"
    end
  rescue StandardError => e
    duration = Time.current - start_time
    log_error "Analytics processing failed after #{duration.round(2)}s", e
    raise
  end

  # Additional helper methods would go here...
  def calculate_current_streak_days(check_ins)
    # Implementation for current streak calculation
    return 0 if check_ins.empty?
    # ... streak logic
  end

  def count_unique_categories(couple, time_range)
    couple.check_ins
          .completed
          .where(completed_at: time_range)
          .pluck(:categories_discussed)
          .flatten
          .uniq
          .count
  end
end