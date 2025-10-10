module Api
  module Auth
    class SessionsController < Devise::SessionsController
      respond_to :json
      skip_before_action :authenticate_user!, only: [:create, :refresh]
      before_action :ensure_params_exist, only: [:create]

      # POST /api/auth/sign_in
      def create
        Rails.logger.info "=== SessionsController#create called ==="
        Rails.logger.info "Params: #{params.inspect}"
        Rails.logger.info "User params present: #{params[:user].present?}"

        # Find user by email
        user = User.find_by(email: params[:user][:email])

        # Validate password
        if user && user.valid_password?(params[:user][:password])
          self.resource = user
          # Don't use sign_in for API-only JWT auth (no sessions)
        else
          render json: {
            status: { code: 401, message: "Invalid credentials." },
            errors: ["Email or password is incorrect"]
          }, status: :unauthorized
          return
        end

        if resource
          # Generate JWT access token
          jwt_payload = resource.jwt_payload
          access_token = JWT.encode(jwt_payload, Rails.application.config.jwt.secret_key, 'HS256')

          # Generate refresh token
          refresh_token = resource.generate_refresh_token

          # Include couple information if user belongs to one
          couple_data = if resource.current_couple
            CoupleSerializer.new(resource.current_couple).serializable_hash[:data][:attributes]
          end

          # Add JWT to Authorization header
          response.headers['Authorization'] = "Bearer #{access_token}"

          render json: {
            status: { code: 200, message: "Logged in successfully." },
            data: {
              user: UserSerializer.new(resource).serializable_hash[:data][:attributes],
              couple: couple_data,
              refresh_token: refresh_token
            }
          }, status: :ok
        end
      rescue => e
        render_error_response(e)
      end

      # DELETE /api/auth/sign_out
      def destroy
        if current_user
          # Revoke current JWT token if using denylist
          revoke_jwt_token

          sign_out(current_user)

          render json: {
            status: { code: 200, message: "Logged out successfully." }
          }, status: :ok
        else
          render json: {
            status: { code: 404, message: "No active session found." }
          }, status: :not_found
        end
      end

      # POST /api/auth/refresh
      def refresh
        refresh_token = request.headers['X-Refresh-Token']

        if refresh_token.blank?
          render json: {
            status: { code: 401, message: "Refresh token missing." },
            errors: ["X-Refresh-Token header is required"]
          }, status: :unauthorized
          return
        end

        user = User.from_refresh_token(refresh_token)

        if user
          # Generate new tokens
          token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
          new_refresh_token = user.generate_refresh_token

          render json: {
            status: { code: 200, message: "Token refreshed successfully." },
            data: {
              user: UserSerializer.new(user).serializable_hash[:data][:attributes],
              token: token,
              refresh_token: new_refresh_token
            }
          }, status: :ok
        else
          render json: {
            status: { code: 401, message: "Invalid or expired refresh token." },
            errors: ["The provided refresh token is invalid or has expired"]
          }, status: :unauthorized
        end
      rescue => e
        render json: {
          status: { code: 500, message: "Token refresh failed." },
          errors: [e.message]
        }, status: :internal_server_error
      end

      private

      def ensure_params_exist
        return if params[:user].present?

        render json: {
          status: { code: 400, message: "Missing user parameter." },
          errors: ["The request must contain the user parameter with email and password"]
        }, status: :bad_request
      end

      def respond_with(resource, _opts = {})
        # This method is called by Devise after successful authentication
        # But we handle the response in the create action directly
      end

      def respond_to_on_destroy
        # This method is called by Devise after sign out
        # But we handle the response in the destroy action directly
      end

      def render_error_response(exception)
        if exception.message.include?("Invalid Email or password")
          render json: {
            status: { code: 401, message: "Invalid credentials." },
            errors: ["Email or password is incorrect"]
          }, status: :unauthorized
        elsif exception.message.include?("locked")
          render json: {
            status: { code: 423, message: "Account locked." },
            errors: ["Your account has been locked due to too many failed attempts"]
          }, status: :locked
        else
          render json: {
            status: { code: 401, message: "Authentication failed." },
            errors: [exception.message]
          }, status: :unauthorized
        end
      end

      def revoke_jwt_token
        # Get the JWT token from the Authorization header
        token = request.headers['Authorization']&.split(' ')&.last
        return unless token

        # Decode the token to get the jti
        begin
          payload = JWT.decode(token, Rails.application.config.jwt.secret_key, false).first
          jti = payload['jti']
          exp = payload['exp']

          # Add to denylist if using JwtDenylist
          JwtDenylist.revoke_token(jti, Time.at(exp)) if jti && exp
        rescue JWT::DecodeError
          # Token is invalid, no need to revoke
        end
      end
    end
  end
end
