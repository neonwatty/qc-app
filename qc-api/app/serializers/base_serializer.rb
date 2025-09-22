class BaseSerializer
  include JSONAPI::Serializer

  # Default to camelCase for all serializers to match TypeScript
  def self.inherited(subclass)
    super
    subclass.set_key_transform :camel_lower
  end
end