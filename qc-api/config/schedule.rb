# Use this file to easily define all of your cron jobs.
# It uses the whenever gem syntax.
# Learn more: https://github.com/javan/whenever

# Set the environment
set :environment, ENV['RAILS_ENV'] || 'development'

# Set the output for cron logs
set :output, {
  error: 'log/cron_error.log',
  standard: 'log/cron.log'
}

# Set the job template to use Sidekiq
set :job_template, "bash -l -c ':job'"

job_type :sidekiq, "cd :path && :environment_variable=:environment bundle exec sidekiq-cron :task :output"
job_type :runner, "cd :path && bin/rails runner -e :environment ':task' :output"
job_type :rake, "cd :path && :environment_variable=:environment bundle exec rake :task --silent :output"

# Daily Jobs
every 1.day, at: '9:00 am' do
  runner 'CheckInReminderJob.perform_later'
end

every 1.day, at: '10:00 pm' do
  runner 'CheckInReminderJob.perform_later'
end

# Weekly Jobs
every :monday, at: '8:00 am' do
  runner 'WeeklySummaryJob.perform_later'
end

# Hourly Jobs
every 1.hour do
  runner 'MilestoneCalculationJob.perform_later'
end

# Every 30 minutes
every 30.minutes do
  runner 'ReminderDeliveryJob.perform_later'
end

# Maintenance Jobs
every 1.day, at: '3:00 am' do
  runner 'DataCleanupJob.perform_later("all")'
end

every 6.hours do
  runner 'DataCleanupJob.perform_later("notifications")'
end

every 1.day, at: '2:00 am' do
  runner 'DataCleanupJob.perform_later("sessions")'
end

# Custom schedule for different environments
if @environment == 'production'
  every 5.minutes do
    runner 'HealthCheckJob.perform_later'
  end

  every 1.day, at: '4:00 am' do
    runner 'BackupJob.perform_later'
  end
end

# Development environment schedules (less frequent)
if @environment == 'development'
  every 1.hour do
    runner 'CheckInReminderJob.perform_later'
  end
end