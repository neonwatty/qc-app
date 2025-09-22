module Api
  class BaseController < ApplicationController
    # Ensure all API endpoints require authentication
    before_action :authenticate_user!
    
    # Set couple context for endpoints that require it
    before_action :set_couple_context, if: :couple_scoped?
    
    protected

    # Determine if the current action requires couple context
    def couple_scoped?
      # Override in child controllers if needed
      params[:couple_id].present?
    end

    def set_couple_context
      @couple = current_user.couples.find_by(id: params[:couple_id])
      
      unless @couple
        render_not_found("Couple not found or access denied")
      end
    end

    # Scope resources to current couple
    def scope_to_couple(relation)
      if @couple
        relation.where(couple: @couple)
      else
        relation.none
      end
    end

    # Ensure resource belongs to accessible couples
    def authorize_resource_access!(resource)
      return if resource.nil?

      couple_id = extract_resource_couple_id(resource)
      
      unless couple_id && current_user.couples.exists?(id: couple_id)
        render_unauthorized("You don't have access to this resource")
      end
    end

    private

    def extract_resource_couple_id(resource)
      case resource
      when Couple
        resource.id
      when CheckIn, Category, Milestone, SessionSettings, Reminder
        resource.couple_id
      when Note, ActionItem
        resource.check_in&.couple_id
      else
        resource.couple_id if resource.respond_to?(:couple_id)
      end
    end
  end
end