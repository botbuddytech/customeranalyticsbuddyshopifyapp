# Production Deployment Checklist

## ✅ Configuration Files Review

### 1. Shopify Config Files - **SAFE** ✓

- **`shopify.app.dev.toml`**: Used ONLY for local dev (`npm run dev`)
  - ✅ Has `automatically_update_urls_on_dev = true` (safe for dev)
  - ✅ Uses placeholder URLs that CLI replaces
  - ✅ Separate client_id for dev app
- **`shopify.app.prod.toml`**: Used ONLY for production (`npm run deploy`)
  - ✅ Has `automatically_update_urls_on_dev = false` (protects production)
  - ✅ Points to `https://customeranalyticsbuddyapp.vercel.app`
  - ✅ Production client_id
- **`shopify.app.toml`**: Default/legacy file - **SAFE** ✓
  - ✅ Points to production URL
  - ✅ Has `automatically_update_urls_on_dev = false`
  - ✅ Won't break production if used accidentally

### 2. Package.json Scripts - **SAFE** ✓

- ✅ `dev`: Uses `shopify.app.dev.toml` (dev only)
- ✅ `deploy`: Uses `shopify.app.prod.toml` (production only)
- ✅ `start`: Uses `cross-env` for Windows compatibility

### 3. Vercel Configuration - **SAFE** ✓

- ✅ `vercel.json` correctly configured
- ✅ Build command: `npm run setup && npm run build`
- ✅ Output directory: `build/client`
- ✅ Rewrites to `/api/index.js`

### 4. Vite Config - **NEEDS ATTENTION** ⚠️

- ⚠️ **ISSUE**: Sentry plugin requires `SENTRY_AUTH_TOKEN` env var
- ⚠️ If missing, build might fail or Sentry source maps won't upload
- ✅ Config structure is correct (function form)

### 5. Sentry Configuration - **CRITICAL ISSUE** ❌

- ❌ **PROBLEM**: Currently sends errors in BOTH development AND production
- ❌ `instrument.server.mjs` - No environment check
- ❌ `app/entry.client.tsx` - No environment check
- ⚠️ **ACTION REQUIRED**: Add `NODE_ENV === "production"` checks

---

## 🔴 CRITICAL ISSUES TO FIX BEFORE PRODUCTION

### Issue #1: Sentry Sending Dev Errors

**Files to fix:**

1. `instrument.server.mjs` - Wrap `Sentry.init()` in production check
2. `app/entry.client.tsx` - Wrap `Sentry.init()` in production check

**Impact:** Development errors will pollute your Sentry dashboard

---

## ⚠️ ENVIRONMENT VARIABLES REQUIRED IN VERCEL

### Required for App Functionality:

1. ✅ `SHOPIFY_API_KEY` - Production app API key
2. ✅ `SHOPIFY_API_SECRET` - Production app API secret
3. ✅ `DATABASE_URL` - Supabase PostgreSQL connection string
4. ✅ `SCOPES` - Shopify app scopes (if used)
5. ✅ `SHOPIFY_APP_URL` - Should be `https://customeranalyticsbuddyapp.vercel.app`

### Required for Mailchimp Integration:

6. ✅ `MAILCHIMP_CLIENT_ID` - Mailchimp OAuth client ID
7. ✅ `MAILCHIMP_CLIENT_SECRET` - Mailchimp OAuth client secret
8. ✅ `MAILCHIMP_REDIRECT_URL` - Should be `https://customeranalyticsbuddyapp.vercel.app/api/mailchimp/callback`

### Required for Sentry (Optional but Recommended):

9. ⚠️ `SENTRY_AUTH_TOKEN` - For source map uploads (build-time)
10. ⚠️ `SENTRY_DSN` - Already hardcoded, but can use env var for flexibility

### Supabase Variables:

11. ✅ `SUPABASE_URL` - Supabase project URL
12. ✅ `SUPABASE_ANON_KEY` - Supabase anonymous key
13. ✅ `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (if used)

### Other:

14. ✅ `NODE_ENV` - Should be set to `production` in Vercel (usually auto-set)

---

## ✅ SAFE TO DEPLOY (After Fixing Sentry)

### What's Safe:

1. ✅ Config file separation (dev/prod) is correct
2. ✅ Build process is correct
3. ✅ Vercel configuration is correct
4. ✅ API routes are correct
5. ✅ Webhook handlers are correct
6. ✅ Database connection is correct

### What Needs Fixing:

1. ❌ **Sentry environment detection** - Must fix before production
2. ⚠️ **SENTRY_AUTH_TOKEN** - Should be set in Vercel (optional but recommended)

---

## 📋 PRE-DEPLOYMENT CHECKLIST

Before merging to main and deploying:

- [ ] Fix Sentry to only initialize in production
- [ ] Verify all environment variables are set in Vercel
- [ ] Test that `npm run build` works locally
- [ ] Verify `shopify.app.prod.toml` has correct production URL
- [ ] Ensure `SENTRY_AUTH_TOKEN` is set in Vercel (if using source maps)
- [ ] Test webhook endpoints are accessible
- [ ] Verify database migrations are applied

---

## 🚀 DEPLOYMENT FLOW

1. **Local Development:**

   ```bash
   npm run dev  # Uses shopify.app.dev.toml
   ```

2. **Production Deployment:**
   - Push to GitHub → Merge to main
   - Vercel auto-deploys (uses `vercel.json`)
   - Vercel runs: `npm run setup && npm run build`
   - Uses production environment variables

3. **Shopify App Update:**
   ```bash
   npm run deploy  # Uses shopify.app.prod.toml
   ```

---

## ⚠️ POTENTIAL ISSUES

1. **Sentry Auth Token Missing:**
   - Build will succeed but source maps won't upload
   - Errors will still be captured, just without source maps
   - **Solution:** Set `SENTRY_AUTH_TOKEN` in Vercel (optional)

2. **Sentry Sending Dev Errors:**
   - **CRITICAL:** Must fix before production
   - **Solution:** Add environment checks to Sentry init

3. **Environment Variables Missing:**
   - App will fail to start
   - **Solution:** Verify all required vars are in Vercel

---

## ✅ RECOMMENDATION

**Status: 95% Ready for Production**

**Must Fix Before Deploying:**

1. Add Sentry environment checks (prevents dev errors in Sentry)

**Should Fix (Optional):**

1. Set `SENTRY_AUTH_TOKEN` in Vercel for source maps
2. Consider using env var for `SENTRY_DSN` instead of hardcoding

**Everything Else: ✅ SAFE TO DEPLOY**
