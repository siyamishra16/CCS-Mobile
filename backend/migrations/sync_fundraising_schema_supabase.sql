-- Sync fundraising schema to current application code (safe for existing data)
-- Run this once in Supabase SQL editor.

-- Ensure required columns for current code exist
ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS applicant_full_name VARCHAR(255);
ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS applicant_email VARCHAR(255);
ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS applicant_phone VARCHAR(20);
ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS institution_name VARCHAR(255);
ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS application_type VARCHAR(20);
ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS group_member_count INTEGER;
ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS group_member_names TEXT;
ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS estimated_budget_required NUMERIC(12,2);
ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS aadhar_front_url TEXT;
ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS aadhar_back_url TEXT;
ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Keep backward compatibility with legacy fields still referenced by old schema
ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS idea_description TEXT;
ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS requested_funding NUMERIC(12,2);

-- Normalize nullability/defaults for compatibility
ALTER TABLE fundraising_applications ALTER COLUMN idea_description SET DEFAULT '';
UPDATE fundraising_applications
SET idea_description = COALESCE(idea_description, '')
WHERE idea_description IS NULL;
ALTER TABLE fundraising_applications ALTER COLUMN idea_description SET NOT NULL;

-- requested_funding is legacy; current code uses estimated_budget_required
ALTER TABLE fundraising_applications ALTER COLUMN requested_funding DROP NOT NULL;
UPDATE fundraising_applications
SET estimated_budget_required = COALESCE(estimated_budget_required, requested_funding)
WHERE estimated_budget_required IS NULL;
UPDATE fundraising_applications
SET requested_funding = COALESCE(requested_funding, estimated_budget_required)
WHERE requested_funding IS NULL;

-- Ensure event status has sensible default for current admin create flow
ALTER TABLE fundraising_events ALTER COLUMN status SET DEFAULT 'Upcoming';

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_fundraising_applications_event_title_lookup ON fundraising_applications(event_id);
CREATE INDEX IF NOT EXISTS idx_fundraising_applications_created_at ON fundraising_applications(created_at DESC);
