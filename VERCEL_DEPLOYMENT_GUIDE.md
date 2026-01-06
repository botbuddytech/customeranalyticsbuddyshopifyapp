# Complete Vercel Deployment Guide for Shopify App

## 📋 Overview

This guide will walk you through deploying your Shopify app to Vercel step-by-step. Since you've deployed Next.js apps before, some steps will be familiar, but Shopify apps have specific requirements.

---

## 🎯 Step-by-Step Deployment Process

### **STEP 1: Prepare Your Code**

#### 1.1 Fix Session Storage (CRITICAL - Already Done ✅)

- ✅ Session model added to Prisma schema
- ✅ `shopify.server.ts` updated to use PostgreSQL in production

#### 1.2 Commit and Push to Git

```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

---

### **STEP 2: Create Prisma Migration for Session Table**

Before deploying, you need to create the Session table in your database:

```bash
# Generate Prisma Client
npm run setup

# Create migration for Session table
npx prisma migrate dev --name add_session_storage

# This will create a migration file and apply it to your local database
```

**Note:** You'll need to run this migration on your production database (Supabase) after deployment.

---

### **STEP 3: Prepare Environment Variables**

Before connecting to Vercel, gather all your environment variables. Create a list:

#### Required Variables:

```
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SCOPES=read_checkouts,read_customers,write_customers,read_orders,write_orders,write_products
SHOPIFY_APP_URL=https://your-app-name.vercel.app (we'll update this after deployment)
DATABASE_URL=your_supabase_connection_string
DIRECT_URL=your_supabase_direct_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
N8N_prod_url=your_n8n_webhook_url (if using)
GMAIL_USER=your_gmail (if using)
GMAIL_APP_PASSWORD=your_gmail_app_password (if using)
NODE_ENV=production
```

**Where to find these:**

- **Shopify variables:** From your Shopify Partners dashboard → Your App → API credentials
- **Supabase variables:** From Supabase Dashboard → Project Settings → API
- **Database URLs:** From Supabase Dashboard → Project Settings → Database → Connection string

---

### **STEP 4: Deploy to Vercel**

#### 4.1 Connect Your Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Select your repository

#### 4.2 Configure Project Settings

Vercel should auto-detect settings from `vercel.json`, but verify:

- **Framework Preset:** Other (or leave blank)
- **Root Directory:** `./` (root of your project)
- **Build Command:** `npm run setup && npm run build`
- **Output Directory:** `build/client`
- **Install Command:** `npm install`

#### 4.3 Add Environment Variables

**IMPORTANT:** Add these BEFORE your first deployment:

1. In Vercel project settings, go to **"Environment Variables"**
2. Add each variable from Step 3
3. **Select environments:** Check all three:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

**For `SHOPIFY_APP_URL`:**

- Initially, use a placeholder: `https://your-app-name.vercel.app`
- After first deployment, Vercel will give you the actual URL
- Then update this variable with the real URL

#### 4.4 Deploy

1. Click **"Deploy"**
2. Wait for build to complete (first build takes 3-5 minutes)
3. **Note your deployment URL** (e.g., `https://your-app-abc123.vercel.app`)

---

### **STEP 5: Update Environment Variables with Real URL**

After first deployment:

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Update `SHOPIFY_APP_URL` with your actual Vercel URL
3. **Redeploy** (Vercel will auto-redeploy when you update env vars, or click "Redeploy")

---

### **STEP 6: Run Database Migrations on Production**

You need to create the Session table and other tables in your production Supabase database.

#### Option A: Using Supabase Dashboard (Easiest)

1. Go to Supabase Dashboard → SQL Editor
2. Run this SQL to create the Session table:

```sql
CREATE TABLE IF NOT EXISTS "Session" (
  id TEXT PRIMARY KEY,
  shop TEXT NOT NULL,
  state TEXT NOT NULL,
  "isOnline" BOOLEAN DEFAULT false,
  scope TEXT,
  expires TIMESTAMP,
  "accessToken" TEXT NOT NULL,
  "userId" TEXT
);
```

3. Verify all other tables exist (they should from previous migrations)

#### Option B: Using Prisma Migrate (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Pull production environment variables
vercel env pull .env.production

# Run migrations against production database
npx prisma migrate deploy
```

---

### **STEP 7: Create Initial Usage Limits Record**

In Supabase SQL Editor, run:

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
)
ON CONFLICT DO NOTHING;
```

---

### **STEP 8: Update Shopify App Configuration**

#### 8.1 Update shopify.app.toml

Edit `shopify.app.toml`:

```toml
application_url = "https://your-actual-vercel-url.vercel.app"

[auth]
redirect_urls = [ "https://your-actual-vercel-url.vercel.app/api/auth/shopify/callback" ]
```

#### 8.2 Update Shopify Partners Dashboard

1. Go to [partners.shopify.com](https://partners.shopify.com)
2. Navigate to your app
3. Go to **"App setup"** tab
4. Update:
   - **App URL:** `https://your-actual-vercel-url.vercel.app`
   - **Allowed redirection URL(s):** Add `https://your-actual-vercel-url.vercel.app/api/auth/shopify/callback`

#### 8.3 Commit and Push Changes

```bash
git add shopify.app.toml
git commit -m "Update app URL for production"
git push origin main
```

---

### **STEP 9: Deploy to Shopify**

#### 9.1 Login to Shopify CLI

```bash
shopify auth login
```

#### 9.2 Deploy Your App

```bash
npm run deploy
```

Or:

```bash
shopify app deploy
```

This will:

- Update your app configuration in Shopify Partners
- Sync webhooks
- Update app URLs

---

### **STEP 10: Test Your Deployment**

#### 10.1 Install App on Test Store

1. Go to your Shopify Partners dashboard
2. Click **"Test on development store"** or use a test store
3. Install the app
4. Verify authentication works

#### 10.2 Test Key Features

- ✅ App loads without errors
- ✅ Dashboard displays
- ✅ AI Search Analyzer works
- ✅ Filter Audience works
- ✅ Quick Start Checklist shows
- ✅ Usage tracking works

#### 10.3 Check Logs

- **Vercel:** Go to your project → Functions → View logs
- **Supabase:** Check database logs for any errors
- **Browser Console:** Check for client-side errors

---

## 🔍 Troubleshooting Common Issues

### Issue 1: "Table Session does not exist"

**Solution:** Run the Session table creation SQL in Supabase (Step 6)

### Issue 2: "Environment variable not found"

**Solution:**

- Double-check all env vars are set in Vercel
- Make sure they're set for Production environment
- Redeploy after adding variables

### Issue 3: "Shopify authentication fails"

**Solution:**

- Verify `SHOPIFY_APP_URL` matches your Vercel URL exactly
- Check redirect URLs in Shopify Partners dashboard
- Ensure callback URL is: `/api/auth/shopify/callback` (not `/auth/callback`)

### Issue 4: "Prisma Client not generated"

**Solution:**

- Verify build command includes `npm run setup`
- Check Vercel build logs for Prisma generation errors

### Issue 5: "Build fails"

**Solution:**

- Check Vercel build logs
- Ensure Node version is 20.x or 22.x
- Verify all dependencies are in package.json

---

## 📝 Post-Deployment Checklist

- [ ] App URL updated in `shopify.app.toml`
- [ ] App URL updated in Shopify Partners dashboard
- [ ] All environment variables set in Vercel
- [ ] Session table created in Supabase
- [ ] Usage limits record created
- [ ] App deployed to Shopify
- [ ] App installs successfully on test store
- [ ] Authentication works
- [ ] All features tested and working

---

## 🎉 You're Done!

Once all steps are complete, your Shopify app will be live on Vercel and ready for users to install!

**Next Steps:**

- Monitor Vercel logs for any issues
- Test with real users
- Set up monitoring/alerts if needed
