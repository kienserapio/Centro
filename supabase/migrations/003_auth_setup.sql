-- Supabase migration: auth setup (idempotent)

-- Secure profile bootstrap on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  raw_username TEXT;
  final_username TEXT;
  candidate_suffix TEXT;
  candidate_resident_type resident_type_enum;
BEGIN
  -- Handle nullable email (OAuth providers may not supply email)
  IF NEW.email IS NULL OR NEW.email = '' THEN
    base_username := 'user';
  ELSE
    base_username := split_part(NEW.email, '@', 1);
  END IF;

  -- Prefer metadata username when provided
  raw_username := COALESCE(NULLIF(NEW.raw_user_meta_data->>'username', ''), base_username);

  -- Normalize and sanitize username
  final_username := regexp_replace(
    lower(trim(raw_username)),
    '[^a-z0-9_]',
    '',
    'g'
  );

  IF final_username IS NULL OR final_username = '' THEN
    final_username := 'user';
  END IF;

  -- Validate resident_type metadata; fallback safely
  BEGIN
    candidate_resident_type := COALESCE(
      (NEW.raw_user_meta_data->>'resident_type')::resident_type_enum,
      'tenant'
    );
  EXCEPTION WHEN others THEN
    candidate_resident_type := 'tenant';
  END;

  -- Resolve username collisions by appending a random suffix
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    candidate_suffix := (FLOOR(random() * 9000) + 1000)::INT::TEXT;
    final_username := final_username || '_' || candidate_suffix;
  END LOOP;

  INSERT INTO public.profiles (
    id,
    email,
    username,
    resident_type,
    role
  ) VALUES (
    NEW.id,
    NEW.email,
    final_username,
    candidate_resident_type,
    'resident'
  );

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'SECURITY DEFINER: creates a profile row from auth.users on signup with safe defaults and sanitized username.';

-- Recreate trigger safely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Helper role-check functions for RLS (SECURITY DEFINER + locked search_path)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
SELECT EXISTS (
  SELECT 1
  FROM public.profiles
  WHERE id = auth.uid()
    AND role = 'admin'
    AND deleted_at IS NULL
);
$$;

COMMENT ON FUNCTION public.is_admin() IS
  'SECURITY DEFINER helper for RLS role checks.';

CREATE OR REPLACE FUNCTION public.is_guard()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
SELECT EXISTS (
  SELECT 1
  FROM public.profiles
  WHERE id = auth.uid()
    AND role = 'guard'
    AND deleted_at IS NULL
);
$$;

COMMENT ON FUNCTION public.is_guard() IS
  'SECURITY DEFINER helper for RLS role checks.';

CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
SELECT EXISTS (
  SELECT 1
  FROM public.profiles
  WHERE id = auth.uid()
    AND role IN ('admin', 'guard')
    AND deleted_at IS NULL
);
$$;

COMMENT ON FUNCTION public.is_staff_or_admin() IS
  'SECURITY DEFINER helper for RLS role checks.';

CREATE OR REPLACE FUNCTION public.is_profile_owner(profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
SELECT auth.uid() = profile_id;
$$;

COMMENT ON FUNCTION public.is_profile_owner(UUID) IS
  'SECURITY DEFINER helper for ownership checks in RLS policies.';

-- Restrict helper function execution (least privilege)
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_guard() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_staff_or_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_profile_owner(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_guard() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff_or_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_profile_owner(UUID) TO authenticated;

-- Auth-related indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role_active
  ON public.profiles(role, is_active)
  WHERE deleted_at IS NULL;

-- Enforce unique email (Supabase Auth expects unique emails)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_email_unique'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_email_unique UNIQUE (email);
  END IF;
END$$;

COMMENT ON TABLE public.profiles IS
  'Profiles are created only via auth trigger; client inserts are denied by RLS.';
