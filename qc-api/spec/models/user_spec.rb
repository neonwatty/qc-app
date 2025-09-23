require 'rails_helper'

RSpec.describe User, type: :model do
  # Factory validation
  describe 'factory' do
    it 'has a valid factory' do
      expect(build(:user)).to be_valid
    end

    it 'creates a user with valid attributes' do
      user = create(:user)
      expect(user).to be_persisted
      expect(user.email).to be_present
    end
  end

  # Associations
  describe 'associations' do
    it { should belong_to(:couple).optional }
    it { should belong_to(:partner).class_name('User').optional }
    it { should have_many(:initiated_check_ins).class_name('CheckIn').with_foreign_key('initiated_by_id') }
    it { should have_many(:notes).dependent(:destroy) }
    it { should have_many(:assigned_action_items).class_name('ActionItem').with_foreign_key('assigned_to_id') }
    it { should have_many(:created_action_items).class_name('ActionItem').with_foreign_key('created_by_id') }
    it { should have_one(:session_settings).dependent(:destroy) }
    it { should have_one(:love_language).dependent(:destroy) }
    it { should have_many(:notifications).dependent(:destroy) }
    it { should have_many(:reminders).dependent(:destroy) }
    it { should have_one_attached(:avatar) }
  end

  # Validations
  describe 'validations' do
    subject { build(:user) }

    it { should validate_presence_of(:email) }
    it { should validate_uniqueness_of(:email).case_insensitive }
    it { should validate_presence_of(:first_name) }
    it { should validate_presence_of(:last_name) }
    it { should validate_uniqueness_of(:username).allow_nil }
    it { should validate_length_of(:username).is_at_least(3).is_at_most(30) }

    context 'email format' do
      it 'accepts valid email addresses' do
        valid_emails = %w[user@example.com USER@foo.COM A_US-ER@foo.bar.org first.last@foo.jp alice+bob@baz.cn]
        valid_emails.each do |valid_email|
          user = build(:user, email: valid_email)
          expect(user).to be_valid, "#{valid_email.inspect} should be valid"
        end
      end

      it 'rejects invalid email addresses' do
        invalid_emails = %w[user@example,com user_at_foo.org user.name@example. foo@bar_baz.com foo@bar+baz.com]
        invalid_emails.each do |invalid_email|
          user = build(:user, email: invalid_email)
          expect(user).not_to be_valid, "#{invalid_email.inspect} should be invalid"
        end
      end
    end
  end

  # Scopes
  describe 'scopes' do
    describe '.active' do
      let!(:active_user) { create(:user) }
      let!(:inactive_user) { create(:user, deleted_at: 1.day.ago) }

      it 'returns only active users' do
        expect(User.active).to include(active_user)
        expect(User.active).not_to include(inactive_user)
      end
    end

    describe '.with_couple' do
      let!(:coupled_user) { create(:user, :with_couple) }
      let!(:single_user) { create(:user) }

      it 'returns only users with couples' do
        expect(User.with_couple).to include(coupled_user)
        expect(User.with_couple).not_to include(single_user)
      end
    end
  end

  # Instance methods
  describe 'instance methods' do
    let(:user) { create(:user) }

    describe '#full_name' do
      it 'returns the full name' do
        expect(user.full_name).to eq("#{user.first_name} #{user.last_name}")
      end
    end

    describe '#display_name' do
      context 'with username' do
        it 'returns username' do
          user.username = 'testuser'
          expect(user.display_name).to eq('testuser')
        end
      end

      context 'without username' do
        it 'returns first name' do
          user.username = nil
          expect(user.display_name).to eq(user.first_name)
        end
      end
    end

    describe '#in_couple?' do
      context 'when user has a couple' do
        let(:user) { create(:user, :with_couple) }

        it 'returns true' do
          expect(user.in_couple?).to be true
        end
      end

      context 'when user has no couple' do
        it 'returns false' do
          expect(user.in_couple?).to be false
        end
      end
    end
  end

  # Callbacks
  describe 'callbacks' do
    describe 'after_create' do
      it 'creates default session settings' do
        user = create(:user)
        expect(user.session_settings).to be_present
      end
    end
  end
end