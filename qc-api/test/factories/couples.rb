FactoryBot.define do
  factory :couple do
    association :initiator, factory: :user
    association :partner, factory: :user
    status { 'pending' }
    anniversary { Faker::Date.backward(days: 365) }
    couple_type { 'romantic' }
    time_zone { 'America/Los_Angeles' }

    trait :pending do
      status { 'pending' }
      accepted_at { nil }
    end

    trait :accepted do
      status { 'accepted' }
      accepted_at { 1.day.ago }
      couple_code { SecureRandom.hex(4).upcase }
    end

    trait :declined do
      status { 'declined' }
      accepted_at { nil }
    end

    trait :with_settings do
      after(:create) do |couple|
        create(:session_settings, couple: couple)
      end
    end

    trait :with_milestones do
      after(:create) do |couple|
        create_list(:milestone, 3, couple: couple)
      end
    end

    trait :with_check_ins do
      after(:create) do |couple|
        create_list(:check_in, 5, couple: couple)
      end
    end

    factory :active_couple do
      accepted
      with_settings
      after(:create) do |couple|
        # Set up both users with the couple
        couple.initiator.update(couple: couple, partner_id: couple.partner_id)
        couple.partner.update(couple: couple, partner_id: couple.initiator_id)
      end
    end
  end
end