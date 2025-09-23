FactoryBot.define do
  factory :user do
    email { Faker::Internet.unique.email }
    password { 'Password123!' }
    password_confirmation { 'Password123!' }
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    username { Faker::Internet.unique.username(specifier: 5..15) }
    date_of_birth { Faker::Date.birthday(min_age: 18, max_age: 65) }
    preferred_language { 'en' }
    time_zone { 'America/Los_Angeles' }
    confirmed_at { Time.current }

    trait :unconfirmed do
      confirmed_at { nil }
    end

    trait :with_avatar do
      after(:build) do |user|
        user.avatar.attach(
          io: File.open(Rails.root.join('spec', 'fixtures', 'files', 'avatar.jpg')),
          filename: 'avatar.jpg',
          content_type: 'image/jpeg'
        )
      end
    end

    trait :with_couple do
      after(:create) do |user|
        couple = create(:couple, :accepted)
        user.update(couple: couple, partner_id: couple.partner_id)
      end
    end

    trait :admin do
      after(:create) do |user|
        user.update(admin: true) if user.respond_to?(:admin=)
      end
    end

    factory :user_with_full_profile do
      after(:create) do |user|
        # Add additional profile setup if needed
        create(:session_settings, user: user)
        create(:love_language, user: user)
      end
    end
  end
end