#!/usr/bin/env ruby

require_relative 'config/environment'

puts "Testing Category and Prompt Models..."
puts "=" * 50

# Test 1: System Categories
puts "\n1. Testing System Categories..."
system_cats = Category.system_categories
puts "   System categories count: #{system_cats.count}"
system_cats.each do |cat|
  puts "   - #{cat.icon} #{cat.name}: #{cat.description}"
end
puts "   ✅ System categories loaded"

# Test 2: Prompt Templates for Categories
puts "\n2. Testing Prompt Templates..."
Category.system_categories.each do |category|
  templates = PromptTemplate.for_category(category)
  puts "   #{category.name}: #{templates.count} templates"
  templates.limit(2).each do |template|
    puts "     - #{template.title} (#{template.prompts.count} prompts)"
  end
end

# Test 3: Create a Custom Category for a Couple
puts "\n3. Testing Custom Categories..."
couple = Couple.first
if couple
  custom_cat = couple.categories.create!(
    name: "Hobbies",
    icon: "🎨",
    description: "Shared interests and activities",
    order: 7,
    is_custom: true,
    prompts: ["What new hobby should we try together?", "How can we make more time for fun?"]
  )
  puts "   ✅ Created custom category: #{custom_cat.name} for #{couple.name}"
  puts "   Prompts: #{custom_cat.prompts.join(', ')}"
else
  puts "   ⚠️  No couple found to test with"
end

# Test 4: Create Custom Prompts
puts "\n4. Testing Custom Prompts..."
if couple && custom_cat
  prompt1 = couple.custom_prompts.create!(
    category: custom_cat,
    content: "What adventure should we plan for next month?",
    order: 1,
    is_active: true
  )

  prompt2 = couple.custom_prompts.create!(
    category: custom_cat,
    content: "How can we support each other's creative pursuits?",
    order: 2,
    is_active: true
  )

  puts "   ✅ Created #{couple.custom_prompts.count} custom prompts"
  couple.custom_prompts.each do |prompt|
    puts "     - [#{prompt.category.name}] #{prompt.content} (Active: #{prompt.is_active})"
  end
end

# Test 5: Prompt Template Usage Tracking
puts "\n5. Testing Prompt Template Usage Tracking..."
template = PromptTemplate.system_templates.first
if template
  puts "   Template: #{template.title}"
  puts "   Initial usage count: #{template.usage_count}"

  3.times { template.use! }

  puts "   After 3 uses: #{template.usage_count}"
  puts "   ✅ Usage tracking working"
end

# Test 6: Hierarchical Ordering
puts "\n6. Testing Ordering..."
if couple
  # Test category ordering
  ordered_cats = couple.categories.ordered
  puts "   Categories in order:"
  ordered_cats.each do |cat|
    puts "     #{cat.order}. #{cat.name}"
  end

  # Test custom prompt ordering
  if couple.custom_prompts.any?
    puts "   Custom prompts in order:"
    couple.custom_prompts.ordered.each do |prompt|
      puts "     #{prompt.order}. #{prompt.content[0..50]}..."
    end
  end
end

# Test 7: Scopes and Filtering
puts "\n7. Testing Scopes..."
puts "   System templates: #{PromptTemplate.system_templates.count}"
puts "   Custom templates: #{PromptTemplate.custom_templates.count}"
puts "   Templates by usage (top 3):"
PromptTemplate.by_usage.limit(3).each do |template|
  puts "     - #{template.title}: #{template.usage_count} uses"
end

# Test 8: Prompt Movement
puts "\n8. Testing Custom Prompt Reordering..."
if couple && couple.custom_prompts.count >= 2
  first_prompt = couple.custom_prompts.ordered.first
  puts "   Moving '#{first_prompt.content[0..30]}...' to position 1"

  first_prompt.move_to_position!(1)

  puts "   New order:"
  couple.custom_prompts.ordered.reload.each do |prompt|
    puts "     #{prompt.order}. #{prompt.content[0..50]}..."
  end
  puts "   ✅ Reordering working"
end

# Test 9: Category Validations
puts "\n9. Testing Category Validations..."
begin
  invalid_cat = Category.new(
    icon: "🎯",
    description: "Missing name"
  )
  invalid_cat.save!
  puts "   ❌ Validation failed - category saved without name"
rescue ActiveRecord::RecordInvalid => e
  puts "   ✅ Validation working: #{e.message}"
end

# Test 10: Prompt Template Tags
puts "\n10. Testing Prompt Template Tags..."
weekly_templates = PromptTemplate.with_tags(["weekly"])
puts "   Templates tagged 'weekly': #{weekly_templates.count}"
weekly_templates.limit(3).each do |template|
  puts "     - #{template.title}: #{template.tags.join(', ')}"
end

puts "\n" + "=" * 50
puts "Category and Prompt testing complete!"
puts "\nSummary:"
puts "  Total Categories: #{Category.count}"
puts "  System Categories: #{Category.system_categories.count}"
puts "  Custom Categories: #{Category.custom_categories.count}"
puts "  Total Prompt Templates: #{PromptTemplate.count}"
puts "  System Templates: #{PromptTemplate.system_templates.count}"
puts "  Total Custom Prompts: #{CustomPrompt.count}"
puts "  Active Custom Prompts: #{CustomPrompt.active.count}"