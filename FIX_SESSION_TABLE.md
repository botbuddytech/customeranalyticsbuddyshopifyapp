# Fix Session Table Error

## Problem
The `Session` table doesn't exist in your Supabase database, causing the app to crash with:
```
MissingSessionTableError: Prisma session table does not exist
```

## Solution: Create the Session Table

### Step 1: Run SQL in Supabase

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste this SQL:

```sql
-- Create Session table for Shopify session storage
-- This table is required for production deployment on Vercel

CREATE TABLE IF NOT EXISTS "Session" (
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
CREATE INDEX IF NOT EXISTS "Session_shop_idx" ON "Session" (shop);
```

4. Click **Run** to execute the SQL
5. Verify the table was created:
   - Go to **Table Editor** in Supabase
   - You should see a `Session` table

### Step 2: Verify Table Creation

After running the SQL, verify:
1. The table exists in Supabase Table Editor
2. The table has all the columns listed above
3. The index on `shop` was created

### Step 3: Test the App

1. Wait 10-30 seconds for changes to propagate
2. Try accessing your app again
3. The error should be resolved

---

## Additional: Fix Connection Pool Timeout (if needed)

If you still see connection pool timeout errors after creating the table, you may need to increase the connection pool size.

### Option 1: Update DATABASE_URL in Vercel

Your Supabase connection string might look like:
```
postgresql://user:password@host:5432/dbname
```

Add connection pool parameters:
```
postgresql://user:password@host:5432/dbname?connection_limit=10&pool_timeout=20
```

**Steps:**
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. Add `?connection_limit=10&pool_timeout=20` to the end of the URL
4. Save and redeploy

### Option 2: Use Supabase Connection Pooler

If you're using Supabase's connection pooler, make sure you're using the **pooler connection string** (usually has `pooler` in the hostname) instead of the direct connection string.

**Supabase Dashboard:**
1. Go to **Project Settings** → **Database**
2. Find **Connection string** → **Connection pooling**
3. Use the **Transaction** mode connection string
4. Update `DATABASE_URL` in Vercel with this pooler URL

---

## Quick Checklist

- [ ] Created `Session` table in Supabase
- [ ] Verified table has all required columns
- [ ] Created index on `shop` column
- [ ] Updated `DATABASE_URL` with connection pool parameters (if needed)
- [ ] Redeployed app on Vercel
- [ ] Tested app access

---

## Files Created

- `supabase/create_session_table.sql` - SQL script to create the Session table

Run this SQL in Supabase SQL Editor to fix the error.

