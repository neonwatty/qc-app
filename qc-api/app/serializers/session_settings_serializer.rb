class SessionSettingsSerializer
  include JSONAPI::Serializer

  attributes :id, :name, :default_duration_minutes, :check_in_frequency,
             :reminder_time, :reminder_days, :categories_enabled,
             :prompt_style, :allow_extensions, :max_extensions,
             :extension_duration_minutes, :mood_tracking_enabled,
             :reflection_prompts_enabled, :auto_complete_enabled,
             :notification_settings, :privacy_defaults, :theme_settings,
             :is_active, :created_at, :updated_at

  belongs_to :couple
  has_many :check_ins
  has_many :session_settings_proposals

  attribute :is_default do |settings|
    settings.is_active
  end

  attribute :total_sessions_used do |settings|
    settings.check_ins.count
  end
end