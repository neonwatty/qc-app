class MilestoneSerializer
  include JSONAPI::Serializer

  attributes :id, :title, :description, :achieved_at, :icon, :category,
             :achieved, :points, :rarity, :progress, :target_date,
             :target_value, :criteria, :data, :achievement_notes,
             :created_at, :updated_at

  belongs_to :couple
  belongs_to :achieved_by, serializer: :user, optional: true
  has_many :milestone_achievements
  has_many :milestone_progress_updates

  attribute :is_achieved do |milestone|
    milestone.achieved?
  end

  attribute :is_in_progress do |milestone|
    milestone.progress > 0 && !milestone.achieved
  end

  attribute :completion_percentage do |milestone|
    milestone.progress
  end

  attribute :days_until_target do |milestone|
    if milestone.target_date
      (milestone.target_date - Date.today).to_i
    end
  end
end