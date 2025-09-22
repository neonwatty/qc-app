require_relative "boot"

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_mailbox/engine"
require "action_text/engine"
require "action_view/railtie"
require "action_cable/engine"
# require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module QcApi
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 8.0

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Database connection pool configuration
    # Async query executor for improved concurrency
    config.active_record.async_query_executor = :global_thread_pool

    # Maximum number of threads for async queries
    config.active_record.global_executor_concurrency = ENV.fetch("ASYNC_QUERY_CONCURRENCY", 4).to_i

    # Enable query logs in development for debugging
    config.active_record.query_log_tags_enabled = Rails.env.development?

    # Raise errors on unpermitted parameters in development/test
    config.action_controller.action_on_unpermitted_parameters = :raise if Rails.env.development? || Rails.env.test?

    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.
    config.api_only = true

    # JWT Configuration
    config.jwt = ActiveSupport::OrderedOptions.new
    config.jwt.secret_key = ENV.fetch("JWT_SECRET_KEY") { Rails.application.credentials.jwt_secret_key || SecureRandom.hex(64) }
    config.jwt.expiry = ENV.fetch("JWT_EXPIRY_HOURS", 24).to_i.hours
  end
end
