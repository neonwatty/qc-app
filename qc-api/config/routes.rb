Rails.application.routes.draw do
  # Health check endpoint
  get "up" => "rails/health#show", as: :rails_health_check

  # Devise routes for authentication
  devise_for :users,
             path: "api/auth",
             path_names: {
               sign_in: "sign_in",
               sign_out: "sign_out",
               registration: "sign_up"
             },
             controllers: {
               sessions: "api/auth/sessions",
               registrations: "api/auth/registrations"
             }

  namespace :api do
    # Authentication routes
    namespace :auth do
      post :refresh, to: 'sessions#refresh'
    end

    # API v1 routes
    namespace :v1 do
      resources :couples do
        member do
          post :add_partner
          delete 'remove_partner/:partner_id', to: 'couples#remove_partner'
        end

        resources :check_ins do
          member do
            post :complete
            post :start
            post :abandon
            post :move_step
            post :add_participant
            post :add_category
            get :progress
          end
          collection do
            get :current
            get :statistics
          end
        end

        resources :categories do
          member do
            post :toggle
            post :prompts, to: 'categories#add_prompt'
            delete 'prompts/:prompt_id', to: 'categories#remove_prompt'
            put :reorder
          end
          collection do
            get :active
          end
        end

        resources :prompt_templates do
          member do
            post :use
            post :duplicate
          end
          collection do
            get :popular
            get :recent
          end
        end

        resources :milestones do
          member do
            post :achieve
          end
          collection do
            get :achieved
            get :pending
            get :statistics
          end
        end
      end

      resources :check_ins, only: [] do
        resources :notes do
          member do
            post :publish
            post :make_private
            post :add_tag
            delete :remove_tag
            post :toggle_favorite
          end
          collection do
            get :by_step
            get :summary
            get :tags
            post :batch_update
            delete :batch_delete
            post :from_template
          end
        end
      end

      resources :action_items do
        member do
          post :complete
          post :reopen
        end
        collection do
          get :my_items
        end
      end

      resources :notes, only: [] do
        collection do
          get :search
          get :export
          get :favorites
        end
      end

      # System-wide resources (no couple context required)
      resources :categories, only: [] do
        collection do
          get :system, to: 'categories#system'
        end
      end

      resources :prompt_templates, only: [] do
        collection do
          get :system, to: 'prompt_templates#system'
        end
      end

      resources :users, only: [:show, :update] do
        member do
          get :partner
        end
      end
    end
  end

  # Root route for API
  root to: proc { [ 200, { "Content-Type" => "application/json" }, [ '{ "status": "ok", "message": "QC API is running" }' ] ] }
end
