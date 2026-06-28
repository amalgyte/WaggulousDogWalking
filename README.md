# Waggulous

Mobile-first PWA MVP for a dog walking and pet sitting business.

## What is included

- Marketing landing page with generated Waggulous hero image.
- Installable PWA metadata and service worker app-shell caching.
- Local demo authentication with customer, owner, and walker roles.
- Customer pet profiles with named pets, details, care notes, and uploaded pictures.
- Service request flow for walking or pet sitting with visible prices, request confirmation, and current request/assigned appointment lists.
- Customer money view showing owed totals and historical transactions only.
- Owner console for approving or declining bookings, assigning walkers, reassigning staff appointments, maintaining services/prices, and registering staff.
- Staff records with name, address, phone, email, avatar, login credentials, and owner-controlled self-assignment permission.
- Staff workspace for authorised jobs, next-7-day unassigned appointment claiming, profile maintenance, avatar updates, and all-day or timed start/end availability management.
- Booking-linked messaging between roles.

This MVP stores data in browser `localStorage`. Payment account details are deliberately not stored because payments are expected to be handled by an outsourced service.

## Demo accounts

All demo passwords are `demo`.

- Customer: `sam@example.com`
- Owner: `owner@waggulous.local`
- Walker: `walker@waggulous.local`

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm test
```

The dev app runs at `http://127.0.0.1:5173/`.

## Verification

The Playwright smoke test runs the mobile MVP path across the customer, owner, and walker workspaces and writes viewport screenshots to `test-results/`.
