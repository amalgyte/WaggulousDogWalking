import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

async function loginWithEmail(page: Page, email: string) {
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('demo')
  await page.locator('.auth-panel form').getByRole('button', { name: 'Login' }).click()
}

function dateInputFromToday(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dateInputForNextWeekday(targetDay: number) {
  const date = new Date()
  const currentDay = date.getDay()
  const offset = ((targetDay - currentDay + 7) % 7) || 7
  date.setDate(date.getDate() + offset)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
  const todayDate = dateInputFromToday(0)
  const claimableDate = dateInputFromToday(4)

  await expect(page.getByRole('heading', { name: /trusted local care/i })).toBeVisible()
  await expect(page.getByText('Owner console')).toHaveCount(0)
  await expect(page.getByText('Walker workflow')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: /owner@waggulous.local/i }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: /walker@waggulous.local/i }),
  ).toBeVisible()
  await page.screenshot({ path: 'test-results/mobile-landing.png' })

  await page.getByRole('button', { name: /sam@example.com/i }).click()
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
  await page.getByLabel('Service').selectOption('s-pop-in')
  await page.getByRole('checkbox', { name: 'Bertie' }).check()
  await page.getByLabel('Date', { exact: true }).fill(claimableDate)
  await page.getByLabel('Available slot').selectOption('slot-pop-in-daily')
  await page.getByRole('button', { name: /request service/i }).click()
  await expect(page.getByRole('status')).toContainText('request sent')
  await expect(
    page
      .locator('section')
      .filter({ hasText: 'Existing requests awaiting approval.' })
      .locator('article')
      .filter({ hasText: 'Bertie' }),
  ).toContainText('requested')
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

  await page.getByRole('button', { name: 'Services' }).click()
  const walkServiceRow = page.locator('article').filter({ hasText: '30 minute walk' })
  await walkServiceRow
    .getByLabel('Multi-pet pricing')
    .selectOption('additional-pet-price')
  await walkServiceRow.getByLabel('Rule amount').fill('8')
  await walkServiceRow
    .getByLabel('Multi-pet pricing')
    .selectOption('percent-discount')
  await walkServiceRow.getByLabel('Rule amount').fill('25')
  await expect(walkServiceRow.getByLabel('Rule amount')).toHaveValue('25')
  await walkServiceRow
    .getByLabel('Multi-pet pricing')
    .selectOption('additional-pet-price')
  await walkServiceRow.getByLabel('Rule amount').fill('8')

  await page.getByRole('button', { name: 'Clients' }).click()
  await page.getByLabel('Client name').fill('Nina Verbal')
  await page.getByLabel('Client email').fill('nina.verbal@example.com')
  await page.getByLabel('Pet name').fill('Scout')
  await page.getByLabel('Breed').fill('Beagle')
  await page.getByRole('button', { name: /add another pet/i }).click()
  await page.getByLabel('Pet name').fill('Daisy')
  await page.getByRole('button', { name: /save client/i }).click()
  await expect(page.getByRole('status')).toContainText(
    'Nina Verbal saved. Add an appointment next.',
  )
  await expect(page.getByRole('status')).toContainText('2 pet saved.')
  await expect(page.locator('form select').first()).toContainText('Nina Verbal')
  await expect(page.getByLabel('Scout')).toBeChecked()
  await expect(page.getByLabel('Daisy')).toBeChecked()
  await page.getByLabel('Date', { exact: true }).fill(todayDate)
  await page.getByLabel('Time', { exact: true }).fill('14:30')
  await page.getByLabel('Staff assignment').selectOption('u-walker')
  await page.getByRole('button', { name: /add approved booking/i }).click()
  await expect(page.getByRole('status')).toContainText(
    'Approved 30 minute walk booking added for Nina Verbal',
  )
  await page.getByRole('button', { name: 'Bookings' }).click()
  await expect(
    page.locator('article').filter({ hasText: 'Nina Verbal' }),
  ).toContainText('Scout')
  await expect(
    page.locator('article').filter({ hasText: 'Nina Verbal' }),
  ).toContainText('£22.00')

  await page.getByRole('button', { name: 'Staff' }).click()
  await page.getByLabel('Name').fill('Jordan Staff')
  await page.getByLabel('Email').fill('jordan@waggulous.local')
  await page.getByLabel('Phone').fill('07700 900333')
  await page.getByLabel('Address').fill('22 Meadow Lane, Bristol')
  await page
    .locator('form')
    .getByLabel('Can claim unassigned appointments')
    .check()
  await page.getByRole('button', { name: /add staff/i }).click()
  await expect(
    page
      .locator('.staff-list')
      .locator('article')
      .filter({ hasText: 'jordan@waggulous.local' }),
  ).toBeVisible()

  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'jordan@waggulous.local')
  await expect(page.getByText('No appointments assigned.')).toBeVisible()
  await expect(
    page.locator('article').filter({ hasText: 'Bertie' }),
  ).toContainText('Pet sitting pop-in')
  await expect(
    page.locator('article').filter({ hasText: 'Bertie' }),
  ).toContainText('requested')
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('claim and approve')
    await dialog.accept()
  })
  await page
    .locator('article')
    .filter({ hasText: 'Bertie' })
    .getByRole('button', { name: /claim appointment/i })
    .click()
  await expect(
    page
      .locator('article')
      .filter({ hasText: 'Bertie' })
      .getByRole('button', { name: /picked up/i }),
  ).toBeDisabled()
  await expect(
    page.locator('article').filter({ hasText: 'Bertie' }),
  ).toContainText('approved')
  await page
    .locator('article')
    .filter({ hasText: 'Bertie' })
    .getByLabel('Payment received')
    .fill('5')
  await page
    .locator('article')
    .filter({ hasText: 'Bertie' })
    .getByRole('button', { name: /mark received/i })
    .click()
  await expect(
    page.locator('article').filter({ hasText: 'Bertie' }),
  ).toContainText('Pending cash payment')

  await page.getByRole('button', { name: 'Clients' }).click()
  await page.getByLabel('Client name').fill('Casey Phone')
  await page.getByLabel('Client email').fill('casey.phone@example.com')
  await page.getByLabel('Pet name').fill('Rolo')
  await page.getByLabel('Species').fill('Dog')
  await page.getByRole('button', { name: /save client/i }).click()
  await expect(page.getByRole('status')).toContainText(
    'Casey Phone saved. Add an appointment next.',
  )
  await expect(page.getByRole('status')).toContainText('1 pet saved.')
  await expect(page.locator('form select').first()).toContainText('Casey Phone')
  await expect(page.getByLabel('Rolo')).toBeChecked()
  await page.getByLabel('Date', { exact: true }).fill(todayDate)
  await page.getByLabel('Time', { exact: true }).fill('15:45')
  await page.getByRole('button', { name: /add approved booking/i }).click()
  await expect(page.getByRole('status')).toContainText(
    'Approved 30 minute walk booking added for Casey Phone',
  )
  await page.getByRole('button', { name: 'Jobs' }).click()
  await expect(
    page.locator('article').filter({ hasText: 'Rolo' }),
  ).toContainText('approved')

  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'owner@waggulous.local')
  await page
    .locator('article')
    .filter({ hasText: 'Bertie' })
    .getByRole('button', { name: /confirm payment/i })
    .click()
  await page.getByRole('button', { name: /sign out/i }).click()
  await page.getByRole('button', { name: /sam@example.com/i }).click()
  await page.getByRole('button', { name: 'Money' }).click()
  await expect(page.getByText('£21.00')).toBeVisible()
  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'owner@waggulous.local')
  await page.getByRole('button', { name: 'Staff' }).click()
  await page
    .locator('article')
    .filter({ hasText: 'Jordan Staff' })
    .getByRole('button', { name: /view profile and appointments/i })
    .click()
  await expect(
    page.getByRole('heading', {
      name: /Jordan Staff profile and appointments/i,
    }),
  ).toBeVisible()
  await expect(page.getByText('07700 900333', { exact: true })).toBeVisible()
  await page
    .locator('article')
    .filter({ hasText: 'Bertie' })
    .getByLabel('Reassign')
    .selectOption('u-walker')
  await expect(
    page.locator('article').filter({ hasText: 'Bertie' }),
  ).toHaveCount(0)

  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'jordan@waggulous.local')
  await page.getByRole('button', { name: 'Profile' }).click()
  await page.getByLabel('Phone').fill('07700 900444')
  await page.getByRole('button', { name: /save profile/i }).click()
  await expect(page.getByText('Profile saved.')).toBeVisible()

  await page.getByRole('button', { name: 'Holidays' }).click()
  await page.getByLabel('Start date').fill('2026-08-10')
  await expect(page.getByLabel('End date')).toHaveAttribute('min', '2026-08-10')
  await page.getByLabel('End date').fill('2026-08-12')
  await page.getByLabel('All day').uncheck()
  await expect(page.getByLabel('Start time for start date')).toHaveValue('00:00')
  await page.getByLabel('Start time for start date').fill('09:30')
  await page.getByLabel('End time for end date').fill('13:15')
  await page.getByLabel('Reason').fill('Summer holiday')
  await page.getByRole('button', { name: /add unavailable dates/i }).click()
  await expect(page.getByText('Summer holiday')).toBeVisible()
  await expect(
    page.getByText(/Start: .*09:30 .* End: .*13:15/),
  ).toBeVisible()
  await page.getByRole('button', { name: /cancel entry/i }).first().click()
  await expect(page.getByText('cancelled')).toBeVisible()

  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'walker@waggulous.local')
  await expect(
    page.getByRole('heading', { name: /log pickup and return/i }),
  ).toBeVisible()
  await page
    .locator('article')
    .filter({ hasText: 'Mabel' })
    .getByRole('button', { name: /picked up/i })
    .click()
  await expect(page.getByText('in progress')).toBeVisible()
})

test('recurring slot bookings can be halted and individual slots cancelled', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const nextMonday = dateInputForNextWeekday(1)

  await page.getByRole('button', { name: /sam@example.com/i }).click()
  await page.getByRole('button', { name: 'Request' }).click()
  await page.getByLabel('Service').selectOption('s-walk-30')
  await page.getByRole('checkbox', { name: 'Mabel' }).check()
  await page.getByLabel('Date', { exact: true }).fill(nextMonday)
  await page.getByLabel('Available slot').selectOption('slot-walk-early')
  await page.getByLabel(/repeat weekly/i).check()
  await page.getByLabel('Thu').uncheck()
  await page.getByRole('button', { name: /request service/i }).click()
  await expect(page.getByRole('status')).toContainText(
    'recurring request sent',
  )

  const created = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    const series = data.recurringBookings[0]
    const bookings = data.bookings.filter(
      (booking: { recurringBookingId?: string }) =>
        booking.recurringBookingId === series.id,
    )

    return {
      seriesStatus: series.status,
      days: series.days,
      count: bookings.length,
      hasThursday: bookings.some(
        (booking: { date: string }) =>
          new Date(`${booking.date}T12:00:00`).getDay() === 4,
      ),
    }
  })

  expect(created.seriesStatus).toBe('active')
  expect(created.days).toEqual([1, 2, 3, 5])
  expect(created.count).toBe(32)
  expect(created.hasThursday).toBe(false)

  await page.getByRole('button', { name: /cancel this slot/i }).first().click()
  const afterCancel = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    return data.bookings.filter(
      (booking: { status: string; cancellationCharge?: string }) =>
        booking.status === 'cancelled' &&
        booking.cancellationCharge === 'pending',
    ).length
  })
  expect(afterCancel).toBe(1)

  await page
    .getByRole('button', { name: /halt recurring booking/i })
    .first()
    .click()
  const halted = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    return {
      seriesStatus: data.recurringBookings[0].status,
      cancelledCount: data.bookings.filter(
        (booking: { status: string }) => booking.status === 'cancelled',
      ).length,
    }
  })
  expect(halted.seriesStatus).toBe('halted')
  expect(halted.cancelledCount).toBeGreaterThan(1)

  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'owner@waggulous.local')
  await page.getByRole('button', { name: /not chargeable/i }).first().click()
  const chargeDecision = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    return data.bookings.some(
      (booking: { status: string; cancellationCharge?: string }) =>
        booking.status === 'cancelled' &&
        booking.cancellationCharge === 'waived',
    )
  })
  expect(chargeDecision).toBe(true)
})
