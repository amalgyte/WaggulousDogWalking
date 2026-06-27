import { expect, test } from '@playwright/test'

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
  await page.screenshot({ path: 'test-results/mobile-landing.png' })

  await page.getByRole('button', { name: /customer: sam@example.com/i }).click()
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
  await page.getByRole('button', { name: /owner: owner@waggulous.local/i }).click()
  await expect(
    page.getByRole('heading', { name: /approve bookings and assign walkers/i }),
  ).toBeVisible()
  await page.waitForFunction(() => window.scrollY === 0)
  await page.screenshot({ path: 'test-results/mobile-owner.png' })

  await page.getByRole('button', { name: /sign out/i }).click()
  await page.getByRole('button', { name: /walker: walker@waggulous.local/i }).click()
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
