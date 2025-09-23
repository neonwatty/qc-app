# Helper methods for controller specs
module ControllerSpecHelper
  # Generate auth token for a user
  def token_generator(user)
    Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
  end

  # Set auth headers for controller specs
  def sign_in_user(user)
    token = token_generator(user)
    request.headers['Authorization'] = "Bearer #{token}"
  end

  # Helper to assert successful JSON response
  def expect_success_response(data = nil)
    expect(response).to be_successful

    if data
      parsed = JSON.parse(response.body, symbolize_names: true)
      expect(parsed).to include(data)
    end
  end

  # Helper to assert error response in controller
  def expect_controller_error(status, message = nil)
    expect(response).to have_http_status(status)

    if message
      parsed = JSON.parse(response.body, symbolize_names: true)
      expect(parsed[:error] || parsed[:errors]&.first).to include(message)
    end
  end

  # Helper for strong parameters testing
  def expect_permitted_params(*permitted)
    controller.params.permit(*permitted)
  end

  # Mock service object response
  def mock_service_response(service_class, method, response)
    service_double = instance_double(service_class)
    allow(service_class).to receive(:new).and_return(service_double)
    allow(service_double).to receive(method).and_return(response)
    service_double
  end
end