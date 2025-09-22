class DataCleanupJob < ApplicationJob
  queue_as :maintenance

  def perform(cleanup_type = 'all')
    log_info "Starting data cleanup: #{cleanup_type}"

    case cleanup_type
    when 'notifications'
      cleanup_old_notifications
    when 'sessions'
      cleanup_abandoned_sessions
    when 'drafts'
      cleanup_old_drafts
    when 'logs'
      cleanup_old_logs
    when 'all'
      cleanup_old_notifications
      cleanup_abandoned_sessions
      cleanup_old_drafts
      cleanup_old_logs
    else
      log_error "Unknown cleanup type: #{cleanup_type}"
    end

    log_info "Completed data cleanup: #{cleanup_type}"
  end

  private

  def cleanup_old_notifications
    log_info "Cleaning up old notifications"

    # Delete read notifications older than 30 days
    deleted = Notification.where(
      'read = ? AND read_at < ?',
      true,
      30.days.ago
    ).delete_all

    log_info "Deleted #{deleted} old read notifications"

    # Archive important unread notifications older than 60 days
    archived = Notification.where(
      'read = ? AND created_at < ? AND notification_type IN (?)',
      false,
      60.days.ago,
      ['milestone_achieved', 'relationship_request']
    ).update_all(
      archived: true,
      archived_at: Time.current
    )

    log_info "Archived #{archived} important old notifications"

    # Delete other unread notifications older than 90 days
    deleted_unread = Notification.where(
      'read = ? AND created_at < ? AND archived != ?',
      false,
      90.days.ago,
      true
    ).delete_all

    log_info "Deleted #{deleted_unread} old unread notifications"
  end

  def cleanup_abandoned_sessions
    log_info "Cleaning up abandoned check-in sessions"

    # Find sessions started but not completed after 24 hours
    abandoned = CheckIn.where(
      status: ['in_progress', 'started'],
      updated_at: ..24.hours.ago
    )

    abandoned.find_each do |check_in|
      # Save any partial data
      save_partial_session_data(check_in)

      # Mark as abandoned
      check_in.update!(
        status: 'abandoned',
        abandoned_at: Time.current,
        metadata: check_in.metadata.merge(
          'auto_abandoned' => true,
          'abandoned_reason' => 'timeout'
        )
      )
    end

    log_info "Marked #{abandoned.count} sessions as abandoned"
  end

  def cleanup_old_drafts
    log_info "Cleaning up old draft notes"

    # Delete draft notes older than 7 days
    deleted = Note.where(
      privacy_level: 'draft',
      updated_at: ..7.days.ago
    ).delete_all

    log_info "Deleted #{deleted} old draft notes"

    # Clean up orphaned notes (no check-in association)
    orphaned = Note.left_joins(:check_in)
                   .where(check_ins: { id: nil })
                   .where('notes.created_at < ?', 1.day.ago)
                   .delete_all

    log_info "Deleted #{orphaned} orphaned notes"
  end

  def cleanup_old_logs
    log_info "Cleaning up old activity logs"

    # Delete old job logs
    if defined?(Sidekiq::Job)
      Sidekiq::Job.where('created_at < ?', 7.days.ago).delete_all
    end

    # Clean up old audit logs if they exist
    if defined?(AuditLog)
      deleted = AuditLog.where('created_at < ?', 90.days.ago).delete_all
      log_info "Deleted #{deleted} old audit logs"
    end

    # Clean up Rails logs (if file-based)
    cleanup_log_files
  end

  def save_partial_session_data(check_in)
    # Create a summary of the incomplete session
    summary = {
      started_at: check_in.created_at,
      last_activity: check_in.updated_at,
      completed_steps: check_in.completed_steps || [],
      notes_count: check_in.notes.count,
      categories_discussed: check_in.categories_discussed || []
    }

    # Store in metadata for potential recovery
    check_in.metadata['abandoned_session_summary'] = summary
    check_in.save!

    log_info "Saved partial data for abandoned session ##{check_in.id}"
  end

  def cleanup_log_files
    log_dir = Rails.root.join('log')
    return unless Dir.exist?(log_dir)

    # Remove logs older than 30 days
    Dir.glob(File.join(log_dir, '*.log.*')).each do |file|
      if File.mtime(file) < 30.days.ago
        File.delete(file)
        log_info "Deleted old log file: #{File.basename(file)}"
      end
    end

    # Truncate current log if too large (> 100MB)
    current_log = File.join(log_dir, "#{Rails.env}.log")
    if File.exist?(current_log) && File.size(current_log) > 100.megabytes
      File.truncate(current_log, 0)
      log_info "Truncated large log file: #{Rails.env}.log"
    end
  end
end