class BaseValidator
  include ActiveModel::Model

  def self.validate_params!(params)
    validator = new(params)
    if validator.invalid?
      raise ValidationError.new(validator.errors.full_messages)
    end
    validator
  end

  def self.validate_params(params)
    validator = new(params)
    validator.valid?
    validator
  end
end

class ValidationError < StandardError
  attr_reader :errors

  def initialize(errors)
    @errors = errors
    super(errors.to_sentence)
  end

  def to_json
    {
      error: 'Validation failed',
      details: @errors
    }.to_json
  end
end