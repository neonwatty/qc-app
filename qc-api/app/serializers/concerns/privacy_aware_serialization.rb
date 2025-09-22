module PrivacyAwareSerialization
  extend ActiveSupport::Concern

  included do
    # Helper methods available to all privacy-aware serializers
  end

  class_methods do
    # Check if the current user can view sensitive content
    def user_can_view_content?(resource, current_user)
      return false unless current_user

      # Check if resource has a privacy method
      if resource.respond_to?(:can_be_viewed_by?)
        return resource.can_be_viewed_by?(current_user)
      end

      # Default check for author
      if resource.respond_to?(:author_id)
        return true if resource.author_id == current_user.id
      end

      # Check for shared privacy level
      if resource.respond_to?(:shared?)
        return true if resource.shared?
      end

      false
    end

    # Check if user can edit the resource
    def user_can_edit?(resource, current_user)
      return false unless current_user

      if resource.respond_to?(:can_be_edited_by?)
        return resource.can_be_edited_by?(current_user)
      end

      if resource.respond_to?(:author_id)
        return resource.author_id == current_user.id
      end

      false
    end

    # Check if user is part of the couple
    def user_in_couple?(couple, user)
      return false unless couple && user
      couple.users.include?(user)
    end

    # Get the couple from various resource types
    def get_couple_from_resource(resource)
      if resource.respond_to?(:couple)
        resource.couple
      elsif resource.respond_to?(:check_in)
        resource.check_in&.couple
      elsif resource.is_a?(CheckIn)
        resource.couple
      else
        nil
      end
    end

    # Mask sensitive content based on privacy rules
    def mask_content(content, privacy_level, can_view)
      return content if can_view

      case privacy_level
      when 'private'
        '[Private Content]'
      when 'draft'
        '[Draft Content]'
      else
        '[Restricted Content]'
      end
    end

    # Filter attributes based on privacy level
    def filter_attributes(attributes, privacy_level, can_view)
      return attributes if can_view

      # Return only non-sensitive attributes
      case privacy_level
      when 'private', 'draft'
        attributes.slice(:id, :privacy, :created_at, :author_id)
      else
        attributes.slice(:id, :privacy, :created_at, :updated_at, :author_id)
      end
    end
  end
end