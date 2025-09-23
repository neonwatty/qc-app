# React Testing Configuration Guide

This directory contains utilities and configurations for testing React components and features in the QC app.

## Table of Contents

- [Setup](#setup)
- [Running Tests](#running-tests)
- [Testing Utilities](#testing-utilities)
- [Writing Tests](#writing-tests)
- [Mocking Strategies](#mocking-strategies)
- [Best Practices](#best-practices)

## Setup

The testing environment is pre-configured with:

- **Jest** - Test runner and assertion library
- **React Testing Library** - Component testing utilities
- **@testing-library/user-event** - User interaction simulation
- **TypeScript** support

Configuration files:
- `jest.config.js` - Jest configuration
- `src/test-utils/setupTests.ts` - Global test setup
- `src/test-utils/mockBrowserAPIs.ts` - Browser API mocks

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/test.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should render"
```

## Testing Utilities

### 1. Test Helpers (`testHelpers.tsx`)

#### Custom Render with Providers

```typescript
import { renderWithProviders, screen } from '@/test-utils/testHelpers'

test('renders component with providers', () => {
  renderWithProviders(<MyComponent />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

#### Mock Data Generators

```typescript
import { generateMockNotification, generateMockSession } from '@/test-utils/testHelpers'

const notification = generateMockNotification({
  type: 'reminder',
  read: false
})

const session = generateMockSession({
  status: 'active'
})
```

### 2. API Mocking (`apiMocks.ts`)

#### Using MockApiClient

```typescript
import { MockApiClient } from '@/test-utils/apiMocks'

describe('API Integration', () => {
  let apiClient: MockApiClient

  beforeEach(() => {
    apiClient = new MockApiClient()
  })

  afterEach(() => {
    apiClient.reset()
  })

  test('successful login', async () => {
    apiClient.setupSuccessfulAuth()

    // Your component that makes API calls
    renderWithProviders(<LoginForm />)

    // Interact and assert
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password')
    await userEvent.click(screen.getByRole('button', { name: /login/i }))

    expect(apiClient.getFetchSpy()).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  test('network error handling', async () => {
    apiClient.simulateNetworkError('/auth/login')

    // Test error handling
  })
})
```

#### Custom API Responses

```typescript
apiClient.setCustomResponse('GET', '/custom-endpoint', {
  data: { result: 'custom data' }
})
```

### 3. WebSocket Mocking (`websocketMocks.ts`)

#### Basic WebSocket Testing

```typescript
import { MockWebSocket, installWebSocketMocks } from '@/test-utils/websocketMocks'

describe('WebSocket Features', () => {
  let cleanupWS: () => void

  beforeEach(() => {
    cleanupWS = installWebSocketMocks()
  })

  afterEach(() => {
    cleanupWS()
  })

  test('handles WebSocket messages', async () => {
    const Component = () => {
      const [messages, setMessages] = useState<string[]>([])

      useEffect(() => {
        const ws = new WebSocket('ws://localhost:3000')

        ws.onmessage = (event) => {
          setMessages(prev => [...prev, event.data])
        }

        return () => ws.close()
      }, [])

      return <div>{messages.map(m => <div key={m}>{m}</div>)}</div>
    }

    const { container } = renderWithProviders(<Component />)

    // Get the mock WebSocket instance
    const ws = global.WebSocket.mock.results[0].value as MockWebSocket

    // Simulate message
    ws.simulateMessage({ type: 'chat', text: 'Hello' })

    await waitFor(() => {
      expect(screen.getByText(/Hello/)).toBeInTheDocument()
    })
  })
})
```

#### Action Cable Testing

```typescript
import { createMockActionCable } from '@/test-utils/websocketMocks'

test('Action Cable subscription', () => {
  const mockCable = createMockActionCable()

  // Mock the import
  jest.mock('@rails/actioncable', () => mockCable)

  // Your component using Action Cable
  renderWithProviders(<ChatRoom roomId="123" />)

  // Simulate receiving data
  mockCable.consumer.simulateReceive('ChatChannel', {
    message: 'New message'
  })

  expect(screen.getByText('New message')).toBeInTheDocument()
})
```

#### WebSocket Test Scenarios

```typescript
import { wsTestScenarios } from '@/test-utils/websocketMocks'

test('handles connection failure', () => {
  const ws = new MockWebSocket('ws://localhost')

  // Apply failure scenario
  wsTestScenarios.connectionFailure(ws)

  expect(ws.readyState).toBe(WS_STATES.CLOSED)
})
```

### 4. Browser API Mocks (`mockBrowserAPIs.ts`)

Pre-configured mocks for:
- `window.matchMedia` - Media queries
- `IntersectionObserver` - Scroll/visibility detection
- `ResizeObserver` - Element resize detection
- `window.scrollTo` - Scroll behavior
- Notification API - Browser notifications
- Clipboard API - Copy/paste functionality

## Writing Tests

### Component Testing Example

```typescript
import { renderWithProviders, screen, userEvent, waitFor } from '@/test-utils/testHelpers'
import { CheckInFlow } from '@/components/checkin/CheckInFlow'

describe('CheckInFlow', () => {
  it('should complete check-in flow', async () => {
    const user = userEvent.setup()

    renderWithProviders(<CheckInFlow />)

    // Step 1: Welcome
    expect(screen.getByText(/Ready to check in/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /start/i }))

    // Step 2: Category Selection
    await waitFor(() => {
      expect(screen.getByText(/Choose categories/i)).toBeInTheDocument()
    })

    await user.click(screen.getByText('Communication'))
    await user.click(screen.getByRole('button', { name: /next/i }))

    // Continue through flow...
  })
})
```

### Hook Testing Example

```typescript
import { renderHook, act } from '@testing-library/react'
import { useNotifications } from '@/hooks/useNotifications'

test('useNotifications hook', () => {
  const { result } = renderHook(() => useNotifications())

  act(() => {
    result.current.addNotification({
      type: 'info',
      message: 'Test notification'
    })
  })

  expect(result.current.notifications).toHaveLength(1)
  expect(result.current.notifications[0].message).toBe('Test notification')
})
```

### Integration Testing Example

```typescript
describe('Full User Journey', () => {
  let apiClient: MockApiClient

  beforeEach(() => {
    apiClient = new MockApiClient()
    apiClient.setupSuccessfulAuth()
    apiClient.setupSessionEndpoints()
  })

  it('should complete onboarding and start first check-in', async () => {
    const user = userEvent.setup()

    // Start at onboarding
    renderWithProviders(<App initialRoute="/onboarding" />)

    // Complete onboarding steps
    // ...

    // Verify redirect to dashboard
    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
    })

    // Start check-in
    await user.click(screen.getByRole('button', { name: /Start Check-in/i }))

    // Verify API calls
    expect(apiClient.getFetchSpy()).toHaveBeenCalledWith(
      expect.stringContaining('/sessions'),
      expect.objectContaining({ method: 'POST' })
    )
  })
})
```

## Mocking Strategies

### 1. Module Mocks

Configured in `setupTests.ts`:
- `framer-motion` - Animation library
- `next/navigation` - Next.js routing
- `lucide-react` - Icon library
- `canvas-confetti` - Celebration effects

### 2. API Mocking

- Use `MockApiClient` for HTTP requests
- Configure responses before component renders
- Test both success and error scenarios

### 3. WebSocket Mocking

- Use `MockWebSocket` for WebSocket connections
- Use `MockActionCableConsumer` for Action Cable
- Test connection lifecycle and message handling

### 4. LocalStorage Mocking

```typescript
import { mockLocalStorage } from '@/test-utils/testHelpers'

test('persists to localStorage', () => {
  const localStorage = mockLocalStorage()

  // Your test...

  expect(localStorage.setItem).toHaveBeenCalledWith(
    'key',
    JSON.stringify({ data: 'value' })
  )
})
```

## Best Practices

### 1. Query Priority

Use queries in this order of preference:

1. `getByRole` - Most accessible
2. `getByLabelText` - Form elements
3. `getByPlaceholderText` - When no label
4. `getByText` - Non-interactive elements
5. `getByTestId` - Last resort

### 2. Async Testing

```typescript
// Prefer waitFor over fixed timeouts
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})

// Use userEvent for interactions (includes realistic delays)
const user = userEvent.setup()
await user.click(button)
```

### 3. Component Isolation

```typescript
// Mock child components when testing parents
jest.mock('@/components/ComplexChild', () => ({
  ComplexChild: () => <div>Mocked Child</div>
}))
```

### 4. Test Structure

```typescript
describe('Component', () => {
  describe('Feature/Scenario', () => {
    it('should do something specific', () => {
      // Arrange - Setup
      // Act - Perform action
      // Assert - Check result
    })
  })
})
```

### 5. Accessibility Testing

```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

test('should have no accessibility violations', async () => {
  const { container } = renderWithProviders(<Component />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### 6. Snapshot Testing

Use sparingly, only for:
- Stable UI components
- Error messages
- Generated configurations

```typescript
test('renders correctly', () => {
  const { container } = renderWithProviders(<StableComponent />)
  expect(container.firstChild).toMatchSnapshot()
})
```

## Debugging Tests

### Debug Output

```typescript
import { screen, debug } from '@testing-library/react'

// Debug entire document
debug()

// Debug specific element
debug(screen.getByRole('button'))

// Use screen.debug() for formatted output
screen.debug(undefined, 30000) // Increase character limit
```

### Interactive Mode

```bash
# Run tests in watch mode with interactive debugging
npm test -- --watch
```

### VS Code Debugging

1. Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Jest Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "${file}"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

2. Set breakpoints in test files
3. Run with F5

## Common Issues and Solutions

### Issue: Test fails with "not wrapped in act(...)"

**Solution:** Wrap state updates in `act()`:

```typescript
await act(async () => {
  await userEvent.click(button)
})
```

### Issue: Cannot find element

**Solution:** Use `waitFor` for async rendering:

```typescript
await waitFor(() => {
  expect(screen.getByText('Loading...')).toBeInTheDocument()
})
```

### Issue: Timer-related tests fail

**Solution:** Use fake timers:

```typescript
jest.useFakeTimers()

// Your test with timers

act(() => {
  jest.advanceTimersByTime(1000)
})

jest.useRealTimers()
```

## Resources

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [User Event Documentation](https://testing-library.com/docs/user-event/intro)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)