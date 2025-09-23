import { test, expect, Browser, Page } from '@playwright/test'
import {
  testUsers,
  login,
  waitForAnimation,
  navigateTo,
  fillNote
} from '../utils/test-helpers'
import { testCheckInData } from '../fixtures/test-data'

test.describe('Partner Interaction', () => {
  let alexPage: Page
  let jordanPage: Page
  let browser: Browser

  test.beforeAll(async ({ browser: b }) => {
    browser = b
  })

  test.beforeEach(async () => {
    // Create two browser contexts for two different users
    const alexContext = await browser.newContext()
    const jordanContext = await browser.newContext()

    alexPage = await alexContext.newPage()
    jordanPage = await jordanContext.newPage()

    // Login both users
    await login(alexPage, testUsers.alex)
    await login(jordanPage, testUsers.jordan)
  })

  test.afterEach(async () => {
    await alexPage.close()
    await jordanPage.close()
  })

  test('should show partner online status', async () => {
    // Both partners on dashboard
    await navigateTo(alexPage, '/dashboard')
    await navigateTo(jordanPage, '/dashboard')

    // Alex should see Jordan online
    await expect(alexPage.getByTestId('partner-status')).toContainText('Online')
    await expect(alexPage.getByTestId('partner-avatar')).toHaveAttribute('data-online', 'true')

    // Jordan should see Alex online
    await expect(jordanPage.getByTestId('partner-status')).toContainText('Online')
    await expect(jordanPage.getByTestId('partner-avatar')).toHaveAttribute('data-online', 'true')

    // Jordan navigates away
    await jordanPage.close()
    await waitForAnimation(alexPage, 2000) // Wait for status update

    // Alex should see Jordan offline
    await expect(alexPage.getByTestId('partner-status')).toContainText('Offline')
  })

  test('should sync shared notes between partners', async () => {
    // Alex starts a check-in
    await alexPage.getByRole('button', { name: /Start Check-in/i }).click()
    await alexPage.getByRole('button', { name: 'Begin Check-in' }).click()
    await waitForAnimation(alexPage)

    // Select category and add notes
    await alexPage.getByRole('button', { name: 'Communication' }).click()
    await alexPage.getByRole('button', { name: 'Continue' }).click()
    await waitForAnimation(alexPage)

    // Alex adds a shared note
    const sharedNote = 'We communicated really well this week!'
    await fillNote(alexPage, sharedNote, false)

    // Alex adds a private note
    const privateNote = 'I still need to work on listening more'
    await fillNote(alexPage, privateNote, true)

    // Complete Alex's check-in
    await alexPage.getByRole('button', { name: 'Continue' }).click()
    await waitForAnimation(alexPage)
    await alexPage.getByLabel('Reflection').fill('Good progress this week')
    await alexPage.getByRole('button', { name: 'Continue' }).click()
    await waitForAnimation(alexPage)
    await alexPage.getByRole('button', { name: 'Complete Check-in' }).click()
    await waitForAnimation(alexPage)

    // Jordan navigates to notes
    await navigateTo(jordanPage, '/notes')

    // Jordan should see Alex's shared note
    await expect(jordanPage.getByText(sharedNote)).toBeVisible()
    await expect(jordanPage.getByText('Alex Chen')).toBeVisible()

    // Jordan should NOT see Alex's private note
    await expect(jordanPage.getByText(privateNote)).not.toBeVisible()
  })

  test('should handle simultaneous check-ins', async () => {
    // Both start check-ins
    await alexPage.getByRole('button', { name: /Start Check-in/i }).click()
    await jordanPage.getByRole('button', { name: /Start Check-in/i }).click()

    // Both complete welcome
    await alexPage.getByRole('button', { name: 'Begin Check-in' }).click()
    await jordanPage.getByRole('button', { name: 'Begin Check-in' }).click()
    await waitForAnimation(alexPage)
    await waitForAnimation(jordanPage)

    // Both select same category
    await alexPage.getByRole('button', { name: 'Trust' }).click()
    await jordanPage.getByRole('button', { name: 'Trust' }).click()

    await alexPage.getByRole('button', { name: 'Continue' }).click()
    await jordanPage.getByRole('button', { name: 'Continue' }).click()
    await waitForAnimation(alexPage)
    await waitForAnimation(jordanPage)

    // Both add notes
    await fillNote(alexPage, "Alex's perspective on trust", false)
    await fillNote(jordanPage, "Jordan's perspective on trust", false)

    // Complete both check-ins
    await alexPage.getByRole('button', { name: 'Continue' }).click()
    await jordanPage.getByRole('button', { name: 'Continue' }).click()
    await waitForAnimation(alexPage)
    await waitForAnimation(jordanPage)

    await alexPage.getByLabel('Reflection').fill("Alex's reflection")
    await jordanPage.getByLabel('Reflection').fill("Jordan's reflection")

    await alexPage.getByRole('button', { name: 'Continue' }).click()
    await jordanPage.getByRole('button', { name: 'Continue' }).click()
    await waitForAnimation(alexPage)
    await waitForAnimation(jordanPage)

    await alexPage.getByRole('button', { name: 'Complete Check-in' }).click()
    await jordanPage.getByRole('button', { name: 'Complete Check-in' }).click()

    // Both should see completion
    await expect(alexPage.getByRole('heading', { name: /Check-in Complete/i })).toBeVisible()
    await expect(jordanPage.getByRole('heading', { name: /Check-in Complete/i })).toBeVisible()

    // Navigate to notes
    await alexPage.getByRole('button', { name: 'Back to Dashboard' }).click()
    await alexPage.getByRole('link', { name: 'Notes' }).click()

    await jordanPage.getByRole('button', { name: 'Back to Dashboard' }).click()
    await jordanPage.getByRole('link', { name: 'Notes' }).click()

    // Both should see each other's notes
    await expect(alexPage.getByText("Jordan's perspective on trust")).toBeVisible()
    await expect(jordanPage.getByText("Alex's perspective on trust")).toBeVisible()
  })

  test('should share action items between partners', async () => {
    // Alex creates action items
    await navigateTo(alexPage, '/checkin')
    await alexPage.getByRole('button', { name: 'Begin Check-in' }).click()
    await waitForAnimation(alexPage)

    // Quick path to action items
    await alexPage.getByRole('button', { name: 'Communication' }).click()
    await alexPage.getByRole('button', { name: 'Continue' }).click()
    await waitForAnimation(alexPage)

    await fillNote(alexPage, 'Need to improve', false)
    await alexPage.getByRole('button', { name: 'Continue' }).click()
    await waitForAnimation(alexPage)

    await alexPage.getByLabel('Reflection').fill('Quick reflection')
    await alexPage.getByRole('button', { name: 'Continue' }).click()
    await waitForAnimation(alexPage)

    // Add action item assigned to Jordan
    await alexPage.getByRole('button', { name: /Add Action Item/i }).click()
    await alexPage.getByLabel('Title').fill('Plan weekend trip')
    await alexPage.getByLabel('Assignee').selectOption('Jordan')
    await alexPage.getByLabel('Priority').selectOption('high')
    await alexPage.getByRole('button', { name: 'Save' }).click()
    await waitForAnimation(alexPage, 300)

    // Add shared action item
    await alexPage.getByRole('button', { name: /Add Action Item/i }).click()
    await alexPage.getByLabel('Title').fill('Review monthly budget together')
    await alexPage.getByLabel('Assignee').selectOption('Both')
    await alexPage.getByLabel('Priority').selectOption('medium')
    await alexPage.getByRole('button', { name: 'Save' }).click()
    await waitForAnimation(alexPage, 300)

    await alexPage.getByRole('button', { name: 'Complete Check-in' }).click()
    await waitForAnimation(alexPage)

    // Jordan checks dashboard
    await navigateTo(jordanPage, '/dashboard')

    // Jordan should see action items
    await expect(jordanPage.getByTestId('action-items-widget')).toBeVisible()
    await expect(jordanPage.getByText('Plan weekend trip')).toBeVisible()
    await expect(jordanPage.getByText('Review monthly budget together')).toBeVisible()

    // Jordan marks their item as complete
    await jordanPage.getByTestId('action-item-Plan weekend trip').getByRole('checkbox').click()
    await waitForAnimation(jordanPage)

    // Alex should see the update
    await navigateTo(alexPage, '/dashboard')
    await expect(
      alexPage.getByTestId('action-item-Plan weekend trip').getByRole('checkbox')
    ).toBeChecked()
  })

  test('should notify partner of completed check-in', async () => {
    // Enable notifications for Jordan
    await navigateTo(jordanPage, '/settings')
    await jordanPage.getByRole('tab', { name: 'Notifications' }).click()
    await jordanPage.getByLabel('Partner completes check-in').check()
    await jordanPage.getByRole('button', { name: 'Save Changes' }).click()
    await waitForAnimation(jordanPage)

    // Jordan goes to dashboard
    await navigateTo(jordanPage, '/dashboard')

    // Alex completes a check-in
    await navigateTo(alexPage, '/checkin')
    await alexPage.getByRole('button', { name: 'Begin Check-in' }).click()
    await waitForAnimation(alexPage)

    // Quick completion
    await alexPage.getByRole('button', { name: 'Communication' }).click()
    await alexPage.getByRole('button', { name: 'Continue' }).click()
    await waitForAnimation(alexPage)

    await fillNote(alexPage, 'Quick check-in note', false)
    await alexPage.getByRole('button', { name: 'Continue' }).click()
    await waitForAnimation(alexPage)

    await alexPage.getByLabel('Reflection').fill('Done')
    await alexPage.getByRole('button', { name: 'Continue' }).click()
    await waitForAnimation(alexPage)

    await alexPage.getByRole('button', { name: 'Complete Check-in' }).click()
    await waitForAnimation(alexPage, 2000)

    // Jordan should see notification
    await expect(jordanPage.getByTestId('notification-badge')).toBeVisible()
    await jordanPage.getByRole('button', { name: 'Notifications' }).click()
    await expect(
      jordanPage.getByText(/Alex completed a check-in/i)
    ).toBeVisible()
  })

  test('should show partner activity in growth timeline', async () => {
    // Both partners navigate to growth page
    await navigateTo(alexPage, '/growth')
    await navigateTo(jordanPage, '/growth')

    // Alex adds a milestone
    await alexPage.getByRole('button', { name: /Add Milestone/i }).click()
    await alexPage.getByLabel('Title').fill('Had an honest conversation')
    await alexPage.getByLabel('Description').fill('We talked about our future goals openly')
    await alexPage.getByRole('button', { name: 'Save' }).click()
    await waitForAnimation(alexPage)

    // Jordan should see the milestone
    await jordanPage.reload() // Refresh to get updates
    await expect(jordanPage.getByText('Had an honest conversation')).toBeVisible()
    await expect(jordanPage.getByText('We talked about our future goals openly')).toBeVisible()
    await expect(jordanPage.getByText('Added by Alex')).toBeVisible()
  })

  test('should handle partner invitation flow', async () => {
    // Simulate new user without partner
    const newUserPage = await browser.newPage()
    await navigateTo(newUserPage, '/register')

    // Register new user
    await newUserPage.getByLabel('Name').fill('Sam Wilson')
    await newUserPage.getByLabel('Email').fill('sam@example.com')
    await newUserPage.getByLabel('Password').fill('SecurePassword123!')
    await newUserPage.getByLabel('Confirm Password').fill('SecurePassword123!')
    await newUserPage.getByRole('button', { name: /Sign up/i }).click()
    await waitForAnimation(newUserPage)

    // Navigate to settings to invite partner
    await navigateTo(newUserPage, '/settings')
    await newUserPage.getByRole('tab', { name: 'Partner' }).click()

    // Invite partner
    await newUserPage.getByRole('button', { name: /Invite Partner/i }).click()
    await newUserPage.getByLabel("Partner's Email").fill('partner@example.com')
    await newUserPage.getByRole('button', { name: 'Send Invitation' }).click()

    // Should see success message
    await expect(
      newUserPage.getByText(/Invitation sent to partner@example.com/i)
    ).toBeVisible()

    // Should show pending status
    await expect(newUserPage.getByText(/Invitation Pending/i)).toBeVisible()

    await newUserPage.close()
  })
})