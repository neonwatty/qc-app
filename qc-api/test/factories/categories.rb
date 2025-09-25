FactoryBot.define do
  factory :category do
    association :couple
    name { Faker::Lorem.word.capitalize }
    description { Faker::Lorem.sentence }
    color { Faker::Color.hex_color }
    icon { %w[heart star bell calendar users].sample }
    is_default { false }
    is_active { true }
    position { rand(1..10) }

    trait :default do
      is_default { true }
      couple { nil }
    end

    trait :custom do
      is_default { false }
    end

    trait :inactive do
      is_active { false }
    end

    trait :with_prompts do
      after(:create) do |category|
        create_list(:custom_prompt, 3, category: category)
      end
    end

    # Default categories
    factory :communication_category do
      default
      name { 'Communication' }
      description { 'Discuss how we communicate with each other' }
      icon { 'message-circle' }
    end

    factory :intimacy_category do
      default
      name { 'Intimacy' }
      description { 'Explore physical and emotional intimacy' }
      icon { 'heart' }
    end

    factory :finances_category do
      default
      name { 'Finances' }
      description { 'Talk about financial goals and concerns' }
      icon { 'dollar-sign' }
    end
  end
end