class CheckInSessionChannel < ApplicationCable::Channel
  # Enhanced Action Cable channel for synchronized check-in sessions
  # Provides real-time session state management, turn-based communication,
  # and progress tracking between partners

  def subscribed
    @check_in = find_check_in
    return reject unless @check_in && authorized?

    # Subscribe to session-specific stream
    stream_for @check_in

    # Initialize session state
    initialize_session_state

    # Notify partner of connection
    broadcast_partner_joined

    # Send current session state to new subscriber
    transmit_session_state
  rescue StandardError => e
    Rails.logger.error "CheckInSessionChannel subscription error: #{e.message}"
    reject
  end

  def unsubscribed
    return unless @check_in

    # Update session state
    remove_from_active_participants

    # Notify partner of disconnection
    broadcast_partner_left

    # Pause session if no participants remain
    pause_session_if_empty
  end

  # ========== Turn-Based Communication ==========

  # Handle turn request from a participant
  def request_turn(data)
    return unless valid_session?

    if can_take_turn?
      grant_turn_to(current_user)
      broadcast_turn_change
    else
      transmit_turn_denied
    end
  end

  # Release turn back to shared mode
  def release_turn
    return unless valid_session? && has_turn?

    @check_in.update!(current_turn_user_id: nil)
    broadcast_turn_released
  end

  # ========== Session Progress Management ==========

  # Advance to next step in the check-in flow
  def advance_step(data)
    return unless valid_session? && can_modify_session?

    new_step = data['step']
    return unless valid_step?(new_step)

    @check_in.update!(
      current_step: new_step,
      step_started_at: Time.current,
      last_activity_at: Time.current
    )

    # Track step completion times
    track_step_completion

    broadcast_step_change(new_step)
  end

  # Mark current step as complete
  def complete_step(data)
    return unless valid_session? && can_modify_session?

    step_data = {
      step: @check_in.current_step,
      completed_at: Time.current,
      duration: calculate_step_duration
    }

    # Store step completion data
    @check_in.step_completions ||= []
    @check_in.step_completions << step_data
    @check_in.save!

    broadcast_step_completed(step_data)
  end

  # ========== Note Synchronization ==========

  # Create a synchronized note
  def create_synchronized_note(data)
    return unless valid_session?

    note = @check_in.notes.create!(
      content: data['content'],
      privacy: data['privacy'] || 'shared',
      author: current_user,
      category_id: data['category_id'],
      synchronized: true,
      sync_id: SecureRandom.uuid
    )

    broadcast_note_created(note)
  end

  # Update note with conflict resolution
  def update_synchronized_note(data)
    return unless valid_session?

    note = @check_in.notes.find_by(id: data['note_id'])
    return unless note && can_edit_note?(note)

    # Handle concurrent edits with versioning
    if note.lock_version == data['version']
      note.update!(
        content: data['content'],
        updated_at: Time.current,
        last_edited_by: current_user.id
      )
      broadcast_note_updated(note)
    else
      # Conflict detected - send current version
      transmit_edit_conflict(note)
    end
  end

  # Lock note for editing
  def lock_note_for_editing(data)
    return unless valid_session?

    note = @check_in.notes.find_by(id: data['note_id'])
    return unless note && note.locked_by.nil?

    note.update!(
      locked_by: current_user.id,
      locked_at: Time.current
    )

    broadcast_note_locked(note)

    # Auto-release lock after timeout
    ReleaseNoteLockJob.set(wait: 5.minutes).perform_later(note.id)
  end

  # Release note editing lock
  def release_note_lock(data)
    note = @check_in.notes.find_by(id: data['note_id'])
    return unless note && note.locked_by == current_user.id

    note.update!(locked_by: nil, locked_at: nil)
    broadcast_note_unlocked(note)
  end

  # ========== Real-time Collaboration ==========

  # Broadcast typing indicator
  def typing_indicator(data)
    return unless valid_session?

    broadcast_to_partner({
      event: 'typing_indicator',
      user_id: current_user.id,
      user_name: current_user.name,
      context: data['context'],
      is_typing: data['is_typing']
    })
  end

  # Share cursor position for synchronized viewing
  def share_cursor(data)
    return unless valid_session?

    broadcast_to_partner({
      event: 'cursor_position',
      user_id: current_user.id,
      element_id: data['element_id'],
      position: data['position']
    })
  end

  # Highlight text for partner
  def highlight_text(data)
    return unless valid_session?

    broadcast_to_partner({
      event: 'text_highlighted',
      user_id: current_user.id,
      element_id: data['element_id'],
      selection: data['selection'],
      color: data['color'] || 'yellow'
    })
  end

  # ========== Session State Management ==========

  # Update session timer
  def update_timer(data)
    return unless valid_session?

    @check_in.update!(
      elapsed_time: data['elapsed_seconds'],
      last_activity_at: Time.current
    )

    broadcast_timer_update(data['elapsed_seconds'])
  end

  # Pause the session
  def pause_session
    return unless valid_session? && can_modify_session?

    @check_in.update!(
      status: 'paused',
      paused_at: Time.current
    )

    broadcast_session_paused
  end

  # Resume the session
  def resume_session
    return unless @check_in&.paused? && can_modify_session?

    @check_in.update!(
      status: 'in-progress',
      paused_at: nil,
      last_activity_at: Time.current
    )

    broadcast_session_resumed
  end

  # Complete the entire session
  def complete_session(data)
    return unless valid_session? && can_modify_session?

    @check_in.update!(
      status: 'completed',
      completed_at: Time.current,
      duration_minutes: calculate_total_duration,
      completion_summary: data['summary']
    )

    # Calculate and save session metrics
    save_session_metrics

    broadcast_session_completed
  end

  # ========== Emoji Reactions ==========

  # Send emoji reaction
  def send_reaction(data)
    return unless valid_session?

    reaction = {
      emoji: data['emoji'],
      user_id: current_user.id,
      user_name: current_user.name,
      timestamp: Time.current.iso8601
    }

    broadcast_reaction(reaction)
  end

  # ========== Private Methods ==========

  private

  def find_check_in
    CheckIn.find_by(id: params[:check_in_id])
  end

  def authorized?
    @check_in.couple.users.include?(current_user)
  end

  def valid_session?
    @check_in && @check_in.active? && authorized?
  end

  def can_modify_session?
    # Both partners can modify unless turn-based mode is active
    return true unless @check_in.turn_based_mode?
    has_turn?
  end

  def can_take_turn?
    @check_in.current_turn_user_id.nil? ||
    @check_in.current_turn_user_id != current_user.id
  end

  def has_turn?
    @check_in.current_turn_user_id == current_user.id
  end

  def can_edit_note?(note)
    note.author == current_user || note.shared?
  end

  def valid_step?(step)
    CheckIn::STEPS.include?(step)
  end

  def initialize_session_state
    @check_in.update!(
      active_participants: (@check_in.active_participants || []) | [current_user.id],
      last_activity_at: Time.current
    )
  end

  def remove_from_active_participants
    participants = @check_in.active_participants || []
    participants.delete(current_user.id)
    @check_in.update!(active_participants: participants)
  end

  def pause_session_if_empty
    if @check_in.active_participants.empty?
      @check_in.update!(status: 'paused', paused_at: Time.current)
    end
  end

  def grant_turn_to(user)
    @check_in.update!(
      current_turn_user_id: user.id,
      turn_started_at: Time.current
    )
  end

  def track_step_completion
    return unless @check_in.step_started_at

    duration = Time.current - @check_in.step_started_at

    @check_in.step_durations ||= {}
    @check_in.step_durations[@check_in.current_step] = duration
    @check_in.save!
  end

  def calculate_step_duration
    return 0 unless @check_in.step_started_at
    (Time.current - @check_in.step_started_at).to_i
  end

  def calculate_total_duration
    return 0 unless @check_in.started_at
    ((Time.current - @check_in.started_at) / 60).round
  end

  def save_session_metrics
    metrics = {
      total_duration: calculate_total_duration,
      notes_created: @check_in.notes.count,
      shared_notes: @check_in.notes.shared.count,
      action_items: @check_in.action_items.count,
      steps_completed: @check_in.step_completions&.count || 0,
      participation: calculate_participation_balance
    }

    @check_in.update!(session_metrics: metrics)
  end

  def calculate_participation_balance
    return 0.5 unless @check_in.notes.any?

    user_notes = @check_in.notes.where(author: current_user).count
    total_notes = @check_in.notes.count
    user_notes.to_f / total_notes
  end

  def transmit_session_state
    transmit({
      event: 'session_state',
      check_in: serialize_check_in,
      active_participants: @check_in.active_participants,
      current_turn: @check_in.current_turn_user_id
    })
  end

  def transmit_turn_denied
    transmit({
      event: 'turn_denied',
      reason: 'Another user has the turn',
      current_turn_user: @check_in.current_turn_user_id
    })
  end

  def transmit_edit_conflict(note)
    transmit({
      event: 'edit_conflict',
      note_id: note.id,
      current_version: note.lock_version,
      current_content: note.content
    })
  end

  # ========== Broadcasting Methods ==========

  def broadcast_to_partner(data)
    CheckInSessionChannel.broadcast_to(@check_in, data)
  end

  def broadcast_partner_joined
    broadcast_to_partner({
      event: 'partner_joined',
      user_id: current_user.id,
      user_name: current_user.name,
      timestamp: Time.current.iso8601
    })
  end

  def broadcast_partner_left
    broadcast_to_partner({
      event: 'partner_left',
      user_id: current_user.id,
      user_name: current_user.name,
      timestamp: Time.current.iso8601
    })
  end

  def broadcast_turn_change
    broadcast_to_partner({
      event: 'turn_changed',
      current_turn_user_id: @check_in.current_turn_user_id,
      user_name: current_user.name
    })
  end

  def broadcast_turn_released
    broadcast_to_partner({
      event: 'turn_released',
      released_by: current_user.id,
      user_name: current_user.name
    })
  end

  def broadcast_step_change(step)
    broadcast_to_partner({
      event: 'step_changed',
      new_step: step,
      changed_by: current_user.id,
      user_name: current_user.name,
      timestamp: Time.current.iso8601
    })
  end

  def broadcast_step_completed(step_data)
    broadcast_to_partner({
      event: 'step_completed',
      step_data: step_data,
      completed_by: current_user.id,
      user_name: current_user.name
    })
  end

  def broadcast_note_created(note)
    broadcast_to_partner({
      event: 'note_created',
      note: serialize_note(note),
      created_by: current_user.id
    })
  end

  def broadcast_note_updated(note)
    broadcast_to_partner({
      event: 'note_updated',
      note: serialize_note(note),
      updated_by: current_user.id
    })
  end

  def broadcast_note_locked(note)
    broadcast_to_partner({
      event: 'note_locked',
      note_id: note.id,
      locked_by: current_user.id,
      user_name: current_user.name
    })
  end

  def broadcast_note_unlocked(note)
    broadcast_to_partner({
      event: 'note_unlocked',
      note_id: note.id,
      unlocked_by: current_user.id
    })
  end

  def broadcast_timer_update(elapsed_seconds)
    broadcast_to_partner({
      event: 'timer_updated',
      elapsed_seconds: elapsed_seconds,
      updated_by: current_user.id
    })
  end

  def broadcast_session_paused
    broadcast_to_partner({
      event: 'session_paused',
      paused_by: current_user.id,
      user_name: current_user.name,
      timestamp: Time.current.iso8601
    })
  end

  def broadcast_session_resumed
    broadcast_to_partner({
      event: 'session_resumed',
      resumed_by: current_user.id,
      user_name: current_user.name,
      timestamp: Time.current.iso8601
    })
  end

  def broadcast_session_completed
    broadcast_to_partner({
      event: 'session_completed',
      completed_by: current_user.id,
      user_name: current_user.name,
      metrics: @check_in.session_metrics,
      timestamp: Time.current.iso8601
    })
  end

  def broadcast_reaction(reaction)
    broadcast_to_partner({
      event: 'reaction_received',
      reaction: reaction
    })
  end

  # ========== Serialization ==========

  def serialize_check_in
    {
      id: @check_in.id,
      status: @check_in.status,
      current_step: @check_in.current_step,
      started_at: @check_in.started_at&.iso8601,
      elapsed_time: @check_in.elapsed_time,
      turn_based_mode: @check_in.turn_based_mode?,
      current_turn_user_id: @check_in.current_turn_user_id
    }
  end

  def serialize_note(note)
    {
      id: note.id,
      content: note.content,
      privacy: note.privacy,
      author_id: note.author_id,
      author_name: note.author.name,
      category_id: note.category_id,
      synchronized: note.synchronized,
      sync_id: note.sync_id,
      lock_version: note.lock_version,
      locked_by: note.locked_by,
      created_at: note.created_at.iso8601,
      updated_at: note.updated_at.iso8601
    }
  end
end