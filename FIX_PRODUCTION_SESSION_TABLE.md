# Fix Production Session Table Error

## Problem
The `session` table doesn't exist in your production Supabase database, causing authentication errors.

## Solution: Create Session Table in Supabase

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to https://app.supabase.com
   - Select your production project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the SQL Script**
   - Copy and paste the SQL from `supabase/create_session_table.sql`
   - Click "Run" to execute

4. **Verify Table Created**
   - Go to "Table Editor" in the left sidebar
   - You should see a `session` table listed

### Option 2: Using Supabase CLI

```bash
# Connect to your production database
supabase db push

# Or run the SQL directly
psql "your-production-connection-string" -f supabase/create_session_table.sql
```

## SQL Script to Run

```sql
-- Create Session table for Shopify session storage
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

## Verification

After running the SQL, verify the table exists:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'session';
```

You should see `session` in the results.

## Important Notes

- This table is **required** for Shopify authentication to work
- The table name must be lowercase `session` (not `Session`)
- Make sure you're running this in your **production** Supabase project, not development
