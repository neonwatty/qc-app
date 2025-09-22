class ApplicationController < ActionController::API
  include Authenticatable
  include Authorization

  before_action :configure_permitted_parameters, if: :devise_controller?
  before_action :authenticate_user_from_token

  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  rescue_from ActionController::ParameterMissing, with: :render_bad_request
  rescue_from JWT::DecodeError, with: :render_unauthorized_token
  rescue_from JWT::ExpiredSignature, with: :render_expired_token

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [ :name ])
    devise_parameter_sanitizer.permit(:account_update, keys: [ :name, :avatar ])
  end

  def authenticate_user_from_token
    # Skip for devise controllers as they handle their own auth
    return if devise_controller?

    # JWT authentication is handled by devise-jwt
    # This method can be used for additional token validation if needed
  end

  # Pagination helpers
  def pagination_params
    {
      page: params[:page] || 1,
      per_page: params[:per_page] || 20
    }
  end

  def render_paginated(collection, serializer_class)
    render json: {
      data: serializer_class.new(collection).serializable_hash[:data],
      meta: {
        current_page: collection.current_page,
        total_pages: collection.total_pages,
        total_count: collection.total_count,
        per_page: collection.limit_value
      }
    }
  end

  # Error handlers
  def render_not_found(exception = nil)
    message = exception&.message || "Resource not found"
    render json: { error: message, status: 404 }, status: :not_found
  end

  def render_bad_request(exception = nil)
    message = exception&.message || "Bad request"
    render json: { error: message, status: 400 }, status: :bad_request
  end

  def render_unauthorized_token(exception = nil)
    render json: {
      error: "Invalid authentication token",
      status: 401
    }, status: :unauthorized
  end

  def render_expired_token(exception = nil)
    render json: {
      error: "Authentication token has expired",
      status: 401
    }, status: :unauthorized
  end

  def render_unprocessable_entity(errors)
    render json: {
      errors: errors,
      status: 422
    }, status: :unprocessable_entity
  end

  # Success response helpers
  def render_success(data = nil, message = "Success", status = :ok)
    response = { message: message, status: status_code(status) }
    response[:data] = data if data
    render json: response, status: status
  end

  def render_created(resource, serializer_class = nil)
    if serializer_class
      render json: serializer_class.new(resource).serializable_hash,
             status: :created
    else
      render json: resource, status: :created
    end
  end

  def render_destroyed
    head :no_content
  end

  private

  def status_code(status)
    Rack::Utils::SYMBOL_TO_STATUS_CODE[status] || 200
  end
end
