import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

async function loginWithEmail(
  page: Page,
  email: string,
  password = email === 'admin@waggulous.com' ? 'Admin123!' : 'Test123!',
) {
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
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

async function seedWorkflowData(page: Page) {
  const todayDate = dateInputFromToday(0)
  await page.waitForFunction(() =>
    Boolean(localStorage.getItem('waggulous-mvp-data')),
  )
  await page.evaluate((today) => {
    function addDaysInputValue(startDate: string, days: number) {
      const date = new Date(`${startDate}T00:00:00`)
      date.setDate(date.getDate() + days)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    localStorage.setItem(
      'waggulous-mvp-data',
      JSON.stringify({
        ...data,
        petSpeciesBreedCatalogue: {
          Bird: ['Cockatiel'],
          Cat: ['Domestic shorthair', 'Maine Coon'],
          Dog: [
            'Beagle',
            'Border Terrier',
            'Cocker Spaniel',
            'Labrador',
            'Shih Tzu',
            'Whippet',
          ],
          Fish: ['Goldfish'],
          Hamster: ['Syrian hamster'],
          Rabbit: ['Mini Lop'],
          Turtle: ['Musk turtle'],
        },
        users: [
          {
            id: 'u-admin',
            name: 'Waggulous Admin',
            email: 'admin@waggulous.com',
            password: 'Admin123!',
            role: 'admin',
            phone: '',
            address: '',
          },
          {
            id: 'u-walker',
            name: 'Alex Walker',
            email: 'walker@waggulous.local',
            password: 'Test123!',
            role: 'walker',
            phone: '07700 900222',
            address: '14 Park View, Bristol',
            canSelfAssign: true,
            holidays: [
              {
                id: 'h-alex-1',
                startDate: '2026-07-15',
                endDate: '2026-07-18',
                allDay: true,
                reason: 'Family break',
                status: 'active',
              },
            ],
          },
          {
            id: 'u-customer',
            name: 'Sam Taylor',
            email: 'sam@example.com',
            password: 'Test123!',
            role: 'customer',
            phone: '07700 900101',
            address: '12 River Walk, Bristol',
            what3words: 'filled.count.soap',
          },
          {
            id: 'u-maya',
            name: 'Maya Chen',
            email: 'maya@waggulous.local',
            password: 'Test123!',
            role: 'walker',
            phone: '07700 900333',
            address: '8 Orchard Terrace, Bristol',
            canSelfAssign: true,
          },
          {
            id: 'u-priya',
            name: 'Priya Shah',
            email: 'priya@waggulous.local',
            password: 'Test123!',
            role: 'walker',
            phone: '07700 900444',
            address: '19 Willow Road, Bristol',
            canSelfAssign: true,
          },
          {
            id: 'u-tom',
            name: 'Tom Evans',
            email: 'tom@waggulous.local',
            password: 'Test123!',
            role: 'walker',
            phone: '07700 900555',
            address: '3 Clifton Mews, Bristol',
            canSelfAssign: false,
          },
          {
            id: 'u-eliza',
            name: 'Eliza Moore',
            email: 'eliza.moore@example.com',
            password: 'Test123!',
            role: 'customer',
            phone: '07700 910101',
            address: '24 Sycamore Avenue, Bristol',
          },
          {
            id: 'u-omar',
            name: 'Omar Khan',
            email: 'omar.khan@example.com',
            password: 'Test123!',
            role: 'customer',
            phone: '07700 910202',
            address: '7 Harbour View, Bristol',
          },
          {
            id: 'u-grace',
            name: 'Grace Bell',
            email: 'grace.bell@example.com',
            password: 'Test123!',
            role: 'customer',
            phone: '07700 910303',
            address: '41 Meadowbank Road, Bristol',
          },
          {
            id: 'u-theo',
            name: 'Theo Harris',
            email: 'theo.harris@example.com',
            password: 'Test123!',
            role: 'customer',
            phone: '07700 910404',
            address: '16 Kingsdown Parade, Bristol',
          },
        ],
        services: [
          {
            id: 's-walk-30',
            name: '30 minute walk',
            type: 'walking',
            description: 'Local solo or small-group walk with clear care updates.',
            duration: '30 min',
            price: 14,
            active: true,
          },
          {
            id: 's-walk-60',
            name: '60 minute adventure walk',
            type: 'walking',
            description: 'Longer route for energetic dogs with photo updates.',
            duration: '60 min',
            price: 22,
            active: true,
          },
          {
            id: 's-pop-in',
            name: 'Pet sitting pop-in',
            type: 'sitting',
            description: 'Feeding, water, comfort checks, litter or garden break.',
            duration: '25 min',
            price: 12,
            active: true,
          },
          {
            id: 's-evening',
            name: 'Evening sit',
            type: 'sitting',
            description: 'Calm in-home companionship for dinner and bedtime routines.',
            duration: '2 hours',
            price: 38,
            active: true,
          },
        ],
        serviceSlots: [
          {
            id: 'slot-walk-early',
            serviceId: 's-walk-30',
            label: 'Early morning walk',
            days: [1, 2, 3, 4, 5],
            startTime: '07:00',
            endTime: '08:00',
            capacity: 4,
            active: true,
          },
          {
            id: 'slot-walk-lunch',
            serviceId: 's-walk-30',
            label: 'Lunchtime walk',
            days: [2, 4],
            startTime: '12:00',
            endTime: '13:00',
            capacity: 4,
            active: true,
          },
          {
            id: 'slot-walk-evening',
            serviceId: 's-walk-30',
            label: 'Evening walk',
            days: [1, 2, 3, 4, 5],
            startTime: '18:00',
            endTime: '19:00',
            capacity: 4,
            active: true,
          },
          {
            id: 'slot-pop-in-daily',
            serviceId: 's-pop-in',
            label: 'Pet sitting pop-in window',
            days: [0, 1, 2, 3, 4, 5, 6],
            startTime: '10:00',
            endTime: '12:00',
            capacity: 3,
            active: true,
          },
        ],
        pets: [
          {
            id: 'p-mabel',
            ownerId: 'u-customer',
            name: 'Mabel',
            species: 'Dog',
            breed: 'Cocker Spaniel',
            age: '4',
            notes: 'Loves woodland routes, nervous around scooters.',
          },
          {
            id: 'p-pip',
            ownerId: 'u-customer',
            name: 'Pip',
            species: 'Cat',
            breed: 'Domestic shorthair',
            age: '8',
            notes: 'Needs evening feeding and a litter tray check.',
          },
          {
            id: 'p-rufus',
            ownerId: 'u-eliza',
            name: 'Rufus',
            species: 'Dog',
            breed: 'Border Terrier',
            age: '6',
            notes: 'Can be stubborn near the bakery. Treats in the porch cupboard.',
          },
          {
            id: 'p-tilly',
            ownerId: 'u-eliza',
            name: 'Tilly',
            species: 'Cat',
            breed: 'Maine Coon',
            age: '5',
            notes: 'Brush briefly after feeding and keep the kitchen window closed.',
          },
          {
            id: 'p-nori',
            ownerId: 'u-omar',
            name: 'Nori',
            species: 'Bird',
            breed: 'Cockatiel',
            age: '3',
            notes: 'Fresh water, seed top-up, and ten minutes of quiet company.',
          },
          {
            id: 'p-biscuit',
            ownerId: 'u-omar',
            name: 'Biscuit',
            species: 'Rabbit',
            breed: 'Mini Lop',
            age: '2',
            notes: 'Check hay rack and make sure the garden run latch is clipped.',
          },
          {
            id: 'p-luna',
            ownerId: 'u-grace',
            name: 'Luna',
            species: 'Dog',
            breed: 'Whippet',
            age: '4',
            notes: 'Nervous around skateboards. Use the yellow lead for walks.',
          },
          {
            id: 'p-miso',
            ownerId: 'u-grace',
            name: 'Miso',
            species: 'Dog',
            breed: 'Shih Tzu',
            age: '9',
            notes: 'Shorter route only and wipe paws before coming inside.',
          },
          {
            id: 'p-goldie',
            ownerId: 'u-theo',
            name: 'Goldie',
            species: 'Fish',
            breed: 'Goldfish',
            age: '1',
            notes: 'One small pinch of food. Do not top up the tank.',
          },
          {
            id: 'p-shelly',
            ownerId: 'u-theo',
            name: 'Shelly',
            species: 'Turtle',
            breed: 'Musk turtle',
            age: '7',
            notes: 'Check basking lamp and remove any leftover greens.',
          },
          {
            id: 'p-peanut',
            ownerId: 'u-theo',
            name: 'Peanut',
            species: 'Hamster',
            breed: 'Syrian hamster',
            age: '1',
            notes: 'Evening check only. Food scoop is beside the enclosure.',
          },
        ],
        recurringBookings: [],
        bookings: [
          {
            id: 'b-1',
            customerId: 'u-customer',
            petIds: ['p-mabel'],
            serviceId: 's-walk-30',
            date: today,
            time: '09:30',
            notes: 'Please use the blue harness.',
            status: 'approved',
            price: 14,
            walkerId: 'u-walker',
          },
          {
            id: 'b-demo-1',
            customerId: 'u-customer',
            petIds: ['p-pip'],
            serviceId: 's-pop-in',
            slotId: 'slot-pop-in-daily',
            date: today,
            time: '10:30',
            endTime: '10:55',
            notes: 'Pip needs food, water, and litter checked before lunch.',
            status: 'approved',
            price: 12,
            walkerId: 'u-maya',
          },
          {
            id: 'b-demo-2',
            customerId: 'u-eliza',
            petIds: ['p-rufus'],
            serviceId: 's-walk-30',
            slotId: 'slot-walk-early',
            date: addDaysInputValue(today, 1),
            time: '07:30',
            endTime: '08:00',
            notes: 'Rufus is best walked before the school run gets busy.',
            status: 'approved',
            price: 14,
            walkerId: 'u-walker',
          },
          {
            id: 'b-demo-3',
            customerId: 'u-omar',
            petIds: ['p-nori', 'p-biscuit'],
            serviceId: 's-pop-in',
            slotId: 'slot-pop-in-daily',
            date: addDaysInputValue(today, 1),
            time: '10:00',
            endTime: '10:35',
            notes: 'Quiet visit for Nori, then check Biscuit has hay and water.',
            status: 'approved',
            price: 12,
            walkerId: 'u-priya',
          },
          {
            id: 'b-demo-4',
            customerId: 'u-grace',
            petIds: ['p-luna', 'p-miso'],
            serviceId: 's-walk-60',
            slotId: 'slot-walk-lunch',
            date: addDaysInputValue(today, 1),
            time: '12:30',
            endTime: '13:30',
            notes: 'Keep Miso to the flatter route and give Luna space near roads.',
            status: 'approved',
            price: 22,
            walkerId: 'u-maya',
          },
          {
            id: 'b-demo-5',
            customerId: 'u-theo',
            petIds: ['p-goldie', 'p-shelly', 'p-peanut'],
            serviceId: 's-pop-in',
            slotId: 'slot-pop-in-daily',
            date: addDaysInputValue(today, 2),
            time: '09:15',
            endTime: '09:45',
            notes: 'Small pet care round: fish feed, turtle lamp, hamster food.',
            status: 'approved',
            price: 12,
            walkerId: 'u-tom',
          },
          {
            id: 'b-demo-6',
            customerId: 'u-eliza',
            petIds: ['p-rufus', 'p-tilly'],
            serviceId: 's-pop-in',
            date: addDaysInputValue(today, 2),
            time: '14:00',
            endTime: '14:30',
            notes: 'Requested afternoon check while Eliza is at a work event.',
            status: 'requested',
            price: 12,
          },
          {
            id: 'b-demo-7',
            customerId: 'u-eliza',
            petIds: ['p-rufus'],
            serviceId: 's-walk-30',
            slotId: 'slot-walk-early',
            date: addDaysInputValue(today, 3),
            time: '08:00',
            endTime: '08:30',
            notes: 'Rufus can join the early neighbourhood loop.',
            status: 'approved',
            price: 14,
            walkerId: 'u-priya',
          },
          {
            id: 'b-demo-8',
            customerId: 'u-grace',
            petIds: ['p-luna'],
            serviceId: 's-walk-30',
            date: addDaysInputValue(today, 3),
            time: '11:30',
            endTime: '12:00',
            notes: 'Grace asked whether Luna can have a quieter mid-morning walk.',
            status: 'requested',
            price: 14,
          },
          {
            id: 'b-demo-9',
            customerId: 'u-customer',
            petIds: ['p-pip'],
            serviceId: 's-evening',
            date: addDaysInputValue(today, 3),
            time: '18:30',
            endTime: '20:30',
            notes: 'Evening companionship and feeding while Sam is away.',
            status: 'approved',
            price: 38,
            walkerId: 'u-priya',
          },
          {
            id: 'b-demo-10',
            customerId: 'u-grace',
            petIds: ['p-luna', 'p-miso'],
            serviceId: 's-walk-30',
            slotId: 'slot-walk-evening',
            date: addDaysInputValue(today, 4),
            time: '18:00',
            endTime: '18:45',
            notes: 'Evening loop after the pavement cools down.',
            status: 'approved',
            price: 14,
            walkerId: 'u-walker',
          },
          {
            id: 'b-2',
            customerId: 'u-customer',
            petIds: ['p-pip'],
            serviceId: 's-pop-in',
            date: '2026-06-18',
            time: '18:00',
            notes: 'Food is in the utility room.',
            status: 'completed',
            price: 12,
            walkerId: 'u-walker',
            pickedUpAt: '2026-06-18T18:02:00.000Z',
            returnedAt: '2026-06-18T18:26:00.000Z',
          },
        ],
        transactions: [
          {
            id: 't-1',
            customerId: 'u-customer',
            bookingId: 'b-1',
            date: today,
            description: 'Approved 30 minute walk for Mabel',
            amount: 14,
            status: 'owed',
          },
          {
            id: 't-2',
            customerId: 'u-customer',
            bookingId: 'b-2',
            date: '2026-06-18',
            description: 'Paid pet sitting pop-in for Pip',
            amount: 12,
            status: 'paid',
          },
        ],
        messages: [
          {
            id: 'm-1',
            bookingId: 'b-1',
            senderId: 'u-admin',
            recipientId: 'u-customer',
            body: 'Alex is confirmed for Monday morning. We will log pickup and return in the app.',
            createdAt: '2026-06-26T14:30:00.000Z',
          },
        ],
      }),
    )
  }, todayDate)
  await page.reload()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
  })
  await page.reload()
  await seedWorkflowData(page)
})

test('fresh store starts with admin only and allows password changes', async ({
  page,
}) => {
  await page.evaluate(() => {
    localStorage.clear()
  })
  await page.reload()
  await page.waitForFunction(() =>
    Boolean(localStorage.getItem('waggulous-mvp-data')),
  )

  const cleanData = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    return {
      bookings: data.bookings?.length,
      messages: data.messages?.length,
      pets: data.pets?.length,
      petSpeciesBreedCatalogue: data.petSpeciesBreedCatalogue ?? {},
      services: data.services?.length,
      serviceSlots: data.serviceSlots?.length,
      transactions: data.transactions?.length,
      users: data.users?.map(
        (user: { email: string; password: string; role: string }) => ({
          email: user.email,
          password: user.password,
          role: user.role,
        }),
      ),
    }
  })
  expect(cleanData).toEqual({
    bookings: 0,
    messages: 0,
    pets: 0,
    petSpeciesBreedCatalogue: {},
    services: 0,
    serviceSlots: 0,
    transactions: 0,
    users: [
      {
        email: 'admin@waggulous.com',
        password: 'Admin123!',
        role: 'admin',
      },
    ],
  })
  await expect(
    page.getByRole('button', { name: /admin@waggulous.com/i }),
  ).toHaveCount(0)

  await loginWithEmail(page, 'admin@waggulous.com')
  await expect(page.getByText(/Waggulous Admin · admin/i)).toBeVisible()
  await page.getByRole('button', { name: 'Account' }).click()
  await page.getByLabel('Current password').fill('Wrong123!')
  await page.getByLabel('New password', { exact: true }).fill('Admin456!')
  await page.getByLabel('Confirm new password').fill('Admin456!')
  await page.getByRole('button', { name: /save password/i }).click()
  await expect(page.getByText(/Current password does not match/i)).toBeVisible()

  await page.getByLabel('Current password').fill('Admin123!')
  await page.getByRole('button', { name: /save password/i }).click()
  await expect(page.getByText('Password changed.')).toBeVisible()

  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'admin@waggulous.com', 'Admin123!')
  await expect(
    page.getByText('Those details do not match a Waggulous account.'),
  ).toBeVisible()
  await loginWithEmail(page, 'admin@waggulous.com', 'Admin456!')
  await expect(
    page.getByRole('heading', { name: /approve bookings and assign walkers/i }),
  ).toBeVisible()
})

test('owner can reset a staff password with a generated handover code', async ({
  page,
}) => {
  await loginWithEmail(page, 'admin@waggulous.com')
  await page.getByRole('button', { name: 'Staff' }).click()

  const staffRow = page
    .locator('.staff-list')
    .locator('article')
    .filter({ hasText: 'walker@waggulous.local' })
  await staffRow.getByRole('button', { name: 'Reset password' }).click()

  const status = page.getByRole('status')
  await expect(status).toContainText(
    "Alex Walker's password has been reset to",
  )
  const statusText = (await status.textContent()) ?? ''
  const generatedPassword = statusText.match(/reset to ([A-Z]{2}\d{4})\./)?.[1]
  expect(generatedPassword).toBeTruthy()

  const storedPassword = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    return data.users.find(
      (user: { email: string }) => user.email === 'walker@waggulous.local',
    )?.password
  })
  expect(storedPassword).toBe(generatedPassword)

  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'walker@waggulous.local', 'Test123!')
  await expect(
    page.getByText('Those details do not match a Waggulous account.'),
  ).toBeVisible()

  await loginWithEmail(page, 'walker@waggulous.local', generatedPassword)
  await expect(
    page.getByRole('heading', {
      name: /log service start and completion/i,
    }),
  ).toBeVisible()
})

test('walker jobs are filtered by date with completed jobs separated', async ({
  page,
}) => {
  const tomorrowDate = dateInputFromToday(1)
  await loginWithEmail(page, 'walker@waggulous.local')

  const activeJobs = page.locator('.booking-stack').first()
  await expect(
    activeJobs.locator('article').filter({ hasText: 'Mabel' }),
  ).toBeVisible()
  await expect(
    activeJobs.locator('article').filter({ hasText: 'Rufus' }),
  ).toHaveCount(0)

  await page.getByLabel('Job date').fill(tomorrowDate)
  await expect(
    activeJobs.locator('article').filter({ hasText: 'Rufus' }),
  ).toBeVisible()
  await expect(
    activeJobs.locator('article').filter({ hasText: 'Mabel' }),
  ).toHaveCount(0)

  await page.getByLabel('Job date').fill('2026-06-18')
  await expect(
    activeJobs.locator('article').filter({ hasText: 'Pip' }),
  ).toHaveCount(0)
  const completedJobs = page.locator('section.nested-workspace').filter({
    hasText: 'Services completed on 18 Jun 2026.',
  })
  await expect(completedJobs.locator('article').filter({ hasText: 'Pip' })).toBeVisible()
  await expect(completedJobs).toContainText('completed')

  await page.getByLabel('Job date').fill(dateInputFromToday(0))
  await page.getByRole('button', { name: 'Timeline' }).click()
  const staffTimeline = page.locator('.staff-jobs-timeline')
  await expect(staffTimeline).toBeVisible()
  await expect(
    staffTimeline.locator('.staff-jobs-timeline-card').filter({ hasText: 'Mabel' }),
  ).toBeVisible()
  await expect(staffTimeline.locator('article').filter({ hasText: 'Mabel' })).toBeVisible()

  const savedView = await page.evaluate(() =>
    localStorage.getItem('waggulous-staff-bookings-view-u-walker'),
  )
  expect(savedView).toBe('timeline')

  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'walker@waggulous.local')
  await expect(page.getByRole('button', { name: 'Timeline' })).toHaveClass(
    /is-active/,
  )
  await expect(page.locator('.staff-jobs-timeline')).toBeVisible()
})

test('staff can manually book services and manage active client pets', async ({
  page,
}) => {
  const todayDate = dateInputFromToday(0)

  await loginWithEmail(page, 'walker@waggulous.local')
  await page.getByRole('button', { name: 'Clients' }).click()
  await page.getByRole('button', { name: 'Appointment' }).click()
  await page.getByRole('combobox', { name: 'Client' }).selectOption('u-eliza')
  await page.getByRole('checkbox', { name: 'Tilly' }).check()
  await page.getByLabel('Service').selectOption('s-pop-in')
  await page.getByLabel('Date', { exact: true }).fill(todayDate)
  await page.getByLabel('Time', { exact: true }).fill('16:20')
  await page
    .getByRole('textbox', { name: 'Booking notes' })
    .fill('Manual request: feed cats and check litter tray.')
  await page.getByRole('button', { name: /add approved booking/i }).click()
  await expect(page.getByRole('status')).toContainText(
    'Approved Pet sitting pop-in booking added for Eliza Moore',
  )

  await page.getByRole('button', { name: 'Jobs' }).click()
  await page.getByLabel('Job date').fill(todayDate)
  await expect(
    page
      .locator('article')
      .filter({ hasText: 'Tilly' })
      .filter({ hasText: '16:20' }),
  ).toContainText('Pet sitting pop-in')

  await page.getByRole('button', { name: 'Clients' }).click()
  await page.getByRole('button', { name: 'Client pets' }).click()
  await page.getByRole('combobox', { name: 'Client' }).selectOption('u-eliza')
  await page.getByLabel('Pet name').fill('Misty')
  await page.getByLabel('Species').fill('Cat')
  await page
    .getByLabel('Pet notes')
    .fill('Indoor cat. Feed twice daily and keep kitchen window shut.')
  await page.getByRole('button', { name: /add pet to client/i }).click()
  await expect(page.getByRole('status')).toContainText(
    'Misty added to Eliza Moore.',
  )

  const mistyPet = page.locator('article').filter({ hasText: 'Misty' })
  await expect(mistyPet).toContainText('Indoor cat')
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Remove Misty from active pets')
    await dialog.accept()
  })
  await mistyPet
    .getByRole('button', { name: /remove from active pets/i })
    .click()
  await expect(page.getByRole('status')).toContainText(
    'Misty removed from active pets.',
  )
  await expect(mistyPet).toHaveCount(0)

  await page.getByRole('button', { name: 'Appointment' }).click()
  await expect(page.getByRole('checkbox', { name: 'Misty' })).toHaveCount(0)

  const staffClientState = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    const manualBooking = data.bookings.find(
      (booking: {
        customerId: string
        serviceId: string
        time: string
        walkerId?: string
      }) =>
        booking.customerId === 'u-eliza' &&
        booking.serviceId === 's-pop-in' &&
        booking.time === '16:20',
    )
    const removedPet = data.pets.find(
      (pet: { ownerId: string; name: string }) =>
        pet.ownerId === 'u-eliza' && pet.name === 'Misty',
    )
    return { manualBooking, removedPet }
  })
  expect(staffClientState.manualBooking).toMatchObject({
    customerId: 'u-eliza',
    petIds: ['p-tilly'],
    serviceId: 's-pop-in',
    status: 'approved',
    walkerId: 'u-walker',
  })
  expect(staffClientState.removedPet).toMatchObject({
    name: 'Misty',
    ownerId: 'u-eliza',
    status: 'removed',
  })
  expect(staffClientState.removedPet.removedAt).toEqual(expect.any(String))
})

test('admin can delegate service and payment admin functions to staff', async ({
  page,
}) => {
  await loginWithEmail(page, 'admin@waggulous.com')
  await page.getByRole('button', { name: 'Staff' }).click()

  const alexStaff = page
    .locator('.staff-list article')
    .filter({ hasText: 'walker@waggulous.local' })
  await alexStaff.getByLabel('Can manage services and prices').check()
  await alexStaff
    .getByLabel('Can approve staff payments into the business')
    .check()

  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'walker@waggulous.local')
  await expect(page.getByRole('button', { name: 'Services' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Payments' })).toBeVisible()

  await page.getByRole('button', { name: 'Services' }).click()
  const addServiceForm = page.locator('form').filter({ hasText: 'Add service' })
  await addServiceForm.getByLabel('Name').fill('Overnight cat sitting')
  await addServiceForm.getByLabel('Type').selectOption('sitting')
  await addServiceForm.getByLabel('Duration').fill('Overnight')
  await addServiceForm.getByLabel('Price').fill('48')
  await addServiceForm
    .getByLabel('Description')
    .fill('Evening, overnight, and breakfast cat sitting.')
  await addServiceForm.getByRole('button', { name: /add service/i }).click()
  await expect(
    page.locator('.service-admin-row').filter({
      hasText: 'Overnight cat sitting',
    }),
  ).toContainText('sitting')

  await page.getByRole('button', { name: 'Jobs' }).click()
  const mabelJob = page.locator('article').filter({ hasText: 'Mabel' })
  await mabelJob.getByRole('button', { name: /^service started$/i }).click()
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('completion note')
    await dialog.accept('Delegated admin completion note.')
  })
  await mabelJob.getByRole('button', { name: /service completed/i }).click()
  await mabelJob.getByLabel('Payment received').fill('14')
  await mabelJob.getByLabel('Method').selectOption('cash')
  await mabelJob.getByRole('button', { name: /mark received/i }).click()
  await expect(mabelJob).toContainText('Pending cash payment')

  await page.getByRole('button', { name: 'Payments' }).click()
  const pendingPayment = page
    .locator('.pending-payment-row')
    .filter({ hasText: 'Sam Taylor' })
  await expect(pendingPayment).toContainText('recorded by Alex Walker')
  await expect(
    pendingPayment.getByRole('button', { name: /remove payment/i }),
  ).toHaveCount(0)
  await pendingPayment
    .getByRole('button', { name: /confirm into company account/i })
    .click()
  await expect(page.getByRole('status')).toContainText(
    'Staff payment confirmed into the company account.',
  )

  const delegatedAdminState = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    return {
      service: data.services.find(
        (service: { name: string }) =>
          service.name === 'Overnight cat sitting',
      ),
      payment: data.transactions.find(
        (transaction: {
          bookingId?: string
          status?: string
          confirmedById?: string
        }) =>
          transaction.bookingId === 'b-1' &&
          transaction.status === 'paid' &&
          transaction.confirmedById === 'u-walker',
      ),
      staff: data.users.find(
        (user: { id: string }) => user.id === 'u-walker',
      ),
    }
  })
  expect(delegatedAdminState.staff).toMatchObject({
    canManageServices: true,
    canConfirmPayments: true,
  })
  expect(delegatedAdminState.service).toMatchObject({
    name: 'Overnight cat sitting',
    type: 'sitting',
    price: 48,
  })
  expect(delegatedAdminState.payment).toMatchObject({
    status: 'paid',
    confirmedById: 'u-walker',
  })
})

test('admin confirms cash received by staff into the company account', async ({
  page,
}) => {
  const todayLabel = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dateInputFromToday(0)}T12:00:00`))
  const acknowledgementMessage = `We have received your cash payment of £14.00 for 30 minute walk on ${todayLabel}. Thank you.`
  const fulfillmentMessage = `Your 30 minute walk appointment on ${todayLabel} was fulfilled. Staff note: Mabel was calm and enjoyed the woodland route.`

  await loginWithEmail(page, 'walker@waggulous.local')

  const mabelJob = page.locator('article').filter({ hasText: 'Mabel' })
  await mabelJob.getByRole('button', { name: /^service started$/i }).click()
  await expect(mabelJob).toContainText('in progress')
  await expect(
    mabelJob.getByRole('button', { name: /reset service/i }),
  ).toBeEnabled()
  await mabelJob.getByRole('button', { name: /reset service/i }).click()
  await expect(mabelJob).toContainText('approved')
  await expect(
    mabelJob.getByRole('button', { name: /^service started$/i }),
  ).toBeEnabled()
  await expect(
    mabelJob.getByRole('button', { name: /service completed/i }),
  ).toBeDisabled()
  await mabelJob.getByRole('button', { name: /^service started$/i }).click()
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('completion note')
    await dialog.accept('Mabel was calm and enjoyed the woodland route.')
  })
  await mabelJob.getByRole('button', { name: /service completed/i }).click()
  await expect(mabelJob).toContainText(
    'Completion note: Mabel was calm and enjoyed the woodland route.',
  )
  await mabelJob.getByLabel('Payment received').fill('14')
  await mabelJob.getByLabel('Method').selectOption('cash')
  await mabelJob.getByRole('button', { name: /mark received/i }).click()
  await expect(mabelJob).toContainText('Pending cash payment')

  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'admin@waggulous.com')
  await page.getByRole('button', { name: 'Clients' }).click()
  await page.getByRole('button', { name: 'Payments' }).click()

  const pendingPayment = page
    .locator('.pending-payment-row')
    .filter({ hasText: 'Pending cash payment' })
    .filter({ hasText: 'Sam Taylor' })
  await expect(pendingPayment).toContainText('recorded by Alex Walker')
  await pendingPayment
    .getByRole('button', { name: /confirm into company account/i })
    .click()
  await expect(page.getByRole('status')).toContainText(
    'Staff payment confirmed into the company account.',
  )
  await expect(pendingPayment).toHaveCount(0)

  const paymentState = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    return {
      messages: data.messages
        .filter(
          (message: { bookingId?: string; recipientId: string }) =>
            message.bookingId === 'b-1' && message.recipientId === 'u-customer',
        )
        .map((message: { body: string; senderId: string }) => ({
          body: message.body,
          senderId: message.senderId,
        })),
      payments: data.transactions
        .filter(
          (transaction: { bookingId?: string; type?: string }) =>
            transaction.bookingId === 'b-1' && transaction.type === 'payment',
        )
        .map(
          (transaction: {
            status: string
            method?: string
            recordedById?: string
            confirmedById?: string
          }) => ({
            status: transaction.status,
            method: transaction.method,
            recordedById: transaction.recordedById,
            confirmedById: transaction.confirmedById,
          }),
        ),
    }
  })
  expect(paymentState.payments).toEqual([
    {
      status: 'paid',
      method: 'cash',
      recordedById: 'u-walker',
      confirmedById: 'u-admin',
    },
  ])
  expect(paymentState.messages).toContainEqual({
    body: acknowledgementMessage,
    senderId: 'u-admin',
  })
  expect(paymentState.messages).toContainEqual({
    body: fulfillmentMessage,
    senderId: 'u-walker',
  })

  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'sam@example.com')
  await page.getByRole('button', { name: 'Messages' }).click()
  await expect(page.getByText(fulfillmentMessage)).toBeVisible()
  await expect(page.getByText(acknowledgementMessage)).toBeVisible()
})

test('admin can remove a staff-entered payment added in error', async ({
  page,
}) => {
  await loginWithEmail(page, 'walker@waggulous.local')

  const mabelJob = page.locator('article').filter({ hasText: 'Mabel' })
  await mabelJob.getByRole('button', { name: /^service started$/i }).click()
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('completion note')
    await dialog.accept('Payment removal test completion note.')
  })
  await mabelJob.getByRole('button', { name: /service completed/i }).click()
  await mabelJob.getByLabel('Payment received').fill('14')
  await mabelJob.getByLabel('Method').selectOption('cash')
  await mabelJob.getByRole('button', { name: /mark received/i }).click()

  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'admin@waggulous.com')
  await page.getByRole('button', { name: 'Clients' }).click()
  await page.getByRole('button', { name: 'Payments' }).click()

  const pendingPayment = page
    .locator('.pending-payment-row')
    .filter({ hasText: 'Pending cash payment' })
    .filter({ hasText: 'Sam Taylor' })
  await expect(pendingPayment).toBeVisible()

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Remove pending cash payment of £14.00')
    await dialog.dismiss()
  })
  await pendingPayment.getByRole('button', { name: /remove payment/i }).click()
  await expect(pendingPayment).toBeVisible()

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('added it in error')
    await dialog.accept()
  })
  await pendingPayment.getByRole('button', { name: /remove payment/i }).click()
  await expect(page.getByRole('status')).toContainText('Staff payment removed.')
  await expect(pendingPayment).toHaveCount(0)

  const remainingPayments = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    return data.transactions.filter(
      (transaction: { bookingId?: string; type?: string }) =>
        transaction.bookingId === 'b-1' && transaction.type === 'payment',
    ).length
  })
  expect(remainingPayments).toBe(0)
})

test('mobile MVP journey covers customer, admin, and walker workspaces', async ({
  page,
}) => {
  test.setTimeout(60_000)
  await page.setViewportSize({ width: 390, height: 844 })
  const todayDate = dateInputFromToday(0)
  const claimableDate = dateInputFromToday(4)

  await expect(page.getByRole('heading', { name: /trusted local care/i })).toBeVisible()
  await expect(page.getByText('Admin console')).toHaveCount(0)
  await expect(page.getByText('Walker workflow')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: /admin@waggulous.com/i }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: /walker@waggulous.local/i }),
  ).toHaveCount(0)
  await page.screenshot({ path: 'test-results/mobile-landing.png' })

  await loginWithEmail(page, 'sam@example.com')
  await expect(
    page.getByRole('heading', { name: /your pets, bookings, and balance/i }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Pets' }).click()
  await page.getByLabel('Name').fill('Bertie')
  await page.getByLabel('Breed').fill('Labrador')
  await page.getByLabel('Age').fill('2')
  await page.getByRole('button', { name: /add pet/i }).click()
  await expect(page.getByRole('button', { name: 'Bertie' })).toBeVisible()
  await page.getByRole('button', { name: 'Bertie' }).click()
  await expect(page.locator('.pet-address-notes')).toContainText('Sam Taylor')
  await expect(page.locator('.pet-address-notes')).toContainText(
    '12 River Walk, Bristol',
  )
  await expect(
    page.locator('.pet-address-notes').getByRole('link', {
      name: /google maps/i,
    }),
  ).toHaveAttribute(
    'href',
    /google\.com\/maps\/search\/\?api=1&query=12%20River%20Walk/,
  )
  await expect(
    page.locator('.pet-address-notes').getByRole('link', {
      name: '///filled.count.soap',
    }),
  ).toHaveAttribute('href', 'https://what3words.com/filled.count.soap')

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
  await loginWithEmail(page, 'admin@waggulous.com')
  await expect(
    page.getByRole('heading', { name: /approve bookings and assign walkers/i }),
  ).toBeVisible()
  await page.waitForFunction(() => window.scrollY === 0)
  await page.screenshot({ path: 'test-results/mobile-owner.png' })

  await page.getByRole('button', { name: 'Theme' }).click()
  await page.getByRole('button', { name: /use aqua blue/i }).click()
  await expect(page.locator('.theme-summary')).toContainText('Aqua blue')
  const selectedTheme = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    return {
      themeId: data.themeId,
      accent: getComputedStyle(document.documentElement)
        .getPropertyValue('--coral')
        .trim(),
    }
  })
  expect(selectedTheme).toEqual({
    themeId: 'aqua-blue',
    accent: '#f0b36f',
  })

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
  await page.getByLabel('what3words').fill('///index.home.raft')
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
    page.locator('.timeline-panel').getByRole('button', { name: /Scout/i }),
  ).toBeVisible()
  await expect(
    page.locator('article').filter({ hasText: 'Nina Verbal' }),
  ).toHaveCount(0)

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
  await loginWithEmail(page, 'jordan@waggulous.local', 'Temp123!')
  await expect(page.getByText('No appointments for this date.')).toBeVisible()
  await page.getByLabel('Job date').fill(claimableDate)
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
      .getByRole('button', { name: /^service started$/i }),
  ).toBeDisabled()
  await expect(
    page.locator('article').filter({ hasText: 'Bertie' }),
  ).toContainText('approved')
  await page
    .locator('article')
    .filter({ hasText: 'Bertie' })
    .getByRole('button', { name: 'Bertie' })
    .click()
  await expect(
    page.locator('article').filter({ hasText: 'Bertie' }),
  ).toContainText('Sam Taylor')
  await expect(
    page.locator('article').filter({ hasText: 'Bertie' }),
  ).toContainText('12 River Walk, Bristol')
  await expect(
    page.locator('article').filter({ hasText: 'Bertie' }),
  ).toHaveCount(1)

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
  await page.getByLabel('Job date').fill(todayDate)
  await expect(
    page.locator('article').filter({ hasText: 'Rolo' }),
  ).toContainText('approved')

  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'admin@waggulous.com')
  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'sam@example.com')
  await page.getByRole('button', { name: 'Money' }).click()
  await expect(page.getByText('£0.00')).toBeVisible()
  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'admin@waggulous.com')
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
  await loginWithEmail(page, 'jordan@waggulous.local', 'Temp123!')
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
    page.getByRole('heading', {
      name: /log service start and completion/i,
    }),
  ).toBeVisible()
  await page
    .locator('article')
    .filter({ hasText: 'Mabel' })
    .getByRole('button', { name: /^service started$/i })
    .click()
  await expect(page.getByText('in progress')).toBeVisible()
})

test('owner services layout keeps slots readable on laptop screens', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await loginWithEmail(page, 'admin@waggulous.com')
  await page.getByRole('button', { name: 'Services' }).click()

  const dashboardWidth = await page.locator('.dashboard-grid').evaluate((grid) => {
    return Math.round(grid.getBoundingClientRect().width)
  })
  expect(dashboardWidth).toBeGreaterThanOrEqual(1360)

  const walkServiceRow = page
    .locator('.service-admin-row')
    .filter({ hasText: '30 minute walk' })
    .first()
  await expect(walkServiceRow).toBeVisible()

  const layout = await walkServiceRow.evaluate((row) => {
    const slots = row.querySelector('.slot-list')
    const firstSlot = slots?.querySelector('label')
    const controls = row.querySelector('.service-admin-controls')

    if (!slots || !firstSlot || !controls) {
      return null
    }

    const slotsRect = slots.getBoundingClientRect()
    const firstSlotRect = firstSlot.getBoundingClientRect()
    const controlsRect = controls.getBoundingClientRect()

    return {
      controlsBelowSlots: controlsRect.top >= slotsRect.bottom - 1,
      firstSlotWidth: firstSlotRect.width,
      slotsWidth: slotsRect.width,
    }
  })

  if (!layout) {
    throw new Error('Expected service row to contain slots and controls.')
  }

  expect(layout.slotsWidth).toBeGreaterThan(480)
  expect(layout.firstSlotWidth).toBeGreaterThan(180)
  expect(layout.controlsBelowSlots).toBe(true)
})

test('owner controls site-wide species colours', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await loginWithEmail(page, 'admin@waggulous.com')

  await page.getByRole('button', { name: 'Theme' }).click()
  await page.locator('input[aria-label="Dog colour"]').fill('#0055aa')
  await expect(page.getByText('Species and breeds')).toHaveCount(0)

  const savedColour = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    return data.petSpeciesColours?.dog
  })
  expect(savedColour).toBe('#0055aa')

  await page.getByRole('button', { name: 'Bookings' }).click()
  const timelineDogColour = await page
    .locator('.timeline-booking')
    .filter({ hasText: 'Mabel' })
    .locator('.pet-name-chip')
    .first()
    .evaluate((chip) =>
      getComputedStyle(chip).getPropertyValue('--pet-species-colour').trim(),
    )
  expect(timelineDogColour).toBe('#0055aa')

  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'sam@example.com')
  await expect(page.getByRole('button', { name: 'Theme' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Pets' }).click()

  const customerPetColour = await page
    .locator('.pet-card')
    .filter({ hasText: 'Mabel' })
    .locator('.pet-species-icon')
    .first()
    .evaluate((icon) =>
      getComputedStyle(icon).getPropertyValue('--pet-species-colour').trim(),
    )
  expect(customerPetColour).toBe('#0055aa')
})

test('owner controls species and breed suggestions for pet entry', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await loginWithEmail(page, 'admin@waggulous.com')

  await page.getByRole('button', { name: 'Config' }).click()
  await expect(
    page.getByRole('heading', { name: 'Manage lookup data used across the app.' }),
  ).toBeVisible()
  const catalogue = page.locator('.pet-catalogue-settings')
  const speciesForm = catalogue.locator('form').first()
  const breedForm = catalogue.locator('form').nth(1)

  await speciesForm.getByLabel('Species').fill('Ferret')
  await speciesForm.getByRole('button', { name: /add species/i }).click()
  await expect(
    catalogue.locator('.species-catalogue-row').filter({ hasText: 'Ferret' }),
  ).toBeVisible()

  await breedForm.getByLabel('Species').fill('Ferret')
  await breedForm.getByLabel('Breed').fill('Polecat')
  await breedForm.getByRole('button', { name: /add breed/i }).click()
  await breedForm.getByLabel('Breed').fill('Angora')
  await breedForm.getByRole('button', { name: /add breed/i }).click()

  const savedCatalogue = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    return data.petSpeciesBreedCatalogue?.Ferret
  })
  expect(savedCatalogue).toEqual(['Angora', 'Polecat'])

  await page.getByRole('button', { name: 'Clients' }).click()
  const clientForm = page.locator('form').filter({ hasText: 'Client name' })
  await expect(clientForm.getByLabel('Species')).toHaveValue('')

  await clientForm.getByLabel('Species').click()
  await expect(clientForm.getByRole('button', { name: 'Ferret' })).toBeVisible()
  await clientForm.getByRole('button', { name: 'Ferret' }).click()

  await clientForm.getByLabel('Breed').click()
  await expect(clientForm.getByRole('button', { name: 'Angora' })).toBeVisible()
  await expect(clientForm.getByRole('button', { name: 'Polecat' })).toBeVisible()
  await expect(clientForm.getByRole('button', { name: 'Labrador' })).toHaveCount(
    0,
  )

  await clientForm.getByLabel('Species').fill('Dog')
  await clientForm.getByLabel('Breed').click()
  await expect(clientForm.getByRole('button', { name: 'Labrador' })).toBeVisible()
  await expect(clientForm.getByRole('button', { name: 'Polecat' })).toHaveCount(0)
})

test('owner bookings open in an interactive staff timeline', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  const todayDate = dateInputFromToday(0)

  await page.evaluate((date) => {
    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    const overlapBookings = [
      ['b-overlap-rufus', 'u-eliza', 'p-rufus', 'Rufus'],
      ['b-overlap-nori', 'u-omar', 'p-nori', 'Nori'],
      ['b-overlap-luna', 'u-grace', 'p-luna', 'Luna'],
    ].map(([id, customerId, petId, petName]) => ({
      id,
      customerId,
      petIds: [petId],
      serviceId: 's-walk-30',
      slotId: 'slot-walk-early',
      date,
      time: '07:00',
      endTime: '08:00',
      notes: `Demo overlapping early walk for ${petName}.`,
      status: 'approved',
      price: 14,
      walkerId: 'u-maya',
    }))

    localStorage.setItem(
      'waggulous-mvp-data',
      JSON.stringify({
        ...data,
        bookings: [
          ...overlapBookings,
          ...data.bookings.filter(
            (booking: { id: string }) => !booking.id.startsWith('b-overlap-'),
          ),
        ],
      }),
    )
  }, todayDate)
  await page.reload()
  await loginWithEmail(page, 'admin@waggulous.com')

  const timeline = page.locator('.timeline-panel')
  await expect(timeline).toContainText('5 bookings across 1 day')
  await expect(timeline.getByText('Alex Walker')).toBeVisible()
  await expect(timeline.getByText('Maya Chen')).toBeVisible()
  await expect(timeline.getByText('Priya Shah')).toBeVisible()
  await expect(timeline.getByText('Tom Evans')).toBeVisible()
  await expect(timeline.getByRole('button', { name: /Mabel/i })).toBeVisible()
  await expect(timeline.getByRole('button', { name: /Pip/i })).toBeVisible()
  await expect(timeline.getByRole('button', { name: /Rufus/i })).toBeVisible()
  await expect(timeline.getByRole('button', { name: /Nori/i })).toBeVisible()
  await expect(timeline.getByRole('button', { name: /Luna/i })).toBeVisible()
  const dayLayout = await timeline.evaluate((panel) => {
    const rect = (element: Element) => element.getBoundingClientRect()
    const tracks = Array.from(panel.querySelectorAll('.timeline-row-track'))
    const staff = Array.from(panel.querySelectorAll('.timeline-staff'))
    const cards = Array.from(panel.querySelectorAll('.timeline-booking'))
    const mayaIndex = staff.findIndex((row) =>
      row.textContent?.includes('Maya Chen'),
    )
    const mayaCards =
      mayaIndex >= 0
        ? Array.from(
            tracks[mayaIndex].querySelectorAll('.timeline-booking'),
          ).filter((card) =>
            ['Rufus', 'Nori', 'Luna'].some((petName) =>
              card.textContent?.includes(petName),
            ),
          )
        : []

    return {
      maxCardOverflow: Math.max(
        0,
        ...cards.map(
          (card) =>
            rect(card).bottom - rect(card.parentElement as Element).bottom,
        ),
      ),
      maxRowDelta: Math.max(
        0,
        ...tracks.map((track, index) =>
          staff[index]
            ? Math.abs(rect(track).top - rect(staff[index]).top)
            : 0,
        ),
      ),
      mayaOverlapCardCount: mayaCards.length,
      mayaOverlapLaneCount: new Set(
        mayaCards.map((card) => Math.round(rect(card).top)),
      ).size,
    }
  })
  expect(dayLayout.maxCardOverflow).toBeLessThanOrEqual(1)
  expect(dayLayout.maxRowDelta).toBeLessThanOrEqual(1)
  expect(dayLayout.mayaOverlapCardCount).toBe(3)
  expect(dayLayout.mayaOverlapLaneCount).toBe(3)

  await timeline.getByRole('button', { name: /zoom out/i }).click()
  await expect(timeline).toContainText('8 bookings across 2 days')
  const zoomedLayout = await timeline.evaluate((panel) => {
    const rect = (element: Element) => element.getBoundingClientRect()
    const scale = panel.querySelector('.timeline-scale')
    const markers = Array.from(panel.querySelectorAll('.timeline-scale .day-marker'))
    const cards = Array.from(panel.querySelectorAll('.timeline-booking'))
    const tracks = Array.from(panel.querySelectorAll('.timeline-row-track'))
    const staff = Array.from(panel.querySelectorAll('.timeline-staff'))
    const scaleRect = scale ? rect(scale) : null

    return {
      maxCardOverflow: Math.max(
        0,
        ...cards.map(
          (card) =>
            rect(card).bottom - rect(card.parentElement as Element).bottom,
        ),
      ),
      maxHeaderOverflow: scaleRect
        ? Math.max(
            0,
            ...markers.map((marker) =>
              Math.max(
                scaleRect.top - rect(marker).top,
                rect(marker).bottom - scaleRect.bottom,
              ),
            ),
          )
        : 999,
      maxRowDelta: Math.max(
        0,
        ...tracks.map((track, index) =>
          staff[index]
            ? Math.abs(rect(track).top - rect(staff[index]).top)
            : 0,
        ),
      ),
    }
  })
  expect(zoomedLayout.maxCardOverflow).toBeLessThanOrEqual(1)
  expect(zoomedLayout.maxHeaderOverflow).toBeLessThanOrEqual(1)
  expect(zoomedLayout.maxRowDelta).toBeLessThanOrEqual(1)
  await timeline.getByRole('button', { name: /next date range/i }).click()
  await expect(timeline).toContainText('5 bookings across 2 days')
  await timeline.getByRole('button', { name: /previous date range/i }).click()

  const multiPetAppointment = timeline
    .locator('.timeline-booking')
    .filter({ hasText: 'Nori' })
    .filter({ hasText: 'Biscuit' })
    .filter({ hasText: 'Pet sitting pop-in' })
  await multiPetAppointment.click()
  await expect(timeline).toContainText(
    'Quiet visit for Nori, then check Biscuit has hay and water.',
  )
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Remove Biscuit')
    await dialog.accept()
  })
  await timeline
    .getByRole('button', { name: 'Remove Biscuit from appointment' })
    .click()
  const updatedMultiPetAppointment = timeline
    .locator('.timeline-booking')
    .filter({ hasText: 'Nori' })
    .filter({ hasText: 'Pet sitting pop-in' })
  await expect(updatedMultiPetAppointment).toContainText('Nori')
  await expect(updatedMultiPetAppointment).not.toContainText('Biscuit')
  const removedPetBooking = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    const booking = data.bookings.find(
      (candidate: { id: string }) => candidate.id === 'b-demo-3',
    )

    return booking?.petIds ?? []
  })
  expect(removedPetBooking).toEqual(['p-nori'])

  await timeline.getByRole('button', { name: /Mabel/i }).click()
  await expect(timeline).toContainText('Please use the blue harness.')
  await timeline
    .locator('.pet-detail-actions')
    .getByRole('button', { name: 'View Mabel details' })
    .click()
  await expect(timeline).toContainText('12 River Walk, Bristol')
  await expect(
    timeline.getByRole('link', { name: /google maps/i }),
  ).toHaveAttribute(
    'href',
    /google\.com\/maps\/search\/\?api=1&query=12%20River%20Walk/,
  )
  await expect(
    timeline.getByRole('link', { name: '///filled.count.soap' }),
  ).toHaveAttribute('href', 'https://what3words.com/filled.count.soap')
  await expect(timeline).toContainText(
    'Loves woodland routes, nervous around scooters.',
  )
  await expect(timeline.getByRole('img', { name: 'Dog' }).first()).toBeVisible()
  await expect(timeline.getByRole('img', { name: 'Cat' }).first()).toBeVisible()
  await timeline
    .getByRole('combobox', { name: 'Staff assignment' })
    .selectOption('u-priya')
  await expect(
    timeline.getByRole('combobox', { name: 'Staff assignment' }),
  ).toHaveValue('u-priya')
  const reassignedStaff = await timeline.evaluate((panel) => {
    const tracks = Array.from(panel.querySelectorAll('.timeline-row-track'))
    const staff = Array.from(panel.querySelectorAll('.timeline-staff'))
    const index = tracks.findIndex((track) =>
      track.textContent?.includes('Mabel'),
    )

    return index >= 0 ? staff[index]?.textContent ?? '' : ''
  })
  expect(reassignedStaff).toContain('Priya Shah')
  await timeline
    .getByRole('combobox', { name: 'Staff assignment' })
    .selectOption('u-walker')
  await expect(
    timeline.getByRole('combobox', { name: 'Staff assignment' }),
  ).toHaveValue('u-walker')

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('cancel Mabel')
    await dialog.dismiss()
  })
  await timeline.getByRole('button', { name: /cancel appointment/i }).click()
  await expect(timeline.locator('.timeline-detail .status-badge')).toHaveText(
    'approved',
  )

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('cancel Mabel')
    await dialog.accept()
  })
  await timeline.getByRole('button', { name: /cancel appointment/i }).click()
  await expect(timeline.locator('.timeline-detail .status-badge')).toHaveText(
    'cancelled',
  )
  await expect(
    timeline.locator('.timeline-booking').filter({ hasText: 'Mabel' }),
  ).toContainText('cancelled')
})

test('recurring slot bookings can be halted and individual slots cancelled', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const nextMonday = dateInputForNextWeekday(1)

  await loginWithEmail(page, 'sam@example.com')
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
  await loginWithEmail(page, 'admin@waggulous.com')
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

test('money matures completed services and allows client credit', async ({
  page,
}) => {
  const walkDates = [
    dateInputFromToday(-5),
    dateInputFromToday(-4),
    dateInputFromToday(-3),
  ]

  await page.evaluate((dates) => {
    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    const bookings = dates.map((date, index) => ({
      id: `b-completed-${index + 1}`,
      customerId: 'u-customer',
      petIds: ['p-mabel'],
      serviceId: 's-walk-30',
      date,
      time: '09:00',
      notes: '',
      status: 'completed',
      price: 14,
      walkerId: 'u-walker',
      pickedUpAt: `${date}T09:00:00.000Z`,
      returnedAt: `${date}T09:35:00.000Z`,
    }))
    const transactions = bookings.map(
      (booking: { id: string; customerId: string; date: string }, index) => ({
        id: `t-completed-${index + 1}`,
        customerId: booking.customerId,
        bookingId: booking.id,
        date: booking.date,
        description: `Approved 30 minute walk for Mabel ${index + 1}`,
        amount: 14,
        status: 'owed',
        type: 'charge',
      }),
    )

    localStorage.setItem(
      'waggulous-mvp-data',
      JSON.stringify({
        ...data,
        bookings: [...bookings, ...data.bookings],
        transactions: [...transactions, ...data.transactions],
      }),
    )
  }, walkDates)
  await page.reload()

  await loginWithEmail(page, 'sam@example.com')
  await page.getByRole('button', { name: 'Money' }).click()
  await expect(
    page.getByRole('heading', { name: /owed monies/i }),
  ).toBeVisible()
  await expect(page.getByText('£42.00')).toBeVisible()

  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'admin@waggulous.com')
  await page.getByRole('button', { name: 'Clients' }).click()
  await page.getByRole('button', { name: 'Payments' }).click()
  await page.getByLabel('Client').selectOption('u-customer')
  await expect(page.locator('.payment-detail-heading')).toContainText(
    '£42.00 outstanding',
  )
  await page.getByLabel('Payment received', { exact: true }).fill('30')
  await page.getByRole('button', { name: /record client payment/i }).click()
  await expect(page.getByRole('status')).toContainText(
    '£30.00 payment recorded',
  )
  await expect(page.locator('.payment-detail-heading')).toContainText(
    '£12.00 outstanding',
  )
  await expect(page.getByText('Paid £14.00')).toHaveCount(2)
  await expect(
    page.getByText('Part paid £2.00 · £12.00 outstanding'),
  ).toBeVisible()

  await page.getByLabel('Payment received', { exact: true }).fill('20')
  await page.getByRole('button', { name: /record client payment/i }).click()
  await expect(page.getByRole('status')).toContainText(
    '£20.00 payment recorded',
  )
  await expect(page.locator('.payment-detail-heading')).toContainText(
    '£8.00 in credit',
  )
  await expect(page.getByText('Paid £14.00')).toHaveCount(3)

  const allocations = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    const bookingPayments = data.bookings
      .filter((booking: { id: string }) => booking.id.startsWith('b-completed-'))
      .sort((a: { date: string }, b: { date: string }) =>
        a.date.localeCompare(b.date),
      )
      .map((booking: { id: string }) => ({
        id: booking.id,
        paid: data.transactions
          .filter(
            (transaction: { bookingId?: string; status: string; type?: string }) =>
              transaction.bookingId === booking.id &&
              transaction.status === 'paid' &&
              transaction.type === 'payment',
          )
          .reduce(
            (total: number, transaction: { amount: number }) =>
              total + transaction.amount,
            0,
          ),
      }))

    return {
      bookingPayments,
      credit: data.transactions
        .filter(
          (transaction: { bookingId?: string; customerId: string; status: string; type?: string }) =>
            !transaction.bookingId &&
            transaction.customerId === 'u-customer' &&
            transaction.status === 'paid' &&
            transaction.type === 'payment',
        )
        .reduce(
          (total: number, transaction: { amount: number }) =>
            total + transaction.amount,
          0,
        ),
    }
  })

  expect(allocations).toEqual({
    bookingPayments: [
      { id: 'b-completed-1', paid: 14 },
      { id: 'b-completed-2', paid: 14 },
      { id: 'b-completed-3', paid: 14 },
    ],
    credit: 8,
  })
})

test('admin payments page supports bespoke balance amendments', async ({
  page,
}) => {
  await loginWithEmail(page, 'admin@waggulous.com')
  await page.getByRole('button', { name: 'Payments' }).click()
  await expect(
    page.getByRole('heading', {
      name: /outstanding balances, manual receipts, and balance amendments/i,
    }),
  ).toBeVisible()

  await page.getByLabel('Client').selectOption('u-eliza')
  await page.getByLabel('Adjustment direction').selectOption('increase')
  await page.getByLabel('Adjustment amount').fill('17')
  await page.getByLabel('Adjustment reason').fill('Collar replacement')
  await page.getByRole('button', { name: /apply balance adjustment/i }).click()
  await expect(page.getByRole('status')).toContainText(
    '£17.00 charge adjustment applied for Eliza Moore.',
  )
  await expect(page.locator('.payment-detail-heading')).toContainText(
    '£17.00 outstanding',
  )
  await expect(
    page.locator('.balance-client-row').filter({ hasText: 'Eliza Moore' }),
  ).toContainText('£17.00')

  await page.getByLabel('Adjustment direction').selectOption('decrease')
  await page.getByLabel('Adjustment amount').fill('5')
  await page.getByLabel('Adjustment reason').fill('Goodwill credit')
  await page.getByRole('button', { name: /apply balance adjustment/i }).click()
  await expect(page.getByRole('status')).toContainText(
    '£5.00 credit adjustment applied for Eliza Moore.',
  )
  await expect(page.locator('.payment-detail-heading')).toContainText(
    '£12.00 outstanding',
  )
  await expect(page.getByText('Collar replacement')).toBeVisible()
  await expect(page.getByText('Goodwill credit')).toBeVisible()

  const amendments = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    return data.transactions
      .filter(
        (transaction: { customerId: string; description: string }) =>
          transaction.customerId === 'u-eliza' &&
          transaction.description.includes('Balance adjustment'),
      )
      .map(
        (transaction: {
          amount: number
          status: string
          type?: string
          method?: string
        }) => ({
          amount: transaction.amount,
          status: transaction.status,
          type: transaction.type,
          method: transaction.method,
        }),
      )
  })
  expect(amendments).toEqual([
    { amount: 5, status: 'paid', type: 'payment', method: 'other' },
    { amount: 17, status: 'owed', type: 'charge', method: undefined },
  ])
})

test('multi-household booking and walker exception workflows stay coherent', async ({
  page,
}) => {
  test.setTimeout(60_000)
  const nextMonday = dateInputForNextWeekday(1)
  const nextTuesday = dateInputForNextWeekday(2)
  const nextThursday = dateInputForNextWeekday(4)
  const nextSaturday = dateInputForNextWeekday(6)
  const households = [
    ['u-hh-1', 'Ava Green', 'ava.green@example.com', 'Bracken', 'Dog', 's-walk-30', 'slot-walk-early', nextMonday, '07:00', '08:00'],
    ['u-hh-2', 'Ben Clarke', 'ben.clarke@example.com', 'Milo', 'Dog', 's-walk-30', 'slot-walk-early', nextMonday, '07:00', '08:00'],
    ['u-hh-3', 'Cora Patel', 'cora.patel@example.com', 'Luna', 'Dog', 's-walk-30', 'slot-walk-early', nextMonday, '07:00', '08:00'],
    ['u-hh-4', 'Dylan Scott', 'dylan.scott@example.com', 'Rafi', 'Dog', 's-walk-30', 'slot-walk-early', nextMonday, '07:00', '08:00'],
    ['u-hh-5', 'Eden Walsh', 'eden.walsh@example.com', 'Otis', 'Dog', 's-walk-30', 'slot-walk-early', nextMonday, '07:00', '08:00'],
    ['u-hh-6', 'Farah Ali', 'farah.ali@example.com', 'Poppy', 'Dog', 's-walk-60', 'slot-walk-lunch', nextTuesday, '12:00', '13:00'],
    ['u-hh-7', 'Gus Morgan', 'gus.morgan@example.com', 'Noodle', 'Cat', 's-pop-in', 'slot-pop-in-daily', nextSaturday, '10:00', '12:00'],
    ['u-hh-8', 'Hana Reed', 'hana.reed@example.com', 'Pepper', 'Rabbit', 's-pop-in', 'slot-pop-in-daily', nextSaturday, '10:00', '12:00'],
    ['u-hh-9', 'Imani Brooks', 'imani.brooks@example.com', 'Blue', 'Dog', 's-walk-30', 'slot-walk-evening', nextThursday, '18:00', '19:00'],
    ['u-hh-10', 'Jon Bell', 'jon.bell@example.com', 'Mochi', 'Cat', 's-pop-in', 'slot-pop-in-daily', nextTuesday, '10:00', '12:00'],
    ['u-hh-11', 'Kara Stone', 'kara.stone@example.com', 'Scout', 'Dog', 's-walk-60', 'slot-walk-lunch', nextThursday, '12:00', '13:00'],
    ['u-hh-12', 'Leo Chen', 'leo.chen@example.com', 'Fern', 'Dog', 's-walk-30', 'slot-walk-evening', nextMonday, '18:00', '19:00'],
  ]

  await page.evaluate((seedHouseholds) => {
    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    const reliefWalker = {
      id: 'u-relief',
      name: 'Relief Walker',
      email: 'relief@waggulous.local',
      password: 'Test123!',
      role: 'walker',
      phone: '07700 900555',
      address: '4 Spare Lead Lane',
      canSelfAssign: true,
    }
    const users = seedHouseholds.map(
      ([id, name, email]: string[]) => ({
        id,
        name,
        email,
        password: 'Test123!',
        role: 'customer',
      }),
    )
    const pets = seedHouseholds.map(
      ([userId, , , petName, species]: string[], index: number) => ({
        id: `p-hh-${index + 1}`,
        ownerId: userId,
        name: petName,
        species,
        breed: species === 'Dog' ? 'Mixed breed' : species,
        age: String(2 + (index % 7)),
        notes: `Household ${index + 1} care notes.`,
      }),
    )
    const bookings = seedHouseholds.map(
      (
        [userId, , , petName, , serviceId, slotId, date, time, endTime]: string[],
        index: number,
      ) => ({
        id: `b-hh-${index + 1}`,
        customerId: userId,
        petIds: [`p-hh-${index + 1}`],
        serviceId,
        slotId,
        date,
        time,
        endTime,
        notes: `Client web request for ${petName}.`,
        status: 'requested',
        price: serviceId === 's-walk-60' ? 22 : 14,
      }),
    )

    localStorage.setItem(
      'waggulous-mvp-data',
      JSON.stringify({
        ...data,
        users: [...data.users, reliefWalker, ...users],
        pets: [...data.pets, ...pets],
        bookings: [...bookings, ...data.bookings],
      }),
    )
  }, households)
  await page.reload()

  const seededCounts = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    return {
      households: data.users.filter((user: { id: string }) =>
        user.id.startsWith('u-hh-'),
      ).length,
      requested: data.bookings.filter((booking: { id: string; status: string }) =>
        booking.id.startsWith('b-hh-') && booking.status === 'requested',
      ).length,
    }
  })
  expect(seededCounts).toEqual({ households: 12, requested: 12 })

  await loginWithEmail(page, 'admin@waggulous.com')
  for (const [petName, clientName] of [
    ['Bracken', 'Ava Green'],
    ['Milo', 'Ben Clarke'],
    ['Luna', 'Cora Patel'],
    ['Rafi', 'Dylan Scott'],
    ['Otis', 'Eden Walsh'],
  ]) {
    const row = page
      .locator('article')
      .filter({ hasText: petName })
      .filter({ hasText: clientName })
    await row.getByRole('combobox').selectOption('u-walker')
    await row.getByRole('button', { name: /^Approve$/ }).click()
    await expect(row).toHaveCount(0)
  }

  const declinedRow = page.locator('article').filter({ hasText: 'Poppy' })
  await declinedRow.getByRole('button', { name: /^Decline$/ }).click()
  await expect(declinedRow).toHaveCount(0)

  await page.getByRole('button', { name: 'Clients' }).click()
  await page.getByRole('button', { name: 'Appointment' }).click()
  await page.locator('form').getByRole('combobox').first().selectOption('u-hh-8')
  await page.getByRole('checkbox', { name: 'Pepper' }).check()
  await page.getByLabel('Service').selectOption('s-evening')
  await page.getByLabel('Date', { exact: true }).fill(nextSaturday)
  await page.getByLabel('Time', { exact: true }).fill('18:30')
  await page
    .getByRole('textbox', { name: 'Booking notes' })
    .fill('Email request: owner entered evening sit for Pepper.')
  await page.getByRole('button', { name: /add approved booking/i }).click()
  await expect(page.getByRole('status')).toContainText(
    'Approved Evening sit booking added for Hana Reed',
  )

  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'farah.ali@example.com')
  await page.getByRole('button', { name: 'Messages' }).click()
  await expect(page.getByText(/cannot cover your 60 minute adventure walk/i)).toBeVisible()

  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'walker@waggulous.local')
  await page.getByRole('button', { name: 'Messages' }).click()
  await page
    .getByRole('textbox', { name: 'Message' })
    .fill('I cannot safely take all five early dogs in one route. Please split the session or ask two clients if they prefer a later walk.')
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(page.getByText(/cannot safely take all five early dogs/i)).toBeVisible()

  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'admin@waggulous.com')
  await page.getByRole('button', { name: 'Messages' }).click()
  await expect(page.getByText(/split the session/i)).toBeVisible()

  await page.getByRole('button', { name: 'Staff' }).click()
  await page
    .locator('article')
    .filter({ hasText: 'Alex Walker' })
    .getByRole('button', { name: /view profile and appointments/i })
    .click()
  for (const [petName, clientName] of [
    ['Luna', 'Cora Patel'],
    ['Rafi', 'Dylan Scott'],
  ]) {
    const staffRow = page
      .locator('article')
      .filter({ hasText: petName })
      .filter({ hasText: clientName })
    await staffRow.getByLabel('Reassign').selectOption('u-relief')
    await expect(staffRow).toHaveCount(0)
  }

  await page.getByRole('button', { name: 'Messages' }).click()
  await page.getByLabel('To').selectOption('u-hh-3')
  await page
    .getByRole('textbox', { name: 'Message' })
    .fill('Alex flagged the early route is too full. Would you prefer Luna to walk with our relief walker or move to a later session?')
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(page.getByText(/Would you prefer Luna/i)).toBeVisible()

  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'cora.patel@example.com')
  await page.getByRole('button', { name: 'Messages' }).click()
  await expect(page.getByText(/relief walker or move to a later session/i)).toBeVisible()

  const finalState = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    return {
      alexEarlyDogs: data.bookings.filter(
        (booking: { walkerId?: string; id: string; status: string }) =>
          booking.walkerId === 'u-walker' &&
          booking.id.startsWith('b-hh-') &&
          booking.status === 'approved',
      ).length,
      reliefDogs: data.bookings.filter(
        (booking: { walkerId?: string; id: string; status: string }) =>
          booking.walkerId === 'u-relief' && booking.id.startsWith('b-hh-'),
      ).length,
      declined: data.bookings.some(
        (booking: { id: string; status: string }) =>
          booking.id === 'b-hh-6' && booking.status === 'declined',
      ),
      ownerEnteredBooking: data.bookings.some(
        (booking: { customerId: string; serviceId: string; notes: string }) =>
          booking.customerId === 'u-hh-8' &&
          booking.serviceId === 's-evening' &&
          booking.notes.includes('Email request'),
      ),
    }
  })
  expect(finalState).toEqual({
    alexEarlyDogs: 3,
    reliefDogs: 2,
    declined: true,
    ownerEnteredBooking: true,
  })
})

test('recurring requests support custom lengths and one-click approval', async ({
  page,
}) => {
  const nextMonday = dateInputForNextWeekday(1)

  await loginWithEmail(page, 'sam@example.com')
  await page.getByRole('button', { name: 'Request' }).click()
  await page.getByLabel('Service').selectOption('s-walk-30')
  await page.getByRole('checkbox', { name: 'Mabel' }).check()
  await page.getByLabel('Date', { exact: true }).fill(nextMonday)
  await page.getByLabel('Available slot').selectOption('slot-walk-early')
  await page.getByLabel(/repeat weekly/i).check()
  await expect(page.getByLabel('Repeat length')).toContainText('Until I cancel')
  await page.getByLabel('Repeat length').selectOption('2')
  await page.getByRole('button', { name: /request service/i }).click()
  await expect(page.getByRole('status')).toContainText(
    'recurring request sent for 2 weeks',
  )

  const requestedSeries = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    const series = data.recurringBookings[0]
    const bookings = data.bookings.filter(
      (booking: { recurringBookingId?: string }) =>
        booking.recurringBookingId === series.id,
    )

    return {
      durationWeeks: series.durationWeeks,
      continuesUntilCancelled: series.continuesUntilCancelled,
      bookingCount: bookings.length,
      requestedCount: bookings.filter(
        (booking: { status: string }) => booking.status === 'requested',
      ).length,
    }
  })

  expect(requestedSeries).toEqual({
    durationWeeks: 2,
    continuesUntilCancelled: false,
    bookingCount: 10,
    requestedCount: 10,
  })

  await page.getByRole('button', { name: /sign out/i }).click()
  await loginWithEmail(page, 'admin@waggulous.com')
  const recurringRequest = page.locator('article').filter({
    hasText: 'Recurring request',
  })
  await expect(recurringRequest).toHaveCount(1)
  await expect(recurringRequest).toContainText('10 appointments')
  await recurringRequest.getByRole('button', { name: /approve series/i }).click()

  const approvedSeries = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('waggulous-mvp-data') || '{}')
    const series = data.recurringBookings[0]
    const bookings = data.bookings.filter(
      (booking: { recurringBookingId?: string }) =>
        booking.recurringBookingId === series.id,
    )
    const bookingIds = bookings.map((booking: { id: string }) => booking.id)

    return {
      approvedCount: bookings.filter(
        (booking: { status: string }) => booking.status === 'approved',
      ).length,
      chargeCount: data.transactions.filter(
        (transaction: { bookingId?: string; status: string }) =>
          bookingIds.includes(transaction.bookingId ?? '') &&
          transaction.status === 'owed',
      ).length,
    }
  })

  expect(approvedSeries).toEqual({
    approvedCount: 10,
    chargeCount: 10,
  })
})
