-- Supabase migration: initial schema (idempotent)

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- Enum types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
    CREATE TYPE user_role_enum AS ENUM ('resident', 'admin', 'guard');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resident_type_enum') THEN
    CREATE TYPE resident_type_enum AS ENUM ('owner', 'tenant', 'staff', 'admin');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'unit_type_enum') THEN
    CREATE TYPE unit_type_enum AS ENUM ('owned', 'rented', 'vacant');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'announcement_category_enum') THEN
    CREATE TYPE announcement_category_enum AS ENUM (
      'general', 'utility', 'security', 'meeting', 'emergency'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'announcement_priority_enum') THEN
    CREATE TYPE announcement_priority_enum AS ENUM (
      'low', 'medium', 'high', 'emergency'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_type_enum') THEN
    CREATE TYPE incident_type_enum AS ENUM (
      'medical', 'fire', 'intrusion', 'suspicious', 'other'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_status_enum') THEN
    CREATE TYPE incident_status_enum AS ENUM (
      'open', 'responding', 'resolved', 'false_alarm'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_transaction_enum') THEN
    DROP TYPE payment_transaction_enum CASCADE;
  END IF;
END$$;

CREATE TYPE payment_transaction_enum AS ENUM (
  'payment', 'late_fee', 'adjustment', 'refund'
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
    CREATE TYPE payment_status_enum AS ENUM (
      'pending', 'completed', 'failed', 'voided'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visitor_purpose_enum') THEN
    CREATE TYPE visitor_purpose_enum AS ENUM (
      'personal', 'delivery', 'repair', 'other'
    );
  END IF;
END$$;

-- Tables (dependency-safe order)

CREATE TABLE IF NOT EXISTS phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username CITEXT UNIQUE NOT NULL,
  resident_type resident_type_enum NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'resident',
  full_name TEXT,
  email CITEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_number TEXT NOT NULL,
  lot_number TEXT NOT NULL,
  address_label TEXT NOT NULL,
  phase_id UUID REFERENCES phases(id) ON DELETE SET NULL,
  unit_type unit_type_enum NOT NULL DEFAULT 'owned',
  monthly_dues NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (monthly_dues >= 0),
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (block_number, lot_number)
);

CREATE TABLE IF NOT EXISTS unit_residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resident_type resident_type_enum NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (unit_id, profile_id)
);

CREATE TABLE IF NOT EXISTS dues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  status TEXT NOT NULL DEFAULT 'pending',
  due_date DATE NOT NULL,
  billing_period DATE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CHECK (amount_paid <= amount)
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  recorded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  transaction_type payment_transaction_enum NOT NULL,
  status payment_status_enum NOT NULL DEFAULT 'completed',
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  description TEXT NOT NULL,
  reference_no TEXT,
  billing_period DATE,
  due_date DATE,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_allocations (
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  due_id UUID NOT NULL REFERENCES dues(id) ON DELETE RESTRICT,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (payment_id, due_id)
);

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category announcement_category_enum NOT NULL DEFAULT 'general',
  priority announcement_priority_enum NOT NULL DEFAULT 'medium',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  target_phase_id UUID REFERENCES phases(id) ON DELETE SET NULL,
  attachment_url TEXT,
  expires_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS announcement_reads (
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (announcement_id, user_id)
);

CREATE TABLE IF NOT EXISTS emergency_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  incident_type incident_type_enum NOT NULL,
  description TEXT,
  location_note TEXT,
  latitude DOUBLE PRECISION CHECK (latitude BETWEEN -90 AND 90),
  longitude DOUBLE PRECISION CHECK (longitude BETWEEN -180 AND 180),
  status incident_status_enum NOT NULL DEFAULT 'open',
  acknowledged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolution_note TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  host_label TEXT,
  pre_registered_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  visitor_name TEXT NOT NULL,
  purpose visitor_purpose_enum NOT NULL DEFAULT 'personal',
  vehicle_plate TEXT,
  logged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  time_in TIMESTAMPTZ NOT NULL DEFAULT now(),
  time_out TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CHECK (time_out IS NULL OR time_out >= time_in)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Updated-at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS trg_phases_updated_at ON phases;
CREATE TRIGGER trg_phases_updated_at
BEFORE UPDATE ON phases
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_units_updated_at ON units;
CREATE TRIGGER trg_units_updated_at
BEFORE UPDATE ON units
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_dues_updated_at ON dues;
CREATE TRIGGER trg_dues_updated_at
BEFORE UPDATE ON dues
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_payments_updated_at ON payments;
CREATE TRIGGER trg_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_announcements_updated_at ON announcements;
CREATE TRIGGER trg_announcements_updated_at
BEFORE UPDATE ON announcements
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_emergency_alerts_updated_at ON emergency_alerts;
CREATE TRIGGER trg_emergency_alerts_updated_at
BEFORE UPDATE ON emergency_alerts
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_visitors_updated_at ON visitors;
CREATE TRIGGER trg_visitors_updated_at
BEFORE UPDATE ON visitors
FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- Indexes (foreign keys, filters, and timestamps)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at);

CREATE INDEX IF NOT EXISTS idx_units_phase_id ON units(phase_id);
CREATE INDEX IF NOT EXISTS idx_units_owner_id ON units(owner_id);
CREATE INDEX IF NOT EXISTS idx_units_created_at ON units(created_at);
CREATE INDEX IF NOT EXISTS idx_units_deleted_at ON units(deleted_at);

CREATE INDEX IF NOT EXISTS idx_unit_residents_unit_id ON unit_residents(unit_id);
CREATE INDEX IF NOT EXISTS idx_unit_residents_profile_id ON unit_residents(profile_id);
CREATE INDEX IF NOT EXISTS idx_unit_residents_created_at ON unit_residents(created_at);
CREATE UNIQUE INDEX IF NOT EXISTS unique_primary_resident_per_unit
ON unit_residents(unit_id)
WHERE is_primary = TRUE;

CREATE INDEX IF NOT EXISTS idx_dues_unit_id ON dues(unit_id);
CREATE INDEX IF NOT EXISTS idx_dues_created_by ON dues(created_by);
CREATE INDEX IF NOT EXISTS idx_dues_created_at ON dues(created_at);
CREATE INDEX IF NOT EXISTS idx_dues_due_date ON dues(due_date);
CREATE INDEX IF NOT EXISTS idx_dues_billing_period ON dues(billing_period);
CREATE INDEX IF NOT EXISTS idx_dues_deleted_at ON dues(deleted_at);
CREATE INDEX IF NOT EXISTS idx_dues_unit_status ON dues(unit_id, status);

CREATE INDEX IF NOT EXISTS idx_payments_unit_id ON payments(unit_id);
CREATE INDEX IF NOT EXISTS idx_payments_recorded_by ON payments(recorded_by);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_billing_period ON payments(billing_period);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_unit_created ON payments(unit_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_allocations_payment_id ON payment_allocations(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_allocations_due_id ON payment_allocations(due_id);

CREATE INDEX IF NOT EXISTS idx_announcements_author_id ON announcements(author_id);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements(category);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);
CREATE INDEX IF NOT EXISTS idx_announcements_deleted_at ON announcements(deleted_at);
CREATE INDEX IF NOT EXISTS idx_announcements_target_phase_id ON announcements(target_phase_id);
CREATE INDEX IF NOT EXISTS idx_announcements_expires_at ON announcements(expires_at);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(deleted_at, expires_at, created_at);

CREATE INDEX IF NOT EXISTS idx_announcement_reads_user_id ON announcement_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_announcement_id ON announcement_reads(announcement_id);

CREATE INDEX IF NOT EXISTS idx_emergency_alerts_reporter_id ON emergency_alerts(reporter_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_unit_id ON emergency_alerts(unit_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status ON emergency_alerts(status);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_created_at ON emergency_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_deleted_at ON emergency_alerts(deleted_at);

CREATE INDEX IF NOT EXISTS idx_visitors_host_unit_id ON visitors(host_unit_id);
CREATE INDEX IF NOT EXISTS idx_visitors_pre_registered_by ON visitors(pre_registered_by);
CREATE INDEX IF NOT EXISTS idx_visitors_logged_by ON visitors(logged_by);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors(created_at);
CREATE INDEX IF NOT EXISTS idx_visitors_deleted_at ON visitors(deleted_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
