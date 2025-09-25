ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "minitest/rails"
require "minitest/reporters"
require "minitest/spec"
require "factory_bot_rails"
require "faker"
require "database_cleaner/active_record"
require "webmock/minitest"
require "vcr"
require "simplecov"

# Start SimpleCov for code coverage
if ENV["COVERAGE"] || ENV["CI"]
  SimpleCov.start "rails" do
    add_filter "/test/"
    add_filter "/config/"
    add_filter "/vendor/"
    add_group "Models", "app/models"
    add_group "Controllers", "app/controllers"
    add_group "Serializers", "app/serializers"
    add_group "Jobs", "app/jobs"
    add_group "Mailers", "app/mailers"
  end
end

# Reporter configuration for better test output
Minitest::Reporters.use!(
  Minitest::Reporters::ProgressReporter.new,
  ENV,
  Minitest.backtrace_filter
)

# Load support files
Dir[Rails.root.join("test/support/**/*.rb")].sort.each { |f| require f }

# VCR configuration for recording HTTP interactions
VCR.configure do |config|
  config.cassette_library_dir = "test/vcr_cassettes"
  config.hook_into :webmock
  config.ignore_localhost = true
  config.allow_http_connections_when_no_cassette = false

  # Filter sensitive data
  config.filter_sensitive_data("<JWT_SECRET>") { ENV["DEVISE_JWT_SECRET_KEY"] }
  config.filter_sensitive_data("<DATABASE_URL>") { ENV["DATABASE_URL"] }
  config.filter_sensitive_data("<REDIS_URL>") { ENV["REDIS_URL"] }
end

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order
    fixtures :all if respond_to?(:fixtures)

    # Include FactoryBot methods
    include FactoryBot::Syntax::Methods

    # Database cleaner setup
    def setup
      DatabaseCleaner.start
      super
    end

    def teardown
      super
      DatabaseCleaner.clean
    end
  end
end

class ActionDispatch::IntegrationTest
  # Include Devise test helpers for authentication
  include Devise::Test::IntegrationHelpers

  # Include custom test helpers
  include ApiTestHelper
  include AuthTestHelper
end

# Configure Database Cleaner
DatabaseCleaner.strategy = :transaction
DatabaseCleaner.clean_with(:truncation)

# WebMock configuration
WebMock.disable_net_connect!(allow_localhost: true)