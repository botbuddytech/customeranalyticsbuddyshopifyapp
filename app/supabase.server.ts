/**
 * Supabase Server Client
 *
 * ============================================
 * TWO WAYS TO ACCESS SUPABASE:
 * ============================================
 *
 * 1. WITH RLS (Recommended) - Use getSupabaseForShop() from supabase-jwt.server.ts
 *    - Uses custom JWT with shop claim
 *    - RLS policies automatically filter by shop
 *    - More secure - no risk of forgetting where clause
 *
 * 2. WITHOUT RLS (Admin) - Use supabaseAdmin from this file
 *    - Bypasses RLS using service_role key
 *    - Use only for migrations, admin tasks, or when RLS isn't set up yet
 *    - ⚠️ You must manually filter by shop in every query!
 *
 * ============================================
 */

import { createClient } from "@supabase/supabase-js";

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!SUPABASE_URL) {
  console.warn(
    "⚠️ SUPABASE_URL is not set. Supabase features will be disabled.",
  );
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "⚠️ SUPABASE_SERVICE_ROLE_KEY is not set. Admin client will be disabled.",
  );
}

/**
 * Supabase Admin Client (bypasses RLS)
 *
 * ⚠️ WARNING: This client bypasses Row Level Security!
 * Only use for:
 * - Database migrations
 * - Admin operations
 * - When RLS policies aren't configured yet
 *
 * For normal operations, use getSupabaseForShop() from supabase-jwt.server.ts
 */
export const supabaseAdmin =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
    : null;

/**
 * Check if Supabase admin client is configured
 */
export const isSupabaseConfigured = () => {
  return supabaseAdmin !== null;
};

/**
 * Database Types for TypeScript
 */
export interface OnboardingProgress {
  id: string;
  shop: string;
  completedSteps: string[];
  createdAt: string;
  updatedAt: string;
}

