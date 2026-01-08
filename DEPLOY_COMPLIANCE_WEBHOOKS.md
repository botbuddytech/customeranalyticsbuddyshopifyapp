# Deploy Compliance Webhooks - Step by Step Guide

## 📋 What Changed

1. **Code Changes** (webhook handlers):
   - `app/routes/webhooks.compliance.tsx` - New webhook handler
   - These need to be deployed to Vercel

2. **Configuration Changes** (`shopify.app.toml`):
   - Added compliance webhook subscriptions
   - **This requires `npm run deploy` to sync with Shopify Partners**

---

## 🚀 Deployment Process

### Step 1: Push Code to Your Branch

```bash
# Make sure you're on your branch
git checkout biki  # or your branch name

# Add all changes
git add .

# Commit
git commit -m "Add mandatory compliance webhooks for App Store approval"

# Push to your branch
git push origin biki
```

**What this does:**
- ✅ Pushes code to GitHub
- ✅ Vercel will **NOT** auto-deploy from your branch (unless configured)
- ⚠️ Webhook handlers are in code, but not live yet

---

### Step 2: Merge to Main Branch

```bash
# Switch to main
git checkout main

# Pull latest changes
git pull origin main

# Merge your branch
git merge biki

# Push to main
git push origin main
```

**What this does:**
- ✅ Merges your changes to main
- ✅ Vercel will **automatically deploy** from main branch
- ✅ Webhook handlers will be live on Vercel in 2-5 minutes
- ⚠️ But Shopify Partners still doesn't know about the webhooks yet!

---

### Step 3: Deploy Shopify Configuration (IMPORTANT!)

**This is the critical step!** Changes to `shopify.app.toml` require deploying to Shopify Partners.

```bash
# Make sure you're logged in to Shopify CLI
shopify auth login

# Deploy the configuration
npm run deploy
# or
shopify app deploy
```

**What this does:**
- ✅ Syncs `shopify.app.toml` to Shopify Partners Dashboard
- ✅ Registers compliance webhook subscriptions
- ✅ Updates webhook endpoints in Shopify
- ✅ Makes webhooks active and ready to receive events

---

## ✅ Verification Steps

### 1. Check Vercel Deployment
1. Go to **Vercel Dashboard** → Your Project
2. Check **Deployments** tab
3. Verify latest deployment is successful
4. Should show your commit message

### 2. Check Shopify Partners Dashboard
1. Go to [partners.shopify.com](https://partners.shopify.com)
2. Navigate to your app → **App setup**
3. Scroll to **Webhooks** section
4. Verify you see:
   - ✅ `customers/data_request`
   - ✅ `customers/redact`
   - ✅ `shop/redact`
5. Verify endpoint URL: `https://customeranalyticsbuddyapp.vercel.app/webhooks/compliance`

### 3. Test Webhook (Optional)
```bash
# Test the webhook endpoint
shopify app generate webhook --topic customers/data_request
```

Check Vercel function logs to see if the webhook was received.

---

## 🎯 Quick Summary

**Two separate deployments needed:**

1. **Code Deployment** (Vercel):
   - ✅ Automatic when you push to `main`
   - ✅ Deploys webhook handler code
   - ✅ Takes 2-5 minutes

2. **Configuration Deployment** (Shopify Partners):
   - ✅ Manual: Run `npm run deploy`
   - ✅ Syncs `shopify.app.toml` to Shopify
   - ✅ Registers webhook subscriptions
   - ✅ Takes 1-2 minutes

---

## ⚠️ Important Notes

### When to Run `npm run deploy`:

**Run `npm run deploy` when you change:**
- ✅ `shopify.app.toml` (webhooks, scopes, URLs, etc.)
- ✅ App configuration in Shopify Partners
- ✅ Webhook subscriptions

**Don't need to run `npm run deploy` for:**
- ❌ Code changes only (Vercel handles this)
- ❌ Database schema changes
- ❌ Environment variables (update in Vercel dashboard)

### Current Situation:

Since you changed `shopify.app.toml` (added compliance webhooks), you **MUST** run `npm run deploy` after pushing code to main.

---

## 📝 Complete Command Sequence

```bash
# 1. Push to your branch
git checkout biki
git add .
git commit -m "Add mandatory compliance webhooks"
git push origin biki

# 2. Merge to main
git checkout main
git merge biki
git push origin main

# 3. Wait for Vercel to deploy (2-5 minutes)
# Check Vercel dashboard to confirm deployment is complete

# 4. Deploy Shopify configuration
shopify auth login  # If not already logged in
npm run deploy

# 5. Verify in Shopify Partners Dashboard
# Go to App setup → Webhooks section
```

---

## 🎉 After Deployment

Once both deployments are complete:

1. ✅ Webhook handlers are live on Vercel
2. ✅ Webhooks are registered in Shopify Partners
3. ✅ App is ready for Shopify App Review
4. ✅ Compliance webhooks will receive events from Shopify

---

## 🆘 Troubleshooting

### "Webhooks not showing in Partners Dashboard"
- Make sure you ran `npm run deploy`
- Check that you're logged in: `shopify auth login`
- Verify `shopify.app.toml` has the webhook subscriptions

### "Webhook endpoint returning 404"
- Wait for Vercel deployment to complete
- Check that the route file exists: `app/routes/webhooks.compliance.tsx`
- Verify the URL in `shopify.app.toml` matches your Vercel URL

### "Webhook returning 401"
- This is correct! Invalid HMAC should return 401
- Test with Shopify CLI to send valid webhooks
- Check Vercel logs for webhook processing

---

**You're all set! Follow the steps above and your compliance webhooks will be live.** 🚀

