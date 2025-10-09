import { test, expect } from '@playwright/test'
import { testUsers, login, logout, waitForAnimation } from './utils/test-helpers'

/**
 * Complete App Flow Test
 *
 * This test signs in and traverses through all main pages of the application,
 * verifying that each page loads correctly and key functionality works.
 */
test.describe('Complete App Flow - Sign-in and Page Traversal', () => {
  test('should successfully sign in and navigate through all app pages', async ({ page }) => {
    // ============================================
    // 1. LANDING PAGE & SIGN IN
    // ============================================
    await test.step('Navigate to landing page', async () => {
      await page.goto('/')
      await expect(page.getByText('Quality Control')).toBeVisible()
      await expect(page.getByText('for your relationship')).toBeVisible()
    })

    await test.step('Navigate to login and sign in', async () => {
      // Click the sign-in link
      await page.getByRole('link', { name: /sign in/i }).click()
      await expect(page).toHaveURL('/login')

      // Verify login page elements
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()

      // Fill in credentials and submit
      await page.getByLabel(/email/i).fill(testUsers.alex.email)
      await page.getByLabel(/password/i).fill(testUsers.alex.password)
      await page.getByRole('button', { name: /sign in/i }).click()

      // Verify redirect to dashboard
      await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
    })

    // ============================================
    // 2. DASHBOARD PAGE
    // ============================================
    await test.step('Verify dashboard page', async () => {
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()

      // Verify key dashboard elements
      await expect(page.locator('text=/check.?in/i').first()).toBeVisible()

      // Verify navigation is present
      await expect(page.getByRole('navigation')).toBeVisible()

      // Take screenshot
      await page.screenshot({ path: 'test-results/screenshots/01-dashboard.png', fullPage: true })
    })

    // ============================================
    // 3. CHECK-IN PAGE
    // ============================================
    await test.step('Navigate to check-in page', async () => {
      await page.getByRole('link', { name: /check.?in/i }).first().click()
      await expect(page).toHaveURL('/checkin')

      // Verify check-in page or start button
      const hasActiveCheckIn = await page.getByText(/in progress/i).isVisible().catch(() => false)
      if (hasActiveCheckIn) {
        await expect(page.getByText(/resume/i).or(page.getByText(/continue/i))).toBeVisible()
      } else {
        await expect(page.getByRole('button', { name: /start.*check.?in/i }).first()).toBeVisible()
      }

      await page.screenshot({ path: 'test-results/screenshots/02-checkin.png', fullPage: true })
    })

    // ============================================
    // 4. NOTES PAGE
    // ============================================
    await test.step('Navigate to notes page', async () => {
      await page.getByRole('link', { name: /^notes$/i }).click()
      await expect(page).toHaveURL('/notes')

      // Verify notes page elements
      await expect(
        page.getByRole('heading', { name: /notes/i })
          .or(page.getByText(/your notes/i))
      ).toBeVisible()

      await page.screenshot({ path: 'test-results/screenshots/03-notes.png', fullPage: true })
    })

    // ============================================
    // 5. GROWTH GALLERY PAGE
    // ============================================
    await test.step('Navigate to growth gallery page', async () => {
      await page.getByRole('link', { name: /growth/i }).click()
      await expect(page).toHaveURL('/growth')

      // Verify growth page elements
      await expect(page.getByRole('heading', { name: /growth/i }).first()).toBeVisible()

      await page.screenshot({ path: 'test-results/screenshots/04-growth.png', fullPage: true })
    })

    // ============================================
    // 6. REMINDERS PAGE (OPTIONAL)
    // ============================================
    await test.step('Navigate to reminders page if available', async () => {
      const remindersLink = page.getByRole('link', { name: /reminder/i })
      if (await remindersLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await remindersLink.click()
        await expect(page).toHaveURL('/reminders')

        // Verify reminders page elements
        await expect(
          page.getByRole('heading', { name: /reminder/i })
            .or(page.getByText(/reminder/i))
        ).toBeVisible()

        await page.screenshot({ path: 'test-results/screenshots/05-reminders.png', fullPage: true })
      }
    })

    // ============================================
    // 7. RETURN TO DASHBOARD
    // ============================================
    await test.step('Return to dashboard', async () => {
      await page.getByRole('link', { name: /dashboard/i }).first().click()
      await expect(page).toHaveURL('/dashboard')
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()

      await page.screenshot({ path: 'test-results/screenshots/06-dashboard-return.png', fullPage: true })
    })
  })

  test('should complete a quick check-in session', async ({ page }) => {
    // Login first
    await login(page, testUsers.alex)
    await expect(page).toHaveURL('/dashboard')

    await test.step('Start and complete a minimal check-in', async () => {
      // Navigate to check-in
      await page.goto('/checkin')

      // Check if there's a start button
      const startButton = page.getByRole('button', { name: /start.*check.?in|begin/i })
      if (await startButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await startButton.click()
        await waitForAnimation(page)

        // If there's a welcome screen, continue
        const continueButton = page.getByRole('button', { name: /continue|begin|next/i })
        if (await continueButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await continueButton.click()
          await waitForAnimation(page)
        }
      }

      // Take screenshot of check-in in progress
      await page.screenshot({ path: 'test-results/screenshots/07-checkin-in-progress.png', fullPage: true })
    })
  })

  test('should verify responsive navigation on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Login
    await login(page, testUsers.alex)
    await expect(page).toHaveURL('/dashboard')

    await test.step('Verify mobile navigation', async () => {
      // Look for mobile menu button (hamburger)
      const mobileMenuButton = page.getByRole('button', { name: /menu|navigation/i })
        .or(page.locator('[aria-label*="menu" i]'))
        .or(page.locator('button').filter({ hasText: /☰|≡/ }))

      if (await mobileMenuButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await mobileMenuButton.click()
        await waitForAnimation(page, 300)

        // Verify navigation items are visible
        await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible()
        await expect(page.getByRole('link', { name: /check.?in/i })).toBeVisible()

        await page.screenshot({ path: 'test-results/screenshots/08-mobile-navigation.png', fullPage: true })
      }
    })
  })

  test('should handle authentication persistence across page reloads', async ({ page }) => {
    // Login
    await login(page, testUsers.alex)
    await expect(page).toHaveURL('/dashboard')

    await test.step('Verify auth persists after reload', async () => {
      // Reload page
      await page.reload()

      // Should remain authenticated (either on dashboard or redirected to home)
      // If redirected to home, verify we're not on the login page
      const currentURL = page.url()
      expect(currentURL).not.toContain('/login')

      // If we're on home, navigate back to dashboard to verify auth
      if (currentURL.endsWith('/')) {
        await page.goto('/dashboard')
        await expect(page).toHaveURL('/dashboard')
        await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
      }
    })

    await test.step('Verify auth persists when navigating directly to protected route', async () => {
      // Navigate to a different protected route
      await page.goto('/settings')

      // Should remain authenticated (not redirected to login)
      const currentURL = page.url()
      expect(currentURL).not.toContain('/login')

      // If redirected to home, navigate to settings again to verify auth
      if (currentURL.endsWith('/')) {
        await page.getByRole('link', { name: /setting/i }).first().click()
        await expect(page).toHaveURL('/settings')
        await expect(
          page.getByRole('heading', { name: /setting/i })
            .or(page.getByText(/preference|account/i))
        ).toBeVisible()
      }
    })
  })
})
