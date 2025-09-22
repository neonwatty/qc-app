#!/usr/bin/env ruby

# Rails runner will already load the environment, no need to require it

# Test helper methods
def assert(condition, message)
  if condition
    puts "✓ #{message}"
  else
    puts "✗ FAILED: #{message}"
    @failures ||= []
    @failures << message
  end
end

def assert_equal(expected, actual, message)
  if expected == actual
    puts "✓ #{message}"
  else
    puts "✗ FAILED: #{message} - Expected: #{expected.inspect}, Got: #{actual.inspect}"
    @failures ||= []
    @failures << message
  end
end

def assert_nil(value, message)
  if value.nil?
    puts "✓ #{message}"
  else
    puts "✗ FAILED: #{message} - Expected nil, Got: #{value.inspect}"
    @failures ||= []
    @failures << message
  end
end

def assert_not_nil(value, message)
  if !value.nil?
    puts "✓ #{message}"
  else
    puts "✗ FAILED: #{message} - Expected non-nil value"
    @failures ||= []
    @failures << message
  end
end

puts "\n" + "="*60
puts "Testing NoteSerializer Privacy Rules"
puts "="*60

# Clean up any existing test data first
User.where(email: ["author#{Time.now.to_i}@test.com", "partner#{Time.now.to_i}@test.com", "other#{Time.now.to_i}@test.com"]).destroy_all
timestamp = Time.now.to_i

# Create test data
couple = Couple.create!(name: "Test Couple #{timestamp}")
author = User.create!(email: "author#{timestamp}@test.com", password: "password123", name: "Author")
partner = User.create!(email: "partner#{timestamp}@test.com", password: "password123", name: "Partner")
couple.users << author
couple.users << partner
author.update!(partner: partner)
partner.update!(partner: author)

other_couple = Couple.create!(name: "Other Couple #{timestamp}")
other_user = User.create!(email: "other#{timestamp}@test.com", password: "password123", name: "Other User")
other_couple.users << other_user

check_in = CheckIn.create!(
  couple: couple,
  status: 'in-progress',
  started_at: Time.current,
  participants: [author.id, partner.id]
)

category = Category.create!(
  name: "Test Category",
  couple: couple,
  order: 1,
  icon: "Heart"
)

# Test 1: Private Note - Author View
puts "\n--- Test 1: Private Note - Author View ---"
private_note = Note.create!(
  content: "This is private content",
  privacy: 'private',
  author: author,
  check_in: check_in,
  category: category,
  tags: ['personal', 'private'],
  is_favorite: true
)

serialized = NoteSerializer.new(private_note, params: { current_user: author }).serializable_hash
attrs = serialized[:data][:attributes]

assert_equal("This is private content", attrs[:content], "Author can see private content")
assert_equal(['personal', 'private'], attrs[:tags], "Author can see tags")
assert_equal(true, attrs[:isFavorite], "Author can see favorite status")
assert_equal(author.name, attrs[:authorName], "Author name is visible")
assert_equal(true, attrs[:canEdit], "Author can edit")
assert_equal(true, attrs[:canView], "Author can view")
assert_not_nil(attrs[:wordCount], "Author can see word count")

# Test 2: Private Note - Partner View
puts "\n--- Test 2: Private Note - Partner View ---"
serialized = NoteSerializer.new(private_note, params: { current_user: partner }).serializable_hash
attrs = serialized[:data][:attributes]

assert_equal("[Private Note]", attrs[:content], "Partner sees masked content for private note")
assert_equal([], attrs[:tags], "Partner cannot see tags")
assert_nil(attrs[:isFavorite], "Partner cannot see favorite status")
assert_equal(author.name, attrs[:authorName], "Partner can see author name")
assert_equal(false, attrs[:canEdit], "Partner cannot edit")
assert_equal(false, attrs[:canView], "Partner cannot view private content")
assert_nil(attrs[:wordCount], "Partner cannot see metadata")

# Test 3: Shared Note - Partner View
puts "\n--- Test 3: Shared Note - Partner View ---"
shared_note = Note.create!(
  content: "This is shared content",
  privacy: 'shared',
  author: author,
  check_in: check_in,
  category: category,
  tags: ['relationship', 'shared'],
  published_at: Time.current,
  first_shared_at: Time.current
)

serialized = NoteSerializer.new(shared_note, params: { current_user: partner }).serializable_hash
attrs = serialized[:data][:attributes]

assert_equal("This is shared content", attrs[:content], "Partner can see shared content")
assert_equal(['relationship', 'shared'], attrs[:tags], "Partner can see tags on shared note")
assert_nil(attrs[:isFavorite], "Partner cannot see author's favorite status")
assert_equal(author.name, attrs[:authorName], "Partner can see author name")
assert_equal(false, attrs[:canEdit], "Partner cannot edit author's note")
assert_equal(true, attrs[:canView], "Partner can view shared content")
assert_not_nil(attrs[:publishedAt], "Partner can see publishing timestamp")
assert_not_nil(attrs[:firstSharedAt], "Partner can see first shared timestamp")

# Test 4: Draft Note - Author View
puts "\n--- Test 4: Draft Note - Author View ---"
draft_note = Note.create!(
  content: "This is draft content",
  privacy: 'draft',
  author: author,
  check_in: check_in,
  category: category,
  tags: ['work-in-progress']
)

serialized = NoteSerializer.new(draft_note, params: { current_user: author }).serializable_hash
attrs = serialized[:data][:attributes]

assert_equal("This is draft content", attrs[:content], "Author can see draft content")
assert_equal(['work-in-progress'], attrs[:tags], "Author can see draft tags")

# Test 5: Draft Note - Partner View
puts "\n--- Test 5: Draft Note - Partner View ---"
serialized = NoteSerializer.new(draft_note, params: { current_user: partner }).serializable_hash
attrs = serialized[:data][:attributes]

assert_equal("[Draft]", attrs[:content], "Partner sees masked draft content")
assert_equal([], attrs[:tags], "Partner cannot see draft tags")
assert_equal(false, attrs[:canView], "Partner cannot view draft")

# Test 6: Other User View (not in couple)
puts "\n--- Test 6: Other User View (not in couple) ---"
serialized = NoteSerializer.new(shared_note, params: { current_user: other_user }).serializable_hash
attrs = serialized[:data][:attributes]

assert_equal("This is shared content", attrs[:content], "Other user sees shared content (default)")
assert_equal([], attrs[:tags], "Other user cannot see tags")
assert_equal(author.name, attrs[:authorName], "Other user sees author name for shared note")
assert_equal(false, attrs[:canEdit], "Other user cannot edit")
assert_equal(true, attrs[:canView], "Other user can view shared notes (public visibility)")

# Test 7: No Current User
puts "\n--- Test 7: No Current User (Anonymous) ---"
serialized = NoteSerializer.new(private_note).serializable_hash
attrs = serialized[:data][:attributes]

assert_equal("[Private Note]", attrs[:content], "Anonymous sees masked private content")
assert_equal([], attrs[:tags], "Anonymous cannot see tags")
assert_equal("Anonymous", attrs[:authorName], "Anonymous sees 'Anonymous' as author")
assert_equal(false, attrs[:canEdit], "Anonymous cannot edit")
assert_equal(false, attrs[:canView], "Anonymous cannot view")

# Test 8: Privacy Status Flags
puts "\n--- Test 8: Privacy Status Flags ---"
serialized = NoteSerializer.new(private_note).serializable_hash
attrs = serialized[:data][:attributes]

assert_equal(true, attrs[:isPrivate], "Private note shows is_private flag")
assert_equal(false, attrs[:isShared], "Private note shows is_shared as false")
assert_equal(false, attrs[:isDraft], "Private note shows is_draft as false")

serialized = NoteSerializer.new(shared_note).serializable_hash
attrs = serialized[:data][:attributes]

assert_equal(false, attrs[:isPrivate], "Shared note shows is_private as false")
assert_equal(true, attrs[:isShared], "Shared note shows is_shared flag")
assert_equal(false, attrs[:isDraft], "Shared note shows is_draft as false")

# Test 9: Core Attributes Always Present
puts "\n--- Test 9: Core Attributes Always Present ---"
serialized = NoteSerializer.new(shared_note).serializable_hash
attrs = serialized[:data][:attributes]

assert_not_nil(attrs[:id], "ID is always present")
assert_equal('shared', attrs[:privacy], "Privacy level is always present")
assert_not_nil(attrs[:createdAt], "Created at is always present")
assert_not_nil(attrs[:updatedAt], "Updated at is always present")
assert_equal(author.id, attrs[:authorId], "Author ID is always present")
assert_equal(category.id, attrs[:categoryId], "Category ID is always present")
assert_equal(check_in.id, attrs[:checkInId], "Check-in ID is always present")

# Clean up test data
puts "\n--- Cleaning up test data ---"
Note.where(id: [private_note.id, shared_note.id, draft_note.id]).destroy_all
CheckIn.where(id: check_in.id).destroy_all
Category.where(id: category.id).destroy_all
User.where(id: [author.id, partner.id, other_user.id]).destroy_all
Couple.where(id: [couple.id, other_couple.id]).destroy_all

# Summary
puts "\n" + "="*60
if @failures.nil? || @failures.empty?
  puts "✅ ALL TESTS PASSED!"
else
  puts "❌ #{@failures.length} TESTS FAILED:"
  @failures.each { |f| puts "   - #{f}" }
end
puts "="*60