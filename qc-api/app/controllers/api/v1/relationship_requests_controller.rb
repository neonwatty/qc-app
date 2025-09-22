module Api
  module V1
    class RelationshipRequestsController < Api::BaseController
      before_action :set_request, only: [:show, :update, :destroy, :accept, :decline, :defer, :convert_to_reminder, :mark_discussed]
      before_action :authorize_request_access!, only: [:show, :update, :destroy]
      before_action :authorize_response!, only: [:accept, :decline, :defer]

      # GET /api/v1/relationship_requests
      def index
        @requests = RelationshipRequest.for_user(current_user)
                                      .includes(:requested_by, :requested_for)

        # Filter by status
        if params[:status].present? && RelationshipRequest::STATUSES.include?(params[:status])
          @requests = @requests.where(status: params[:status])
        elsif params[:active_only] == 'true'
          @requests = @requests.active
        end

        # Filter by category
        if params[:category].present? && RelationshipRequest::CATEGORIES.include?(params[:category])
          @requests = @requests.by_category(params[:category])
        end

        # Filter by direction (sent/received)
        case params[:direction]
        when 'sent'
          @requests = @requests.sent_by(current_user)
        when 'received'
          @requests = @requests.inbox_for(current_user)
        end

        # Sort options
        @requests = case params[:sort]
                   when 'priority'
                     @requests.by_priority
                   when 'recent'
                     @requests.order(created_at: :desc)
                   when 'response_required'
                     @requests.order(:response_required_by)
                   else
                     @requests.order(created_at: :desc)
                   end

        render_success(serialize_collection(@requests))
      end

      # GET /api/v1/relationship_requests/:id
      def show
        render_success(serialize_detailed_resource(@request))
      end

      # POST /api/v1/relationship_requests
      def create
        @request = RelationshipRequest.new(request_params)
        @request.requested_by = current_user

        # Set requested_for based on partner or specific user
        if params[:for_partner] == 'true'
          @request.requested_for = current_user.partner
        elsif params[:requested_for_id].present?
          @request.requested_for_id = params[:requested_for_id]
        end

        # Set couple if not specified
        if @request.couple_id.blank? && current_user.current_couple
          @request.couple = current_user.current_couple
        end

        # Set response_required_by if not specified
        if @request.response_required_by.blank? && @request.priority == 'urgent'
          @request.response_required_by = Time.current + 24.hours
        elsif @request.response_required_by.blank?
          @request.response_required_by = Time.current + 7.days
        end

        if @request.save
          notify_recipient(@request)
          render_created(serialize_resource(@request))
        else
          render_unprocessable_entity(@request.errors.full_messages)
        end
      end

      # PATCH/PUT /api/v1/relationship_requests/:id
      def update
        if @request.update(request_params)
          render_success(serialize_resource(@request))
        else
          render_unprocessable_entity(@request.errors.full_messages)
        end
      end

      # DELETE /api/v1/relationship_requests/:id
      def destroy
        @request.destroy
        render_destroyed
      end

      # POST /api/v1/relationship_requests/:id/accept
      def accept
        response_message = params[:response]
        notes = params[:notes]

        if @request.accept!(response_message, notes)
          notify_requester(@request, 'accepted')
          render_success(serialize_resource(@request))
        else
          render_bad_request("Cannot accept request in current state")
        end
      end

      # POST /api/v1/relationship_requests/:id/decline
      def decline
        response_message = params[:response]
        reason = params[:reason]

        if @request.decline!(response_message, reason)
          notify_requester(@request, 'declined')
          render_success(serialize_resource(@request))
        else
          render_bad_request("Cannot decline request in current state")
        end
      end

      # POST /api/v1/relationship_requests/:id/defer
      def defer
        until_date = params[:until_date]
        reason = params[:reason]

        unless until_date.present?
          render_bad_request("Defer date is required")
          return
        end

        if @request.defer!(Time.parse(until_date), reason)
          notify_requester(@request, 'deferred')
          render_success(serialize_resource(@request))
        else
          render_bad_request("Cannot defer request")
        end
      rescue ArgumentError
        render_bad_request("Invalid date format")
      end

      # POST /api/v1/relationship_requests/:id/convert_to_reminder
      def convert_to_reminder
        reminder_params = params[:reminder] || {}

        reminder = @request.convert_to_reminder!(reminder_params.permit(
          :title, :message, :frequency, :notification_channel, :scheduled_for, :priority
        ))

        if reminder
          render_success({
            request: serialize_resource(@request),
            reminder: serialize_reminder(reminder)
          })
        else
          render_bad_request("Cannot convert request to reminder")
        end
      rescue => e
        render_bad_request("Failed to convert: #{e.message}")
      end

      # POST /api/v1/relationship_requests/:id/mark_discussed
      def mark_discussed
        @request.mark_as_discussed!
        render_success(serialize_resource(@request))
      end

      # POST /api/v1/relationship_requests/:id/add_note
      def add_note
        set_request
        content = params[:content]

        unless content.present?
          render_bad_request("Note content is required")
          return
        end

        note = @request.add_discussion_note(current_user, content)

        if note.persisted?
          render_created({
            note_id: note.id,
            request: serialize_resource(@request)
          })
        else
          render_unprocessable_entity(note.errors.full_messages)
        end
      end

      # GET /api/v1/relationship_requests/inbox
      def inbox
        @requests = RelationshipRequest.inbox_for(current_user)
                                      .includes(:requested_by)
                                      .by_priority

        render_success(serialize_collection(@requests))
      end

      # GET /api/v1/relationship_requests/sent
      def sent
        @requests = RelationshipRequest.sent_by(current_user)
                                      .includes(:requested_for)
                                      .order(created_at: :desc)

        render_success(serialize_collection(@requests))
      end

      # GET /api/v1/relationship_requests/requiring_response
      def requiring_response
        @requests = RelationshipRequest.inbox_for(current_user)
                                      .requiring_response
                                      .by_priority

        render_success(serialize_collection(@requests))
      end

      # GET /api/v1/relationship_requests/overdue
      def overdue
        @requests = RelationshipRequest.for_user(current_user)
                                      .overdue

        render_success(serialize_collection(@requests))
      end

      # GET /api/v1/relationship_requests/needs_attention
      def needs_attention
        @requests = RelationshipRequest.for_user(current_user)
                                      .needs_immediate_attention

        render_success(serialize_collection(@requests))
      end

      # GET /api/v1/relationship_requests/upcoming_activities
      def upcoming_activities
        @requests = RelationshipRequest.for_user(current_user)
                                      .upcoming_activities
                                      .order(:suggested_date)

        render_success(serialize_collection(@requests))
      end

      # POST /api/v1/relationship_requests/batch_accept
      def batch_accept
        request_ids = params[:request_ids] || []

        if request_ids.empty?
          render_bad_request("No requests selected")
          return
        end

        requests = RelationshipRequest.where(id: request_ids, requested_for: current_user)
        accepted_count = 0

        requests.each do |request|
          if request.accept!
            accepted_count += 1
            notify_requester(request, 'accepted')
          end
        rescue => e
          Rails.logger.error "Failed to accept request #{request.id}: #{e.message}"
        end

        render_success({
          accepted_count: accepted_count,
          total_selected: request_ids.length
        })
      end

      # GET /api/v1/relationship_requests/statistics
      def statistics
        user_requests = RelationshipRequest.for_user(current_user)

        stats = {
          total_requests: user_requests.count,
          pending_requests: user_requests.pending.count,
          accepted_requests: user_requests.accepted.count,
          declined_requests: user_requests.declined.count,
          sent_requests: user_requests.sent_by(current_user).count,
          received_requests: user_requests.inbox_for(current_user).count,
          overdue_responses: user_requests.overdue.count,
          by_category: requests_by_category(user_requests),
          by_priority: requests_by_priority(user_requests),
          response_rate: calculate_response_rate(user_requests),
          acceptance_rate: calculate_acceptance_rate(user_requests)
        }

        render_success(stats)
      end

      private

      def set_request
        @request = RelationshipRequest.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_not_found("Request not found")
      end

      def authorize_request_access!
        unless @request.requested_by == current_user || @request.requested_for == current_user
          render_unauthorized("You don't have access to this request")
        end
      end

      def authorize_response!
        unless @request.requested_for == current_user
          render_unauthorized("Only the recipient can respond to this request")
        end
      end

      def request_params
        params.require(:relationship_request).permit(
          :title,
          :description,
          :category,
          :priority,
          :suggested_date,
          :suggested_frequency,
          :notification_preference,
          :response_required_by,
          :expires_at,
          :couple_id,
          :related_check_in_id,
          scheduling_data: {}
        )
      end

      def serialize_resource(request)
        {
          id: request.id,
          title: request.title,
          description: request.description,
          category: request.category,
          priority: request.priority,
          status: request.status,
          requested_by_id: request.requested_by_id,
          requested_by_name: request.requested_by.name,
          requested_for_id: request.requested_for_id,
          requested_for_name: request.requested_for.name,
          suggested_date: request.suggested_date,
          suggested_frequency: request.suggested_frequency,
          response_required_by: request.response_required_by,
          expires_at: request.expires_at,
          response: request.response,
          responded_at: request.responded_at,
          discussed: request.discussed,
          discussed_at: request.discussed_at,
          defer_count: request.defer_count,
          deferred_until: request.deferred_until,
          created_at: request.created_at,
          updated_at: request.updated_at
        }
      end

      def serialize_detailed_resource(request)
        serialize_resource(request).merge(
          response_notes: request.response_notes,
          decline_reason: request.decline_reason,
          defer_reason: request.defer_reason,
          scheduling_data: request.scheduling_data,
          discussion_notes_count: request.discussion_notes.count,
          can_accept: request.can_accept?,
          can_decline: request.can_decline?,
          can_convert: request.can_convert?,
          is_overdue: request.response_required_by && request.response_required_by < Time.current
        )
      end

      def serialize_collection(requests)
        requests.map { |request| serialize_resource(request) }
      end

      def serialize_reminder(reminder)
        {
          id: reminder.id,
          title: reminder.title,
          message: reminder.message,
          scheduled_for: reminder.scheduled_for,
          frequency: reminder.frequency,
          category: reminder.category
        }
      end

      def notify_recipient(request)
        # Placeholder for notification logic
        Rails.logger.info "Notifying #{request.requested_for.id} about new request #{request.id}"
      end

      def notify_requester(request, action)
        # Placeholder for notification logic
        Rails.logger.info "Notifying #{request.requested_by.id} that request #{request.id} was #{action}"
      end

      def requests_by_category(requests)
        RelationshipRequest::CATEGORIES.map do |category|
          count = requests.by_category(category).count
          {
            category: category,
            count: count
          }
        end.select { |item| item[:count] > 0 }
      end

      def requests_by_priority(requests)
        RelationshipRequest::PRIORITIES.map do |priority|
          count = requests.where(priority: priority).count
          {
            priority: priority,
            count: count
          }
        end.select { |item| item[:count] > 0 }
      end

      def calculate_response_rate(requests)
        received = requests.inbox_for(current_user)
        total = received.count
        return 0 if total == 0

        responded = received.where.not(responded_at: nil).count
        ((responded.to_f / total) * 100).round
      end

      def calculate_acceptance_rate(requests)
        received = requests.inbox_for(current_user)
        responded = received.where.not(responded_at: nil)
        return 0 if responded.count == 0

        accepted = responded.accepted.count
        ((accepted.to_f / responded.count) * 100).round
      end
    end
  end
end