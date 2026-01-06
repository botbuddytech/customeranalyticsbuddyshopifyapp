-- ============================================
-- Add RLS Policy for onboarding_progress table
-- ============================================
-- Run this SQL in Supabase Dashboard → SQL Editor
-- This enables RLS and creates a policy for the onboarding_progress table
-- ============================================

-- Enable RLS on onboarding_progress table
ALTER TABLE "onboarding_progress" ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "shop_access_onboarding_progress" ON "onboarding_progress";

-- Create RLS policy for onboarding_progress
-- Allows SELECT, INSERT, UPDATE, DELETE only for rows where shop matches JWT claim
CREATE POLICY "shop_access_onboarding_progress"
ON "onboarding_progress"
FOR ALL
USING (
  shop = coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::json->>'shop',
    ''
  )
)
WITH CHECK (
  shop = coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::json->>'shop',
    ''
  )
);

