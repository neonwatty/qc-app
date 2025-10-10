class JwtMiddleware
  def initialize(app)
    @app = app
  end

  def call(env)
    request = ActionDispatch::Request.new(env)
    
    # Skip JWT validation for public endpoints
    return @app.call(env) if public_endpoint?(request.path)
    
    # Extract token from Authorization header
    token = extract_token(request)
    
    if token
      begin
        # Validate token structure
        validate_token_format(token)
        
        # Add token to request headers for downstream processing
        env['HTTP_X_JWT_TOKEN'] = token
      rescue => e
        return unauthorized_response(e.message)
      end
    elsif protected_endpoint?(request.path)
      # Protected endpoints require authentication
      return unauthorized_response("Authentication required")
    end
    
    @app.call(env)
  end

  private

  def extract_token(request)
    auth_header = request.headers['Authorization']
    return nil unless auth_header
    
    # Extract token from "Bearer <token>" format
    auth_header.split(' ').last if auth_header.start_with?('Bearer ')
  end

  def validate_token_format(token)
    # Basic JWT format validation (three base64 segments)
    segments = token.split('.')
    raise "Invalid token format" unless segments.length == 3
    
    segments.each do |segment|
      # Check if segment is valid base64
      Base64.urlsafe_decode64(segment)
    end
  rescue => e
    raise "Invalid token encoding: #{e.message}"
  end

  def public_endpoint?(path)
    public_paths = [
      '/health',
      '/auth/sign_up',
      '/auth/sign_in',
      '/auth/password',
      '/auth/confirmation',
      '/api/auth/sign_up',
      '/api/auth/sign_in',
      '/api/auth/password',
      '/api/auth/refresh',
      '/api/v1/public'
    ]

    public_paths.any? { |p| path.start_with?(p) }
  end

  def protected_endpoint?(path)
    # All API endpoints except public ones are protected
    path.start_with?('/api/')
  end

  def unauthorized_response(message = "Unauthorized")
    body = {
      error: "Authentication failed",
      message: message,
      status: 401
    }.to_json
    
    headers = {
      'Content-Type' => 'application/json',
      'WWW-Authenticate' => 'Bearer realm="API"'
    }
    
    [401, headers, [body]]
  end
end