class Couple < ApplicationRecord
  # Associations
  has_and_belongs_to_many :users, join_table: "couple_users"
  has_many :check_ins, dependent: :destroy
  has_many :categories, dependent: :destroy
  has_many :milestones, dependent: :destroy
  has_many :session_settings, class_name: 'SessionSettings', dependent: :destroy
  has_many :session_settings_proposals, class_name: 'SessionSettingsProposal', dependent: :destroy
  has_many :session_preparations, dependent: :destroy
  has_many :prompt_templates, dependent: :destroy
  has_many :custom_prompts, dependent: :destroy

  # Validations
  validates :name, presence: true
  validates :check_in_frequency, inclusion: { in: %w[daily weekly biweekly monthly] }
  validates :theme, inclusion: { in: %w[light dark system] }
  validates :total_check_ins, numericality: { greater_than_or_equal_to: 0 }
  validates :current_streak, numericality: { greater_than_or_equal_to: 0 }
  validate :maximum_two_users

  # Callbacks
  after_create :create_default_categories

  # Instance methods
  def current_session_settings
    session_settings.order(version: :desc).first
  end

  def pending_session_proposal
    session_settings_proposals.find_by(status: "pending")
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
      { name: "Communication", icon: "💬", description: "How we talk and listen to each other", order: 1 },
      { name: "Intimacy", icon: "❤️", description: "Physical and emotional connection", order: 2 },
      { name: "Finances", icon: "💰", description: "Money matters and financial planning", order: 3 },
      { name: "Family", icon: "👨‍👩‍👧‍👦", description: "Extended family and parenting", order: 4 },
      { name: "Goals", icon: "🎯", description: "Personal and shared aspirations", order: 5 },
      { name: "Household", icon: "🏠", description: "Chores and home management", order: 6 }
    ]

    default_categories.each do |attrs|
      categories.create!(attrs.merge(is_custom: false))
    end
  end

  def calculate_streak!
    return 0 unless last_check_in_at

    streak = 0
    current_date = Date.today
    check_ins_ordered = check_ins.completed.order(completed_at: :desc)

    case check_in_frequency
    when 'daily'
      consecutive_days = 0
      check_ins_ordered.each do |check_in|
        check_date = check_in.completed_at.to_date
        if check_date == current_date - consecutive_days
          consecutive_days += 1
        else
          break
        end
      end
      streak = consecutive_days
    when 'weekly'
      consecutive_weeks = 0
      check_ins_ordered.each do |check_in|
        check_week = check_in.completed_at.to_date.cweek
        expected_week = (Date.today.cweek - consecutive_weeks) % 52
        if check_week == expected_week
          consecutive_weeks += 1
        else
          break
        end
      end
      streak = consecutive_weeks
    when 'biweekly'
      consecutive_periods = 0
      check_ins_ordered.each do |check_in|
        days_ago = (current_date - check_in.completed_at.to_date).to_i
        expected_period = consecutive_periods * 14
        if days_ago >= expected_period && days_ago < expected_period + 14
          consecutive_periods += 1
        else
          break
        end
      end
      streak = consecutive_periods
    when 'monthly'
      consecutive_months = 0
      check_ins_ordered.each do |check_in|
        check_month = check_in.completed_at.to_date.month
        expected_month = (current_date.month - consecutive_months - 1) % 12 + 1
        if check_month == expected_month
          consecutive_months += 1
        else
          break
        end
      end
      streak = consecutive_months
    end

    update_column(:current_streak, streak) if current_streak != streak
    streak
  end

  def maximum_two_users
    if users.count > 2
      errors.add(:users, "A couple can only have two partners")
    end
  end
end
