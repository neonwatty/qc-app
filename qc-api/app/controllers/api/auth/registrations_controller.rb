module Api
  module Auth
    class RegistrationsController < Devise::RegistrationsController
      respond_to :json

      before_action :configure_sign_up_params, only: [ :create ]

      def create
        build_resource(sign_up_params)

        ActiveRecord::Base.transaction do
          resource.save!

          # Create couple if requested
          if params[:create_couple] == true
            create_couple_for_user(resource)
          end

          # Send partner invitation if email provided
          if params[:partner_email].present?
            send_partner_invitation(resource, params[:partner_email])
          end

          yield resource if block_given?

          if resource.active_for_authentication?
            # Generate refresh token
            refresh_token = resource.generate_refresh_token

            render json: {
              status: { code: 201, message: "Account created successfully." },
              data: {
                user: UserSerializer.new(resource).serializable_hash[:data][:attributes],
                couple: resource.current_couple ? CoupleSerializer.new(resource.current_couple).serializable_hash[:data][:attributes] : nil,
                refresh_token: refresh_token
              }
            }, status: :created
          else
            render json: {
              status: { code: 422, message: "User created but #{resource.inactive_message}" }
            }, status: :unprocessable_entity
          end
        rescue ActiveRecord::RecordInvalid => e
          clean_up_passwords resource
          set_minimum_password_length
          render json: {
            status: { code: 422, message: "Registration failed." },
            errors: resource.errors.full_messages
          }, status: :unprocessable_entity
        rescue => e
          render json: {
            status: { code: 500, message: "An error occurred during registration." },
            errors: [e.message]
          }, status: :internal_server_error
        end
      end

      # Update user profile
      def update
        self.resource = resource_class.to_adapter.get!(send(:"current_#{resource_name}").to_key)

        if resource.update(account_update_params)
          render json: {
            status: { code: 200, message: "Profile updated successfully." },
            data: UserSerializer.new(resource).serializable_hash[:data][:attributes]
          }, status: :ok
        else
          render json: {
            status: { code: 422, message: "Profile update failed." },
            errors: resource.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # Delete account
      def destroy
        resource.destroy
        render json: {
          status: { code: 200, message: "Account deleted successfully." }
        }, status: :ok
      end

      private

      def create_couple_for_user(user)
        couple_name = params[:couple_name] || "#{user.name}'s Relationship"
        couple = Couple.create!(
          name: couple_name,
          check_in_frequency: params[:check_in_frequency] || 'weekly'
        )
        couple.users << user
        couple
      end

      def send_partner_invitation(user, partner_email)
        # Find or invite partner
        partner = User.find_by(email: partner_email)

        if partner
          # Create relationship request for existing user
          RelationshipRequest.create!(
            requested_by: user,
            requested_for: partner,
            couple: user.current_couple,
            message: params[:invitation_message] || "#{user.name} would like to connect with you on QC",
            status: 'pending'
          )
        else
          # In production, send invitation email to non-user
          # PartnerInvitationMailer.invite(user, partner_email).deliver_later

          # For now, log the invitation
          Rails.logger.info "Partner invitation would be sent to #{partner_email}"
        end
      end

      def configure_sign_up_params
        devise_parameter_sanitizer.permit(:sign_up, keys: [ :name ])
      end

      def sign_up_params
        params.require(:user).permit(:email, :password, :password_confirmation, :name)
      end

      def account_update_params
        params.require(:user).permit(:name, :email, :avatar)
      end
    end
  end
end
