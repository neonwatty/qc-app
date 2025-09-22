#!/usr/bin/env ruby

# Test script for core API controllers

require_relative 'config/environment'

puts "Testing Core API Controllers..."
puts "="*50

# 1. Test Controllers Defined
puts "\n1. Test Controllers Defined:"
begin
  controllers = [
    Api::V1::CouplesController,
    Api::V1::CheckInsController,
    Api::V1::NotesController,
    Api::V1::ActionItemsController,
    Api::V1::CategoriesController,
    Api::V1::MilestonesController
  ]

  controllers.each do |controller_class|
    if defined?(controller_class)
      puts "   ✅ #{controller_class.name} defined"
    else
      puts "   ❌ #{controller_class.name} not found"
    end
  end
rescue => e
  puts "   ❌ Error: #{e.message}"
end

# 2. Test RESTful Actions
puts "\n2. Test RESTful Actions:"
begin
  controller = Api::V1::CouplesController.new
  restful_actions = [:index, :show, :create, :update, :destroy]
  
  restful_actions.each do |action|
    if controller.respond_to?(action)
      puts "   ✅ CouplesController##{action} exists"
    else
      puts "   ❌ CouplesController##{action} missing"
    end
  end
rescue => e
  puts "   ❌ Error: #{e.message}"
end

# 3. Test Custom Actions
puts "\n3. Test Custom Actions:"
begin
  custom_actions = {
    Api::V1::CouplesController => [:add_partner, :remove_partner],
    Api::V1::CheckInsController => [:complete, :current],
    Api::V1::ActionItemsController => [:complete, :reopen, :my_items],
    Api::V1::CategoriesController => [:toggle, :active],
    Api::V1::MilestonesController => [:achieve, :achieved, :pending, :statistics]
  }

  custom_actions.each do |controller_class, actions|
    controller = controller_class.new
    actions.each do |action|
      if controller.respond_to?(action)
        puts "   ✅ #{controller_class.name.split('::').last}##{action} exists"
      else
        puts "   ❌ #{controller_class.name.split('::').last}##{action} missing"
      end
    end
  end
rescue => e
  puts "   ❌ Error: #{e.message}"
end

# 4. Test Routes
puts "\n4. Test Routes:"
begin
  routes_to_test = [
    '/api/v1/couples',
    '/api/v1/couples/1/check_ins',
    '/api/v1/couples/1/categories',
    '/api/v1/couples/1/milestones',
    '/api/v1/action_items',
    '/api/v1/check_ins/1/notes'
  ]

  routes_to_test.each do |path|
    # Check if route exists in Rails routes
    route_exists = Rails.application.routes.routes.any? do |route|
      route.path.spec.to_s.include?(path.gsub('/1', '/:id').gsub('/api', ''))
    end
    
    if route_exists
      puts "   ✅ Route #{path} configured"
    else
      puts "   ⚠️  Route #{path} may not be configured"
    end
  end
rescue => e
  puts "   ❌ Error: #{e.message}"
end

# 5. Test Serialization Methods
puts "\n5. Test Serialization Methods:"
begin
  controllers_with_serialization = [
    Api::V1::CouplesController,
    Api::V1::CheckInsController,
    Api::V1::NotesController,
    Api::V1::ActionItemsController,
    Api::V1::CategoriesController,
    Api::V1::MilestonesController
  ]

  controllers_with_serialization.each do |controller_class|
    controller = controller_class.new
    if controller.respond_to?(:serialize_resource, true) && controller.respond_to?(:serialize_collection, true)
      puts "   ✅ #{controller_class.name.split('::').last} has serialization methods"
    else
      puts "   ❌ #{controller_class.name.split('::').last} missing serialization methods"
    end
  end
rescue => e
  puts "   ❌ Error: #{e.message}"
end

# 6. Test Authorization Methods
puts "\n6. Test Authorization Methods:"
begin
  controller = Api::V1::CouplesController.new
  auth_methods = [:authorize_couple_access!, :can_access_couple?, :can_manage_action_item?]
  
  auth_methods.each do |method|
    if controller.respond_to?(method, true)
      puts "   ✅ Authorization method #{method} available"
    else
      puts "   ⚠️  Authorization method #{method} might not be available"
    end
  end
rescue => e
  puts "   ❌ Error: #{e.message}"
end

# 7. Test Error Response Methods
puts "\n7. Test Error Response Methods:"
begin
  controller = Api::V1::CouplesController.new
  error_methods = [:render_success, :render_created, :render_destroyed, :render_not_found, :render_unauthorized, :render_unprocessable_entity]
  
  error_methods.each do |method|
    if controller.respond_to?(method, true)
      puts "   ✅ Error handler #{method} available"
    else
      puts "   ❌ Error handler #{method} missing"
    end
  end
rescue => e
  puts "   ❌ Error: #{e.message}"
end

puts "\n" + "="*50
puts "Core API Controllers testing complete!"
