# CENTRO — Backend & Database Reference
> **For AI Agents:** Use this document for all database, API, Supabase, and server-side logic tasks. Always cross-reference `CENTRO.md` for the permission matrix and feature scope. The schema defined here is the canonical data model — do not invent columns or tables not listed here without a documented reason.

---

## Quick Orientation

- **Backend:** Supabase (Auth + Realtime + Storage + Edge Functions)
- **Database:** PostgreSQL (managed by Supabase)
- **Security:** Row Level Security (RLS) enabled on ALL tables, default-deny
- **Custom Server Logic:** Next.js API routes in `/app/api/` — thin, validation-first
- **Validation:** Zod — every API route re-validates its own input, never trusts the client
- **Money:** All monetary values stored as INTEGER (centavos). ₱1,200.50 = `120050`.

---

## 1. Supabase Configuration

### Client Setup

```typescript
// /lib/supabase/client.ts — for client components
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
export const createClient = () => createClientComponentClient<Database>()

// /lib/supabase/server.ts — for server components and API routes
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
export const createServerClient = () =>
  createServerComponentClient<Database>({ cookies })

// /lib/supabase/admin.ts — service role client for server-only privileged ops
// NEVER import this in client components
import { createClient } from '@supabase/supabase-js'
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Server-side ONLY
)
```

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=             # Public — safe for client
NEXT_PUBLIC_SUPABASE_ANON_KEY=        # Public — safe for client (RLS enforces security)
SUPABASE_SERVICE_ROLE_KEY=            # SECRET — server-side ONLY, never in client bundle
NEXT_PUBLIC_APP_URL=                  # App domain
SENTRY_DSN=                           # Error tracking
CRON_SECRET=                          # Validates scheduled function calls
```

---

## 2. Database Schema

### Design Conventions

- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at`: `TIMESTAMPTZ` — auto-updated via trigger (see trigger definition below)
- Soft deletes: `deleted_at TIMESTAMPTZ` (NULL = active record)
- Foreign keys: always named `<table_singular>_id` pointing to `<table>.id`
- Money: `INTEGER NOT NULL` — centavos (never FLOAT, never DECIMAL for money)
- RLS: `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY` on every table

### `profiles`

Extends `auth.users`. One row per user. Created automatically on signup via trigger.

```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'resident'
                CHECK (role IN ('resident', 'admin', 'guard')),
  phone       TEXT,
  avatar_url  TEXT,
  unit_id     UUID REFERENCES units(id) ON DELETE SET NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### `units`

Physical unit directory. Managed by admins.

```sql
CREATE TABLE units (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_number   TEXT NOT NULL,
  lot_number     TEXT NOT NULL,
  address_label  TEXT NOT NULL,
  phase          TEXT,
  unit_type      TEXT NOT NULL DEFAULT 'owned'
                   CHECK (unit_type IN ('owned', 'rented', 'vacant')),
  monthly_dues   INTEGER NOT NULL DEFAULT 0, -- centavos
  owner_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (block_number, lot_number)
);
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
```

### `payments`

Ledger entries for dues. Both charges and payments.

```sql
CREATE TABLE payments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id          UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  recorded_by      UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  transaction_type TEXT NOT NULL
                     CHECK (transaction_type IN ('charge', 'payment', 'late_fee', 'adjustment')),
  amount           INTEGER NOT NULL, -- centavos. positive = payment/credit, negative = charge/debit
  description      TEXT NOT NULL,
  reference_no     TEXT,
  billing_period   DATE,             -- First day of billing month e.g. 2025-05-01
  due_date         DATE,
  receipt_url      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- No soft delete: financial records are immutable. Use 'adjustment' transaction to correct errors.
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
```

**Balance calculation:**
```sql
-- Current balance for a unit (positive = amount owed, negative = credit)
SELECT COALESCE(SUM(CASE
  WHEN transaction_type IN ('charge', 'late_fee') THEN ABS(amount)
  WHEN transaction_type IN ('payment', 'adjustment') THEN -ABS(amount)
  ELSE 0
END), 0) AS balance_centavos
FROM payments
WHERE unit_id = $1;
```

### `announcements`

```sql
CREATE TABLE announcements (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  title          TEXT NOT NULL,
  body           TEXT NOT NULL,
  category       TEXT NOT NULL DEFAULT 'general'
                   CHECK (category IN ('general', 'utility', 'security', 'meeting', 'emergency')),
  priority       TEXT NOT NULL DEFAULT 'medium'
                   CHECK (priority IN ('low', 'medium', 'high', 'emergency')),
  is_pinned      BOOLEAN NOT NULL DEFAULT FALSE,
  target_phase   TEXT,              -- NULL = all phases
  attachment_url TEXT,
  expires_at     TIMESTAMPTZ,       -- NULL = never expires
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ        -- Soft delete
);
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
```

### `announcement_reads`

```sql
CREATE TABLE announcement_reads (
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (announcement_id, user_id)
);
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;
```

### `emergency_alerts`

```sql
CREATE TABLE emergency_alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  unit_id         UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  incident_type   TEXT NOT NULL
                    CHECK (incident_type IN ('medical', 'fire', 'intrusion', 'suspicious', 'other')),
  description     TEXT,
  location_note   TEXT,
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  status          TEXT NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'responding', 'resolved', 'false_alarm')),
  acknowledged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,
  resolution_note TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;
```

**Status transitions (enforce in API):**
```
open → responding  (guard acknowledges)
responding → resolved | false_alarm  (guard closes)
open → false_alarm  (admin or guard closes without responding)
```
No other transitions are valid.

### `visitors`

```sql
CREATE TABLE visitors (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_unit_id      UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  pre_registered_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  visitor_name      TEXT NOT NULL,
  purpose           TEXT NOT NULL DEFAULT 'personal'
                      CHECK (purpose IN ('personal', 'delivery', 'repair', 'other')),
  vehicle_plate     TEXT,
  logged_by         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  time_in           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  time_out          TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
```

### `audit_logs`

Immutable. Written by API routes and DB triggers. Never updated or deleted.

```sql
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL, -- e.g. CREATE_PAYMENT, UPDATE_ALERT_STATUS, DELETE_ANNOUNCEMENT
  entity_type TEXT NOT NULL, -- table name: 'payments', 'announcements', etc.
  entity_id   UUID,
  old_value   JSONB,
  new_value   JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- No UPDATE, no DELETE ever
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- Only admins can SELECT. Nobody can INSERT from client (only via server/trigger).
```

---

## 3. Row Level Security (RLS) Policies

### Helper function (create once)

```sql
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;
```

### `profiles` RLS

```sql
-- Users can read their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT USING (get_user_role() = 'admin');

-- Users can update their own profile (not role field — handled in API)
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid()));
```

### `payments` RLS

```sql
-- Residents can only see payments for their own unit
CREATE POLICY "payments_select_resident" ON payments
  FOR SELECT USING (
    unit_id IN (SELECT unit_id FROM profiles WHERE id = auth.uid())
  );

-- Admins can see all payments
CREATE POLICY "payments_select_admin" ON payments
  FOR SELECT USING (get_user_role() = 'admin');

-- Only admins can insert payments (via API route, never direct client insert)
CREATE POLICY "payments_insert_admin" ON payments
  FOR INSERT WITH CHECK (get_user_role() = 'admin');

-- No UPDATE or DELETE on payments — use 'adjustment' transaction type to correct
```

### `announcements` RLS

```sql
-- All authenticated users can read non-deleted announcements
CREATE POLICY "announcements_select_all" ON announcements
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND deleted_at IS NULL
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- Only admins can insert, update, soft-delete
CREATE POLICY "announcements_write_admin" ON announcements
  FOR ALL USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');
```

### `emergency_alerts` RLS

```sql
-- Residents can see their own alerts
CREATE POLICY "alerts_select_reporter" ON emergency_alerts
  FOR SELECT USING (reporter_id = auth.uid());

-- Guards and admins can see all alerts
CREATE POLICY "alerts_select_staff" ON emergency_alerts
  FOR SELECT USING (get_user_role() IN ('guard', 'admin'));

-- Any authenticated user can INSERT (submit an alert)
CREATE POLICY "alerts_insert_authenticated" ON emergency_alerts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND reporter_id = auth.uid());

-- Guards and admins can UPDATE status
CREATE POLICY "alerts_update_staff" ON emergency_alerts
  FOR UPDATE USING (get_user_role() IN ('guard', 'admin'));
```

### `audit_logs` RLS

```sql
-- Only admins can read
CREATE POLICY "audit_logs_select_admin" ON audit_logs
  FOR SELECT USING (get_user_role() = 'admin');

-- No direct INSERT from client — only via triggers and service-role API routes
-- No UPDATE, no DELETE ever
```

---

## 4. Database Triggers & Automation

### Auto-update `updated_at`

```sql
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
-- Repeat for: units, announcements
```

### Auto-create profile on signup

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'resident')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Monthly dues charge (pg_cron)

```sql
-- Runs on the 1st of every month at 00:01 PHT (UTC+8 = 16:01 UTC previous day)
SELECT cron.schedule(
  'monthly-dues-charge',
  '1 16 28-31 * *', -- Approximate; refine based on month-end logic
  $$
    INSERT INTO payments (unit_id, recorded_by, transaction_type, amount, description, billing_period, due_date)
    SELECT
      u.id,
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), -- System admin
      'charge',
      -u.monthly_dues, -- Negative = charge/debit
      'Monthly HOA Dues - ' || TO_CHAR(NOW(), 'Month YYYY'),
      DATE_TRUNC('month', NOW())::DATE,
      (DATE_TRUNC('month', NOW()) + INTERVAL '10 days')::DATE
    FROM units u
    WHERE u.unit_type != 'vacant'
    AND u.monthly_dues > 0;
  $$
);
```

### Late fee automation

```sql
-- Runs daily at 01:00 PHT (17:00 UTC)
SELECT cron.schedule(
  'late-fee-check',
  '0 17 * * *',
  $$
    INSERT INTO payments (unit_id, recorded_by, transaction_type, amount, description, billing_period)
    SELECT DISTINCT
      p.unit_id,
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      'late_fee',
      -50000, -- ₱500 late fee in centavos — make this configurable
      'Late Fee - ' || TO_CHAR(p.due_date, 'Month YYYY'),
      p.billing_period
    FROM payments p
    WHERE p.transaction_type = 'charge'
    AND p.due_date < CURRENT_DATE - INTERVAL '5 days'
    AND NOT EXISTS (
      SELECT 1 FROM payments lf
      WHERE lf.unit_id = p.unit_id
      AND lf.transaction_type = 'late_fee'
      AND lf.billing_period = p.billing_period
    )
    AND NOT EXISTS (
      SELECT 1 FROM payments pay
      WHERE pay.unit_id = p.unit_id
      AND pay.transaction_type = 'payment'
      AND pay.billing_period = p.billing_period
      AND pay.amount >= ABS(p.amount)
    );
  $$
);
```

---

## 5. Custom API Routes

All routes in `/app/api/`. Pattern: validate input → check auth → check role → execute → write audit log → respond.

### POST `/api/payments/record`

```typescript
// Body: { unit_id, amount, transaction_type, description, reference_no?, billing_period, due_date?, receipt_url? }
// Auth: admin only
// Steps:
// 1. Validate body with Zod schema
// 2. Verify session and role = 'admin'
// 3. INSERT into payments
// 4. Write to audit_logs (action: CREATE_PAYMENT)
// 5. Return { success: true, payment_id, new_balance }
```

### POST `/api/reports/monthly-collection`

```typescript
// Body: { month: number (1-12), year: number }
// Auth: admin only
// Returns: {
//   total_billed: number,    // centavos
//   total_collected: number, // centavos
//   collection_rate: number, // percentage
//   outstanding: number,     // centavos
//   units: Array<{
//     unit_id, address_label, resident_name,
//     billed, paid, balance, status: 'paid' | 'partial' | 'overdue' | 'unpaid'
//   }>
// }
```

### PATCH `/api/alerts/[id]/acknowledge`

```typescript
// Body: {} (no body needed — actor identified by session)
// Auth: guard or admin
// Steps:
// 1. Verify session
// 2. Check role = 'guard' | 'admin'
// 3. UPDATE emergency_alerts SET status='responding', acknowledged_by=uid, acknowledged_at=NOW()
//    WHERE id=$1 AND status='open'  ← atomic condition prevents double-acknowledge
// 4. If 0 rows updated → return 409 Conflict "Already acknowledged"
// 5. Write audit log
```

### PATCH `/api/alerts/[id]/resolve`

```typescript
// Body: { status: 'resolved' | 'false_alarm', resolution_note?: string }
// Auth: guard or admin
// Steps:
// 1. Validate body
// 2. Check role
// 3. UPDATE WHERE status = 'responding' (or 'open' for false_alarm)
// 4. Set resolved_at, resolution_note
// 5. Audit log
```

### POST `/api/users/assign-role`

```typescript
// Body: { user_id, role: 'resident' | 'admin' | 'guard' }
// Auth: admin only
// Steps:
// 1. Validate body
// 2. Verify caller is admin
// 3. UPDATE profiles SET role=$role WHERE id=$user_id
// 4. Update auth.users metadata via supabaseAdmin (service role)
// 5. Audit log (action: ASSIGN_ROLE, old_value: {role: prev}, new_value: {role: new})
```

### POST `/api/cron/late-fees`

```typescript
// Header: Authorization: Bearer ${CRON_SECRET}
// Validates secret before running late fee logic
// Can also be triggered manually by admin from the reports page
```

---

## 6. Supabase Realtime Channels

| Channel | Table | Event | Consumers |
|---------|-------|-------|-----------|
| `announcements-feed` | `announcements` | INSERT, UPDATE | All authenticated users |
| `emergency-alerts-guard` | `emergency_alerts` | INSERT | Guards, Admins |
| `emergency-alerts-status` | `emergency_alerts` | UPDATE | Reporter (filtered by their alert ID) |

**Realtime security:** Supabase Realtime respects RLS. A resident subscribing to `emergency_alerts` will only receive events for rows they have SELECT access to (their own reports).

---

## 7. Supabase Storage

### Buckets

| Bucket | Access | Contents |
|--------|--------|---------|
| `avatars` | Private (signed URLs) | User profile photos |
| `announcements` | Private (signed URLs for authed users) | Announcement attachments |
| `receipts` | Private (owner + admin only) | Payment receipt images |

### Upload Rules

- Max file size: 5MB
- Allowed types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- File naming: `{bucket}/{user_id}/{uuid}.{ext}` — never user-provided filenames
- Cleanup: Announcement attachments orphaned for > 90 days should be purged (scheduled Edge Function)

---

## 8. Audit Log Action Strings

Use these exact strings for the `action` field in `audit_logs`:

```
CREATE_PAYMENT
CREATE_ANNOUNCEMENT
UPDATE_ANNOUNCEMENT
DELETE_ANNOUNCEMENT       (soft delete)
CREATE_EMERGENCY_ALERT
ACKNOWLEDGE_ALERT
RESOLVE_ALERT
ASSIGN_ROLE
UPDATE_UNIT
CREATE_UNIT
LOG_VISITOR
UPDATE_PROFILE
```

---

## 9. Backend Don'ts

- **Never perform balance calculations in JavaScript.** Balance is computed via SQL aggregation. Return the computed value from the DB.
- **Never allow direct client INSERT into `payments`.** All payment writes go through `/api/payments/record`.
- **Never allow direct client UPDATE of `profiles.role`.** Role changes go through `/api/users/assign-role`.
- **Never skip audit logging** for any write operation in a custom API route.
- **Never hard-delete payment records.** No DELETE on `payments` table, ever.
- **Never store monetary values as FLOAT or DECIMAL.** INTEGER centavos only.
- **Never disable RLS** on any table, even temporarily in production.
- **Never use the service role key in client components.** It bypasses all RLS.
- **Never allow emergency alert status to skip steps** (open must go to responding before resolved, except for false_alarm).
- **Never allow the automated dues cron to run twice** for the same unit/billing_period — always check for existing charge before inserting.
