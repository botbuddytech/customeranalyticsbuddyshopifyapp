-- Add missing fields to Session table for Shopify session storage
-- These fields are required by @shopify/shopify-app-session-storage-prisma

ALTER TABLE "Session" 
ADD COLUMN IF NOT EXISTS "firstName" TEXT,
ADD COLUMN IF NOT EXISTS "lastName" TEXT,
ADD COLUMN IF NOT EXISTS "email" TEXT,
ADD COLUMN IF NOT EXISTS "accountOwner" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "locale" TEXT,
ADD COLUMN IF NOT EXISTS "collaborator" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN DEFAULT false;

