# QC Frontend - React Application

## Overview

This is the React frontend application for Quality Control (QC), a relationship check-in application. Built with Vite, React 18, TypeScript, and Redux Toolkit, it connects to a Rails API backend.

## Tech Stack

- **Build Tool**: Vite 7+
- **Framework**: React 18+
- **Language**: TypeScript 5+
- **State Management**: Redux Toolkit
- **UI Components**: Material-UI (MUI)
- **HTTP Client**: Axios
- **WebSocket**: Rails ActionCable
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint + TypeScript-ESLint
- **Formatting**: Prettier

## Project Structure

```
src/
├── assets/         # Static assets (images, fonts)
├── components/     # Reusable React components
├── hooks/          # Custom React hooks
├── pages/          # Page components (routes)
├── services/       # API and WebSocket services
├── store/          # Redux store and slices
├── test/           # Test utilities and setup
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Available Scripts

```bash
# Development
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build

# Code Quality
npm run lint          # Run ESLint
npm run lint:fix      # Run ESLint with auto-fix
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
npm run type-check    # Run TypeScript type checking

# Testing
npm test              # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:ui       # Run tests with UI

# Maintenance
npm run clean         # Clean build artifacts
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
VITE_API_URL=http://localhost:3000
VITE_API_PREFIX=/api
VITE_CABLE_URL=ws://localhost:3000/cable
```

### Path Aliases

The following path aliases are configured:

- `@/` → `src/`
- `@components/` → `src/components/`
- `@pages/` → `src/pages/`
- `@services/` → `src/services/`
- `@hooks/` → `src/hooks/`
- `@utils/` → `src/utils/`
- `@types/` → `src/types/`
- `@assets/` → `src/assets/`

## Features

### API Integration
- Axios client with interceptors for authentication
- CSRF token handling for Rails
- Automatic token refresh
- Request/response logging in development

### WebSocket Support
- ActionCable integration for real-time features
- Presence channel for online status
- Notification channel for real-time alerts
- Check-in channel for collaborative sessions

### State Management
- Redux Toolkit for global state
- Slices for auth, couple, check-in, and notifications
- Async thunks for API calls
- Redux DevTools support in development

### Testing
- Component testing with Testing Library
- Unit tests with Vitest
- Mocked browser APIs
- Coverage reporting

## Development Workflow

1. Start the Rails API backend (port 3000)
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Access at http://localhost:5173

## Build & Deployment

```bash
# Build for production
npm run build

# Output will be in dist/ directory
# Can be served with any static file server
```

## Testing

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Code Style

This project uses:
- ESLint for linting
- Prettier for formatting
- TypeScript strict mode
- Import sorting

Run `npm run format` before committing.

## API Proxy

In development, API requests to `/api/*` and WebSocket connections to `/cable` are proxied to the Rails backend at `http://localhost:3000`.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)