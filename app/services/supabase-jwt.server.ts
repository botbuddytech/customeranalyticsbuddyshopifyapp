/**
 * Supabase JWT Service for RLS
 *
 * Creates custom JWTs with shop claim for Row Level Security enforcement.
 * The JWT is generated on-the-fly based on the authenticated Shopify session.
 *
 * Flow:
 * 1. Shopify authenticates the merchant (via authenticate.admin)
 * 2. We get session.shop from Shopify
 * 3. We generate a JWT with { shop: "store.myshopify.com" }
 * 4. Supabase RLS policies validate: shop = jwt.claims.shop
 */

import jwt from "jsonwebtoken";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;

// Cache for Supabase clients per shop (avoids creating new clients on every request)
const clientCache = new Map<
  string,
  { client: SupabaseClient; expiresAt: number }
>();

// JWT expiry time (1 hour)
const JWT_EXPIRY_SECONDS = 60 * 60;

// Cache expiry (55 minutes - 5 min buffer before JWT expires)
const CACHE_EXPIRY_MS = 55 * 60 * 1000;

/**
 * Validate that required environment variables are set
 */
export function validateSupabaseEnv(): {
  valid: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  if (!SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!SUPABASE_ANON_KEY) missing.push("SUPABASE_ANON_KEY");
  if (!SUPABASE_JWT_SECRET) missing.push("SUPABASE_JWT_SECRET");

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Generate a custom JWT for a shop
 * This JWT will be used by Supabase RLS policies
 */
export function generateShopJWT(shop: string): string {
  if (!SUPABASE_JWT_SECRET) {
    throw new Error("SUPABASE_JWT_SECRET is not configured");
  }

  const now = Math.floor(Date.now() / 1000);

  const payload = {
    // Required Supabase claims
    aud: "authenticated",
    role: "authenticated",

    // Custom claim for RLS - this is what RLS policies check
    shop: shop,

    // Standard JWT claims
    iat: now,
    exp: now + JWT_EXPIRY_SECONDS,
    sub: shop, // Subject is the shop identifier
  };

  return jwt.sign(payload, SUPABASE_JWT_SECRET, { algorithm: "HS256" });
}

/**
 * Get a Supabase client authenticated for a specific shop
 * Uses custom JWT for RLS enforcement
 *
 * @param shop - The shop domain (e.g., "store.myshopify.com")
 * @returns Supabase client with RLS context for the shop
 */
export function getSupabaseForShop(shop: string): SupabaseClient {
  const envCheck = validateSupabaseEnv();
  if (!envCheck.valid) {
    throw new Error(
      `Supabase not configured. Missing: ${envCheck.missing.join(", ")}`,
    );
  }

  const now = Date.now();
  const cached = clientCache.get(shop);

  // Return cached client if still valid
  if (cached && cached.expiresAt > now) {
    return cached.client;
  }

  // Generate new JWT and create client
  const token = generateShopJWT(shop);

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Cache the client
  clientCache.set(shop, {
    client,
    expiresAt: now + CACHE_EXPIRY_MS,
  });

  return client;
}

/**
 * Clear cached client for a shop
 * Use this on app uninstall or when you need to force a new JWT
 */
export function clearShopClient(shop: string): void {
  clientCache.delete(shop);
}

/**
 * Clear all cached clients
 * Useful for testing or when rotating JWT secrets
 */
export function clearAllClients(): void {
  clientCache.clear();
}

