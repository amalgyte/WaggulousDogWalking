import {
  CalendarDays,
  Check,
  Clock,
  CreditCard,
  Dog,
  LogOut,
  Menu,
  MessageCircle,
  PawPrint,
  Plus,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type {
  ChangeEvent,
  Dispatch,
  FormEvent,
  ReactNode,
  SetStateAction,
} from 'react'
import heroImage from './assets/waggulous-hero.png'
import './App.css'

type Role = 'customer' | 'owner' | 'walker'
type ServiceType = 'walking' | 'sitting'
type MultiPetPricingMode =
  | 'none'
  | 'fixed-discount'
  | 'percent-discount'
  | 'additional-pet-price'
type BookingStatus =
  | 'requested'
  | 'approved'
  | 'in-progress'
  | 'completed'
  | 'declined'

type User = {
  id: string
  name: string
  email: string
  password: string
  role: Role
  address?: string
  phone?: string
  avatar?: string
  canSelfAssign?: boolean
  holidays?: StaffHoliday[]
}

type StaffHoliday = {
  id: string
  startDate: string
  endDate: string
  allDay: boolean
  startTime?: string
  endTime?: string
  reason: string
  status: 'active' | 'cancelled'
}

type Pet = {
  id: string
  ownerId: string
  name: string
  species: string
  breed: string
  age: string
  notes: string
  photo?: string
}

type Service = {
  id: string
  name: string
  type: ServiceType
  description: string
  duration: string
  price: number
  active: boolean
  multiPetPricing?: {
    mode: MultiPetPricingMode
    amount: number
  }
}

type Booking = {
  id: string
  customerId: string
  petIds: string[]
  serviceId: string
  date: string
  time: string
  notes: string
  status: BookingStatus
  price: number
  walkerId?: string
  pickedUpAt?: string
  returnedAt?: string
}

type Transaction = {
  id: string
  customerId: string
  bookingId?: string
  date: string
  description: string
  amount: number
  status: 'owed' | 'paid' | 'payment-pending'
  type?: 'charge' | 'payment'
  method?: 'cash' | 'bank' | 'card' | 'other'
  recordedById?: string
  confirmedById?: string
  createdAt?: string
}

type Message = {
  id: string
  bookingId?: string
  senderId: string
  recipientId: string
  body: string
  createdAt: string
}

type AppData = {
  users: User[]
  pets: Pet[]
  services: Service[]
  bookings: Booking[]
  transactions: Transaction[]
  messages: Message[]
}

const storageKey = 'waggulous-mvp-data'
const sessionKey = 'waggulous-session-user'

const seedData: AppData = {
  users: [
    {
      id: 'u-owner',
      name: 'Waggulous Owner',
      email: 'owner@waggulous.local',
      password: 'demo',
      role: 'owner',
      phone: '07700 900111',
      address: 'Waggulous HQ, High Street',
    },
    {
      id: 'u-walker',
      name: 'Alex Walker',
      email: 'walker@waggulous.local',
      password: 'demo',
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
      password: 'demo',
      role: 'customer',
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
  bookings: [
    {
      id: 'b-1',
      customerId: 'u-customer',
      petIds: ['p-mabel'],
      serviceId: 's-walk-30',
      date: formatDateInputValue(),
      time: '09:30',
      notes: 'Please use the blue harness.',
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
      date: formatDateInputValue(),
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
      senderId: 'u-owner',
      recipientId: 'u-customer',
      body: 'Alex is confirmed for Monday morning. We will log pickup and return in the app.',
      createdAt: '2026-06-26T14:30:00.000Z',
    },
  ],
}

function loadData(): AppData {
  const saved = localStorage.getItem(storageKey)
  if (!saved) return seedData

  try {
    return JSON.parse(saved) as AppData
  } catch {
    return seedData
  }
}

function makeId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(value)
}

function calculateServicePrice(service: Service, petCount: number) {
  const count = Math.max(1, petCount)
  const rule = service.multiPetPricing

  if (!rule || rule.mode === 'none' || count === 1) return service.price

  if (rule.mode === 'additional-pet-price') {
    return Math.max(0, service.price + rule.amount * (count - 1))
  }

  const standardTotal = service.price * count

  if (rule.mode === 'fixed-discount') {
    return Math.max(0, standardTotal - rule.amount)
  }

  return Math.max(0, standardTotal * (1 - rule.amount / 100))
}

function calculateOutstanding(transactions: Transaction[]) {
  return transactions.reduce((total, transaction) => {
    if (transaction.status === 'owed') return total + transaction.amount
    if (transaction.status === 'paid' && transaction.type === 'payment') {
      return total - transaction.amount
    }
    return total
  }, 0)
}

function calculateBookingOutstanding(data: AppData, booking: Booking) {
  return Math.max(
    0,
    calculateOutstanding(
      data.transactions.filter(
        (transaction) => transaction.bookingId === booking.id,
      ),
    ),
  )
}

function multiPetPricingLabel(service: Service) {
  const rule = service.multiPetPricing

  if (!rule || rule.mode === 'none') return 'No multi-pet adjustment'
  if (rule.mode === 'fixed-discount') {
    return `${formatMoney(rule.amount)} off multi-pet total`
  }
  if (rule.mode === 'percent-discount') {
    return `${rule.amount}% off multi-pet total`
  }
  return `${formatMoney(service.price)} first pet, ${formatMoney(
    rule.amount,
  )} each additional pet`
}

function buildMultiPetPricing(
  mode: MultiPetPricingMode,
  amount: number,
): Service['multiPetPricing'] {
  if (mode === 'none') return { mode: 'none', amount: 0 }
  return { mode, amount: Number.isFinite(amount) ? Math.max(0, amount) : 0 }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`))
}

function formatDateInputValue(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDaysInputValue(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T12:00:00`)
  date.setDate(date.getDate() + days)
  return formatDateInputValue(date)
}

function formatTimeInputValue(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function getDefaultStartTimeForDate(dateValue: string) {
  if (!dateValue) return ''
  if (dateValue === formatDateInputValue()) return formatTimeInputValue()
  return '00:00'
}

function canPickUpBooking(booking: Booking) {
  return (
    booking.status === 'approved' &&
    !booking.pickedUpAt &&
    booking.date <= formatDateInputValue()
  )
}

function formatDateTime(value?: string) {
  if (!value) return 'Not logged'

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function statusLabel(status: BookingStatus) {
  return status.replace('-', ' ')
}

function formatAvailabilityWindow(holiday: StaffHoliday) {
  const start = formatDate(holiday.startDate)
  const end = formatDate(holiday.endDate)
  const isAllDay = holiday.allDay ?? true

  if (isAllDay) {
    return holiday.startDate === holiday.endDate
      ? `${start}, all day`
      : `${start} to ${end}, all day`
  }

  return `Start: ${start} at ${
    holiday.startTime ?? 'time not set'
  } · End: ${end} at ${holiday.endTime ?? 'time not set'}`
}

function resetScroll() {
  window.scrollTo({ top: 0, left: 0 })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}

function App() {
  const [data, setData] = useState<AppData>(() => loadData())
  const [currentUserId, setCurrentUserId] = useState<string | null>(() =>
    localStorage.getItem(sessionKey),
  )
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const currentUser = data.users.find((user) => user.id === currentUserId)

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data))
  }, [data])

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(sessionKey, currentUserId)
    } else {
      localStorage.removeItem(sessionKey)
    }
  }, [currentUserId])

  useEffect(() => {
    resetScroll()
    const frame = window.requestAnimationFrame(() => {
      resetScroll()
    })
    const timer = window.setTimeout(() => {
      resetScroll()
    }, 0)
    const settledTimer = window.setTimeout(() => {
      resetScroll()
    }, 50)
    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
      window.clearTimeout(settledTimer)
    }
  }, [currentUserId])

  function startSession(userId: string) {
    resetScroll()
    setCurrentUserId(userId)
  }

  function signOut() {
    resetScroll()
    setCurrentUserId(null)
    setMobileMenuOpen(false)
  }

  if (currentUser) {
    return (
      <DashboardShell
        data={data}
        setData={setData}
        user={currentUser}
        onSignOut={signOut}
      />
    )
  }

  return (
    <main>
      <SiteHeader
        mobileMenuOpen={mobileMenuOpen}
        onToggleMenu={() => setMobileMenuOpen((open) => !open)}
      />
      <LandingPage
        authMode={authMode}
        data={data}
        mobileMenuOpen={mobileMenuOpen}
        onAuthModeChange={setAuthMode}
        onLogin={startSession}
        onSignup={(name, email, password) => {
          const newUser: User = {
            id: makeId('u'),
            name,
            email,
            password,
            role: 'customer',
          }
          setData((current) => ({
            ...current,
            users: [...current.users, newUser],
          }))
          startSession(newUser.id)
        }}
      />
    </main>
  )
}

function SiteHeader({
  mobileMenuOpen,
  onToggleMenu,
}: {
  mobileMenuOpen: boolean
  onToggleMenu: () => void
}) {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Waggulous home">
        <span className="brand-mark">
          <PawPrint size={22} aria-hidden="true" />
        </span>
        <span>Waggulous</span>
      </a>
      <nav className={mobileMenuOpen ? 'site-nav is-open' : 'site-nav'}>
        <a href="#services">Services</a>
        <a href="#app">App</a>
        <a href="#login">Login</a>
      </nav>
      <button
        className="icon-button mobile-menu"
        type="button"
        aria-label="Toggle menu"
        onClick={onToggleMenu}
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </header>
  )
}

function LandingPage({
  authMode,
  data,
  mobileMenuOpen,
  onAuthModeChange,
  onLogin,
  onSignup,
}: {
  authMode: 'login' | 'signup'
  data: AppData
  mobileMenuOpen: boolean
  onAuthModeChange: (mode: 'login' | 'signup') => void
  onLogin: (id: string) => void
  onSignup: (name: string, email: string, password: string) => void
}) {
  const highlightedServices = data.services.filter((service) => service.active)

  return (
    <>
      <section className="hero-section" id="top">
        <img src={heroImage} alt="" className="hero-image" />
        <div className="hero-overlay" />
        <div className="hero-copy">
          <p className="eyebrow">Dog walking and pet sitting</p>
          <h1>Trusted local care for pets with busy humans.</h1>
          <p>
            Book dog walks and pet sitting, keep every pet profile in one
            place, and follow updates from request to completed visit.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#login">
              Book care
            </a>
            <a className="button secondary" href="#services">
              View prices
            </a>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Service highlights">
        <div>
          <ShieldCheck size={20} />
          <span>Trusted local care</span>
        </div>
        <div>
          <Clock size={20} />
          <span>Simple booking requests</span>
        </div>
        <div>
          <MessageCircle size={20} />
          <span>Messages and updates</span>
        </div>
      </section>

      <section className="content-band" id="services">
        <div className="section-heading">
          <p className="eyebrow">Transparent care menu</p>
          <h2>Walking and sitting with clear prices.</h2>
        </div>
        <div className="service-grid">
          {highlightedServices.map((service) => (
            <article className="service-card" key={service.id}>
              <div className="service-card-top">
                <span className="icon-chip">
                  {service.type === 'walking' ? (
                    <Dog size={20} />
                  ) : (
                    <PawPrint size={20} />
                  )}
                </span>
                <strong>{formatMoney(service.price)}</strong>
              </div>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <span className="muted">{service.duration}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="app-band" id="app">
        <div className="section-heading">
          <p className="eyebrow">For pet owners</p>
          <h2>Your pet care requests, records, and updates in one place.</h2>
        </div>
        <div className="feature-list">
          <Feature
            icon={<UserRound size={20} />}
            title="Pet profiles"
            text="Add named pets, upload pictures, and keep care notes ready for every walk or visit."
          />
          <Feature
            icon={<Sparkles size={20} />}
            title="Easy service requests"
            text="Choose walking or pet sitting, see the price before booking, and add practical instructions."
          />
          <Feature
            icon={<Check size={20} />}
            title="Clear account view"
            text="See owed monies, historical transactions, booking status, and messages without storing payment details."
          />
        </div>
      </section>

      <section
        className={mobileMenuOpen ? 'auth-band menu-offset' : 'auth-band'}
        id="login"
      >
        <AuthPanel
          authMode={authMode}
          data={data}
          onAuthModeChange={onAuthModeChange}
          onLogin={onLogin}
          onSignup={onSignup}
        />
      </section>
    </>
  )
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: ReactNode
  title: string
  text: string
}) {
  return (
    <article className="feature-item">
      <span className="icon-chip">{icon}</span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </article>
  )
}

function AuthPanel({
  authMode,
  data,
  onAuthModeChange,
  onLogin,
  onSignup,
}: {
  authMode: 'login' | 'signup'
  data: AppData
  onAuthModeChange: (mode: 'login' | 'signup') => void
  onLogin: (id: string) => void
  onSignup: (name: string, email: string, password: string) => void
}) {
  const demoUsers = [...data.users].sort((a, b) => {
    const roleOrder: Record<Role, number> = {
      customer: 0,
      owner: 1,
      walker: 2,
    }
    return roleOrder[a.role] - roleOrder[b.role] || a.name.localeCompare(b.name)
  })
  const [email, setEmail] = useState('sam@example.com')
  const [password, setPassword] = useState('demo')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (authMode === 'signup') {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError('Name, email, and password are required.')
        return
      }
      onSignup(name.trim(), email.trim(), password)
      return
    }

    const user = data.users.find(
      (candidate) =>
        candidate.email.toLowerCase() === email.trim().toLowerCase() &&
        candidate.password === password,
    )

    if (!user) {
      setError('Those details do not match a Waggulous account.')
      return
    }

    onLogin(user.id)
  }

  return (
    <div className="auth-panel">
      <div className="section-heading compact">
        <p className="eyebrow">Try the MVP</p>
        <h2>{authMode === 'login' ? 'Login' : 'Create a customer account'}</h2>
      </div>
      <div className="segmented-control" aria-label="Authentication mode">
        <button
          className={authMode === 'login' ? 'is-active' : ''}
          type="button"
          onClick={() => onAuthModeChange('login')}
        >
          Login
        </button>
        <button
          className={authMode === 'signup' ? 'is-active' : ''}
          type="button"
          onClick={() => onAuthModeChange('signup')}
        >
          Sign up
        </button>
      </div>
      <form className="form-stack" onSubmit={submit}>
        {authMode === 'signup' && (
          <label>
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
            />
          </label>
        )}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="sam@example.com"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="demo"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="button primary full-width" type="submit">
          {authMode === 'login' ? 'Login' : 'Create account'}
        </button>
      </form>
      <div className="demo-logins">
        <p>Development login shortcuts</p>
        {demoUsers.map((user) => (
          <button
            key={user.id}
            type="button"
            onClick={() => {
              setEmail(user.email)
              setPassword(user.password)
              onLogin(user.id)
            }}
          >
            {user.name} · {user.role} · {user.email}
          </button>
        ))}
      </div>
    </div>
  )
}

function DashboardShell({
  data,
  setData,
  user,
  onSignOut,
}: {
  data: AppData
  setData: Dispatch<SetStateAction<AppData>>
  user: User
  onSignOut: () => void
}) {
  useEffect(() => {
    resetScroll()
  }, [user.id])

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <a className="brand" href="#overview">
          <span className="brand-mark">
            <PawPrint size={22} aria-hidden="true" />
          </span>
          <span>Waggulous</span>
        </a>
        <div className="session-pill">
          <UserRound size={16} />
          <span>
            {user.name} · {user.role}
          </span>
        </div>
        <button className="button ghost" type="button" onClick={onSignOut}>
          <LogOut size={16} />
          Sign out
        </button>
      </header>

      {user.role === 'customer' && (
        <CustomerDashboard data={data} setData={setData} user={user} />
      )}
      {user.role === 'owner' && (
        <OwnerDashboard data={data} setData={setData} user={user} />
      )}
      {user.role === 'walker' && (
        <WalkerDashboard data={data} setData={setData} user={user} />
      )}
    </main>
  )
}

function CustomerDashboard({
  data,
  setData,
  user,
}: {
  data: AppData
  setData: Dispatch<SetStateAction<AppData>>
  user: User
}) {
  const [tab, setTab] = useState<'overview' | 'pets' | 'book' | 'money' | 'chat'>(
    'overview',
  )
  const pets = data.pets.filter((pet) => pet.ownerId === user.id)
  const bookings = data.bookings
    .filter((booking) => booking.customerId === user.id)
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
  const transactions = data.transactions.filter(
    (transaction) => transaction.customerId === user.id,
  )
  const owed = calculateOutstanding(transactions)

  return (
    <div className="dashboard-grid">
      <DashboardNav
        active={tab}
        items={[
          ['overview', 'Overview'],
          ['pets', 'Pets'],
          ['book', 'Request'],
          ['money', 'Money'],
          ['chat', 'Messages'],
        ]}
        onChange={(value) => setTab(value as typeof tab)}
      />

      {tab === 'overview' && (
        <section className="workspace">
          <WorkspaceTitle
            eyebrow="Customer portal"
            title="Your pets, bookings, and balance."
          />
          <div className="metric-grid">
            <Metric icon={<PawPrint />} label="Named pets" value={pets.length} />
            <Metric
              icon={<WalletCards />}
              label="Currently owed"
              value={formatMoney(owed)}
            />
            <Metric
              icon={<CalendarDays />}
              label="Upcoming bookings"
              value={
                bookings.filter((booking) =>
                  ['requested', 'approved', 'in-progress'].includes(
                    booking.status,
                  ),
                ).length
              }
            />
          </div>
          <BookingList bookings={bookings} data={data} />
        </section>
      )}

      {tab === 'pets' && (
        <PetsPanel data={data} setData={setData} customer={user} pets={pets} />
      )}

      {tab === 'book' && (
        <BookingRequestPanel
          data={data}
          setData={setData}
          customer={user}
          pets={pets}
        />
      )}

      {tab === 'money' && (
        <MoneyPanel
          transactions={transactions}
          owed={owed}
          bookings={bookings}
          data={data}
        />
      )}

      {tab === 'chat' && (
        <MessagesPanel data={data} setData={setData} user={user} />
      )}
    </div>
  )
}

function OwnerDashboard({
  data,
  setData,
  user,
}: {
  data: AppData
  setData: Dispatch<SetStateAction<AppData>>
  user: User
}) {
  const [tab, setTab] = useState<
    'queue' | 'clients' | 'staff' | 'services' | 'chat'
  >('queue')
  const walkers = data.users.filter((candidate) => candidate.role === 'walker')

  return (
    <div className="dashboard-grid">
      <DashboardNav
        active={tab}
        items={[
          ['queue', 'Bookings'],
          ['clients', 'Clients'],
          ['staff', 'Staff'],
          ['services', 'Services'],
          ['chat', 'Messages'],
        ]}
        onChange={(value) => setTab(value as typeof tab)}
      />

      {tab === 'queue' && (
        <section className="workspace">
          <WorkspaceTitle
            eyebrow="Owner console"
            title="Approve bookings and assign walkers."
          />
          <div className="booking-stack">
            {data.bookings.map((booking) => {
              const service = data.services.find(
                (candidate) => candidate.id === booking.serviceId,
              )
              const customer = data.users.find(
                (candidate) => candidate.id === booking.customerId,
              )
              const selectedPets = data.pets.filter((pet) =>
                booking.petIds.includes(pet.id),
              )

              return (
                <article className="booking-row" key={booking.id}>
                  <div>
                    <span className={`status-badge ${booking.status}`}>
                      {statusLabel(booking.status)}
                    </span>
                    <h3>{service?.name ?? 'Unknown service'}</h3>
                    <p>
                      {formatDate(booking.date)} at {booking.time} ·{' '}
                      {formatMoney(booking.price)}
                    </p>
                    <p className="muted">
                      {customer?.name} ·{' '}
                      {selectedPets.map((pet) => pet.name).join(', ')}
                    </p>
                    {booking.notes && <p>{booking.notes}</p>}
                  </div>
                  <div className="row-actions">
                    <select
                      value={booking.walkerId ?? ''}
                      onChange={(event) =>
                        setData((current) => ({
                          ...current,
                          bookings: current.bookings.map((candidate) =>
                            candidate.id === booking.id
                              ? {
                                  ...candidate,
                                  walkerId: event.target.value || undefined,
                                }
                              : candidate,
                          ),
                        }))
                      }
                    >
                      <option value="">Assign walker</option>
                      {walkers.map((walker) => (
                        <option key={walker.id} value={walker.id}>
                          {walker.name}
                        </option>
                      ))}
                    </select>
                    <button
                      className="button primary"
                      type="button"
                      disabled={booking.status !== 'requested'}
                      onClick={() =>
                        approveBooking(booking, data, setData, user.id)
                      }
                    >
                      <Check size={16} />
                      Approve
                    </button>
                    <button
                      className="button danger"
                      type="button"
                      disabled={booking.status !== 'requested'}
                      onClick={() =>
                        setData((current) => ({
                          ...current,
                          bookings: current.bookings.map((candidate) =>
                            candidate.id === booking.id
                              ? { ...candidate, status: 'declined' }
                              : candidate,
                          ),
                        }))
                      }
                    >
                      <X size={16} />
                      Decline
                    </button>
                  </div>
                  <PaymentControls
                    booking={booking}
                    data={data}
                    setData={setData}
                    user={user}
                    canConfirm
                  />
                </article>
              )
            })}
          </div>
        </section>
      )}

      {tab === 'clients' && (
        <ClientBookingPanel data={data} setData={setData} user={user} />
      )}

      {tab === 'services' && <ServicesPanel data={data} setData={setData} />}

      {tab === 'staff' && <StaffAdminPanel data={data} setData={setData} />}

      {tab === 'chat' && (
        <MessagesPanel data={data} setData={setData} user={user} />
      )}
    </div>
  )
}

function WalkerDashboard({
  data,
  setData,
  user,
}: {
  data: AppData
  setData: Dispatch<SetStateAction<AppData>>
  user: User
}) {
  const [tab, setTab] = useState<'jobs' | 'clients' | 'profile' | 'holidays'>(
    'jobs',
  )
  const today = formatDateInputValue()
  const claimWindowEnd = addDaysInputValue(today, 7)
  const navItems: [typeof tab, string][] = user.canSelfAssign
    ? [
        ['jobs', 'Jobs'],
        ['clients', 'Clients'],
        ['profile', 'Profile'],
        ['holidays', 'Holidays'],
      ]
    : [
        ['jobs', 'Jobs'],
        ['profile', 'Profile'],
        ['holidays', 'Holidays'],
      ]
  const assignedBookings = data.bookings
    .filter(
      (booking) =>
        booking.walkerId === user.id &&
        ['requested', 'approved', 'in-progress', 'completed'].includes(
          booking.status,
        ),
    )
    .sort((a, b) => {
      const priority: Record<BookingStatus, number> = {
        'in-progress': 0,
        approved: 1,
        requested: 2,
        completed: 3,
        declined: 4,
      }
      return (
        priority[a.status] - priority[b.status] ||
        `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)
      )
    })
  const claimableBookings = data.bookings
    .filter(
      (booking) =>
        user.canSelfAssign &&
        !booking.walkerId &&
        ['requested', 'approved'].includes(booking.status) &&
        booking.date >= today &&
        booking.date <= claimWindowEnd,
    )
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))

  function claimBooking(bookingId: string) {
    const bookingToClaim = data.bookings.find(
      (booking) => booking.id === bookingId,
    )

    if (
      bookingToClaim?.status === 'requested' &&
      !window.confirm(
        'This appointment is awaiting approval. Clicking OK will claim and approve it.',
      )
    ) {
      return
    }

    setData((current) => {
      const currentBooking = current.bookings.find(
        (booking) => booking.id === bookingId,
      )

      if (!currentBooking || currentBooking.walkerId) return current

      const shouldApprove = currentBooking.status === 'requested'
      const approvalRecords = shouldApprove
        ? buildApprovalRecords(currentBooking, current, user.id)
        : null

      return {
        ...current,
        bookings: current.bookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                walkerId: user.id,
                status: shouldApprove ? 'approved' : booking.status,
              }
            : booking,
        ),
        transactions: approvalRecords
          ? [approvalRecords.transaction, ...current.transactions]
          : current.transactions,
        messages: approvalRecords
          ? [approvalRecords.message, ...current.messages]
          : current.messages,
      }
    })
  }

  return (
    <div className="dashboard-grid">
      <DashboardNav
        active={tab}
        items={navItems}
        onChange={(value) => setTab(value as typeof tab)}
      />
      {tab === 'jobs' && (
        <section className="workspace">
          <WorkspaceTitle
            eyebrow="Walker workflow"
            title="Log pickup and return for authorised pets."
          />
          <div className="booking-stack">
            {assignedBookings.length === 0 && (
              <div className="empty-state">
                <h3>No appointments assigned.</h3>
                <p>
                  Assigned walks and sitting visits will appear here when they
                  are allocated to you.
                </p>
              </div>
            )}
            {assignedBookings.map((booking) => {
              const service = data.services.find(
                (candidate) => candidate.id === booking.serviceId,
              )
              const customer = data.users.find(
                (candidate) => candidate.id === booking.customerId,
              )
              const pets = data.pets.filter((pet) =>
                booking.petIds.includes(pet.id),
              )

              return (
                <article className="booking-row" key={booking.id}>
                  <div>
                    <span className={`status-badge ${booking.status}`}>
                      {statusLabel(booking.status)}
                    </span>
                    <h3>{service?.name}</h3>
                    <p>
                      {formatDate(booking.date)} at {booking.time} ·{' '}
                      {customer?.name}
                    </p>
                    <div className="pet-mini-list">
                      {pets.map((pet) => (
                        <span key={pet.id}>
                          <PawPrint size={14} />
                          {pet.name}
                        </span>
                      ))}
                    </div>
                    <p className="muted">
                      Pickup: {formatDateTime(booking.pickedUpAt)} · Return:{' '}
                      {formatDateTime(booking.returnedAt)}
                    </p>
                  </div>
                  <div className="row-actions">
                    <button
                      className="button primary"
                      type="button"
                      disabled={!canPickUpBooking(booking)}
                      onClick={() =>
                        stampBooking(setData, booking.id, {
                          pickedUpAt: new Date().toISOString(),
                          status: 'in-progress',
                        })
                      }
                    >
                      <Clock size={16} />
                      Picked up
                    </button>
                    <button
                      className="button primary"
                      type="button"
                      disabled={
                        !booking.pickedUpAt || Boolean(booking.returnedAt)
                      }
                      onClick={() =>
                        stampBooking(setData, booking.id, {
                          returnedAt: new Date().toISOString(),
                          status: 'completed',
                        })
                      }
                    >
                      <Check size={16} />
                      Returned
                    </button>
                  </div>
                  <PaymentControls
                    booking={booking}
                    data={data}
                    setData={setData}
                    user={user}
                    canConfirm={false}
                  />
                </article>
              )
            })}
          </div>
          <section className="workspace nested-workspace">
            <WorkspaceTitle
              eyebrow="Available to claim"
              title="Unassigned appointments in the next 7 days."
            />
            {!user.canSelfAssign && (
              <div className="empty-state">
                <h3>Self-assignment is not enabled.</h3>
                <p>
                  An owner or admin can allow you to claim unassigned
                  appointments from your staff record.
                </p>
              </div>
            )}
            {user.canSelfAssign && claimableBookings.length === 0 && (
              <div className="empty-state">
                <h3>No unassigned appointments to claim.</h3>
                <p>
                  Approved unassigned bookings for the next 7 days will appear
                  here, along with new requests awaiting owner approval.
                </p>
              </div>
            )}
            {user.canSelfAssign && claimableBookings.length > 0 && (
              <div className="booking-stack">
                {claimableBookings.map((booking) => {
                  const service = data.services.find(
                    (candidate) => candidate.id === booking.serviceId,
                  )
                  const customer = data.users.find(
                    (candidate) => candidate.id === booking.customerId,
                  )
                  const pets = data.pets.filter((pet) =>
                    booking.petIds.includes(pet.id),
                  )

                  return (
                    <article className="booking-row" key={booking.id}>
                      <div>
                        <span className={`status-badge ${booking.status}`}>
                          {statusLabel(booking.status)}
                        </span>
                        <h3>{service?.name ?? 'Unknown service'}</h3>
                        <p>
                          {formatDate(booking.date)} at {booking.time} ·{' '}
                          {customer?.name}
                        </p>
                        <p className="muted">
                          Pets: {pets.map((pet) => pet.name).join(', ')}
                        </p>
                      </div>
                      <div className="row-actions">
                        <button
                          className="button primary"
                          type="button"
                          onClick={() => claimBooking(booking.id)}
                        >
                          <Check size={16} />
                          Claim appointment
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </section>
      )}

      {tab === 'clients' && user.canSelfAssign && (
        <ClientBookingPanel data={data} setData={setData} user={user} />
      )}

      {tab === 'profile' && (
        <StaffProfilePanel data={data} setData={setData} user={user} />
      )}

      {tab === 'holidays' && (
        <StaffHolidayPanel data={data} setData={setData} user={user} />
      )}
    </div>
  )
}

function ClientBookingPanel({
  data,
  setData,
  user,
}: {
  data: AppData
  setData: Dispatch<SetStateAction<AppData>>
  user: User
}) {
  const customers = data.users
    .filter((candidate) => candidate.role === 'customer')
    .sort((a, b) => a.name.localeCompare(b.name))
  const activeServices = data.services.filter((service) => service.active)
  const walkers = data.users.filter((candidate) => candidate.role === 'walker')
  const [panelTab, setPanelTab] = useState<'client' | 'appointment'>('client')
  const [selectedClientId, setSelectedClientId] = useState(
    customers[0]?.id ?? '',
  )
  const [clientDraft, setClientDraft] = useState({
    name: '',
    email: '',
    password: 'demo',
    phone: '',
    address: '',
  })
  const [clientPetDraft, setClientPetDraft] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    age: '',
    notes: '',
  })
  const [clientPets, setClientPets] = useState<
    {
      id: string
      name: string
      species: string
      breed: string
      age: string
      notes: string
    }[]
  >([])
  const [petDraft, setPetDraft] = useState({
    selectedPetIds: [] as string[],
    name: '',
    species: 'Dog',
    breed: '',
    age: '',
    notes: '',
  })
  const [bookingDraft, setBookingDraft] = useState({
    serviceId: activeServices[0]?.id ?? '',
    date: formatDateInputValue(),
    time: '',
    notes: '',
    walkerId: user.role === 'walker' ? user.id : '',
  })
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const selectedCustomer = customers.find(
    (customer) => customer.id === selectedClientId,
  )
  const existingPets = selectedClientId
    ? data.pets.filter((pet) => pet.ownerId === selectedClientId)
    : []
  const selectedService = activeServices.find(
    (service) => service.id === bookingDraft.serviceId,
  )
  const appointmentPetCount =
    petDraft.selectedPetIds.length + (petDraft.name.trim() ? 1 : 0)
  const appointmentPrice = selectedService
    ? calculateServicePrice(selectedService, appointmentPetCount)
    : 0

  function resetClientPetDraft() {
    setClientPetDraft({
      name: '',
      species: 'Dog',
      breed: '',
      age: '',
      notes: '',
    })
  }

  function addClientPet() {
    setError('')

    if (!clientPetDraft.name.trim()) {
      setError('Pet name is required before adding it to the client.')
      return
    }

    setClientPets((current) => [
      ...current,
      {
        id: makeId('draft-p'),
        name: clientPetDraft.name.trim(),
        species: clientPetDraft.species.trim() || 'Pet',
        breed: clientPetDraft.breed.trim(),
        age: clientPetDraft.age.trim(),
        notes: clientPetDraft.notes.trim(),
      },
    ])
    resetClientPetDraft()
  }

  function saveClient(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    if (
      !clientDraft.name.trim() ||
      !clientDraft.email.trim() ||
      !clientDraft.password.trim()
    ) {
      setError('Client name, email, and temporary password are required.')
      return
    }

    if (
      data.users.some(
        (candidate) =>
          candidate.email.toLowerCase() ===
          clientDraft.email.trim().toLowerCase(),
      )
    ) {
      setError('That client email is already registered.')
      return
    }

    const petsToSave = [
      ...clientPets,
      ...(clientPetDraft.name.trim()
        ? [
            {
              id: makeId('draft-p'),
              name: clientPetDraft.name.trim(),
              species: clientPetDraft.species.trim() || 'Pet',
              breed: clientPetDraft.breed.trim(),
              age: clientPetDraft.age.trim(),
              notes: clientPetDraft.notes.trim(),
            },
          ]
        : []),
    ]
    const newClient: User = {
      id: makeId('u'),
      name: clientDraft.name.trim(),
      email: clientDraft.email.trim(),
      password: clientDraft.password,
      role: 'customer',
      phone: clientDraft.phone.trim(),
      address: clientDraft.address.trim(),
    }
    const newPets: Pet[] = petsToSave.map((pet) => ({
      id: makeId('p'),
      ownerId: newClient.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      notes: pet.notes,
    }))

    setData((current) => ({
      ...current,
      users: [...current.users, newClient],
      pets: [...current.pets, ...newPets],
    }))
    setSelectedClientId(newClient.id)
    setPanelTab('appointment')
    setSuccessMessage(
      `${newClient.name} saved. Add an appointment next.${
        newPets.length ? ` ${newPets.length} pet saved.` : ''
      }`,
    )
    setClientDraft({
      name: '',
      email: '',
      password: 'demo',
      phone: '',
      address: '',
    })
    setClientPets([])
    resetClientPetDraft()
    setPetDraft({
      selectedPetIds: newPets.map((pet) => pet.id),
      name: '',
      species: 'Dog',
      breed: '',
      age: '',
      notes: '',
    })
  }

  function submitAppointment(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!selectedCustomer) {
      setError('Choose an existing client before adding an appointment.')
      return
    }

    if (!selectedService || !bookingDraft.date || !bookingDraft.time) {
      setError('Service, date, and time are required.')
      return
    }

    if (petDraft.selectedPetIds.length === 0 && !petDraft.name.trim()) {
      setError('Choose an existing pet or add a new pet for this booking.')
      return
    }

    const actorWalkerId =
      user.role === 'walker' ? user.id : bookingDraft.walkerId || undefined

    setData((current) => {
      const customer = current.users.find(
        (candidate) => candidate.id === selectedCustomer.id,
      ) as User
      const newPet: Pet | null = petDraft.name.trim()
        ? {
            id: makeId('p'),
            ownerId: customer.id,
            name: petDraft.name.trim(),
            species: petDraft.species.trim() || 'Pet',
            breed: petDraft.breed.trim(),
            age: petDraft.age.trim(),
            notes: petDraft.notes.trim(),
          }
        : null
      const petIds = [
        ...petDraft.selectedPetIds.filter((petId) =>
          current.pets.some(
            (pet) => pet.id === petId && pet.ownerId === customer.id,
          ),
        ),
        ...(newPet ? [newPet.id] : []),
      ]
      const booking: Booking = {
        id: makeId('b'),
        customerId: customer.id,
        petIds,
        serviceId: selectedService.id,
        date: bookingDraft.date,
        time: bookingDraft.time,
        notes: bookingDraft.notes.trim(),
        status: 'approved',
        price: calculateServicePrice(selectedService, petIds.length),
        walkerId: actorWalkerId,
      }
      const nextData: AppData = {
        ...current,
        pets: newPet ? [...current.pets, newPet] : current.pets,
      }
      const approvalRecords = buildApprovalRecords(booking, nextData, user.id)

      return {
        ...nextData,
        bookings: [booking, ...current.bookings],
        transactions: [approvalRecords.transaction, ...current.transactions],
        messages: [approvalRecords.message, ...current.messages],
      }
    })

    setSuccessMessage(
      `Approved ${selectedService.name} booking added for ${selectedCustomer.name}.`,
    )
    setPetDraft({
      selectedPetIds: [],
      name: '',
      species: 'Dog',
      breed: '',
      age: '',
      notes: '',
    })
    setBookingDraft({
      serviceId: activeServices[0]?.id ?? '',
      date: formatDateInputValue(),
      time: '',
      notes: '',
      walkerId: user.role === 'walker' ? user.id : '',
    })
  }

  return (
    <section className="workspace">
      <WorkspaceTitle
        eyebrow="Client bookings"
        title="Save clients, then add verbal appointments."
      />
      <div className="segmented-control" aria-label="Client booking step">
        <button
          className={panelTab === 'client' ? 'is-active' : ''}
          type="button"
          onClick={() => {
            setPanelTab('client')
            setError('')
            setSuccessMessage('')
          }}
        >
          New client
        </button>
        <button
          className={panelTab === 'appointment' ? 'is-active' : ''}
          type="button"
          onClick={() => {
            setPanelTab('appointment')
            setError('')
            setSuccessMessage('')
          }}
        >
          Appointment
        </button>
      </div>

      {panelTab === 'client' && (
        <form className="form-grid" onSubmit={saveClient}>
          <label>
            Client name
            <input
              value={clientDraft.name}
              onChange={(event) =>
                setClientDraft({ ...clientDraft, name: event.target.value })
              }
              placeholder="Client name"
            />
          </label>
          <label>
            Client email
            <input
              type="email"
              value={clientDraft.email}
              onChange={(event) =>
                setClientDraft({ ...clientDraft, email: event.target.value })
              }
              placeholder="client@example.com"
            />
          </label>
          <label>
            Client phone
            <input
              value={clientDraft.phone}
              onChange={(event) =>
                setClientDraft({ ...clientDraft, phone: event.target.value })
              }
              placeholder="07700 900000"
            />
          </label>
          <label>
            Temporary password
            <input
              value={clientDraft.password}
              onChange={(event) =>
                setClientDraft({
                  ...clientDraft,
                  password: event.target.value,
                })
              }
            />
          </label>
          <label className="wide">
            Client address
            <textarea
              value={clientDraft.address}
              onChange={(event) =>
                setClientDraft({
                  ...clientDraft,
                  address: event.target.value,
                })
              }
              placeholder="Home address"
            />
          </label>
          <section className="wide inline-section">
            <h3>Pets</h3>
            {clientPets.length > 0 && (
              <div className="pet-mini-list">
                {clientPets.map((pet) => (
                  <span key={pet.id}>
                    <PawPrint size={14} />
                    {pet.name}
                  </span>
                ))}
              </div>
            )}
            <div className="form-grid compact-grid">
              <label>
                Pet name
                <input
                  value={clientPetDraft.name}
                  onChange={(event) =>
                    setClientPetDraft({
                      ...clientPetDraft,
                      name: event.target.value,
                    })
                  }
                  placeholder="Mabel"
                />
              </label>
              <label>
                Species
                <input
                  value={clientPetDraft.species}
                  onChange={(event) =>
                    setClientPetDraft({
                      ...clientPetDraft,
                      species: event.target.value,
                    })
                  }
                  placeholder="Dog"
                />
              </label>
              <label>
                Breed
                <input
                  value={clientPetDraft.breed}
                  onChange={(event) =>
                    setClientPetDraft({
                      ...clientPetDraft,
                      breed: event.target.value,
                    })
                  }
                  placeholder="Cocker Spaniel"
                />
              </label>
              <label>
                Age
                <input
                  value={clientPetDraft.age}
                  onChange={(event) =>
                    setClientPetDraft({
                      ...clientPetDraft,
                      age: event.target.value,
                    })
                  }
                  placeholder="4"
                />
              </label>
              <label className="wide">
                Pet notes
                <textarea
                  value={clientPetDraft.notes}
                  onChange={(event) =>
                    setClientPetDraft({
                      ...clientPetDraft,
                      notes: event.target.value,
                    })
                  }
                  placeholder="Harness, feeding, temperament, medication, vet notes"
                />
              </label>
              <button className="button ghost" type="button" onClick={addClientPet}>
                <Plus size={16} />
                Add another pet
              </button>
            </div>
          </section>
          {error && <p className="form-error wide">{error}</p>}
          {successMessage && (
            <p className="form-success wide" role="status">
              {successMessage}
            </p>
          )}
          <button className="button primary" type="submit">
            <Plus size={16} />
            Save client
          </button>
        </form>
      )}

      {panelTab === 'appointment' && (
        <form className="form-grid" onSubmit={submitAppointment}>
          <label className="wide">
            Client
            <select
              value={selectedClientId}
              onChange={(event) => {
                setSelectedClientId(event.target.value)
                setPetDraft((current) => ({
                  ...current,
                  selectedPetIds: [],
                }))
              }}
            >
              <option value="">Choose client</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} · {customer.email}
                </option>
              ))}
            </select>
          </label>
          {existingPets.length > 0 && (
            <fieldset className="wide checkbox-set">
              <legend>Existing pets</legend>
              {existingPets.map((pet) => (
                <label key={pet.id}>
                  <input
                    type="checkbox"
                    checked={petDraft.selectedPetIds.includes(pet.id)}
                    onChange={(event) => {
                      const selectedPetIds = event.target.checked
                        ? [...petDraft.selectedPetIds, pet.id]
                        : petDraft.selectedPetIds.filter((id) => id !== pet.id)
                      setPetDraft({ ...petDraft, selectedPetIds })
                    }}
                  />
                  {pet.name}
                </label>
              ))}
            </fieldset>
          )}
          <section className="wide inline-section">
            <h3>Add a pet</h3>
            <div className="form-grid compact-grid">
              <label>
                Pet name
                <input
                  value={petDraft.name}
                  onChange={(event) =>
                    setPetDraft({ ...petDraft, name: event.target.value })
                  }
                  placeholder="Mabel"
                />
              </label>
              <label>
                Species
                <input
                  value={petDraft.species}
                  onChange={(event) =>
                    setPetDraft({ ...petDraft, species: event.target.value })
                  }
                  placeholder="Dog"
                />
              </label>
              <label>
                Breed
                <input
                  value={petDraft.breed}
                  onChange={(event) =>
                    setPetDraft({ ...petDraft, breed: event.target.value })
                  }
                  placeholder="Cocker Spaniel"
                />
              </label>
              <label>
                Age
                <input
                  value={petDraft.age}
                  onChange={(event) =>
                    setPetDraft({ ...petDraft, age: event.target.value })
                  }
                  placeholder="4"
                />
              </label>
              <label className="wide">
                Pet notes
                <textarea
                  value={petDraft.notes}
                  onChange={(event) =>
                    setPetDraft({ ...petDraft, notes: event.target.value })
                  }
                  placeholder="Harness, feeding, temperament, medication, vet notes"
                />
              </label>
            </div>
          </section>
          <label>
            Service
            <select
              value={bookingDraft.serviceId}
              onChange={(event) =>
                setBookingDraft({
                  ...bookingDraft,
                  serviceId: event.target.value,
                })
              }
            >
              {activeServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} · {formatMoney(service.price)}
                </option>
              ))}
            </select>
          </label>
          {user.role === 'owner' && (
            <label>
              Staff assignment
              <select
                value={bookingDraft.walkerId}
                onChange={(event) =>
                  setBookingDraft({
                    ...bookingDraft,
                    walkerId: event.target.value,
                  })
                }
              >
                <option value="">Unassigned</option>
                {walkers.map((walker) => (
                  <option key={walker.id} value={walker.id}>
                    {walker.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            Date
            <input
              type="date"
              value={bookingDraft.date}
              onChange={(event) =>
                setBookingDraft({ ...bookingDraft, date: event.target.value })
              }
            />
          </label>
          <label>
            Time
            <input
              type="time"
              value={bookingDraft.time}
              onChange={(event) =>
                setBookingDraft({ ...bookingDraft, time: event.target.value })
              }
            />
          </label>
          <label className="wide">
            Booking notes
            <textarea
              value={bookingDraft.notes}
              onChange={(event) =>
                setBookingDraft({ ...bookingDraft, notes: event.target.value })
              }
              placeholder="Verbal instructions, access notes, or anything staff should know"
            />
          </label>
          <div className="price-preview">
            <CreditCard size={18} />
            <span>
              Booking will be approved immediately at{' '}
              <strong>
                {selectedService
                  ? formatMoney(appointmentPrice)
                  : 'choose a service'}
              </strong>
            </span>
          </div>
          {error && <p className="form-error wide">{error}</p>}
          {successMessage && (
            <p className="form-success wide" role="status">
              {successMessage}
            </p>
          )}
          <button className="button primary" type="submit">
            <Plus size={16} />
            Add approved booking
          </button>
        </form>
      )}
    </section>
  )
}

function StaffAdminPanel({
  data,
  setData,
}: {
  data: AppData
  setData: Dispatch<SetStateAction<AppData>>
}) {
  const staff = data.users.filter((candidate) => candidate.role === 'walker')
  const [error, setError] = useState('')
  const [selectedStaffId, setSelectedStaffId] = useState(staff[0]?.id ?? '')
  const [draft, setDraft] = useState({
    name: '',
    email: '',
    password: 'demo',
    phone: '',
    address: '',
    avatar: '',
    canSelfAssign: false,
  })
  const selectedStaff =
    staff.find((member) => member.id === selectedStaffId) ?? staff[0]
  const selectedAppointments = selectedStaff
    ? data.bookings
        .filter((booking) => booking.walkerId === selectedStaff.id)
        .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    : []

  function addStaff(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!draft.name.trim() || !draft.email.trim() || !draft.password.trim()) {
      setError('Name, email, and password are required.')
      return
    }

    const emailExists = data.users.some(
      (candidate) =>
        candidate.email.toLowerCase() === draft.email.trim().toLowerCase(),
    )

    if (emailExists) {
      setError('That email is already registered.')
      return
    }

    const newStaff: User = {
      id: makeId('u'),
      name: draft.name.trim(),
      email: draft.email.trim(),
      password: draft.password,
      role: 'walker',
      phone: draft.phone.trim(),
      address: draft.address.trim(),
      avatar: draft.avatar || undefined,
      canSelfAssign: draft.canSelfAssign,
      holidays: [],
    }

    setData({
      ...data,
      users: [...data.users, newStaff],
    })
    setSelectedStaffId(newStaff.id)
    setDraft({
      name: '',
      email: '',
      password: 'demo',
      phone: '',
      address: '',
      avatar: '',
      canSelfAssign: false,
    })
  }

  function handleAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setDraft((current) => ({
        ...current,
        avatar: String(reader.result),
      }))
    }
    reader.readAsDataURL(file)
  }

  function reassignAppointment(bookingId: string, walkerId: string) {
    setData((current) => ({
      ...current,
      bookings: current.bookings.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              walkerId: walkerId || undefined,
            }
          : booking,
      ),
    }))
  }

  return (
    <section className="workspace">
      <WorkspaceTitle
        eyebrow="Staff registry"
        title="Add staff and keep contact details on file."
      />
      <form className="form-grid" onSubmit={addStaff}>
        <label>
          Name
          <input
            value={draft.name}
            onChange={(event) =>
              setDraft({ ...draft, name: event.target.value })
            }
            placeholder="Jordan Smith"
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={draft.email}
            onChange={(event) =>
              setDraft({ ...draft, email: event.target.value })
            }
            placeholder="jordan@waggulous.local"
          />
        </label>
        <label>
          Phone
          <input
            value={draft.phone}
            onChange={(event) =>
              setDraft({ ...draft, phone: event.target.value })
            }
            placeholder="07700 900333"
          />
        </label>
        <label>
          Temporary password
          <input
            value={draft.password}
            onChange={(event) =>
              setDraft({ ...draft, password: event.target.value })
            }
          />
        </label>
        <label className="wide">
          Address
          <textarea
            value={draft.address}
            onChange={(event) =>
              setDraft({ ...draft, address: event.target.value })
            }
            placeholder="Home address"
          />
        </label>
        <label className="wide">
          Avatar
          <input type="file" accept="image/*" onChange={handleAvatar} />
        </label>
        <label className="toggle-label wide">
          <input
            type="checkbox"
            checked={draft.canSelfAssign}
            onChange={(event) =>
              setDraft({ ...draft, canSelfAssign: event.target.checked })
            }
          />
          Can claim unassigned appointments
        </label>
        {error && <p className="form-error wide">{error}</p>}
        <button className="button primary" type="submit">
          <Plus size={16} />
          Add staff
        </button>
      </form>

      <div className="staff-list">
        {staff.map((member) => {
          const activeHolidays = (member.holidays ?? []).filter(
            (holiday) => holiday.status === 'active',
          )

          return (
            <article className="staff-row" key={member.id}>
              <StaffAvatar user={member} />
              <div>
                <h3>{member.name}</h3>
                <p>{member.email}</p>
                <p className="muted">
                  {member.phone || 'No phone'} ·{' '}
                  {member.address || 'No address'}
                </p>
                <p className="muted">
                  {activeHolidays.length
                    ? `${activeHolidays.length} active holiday/unavailable entry`
                    : 'No active holiday entries'}
                </p>
                <label className="toggle-label staff-toggle">
                  <input
                    type="checkbox"
                    checked={Boolean(member.canSelfAssign)}
                    onChange={(event) =>
                      setData((current) => ({
                        ...current,
                        users: current.users.map((candidate) =>
                          candidate.id === member.id
                            ? {
                                ...candidate,
                                canSelfAssign: event.target.checked,
                              }
                            : candidate,
                        ),
                      }))
                    }
                  />
                  Can claim unassigned appointments
                </label>
                <button
                  className="button ghost staff-toggle"
                  type="button"
                  onClick={() => setSelectedStaffId(member.id)}
                >
                  View profile and appointments
                </button>
              </div>
            </article>
          )
        })}
      </div>
      {selectedStaff && (
        <section className="workspace nested-workspace">
          <WorkspaceTitle
            eyebrow="Staff detail"
            title={`${selectedStaff.name} profile and appointments.`}
          />
          <div className="staff-detail-grid">
            <article className="profile-summary">
              <StaffAvatar user={selectedStaff} />
              <div>
                <h3>{selectedStaff.name}</h3>
                <p>{selectedStaff.email}</p>
                <p className="muted">{selectedStaff.phone || 'No phone'}</p>
                <p className="muted">
                  {selectedStaff.address || 'No address on file'}
                </p>
                <p className="muted">
                  {selectedStaff.canSelfAssign
                    ? 'Can claim unassigned appointments'
                    : 'Cannot claim unassigned appointments'}
                </p>
              </div>
            </article>
            <article className="profile-summary">
              <div>
                <h3>Availability</h3>
                {(selectedStaff.holidays ?? []).length === 0 ? (
                  <p className="muted">No holiday or unavailable entries.</p>
                ) : (
                  (selectedStaff.holidays ?? []).map((holiday) => (
                    <p className="muted" key={holiday.id}>
                      {formatAvailabilityWindow(holiday)} · {holiday.status}
                    </p>
                  ))
                )}
              </div>
            </article>
          </div>
          <WorkspaceTitle
            eyebrow="Appointments"
            title="Assigned appointments and reassignment."
          />
          {selectedAppointments.length === 0 ? (
            <div className="empty-state">
              <h3>No appointments assigned.</h3>
              <p>This staff member does not currently have assigned jobs.</p>
            </div>
          ) : (
            <div className="booking-stack">
              {selectedAppointments.map((booking) => {
                const service = data.services.find(
                  (candidate) => candidate.id === booking.serviceId,
                )
                const customer = data.users.find(
                  (candidate) => candidate.id === booking.customerId,
                )
                const pets = data.pets.filter((pet) =>
                  booking.petIds.includes(pet.id),
                )

                return (
                  <article className="booking-row" key={booking.id}>
                    <div>
                      <span className={`status-badge ${booking.status}`}>
                        {statusLabel(booking.status)}
                      </span>
                      <h3>{service?.name ?? 'Unknown service'}</h3>
                      <p>
                        {formatDate(booking.date)} at {booking.time} ·{' '}
                        {customer?.name}
                      </p>
                      <p className="muted">
                        Pets: {pets.map((pet) => pet.name).join(', ') || 'None'}
                      </p>
                    </div>
                    <div className="row-actions">
                      <label>
                        Reassign
                        <select
                          value={booking.walkerId ?? ''}
                          onChange={(event) =>
                            reassignAppointment(booking.id, event.target.value)
                          }
                        >
                          <option value="">Unassigned</option>
                          {staff.map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      )}
    </section>
  )
}

function StaffProfilePanel({
  data,
  setData,
  user,
}: {
  data: AppData
  setData: Dispatch<SetStateAction<AppData>>
  user: User
}) {
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [draft, setDraft] = useState({
    name: user.name,
    email: user.email,
    password: user.password,
    phone: user.phone ?? '',
    address: user.address ?? '',
    avatar: user.avatar ?? '',
  })

  function saveProfile(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSaved(false)

    if (!draft.name.trim() || !draft.email.trim() || !draft.password.trim()) {
      setError('Name, email, and password are required.')
      return
    }

    const emailExists = data.users.some(
      (candidate) =>
        candidate.id !== user.id &&
        candidate.email.toLowerCase() === draft.email.trim().toLowerCase(),
    )

    if (emailExists) {
      setError('That email is already registered.')
      return
    }

    setData({
      ...data,
      users: data.users.map((candidate) =>
        candidate.id === user.id
          ? {
              ...candidate,
              name: draft.name.trim(),
              email: draft.email.trim(),
              password: draft.password,
              phone: draft.phone.trim(),
              address: draft.address.trim(),
              avatar: draft.avatar || undefined,
            }
          : candidate,
      ),
    })
    setSaved(true)
  }

  function handleAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setDraft((current) => ({
        ...current,
        avatar: String(reader.result),
      }))
    }
    reader.readAsDataURL(file)
  }

  return (
    <section className="workspace">
      <WorkspaceTitle
        eyebrow="Staff profile"
        title="Maintain your contact details and avatar."
      />
      <div className="profile-summary">
        <StaffAvatar user={{ ...user, avatar: draft.avatar, name: draft.name }} />
        <div>
          <h3>{draft.name || 'Staff member'}</h3>
          <p>{draft.email}</p>
          <p className="muted">{draft.phone || 'No phone on file'}</p>
        </div>
      </div>
      <form className="form-grid" onSubmit={saveProfile}>
        <label>
          Name
          <input
            value={draft.name}
            onChange={(event) =>
              setDraft({ ...draft, name: event.target.value })
            }
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={draft.email}
            onChange={(event) =>
              setDraft({ ...draft, email: event.target.value })
            }
          />
        </label>
        <label>
          Phone
          <input
            value={draft.phone}
            onChange={(event) =>
              setDraft({ ...draft, phone: event.target.value })
            }
          />
        </label>
        <label>
          Password
          <input
            value={draft.password}
            onChange={(event) =>
              setDraft({ ...draft, password: event.target.value })
            }
          />
        </label>
        <label className="wide">
          Address
          <textarea
            value={draft.address}
            onChange={(event) =>
              setDraft({ ...draft, address: event.target.value })
            }
          />
        </label>
        <label className="wide">
          Avatar
          <input type="file" accept="image/*" onChange={handleAvatar} />
        </label>
        {error && <p className="form-error wide">{error}</p>}
        {saved && <p className="form-success wide">Profile saved.</p>}
        <button className="button primary" type="submit">
          Save profile
        </button>
      </form>
    </section>
  )
}

function StaffHolidayPanel({
  data,
  setData,
  user,
}: {
  data: AppData
  setData: Dispatch<SetStateAction<AppData>>
  user: User
}) {
  const holidays = user.holidays ?? []
  const today = formatDateInputValue()
  const [error, setError] = useState('')
  const [draft, setDraft] = useState({
    startDate: '',
    endDate: '',
    allDay: true,
    startTime: '',
    endTime: '',
    reason: '',
  })
  const endDateMinimum =
    draft.startDate && draft.startDate > today ? draft.startDate : today

  function handleStartDateChange(startDate: string) {
    setDraft((current) => ({
      ...current,
      startDate,
      endDate:
        current.endDate && current.endDate >= startDate && current.endDate >= today
          ? current.endDate
          : startDate >= today
            ? startDate
            : today,
      startTime: current.allDay ? '' : getDefaultStartTimeForDate(startDate),
    }))
  }

  function handleAllDayChange(allDay: boolean) {
    setDraft((current) => ({
      ...current,
      allDay,
      startTime: allDay
        ? ''
        : current.startTime || getDefaultStartTimeForDate(current.startDate),
      endTime: allDay ? '' : current.endTime || '23:59',
    }))
  }

  function addHoliday(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!draft.startDate || !draft.endDate) {
      setError('Start and end dates are required.')
      return
    }

    if (draft.endDate < today) {
      setError('End date cannot be in the past.')
      return
    }

    if (draft.endDate < draft.startDate) {
      setError('End date must be on or after the start date.')
      return
    }

    if (!draft.allDay) {
      if (!draft.startTime || !draft.endTime) {
        setError('Start and end times are required for a time range.')
        return
      }

      if (draft.startDate === draft.endDate && draft.endTime <= draft.startTime) {
        setError('End time must be after the start time.')
        return
      }
    }

    const holiday: StaffHoliday = {
      id: makeId('h'),
      startDate: draft.startDate,
      endDate: draft.endDate,
      allDay: draft.allDay,
      startTime: draft.allDay ? undefined : draft.startTime,
      endTime: draft.allDay ? undefined : draft.endTime,
      reason: draft.reason.trim(),
      status: 'active',
    }

    setData({
      ...data,
      users: data.users.map((candidate) =>
        candidate.id === user.id
          ? {
              ...candidate,
              holidays: [holiday, ...(candidate.holidays ?? [])],
            }
          : candidate,
      ),
    })
    setDraft({
      startDate: '',
      endDate: '',
      allDay: true,
      startTime: '',
      endTime: '',
      reason: '',
    })
  }

  function cancelHoliday(holidayId: string) {
    setData({
      ...data,
      users: data.users.map((candidate) =>
        candidate.id === user.id
          ? {
              ...candidate,
              holidays: (candidate.holidays ?? []).map((holiday) =>
                holiday.id === holidayId
                  ? { ...holiday, status: 'cancelled' }
                  : holiday,
              ),
            }
          : candidate,
      ),
    })
  }

  return (
    <section className="workspace">
      <WorkspaceTitle
        eyebrow="Availability"
        title="Add holidays or unavailable dates."
      />
      <form className="form-grid" onSubmit={addHoliday}>
        <label>
          Start date
          <input
            type="date"
            value={draft.startDate}
            onChange={(event) => handleStartDateChange(event.target.value)}
          />
        </label>
        <label>
          End date
          <input
            type="date"
            min={endDateMinimum}
            value={draft.endDate}
            onChange={(event) =>
              setDraft({ ...draft, endDate: event.target.value })
            }
          />
        </label>
        <label className="toggle-label wide">
          <input
            type="checkbox"
            checked={draft.allDay}
            onChange={(event) => handleAllDayChange(event.target.checked)}
          />
          All day
        </label>
        {!draft.allDay && (
          <>
            <label>
              Start time for start date
              <input
                type="time"
                value={draft.startTime}
                onChange={(event) =>
                  setDraft({ ...draft, startTime: event.target.value })
                }
              />
            </label>
            <label>
              End time for end date
              <input
                type="time"
                value={draft.endTime}
                onChange={(event) =>
                  setDraft({ ...draft, endTime: event.target.value })
                }
              />
            </label>
          </>
        )}
        <label className="wide">
          Reason
          <textarea
            value={draft.reason}
            onChange={(event) =>
              setDraft({ ...draft, reason: event.target.value })
            }
            placeholder="Holiday, appointment, or unavailable period"
          />
        </label>
        {error && <p className="form-error wide">{error}</p>}
        <button className="button primary" type="submit">
          <Plus size={16} />
          Add unavailable dates
        </button>
      </form>

      <div className="booking-stack">
        {holidays.map((holiday) => (
          <article className="booking-row" key={holiday.id}>
            <div>
              <span className={`status-badge ${holiday.status}`}>
                {holiday.status}
              </span>
              <h3>{formatAvailabilityWindow(holiday)}</h3>
              <p className="muted">{holiday.reason || 'No reason added.'}</p>
            </div>
            <div className="row-actions">
              <button
                className="button danger"
                type="button"
                disabled={holiday.status === 'cancelled'}
                onClick={() => cancelHoliday(holiday.id)}
              >
                <X size={16} />
                Cancel entry
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function StaffAvatar({ user }: { user: Pick<User, 'avatar' | 'name'> }) {
  return (
    <div className="staff-avatar" aria-hidden="true">
      {user.avatar ? (
        <img src={user.avatar} alt="" />
      ) : (
        <span>{user.name.trim().slice(0, 1).toUpperCase() || 'S'}</span>
      )}
    </div>
  )
}

function DashboardNav({
  active,
  items,
  onChange,
}: {
  active: string
  items: [string, string][]
  onChange: (value: string) => void
}) {
  return (
    <nav className="dashboard-nav">
      {items.map(([id, label]) => (
        <button
          className={active === id ? 'is-active' : ''}
          key={id}
          type="button"
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </nav>
  )
}

function WorkspaceTitle({
  eyebrow,
  title,
}: {
  eyebrow: string
  title: string
}) {
  return (
    <div className="section-heading compact">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
    </div>
  )
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string | number
}) {
  return (
    <article className="metric-card">
      <span className="icon-chip">{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </article>
  )
}

function PetsPanel({
  data,
  setData,
  customer,
  pets,
}: {
  data: AppData
  setData: Dispatch<SetStateAction<AppData>>
  customer: User
  pets: Pet[]
}) {
  const [draft, setDraft] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    age: '',
    notes: '',
    photo: '',
  })

  function addPet(event: FormEvent) {
    event.preventDefault()
    if (!draft.name.trim()) return

    setData({
      ...data,
      pets: [
        ...data.pets,
        {
          id: makeId('p'),
          ownerId: customer.id,
          name: draft.name.trim(),
          species: draft.species.trim() || 'Pet',
          breed: draft.breed.trim(),
          age: draft.age.trim(),
          notes: draft.notes.trim(),
          photo: draft.photo || undefined,
        },
      ],
    })
    setDraft({
      name: '',
      species: 'Dog',
      breed: '',
      age: '',
      notes: '',
      photo: '',
    })
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setDraft((current) => ({
        ...current,
        photo: String(reader.result),
      }))
    }
    reader.readAsDataURL(file)
  }

  return (
    <section className="workspace">
      <WorkspaceTitle eyebrow="Pet profiles" title="Add named pets and details." />
      <form className="form-grid" onSubmit={addPet}>
        <label>
          Name
          <input
            value={draft.name}
            onChange={(event) =>
              setDraft({ ...draft, name: event.target.value })
            }
            placeholder="Mabel"
          />
        </label>
        <label>
          Species
          <input
            value={draft.species}
            onChange={(event) =>
              setDraft({ ...draft, species: event.target.value })
            }
            placeholder="Dog"
          />
        </label>
        <label>
          Breed
          <input
            value={draft.breed}
            onChange={(event) =>
              setDraft({ ...draft, breed: event.target.value })
            }
            placeholder="Cocker Spaniel"
          />
        </label>
        <label>
          Age
          <input
            value={draft.age}
            onChange={(event) =>
              setDraft({ ...draft, age: event.target.value })
            }
            placeholder="4"
          />
        </label>
        <label className="wide">
          Care notes
          <textarea
            value={draft.notes}
            onChange={(event) =>
              setDraft({ ...draft, notes: event.target.value })
            }
            placeholder="Harness, feeding, temperament, medication, vet notes"
          />
        </label>
        <label className="wide">
          Picture
          <input type="file" accept="image/*" onChange={handlePhoto} />
        </label>
        <button className="button primary" type="submit">
          <Plus size={16} />
          Add pet
        </button>
      </form>

      <div className="pet-grid">
        {pets.map((pet) => (
          <article className="pet-card" key={pet.id}>
            <div className="pet-photo">
              {pet.photo ? (
                <img src={pet.photo} alt={pet.name} />
              ) : (
                <PawPrint size={32} />
              )}
            </div>
            <div>
              <h3>{pet.name}</h3>
              <p>
                {pet.species} · {pet.breed || 'Breed not set'} · Age{' '}
                {pet.age || 'not set'}
              </p>
              <p className="muted">{pet.notes || 'No care notes yet.'}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function BookingRequestPanel({
  data,
  setData,
  customer,
  pets,
}: {
  data: AppData
  setData: Dispatch<SetStateAction<AppData>>
  customer: User
  pets: Pet[]
}) {
  const activeServices = data.services.filter((service) => service.active)
  const today = formatDateInputValue()
  const [draft, setDraft] = useState({
    serviceId: activeServices[0]?.id ?? '',
    petIds: [] as string[],
    date: '',
    time: '',
    notes: '',
  })
  const [successMessage, setSuccessMessage] = useState('')
  const selectedService = data.services.find(
    (service) => service.id === draft.serviceId,
  )
  const requestPrice = selectedService
    ? calculateServicePrice(selectedService, draft.petIds.length)
    : 0
  const customerBookings = data.bookings
    .filter((booking) => booking.customerId === customer.id)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  const existingRequests = customerBookings.filter(
    (booking) => booking.status === 'requested',
  )
  const assignedFutureAppointments = customerBookings.filter(
    (booking) =>
      Boolean(booking.walkerId) &&
      ['approved', 'in-progress'].includes(booking.status) &&
      booking.date >= today,
  )

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!selectedService || draft.petIds.length === 0 || !draft.date || !draft.time) {
      return
    }

    const booking: Booking = {
      id: makeId('b'),
      customerId: customer.id,
      petIds: draft.petIds,
      serviceId: selectedService.id,
      date: draft.date,
      time: draft.time,
      notes: draft.notes.trim(),
      status: 'requested',
      price: calculateServicePrice(selectedService, draft.petIds.length),
    }

    setData({
      ...data,
      bookings: [booking, ...data.bookings],
      messages: [
        {
          id: makeId('m'),
          bookingId: booking.id,
          senderId: customer.id,
          recipientId: 'u-owner',
          body: `New ${selectedService.name} request for ${formatDate(
            booking.date,
          )} at ${booking.time}.`,
          createdAt: new Date().toISOString(),
        },
        ...data.messages,
      ],
    })
    setSuccessMessage(
      `${selectedService.name} request sent for ${formatDate(
        booking.date,
      )} at ${booking.time}.`,
    )
    setDraft({
      serviceId: activeServices[0]?.id ?? '',
      petIds: [],
      date: '',
      time: '',
      notes: '',
    })
  }

  return (
    <section className="workspace">
      <WorkspaceTitle
        eyebrow="Service request"
        title="Choose pets, care type, and time."
      />
      <form className="form-grid" onSubmit={submit}>
        <label className="wide">
          Service
          <select
            value={draft.serviceId}
            onChange={(event) =>
              setDraft({ ...draft, serviceId: event.target.value })
            }
          >
            {activeServices.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} · {formatMoney(service.price)}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="wide checkbox-set">
          <legend>Pets</legend>
          {pets.map((pet) => (
            <label key={pet.id}>
              <input
                type="checkbox"
                checked={draft.petIds.includes(pet.id)}
                onChange={(event) => {
                  const petIds = event.target.checked
                    ? [...draft.petIds, pet.id]
                    : draft.petIds.filter((id) => id !== pet.id)
                  setDraft({ ...draft, petIds })
                }}
              />
              {pet.name}
            </label>
          ))}
        </fieldset>
        <label>
          Date
          <input
            type="date"
            value={draft.date}
            onChange={(event) =>
              setDraft({ ...draft, date: event.target.value })
            }
          />
        </label>
        <label>
          Time
          <input
            type="time"
            value={draft.time}
            onChange={(event) =>
              setDraft({ ...draft, time: event.target.value })
            }
          />
        </label>
        <label className="wide">
          Notes
          <textarea
            value={draft.notes}
            onChange={(event) =>
              setDraft({ ...draft, notes: event.target.value })
            }
            placeholder="Access instructions, leads, food, or anything the walker should know"
          />
        </label>
        <div className="price-preview">
          <CreditCard size={18} />
          <span>
            Price shown before approval:{' '}
            <strong>
              {selectedService ? formatMoney(requestPrice) : 'Choose a service'}
            </strong>
          </span>
        </div>
        <button className="button primary" type="submit">
          Request service
        </button>
      </form>
      {successMessage && (
        <p className="form-success" role="status">
          {successMessage}
        </p>
      )}
      <section className="workspace nested-workspace">
        <WorkspaceTitle
          eyebrow="Your requests"
          title="Existing requests awaiting approval."
        />
        {existingRequests.length === 0 ? (
          <div className="empty-state">
            <h3>No open requests.</h3>
            <p>New service requests you submit will appear here.</p>
          </div>
        ) : (
          <BookingList bookings={existingRequests} data={data} />
        )}
      </section>
      <section className="workspace nested-workspace">
        <WorkspaceTitle
          eyebrow="Assigned appointments"
          title="Future appointments with a staff member assigned."
        />
        {assignedFutureAppointments.length === 0 ? (
          <div className="empty-state">
            <h3>No assigned future appointments.</h3>
            <p>
              Approved appointments will appear here once a staff member is
              assigned.
            </p>
          </div>
        ) : (
          <BookingList bookings={assignedFutureAppointments} data={data} />
        )}
      </section>
    </section>
  )
}

function MoneyPanel({
  transactions,
  owed,
  bookings,
  data,
}: {
  transactions: Transaction[]
  owed: number
  bookings: Booking[]
  data: AppData
}) {
  return (
    <section className="workspace">
      <WorkspaceTitle
        eyebrow="Money"
        title="Owed monies and transaction history."
      />
      <div className="payment-note">
        <WalletCards size={20} />
        <p>
          Payments are handled by an outsourced service. Waggulous only shows
          booking charges, owed totals, and historical payment records.
        </p>
      </div>
      <div className="metric-grid">
        <Metric
          icon={<WalletCards />}
          label="Outstanding"
          value={formatMoney(owed)}
        />
        <Metric
          icon={<CalendarDays />}
          label="Historical records"
          value={transactions.length}
        />
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{formatDate(transaction.date)}</td>
                <td>{transaction.description}</td>
                <td>
                  <span className={`status-badge ${transaction.status}`}>
                    {transaction.status}
                  </span>
                </td>
                <td>{formatMoney(transaction.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BookingList bookings={bookings} data={data} />
    </section>
  )
}

function ServicesPanel({
  data,
  setData,
}: {
  data: AppData
  setData: Dispatch<SetStateAction<AppData>>
}) {
  const [draft, setDraft] = useState({
    name: '',
    type: 'walking' as ServiceType,
    duration: '',
    price: '',
    description: '',
    multiPetMode: 'none' as MultiPetPricingMode,
    multiPetAmount: '',
  })
  const [serviceAmountDrafts, setServiceAmountDrafts] = useState<
    Record<string, string>
  >({})

  function addService(event: FormEvent) {
    event.preventDefault()
    const price = Number(draft.price)
    const multiPetAmount = Number(draft.multiPetAmount)
    if (!draft.name.trim() || Number.isNaN(price)) return

    setData({
      ...data,
      services: [
        ...data.services,
        {
          id: makeId('s'),
          name: draft.name.trim(),
          type: draft.type,
          duration: draft.duration.trim(),
          price,
          description: draft.description.trim(),
          active: true,
          multiPetPricing: buildMultiPetPricing(
            draft.multiPetMode,
            Number.isNaN(multiPetAmount) ? 0 : multiPetAmount,
          ),
        },
      ],
    })
    setDraft({
      name: '',
      type: 'walking',
      duration: '',
      price: '',
      description: '',
      multiPetMode: 'none',
      multiPetAmount: '',
    })
  }

  function updateServiceRuleAmount(service: Service, value: string) {
    setServiceAmountDrafts((current) => ({
      ...current,
      [service.id]: value,
    }))

    if (value === '') {
      updateService(setData, service.id, {
        multiPetPricing: buildMultiPetPricing(
          service.multiPetPricing?.mode ?? 'none',
          0,
        ),
      })
      return
    }

    const amount = Number(value)
    if (Number.isNaN(amount)) return

    updateService(setData, service.id, {
      multiPetPricing: buildMultiPetPricing(
        service.multiPetPricing?.mode ?? 'none',
        amount,
      ),
    })
  }

  function finishServiceRuleAmountEdit(serviceId: string) {
    setServiceAmountDrafts((current) => {
      const next = { ...current }
      delete next[serviceId]
      return next
    })
  }

  return (
    <section className="workspace">
      <WorkspaceTitle
        eyebrow="Services and prices"
        title="Maintain what customers can request."
      />
      <div className="service-admin-list">
        {data.services.map((service) => (
          <article className="service-admin-row" key={service.id}>
            <div>
              <h3>{service.name}</h3>
              <p>
                {service.type} · {service.duration}
              </p>
              <p className="muted">{service.description}</p>
              <p className="muted">{multiPetPricingLabel(service)}</p>
            </div>
            <div className="service-admin-controls">
              <label>
                Price
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={service.price}
                  onChange={(event) =>
                    updateService(setData, service.id, {
                      price: Number(event.target.value),
                    })
                  }
                />
              </label>
              <label>
                Multi-pet pricing
                <select
                  value={service.multiPetPricing?.mode ?? 'none'}
                  onChange={(event) =>
                    updateService(setData, service.id, {
                      multiPetPricing: buildMultiPetPricing(
                        event.target.value as MultiPetPricingMode,
                        service.multiPetPricing?.amount ?? 0,
                      ),
                    })
                  }
                >
                  <option value="none">No adjustment</option>
                  <option value="fixed-discount">Fixed discount</option>
                  <option value="percent-discount">Percentage discount</option>
                  <option value="additional-pet-price">
                    First plus additional pets
                  </option>
                </select>
              </label>
              <label>
                Rule amount
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={
                    serviceAmountDrafts[service.id] ??
                    String(service.multiPetPricing?.amount ?? 0)
                  }
                  onChange={(event) =>
                    updateServiceRuleAmount(service, event.target.value)
                  }
                  onBlur={() => finishServiceRuleAmountEdit(service.id)}
                />
              </label>
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={service.active}
                  onChange={(event) =>
                    updateService(setData, service.id, {
                      active: event.target.checked,
                    })
                  }
                />
                Active
              </label>
            </div>
          </article>
        ))}
      </div>
      <form className="form-grid" onSubmit={addService}>
        <label>
          Name
          <input
            value={draft.name}
            onChange={(event) =>
              setDraft({ ...draft, name: event.target.value })
            }
            placeholder="Weekend walk"
          />
        </label>
        <label>
          Type
          <select
            value={draft.type}
            onChange={(event) =>
              setDraft({ ...draft, type: event.target.value as ServiceType })
            }
          >
            <option value="walking">Walking</option>
            <option value="sitting">Pet sitting</option>
          </select>
        </label>
        <label>
          Duration
          <input
            value={draft.duration}
            onChange={(event) =>
              setDraft({ ...draft, duration: event.target.value })
            }
            placeholder="45 min"
          />
        </label>
        <label>
          Price
          <input
            type="number"
            min="0"
            step="0.5"
            value={draft.price}
            onChange={(event) =>
              setDraft({ ...draft, price: event.target.value })
            }
            placeholder="18"
          />
        </label>
        <label className="wide">
          Description
          <textarea
            value={draft.description}
            onChange={(event) =>
              setDraft({ ...draft, description: event.target.value })
            }
            placeholder="What this service includes"
          />
        </label>
        <label>
          Multi-pet pricing
          <select
            value={draft.multiPetMode}
            onChange={(event) =>
              setDraft({
                ...draft,
                multiPetMode: event.target.value as MultiPetPricingMode,
              })
            }
          >
            <option value="none">No adjustment</option>
            <option value="fixed-discount">Fixed discount</option>
            <option value="percent-discount">Percentage discount</option>
            <option value="additional-pet-price">
              First plus additional pets
            </option>
          </select>
        </label>
        <label>
          Rule amount
          <input
            type="number"
            min="0"
            step="0.5"
            value={draft.multiPetAmount}
            onChange={(event) =>
              setDraft({ ...draft, multiPetAmount: event.target.value })
            }
            placeholder="5"
          />
        </label>
        <button className="button primary" type="submit">
          <Plus size={16} />
          Add service
        </button>
      </form>
    </section>
  )
}

function MessagesPanel({
  data,
  setData,
  user,
}: {
  data: AppData
  setData: Dispatch<SetStateAction<AppData>>
  user: User
}) {
  const recipients = data.users.filter((candidate) => candidate.id !== user.id)
  const [recipientId, setRecipientId] = useState(recipients[0]?.id ?? '')
  const [bookingId, setBookingId] = useState('')
  const [body, setBody] = useState('')
  const visibleMessages = data.messages
    .filter(
      (message) =>
        message.senderId === user.id || message.recipientId === user.id,
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  function sendMessage(event: FormEvent) {
    event.preventDefault()
    if (!recipientId || !body.trim()) return

    setData({
      ...data,
      messages: [
        {
          id: makeId('m'),
          senderId: user.id,
          recipientId,
          bookingId: bookingId || undefined,
          body: body.trim(),
          createdAt: new Date().toISOString(),
        },
        ...data.messages,
      ],
    })
    setBody('')
  }

  return (
    <section className="workspace">
      <WorkspaceTitle
        eyebrow="Messages"
        title="Coordinate around bookings without exposing payment accounts."
      />
      <form className="form-grid" onSubmit={sendMessage}>
        <label>
          To
          <select
            value={recipientId}
            onChange={(event) => setRecipientId(event.target.value)}
          >
            {recipients.map((recipient) => (
              <option key={recipient.id} value={recipient.id}>
                {recipient.name} · {recipient.role}
              </option>
            ))}
          </select>
        </label>
        <label>
          Booking
          <select
            value={bookingId}
            onChange={(event) => setBookingId(event.target.value)}
          >
            <option value="">General message</option>
            {data.bookings.map((booking) => (
              <option key={booking.id} value={booking.id}>
                {formatDate(booking.date)} {booking.time}
              </option>
            ))}
          </select>
        </label>
        <label className="wide">
          Message
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write an update or ask a question"
          />
        </label>
        <button className="button primary" type="submit">
          <MessageCircle size={16} />
          Send
        </button>
      </form>

      <div className="message-list">
        {visibleMessages.map((message) => {
          const sender = data.users.find((candidate) => candidate.id === message.senderId)
          const recipient = data.users.find(
            (candidate) => candidate.id === message.recipientId,
          )
          const booking = data.bookings.find(
            (candidate) => candidate.id === message.bookingId,
          )

          return (
            <article className="message-row" key={message.id}>
              <div>
                <h3>
                  {sender?.name} to {recipient?.name}
                </h3>
                <p>{message.body}</p>
                {booking && (
                  <p className="muted">
                    Booking: {formatDate(booking.date)} at {booking.time}
                  </p>
                )}
              </div>
              <time>{formatDateTime(message.createdAt)}</time>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function BookingList({
  bookings,
  data,
}: {
  bookings: Booking[]
  data: AppData
}) {
  return (
    <div className="booking-stack">
      {bookings.map((booking) => {
        const service = data.services.find(
          (candidate) => candidate.id === booking.serviceId,
        )
        const pets = data.pets.filter((pet) => booking.petIds.includes(pet.id))
        const walker = data.users.find(
          (candidate) => candidate.id === booking.walkerId,
        )

        return (
          <article className="booking-row" key={booking.id}>
            <div>
              <span className={`status-badge ${booking.status}`}>
                {statusLabel(booking.status)}
              </span>
              <h3>{service?.name ?? 'Service unavailable'}</h3>
              <p>
                {formatDate(booking.date)} at {booking.time} ·{' '}
                {formatMoney(booking.price)}
              </p>
              <p className="muted">
                Pets: {pets.map((pet) => pet.name).join(', ') || 'None'} ·
                Walker: {walker?.name ?? 'Awaiting assignment'}
              </p>
              {(booking.pickedUpAt || booking.returnedAt) && (
                <p className="muted">
                  Pickup: {formatDateTime(booking.pickedUpAt)} · Return:{' '}
                  {formatDateTime(booking.returnedAt)}
                </p>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}

function PaymentControls({
  booking,
  data,
  setData,
  user,
  canConfirm,
}: {
  booking: Booking
  data: AppData
  setData: Dispatch<SetStateAction<AppData>>
  user: User
  canConfirm: boolean
}) {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<Transaction['method']>('cash')
  const [error, setError] = useState('')
  const outstanding = calculateBookingOutstanding(data, booking)
  const pendingPayments = data.transactions.filter(
    (transaction) =>
      transaction.bookingId === booking.id &&
      transaction.status === 'payment-pending',
  )
  const canRecord = ['approved', 'in-progress', 'completed'].includes(
    booking.status,
  )

  function submit(event: FormEvent) {
    event.preventDefault()
    setError('')

    const paymentAmount = Number(amount)

    if (!canRecord || Number.isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Enter a valid payment amount.')
      return
    }

    if (paymentAmount > outstanding) {
      setError(`Amount cannot exceed outstanding ${formatMoney(outstanding)}.`)
      return
    }

    const isOwner = user.role === 'owner'
    const payment: Transaction = {
      id: makeId('t'),
      bookingId: booking.id,
      customerId: booking.customerId,
      date: formatDateInputValue(),
      description: `${isOwner ? 'Confirmed' : 'Pending'} ${method} payment`,
      amount: paymentAmount,
      status: isOwner ? 'paid' : 'payment-pending',
      type: 'payment',
      method,
      recordedById: user.id,
      confirmedById: isOwner ? user.id : undefined,
      createdAt: new Date().toISOString(),
    }

    setData((current) => ({
      ...current,
      transactions: [payment, ...current.transactions],
    }))
    setAmount('')
  }

  function confirmPayment(transactionId: string) {
    setData((current) => ({
      ...current,
      transactions: current.transactions.map((transaction) =>
        transaction.id === transactionId
          ? {
              ...transaction,
              status: 'paid',
              confirmedById: user.id,
              description: `Confirmed ${transaction.method ?? 'other'} payment`,
            }
          : transaction,
      ),
    }))
  }

  if (!canRecord && pendingPayments.length === 0) return null

  return (
    <div className="payment-controls">
      <p className="muted">Outstanding: {formatMoney(outstanding)}</p>
      {canRecord && outstanding > 0 && (
        <form className="row-actions" onSubmit={submit}>
          <label>
            Payment received
            <input
              type="number"
              min="0"
              max={outstanding}
              step="0.5"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder={formatMoney(outstanding)}
            />
          </label>
          <label>
            Method
            <select
              value={method}
              onChange={(event) =>
                setMethod(event.target.value as Transaction['method'])
              }
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank transfer</option>
              <option value="card">Card</option>
              <option value="other">Other</option>
            </select>
          </label>
          <button className="button primary" type="submit">
            <CreditCard size={16} />
            {user.role === 'owner' ? 'Record payment' : 'Mark received'}
          </button>
          {error && <p className="form-error wide">{error}</p>}
        </form>
      )}
      {pendingPayments.length > 0 && (
        <div className="payment-pending-list">
          {pendingPayments.map((payment) => (
            <div className="pending-payment-row" key={payment.id}>
              <span>
                Pending {payment.method ?? 'other'} payment ·{' '}
                {formatMoney(payment.amount)}
              </span>
              {canConfirm && (
                <button
                  className="button primary"
                  type="button"
                  onClick={() => confirmPayment(payment.id)}
                >
                  <Check size={16} />
                  Confirm payment
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function approveBooking(
  booking: Booking,
  data: AppData,
  setData: Dispatch<SetStateAction<AppData>>,
  ownerId: string,
) {
  const approvalRecords = buildApprovalRecords(booking, data, ownerId)

  setData({
    ...data,
    bookings: data.bookings.map((candidate) =>
      candidate.id === booking.id
        ? {
            ...candidate,
            status: 'approved',
          }
        : candidate,
    ),
    transactions: [
      approvalRecords.transaction,
      ...data.transactions,
    ],
    messages: [
      approvalRecords.message,
      ...data.messages,
    ],
  })
}

function buildApprovalRecords(
  booking: Booking,
  data: AppData,
  approverId: string,
) {
  const service = data.services.find(
    (candidate) => candidate.id === booking.serviceId,
  )
  const petNames = data.pets
    .filter((pet) => booking.petIds.includes(pet.id))
    .map((pet) => pet.name)
    .join(', ')

  return {
    transaction: {
      id: makeId('t'),
      bookingId: booking.id,
      customerId: booking.customerId,
      date: booking.date,
      description: `Approved ${service?.name ?? 'service'} for ${petNames}`,
      amount: booking.price,
      status: 'owed' as const,
      type: 'charge' as const,
    },
    message: {
      id: makeId('m'),
      bookingId: booking.id,
      senderId: approverId,
      recipientId: booking.customerId,
      body: `Your ${service?.name ?? 'service'} request has been approved.`,
      createdAt: new Date().toISOString(),
    },
  }
}

function stampBooking(
  setData: Dispatch<SetStateAction<AppData>>,
  bookingId: string,
  fields: Partial<Booking>,
) {
  setData((current) => ({
    ...current,
    bookings: current.bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, ...fields } : booking,
    ),
  }))
}

function updateService(
  setData: Dispatch<SetStateAction<AppData>>,
  serviceId: string,
  fields: Partial<Service>,
) {
  setData((current) => ({
    ...current,
    services: current.services.map((service) =>
      service.id === serviceId ? { ...service, ...fields } : service,
    ),
  }))
}

export default App
