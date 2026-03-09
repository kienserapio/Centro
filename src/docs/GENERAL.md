# CENTRO — General Project Reference
> **For AI Agents:** Use this document for project setup, team context, risk awareness, testing tasks, deployment configuration, and any cross-cutting concerns not specific to the frontend or backend. When writing code, always be aware of the risks listed in Section 4 — they are the most common sources of bugs and security issues in this system.

---

## 1. Team & Responsibilities

| Person | Role | Primary Ownership |
|--------|------|------------------|
| **Kien Serapio** | Project Manager & Full Stack Developer | System architecture, feature integration, Vercel deployment, final code review, project milestones |
| **Vince Santos** | Backend Developer & Database Engineer | PostgreSQL schema, SQL queries, RLS policies, Supabase Auth config, Edge Functions, DB migrations |
| **Toni Narra** | Frontend Developer | UI Design System, component library, Resident Dashboard, Admin Dashboard, Tremor charts |
| **Gvan Rocas** | Frontend Developer | Landing page, mobile responsiveness (all breakpoints), Guard alert interface, Supabase Realtime UI |
| **Lowel Rubino** | Backend Developer & QA Specialist | RLS penetration testing, Jest/Playwright test suite, audit log implementation, security review, cross-device audits |

### Who to "Consult" When Generating Code

- Modifying DB schema → align with **Vince's** patterns in `BACKEND.md`
- Building a new page/component → follow **Toni/Gvan's** system in `FRONTEND.md`
- Deployment or CI config → follow **Kien's** setup in this document
- Adding a test → follow **Lowel's** testing strategy below

---

## 2. Project Setup & Environment

### Prerequisites

```bash
Node.js >= 18.17.0
npm >= 9.0.0
Supabase CLI (npm install -g supabase)
Vercel CLI (npm install -g vercel)  # Optional for local Vercel testing
```

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/<org>/centro.git
cd centro

# 2. Install dependencies
npm install

# 3. Copy env template
cp .env.example .env.local
# Fill in Supabase URL, anon key, service role key

# 4. Start Supabase locally (Docker required)
supabase start

# 5. Run migrations
supabase db push

# 6. Seed development data
npm run db:seed

# 7. Start dev server
npm run dev
```

### Available npm Scripts

```json
{
  "dev":          "next dev",
  "build":        "next build",
  "start":        "next start",
  "lint":         "next lint",
  "type-check":   "tsc --noEmit",
  "test":         "jest",
  "test:watch":   "jest --watch",
  "test:e2e":     "playwright test",
  "test:e2e:ui":  "playwright test --ui",
  "db:seed":      "tsx scripts/seed.ts",
  "db:reset":     "supabase db reset && npm run db:seed"
}
```

---

## 3. Git Workflow

```
main          → Production (protected, requires PR)
develop       → Integration branch for completed features
feature/*     → Individual feature branches
fix/*         → Bug fix branches
```

### Branch Naming

```
feature/announcement-realtime
feature/dues-ledger
fix/alert-double-acknowledge
```

### PR Rules

- All PRs require at least **one reviewer** (Kien reviews all PRs before merge to main)
- PRs must pass: ESLint, TypeScript build, Jest unit tests
- PRs to `main` also require Playwright E2E tests to pass
- **Never force-push to `main` or `develop`**

### Commit Convention

```
feat: add emergency alert real-time subscription
fix: prevent double-acknowledgment on concurrent guard taps
chore: update Supabase client to v2
docs: update BACKEND.md with late fee trigger
test: add E2E test for resident dues ledger flow
```

---

## 4. Risk Register

These are the documented risks for Centro. **Every developer must be aware of these.** When writing code in a related area, actively verify the mitigation is in place.

### R01 — Guard Interface Loses Real-Time Connection
- **Likelihood:** Medium (mobile data, poor WiFi)
- **Impact:** Critical — guard misses emergency alerts
- **Mitigation:** Polling fallback every 30 seconds. Connection status banner always visible. On reconnect, reconcile missed events.
- **Owner:** Gvan (UI) + Vince (query)
- **Verify:** Simulate WebSocket drop in Chrome DevTools → confirm polling takes over within 35 seconds

### R02 — Sensitive Financial Data Exposure via Misconfigured RLS
- **Likelihood:** Low if developed carefully, but catastrophic if it occurs
- **Impact:** Critical — legal and trust implications in a Philippine HOA context
- **Mitigation:** RLS on all tables. Lowel runs penetration tests: log in as Resident A, attempt to fetch Resident B's payments.
- **Owner:** Vince (policies) + Lowel (testing)
- **Verify:** `SELECT * FROM payments` as a resident via Supabase dashboard → should return zero rows for other units

### R03 — UI Too Complex for Non-Tech-Savvy Users
- **Likelihood:** Medium — developer instinct is to add features, not remove
- **Impact:** High — residents won't use it; guard will miss alerts
- **Mitigation:** 5-second rule (critical info visible without scroll/tap). Test with 3 real non-technical users before launch.
- **Owner:** Gvan + Toni + Lowel
- **Verify:** Usability session: ask a 50+ year old non-developer to complete 3 tasks without help

### R04 — Race Condition on Alert Acknowledgment
- **Likelihood:** Low but possible in multi-guard scenarios
- **Impact:** Medium — confusion about who is responding
- **Mitigation:** `UPDATE WHERE status = 'open'` atomic condition. 409 response if already acknowledged.
- **Owner:** Vince (DB) + Kien (API)
- **Verify:** Simultaneously call `/api/alerts/:id/acknowledge` from two clients — only one should succeed

### R05 — Floating Point Errors in Financial Display
- **Likelihood:** High if not enforced from day one
- **Impact:** Medium — resident distrust, disputes
- **Mitigation:** All money stored as INTEGER centavos. All display via `formatCurrency()`. No math in JS.
- **Owner:** Vince (schema) + Toni (display)
- **Verify:** Check every component that renders a peso value — confirm it uses `formatCurrency()`

### R06 — Supabase Free Tier Resource Limits
- **Likelihood:** Medium at scale
- **Impact:** Medium — service degradation or unexpected charges
- **Mitigation:** Monitor DB size (< 500MB), Storage (< 1GB), Realtime bandwidth. Purge old attachments. Unsubscribe on unmount.
- **Owner:** Kien
- **Verify:** Weekly check of Supabase dashboard metrics during development and post-launch

### R07 — Wrong Role Assigned / Role Escalation
- **Likelihood:** Low if enforced
- **Impact:** High — unauthorized admin access
- **Mitigation:** Self-signup always = `resident`. Role promotion via admin-only API route with audit log.
- **Owner:** Vince (RLS) + Lowel (testing)
- **Verify:** Register a new account, inspect JWT claims, confirm role = 'resident'

### R08 — Admin Accidentally Deletes Critical Records
- **Likelihood:** Medium (honest mistakes happen)
- **Impact:** High for announcements, Medium for others
- **Mitigation:** Soft deletes on all admin-managed content. Confirmation modals. Audit log stores `old_value`.
- **Owner:** Toni (UI modals) + Vince (soft delete)
- **Verify:** Soft-delete an announcement → confirm `deleted_at` is set and record is excluded from queries but still in DB

---

## 5. Testing Strategy

### Unit Tests (Jest)

**What to test:** Pure functions and business logic. Not React components (use E2E for those).

```
/tests/unit/
  formatCurrency.test.ts      → edge cases: 0, large numbers, negatives
  formatDate.test.ts          → PH date format correctness
  balanceCalculation.test.ts  → if any SQL is mirrored in JS utilities
  zod-schemas.test.ts         → all Zod schemas validate correctly
  alertStatusMachine.test.ts  → valid and invalid status transitions
```

### Integration Tests (Jest + Supabase local)

```
/tests/integration/
  payments-api.test.ts        → POST /api/payments/record (success, auth failure, bad input)
  alerts-api.test.ts          → acknowledge, resolve, race condition
  role-assignment.test.ts     → admin can promote, resident cannot
  reports-api.test.ts         → correct aggregation for known seed data
```

### E2E Tests (Playwright)

**Critical flows — all must pass before every production deploy:**

```
/tests/e2e/
  auth.spec.ts
    ✓ Resident signs up → role is 'resident' → redirected to /dashboard
    ✓ Guard logs in → redirected to /guard/alerts
    ✓ Unauthenticated → redirected to /login

  resident-dues.spec.ts
    ✓ Resident sees their own balance on dashboard
    ✓ Resident can view full ledger
    ✓ Resident cannot see another unit's data (attempt returns nothing)

  emergency-alert.spec.ts
    ✓ Resident submits alert → guard interface shows it within 5 seconds
    ✓ Guard acknowledges → status changes to 'responding'
    ✓ Two simultaneous acknowledges → only one succeeds

  announcements.spec.ts
    ✓ Admin posts announcement → appears in resident feed in real time
    ✓ Resident cannot POST to /api/announcements (403)

  payments.spec.ts
    ✓ Admin records payment → balance updates correctly
    ✓ Resident cannot record payment (403)
    ✓ Monthly report totals match known seed data
```

### RLS Penetration Tests (Manual + Scripted)

Run as part of pre-launch checklist. Test each role against each table:

```typescript
// Script: scripts/rls-test.ts
// Log in as a resident user, then attempt:
const { data, error } = await supabase
  .from('payments')
  .select('*')
  .neq('unit_id', currentUserUnitId)  // Should return empty array, not error, not data
```

### Usability Testing Protocol

Before launch, recruit 3–5 non-technical testers (ideally actual subdivision residents aged 40+).

Tasks to observe:
1. "Check how much dues you owe." (Resident flow)
2. "Report a suspicious vehicle at the gate." (Emergency flow)
3. "Find the announcement about the water interruption." (Announcements)

Success criteria: Task completed in < 2 minutes with zero guidance.

---

## 6. Deployment

### Vercel Configuration

```
Project: centro
Framework: Next.js
Root Directory: /
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### Environment Variables in Vercel

Set these in Vercel dashboard (Settings → Environment Variables):

| Variable | Environment |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Production + Preview |
| `NEXT_PUBLIC_APP_URL` | All |
| `SENTRY_DSN` | Production |
| `CRON_SECRET` | Production + Preview |

### Deployment Environments

| Branch | Environment | Supabase Project | Domain |
|--------|-------------|-----------------|--------|
| `main` | Production | centro-prod | centro.app |
| `develop` + PRs | Preview | centro-staging | auto-generated |
| Local | Development | Supabase local CLI | localhost:3000 |

### Pre-Launch Checklist

```
[ ] All E2E tests passing on staging
[ ] RLS penetration test completed by Lowel
[ ] Usability test completed with 3+ non-technical users
[ ] Sentry configured and receiving test events
[ ] Vercel Analytics enabled
[ ] pg_cron jobs active on Supabase prod
[ ] All environment variables set in Vercel production
[ ] Supabase Auth email templates customized (Centro branding)
[ ] Storage bucket policies reviewed
[ ] Service role key confirmed absent from client-side bundle
[ ] Performance: Lighthouse mobile score ≥ 85
[ ] First Contentful Paint < 1.5s on 4G throttle
```

---

## 7. Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance (mobile) | ≥ 85 |
| Lighthouse Performance (desktop) | ≥ 90 |
| First Contentful Paint | < 1.5 seconds |
| Time to Interactive | < 3.0 seconds (4G) |
| Initial JS bundle | < 200KB gzipped |
| Alert delivery (Realtime) | < 5 seconds |
| Alert delivery (polling fallback) | < 35 seconds |
| API response time (p95) | < 500ms |
| Monthly uptime target | ≥ 99.5% |

---

## 8. Project Roadmap

### Phase 1 — Foundation (Weeks 1–2)
- [ ] Repo, Next.js, Tailwind, Supabase project setup
- [ ] Database schema + migrations + seed data
- [ ] Authentication (signup, login, logout, role assignment)
- [ ] UI Design System base components
- [ ] Landing page

### Phase 2 — Core Features (Weeks 3–5)
- [ ] Announcement system (post + real-time feed)
- [ ] Dues tracking (ledger + payment recording)
- [ ] Emergency alert (submit + guard real-time interface)
- [ ] RBAC (RLS + middleware + UI gates)

### Phase 3 — Polish (Weeks 6–7)
- [ ] Admin dashboard (Tremor charts + reports)
- [ ] Visitor management
- [ ] Mobile responsiveness audit
- [ ] Toast/notification system
- [ ] Audit log viewer

### Phase 4 — QA & Launch (Week 8)
- [ ] RLS penetration testing
- [ ] E2E test suite complete
- [ ] Usability testing
- [ ] Bug fix sprint
- [ ] Production deployment + monitoring

---

## 9. Monitoring & Incident Response

### Monitoring Stack

| Tool | Purpose | Owner |
|------|---------|-------|
| Vercel Analytics | Core Web Vitals, page performance | Kien |
| Sentry | Runtime error tracking + alerts | Kien + Lowel |
| Supabase Dashboard | DB performance, storage, Realtime metrics | Vince |

### Incident Severity Levels

| Level | Definition | Response |
|-------|-----------|---------|
| P0 — Critical | Emergency alerts not reaching guards | Fix and deploy within 2 hours |
| P1 — High | Auth broken, residents can't log in | Fix within 4 hours |
| P2 — Medium | Payment recording fails, report broken | Fix within 24 hours |
| P3 — Low | UI bug, wrong formatting | Fix in next sprint |

---

## 10. Key Decisions Log

Document major architectural decisions here so future agents and developers understand the "why."

| Decision | Why |
|----------|-----|
| Supabase over custom backend | Small team, need auth + realtime + DB out of the box. No time to maintain servers. |
| Next.js App Router | SSR for performance on LTE connections. Server components reduce client JS. |
| Centavos for money | Float precision bugs in financial software are unacceptable. Industry standard. |
| Soft deletes everywhere | Philippine HOA context — audit trails are legally and operationally essential. |
| Polling fallback for guards | Mobile connectivity in PH is unreliable. Real-time alone is not resilient enough. |
| No online payments in Phase 1 | Scope control. GCash/PayMaya integration adds significant complexity and compliance overhead. Phase 2. |
| Inter font | Wide Filipino character support, excellent readability on low-res screens. |
| Zod for validation | Single schema definition works on both client (RHF) and server (API routes). DRY. |
