# frozen_string_literal: true

namespace :code_analysis do
  desc "Run all code analysis tools"
  task all: [:debride, :brakeman, :rubocop]

  desc "Find unused code with Debride"
  task debride: :environment do
    puts "\n🔍 Running Debride to find unused code..."
    puts "=" * 80

    begin
      # Run debride via shell command for simplicity
      # Use --rails flag for Rails-specific method handling
      cmd = "bundle exec debride --rails app/ lib/ 2>&1"

      output = `#{cmd}`
      puts output

      # Count the methods found
      method_count = output.scan(/^\s+\w+\s+/).count
      loc_match = output.match(/Total suspect LOC: (\d+)/)
      total_loc = loc_match ? loc_match[1] : "unknown"

      puts "=" * 80
      puts "\n📊 Summary:"
      puts "  • #{method_count} potentially unused methods"
      puts "  • #{total_loc} lines of code"

      if method_count == 0
        puts "\n✅ No unused code found!"
      else
        puts "\n⚠️  Review the methods above - they may be unused or called dynamically"
      end

      puts "=" * 80
    rescue => e
      puts "❌ Error running Debride: #{e.message}"
      puts e.backtrace.first(5)
      exit 1
    end
  end

  desc "Run Brakeman security scanner"
  task :brakeman do
    puts "\n🔒 Running Brakeman security scanner..."
    puts "=" * 80
    sh "bundle exec brakeman -q -z --no-pager" do |ok, _res|
      unless ok
        puts "⚠️  Brakeman found security issues"
      end
    end
    puts "=" * 80
  end

  desc "Run RuboCop style checker"
  task :rubocop do
    puts "\n📋 Running RuboCop style checker..."
    puts "=" * 80
    sh "bundle exec rubocop" do |ok, _res|
      unless ok
        puts "⚠️  RuboCop found style issues"
      end
    end
    puts "=" * 80
  end

  desc "Quick analysis (debride only)"
  task quick: [:debride]
end

# Add a shortcut task
desc "Run code analysis (debride)"
task debride: "code_analysis:debride"
