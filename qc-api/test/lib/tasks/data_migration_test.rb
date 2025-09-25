require 'test_helper'
require 'rake'

class DataMigrationTasksTest < ActiveSupport::TestCase
  def setup
    @rake = Rake::Application.new
    Rake.application = @rake
    Rake.application.rake_require 'tasks/data_migration', [Rails.root.to_s], []
    Rake::Task.define_task(:environment)
  end

  def teardown
    Rake.application.clear
  end

  # Tests for data:migrate_from_localstorage task
  class MigrateFromLocalstorageTest < ActiveSupport::TestCase
    def setup
      super
      @task = Rake::Task['data:migrate_from_localstorage']
      @task.reenable if @task

      @valid_json = {
        users: [
          {
            email: 'test@example.com',
            name: 'Test User',
            pronouns: 'they/them',
            loveLanguages: ['quality_time']
          }
        ],
        couple: {
          name: 'Test Couple',
          anniversary: '2022-01-01'
        },
        categories: [
          {
            name: 'Test Category',
            icon: '🎯',
            description: 'Test description',
            prompts: ['Test prompt'],
            isCustom: false
          }
        ],
        checkins: [],
        milestones: []
      }.to_json
    end

    test "migrates user data successfully with valid JSON" do
      ENV['DATA'] = @valid_json

      assert_difference 'User.count', 1 do
        @task.invoke
      end

      user = User.last
      assert_equal 'test@example.com', user.email
      assert_equal 'Test User', user.name
      assert_equal 'they/them', user.pronouns
      assert_includes user.love_languages, 'quality_time'
    end

    test "migrates couple data successfully with valid JSON" do
      ENV['DATA'] = @valid_json

      assert_difference 'Couple.count', 1 do
        @task.invoke
      end

      couple = Couple.last
      assert_equal 'Test Couple', couple.name
      assert_includes couple.anniversary.to_s, '2022-01-01'
    end

    test "migrates category data successfully with valid JSON" do
      ENV['DATA'] = @valid_json

      assert_difference -> { Category.count }, ->(count) { count >= 1 } do
        @task.invoke
      end

      category = Category.find_by(name: 'Test Category')
      assert category.present?
      assert_equal '🎯', category.icon
      assert_equal 'Test description', category.description
      assert_includes category.prompts, 'Test prompt'
    end

    test "displays usage instructions without data" do
      ENV['DATA'] = nil

      assert_output(/Usage: rails data:migrate_from_localstorage/) do
        @task.invoke
      end
    end

    test "handles parse errors gracefully with invalid JSON" do
      ENV['DATA'] = 'invalid json'

      assert_raises(SystemExit) do
        @task.invoke
      end
    end
  end

  # Tests for data:reset_demo task
  class ResetDemoTest < ActiveSupport::TestCase
    def setup
      super
      @task = Rake::Task['data:reset_demo']
      @task.reenable if @task
      Rails.env.stub(:production?, false) do
        # Test setup
      end
    end

    test "clears existing data" do
      create(:user)
      create(:couple)
      create(:category)

      # Since we're in test environment, we need to mock the environment check
      Rails.env.stub(:production?, false) do
        @task.invoke

        assert_equal 0, User.count
        assert_equal 0, Couple.count
      end
    end

    test "prevents execution in production" do
      Rails.env.stub(:production?, true) do
        assert_raises(SystemExit) do
          @task.invoke
        end
      end
    end
  end
end