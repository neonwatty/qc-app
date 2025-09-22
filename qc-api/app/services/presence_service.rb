# Service for managing user presence and typing indicators
class PresenceService
  include Singleton

  # Presence status constants
  ONLINE = 'online'.freeze
  OFFLINE = 'offline'.freeze
  AWAY = 'away'.freeze
  STEPPED_AWAY = 'stepped_away'.freeze

  # Timeout constants
  HEARTBEAT_INTERVAL = 30.seconds
  IDLE_TIMEOUT = 2.minutes
  STEPPED_AWAY_TIMEOUT = 5.minutes
  TYPING_TIMEOUT = 3.seconds

  class << self
    delegate :track_user_online, :track_user_offline, :track_user_activity,
             :track_typing, :stop_typing, :get_user_presence, :get_couple_presence,
             :check_idle_users, :broadcast_presence_change, to: :instance
  end

  def initialize
    @presence_cache = {}
    @typing_cache = {}
  end

  # Track user coming online
  def track_user_online(user)
    return unless user

    user.update_columns(
      online_status: ONLINE,
      last_seen_at: Time.current,
      current_activity: 'active'
    )

    # Cache presence data
    cache_presence(user)

    # Broadcast to partner if in couple
    if couple = user.couple
      broadcast_to_couple(couple, 'partner_online', {
        user_id: user.id,
        user_name: user.name,
        status: ONLINE
      })
    end

    track_in_redis(user, ONLINE)
  end

  # Track user going offline
  def track_user_offline(user)
    return unless user

    user.update_columns(
      online_status: OFFLINE,
      last_seen_at: Time.current,
      current_activity: nil
    )

    # Clear caches
    clear_user_cache(user)

    # Broadcast to partner if in couple
    if couple = user.couple
      broadcast_to_couple(couple, 'partner_offline', {
        user_id: user.id,
        user_name: user.name,
        status: OFFLINE
      })
    end

    remove_from_redis(user)
  end

  # Track user activity (for idle detection)
  def track_user_activity(user, activity_type = 'interaction')
    return unless user

    @presence_cache[user.id] ||= {}
    @presence_cache[user.id][:last_activity] = Time.current
    @presence_cache[user.id][:activity_type] = activity_type

    # Reset user to online if they were away
    if user.online_status == AWAY || user.online_status == STEPPED_AWAY
      track_user_online(user)
    else
      user.touch(:last_activity_at)
    end
  end

  # Track typing indicators with debouncing
  def track_typing(user, context, context_id)
    return unless user

    key = typing_key(user, context, context_id)

    # Clear existing timer
    if timer = @typing_cache[key]
      timer[:timer].shutdown if timer[:timer].respond_to?(:shutdown)
    end

    # Set new typing data
    @typing_cache[key] = {
      user_id: user.id,
      context: context,
      context_id: context_id,
      started_at: Time.current,
      timer: schedule_typing_timeout(user, context, context_id)
    }

    # Broadcast typing indicator
    broadcast_typing_indicator(user, context, context_id, true)
  end

  # Stop typing indicator
  def stop_typing(user, context, context_id)
    return unless user

    key = typing_key(user, context, context_id)

    # Clear timer and cache
    if timer_data = @typing_cache[key]
      timer_data[:timer].shutdown if timer_data[:timer].respond_to?(:shutdown)
      @typing_cache.delete(key)
    end

    # Broadcast typing stopped
    broadcast_typing_indicator(user, context, context_id, false)
  end

  # Get presence data for a user
  def get_user_presence(user)
    return nil unless user

    # Check Redis cache first
    if redis_data = get_from_redis(user)
      return redis_data
    end

    # Fallback to database
    {
      user_id: user.id,
      online_status: user.online_status,
      last_seen_at: user.last_seen_at,
      current_activity: user.current_activity,
      is_typing: user_is_typing?(user)
    }
  end

  # Get presence for all couple members
  def get_couple_presence(couple)
    return {} unless couple

    couple.users.map do |user|
      [user.id, get_user_presence(user)]
    end.to_h
  end

  # Check for idle users (called periodically)
  def check_idle_users
    User.where(online_status: [ONLINE, AWAY]).find_each do |user|
      next unless user.last_activity_at

      idle_duration = Time.current - user.last_activity_at

      if idle_duration > STEPPED_AWAY_TIMEOUT
        mark_user_stepped_away(user)
      elsif idle_duration > IDLE_TIMEOUT
        mark_user_away(user)
      end
    end
  end

  # Broadcast presence change to specific channels
  def broadcast_presence_change(user, event_type, data = {})
    return unless user

    # Add timestamp
    data[:timestamp] = Time.current.iso8601

    # Broadcast to user's personal channel
    ActionCable.server.broadcast(
      "presence_user_#{user.id}",
      data.merge(event: event_type)
    )

    # Broadcast to couple channel if applicable
    if couple = user.couple
      ActionCable.server.broadcast(
        "presence_couple_#{couple.id}",
        data.merge(event: event_type, user_id: user.id)
      )
    end
  end

  private

  def cache_presence(user)
    @presence_cache[user.id] = {
      status: user.online_status,
      last_seen: user.last_seen_at,
      last_activity: Time.current,
      activity: user.current_activity
    }
  end

  def clear_user_cache(user)
    @presence_cache.delete(user.id)

    # Clear all typing indicators for this user
    @typing_cache.keys.select { |k| k.start_with?("#{user.id}:") }.each do |key|
      if timer_data = @typing_cache[key]
        timer_data[:timer].shutdown if timer_data[:timer].respond_to?(:shutdown)
      end
      @typing_cache.delete(key)
    end
  end

  def typing_key(user, context, context_id)
    "#{user.id}:#{context}:#{context_id}"
  end

  def user_is_typing?(user)
    @typing_cache.any? { |key, _| key.start_with?("#{user.id}:") }
  end

  def schedule_typing_timeout(user, context, context_id)
    return unless defined?(Concurrent::ScheduledTask)

    Concurrent::ScheduledTask.execute(TYPING_TIMEOUT) do
      stop_typing(user, context, context_id)
    end
  end

  def broadcast_typing_indicator(user, context, context_id, is_typing)
    return unless user.couple

    partner = user.couple.users.where.not(id: user.id).first
    return unless partner

    ActionCable.server.broadcast(
      "presence_user_#{partner.id}",
      {
        event: 'typing_indicator',
        user_id: user.id,
        user_name: user.name,
        context: context,
        context_id: context_id,
        is_typing: is_typing,
        timestamp: Time.current.iso8601
      }
    )
  end

  def broadcast_to_couple(couple, event, data)
    ActionCable.server.broadcast(
      "presence_couple_#{couple.id}",
      data.merge(event: event, timestamp: Time.current.iso8601)
    )

    # Also broadcast to individual partner channels
    couple.users.each do |user|
      ActionCable.server.broadcast(
        "presence_user_#{user.id}",
        data.merge(event: event, timestamp: Time.current.iso8601)
      )
    end
  end

  def mark_user_away(user)
    user.update_columns(
      online_status: AWAY,
      current_activity: 'idle'
    )

    broadcast_presence_change(user, 'status_changed', {
      status: AWAY,
      reason: 'idle_timeout'
    })
  end

  def mark_user_stepped_away(user)
    user.update_columns(
      online_status: STEPPED_AWAY,
      current_activity: 'stepped_away'
    )

    broadcast_presence_change(user, 'status_changed', {
      status: STEPPED_AWAY,
      reason: 'extended_idle'
    })
  end

  # Redis-based presence tracking for scalability
  def track_in_redis(user, status)
    return unless redis_available?

    Rails.cache.write(
      redis_presence_key(user),
      {
        user_id: user.id,
        status: status,
        last_seen: Time.current.to_i,
        couple_id: user.couple_id
      },
      expires_in: 5.minutes
    )
  end

  def get_from_redis(user)
    return nil unless redis_available?

    Rails.cache.read(redis_presence_key(user))
  end

  def remove_from_redis(user)
    return unless redis_available?

    Rails.cache.delete(redis_presence_key(user))
  end

  def redis_presence_key(user)
    "presence:user:#{user.id}"
  end

  def redis_available?
    defined?(Redis) && Rails.application.config.cache_store.is_a?(ActiveSupport::Cache::RedisCacheStore)
  end
end