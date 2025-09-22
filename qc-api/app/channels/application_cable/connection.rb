module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
      logger.add_tags 'ActionCable', "User #{current_user.id}", current_user.email
    end

    private

    def find_verified_user
      # Try JWT token authentication first (for API clients)
      if user = find_user_from_token
        user
      # Fall back to session authentication (for web clients)
      elsif user = find_user_from_session
        user
      else
        reject_unauthorized_connection
      end
    end

    def find_user_from_token
      token = request.params[:token] || request.headers['Authorization']&.split(' ')&.last
      return nil unless token

      begin
        payload = JWT.decode(
          token,
          Rails.application.credentials.jwt_secret,
          true,
          algorithm: 'HS256'
        ).first

        User.find_by(id: payload['user_id'])
      rescue JWT::DecodeError
        nil
      end
    end

    def find_user_from_session
      # For cookie-based authentication (if using)
      if session_id = cookies.encrypted[:_qc_api_session]
        session = Session.find_by(id: session_id)
        session&.user if session&.active?
      end
    end
  end
end