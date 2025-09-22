class NoteSerializer < BaseSerializer
  # Core attributes (always visible)
  attributes :id, :privacy, :created_at, :updated_at

  # Author ID (always visible to identify who wrote it)
  attribute :author_id do |note|
    note.author_id
  end

  # Category and CheckIn IDs (always visible for context)
  attribute :category_id do |note|
    note.category_id
  end

  attribute :check_in_id do |note|
    note.check_in_id
  end

  # Content - Privacy-aware exposure
  attribute :content do |note, params|
    current_user = params && params[:current_user]

    # Always show content to the author
    if current_user && note.author_id == current_user.id
      note.content
    # Show content for shared notes to partners
    elsif note.shared? && current_user && user_is_partner?(note, current_user)
      note.content
    # Hide content for private notes from non-authors
    elsif note.private?
      current_user && note.author_id == current_user.id ? note.content : "[Private Note]"
    # Draft notes only visible to author
    elsif note.draft?
      current_user && note.author_id == current_user.id ? note.content : "[Draft]"
    else
      note.content
    end
  end

  # Tags - Only visible if user can view content
  attribute :tags do |note, params|
    current_user = params && params[:current_user]

    if can_view_full_content?(note, current_user)
      note.tags || []
    else
      []
    end
  end

  # Privacy status attributes
  attribute :is_private do |note|
    note.private?
  end

  attribute :is_shared do |note|
    note.shared?
  end

  attribute :is_draft do |note|
    note.draft?
  end

  # Metadata - Only visible to those who can view content
  attribute :word_count do |note, params|
    current_user = params && params[:current_user]

    if can_view_full_content?(note, current_user)
      note.word_count
    end
  end

  attribute :reading_time_minutes do |note, params|
    current_user = params && params[:current_user]

    if can_view_full_content?(note, current_user)
      note.reading_time_minutes
    end
  end

  # Favorite status - Only visible to author
  attribute :is_favorite do |note, params|
    current_user = params && params[:current_user]

    if current_user && note.author_id == current_user.id
      note.is_favorite
    end
  end

  # Publishing timestamps - Visible if user can view content
  attribute :published_at do |note, params|
    current_user = params && params[:current_user]

    if can_view_full_content?(note, current_user)
      note.published_at
    end
  end

  attribute :first_shared_at do |note, params|
    current_user = params && params[:current_user]

    if can_view_full_content?(note, current_user)
      note.first_shared_at
    end
  end

  # Permissions flags
  attribute :can_edit do |note, params|
    current_user = params && params[:current_user]
    if current_user
      note.can_be_edited_by?(current_user)
    else
      false
    end
  end

  attribute :can_view do |note, params|
    current_user = params && params[:current_user]
    if current_user
      note.can_be_viewed_by?(current_user)
    else
      false
    end
  end

  # Author details - Privacy-aware
  attribute :author_name do |note, params|
    current_user = params && params[:current_user]

    # Always show author name for shared notes
    if note.shared?
      note.author.name
    # Show author for private notes only to the author or partner
    elsif current_user && (note.author_id == current_user.id || user_is_partner?(note, current_user))
      note.author.name
    else
      "Anonymous"
    end
  end

  # Relationships - conditional loading
  belongs_to :author, serializer: :user, if: proc { |note, params|
    params && params[:include_author] && can_view_author_info?(note, params[:current_user])
  }

  belongs_to :category, if: proc { |_, params| params && params[:include_category] }
  belongs_to :check_in, if: proc { |_, params| params && params[:include_check_in] }
  has_many :comments, if: proc { |note, params|
    params && params[:include_comments] && can_view_full_content?(note, params[:current_user])
  }

  private

  # Helper method to check if user can view full content
  def self.can_view_full_content?(note, current_user)
    return false unless current_user

    # Author can always see their own notes
    return true if note.author_id == current_user.id

    # Partners can see shared notes
    return true if note.shared? && user_is_partner?(note, current_user)

    false
  end

  # Helper method to check if user is a partner in the couple
  def self.user_is_partner?(note, user)
    return false unless note.check_in && user

    couple = note.check_in.couple
    couple.users.include?(user)
  end

  # Helper method to check if author info should be visible
  def self.can_view_author_info?(note, current_user)
    return false unless current_user

    # Always show for shared notes
    return true if note.shared?

    # Show for author
    return true if note.author_id == current_user.id

    # Show for partner
    user_is_partner?(note, current_user)
  end
end