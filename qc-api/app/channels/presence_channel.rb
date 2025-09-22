class PresenceChannel < ApplicationCable::Channel
  # Typing indicator debounce settings
  TYPING_DEBOUNCE_SECONDS = 3
  IDLE_TIMEOUT_SECONDS = 120
  STEPPED_AWAY_TIMEOUT_SECONDS = 300

  def subscribed
    # Subscribe to personal presence stream
    stream_from "presence_user_#{current_user.id}"

    # Subscribe to couple presence stream if in a couple
    if current_couple
      stream_from "presence_couple_#{current_couple.id}"

      # Initialize presence tracking
      initialize_presence_tracking
      appear

      # Start idle detection timer
      schedule_idle_check
    end
  end

  def unsubscribed
    clear_typing_timers
    clear_idle_timers
    disappear if current_couple
  end

  # Mark user as online/active
  def appear(data = {})
    return unless current_couple

    # Use centralized presence service
    PresenceService.track_user_online(current_user)

    # Update with specific activity if provided
    if activity = data['activity']
      current_user.update_columns(current_activity: activity)
    end

    # Broadcast presence to partner
    broadcast_presence_update('online', data)
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

    # Use centralized presence service
    PresenceService.track_user_offline(current_user)

    broadcast_presence_update('offline')
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

  # Send typing indicators across the app with debouncing
  def typing_status(data)
    return unless current_couple

    context = data['context'] # e.g., 'note', 'message', 'action_item'
    context_id = data['context_id']
    is_typing = data['is_typing']

    # Handle debounced typing for better performance
    if is_typing
      handle_typing_start(context, context_id)
    else
      handle_typing_stop(context, context_id)
    end
  end

  # Enhanced typing with character count and preview
  def typing_with_preview(data)
    return unless current_couple

    context = data['context']
    context_id = data['context_id']
    preview_text = data['preview_text']&.slice(0, 50) # Limit preview length
    character_count = data['character_count']

    # Reset typing timer
    reset_typing_timer(context, context_id)

    # Broadcast enhanced typing indicator
    partner = partner_for(current_user)
    return unless partner

    ActionCable.server.broadcast(
      "presence_user_#{partner.id}",
      {
        event: 'typing_with_preview',
        user_id: current_user.id,
        user_name: current_user.name,
        context: context,
        context_id: context_id,
        preview_text: preview_text,
        character_count: character_count,
        is_typing: true,
        timestamp: Time.current.iso8601
      }
    )
  end

  # Heartbeat to maintain connection and update last seen
  def heartbeat(data = {})
    return unless current_couple

    # Update last seen and activity
    current_user.touch(:last_seen_at)

    # Reset idle timer on heartbeat
    reset_idle_timer

    # Check if user was previously away and is now back
    if current_user.online_status == 'away' || current_user.online_status == 'stepped_away'
      appear(activity: 'returned')
    end

    # Send heartbeat acknowledgment with connection quality
    ActionCable.server.broadcast(
      "presence_user_#{current_user.id}",
      {
        event: 'heartbeat_ack',
        timestamp: Time.current.iso8601,
        connection_quality: calculate_connection_quality,
        idle_time: calculate_idle_time
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
          last_seen_at: current_user.last_seen_at.iso8601,
          online_status: current_user.online_status,
          idle_time: calculate_idle_time
        }
      )
    end
  end

  # User actively interacted (mouse move, key press, etc)
  def user_active(data = {})
    return unless current_couple

    # Reset idle timer and update activity
    reset_idle_timer
    @last_activity_at = Time.current

    # If user was idle/away, mark as active again
    if current_user.online_status != 'online'
      appear(activity: 'active')
    end
  end

  # Manually mark as stepped away
  def stepped_away(data = {})
    return unless current_couple

    reason = data['reason'] || 'stepped_away'
    expected_return = data['expected_return'] # Optional: when they expect to return

    current_user.update_columns(
      online_status: 'stepped_away',
      current_activity: reason,
      last_activity_at: Time.current
    )

    # Notify partner with stepped away status
    partner = partner_for(current_user)
    return unless partner

    ActionCable.server.broadcast(
      "presence_user_#{partner.id}",
      {
        event: 'partner_stepped_away',
        user_id: current_user.id,
        user_name: current_user.name,
        reason: reason,
        expected_return: expected_return,
        timestamp: Time.current.iso8601
      }
    )
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

  def initialize_presence_tracking
    @typing_timers = {}
    @idle_timer = nil
    @last_activity_at = Time.current
    @connection_start = Time.current
  end

  def handle_typing_start(context, context_id)
    key = "#{context}:#{context_id}"

    # Cancel existing timer if present
    if timer = @typing_timers[key]
      timer.shutdown if timer.respond_to?(:shutdown)
    end

    # Broadcast typing start immediately
    broadcast_typing_indicator(context, context_id, true)

    # Set timer to auto-stop typing after debounce period
    @typing_timers[key] = Concurrent::ScheduledTask.execute(TYPING_DEBOUNCE_SECONDS) do
      handle_typing_stop(context, context_id)
    end if defined?(Concurrent::ScheduledTask)
  end

  def handle_typing_stop(context, context_id)
    key = "#{context}:#{context_id}"

    # Cancel timer if exists
    if timer = @typing_timers[key]
      timer.shutdown if timer.respond_to?(:shutdown)
      @typing_timers.delete(key)
    end

    # Broadcast typing stop
    broadcast_typing_indicator(context, context_id, false)
  end

  def reset_typing_timer(context, context_id)
    handle_typing_start(context, context_id)
  end

  def clear_typing_timers
    @typing_timers&.each do |_, timer|
      timer.shutdown if timer.respond_to?(:shutdown)
    end
    @typing_timers = {}
  end

  def broadcast_typing_indicator(context, context_id, is_typing)
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

  def schedule_idle_check
    return unless defined?(Concurrent::ScheduledTask)

    @idle_timer = Concurrent::ScheduledTask.execute(IDLE_TIMEOUT_SECONDS) do
      check_idle_status
    end
  end

  def reset_idle_timer
    clear_idle_timers
    schedule_idle_check
    @last_activity_at = Time.current
  end

  def clear_idle_timers
    if @idle_timer
      @idle_timer.shutdown if @idle_timer.respond_to?(:shutdown)
      @idle_timer = nil
    end
  end

  def check_idle_status
    return unless current_couple

    idle_seconds = Time.current - @last_activity_at

    if idle_seconds >= STEPPED_AWAY_TIMEOUT_SECONDS
      # User has been idle for extended period
      stepped_away(reason: 'auto_idle')
    elsif idle_seconds >= IDLE_TIMEOUT_SECONDS
      # User is idle but not stepped away
      away(activity: 'idle')

      # Schedule next check for stepped away
      @idle_timer = Concurrent::ScheduledTask.execute(
        STEPPED_AWAY_TIMEOUT_SECONDS - IDLE_TIMEOUT_SECONDS
      ) do
        check_idle_status
      end if defined?(Concurrent::ScheduledTask)
    end
  end

  def calculate_idle_time
    (Time.current - @last_activity_at).to_i
  end

  def calculate_connection_quality
    # Simple connection quality based on how long connection has been stable
    connection_duration = Time.current - @connection_start

    case connection_duration
    when 0..30
      'establishing'
    when 30..300
      'good'
    else
      'excellent'
    end
  end

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