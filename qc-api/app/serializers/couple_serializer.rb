class CoupleSerializer
  include JSONAPI::Serializer

  # Core attributes
  attributes :id, :name, :created_at, :updated_at

  # Relationships - partners array in TypeScript
  has_many :users, key: :partners, serializer: :user

  # Settings object matching TypeScript interface
  attribute :settings do |couple|
    {
      check_in_frequency: couple.check_in_frequency,
      reminder_time: couple.reminder_time,
      categories: couple.categories.order(:order).map do |cat|
        {
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          description: cat.description,
          prompts: cat.prompts || [],
          is_custom: cat.is_custom,
          order: cat.order
        }
      end,
      theme: couple.theme || 'system',
      session_settings: couple.session_settings&.first ? {
        id: couple.session_settings.first.id,
        session_duration: couple.session_settings.first.default_duration_minutes,
        timeouts_per_partner: couple.session_settings.first.max_extensions || 3,
        timeout_duration: couple.session_settings.first.extension_duration_minutes || 5,
        turn_based_mode: couple.session_settings.first.respond_to?(:turn_based_mode) ?
                        couple.session_settings.first.turn_based_mode : false,
        allow_extensions: couple.session_settings.first.allow_extensions
      } : nil,
      pending_session_proposal: couple.pending_session_proposal
    }
  end

  # Stats object matching TypeScript interface
  attribute :stats do |couple|
    {
      total_check_ins: couple.total_check_ins,
      current_streak: couple.current_streak,
      last_check_in: couple.last_check_in_at
    }
  end

  # Optimized relationships - only include if requested
  has_many :check_ins, if: proc { |_, params| params && params[:include_check_ins] }
  has_many :milestones, if: proc { |_, params| params && params[:include_milestones] }
  has_many :reminders, if: proc { |_, params| params && params[:include_reminders] }

  # Use camelCase for JSON output to match TypeScript
  set_key_transform :camel_lower
end