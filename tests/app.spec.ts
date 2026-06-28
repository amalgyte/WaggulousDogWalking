import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

async function loginWithEmail(page: Page, email: string) {
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('demo')
  await page.locator('.auth-panel form').getByRole('button', { name: 'Login' }).click()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
  })
  await page.reload()
})

test('mobile MVP journey covers customer, owner, and walker workspaces', async ({
  page,
}) => {
  test.setTimeout(60_000)
  await page.setViewportSize({ width: 390, height: 844 })

  await expect(page.getByRole('heading', { name: /trusted local care/i })).toBeVisible()
  await expect(page.getByText('Owner console')).toHaveCount(0)
  await expect(page.getByText('Walker workflow')).toHaveCount(0)
  await page.screenshot({ path: 'test-results/mobile-landing.png' })

  await page.getByRole('button', { name: 'sam@example.com' }).click()
  await expect(
    page.getByRole('heading', { name: /your pets, bookings, and balance/i }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Pets' }).click()
  await page.getByLabel('Name').fill('Bertie')
  await page.getByLabel('Breed').fill('Labrador')
  await page.getByLabel('Age').fill('2')
  await page.getByRole('button', { name: /add pet/i }).click()
  await expect(page.getByRole('heading', { name: 'Bertie' })).toBeVisible()

  await page.getByRole('button', { name: 'Request' }).click()
  await page.getByRole('checkbox', { name: 'Bertie' }).check()
  await page.getByLabel('Date').fill('2026-07-02')
  await page.getByLabel('Time').fill('10:00')
  await page.getByRole('button', { name: /request service/i }).click()
  await page.getByRole('button', { name: 'Overview' }).click()
  await expect(page.getByText('requested').first()).toBeVisible()

  await page.getByRole('button', { name: 'Money' }).click()
  await expect(page.getByText(/payments are handled by an outsourced service/i)).toBeVisible()

  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'owner@waggulous.local')
  await expect(
    page.getByRole('heading', { name: /approve bookings and assign walkers/i }),
  ).toBeVisible()
  await page.waitForFunction(() => window.scrollY === 0)
  await page.screenshot({ path: 'test-results/mobile-owner.png' })

  await page.getByRole('button', { name: 'Staff' }).click()
  await page.getByLabel('Name').fill('Jordan Staff')
  await page.getByLabel('Email').fill('jordan@waggulous.local')
  await page.getByLabel('Phone').fill('07700 900333')
  await page.getByLabel('Address').fill('22 Meadow Lane, Bristol')
  await page.getByRole('button', { name: /add staff/i }).click()
  await expect(page.getByRole('heading', { name: 'Jordan Staff' })).toBeVisible()

  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'jordan@waggulous.local')
  await page.getByRole('button', { name: 'Profile' }).click()
  await page.getByLabel('Phone').fill('07700 900444')
  await page.getByRole('button', { name: /save profile/i }).click()
  await expect(page.getByText('Profile saved.')).toBeVisible()

  await page.getByRole('button', { name: 'Holidays' }).click()
  await page.getByLabel('Start date').fill('2026-08-10')
  await page.getByLabel('End date').fill('2026-08-12')
  await page.getByLabel('All day').uncheck()
  await page.getByLabel('Start time').fill('09:30')
  await page.getByLabel('End time').fill('13:15')
  await page.getByLabel('Reason').fill('Summer holiday')
  await page.getByRole('button', { name: /add unavailable dates/i }).click()
  await expect(page.getByText('Summer holiday')).toBeVisible()
  await expect(page.getByText('09:30 to 13:15')).toBeVisible()
  await page.getByRole('button', { name: /cancel entry/i }).first().click()
  await expect(page.getByText('cancelled')).toBeVisible()

  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'walker@waggulous.local')
  await expect(
    page.getByRole('heading', { name: /log pickup and return/i }),
  ).toBeVisible()
  await page
    .locator('article')
    .filter({ hasText: '30 minute walk' })
    .getByRole('button', { name: /picked up/i })
    .click()
  await expect(page.getByText('in progress')).toBeVisible()
})
