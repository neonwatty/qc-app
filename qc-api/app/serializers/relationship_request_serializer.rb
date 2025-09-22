class RelationshipRequestSerializer
  include JSONAPI::Serializer

  attributes :id, :title, :description, :request_type, :priority,
             :status, :due_date, :completed_at, :response_notes,
             :resolution_notes, :created_at, :updated_at

  belongs_to :couple
  belongs_to :requested_by, serializer: :user
  belongs_to :requested_for, serializer: :user, optional: true
  belongs_to :related_check_in, serializer: :check_in, optional: true
  belongs_to :converted_to_reminder, serializer: :reminder, optional: true

  attribute :is_pending do |request|
    request.status == 'pending'
  end

  attribute :is_completed do |request|
    request.status == 'completed'
  end

  attribute :days_open do |request|
    if request.status == 'pending'
      (Date.today - request.created_at.to_date).to_i
    end
  end
end