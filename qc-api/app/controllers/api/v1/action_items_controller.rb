module Api
  module V1
    class ActionItemsController < Api::BaseController
      before_action :set_action_item, only: [:show, :update, :destroy, :complete, :reopen]
      before_action :authorize_action_item_access!, only: [:show, :update, :destroy, :complete, :reopen]

      # GET /api/v1/action_items
      def index
        @action_items = accessible_action_items
                       .includes(:assigned_to, :created_by, :check_in)
                       .order(priority: :desc, due_date: :asc)
                       .page(params[:page])
                       .per(params[:per_page] || 20)

        @action_items = filter_action_items(@action_items)
        render_paginated(@action_items, ActionItemSerializer)
      end

      # GET /api/v1/action_items/:id
      def show
        render_success(serialize_resource(@action_item))
      end

      # POST /api/v1/action_items
      def create
        @action_item = ActionItem.new(action_item_params)
        @action_item.created_by = current_user
        @action_item.assigned_to ||= current_user

        if @action_item.save
          render_created(serialize_resource(@action_item))
        else
          render_unprocessable_entity(@action_item.errors.full_messages)
        end
      end

      # PATCH/PUT /api/v1/action_items/:id
      def update
        if @action_item.update(action_item_params)
          render_success(serialize_resource(@action_item))
        else
          render_unprocessable_entity(@action_item.errors.full_messages)
        end
      end

      # DELETE /api/v1/action_items/:id
      def destroy
        @action_item.destroy
        render_destroyed
      end

      # POST /api/v1/action_items/:id/complete
      def complete
        @action_item.completed = true
        @action_item.completed_at = Time.current

        if @action_item.save
          render_success(serialize_resource(@action_item))
        else
          render_unprocessable_entity(@action_item.errors.full_messages)
        end
      end

      # POST /api/v1/action_items/:id/reopen
      def reopen
        @action_item.completed = false
        @action_item.completed_at = nil

        if @action_item.save
          render_success(serialize_resource(@action_item))
        else
          render_unprocessable_entity(@action_item.errors.full_messages)
        end
      end

      # GET /api/v1/action_items/my_items
      def my_items
        @action_items = current_user.assigned_action_items
                                   .includes(:created_by, :check_in)
                                   .where(completed: false)
                                   .order(priority: :desc, due_date: :asc)

        render_success(serialize_collection(@action_items))
      end

      private

      def set_action_item
        @action_item = ActionItem.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_not_found("Action item not found")
      end

      def authorize_action_item_access!
        unless can_manage_action_item?(@action_item)
          render_unauthorized("You don't have access to this action item")
        end
      end

      def filter_action_items(items)
        items = items.where(assigned_to_id: params[:assigned_to_id]) if params[:assigned_to_id].present?
        items = items.where(completed: params[:completed]) if params[:completed].present?
        items = items.where(priority: params[:priority]) if params[:priority].present?
        items = items.where('due_date <= ?', params[:due_before]) if params[:due_before].present?
        items
      end

      def action_item_params
        params.require(:action_item).permit(
          :title,
          :description,
          :due_date,
          :priority,
          :assigned_to_id,
          :check_in_id,
          :tags
        )
      end

      def serialize_resource(action_item)
        {
          id: action_item.id,
          title: action_item.title,
          description: action_item.description,
          due_date: action_item.due_date,
          priority: action_item.priority,
          completed: action_item.completed,
          completed_at: action_item.completed_at,
          assigned_to: {
            id: action_item.assigned_to.id,
            name: action_item.assigned_to.name
          },
          created_by: {
            id: action_item.created_by.id,
            name: action_item.created_by.name
          },
          check_in_id: action_item.check_in_id,
          tags: action_item.tags,
          created_at: action_item.created_at,
          updated_at: action_item.updated_at
        }
      end

      def serialize_collection(action_items)
        action_items.map { |item| serialize_resource(item) }
      end
    end
  end
end