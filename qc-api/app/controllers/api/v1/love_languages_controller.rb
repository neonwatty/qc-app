module Api
  module V1
    class LoveLanguagesController < Api::BaseController
      before_action :set_user_context
      before_action :set_love_language, only: [:show, :update, :destroy, :toggle_active, :mark_discussed, :update_importance]
      before_action :authorize_love_language_access!, only: [:show, :update, :destroy]

      # GET /api/v1/love_languages
      def index
        @languages = current_user.love_languages
                                .includes(:love_actions)
                                .by_importance

        if params[:category].present?
          @languages = @languages.by_category(params[:category])
        end

        if params[:active_only] == 'true'
          @languages = @languages.active
        end

        render_success(serialize_collection(@languages))
      end

      # GET /api/v1/love_languages/:id
      def show
        render_success(serialize_detailed_resource(@language))
      end

      # POST /api/v1/love_languages
      def create
        @language = current_user.love_languages.build(love_language_params)

        # Set couple association if privacy is couple_only
        if @language.privacy == 'couple_only'
          @language.couple = current_user.current_couple
        end

        if @language.save
          render_created(serialize_resource(@language))
        else
          render_unprocessable_entity(@language.errors.full_messages)
        end
      end

      # PATCH/PUT /api/v1/love_languages/:id
      def update
        # Update couple association if privacy changes
        if love_language_params[:privacy] == 'couple_only'
          @language.couple = current_user.current_couple
        elsif love_language_params[:privacy] != 'couple_only'
          @language.couple = nil
        end

        if @language.update(love_language_params)
          render_success(serialize_resource(@language))
        else
          render_unprocessable_entity(@language.errors.full_messages)
        end
      end

      # DELETE /api/v1/love_languages/:id
      def destroy
        if @language.category != 'custom' && LoveLanguage::DEFAULT_LOVE_LANGUAGES.keys.include?(@language.category.to_sym)
          render_bad_request("Cannot delete default love languages")
          return
        end

        @language.destroy
        render_destroyed
      end

      # POST /api/v1/love_languages/:id/toggle_active
      def toggle_active
        if @language.toggle_active!
          render_success(serialize_resource(@language))
        else
          render_unprocessable_entity(@language.errors.full_messages)
        end
      end

      # POST /api/v1/love_languages/:id/mark_discussed
      def mark_discussed
        @language.mark_discussed!
        render_success(serialize_resource(@language))
      end

      # PUT /api/v1/love_languages/:id/update_importance
      def update_importance
        importance = params[:importance]
        rank = params[:rank]

        unless LoveLanguage::IMPORTANCE_LEVELS.include?(importance)
          render_bad_request("Invalid importance level")
          return
        end

        if @language.update_importance!(importance, rank)
          render_success(serialize_resource(@language))
        else
          render_unprocessable_entity(@language.errors.full_messages)
        end
      end

      # POST /api/v1/love_languages/:id/add_example
      def add_example
        set_love_language
        example = params[:example]

        if example.blank?
          render_bad_request("Example cannot be blank")
          return
        end

        if @language.add_example(example)
          render_success(serialize_resource(@language))
        else
          render_unprocessable_entity(@language.errors.full_messages)
        end
      end

      # DELETE /api/v1/love_languages/:id/remove_example
      def remove_example
        set_love_language
        example = params[:example]

        if example.blank?
          render_bad_request("Example cannot be blank")
          return
        end

        if @language.remove_example(example)
          render_success(serialize_resource(@language))
        else
          render_unprocessable_entity(@language.errors.full_messages)
        end
      end

      # GET /api/v1/love_languages/partner
      def partner_languages
        partner = current_user.partner

        unless partner
          render_not_found("No partner found")
          return
        end

        @languages = partner.love_languages
                           .visible_to_partner
                           .active
                           .by_importance

        render_success(serialize_collection(@languages))
      end

      # GET /api/v1/love_languages/statistics
      def statistics
        stats = {
          total_languages: current_user.love_languages.count,
          active_languages: current_user.love_languages.active.count,
          custom_languages: current_user.love_languages.by_category('custom').count,
          most_discussed: most_discussed_language,
          most_effective: most_effective_language,
          completion_rates: completion_rates_by_category,
          importance_distribution: importance_distribution
        }

        render_success(stats)
      end

      # POST /api/v1/love_languages/create_defaults
      def create_defaults
        begin
          LoveLanguage.create_defaults_for_user!(current_user)
          @languages = current_user.love_languages.by_importance
          render_success({
            message: "Default love languages created",
            languages: serialize_collection(@languages)
          })
        rescue => e
          render_bad_request("Failed to create defaults: #{e.message}")
        end
      end

      # GET /api/v1/love_languages/discoveries
      def discoveries
        @discoveries = current_user.love_language_discoveries
                                  .includes(:converted_to_language)
                                  .recent

        if params[:pending_only] == 'true'
          @discoveries = @discoveries.pending_review
        end

        render_success(serialize_discoveries(@discoveries))
      end

      # POST /api/v1/love_languages/discoveries/:discovery_id/convert
      def convert_discovery
        discovery = current_user.love_language_discoveries.find(params[:discovery_id])

        if discovery.converted?
          render_bad_request("Discovery already converted")
          return
        end

        language = discovery.convert_to_language!(love_language_params)

        if language.persisted?
          render_created(serialize_resource(language))
        else
          render_unprocessable_entity(language.errors.full_messages)
        end
      end

      # POST /api/v1/love_languages/discoveries/:discovery_id/reject
      def reject_discovery
        discovery = current_user.love_language_discoveries.find(params[:discovery_id])

        if discovery.reject!
          render_success({ message: "Discovery rejected" })
        else
          render_unprocessable_entity(discovery.errors.full_messages)
        end
      end

      private

      def set_user_context
        @user = current_user
      end

      def set_love_language
        @language = current_user.love_languages.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_not_found("Love language not found")
      end

      def authorize_love_language_access!
        unless @language.user == current_user || @language.can_be_viewed_by?(current_user)
          render_unauthorized("You don't have access to this love language")
        end
      end

      def love_language_params
        params.require(:love_language).permit(
          :title,
          :description,
          :category,
          :privacy,
          :importance,
          :importance_rank,
          :is_active,
          examples: []
        )
      end

      def serialize_resource(language)
        {
          id: language.id,
          title: language.title,
          description: language.description,
          category: language.category,
          privacy: language.privacy,
          importance: language.importance,
          importance_rank: language.importance_rank,
          is_active: language.is_active,
          examples: language.examples,
          discussion_count: language.discussion_count,
          last_discussed_at: language.last_discussed_at,
          action_count: language.love_actions.count,
          completion_rate: language.average_action_completion_rate,
          created_at: language.created_at,
          updated_at: language.updated_at
        }
      end

      def serialize_detailed_resource(language)
        serialize_resource(language).merge(
          recent_actions: serialize_actions(language.love_actions.active.limit(5)),
          recent_examples: language.recent_examples,
          effectiveness_score: calculate_effectiveness_score(language)
        )
      end

      def serialize_collection(languages)
        languages.map { |language| serialize_resource(language) }
      end

      def serialize_actions(actions)
        actions.map do |action|
          {
            id: action.id,
            title: action.title,
            status: action.status,
            difficulty: action.difficulty,
            completed_count: action.completed_count,
            effectiveness_rating: action.effectiveness_rating
          }
        end
      end

      def serialize_discoveries(discoveries)
        discoveries.map do |discovery|
          {
            id: discovery.id,
            discovery: discovery.discovery,
            source: discovery.source,
            confidence_level: discovery.confidence_level,
            suggested_category: discovery.suggested_category,
            suggested_importance: discovery.suggested_importance,
            reviewed: discovery.reviewed,
            converted: discovery.converted?,
            rejected: discovery.rejected?,
            created_at: discovery.created_at
          }
        end
      end

      def most_discussed_language
        language = current_user.love_languages
                              .where.not(last_discussed_at: nil)
                              .order(discussion_count: :desc)
                              .first

        return nil unless language
        {
          id: language.id,
          title: language.title,
          discussion_count: language.discussion_count
        }
      end

      def most_effective_language
        languages_with_scores = current_user.love_languages.map do |lang|
          {
            language: lang,
            score: calculate_effectiveness_score(lang)
          }
        end

        best = languages_with_scores.max_by { |item| item[:score] }
        return nil unless best && best[:score] > 0

        {
          id: best[:language].id,
          title: best[:language].title,
          effectiveness_score: best[:score]
        }
      end

      def calculate_effectiveness_score(language)
        actions = language.love_actions.completed
        return 0 if actions.empty?

        total_score = actions.sum do |action|
          action.effectiveness_rating || 0
        end

        (total_score.to_f / actions.count).round(2)
      end

      def completion_rates_by_category
        LoveLanguage::CATEGORIES.map do |category|
          languages = current_user.love_languages.by_category(category)
          total_actions = languages.joins(:love_actions).count
          completed_actions = languages.joins(:love_actions).merge(LoveAction.completed).count

          rate = total_actions > 0 ? (completed_actions.to_f / total_actions * 100).round : 0

          {
            category: category,
            completion_rate: rate
          }
        end
      end

      def importance_distribution
        LoveLanguage::IMPORTANCE_LEVELS.map do |level|
          {
            level: level,
            count: current_user.love_languages.where(importance: level).count
          }
        end
      end
    end
  end
end