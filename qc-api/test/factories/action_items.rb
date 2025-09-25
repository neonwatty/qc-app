FactoryBot.define do
  factory :action_item do
    association :check_in
    association :assigned_to, factory: :user
    association :created_by, factory: :user
    title { Faker::Lorem.sentence(word_count: 4) }
    description { Faker::Lorem.paragraph(sentence_count: 2) }
    due_date { 1.week.from_now }
    priority { %w[low medium high].sample }
    status { 'pending' }
    category { %w[communication quality_time acts_of_service].sample }

    trait :pending do
      status { 'pending' }
      completed_at { nil }
    end

    trait :in_progress do
      status { 'in_progress' }
      started_at { 1.day.ago }
    end

    trait :completed do
      status { 'completed' }
      completed_at { 1.hour.ago }
      completion_notes { Faker::Lorem.sentence }
    end

    trait :overdue do
      pending
      due_date { 2.days.ago }
    end

    trait :recurring do
      recurring { true }
      recurrence_pattern { 'weekly' }
      recurrence_end_date { 3.months.from_now }
    end

    trait :high_priority do
      priority { 'high' }
      flagged { true }
    end

    trait :with_reminders do
      reminder_before_days { [1, 3, 7] }
      reminder_sent { false }
    end

    factory :urgent_action_item do
      high_priority
      due_date { 1.day.from_now }
      with_reminders
    end
  end
end