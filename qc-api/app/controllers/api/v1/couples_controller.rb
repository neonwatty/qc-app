module Api
  module V1
    class CouplesController < Api::BaseController
      before_action :set_couple, only: [:show, :update, :destroy]
      before_action :authorize_couple_access!, only: [:show, :update, :destroy]

      # GET /api/v1/couples
      def index
        @couples = current_user.couples.includes(:users)
        render_success(serialize_collection(@couples))
      end

      # GET /api/v1/couples/:id
      def show
        render_success(serialize_resource(@couple))
      end

      # POST /api/v1/couples
      def create
        @couple = Couple.new(couple_params)
        
        if @couple.save
          @couple.users << current_user
          render_created(serialize_resource(@couple))
        else
          render_unprocessable_entity(@couple.errors.full_messages)
        end
      end

      # PATCH/PUT /api/v1/couples/:id
      def update
        if @couple.update(couple_params)
          render_success(serialize_resource(@couple))
        else
          render_unprocessable_entity(@couple.errors.full_messages)
        end
      end

      # DELETE /api/v1/couples/:id
      def destroy
        @couple.destroy
        render_destroyed
      end

      # POST /api/v1/couples/:id/add_partner
      def add_partner
        set_couple
        partner = User.find_by(email: params[:partner_email])

        if partner.nil?
          render_not_found("User not found")
        elsif @couple.users.include?(partner)
          render_bad_request("User is already a partner")
        else
          @couple.users << partner
          render_success(serialize_resource(@couple))
        end
      end

      # DELETE /api/v1/couples/:id/remove_partner/:partner_id
      def remove_partner
        set_couple
        partner = @couple.users.find(params[:partner_id])

        if partner == current_user
          render_bad_request("You cannot remove yourself")
        else
          @couple.users.delete(partner)
          render_success(serialize_resource(@couple))
        end
      end

      private

      def set_couple
        @couple = current_user.couples.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_not_found("Couple not found")
      end

      def authorize_couple_access!
        unless can_access_couple?(@couple)
          render_unauthorized("You don't have access to this couple")
        end
      end

      def couple_params
        params.require(:couple).permit(:name, :check_in_frequency, :anniversary, :timezone)
      end

      def serialize_resource(couple)
        {
          id: couple.id,
          name: couple.name,
          check_in_frequency: couple.check_in_frequency,
          anniversary: couple.anniversary,
          timezone: couple.timezone,
          users: couple.users.map do |user|
            {
              id: user.id,
              name: user.name,
              email: user.email
            }
          end,
          created_at: couple.created_at,
          updated_at: couple.updated_at
        }
      end

      def serialize_collection(couples)
        couples.map { |couple| serialize_resource(couple) }
      end
    end
  end
end