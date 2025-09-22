class ApplicationJob < ActiveJob::Base
  # Set default queue adapter to Sidekiq
  queue_as :default

  # Automatically retry jobs that encountered a deadlock
  retry_on ActiveRecord::Deadlocked, wait: 5.seconds, attempts: 3

  # Retry network errors with exponential backoff
  retry_on ActiveRecord::ConnectionTimeoutError, wait: :exponentially_longer, attempts: 5

  # Most jobs are safe to ignore if the underlying records are no longer available
  discard_on ActiveJob::DeserializationError

  # Set default Sidekiq options
  sidekiq_options retry: 3, backtrace: true if respond_to?(:sidekiq_options)

  # Helper method for logging
  def log_info(message)
    Rails.logger.info "[#{self.class.name}][#{job_id}] #{message}"
  end

  def log_error(message, exception = nil)
    Rails.logger.error "[#{self.class.name}][#{job_id}] #{message}"
    Rails.logger.error exception.backtrace.join("\n") if exception
  end

  # Track job metrics
  around_perform do |job, block|
    started_at = Time.current
    log_info "Starting job execution"

    block.call

    duration = Time.current - started_at
    log_info "Completed in #{duration.round(2)}s"
  rescue StandardError => e
    log_error "Failed after #{(Time.current - started_at).round(2)}s", e
    raise
  end
end
