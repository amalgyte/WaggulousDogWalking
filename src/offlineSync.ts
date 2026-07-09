export type OfflineBookingStatus =
  | 'requested'
  | 'approved'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'declined'

export type OfflineBooking = {
  id: string
  status: OfflineBookingStatus
  pickedUpAt?: string
  returnedAt?: string
}

export type PendingBookingUpdateFields = Partial<
  Pick<OfflineBooking, 'status'>
> & {
  pickedUpAt?: string | null
  returnedAt?: string | null
}

export type PendingBookingUpdate = {
  bookingId: string
  fields: PendingBookingUpdateFields
  updatedAt: string
}

export const pendingBookingUpdatesKey = 'waggulous-pending-booking-updates'

const terminalStatuses = new Set<OfflineBookingStatus>([
  'cancelled',
  'declined',
])

export function getPendingBookingUpdateFields(
  fields: PendingBookingUpdateFields,
): PendingBookingUpdateFields {
  const pendingFields: PendingBookingUpdateFields = {}

  if (typeof fields.pickedUpAt === 'string' && fields.pickedUpAt) {
    pendingFields.pickedUpAt = fields.pickedUpAt
  }

  if (fields.pickedUpAt === null) {
    pendingFields.pickedUpAt = null
  }

  if (typeof fields.returnedAt === 'string' && fields.returnedAt) {
    pendingFields.returnedAt = fields.returnedAt
  }

  if (fields.returnedAt === null) {
    pendingFields.returnedAt = null
  }

  if (
    fields.status === 'approved' ||
    fields.status === 'in-progress' ||
    fields.status === 'completed'
  ) {
    pendingFields.status = fields.status
  }

  return pendingFields
}

export function loadPendingBookingUpdates(
  storage: Pick<Storage, 'getItem'> = localStorage,
): PendingBookingUpdate[] {
  const saved = storage.getItem(pendingBookingUpdatesKey)
  if (!saved) return []

  try {
    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []

    return parsed.flatMap((update): PendingBookingUpdate[] => {
      if (!update || typeof update !== 'object') return []

      const candidate = update as Partial<PendingBookingUpdate>
      if (
        typeof candidate.bookingId !== 'string' ||
        typeof candidate.updatedAt !== 'string'
      ) {
        return []
      }

      const fields = getPendingBookingUpdateFields(
        (candidate.fields ?? {}) as Partial<OfflineBooking>,
      )

      return Object.keys(fields).length > 0
        ? [{ bookingId: candidate.bookingId, fields, updatedAt: candidate.updatedAt }]
        : []
    })
  } catch {
    return []
  }
}

export function savePendingBookingUpdates(
  updates: PendingBookingUpdate[],
  storage: Pick<Storage, 'removeItem' | 'setItem'> = localStorage,
) {
  if (updates.length === 0) {
    storage.removeItem(pendingBookingUpdatesKey)
    return
  }

  storage.setItem(pendingBookingUpdatesKey, JSON.stringify(updates))
}

export function queuePendingBookingUpdate(
  bookingId: string,
  fields: PendingBookingUpdateFields,
  storage: Pick<Storage, 'getItem' | 'removeItem' | 'setItem'> = localStorage,
  updatedAt = new Date().toISOString(),
) {
  const pendingFields = getPendingBookingUpdateFields(fields)
  if (Object.keys(pendingFields).length === 0) return

  const updates = loadPendingBookingUpdates(storage)
  const existing = updates.find((update) => update.bookingId === bookingId)

  if (existing) {
    existing.fields = { ...existing.fields, ...pendingFields }
    existing.updatedAt = updatedAt
  } else {
    updates.push({ bookingId, fields: pendingFields, updatedAt })
  }

  savePendingBookingUpdates(updates, storage)
}

export function reconcilePendingBookingUpdates<
  TData extends { bookings: TBooking[] },
  TBooking extends OfflineBooking,
>(
  data: TData,
  storage: Pick<Storage, 'getItem' | 'removeItem' | 'setItem'> = localStorage,
): TData {
  const pendingUpdates = loadPendingBookingUpdates(storage)
  if (pendingUpdates.length === 0) return data

  const remainingUpdates: PendingBookingUpdate[] = []
  const updatesByBookingId = new Map<string, PendingBookingUpdateFields>()

  for (const update of pendingUpdates) {
    const booking = data.bookings.find(
      (candidate) => candidate.id === update.bookingId,
    )
    if (!booking) continue

    const fieldsToApply = getFieldsToApply(booking, update.fields)
    if (Object.keys(fieldsToApply).length === 0) continue

    updatesByBookingId.set(update.bookingId, fieldsToApply)
    remainingUpdates.push({
      ...update,
      fields: fieldsToApply,
      updatedAt: new Date().toISOString(),
    })
  }

  savePendingBookingUpdates(remainingUpdates, storage)

  if (updatesByBookingId.size === 0) return data

  return {
    ...data,
    bookings: data.bookings.map((booking) => {
      const pendingFields = updatesByBookingId.get(booking.id)
      return pendingFields ? applyPendingFields(booking, pendingFields) : booking
    }),
  }
}

function applyPendingFields<TBooking extends OfflineBooking>(
  booking: TBooking,
  fields: PendingBookingUpdateFields,
): TBooking {
  const nextBooking = { ...booking }

  if (fields.status) {
    nextBooking.status = fields.status
  }

  if (typeof fields.pickedUpAt === 'string') {
    nextBooking.pickedUpAt = fields.pickedUpAt
  } else if (fields.pickedUpAt === null) {
    delete nextBooking.pickedUpAt
  }

  if (typeof fields.returnedAt === 'string') {
    nextBooking.returnedAt = fields.returnedAt
  } else if (fields.returnedAt === null) {
    delete nextBooking.returnedAt
  }

  return nextBooking
}

function getFieldsToApply(
  booking: OfflineBooking,
  fields: PendingBookingUpdateFields,
): PendingBookingUpdateFields {
  const fieldsToApply: PendingBookingUpdateFields = {}

  if (
    fields.pickedUpAt === null &&
    booking.pickedUpAt &&
    !booking.returnedAt &&
    !terminalStatuses.has(booking.status)
  ) {
    fieldsToApply.pickedUpAt = null
  }

  if (
    fields.returnedAt === null &&
    booking.returnedAt &&
    !terminalStatuses.has(booking.status)
  ) {
    fieldsToApply.returnedAt = null
  }

  if (fields.pickedUpAt && !booking.pickedUpAt) {
    fieldsToApply.pickedUpAt = fields.pickedUpAt
  }

  if (fields.returnedAt && !booking.returnedAt) {
    fieldsToApply.returnedAt = fields.returnedAt
  }

  if (
    fields.status === 'completed' &&
    booking.status !== 'completed' &&
    !terminalStatuses.has(booking.status)
  ) {
    fieldsToApply.status = 'completed'
  }

  if (fields.status === 'in-progress' && booking.status === 'approved') {
    fieldsToApply.status = 'in-progress'
  }

  if (
    fields.status === 'approved' &&
    booking.status === 'in-progress' &&
    !booking.returnedAt
  ) {
    fieldsToApply.status = 'approved'
  }

  return fieldsToApply
}
