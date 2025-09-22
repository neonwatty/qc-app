module Api
  module V1
    class UsersController < Api::BaseController
      skip_before_action :authenticate_user!, only: [:check_email]
      before_action :set_user, only: [:show, :update, :destroy, :update_love_languages]

      # GET /api/v1/users/profile
      def profile
        render_success(serialize_user(current_user))
      end

      # GET /api/v1/users/:id
      def show
        render_success(serialize_user(@user))
      end

      # PATCH/PUT /api/v1/users/:id
      def update
        # Validate update params
        validator = UserValidator.validate_params(user_update_params)

        if validator.invalid?
          render_validation_error(ValidationError.new(validator.errors.full_messages))
          return
        end

        if @user.update(user_update_params)
          render_success(serialize_user(@user))
        else
          render_unprocessable_entity(@user.errors.full_messages)
        end
      end

      # POST /api/v1/users/check_email
      def check_email
        email = params[:email]

        # Validate email format
        begin
          validate_email!(email)
        rescue ValidationError => e
          render_validation_error(e)
          return
        end

        exists = User.exists?(email: email.downcase)
        render_success({ available: !exists, email: email.downcase })
      end

      # PATCH /api/v1/users/:id/love_languages
      def update_love_languages
        # Use strong parameters with specific validation
        languages = love_language_params

        # Additional validation
        if languages[:primary] == languages[:secondary]
          raise ValidationError.new(["Primary and secondary love languages must be different"])
        end

        if @user.update(
          love_language_primary: languages[:primary],
          love_language_secondary: languages[:secondary]
        )
          render_success({
            message: "Love languages updated successfully",
            love_language_primary: @user.love_language_primary,
            love_language_secondary: @user.love_language_secondary
          })
        else
          render_unprocessable_entity(@user.errors.full_messages)
        end
      end

      # DELETE /api/v1/users/:id
      def destroy
        # Soft delete to preserve data integrity
        if @user.update(deleted_at: Time.current)
          render_success({ message: "Account scheduled for deletion" })
        else
          render_unprocessable_entity(@user.errors.full_messages)
        end
      end

      private

      def set_user
        @user = User.find(params[:id])

        # Ensure users can only update their own profile
        unless @user == current_user || current_user.admin?
          render_unauthorized("You can only update your own profile")
        end
      rescue ActiveRecord::RecordNotFound
        render_not_found("User not found")
      end

      # Strong parameters for user updates
      def user_update_params
        params.require(:user).permit(
          :name,
          :avatar_url,
          :time_zone,
          :notification_preferences => {},
          :preferences => {}
        )
      end

      # Strong parameters for love languages
      def love_language_params
        params.require(:love_languages).permit(:primary, :secondary).tap do |languages|
          validate_enum!(languages[:primary], LoveLanguage::TYPES, "primary love language")
          validate_enum!(languages[:secondary], LoveLanguage::TYPES, "secondary love language")
        end
      end

      def serialize_user(user)
        UserSerializer.new(user, params: { current_user: current_user }).serializable_hash
      end
    end
  end
end