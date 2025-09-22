module Api
  module V1
    class PromptTemplatesController < Api::BaseController
      before_action :set_couple, except: [:system]
      before_action :set_prompt_template, only: [:show, :update, :destroy, :use, :duplicate]
      before_action :authorize_couple_access!, except: [:system]
      before_action :ensure_custom_template!, only: [:update, :destroy]

      # GET /api/v1/couples/:couple_id/prompt_templates
      def index
        system_templates = PromptTemplate.system_templates.includes(:category)
        couple_templates = @couple.prompt_templates.includes(:category)

        @templates = if params[:category_id].present?
                      category = Category.find(params[:category_id])
                      system_templates = system_templates.for_category(category)
                      couple_templates = couple_templates.for_category(category)
                      (system_templates + couple_templates).uniq
                    elsif params[:tags].present?
                      tags = params[:tags].split(',')
                      system_templates = system_templates.with_tags(tags)
                      couple_templates = couple_templates.with_tags(tags)
                      (system_templates + couple_templates).uniq
                    else
                      (system_templates + couple_templates).uniq
                    end

        render_success({
          system: serialize_collection(system_templates),
          custom: serialize_collection(couple_templates),
          total: @templates.count
        })
      end

      # GET /api/v1/couples/:couple_id/prompt_templates/:id
      def show
        render_success(serialize_resource(@template))
      end

      # POST /api/v1/couples/:couple_id/prompt_templates
      def create
        @template = @couple.prompt_templates.build(template_params)
        @template.is_system = false

        if @template.save
          render_created(serialize_resource(@template))
        else
          render_unprocessable_entity(@template.errors.full_messages)
        end
      end

      # PATCH/PUT /api/v1/couples/:couple_id/prompt_templates/:id
      def update
        if @template.update(template_params)
          render_success(serialize_resource(@template))
        else
          render_unprocessable_entity(@template.errors.full_messages)
        end
      end

      # DELETE /api/v1/couples/:couple_id/prompt_templates/:id
      def destroy
        @template.destroy
        render_destroyed
      end

      # GET /api/v1/prompt_templates/system
      def system
        @templates = PromptTemplate.system_templates.includes(:category)

        if params[:category_id].present?
          @templates = @templates.for_category(Category.find(params[:category_id]))
        end

        if params[:tags].present?
          @templates = @templates.with_tags(params[:tags].split(','))
        end

        render_success(serialize_collection(@templates))
      end

      # POST /api/v1/couples/:couple_id/prompt_templates/:id/use
      def use
        @template.use!

        # Create a note if requested
        if params[:create_note] == true
          check_in = @couple.check_ins.find_by(id: params[:check_in_id])
          if check_in
            note = check_in.notes.create(
              user: current_user,
              content: @template.prompts.sample || @template.title,
              category_id: @template.category_id,
              is_shared: params[:is_shared] || false
            )

            render_success({
              template: serialize_resource(@template),
              note: note.persisted? ? { id: note.id, content: note.content } : nil
            })
          else
            render_bad_request("Check-in not found")
          end
        else
          render_success(serialize_resource(@template))
        end
      end

      # POST /api/v1/couples/:couple_id/prompt_templates/:id/duplicate
      def duplicate
        new_template = @template.dup
        new_template.title = "Copy of #{@template.title}"
        new_template.couple = @couple
        new_template.is_system = false
        new_template.usage_count = 0

        if new_template.save
          render_created(serialize_resource(new_template))
        else
          render_unprocessable_entity(new_template.errors.full_messages)
        end
      end

      # GET /api/v1/couples/:couple_id/prompt_templates/popular
      def popular
        system_templates = PromptTemplate.system_templates.by_usage.limit(10)
        couple_templates = @couple.prompt_templates.by_usage.limit(10)

        render_success({
          system: serialize_collection(system_templates),
          custom: serialize_collection(couple_templates)
        })
      end

      # GET /api/v1/couples/:couple_id/prompt_templates/recent
      def recent
        @templates = @couple.prompt_templates
                           .order(created_at: :desc)
                           .limit(params[:limit] || 20)

        render_success(serialize_collection(@templates))
      end

      private

      def set_couple
        @couple = current_user.couples.find(params[:couple_id])
      rescue ActiveRecord::RecordNotFound
        render_not_found("Couple not found")
      end

      def set_prompt_template
        @template = PromptTemplate.for_couple(@couple).find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_not_found("Prompt template not found")
      end

      def authorize_couple_access!
        unless can_access_couple?(@couple)
          render_unauthorized("You don't have access to this couple")
        end
      end

      def ensure_custom_template!
        if @template.is_system
          render_bad_request("Cannot modify system templates")
        end
      end

      def template_params
        params.require(:prompt_template).permit(
          :title,
          :description,
          :category_id,
          prompts: [],
          tags: []
        )
      end

      def serialize_resource(template)
        {
          id: template.id,
          title: template.title,
          description: template.description,
          category_id: template.category_id,
          category_name: template.category&.name,
          couple_id: template.couple_id,
          is_system: template.is_system,
          prompts: template.prompts,
          tags: template.tags,
          usage_count: template.usage_count,
          created_at: template.created_at,
          updated_at: template.updated_at
        }
      end

      def serialize_collection(templates)
        templates.map { |template| serialize_resource(template) }
      end
    end
  end
end