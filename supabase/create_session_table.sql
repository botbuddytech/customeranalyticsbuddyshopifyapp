-- Create Session table for Shopify session storage
-- This table is required for production deployment on Vercel
-- Using lowercase "session" to match Prisma schema mapping

-- Drop any existing tables (both cases) to start fresh
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS session CASCADE;

-- Create table as lowercase "session" (matches @@map("session") in Prisma schema)
CREATE TABLE session (
  id TEXT PRIMARY KEY,
  shop TEXT NOT NULL,
  state TEXT NOT NULL,
  "isOnline" BOOLEAN DEFAULT false,
  scope TEXT,
  expires TIMESTAMP,
  "accessToken" TEXT NOT NULL,
  "userId" TEXT,
  "firstName" TEXT,
  "lastName" TEXT,
  email TEXT,
  "accountOwner" BOOLEAN DEFAULT false,
  locale TEXT,
  collaborator BOOLEAN DEFAULT false,
  "emailVerified" BOOLEAN DEFAULT false
);

-- Create index on shop for faster lookups
CREATE INDEX IF NOT EXISTS session_shop_idx ON session (shop);

-- Verify table was created
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'session' 
ORDER BY ordinal_position;

