module Api
  module V1
    class CategoriesController < Api::BaseController
      before_action :set_couple, except: [:system]
      before_action :set_category, only: [:show, :update, :destroy, :add_prompt, :remove_prompt, :reorder]
      before_action :authorize_couple_access!, except: [:system]
      before_action :ensure_custom_category!, only: [:update, :destroy]

      # GET /api/v1/couples/:couple_id/categories
      def index
        # Include both system and couple-specific categories
        system_cats = Category.system_categories.ordered
        couple_cats = @couple.categories.includes(:custom_prompts).ordered

        @categories = (system_cats + couple_cats).uniq

        render_success({
          system: serialize_collection(system_cats),
          custom: serialize_collection(couple_cats)
        })
      end

      # GET /api/v1/couples/:couple_id/categories/:id
      def show
        render_success(serialize_resource(@category))
      end

      # POST /api/v1/couples/:couple_id/categories
      def create
        @category = @couple.categories.build(category_params)
        @category.is_custom = true
        @category.order = @couple.categories.maximum(:order).to_i + 1

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
        @category.destroy
        render_destroyed
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
        system_cats = Category.system_categories.where(is_active: true).ordered
        couple_cats = @couple.categories.where(is_active: true).includes(:custom_prompts).ordered

        @categories = (system_cats + couple_cats).uniq

        render_success(serialize_collection(@categories))
      end

      # GET /api/v1/categories/system
      def system
        @categories = Category.system_categories.ordered
        render_success(serialize_collection(@categories))
      end

      # POST /api/v1/couples/:couple_id/categories/:id/prompts
      def add_prompt
        prompt = @category.custom_prompts.build(
          couple: @couple,
          content: params[:prompt],
          order: @category.custom_prompts.maximum(:order).to_i + 1
        )

        if prompt.save
          render_created(serialize_prompt(prompt))
        else
          render_unprocessable_entity(prompt.errors.full_messages)
        end
      end

      # DELETE /api/v1/couples/:couple_id/categories/:id/prompts/:prompt_id
      def remove_prompt
        prompt = @category.custom_prompts.find_by(id: params[:prompt_id], couple: @couple)

        if prompt
          prompt.destroy
          render_destroyed
        else
          render_not_found("Prompt not found")
        end
      end

      # PUT /api/v1/couples/:couple_id/categories/:id/reorder
      def reorder
        if params[:order].present? && params[:order].is_a?(Array)
          @category.custom_prompts.where(couple: @couple).each do |prompt|
            new_order = params[:order].index(prompt.id)
            prompt.update_column(:order, new_order) if new_order
          end
          render_success({ message: "Prompts reordered successfully" })
        else
          render_bad_request("Invalid order parameter")
        end
      end

      private

      def ensure_custom_category!
        if @category.system?
          render_bad_request("Cannot modify system categories")
        end
      end

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
          :order,
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
          order: category.order,
          is_active: category.is_active,
          is_system: category.system?,
          is_custom: category.is_custom,
          prompts: category.prompts,
          custom_prompts: category.custom_prompts.active.ordered.map { |p| serialize_prompt(p) },
          prompt_templates_count: category.prompt_templates.count,
          created_at: category.created_at,
          updated_at: category.updated_at
        }
      end

      def serialize_prompt(prompt)
        {
          id: prompt.id,
          content: prompt.content,
          order: prompt.order,
          is_active: prompt.is_active,
          created_at: prompt.created_at
        }
      end

      def serialize_collection(categories)
        categories.map { |category| serialize_resource(category) }
      end
    end
  end
end