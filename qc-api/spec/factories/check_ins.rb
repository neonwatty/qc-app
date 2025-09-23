FactoryBot.define do
  factory :check_in do
    association :couple
    association :initiated_by, factory: :user
    scheduled_at { 1.hour.from_now }
    status { 'scheduled' }
    check_in_type { 'regular' }
    duration_minutes { 30 }
    privacy_level { 'couple' }

    trait :scheduled do
      status { 'scheduled' }
      started_at { nil }
      completed_at { nil }
    end

    trait :in_progress do
      status { 'in_progress' }
      started_at { 10.minutes.ago }
      completed_at { nil }
      current_step { 'category_selection' }
      current_category_index { 0 }
    end

    trait :completed do
      status { 'completed' }
      started_at { 1.hour.ago }
      completed_at { 30.minutes.ago }
      summary { Faker::Lorem.paragraph }
      mood_before { rand(1..10) }
      mood_after { rand(1..10) }
      connection_level { rand(1..10) }

      after(:create) do |check_in|
        # Add some notes and action items
        create_list(:note, 3, check_in: check_in)
        create_list(:action_item, 2, check_in: check_in)
      end
    end

    trait :cancelled do
      status { 'cancelled' }
      cancelled_at { 1.hour.ago }
      cancellation_reason { 'Schedule conflict' }
    end

    trait :with_categories do
      after(:create) do |check_in|
        categories = create_list(:category, 3, couple: check_in.couple)
        check_in.categories << categories
      end
    end

    trait :emergency do
      check_in_type { 'emergency' }
      priority { 'high' }
    end

    factory :complete_check_in do
      completed
      with_categories
    end
  end
end