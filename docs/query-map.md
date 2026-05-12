# Centro Frontend -> Supabase Query Map

This document maps actual frontend features to Supabase queries required by the current codebase. All queries respect RLS and avoid service role usage in client code. Server-side API routes may use the service role key where already implemented.

## Auth and Session Patterns

### Client initialization
- File: src/lib/supabase/client.ts
- Purpose: browser client for auth + data

```ts
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
```

### Server initialization (API routes)
- File: src/lib/supabase/server.ts
- Purpose: server client with cookies

```ts
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
```

### Sign in (email + password)
- Feature: Login
- Frontend file: src/app/(auth)/login/page.tsx
- RLS scope: authenticated
- Tables: profiles
- Operations: SELECT

```ts
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email,
  password,
});

const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", authData.user.id)
  .single();
```

### Get current user
- Feature: Profile hydration and route protection
- Frontend file: src/app/(dashboard)/_components/SidebarUserProfile.tsx
- RLS scope: authenticated
- Tables: profiles, units, unit_residents
- Operations: SELECT

```ts
const {
  data: { user },
} = await supabase.auth.getUser();
```

### Sign out
- Feature: Sign out
- Frontend file: src/app/(dashboard)/_components/SidebarUserProfile.tsx
- Operations: auth

```ts
await supabase.auth.signOut();
```

## Feature Map

### Sidebar user profile
- Feature Name: Current user profile card
- Frontend File: src/app/(dashboard)/_components/SidebarUserProfile.tsx
- Purpose: Show name, role, and unit address
- RLS Scope: authenticated, own profile
- Required Tables: profiles, unit_residents, units
- Operations: SELECT

```ts
const { data } = await supabase
  .from("profiles")
  .select(
    `
    full_name,
    role,
    avatar_url,
    unit_residents:unit_residents (
      unit:units (block_number, lot_number, address_label, unit_type, phase_id)
    )
  `
  )
  .eq("id", user.id)
  .single();
```

Notes:
- The current code joins via profiles.unit_id, which no longer exists. Backend should join through unit_residents.

### Admin users list
- Feature Name: Roles & Permissions list
- Frontend File: src/app/(dashboard)/admin/roles/page.tsx
- Purpose: List all user profiles
- RLS Scope: admin (server route uses service role)
- Required Tables: profiles
- Operations: SELECT

Client call:
```ts
const res = await fetch("/api/admin/users");
```

Server query (route: src/app/api/admin/users/route.ts):
```ts
const { data, error } = await supabase
  .from("profiles")
  .select("id, full_name, role, phone, avatar_url, is_active, created_at")
  .order("created_at", { ascending: false });
```

### Admin update/delete user
- Feature Name: Edit or remove user
- Frontend File: src/app/(dashboard)/admin/roles/page.tsx
- Purpose: Update profile fields or remove user
- RLS Scope: admin (server route)
- Required Tables: profiles, units, unit_residents
- Operations: UPDATE, DELETE

Client calls:
```ts
await fetch(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify({...}) });
await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
```

Server query (route: src/app/api/admin/users/[id]/route.ts):
```ts
const { data, error } = await supabase
  .from("profiles")
  .update({ full_name, phone, role })
  .eq("id", id)
  .select()
  .single();
```

Notes:
- The current API updates units.owner_id to reflect resident_type changes. With unit_residents, update the junction table instead of units.owner_id.

### Admin create user / resident
- Feature Name: Add User / Add Resident
- Frontend File: src/app/(dashboard)/admin/roles/_components/AddUserModal.tsx
- Frontend File: src/app/(dashboard)/admin/residents/_components/AddResidentModal.tsx
- Purpose: Create auth user + profile + unit linkage
- RLS Scope: admin (server route uses service role)
- Required Tables: auth.users, profiles, units, unit_residents, phases
- Operations: INSERT, UPDATE

Client call:
```ts
await fetch("/api/admin/create-user", {
  method: "POST",
  body: JSON.stringify({
    email,
    password,
    full_name,
    username,
    role,
    phone,
    resident_type,
    unit: { phase, block_number, lot_number, address_label }
  }),
});
```

Server operations (route: src/app/api/admin/create-user/route.ts):
1) auth.admin.createUser (service role)
2) upsert or create unit by block/lot/phase
3) link resident to unit

Supabase queries (server-side examples):
```ts
// Create auth user
await supabaseAdmin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name, username, role, phone, resident_type },
});

// Lookup unit by block/lot/phase
const unitLookup = supabaseAdmin
  .from("units")
  .select("id")
  .eq("block_number", cleanBlock)
  .eq("lot_number", cleanLot)
  .limit(1);

const { data: foundUnits } = cleanPhase
  ? await unitLookup.eq("phase_id", phaseId)
  : await unitLookup;

// Insert unit if needed
const { data: insertedUnit } = await supabaseAdmin
  .from("units")
  .insert({
    block_number: cleanBlock,
    lot_number: cleanLot,
    phase_id: phaseId,
    address_label,
    unit_type,
    owner_id: normalizedResidentType === "owner" ? newUser.user.id : null,
  })
  .select("id")
  .single();

// Create resident relationship
await supabaseAdmin
  .from("unit_residents")
  .insert({
    unit_id: unitId,
    profile_id: newUser.user.id,
    resident_type: normalizedResidentType,
    is_primary: true,
  });
```

### Admin residents directory
- Feature Name: Resident list
- Frontend File: src/app/(dashboard)/admin/residents/page.tsx
- Purpose: List residents with unit address
- RLS Scope: admin (server route uses service role)
- Required Tables: profiles, unit_residents, units, phases
- Operations: SELECT

Client call:
```ts
const res = await fetch("/api/admin/residents");
```

Server query (recommended update for new schema):
```ts
const { data, error } = await supabase
  .from("profiles")
  .select(`
    id,
    full_name,
    role,
    phone,
    avatar_url,
    is_active,
    created_at,
    unit_residents:unit_residents (
      resident_type,
      unit:units (id, block_number, lot_number, address_label, unit_type, phase_id)
    )
  `)
  .eq("role", "resident")
  .order("created_at", { ascending: false });
```

### Admin announcements list
- Feature Name: Admin announcements list
- Frontend File: src/app/(dashboard)/admin/posts/page.tsx
- Purpose: Fetch all announcements
- RLS Scope: admin
- Required Tables: announcements
- Operations: SELECT

```ts
const { data, error } = await supabase
  .from("announcements")
  .select("*")
  .is("deleted_at", null)
  .order("created_at", { ascending: false });
```

### Admin announcements create
- Feature Name: Create announcement
- Frontend File: src/app/(dashboard)/admin/posts/page.tsx
- Purpose: Create community post
- RLS Scope: admin
- Required Tables: announcements
- Operations: INSERT

```ts
const { data, error } = await supabase
  .from("announcements")
  .insert({
    title,
    body,
    category,
    priority,
    is_pinned,
    author_id: user.id,
  })
  .select()
  .single();
```

### Admin announcements update
- Feature Name: Edit announcement
- Frontend File: src/app/(dashboard)/admin/posts/_components/EditAnnouncementModal.tsx
- Purpose: Update fields and pin status
- RLS Scope: admin
- Required Tables: announcements
- Operations: UPDATE

```ts
const { data, error } = await supabase
  .from("announcements")
  .update({ title, body, category, priority, is_pinned })
  .eq("id", announcementId)
  .select()
  .single();
```

### Admin announcements delete (soft delete)
- Feature Name: Delete announcement
- Frontend File: src/app/(dashboard)/admin/posts/page.tsx
- Purpose: Soft delete announcement
- RLS Scope: admin
- Required Tables: announcements
- Operations: UPDATE

```ts
const { error } = await supabase
  .from("announcements")
  .update({ deleted_at: new Date().toISOString() })
  .eq("id", announcementId);
```

### Admin quick post / upcoming events
- Feature Name: Quick post + events list
- Frontend File: src/app/(dashboard)/admin/_components/QuickPost.tsx
- Frontend File: src/app/(dashboard)/admin/_components/UpcomingEvents.tsx
- Purpose: Create post + filter meeting posts
- RLS Scope: admin
- Required Tables: announcements
- Operations: INSERT, SELECT

```ts
const { data, error } = await supabase
  .from("announcements")
  .select("id, title, body, category, priority, is_pinned, created_at")
  .eq("category", "meeting")
  .is("deleted_at", null)
  .order("created_at", { ascending: false })
  .range(0, 9);
```

### Resident announcements feed
- Feature Name: Community feed + announcements page
- Frontend File: src/app/(dashboard)/resident/_components/CommunityFeed.tsx
- Frontend File: src/app/(dashboard)/resident/announcements/page.tsx
- Purpose: Fetch announcements for display and filters
- RLS Scope: authenticated (resident)
- Required Tables: announcements
- Operations: SELECT

```ts
const { data, error, count } = await supabase
  .from("announcements")
  .select("id, title, body, category, priority, is_pinned, created_at", { count: "exact" })
  .is("deleted_at", null)
  .or("expires_at.is.null,expires_at.gt.now")
  .order("is_pinned", { ascending: false })
  .order("created_at", { ascending: false })
  .range(from, to);
```

### Announcement read tracking
- Feature Name: Mark announcement read
- Frontend File: (not yet implemented)
- Purpose: Track which announcements a user has read
- RLS Scope: authenticated
- Required Tables: announcement_reads
- Operations: INSERT

```ts
const { error } = await supabase
  .from("announcement_reads")
  .insert({ announcement_id, user_id: user.id });
```

### Admin stats cards (resident count)
- Feature Name: Resident count
- Frontend File: src/app/(dashboard)/admin/_components/StatsCards.tsx
- Purpose: Count residents
- RLS Scope: admin (server route uses service role)
- Required Tables: profiles
- Operations: SELECT (count)

Server query example:
```ts
const { count } = await supabase
  .from("profiles")
  .select("id", { count: "exact", head: true })
  .eq("role", "resident")
  .is("deleted_at", null);
```

### Admin dues: resident list for billing
- Feature Name: Resident selector for billing
- Frontend File: src/app/(dashboard)/admin/dues/_components/AddBillModal.tsx
- Purpose: Populate resident list
- RLS Scope: admin (server route uses service role)
- Required Tables: profiles, unit_residents, units
- Operations: SELECT

```ts
const { data, error } = await supabase
  .from("profiles")
  .select(`
    id,
    full_name,
    unit_residents:unit_residents (
      unit:units (block_number, lot_number, unit_type)
    )
  `)
  .eq("role", "resident")
  .is("deleted_at", null)
  .order("created_at", { ascending: false });
```

### Resident dues dashboard
- Feature Name: Dues summary + pending + payment history
- Frontend File: src/app/(dashboard)/resident/dues/page.tsx
- Purpose: Show ledger summary
- RLS Scope: authenticated
- Required Tables: dues, payments, payment_allocations, units, unit_residents
- Operations: SELECT

Examples (read-only):
```ts
const { data: dues } = await supabase
  .from("dues")
  .select("id, description, amount, amount_paid, due_date, status")
  .eq("unit_id", unitId)
  .is("deleted_at", null)
  .order("due_date", { ascending: true });

const { data: payments } = await supabase
  .from("payments")
  .select("id, amount, status, description, created_at")
  .eq("unit_id", unitId)
  .order("created_at", { ascending: false })
  .range(0, 19);
```

### Emergency alerts (resident)
- Feature Name: Submit emergency alert
- Frontend File: src/app/(dashboard)/resident/_components/EmergencyButton.tsx
- Purpose: Create emergency alert
- RLS Scope: authenticated
- Required Tables: emergency_alerts
- Operations: INSERT

```ts
const { data, error } = await supabase
  .from("emergency_alerts")
  .insert({
    reporter_id: user.id,
    unit_id,
    incident_type,
    description,
    location_note,
  })
  .select()
  .single();
```

### Emergency alerts (guards/admins)
- Feature Name: Guard command center alerts
- Frontend File: src/app/(dashboard)/security/_components/ActiveEmergencies.tsx
- Purpose: List and update alerts
- RLS Scope: staff/admin
- Required Tables: emergency_alerts
- Operations: SELECT, UPDATE

```ts
const { data } = await supabase
  .from("emergency_alerts")
  .select("*")
  .is("deleted_at", null)
  .in("status", ["open", "responding"])
  .order("created_at", { ascending: false })
  .range(0, 24);

const { error } = await supabase
  .from("emergency_alerts")
  .update({ status: "responding", acknowledged_by: user.id, acknowledged_at: new Date().toISOString() })
  .eq("id", alertId)
  .eq("status", "open");
```

### Visitors (resident pre-registration)
- Feature Name: Pre-register visitor
- Frontend File: src/app/(dashboard)/security/visitors/_components/LogVisitorModal.tsx (mock)
- Purpose: Create visitor record
- RLS Scope: authenticated
- Required Tables: visitors
- Operations: INSERT

```ts
const { data, error } = await supabase
  .from("visitors")
  .insert({
    host_unit_id: unitId,
    host_label,
    pre_registered_by: user.id,
    visitor_name,
    purpose,
    vehicle_plate,
  })
  .select()
  .single();
```

### Visitors (guards/admins)
- Feature Name: Check-in / check-out visitor
- Frontend File: src/app/(dashboard)/security/visitors/_components/VisitorLogTable.tsx (mock)
- Purpose: Update visitor status
- RLS Scope: staff/admin
- Required Tables: visitors
- Operations: UPDATE, SELECT

```ts
const { data } = await supabase
  .from("visitors")
  .select("*")
  .is("deleted_at", null)
  .order("time_in", { ascending: false })
  .range(0, 24);

const { error } = await supabase
  .from("visitors")
  .update({ logged_by: user.id, time_out: new Date().toISOString() })
  .eq("id", visitorId)
  .is("time_out", null);
```

### Units directory (guards)
- Feature Name: Unit directory search
- Frontend File: src/app/(dashboard)/security/units/_components/UnitGrid.tsx (mock)
- Purpose: Search units by block/lot or resident name
- RLS Scope: guard
- Required Tables: units, unit_residents, profiles
- Operations: SELECT, filtering, pagination

```ts
const { data } = await supabase
  .from("units")
  .select(`
    id,
    block_number,
    lot_number,
    unit_type,
    unit_residents:unit_residents (
      profile:profiles (full_name, phone)
    )
  `)
  .is("deleted_at", null)
  .order("block_number", { ascending: true })
  .range(from, to);
```

### Admin and resident pages without backend data
These pages currently use static or mocked data and have no Supabase queries yet:
- src/app/(dashboard)/security/incidents/_components/IncidentTable.tsx
- src/app/(dashboard)/security/visitors/_components/VisitorStatsCards.tsx
- src/app/(dashboard)/security/_components/ActivityStream.tsx
- src/app/(dashboard)/resident/_components/AccountPanel.tsx
- src/app/(dashboard)/resident/_components/QuickActions.tsx
- src/app/(dashboard)/resident/dues/_components/DuesSummary.tsx
- src/app/(dashboard)/resident/dues/_components/PendingPayments.tsx
- src/app/(dashboard)/resident/dues/_components/PaymentHistory.tsx

## Realtime Subscriptions
No realtime subscriptions exist in the current frontend code. If enabled later, target:
- announcements
- emergency_alerts
- visitors

## Storage
No Supabase Storage uploads are implemented in the current frontend code. When added, map to:
- profile avatars: avatars/{user_id}/profile.jpg
- announcement attachments: announcements/{announcement_id}/{filename}
