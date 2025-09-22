module Api
  module V1
    class CategoriesController < Api::BaseController
      before_action :set_couple
      before_action :set_category, only: [:show, :update, :destroy]
      before_action :authorize_couple_access!

      # GET /api/v1/couples/:couple_id/categories
      def index
        @categories = @couple.categories
                            .includes(:custom_prompts)
                            .order(is_active: :desc, name: :asc)

        render_success(serialize_collection(@categories))
      end

      # GET /api/v1/couples/:couple_id/categories/:id
      def show
        render_success(serialize_resource(@category))
      end

      # POST /api/v1/couples/:couple_id/categories
      def create
        @category = @couple.categories.build(category_params)

        if @category.save
          render_created(serialize_resource(@category))
        else
          render_unprocessable_entity(@category.errors.full_messages)
        end
      end

      # PATCH/PUT /api/v1/couples/:couple_id/categories/:id
      def update
        if @category.update(category_params)
          render_success(serialize_resource(@category))
        else
          render_unprocessable_entity(@category.errors.full_messages)
        end
      end

      # DELETE /api/v1/couples/:couple_id/categories/:id
      def destroy
        if @category.is_default?
          render_bad_request("Cannot delete default categories")
        else
          @category.destroy
          render_destroyed
        end
      end

      # POST /api/v1/couples/:couple_id/categories/:id/toggle
      def toggle
        set_category
        @category.is_active = !@category.is_active

        if @category.save
          render_success(serialize_resource(@category))
        else
          render_unprocessable_entity(@category.errors.full_messages)
        end
      end

      # GET /api/v1/couples/:couple_id/categories/active
      def active
        @categories = @couple.categories
                            .where(is_active: true)
                            .includes(:custom_prompts)
                            .order(:name)

        render_success(serialize_collection(@categories))
      end

      private

      def set_couple
        @couple = current_user.couples.find(params[:couple_id])
      rescue ActiveRecord::RecordNotFound
        render_not_found("Couple not found")
      end

      def set_category
        @category = @couple.categories.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_not_found("Category not found")
      end

      def authorize_couple_access!
        unless can_access_couple?(@couple)
          render_unauthorized("You don't have access to this couple")
        end
      end

      def category_params
        params.require(:category).permit(
          :name,
          :description,
          :icon,
          :color,
          :is_active,
          prompts: []
        )
      end

      def serialize_resource(category)
        {
          id: category.id,
          couple_id: category.couple_id,
          name: category.name,
          description: category.description,
          icon: category.icon,
          color: category.color,
          is_active: category.is_active,
          is_default: category.is_default,
          prompts: category.prompts,
          custom_prompts: category.custom_prompts.map do |prompt|
            {
              id: prompt.id,
              text: prompt.text,
              is_active: prompt.is_active
            }
          end,
          created_at: category.created_at,
          updated_at: category.updated_at
        }
      end

      def serialize_collection(categories)
        categories.map { |category| serialize_resource(category) }
      end
    end
  end
end