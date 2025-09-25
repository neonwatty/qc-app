# QC API

Rails API backend for the Quality Control relationship check-in application.

## Requirements

* Ruby version: 3.2+
* PostgreSQL 14+
* Redis (for caching and background jobs)

## Setup

1. Install dependencies:
```bash
bundle install
```

2. Setup database:
```bash
rails db:create
rails db:migrate
rails db:seed
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Testing

This project uses Minitest for testing.

### Running Tests

```bash
# Run all tests
rails test

# Run specific test file
rails test test/models/user_test.rb

# Run specific test method
rails test test/models/user_test.rb -n test_full_name

# Run tests by type
rails test:models
rails test:integration
rails test:system

# Run with coverage report
COVERAGE=true rails test

# Run tests in parallel (default)
rails test -j
```

### Test Structure

```
test/
├── test_helper.rb          # Main test configuration
├── models/                 # Unit tests for models
├── controllers/            # Controller tests
├── integration/            # API integration tests
├── serializers/            # Serializer tests
├── factories/              # FactoryBot factories
└── support/                # Helper modules
    ├── api_test_helper.rb
    └── auth_test_helper.rb
```

## Development

```bash
# Start development server
rails server

# Run console
rails console

# Run background jobs
rails jobs:work
```

## API Documentation

API endpoints are available under `/api/v1/`

## Deployment

Instructions for deployment...
