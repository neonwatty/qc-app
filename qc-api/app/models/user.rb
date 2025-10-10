class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist
  # Associations
  belongs_to :partner, class_name: "User", foreign_key: "partner_id", optional: true
  has_and_belongs_to_many :couples, join_table: "couple_users"
  has_many :notes, foreign_key: "author_id", dependent: :destroy
  has_many :created_reminders, class_name: "Reminder", foreign_key: "created_by", dependent: :destroy
  has_many :assigned_reminders, class_name: "Reminder", foreign_key: "assigned_to"
  has_many :sent_requests, class_name: "RelationshipRequest", foreign_key: "requested_by", dependent: :destroy
  has_many :received_requests, class_name: "RelationshipRequest", foreign_key: "requested_for"
  has_many :assigned_action_items, class_name: "ActionItem", foreign_key: "assigned_to_id"
  has_many :love_languages, dependent: :destroy
  has_many :love_actions_for, class_name: "LoveAction", foreign_key: "for_user_id"
  has_many :created_love_actions, class_name: "LoveAction", foreign_key: "created_by", dependent: :destroy
  has_many :love_language_discoveries, dependent: :destroy
  has_many :preparation_topics, foreign_key: "author_id", dependent: :destroy
  has_many :quick_reflections, foreign_key: "author_id", dependent: :destroy

  # Validations
  validates :name, presence: true

  # Scopes
  scope :with_partner, -> { where.not(partner_id: nil) }

  # Instance methods
  def current_couple
    couples.first
  end

  def partner_in_couple(couple)
    couple.users.where.not(id: id).first
  end

  def admin?
    # Check if user has admin role (you may want to add an admin column to the users table)
    # For now, return false as default
    respond_to?(:is_admin) ? is_admin : false
  end

  # JWT payload customization
  def jwt_payload
    {
      'sub' => id,
      'email' => email,
      'name' => name,
      'admin' => admin?,
      'couple_ids' => couple_ids,
      'iat' => Time.current.to_i
    }
  end

  # Generate a refresh token
  def generate_refresh_token
    payload = {
      'sub' => id,
      'type' => 'refresh',
      'exp' => 30.days.from_now.to_i,
      'jti' => SecureRandom.uuid
    }

    JWT.encode(payload, Rails.application.config.jwt.secret_key, 'HS256')
  end

  # Validate a refresh token
  def self.from_refresh_token(token)
    payload = JWT.decode(
      token,
      Rails.application.config.jwt.secret_key,
      true,
      { algorithm: 'HS256' }
    ).first

    return nil unless payload['type'] == 'refresh'
    return nil if JwtDenylist.token_revoked?(payload['jti'])

    find_by(id: payload['sub'])
  rescue JWT::DecodeError, JWT::ExpiredSignature
    nil
  end
end
