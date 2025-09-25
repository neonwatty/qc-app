require 'test_helper'

class Api::V1::AuthTest < ActionDispatch::IntegrationTest
  # POST /api/v1/auth/signup
  test "creates a new user with valid parameters" do
    valid_params = {
      user: {
        email: 'newuser@example.com',
        password: 'Password123!',
        password_confirmation: 'Password123!',
        first_name: 'John',
        last_name: 'Doe'
      }
    }

    assert_difference 'User.count', 1 do
      post '/api/v1/auth/signup', params: valid_params, as: :json
    end

    assert_response :created
    assert_equal 'user', json[:data][:type]
    assert_equal 'newuser@example.com', json[:data][:attributes][:email]
  end

  test "returns JWT token in headers after signup" do
    valid_params = {
      user: {
        email: 'newuser@example.com',
        password: 'Password123!',
        password_confirmation: 'Password123!',
        first_name: 'John',
        last_name: 'Doe'
      }
    }

    post '/api/v1/auth/signup', params: valid_params, as: :json
    assert_match(/^Bearer /, response.headers['Authorization'])
  end

  test "returns error for missing email on signup" do
    invalid_params = {
      user: {
        email: '',
        password: 'Password123!',
        password_confirmation: 'Password123!',
        first_name: 'John',
        last_name: 'Doe'
      }
    }

    post '/api/v1/auth/signup', params: invalid_params, as: :json
    assert_error_response(:unprocessable_entity, "Email can't be blank")
  end

  test "returns error for password mismatch on signup" do
    invalid_params = {
      user: {
        email: 'newuser@example.com',
        password: 'Password123!',
        password_confirmation: 'DifferentPassword',
        first_name: 'John',
        last_name: 'Doe'
      }
    }

    post '/api/v1/auth/signup', params: invalid_params, as: :json
    assert_error_response(:unprocessable_entity, "Password confirmation doesn't match")
  end

  test "returns error for duplicate email on signup" do
    create(:user, email: 'newuser@example.com')

    valid_params = {
      user: {
        email: 'newuser@example.com',
        password: 'Password123!',
        password_confirmation: 'Password123!',
        first_name: 'John',
        last_name: 'Doe'
      }
    }

    post '/api/v1/auth/signup', params: valid_params, as: :json
    assert_error_response(:unprocessable_entity, 'Email has already been taken')
  end

  # POST /api/v1/auth/login
  test "returns success response with JWT token for valid credentials" do
    user = create(:user, email: 'user@example.com', password: 'Password123!')

    post '/api/v1/auth/login', params: {
      user: {
        email: 'user@example.com',
        password: 'Password123!'
      }
    }, as: :json

    assert_response :ok
    assert_match(/^Bearer /, response.headers['Authorization'])
    assert_equal 'user', json[:data][:type]
    assert_equal user.id.to_s, json[:data][:id]
  end

  test "returns error for wrong password on login" do
    create(:user, email: 'user@example.com', password: 'Password123!')

    post '/api/v1/auth/login', params: {
      user: {
        email: 'user@example.com',
        password: 'WrongPassword'
      }
    }, as: :json

    assert_error_response(:unauthorized, 'Invalid email or password')
  end

  test "returns error for non-existent email on login" do
    post '/api/v1/auth/login', params: {
      user: {
        email: 'nonexistent@example.com',
        password: 'Password123!'
      }
    }, as: :json

    assert_error_response(:unauthorized, 'Invalid email or password')
  end

  test "returns error for unconfirmed account on login" do
    unconfirmed_user = create(:user, :unconfirmed)

    post '/api/v1/auth/login', params: {
      user: {
        email: unconfirmed_user.email,
        password: 'Password123!'
      }
    }, as: :json

    assert_error_response(:unauthorized, 'You have to confirm your email address')
  end

  # DELETE /api/v1/auth/logout
  test "logs out successfully with authenticated user" do
    user = create(:user)
    authenticated_request(:delete, '/api/v1/auth/logout', user)

    assert_response :no_content
  end

  test "invalidates JWT token after logout" do
    user = create(:user)

    # First, logout
    authenticated_request(:delete, '/api/v1/auth/logout', user)
    assert_response :no_content

    # Then try to use the same token again
    authenticated_request(:get, '/api/v1/profile', user)
    assert_response :unauthorized
  end

  test "returns unauthorized for logout without authentication" do
    delete '/api/v1/auth/logout', as: :json
    assert_response :unauthorized
  end

  # GET /api/v1/auth/validate
  test "returns user data with valid token" do
    user = create(:user)
    authenticated_request(:get, '/api/v1/auth/validate', user)

    assert_response :ok
    assert_equal 'user', json[:data][:type]
    assert_equal user.id.to_s, json[:data][:id]
  end

  test "returns unauthorized with expired token" do
    # Mock an expired token scenario
    Warden::JWTAuth::UserDecoder.stub(:new, -> {
      mock = MiniTest::Mock.new
      mock.expect(:call, nil) { raise JWT::ExpiredSignature }
      mock
    }) do
      get '/api/v1/auth/validate',
          headers: { 'Authorization' => 'Bearer expired_token' },
          as: :json

      assert_response :unauthorized
    end
  end
end