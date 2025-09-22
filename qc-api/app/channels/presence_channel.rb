class PresenceChannel < ApplicationCable::Channel
  def subscribed
    # Subscribe to personal presence stream
    stream_from "presence_user_#{current_user.id}"

    # Subscribe to couple presence stream if in a couple
    if current_couple
      stream_from "presence_couple_#{current_couple.id}"
      appear
    end
  end

  def unsubscribed
    disappear if current_couple
  end

  # Mark user as online/active
  def appear(data = {})
    return unless current_couple

    # Update user's online status
    current_user.update_columns(
      last_seen_at: Time.current,
      online_status: 'online',
      current_activity: data['activity'] || 'active'
    )

    # Broadcast presence to partner
    broadcast_presence_update('online', data)

    # Track presence in Redis for real-time status
    track_presence_in_redis(true)
  end

  # Mark user as away/idle
  def away(data = {})
    return unless current_couple

    current_user.update_columns(
      online_status: 'away',
      current_activity: data['activity'] || 'idle'
    )

    broadcast_presence_update('away', data)
  end

  # Mark user as offline
  def disappear
    return unless current_couple

    current_user.update_columns(
      last_seen_at: Time.current,
      online_status: 'offline',
      current_activity: nil
    )

    broadcast_presence_update('offline')
    track_presence_in_redis(false)
  end

  # Update user's current activity/location in app
  def update_activity(data)
    return unless current_couple

    activity = data['activity'] || 'browsing'
    location = data['location'] # e.g., 'dashboard', 'check_in', 'notes'

    current_user.update_columns(
      current_activity: activity,
      last_activity_at: Time.current
    )

    # Notify partner of activity change
    ActionCable.server.broadcast(
      "presence_couple_#{current_couple.id}",
      {
        event: 'activity_updated',
        user_id: current_user.id,
        user_name: current_user.name,
        activity: activity,
        location: location,
        timestamp: Time.current.iso8601
      }
    )
  end

  # Send typing indicators across the app
  def typing_status(data)
    return unless current_couple

    context = data['context'] # e.g., 'note', 'message', 'action_item'
    context_id = data['context_id']
    is_typing = data['is_typing']

    # Broadcast typing status to partner
    partner = partner_for(current_user)
    return unless partner

    ActionCable.server.broadcast(
      "presence_user_#{partner.id}",
      {
        event: 'typing_indicator',
        user_id: current_user.id,
        user_name: current_user.name,
        context: context,
        context_id: context_id,
        is_typing: is_typing,
        timestamp: Time.current.iso8601
      }
    )
  end

  # Heartbeat to maintain connection and update last seen
  def heartbeat
    return unless current_couple

    current_user.touch(:last_seen_at)

    # Send heartbeat acknowledgment
    ActionCable.server.broadcast(
      "presence_user_#{current_user.id}",
      {
        event: 'heartbeat_ack',
        timestamp: Time.current.iso8601
      }
    )

    # Update partner's view of user's status
    partner = partner_for(current_user)
    if partner
      ActionCable.server.broadcast(
        "presence_user_#{partner.id}",
        {
          event: 'partner_heartbeat',
          user_id: current_user.id,
          last_seen_at: current_user.last_seen_at.iso8601
        }
      )
    end
  end

  # Request current status of partner
  def request_partner_status
    return unless current_couple

    partner = partner_for(current_user)
    return unless partner

    # Send partner's current status
    ActionCable.server.broadcast(
      "presence_user_#{current_user.id}",
      {
        event: 'partner_status',
        partner: {
          id: partner.id,
          name: partner.name,
          online_status: partner.online_status,
          last_seen_at: partner.last_seen_at&.iso8601,
          current_activity: partner.current_activity
        }
      }
    )
  end

  private

  def broadcast_presence_update(status, data = {})
    partner = partner_for(current_user)
    return unless partner

    ActionCable.server.broadcast(
      "presence_user_#{partner.id}",
      {
        event: 'partner_presence_changed',
        user_id: current_user.id,
        user_name: current_user.name,
        status: status,
        activity: data['activity'],
        location: data['location'],
        timestamp: Time.current.iso8601
      }
    )

    # Also broadcast to couple stream for any couple-wide features
    ActionCable.server.broadcast(
      "presence_couple_#{current_couple.id}",
      {
        event: 'member_presence_changed',
        user_id: current_user.id,
        user_name: current_user.name,
        status: status,
        timestamp: Time.current.iso8601
      }
    )
  end

  def track_presence_in_redis(is_online)
    # Use Redis to track real-time presence if available
    # This allows for quick presence queries without hitting the database
    return unless defined?(Redis) && Rails.application.config.cache_store.is_a?(ActiveSupport::Cache::RedisCacheStore)

    redis_key = "presence:user:#{current_user.id}"

    if is_online
      Rails.cache.write(redis_key, {
        status: 'online',
        last_seen: Time.current.to_i,
        couple_id: current_couple.id
      }, expires_in: 5.minutes)
    else
      Rails.cache.delete(redis_key)
    end
  end
end