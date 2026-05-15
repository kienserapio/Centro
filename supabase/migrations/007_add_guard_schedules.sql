-- Guard schedules table for managing guard duty shifts

CREATE TABLE IF NOT EXISTS guard_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guard_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  shift_date DATE NOT NULL,
  shift_start_time TIME NOT NULL,
  shift_end_time TIME NOT NULL,
  post_assignment TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_guard_schedules_guard_id ON guard_schedules(guard_id);
CREATE INDEX IF NOT EXISTS idx_guard_schedules_shift_date ON guard_schedules(shift_date);
CREATE INDEX IF NOT EXISTS idx_guard_schedules_is_active ON guard_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_guard_schedules_deleted_at ON guard_schedules(deleted_at);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_guard_schedules_updated_at ON guard_schedules;
CREATE TRIGGER trg_guard_schedules_updated_at
BEFORE UPDATE ON guard_schedules
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS Policies for guard_schedules
ALTER TABLE guard_schedules ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view all schedules
CREATE POLICY "Authenticated users can view guard schedules"
ON guard_schedules
FOR SELECT
USING (auth.role() = 'authenticated');

-- Only admins can create, update, or delete schedules
CREATE POLICY "Admins can manage guard schedules"
ON guard_schedules
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
