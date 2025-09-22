class UserSerializer
  include JSONAPI::Serializer

  attributes :id, :email, :name, :partner_id, :created_at, :updated_at

  attribute :current_couple do |user|
    couple = user.current_couple
    if couple
      {
        id: couple.id,
        name: couple.name,
        partner: user.partner_in_couple(couple)&.slice(:id, :name, :email)
      }
    end
  end
end
