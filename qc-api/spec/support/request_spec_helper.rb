# Helper methods for request specs
module RequestSpecHelper
  # Parse JSON response to ruby hash
  def json
    JSON.parse(response.body, symbolize_names: true)
  end

  # Get auth headers for a user
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
  def expect_jsonapi_response(type, count = nil)
    expect(response).to have_http_status(:ok)
    expect(json).to have_key(:data)

    if count
      expect(json[:data]).to be_an(Array)
      expect(json[:data].length).to eq(count)
      expect(json[:data].first[:type]).to eq(type.to_s) if json[:data].any?
    else
      expect(json[:data][:type]).to eq(type.to_s)
    end
  end

  # Assert error response
  def expect_error_response(status, message = nil)
    expect(response).to have_http_status(status)
    expect(json).to have_key(:errors)

    if message
      error_messages = json[:errors].map { |e| e[:detail] || e[:title] }.join(', ')
      expect(error_messages).to include(message)
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
end