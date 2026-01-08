# Fix: Live App Crashes When Running `npm run dev`

## 🔴 Problem

When you run `npm run dev`, your **live/production app crashes** because:

1. `automatically_update_urls_on_dev = true` in `shopify.app.toml`
2. Shopify CLI temporarily updates your app URLs in Shopify Partners to the tunnel URL
3. Live stores try to access the app, but URLs point to the tunnel (which might be down or inaccessible)
4. This causes the live app to crash or fail authentication

---

## ✅ Solution

I've disabled automatic URL updates. Now you have two options:

### Option 1: Use Relative Paths (Recommended)

**Updated `shopify.app.toml`:**
- Set `automatically_update_urls_on_dev = false`
- Use relative paths for webhooks during development

**For development, use relative paths:**
```toml
[[webhooks.subscriptions]]
compliance_topics = ["customers/data_request", "customers/redact", "shop/redact"]
uri = "/webhooks/compliance"  # Relative path - works with both dev and production
```

**Benefits:**
- ✅ Live app continues working during development
- ✅ Development uses tunnel URL automatically
- ✅ Production uses Vercel URL
- ✅ No URL switching needed

---

### Option 2: Use Separate App Configurations

Create separate configurations for dev and production, but this is more complex.

---

## 🚀 How to Use Now

### For Development:

```bash
# Start dev server
npm run dev

# This will:
# - Create tunnel URL (e.g., https://abc123.trycloudflare.com)
# - Use relative paths for webhooks (automatically resolves to tunnel)
# - Live app URLs stay unchanged in Shopify Partners
# - Live app continues working normally
```

### For Production:

```bash
# Deploy to production
npm run deploy

# This will:
# - Use absolute URLs from shopify.app.toml
# - Update Shopify Partners with production URLs
# - Live app uses Vercel URL
```

---

## 📝 What Changed

**File: `shopify.app.toml`**
- Changed `automatically_update_urls_on_dev = false`

**Next Step (Optional):**
If you want to use relative paths for webhooks, update the webhook URI:

```toml
[[webhooks.subscriptions]]
compliance_topics = ["customers/data_request", "customers/redact", "shop/redact"]
uri = "/webhooks/compliance"  # Relative path
```

This way:
- **Development**: Shopify CLI automatically resolves `/webhooks/compliance` to `https://tunnel-url.trycloudflare.com/webhooks/compliance`
- **Production**: Shopify resolves `/webhooks/compliance` to `https://customeranalyticsbuddyapp.vercel.app/webhooks/compliance`

---

## ✅ Verification

After making this change:

1. **Test Development:**
   ```bash
   npm run dev
   # Check that tunnel URL is created
   # Live app should still work
   ```

2. **Test Production:**
   - Live app should continue working
   - No crashes when you run `npm run dev`

3. **Verify URLs in Shopify Partners:**
   - Go to App setup
   - URLs should remain as production URLs (Vercel URL)
   - They won't change when you run `npm run dev`

---

## 🎯 Summary

**Before:**
- ❌ `npm run dev` → Updates Shopify Partners URLs → Live app crashes

**After:**
- ✅ `npm run dev` → Uses tunnel for dev only → Live app continues working
- ✅ Production URLs stay unchanged
- ✅ Development and production work independently

---

## ⚠️ Important Notes

1. **Always stop `npm run dev` properly:**
   - Press `Ctrl+C` to stop
   - Don't force-kill the process
   - This ensures clean shutdown

2. **If URLs get stuck:**
   - Run `npm run deploy` to restore production URLs
   - Or manually update in Shopify Partners dashboard

3. **For webhook testing:**
   - Use relative paths (`/webhooks/compliance`) for automatic resolution
   - Or use absolute URLs if you need explicit control

---

**Your live app should now continue working even when you run `npm run dev`!** 🎉

