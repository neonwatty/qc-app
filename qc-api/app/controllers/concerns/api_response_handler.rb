module ApiResponseHandler
  extend ActiveSupport::Concern

  included do
    rescue_from ValidationError, with: :render_validation_error
    rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
    rescue_from ActiveRecord::RecordInvalid, with: :render_record_invalid
    rescue_from ActionController::ParameterMissing, with: :render_parameter_missing
  end

  private

  def render_success(data, serializer: nil, status: :ok, meta: {})
    if serializer
      response_data = if data.respond_to?(:each)
        serializer.new(data, meta: meta).serializable_hash
      else
        serializer.new(data).serializable_hash
      end
    else
      response_data = { data: data }
    end

    response_data[:meta] = meta unless meta.empty?
    render json: response_data, status: status
  end

  def render_error(message, status: :unprocessable_entity, errors: nil)
    response = {
      error: {
        message: message,
        status: status
      }
    }
    response[:error][:details] = errors if errors
    render json: response, status: status
  end

  def render_validation_error(exception)
    render_error(
      'Validation failed',
      status: :unprocessable_entity,
      errors: exception.errors
    )
  end

  def render_not_found(exception)
    render_error(
      exception.message || 'Record not found',
      status: :not_found
    )
  end

  def render_record_invalid(exception)
    render_error(
      'Record validation failed',
      status: :unprocessable_entity,
      errors: exception.record.errors.full_messages
    )
  end

  def render_parameter_missing(exception)
    render_error(
      "Required parameter missing: #{exception.param}",
      status: :bad_request
    )
  end

  def validate_with(validator_class, params = nil)
    params ||= request.params
    validator_class.validate_params!(params)
  end

  def paginate(scope, per_page: 20)
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || per_page
    per_page = [per_page, 100].min # Max 100 items per page

    paginated = scope.limit(per_page).offset((page - 1) * per_page)

    {
      records: paginated,
      meta: {
        current_page: page,
        per_page: per_page,
        total_count: scope.count,
        total_pages: (scope.count.to_f / per_page).ceil
      }
    }
  end
end