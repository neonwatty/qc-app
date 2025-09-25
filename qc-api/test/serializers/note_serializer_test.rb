require 'test_helper'

class NoteSerializerTest < ActiveSupport::TestCase
  def setup
    @couple = create(:couple)
    @author = create(:user, couple: @couple)
    @partner = create(:user, couple: @couple)
    @other_user = create(:user)
    @check_in = create(:check_in, couple: @couple)
    @category = create(:category, couple: @couple)

    @private_note = create(:note,
      content: "This is private content",
      privacy: 'private',
      author: @author,
      check_in: @check_in,
      category: @category,
      tags: ['personal', 'private'],
      is_favorite: true
    )

    @shared_note = create(:note,
      content: "This is shared content",
      privacy: 'shared',
      author: @author,
      check_in: @check_in,
      category: @category,
      tags: ['relationship', 'shared'],
      published_at: Time.current,
      first_shared_at: Time.current
    )

    @draft_note = create(:note,
      content: "This is draft content",
      privacy: 'draft',
      author: @author,
      check_in: @check_in,
      category: @category,
      tags: ['work-in-progress']
    )
  end

  # Privacy-aware content exposure tests
  test "shows full content for private notes when current user is author" do
    serialization = NoteSerializer.new(@private_note, params: { current_user: @author }).serializable_hash
    attributes = serialization[:data][:attributes]

    assert_equal "This is private content", attributes[:content]
    assert_equal ['personal', 'private'], attributes[:tags]
    assert_equal true, attributes[:is_favorite]
    assert_equal @author.name, attributes[:author_name]
    assert_equal true, attributes[:can_edit]
    assert_equal true, attributes[:can_view]
    assert_not_nil attributes[:word_count]
    assert_not_nil attributes[:reading_time_minutes]
  end

  test "shows full content for shared notes when current user is partner" do
    serialization = NoteSerializer.new(@shared_note, params: { current_user: @partner }).serializable_hash
    attributes = serialization[:data][:attributes]

    assert_equal "This is shared content", attributes[:content]
    assert_equal ['relationship', 'shared'], attributes[:tags]
    assert_nil attributes[:is_favorite]  # Author-only attribute
    assert_equal @author.name, attributes[:author_name]
    assert_equal false, attributes[:can_edit]
    assert_equal true, attributes[:can_view]
    assert_not_nil attributes[:published_at]
    assert_not_nil attributes[:first_shared_at]
  end

  test "masks content for private notes when current user is partner" do
    serialization = NoteSerializer.new(@private_note, params: { current_user: @partner }).serializable_hash
    attributes = serialization[:data][:attributes]

    assert_equal "[Private Note]", attributes[:content]
    assert_equal [], attributes[:tags]
    assert_nil attributes[:is_favorite]
    assert_equal @author.name, attributes[:author_name]
    assert_equal false, attributes[:can_edit]
    assert_equal false, attributes[:can_view]
    assert_nil attributes[:word_count]
    assert_nil attributes[:reading_time_minutes]
  end

  test "masks content for draft notes when current user is partner" do
    serialization = NoteSerializer.new(@draft_note, params: { current_user: @partner }).serializable_hash
    attributes = serialization[:data][:attributes]

    assert_equal "[Draft]", attributes[:content]
    assert_equal [], attributes[:tags]
    assert_equal @author.name, attributes[:author_name]
    assert_equal false, attributes[:can_edit]
    assert_equal false, attributes[:can_view]
  end

  test "shows default content for shared notes when current user is not in couple" do
    serialization = NoteSerializer.new(@shared_note, params: { current_user: @other_user }).serializable_hash
    attributes = serialization[:data][:attributes]

    assert_equal "This is shared content", attributes[:content]
    assert_equal [], attributes[:tags]
    assert_equal @author.name, attributes[:author_name]
    assert_equal false, attributes[:can_edit]
    assert_equal false, attributes[:can_view]
  end

  test "masks private content when no current user provided" do
    serialization = NoteSerializer.new(@private_note).serializable_hash
    attributes = serialization[:data][:attributes]

    assert_equal "[Private Note]", attributes[:content]
    assert_equal [], attributes[:tags]
    assert_equal "Anonymous", attributes[:author_name]
    assert_equal false, attributes[:can_edit]
    assert_equal false, attributes[:can_view]
  end

  # Privacy status attributes tests
  test "includes privacy boolean flags" do
    serialization = NoteSerializer.new(@private_note).serializable_hash
    attributes = serialization[:data][:attributes]

    assert_equal true, attributes[:is_private]
    assert_equal false, attributes[:is_shared]
    assert_equal false, attributes[:is_draft]
  end

  # Core attributes tests
  test "always includes core attributes" do
    serialization = NoteSerializer.new(@shared_note).serializable_hash
    attributes = serialization[:data][:attributes]

    assert_equal @shared_note.id, attributes[:id]
    assert_equal 'shared', attributes[:privacy]
    assert_not_nil attributes[:created_at]
    assert_not_nil attributes[:updated_at]
    assert_equal @author.id, attributes[:author_id]
    assert_equal @category.id, attributes[:category_id]
    assert_equal @check_in.id, attributes[:check_in_id]
  end

  # Conditional relationship loading tests
  test "includes author relationship with include_author param" do
    serialization = NoteSerializer.new(
      @shared_note,
      params: { current_user: @partner, include_author: true }
    ).serializable_hash

    assert serialization[:data][:relationships].key?(:author)
  end

  test "includes comments relationship for authorized user with include_comments param" do
    serialization = NoteSerializer.new(
      @shared_note,
      params: { current_user: @partner, include_comments: true }
    ).serializable_hash

    assert serialization[:data][:relationships].key?(:comments)
  end

  test "does not include comments relationship for unauthorized user" do
    serialization = NoteSerializer.new(
      @private_note,
      params: { current_user: @other_user, include_comments: true }
    ).serializable_hash

    if serialization[:data][:relationships]
      assert_not serialization[:data][:relationships].key?(:comments)
    end
  end

  # CamelCase output tests
  test "uses camelCase for attribute keys" do
    serialization = NoteSerializer.new(@shared_note).serializable_hash
    attributes = serialization[:data][:attributes]

    assert attributes.key?(:created_at)
    assert attributes.key?(:updated_at)
    assert attributes.key?(:author_id)
    assert attributes.key?(:category_id)
    assert attributes.key?(:check_in_id)
    assert attributes.key?(:is_private)
    assert attributes.key?(:is_shared)
    assert attributes.key?(:is_draft)
  end
end