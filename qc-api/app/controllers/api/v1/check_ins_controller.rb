module Api
  module V1
    class CheckInsController < Api::BaseController
      before_action :set_couple
      before_action :set_check_in, only: [:show, :update, :destroy, :complete]
      before_action :authorize_couple_access!

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
        @check_in = @couple.check_ins.build(check_in_params)
        @check_in.status = 'preparing'
        @check_in.started_at = Time.current

        if @check_in.save
          render_created(serialize_resource(@check_in))
        else
          render_unprocessable_entity(@check_in.errors.full_messages)
        end
      end

      # PATCH/PUT /api/v1/couples/:couple_id/check_ins/:id
      def update
        if @check_in.update(check_in_params)
          render_success(serialize_resource(@check_in))
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
        @check_in.status = 'completed'
        @check_in.completed_at = Time.current

        if @check_in.save
          render_success(serialize_resource(@check_in))
        else
          render_unprocessable_entity(@check_in.errors.full_messages)
        end
      end

      # GET /api/v1/couples/:couple_id/check_ins/current
      def current
        @check_in = @couple.check_ins
                          .where(status: ['preparing', 'in-progress', 'reviewing'])
                          .order(created_at: :desc)
                          .first

        if @check_in
          render_success(serialize_resource(@check_in))
        else
          render_not_found("No active check-in found")
        end
      end

      private

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
          :metadata
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

      def serialize_collection(check_ins)
        check_ins.map { |check_in| serialize_resource(check_in) }
      end
    end
  end
end