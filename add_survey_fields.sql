-- Migration to add survey data fields to cancellations table
-- Run this against your Supabase database to add the missing columns

-- Add the missing columns (including visa_type and has_lawyer if they don't exist)
ALTER TABLE cancellations ADD COLUMN IF NOT EXISTS visa_type TEXT;
ALTER TABLE cancellations ADD COLUMN IF NOT EXISTS has_lawyer BOOLEAN;
ALTER TABLE cancellations ADD COLUMN IF NOT EXISTS roles_applied TEXT;
ALTER TABLE cancellations ADD COLUMN IF NOT EXISTS companies_emailed TEXT;
ALTER TABLE cancellations ADD COLUMN IF NOT EXISTS companies_interviewed TEXT;

-- Update the RLS policy to include validation for new fields
DROP POLICY IF EXISTS "Users can update own cancellations" ON cancellations;

CREATE POLICY "Users can update own cancellations" ON cancellations
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    (reason IS NULL OR length(reason) <= 500) AND
    (feedback_text IS NULL OR length(feedback_text) <= 2000) AND
    (visa_type IS NULL OR length(visa_type) <= 100) AND
    (roles_applied IS NULL OR length(roles_applied) <= 20) AND
    (companies_emailed IS NULL OR length(companies_emailed) <= 20) AND
    (companies_interviewed IS NULL OR length(companies_interviewed) <= 20) AND
    accepted_downsell IS NOT NULL AND
    (final_outcome IS NULL OR final_outcome IN ('cancelled', 'continued', 'downsell_accepted', 'pending-cancellation'))
  );