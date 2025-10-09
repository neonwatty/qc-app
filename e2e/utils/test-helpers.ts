import { Page, expect } from '@playwright/test'

export const testUsers = {
  alex: {
    email: 'alex@example.com',
    password: 'password123',
    name: 'Alex Chen',
  },
  jordan: {
    email: 'jordan@example.com',
    password: 'password123',
    name: 'Jordan Smith',
  },
} as const

export async function login(page: Page, user: typeof testUsers[keyof typeof testUsers]) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(user.email)
  await page.getByLabel('Password').fill(user.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL('/dashboard')
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: 'User menu' }).click()
  await page.getByRole('menuitem', { name: 'Log out' }).click()
  await expect(page).toHaveURL('/login')
}

export async function waitForAnimation(page: Page, ms = 500) {
  await page.waitForTimeout(ms)
}

export async function navigateTo(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
}

export async function selectCategory(page: Page, category: string) {
  await page.getByRole('button', { name: category }).click()
  await waitForAnimation(page, 300)
}

export async function fillNote(page: Page, text: string, isPrivate = false) {
  const textarea = isPrivate
    ? page.getByLabel('Private note')
    : page.getByLabel('Shared note')
  await textarea.fill(text)
}

export async function completeCheckInStep(page: Page, stepName: string) {
  await expect(page.getByText(stepName)).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()
  await waitForAnimation(page)
}

export async function verifyDashboardStats(page: Page, expectedStats: {
  checkIns?: number
  streak?: number
  actionItems?: number
}) {
  if (expectedStats.checkIns !== undefined) {
    await expect(
      page.getByTestId('checkin-count').getByText(String(expectedStats.checkIns))
    ).toBeVisible()
  }
  if (expectedStats.streak !== undefined) {
    await expect(
      page.getByTestId('streak-count').getByText(String(expectedStats.streak))
    ).toBeVisible()
  }
  if (expectedStats.actionItems !== undefined) {
    await expect(
      page.getByTestId('action-items-count').getByText(String(expectedStats.actionItems))
    ).toBeVisible()
  }
}

/**
 * Check if the current page is showing a 404 error page
 * @param page Playwright Page object
 * @returns true if the page shows 404 error, false otherwise
 */
export async function isNotFoundPage(page: Page): Promise<boolean> {
  const notFoundText = page.getByText(/404|page not found/i)
  return await notFoundText.isVisible({ timeout: 1000 }).catch(() => false)
}