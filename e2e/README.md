# End-to-End Testing with Playwright

This directory contains end-to-end tests for the QC app using Playwright.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

### Run all tests
```bash
npm run e2e
```

### Run tests in headed mode (see browser)
```bash
npm run e2e:headed
```

### Run tests in debug mode
```bash
npm run e2e:debug
```

### Open Playwright UI
```bash
npm run e2e:ui
```

### Generate test code
```bash
npm run e2e:codegen
```

### View test report
```bash
npm run e2e:report
```

## Test Structure

```
e2e/
├── auth/                 # Authentication flow tests
│   └── auth.spec.ts     # Login, registration, logout tests
├── checkin/             # Check-in session tests
│   └── checkin-flow.spec.ts  # Complete check-in workflow
├── partner/             # Partner interaction tests
│   └── partner-interaction.spec.ts  # Multi-user scenarios
├── fixtures/            # Test data
│   └── test-data.ts    # Reusable test data
└── utils/               # Test utilities
    └── test-helpers.ts  # Helper functions
```

## Test Coverage

### Authentication (`auth.spec.ts`)
- Login with valid/invalid credentials
- Registration flow and validation
- Password reset flow
- Session persistence and expiration
- Protected route access

### Check-in Flow (`checkin-flow.spec.ts`)
- Complete check-in session (< 5 minutes)
- Category selection and notes
- Privacy settings for notes
- Progress saving and resuming
- Field validation
- Progress indicators
- Duration tracking

### Partner Interactions (`partner-interaction.spec.ts`)
- Online/offline status
- Shared notes synchronization
- Simultaneous check-ins
- Action item sharing
- Completion notifications
- Growth timeline updates
- Partner invitation flow

## Writing Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path')
    await expect(page.getByRole('heading')).toBeVisible()
  })
})
```

### Using Test Helpers
```typescript
import { login, testUsers } from '../utils/test-helpers'

test('authenticated flow', async ({ page }) => {
  await login(page, testUsers.alex)
  // ... test authenticated features
})
```

## Configuration

See `playwright.config.ts` for:
- Browser configurations (Chrome, Firefox, Safari)
- Mobile device testing (Pixel 5, iPhone 13)
- Test timeouts and retries
- Screenshot and video capture settings
- Base URL and web server settings

## CI Integration

Tests are configured to run in CI with:
- GitHub Actions reporter
- Retry on failure (2 attempts)
- Single worker to ensure stability
- Automatic web server startup

## Debugging Tips

1. Use `page.pause()` to pause execution
2. Run with `--debug` flag for step-by-step debugging
3. Use Playwright Inspector UI for interactive debugging
4. Screenshots and videos are saved on failure in `test-results/`

## Best Practices

1. **Keep tests independent** - Each test should be able to run in isolation
2. **Use data-testid** - For stable element selection
3. **Mock external APIs** - For consistent test results
4. **Test user journeys** - Focus on complete workflows
5. **Mobile-first** - Test on mobile viewports
6. **Accessibility** - Use semantic selectors (role, label)