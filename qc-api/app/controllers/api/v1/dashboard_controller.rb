module Api
  module V1
    class DashboardController < Api::BaseController
      before_action :set_couple

      # GET /api/v1/couples/:couple_id/dashboard
      def index
        dashboard_data = {
          overview: overview_stats,
          streak_info: streak_information,
          milestone_progress: milestone_progress,
          recent_activity: recent_activity,
          upcoming_items: upcoming_items,
          relationship_health: relationship_health_metrics,
          weekly_trends: weekly_trends,
          monthly_summary: monthly_summary
        }

        render_success(dashboard_data)
      end

      # GET /api/v1/couples/:couple_id/dashboard/overview
      def overview
        render_success(overview_stats)
      end

      # GET /api/v1/couples/:couple_id/dashboard/streaks
      def streaks
        render_success(detailed_streak_info)
      end

      # GET /api/v1/couples/:couple_id/dashboard/activity_feed
      def activity_feed
        activities = compile_activity_feed(params[:limit] || 20, params[:offset] || 0)
        render_success(activities)
      end

      # GET /api/v1/couples/:couple_id/dashboard/health_score
      def health_score
        score_data = {
          overall_score: calculate_health_score,
          category_scores: category_health_scores,
          recommendations: generate_recommendations,
          trends: health_score_trends
        }
        render_success(score_data)
      end

      # GET /api/v1/couples/:couple_id/dashboard/insights
      def insights
        insights_data = {
          patterns: analyze_patterns,
          strengths: identify_strengths,
          areas_for_growth: identify_growth_areas,
          personalized_tips: generate_tips
        }
        render_success(insights_data)
      end

      # GET /api/v1/couples/:couple_id/dashboard/achievements
      def achievements
        achievements_data = {
          recent_milestones: recent_milestones_achieved,
          upcoming_milestones: milestones_close_to_completion,
          total_points: total_points_earned,
          badges: earned_badges,
          leaderboard_position: calculate_leaderboard_position
        }
        render_success(achievements_data)
      end

      # GET /api/v1/couples/:couple_id/dashboard/weekly_report
      def weekly_report
        report = {
          week_number: Date.today.cweek,
          check_ins_completed: week_check_ins_count,
          streak_status: current_week_streak,
          mood_trends: weekly_mood_trends,
          top_categories: weekly_top_categories,
          action_items_completed: weekly_action_items_completed,
          highlights: weekly_highlights
        }
        render_success(report)
      end

      # GET /api/v1/couples/:couple_id/dashboard/monthly_report
      def monthly_report
        report = {
          month: Date.today.strftime('%B %Y'),
          summary: monthly_summary,
          milestones_achieved: monthly_milestones,
          growth_metrics: monthly_growth_metrics,
          consistency_score: monthly_consistency_score,
          recommendations: monthly_recommendations
        }
        render_success(report)
      end

      # GET /api/v1/couples/:couple_id/dashboard/statistics
      def statistics
        stats = {
          all_time: all_time_statistics,
          current_year: current_year_statistics,
          current_month: current_month_statistics,
          comparisons: period_comparisons
        }
        render_success(stats)
      end

      private

      def set_couple
        @couple = current_user.couples.find(params[:couple_id])
      rescue ActiveRecord::RecordNotFound
        render_not_found("Couple not found")
      end

      def overview_stats
        {
          total_check_ins: @couple.total_check_ins,
          current_streak: calculate_current_streak,
          longest_streak: calculate_longest_streak,
          last_check_in: @couple.last_check_in_at,
          active_action_items: active_action_items_count,
          pending_milestones: pending_milestones_count,
          total_notes: total_notes_count,
          member_since: @couple.created_at,
          days_together: days_since_creation
        }
      end

      def streak_information
        {
          current_streak: calculate_current_streak,
          longest_streak: calculate_longest_streak,
          streak_status: determine_streak_status,
          next_check_in_due: calculate_next_check_in_due,
          at_risk: streak_at_risk?,
          streak_history: streak_history_data
        }
      end

      def detailed_streak_info
        {
          current: {
            days: calculate_current_streak,
            started_on: streak_start_date,
            status: determine_streak_status,
            percentage_to_next_milestone: streak_milestone_progress
          },
          longest: {
            days: calculate_longest_streak,
            achieved_on: longest_streak_date,
            beaten: current_streak_beats_longest?
          },
          milestones: {
            seven_day: seven_day_streak_achieved?,
            thirty_day: thirty_day_streak_achieved?,
            ninety_day: ninety_day_streak_achieved?,
            yearly: yearly_streak_achieved?
          },
          history: last_12_months_streaks
        }
      end

      def calculate_current_streak
        return 0 unless @couple.last_check_in_at

        streak = 0
        current_date = Date.today
        check_ins = @couple.check_ins.completed.order(completed_at: :desc)

        # Calculate based on frequency
        case @couple.check_in_frequency
        when 'daily'
          consecutive_days = 0
          check_ins.each do |check_in|
            check_date = check_in.completed_at.to_date
            if check_date == current_date - consecutive_days
              consecutive_days += 1
            else
              break
            end
          end
          streak = consecutive_days
        when 'weekly'
          consecutive_weeks = 0
          current_week = current_date.cweek
          current_year = current_date.year

          check_ins.each do |check_in|
            check_week = check_in.completed_at.to_date.cweek
            check_year = check_in.completed_at.to_date.year

            expected_week = (current_week - consecutive_weeks) % 52
            expected_year = current_year - (current_week < consecutive_weeks ? 1 : 0)

            if check_week == expected_week && check_year == expected_year
              consecutive_weeks += 1
            else
              break
            end
          end
          streak = consecutive_weeks
        when 'biweekly'
          streak = calculate_biweekly_streak(check_ins, current_date)
        when 'monthly'
          consecutive_months = 0
          check_ins.each do |check_in|
            check_month = check_in.completed_at.to_date.month
            check_year = check_in.completed_at.to_date.year

            expected_month = (current_date.month - consecutive_months - 1) % 12 + 1
            expected_year = current_date.year - ((current_date.month - consecutive_months) <= 0 ? 1 : 0)

            if check_month == expected_month && check_year == expected_year
              consecutive_months += 1
            else
              break
            end
          end
          streak = consecutive_months
        end

        # Update couple's current_streak if different
        @couple.update(current_streak: streak) if @couple.current_streak != streak

        streak
      end

      def calculate_longest_streak
        # This would need a more sophisticated implementation
        # tracking historical streaks
        @couple.current_streak # Simplified for now
      end

      def calculate_biweekly_streak(check_ins, current_date)
        consecutive_periods = 0
        two_week_period = 14

        check_ins.each do |check_in|
          days_ago = (current_date - check_in.completed_at.to_date).to_i
          expected_period = consecutive_periods * two_week_period

          if days_ago >= expected_period && days_ago < expected_period + two_week_period
            consecutive_periods += 1
          else
            break
          end
        end

        consecutive_periods
      end

      def determine_streak_status
        return 'inactive' if calculate_current_streak == 0
        return 'at_risk' if streak_at_risk?
        return 'strong' if calculate_current_streak >= 7
        'active'
      end

      def streak_at_risk?
        return false unless @couple.last_check_in_at

        days_since_last = (Date.today - @couple.last_check_in_at.to_date).to_i

        case @couple.check_in_frequency
        when 'daily'
          days_since_last > 1
        when 'weekly'
          days_since_last > 7
        when 'biweekly'
          days_since_last > 14
        when 'monthly'
          days_since_last > 30
        else
          false
        end
      end

      def calculate_next_check_in_due
        return Date.today unless @couple.last_check_in_at

        last_date = @couple.last_check_in_at.to_date

        case @couple.check_in_frequency
        when 'daily'
          last_date + 1.day
        when 'weekly'
          last_date + 1.week
        when 'biweekly'
          last_date + 2.weeks
        when 'monthly'
          last_date + 1.month
        else
          Date.today
        end
      end

      def milestone_progress
        milestones = @couple.milestones.includes(:milestone_achievements)

        {
          total: milestones.count,
          achieved: milestones.achieved.count,
          in_progress: milestones.in_progress.count,
          close_to_completion: milestones.close_to_completion.count,
          achievement_rate: calculate_achievement_rate(milestones),
          recent_achievements: recent_milestone_achievements,
          next_milestone: next_milestone_to_achieve
        }
      end

      def recent_activity
        activities = []

        # Add recent check-ins
        @couple.check_ins.recent.limit(5).each do |check_in|
          activities << {
            type: 'check_in',
            title: "Check-in #{check_in.status}",
            date: check_in.started_at,
            details: {
              status: check_in.status,
              duration: check_in.duration_minutes,
              mood_change: mood_change(check_in)
            }
          }
        end

        # Add recent milestones
        @couple.milestones.recent.limit(3).each do |milestone|
          activities << {
            type: 'milestone',
            title: "Achieved: #{milestone.title}",
            date: milestone.achieved_at,
            details: {
              points: milestone.points,
              category: milestone.category
            }
          }
        end

        # Add recent action items
        ActionItem.joins(:check_in)
                  .where(check_ins: { couple_id: @couple.id })
                  .where(status: 'completed')
                  .order(completed_at: :desc)
                  .limit(3)
                  .each do |action_item|
          activities << {
            type: 'action_item',
            title: "Completed: #{action_item.title}",
            date: action_item.completed_at,
            details: {
              assigned_to: action_item.assigned_to
            }
          }
        end

        activities.sort_by { |a| a[:date] }.reverse.take(10)
      end

      def upcoming_items
        items = []

        # Next check-in due
        next_due = calculate_next_check_in_due
        items << {
          type: 'check_in',
          title: 'Next Check-in Due',
          due_date: next_due,
          overdue: next_due < Date.today
        }

        # Pending action items
        ActionItem.joins(:check_in)
                  .where(check_ins: { couple_id: @couple.id })
                  .where(status: 'pending')
                  .order(:due_date)
                  .limit(5)
                  .each do |action_item|
          items << {
            type: 'action_item',
            title: action_item.title,
            due_date: action_item.due_date,
            assigned_to: action_item.assigned_to,
            priority: action_item.priority
          }
        end

        # Milestones close to completion
        @couple.milestones.close_to_completion.limit(3).each do |milestone|
          items << {
            type: 'milestone',
            title: milestone.title,
            progress: milestone.progress,
            points: milestone.points
          }
        end

        items
      end

      def relationship_health_metrics
        check_ins = @couple.check_ins.completed.recent.limit(10)

        {
          overall_score: calculate_health_score,
          mood_average: calculate_average_mood(check_ins),
          communication_score: calculate_communication_score,
          consistency_score: calculate_consistency_score,
          engagement_score: calculate_engagement_score,
          growth_score: calculate_growth_score
        }
      end

      def calculate_health_score
        # Weighted average of different metrics
        consistency = calculate_consistency_score * 0.3
        communication = calculate_communication_score * 0.25
        engagement = calculate_engagement_score * 0.25
        growth = calculate_growth_score * 0.2

        (consistency + communication + engagement + growth).round
      end

      def calculate_consistency_score
        # Based on streak and check-in regularity
        streak_score = [calculate_current_streak * 10, 100].min
        frequency_score = check_in_frequency_score

        ((streak_score + frequency_score) / 2).round
      end

      def calculate_communication_score
        # Based on notes, discussions, and session quality
        notes_count = Note.joins(:check_in)
                          .where(check_ins: { couple_id: @couple.id })
                          .where('notes.created_at > ?', 30.days.ago)
                          .count

        score = [notes_count * 5, 100].min
        score
      end

      def calculate_engagement_score
        # Based on participation and activity
        check_ins = @couple.check_ins.where('created_at > ?', 30.days.ago)
        participation_rate = calculate_participation_rate(check_ins)

        (participation_rate * 100).round
      end

      def calculate_growth_score
        # Based on milestones and progress
        milestones_achieved = @couple.milestones
                                     .where('achieved_at > ?', 30.days.ago)
                                     .count

        [milestones_achieved * 20, 100].min
      end

      def weekly_trends
        week_start = Date.today.beginning_of_week
        week_check_ins = @couple.check_ins
                                .where('started_at >= ?', week_start)
                                .completed

        {
          check_ins_this_week: week_check_ins.count,
          mood_trend: calculate_mood_trend(week_check_ins),
          most_discussed_category: most_discussed_category(week_check_ins),
          action_items_created: weekly_action_items_created,
          notes_created: weekly_notes_created
        }
      end

      def monthly_summary
        month_start = Date.today.beginning_of_month
        month_check_ins = @couple.check_ins
                                 .where('started_at >= ?', month_start)
                                 .completed

        {
          total_check_ins: month_check_ins.count,
          completion_rate: monthly_completion_rate,
          average_session_duration: average_duration(month_check_ins),
          milestones_achieved: monthly_milestones_count,
          mood_improvement: monthly_mood_improvement,
          top_categories: top_monthly_categories
        }
      end

      # Helper methods

      def active_action_items_count
        ActionItem.joins(:check_in)
                  .where(check_ins: { couple_id: @couple.id })
                  .where(status: 'pending')
                  .count
      end

      def pending_milestones_count
        @couple.milestones.pending.count
      end

      def total_notes_count
        Note.joins(:check_in)
            .where(check_ins: { couple_id: @couple.id })
            .count
      end

      def days_since_creation
        ((Time.current - @couple.created_at) / 1.day).round
      end

      def calculate_achievement_rate(milestones)
        return 0 if milestones.count.zero?
        ((milestones.achieved.count.to_f / milestones.count) * 100).round(1)
      end

      def recent_milestone_achievements
        @couple.milestones
               .achieved
               .recent
               .limit(5)
               .map { |m| { id: m.id, title: m.title, achieved_at: m.achieved_at, points: m.points } }
      end

      def next_milestone_to_achieve
        @couple.milestones
               .pending
               .order('progress DESC')
               .first
               &.slice(:id, :title, :progress, :category)
      end

      def mood_change(check_in)
        return nil unless check_in.mood_before && check_in.mood_after
        check_in.mood_after - check_in.mood_before
      end

      def calculate_average_mood(check_ins)
        moods = check_ins.map(&:mood_after).compact
        return nil if moods.empty?
        (moods.sum.to_f / moods.size).round(1)
      end

      def check_in_frequency_score
        expected = expected_check_ins_count
        actual = @couple.check_ins.where('created_at > ?', 30.days.ago).completed.count

        return 0 if expected.zero?
        [[actual.to_f / expected * 100, 100].min, 0].max.round
      end

      def expected_check_ins_count
        case @couple.check_in_frequency
        when 'daily' then 30
        when 'weekly' then 4
        when 'biweekly' then 2
        when 'monthly' then 1
        else 4
        end
      end

      def calculate_participation_rate(check_ins)
        return 0 if check_ins.empty?

        with_both_partners = check_ins.select do |ci|
          ci.participants&.size == 2
        end

        with_both_partners.size.to_f / check_ins.size
      end

      def calculate_mood_trend(check_ins)
        moods = check_ins.order(:started_at).map(&:mood_after).compact
        return 'stable' if moods.size < 2

        first_half = moods[0..moods.size/2-1]
        second_half = moods[moods.size/2..-1]

        first_avg = first_half.sum.to_f / first_half.size
        second_avg = second_half.sum.to_f / second_half.size

        diff = second_avg - first_avg

        if diff > 0.5
          'improving'
        elsif diff < -0.5
          'declining'
        else
          'stable'
        end
      end

      def most_discussed_category(check_ins)
        categories = []
        check_ins.each do |check_in|
          categories.concat(check_in.categories_discussed || [])
        end

        return nil if categories.empty?

        categories.group_by(&:itself)
                 .transform_values(&:count)
                 .max_by { |_, count| count }
                 &.first
      end

      def weekly_action_items_created
        ActionItem.joins(:check_in)
                  .where(check_ins: { couple_id: @couple.id })
                  .where('action_items.created_at > ?', 1.week.ago)
                  .count
      end

      def weekly_notes_created
        Note.joins(:check_in)
            .where(check_ins: { couple_id: @couple.id })
            .where('notes.created_at > ?', 1.week.ago)
            .count
      end

      def monthly_completion_rate
        total = @couple.check_ins.where('created_at > ?', 1.month.ago).count
        return 100 if total.zero?

        completed = @couple.check_ins
                          .where('created_at > ?', 1.month.ago)
                          .completed
                          .count

        ((completed.to_f / total) * 100).round
      end

      def average_duration(check_ins)
        durations = check_ins.map(&:duration_minutes).compact
        return 0 if durations.empty?

        (durations.sum.to_f / durations.size).round
      end

      def monthly_milestones_count
        @couple.milestones
               .where('achieved_at > ?', 1.month.ago)
               .count
      end

      def monthly_mood_improvement
        month_check_ins = @couple.check_ins
                                 .where('completed_at > ?', 1.month.ago)
                                 .completed

        improvements = month_check_ins.map do |ci|
          next nil unless ci.mood_before && ci.mood_after
          ci.mood_after - ci.mood_before
        end.compact

        return 0 if improvements.empty?
        (improvements.sum.to_f / improvements.size).round(1)
      end

      def top_monthly_categories
        categories = Hash.new(0)

        @couple.check_ins
               .where('created_at > ?', 1.month.ago)
               .completed
               .each do |check_in|
          (check_in.categories_discussed || []).each do |cat|
            categories[cat] += 1
          end
        end

        categories.sort_by { |_, count| -count }
                 .first(3)
                 .map { |cat, count| { category: cat, count: count } }
      end

      def week_check_ins_count
        @couple.check_ins
               .where('started_at > ?', 1.week.ago)
               .completed
               .count
      end

      def current_week_streak
        week_start = Date.today.beginning_of_week
        expected_this_week = case @couple.check_in_frequency
                            when 'daily' then Date.today.cwday
                            when 'weekly' then 1
                            else 0
                            end

        actual_this_week = @couple.check_ins
                                  .where('started_at >= ?', week_start)
                                  .completed
                                  .count

        {
          expected: expected_this_week,
          actual: actual_this_week,
          on_track: actual_this_week >= expected_this_week
        }
      end

      def weekly_mood_trends
        week_check_ins = @couple.check_ins
                               .where('started_at > ?', 1.week.ago)
                               .completed
                               .order(:started_at)

        week_check_ins.map do |ci|
          {
            date: ci.started_at.to_date,
            mood_before: ci.mood_before,
            mood_after: ci.mood_after,
            improvement: ci.mood_after && ci.mood_before ? ci.mood_after - ci.mood_before : nil
          }
        end
      end

      def weekly_top_categories
        categories = Hash.new(0)

        @couple.check_ins
               .where('started_at > ?', 1.week.ago)
               .completed
               .each do |check_in|
          (check_in.categories_discussed || []).each do |cat|
            categories[cat] += 1
          end
        end

        categories.sort_by { |_, count| -count }.first(3)
      end

      def weekly_action_items_completed
        ActionItem.joins(:check_in)
                  .where(check_ins: { couple_id: @couple.id })
                  .where('action_items.completed_at > ?', 1.week.ago)
                  .count
      end

      def weekly_highlights
        highlights = []

        # Streak milestone
        if calculate_current_streak % 7 == 0 && calculate_current_streak > 0
          highlights << "Reached #{calculate_current_streak} day streak!"
        end

        # Milestones achieved
        week_milestones = @couple.milestones
                                 .where('achieved_at > ?', 1.week.ago)
        if week_milestones.any?
          highlights << "Achieved #{week_milestones.count} milestone(s)"
        end

        # Perfect week
        if current_week_streak[:on_track]
          highlights << "Perfect week - all check-ins completed!"
        end

        highlights
      end

      def monthly_milestones
        @couple.milestones
               .where('achieved_at > ?', 1.month.ago)
               .map { |m| { id: m.id, title: m.title, points: m.points, achieved_at: m.achieved_at } }
      end

      def monthly_growth_metrics
        {
          new_milestones_unlocked: new_milestones_count,
          action_items_completion_rate: action_items_completion_rate,
          notes_per_session: notes_per_session_average,
          categories_explored: unique_categories_discussed
        }
      end

      def monthly_consistency_score
        expected = expected_monthly_check_ins
        actual = @couple.check_ins
                       .where('started_at > ?', 1.month.ago)
                       .completed
                       .count

        return 0 if expected.zero?
        [[actual.to_f / expected * 100, 100].min, 0].max.round
      end

      def expected_monthly_check_ins
        case @couple.check_in_frequency
        when 'daily' then 30
        when 'weekly' then 4
        when 'biweekly' then 2
        when 'monthly' then 1
        else 4
        end
      end

      def monthly_recommendations
        recommendations = []

        # Streak recommendation
        if calculate_current_streak < 7
          recommendations << "Build consistency - aim for a 7-day streak"
        end

        # Category exploration
        if unique_categories_discussed < 3
          recommendations << "Explore more topics - try discussing different categories"
        end

        # Action items
        if action_items_completion_rate < 50
          recommendations << "Focus on completing pending action items"
        end

        # Milestones
        if @couple.milestones.close_to_completion.any?
          recommendations << "Complete milestones that are almost finished"
        end

        recommendations
      end

      def all_time_statistics
        {
          total_check_ins: @couple.total_check_ins,
          total_milestones: @couple.milestones.achieved.count,
          total_action_items: action_items_all_time_count,
          total_notes: total_notes_count,
          average_mood: all_time_average_mood,
          member_since_days: days_since_creation
        }
      end

      def current_year_statistics
        year_start = Date.today.beginning_of_year

        {
          check_ins: @couple.check_ins.where('started_at >= ?', year_start).completed.count,
          milestones: @couple.milestones.where('achieved_at >= ?', year_start).count,
          consistency_score: year_consistency_score,
          best_streak: year_best_streak
        }
      end

      def current_month_statistics
        month_start = Date.today.beginning_of_month

        {
          check_ins: @couple.check_ins.where('started_at >= ?', month_start).completed.count,
          milestones: @couple.milestones.where('achieved_at >= ?', month_start).count,
          action_items_completed: month_action_items_completed,
          mood_average: month_average_mood
        }
      end

      def period_comparisons
        {
          this_month_vs_last: month_over_month_comparison,
          this_week_vs_last: week_over_week_comparison,
          trend: overall_trend
        }
      end

      # Additional helper methods

      def new_milestones_count
        @couple.milestones
               .where('created_at > ?', 1.month.ago)
               .count
      end

      def action_items_completion_rate
        total = ActionItem.joins(:check_in)
                         .where(check_ins: { couple_id: @couple.id })
                         .where('action_items.created_at > ?', 1.month.ago)
                         .count

        return 100 if total.zero?

        completed = ActionItem.joins(:check_in)
                             .where(check_ins: { couple_id: @couple.id })
                             .where('action_items.created_at > ?', 1.month.ago)
                             .where(status: 'completed')
                             .count

        ((completed.to_f / total) * 100).round
      end

      def notes_per_session_average
        sessions = @couple.check_ins
                         .where('started_at > ?', 1.month.ago)
                         .completed
                         .count

        return 0 if sessions.zero?

        notes = Note.joins(:check_in)
                   .where(check_ins: { couple_id: @couple.id })
                   .where('notes.created_at > ?', 1.month.ago)
                   .count

        (notes.to_f / sessions).round(1)
      end

      def unique_categories_discussed
        categories = Set.new

        @couple.check_ins
               .where('started_at > ?', 1.month.ago)
               .completed
               .each do |check_in|
          categories.merge(check_in.categories_discussed || [])
        end

        categories.size
      end

      def action_items_all_time_count
        ActionItem.joins(:check_in)
                  .where(check_ins: { couple_id: @couple.id })
                  .count
      end

      def all_time_average_mood
        moods = @couple.check_ins.completed.map(&:mood_after).compact
        return nil if moods.empty?
        (moods.sum.to_f / moods.size).round(1)
      end

      def year_consistency_score
        year_start = Date.today.beginning_of_year
        weeks_passed = ((Date.today - year_start) / 7).floor

        expected = case @couple.check_in_frequency
                  when 'daily' then (Date.today - year_start).to_i
                  when 'weekly' then weeks_passed
                  when 'biweekly' then weeks_passed / 2
                  when 'monthly' then Date.today.month
                  else weeks_passed
                  end

        actual = @couple.check_ins
                       .where('started_at >= ?', year_start)
                       .completed
                       .count

        return 0 if expected.zero?
        [[actual.to_f / expected * 100, 100].min, 0].max.round
      end

      def year_best_streak
        # This would need implementation to track historical best streaks
        calculate_longest_streak
      end

      def month_action_items_completed
        ActionItem.joins(:check_in)
                  .where(check_ins: { couple_id: @couple.id })
                  .where('action_items.completed_at > ?', 1.month.ago)
                  .count
      end

      def month_average_mood
        moods = @couple.check_ins
                      .where('completed_at > ?', 1.month.ago)
                      .completed
                      .map(&:mood_after)
                      .compact

        return nil if moods.empty?
        (moods.sum.to_f / moods.size).round(1)
      end

      def month_over_month_comparison
        this_month = @couple.check_ins
                           .where('started_at >= ?', Date.today.beginning_of_month)
                           .completed
                           .count

        last_month = @couple.check_ins
                           .where(started_at: 1.month.ago.beginning_of_month..1.month.ago.end_of_month)
                           .completed
                           .count

        {
          this_month: this_month,
          last_month: last_month,
          change: last_month.zero? ? 0 : ((this_month - last_month).to_f / last_month * 100).round
        }
      end

      def week_over_week_comparison
        this_week = @couple.check_ins
                          .where('started_at >= ?', Date.today.beginning_of_week)
                          .completed
                          .count

        last_week = @couple.check_ins
                          .where(started_at: 1.week.ago.beginning_of_week..1.week.ago.end_of_week)
                          .completed
                          .count

        {
          this_week: this_week,
          last_week: last_week,
          change: last_week.zero? ? 0 : ((this_week - last_week).to_f / last_week * 100).round
        }
      end

      def overall_trend
        # Compare last 3 months
        monthly_counts = (0..2).map do |months_ago|
          @couple.check_ins
                .where(started_at: months_ago.months.ago.beginning_of_month..months_ago.months.ago.end_of_month)
                .completed
                .count
        end.reverse

        if monthly_counts[2] > monthly_counts[1] && monthly_counts[1] > monthly_counts[0]
          'improving'
        elsif monthly_counts[2] < monthly_counts[1] && monthly_counts[1] < monthly_counts[0]
          'declining'
        else
          'stable'
        end
      end

      def streak_start_date
        return nil if calculate_current_streak == 0

        case @couple.check_in_frequency
        when 'daily'
          Date.today - calculate_current_streak.days + 1
        when 'weekly'
          Date.today - (calculate_current_streak * 7).days
        when 'biweekly'
          Date.today - (calculate_current_streak * 14).days
        when 'monthly'
          Date.today - calculate_current_streak.months
        else
          nil
        end
      end

      def longest_streak_date
        # Would need to be tracked historically
        nil
      end

      def current_streak_beats_longest?
        calculate_current_streak > calculate_longest_streak
      end

      def streak_milestone_progress
        current = calculate_current_streak
        next_milestone = case current
                        when 0..6 then 7
                        when 7..29 then 30
                        when 30..89 then 90
                        when 90..364 then 365
                        else current + 100
                        end

        ((current.to_f / next_milestone) * 100).round
      end

      def seven_day_streak_achieved?
        calculate_current_streak >= 7 || calculate_longest_streak >= 7
      end

      def thirty_day_streak_achieved?
        calculate_current_streak >= 30 || calculate_longest_streak >= 30
      end

      def ninety_day_streak_achieved?
        calculate_current_streak >= 90 || calculate_longest_streak >= 90
      end

      def yearly_streak_achieved?
        calculate_current_streak >= 365 || calculate_longest_streak >= 365
      end

      def last_12_months_streaks
        # Would need historical tracking implementation
        []
      end

      def streak_history_data
        # Would need historical tracking implementation
        []
      end

      def compile_activity_feed(limit, offset)
        activities = []

        # Combine different activity types
        @couple.check_ins.recent.limit(limit).offset(offset).each do |ci|
          activities << {
            type: 'check_in',
            id: ci.id,
            title: "Check-in completed",
            date: ci.completed_at || ci.started_at,
            actor: ci.participants&.first,
            details: { status: ci.status, duration: ci.duration_minutes }
          }
        end

        @couple.milestones.recent.limit(limit).offset(offset).each do |m|
          activities << {
            type: 'milestone',
            id: m.id,
            title: "Milestone achieved: #{m.title}",
            date: m.achieved_at,
            actor: m.achieved_by,
            details: { points: m.points, category: m.category }
          }
        end

        activities.sort_by { |a| a[:date] }.reverse
      end

      def category_health_scores
        categories = @couple.categories.includes(:check_ins)

        categories.map do |category|
          {
            name: category.name,
            score: calculate_category_score(category),
            last_discussed: last_discussed_date(category)
          }
        end
      end

      def calculate_category_score(category)
        # Implementation would analyze discussion frequency and quality
        75 # Placeholder
      end

      def last_discussed_date(category)
        # Would need to track which categories were discussed in each check-in
        nil
      end

      def health_score_trends
        # Track health score over time
        []
      end

      def generate_recommendations
        recommendations = []

        score = calculate_health_score

        if score < 50
          recommendations << "Schedule more regular check-ins"
          recommendations << "Focus on completing sessions fully"
        elsif score < 75
          recommendations << "Try exploring new discussion topics"
          recommendations << "Set and track more relationship goals"
        else
          recommendations << "Keep up the great work!"
          recommendations << "Consider mentoring other couples"
        end

        recommendations
      end

      def analyze_patterns
        {
          best_day_for_checkins: best_checkin_day,
          average_session_time: average_session_duration,
          most_productive_time: most_productive_time_of_day
        }
      end

      def identify_strengths
        strengths = []

        strengths << "Consistency" if calculate_consistency_score > 80
        strengths << "Communication" if calculate_communication_score > 80
        strengths << "Growth mindset" if calculate_growth_score > 80

        strengths
      end

      def identify_growth_areas
        areas = []

        areas << "Consistency" if calculate_consistency_score < 50
        areas << "Communication" if calculate_communication_score < 50
        areas << "Goal setting" if @couple.milestones.pending.count < 3

        areas
      end

      def generate_tips
        tips = []

        if calculate_current_streak < 7
          tips << "Try to maintain a 7-day streak for better connection"
        end

        if @couple.milestones.close_to_completion.any?
          tips << "You have milestones close to completion - finish them for bonus points!"
        end

        tips << "Schedule your next check-in now to maintain momentum"

        tips
      end

      def recent_milestones_achieved
        @couple.milestones
               .achieved
               .recent
               .limit(5)
               .map do |m|
          {
            id: m.id,
            title: m.title,
            achieved_at: m.achieved_at,
            points: m.points,
            category: m.category
          }
        end
      end

      def milestones_close_to_completion
        @couple.milestones
               .close_to_completion
               .map do |m|
          {
            id: m.id,
            title: m.title,
            progress: m.progress,
            points: m.points,
            remaining: 100 - m.progress
          }
        end
      end

      def total_points_earned
        @couple.milestones.achieved.sum(:points)
      end

      def earned_badges
        # Would be based on specific achievements
        badges = []

        badges << { name: "Week Warrior", earned: seven_day_streak_achieved? }
        badges << { name: "Monthly Master", earned: thirty_day_streak_achieved? }
        badges << { name: "Quarter Champion", earned: ninety_day_streak_achieved? }
        badges << { name: "Year Legend", earned: yearly_streak_achieved? }

        badges.select { |b| b[:earned] }
      end

      def calculate_leaderboard_position
        # Would need to compare with other couples
        nil
      end

      def best_checkin_day
        check_ins = @couple.check_ins.completed
        return nil if check_ins.empty?

        days = check_ins.group_by { |ci| ci.started_at.wday }
        best_day = days.max_by { |_, cis| cis.count }&.first

        Date::DAYNAMES[best_day] if best_day
      end

      def average_session_duration
        durations = @couple.check_ins.completed.map(&:duration_minutes).compact
        return 0 if durations.empty?

        durations.sum / durations.size
      end

      def most_productive_time_of_day
        check_ins = @couple.check_ins.completed
        return nil if check_ins.empty?

        hours = check_ins.group_by { |ci| ci.started_at.hour }
        best_hour = hours.max_by { |_, cis| cis.count }&.first

        if best_hour
          "#{best_hour}:00 - #{best_hour + 1}:00"
        end
      end
    end
  end
end