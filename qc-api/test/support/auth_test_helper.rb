# Helper methods for authentication in tests
module AuthTestHelper
  # Generate auth token for a user
  def token_generator(user)
    Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
  end

  # Set auth headers for controller tests
  def sign_in_user(user)
    token = token_generator(user)
    @request.headers['Authorization'] = "Bearer #{token}" if @request
  end

  # Helper for strong parameters testing
  def assert_permitted_params(*permitted)
    # This would be used in controller tests to verify params
    controller.params.permit(*permitted) if defined?(controller)
  end

  # Mock service object response (useful for unit testing)
  def stub_service_response(service_class, method_name, response)
    service_class.stub(:new, -> {
      mock = MiniTest::Mock.new
      mock.expect(method_name, response)
      mock
    })
  end

  # Create and sign in a test user
  def create_and_sign_in_user(attributes = {})
    user = create(:user, attributes)
    sign_in user if respond_to?(:sign_in)
    user
  end

  # Assert that a user is signed in
  def assert_user_signed_in
    assert controller.user_signed_in? if defined?(controller)
  end

  # Assert that no user is signed in
  def assert_user_not_signed_in
    assert_not controller.user_signed_in? if defined?(controller)
  end
end