# Deployment Checklist for Vercel + Shopify

## ⚠️ Pre-Deployment Checklist

### 1. Environment Variables Required

Make sure you have all these environment variables ready before deployment:

#### Shopify App Variables

- `SHOPIFY_API_KEY` - Your Shopify app API key
- `SHOPIFY_API_SECRET` - Your Shopify app API secret
- `SCOPES` - Comma-separated list of scopes (e.g., "read_products,write_products,read_customers")
- `SHOPIFY_APP_URL` - Your production app URL (e.g., "https://your-app.vercel.app")
- `SHOP_CUSTOM_DOMAIN` - (Optional) Custom shop domain if applicable

#### Database (Supabase/PostgreSQL)

- `DATABASE_URL` - PostgreSQL connection string (from Supabase)
- `DIRECT_URL` - Direct PostgreSQL connection string (for migrations, from Supabase)

#### Supabase Variables

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for admin operations)
- `SUPABASE_JWT_SECRET` - Secret key for generating custom JWTs

#### Email (Gmail - if using email features)

- `GMAIL_USER` - Gmail account for sending emails
- `GMAIL_APP_PASSWORD` - Gmail app-specific password (not regular password)

#### N8N Webhook (if using AI Search Analyzer)

- `N8N_prod_url` - Your n8n production webhook URL

#### OpenAI (if using AI features)

- `OPENAI_API_KEY` - OpenAI API key (optional, for AI features)

#### Feature Flags

- `ENABLE_ALL_FEATURES` - Set to "true" to enable all features (optional)

#### Node Environment

- `NODE_ENV=production` - Set to production

### 2. ⚠️ CRITICAL: Fix Session Storage for Production

**MUST FIX BEFORE DEPLOYMENT:** The app currently uses SQLite for Shopify sessions, which **WILL NOT WORK** on Vercel.

**Steps to Fix:**

1. **Add Session model to Prisma schema** (if not exists):

   ```prisma
   model Session {
     id        String   @id
     shop      String
     state     String
     isOnline  Boolean  @default(false)
     scope     String?
     expires   DateTime?
     accessToken String
     userId    String?

     @@map("Session")
   }
   ```

2. **Update `app/shopify.server.ts`** to use PostgreSQL in production:

   ```typescript
   import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
   import prisma from "./db.server";

   // Use PostgreSQL in production, SQLite in development
   const sessionStorage =
     process.env.NODE_ENV === "production"
       ? new PrismaSessionStorage(prisma)
       : new SQLiteSessionStorage("./sessions.sqlite");
   ```

3. **Run migration** to create Session table:
   ```bash
   npx prisma migrate dev --name add_session_storage
   ```

### 3. Database Migrations

**CRITICAL:** Run Prisma migrations before deploying:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (this will create all tables in Supabase)
npx prisma migrate deploy
```

**Important Tables to Verify:**

- `Session` - For Shopify session storage (CRITICAL for production)
- `usage_tracking` - For usage limits
- `usage_limits` - For global limits
- `onboarding_progress` - For onboarding steps
- `onboardingtaskdata` - For quick start checklist
- All other tables from your schema

### 4. Create Initial Usage Limits Record

After migrations, create the initial `UsageLimits` record in Supabase:

```sql
INSERT INTO usage_limits (id, "maxChats", "maxListsGenerated", "maxListsSaved", "maxExports", "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  10,  -- maxChats
  20,  -- maxListsGenerated
  15,  -- maxListsSaved
  10,  -- maxExports
  true, -- isActive
  NOW(),
  NOW()
);
```

### 5. Verify Supabase RLS Policies

Ensure Row Level Security (RLS) policies are set up correctly in Supabase for:

- `onboardingtaskdata` table
- `onboarding_progress` table
- `usage_tracking` table
- `usage_limits` table (should allow reads for all, writes only for admin)

### 6. Build and Test Locally

```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run setup

# Build the app
npm run build

# Test the build locally (optional)
npm start
```

---

## 🚀 Deployment Steps

### Step 1: Deploy to Vercel

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Select the root directory

3. **Configure Build Settings:**
   - **Framework Preset:** Other
   - **Build Command:** `npm run setup && npm run build`
   - **Output Directory:** `build/client`
   - **Install Command:** `npm install`
   - **Node Version:** 20.x or 22.x (as per package.json engines)

   **Note:** A `vercel.json` file has been created with recommended settings. Vercel should auto-detect it.

4. **Add Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add ALL the environment variables from the checklist above
   - Make sure to add them for **Production**, **Preview**, and **Development** environments

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Note your deployment URL (e.g., `https://your-app.vercel.app`)

### Step 2: Update Shopify App Configuration

1. **Update shopify.app.toml:**
   - Update `application_url` to your Vercel URL: `https://your-app.vercel.app`
   - Update `redirect_urls` to include: `https://your-app.vercel.app/api/auth/shopify/callback`

2. **Update App URL in Shopify Partners:**
   - Go to [partners.shopify.com](https://partners.shopify.com)
   - Navigate to your app
   - Go to "App setup"
   - Update **App URL** to: `https://your-app.vercel.app`
   - Update **Allowed redirection URL(s)** to include: `https://your-app.vercel.app/api/auth/shopify/callback`

3. **Update Environment Variables:**
   - Update `SHOPIFY_APP_URL` in Vercel to match your deployment URL

### Step 3: Run Database Migrations on Production

**Option A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Run migrations via Vercel
vercel env pull .env.production
npx prisma migrate deploy
```

**Option B: Using Supabase Dashboard**

- Go to Supabase SQL Editor
- Run the migration SQL manually
- Or use Supabase CLI to run migrations

**Option C: Using a one-time migration script**
Create a script that runs migrations on first deployment.

### Step 4: Deploy to Shopify

1. **Update shopify.app.toml:**
   - Ensure `application_url` points to your Vercel URL
   - Verify webhook URLs if you have any

2. **Deploy using Shopify CLI:**

   ```bash
   # Make sure you're logged in
   shopify auth login

   # Deploy the app
   npm run deploy
   # or
   shopify app deploy
   ```

3. **Verify Deployment:**
   - Check that your app appears in Shopify Partners dashboard
   - Test installing the app on a test store
   - Verify all features work correctly

---

## ✅ Post-Deployment Verification

### 1. Test App Installation

- Install the app on a test store
- Verify authentication works
- Check that onboarding flow works

### 2. Test Key Features

- ✅ AI Search Analyzer (chat creation, list generation, exports)
- ✅ Filter Audience (filtering, saving lists, exports)
- ✅ Quick Start Checklist (auto-completion of steps 1 & 2)
- ✅ Usage tracking (check if limits are being tracked)
- ✅ Dashboard features

### 3. Check Database

- Verify all tables exist in Supabase
- Check that `usage_limits` table has a record
- Test that data is being saved correctly

### 4. Monitor Logs

- Check Vercel function logs for errors
- Monitor Supabase logs for database issues
- Check Shopify webhook delivery logs

---

## 🔧 Troubleshooting

### Common Issues:

1. **"Table does not exist" error:**
   - Run Prisma migrations: `npx prisma migrate deploy`
   - Verify DATABASE_URL is correct

2. **"Environment variable not found":**
   - Double-check all env vars are set in Vercel
   - Make sure they're set for the correct environment (Production/Preview)

3. **"Prisma Client not generated":**
   - Add `npm run setup` to Vercel build command
   - Or add `prisma generate` as a postinstall script

4. **"RLS policy violation":**
   - Check Supabase RLS policies
   - Verify JWT secret matches

5. **"Shopify authentication fails":**
   - Verify SHOPIFY_APP_URL matches your Vercel URL
   - Check redirect URLs in Shopify Partners dashboard

---

## 📝 Additional Notes

- **Session Storage:** ⚠️ **CRITICAL** - The app currently uses SQLite (`sessions.sqlite`) for Shopify sessions locally. **This will NOT work in production on Vercel** because:
  - Vercel is serverless and doesn't have persistent file system
  - SQLite files will be lost on each deployment
  - You need to switch to PostgreSQL session storage before production deployment

  **Solution:** Update `app/shopify.server.ts` to use PostgreSQL session storage:

  ```typescript
  import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
  import prisma from "./db.server";

  const sessionStorage = new PrismaSessionStorage(prisma);
  ```

- **File System:** Vercel is serverless - don't rely on local file system
- **Build Time:** First build may take longer due to Prisma generation
- **Cold Starts:** Vercel functions may have cold starts - consider using Edge Functions for better performance
- **Usage Limits:** Make sure to create the initial `usage_limits` record in Supabase after migrations

---

## 🎯 Quick Reference Commands

```bash
# Local build test
npm run build

# Generate Prisma client
npm run setup

# Run migrations
npx prisma migrate deploy

# Deploy to Shopify
npm run deploy

# Check environment variables
vercel env ls
```
