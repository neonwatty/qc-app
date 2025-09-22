#!/usr/bin/env ruby
require 'bundler/setup'
require 'active_support/all'

puts "Testing Categories and Prompts API..."
puts "=" * 50

# Test Categories Controller enhancements
puts "\n1. Testing Enhanced Categories Controller:"
begin
  require_relative 'config/environment'

  controller_class = Api::V1::CategoriesController
  puts "   ✅ CategoriesController loaded"

  # Test new methods
  new_methods = [:system, :add_prompt, :remove_prompt, :reorder, :ensure_custom_category!]
  new_methods.each do |method|
    if controller_class.instance_methods.include?(method) || controller_class.private_instance_methods.include?(method)
      puts "   ✅ Method ##{method} exists"
    else
      puts "   ❌ Method ##{method} missing"
    end
  end
rescue => e
  puts "   ❌ Error loading CategoriesController: #{e.message}"
end

# Test PromptTemplatesController
puts "\n2. Testing PromptTemplatesController:"
begin
  controller_class = Api::V1::PromptTemplatesController
  puts "   ✅ PromptTemplatesController loaded"

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
  custom_actions = [:system, :use, :duplicate, :popular, :recent]
  custom_actions.each do |action|
    if controller_class.instance_methods.include?(action)
      puts "   ✅ Custom action ##{action} exists"
    else
      puts "   ❌ Custom action ##{action} missing"
    end
  end
rescue => e
  puts "   ❌ Error loading PromptTemplatesController: #{e.message}"
end

# Test model relationships
puts "\n3. Testing Model Relationships:"
begin
  # Test Category model
  category = Category.new
  if category.respond_to?(:custom_prompts) && category.respond_to?(:prompt_templates)
    puts "   ✅ Category has custom_prompts and prompt_templates associations"
  else
    puts "   ❌ Category missing associations"
  end

  # Test system scope
  if Category.respond_to?(:system_categories)
    puts "   ✅ Category.system_categories scope exists"
  else
    puts "   ❌ Category.system_categories scope missing"
  end

  # Test PromptTemplate model
  template = PromptTemplate.new
  if template.respond_to?(:category) && template.respond_to?(:couple)
    puts "   ✅ PromptTemplate has category and couple associations"
  else
    puts "   ❌ PromptTemplate missing associations"
  end

  # Test PromptTemplate scopes
  scopes = [:system_templates, :for_couple, :by_usage, :with_tags]
  scopes.each do |scope|
    if PromptTemplate.respond_to?(scope)
      puts "   ✅ PromptTemplate.#{scope} scope exists"
    else
      puts "   ❌ PromptTemplate.#{scope} scope missing"
    end
  end

  # Test CustomPrompt model
  custom_prompt = CustomPrompt.new
  if custom_prompt.respond_to?(:category) && custom_prompt.respond_to?(:couple)
    puts "   ✅ CustomPrompt has category and couple associations"
  else
    puts "   ❌ CustomPrompt missing associations"
  end
rescue => e
  puts "   ❌ Error testing models: #{e.message}"
end

# Test routes
puts "\n4. Testing Routes Configuration:"
begin
  routes = Rails.application.routes.routes.map { |r| r.path.spec.to_s }

  # Test category routes
  category_routes = [
    "/api/v1/couples/:couple_id/categories/:id/prompts",
    "/api/v1/couples/:couple_id/categories/:id/prompts/:prompt_id",
    "/api/v1/couples/:couple_id/categories/:id/reorder",
    "/api/v1/categories/system"
  ]

  category_routes.each do |route|
    if routes.any? { |r| r.include?(route.gsub(':couple_id', ':couple_id').gsub(':id', ':id').gsub(':prompt_id', ':prompt_id')) }
      puts "   ✅ Route #{route} configured"
    else
      puts "   ⚠️  Route #{route} may not be configured"
    end
  end

  # Test prompt template routes
  template_routes = [
    "/api/v1/couples/:couple_id/prompt_templates",
    "/api/v1/couples/:couple_id/prompt_templates/:id/use",
    "/api/v1/couples/:couple_id/prompt_templates/:id/duplicate",
    "/api/v1/couples/:couple_id/prompt_templates/popular",
    "/api/v1/prompt_templates/system"
  ]

  template_routes.each do |route|
    if routes.any? { |r| r.include?(route.gsub(':couple_id', ':couple_id').gsub(':id', ':id')) }
      puts "   ✅ Route #{route} configured"
    else
      puts "   ⚠️  Route #{route} may not be configured"
    end
  end
rescue => e
  puts "   ❌ Error testing routes: #{e.message}"
end

# Test authorization helpers
puts "\n5. Testing Authorization Helpers:"
begin
  controller = Api::V1::CategoriesController.new

  helpers = [:can_access_couple?, :authorize_couple_access!]
  helpers.each do |helper|
    if controller.respond_to?(helper, true)
      puts "   ✅ Helper #{helper} available"
    else
      puts "   ❌ Helper #{helper} missing"
    end
  end
rescue => e
  puts "   ❌ Error testing helpers: #{e.message}"
end

# Test serialization methods
puts "\n6. Testing Serialization Methods:"
begin
  categories_controller = Api::V1::CategoriesController.new
  if categories_controller.respond_to?(:serialize_resource, true) &&
     categories_controller.respond_to?(:serialize_prompt, true)
    puts "   ✅ CategoriesController has serialization methods"
  else
    puts "   ❌ CategoriesController missing serialization methods"
  end

  templates_controller = Api::V1::PromptTemplatesController.new
  if templates_controller.respond_to?(:serialize_resource, true) &&
     templates_controller.respond_to?(:serialize_collection, true)
    puts "   ✅ PromptTemplatesController has serialization methods"
  else
    puts "   ❌ PromptTemplatesController missing serialization methods"
  end
rescue => e
  puts "   ❌ Error testing serialization: #{e.message}"
end

puts "\n" + "=" * 50
puts "Categories and Prompts API testing complete!"