# Vercel & Config Files: Complete Verification

## ✅ Current Setup Verification

### **1. vercel.json - ✅ CORRECT**

```json
{
  "buildCommand": "npm run setup && npm run build",
  "outputDirectory": "build/client",
  "installCommand": "npm install",
  "rewrites": [{ "source": "/(.*)", "destination": "/api/index.js" }]
}
```

**Status:** ✅ Perfect! This is correct.

**What it does:**

- Builds your React Router app
- Outputs to `build/client`
- Routes all requests to `/api/index.js` (your serverless function)
- **Does NOT run any Shopify CLI commands** (this is correct!)

---

### **2. package.json Scripts - ✅ CORRECT**

```json
"dev": "shopify app dev --config shopify.app.dev.toml",
"deploy": "shopify app deploy --config shopify.app.prod.toml"
```

**Status:** ✅ Perfect! Scripts are correctly configured.

---

### **3. Config Files - ✅ CORRECT**

- ✅ `shopify.app.dev.toml` - Dev config (Client ID: `36a877dccd571b92316f87e260440e96`)
- ✅ `shopify.app.prod.toml` - Prod config (Client ID: `d5a42a94b23c58caef6dc110e896012a`)
- ✅ `shopify.app.toml` - Default config (points to production, safe)

---

## 🎯 How It Actually Works

### **Important Clarification:**

**When you push to git:**

- ✅ Code is pushed to GitHub
- ✅ Vercel automatically detects the push
- ✅ Vercel runs: `npm run setup && npm run build` (from vercel.json)
- ✅ Vercel deploys the built code
- ⚠️ **Vercel does NOT run `shopify app deploy`** - it just builds and deploys your code

**When you run `npm run dev` locally:**

- ✅ Uses `shopify.app.dev.toml`
- ✅ Updates Dev App URLs
- ✅ Production stays safe

**When you manually deploy to Shopify:**

- ✅ Run: `npm run deploy` (or `shopify app deploy --config shopify.app.prod.toml`)
- ✅ Uses `shopify.app.prod.toml`
- ✅ Updates Shopify app version
- ✅ Production URLs stay stable

---

## 🔍 What Happens in Each Scenario

### **Scenario 1: Local Development**

```bash
npm run dev
```

**Uses:** `shopify.app.dev.toml` ✅
**Updates:** Dev App URLs only ✅
**Production:** Stays untouched ✅

### **Scenario 2: Push to Git**

```bash
git push
```

**Vercel automatically:**

1. Detects the push
2. Runs: `npm run setup && npm run build`
3. Deploys the built code
4. **Does NOT touch Shopify configs** ✅

**Result:** Your code is deployed to Vercel, but Shopify app configs are NOT updated automatically.

### **Scenario 3: Manual Shopify Deployment**

```bash
npm run deploy
```

**Uses:** `shopify.app.prod.toml` ✅
**Updates:** Shopify app version ✅
**URLs:** Stay pointing to Vercel (protected) ✅

---

## ⚠️ Important Clarification

**Vercel does NOT automatically run `shopify app deploy` when you push to git.**

Vercel only:

- Builds your code (`npm run build`)
- Deploys it to Vercel servers
- Serves it via your serverless function

**Shopify app deployment is separate:**

- You manually run `npm run deploy` when you want to update the Shopify app
- This uses `shopify.app.prod.toml`
- This updates the app version in Shopify Partners

---

## ✅ Safety Verification

### **Is Production Safe?**

**YES! Here's why:**

1. **Vercel builds don't touch Shopify:**
   - `vercel.json` only runs `npm run build`
   - No Shopify CLI commands are executed
   - Production app configs are never touched

2. **Local dev uses dev config:**
   - `npm run dev` → Uses `shopify.app.dev.toml`
   - Only Dev App gets updated
   - Production app stays safe

3. **Manual deploy uses prod config:**
   - `npm run deploy` → Uses `shopify.app.prod.toml`
   - `automatically_update_urls_on_dev = false` protects URLs
   - Production URLs stay stable

4. **Default config is safe:**
   - `shopify.app.toml` points to production
   - But has `automatically_update_urls_on_dev = false`
   - Even if someone runs `shopify app dev` without `--config`, URLs won't be updated

---

## 🎯 Final Verification Checklist

Before pushing to git, verify:

- [x] `vercel.json` is correct (builds app, doesn't run Shopify commands)
- [x] `package.json` scripts use correct configs
- [x] `shopify.app.dev.toml` has Dev App Client ID
- [x] `shopify.app.prod.toml` has Production App Client ID
- [x] `shopify.app.prod.toml` has `automatically_update_urls_on_dev = false`
- [x] All URLs in prod config point to Vercel
- [x] All three config files are ready to commit

---

## ✅ Summary: You're Safe!

**When you push to git:**

- ✅ Code is deployed to Vercel
- ✅ Shopify configs are NOT automatically updated
- ✅ Production app stays safe

**When you run `npm run dev`:**

- ✅ Uses dev config
- ✅ Only Dev App is updated
- ✅ Production stays safe

**When you run `npm run deploy`:**

- ✅ Uses prod config
- ✅ Production URLs are protected
- ✅ Everything is safe

**You're all set! Ready to push to git! 🚀**
