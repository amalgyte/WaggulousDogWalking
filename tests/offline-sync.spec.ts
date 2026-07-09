import { expect, test } from '@playwright/test'
import {
  pendingBookingUpdatesKey,
  queuePendingBookingUpdate,
  reconcilePendingBookingUpdates,
} from '../src/offlineSync'

function createMemoryStorage() {
  const values = new Map<string, string>()

  return {
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => {
      values.delete(key)
    },
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
  }
}

test('offline pickup stamp is replayed over a stale Firebase snapshot', () => {
  const storage = createMemoryStorage()

  queuePendingBookingUpdate(
    'b-alexander',
    {
      pickedUpAt: '2026-07-08T09:00:00.000Z',
      status: 'in-progress',
    },
    storage,
    '2026-07-08T09:00:01.000Z',
  )

  const reconciled = reconcilePendingBookingUpdates(
    {
      bookings: [
        {
          id: 'b-alexander',
          status: 'approved' as const,
        },
        {
          id: 'b-second-dog',
          status: 'approved' as const,
        },
      ],
    },
    storage,
  )

  expect(reconciled.bookings).toEqual([
    {
      id: 'b-alexander',
      pickedUpAt: '2026-07-08T09:00:00.000Z',
      status: 'in-progress',
    },
    {
      id: 'b-second-dog',
      status: 'approved',
    },
  ])
  expect(storage.getItem(pendingBookingUpdatesKey)).toContain('b-alexander')
})

test('reflected offline booking stamps clear from the pending queue', () => {
  const storage = createMemoryStorage()

  queuePendingBookingUpdate(
    'b-alexander',
    {
      pickedUpAt: '2026-07-08T09:00:00.000Z',
      status: 'in-progress',
    },
    storage,
    '2026-07-08T09:00:01.000Z',
  )

  const reconciled = reconcilePendingBookingUpdates(
    {
      bookings: [
        {
          id: 'b-alexander',
          pickedUpAt: '2026-07-08T09:00:00.000Z',
          status: 'in-progress' as const,
        },
      ],
    },
    storage,
  )

  expect(reconciled.bookings[0]).toEqual({
    id: 'b-alexander',
    pickedUpAt: '2026-07-08T09:00:00.000Z',
    status: 'in-progress',
  })
  expect(storage.getItem(pendingBookingUpdatesKey)).toBeNull()
})

test('offline return stamp is not downgraded by an older pickup-only state', () => {
  const storage = createMemoryStorage()

  queuePendingBookingUpdate(
    'b-alexander',
    {
      returnedAt: '2026-07-08T10:00:00.000Z',
      status: 'completed',
    },
    storage,
    '2026-07-08T10:00:01.000Z',
  )

  const reconciled = reconcilePendingBookingUpdates(
    {
      bookings: [
        {
          id: 'b-alexander',
          pickedUpAt: '2026-07-08T09:00:00.000Z',
          status: 'in-progress' as const,
        },
      ],
    },
    storage,
  )

  expect(reconciled.bookings[0]).toEqual({
    id: 'b-alexander',
    pickedUpAt: '2026-07-08T09:00:00.000Z',
    returnedAt: '2026-07-08T10:00:00.000Z',
    status: 'completed',
  })
})

test('offline pickup correction clears a stale remote pickup state', () => {
  const storage = createMemoryStorage()

  queuePendingBookingUpdate(
    'b-alexander',
    {
      pickedUpAt: '2026-07-08T09:00:00.000Z',
      status: 'in-progress',
    },
    storage,
    '2026-07-08T09:00:01.000Z',
  )
  queuePendingBookingUpdate(
    'b-alexander',
    {
      pickedUpAt: null,
      returnedAt: null,
      status: 'approved',
    },
    storage,
    '2026-07-08T09:00:02.000Z',
  )

  const reconciled = reconcilePendingBookingUpdates(
    {
      bookings: [
        {
          id: 'b-alexander',
          pickedUpAt: '2026-07-08T09:00:00.000Z',
          status: 'in-progress' as const,
        },
      ],
    },
    storage,
  )

  expect(reconciled.bookings[0]).toEqual({
    id: 'b-alexander',
    status: 'approved',
  })
  expect(storage.getItem(pendingBookingUpdatesKey)).toContain('b-alexander')
})

test('queued pickup correction clears once Firebase reflects waiting state', () => {
  const storage = createMemoryStorage()

  queuePendingBookingUpdate(
    'b-alexander',
    {
      pickedUpAt: null,
      returnedAt: null,
      status: 'approved',
    },
    storage,
    '2026-07-08T09:00:02.000Z',
  )

  const reconciled = reconcilePendingBookingUpdates(
    {
      bookings: [
        {
          id: 'b-alexander',
          status: 'approved' as const,
        },
      ],
    },
    storage,
  )

  expect(reconciled.bookings[0]).toEqual({
    id: 'b-alexander',
    status: 'approved',
  })
  expect(storage.getItem(pendingBookingUpdatesKey)).toBeNull()
})
