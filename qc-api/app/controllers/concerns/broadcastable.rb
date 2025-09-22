# frozen_string_literal: true

module Broadcastable
  extend ActiveSupport::Concern

  included do
    # Helper methods for broadcasting events from controllers
  end

  protected

  # Broadcast a check-in event to all participants
  def broadcast_check_in_event(check_in, event, data = {})
    CheckInChannel.broadcast_to(
      check_in,
      data.merge(
        event: event,
        triggered_by: current_user.id,
        timestamp: Time.current.iso8601
      )
    )
  end

  # Send real-time notification to a specific user
  def send_notification(user, type, title, body, data = {})
    NotificationChannel.notify_user(user, type, title, body, data)
  end

  # Send notification to all couple members
  def send_couple_notification(couple, type, title, body, data = {})
    NotificationChannel.notify_couple(couple, type, title, body, data)
  end

  # Broadcast presence update
  def broadcast_presence_update(user, status, activity = nil)
    ActionCable.server.broadcast(
      "presence_user_#{user.id}",
      {
        event: 'presence_updated',
        user_id: user.id,
        status: status,
        activity: activity,
        timestamp: Time.current.iso8601
      }
    )
  end

  # Notify partner when note is shared
  def notify_partner_note_shared(note)
    return unless note.shared? && note.author.partner

    NotificationChannel.notify_partner_shared_note(note)

    # Also send real-time update if partner is online
    broadcast_check_in_event(note.check_in, 'note_shared', {
      note_id: note.id,
      author_name: note.author.name,
      category_name: note.category&.name
    })
  end

  # Notify when action item is assigned
  def notify_action_item_assignment(action_item)
    NotificationChannel.notify_action_item_assigned(action_item)

    # Real-time update to check-in session if active
    if action_item.check_in.active?
      broadcast_check_in_event(action_item.check_in, 'action_item_created', {
        action_item_id: action_item.id,
        title: action_item.title,
        assigned_to_id: action_item.assigned_to_id,
        assigned_to_name: action_item.assigned_to.name
      })
    end
  end

  # Notify when action item is completed
  def notify_action_item_completion(action_item)
    NotificationChannel.notify_action_item_completed(action_item)

    # Update dashboard in real-time
    ActionCable.server.broadcast(
      "notifications_couple_#{action_item.couple.id}",
      {
        event: 'action_item_completed',
        action_item_id: action_item.id,
        completed_by: action_item.completed_by.name,
        completed_at: action_item.completed_at.iso8601
      }
    )
  end

  # Broadcast milestone achievement
  def broadcast_milestone_achieved(milestone)
    NotificationChannel.notify_milestone_achieved(milestone)

    # Celebrate in real-time if both partners are online
    ActionCable.server.broadcast(
      "notifications_couple_#{milestone.couple.id}",
      {
        event: 'milestone_achieved',
        milestone: {
          id: milestone.id,
          title: milestone.title,
          description: milestone.description,
          achieved_at: milestone.achieved_at.iso8601
        },
        celebration: true
      }
    )
  end

  # Send typing indicator to partner
  def broadcast_typing_indicator(context, context_id, is_typing = true)
    return unless current_user.partner

    ActionCable.server.broadcast(
      "presence_user_#{current_user.partner.id}",
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

  # Update session activity in real-time
  def broadcast_session_activity(check_in, activity_type, data = {})
    CheckInChannel.broadcast_to(
      check_in,
      data.merge(
        event: 'session_activity',
        activity_type: activity_type,
        user_id: current_user.id,
        user_name: current_user.name,
        timestamp: Time.current.iso8601
      )
    )
  end

  # Sync cursor position for collaborative editing
  def broadcast_cursor_sync(check_in, note_id, cursor_data)
    CheckInChannel.broadcast_to(
      check_in,
      {
        event: 'cursor_sync',
        note_id: note_id,
        user_id: current_user.id,
        cursor_data: cursor_data,
        timestamp: Time.current.iso8601
      }
    )
  end
end