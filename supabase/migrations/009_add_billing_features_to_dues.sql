-- Add billing_features column to dues table
ALTER TABLE dues
  ADD COLUMN IF NOT EXISTS billing_features TEXT[] DEFAULT '{}';
