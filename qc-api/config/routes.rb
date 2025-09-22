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
          end
          collection do
            get :current
          end
        end

        resources :categories do
          member do
            post :toggle
          end
          collection do
            get :active
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
        resources :notes
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
