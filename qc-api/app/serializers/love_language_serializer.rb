class LoveLanguageSerializer
  include JSONAPI::Serializer

  attributes :id, :language_type, :score, :is_primary, :notes,
             :last_assessed_at, :created_at, :updated_at

  belongs_to :user
  belongs_to :couple
  has_many :love_actions, foreign_key: :linked_language_id
  has_many :love_language_discoveries, foreign_key: :converted_to_language_id

  attribute :rank do |love_language|
    # Calculate rank based on score compared to other languages
    user_languages = love_language.user.love_languages.order(score: :desc)
    user_languages.pluck(:id).index(love_language.id) + 1
  end

  attribute :percentage do |love_language|
    total = love_language.user.love_languages.sum(:score)
    if total > 0
      ((love_language.score.to_f / total) * 100).round(1)
    else
      0
    end
  end
end