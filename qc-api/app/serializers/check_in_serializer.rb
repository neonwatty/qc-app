class CheckInSerializer
  include JSONAPI::Serializer

  attributes :id, :status, :started_at, :completed_at, :participants,
             :categories, :mood_before, :mood_after, :reflection,
             :current_step, :timeouts, :extensions, :created_at, :updated_at

  belongs_to :couple
  belongs_to :session_settings, optional: true
  has_many :notes
  has_many :action_items
  has_many :love_language_discoveries
  has_many :quick_reflections
  has_one :session_preparation

  attribute :duration_minutes do |check_in|
    if check_in.completed_at && check_in.started_at
      ((check_in.completed_at - check_in.started_at) / 60).round
    end
  end

  attribute :is_complete do |check_in|
    check_in.status == 'completed'
  end

  attribute :participants_info do |check_in|
    User.where(id: check_in.participants).select(:id, :name, :email)
  end
end