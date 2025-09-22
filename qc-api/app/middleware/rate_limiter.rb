class RateLimiter
  def initialize(app, options = {})
    @app = app
    @limits = options[:limits] || default_limits

    # Try to connect to Redis if available
    begin
      require 'redis'
      @redis = Redis.new(url: ENV['REDIS_URL'] || 'redis://localhost:6379')
      @redis.ping # Test connection
    rescue LoadError, Redis::CannotConnectError => e
      Rails.logger.warn "Redis not available for rate limiting: #{e.message}"
      @redis = nil
    end
  end

  def call(env)
    request = ActionDispatch::Request.new(env)
    
    # Skip rate limiting for health checks
    return @app.call(env) if request.path == '/health'
    
    # Different limits for different endpoints
    limit_config = determine_limit(request)
    
    # Check rate limit
    if rate_limited?(request, limit_config)
      return rate_limit_exceeded_response(limit_config)
    end
    
    @app.call(env)
  rescue Redis::CannotConnectError
    # If Redis is down, allow the request but log warning
    Rails.logger.warn "Redis unavailable for rate limiting"
    @app.call(env)
  end

  private

  def default_limits
    {
      auth: { requests: 5, period: 60 },        # 5 auth attempts per minute
      api: { requests: 100, period: 60 },       # 100 API calls per minute
      uploads: { requests: 10, period: 300 },   # 10 uploads per 5 minutes
      public: { requests: 20, period: 60 }      # 20 public requests per minute
    }
  end

  def determine_limit(request)
    case request.path
    when /\/auth\/(sign_in|sign_up)/
      @limits[:auth]
    when /\/uploads?/
      @limits[:uploads]
    when /\/api\//
      @limits[:api]
    else
      @limits[:public]
    end
  end

  def rate_limited?(request, limit_config)
    return false unless limit_config
    return false unless @redis # Skip rate limiting if Redis unavailable

    # Use IP address and path as key
    key = "rate_limit:#{request.ip}:#{request.path}"

    # Get current count
    current = @redis.get(key).to_i

    if current >= limit_config[:requests]
      true
    else
      # Increment counter with expiry
      @redis.multi do |multi|
        multi.incr(key)
        multi.expire(key, limit_config[:period])
      end
      false
    end
  end

  def rate_limit_exceeded_response(limit_config)
    body = {
      error: "Rate limit exceeded",
      message: "Too many requests. Please try again later.",
      retry_after: limit_config[:period]
    }.to_json
    
    headers = {
      'Content-Type' => 'application/json',
      'Retry-After' => limit_config[:period].to_s,
      'X-RateLimit-Limit' => limit_config[:requests].to_s,
      'X-RateLimit-Remaining' => '0',
      'X-RateLimit-Reset' => (Time.now.to_i + limit_config[:period]).to_s
    }
    
    [429, headers, [body]]
  end
end