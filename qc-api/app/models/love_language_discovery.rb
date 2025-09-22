class LoveLanguageDiscovery < ApplicationRecord
  # Associations
  belongs_to :user
  belongs_to :check_in, optional: true
  belongs_to :converted_to_language, class_name: 'LoveLanguage', optional: true

  # Validations
  validates :discovery, presence: true

  # Scopes
  scope :unconverted, -> { where(converted_to_language_id: nil) }
  scope :converted, -> { where.not(converted_to_language_id: nil) }
  scope :recent, -> { order(created_at: :desc) }
  scope :from_check_ins, -> { where.not(check_in_id: nil) }

  # Instance methods
  def convert_to_language!(language_params = {})
    transaction do
      language = user.love_languages.create!(
        language_params.merge(
          description: discovery
        )
      )
      update!(converted_to_language_id: language.id)
      language
    end
  end

  def converted?
    converted_to_language_id.present?
  end
end