module Api
  module V1
    class CheckInsController < Api::BaseController
      include ApiResponseHandler

      before_action :set_couple
      before_action :set_check_in, only: [:show, :update, :destroy, :complete, :start, :abandon, :move_step, :add_participant, :add_category]
      before_action :authorize_couple_access!
      before_action :validate_session_access!, only: [:update, :complete, :start, :abandon, :move_step]
      before_action :check_session_timeout!, only: [:update, :move_step]

      # GET /api/v1/couples/:couple_id/check_ins
      def index
        result = paginate(@couple.check_ins.includes(:notes, :action_items).order(created_at: :desc))
        render_success(result[:records], serializer: CheckInSerializer, meta: result[:meta])
      end

      # GET /api/v1/couples/:couple_id/check_ins/:id
      def show
        render_success(@check_in, serializer: CheckInSerializer)
      end

      # POST /api/v1/couples/:couple_id/check_ins
      def create
        # Validate request params
        validate_with(CheckInValidator, check_in_params)

        # Check for existing active session
        if @couple.check_ins.active.exists?
          render_error("An active check-in session already exists", status: :conflict)
          return
        end

        @check_in = @couple.check_ins.build(check_in_params)
        @check_in.status = 'preparing'
        @check_in.started_at = Time.current
        @check_in.add_participant(current_user.id)
        @check_in.session_settings_id = params[:session_settings_id] if params[:session_settings_id]

        if @check_in.save
          render_success(@check_in, serializer: CheckInSerializer, status: :created)
        else
          render_record_invalid(ActiveRecord::RecordInvalid.new(@check_in))
        end
      end

      # PATCH/PUT /api/v1/couples/:couple_id/check_ins/:id
      def update
        # Validate request params
        validate_with(CheckInValidator, check_in_params)

        # Track which user is updating
        @check_in.last_updated_by = current_user.id

        if @check_in.update(check_in_params)
          @check_in.update_last_activity!
          render_success(@check_in, serializer: CheckInSerializer)
        else
          render_record_invalid(ActiveRecord::RecordInvalid.new(@check_in))
        end
      end

      # DELETE /api/v1/couples/:couple_id/check_ins/:id
      def destroy
        @check_in.destroy
        render_success({ message: 'Check-in deleted successfully' })
      end

      # POST /api/v1/couples/:couple_id/check_ins/:id/complete
      def complete
        if @check_in.complete!(current_user)
          @couple.update_stats!
          render_success(@check_in, serializer: CheckInSerializer, meta: { message: 'Check-in completed successfully' })
        else
          render_error("Cannot complete check-in in current state", status: :unprocessable_entity)
        end
      end

      # POST /api/v1/couples/:couple_id/check_ins/:id/start
      def start
        if @check_in.start!
          render_success(@check_in, serializer: CheckInSerializer, meta: { message: 'Check-in started' })
        else
          render_error("Cannot start check-in in current state", status: :unprocessable_entity)
        end
      end

      # POST /api/v1/couples/:couple_id/check_ins/:id/abandon
      def abandon
        if @check_in.abandon!(current_user)
          render_success(@check_in, serializer: CheckInSerializer, meta: { message: 'Check-in abandoned' })
        else
          render_error("Cannot abandon check-in", status: :unprocessable_entity)
        end
      end

      # POST /api/v1/couples/:couple_id/check_ins/:id/move_step
      def move_step
        step = params.require(:step)

        unless @check_in.valid_step?(step)
          render_error("Invalid step: #{step}", status: :bad_request)
          return
        end

        if @check_in.update(current_step: step)
          @check_in.update_last_activity!
          render_success(@check_in, serializer: CheckInSerializer, meta: { message: "Moved to step: #{step}" })
        else
          render_record_invalid(ActiveRecord::RecordInvalid.new(@check_in))
        end
      end

      # POST /api/v1/couples/:couple_id/check_ins/:id/add_participant
      def add_participant
        user_id = params.require(:user_id)

        if @check_in.add_participant(user_id)
          render_success(@check_in, serializer: CheckInSerializer, meta: { message: 'Participant added' })
        else
          render_error("Failed to add participant", status: :unprocessable_entity)
        end
      end

      # POST /api/v1/couples/:couple_id/check_ins/:id/add_category
      def add_category
        category_id = params.require(:category_id)

        if @check_in.add_category(category_id)
          render_success(@check_in, serializer: CheckInSerializer, meta: { message: 'Category added' })
        else
          render_error("Failed to add category", status: :unprocessable_entity)
        end
      end

      # GET /api/v1/couples/:couple_id/check_ins/recent
      def recent
        result = paginate(@couple.check_ins.recent.includes(:notes, :action_items))
        render_success(result[:records], serializer: CheckInSerializer, meta: result[:meta])
      end

      # GET /api/v1/couples/:couple_id/check_ins/active
      def active
        @active_check_in = @couple.check_ins.active.first
        if @active_check_in
          render_success(@active_check_in, serializer: CheckInSerializer)
        else
          render_success(nil, meta: { message: 'No active check-in session' })
        end
      end

      # GET /api/v1/couples/:couple_id/check_ins/stats
      def stats
        stats = {
          total: @couple.check_ins.count,
          completed: @couple.check_ins.completed.count,
          this_month: @couple.check_ins.where('created_at >= ?', Date.current.beginning_of_month).count,
          average_duration: calculate_average_duration,
          mood_improvement: calculate_mood_improvement,
          most_discussed_categories: most_discussed_categories
        }
        render_success(stats)
      end

      private

      def set_couple
        @couple = Couple.find(params[:couple_id])
      end

      def set_check_in
        @check_in = @couple.check_ins.find(params[:id])
      end

      def check_in_params
        params.permit(
          :status, :reflection, :mood_before, :mood_after,
          :current_step, :session_settings_id,
          participants: [], categories: []
        )
      end

      def authorize_couple_access!
        unless current_user.couples.include?(@couple)
          render_error("Not authorized to access this couple's data", status: :forbidden)
        end
      end

      def validate_session_access!
        unless @check_in.participants.include?(current_user.id.to_s)
          render_error("Not a participant in this check-in", status: :forbidden)
        end
      end

      def check_session_timeout!
        if @check_in.timed_out?
          render_error("Session has timed out", status: :unprocessable_entity)
        end
      end

      def calculate_average_duration
        completed = @couple.check_ins.completed
        return 0 if completed.empty?

        total_duration = completed.sum do |ci|
          ((ci.completed_at - ci.started_at) / 60).round rescue 0
        end
        (total_duration / completed.count.to_f).round
      end

      def calculate_mood_improvement
        completed = @couple.check_ins.completed.where.not(mood_before: nil, mood_after: nil)
        return 0 if completed.empty?

        improvements = completed.map { |ci| ci.mood_after - ci.mood_before }
        (improvements.sum.to_f / improvements.count).round(2)
      end

      def most_discussed_categories
        categories_counts = Hash.new(0)

        @couple.check_ins.each do |ci|
          ci.categories&.each do |category_id|
            category = Category.find_by(id: category_id)
            categories_counts[category.name] += 1 if category
          end
        end

        categories_counts.sort_by { |_, count| -count }.first(5).to_h
      end
    end
  end
end