module Api
  module Auth
    class SessionsController < Devise::SessionsController
      respond_to :json
      skip_before_action :authenticate_user!, only: [:create, :refresh]

      # POST /api/auth/refresh
      def refresh
        refresh_token = request.headers['X-Refresh-Token']

        if refresh_token.blank?
          render json: {
            status: { code: 401, message: "Refresh token missing." }
          }, status: :unauthorized
          return
        end

        user = User.from_refresh_token(refresh_token)

        if user
          # Generate new access token
          token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first

          render json: {
            status: { code: 200, message: "Token refreshed successfully." },
            data: {
              user: UserSerializer.new(user).serializable_hash[:data][:attributes],
              token: token,
              refresh_token: user.generate_refresh_token
            }
          }, status: :ok
        else
          render json: {
            status: { code: 401, message: "Invalid or expired refresh token." }
          }, status: :unauthorized
        end
      end

      private

      def respond_with(resource, _opts = {})
        # Generate refresh token
        refresh_token = resource.generate_refresh_token

        render json: {
          status: { code: 200, message: "Logged in successfully." },
          data: {
            user: UserSerializer.new(resource).serializable_hash[:data][:attributes],
            refresh_token: refresh_token
          }
        }, status: :ok
      end

      def respond_to_on_destroy
        if current_user
          # Revoke refresh tokens if needed
          # This would require storing refresh token JTIs

          render json: {
            status: { code: 200, message: "Logged out successfully." }
          }, status: :ok
        else
          render json: {
            status: { code: 401, message: "Couldn't find an active session." }
          }, status: :unauthorized
        end
      end
    end
  end
end
