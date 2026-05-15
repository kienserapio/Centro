# Centro Backend Summary

## Schema Overview
- Core tables: profiles, units, unit_residents, dues, payments, payment_allocations, announcements, announcement_reads, emergency_alerts, visitors, audit_logs, phases
- All tables use UUID primary keys and created_at timestamps; updated_at is auto-managed where mutable
- Monetary fields use NUMERIC(12,2) with non-negative checks
- Soft delete fields: profiles, units, dues, announcements, emergency_alerts, visitors
- Phases normalized via phases table (units.phase_id, announcements.target_phase_id)

## Auth + Profiles
- Profiles are created only via auth trigger
- Username sanitized and collision-safe
- Role defaults to resident; admin/guard assigned manually

## RLS Summary
- Deny-by-default on all tables
- Ownership based on unit_residents for residents
- Admin override access for all business tables
- Guard/staff limited to visitors, emergency_alerts, announcements (read)
- Audit logs are append-only (select admin only)

## Storage
- UI includes profile photo selection but no storage logic is implemented yet
- When storage is implemented, prefer a private bucket for avatars and store avatar_url on profiles

## Edge Functions
- None required by current frontend

## Known Frontend Mismatches
- Sidebar profile and residents API currently join profiles.unit_id, which was removed in favor of unit_residents. Update server queries to join via unit_residents.
- Announcements DELETE route hard-deletes; backend expects soft delete via deleted_at.
- Dues and payments are mocked in UI; no API routes currently exist.
- Resident emergency button is UI-only; no client insert call exists yet.
