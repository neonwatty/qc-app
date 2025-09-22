module Api
  module V1
    class SessionSettingsController < Api::BaseController
      before_action :set_couple
      before_action :set_session_settings, only: [:show, :update, :agree, :export_template]
      before_action :set_proposal, only: [:accept_proposal, :reject_proposal, :withdraw_proposal, :proposal_comments]

      # GET /api/v1/couples/:couple_id/session_settings
      def index
        @settings = @couple.session_settings.includes(:proposals).order(version: :desc)
        render_success(serialize_collection(@settings))
      end

      # GET /api/v1/couples/:couple_id/session_settings/current
      def current
        @settings = @couple.session_settings.current.first

        if @settings
          render_success(serialize_detailed_resource(@settings))
        else
          render_success(data: default_settings_response)
        end
      end

      # GET /api/v1/couples/:couple_id/session_settings/:id
      def show
        render_success(serialize_detailed_resource(@session_settings))
      end

      # POST /api/v1/couples/:couple_id/session_settings
      def create
        @session_settings = @couple.session_settings.build(session_settings_params)
        @session_settings.agreed_by = [current_user.id]

        if @session_settings.save
          render_created(serialize_resource(@session_settings))
        else
          render_unprocessable_entity(@session_settings.errors.full_messages)
        end
      end

      # PATCH/PUT /api/v1/couples/:couple_id/session_settings/:id
      def update
        if @session_settings.agreed?
          render_bad_request("Cannot modify agreed settings. Create a new proposal instead.")
          return
        end

        if @session_settings.update(session_settings_params)
          render_success(serialize_resource(@session_settings))
        else
          render_unprocessable_entity(@session_settings.errors.full_messages)
        end
      end

      # POST /api/v1/couples/:couple_id/session_settings/:id/agree
      def agree
        if @session_settings.agreed?
          render_bad_request("Settings already agreed upon")
          return
        end

        @session_settings.agree!(current_user.id)
        render_success(serialize_resource(@session_settings))
      rescue => e
        render_bad_request("Failed to agree to settings: #{e.message}")
      end

      # POST /api/v1/couples/:couple_id/session_settings/apply_template
      def apply_template
        template_name = params[:template_name]

        if template_name.blank?
          render_bad_request("Template name is required")
          return
        end

        @session_settings = @couple.session_settings.build

        if @session_settings.apply_template!(template_name)
          @session_settings.agreed_by = [current_user.id]

          if @session_settings.save
            render_created(serialize_resource(@session_settings))
          else
            render_unprocessable_entity(@session_settings.errors.full_messages)
          end
        else
          render_bad_request("Unknown template: #{template_name}")
        end
      end

      # GET /api/v1/couples/:couple_id/session_settings/:id/export_template
      def export_template
        template = @session_settings.export_as_template
        render_success(data: template)
      end

      # GET /api/v1/couples/:couple_id/session_settings/templates
      def templates
        templates = [
          {
            name: 'quick_checkin',
            title: 'Quick Check-in',
            description: '15-minute focused session for daily connection',
            duration: 15
          },
          {
            name: 'deep_dive',
            title: 'Deep Dive',
            description: '60-minute comprehensive session with breaks',
            duration: 60
          },
          {
            name: 'conflict_resolution',
            title: 'Conflict Resolution',
            description: '45-minute session focused on resolving conflicts',
            duration: 45
          }
        ]

        render_success(data: templates)
      end

      # POST /api/v1/couples/:couple_id/session_settings/propose
      def propose
        @proposal = @couple.session_settings_proposals.build(proposal_params)
        @proposal.proposed_by = current_user
        @proposal.current_settings = @couple.session_settings.current.first

        if @proposal.save
          notify_partner_of_proposal(@proposal)
          render_created(serialize_resource(@proposal))
        else
          render_unprocessable_entity(@proposal.errors.full_messages)
        end
      end

      # GET /api/v1/couples/:couple_id/session_settings/proposals
      def proposals
        @proposals = @couple.session_settings_proposals
                            .includes(:proposed_by, :reviewed_by, :comments)
                            .recent

        @proposals = filter_proposals(@proposals)
        render_success(serialize_collection(@proposals))
      end

      # GET /api/v1/couples/:couple_id/session_settings/proposals/pending
      def pending_proposals
        @proposals = @couple.session_settings_proposals
                            .pending
                            .includes(:proposed_by)
                            .recent

        render_success(serialize_collection(@proposals))
      end

      # POST /api/v1/couples/:couple_id/session_settings/proposals/:proposal_id/accept
      def accept_proposal
        message = params[:message]

        if @proposal.accept!(current_user, message)
          render_success(serialize_resource(@proposal))
        else
          render_bad_request("Cannot accept this proposal")
        end
      end

      # POST /api/v1/couples/:couple_id/session_settings/proposals/:proposal_id/reject
      def reject_proposal
        reason = params[:reason]

        if reason.blank?
          render_bad_request("Rejection reason is required")
          return
        end

        if @proposal.reject!(current_user, reason)
          render_success(serialize_resource(@proposal))
        else
          render_bad_request("Cannot reject this proposal")
        end
      end

      # POST /api/v1/couples/:couple_id/session_settings/proposals/:proposal_id/withdraw
      def withdraw_proposal
        if @proposal.proposed_by != current_user.id
          render_unauthorized("You can only withdraw your own proposals")
          return
        end

        reason = params[:reason]

        if @proposal.withdraw!(reason)
          render_success(serialize_resource(@proposal))
        else
          render_bad_request("Cannot withdraw this proposal")
        end
      end

      # GET /api/v1/couples/:couple_id/session_settings/proposals/:proposal_id/changes
      def proposal_changes
        @proposal = @couple.session_settings_proposals.find(params[:proposal_id])
        changes = @proposal.changes_summary

        render_success(data: changes)
      end

      # POST /api/v1/couples/:couple_id/session_settings/proposals/:proposal_id/comment
      def proposal_comments
        content = params[:content]

        if content.blank?
          render_bad_request("Comment content is required")
          return
        end

        comment = @proposal.add_comment(current_user, content)

        if comment.persisted?
          render_created(serialize_resource(comment))
        else
          render_unprocessable_entity(comment.errors.full_messages)
        end
      end

      # POST /api/v1/couples/:couple_id/session_settings/duplicate
      def duplicate
        source_id = params[:source_id]
        changes = params[:changes] || {}

        source_settings = @couple.session_settings.find(source_id)
        new_settings = source_settings.duplicate_with_changes(changes)
        new_settings.agreed_by = [current_user.id]

        if new_settings.save
          render_created(serialize_resource(new_settings))
        else
          render_unprocessable_entity(new_settings.errors.full_messages)
        end
      rescue ActiveRecord::RecordNotFound
        render_not_found("Source settings not found")
      end

      # GET /api/v1/couples/:couple_id/session_settings/history
      def history
        @settings = @couple.session_settings
                           .includes(:proposals)
                           .order(version: :desc)
                           .limit(10)

        history_data = @settings.map do |setting|
          {
            id: setting.id,
            version: setting.version,
            agreed: setting.agreed?,
            agreed_at: setting.agreed_at,
            archived: setting.archived,
            total_time: setting.calculate_total_time,
            changes_from_previous: setting.version > 1 ? calculate_changes(setting) : nil
          }
        end

        render_success(data: history_data)
      end

      # POST /api/v1/couples/:couple_id/session_settings/proposals/expire_old
      def expire_old_proposals
        expired_count = 0

        @couple.session_settings_proposals.pending.each do |proposal|
          if proposal.expired?
            proposal.expire!
            expired_count += 1
          end
        end

        render_success(data: { expired_count: expired_count })
      end

      private

      def set_couple
        @couple = current_user.couples.find(params[:couple_id])
      rescue ActiveRecord::RecordNotFound
        render_not_found("Couple not found")
      end

      def set_session_settings
        @session_settings = @couple.session_settings.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_not_found("Session settings not found")
      end

      def set_proposal
        @proposal = @couple.session_settings_proposals.find(params[:proposal_id])
      rescue ActiveRecord::RecordNotFound
        render_not_found("Proposal not found")
      end

      def session_settings_params
        params.require(:session_settings).permit(
          :session_duration,
          :timeouts_per_partner,
          :timeout_duration,
          :cool_down_time,
          :turn_based_mode,
          :turn_duration,
          :notification_timing,
          :reminder_frequency,
          :break_intervals,
          :max_session_length,
          :allow_async_mode,
          :require_both_present,
          :auto_save_notes,
          :privacy_mode,
          categories_enabled: []
        )
      end

      def proposal_params
        params.require(:proposal).permit(
          :title,
          :reason,
          settings: [
            :session_duration,
            :timeouts_per_partner,
            :timeout_duration,
            :cool_down_time,
            :turn_based_mode,
            :turn_duration,
            :notification_timing,
            :reminder_frequency,
            :break_intervals,
            :max_session_length,
            :allow_async_mode,
            :require_both_present,
            :auto_save_notes,
            :privacy_mode,
            categories_enabled: []
          ]
        )
      end

      def filter_proposals(proposals)
        if params[:status].present?
          proposals = proposals.where(status: params[:status])
        end

        if params[:proposed_by].present?
          proposals = proposals.where(proposed_by_id: params[:proposed_by])
        end

        if params[:expiring_soon] == 'true'
          proposals = proposals.expiring_soon
        end

        proposals
      end

      def default_settings_response
        {
          id: nil,
          settings: SessionSettings::DEFAULT_SETTINGS,
          agreed: false,
          version: 0,
          message: "No settings configured yet. Using defaults."
        }
      end

      def calculate_changes(setting)
        previous = @couple.session_settings
                          .where("version < ?", setting.version)
                          .order(version: :desc)
                          .first

        return nil unless previous

        changes = {}
        SessionSettings::DEFAULT_SETTINGS.keys.each do |key|
          current_val = setting.send(key) rescue nil
          prev_val = previous.send(key) rescue nil
          changes[key] = { from: prev_val, to: current_val } if current_val != prev_val
        end

        changes.presence
      end

      def notify_partner_of_proposal(proposal)
        partner = @couple.users.where.not(id: current_user.id).first
        return unless partner

        # In production, trigger notification service
        Rails.logger.info "Notifying #{partner.id} of new proposal #{proposal.id}"
      end

      def serialize_resource(resource)
        case resource.class.name
        when 'SessionSettings'
          serialize_session_settings(resource)
        when 'SessionSettingsProposal'
          serialize_proposal(resource)
        when 'Comment'
          serialize_comment(resource)
        else
          resource.as_json
        end
      end

      def serialize_detailed_resource(resource)
        data = serialize_resource(resource)

        if resource.is_a?(SessionSettings)
          data[:proposals_count] = resource.proposals.count
          data[:total_session_time] = resource.calculate_total_time
          data[:notification_delay] = resource.notification_delay_minutes
          data[:reminder_days] = resource.reminder_frequency_days
        end

        data
      end

      def serialize_collection(collection)
        collection.map { |item| serialize_resource(item) }
      end

      def serialize_session_settings(settings)
        {
          id: settings.id,
          couple_id: settings.couple_id,
          session_duration: settings.session_duration,
          timeouts_per_partner: settings.timeouts_per_partner,
          timeout_duration: settings.timeout_duration,
          cool_down_time: settings.cool_down_time,
          turn_based_mode: settings.turn_based_mode,
          turn_duration: settings.turn_duration,
          categories_enabled: settings.categories_enabled,
          notification_timing: settings.notification_timing,
          reminder_frequency: settings.reminder_frequency,
          break_intervals: settings.break_intervals,
          max_session_length: settings.max_session_length,
          allow_async_mode: settings.allow_async_mode,
          require_both_present: settings.require_both_present,
          auto_save_notes: settings.auto_save_notes,
          privacy_mode: settings.privacy_mode,
          agreed: settings.agreed?,
          agreed_at: settings.agreed_at,
          agreed_by: settings.agreed_by,
          version: settings.version,
          archived: settings.archived,
          created_at: settings.created_at,
          updated_at: settings.updated_at
        }
      end

      def serialize_proposal(proposal)
        {
          id: proposal.id,
          couple_id: proposal.couple_id,
          title: proposal.title,
          reason: proposal.reason,
          settings: proposal.settings,
          status: proposal.status,
          proposed_by: {
            id: proposal.proposed_by.id,
            name: proposal.proposed_by.name
          },
          reviewed_by: proposal.reviewed_by ? {
            id: proposal.reviewed_by.id,
            name: proposal.reviewed_by.name
          } : nil,
          proposed_at: proposal.proposed_at,
          reviewed_at: proposal.reviewed_at,
          review_message: proposal.review_message,
          rejection_reason: proposal.rejection_reason,
          withdrawal_reason: proposal.withdrawal_reason,
          days_until_expiration: proposal.days_until_expiration,
          can_be_reviewed: proposal.can_be_reviewed?,
          comments_count: proposal.comments.count,
          created_at: proposal.created_at,
          updated_at: proposal.updated_at
        }
      end

      def serialize_comment(comment)
        {
          id: comment.id,
          content: comment.content,
          author: {
            id: comment.author.id,
            name: comment.author.name
          },
          created_at: comment.created_at
        }
      end
    end
  end
end