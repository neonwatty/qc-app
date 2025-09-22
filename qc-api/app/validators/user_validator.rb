class UserValidator < BaseValidator
  attr_accessor :email, :password, :password_confirmation, :name, :avatar_url, :love_language_primary, :love_language_secondary

  # Registration validation
  validates :email, presence: { message: "Email is required for registration" }
  validates :email, format: {
    with: /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+\z/i,
    message: "Please provide a valid email address (e.g., user@example.com)"
  }, if: -> { email.present? }

  validates :password, presence: { message: "Password is required" }, on: :create
  validates :password, length: {
    minimum: 8,
    message: "Password must be at least 8 characters long for security"
  }, if: -> { password.present? }

  validates :password_confirmation, presence: {
    message: "Please confirm your password"
  }, if: -> { password.present? }

  validates :name, presence: { message: "Please provide your name" }
  validates :name, length: {
    maximum: 100,
    message: "Name cannot exceed 100 characters"
  }, if: -> { name.present? }

  validate :password_complexity, if: -> { password.present? }
  validate :passwords_match, if: -> { password.present? && password_confirmation.present? }
  validate :valid_love_languages

  private

  def password_complexity
    unless password.match(/\A(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      errors.add(:password, "must include at least one uppercase letter, one lowercase letter, and one number")
    end
  end

  def passwords_match
    unless password == password_confirmation
      errors.add(:password_confirmation, "doesn't match the password")
    end
  end

  def valid_love_languages
    valid_languages = %w[words_of_affirmation acts_of_service receiving_gifts quality_time physical_touch]

    if love_language_primary.present? && !valid_languages.include?(love_language_primary)
      errors.add(:love_language_primary,
        "Invalid primary love language. Choose from: #{valid_languages.join(', ')}")
    end

    if love_language_secondary.present? && !valid_languages.include?(love_language_secondary)
      errors.add(:love_language_secondary,
        "Invalid secondary love language. Choose from: #{valid_languages.join(', ')}")
    end

    if love_language_primary.present? && love_language_secondary.present? &&
       love_language_primary == love_language_secondary
      errors.add(:love_language_secondary,
        "Secondary love language must be different from primary love language")
    end
  end
end