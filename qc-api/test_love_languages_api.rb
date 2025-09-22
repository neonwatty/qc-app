#!/usr/bin/env ruby
require 'bundler/setup'
require 'active_support/all'

puts "Testing Love Languages API..."
puts "=" * 50

# Test LoveLanguagesController
puts "\n1. Testing LoveLanguagesController:"
begin
  require_relative 'config/environment'

  controller_class = Api::V1::LoveLanguagesController
  puts "   ✅ LoveLanguagesController loaded"

  # Test standard CRUD actions
  crud_actions = [:index, :show, :create, :update, :destroy]
  crud_actions.each do |action|
    if controller_class.instance_methods.include?(action)
      puts "   ✅ Action ##{action} exists"
    else
      puts "   ❌ Action ##{action} missing"
    end
  end

  # Test custom actions
  custom_actions = [:toggle_active, :mark_discussed, :update_importance, :add_example,
                   :remove_example, :partner_languages, :statistics, :create_defaults]
  custom_actions.each do |action|
    if controller_class.instance_methods.include?(action)
      puts "   ✅ Custom action ##{action} exists"
    else
      puts "   ❌ Custom action ##{action} missing"
    end
  end

  # Test discovery actions
  discovery_actions = [:discoveries, :convert_discovery, :reject_discovery]
  discovery_actions.each do |action|
    if controller_class.instance_methods.include?(action)
      puts "   ✅ Discovery action ##{action} exists"
    else
      puts "   ❌ Discovery action ##{action} missing"
    end
  end
rescue => e
  puts "   ❌ Error loading LoveLanguagesController: #{e.message}"
end

# Test LoveActionsController
puts "\n2. Testing LoveActionsController:"
begin
  controller_class = Api::V1::LoveActionsController
  puts "   ✅ LoveActionsController loaded"

  # Test standard CRUD actions
  crud_actions = [:index, :show, :create, :update, :destroy]
  crud_actions.each do |action|
    if controller_class.instance_methods.include?(action)
      puts "   ✅ Action ##{action} exists"
    else
      puts "   ❌ Action ##{action} missing"
    end
  end

  # Test completion and planning actions
  action_methods = [:complete, :plan, :archive, :unarchive, :mark_recurring]
  action_methods.each do |action|
    if controller_class.instance_methods.include?(action)
      puts "   ✅ Action method ##{action} exists"
    else
      puts "   ❌ Action method ##{action} missing"
    end
  end

  # Test collection actions
  collection_actions = [:upcoming, :overdue, :due_today, :partner_suggestions,
                       :highly_effective, :batch_complete, :statistics, :generate_suggestions]
  collection_actions.each do |action|
    if controller_class.instance_methods.include?(action)
      puts "   ✅ Collection action ##{action} exists"
    else
      puts "   ❌ Collection action ##{action} missing"
    end
  end
rescue => e
  puts "   ❌ Error loading LoveActionsController: #{e.message}"
end

# Test LoveLanguage model
puts "\n3. Testing LoveLanguage Model:"
begin
  language = LoveLanguage.new

  # Test instance methods
  instance_methods = [:mark_discussed!, :add_example, :remove_example, :toggle_active!,
                     :update_importance!, :can_be_viewed_by?, :average_action_completion_rate]
  instance_methods.each do |method|
    if language.respond_to?(method)
      puts "   ✅ Instance method ##{method} exists"
    else
      puts "   ❌ Instance method ##{method} missing"
    end
  end

  # Test scopes
  scopes = [:shared, :couple_only, :private_languages, :visible_to_partner,
           :by_importance, :by_rank, :by_category, :active]
  scopes.each do |scope|
    if LoveLanguage.respond_to?(scope)
      puts "   ✅ Scope .#{scope} exists"
    else
      puts "   ❌ Scope .#{scope} missing"
    end
  end

  # Test class methods
  if LoveLanguage.respond_to?(:create_defaults_for_user!)
    puts "   ✅ Class method .create_defaults_for_user! exists"
  else
    puts "   ❌ Class method .create_defaults_for_user! missing"
  end
rescue => e
  puts "   ❌ Error testing LoveLanguage model: #{e.message}"
end

# Test LoveAction model
puts "\n4. Testing LoveAction Model:"
begin
  action = LoveAction.new

  # Test instance methods
  instance_methods = [:complete!, :plan!, :mark_recurring!, :archive!, :unarchive!,
                      :recurring?, :overdue?, :effectiveness_score, :next_suggested_date]
  instance_methods.each do |method|
    if action.respond_to?(method)
      puts "   ✅ Instance method ##{method} exists"
    else
      puts "   ❌ Instance method ##{method} missing"
    end
  end

  # Test scopes
  scopes = [:suggested, :planned, :completed, :recurring, :active,
           :upcoming, :overdue, :due_today, :highly_effective]
  scopes.each do |scope|
    if LoveAction.respond_to?(scope)
      puts "   ✅ Scope .#{scope} exists"
    else
      puts "   ❌ Scope .#{scope} missing"
    end
  end
rescue => e
  puts "   ❌ Error testing LoveAction model: #{e.message}"
end

# Test LoveLanguageDiscovery model
puts "\n5. Testing LoveLanguageDiscovery Model:"
begin
  discovery = LoveLanguageDiscovery.new

  # Test instance methods
  instance_methods = [:convert_to_language!, :reject!, :mark_reviewed!, :converted?,
                      :rejected?, :pending?, :suggest_category, :suggest_importance]
  instance_methods.each do |method|
    if discovery.respond_to?(method)
      puts "   ✅ Instance method ##{method} exists"
    else
      puts "   ❌ Instance method ##{method} missing"
    end
  end

  # Test scopes
  scopes = [:unconverted, :converted, :recent, :high_confidence, :pending_review]
  scopes.each do |scope|
    if LoveLanguageDiscovery.respond_to?(scope)
      puts "   ✅ Scope .#{scope} exists"
    else
      puts "   ❌ Scope .#{scope} missing"
    end
  end
rescue => e
  puts "   ❌ Error testing LoveLanguageDiscovery model: #{e.message}"
end

# Test Routes Configuration
puts "\n6. Testing Routes Configuration:"
begin
  routes = Rails.application.routes.routes.map { |r| r.path.spec.to_s }

  # Test LoveLanguages routes
  language_routes = [
    "/api/v1/love_languages",
    "/api/v1/love_languages/:id/toggle_active",
    "/api/v1/love_languages/:id/mark_discussed",
    "/api/v1/love_languages/:id/update_importance",
    "/api/v1/love_languages/partner_languages",
    "/api/v1/love_languages/statistics",
    "/api/v1/love_languages/discoveries"
  ]

  language_routes.each do |route|
    if routes.any? { |r| r.include?(route.gsub(':id', ':id')) }
      puts "   ✅ Route #{route} configured"
    else
      puts "   ⚠️  Route #{route} may not be configured"
    end
  end

  # Test LoveActions routes
  action_routes = [
    "/api/v1/love_actions",
    "/api/v1/love_actions/:id/complete",
    "/api/v1/love_actions/:id/plan",
    "/api/v1/love_actions/upcoming",
    "/api/v1/love_actions/overdue",
    "/api/v1/love_actions/statistics"
  ]

  action_routes.each do |route|
    if routes.any? { |r| r.include?(route.gsub(':id', ':id')) }
      puts "   ✅ Route #{route} configured"
    else
      puts "   ⚠️  Route #{route} may not be configured"
    end
  end
rescue => e
  puts "   ❌ Error testing routes: #{e.message}"
end

# Test Constants
puts "\n7. Testing Constants and Validations:"
begin
  # Test LoveLanguage constants
  constants = [:CATEGORIES, :PRIVACY_LEVELS, :IMPORTANCE_LEVELS, :DEFAULT_LOVE_LANGUAGES]
  constants.each do |const|
    if LoveLanguage.const_defined?(const)
      puts "   ✅ LoveLanguage::#{const} defined"
    else
      puts "   ❌ LoveLanguage::#{const} missing"
    end
  end

  # Test LoveAction constants
  action_constants = [:STATUSES, :DIFFICULTIES, :FREQUENCIES, :SUGGESTED_BY]
  action_constants.each do |const|
    if LoveAction.const_defined?(const)
      puts "   ✅ LoveAction::#{const} defined"
    else
      puts "   ❌ LoveAction::#{const} missing"
    end
  end

  # Test LoveLanguageDiscovery constants
  discovery_constants = [:SOURCES, :CONFIDENCE_LEVELS]
  discovery_constants.each do |const|
    if LoveLanguageDiscovery.const_defined?(const)
      puts "   ✅ LoveLanguageDiscovery::#{const} defined"
    else
      puts "   ❌ LoveLanguageDiscovery::#{const} missing"
    end
  end
rescue => e
  puts "   ❌ Error testing constants: #{e.message}"
end

puts "\n" + "=" * 50
puts "Love Languages API testing complete!"