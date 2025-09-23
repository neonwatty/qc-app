import { test, expect } from '@playwright/test'
import {
  testUsers,
  login,
  waitForAnimation,
  selectCategory,
  fillNote,
  completeCheckInStep,
  verifyDashboardStats
} from '../utils/test-helpers'
import { testCheckInData } from '../fixtures/test-data'

test.describe('Check-in Session Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.alex)
  })

  test('should complete full check-in session', async ({ page }) => {
    // Start check-in from dashboard
    await page.getByRole('button', { name: /Start Check-in/i }).click()
    await expect(page).toHaveURL('/checkin')

    // Step 1: Welcome
    await expect(page.getByRole('heading', { name: /Ready for your check-in/i })).toBeVisible()
    await expect(page.getByText(/Take a moment to reflect/i)).toBeVisible()
    await page.getByRole('button', { name: 'Begin Check-in' }).click()
    await waitForAnimation(page)

    // Step 2: Category Selection
    await expect(page.getByRole('heading', { name: /What would you like to discuss/i })).toBeVisible()

    // Select categories
    for (const category of testCheckInData.categories) {
      await selectCategory(page, category)
    }

    // Verify selected count
    await expect(page.getByText(/4 categories selected/i)).toBeVisible()
    await page.getByRole('button', { name: 'Continue' }).click()
    await waitForAnimation(page)

    // Step 3: Category Discussions
    for (let i = 0; i < testCheckInData.categories.length; i++) {
      const category = testCheckInData.categories[i]
      const noteKey = category.toLowerCase().replace(/\s+/g, '') as keyof typeof testCheckInData.notes

      // Verify category header
      await expect(page.getByRole('heading', { name: new RegExp(category, 'i') })).toBeVisible()

      // Fill shared note
      await fillNote(page, testCheckInData.notes[noteKey].shared, false)

      // Fill private note
      await fillNote(page, testCheckInData.notes[noteKey].private, true)

      // Move to next category or continue
      if (i < testCheckInData.categories.length - 1) {
        await page.getByRole('button', { name: 'Next Category' }).click()
      } else {
        await page.getByRole('button', { name: 'Continue' }).click()
      }
      await waitForAnimation(page)
    }

    // Step 4: Reflection
    await expect(page.getByRole('heading', { name: /Reflection/i })).toBeVisible()
    await page.getByLabel('Reflection').fill(testCheckInData.reflection.text)
    await page.getByRole('button', { name: 'Continue' }).click()
    await waitForAnimation(page)

    // Step 5: Action Items
    await expect(page.getByRole('heading', { name: /Action Items/i })).toBeVisible()

    for (const item of testCheckInData.actionItems) {
      // Add new action item
      await page.getByRole('button', { name: /Add Action Item/i }).click()

      // Fill action item details
      await page.getByLabel('Title').fill(item.title)
      await page.getByLabel('Assignee').selectOption(item.assignee)
      await page.getByLabel('Priority').selectOption(item.priority)

      // Set due date (relative to today)
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + item.dueDate)
      await page.getByLabel('Due Date').fill(dueDate.toISOString().split('T')[0])

      await page.getByRole('button', { name: 'Save' }).click()
      await waitForAnimation(page, 300)
    }

    await page.getByRole('button', { name: 'Complete Check-in' }).click()
    await waitForAnimation(page)

    // Step 6: Completion
    await expect(page.getByRole('heading', { name: /Check-in Complete/i })).toBeVisible()
    await expect(page.getByText(/Great job completing your check-in/i)).toBeVisible()

    // Return to dashboard
    await page.getByRole('button', { name: 'Back to Dashboard' }).click()
    await expect(page).toHaveURL('/dashboard')

    // Verify check-in was recorded
    await verifyDashboardStats(page, {
      checkIns: 1,
      actionItems: 3
    })
  })

  test('should save progress and resume check-in', async ({ page }) => {
    // Start check-in
    await page.getByRole('button', { name: /Start Check-in/i }).click()
    await expect(page).toHaveURL('/checkin')

    // Complete welcome step
    await page.getByRole('button', { name: 'Begin Check-in' }).click()
    await waitForAnimation(page)

    // Select some categories
    await selectCategory(page, 'Communication')
    await selectCategory(page, 'Trust')

    // Navigate away
    await page.getByRole('link', { name: 'Dashboard' }).click()
    await expect(page).toHaveURL('/dashboard')

    // Should see option to resume
    await expect(page.getByRole('button', { name: /Resume Check-in/i })).toBeVisible()

    // Resume check-in
    await page.getByRole('button', { name: /Resume Check-in/i }).click()
    await expect(page).toHaveURL('/checkin')

    // Should be back at category selection with previous selections
    await expect(page.getByText(/2 categories selected/i)).toBeVisible()
  })

  test('should validate required fields in check-in', async ({ page }) => {
    // Start check-in
    await page.getByRole('button', { name: /Start Check-in/i }).click()
    await page.getByRole('button', { name: 'Begin Check-in' }).click()
    await waitForAnimation(page)

    // Try to continue without selecting categories
    await page.getByRole('button', { name: 'Continue' }).click()

    // Should show validation error
    await expect(page.getByText(/Please select at least one category/i)).toBeVisible()

    // Select a category and continue
    await selectCategory(page, 'Communication')
    await page.getByRole('button', { name: 'Continue' }).click()
    await waitForAnimation(page)

    // Try to continue without filling notes
    await page.getByRole('button', { name: 'Continue' }).click()

    // Should show validation error
    await expect(page.getByText(/Please add at least one note/i)).toBeVisible()
  })

  test('should handle privacy settings for notes', async ({ page }) => {
    // Navigate to check-in and reach discussion step
    await page.getByRole('button', { name: /Start Check-in/i }).click()
    await page.getByRole('button', { name: 'Begin Check-in' }).click()
    await waitForAnimation(page)
    await selectCategory(page, 'Trust')
    await page.getByRole('button', { name: 'Continue' }).click()
    await waitForAnimation(page)

    // Add shared note
    const sharedNote = 'This is a shared note visible to my partner'
    await fillNote(page, sharedNote, false)

    // Verify shared icon is displayed
    await expect(page.getByTestId('shared-note-icon')).toBeVisible()

    // Add private note
    const privateNote = 'This is my private reflection'
    await fillNote(page, privateNote, true)

    // Verify private icon is displayed
    await expect(page.getByTestId('private-note-icon')).toBeVisible()

    // Toggle privacy on shared note
    await page.getByTestId('toggle-privacy-shared').click()
    await expect(page.getByText(/Note privacy changed to private/i)).toBeVisible()
  })

  test('should track check-in duration', async ({ page }) => {
    const startTime = Date.now()

    // Complete minimal check-in
    await page.getByRole('button', { name: /Start Check-in/i }).click()
    await page.getByRole('button', { name: 'Begin Check-in' }).click()
    await waitForAnimation(page)

    await selectCategory(page, 'Communication')
    await page.getByRole('button', { name: 'Continue' }).click()
    await waitForAnimation(page)

    await fillNote(page, 'Quick note', false)
    await page.getByRole('button', { name: 'Continue' }).click()
    await waitForAnimation(page)

    await page.getByLabel('Reflection').fill('Quick reflection')
    await page.getByRole('button', { name: 'Continue' }).click()
    await waitForAnimation(page)

    await page.getByRole('button', { name: 'Complete Check-in' }).click()
    await waitForAnimation(page)

    const duration = Date.now() - startTime

    // Verify duration is displayed and under 5 minutes
    await expect(page.getByText(/Completed in \d+ minutes?/i)).toBeVisible()
    expect(duration).toBeLessThan(5 * 60 * 1000) // Less than 5 minutes
  })

  test('should show progress indicator throughout check-in', async ({ page }) => {
    await page.getByRole('button', { name: /Start Check-in/i }).click()

    // Step 1: Welcome (1/6)
    await expect(page.getByTestId('progress-step-1')).toHaveAttribute('data-active', 'true')
    await expect(page.getByText('Step 1 of 6')).toBeVisible()

    await page.getByRole('button', { name: 'Begin Check-in' }).click()
    await waitForAnimation(page)

    // Step 2: Categories (2/6)
    await expect(page.getByTestId('progress-step-2')).toHaveAttribute('data-active', 'true')
    await expect(page.getByText('Step 2 of 6')).toBeVisible()

    await selectCategory(page, 'Communication')
    await page.getByRole('button', { name: 'Continue' }).click()
    await waitForAnimation(page)

    // Step 3: Discussion (3/6)
    await expect(page.getByTestId('progress-step-3')).toHaveAttribute('data-active', 'true')
    await expect(page.getByText('Step 3 of 6')).toBeVisible()
  })

  test('should allow skipping optional steps', async ({ page }) => {
    await page.getByRole('button', { name: /Start Check-in/i }).click()
    await page.getByRole('button', { name: 'Begin Check-in' }).click()
    await waitForAnimation(page)

    await selectCategory(page, 'Communication')
    await page.getByRole('button', { name: 'Continue' }).click()
    await waitForAnimation(page)

    await fillNote(page, 'Required note', false)
    await page.getByRole('button', { name: 'Continue' }).click()
    await waitForAnimation(page)

    // Skip reflection (if optional)
    const skipButton = page.getByRole('button', { name: /Skip/i })
    if (await skipButton.isVisible()) {
      await skipButton.click()
      await waitForAnimation(page)
    } else {
      await page.getByLabel('Reflection').fill('Brief reflection')
      await page.getByRole('button', { name: 'Continue' }).click()
      await waitForAnimation(page)
    }

    // Skip action items
    const skipActionItems = page.getByRole('button', { name: /Skip Action Items/i })
    if (await skipActionItems.isVisible()) {
      await skipActionItems.click()
    } else {
      await page.getByRole('button', { name: 'Complete Check-in' }).click()
    }
    await waitForAnimation(page)

    // Should reach completion
    await expect(page.getByRole('heading', { name: /Check-in Complete/i })).toBeVisible()
  })
})