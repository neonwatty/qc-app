module ApplicationCable
  class Channel < ActionCable::Channel::Base
    # Shared functionality for all channels

    protected

    def current_couple
      @current_couple ||= current_user.couples.first
    end

    def partner_for(user)
      return nil unless current_couple
      current_couple.users.where.not(id: user.id).first
    end

    def authorize_couple_member!
      reject unless current_couple && current_couple.users.include?(current_user)
    end

    def broadcast_to_partner(event, data = {})
      partner = partner_for(current_user)
      return unless partner

      ActionCable.server.broadcast(
        "user_#{partner.id}",
        event: event,
        data: data,
        from_user_id: current_user.id,
        timestamp: Time.current.iso8601
      )
    end

    def broadcast_to_couple(event, data = {})
      return unless current_couple

      ActionCable.server.broadcast(
        "couple_#{current_couple.id}",
        event: event,
        data: data,
        from_user_id: current_user.id,
        timestamp: Time.current.iso8601
      )
    end
  end
end