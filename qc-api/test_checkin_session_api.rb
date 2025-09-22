#!/usr/bin/env ruby
require 'bundler/setup'
require 'active_support/all'

puts "Testing CheckIn Session API..."
puts "=" * 50

# Test CheckInsController enhancements
puts "\n1. Testing Enhanced CheckInsController:"
begin
  require_relative 'config/environment'

  controller_class = Api::V1::CheckInsController
  puts "   ✅ CheckInsController loaded"

  # Test new session management methods
  session_methods = [:start, :abandon, :move_step, :add_participant, :add_category, :progress, :statistics]
  session_methods.each do |method|
    if controller_class.instance_methods.include?(method)
      puts "   ✅ Method ##{method} exists"
    else
      puts "   ❌ Method ##{method} missing"
    end
  end

  # Test helper methods
  helper_methods = [:validate_session_access!, :check_session_timeout!, :broadcast_session_update,
                   :get_participants_info, :estimate_remaining_time, :calculate_mood_improvement]
  helper_methods.each do |method|
    if controller_class.private_instance_methods.include?(method) || controller_class.instance_methods.include?(method)
      puts "   ✅ Helper ##{method} exists"
    else
      puts "   ❌ Helper ##{method} missing"
    end
  end
rescue => e
  puts "   ❌ Error loading CheckInsController: #{e.message}"
end

# Test NotesController enhancements
puts "\n2. Testing Enhanced NotesController:"
begin
  controller_class = Api::V1::NotesController
  puts "   ✅ NotesController loaded"

  # Test new note management methods
  note_methods = [:publish, :make_private, :by_step, :summary]
  note_methods.each do |method|
    if controller_class.instance_methods.include?(method)
      puts "   ✅ Method ##{method} exists"
    else
      puts "   ❌ Method ##{method} missing"
    end
  end

  # Test helper methods
  helper_methods = [:validate_session_active!, :notify_partner_if_shared, :update_session_activity,
                   :notes_by_category, :notes_by_author, :total_word_count]
  helper_methods.each do |method|
    if controller_class.private_instance_methods.include?(method) || controller_class.instance_methods.include?(method)
      puts "   ✅ Helper ##{method} exists"
    else
      puts "   ❌ Helper ##{method} missing"
    end
  end
rescue => e
  puts "   ❌ Error loading NotesController: #{e.message}"
end

# Test model state management
puts "\n3. Testing CheckIn Model State Management:"
begin
  check_in = CheckIn.new

  # Test state transition methods
  state_methods = [:start!, :complete!, :abandon!, :move_to_step!, :enter_review!]
  state_methods.each do |method|
    if check_in.respond_to?(method)
      puts "   ✅ State method ##{method} exists"
    else
      puts "   ❌ State method ##{method} missing"
    end
  end

  # Test status check methods
  status_methods = [:completed?, :in_progress?, :preparing?, :reviewing?, :abandoned?, :active?]
  status_methods.each do |method|
    if check_in.respond_to?(method)
      puts "   ✅ Status method ##{method} exists"
    else
      puts "   ❌ Status method ##{method} missing"
    end
  end

  # Test progress methods
  progress_methods = [:calculate_progress_percentage, :duration, :add_participant, :add_category]
  progress_methods.each do |method|
    if check_in.respond_to?(method)
      puts "   ✅ Progress method ##{method} exists"
    else
      puts "   ❌ Progress method ##{method} missing"
    end
  end

  # Test constants
  puts "   ✅ CheckIn::STATUSES defined" if defined?(CheckIn::STATUSES)
  puts "   ✅ CheckIn::STEPS defined" if defined?(CheckIn::STEPS)
rescue => e
  puts "   ❌ Error testing CheckIn model: #{e.message}"
end

# Test Note model privacy features
puts "\n4. Testing Note Model Privacy Features:"
begin
  note = Note.new

  # Test privacy methods
  privacy_methods = [:private?, :shared?, :draft?, :publish!, :make_private!,
                    :can_be_viewed_by?, :can_be_edited_by?]
  privacy_methods.each do |method|
    if note.respond_to?(method)
      puts "   ✅ Privacy method ##{method} exists"
    else
      puts "   ❌ Privacy method ##{method} missing"
    end
  end

  # Test scopes
  scopes = [:private_notes, :shared_notes, :drafts, :viewable_by, :by_author, :with_tags]
  scopes.each do |scope|
    if Note.respond_to?(scope)
      puts "   ✅ Scope .#{scope} exists"
    else
      puts "   ❌ Scope .#{scope} missing"
    end
  end

  # Test utility methods
  utility_methods = [:add_tag, :remove_tag, :word_count, :reading_time_minutes]
  utility_methods.each do |method|
    if note.respond_to?(method)
      puts "   ✅ Utility method ##{method} exists"
    else
      puts "   ❌ Utility method ##{method} missing"
    end
  end
rescue => e
  puts "   ❌ Error testing Note model: #{e.message}"
end

# Test routes configuration
puts "\n5. Testing Routes Configuration:"
begin
  routes = Rails.application.routes.routes.map { |r| r.path.spec.to_s }

  # Test CheckIn routes
  checkin_routes = [
    "/api/v1/couples/:couple_id/check_ins/:id/start",
    "/api/v1/couples/:couple_id/check_ins/:id/abandon",
    "/api/v1/couples/:couple_id/check_ins/:id/move_step",
    "/api/v1/couples/:couple_id/check_ins/:id/add_participant",
    "/api/v1/couples/:couple_id/check_ins/:id/progress",
    "/api/v1/couples/:couple_id/check_ins/statistics"
  ]

  checkin_routes.each do |route|
    if routes.any? { |r| r.include?(route.gsub(':couple_id', ':couple_id').gsub(':id', ':id')) }
      puts "   ✅ Route #{route} configured"
    else
      puts "   ⚠️  Route #{route} may not be configured"
    end
  end

  # Test Note routes
  note_routes = [
    "/api/v1/check_ins/:check_in_id/notes/:id/publish",
    "/api/v1/check_ins/:check_in_id/notes/:id/make_private",
    "/api/v1/check_ins/:check_in_id/notes/by_step",
    "/api/v1/check_ins/:check_in_id/notes/summary"
  ]

  note_routes.each do |route|
    if routes.any? { |r| r.include?(route.gsub(':check_in_id', ':check_in_id').gsub(':id', ':id')) }
      puts "   ✅ Route #{route} configured"
    else
      puts "   ⚠️  Route #{route} may not be configured"
    end
  end
rescue => e
  puts "   ❌ Error testing routes: #{e.message}"
end

# Test session timeout and concurrent access
puts "\n6. Testing Session Management Features:"
begin
  controller = Api::V1::CheckInsController.new

  # Check for session management methods
  if controller.respond_to?(:validate_session_access!, true)
    puts "   ✅ Session access validation available"
  else
    puts "   ❌ Session access validation missing"
  end

  if controller.respond_to?(:check_session_timeout!, true)
    puts "   ✅ Session timeout checking available"
  else
    puts "   ❌ Session timeout checking missing"
  end

  # Test serialization methods
  if controller.respond_to?(:serialize_detailed_resource, true)
    puts "   ✅ Detailed serialization available"
  else
    puts "   ❌ Detailed serialization missing"
  end

  # Check for real-time update placeholder
  if controller.respond_to?(:broadcast_session_update, true)
    puts "   ✅ Real-time update broadcasting available"
  else
    puts "   ❌ Real-time update broadcasting missing"
  end
rescue => e
  puts "   ❌ Error testing session management: #{e.message}"
end

puts "\n" + "=" * 50
puts "CheckIn Session API testing complete!"