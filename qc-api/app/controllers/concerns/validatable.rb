# frozen_string_literal: true

module Validatable
  extend ActiveSupport::Concern

  included do
    # Rescue from validation errors globally
    rescue_from ValidationError do |exception|
      render_validation_error(exception)
    end

    rescue_from ActionController::ParameterMissing do |exception|
      render_validation_error(
        ValidationError.new(["Required parameter missing: #{exception.param}"])
      )
    end

    rescue_from ActiveRecord::RecordInvalid do |exception|
      errors = exception.record.errors.full_messages
      render_validation_error(ValidationError.new(errors))
    end
  end

  # Instance methods for validation
  def validate_params_with!(validator_class, params = nil)
    params ||= request_params
    validator_class.validate_params!(params)
  end

  def validate_params(validator_class, params = nil)
    params ||= request_params
    validator = validator_class.validate_params(params)

    if validator.invalid?
      render_validation_error(ValidationError.new(validator.errors.full_messages))
      false
    else
      true
    end
  end

  # Strong parameters helpers
  def permit_params(*keys, **nested_keys)
    params.permit(*keys, **nested_keys)
  end

  def require_params(key)
    params.require(key)
  rescue ActionController::ParameterMissing => e
    raise ValidationError.new(["Required parameter missing: #{key}"])
  end

  # Validation helpers for common patterns
  def validate_uuid!(value, field_name = 'ID')
    uuid_regex = /\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i

    unless value.to_s.match?(uuid_regex)
      raise ValidationError.new(["#{field_name} must be a valid UUID"])
    end

    value
  end

  def validate_date_range!(from_date, to_date)
    errors = []

    if from_date.present?
      begin
        from = Date.parse(from_date.to_s)
      rescue ArgumentError
        errors << "Invalid from_date format. Use YYYY-MM-DD"
      end
    end

    if to_date.present?
      begin
        to = Date.parse(to_date.to_s)
      rescue ArgumentError
        errors << "Invalid to_date format. Use YYYY-MM-DD"
      end
    end

    if from && to && from > to
      errors << "from_date cannot be after to_date"
    end

    raise ValidationError.new(errors) if errors.any?

    [from, to]
  end

  def validate_pagination_params!
    page = (params[:page] || 1).to_i
    per_page = (params[:per_page] || 25).to_i

    errors = []
    errors << "Page must be greater than 0" if page < 1
    errors << "Per page must be between 1 and 100" if per_page < 1 || per_page > 100

    raise ValidationError.new(errors) if errors.any?

    { page: page, per_page: per_page }
  end

  def validate_sort_params!(allowed_fields, default_field: 'created_at', default_direction: 'desc')
    sort_by = params[:sort_by] || default_field
    sort_direction = (params[:sort_direction] || default_direction).downcase

    errors = []

    unless allowed_fields.include?(sort_by.to_s)
      errors << "Invalid sort field. Allowed fields: #{allowed_fields.join(', ')}"
    end

    unless %w[asc desc].include?(sort_direction)
      errors << "Invalid sort direction. Use 'asc' or 'desc'"
    end

    raise ValidationError.new(errors) if errors.any?

    { sort_by: sort_by, sort_direction: sort_direction }
  end

  def validate_enum!(value, allowed_values, field_name)
    unless allowed_values.include?(value)
      raise ValidationError.new([
        "Invalid #{field_name}. Allowed values: #{allowed_values.join(', ')}"
      ])
    end

    value
  end

  def validate_array_params!(array, field_name, max_size: nil, allowed_values: nil)
    errors = []

    unless array.is_a?(Array)
      errors << "#{field_name} must be an array"
      raise ValidationError.new(errors)
    end

    if max_size && array.size > max_size
      errors << "#{field_name} cannot contain more than #{max_size} items"
    end

    if allowed_values
      invalid_values = array - allowed_values
      if invalid_values.any?
        errors << "Invalid #{field_name} values: #{invalid_values.join(', ')}"
      end
    end

    raise ValidationError.new(errors) if errors.any?

    array
  end

  def validate_email!(email)
    email_regex = /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+\z/i

    unless email.to_s.match?(email_regex)
      raise ValidationError.new(["Invalid email format"])
    end

    email
  end

  def validate_numeric_range!(value, field_name, min: nil, max: nil)
    errors = []
    numeric_value = value.to_f

    if min && numeric_value < min
      errors << "#{field_name} must be at least #{min}"
    end

    if max && numeric_value > max
      errors << "#{field_name} must be at most #{max}"
    end

    raise ValidationError.new(errors) if errors.any?

    numeric_value
  end

  private

  def request_params
    params.to_unsafe_h.except(:controller, :action, :format)
  end

  def render_validation_error(exception)
    render json: {
      error: 'Validation failed',
      message: exception.message,
      details: exception.errors,
      timestamp: Time.current.iso8601
    }, status: :unprocessable_entity
  end
end