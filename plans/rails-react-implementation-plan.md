# Rails 8 + React Production Implementation Plan

## Executive Summary

This plan outlines the migration of the Quality Control (QC) relationship check-in app from a Next.js POC to a production-ready Rails 8 API backend with a separate React frontend. The architecture leverages Rails 8's latest features (Solid libraries) to eliminate Redis dependency while maintaining real-time capabilities through Action Cable. The frontend will reuse 95% of existing POC components with minimal modifications.

## Architecture Overview

### Technology Stack

#### Backend (Rails API)
- **Framework**: Rails 8.0+ (API-only mode)
- **Database**: PostgreSQL 15+
- **Real-time**: Action Cable with Solid Cable (PostgreSQL-backed)
- **Background Jobs**: Solid Queue (database-backed)
- **Caching**: Solid Cache (database-backed)
- **Authentication**: Devise with JWT (devise-jwt)
- **File Storage**: Active Storage with local disk/S3
- **Testing**: Minitest (Rails default)
- **API Format**: JSON:API specification

#### Frontend (React SPA)
- **Build Tool**: Vite 5.0+
- **Framework**: React 18+ with TypeScript
- **Routing**: React Router v6
- **State Management**: React Context + useReducer (from POC)
- **API Client**: Axios with React Query/TanStack Query
- **Real-time**: @rails/actioncable
- **Testing**: Vitest + React Testing Library
- **Styling**: Tailwind CSS (unchanged from POC)
- **UI Components**: shadcn/ui (unchanged from POC)
- **Animations**: Framer Motion (unchanged from POC)

### Deployment Architecture

```
┌─────────────────┐     ┌─────────────────┐
│  React Frontend │────▶│   Rails API     │
│   (Vercel/      │     │  (Render/       │
│    Netlify)     │     │   Railway)      │
└─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   PostgreSQL    │
                        │   Database      │
                        └─────────────────┘
```

## Phase 0: Pre-Development Setup (Day 1-2)

### Development Environment Setup

```bash
# System requirements
- Ruby 3.3+
- Rails 8.0+
- Node.js 20+
- PostgreSQL 15+
- Git

# Rails API setup
gem install rails -v "~> 8.0"
rails new qc-api \
  --api \
  --database=postgresql \
  --skip-test \
  --skip-system-test \
  --skip-action-cable false

# React Frontend setup
npm create vite@latest qc-frontend -- --template react-ts
cd qc-frontend
npm install
```

### Project Structure

```
qc-app-production/
├── qc-api/                 # Rails API backend
│   ├── app/
│   │   ├── controllers/
│   │   │   └── api/
│   │   │       └── v1/    # Versioned API endpoints
│   │   ├── models/
│   │   ├── channels/       # Action Cable channels
│   │   ├── jobs/           # Background jobs
│   │   ├── mailers/
│   │   └── serializers/    # JSON:API serializers
│   ├── config/
│   ├── db/
│   ├── test/               # Minitest files
│   └── Gemfile
│
└── qc-frontend/            # React SPA
    ├── src/
    │   ├── components/     # COPY from POC (95% reuse)
    │   ├── contexts/       # COPY from POC (modify data layer)
    │   ├── hooks/          # API integration hooks
    │   ├── lib/            # API client, utilities
    │   ├── pages/          # Route components
    │   ├── types/          # COPY from POC (100% reuse)
    │   └── test/           # Vitest test files
    ├── vite.config.ts
    └── package.json
```

## Phase 1: Backend Infrastructure (Week 1)

### 1.1 Rails API Foundation

#### Gemfile Configuration
```ruby
source "https://rubygems.org"

ruby "3.3.0"

gem "rails", "~> 8.0.0"
gem "pg", "~> 1.1"
gem "puma", ">= 5.0"
gem "bootsnap", require: false

# API & Serialization
gem "jsonapi-serializer"
gem "rack-cors"

# Authentication
gem "devise"
gem "devise-jwt"
gem "omniauth"
gem "omniauth-google-oauth2"
gem "omniauth-rails_csrf_protection"

# Rails 8 Solid Libraries (No Redis needed!)
gem "solid_cable"
gem "solid_cache"
gem "solid_queue"

# File uploads
gem "image_processing", "~> 1.2"

# Performance
gem "bullet", group: :development
gem "rack-attack"

group :development, :test do
  gem "debug"
  gem "factory_bot_rails"
  gem "faker"
  gem "dotenv-rails"
end

group :test do
  gem "minitest-reporters"
  gem "simplecov", require: false
  gem "mocha"
  gem "webmock"
end
```

#### Database Schema Design

```ruby
# db/migrate/001_create_initial_schema.rb
class CreateInitialSchema < ActiveRecord::Migration[7.1]
  def change
    # Users table (from src/types/index.ts:1-9)
    create_table :users, id: :uuid do |t|
      t.string :email, null: false
      t.string :name, null: false
      t.string :avatar_url
      t.string :timezone, default: "UTC"
      t.jsonb :preferences, default: {}
      t.timestamps

      t.index :email, unique: true
    end

    # Couples table (from src/types/index.ts:202-220)
    create_table :couples, id: :uuid do |t|
      t.string :name
      t.date :anniversary_date
      t.jsonb :shared_goals, default: []
      t.jsonb :love_languages, default: {}
      t.string :status, default: "active"
      t.timestamps
    end

    # Couple memberships (join table)
    create_table :couple_memberships, id: :uuid do |t|
      t.references :user, type: :uuid, foreign_key: true
      t.references :couple, type: :uuid, foreign_key: true
      t.string :role, default: "partner"
      t.string :invitation_status, default: "accepted"
      t.string :invitation_code
      t.timestamps

      t.index [:user_id, :couple_id], unique: true
      t.index :invitation_code, unique: true
    end

    # Check-in sessions (from src/types/index.ts:124-147)
    create_table :check_ins, id: :uuid do |t|
      t.references :couple, type: :uuid, foreign_key: true
      t.datetime :started_at, null: false
      t.datetime :completed_at
      t.string :status, default: "in_progress"
      t.integer :current_step, default: 0
      t.jsonb :categories, default: []
      t.jsonb :discussion_points, default: {}
      t.jsonb :session_settings, default: {}
      t.jsonb :bookend_data, default: {}
      t.integer :duration_minutes
      t.timestamps

      t.index :status
      t.index [:couple_id, :started_at]
    end

    # Notes (from src/types/index.ts:40-57)
    create_table :notes, id: :uuid do |t|
      t.references :user, type: :uuid, foreign_key: true
      t.references :check_in, type: :uuid, foreign_key: true
      t.text :content, null: false
      t.string :privacy_level, default: "private"
      t.string :category
      t.jsonb :tags, default: []
      t.boolean :flagged, default: false
      t.string :flag_reason
      t.timestamps

      t.index :privacy_level
      t.index [:user_id, :created_at]
      t.index :check_in_id
    end

    # Action items (from src/types/index.ts:58-67)
    create_table :action_items, id: :uuid do |t|
      t.references :check_in, type: :uuid, foreign_key: true
      t.references :assigned_to, type: :uuid, foreign_key: { to_table: :users }
      t.references :created_by, type: :uuid, foreign_key: { to_table: :users }
      t.string :title, null: false
      t.text :description
      t.date :due_date
      t.string :priority, default: "medium"
      t.string :status, default: "pending"
      t.datetime :completed_at
      t.timestamps

      t.index :status
      t.index [:assigned_to_id, :status]
    end

    # Reminders (from src/types/index.ts:68-97)
    create_table :reminders, id: :uuid do |t|
      t.references :couple, type: :uuid, foreign_key: true
      t.references :created_by, type: :uuid, foreign_key: { to_table: :users }
      t.string :reminder_type, null: false
      t.string :frequency
      t.jsonb :schedule, default: {}
      t.string :message
      t.boolean :active, default: true
      t.datetime :next_reminder_at
      t.datetime :last_sent_at
      t.timestamps

      t.index :next_reminder_at
      t.index [:couple_id, :active]
    end

    # Milestones (from src/types/index.ts:221-241)
    create_table :milestones, id: :uuid do |t|
      t.references :couple, type: :uuid, foreign_key: true
      t.string :title, null: false
      t.text :description
      t.date :achieved_on
      t.string :category
      t.jsonb :photos, default: []
      t.jsonb :metadata, default: {}
      t.timestamps

      t.index [:couple_id, :achieved_on]
    end

    # Partner requests (from src/types/index.ts:99-122)
    create_table :partner_requests, id: :uuid do |t|
      t.references :from_user, type: :uuid, foreign_key: { to_table: :users }
      t.references :to_user, type: :uuid, foreign_key: { to_table: :users }
      t.references :couple, type: :uuid, foreign_key: true
      t.string :request_type, null: false
      t.string :title
      t.text :description
      t.string :status, default: "pending"
      t.datetime :responded_at
      t.text :response_note
      t.timestamps

      t.index [:to_user_id, :status]
      t.index [:couple_id, :created_at]
    end

    # Solid Cable tables (for Action Cable without Redis)
    create_table :solid_cable_messages, id: :uuid do |t|
      t.text :channel
      t.text :payload
      t.datetime :created_at, null: false

      t.index :created_at
      t.index [:channel, :created_at]
    end

    # Solid Cache tables (for caching without Redis)
    create_table :solid_cache_entries do |t|
      t.string :key, null: false
      t.text :value
      t.datetime :expires_at
      t.timestamps

      t.index :key, unique: true
      t.index :expires_at
    end

    # Solid Queue tables (for background jobs without Redis)
    create_table :solid_queue_jobs, id: :uuid do |t|
      t.string :queue_name, null: false
      t.string :class_name, null: false
      t.text :arguments
      t.integer :priority, default: 0
      t.string :scheduled_at
      t.string :finished_at
      t.string :error
      t.timestamps

      t.index [:queue_name, :priority, :scheduled_at]
      t.index :scheduled_at
      t.index :finished_at
    end
  end
end
```

### 1.2 Model Implementation

```ruby
# app/models/user.rb
class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable,
         :recoverable, :validatable, :trackable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  has_many :couple_memberships
  has_many :couples, through: :couple_memberships
  has_many :notes
  has_many :created_action_items, class_name: 'ActionItem', foreign_key: :created_by_id
  has_many :assigned_action_items, class_name: 'ActionItem', foreign_key: :assigned_to_id
  has_many :sent_requests, class_name: 'PartnerRequest', foreign_key: :from_user_id
  has_many :received_requests, class_name: 'PartnerRequest', foreign_key: :to_user_id

  validates :name, presence: true

  def active_couple
    couples.active.first
  end

  def partner
    active_couple&.users&.where.not(id: id)&.first
  end
end

# app/models/couple.rb
class Couple < ApplicationRecord
  has_many :couple_memberships
  has_many :users, through: :couple_memberships
  has_many :check_ins
  has_many :reminders
  has_many :milestones
  has_many :partner_requests

  scope :active, -> { where(status: 'active') }

  validates :users, length: { maximum: 2 }

  def current_check_in
    check_ins.in_progress.order(started_at: :desc).first
  end
end

# app/models/check_in.rb
class CheckIn < ApplicationRecord
  belongs_to :couple
  has_many :notes, dependent: :destroy
  has_many :action_items, dependent: :destroy

  validates :started_at, presence: true
  validates :status, inclusion: { in: %w[in_progress completed abandoned] }

  scope :in_progress, -> { where(status: 'in_progress') }
  scope :completed, -> { where(status: 'completed') }

  before_save :calculate_duration, if: :completed_at_changed?

  def complete!
    update!(status: 'completed', completed_at: Time.current)
  end

  private

  def calculate_duration
    return unless started_at && completed_at
    self.duration_minutes = ((completed_at - started_at) / 60).round
  end
end

# app/models/note.rb
class Note < ApplicationRecord
  belongs_to :user
  belongs_to :check_in, optional: true

  validates :content, presence: true
  validates :privacy_level, inclusion: { in: %w[private shared draft] }

  scope :visible_to, ->(user) {
    where(user: user).or(where(privacy_level: 'shared'))
  }

  scope :search, ->(query) {
    where("content ILIKE ?", "%#{query}%")
  }
end

# app/models/action_item.rb
class ActionItem < ApplicationRecord
  belongs_to :check_in
  belongs_to :assigned_to, class_name: 'User'
  belongs_to :created_by, class_name: 'User'

  validates :title, presence: true
  validates :priority, inclusion: { in: %w[low medium high] }
  validates :status, inclusion: { in: %w[pending in_progress completed] }

  scope :pending, -> { where(status: 'pending') }
  scope :overdue, -> { where("due_date < ? AND status != ?", Date.current, 'completed') }

  def complete!
    update!(status: 'completed', completed_at: Time.current)
  end
end
```

### 1.3 Authentication Configuration

```ruby
# config/initializers/devise.rb
Devise.setup do |config|
  config.jwt do |jwt|
    jwt.secret = Rails.application.credentials.devise_jwt_secret_key
    jwt.expiration_time = 1.day.to_i
    jwt.dispatch_requests = [
      ['POST', %r{^/api/v1/login$}]
    ]
    jwt.revocation_requests = [
      ['DELETE', %r{^/api/v1/logout$}]
    ]
  end

  config.navigational_formats = []
  config.omniauth :google_oauth2,
                  Rails.application.credentials.google[:client_id],
                  Rails.application.credentials.google[:client_secret],
                  scope: 'email,profile'
end

# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch('FRONTEND_URL', 'http://localhost:5173')

    resource '/api/*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,
      expose: ['Authorization']
  end
end
```

### 1.4 API Controllers

```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
  before_action :configure_permitted_parameters, if: :devise_controller?

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name])
    devise_parameter_sanitizer.permit(:account_update, keys: [:name, :avatar_url])
  end
end

# app/controllers/api/v1/base_controller.rb
module Api
  module V1
    class BaseController < ApplicationController
      before_action :authenticate_user!

      rescue_from ActiveRecord::RecordNotFound, with: :not_found
      rescue_from ActiveRecord::RecordInvalid, with: :unprocessable

      private

      def not_found
        render json: { error: 'Resource not found' }, status: :not_found
      end

      def unprocessable(exception)
        render json: {
          error: 'Validation failed',
          details: exception.record.errors.full_messages
        }, status: :unprocessable_entity
      end

      def current_couple
        @current_couple ||= current_user.active_couple
      end
    end
  end
end

# app/controllers/api/v1/check_ins_controller.rb
module Api
  module V1
    class CheckInsController < BaseController
      before_action :set_check_in, only: [:show, :update, :complete, :abandon]

      def index
        check_ins = current_couple.check_ins.includes(:notes, :action_items)
        render json: CheckInSerializer.new(check_ins).serializable_hash
      end

      def show
        render json: CheckInSerializer.new(
          @check_in,
          include: [:notes, :action_items]
        ).serializable_hash
      end

      def create
        check_in = current_couple.check_ins.create!(check_in_params)

        # Broadcast to partner via Action Cable
        CheckInChannel.broadcast_to(
          current_couple,
          { event: 'check_in_started', check_in: check_in.as_json }
        )

        render json: CheckInSerializer.new(check_in).serializable_hash,
               status: :created
      end

      def update
        @check_in.update!(check_in_params)

        # Sync with partner in real-time
        CheckInChannel.broadcast_to(
          current_couple,
          { event: 'check_in_updated', check_in: @check_in.as_json }
        )

        render json: CheckInSerializer.new(@check_in).serializable_hash
      end

      def complete
        @check_in.complete!

        # Create post-session jobs
        CheckInCompletionJob.perform_later(@check_in)

        render json: CheckInSerializer.new(@check_in).serializable_hash
      end

      def abandon
        @check_in.update!(status: 'abandoned')
        render json: CheckInSerializer.new(@check_in).serializable_hash
      end

      private

      def set_check_in
        @check_in = current_couple.check_ins.find(params[:id])
      end

      def check_in_params
        params.require(:check_in).permit(
          :current_step,
          :status,
          categories: [],
          discussion_points: {},
          session_settings: {},
          bookend_data: {}
        )
      end
    end
  end
end

# app/controllers/api/v1/notes_controller.rb
module Api
  module V1
    class NotesController < BaseController
      before_action :set_note, only: [:show, :update, :destroy]

      def index
        notes = Note.visible_to(current_user)
                   .includes(:user, :check_in)
                   .page(params[:page])

        render json: NoteSerializer.new(notes).serializable_hash
      end

      def search
        notes = Note.visible_to(current_user)
                   .search(params[:q])
                   .page(params[:page])

        render json: NoteSerializer.new(notes).serializable_hash
      end

      def create
        note = current_user.notes.create!(note_params)

        if note.privacy_level == 'shared' && note.check_in.present?
          NoteSyncJob.perform_later(note)
        end

        render json: NoteSerializer.new(note).serializable_hash,
               status: :created
      end

      def update
        @note.update!(note_params)
        render json: NoteSerializer.new(@note).serializable_hash
      end

      def destroy
        @note.destroy
        head :no_content
      end

      private

      def set_note
        @note = current_user.notes.find(params[:id])
      end

      def note_params
        params.require(:note).permit(
          :content,
          :privacy_level,
          :category,
          :check_in_id,
          tags: []
        )
      end
    end
  end
end
```

### 1.5 Action Cable Setup

```ruby
# app/channels/application_cable/connection.rb
module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      token = request.params[:token]
      jwt_payload = JWT.decode(token, Rails.application.credentials.devise_jwt_secret_key).first
      User.find(jwt_payload['sub'])
    rescue JWT::DecodeError
      reject_unauthorized_connection
    end
  end
end

# app/channels/check_in_channel.rb
class CheckInChannel < ApplicationCable::Channel
  def subscribed
    couple = current_user.active_couple
    stream_for couple if couple
  end

  def receive(data)
    couple = current_user.active_couple
    check_in = couple.check_ins.find(data['check_in_id'])

    # Validate user can update this check-in
    return unless check_in.status == 'in_progress'

    # Broadcast to partner
    CheckInChannel.broadcast_to(
      couple,
      {
        event: data['event'],
        data: data['payload'],
        from_user_id: current_user.id
      }
    )
  end

  def unsubscribed
    stop_all_streams
  end
end

# app/channels/presence_channel.rb
class PresenceChannel < ApplicationCable::Channel
  def subscribed
    couple = current_user.active_couple
    return unless couple

    stream_for couple

    # Notify partner of presence
    PresenceChannel.broadcast_to(
      couple,
      {
        event: 'partner_online',
        user_id: current_user.id
      }
    )
  end

  def unsubscribed
    couple = current_user.active_couple
    return unless couple

    PresenceChannel.broadcast_to(
      couple,
      {
        event: 'partner_offline',
        user_id: current_user.id
      }
    )
  end
end
```

### 1.6 Background Jobs

```ruby
# app/jobs/check_in_completion_job.rb
class CheckInCompletionJob < ApplicationJob
  queue_as :default

  def perform(check_in)
    # Generate insights from check-in
    InsightsService.new(check_in).generate

    # Schedule follow-up reminders
    ReminderScheduler.new(check_in).schedule_followups

    # Send completion email
    CheckInMailer.completion_summary(check_in).deliver_later
  end
end

# app/jobs/reminder_job.rb
class ReminderJob < ApplicationJob
  queue_as :reminders

  def perform
    Reminder.due.find_each do |reminder|
      ReminderNotificationService.new(reminder).send_notification
      reminder.update!(last_sent_at: Time.current)
      reminder.schedule_next!
    end
  end
end

# config/application.rb
config.active_job.queue_adapter = :solid_queue
```

## Phase 2: Frontend Implementation (Week 1-2)

### 2.1 React Project Setup

```bash
# Create Vite + React + TypeScript project
npm create vite@latest qc-frontend -- --template react-ts
cd qc-frontend

# Core dependencies
npm install axios @tanstack/react-query
npm install react-router-dom
npm install @rails/actioncable
npm install date-fns

# UI dependencies (same as POC)
npm install tailwindcss @tailwindcss/forms @tailwindcss/typography
npm install @radix-ui/react-* # All shadcn components
npm install framer-motion
npm install lucide-react

# Development dependencies
npm install -D @types/react @types/react-dom
npm install -D vitest @vitest/ui @testing-library/react @testing-library/user-event
npm install -D @testing-library/jest-dom jsdom
npm install -D msw @mswjs/data
npm install -D eslint prettier
```

### 2.2 Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/cable': {
        target: 'ws://localhost:3000',
        ws: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '*.config.ts',
        'src/types/',
      ],
    },
  },
})
```

### 2.3 API Client Implementation

```typescript
// src/lib/api-client.ts
import axios, { AxiosInstance, AxiosError } from 'axios'

class ApiClient {
  private client: AxiosInstance
  private token: string | null = null

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor for auth
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`
      }
      return config
    })

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          await this.refreshToken()
        }
        return Promise.reject(error)
      }
    )
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/login', { email, password })
    this.token = response.data.token
    localStorage.setItem('auth_token', this.token)
    return response.data
  }

  async refreshToken() {
    try {
      const response = await this.client.post('/refresh')
      this.token = response.data.token
      localStorage.setItem('auth_token', this.token)
    } catch {
      this.logout()
    }
  }

  logout() {
    this.token = null
    localStorage.removeItem('auth_token')
    window.location.href = '/login'
  }

  // Check-in endpoints
  checkIns = {
    list: () => this.client.get('/check_ins'),
    get: (id: string) => this.client.get(`/check_ins/${id}`),
    create: (data: any) => this.client.post('/check_ins', { check_in: data }),
    update: (id: string, data: any) =>
      this.client.patch(`/check_ins/${id}`, { check_in: data }),
    complete: (id: string) => this.client.post(`/check_ins/${id}/complete`),
    abandon: (id: string) => this.client.post(`/check_ins/${id}/abandon`),
  }

  // Notes endpoints
  notes = {
    list: (params?: any) => this.client.get('/notes', { params }),
    search: (query: string) => this.client.get('/notes/search', { params: { q: query } }),
    create: (data: any) => this.client.post('/notes', { note: data }),
    update: (id: string, data: any) => this.client.patch(`/notes/${id}`, { note: data }),
    delete: (id: string) => this.client.delete(`/notes/${id}`),
  }

  // Action items endpoints
  actionItems = {
    list: () => this.client.get('/action_items'),
    create: (data: any) => this.client.post('/action_items', { action_item: data }),
    update: (id: string, data: any) =>
      this.client.patch(`/action_items/${id}`, { action_item: data }),
    complete: (id: string) => this.client.post(`/action_items/${id}/complete`),
  }
}

export const apiClient = new ApiClient()
```

### 2.4 React Query Setup

```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
})

// src/hooks/useCheckIn.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export function useCheckIn(id: string) {
  return useQuery({
    queryKey: ['checkIn', id],
    queryFn: () => apiClient.checkIns.get(id),
    enabled: !!id,
  })
}

export function useCreateCheckIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => apiClient.checkIns.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkIns'] })
    },
  })
}

export function useUpdateCheckIn(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => apiClient.checkIns.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkIn', id] })
    },
  })
}
```

### 2.5 Action Cable Integration

```typescript
// src/lib/cable.ts
import { createConsumer } from '@rails/actioncable'

class CableManager {
  private consumer: any = null
  private subscriptions: Map<string, any> = new Map()

  connect(token: string) {
    if (this.consumer) return

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/cable'
    this.consumer = createConsumer(`${wsUrl}?token=${token}`)
  }

  disconnect() {
    if (this.consumer) {
      this.consumer.disconnect()
      this.consumer = null
      this.subscriptions.clear()
    }
  }

  subscribeToCheckIn(checkInId: string, handlers: any) {
    const key = `check_in_${checkInId}`

    if (this.subscriptions.has(key)) {
      return this.subscriptions.get(key)
    }

    const subscription = this.consumer.subscriptions.create(
      { channel: 'CheckInChannel', check_in_id: checkInId },
      {
        received: handlers.onReceived,
        connected: handlers.onConnected,
        disconnected: handlers.onDisconnected,
      }
    )

    this.subscriptions.set(key, subscription)
    return subscription
  }

  subscribeToPresence(handlers: any) {
    const key = 'presence'

    if (this.subscriptions.has(key)) {
      return this.subscriptions.get(key)
    }

    const subscription = this.consumer.subscriptions.create(
      { channel: 'PresenceChannel' },
      {
        received: handlers.onReceived,
      }
    )

    this.subscriptions.set(key, subscription)
    return subscription
  }

  unsubscribe(key: string) {
    const subscription = this.subscriptions.get(key)
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(key)
    }
  }
}

export const cableManager = new CableManager()

// src/hooks/useRealtimeCheckIn.ts
import { useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { cableManager } from '@/lib/cable'

export function useRealtimeCheckIn(checkInId: string) {
  const queryClient = useQueryClient()

  const handleReceived = useCallback((data: any) => {
    // Update local state when partner makes changes
    if (data.event === 'check_in_updated') {
      queryClient.setQueryData(['checkIn', checkInId], data.check_in)
    }
  }, [checkInId, queryClient])

  useEffect(() => {
    if (!checkInId) return

    const subscription = cableManager.subscribeToCheckIn(checkInId, {
      onReceived: handleReceived,
      onConnected: () => console.log('Connected to check-in channel'),
      onDisconnected: () => console.log('Disconnected from check-in channel'),
    })

    return () => {
      cableManager.unsubscribe(`check_in_${checkInId}`)
    }
  }, [checkInId, handleReceived])
}
```

### 2.6 Component Migration from POC

```typescript
// src/components/checkin/CheckInFlow.tsx
// COPY from POC with minimal changes
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateCheckIn, useUpdateCheckIn, useRealtimeCheckIn } from '@/hooks/checkIn'

// IMPORT ALL POC COMPONENTS - 95% unchanged
import { CategoryCard } from './CategoryCard' // From POC
import { CategoryGrid } from './CategoryGrid' // From POC
import { DiscussionView } from './DiscussionView' // From POC
import { NavigationControls } from './NavigationControls' // From POC
import { ProgressBar } from './ProgressBar' // From POC
import { SessionTimer } from './SessionTimer' // From POC
import { CompletionCelebration } from './CompletionCelebration' // From POC

export function CheckInFlow() {
  const navigate = useNavigate()
  const createCheckIn = useCreateCheckIn()
  const [checkInId, setCheckInId] = useState<string | null>(null)
  const updateCheckIn = useUpdateCheckIn(checkInId!)

  // Enable real-time sync
  useRealtimeCheckIn(checkInId!)

  // Most logic stays exactly the same as POC
  const [currentStep, setCurrentStep] = useState(0)
  const [categories, setCategories] = useState<string[]>([])
  const [notes, setNotes] = useState<Record<string, Note>>({})

  const handleStart = async () => {
    // Only change: API call instead of localStorage
    const result = await createCheckIn.mutateAsync({ categories })
    setCheckInId(result.data.id)
  }

  const handleStepComplete = async () => {
    // Only change: API call instead of localStorage
    await updateCheckIn.mutateAsync({
      current_step: currentStep + 1,
      notes,
    })
    setCurrentStep(currentStep + 1)
  }

  // Rest of the component stays exactly the same as POC!
  return (
    <div className="min-h-screen bg-background">
      <ProgressBar current={currentStep} total={6} />
      {/* All UI components from POC work unchanged */}
      {currentStep === 0 && <Welcome onStart={handleStart} />}
      {currentStep === 1 && (
        <CategoryGrid
          categories={categories}
          onChange={setCategories}
          onNext={handleStepComplete}
        />
      )}
      {/* ... rest of the flow */}
    </div>
  )
}
```

## Phase 3: Testing Implementation (Week 2)

### 3.1 Frontend Testing with Vitest

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'

// Setup MSW
export const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())

// Mock browser APIs (from POC)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
})

// src/test/mocks/handlers.ts
import { rest } from 'msw'

export const handlers = [
  rest.post('/api/v1/login', (req, res, ctx) => {
    return res(ctx.json({ token: 'mock-token', user: mockUser }))
  }),

  rest.get('/api/v1/check_ins', (req, res, ctx) => {
    return res(ctx.json({ data: mockCheckIns }))
  }),

  rest.post('/api/v1/check_ins', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({ data: mockCheckIn }))
  }),
]

// src/components/checkin/CheckInFlow.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CheckInFlow } from './CheckInFlow'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
)

describe('CheckInFlow', () => {
  it('should complete full check-in flow', async () => {
    render(<CheckInFlow />, { wrapper })

    // Start check-in
    const startButton = screen.getByText('Start Check-in')
    fireEvent.click(startButton)

    await waitFor(() => {
      expect(screen.getByText('Select Categories')).toBeInTheDocument()
    })

    // Select categories
    const categoryCard = screen.getByText('Communication')
    fireEvent.click(categoryCard)

    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    // Continue through flow...
    await waitFor(() => {
      expect(screen.getByText('Check-in Complete!')).toBeInTheDocument()
    })
  })

  it('should sync with partner in real-time', async () => {
    // Test Action Cable integration
    const { rerender } = render(<CheckInFlow />, { wrapper })

    // Simulate partner update via WebSocket
    act(() => {
      server.emit('check_in_updated', mockPartnerUpdate)
    })

    await waitFor(() => {
      expect(screen.getByText('Partner is typing...')).toBeInTheDocument()
    })
  })
})
```

### 3.2 Backend Testing with Minitest

```ruby
# test/test_helper.rb
ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "minitest/reporters"

Minitest::Reporters.use!(
  Minitest::Reporters::SpecReporter.new,
  ENV,
  Minitest.backtrace_filter
)

module ActiveSupport
  class TestCase
    parallelize(workers: :number_of_processors)
    fixtures :all

    include FactoryBot::Syntax::Methods

    def json_response
      JSON.parse(response.body, symbolize_names: true)
    end

    def auth_headers(user)
      token = Devise::JWT::TestHelpers.auth_headers({}, user)["Authorization"]
      { "Authorization" => token }
    end
  end
end

# test/models/check_in_test.rb
require "test_helper"

class CheckInTest < ActiveSupport::TestCase
  setup do
    @couple = create(:couple)
    @check_in = create(:check_in, couple: @couple)
  end

  test "should calculate duration on completion" do
    @check_in.update(
      started_at: 1.hour.ago,
      completed_at: Time.current
    )

    assert_equal 60, @check_in.duration_minutes
  end

  test "should not allow invalid status" do
    @check_in.status = "invalid"
    assert_not @check_in.valid?
    assert_includes @check_in.errors[:status], "is not included in the list"
  end

  test "should have many notes" do
    note1 = create(:note, check_in: @check_in)
    note2 = create(:note, check_in: @check_in)

    assert_includes @check_in.notes, note1
    assert_includes @check_in.notes, note2
  end

  test "complete! should update status and timestamp" do
    @check_in.complete!

    assert_equal "completed", @check_in.status
    assert_not_nil @check_in.completed_at
    assert @check_in.completed_at <= Time.current
  end
end

# test/controllers/api/v1/check_ins_controller_test.rb
require "test_helper"

class Api::V1::CheckInsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = create(:user)
    @partner = create(:user)
    @couple = create(:couple, users: [@user, @partner])
    @headers = auth_headers(@user)
  end

  test "should get index" do
    check_in1 = create(:check_in, couple: @couple)
    check_in2 = create(:check_in, couple: @couple)

    get api_v1_check_ins_url, headers: @headers, as: :json
    assert_response :success

    data = json_response[:data]
    assert_equal 2, data.length
  end

  test "should create check_in" do
    assert_difference("CheckIn.count") do
      post api_v1_check_ins_url,
        params: {
          check_in: {
            categories: ["communication", "intimacy"],
            session_settings: { duration: 30 }
          }
        },
        headers: @headers,
        as: :json
    end

    assert_response :created
    assert_equal ["communication", "intimacy"], json_response[:data][:attributes][:categories]
  end

  test "should update check_in" do
    check_in = create(:check_in, couple: @couple, current_step: 1)

    patch api_v1_check_in_url(check_in),
      params: { check_in: { current_step: 2 } },
      headers: @headers,
      as: :json

    assert_response :success
    assert_equal 2, check_in.reload.current_step
  end

  test "should complete check_in" do
    check_in = create(:check_in, couple: @couple)

    assert_enqueued_with(job: CheckInCompletionJob) do
      post complete_api_v1_check_in_url(check_in),
        headers: @headers,
        as: :json
    end

    assert_response :success
    assert_equal "completed", check_in.reload.status
    assert_not_nil check_in.completed_at
  end

  test "should not access other couple's check_ins" do
    other_couple = create(:couple)
    other_check_in = create(:check_in, couple: other_couple)

    get api_v1_check_in_url(other_check_in),
      headers: @headers,
      as: :json

    assert_response :not_found
  end

  test "should require authentication" do
    get api_v1_check_ins_url, as: :json
    assert_response :unauthorized
  end
end

# test/channels/check_in_channel_test.rb
require "test_helper"

class CheckInChannelTest < ActionCable::Channel::TestCase
  setup do
    @user = create(:user)
    @partner = create(:user)
    @couple = create(:couple, users: [@user, @partner])
    @check_in = create(:check_in, couple: @couple)
  end

  test "subscribes to couple stream" do
    stub_connection(current_user: @user)

    subscribe
    assert subscription.confirmed?
    assert_has_stream_for @couple
  end

  test "broadcasts updates to partner" do
    stub_connection(current_user: @user)
    subscribe

    assert_broadcast_on(@couple, {
      event: "note_added",
      data: { content: "Test note" },
      from_user_id: @user.id
    }) do
      perform :receive, {
        check_in_id: @check_in.id,
        event: "note_added",
        payload: { content: "Test note" }
      }
    end
  end

  test "rejects invalid check_in updates" do
    other_couple = create(:couple)
    other_check_in = create(:check_in, couple: other_couple)

    stub_connection(current_user: @user)
    subscribe

    assert_no_broadcasts do
      perform :receive, {
        check_in_id: other_check_in.id,
        event: "invalid",
        payload: {}
      }
    end
  end
end

# test/integration/complete_flow_test.rb
require "test_helper"

class CompleteFlowTest < ActionDispatch::IntegrationTest
  test "complete check_in flow from start to finish" do
    user = create(:user, password: "password123")
    partner = create(:user)
    couple = create(:couple, users: [user, partner])

    # Login
    post api_v1_login_url, params: {
      email: user.email,
      password: "password123"
    }, as: :json
    assert_response :success
    token = json_response[:token]

    headers = { "Authorization" => "Bearer #{token}" }

    # Create check-in
    post api_v1_check_ins_url,
      params: {
        check_in: {
          categories: ["communication", "goals"]
        }
      },
      headers: headers,
      as: :json
    assert_response :created
    check_in_id = json_response[:data][:id]

    # Add notes
    post api_v1_notes_url,
      params: {
        note: {
          check_in_id: check_in_id,
          content: "We need to communicate better",
          privacy_level: "shared"
        }
      },
      headers: headers,
      as: :json
    assert_response :created

    # Create action item
    post api_v1_action_items_url,
      params: {
        action_item: {
          check_in_id: check_in_id,
          title: "Schedule weekly date night",
          assigned_to_id: partner.id
        }
      },
      headers: headers,
      as: :json
    assert_response :created

    # Complete check-in
    post complete_api_v1_check_in_url(check_in_id),
      headers: headers,
      as: :json
    assert_response :success

    # Verify completion
    get api_v1_check_in_url(check_in_id),
      headers: headers,
      as: :json
    assert_response :success
    assert_equal "completed", json_response[:data][:attributes][:status]
    assert_not_nil json_response[:data][:attributes][:completed_at]
  end
end
```

## Phase 4: Deployment & Infrastructure (Week 3)

### 4.1 Docker Configuration

```dockerfile
# qc-api/Dockerfile
FROM ruby:3.3.0-alpine

RUN apk add --update --no-cache \
    build-base \
    postgresql-dev \
    git \
    tzdata \
    nodejs \
    yarn

WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle install --jobs 4 --retry 3

COPY . .

RUN rails assets:precompile

EXPOSE 3000

CMD ["rails", "server", "-b", "0.0.0.0"]

# qc-frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 4.2 Docker Compose for Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: qc_app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: qc_app_development
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  rails:
    build:
      context: ./qc-api
      dockerfile: Dockerfile.dev
    command: bash -c "rm -f tmp/pids/server.pid && bundle exec rails server -b 0.0.0.0"
    volumes:
      - ./qc-api:/app
      - bundle_cache:/usr/local/bundle
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://qc_app:${DB_PASSWORD}@postgres:5432/qc_app_development
      RAILS_ENV: development
      RAILS_MASTER_KEY: ${RAILS_MASTER_KEY}

  frontend:
    build:
      context: ./qc-frontend
      dockerfile: Dockerfile.dev
    command: npm run dev
    volumes:
      - ./qc-frontend:/app
      - node_modules:/app/node_modules
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3000/api/v1
      VITE_WS_URL: ws://localhost:3000/cable

volumes:
  postgres_data:
  bundle_cache:
  node_modules:
```

### 4.3 Production Deployment Options

#### Option A: Monorepo with Shared Hosting

```bash
# Deploy both Rails and React to same server
# Rails serves React build in production

# config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # API routes
    end
  end

  # Serve React app for all other routes
  get '*path', to: 'application#frontend', constraints: ->(req) do
    !req.xhr? && req.format.html?
  end
end

# app/controllers/application_controller.rb
def frontend
  render file: Rails.root.join('public', 'index.html')
end
```

#### Option B: Separate Deployments

**Rails API on Render/Railway:**
```yaml
# render.yaml
services:
  - type: web
    name: qc-api
    env: ruby
    buildCommand: bundle install && rails db:migrate
    startCommand: rails server
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: qc-db
          property: connectionString
      - key: RAILS_MASTER_KEY
        sync: false
```

**React on Vercel:**
```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://qc-api.railway.app/api/:path*"
    }
  ]
}
```

### 4.4 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-rails:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.3.0'
          bundler-cache: true
          working-directory: ./qc-api

      - name: Run tests
        working-directory: ./qc-api
        env:
          RAILS_ENV: test
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/qc_test
        run: |
          rails db:create db:schema:load
          rails test

      - name: Run linter
        working-directory: ./qc-api
        run: bundle exec rubocop

  test-react:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: ./qc-frontend/package-lock.json

      - name: Install dependencies
        working-directory: ./qc-frontend
        run: npm ci

      - name: Run tests
        working-directory: ./qc-frontend
        run: npm run test:run

      - name: Run linter
        working-directory: ./qc-frontend
        run: npm run lint

      - name: Build
        working-directory: ./qc-frontend
        run: npm run build

  deploy:
    needs: [test-rails, test-react]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy Rails to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}

      - name: Deploy React to Vercel
        run: |
          npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## Phase 5: Beta Launch Preparation (Week 4)

### 5.1 Monitoring & Observability

```ruby
# config/initializers/monitoring.rb
require 'datadog/statsd'

Rails.application.config.statsd = Datadog::Statsd.new('localhost', 8125)

# Track key metrics
ActiveSupport::Notifications.subscribe "process_action.action_controller" do |*args|
  event = ActiveSupport::Notifications::Event.new(*args)

  Rails.application.config.statsd.histogram(
    "rails.request.duration",
    event.duration,
    tags: ["controller:#{event.payload[:controller]}", "action:#{event.payload[:action]}"]
  )
end

# app/controllers/api/v1/base_controller.rb
around_action :track_performance

def track_performance
  start = Time.current
  yield
ensure
  duration = (Time.current - start) * 1000
  Rails.application.config.statsd.histogram(
    "api.request.duration",
    duration,
    tags: ["endpoint:#{controller_name}##{action_name}"]
  )
end
```

### 5.2 Security Hardening

```ruby
# config/initializers/rack_attack.rb
Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new

# Rate limiting
Rack::Attack.throttle("api/ip", limit: 100, period: 1.minute) do |req|
  req.ip if req.path.start_with?("/api")
end

Rack::Attack.throttle("login/email", limit: 5, period: 1.minute) do |req|
  req.params["email"] if req.path == "/api/v1/login" && req.post?
end

# config/application.rb
config.force_ssl = true
config.ssl_options = { hsts: { subdomains: true, preload: true, expires: 1.year } }
```

### 5.3 Beta Features

```ruby
# app/models/feature_flag.rb
class FeatureFlag < ApplicationRecord
  def self.enabled?(flag_name, user = nil)
    flag = find_by(name: flag_name)
    return false unless flag&.enabled

    return true unless user
    return true if flag.user_ids.empty?

    flag.user_ids.include?(user.id)
  end
end

# app/controllers/concerns/feature_flaggable.rb
module FeatureFlaggable
  extend ActiveSupport::Concern

  included do
    helper_method :feature_enabled?
  end

  def feature_enabled?(flag_name)
    FeatureFlag.enabled?(flag_name, current_user)
  end
end
```

## Migration Checklist

### Week 1: Foundation
- [ ] Set up Rails API project
- [ ] Configure PostgreSQL database
- [ ] Implement authentication with Devise-JWT
- [ ] Set up React + Vite project
- [ ] Configure CORS and API client
- [ ] Copy POC components to React project

### Week 2: Core Features
- [ ] Implement Check-in API endpoints
- [ ] Set up Action Cable for real-time
- [ ] Migrate CheckInContext to use API
- [ ] Implement Notes management
- [ ] Set up background jobs with Solid Queue
- [ ] Configure React Query for data fetching

### Week 3: Testing & Polish
- [ ] Write Minitest tests for Rails
- [ ] Write Vitest tests for React
- [ ] Set up E2E tests with Playwright
- [ ] Configure CI/CD pipeline
- [ ] Performance optimization
- [ ] Security audit

### Week 4: Deployment
- [ ] Set up production infrastructure
- [ ] Configure monitoring and alerts
- [ ] Deploy to staging environment
- [ ] Run load tests
- [ ] Beta user onboarding
- [ ] Launch beta program

## Component Reuse Summary

### Components to Copy As-Is (95%)
```
qc-frontend/src/components/
├── ui/           # ALL shadcn components
├── checkin/      # ALL check-in flow components
├── notes/        # ALL note management components
├── growth/       # ALL timeline/milestone components
├── dashboard/    # ALL dashboard widgets
├── settings/     # ALL settings panels
└── layout/       # Header, Navigation, etc.
```

### Files to Modify (5%)
```
- contexts/* → Add API calls, keep reducer logic
- hooks/* → New API integration hooks
- App.tsx → Switch to React Router
- main.tsx → Add React Query provider
```

### New Files to Create
```
- lib/api-client.ts
- lib/cable.ts
- hooks/useCheckIn.ts
- hooks/useNotes.ts
- test/setup.ts
```

## Advantages of Rails + React Architecture

1. **Clear Separation**: API can serve multiple clients (web, mobile)
2. **Rails Maturity**: Battle-tested patterns for common features
3. **No Redis Required**: Rails 8's Solid libraries eliminate dependencies
4. **Better Background Jobs**: Active Job more mature than custom Node workers
5. **Active Storage**: Superior file handling compared to Next.js
6. **Action Cable**: Simpler WebSocket implementation than Socket.io
7. **Type Safety**: Can generate TypeScript types from Rails schemas
8. **Independent Scaling**: Frontend and backend can scale separately
9. **Team Flexibility**: Frontend and backend teams can work independently
10. **Testing Clarity**: Clear boundaries make testing easier

## Estimated Timeline

- **Week 1**: Infrastructure setup (Rails API + React frontend)
- **Week 2**: Core feature implementation and API integration
- **Week 3**: Testing, optimization, and polish
- **Week 4**: Deployment and beta launch preparation

**Total: 4 weeks to production-ready beta**

This plan maintains 95% code reuse from the POC while providing a more scalable, maintainable architecture suitable for long-term production use.