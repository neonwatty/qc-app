module Api
  module V1
    class CheckInsController < Api::BaseController
      before_action :set_couple
      before_action :set_check_in, only: [:show, :update, :destroy, :complete, :start, :abandon, :move_step, :add_participant, :add_category]
      before_action :authorize_couple_access!
      before_action :validate_session_access!, only: [:update, :complete, :start, :abandon, :move_step]
      before_action :check_session_timeout!, only: [:update, :move_step]

      # GET /api/v1/couples/:couple_id/check_ins
      def index
        @check_ins = @couple.check_ins
                           .includes(:notes, :action_items)
                           .order(created_at: :desc)
                           .page(params[:page])
                           .per(params[:per_page] || 20)

        render_paginated(@check_ins, CheckInSerializer)
      end

      # GET /api/v1/couples/:couple_id/check_ins/:id
      def show
        render_success(serialize_resource(@check_in))
      end

      # POST /api/v1/couples/:couple_id/check_ins
      def create
        # Check for existing active session
        if @couple.check_ins.active.exists?
          render_bad_request("An active check-in session already exists")
          return
        end

        @check_in = @couple.check_ins.build(check_in_params)
        @check_in.status = 'preparing'
        @check_in.started_at = Time.current
        @check_in.add_participant(current_user.id)
        @check_in.session_settings_id = params[:session_settings_id] if params[:session_settings_id]

        if @check_in.save
          render_created(serialize_detailed_resource(@check_in))
        else
          render_unprocessable_entity(@check_in.errors.full_messages)
        end
      end

      # PATCH/PUT /api/v1/couples/:couple_id/check_ins/:id
      def update
        # Track which user is updating
        @check_in.last_updated_by = current_user.id
        @check_in.last_activity_at = Time.current

        if @check_in.update(check_in_params)
          broadcast_session_update(@check_in)
          render_success(serialize_detailed_resource(@check_in))
        else
          render_unprocessable_entity(@check_in.errors.full_messages)
        end
      end

      # DELETE /api/v1/couples/:couple_id/check_ins/:id
      def destroy
        @check_in.destroy
        render_destroyed
      end

      # POST /api/v1/couples/:couple_id/check_ins/:id/complete
      def complete
        unless @check_in.can_complete?
          render_bad_request("Session cannot be completed in current state")
          return
        end

        if @check_in.complete!
          broadcast_session_update(@check_in)
          render_success(serialize_detailed_resource(@check_in))
        else
          render_unprocessable_entity(@check_in.errors.full_messages)
        end
      end

      # GET /api/v1/couples/:couple_id/check_ins/current
      def current
        @check_in = @couple.check_ins.active.first

        if @check_in
          # Include participant info and current step progress
          data = serialize_detailed_resource(@check_in).merge(
            participants_info: get_participants_info(@check_in),
            session_duration: @check_in.duration,
            time_in_current_step: time_in_current_step(@check_in)
          )
          render_success(data)
        else
          render_not_found("No active check-in found")
        end
      end

      # POST /api/v1/couples/:couple_id/check_ins/:id/start
      def start
        unless @check_in.can_start?
          render_bad_request("Session cannot be started in current state")
          return
        end

        if @check_in.start!
          broadcast_session_update(@check_in)
          render_success(serialize_detailed_resource(@check_in))
        else
          render_unprocessable_entity(@check_in.errors.full_messages)
        end
      end

      # POST /api/v1/couples/:couple_id/check_ins/:id/abandon
      def abandon
        if @check_in.abandon!
          broadcast_session_update(@check_in)
          render_success(serialize_detailed_resource(@check_in))
        else
          render_unprocessable_entity(@check_in.errors.full_messages)
        end
      end

      # POST /api/v1/couples/:couple_id/check_ins/:id/move_step
      def move_step
        step = params[:step]
        unless CheckIn::STEPS.include?(step)
          render_bad_request("Invalid step: #{step}")
          return
        end

        if @check_in.move_to_step!(step)
          broadcast_session_update(@check_in)
          render_success(serialize_detailed_resource(@check_in))
        else
          render_bad_request("Cannot move to step #{step} from current state")
        end
      end

      # POST /api/v1/couples/:couple_id/check_ins/:id/add_participant
      def add_participant
        user_id = params[:user_id] || current_user.id

        # Verify user is part of couple
        unless @couple.users.exists?(id: user_id)
          render_bad_request("User is not part of this couple")
          return
        end

        if @check_in.add_participant(user_id)
          broadcast_session_update(@check_in)
          render_success(serialize_detailed_resource(@check_in))
        else
          render_unprocessable_entity(@check_in.errors.full_messages)
        end
      end

      # POST /api/v1/couples/:couple_id/check_ins/:id/add_category
      def add_category
        category_id = params[:category_id]

        # Verify category exists and is accessible
        category = Category.find_by(id: category_id)
        unless category && (category.system? || category.couple_id == @couple.id)
          render_bad_request("Invalid or inaccessible category")
          return
        end

        if @check_in.add_category(category_id)
          render_success(serialize_detailed_resource(@check_in))
        else
          render_unprocessable_entity(@check_in.errors.full_messages)
        end
      end

      # GET /api/v1/couples/:couple_id/check_ins/:id/progress
      def progress
        set_check_in

        progress_data = {
          current_step: @check_in.current_step,
          current_step_index: CheckIn::STEPS.index(@check_in.current_step) || 0,
          total_steps: CheckIn::STEPS.length,
          percentage: @check_in.calculate_progress_percentage,
          step_durations: @check_in.step_durations,
          estimated_remaining_time: estimate_remaining_time(@check_in),
          categories_selected: @check_in.categories,
          notes_count: @check_in.notes.count,
          action_items_count: @check_in.action_items.count
        }

        render_success(progress_data)
      end

      # GET /api/v1/couples/:couple_id/check_ins/statistics
      def statistics
        stats = {
          total_sessions: @couple.check_ins.count,
          completed_sessions: @couple.check_ins.completed.count,
          abandoned_sessions: @couple.check_ins.abandoned.count,
          average_duration: @couple.check_ins.completed.average(:duration),
          average_mood_improvement: calculate_mood_improvement(@couple),
          most_discussed_categories: most_discussed_categories(@couple),
          current_streak: calculate_streak(@couple),
          last_session: @couple.check_ins.recent.first&.started_at
        }

        render_success(stats)
      end

      private

      def validate_session_access!
        # Ensure only participants can modify active session
        unless @check_in.participants.include?(current_user.id) || @check_in.preparing?
          render_unauthorized("You are not a participant in this session")
        end
      end

      def check_session_timeout!
        # Check if session has been inactive for too long (2 hours)
        if @check_in.last_activity_at && @check_in.last_activity_at < 2.hours.ago
          @check_in.abandon!
          render_bad_request("Session timed out due to inactivity")
        end
      end

      def broadcast_session_update(check_in)
        # Placeholder for real-time updates via ActionCable or similar
        # This would broadcast to all participants
        Rails.logger.info "Broadcasting update for check-in #{check_in.id} to participants"
      end

      def get_participants_info(check_in)
        User.where(id: check_in.participants).map do |user|
          {
            id: user.id,
            name: user.name,
            online: user_online?(user)
          }
        end
      end

      def user_online?(user)
        # Check if user has been active in last 5 minutes
        # This would typically check a Redis cache or similar
        true # Placeholder
      end

      def time_in_current_step(check_in)
        return 0 unless check_in.current_step

        last_step_change = check_in.updated_at
        ((Time.current - last_step_change) / 60).round
      end

      def estimate_remaining_time(check_in)
        return nil unless check_in.current_step

        steps_remaining = CheckIn::STEPS.length - (CheckIn::STEPS.index(check_in.current_step) || 0) - 1
        # Estimate 5 minutes per step on average
        steps_remaining * 5
      end

      def calculate_mood_improvement(couple)
        completed = couple.check_ins.completed.where.not(mood_before: nil, mood_after: nil)
        return 0 if completed.empty?

        improvements = completed.map { |c| c.mood_after - c.mood_before }
        (improvements.sum.to_f / improvements.length).round(2)
      end

      def most_discussed_categories(couple)
        category_ids = couple.check_ins.pluck(:categories).flatten
        frequency = category_ids.tally

        Category.where(id: frequency.keys)
                .map { |cat| { name: cat.name, count: frequency[cat.id] } }
                .sort_by { |c| -c[:count] }
                .first(5)
      end

      def calculate_streak(couple)
        sessions = couple.check_ins.completed.order(completed_at: :desc)
        return 0 if sessions.empty?

        streak = 0
        expected_date = Date.current

        sessions.each do |session|
          session_date = session.completed_at.to_date
          break if session_date < expected_date - 1.week

          streak += 1
          expected_date = session_date - 1.week
        end

        streak
      end

      def set_couple
        @couple = current_user.couples.find(params[:couple_id])
      rescue ActiveRecord::RecordNotFound
        render_not_found("Couple not found")
      end

      def set_check_in
        @check_in = @couple.check_ins.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_not_found("Check-in not found")
      end

      def authorize_couple_access!
        unless can_access_couple?(@couple)
          render_unauthorized("You don't have access to this couple")
        end
      end

      def check_in_params
        params.require(:check_in).permit(
          :status,
          :mood_before,
          :mood_after,
          :energy_before,
          :energy_after,
          :reflection,
          :gratitude,
          :current_step,
          :metadata,
          :session_settings_id,
          categories: [],
          participants: []
        )
      end

      def serialize_resource(check_in)
        {
          id: check_in.id,
          couple_id: check_in.couple_id,
          status: check_in.status,
          started_at: check_in.started_at,
          completed_at: check_in.completed_at,
          mood_before: check_in.mood_before,
          mood_after: check_in.mood_after,
          energy_before: check_in.energy_before,
          energy_after: check_in.energy_after,
          reflection: check_in.reflection,
          gratitude: check_in.gratitude,
          notes_count: check_in.notes.count,
          action_items_count: check_in.action_items.count,
          created_at: check_in.created_at,
          updated_at: check_in.updated_at
        }
      end

      def serialize_detailed_resource(check_in)
        serialize_resource(check_in).merge(
          current_step: check_in.current_step,
          progress_percentage: check_in.calculate_progress_percentage,
          participants: check_in.participants,
          categories: check_in.categories,
          step_durations: check_in.step_durations,
          duration: check_in.duration,
          abandoned_at: check_in.abandoned_at,
          last_activity_at: check_in.last_activity_at,
          session_settings_id: check_in.session_settings_id
        )
      end

      def serialize_collection(check_ins)
        check_ins.map { |check_in| serialize_resource(check_in) }
      end
    end
  end
end