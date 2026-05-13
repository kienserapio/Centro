-- Migration: Add RLS policies for venues and enabled_locations tables

-- Enable RLS on venues and enabled_locations
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enabled_locations ENABLE ROW LEVEL SECURITY;

-- VENUES
-- Authenticated users can read all venues; admins manage.
DROP POLICY IF EXISTS venues_select_authenticated ON public.venues;
CREATE POLICY venues_select_authenticated
  ON public.venues
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS venues_admin_all ON public.venues;
CREATE POLICY venues_admin_all
  ON public.venues
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ENABLED_LOCATIONS
-- Authenticated users can read enabled locations; admins manage.
DROP POLICY IF EXISTS enabled_locations_select_authenticated ON public.enabled_locations;
CREATE POLICY enabled_locations_select_authenticated
  ON public.enabled_locations
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS enabled_locations_admin_all ON public.enabled_locations;
CREATE POLICY enabled_locations_admin_all
  ON public.enabled_locations
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
