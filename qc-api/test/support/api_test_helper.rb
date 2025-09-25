# Helper methods for API integration tests
module ApiTestHelper
  # Parse JSON response to ruby hash
  def json
    JSON.parse(response.body, symbolize_names: true)
  end

  # Get auth headers for a user using Devise JWT
  def auth_headers_for(user)
    Devise::JWT::TestHelpers.auth_headers({}, user)
  end

  # Perform request with auth headers
  def authenticated_request(method, path, user, params = {})
    headers = auth_headers_for(user)
    send(method, path, params: params, headers: headers, as: :json)
  end

  # Helper to build JSON API formatted params
  def jsonapi_params(type, attributes, relationships = {})
    {
      data: {
        type: type,
        attributes: attributes,
        relationships: relationships
      }
    }
  end

  # Assert JSON API response structure
  def assert_jsonapi_response(type, count = nil)
    assert_response :success
    assert json.key?(:data), "Response should have :data key"

    if count
      assert_kind_of Array, json[:data]
      assert_equal count, json[:data].length
      assert_equal type.to_s, json[:data].first[:type] if json[:data].any?
    else
      assert_equal type.to_s, json[:data][:type]
    end
  end

  # Assert error response
  def assert_error_response(status, message = nil)
    assert_response status
    assert json.key?(:errors), "Response should have :errors key"

    if message
      error_messages = json[:errors].map { |e| e[:detail] || e[:title] }.join(', ')
      assert_includes error_messages, message
    end
  end

  # Helper for pagination params
  def pagination_params(page: 1, per_page: 10)
    { page: { number: page, size: per_page } }
  end

  # Helper to create multipart form data for file uploads
  def file_upload_params(file_path, content_type = 'image/jpeg')
    {
      file: fixture_file_upload(file_path, content_type)
    }
  end

  # Helper to assert successful JSON response with optional data check
  def assert_success_response(expected_data = nil)
    assert_response :success

    if expected_data
      parsed = JSON.parse(response.body, symbolize_names: true)
      expected_data.each do |key, value|
        assert_equal value, parsed[key], "Expected #{key} to be #{value}"
      end
    end
  end
end