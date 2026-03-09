# CENTRO — Frontend Reference
> **For AI Agents:** Use this document for all UI, component, and page implementation tasks. Always cross-reference `CENTRO.md` for feature scope and `BACKEND.md` for data shapes. When in doubt about a design decision, the UI Design System section is the authority.

---

## Quick Orientation

- **Framework:** Next.js 14, App Router, TypeScript
- **Styling:** Tailwind CSS (utility classes only — no custom CSS files unless absolutely necessary)
- **Data Viz:** Tremor (admin dashboard charts and stat cards only)
- **Icons:** Lucide React exclusively — no other icon library
- **Forms:** React Hook Form + Zod
- **Font:** Inter (Google Fonts) for UI; JetBrains Mono for monetary amounts and IDs

---

## 1. Project Structure

```
/app
  /(auth)
    /login          → Login page
    /signup         → Resident self-registration
  /(resident)       → Route group, requires role: resident
    /dashboard      → Home: balance card, announcement feed, emergency button
    /dues           → Full ledger history
    /announcements  → Full announcement feed
    /report         → Emergency report form
    /visitors       → Pre-register visitors
    /profile        → Edit own profile
  /(admin)          → Route group, requires role: admin
    /dashboard      → Stats overview, recent activity
    /announcements  → Post and manage announcements
    /payments       → Record payments, view all units
    /reports        → Monthly collection report
    /units          → Unit directory management
    /users          → User role management
    /alerts         → View and manage emergency alerts
    /audit-logs     → Read-only audit history
  /(guard)          → Route group, requires role: guard
    /alerts         → Real-time alert feed (primary screen)
    /visitors       → Log walk-in visitors
  /
    page.tsx        → Public landing page
    layout.tsx      → Root layout

/components
  /ui               → Base components (Button, Card, Input, Badge, Toast, Modal)
  /layout           → Sidebar, BottomNav, Header, PageWrapper
  /announcements    → AnnouncementCard, AnnouncementFeed, AnnouncementForm
  /payments         → LedgerTable, PaymentForm, BalanceCard, ReportTable
  /alerts           → AlertCard, AlertFeed, EmergencyButton, AlertStatusBadge
  /visitors         → VisitorForm, VisitorLogTable
  /dashboard        → StatCard, RecentActivity, QuickActions

/lib
  /supabase         → client.ts, server.ts, middleware.ts
  /validations      → Zod schemas (one file per domain)
  /utils            → formatCurrency, formatDate, formatTime, cn()
  /hooks            → useRole(), useRealtime(), useCurrentUser()

/types
  index.ts          → All TypeScript interfaces (Profile, Unit, Payment, Alert, etc.)

/middleware.ts       → Route protection + role-based redirect
```

---

## 2. Design System

### 2.1 Color Tokens

Map these to Tailwind config (`tailwind.config.ts`):

```typescript
colors: {
  brand: {
    green:  '#2D5A27',  // Primary actions, nav active, success states
    orange: '#FF8C42',  // Emergency, alerts, overdue, CTAs on landing
  },
  surface: {
    DEFAULT: '#F8F9FA', // Card backgrounds, input fills
    white:   '#FFFFFF', // Page background
  },
  border:   '#E5E7EB',
  text: {
    primary:   '#111827',
    secondary: '#6B7280',
    muted:     '#9CA3AF',
  },
  status: {
    danger:  '#DC2626',
    success: '#16A34A',
    info:    '#2563EB',
    warning: '#D97706',
  }
}
```

### 2.2 Color Usage Rules

| Use `brand.green` for... | Use `brand.orange` for... |
|--------------------------|---------------------------|
| Primary buttons | Emergency alert button |
| Active nav state | Overdue balance badge |
| Success toasts | "Action Required" badges |
| Positive stats (Paid, Resolved) | High-priority announcement label |
| Form focus rings | Collection shortfall indicators |
| Logo/brand marks | Key CTAs on landing page |

**Never use orange for success. Never use green for emergency.**

### 2.3 Typography Scale

```
text-3xl font-bold    → Page headings (H1)
text-2xl font-semibold → Section headings (H2)
text-lg font-semibold  → Card headings (H3)
text-sm               → Body text (default)
text-xs font-medium uppercase tracking-wide → Labels/captions
font-mono             → Peso amounts, IDs, reference numbers
```

### 2.4 Spacing

- Base unit: 4px (`space-1`)
- All spacing uses multiples of 4: `space-2`, `space-3`, `space-4`, `space-6`, `space-8`, `space-12`, `space-16`
- Page padding: `px-4 py-6` (mobile) → `px-8 py-8` (desktop)
- Card inner padding: `p-5`
- Section gaps: `gap-6` (cards in a grid)

### 2.5 Grid & Layout

- 12-column grid system
- Container max-width: `max-w-screen-xl mx-auto`
- Desktop sidebar: `w-60` fixed left
- Main content: fills remaining space
- Responsive breakpoints:

| Breakpoint | Width | Behavior |
|-----------|-------|---------|
| `sm` | 640px | Slight padding increase |
| `md` | 768px | 2-col card grid, hamburger menu |
| `lg` | 1024px | Sidebar visible, 3-col grid |
| `xl` | 1280px | Max-width container kicks in |

---

## 3. Component Specifications

### Button

```tsx
// Variants
<Button variant="primary">   // bg-brand-green text-white rounded-lg px-5 py-2.5
<Button variant="secondary"> // border-brand-green text-brand-green bg-transparent
<Button variant="danger">    // bg-status-danger text-white
<Button variant="ghost">     // text-text-secondary hover:bg-surface
<Button variant="alert">     // bg-brand-orange text-white — ONLY for emergency actions

// Sizes: sm | md (default) | lg
// Always include loading state (spinner replaces label, button disabled)
// Always include disabled state (opacity-50 cursor-not-allowed)
```

### Card

```tsx
// Base card
<Card>  // bg-white border border-border rounded-xl shadow-sm p-5

// Stat card (uses Tremor)
<StatCard label="Total Collected" value="₱48,500" trend="+12%" />

// Alert card (emergency)
// bg-brand-orange/10 border-l-4 border-brand-orange rounded-xl p-5
```

### Input / Form Elements

```tsx
// Text input
// h-10 border-1.5 border-border rounded-lg px-3 py-2 text-sm
// focus: border-brand-green ring-1 ring-brand-green/30
// error: border-status-danger + error message text-xs text-status-danger below

// All inputs MUST have a visible <label> — never label-less placeholder-only inputs
// All forms use React Hook Form + Zod schema
// Validate on both client (RHF) and server (API route re-validates with same schema)
```

### Navigation

```tsx
// Desktop sidebar (lg+): Fixed left w-60
// - Logo at top
// - Nav items: icon (Lucide) + label, active = text-brand-green + left border accent
// - Bottom: user avatar + name + logout

// Mobile: Fixed bottom bar (4 items max)
// - Home, Announcements, Dues/Alerts, Profile
// - Active item: brand.green fill

// Admin nav items rendered ONLY for admin role (check useRole())
// Guard nav items rendered ONLY for guard role
```

### Toast Notifications

```tsx
// Position: top-right, stacked, z-50
// Auto-dismiss: 5 seconds
// Types: success (green), error (red), warning (orange), info (blue)

// Emergency override toast:
// - Full-width banner, fixed top-0, bg-brand-orange, cannot auto-dismiss
// - Includes alarm icon + "New Emergency Alert" + "View" button
// - Rendered ONLY on guard and admin layouts
```

### Badge / Status Pill

```tsx
// status: paid → green, overdue → orange, open → orange, responding → blue, resolved → gray
// size: sm (text-xs px-2 py-0.5 rounded-full)
```

---

## 4. Pages & Their Responsibilities

### Landing Page (`/`)
- **Purpose:** Convert subdivision residents to sign up. Introduce Centro's value.
- **Sections:** Hero (headline + CTA), 3 Pain Points → Solutions, Feature highlights, Sign Up CTA
- **Note:** Public page, no auth required. Mobile-first layout. Brand colors prominent. Gvan owns this.

### Login / Signup (`/login`, `/signup`)
- Clean centered card layout, no sidebar
- Signup: full name, email, password, unit number (optional at signup)
- After signup: role defaults to `resident`, redirects to `/dashboard`
- Login: redirects based on role — resident → `/dashboard`, admin → `/admin/dashboard`, guard → `/guard/alerts`

### Resident Dashboard (`/(resident)/dashboard`)
- **Above fold (no scroll):** Balance card (large, color-coded by status), Latest unread announcement, Emergency button (orange, bottom-fixed on mobile)
- **Below fold:** Announcement feed (last 5), Quick links (Dues, Report Incident, Visitors)
- Balance card: green if current, orange if due soon (≤ 3 days), red if overdue

### Dues / Ledger (`/(resident)/dues`)
- Full ledger table: date, description, charge/payment, running balance
- Balance summary at top (current amount due + due date)
- "View Receipt" action on each payment row (opens attachment in modal)
- Filter by year

### Admin Dashboard (`/(admin)/dashboard`)
- Tremor stat cards row: Total Units, Collected This Month, Outstanding, Pending Alerts
- Collection rate chart (Tremor AreaChart — last 6 months)
- Recent payments table (last 10)
- Recent emergency alerts (last 5 with status badges)

### Admin Reports (`/(admin)/reports`)
- Month/year selector
- Summary stats: total billed, total collected, collection rate %, outstanding
- Per-unit breakdown table (unit, resident name, amount due, amount paid, balance, status)
- Export button: CSV (always), PDF (nice-to-have Phase 1)

### Guard Alert Interface (`/(guard)/alerts`)
- **This page is the guard's entire job.** Design for glanceability.
- Open alerts listed as large cards with incident type icon, unit, description, time elapsed
- "Acknowledge" button prominent on each open alert
- Resolved alerts collapse to a smaller row
- Connection status indicator always visible (green dot = live, orange = polling mode)
- Full-screen alert overlay for new incoming alerts with audio

---

## 5. Real-Time Implementation (Frontend)

### Announcement Feed

```typescript
// In the AnnouncementFeed component (client component)
const supabase = createClientComponentClient()

useEffect(() => {
  const channel = supabase
    .channel('announcements-feed')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'announcements'
    }, (payload) => {
      // Prepend new announcement to local state
      setAnnouncements(prev => [payload.new, ...prev])
      // Show toast if priority is high/emergency
    })
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [])
```

### Emergency Alert (Guard Interface)

```typescript
// Subscribe on component mount, unsubscribe on unmount
// CRITICAL: also start polling fallback on mount

useEffect(() => {
  let pollInterval: NodeJS.Timeout

  const channel = supabase
    .channel('emergency-alerts-guard')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'emergency_alerts'
    }, (payload) => {
      handleNewAlert(payload.new)
      playAlertSound() // Audio API — pre-load sound on page mount via user gesture at login
    })
    .on('system', {}, (status) => {
      setConnectionStatus(status === 'SUBSCRIBED' ? 'live' : 'polling')
    })
    .subscribe()

  // Polling fallback — runs regardless of WebSocket state
  pollInterval = setInterval(async () => {
    const { data } = await supabase
      .from('emergency_alerts')
      .select('*')
      .eq('status', 'open')
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
    reconcileAlerts(data)
  }, 30000)

  return () => {
    supabase.removeChannel(channel)
    clearInterval(pollInterval)
  }
}, [])
```

---

## 6. Auth & Middleware

### Middleware (`/middleware.ts`)

```typescript
// Check session on every request to protected routes
// Redirect rules:
// - No session → /login
// - session + wrong role → role's home page (e.g., guard hitting /admin/* → /guard/alerts)
// - /login with valid session → role's home page

// Role extraction: session.user.user_metadata.role
// Protected route groups: /(resident), /(admin), /(guard)
```

### `useRole()` Hook

```typescript
// Returns: { role: 'resident' | 'admin' | 'guard' | null, isLoading: boolean }
// Used in components to conditionally render role-specific UI
// NOTE: This is UX only — security is always enforced server-side
```

---

## 7. Utility Functions (Required)

```typescript
// /lib/utils/formatCurrency.ts
export function formatCurrency(centavos: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(centavos / 100)
}
// Example: formatCurrency(120050) → "₱1,200.50"

// /lib/utils/formatDate.ts
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'long', day: 'numeric', year: 'numeric'
  }).format(new Date(date))
}
// Example: formatDate('2025-05-15') → "May 15, 2025"

// /lib/utils/formatTime.ts
export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-PH', {
    hour: 'numeric', minute: '2-digit', hour12: true
  }).format(new Date(date))
}
// Example: formatTime('2025-05-15T14:30:00') → "2:30 PM"

// /lib/utils/cn.ts — Tailwind class merging
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs) { return twMerge(clsx(inputs)) }
```

---

## 8. TypeScript Interfaces

```typescript
// /types/index.ts

export type UserRole = 'resident' | 'admin' | 'guard'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  phone: string | null
  avatar_url: string | null
  unit_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Unit {
  id: string
  block_number: string
  lot_number: string
  address_label: string
  phase: string | null
  unit_type: 'owned' | 'rented' | 'vacant'
  monthly_dues: number // centavos
  owner_id: string | null
  created_at: string
}

export type TransactionType = 'charge' | 'payment' | 'late_fee' | 'adjustment'

export interface Payment {
  id: string
  unit_id: string
  recorded_by: string
  transaction_type: TransactionType
  amount: number // centavos — positive = payment, negative = charge
  description: string
  reference_no: string | null
  billing_period: string // ISO date (first of month)
  due_date: string | null
  receipt_url: string | null
  created_at: string
}

export type AnnouncementCategory = 'general' | 'utility' | 'security' | 'meeting' | 'emergency'
export type AnnouncementPriority = 'low' | 'medium' | 'high' | 'emergency'

export interface Announcement {
  id: string
  author_id: string
  title: string
  body: string
  category: AnnouncementCategory
  priority: AnnouncementPriority
  is_pinned: boolean
  target_phase: string | null
  attachment_url: string | null
  expires_at: string | null
  created_at: string
  deleted_at: string | null
}

export type IncidentType = 'medical' | 'fire' | 'intrusion' | 'suspicious' | 'other'
export type AlertStatus = 'open' | 'responding' | 'resolved' | 'false_alarm'

export interface EmergencyAlert {
  id: string
  reporter_id: string
  unit_id: string
  incident_type: IncidentType
  description: string | null
  location_note: string | null
  latitude: number | null
  longitude: number | null
  status: AlertStatus
  acknowledged_by: string | null
  acknowledged_at: string | null
  resolved_at: string | null
  resolution_note: string | null
  created_at: string
}

export interface Visitor {
  id: string
  host_unit_id: string
  pre_registered_by: string | null
  visitor_name: string
  purpose: 'personal' | 'delivery' | 'repair' | 'other'
  vehicle_plate: string | null
  logged_by: string | null
  time_in: string
  time_out: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  actor_id: string
  action: string
  entity_type: string
  entity_id: string
  old_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}
```

---

## 9. Frontend Don'ts

- **Never use `localStorage`** for auth tokens or session data — Supabase manages this.
- **Never show admin UI elements** to resident or guard roles, even as disabled.
- **Never do balance math** in the frontend — always fetch the computed value from the server.
- **Never use raw peso amounts** without `formatCurrency()`.
- **Never format dates** with manual string manipulation — use `formatDate()` and `date-fns`.
- **Never use an icon library other than Lucide React.**
- **Never add `!important`** to Tailwind or CSS. Fix the specificity properly.
- **Never create a client component** when a server component is sufficient.
- **Never unsubscribe from Realtime channels** without explicit cleanup in `useEffect` return.
- **Never skip loading and error states** on any async data fetch — always handle all three states (loading / data / error).

---

## 10. Accessibility Baseline

- All interactive elements must be keyboard-accessible (focusable, Enter/Space to activate).
- All images and icons must have `alt` text or `aria-label`.
- Form errors must be associated with inputs via `aria-describedby`.
- Color alone must never convey meaning — always pair with an icon or text label.
- Contrast ratio: minimum 4.5:1 for body text, 3:1 for large text.
- Emergency button on mobile must be reachable with one thumb (bottom of screen, right-aligned).
