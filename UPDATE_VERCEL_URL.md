# Update Vercel URL Guide

## New URL

**https://customeranalyticsbuddyapp.vercel.app**

---

## Step-by-Step Update Process

### Step 1: Update Vercel Environment Variables ✅

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find `SHOPIFY_APP_URL`
3. Update it to: `https://customeranalyticsbuddyapp.vercel.app`
4. Make sure it's set for **Production**, **Preview**, and **Development** environments
5. Click **Save**

**This will trigger an automatic redeploy.**

---

### Step 2: Update Shopify Partners Dashboard ✅

1. Go to [partners.shopify.com](https://partners.shopify.com)
2. Log in and navigate to your app: **Customer Analytics Buddy**
3. Go to **App setup** tab
4. Update these fields:

   **App URL:**

   ```
   https://customeranalyticsbuddyapp.vercel.app
   ```

   **Allowed redirection URL(s):**

   ```
   https://customeranalyticsbuddyapp.vercel.app/auth/shopify/callback
   ```

5. Click **Save**

---

### Step 3: Sync Configuration with Shopify CLI ✅

Run this command to sync your `shopify.app.toml` to Shopify Partners:

```bash
# Make sure you're logged in
shopify auth login

# Deploy/update the app configuration
npm run deploy
# or
shopify app deploy
```

This will:

- Update the App URL in Shopify Partners
- Update the redirect URLs
- Sync webhooks

---

### Step 4: Verify Configuration ✅

#### Check Vercel:

1. Go to Vercel Dashboard → Your Project
2. Verify the domain shows: `customeranalyticsbuddyapp.vercel.app`
3. Check that the latest deployment is successful

#### Check Shopify Partners:

1. Go to App setup tab
2. Verify:
   - App URL matches the new Vercel URL
   - Redirect URL matches the new Vercel URL

#### Check shopify.app.toml:

- `application_url` = `https://customeranalyticsbuddyapp.vercel.app`
- `redirect_urls` = `https://customeranalyticsbuddyapp.vercel.app/auth/shopify/callback`

---

### Step 5: Test the App ✅

1. **Uninstall the app** from your test store (if installed):
   - Go to Shopify Admin → Apps
   - Find "Customer Analytics Buddy"
   - Click "Uninstall"

2. **Reinstall the app**:
   - Go to Shopify Admin → Apps
   - Click "Visit the Shopify App Store" or use the install link
   - Install the app again
   - It should redirect to the new Vercel URL

3. **Verify it works**:
   - App should load without errors
   - Authentication should work
   - All features should function normally

---

## Files Updated

- ✅ `shopify.app.toml` - Updated `application_url` and `redirect_urls`

---

## Important Notes

1. **Wait for redeploy**: After updating environment variables in Vercel, wait 2-5 minutes for the redeploy to complete

2. **Use the same URL everywhere**:
   - Vercel environment variable: `SHOPIFY_APP_URL`
   - `shopify.app.toml`: `application_url`
   - Shopify Partners: App URL
   - All must match exactly

3. **No trailing slashes**: Use `https://customeranalyticsbuddyapp.vercel.app` (no trailing `/`)

4. **HTTPS required**: Always use `https://` (not `http://`)

---

## Troubleshooting

### "Application Error" after update

- Wait 2-5 minutes for Vercel to redeploy
- Check Vercel function logs for errors
- Verify environment variables are set correctly

### "Redirect URI mismatch" error

- Make sure the redirect URL in Shopify Partners matches exactly:
  `https://customeranalyticsbuddyapp.vercel.app/auth/shopify/callback`
- No trailing slashes, exact match required

### App doesn't load

- Check Vercel deployment status
- Verify the domain is correct in Vercel
- Check browser console for errors
- Verify `SHOPIFY_APP_URL` in Vercel environment variables

---

## Quick Checklist

- [ ] Updated `SHOPIFY_APP_URL` in Vercel environment variables
- [ ] Updated App URL in Shopify Partners dashboard
- [ ] Updated Redirect URL in Shopify Partners dashboard
- [ ] Ran `npm run deploy` or `shopify app deploy`
- [ ] Waited for Vercel redeploy (2-5 minutes)
- [ ] Uninstalled and reinstalled app in test store
- [ ] Verified app loads and works correctly

---

After completing these steps, your app should be working with the new Vercel URL! 🎉
