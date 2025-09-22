module Authenticatable
  extend ActiveSupport::Concern

  included do
    # Make helper methods available to views if needed
    helper_method :current_user, :current_couple, :logged_in? if respond_to?(:helper_method)
  end

  # Authentication helpers

  def current_user
    # Use Devise's current_user if available
    @current_user ||= warden.authenticate(scope: :user) if warden
  end

  def current_couple
    # Cache the current couple for the request
    @current_couple ||= begin
      if params[:couple_id]
        # If couple_id is in params, verify user has access
        couple = Couple.find_by(id: params[:couple_id])
        couple if couple && user_belongs_to_couple?(couple)
      elsif current_user
        # Otherwise, use user's primary couple
        current_user.current_couple
      end
    end
  end

  def logged_in?
    current_user.present?
  end

  def authenticate_user!
    unless logged_in?
      render_unauthenticated
    end
  end

  # Couple-based authentication

  def authenticate_couple_member!
    authenticate_user!
    return unless logged_in?

    unless current_couple && user_belongs_to_couple?(current_couple)
      render_unauthorized("You must be a member of this couple")
    end
  end

  def ensure_couple_context!
    unless current_couple
      render_bad_request("Couple context required")
    end
  end

  # Set couple context from params
  def set_couple
    @couple = current_user.couples.find(params[:couple_id])
  rescue ActiveRecord::RecordNotFound
    render_not_found("Couple not found")
  end

  # Ensure resource belongs to current couple
  def ensure_couple_resource!(resource)
    return if resource.nil?

    couple_id = extract_resource_couple_id(resource)
    
    unless couple_id && current_user.couples.exists?(id: couple_id)
      render_unauthorized("Resource does not belong to your couple")
    end
  end

  private

  def user_belongs_to_couple?(couple)
    return false unless current_user && couple
    current_user.couples.include?(couple)
  end

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

  def render_unauthenticated(message = "Authentication required")
    render json: {
      error: message,
      status: 401
    }, status: :unauthorized
  end

  def render_unauthorized(message = "Unauthorized access")
    render json: {
      error: message,
      status: 403
    }, status: :forbidden
  end

  def render_bad_request(message = "Bad request")
    render json: {
      error: message,
      status: 400
    }, status: :bad_request
  end

  def render_not_found(message = "Resource not found")
    render json: {
      error: message,
      status: 404
    }, status: :not_found
  end
end