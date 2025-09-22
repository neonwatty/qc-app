module Authorization
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
  end

  # Authorization methods for couple-based access
  def authorize_couple_member!
    unless current_couple && current_user_in_couple?
      render_unauthorized("You must be a member of this couple")
    end
  end

  def authorize_couple_data_access!(resource)
    return if resource.nil?

    # Check if resource belongs to current user's couple
    couple_id = extract_couple_id(resource)

    unless couple_id && current_user.couples.exists?(id: couple_id)
      render_unauthorized("You don't have permission to access this resource")
    end
  end

  def authorize_partner_content!(resource)
    return if resource.nil?

    # Allow access if content is shared or belongs to current user
    case resource
    when Note
      unless resource.author == current_user ||
             (resource.privacy == 'shared' && user_and_author_are_partners?(resource.author))
        render_unauthorized("You don't have permission to access this note")
      end
    when ActionItem
      unless resource.assigned_to == current_user ||
             resource.created_by == current_user ||
             user_in_same_couple_as?(resource.assigned_to)
        render_unauthorized("You don't have permission to access this action item")
      end
    else
      authorize_general_resource_access!(resource)
    end
  end

  def authorize_user_data_access!(resource)
    # Ensure users can only access their own data
    unless resource_belongs_to_user?(resource)
      render_unauthorized("You can only access your own data")
    end
  end

  def authorize_admin!
    unless current_user.admin?
      render_unauthorized("Admin access required")
    end
  end

  private

  def current_couple
    @current_couple ||= current_user&.current_couple
  end

  def current_user_in_couple?
    current_couple && current_couple.users.include?(current_user)
  end

  def extract_couple_id(resource)
    case resource
    when Couple
      resource.id
    when CheckIn, Category, Milestone, SessionSettings, Reminder
      resource.couple_id
    when Note
      resource.check_in&.couple_id
    when ActionItem
      resource.check_in&.couple_id
    else
      nil
    end
  end

  def user_and_author_are_partners?(author)
    return false unless author && current_user

    # Check if they're in the same couple
    (current_user.couples & author.couples).any?
  end

  def user_in_same_couple_as?(other_user)
    return false unless other_user && current_user

    (current_user.couples & other_user.couples).any?
  end

  def resource_belongs_to_user?(resource)
    case resource
    when User
      resource == current_user
    when Note
      resource.author == current_user
    when Reminder
      resource.created_by == current_user || resource.assigned_to == current_user
    when RelationshipRequest
      resource.requested_by == current_user || resource.requested_for == current_user
    when ActionItem
      resource.assigned_to == current_user || resource.created_by == current_user
    else
      false
    end
  end

  def authorize_general_resource_access!(resource)
    # Generic authorization for resources with couple_id
    if resource.respond_to?(:couple_id)
      authorize_couple_data_access!(resource)
    elsif resource.respond_to?(:user_id) || resource.respond_to?(:author_id)
      authorize_user_data_access!(resource)
    else
      render_unauthorized("Unable to verify access permissions")
    end
  end

  def render_unauthorized(message = "Unauthorized access")
    render json: {
      error: message,
      status: 403
    }, status: :forbidden
  end

  def render_unauthenticated(message = "Authentication required")
    render json: {
      error: message,
      status: 401
    }, status: :unauthorized
  end

  # Helper methods for authorization checks

  def can_access_couple?(couple)
    return false unless current_user
    current_user.couples.include?(couple)
  end

  def can_modify_couple_settings?(couple)
    can_access_couple?(couple)
  end

  def can_view_partner_content?(content_owner)
    return false unless current_user && content_owner
    return true if current_user == content_owner
    (current_user.couples & content_owner.couples).any?
  end

  def can_access_shared_note?(note)
    return false unless note
    return true if note.author == current_user
    note.privacy == 'shared' && can_view_partner_content?(note.author)
  end

  def can_manage_action_item?(action_item)
    return false unless action_item
    action_item.assigned_to == current_user ||
    action_item.created_by == current_user ||
    can_view_partner_content?(action_item.assigned_to)
  end

  def can_manage_reminder?(reminder)
    return false unless reminder
    reminder.created_by == current_user ||
    reminder.assigned_to == current_user ||
    can_access_couple?(reminder.couple)
  end

  def owns_resource?(resource)
    case resource
    when User
      resource == current_user
    when Note
      resource.author == current_user
    when ActionItem
      resource.created_by == current_user
    when Reminder
      resource.created_by == current_user
    else
      false
    end
  end

  def partners_with?(other_user)
    return false unless current_user && other_user
    (current_user.couples & other_user.couples).any?
  end

  def accessible_couples
    current_user&.couples || Couple.none
  end

  def accessible_check_ins
    CheckIn.where(couple: accessible_couples)
  end

  def accessible_notes
    return Note.none unless current_user

    Note.left_joins(:author)
        .where(
          '(notes.author_id = ?) OR ' +
          '(notes.privacy = ? AND users.id IN (?))',
          current_user.id,
          'shared',
          partner_user_ids
        )
  end

  def accessible_action_items
    return ActionItem.none unless current_user

    ActionItem.where(
      'assigned_to_id = ? OR created_by_id = ? OR check_in_id IN (?)',
      current_user.id,
      current_user.id,
      accessible_check_ins.pluck(:id)
    )
  end

  def partner_user_ids
    return [] unless current_user

    User.joins(:couples)
        .where(couples: { id: current_user.couple_ids })
        .where.not(id: current_user.id)
        .pluck(:id)
  end

  def admin?
    current_user&.admin?
  end

  def scope_to_authorized(model_class)
    case model_class.name
    when 'Couple'
      accessible_couples
    when 'CheckIn'
      accessible_check_ins
    when 'Note'
      accessible_notes
    when 'ActionItem'
      accessible_action_items
    when 'Reminder'
      Reminder.where(couple: accessible_couples)
    when 'Milestone'
      Milestone.where(couple: accessible_couples)
    when 'Category'
      Category.where(couple: accessible_couples)
    else
      model_class.none
    end
  end
end