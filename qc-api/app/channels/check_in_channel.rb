class CheckInChannel < ApplicationCable::Channel
  def subscribed
    check_in = CheckIn.find(params[:check_in_id])

    # Verify user has access to this check-in
    if check_in.couple.users.include?(current_user)
      stream_for check_in

      # Notify partner that user has joined the session
      broadcast_user_joined(check_in)

      # Update user's presence in the check-in
      mark_user_present(check_in)
    else
      reject
    end
  rescue ActiveRecord::RecordNotFound
    reject
  end

  def unsubscribed
    if params[:check_in_id].present?
      check_in = CheckIn.find_by(id: params[:check_in_id])
      if check_in
        broadcast_user_left(check_in)
        mark_user_absent(check_in)
      end
    end
  end

  # Called when user updates their note content
  def update_note(data)
    check_in = CheckIn.find(data['check_in_id'])
    note = check_in.notes.find_by(id: data['note_id'], author: current_user)

    if note
      note.update!(content: data['content'], updated_at: Time.current)

      # Broadcast note update to partner if it's shared
      if note.shared?
        CheckInChannel.broadcast_to(check_in, {
          event: 'note_updated',
          note_id: note.id,
          content: note.content,
          author_id: current_user.id,
          author_name: current_user.name,
          updated_at: note.updated_at.iso8601
        })
      end
    end
  end

  # Called when user creates a new note
  def create_note(data)
    check_in = CheckIn.find(data['check_in_id'])

    note = check_in.notes.create!(
      content: data['content'],
      privacy: data['privacy'] || 'draft',
      author: current_user,
      category_id: data['category_id']
    )

    # Broadcast to both partners if shared
    if note.shared?
      CheckInChannel.broadcast_to(check_in, {
        event: 'note_created',
        note: serialize_note(note)
      })
    end
  end

  # Called when user changes privacy level of a note
  def change_privacy(data)
    check_in = CheckIn.find(data['check_in_id'])
    note = check_in.notes.find_by(id: data['note_id'], author: current_user)

    if note
      old_privacy = note.privacy
      note.update!(privacy: data['privacy'])

      # Notify partner when note becomes shared
      if old_privacy != 'shared' && note.shared?
        CheckInChannel.broadcast_to(check_in, {
          event: 'note_shared',
          note: serialize_note(note)
        })
      elsif old_privacy == 'shared' && !note.shared?
        CheckInChannel.broadcast_to(check_in, {
          event: 'note_unshared',
          note_id: note.id
        })
      end
    end
  end

  # Called when user advances to next step
  def advance_step(data)
    check_in = CheckIn.find(data['check_in_id'])

    if check_in.active? && data['next_step'].present?
      check_in.update!(
        current_step: data['next_step'],
        last_activity_at: Time.current
      )

      CheckInChannel.broadcast_to(check_in, {
        event: 'step_advanced',
        current_step: check_in.current_step,
        advanced_by: current_user.id,
        advanced_by_name: current_user.name
      })
    end
  end

  # Called when user adds a typing indicator
  def typing(data)
    check_in = CheckIn.find(data['check_in_id'])

    CheckInChannel.broadcast_to(check_in, {
      event: 'typing',
      user_id: current_user.id,
      user_name: current_user.name,
      note_id: data['note_id'],
      is_typing: data['is_typing']
    })
  end

  # Called when user completes the session
  def complete_session(data)
    check_in = CheckIn.find(data['check_in_id'])

    if check_in.active?
      check_in.update!(
        status: 'completed',
        completed_at: Time.current,
        duration_minutes: ((Time.current - check_in.started_at) / 60).round
      )

      CheckInChannel.broadcast_to(check_in, {
        event: 'session_completed',
        completed_by: current_user.id,
        completed_by_name: current_user.name,
        duration_minutes: check_in.duration_minutes
      })
    end
  end

  # Called for real-time cursor/selection sync
  def sync_cursor(data)
    check_in = CheckIn.find(data['check_in_id'])

    CheckInChannel.broadcast_to(check_in, {
      event: 'cursor_sync',
      user_id: current_user.id,
      user_name: current_user.name,
      note_id: data['note_id'],
      cursor_position: data['cursor_position'],
      selection: data['selection']
    })
  end

  private

  def broadcast_user_joined(check_in)
    CheckInChannel.broadcast_to(check_in, {
      event: 'user_joined',
      user_id: current_user.id,
      user_name: current_user.name,
      timestamp: Time.current.iso8601
    })
  end

  def broadcast_user_left(check_in)
    CheckInChannel.broadcast_to(check_in, {
      event: 'user_left',
      user_id: current_user.id,
      user_name: current_user.name,
      timestamp: Time.current.iso8601
    })
  end

  def mark_user_present(check_in)
    # Track which users are actively in the session
    participants = check_in.participants || []
    unless participants.include?(current_user.id)
      participants << current_user.id
      check_in.update_columns(
        participants: participants,
        last_activity_at: Time.current
      )
    end
  end

  def mark_user_absent(check_in)
    # Remove user from active participants
    if check_in.participants&.include?(current_user.id)
      check_in.update_columns(
        participants: check_in.participants - [current_user.id]
      )
    end
  end

  def serialize_note(note)
    {
      id: note.id,
      content: note.content,
      privacy: note.privacy,
      author_id: note.author_id,
      author_name: note.author.name,
      category_id: note.category_id,
      created_at: note.created_at.iso8601,
      updated_at: note.updated_at.iso8601
    }
  end
end