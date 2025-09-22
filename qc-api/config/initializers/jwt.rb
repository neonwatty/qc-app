# JWT Configuration
# This initializer sets up JWT-related configurations from Rails credentials

module JwtConfig
  class << self
    def secret_key
      Rails.application.credentials.dig(:jwt, :secret_key) ||
        ENV.fetch("JWT_SECRET_KEY", Rails.application.credentials.secret_key_base)
    end

    def devise_secret_key
      Rails.application.credentials.dig(:jwt, :devise_secret_key) ||
        ENV.fetch("DEVISE_JWT_SECRET_KEY", secret_key)
    end

    def expiry
      expiry_value = Rails.application.credentials.dig(:jwt, :expiry) ||
                     ENV.fetch("JWT_EXPIRY", "86400")

      # Convert string duration to integer seconds if needed
      if expiry_value.is_a?(String) && expiry_value.include?(".")
        eval(expiry_value) rescue expiry_value.to_i
      else
        expiry_value.to_i
      end
    end

    def algorithm
      ENV.fetch("JWT_ALGORITHM", "HS256")
    end
  end
end

# Make JWT configuration available globally
Rails.application.config.jwt = JwtConfig