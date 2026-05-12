-- Supabase migration: RLS policies (idempotent)

-- Enable RLS on all tables
ALTER TABLE public.phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Force RLS on critical tables
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.payments FORCE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;

-- PHASES
-- Authenticated read-only; admins manage.
DROP POLICY IF EXISTS phases_select_authenticated ON public.phases;
CREATE POLICY phases_select_authenticated
  ON public.phases
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS phases_admin_all ON public.phases;
CREATE POLICY phases_admin_all
  ON public.phases
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- PROFILES
-- Users can read/update their own profile; admins can manage all.
-- No client INSERT policies (profiles created only via auth trigger/service role).
-- Soft deletes are intentional; hard deletes reserved for admins/service role.
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_profile_owner(id) AND deleted_at IS NULL);

DROP POLICY IF EXISTS profiles_select_admin ON public.profiles;
CREATE POLICY profiles_select_admin
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_profile_owner(id) AND deleted_at IS NULL)
  WITH CHECK (
    public.is_profile_owner(id)
    AND deleted_at IS NULL
    AND role = (SELECT role FROM public.profiles p2 WHERE p2.id = auth.uid())
    AND resident_type = (SELECT resident_type FROM public.profiles p2 WHERE p2.id = auth.uid())
    AND is_active = (SELECT is_active FROM public.profiles p2 WHERE p2.id = auth.uid())
    AND deleted_at = (SELECT deleted_at FROM public.profiles p2 WHERE p2.id = auth.uid())
  );

DROP POLICY IF EXISTS profiles_admin_all ON public.profiles;
CREATE POLICY profiles_admin_all
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Column-level update restrictions for profiles
REVOKE UPDATE (role, resident_type, is_active, deleted_at)
  ON public.profiles
  FROM authenticated;

GRANT UPDATE (full_name, phone, avatar_url, username)
  ON public.profiles
  TO authenticated;

-- UNITS
-- Residents can read units they belong to; guards read-only; admins manage.
DROP POLICY IF EXISTS units_select_resident ON public.units;
CREATE POLICY units_select_resident
  ON public.units
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.unit_residents ur
      WHERE ur.unit_id = units.id
        AND ur.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS units_select_guard ON public.units;
CREATE POLICY units_select_guard
  ON public.units
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL AND public.is_guard());

DROP POLICY IF EXISTS units_admin_all ON public.units;
CREATE POLICY units_admin_all
  ON public.units
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- UNIT_RESIDENTS
-- Residents can read relationships involving themselves; admins manage.
DROP POLICY IF EXISTS unit_residents_select_own ON public.unit_residents;
CREATE POLICY unit_residents_select_own
  ON public.unit_residents
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

DROP POLICY IF EXISTS unit_residents_admin_all ON public.unit_residents;
CREATE POLICY unit_residents_admin_all
  ON public.unit_residents
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- DUES
-- Residents read dues for their units only; admins manage.
-- Soft deletes are intentional; hard deletes reserved for admins/service role.
DROP POLICY IF EXISTS dues_select_resident ON public.dues;
CREATE POLICY dues_select_resident
  ON public.dues
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.unit_residents ur
      WHERE ur.unit_id = dues.unit_id
        AND ur.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS dues_admin_all ON public.dues;
CREATE POLICY dues_admin_all
  ON public.dues
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- PAYMENTS
-- Residents read payments for their units only; admins manage.
-- Ledger is immutable from clients; no DELETE policies.
DROP POLICY IF EXISTS payments_select_resident ON public.payments;
CREATE POLICY payments_select_resident
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.unit_residents ur
      WHERE ur.unit_id = payments.unit_id
        AND ur.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS payments_admin_all ON public.payments;
CREATE POLICY payments_admin_all
  ON public.payments
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- PAYMENT_ALLOCATIONS
-- Mirror payments visibility; admin-managed writes only.
DROP POLICY IF EXISTS payment_allocations_select_resident ON public.payment_allocations;
CREATE POLICY payment_allocations_select_resident
  ON public.payment_allocations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.payments p
      JOIN public.unit_residents ur ON ur.unit_id = p.unit_id
      WHERE p.id = payment_allocations.payment_id
        AND ur.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS payment_allocations_admin_all ON public.payment_allocations;
CREATE POLICY payment_allocations_admin_all
  ON public.payment_allocations
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ANNOUNCEMENTS
-- Authenticated users can read active announcements; admins manage.
-- Soft deletes are intentional; hard deletes reserved for admins/service role.
DROP POLICY IF EXISTS announcements_select_authenticated ON public.announcements;
CREATE POLICY announcements_select_authenticated
  ON public.announcements
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND (expires_at IS NULL OR expires_at > now())
    AND (
      target_phase_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.unit_residents ur
        JOIN public.units u ON u.id = ur.unit_id
        WHERE ur.profile_id = auth.uid()
          AND u.phase_id = announcements.target_phase_id
      )
    )
  );

DROP POLICY IF EXISTS announcements_admin_all ON public.announcements;
CREATE POLICY announcements_admin_all
  ON public.announcements
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ANNOUNCEMENT_READS
-- Users can read/write their own read tracking; admins manage.
-- Read-tracking is immutable from clients (no UPDATE/DELETE policies).
DROP POLICY IF EXISTS announcement_reads_select_own ON public.announcement_reads;
CREATE POLICY announcement_reads_select_own
  ON public.announcement_reads
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS announcement_reads_insert_own ON public.announcement_reads;
CREATE POLICY announcement_reads_insert_own
  ON public.announcement_reads
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS announcement_reads_admin_all ON public.announcement_reads;
CREATE POLICY announcement_reads_admin_all
  ON public.announcement_reads
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- EMERGENCY_ALERTS
-- Residents create/read alerts tied to their units; guards/admins manage all.
-- Soft deletes are intentional; hard deletes reserved for admins/service role.
DROP POLICY IF EXISTS emergency_alerts_select_resident ON public.emergency_alerts;
CREATE POLICY emergency_alerts_select_resident
  ON public.emergency_alerts
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.unit_residents ur
      WHERE ur.unit_id = emergency_alerts.unit_id
        AND ur.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS emergency_alerts_insert_resident ON public.emergency_alerts;
CREATE POLICY emergency_alerts_insert_resident
  ON public.emergency_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    reporter_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.unit_residents ur
      WHERE ur.unit_id = emergency_alerts.unit_id
        AND ur.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS emergency_alerts_staff_all ON public.emergency_alerts;
CREATE POLICY emergency_alerts_staff_all
  ON public.emergency_alerts
  FOR ALL
  TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- VISITORS
-- Residents manage visitors tied to their units; guards/admins manage all.
-- Soft deletes are intentional; hard deletes reserved for admins/service role.
DROP POLICY IF EXISTS visitors_select_resident ON public.visitors;
CREATE POLICY visitors_select_resident
  ON public.visitors
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.unit_residents ur
      WHERE ur.unit_id = visitors.host_unit_id
        AND ur.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS visitors_insert_resident ON public.visitors;
CREATE POLICY visitors_insert_resident
  ON public.visitors
  FOR INSERT
  TO authenticated
  WITH CHECK (
    pre_registered_by = auth.uid()
    AND logged_by IS NULL
    AND time_out IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.unit_residents ur
      WHERE ur.unit_id = visitors.host_unit_id
        AND ur.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS visitors_update_resident ON public.visitors;
CREATE POLICY visitors_update_resident
  ON public.visitors
  FOR UPDATE
  TO authenticated
  USING (
    deleted_at IS NULL
    AND logged_by IS NULL
    AND time_out IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.unit_residents ur
      WHERE ur.unit_id = visitors.host_unit_id
        AND ur.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    logged_by IS NULL
    AND time_out IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.unit_residents ur
      WHERE ur.unit_id = visitors.host_unit_id
        AND ur.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS visitors_staff_all ON public.visitors;
CREATE POLICY visitors_staff_all
  ON public.visitors
  FOR ALL
  TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- Column-level update restrictions for visitors
REVOKE UPDATE (host_unit_id, host_label, pre_registered_by, logged_by, time_in, time_out, deleted_at)
  ON public.visitors
  FROM authenticated;

GRANT UPDATE (visitor_name, purpose, vehicle_plate)
  ON public.visitors
  TO authenticated;

-- AUDIT_LOGS
-- Admins can read; no updates/deletes; inserts only via service role/backends.
-- Immutable by design; hard deletes reserved for service role only.
DROP POLICY IF EXISTS audit_logs_select_admin ON public.audit_logs;
CREATE POLICY audit_logs_select_admin
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- No INSERT/UPDATE/DELETE policies on audit_logs (append-only).
