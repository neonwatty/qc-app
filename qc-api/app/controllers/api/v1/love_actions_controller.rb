module Api
  module V1
    class LoveActionsController < Api::BaseController
      before_action :set_love_action, only: [:show, :update, :destroy, :complete, :plan, :archive, :unarchive]
      before_action :authorize_action_access!, only: [:show, :update, :destroy]

      # GET /api/v1/love_actions
      def index
        @actions = LoveAction.joins(:linked_language, :for_user)
                            .where(for_user: current_user)
                            .includes(:linked_language, :created_by_user)

        # Filter by status
        if params[:status].present? && LoveAction::STATUSES.include?(params[:status])
          @actions = @actions.where(status: params[:status])
        else
          @actions = @actions.active
        end

        # Filter by language
        if params[:language_id].present?
          @actions = @actions.where(linked_language_id: params[:language_id])
        end

        # Filter by difficulty
        if params[:difficulty].present? && LoveAction::DIFFICULTIES.include?(params[:difficulty])
          @actions = @actions.where(difficulty: params[:difficulty])
        end

        # Sort options
        case params[:sort]
        when 'effectiveness'
          @actions = @actions.by_effectiveness
        when 'difficulty'
          @actions = @actions.by_difficulty
        when 'planned'
          @actions = @actions.order(:planned_for)
        else
          @actions = @actions.order(created_at: :desc)
        end

        render_success(serialize_collection(@actions))
      end

      # GET /api/v1/love_actions/:id
      def show
        render_success(serialize_detailed_resource(@action))
      end

      # POST /api/v1/love_actions
      def create
        @action = LoveAction.new(love_action_params)
        @action.for_user = params[:for_partner] == 'true' ? current_user.partner : current_user
        @action.created_by_user = current_user

        # Set suggested_by_user if suggested by partner
        if @action.suggested_by == 'partner'
          @action.suggested_by_user = current_user
        end

        if @action.save
          render_created(serialize_resource(@action))
        else
          render_unprocessable_entity(@action.errors.full_messages)
        end
      end

      # PATCH/PUT /api/v1/love_actions/:id
      def update
        if @action.update(love_action_params)
          render_success(serialize_resource(@action))
        else
          render_unprocessable_entity(@action.errors.full_messages)
        end
      end

      # DELETE /api/v1/love_actions/:id
      def destroy
        @action.destroy
        render_destroyed
      end

      # POST /api/v1/love_actions/:id/complete
      def complete
        rating = params[:effectiveness_rating]
        notes = params[:notes]

        if rating && !((1..5).include?(rating.to_i))
          render_bad_request("Effectiveness rating must be between 1 and 5")
          return
        end

        @action.complete!(rating: rating&.to_i, notes: notes)
        render_success(serialize_resource(@action))
      rescue => e
        render_bad_request("Failed to complete action: #{e.message}")
      end

      # POST /api/v1/love_actions/:id/plan
      def plan
        date = params[:planned_for]

        unless date.present?
          render_bad_request("Planned date is required")
          return
        end

        if @action.plan!(Date.parse(date))
          render_success(serialize_resource(@action))
        else
          render_unprocessable_entity(@action.errors.full_messages)
        end
      rescue Date::Error
        render_bad_request("Invalid date format")
      end

      # POST /api/v1/love_actions/:id/archive
      def archive
        if @action.archive!
          render_success(serialize_resource(@action))
        else
          render_unprocessable_entity(@action.errors.full_messages)
        end
      end

      # POST /api/v1/love_actions/:id/unarchive
      def unarchive
        if @action.unarchive!
          render_success(serialize_resource(@action))
        else
          render_unprocessable_entity(@action.errors.full_messages)
        end
      end

      # POST /api/v1/love_actions/:id/mark_recurring
      def mark_recurring
        set_love_action
        frequency = params[:frequency]

        unless frequency.present? && LoveAction::FREQUENCIES.include?(frequency)
          render_bad_request("Invalid frequency")
          return
        end

        if @action.mark_recurring!(frequency)
          render_success(serialize_resource(@action))
        else
          render_unprocessable_entity(@action.errors.full_messages)
        end
      end

      # GET /api/v1/love_actions/upcoming
      def upcoming
        @actions = LoveAction.where(for_user: current_user)
                            .upcoming
                            .includes(:linked_language)
                            .limit(10)

        render_success(serialize_collection(@actions))
      end

      # GET /api/v1/love_actions/overdue
      def overdue
        @actions = LoveAction.where(for_user: current_user)
                            .overdue
                            .includes(:linked_language)

        render_success(serialize_collection(@actions))
      end

      # GET /api/v1/love_actions/due_today
      def due_today
        @actions = LoveAction.where(for_user: current_user)
                            .due_today
                            .includes(:linked_language)

        render_success(serialize_collection(@actions))
      end

      # GET /api/v1/love_actions/partner_suggestions
      def partner_suggestions
        partner = current_user.partner

        unless partner
          render_not_found("No partner found")
          return
        end

        @actions = LoveAction.where(for_user: partner, suggested_by: 'partner', suggested_by_user: current_user)
                            .active
                            .includes(:linked_language)
                            .order(created_at: :desc)

        render_success(serialize_collection(@actions))
      end

      # GET /api/v1/love_actions/highly_effective
      def highly_effective
        @actions = LoveAction.where(for_user: current_user)
                            .highly_effective
                            .includes(:linked_language)
                            .limit(20)

        render_success(serialize_collection(@actions))
      end

      # POST /api/v1/love_actions/batch_complete
      def batch_complete
        action_ids = params[:action_ids] || []

        if action_ids.empty?
          render_bad_request("No actions selected")
          return
        end

        actions = LoveAction.where(id: action_ids, for_user: current_user)
        completed_count = 0

        actions.each do |action|
          begin
            action.complete!
            completed_count += 1
          rescue => e
            Rails.logger.error "Failed to complete action #{action.id}: #{e.message}"
          end
        end

        render_success({
          completed_count: completed_count,
          total_selected: action_ids.length
        })
      end

      # GET /api/v1/love_actions/statistics
      def statistics
        stats = {
          total_actions: LoveAction.where(for_user: current_user).count,
          completed_actions: LoveAction.where(for_user: current_user).completed.count,
          planned_actions: LoveAction.where(for_user: current_user).planned.count,
          recurring_actions: LoveAction.where(for_user: current_user).recurring.count,
          overdue_count: LoveAction.where(for_user: current_user).overdue.count,
          completion_by_difficulty: completion_by_difficulty,
          effectiveness_by_category: effectiveness_by_category,
          weekly_completion_trend: weekly_completion_trend
        }

        render_success(stats)
      end

      # POST /api/v1/love_actions/generate_suggestions
      def generate_suggestions
        language_id = params[:language_id]

        unless language_id.present?
          render_bad_request("Language ID required")
          return
        end

        language = current_user.love_languages.find(language_id)
        suggestions = generate_action_suggestions(language)

        suggestions.each do |suggestion|
          LoveAction.create!(
            suggestion.merge(
              linked_language: language,
              for_user: current_user,
              created_by_user: current_user,
              suggested_by: 'system',
              status: 'suggested'
            )
          )
        end

        @actions = language.love_actions.suggested.recent.limit(suggestions.count)
        render_success(serialize_collection(@actions))
      rescue ActiveRecord::RecordNotFound
        render_not_found("Love language not found")
      end

      private

      def set_love_action
        @action = LoveAction.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_not_found("Love action not found")
      end

      def authorize_action_access!
        unless @action.for_user == current_user || @action.created_by_user == current_user
          render_unauthorized("You don't have access to this action")
        end
      end

      def love_action_params
        params.require(:love_action).permit(
          :linked_language_id,
          :title,
          :description,
          :suggested_by,
          :status,
          :planned_for,
          :frequency,
          :difficulty,
          :effectiveness_rating
        )
      end

      def serialize_resource(action)
        {
          id: action.id,
          linked_language_id: action.linked_language_id,
          language_title: action.linked_language.title,
          title: action.title,
          description: action.description,
          for_user_id: action.for_user_id,
          created_by_id: action.created_by,
          suggested_by: action.suggested_by,
          status: action.status,
          planned_for: action.planned_for,
          frequency: action.frequency,
          difficulty: action.difficulty,
          completed_count: action.completed_count,
          effectiveness_rating: action.effectiveness_rating,
          last_completed_at: action.last_completed_at,
          created_at: action.created_at,
          updated_at: action.updated_at
        }
      end

      def serialize_detailed_resource(action)
        serialize_resource(action).merge(
          completion_notes: action.completion_notes,
          effectiveness_score: action.effectiveness_score,
          next_suggested_date: action.next_suggested_date,
          is_overdue: action.overdue?,
          is_recurring: action.recurring?
        )
      end

      def serialize_collection(actions)
        actions.map { |action| serialize_resource(action) }
      end

      def completion_by_difficulty
        LoveAction::DIFFICULTIES.map do |difficulty|
          actions = LoveAction.where(for_user: current_user, difficulty: difficulty)
          completed = actions.completed.count
          total = actions.count

          {
            difficulty: difficulty,
            completion_rate: total > 0 ? (completed.to_f / total * 100).round : 0
          }
        end
      end

      def effectiveness_by_category
        LoveLanguage::CATEGORIES.map do |category|
          actions = LoveAction.joins(:linked_language)
                             .where(for_user: current_user, love_languages: { category: category })
                             .where.not(effectiveness_rating: nil)

          avg_rating = actions.average(:effectiveness_rating)

          {
            category: category,
            average_effectiveness: avg_rating ? avg_rating.round(2) : 0
          }
        end
      end

      def weekly_completion_trend
        4.times.map do |weeks_ago|
          start_date = weeks_ago.weeks.ago.beginning_of_week
          end_date = weeks_ago.weeks.ago.end_of_week

          count = LoveAction.where(for_user: current_user)
                           .where(last_completed_at: start_date..end_date)
                           .count

          {
            week_start: start_date.strftime('%Y-%m-%d'),
            completions: count
          }
        end.reverse
      end

      def generate_action_suggestions(language)
        base_suggestions = case language.category
        when 'words'
          [
            { title: 'Leave a love note', difficulty: 'easy', frequency: 'daily' },
            { title: 'Send appreciation text', difficulty: 'easy', frequency: 'daily' },
            { title: 'Write a love letter', difficulty: 'moderate', frequency: 'monthly' }
          ]
        when 'acts'
          [
            { title: 'Make breakfast in bed', difficulty: 'moderate', frequency: 'weekly' },
            { title: 'Handle a chore they dislike', difficulty: 'easy', frequency: 'weekly' },
            { title: 'Plan a surprise date', difficulty: 'challenging', frequency: 'monthly' }
          ]
        when 'gifts'
          [
            { title: 'Pick up their favorite snack', difficulty: 'easy', frequency: 'weekly' },
            { title: 'Buy flowers', difficulty: 'easy', frequency: 'monthly' },
            { title: 'Create a photo album', difficulty: 'challenging', frequency: 'once' }
          ]
        when 'time'
          [
            { title: 'Schedule date night', difficulty: 'moderate', frequency: 'weekly' },
            { title: 'Take a walk together', difficulty: 'easy', frequency: 'daily' },
            { title: 'Plan weekend getaway', difficulty: 'challenging', frequency: 'monthly' }
          ]
        when 'touch'
          [
            { title: 'Morning embrace', difficulty: 'easy', frequency: 'daily' },
            { title: 'Couple massage session', difficulty: 'moderate', frequency: 'weekly' },
            { title: 'Hold hands during movie', difficulty: 'easy', frequency: 'weekly' }
          ]
        else
          [
            { title: 'Custom love action', difficulty: 'moderate', frequency: 'once' }
          ]
        end

        base_suggestions.map do |suggestion|
          suggestion.merge(description: "#{suggestion[:title]} - #{language.title}")
        end
      end
    end
  end
end