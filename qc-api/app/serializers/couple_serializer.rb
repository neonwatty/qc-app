class CoupleSerializer
  include JSONAPI::Serializer

  attributes :id, :name, :check_in_frequency, :total_check_ins,
             :current_streak, :last_check_in_at, :created_at, :updated_at

  has_many :users
  has_many :check_ins
  has_many :milestones
  has_many :categories
  has_many :session_settings, key: :session_settings, serializer: :session_settings
  has_many :reminders

  attribute :stats do |couple|
    {
      total_check_ins: couple.total_check_ins,
      current_streak: couple.current_streak,
      last_check_in_at: couple.last_check_in_at,
      check_ins_this_month: couple.check_ins.where('created_at >= ?', Date.today.beginning_of_month).count,
      milestones_achieved: couple.milestones.achieved.count
    }
  end
end