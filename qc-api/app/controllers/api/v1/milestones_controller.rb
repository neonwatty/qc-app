module Api
  module V1
    class MilestonesController < Api::BaseController
      before_action :set_couple
      before_action :set_milestone, only: [:show, :update, :destroy, :achieve]
      before_action :authorize_couple_access!

      # GET /api/v1/couples/:couple_id/milestones
      def index
        @milestones = @couple.milestones
                            .includes(:milestone_achievements)
                            .order(created_at: :desc)
                            .page(params[:page])
                            .per(params[:per_page] || 20)

        @milestones = filter_milestones(@milestones)
        render_paginated(@milestones, MilestoneSerializer)
      end

      # GET /api/v1/couples/:couple_id/milestones/:id
      def show
        render_success(serialize_resource(@milestone))
      end

      # POST /api/v1/couples/:couple_id/milestones
      def create
        @milestone = @couple.milestones.build(milestone_params)

        if @milestone.save
          render_created(serialize_resource(@milestone))
        else
          render_unprocessable_entity(@milestone.errors.full_messages)
        end
      end

      # PATCH/PUT /api/v1/couples/:couple_id/milestones/:id
      def update
        if @milestone.update(milestone_params)
          render_success(serialize_resource(@milestone))
        else
          render_unprocessable_entity(@milestone.errors.full_messages)
        end
      end

      # DELETE /api/v1/couples/:couple_id/milestones/:id
      def destroy
        @milestone.destroy
        render_destroyed
      end

      # POST /api/v1/couples/:couple_id/milestones/:id/achieve
      def achieve
        achievement = @milestone.milestone_achievements.build(
          achieved_by: current_user,
          achieved_at: params[:achieved_at] || Time.current,
          notes: params[:notes]
        )

        if achievement.save
          @milestone.update(achieved_at: achievement.achieved_at)
          render_success(serialize_resource(@milestone.reload))
        else
          render_unprocessable_entity(achievement.errors.full_messages)
        end
      end

      # GET /api/v1/couples/:couple_id/milestones/achieved
      def achieved
        @milestones = @couple.milestones
                            .where.not(achieved_at: nil)
                            .includes(:milestone_achievements)
                            .order(achieved_at: :desc)

        render_success(serialize_collection(@milestones))
      end

      # GET /api/v1/couples/:couple_id/milestones/pending
      def pending
        @milestones = @couple.milestones
                            .where(achieved_at: nil)
                            .order(:target_date, :created_at)

        render_success(serialize_collection(@milestones))
      end

      # GET /api/v1/couples/:couple_id/milestones/statistics
      def statistics
        stats = {
          total_milestones: @couple.milestones.count,
          achieved_milestones: @couple.milestones.where.not(achieved_at: nil).count,
          pending_milestones: @couple.milestones.where(achieved_at: nil).count,
          achievement_rate: calculate_achievement_rate,
          recent_achievements: recent_achievements,
          categories_breakdown: categories_breakdown
        }

        render_success(stats)
      end

      private

      def set_couple
        @couple = current_user.couples.find(params[:couple_id])
      rescue ActiveRecord::RecordNotFound
        render_not_found("Couple not found")
      end

      def set_milestone
        @milestone = @couple.milestones.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_not_found("Milestone not found")
      end

      def authorize_couple_access!
        unless can_access_couple?(@couple)
          render_unauthorized("You don't have access to this couple")
        end
      end

      def filter_milestones(milestones)
        milestones = milestones.where(category: params[:category]) if params[:category].present?
        milestones = milestones.where(rarity: params[:rarity]) if params[:rarity].present?
        milestones = milestones.where('achieved_at IS NOT NULL') if params[:achieved] == 'true'
        milestones = milestones.where('achieved_at IS NULL') if params[:achieved] == 'false'
        milestones
      end

      def milestone_params
        params.require(:milestone).permit(
          :title,
          :description,
          :category,
          :target_date,
          :rarity,
          :points,
          :icon,
          :metadata
        )
      end

      def serialize_resource(milestone)
        {
          id: milestone.id,
          couple_id: milestone.couple_id,
          title: milestone.title,
          description: milestone.description,
          category: milestone.category,
          target_date: milestone.target_date,
          achieved_at: milestone.achieved_at,
          rarity: milestone.rarity,
          points: milestone.points,
          icon: milestone.icon,
          achievements: milestone.milestone_achievements.map do |achievement|
            {
              id: achievement.id,
              achieved_by: {
                id: achievement.achieved_by.id,
                name: achievement.achieved_by.name
              },
              achieved_at: achievement.achieved_at,
              notes: achievement.notes
            }
          end,
          created_at: milestone.created_at,
          updated_at: milestone.updated_at
        }
      end

      def serialize_collection(milestones)
        milestones.map { |milestone| serialize_resource(milestone) }
      end

      def calculate_achievement_rate
        total = @couple.milestones.count
        return 0 if total.zero?
        
        achieved = @couple.milestones.where.not(achieved_at: nil).count
        ((achieved.to_f / total) * 100).round(2)
      end

      def recent_achievements
        @couple.milestones
              .where.not(achieved_at: nil)
              .order(achieved_at: :desc)
              .limit(5)
              .map { |m| { id: m.id, title: m.title, achieved_at: m.achieved_at } }
      end

      def categories_breakdown
        @couple.milestones
              .group(:category)
              .count
      end
    end
  end
end