/**
 * Supabase Server Client
 * 
 * This file creates a Supabase admin client for server-side operations.
 * ⚠️ IMPORTANT: Never expose the service_role key to the browser!
 * Only use this client in .server.ts files, loaders, and actions.
 */

import { createClient } from "@supabase/supabase-js";

// Environment variables for Supabase connection
// These should be set in your .env file:
// SUPABASE_URL=https://your-project-id.supabase.co
// SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!SUPABASE_URL) {
  console.warn("⚠️ SUPABASE_URL is not set. Supabase features will be disabled.");
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY is not set. Supabase features will be disabled.");
}

/**
 * Supabase Admin Client
 * 
 * Uses the service_role key which bypasses Row Level Security (RLS).
 * This is safe because it's only used on the server.
 * 
 * Use this client for:
 * - Reading/writing onboarding progress
 * - Storing user preferences
 * - Saving feedback and ratings
 * - Any server-side database operations
 */
export const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  : null;

/**
 * Check if Supabase is configured and available
 */
export const isSupabaseConfigured = () => {
  return supabaseAdmin !== null;
};

/**
 * Database Types for TypeScript
 * These match the Supabase table schema
 */
export interface OnboardingProgress {
  id: string;
  shop: string;
  completedSteps: string[]; // Array of step IDs as strings, e.g., ["1", "2"]
  createdAt: string;
  updatedAt: string;
}

