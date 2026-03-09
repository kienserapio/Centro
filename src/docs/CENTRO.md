# CENTRO — Master Product Requirements Document
> **For AI Agents:** This is the single source of truth for the Centro project. When generating code, making architectural decisions, or writing any feature — always reconcile against this document. The sub-documents (`FRONTEND.md`, `BACKEND.md`, `GENERAL.md`) are specialized slices of this master. If any conflict arises, this file takes precedence.

---

## Document Map

| File | Purpose | Read When... |
|------|---------|--------------|
| `CENTRO.md` | This file. Full system overview. | You need the complete picture. |
| `FRONTEND.md` | UI, components, design system, pages | Building or modifying any UI. |
| `BACKEND.md` | DB schema, RLS, API routes, Supabase | Building or modifying data/logic. |
| `GENERAL.md` | Team, stack, risks, testing, deployment | Project setup, QA, DevOps tasks. |

---

## 1. Project Identity

- **Name:** Centro
- **Type:** Web-based community management platform
- **Target:** Philippine residential subdivisions (HOAs)
- **Stack:** Next.js 14 (App Router) + Supabase + Tailwind CSS + Vercel
- **Version:** 1.0 — Phase 1

### Three User Roles

| Role | Who They Are | Primary Need |
|------|-------------|--------------|
| `resident` | Homeowner/tenant | View dues balance, report incidents, read announcements |
| `admin` | HOA staff/volunteer | Record payments, post announcements, generate reports |
| `guard` | Security personnel | Receive & respond to emergency alerts in real time |

---

## 2. Core Problem Statement

Philippine residential subdivisions suffer three systemic failures:

1. **Fragmented communication** — Notices scattered across bulletin boards, Facebook, and Viber. Critical info (water cuts, security alerts) reaches residents too late or not at all.
2. **Opaque dues management** — HOA dues tracked in paper ledgers and Excel. Residents have no self-service access to their balance. Disputes are frequent and unresolvable without digging through paper receipts.
3. **Slow emergency response** — Guards rely on phone calls or radio that may go unanswered. No digital, real-time channel exists between residents in distress and security.

**Centro solves all three** with a role-based, real-time web platform.

---

## 3. Tech Stack (Non-Negotiable)

```
Frontend:   Next.js 14 (App Router), TypeScript, Tailwind CSS, Tremor, Lucide React
Backend:    Supabase (Auth + Realtime + Storage + Edge Functions)
Database:   PostgreSQL via Supabase, Row Level Security (RLS) on ALL tables
Deployment: Vercel (Preview + Production)
Forms:      React Hook Form + Zod (validation on both client and server)
Dates:      date-fns
Errors:     Sentry
Testing:    Jest (unit/integration) + Playwright (E2E)
```

### Supporting Libraries

| Library | Use |
|---------|-----|
| `zod` | Schema validation — all forms AND all API routes |
| `react-hook-form` | Form state management |
| `date-fns` | Date arithmetic (due dates, report filtering) |
| `@sentry/nextjs` | Error monitoring |
| `@tremor/react` | Admin dashboard charts and stat cards |
| `lucide-react` | All icons — no other icon library |

---

## 4. Feature Inventory

### F1 — Real-Time Announcement System
- Admins create announcements with category, priority, optional attachment
- Residents see a prioritized feed — emergency items pinned top
- Supabase Realtime broadcasts INSERT events to all connected clients
- Read receipts tracked in `announcement_reads` table
- Categories: `general | utility | security | meeting | emergency`
- Priority: `low | medium | high | emergency`

### F2 — Homeowner's Dues Tracking
- Ledger model: CHARGE records subtracted from PAYMENT records = running balance
- Admin records payments manually (Phase 1 — no online payment gateway)
- Recurring dues auto-generated monthly via pg_cron
- Late fees auto-applied 5 days past due_date
- Residents view their own ledger only (RLS enforced)
- Admin generates monthly collection reports (Tremor table + CSV/PDF export)

### F3 — Emergency Reporting & Real-Time Alerts
- Resident submits short form: incident type, location, optional description
- Record inserted into `emergency_alerts` — status starts as `OPEN`
- Guard interface receives real-time push (Supabase Realtime + browser Audio API)
- Status flow: `OPEN → RESPONDING → RESOLVED` (or `FALSE_ALARM`)
- Polling fallback every 30 seconds if WebSocket drops
- Admin receives silent in-app notification for all alerts

### F4 — Role-Based Access Control (RBAC)
- Three roles: `resident`, `admin`, `guard`
- Enforced at three layers: DB (RLS) → Server (middleware + API routes) → UI (conditional render)
- Self-signup always defaults to `resident`
- Only `admin` can promote a user to `admin` or `guard`

### F5 — Visitor Management
- Residents pre-register expected visitors
- Guards log walk-in visitors and mark pre-registered visitors as arrived
- Admin can search visitor history

### F6 — Unit & Profile Management
- Admin manages unit directory (block, lot, phase, type)
- Residents update their own profile (photo, phone, email)
- Units linked to owner via `profiles.unit_id` FK

---

## 5. Permission Matrix

| Action | resident | admin | guard |
|--------|----------|-------|-------|
| View own payment ledger | ✓ | ✓ | ✗ |
| View all units' ledgers | ✗ | ✓ | ✗ |
| Record a payment | ✗ | ✓ | ✗ |
| View announcements | ✓ | ✓ | ✓ |
| Create/edit announcements | ✗ | ✓ | ✗ |
| Submit emergency alert | ✓ | ✓ | ✗ |
| View & respond to alerts | ✗ | ✓ (view) | ✓ |
| Update alert status | ✗ | ✓ | ✓ |
| View audit logs | ✗ | ✓ | ✗ |
| Manage user accounts | ✗ | ✓ | ✗ |
| View own profile | ✓ | ✓ | ✓ |
| Log visitors | ✗ | ✗ | ✓ |
| Pre-register visitors | ✓ | ✓ | ✗ |

---

## 6. Database Tables (Summary)

Full schema in `BACKEND.md`. Tables and their purpose:

| Table | Purpose |
|-------|---------|
| `profiles` | User data. Extends `auth.users`. Stores role. |
| `units` | Physical unit directory (block, lot, phase). |
| `payments` | Ledger entries — charges and payments for each unit. |
| `announcements` | HOA notices published by admins. |
| `announcement_reads` | Junction: tracks which users read which announcements. |
| `emergency_alerts` | Incident reports with real-time status. |
| `visitors` | Gate visitor log (pre-registered and walk-in). |
| `audit_logs` | Immutable log of all sensitive operations. |

---

## 7. System Architecture (Brief)

```
Browser / Mobile Browser
    ↓ HTTPS
Next.js on Vercel
    ├── App Router (SSR pages + Client Components)
    ├── Middleware (auth session check → role-based redirect)
    └── API Routes (sensitive server-side ops only)
         ↓ Supabase JS Client (REST + WebSocket)
Supabase Platform
    ├── Auth      (JWT sessions)
    ├── PostgreSQL (RLS on all tables)
    ├── Realtime  (WebSocket for alerts + announcements)
    └── Storage   (profile photos, announcement attachments)
```

---

## 8. Hard Rules (Always Enforce)

> These are non-negotiable. No exceptions.

1. **Never store passwords.** Supabase Auth only.
2. **Never perform monetary math in JavaScript.** All balance logic lives in SQL. Store amounts as INTEGER (centavos).
3. **Never use `localStorage` for auth tokens.** Supabase manages sessions via httpOnly cookies.
4. **Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.** Anon key only on the frontend.
5. **Never skip RLS on any table.** Default-deny. No RLS policy = no access.
6. **Never hard-delete payment or audit records.** Use soft deletes (`deleted_at` timestamp).
7. **Never auto-resolve emergency alerts.** A human guard must trigger the final status change.
8. **Never render Admin UI to non-admin roles.** Not even as disabled states.
9. **Never trust client-side validation alone.** Always re-validate with Zod on the server.
10. **Never use floating point for money.** INTEGER centavos only. Display as `amount / 100`.

---

## 9. User Personas (Quick Reference)

### Maria Santos (Resident)
- 38, moderate tech literacy, uses Facebook daily
- Needs: see balance at a glance, report safety concerns fast, stay informed without overload
- Pain: forgets due dates, missed water interruption notice, worried about strange vehicles

### Rodel Macaraeg (Admin)
- 52, low-moderate tech literacy, retired teacher, HOA volunteer
- Needs: post announcements fast, accurate auto-calculated ledger, exportable reports
- Pain: manual Excel tracking, late fee disputes, writing announcement memos

### Jhun dela Cruz (Guard)
- 29, basic smartphone user, rotating shifts
- Needs: instant clear alerts, one-tap confirm, no complex navigation
- Pain: misses radio calls on rounds, alert info unclear (which unit? what happened?)

---

## 10. Philippine Context (Always Keep In Mind)

- **Currency:** Philippine Peso (₱). Store as INTEGER centavos. Display with `Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })`.
- **Date format:** Month Day, Year — e.g., "May 15, 2025". Never ISO-only in UI.
- **Time:** 12-hour format with AM/PM. Never 24-hour in user-facing UI.
- **Connectivity:** Design for LTE/4G minimum. Bundle size target < 200KB initial JS.
- **Language:** Filipino English. UI labels in English. Microcopy can blend Filipino phrases.
- **Receipts:** Residents expect printable/shareable payment confirmations. Always provide "View Receipt."
- **Trust:** HOA disputes stem from opacity. The ledger audit trail is a feature, not just infra.
