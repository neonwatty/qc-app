module Api
  module V1
    class NotesController < Api::BaseController
      before_action :set_check_in, except: [:search]
      before_action :set_note, only: [:show, :update, :destroy, :publish, :make_private]
      before_action :authorize_note_access!, only: [:show, :update, :destroy, :publish, :make_private]
      before_action :validate_session_active!, only: [:create, :update]

      # GET /api/v1/check_ins/:check_in_id/notes
      def index
        @notes = @check_in.notes
                         .includes(:author)
                         .where(privacy: accessible_privacy_levels)
                         .order(created_at: :desc)

        render_success(serialize_collection(@notes))
      end

      # GET /api/v1/check_ins/:check_in_id/notes/:id
      def show
        render_success(serialize_resource(@note))
      end

      # POST /api/v1/check_ins/:check_in_id/notes
      def create
        @note = @check_in.notes.build(note_params)
        @note.author = current_user
        @note.category_id = params[:category_id] if params[:category_id]

        # Auto-tag with current step if in active session
        if @check_in.active? && @check_in.current_step
          @note.add_tag("step:#{@check_in.current_step}")
        end

        if @note.save
          notify_partner_if_shared(@note)
          update_session_activity(@check_in)
          render_created(serialize_detailed_resource(@note))
        else
          render_unprocessable_entity(@note.errors.full_messages)
        end
      end

      # PATCH/PUT /api/v1/check_ins/:check_in_id/notes/:id
      def update
        previous_privacy = @note.privacy

        if @note.update(note_params)
          # Notify if changed from private to shared
          if previous_privacy != 'shared' && @note.shared?
            notify_partner_if_shared(@note)
          end
          update_session_activity(@check_in)
          render_success(serialize_detailed_resource(@note))
        else
          render_unprocessable_entity(@note.errors.full_messages)
        end
      end

      # DELETE /api/v1/check_ins/:check_in_id/notes/:id
      def destroy
        @note.destroy
        render_destroyed
      end

      # GET /api/v1/notes/search
      def search
        query = params[:q] || params[:query]
        notes = Note.joins(:check_in)
                   .where(check_ins: { couple_id: current_user.couple_ids })
                   .viewable_by(current_user)

        # Filter by privacy level if specified
        if params[:privacy].present?
          notes = notes.where(privacy: params[:privacy])
        end

        # Filter by category
        if params[:category_id].present?
          notes = notes.where(category_id: params[:category_id])
        end

        # Filter by tags
        if params[:tags].present?
          tags = params[:tags].split(',')
          notes = notes.with_tags(tags)
        end

        # Filter by date range
        if params[:from_date].present?
          notes = notes.where('notes.created_at >= ?', params[:from_date])
        end
        if params[:to_date].present?
          notes = notes.where('notes.created_at <= ?', params[:to_date])
        end

        # Search content
        if query.present?
          notes = notes.where("notes.content ILIKE ?", "%#{query}%")
        end

        @notes = notes.order(created_at: :desc).limit(50)

        render_success(serialize_collection(@notes))
      end

      # POST /api/v1/check_ins/:check_in_id/notes/:id/publish
      def publish
        if @note.publish!
          notify_partner_if_shared(@note)
          render_success(serialize_detailed_resource(@note))
        else
          render_bad_request("Note cannot be published in current state")
        end
      end

      # POST /api/v1/check_ins/:check_in_id/notes/:id/make_private
      def make_private
        if @note.make_private!
          render_success(serialize_detailed_resource(@note))
        else
          render_unprocessable_entity(@note.errors.full_messages)
        end
      end

      # GET /api/v1/check_ins/:check_in_id/notes/by_step
      def by_step
        step = params[:step]
        unless CheckIn::STEPS.include?(step)
          render_bad_request("Invalid step: #{step}")
          return
        end

        notes = @check_in.notes
                        .viewable_by(current_user)
                        .with_tags(["step:#{step}"])
                        .order(:created_at)

        render_success(serialize_collection(notes))
      end

      # GET /api/v1/check_ins/:check_in_id/notes/summary
      def summary
        summary_data = {
          total_notes: @check_in.notes.count,
          private_notes: @check_in.notes.private_notes.by_author(current_user).count,
          shared_notes: @check_in.notes.shared_notes.count,
          draft_notes: @check_in.notes.drafts.by_author(current_user).count,
          by_category: notes_by_category(@check_in),
          by_author: notes_by_author(@check_in),
          word_count: total_word_count(@check_in),
          tags_used: all_tags_used(@check_in)
        }

        render_success(summary_data)
      end

      private

      def validate_session_active!
        unless @check_in.active?
          render_bad_request("Cannot modify notes for inactive session")
        end
      end

      def notify_partner_if_shared(note)
        return unless note.shared?

        # Find partner
        partner = @check_in.couple.users.where.not(id: current_user.id).first
        return unless partner

        # Placeholder for notification logic (email, push, etc.)
        Rails.logger.info "Notifying #{partner.id} about shared note #{note.id}"
      end

      def update_session_activity(check_in)
        check_in.update_columns(
          last_activity_at: Time.current,
          last_updated_by: current_user.id
        )
      end

      def notes_by_category(check_in)
        check_in.notes
                .viewable_by(current_user)
                .joins(:category)
                .group('categories.name')
                .count
      end

      def notes_by_author(check_in)
        check_in.notes
                .viewable_by(current_user)
                .joins(:author)
                .group('users.name')
                .count
      end

      def total_word_count(check_in)
        check_in.notes
                .viewable_by(current_user)
                .sum(&:word_count)
      end

      def all_tags_used(check_in)
        check_in.notes
                .viewable_by(current_user)
                .pluck(:tags)
                .flatten
                .uniq
                .compact
      end

      def set_check_in
        @check_in = CheckIn.joins(:couple)
                          .where(couples: { id: current_user.couple_ids })
                          .find(params[:check_in_id])
      rescue ActiveRecord::RecordNotFound
        render_not_found("Check-in not found")
      end

      def set_note
        @note = @check_in.notes.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_not_found("Note not found")
      end

      def authorize_note_access!
        unless can_access_note?(@note)
          render_unauthorized("You don't have access to this note")
        end
      end

      def can_access_note?(note)
        # Author can always access their notes
        return true if note.author == current_user

        # Partners can access shared notes
        if note.privacy == 'shared'
          note.check_in.couple.users.include?(current_user)
        else
          false
        end
      end

      def accessible_privacy_levels
        # Users can see their own private notes and all shared notes
        ['shared', 'private']
      end

      def note_params
        params.require(:note).permit(
          :content,
          :privacy,
          :category_id,
          tags: []
        )
      end

      def serialize_resource(note)
        {
          id: note.id,
          check_in_id: note.check_in_id,
          author: {
            id: note.author.id,
            name: note.author.name
          },
          content: note.content,
          privacy: note.privacy,
          category_id: note.category_id,
          tags: note.tags,
          created_at: note.created_at,
          updated_at: note.updated_at
        }
      end

      def serialize_detailed_resource(note)
        serialize_resource(note).merge(
          category_name: note.category&.name,
          word_count: note.word_count,
          reading_time: note.reading_time_minutes,
          published_at: note.published_at,
          first_shared_at: note.first_shared_at,
          can_edit: note.can_be_edited_by?(current_user)
        )
      end

      def serialize_collection(notes)
        notes.map { |note| serialize_resource(note) }
      end
    end
  end
end