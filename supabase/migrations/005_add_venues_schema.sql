-- Migration: Add venues and enabled_locations tables

-- Create venues table with all available venues in the subdivision
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create enabled_locations table to track which venues are shown to residents
CREATE TABLE IF NOT EXISTS enabled_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (venue_id)
);

-- Add updated_at triggers for venues and enabled_locations
DROP TRIGGER IF EXISTS trg_venues_updated_at ON venues;
CREATE TRIGGER trg_venues_updated_at
BEFORE UPDATE ON venues
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_enabled_locations_updated_at ON enabled_locations;
CREATE TRIGGER trg_enabled_locations_updated_at
BEFORE UPDATE ON enabled_locations
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert all venues into the venues table
INSERT INTO venues (name, category) VALUES
  ('Administration Office', 'Admin'),
  ('Maintenance & Tool Sheds', 'Facility'),
  ('Mailbox Clusters', 'Utility'),
  ('Central Park', 'Recreation'),
  ('Children''s Playground', 'Recreation'),
  ('Dog Park / Pet Area', 'Recreation'),
  ('Swimming Pool Complex', 'Sports'),
  ('Basketball Court', 'Sports'),
  ('Tennis & Pickleball Courts', 'Sports'),
  ('Badminton Courts', 'Sports'),
  ('Fitness Gym', 'Sports'),
  ('Yoga/Dance Studio', 'Sports'),
  ('Skate Park', 'Recreation'),
  ('Multi-purpose Field', 'Sports'),
  ('The Clubhouse', 'Social'),
  ('Function Halls / Ballroom', 'Social'),
  ('Gazebos & Cabanas', 'Recreation'),
  ('Barbecue/Grilling Pits', 'Recreation'),
  ('Outdoor Amphitheater', 'Social'),
  ('Co-working Space / Business Center', 'Professional')
ON CONFLICT (name) DO NOTHING;

-- Create entries in enabled_locations for all venues (default to disabled)
INSERT INTO enabled_locations (venue_id, is_enabled)
SELECT id, FALSE FROM venues
WHERE NOT EXISTS (SELECT 1 FROM enabled_locations WHERE venue_id = venues.id)
ON CONFLICT (venue_id) DO NOTHING;
