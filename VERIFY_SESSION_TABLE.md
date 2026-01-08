# Verify and Fix Session Table

## Quick Fix Steps

### Step 1: Run SQL in Supabase

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy the entire contents of `supabase/create_session_table.sql`
3. Paste and click **Run**
4. You should see a result showing the table columns (verification query at the end)

### Step 2: Verify Table Exists

In Supabase Dashboard:
1. Go to **Table Editor**
2. Look for a table named `session` (lowercase)
3. It should have these columns:
   - id, shop, state, isOnline, scope, expires, accessToken, userId, firstName, lastName, email, accountOwner, locale, collaborator, emailVerified

### Step 3: Regenerate Prisma Client (Local)

On your local machine:

```bash
npx prisma generate
```

This regenerates the Prisma client with the updated schema that maps to lowercase `session`.

### Step 4: Commit and Push

```bash
git add prisma/schema.prisma supabase/create_session_table.sql
git commit -m "Fix: Create session table with correct case"
git push origin main
```

### Step 5: Wait for Vercel Deployment

- Vercel will automatically rebuild
- The new Prisma client will be generated during build
- Wait 2-5 minutes for deployment to complete

### Step 6: Test

Try accessing your app again. The error should be resolved.

---

## If Still Not Working

### Check Table Exists in Supabase

Run this SQL in Supabase SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('session', 'Session');
```

This will show you which tables exist.

### Check Prisma Client in Vercel

The Prisma client is generated during Vercel build. Make sure:
1. `prisma generate` runs during build (check `package.json` scripts)
2. The build includes the generated Prisma client

### Alternative: Create Table Manually

If the SQL script doesn't work, create it manually in Supabase Table Editor:
1. Go to **Table Editor** → **New Table**
2. Name: `session` (lowercase)
3. Add all columns as shown in the SQL
4. Set `id` as Primary Key
5. Create index on `shop` column

---

## Current Configuration

- **Prisma Model**: `Session` (uppercase)
- **Database Table**: `session` (lowercase) - via `@@map("session")`
- **Shopify Library**: Expects table to exist, uses Prisma to access it

The `@@map("session")` directive tells Prisma to look for a table named `session` in the database, even though the model is named `Session`.

