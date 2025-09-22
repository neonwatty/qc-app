class JwtDenylist < ApplicationRecord
  include Devise::JWT::RevocationStrategies::Denylist

  self.table_name = "jwt_denylists"

  # Clean up expired tokens periodically
  def self.clean_expired
    where('exp < ?', Time.current).destroy_all
  end

  # Check if a token is revoked
  def self.token_revoked?(jti, exp_time = nil)
    return false if jti.blank?

    query = where(jti: jti)
    query = query.where('exp >= ?', exp_time) if exp_time
    query.exists?
  end

  # Revoke a token
  def self.revoke_token(jti, exp_time)
    return if jti.blank? || exp_time.blank?

    create!(jti: jti, exp: exp_time) unless token_revoked?(jti)
  end
end
