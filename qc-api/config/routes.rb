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

    # API routes will go here
    resources :couples, only: [ :show, :create, :update ] do
      member do
        post :add_partner
        delete :remove_partner
      end
    end

    resources :users, only: [ :show, :update ] do
      member do
        get :partner
      end
    end
  end

  # Root route for API
  root to: proc { [ 200, { "Content-Type" => "application/json" }, [ '{ "status": "ok", "message": "QC API is running" }' ] ] }
end
