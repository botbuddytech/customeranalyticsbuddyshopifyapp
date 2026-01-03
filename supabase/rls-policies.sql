-- ============================================
-- Supabase Row Level Security (RLS) Policies
-- ============================================
-- Run this SQL in Supabase Dashboard → SQL Editor
-- This enables RLS and creates policies for shop-based access control
-- ============================================

-- ============================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE "onboardingtaskdata" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dashboard_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "saved_customer_lists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "onboarding_progress" ENABLE ROW LEVEL SECURITY;


-- ============================================
-- 2. DROP EXISTING POLICIES (if re-running)
-- ============================================

DROP POLICY IF EXISTS "shop_access_onboardingtaskdata" ON "onboardingtaskdata";
DROP POLICY IF EXISTS "shop_access_dashboard_preferences" ON "dashboard_preferences";
DROP POLICY IF EXISTS "shop_access_saved_customer_lists" ON "saved_customer_lists";
DROP POLICY IF EXISTS "shop_access_onboarding_progress" ON "onboarding_progress";


-- ============================================
-- 3. CREATE RLS POLICIES
-- ============================================

-- Policy for onboardingtaskdata (Config model)
-- Allows SELECT, INSERT, UPDATE, DELETE only for rows where shop matches JWT claim
CREATE POLICY "shop_access_onboardingtaskdata"
ON "onboardingtaskdata"
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


-- Policy for dashboard_preferences
CREATE POLICY "shop_access_dashboard_preferences"
ON "dashboard_preferences"
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


-- Policy for saved_customer_lists
CREATE POLICY "shop_access_saved_customer_lists"
ON "saved_customer_lists"
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

-- Policy for onboarding_progress
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


-- ============================================
-- 4. VERIFY RLS IS ENABLED
-- ============================================

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('onboardingtaskdata', 'dashboard_preferences', 'saved_customer_lists', 'onboarding_progress');


-- ============================================
-- 5. VIEW CREATED POLICIES
-- ============================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('onboardingtaskdata', 'dashboard_preferences', 'saved_customer_lists', 'onboarding_progress');

