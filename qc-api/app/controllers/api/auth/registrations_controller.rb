module Api
  module Auth
    class RegistrationsController < Devise::RegistrationsController
      respond_to :json

      before_action :configure_sign_up_params, only: [ :create ]

      def create
        build_resource(sign_up_params)

        resource.save
        yield resource if block_given?

        if resource.persisted?
          if resource.active_for_authentication?
            # Skip sign_up method for API-only mode to avoid session issues
            # JWT token will be added by devise-jwt automatically in response headers
            render json: {
              status: { code: 200, message: "Signed up successfully." },
              data: UserSerializer.new(resource).serializable_hash[:data][:attributes]
            }, status: :ok
          else
            render json: {
              status: { code: 422, message: "User created but #{resource.inactive_message}" }
            }, status: :unprocessable_entity
          end
        else
          clean_up_passwords resource
          set_minimum_password_length
          render json: {
            status: { code: 422, message: "User could not be created successfully.",
                     errors: resource.errors.full_messages }
          }, status: :unprocessable_entity
        end
      end

      private

      def configure_sign_up_params
        devise_parameter_sanitizer.permit(:sign_up, keys: [ :name ])
      end

      def sign_up_params
        params.require(:user).permit(:email, :password, :password_confirmation, :name)
      end
    end
  end
end
