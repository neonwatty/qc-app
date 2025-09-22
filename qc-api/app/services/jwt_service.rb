require 'jwt'

class JwtService
  class << self
    def encode(payload, expiry = nil)
      expiry ||= Rails.application.config.jwt.expiry.from_now
      
      payload[:exp] = expiry.to_i
      payload[:iat] = Time.current.to_i
      payload[:jti] = SecureRandom.uuid  # Unique token ID for revocation
      
      JWT.encode(payload, secret_key, 'HS256')
    end

    def decode(token)
      decoded = JWT.decode(
        token,
        secret_key,
        true,
        {
          algorithm: 'HS256',
          verify_iat: true,
          verify_exp: true
        }
      )
      
      HashWithIndifferentAccess.new(decoded[0])
    rescue JWT::ExpiredSignature
      raise JWT::ExpiredSignature, "Token has expired"
    rescue JWT::InvalidIatError
      raise JWT::DecodeError, "Invalid token issued time"
    rescue JWT::DecodeError => e
      raise JWT::DecodeError, "Invalid token: #{e.message}"
    end

    def refresh_token(token)
      payload = decode(token)
      
      # Remove old expiry and jti
      payload.delete(:exp)
      payload.delete(:jti)
      
      # Generate new token with fresh expiry
      encode(payload)
    rescue JWT::ExpiredSignature
      # Allow refresh of recently expired tokens (within 1 hour)
      payload = decode_expired(token)
      
      if payload[:exp] > 1.hour.ago.to_i
        payload.delete(:exp)
        payload.delete(:jti)
        encode(payload)
      else
        raise JWT::ExpiredSignature, "Token expired too long ago to refresh"
      end
    end

    def decode_expired(token)
      decoded = JWT.decode(
        token,
        secret_key,
        true,
        {
          algorithm: 'HS256',
          verify_iat: true,
          verify_exp: false  # Don't verify expiry
        }
      )
      
      HashWithIndifferentAccess.new(decoded[0])
    rescue JWT::DecodeError => e
      raise JWT::DecodeError, "Invalid token: #{e.message}"
    end

    def valid?(token)
      decode(token).present?
    rescue
      false
    end

    def user_from_token(token)
      payload = decode(token)
      User.find_by(id: payload[:user_id])
    rescue
      nil
    end

    def revoke_token(token)
      # Store jti in Redis with TTL matching original expiry
      payload = decode_expired(token)
      jti = payload[:jti]
      exp = payload[:exp]

      return if jti.blank? || exp.blank?

      # Calculate remaining TTL
      ttl = exp - Time.current.to_i
      return if ttl <= 0

      # Store in Redis blacklist if available
      begin
        redis = Redis.new(url: ENV['REDIS_URL'] || 'redis://localhost:6379')
        redis.setex("jwt_blacklist:#{jti}", ttl, '1')
      rescue Redis::CannotConnectError => e
        Rails.logger.warn "Redis not available for token revocation: #{e.message}"
      end
    rescue => e
      Rails.logger.error "Failed to revoke token: #{e.message}"
    end

    def token_revoked?(token)
      payload = decode_expired(token)
      jti = payload[:jti]

      return false if jti.blank?

      begin
        redis = Redis.new(url: ENV['REDIS_URL'] || 'redis://localhost:6379')
        redis.exists?("jwt_blacklist:#{jti}")
      rescue Redis::CannotConnectError
        false # If Redis is down, allow the token
      end
    rescue
      false
    end

    private

    def secret_key
      Rails.application.config.jwt.secret_key
    end
  end
end