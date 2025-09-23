import { test, expect } from '@playwright/test'
import { testUsers, login, logout, navigateTo } from '../utils/test-helpers'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/')
  })

  test('should display login page for unauthenticated users', async ({ page }) => {
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible()
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    await login(page, testUsers.alex)

    // Verify dashboard is displayed
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByRole('heading', { name: /Welcome back, Alex/i })).toBeVisible()

    // Verify navigation is available
    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Check-in' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Notes' })).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('wrong@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Log in' }).click()

    // Verify error message
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible()
    await expect(page).toHaveURL('/login')
  })

  test('should logout successfully', async ({ page }) => {
    // First login
    await login(page, testUsers.alex)
    await expect(page).toHaveURL('/dashboard')

    // Then logout
    await logout(page)

    // Verify redirected to login
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  })

  test('should redirect to login when accessing protected routes', async ({ page }) => {
    // Try to access protected routes without authentication
    const protectedRoutes = ['/dashboard', '/checkin', '/notes', '/growth', '/settings']

    for (const route of protectedRoutes) {
      await page.goto(route)
      await expect(page).toHaveURL('/login')
      await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    }
  })

  test('should persist authentication across page reloads', async ({ page }) => {
    // Login
    await login(page, testUsers.alex)
    await expect(page).toHaveURL('/dashboard')

    // Reload page
    await page.reload()

    // Should still be on dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByRole('heading', { name: /Welcome back, Alex/i })).toBeVisible()
  })

  test('should handle registration flow', async ({ page }) => {
    await page.goto('/login')

    // Click on sign up link
    await page.getByRole('link', { name: /Sign up/i }).click()
    await expect(page).toHaveURL('/register')

    // Fill registration form
    await page.getByLabel('Name').fill('Test User')
    await page.getByLabel('Email').fill('testuser@example.com')
    await page.getByLabel('Password').fill('SecurePassword123!')
    await page.getByLabel('Confirm Password').fill('SecurePassword123!')

    // Accept terms if present
    const termsCheckbox = page.getByRole('checkbox', { name: /terms/i })
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check()
    }

    // Submit registration
    await page.getByRole('button', { name: /Sign up/i }).click()

    // Should redirect to onboarding or dashboard
    await expect(page).toHaveURL(/(onboarding|dashboard)/)
  })

  test('should validate registration form fields', async ({ page }) => {
    await page.goto('/register')

    // Try to submit empty form
    await page.getByRole('button', { name: /Sign up/i }).click()

    // Check for validation messages
    await expect(page.getByText(/Name is required/i)).toBeVisible()
    await expect(page.getByText(/Email is required/i)).toBeVisible()
    await expect(page.getByText(/Password is required/i)).toBeVisible()

    // Test password mismatch
    await page.getByLabel('Password').fill('Password123!')
    await page.getByLabel('Confirm Password').fill('DifferentPassword123!')
    await page.getByRole('button', { name: /Sign up/i }).click()

    await expect(page.getByText(/Passwords do not match/i)).toBeVisible()
  })

  test('should handle password reset flow', async ({ page }) => {
    await page.goto('/login')

    // Click forgot password link
    await page.getByRole('link', { name: /Forgot password/i }).click()
    await expect(page).toHaveURL('/forgot-password')

    // Enter email for password reset
    await page.getByLabel('Email').fill('alex@example.com')
    await page.getByRole('button', { name: /Send reset link/i }).click()

    // Should show success message
    await expect(
      page.getByText(/Password reset link has been sent/i)
    ).toBeVisible()
  })

  test('should handle session expiration', async ({ page, context }) => {
    // Login
    await login(page, testUsers.alex)
    await expect(page).toHaveURL('/dashboard')

    // Clear cookies to simulate session expiration
    await context.clearCookies()

    // Try to navigate to protected route
    await page.goto('/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  })
})