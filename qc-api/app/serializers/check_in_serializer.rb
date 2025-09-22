class CheckInSerializer
  include JSONAPI::Serializer

  # Core attributes matching TypeScript interface
  attributes :id, :status, :started_at, :completed_at, :reflection,
             :current_step, :extensions

  # coupleId in TypeScript
  attribute :couple_id do |check_in|
    check_in.couple_id
  end

  # participants array
  attribute :participants do |check_in|
    check_in.participants || []
  end

  # categories array (category IDs)
  attribute :categories do |check_in|
    check_in.categories || []
  end

  # mood object matching TypeScript { before: number, after?: number }
  attribute :mood do |check_in|
    if check_in.mood_before
      {
        before: check_in.mood_before,
        after: check_in.mood_after
      }.compact
    end
  end

  # sessionSettingsId (optional)
  attribute :session_settings_id do |check_in|
    check_in.session_settings_id
  end

  # timeouts object
  attribute :timeouts do |check_in|
    check_in.timeouts || {}
  end

  # Computed attributes for convenience
  attribute :duration_minutes do |check_in|
    if check_in.completed_at && check_in.started_at
      ((check_in.completed_at - check_in.started_at) / 60).round
    end
  end

  # Relationships - use conditional loading for performance
  has_many :notes, if: proc { |_, params| params && params[:include_notes] }
  has_many :action_items, if: proc { |_, params| params && params[:include_action_items] }

  # Include participant details if requested
  attribute :participants_info do |check_in, params|
    if params && params[:include_participants_info]
      User.where(id: check_in.participants).select(:id, :name, :email)
    end
  end

  # Use camelCase for JSON output to match TypeScript
  set_key_transform :camel_lower
end