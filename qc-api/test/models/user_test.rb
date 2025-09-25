require 'test_helper'

class UserTest < ActiveSupport::TestCase
  # Factory validation
  test "has a valid factory" do
    user = build(:user)
    assert user.valid?
  end

  test "creates a user with valid attributes" do
    user = create(:user)
    assert user.persisted?
    assert user.email.present?
  end

  # Associations
  test "belongs to couple (optional)" do
    user = create(:user)
    assert_respond_to user, :couple
    assert_nil user.couple  # Optional association
  end

  test "belongs to partner (optional)" do
    user = create(:user)
    assert_respond_to user, :partner
    assert_nil user.partner  # Optional association
  end

  test "has many initiated check ins" do
    user = create(:user)
    assert_respond_to user, :initiated_check_ins
    assert_kind_of ActiveRecord::Associations::CollectionProxy, user.initiated_check_ins
  end

  test "has many notes" do
    user = create(:user)
    assert_respond_to user, :notes
    assert_kind_of ActiveRecord::Associations::CollectionProxy, user.notes
  end

  test "has many assigned action items" do
    user = create(:user)
    assert_respond_to user, :assigned_action_items
    assert_kind_of ActiveRecord::Associations::CollectionProxy, user.assigned_action_items
  end

  test "has many created action items" do
    user = create(:user)
    assert_respond_to user, :created_action_items
    assert_kind_of ActiveRecord::Associations::CollectionProxy, user.created_action_items
  end

  test "has one session settings" do
    user = create(:user)
    assert_respond_to user, :session_settings
  end

  test "has one love language" do
    user = create(:user)
    assert_respond_to user, :love_language
  end

  test "has many notifications" do
    user = create(:user)
    assert_respond_to user, :notifications
    assert_kind_of ActiveRecord::Associations::CollectionProxy, user.notifications
  end

  test "has many reminders" do
    user = create(:user)
    assert_respond_to user, :reminders
    assert_kind_of ActiveRecord::Associations::CollectionProxy, user.reminders
  end

  test "has one attached avatar" do
    user = create(:user)
    assert_respond_to user, :avatar
  end

  # Validations
  test "validates presence of email" do
    user = build(:user, email: nil)
    assert_not user.valid?
    assert_includes user.errors[:email], "can't be blank"
  end

  test "validates uniqueness of email (case insensitive)" do
    existing_user = create(:user, email: "test@example.com")
    new_user = build(:user, email: "TEST@EXAMPLE.COM")
    assert_not new_user.valid?
    assert_includes new_user.errors[:email], "has already been taken"
  end

  test "validates presence of first name" do
    user = build(:user, first_name: nil)
    assert_not user.valid?
    assert_includes user.errors[:first_name], "can't be blank"
  end

  test "validates presence of last name" do
    user = build(:user, last_name: nil)
    assert_not user.valid?
    assert_includes user.errors[:last_name], "can't be blank"
  end

  test "validates uniqueness of username (allow nil)" do
    user1 = create(:user, username: "testuser")
    user2 = build(:user, username: "testuser")
    assert_not user2.valid?
    assert_includes user2.errors[:username], "has already been taken"

    # Should allow nil
    user3 = build(:user, username: nil)
    assert user3.valid?
  end

  test "validates username length" do
    # Too short
    user = build(:user, username: "ab")
    assert_not user.valid?
    assert_includes user.errors[:username], "is too short (minimum is 3 characters)"

    # Too long
    user = build(:user, username: "a" * 31)
    assert_not user.valid?
    assert_includes user.errors[:username], "is too long (maximum is 30 characters)"

    # Just right
    user = build(:user, username: "validname")
    assert user.valid?
  end

  test "accepts valid email addresses" do
    valid_emails = %w[user@example.com USER@foo.COM A_US-ER@foo.bar.org first.last@foo.jp alice+bob@baz.cn]
    valid_emails.each do |valid_email|
      user = build(:user, email: valid_email)
      assert user.valid?, "#{valid_email.inspect} should be valid"
    end
  end

  test "rejects invalid email addresses" do
    invalid_emails = %w[user@example,com user_at_foo.org user.name@example. foo@bar_baz.com foo@bar+baz.com]
    invalid_emails.each do |invalid_email|
      user = build(:user, email: invalid_email)
      assert_not user.valid?, "#{invalid_email.inspect} should be invalid"
    end
  end

  # Scopes
  test "active scope returns only active users" do
    active_user = create(:user)
    inactive_user = create(:user, deleted_at: 1.day.ago)

    active_users = User.active
    assert_includes active_users, active_user
    assert_not_includes active_users, inactive_user
  end

  test "with_couple scope returns only users with couples" do
    coupled_user = create(:user, :with_couple)
    single_user = create(:user)

    coupled_users = User.with_couple
    assert_includes coupled_users, coupled_user
    assert_not_includes coupled_users, single_user
  end

  # Instance methods
  test "full_name returns the full name" do
    user = create(:user, first_name: "John", last_name: "Doe")
    assert_equal "John Doe", user.full_name
  end

  test "display_name returns username when present" do
    user = create(:user, username: "testuser")
    assert_equal "testuser", user.display_name
  end

  test "display_name returns first name when username is nil" do
    user = create(:user, username: nil, first_name: "John")
    assert_equal "John", user.display_name
  end

  test "in_couple? returns true when user has a couple" do
    user = create(:user, :with_couple)
    assert user.in_couple?
  end

  test "in_couple? returns false when user has no couple" do
    user = create(:user)
    assert_not user.in_couple?
  end

  # Callbacks
  test "creates default session settings after create" do
    user = create(:user)
    assert user.session_settings.present?
  end
end