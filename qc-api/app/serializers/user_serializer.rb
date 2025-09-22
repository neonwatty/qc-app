class UserSerializer < BaseSerializer
  # Core attributes matching TypeScript interface
  attributes :id, :email, :name, :created_at, :updated_at

  # partnerId field (optional in TypeScript)
  attribute :partner_id do |user|
    user.partner_id
  end

  # Avatar field (optional in TypeScript)
  attribute :avatar do |user|
    user.avatar_url if user.respond_to?(:avatar_url)
  end

  # Include relationship data if needed
  attribute :current_couple do |user, params|
    # Only include if specifically requested to avoid N+1 queries
    if params && params[:include_couple]
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
end