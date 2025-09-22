module Api
  module V1
    class RemindersController < Api::BaseController
      before_action :set_reminder, only: [:show, :update, :destroy, :complete, :skip, :snooze, :unsnooze, :reschedule]
      before_action :authorize_reminder_access!, only: [:show, :update, :destroy]

      # GET /api/v1/reminders
      def index
        @reminders = Reminder.for_user(current_user)
                            .includes(:assigned_to, :created_by)

        # Filter by status
        if params[:active_only] == 'true'
          @reminders = @reminders.active
        elsif params[:snoozed] == 'true'
          @reminders = @reminders.snoozed
        end

        # Filter by category
        if params[:category].present? && Reminder::CATEGORIES.include?(params[:category])
          @reminders = @reminders.by_category(params[:category])
        end

        # Filter by timeframe
        case params[:timeframe]
        when 'today'
          @reminders = @reminders.due_today
        when 'this_week'
          @reminders = @reminders.due_this_week
        when 'overdue'
          @reminders = @reminders.overdue
        when 'upcoming'
          @reminders = @reminders.upcoming
        end

        # Sort options
        @reminders = case params[:sort]
                    when 'priority'
                      @reminders.order(priority: :desc, scheduled_for: :asc)
                    when 'recent'
                      @reminders.order(created_at: :desc)
                    else
                      @reminders.order(:scheduled_for)
                    end

        render_success(serialize_collection(@reminders))
      end

      # GET /api/v1/reminders/:id
      def show
        render_success(serialize_detailed_resource(@reminder))
      end

      # POST /api/v1/reminders
      def create
        @reminder = Reminder.new(reminder_params)
        @reminder.created_by = current_user
        @reminder.assigned_to ||= current_user

        # Set couple if not specified
        if @reminder.couple_id.blank? && current_user.current_couple
          @reminder.couple = current_user.current_couple
        end

        if @reminder.save
          render_created(serialize_resource(@reminder))
        else
          render_unprocessable_entity(@reminder.errors.full_messages)
        end
      end

      # PATCH/PUT /api/v1/reminders/:id
      def update
        if @reminder.update(reminder_params)
          render_success(serialize_resource(@reminder))
        else
          render_unprocessable_entity(@reminder.errors.full_messages)
        end
      end

      # DELETE /api/v1/reminders/:id
      def destroy
        @reminder.destroy
        render_destroyed
      end

      # POST /api/v1/reminders/:id/complete
      def complete
        @reminder.complete!
        render_success(serialize_resource(@reminder))
      rescue => e
        render_bad_request("Failed to complete reminder: #{e.message}")
      end

      # POST /api/v1/reminders/:id/skip
      def skip
        @reminder.skip!
        render_success(serialize_resource(@reminder))
      rescue => e
        render_bad_request("Failed to skip reminder: #{e.message}")
      end

      # POST /api/v1/reminders/:id/snooze
      def snooze
        duration = params[:duration]&.to_i&.minutes

        @reminder.snooze!(duration)
        render_success(serialize_resource(@reminder))
      rescue => e
        render_bad_request("Failed to snooze reminder: #{e.message}")
      end

      # POST /api/v1/reminders/:id/unsnooze
      def unsnooze
        @reminder.unsnooze!
        render_success(serialize_resource(@reminder))
      rescue => e
        render_bad_request("Failed to unsnooze reminder: #{e.message}")
      end

      # PUT /api/v1/reminders/:id/reschedule
      def reschedule
        new_time = params[:scheduled_for]

        unless new_time.present?
          render_bad_request("New scheduled time is required")
          return
        end

        @reminder.reschedule!(Time.parse(new_time))
        render_success(serialize_resource(@reminder))
      rescue ArgumentError
        render_bad_request("Invalid time format")
      rescue => e
        render_bad_request("Failed to reschedule reminder: #{e.message}")
      end

      # GET /api/v1/reminders/upcoming
      def upcoming
        @reminders = Reminder.for_user(current_user)
                            .upcoming
                            .limit(params[:limit] || 10)

        render_success(serialize_collection(@reminders))
      end

      # GET /api/v1/reminders/overdue
      def overdue
        @reminders = Reminder.for_user(current_user)
                            .overdue

        render_success(serialize_collection(@reminders))
      end

      # GET /api/v1/reminders/high_priority
      def high_priority
        @reminders = Reminder.for_user(current_user)
                            .high_priority
                            .active
                            .order(:scheduled_for)
                            .limit(params[:limit] || 10)

        render_success(serialize_collection(@reminders))
      end

      # POST /api/v1/reminders/batch_complete
      def batch_complete
        reminder_ids = params[:reminder_ids] || []

        if reminder_ids.empty?
          render_bad_request("No reminders selected")
          return
        end

        reminders = Reminder.where(id: reminder_ids).for_user(current_user)
        completed_count = 0

        reminders.each do |reminder|
          begin
            reminder.complete!
            completed_count += 1
          rescue => e
            Rails.logger.error "Failed to complete reminder #{reminder.id}: #{e.message}"
          end
        end

        render_success({
          completed_count: completed_count,
          total_selected: reminder_ids.length
        })
      end

      # POST /api/v1/reminders/batch_snooze
      def batch_snooze
        reminder_ids = params[:reminder_ids] || []
        duration = params[:duration]&.to_i&.minutes

        if reminder_ids.empty?
          render_bad_request("No reminders selected")
          return
        end

        reminders = Reminder.where(id: reminder_ids).for_user(current_user)
        snoozed_count = 0

        reminders.each do |reminder|
          begin
            reminder.snooze!(duration)
            snoozed_count += 1
          rescue => e
            Rails.logger.error "Failed to snooze reminder #{reminder.id}: #{e.message}"
          end
        end

        render_success({
          snoozed_count: snoozed_count,
          total_selected: reminder_ids.length
        })
      end

      # GET /api/v1/reminders/statistics
      def statistics
        user_reminders = Reminder.for_user(current_user)

        stats = {
          total_reminders: user_reminders.count,
          active_reminders: user_reminders.active.count,
          completed_today: user_reminders.where(completed_at: Time.current.beginning_of_day..Time.current.end_of_day).count,
          overdue_count: user_reminders.overdue.count,
          snoozed_count: user_reminders.snoozed.count,
          completion_rate: calculate_completion_rate(user_reminders),
          by_category: reminders_by_category(user_reminders),
          by_frequency: reminders_by_frequency(user_reminders),
          upcoming_week: user_reminders.due_this_week.count
        }

        render_success(stats)
      end

      # POST /api/v1/reminders/create_from_template
      def create_from_template
        template_id = params[:template_id]

        unless template_id.present?
          render_bad_request("Template ID required")
          return
        end

        template = Reminder.where(is_template: true).find_by(id: template_id)

        unless template
          render_not_found("Template not found")
          return
        end

        @reminder = template.duplicate_for_user(current_user)
        @reminder.scheduled_for = params[:scheduled_for] || Time.current + 1.day

        if @reminder.save
          render_created(serialize_resource(@reminder))
        else
          render_unprocessable_entity(@reminder.errors.full_messages)
        end
      end

      # GET /api/v1/reminders/templates
      def templates
        @templates = Reminder.where(is_template: true)
                            .order(:category, :title)

        render_success(serialize_collection(@templates))
      end

      private

      def set_reminder
        @reminder = Reminder.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_not_found("Reminder not found")
      end

      def authorize_reminder_access!
        unless @reminder.created_by == current_user || @reminder.assigned_to == current_user
          render_unauthorized("You don't have access to this reminder")
        end
      end

      def reminder_params
        params.require(:reminder).permit(
          :title,
          :message,
          :category,
          :frequency,
          :notification_channel,
          :scheduled_for,
          :priority,
          :is_active,
          :advance_notice_minutes,
          :assigned_to_id,
          :couple_id,
          :related_check_in_id,
          :related_action_item_id,
          custom_frequency_data: {}
        )
      end

      def serialize_resource(reminder)
        {
          id: reminder.id,
          title: reminder.title,
          message: reminder.message,
          category: reminder.category,
          frequency: reminder.frequency,
          notification_channel: reminder.notification_channel,
          scheduled_for: reminder.scheduled_for,
          priority: reminder.priority,
          is_active: reminder.is_active,
          is_snoozed: reminder.is_snoozed,
          snooze_until: reminder.snooze_until,
          completed_at: reminder.completed_at,
          created_by_id: reminder.created_by_id,
          assigned_to_id: reminder.assigned_to_id,
          couple_id: reminder.couple_id,
          completion_count: reminder.completion_count,
          skip_count: reminder.skip_count,
          snooze_count: reminder.snooze_count,
          is_overdue: reminder.overdue?,
          next_occurrence: reminder.next_occurrence_date,
          created_at: reminder.created_at,
          updated_at: reminder.updated_at
        }
      end

      def serialize_detailed_resource(reminder)
        serialize_resource(reminder).merge(
          notification_preferences: reminder.notification_preferences,
          completion_rate: reminder.completion_rate,
          due_soon: reminder.due_soon?,
          should_notify: reminder.should_notify?,
          custom_frequency_data: reminder.custom_frequency_data,
          related_check_in_id: reminder.related_check_in_id,
          related_action_item_id: reminder.related_action_item_id
        )
      end

      def serialize_collection(reminders)
        reminders.map { |reminder| serialize_resource(reminder) }
      end

      def calculate_completion_rate(reminders)
        total = reminders.count
        return 0 if total == 0

        completed = reminders.where.not(completed_at: nil).count
        ((completed.to_f / total) * 100).round
      end

      def reminders_by_category(reminders)
        Reminder::CATEGORIES.map do |category|
          count = reminders.by_category(category).count
          {
            category: category,
            count: count,
            percentage: reminders.count > 0 ? ((count.to_f / reminders.count) * 100).round : 0
          }
        end
      end

      def reminders_by_frequency(reminders)
        Reminder::FREQUENCIES.map do |frequency|
          count = reminders.where(frequency: frequency).count
          {
            frequency: frequency,
            count: count
          }
        end.select { |item| item[:count] > 0 }
      end
    end
  end
end