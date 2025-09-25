namespace :import do
  desc "Import localStorage data from JSON file or stdin"
  task :localstorage, [ :file_path ] => :environment do |task, args|
    Rails.logger = Logger.new($stdout)

    # Get JSON data from file or stdin
    json_data = if args[:file_path].present?
      Rails.logger.info "Reading data from file: #{args[:file_path]}"
      begin
        File.read(args[:file_path])
      rescue Errno::ENOENT => e
        Rails.logger.error "File not found: #{args[:file_path]}"
        exit 1
      end
    elsif !$stdin.tty? || !$stdin.eof?
      Rails.logger.info "Reading data from stdin..."
      $stdin.read
    else
      Rails.logger.error "No data provided. Usage:"
      Rails.logger.error "  rails import:localstorage[path/to/file.json]"
      Rails.logger.error "  OR"
      Rails.logger.error "  cat data.json | rails import:localstorage"
      exit 1
    end

    # Import the data
    importer = DataImporter.new(json_data)

    if importer.import!
      Rails.logger.info "✅ Import completed successfully!"
    else
      Rails.logger.error "❌ Import failed with errors:"
      importer.errors.each { |error| Rails.logger.error "  - #{error}" }
      exit 1
    end
  end

  desc "Export current database data to localStorage JSON format"
  task :export, [ :couple_id, :output_file ] => :environment do |task, args|
    Rails.logger = Logger.new($stdout)

    importer = DataImporter.new({})

    # Export data
    Rails.logger.info "Exporting data..."
    data = importer.export_current_data(args[:couple_id])

    if data.empty?
      Rails.logger.error "No data found to export"
      exit 1
    end

    json_output = JSON.pretty_generate(data)

    # Output to file or stdout
    if args[:output_file].present?
      File.write(args[:output_file], json_output)
      Rails.logger.info "✅ Data exported to #{args[:output_file]}"
    else
      puts json_output
    end
  end

  desc "Validate localStorage JSON data without importing"
  task :validate, [ :file_path ] => :environment do |task, args|
    Rails.logger = Logger.new($stdout)

    # Get JSON data
    json_data = if args[:file_path].present?
      begin
        File.read(args[:file_path])
      rescue Errno::ENOENT => e
        Rails.logger.error "File not found: #{args[:file_path]}"
        exit 1
      end
    elsif !$stdin.tty? || !$stdin.eof?
      $stdin.read
    else
      Rails.logger.error "No data provided"
      exit 1
    end

    # Parse and validate
    begin
      data = JSON.parse(json_data)
      Rails.logger.info "✅ JSON is valid"

      # Check for expected structure
      Rails.logger.info "\nData structure:"
      Rails.logger.info "  • Users: #{data['users']&.count || 0}"
      Rails.logger.info "  • Couple: #{data['couple'].present? ? 'Yes' : 'No'}"
      Rails.logger.info "  • Categories: #{data['categories']&.count || 0}"
      Rails.logger.info "  • Check-ins: #{data['checkins']&.count || 0}"
      Rails.logger.info "  • Notes: #{data['notes']&.count || 0}"
      Rails.logger.info "  • Action Items: #{data['actionItems']&.count || 0}"
      Rails.logger.info "  • Milestones: #{data['milestones']&.count || 0}"
      Rails.logger.info "  • Reminders: #{data['reminders']&.count || 0}"

      # Validate required fields
      warnings = []

      if data["users"].present?
        data["users"].each_with_index do |user, index|
          warnings << "User #{index} missing email" unless user["email"].present?
          warnings << "User #{index} missing name" unless user["name"].present?
        end
      else
        warnings << "No users found in data"
      end

      unless data["couple"].present?
        warnings << "No couple data found"
      end

      if warnings.any?
        Rails.logger.warn "\n⚠️  Warnings:"
        warnings.each { |warning| Rails.logger.warn "  - #{warning}" }
      end

    rescue JSON::ParserError => e
      Rails.logger.error "❌ Invalid JSON: #{e.message}"
      exit 1
    end
  end

  desc "Import sample localStorage data for testing"
  task sample: :environment do
    Rails.logger = Logger.new($stdout)

    sample_data = {
      users: [
        {
          id: "user_1",
          email: "test1@example.com",
          name: "Test User One",
          pronouns: "they/them",
          loveLanguages: [ "quality_time", "words_of_affirmation" ]
        },
        {
          id: "user_2",
          email: "test2@example.com",
          name: "Test User Two",
          pronouns: "she/her",
          loveLanguages: [ "acts_of_service", "physical_touch" ]
        }
      ],
      couple: {
        id: "couple_1",
        name: "Test Couple",
        anniversary: 1.year.ago.iso8601
      },
      categories: [
        {
          id: "cat_1",
          name: "Communication",
          icon: "💬",
          description: "How we talk to each other",
          prompts: [ "How was our communication this week?" ],
          isCustom: false,
          order: 0
        }
      ],
      checkins: [
        {
          id: "checkin_1",
          participants: [ "user_1", "user_2" ],
          startedAt: 1.week.ago.iso8601,
          completedAt: (1.week.ago + 45.minutes).iso8601,
          status: "completed",
          categories: [ "cat_1" ],
          moodBefore: 6,
          moodAfter: 8,
          reflection: "Great session, we made progress",
          notes: [
            {
              content: "We need to work on active listening",
              privacyLevel: "shared",
              categoryId: "cat_1",
              userId: "user_1"
            }
          ],
          actionItems: [
            {
              title: "Schedule weekly date night",
              description: "Every Friday evening",
              assignedTo: "user_1",
              dueDate: 1.week.from_now.iso8601,
              priority: "high",
              category: "shared"
            }
          ]
        }
      ],
      milestones: [
        {
          title: "First Check-in",
          description: "We completed our first check-in together",
          achievedAt: 1.week.ago.iso8601,
          category: "communication"
        }
      ],
      reminders: [
        {
          userId: "user_1",
          reminderType: "check_in",
          frequency: "weekly",
          dayOfWeek: 0,
          timeOfDay: "19:00",
          enabled: true,
          message: "Time for your weekly check-in!"
        }
      ]
    }

    Rails.logger.info "Importing sample data..."
    importer = DataImporter.new(sample_data)

    if importer.import!
      Rails.logger.info "✅ Sample data imported successfully!"
      Rails.logger.info "You can now test with:"
      Rails.logger.info "  • Email: test1@example.com"
      Rails.logger.info "  • Email: test2@example.com"
      Rails.logger.info "  (Password reset required for login)"
    else
      Rails.logger.error "❌ Sample import failed"
      importer.errors.each { |error| Rails.logger.error "  - #{error}" }
      exit 1
    end
  end

  desc "Clean imported test data"
  task clean: :environment do
    Rails.logger = Logger.new($stdout)

    if Rails.env.production?
      Rails.logger.error "Cannot clean data in production!"
      exit 1
    end

    Rails.logger.info "Cleaning test import data..."

    # Find and destroy test users and their associated data
    test_emails = [ "test1@example.com", "test2@example.com" ]
    test_users = User.where(email: test_emails)

    if test_users.any?
      test_couple = test_users.first.couple

      if test_couple
        # Clean associated data
        ActionItem.joins(:check_in).where(check_ins: { couple_id: test_couple.id }).destroy_all
        Note.where(couple_id: test_couple.id).destroy_all
        CheckIn.where(couple_id: test_couple.id).destroy_all
        Milestone.where(couple_id: test_couple.id).destroy_all
        Reminder.where(couple_id: test_couple.id).destroy_all
        SessionSetting.where(couple_id: test_couple.id).destroy_all
        Category.where(couple_id: test_couple.id).destroy_all

        Rails.logger.info "  ✓ Cleaned couple data"
      end

      test_users.destroy_all
      test_couple&.destroy

      Rails.logger.info "  ✓ Cleaned test users"
      Rails.logger.info "✅ Test data cleaned successfully"
    else
      Rails.logger.info "No test data found to clean"
    end
  end
end

namespace :data do
  desc "Interactive localStorage data import wizard"
  task import_wizard: :environment do
    require "io/console"

    Rails.logger = Logger.new($stdout)

    Rails.logger.info "="*60
    Rails.logger.info "📦 localStorage Data Import Wizard"
    Rails.logger.info "="*60

    # Step 1: Choose input method
    Rails.logger.info "\nHow would you like to provide the data?"
    Rails.logger.info "  1) From a JSON file"
    Rails.logger.info "  2) Paste JSON data"
    Rails.logger.info "  3) Use sample data"
    print "\nChoice (1-3): "

    choice = $stdin.gets.chomp

    json_data = case choice
    when "1"
      print "Enter file path: "
      file_path = $stdin.gets.chomp
      begin
        File.read(file_path)
      rescue Errno::ENOENT
        Rails.logger.error "File not found: #{file_path}"
        exit 1
      end
    when "2"
      Rails.logger.info "Paste your JSON data (press Ctrl+D when done):"
      $stdin.read
    when "3"
      Rails.logger.info "Using sample data..."
      Rake::Task["import:sample"].invoke
      exit 0
    else
      Rails.logger.error "Invalid choice"
      exit 1
    end

    # Step 2: Validate data
    Rails.logger.info "\nValidating data..."

    begin
      data = JSON.parse(json_data)
      Rails.logger.info "✅ JSON is valid"

      # Show summary
      Rails.logger.info "\nData summary:"
      Rails.logger.info "  • #{data['users']&.count || 0} users"
      Rails.logger.info "  • #{data['checkins']&.count || 0} check-ins"
      Rails.logger.info "  • #{data['notes']&.count || 0} notes"
      Rails.logger.info "  • #{data['actionItems']&.count || 0} action items"

    rescue JSON::ParserError => e
      Rails.logger.error "❌ Invalid JSON: #{e.message}"
      exit 1
    end

    # Step 3: Confirm import
    print "\nProceed with import? (y/n): "
    confirm = $stdin.gets.chomp.downcase

    unless confirm == "y"
      Rails.logger.info "Import cancelled"
      exit 0
    end

    # Step 4: Import
    Rails.logger.info "\nImporting data..."
    importer = DataImporter.new(json_data)

    if importer.import!
      Rails.logger.info "\n" + "="*60
      Rails.logger.info "✅ Import completed successfully!"
      Rails.logger.info "="*60
    else
      Rails.logger.error "\n❌ Import failed"
      importer.errors.each { |error| Rails.logger.error "  - #{error}" }
      exit 1
    end
  end
end
