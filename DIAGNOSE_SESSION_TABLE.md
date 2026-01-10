# Diagnose Session Table Issue

## If the table exists but you're still getting errors, check these:

### 1. Check Table Name (Case Sensitivity)

Run this in Supabase SQL Editor:

```sql
-- Check if table exists with different cases
SELECT table_name, table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name = 'session' OR table_name = 'Session' OR LOWER(table_name) = 'session');
```

**Expected:** Should show `session` (lowercase) in `public` schema

### 2. Check Table Structure

```sql
-- Verify all required columns exist
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'session'
ORDER BY ordinal_position;
```

**Required columns:**
- id (TEXT, NOT NULL)
- shop (TEXT, NOT NULL)
- state (TEXT, NOT NULL)
- isOnline (BOOLEAN)
- scope (TEXT, nullable)
- expires (TIMESTAMP, nullable)
- accessToken (TEXT, NOT NULL)
- userId (TEXT, nullable)
- firstName (TEXT, nullable)
- lastName (TEXT, nullable)
- email (TEXT, nullable)
- accountOwner (BOOLEAN)
- locale (TEXT, nullable)
- collaborator (BOOLEAN)
- emailVerified (BOOLEAN)

### 3. Check Database Connection

Verify your Vercel `DATABASE_URL` environment variable points to the **same** Supabase project where the table exists.

### 4. Common Issues

**Issue A: Table is named "Session" (uppercase)**
```sql
-- Fix: Rename to lowercase
ALTER TABLE "Session" RENAME TO session;
```

**Issue B: Table in wrong schema**
```sql
-- Check which schema
SELECT table_schema, table_name
FROM information_schema.tables 
WHERE table_name LIKE '%session%';
```

**Issue C: Missing columns**
- Compare your table structure with the required structure above
- Add any missing columns

**Issue D: Wrong DATABASE_URL in Vercel**
- Check Vercel environment variables
- Ensure `DATABASE_URL` points to production Supabase (not dev)

### 5. Quick Fix Script

If table exists but has issues, run this to recreate it properly:

```sql
-- Drop and recreate with correct structure
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS session CASCADE;

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

CREATE INDEX IF NOT EXISTS session_shop_idx ON session (shop);
```
