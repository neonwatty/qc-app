FactoryBot.define do
  factory :note do
    association :user
    association :check_in
    content { Faker::Lorem.paragraph(sentence_count: 3) }
    privacy_level { 'private' }
    note_type { 'reflection' }
    mood { rand(1..10) }
    created_at { Time.current }

    trait :private do
      privacy_level { 'private' }
      encrypted { true }
    end

    trait :shared do
      privacy_level { 'shared' }
      shared_at { Time.current }
    end

    trait :couple do
      privacy_level { 'couple' }
    end

    trait :with_tags do
      tags { Faker::Lorem.words(number: 4) }
    end

    trait :with_attachments do
      after(:create) do |note|
        note.attachments.attach(
          io: File.open(Rails.root.join('test', 'fixtures', 'files', 'document.pdf')),
          filename: 'document.pdf',
          content_type: 'application/pdf'
        )
      end
    end

    trait :flagged do
      flagged { true }
      flagged_reason { 'Important for discussion' }
    end

    factory :shared_note do
      shared
      with_tags
    end
  end
end