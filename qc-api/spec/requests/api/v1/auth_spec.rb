require 'rails_helper'

RSpec.describe 'API V1 Authentication', type: :request do
  describe 'POST /api/v1/auth/signup' do
    let(:valid_params) do
      {
        user: {
          email: 'newuser@example.com',
          password: 'Password123!',
          password_confirmation: 'Password123!',
          first_name: 'John',
          last_name: 'Doe'
        }
      }
    end

    context 'with valid parameters' do
      it 'creates a new user' do
        expect {
          post '/api/v1/auth/signup', params: valid_params, as: :json
        }.to change(User, :count).by(1)
      end

      it 'returns success response with user data' do
        post '/api/v1/auth/signup', params: valid_params, as: :json

        expect(response).to have_http_status(:created)
        expect(json[:data][:type]).to eq('user')
        expect(json[:data][:attributes][:email]).to eq('newuser@example.com')
      end

      it 'returns JWT token in headers' do
        post '/api/v1/auth/signup', params: valid_params, as: :json

        expect(response.headers['Authorization']).to match(/^Bearer /)
      end
    end

    context 'with invalid parameters' do
      it 'returns error for missing email' do
        invalid_params = valid_params.deep_merge(user: { email: '' })
        post '/api/v1/auth/signup', params: invalid_params, as: :json

        expect_error_response(:unprocessable_entity, "Email can't be blank")
      end

      it 'returns error for password mismatch' do
        invalid_params = valid_params.deep_merge(user: { password_confirmation: 'DifferentPassword' })
        post '/api/v1/auth/signup', params: invalid_params, as: :json

        expect_error_response(:unprocessable_entity, "Password confirmation doesn't match")
      end

      it 'returns error for duplicate email' do
        create(:user, email: 'newuser@example.com')
        post '/api/v1/auth/signup', params: valid_params, as: :json

        expect_error_response(:unprocessable_entity, 'Email has already been taken')
      end
    end
  end

  describe 'POST /api/v1/auth/login' do
    let!(:user) { create(:user, email: 'user@example.com', password: 'Password123!') }

    context 'with valid credentials' do
      it 'returns success response with JWT token' do
        post '/api/v1/auth/login', params: {
          user: {
            email: 'user@example.com',
            password: 'Password123!'
          }
        }, as: :json

        expect(response).to have_http_status(:ok)
        expect(response.headers['Authorization']).to match(/^Bearer /)
        expect(json[:data][:type]).to eq('user')
        expect(json[:data][:id]).to eq(user.id.to_s)
      end
    end

    context 'with invalid credentials' do
      it 'returns error for wrong password' do
        post '/api/v1/auth/login', params: {
          user: {
            email: 'user@example.com',
            password: 'WrongPassword'
          }
        }, as: :json

        expect_error_response(:unauthorized, 'Invalid email or password')
      end

      it 'returns error for non-existent email' do
        post '/api/v1/auth/login', params: {
          user: {
            email: 'nonexistent@example.com',
            password: 'Password123!'
          }
        }, as: :json

        expect_error_response(:unauthorized, 'Invalid email or password')
      end
    end

    context 'with unconfirmed account' do
      let!(:unconfirmed_user) { create(:user, :unconfirmed) }

      it 'returns error message about confirmation' do
        post '/api/v1/auth/login', params: {
          user: {
            email: unconfirmed_user.email,
            password: 'Password123!'
          }
        }, as: :json

        expect_error_response(:unauthorized, 'You have to confirm your email address')
      end
    end
  end

  describe 'DELETE /api/v1/auth/logout' do
    let(:user) { create(:user) }

    context 'with authenticated user' do
      it 'logs out successfully' do
        authenticated_request(:delete, '/api/v1/auth/logout', user)

        expect(response).to have_http_status(:no_content)
      end

      it 'invalidates the JWT token' do
        authenticated_request(:delete, '/api/v1/auth/logout', user)

        # Attempt to use the same token again
        authenticated_request(:get, '/api/v1/profile', user)
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'without authentication' do
      it 'returns unauthorized' do
        delete '/api/v1/auth/logout', as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET /api/v1/auth/validate' do
    let(:user) { create(:user) }

    context 'with valid token' do
      it 'returns user data' do
        authenticated_request(:get, '/api/v1/auth/validate', user)

        expect(response).to have_http_status(:ok)
        expect(json[:data][:type]).to eq('user')
        expect(json[:data][:id]).to eq(user.id.to_s)
      end
    end

    context 'with expired token' do
      it 'returns unauthorized' do
        # Mock an expired token scenario
        allow_any_instance_of(Warden::JWTAuth::UserDecoder).to receive(:call).and_raise(JWT::ExpiredSignature)

        get '/api/v1/auth/validate',
            headers: { 'Authorization' => 'Bearer expired_token' },
            as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end