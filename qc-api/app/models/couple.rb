class Couple < ApplicationRecord
  # Associations
  has_and_belongs_to_many :users, join_table: 'couple_users'
  has_many :check_ins, dependent: :destroy
  has_many :categories, dependent: :destroy
  has_many :milestones, dependent: :destroy
  has_many :session_settings, dependent: :destroy
  has_many :session_settings_proposals, dependent: :destroy
  has_many :session_preparations, dependent: :destroy
  has_many :prompt_templates, dependent: :destroy
  has_many :custom_prompts, dependent: :destroy

  # Validations
  validates :name, presence: true
  validates :check_in_frequency, inclusion: { in: %w[daily weekly biweekly monthly] }
  validates :theme, inclusion: { in: %w[light dark system] }
  validates :total_check_ins, numericality: { greater_than_or_equal_to: 0 }
  validates :current_streak, numericality: { greater_than_or_equal_to: 0 }

  # Callbacks
  after_create :create_default_categories

  # Instance methods
  def current_session_settings
    session_settings.order(version: :desc).first
  end

  def pending_session_proposal
    session_settings_proposals.find_by(status: 'pending')
  end

  def update_stats!
    update!(
      total_check_ins: check_ins.completed.count,
      last_check_in_at: check_ins.completed.maximum(:completed_at)
    )
    calculate_streak!
  end

  private

  def create_default_categories
    default_categories = [
      { name: 'Communication', icon: '💬', description: 'How we talk and listen to each other', order: 1 },
      { name: 'Intimacy', icon: '❤️', description: 'Physical and emotional connection', order: 2 },
      { name: 'Finances', icon: '💰', description: 'Money matters and financial planning', order: 3 },
      { name: 'Family', icon: '👨‍👩‍👧‍👦', description: 'Extended family and parenting', order: 4 },
      { name: 'Goals', icon: '🎯', description: 'Personal and shared aspirations', order: 5 },
      { name: 'Household', icon: '🏠', description: 'Chores and home management', order: 6 }
    ]

    default_categories.each do |attrs|
      categories.create!(attrs.merge(is_custom: false))
    end
  end

  def calculate_streak!
    # Logic to calculate current streak based on check-in frequency
    # This would need to be implemented based on business rules
  end
end