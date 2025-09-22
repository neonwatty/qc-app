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

        # Dashboard endpoints
        resource :dashboard, only: [:show] do
          collection do
            get :index, action: :index
            get :overview
            get :streaks
            get :activity_feed
            get :health_score
            get :insights
            get :achievements
            get :weekly_report
            get :monthly_report
            get :statistics
          end
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

        resources :session_settings do
          member do
            post :agree
            get :export_template
          end
          collection do
            get :current
            get :templates
            post :apply_template
            post :propose
            get :proposals
            get 'proposals/pending', to: 'session_settings#pending_proposals'
            post :duplicate
            get :history
            post 'proposals/expire_old', to: 'session_settings#expire_old_proposals'
          end
        end

        namespace :session_settings do
          resources :proposals, only: [] do
            member do
              post :accept, to: '/api/v1/session_settings#accept_proposal'
              post :reject, to: '/api/v1/session_settings#reject_proposal'
              post :withdraw, to: '/api/v1/session_settings#withdraw_proposal'
              post :comment, to: '/api/v1/session_settings#proposal_comments'
              get :changes, to: '/api/v1/session_settings#proposal_changes'
            end
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

      # Love Languages and Actions routes
      resources :love_languages do
        member do
          post :toggle_active
          post :mark_discussed
          put :update_importance
          post :add_example
          delete :remove_example
        end
        collection do
          get :partner_languages
          get :statistics
          post :create_defaults
          get :discoveries
        end
      end

      namespace :love_languages do
        resources :discoveries, only: [] do
          member do
            post :convert, to: '/api/v1/love_languages#convert_discovery'
            post :reject, to: '/api/v1/love_languages#reject_discovery'
          end
        end
      end

      resources :love_actions do
        member do
          post :complete
          post :plan
          post :archive
          post :unarchive
          post :mark_recurring
        end
        collection do
          get :upcoming
          get :overdue
          get :due_today
          get :partner_suggestions
          get :highly_effective
          post :batch_complete
          get :statistics
          post :generate_suggestions
        end
      end

      # Reminders routes
      resources :reminders do
        member do
          post :complete
          post :skip
          post :snooze
          post :unsnooze
          put :reschedule
        end
        collection do
          get :upcoming
          get :overdue
          get :high_priority
          post :batch_complete
          post :batch_snooze
          get :statistics
          post :create_from_template
          get :templates
        end
      end

      # Relationship Requests routes
      resources :relationship_requests do
        member do
          post :accept
          post :decline
          post :defer
          post :convert_to_reminder
          post :mark_discussed
          post :add_note
        end
        collection do
          get :inbox
          get :sent
          get :requiring_response
          get :overdue
          get :needs_attention
          get :upcoming_activities
          post :batch_accept
          get :statistics
        end
      end
    end
  end

  # Root route for API
  root to: proc { [ 200, { "Content-Type" => "application/json" }, [ '{ "status": "ok", "message": "QC API is running" }' ] ] }
end
