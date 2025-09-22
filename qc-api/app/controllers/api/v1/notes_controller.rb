module Api
  module V1
    class NotesController < Api::BaseController
      before_action :set_check_in
      before_action :set_note, only: [:show, :update, :destroy]
      before_action :authorize_note_access!, only: [:show, :update, :destroy]

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

        if @note.save
          render_created(serialize_resource(@note))
        else
          render_unprocessable_entity(@note.errors.full_messages)
        end
      end

      # PATCH/PUT /api/v1/check_ins/:check_in_id/notes/:id
      def update
        if @note.update(note_params)
          render_success(serialize_resource(@note))
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
        @notes = Note.joins(:check_in, :author)
                    .where(check_ins: { couple_id: current_user.couple_ids })
                    .where(privacy: accessible_privacy_levels)
                    .where('notes.content ILIKE ?', "%#{params[:q]}%")
                    .order(created_at: :desc)
                    .limit(50)

        render_success(serialize_collection(@notes))
      end

      private

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
        params.require(:note).permit(:content, :privacy, :category, :tags)
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
          category: note.category,
          tags: note.tags,
          created_at: note.created_at,
          updated_at: note.updated_at
        }
      end

      def serialize_collection(notes)
        notes.map { |note| serialize_resource(note) }
      end
    end
  end
end