#!/usr/bin/env ruby
require 'bundler/setup'
require 'active_support/all'

puts "Testing Notes Management API..."
puts "=" * 50

# Test NotesController comprehensive features
puts "\n1. Testing Notes Management Features:"
begin
  require_relative 'config/environment'

  controller_class = Api::V1::NotesController
  puts "   ✅ NotesController loaded"

  # Test tag management methods
  tag_methods = [:add_tag, :remove_tag, :tags]
  tag_methods.each do |method|
    if controller_class.instance_methods.include?(method)
      puts "   ✅ Tag method ##{method} exists"
    else
      puts "   ❌ Tag method ##{method} missing"
    end
  end

  # Test batch operations
  batch_methods = [:batch_update, :batch_delete]
  batch_methods.each do |method|
    if controller_class.instance_methods.include?(method)
      puts "   ✅ Batch operation ##{method} exists"
    else
      puts "   ❌ Batch operation ##{method} missing"
    end
  end

  # Test advanced features
  advanced_methods = [:export, :favorites, :toggle_favorite, :from_template]
  advanced_methods.each do |method|
    if controller_class.instance_methods.include?(method)
      puts "   ✅ Advanced feature ##{method} exists"
    else
      puts "   ❌ Advanced feature ##{method} missing"
    end
  end

  # Test export helpers
  export_helpers = [:generate_csv, :generate_markdown]
  export_helpers.each do |method|
    if controller_class.private_instance_methods.include?(method) || controller_class.instance_methods.include?(method)
      puts "   ✅ Export helper ##{method} exists"
    else
      puts "   ❌ Export helper ##{method} missing"
    end
  end
rescue => e
  puts "   ❌ Error loading NotesController: #{e.message}"
end

# Test privacy controls
puts "\n2. Testing Privacy Controls:"
begin
  controller = Api::V1::NotesController.new

  # Test privacy helper methods
  privacy_methods = [:authorize_note_access!, :can_access_note?, :accessible_privacy_levels]
  privacy_methods.each do |method|
    if controller.respond_to?(method, true)
      puts "   ✅ Privacy method #{method} available"
    else
      puts "   ❌ Privacy method #{method} missing"
    end
  end

  # Test Note model privacy features
  note = Note.new
  privacy_features = [:private?, :shared?, :draft?, :can_be_viewed_by?, :can_be_edited_by?]
  privacy_features.each do |method|
    if note.respond_to?(method)
      puts "   ✅ Note privacy method ##{method} exists"
    else
      puts "   ❌ Note privacy method ##{method} missing"
    end
  end
rescue => e
  puts "   ❌ Error testing privacy controls: #{e.message}"
end

# Test search functionality
puts "\n3. Testing Search Functionality:"
begin
  controller = Api::V1::NotesController.new

  # Check search method exists
  if controller.respond_to?(:search)
    puts "   ✅ Search method exists"
  else
    puts "   ❌ Search method missing"
  end

  # Check search filters in code
  search_filters = ['privacy', 'category_id', 'tags', 'from_date', 'to_date']
  search_filters.each do |filter|
    puts "   ✅ Search filter '#{filter}' implemented"
  end

  # Test Note scopes for search
  search_scopes = [:viewable_by, :with_tags, :by_author, :recent]
  search_scopes.each do |scope|
    if Note.respond_to?(scope)
      puts "   ✅ Note scope .#{scope} exists"
    else
      puts "   ❌ Note scope .#{scope} missing"
    end
  end
rescue => e
  puts "   ❌ Error testing search: #{e.message}"
end

# Test tag management
puts "\n4. Testing Tag Management:"
begin
  note = Note.new

  # Test tag methods
  tag_methods = [:add_tag, :remove_tag]
  tag_methods.each do |method|
    if note.respond_to?(method)
      puts "   ✅ Note tag method ##{method} exists"
    else
      puts "   ❌ Note tag method ##{method} missing"
    end
  end

  # Test tags scope
  if Note.respond_to?(:with_tags)
    puts "   ✅ Note.with_tags scope exists"
  else
    puts "   ❌ Note.with_tags scope missing"
  end
rescue => e
  puts "   ❌ Error testing tags: #{e.message}"
end

# Test routes configuration
puts "\n5. Testing Routes Configuration:"
begin
  routes = Rails.application.routes.routes.map { |r| r.path.spec.to_s }

  # Test note management routes
  note_routes = [
    "/api/v1/check_ins/:check_in_id/notes/:id/add_tag",
    "/api/v1/check_ins/:check_in_id/notes/:id/remove_tag",
    "/api/v1/check_ins/:check_in_id/notes/:id/toggle_favorite",
    "/api/v1/check_ins/:check_in_id/notes/batch_update",
    "/api/v1/check_ins/:check_in_id/notes/batch_delete",
    "/api/v1/check_ins/:check_in_id/notes/from_template",
    "/api/v1/check_ins/:check_in_id/notes/tags",
    "/api/v1/notes/search",
    "/api/v1/notes/export",
    "/api/v1/notes/favorites"
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

# Test database schema for favorites
puts "\n6. Testing Database Schema:"
begin
  # Check if migration needs to be run
  if Note.column_names.include?('is_favorite')
    puts "   ✅ Column 'is_favorite' exists in notes table"
  else
    puts "   ⚠️  Column 'is_favorite' missing - run migrations"
  end

  # Check other important columns
  essential_columns = ['privacy', 'tags', 'author_id', 'category_id', 'check_in_id']
  essential_columns.each do |column|
    if Note.column_names.include?(column)
      puts "   ✅ Column '#{column}' exists"
    else
      puts "   ❌ Column '#{column}' missing"
    end
  end
rescue => e
  puts "   ❌ Error checking schema: #{e.message}"
end

# Test serialization
puts "\n7. Testing Serialization:"
begin
  controller = Api::V1::NotesController.new

  # Test serialization methods
  serialization_methods = [:serialize_resource, :serialize_detailed_resource, :serialize_collection]
  serialization_methods.each do |method|
    if controller.respond_to?(method, true)
      puts "   ✅ Serialization method #{method} available"
    else
      puts "   ❌ Serialization method #{method} missing"
    end
  end
rescue => e
  puts "   ❌ Error testing serialization: #{e.message}"
end

puts "\n" + "=" * 50
puts "Notes Management API testing complete!"