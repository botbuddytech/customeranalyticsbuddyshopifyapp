# Development vs Production Guide

## 🔄 How Local Development and Production Work

### **They are completely separate!**

- **Local Development** (`npm run dev`) = Your computer + tunnel URL
- **Production** (Vercel) = Live deployment at `customeranalyticsbuddyshopifyapp.vercel.app`

**Running `npm run dev` will NOT affect your Vercel deployment!**

---

## 🚀 Running Local Development

### Step 1: Start Local Development Server

```bash
npm run dev
```

### What happens:
1. **Shopify CLI starts a local server** on your computer (usually `localhost:3000`)
2. **Creates a tunnel URL** automatically (like `https://abc123.trycloudflare.com`)
3. **Temporarily updates** your app URLs in Shopify Partners to use the tunnel URL
4. **Your Vercel deployment stays untouched** - it continues running normally

### Step 2: Test Your Changes

- The app will be accessible via the tunnel URL (shown in terminal)
- You can install it in a **test/development store** to test changes
- All changes are local - nothing affects production

### Step 3: Stop Development

Press `Ctrl+C` to stop the dev server.

**What happens:**
- Tunnel URL is closed
- Shopify CLI **automatically restores** your production URLs (Vercel URL) in Shopify Partners
- Your Vercel deployment continues working normally

---

## 📋 How URLs Are Managed

### During Local Development (`npm run dev`)

```
Your Computer (localhost:3000)
    ↓
Shopify CLI Tunnel (abc123.trycloudflare.com)
    ↓
Shopify Partners (temporarily updated)
```

**Your `shopify.app.toml` file:**
- `application_url` = Still shows Vercel URL (this is fine!)
- `automatically_update_urls_on_dev = true` ← This makes Shopify CLI handle URL switching automatically

### During Production (Vercel)

```
Vercel Server (customeranalyticsbuddyshopifyapp.vercel.app)
    ↓
Shopify Partners (production URLs)
    ↓
Live Shopify Stores
```

---

## ✅ Best Practices

### 1. **Use Test Stores for Development**

Always test locally with a **development store**, not your live store:
- Create a test store: [partners.shopify.com](https://partners.shopify.com) → Development stores
- Install your app in the test store when running `npm run dev`
- This keeps production data safe

### 2. **Environment Variables**

**Local Development:**
- Uses `.env` file in your project root
- Uses SQLite for sessions (`sessions.sqlite` file)
- Uses `NODE_ENV=development`

**Production (Vercel):**
- Uses environment variables in Vercel dashboard
- Uses PostgreSQL for sessions (Supabase)
- Uses `NODE_ENV=production`

### 3. **Database**

**Local Development:**
- Can use local SQLite or connect to Supabase
- Session storage: `sessions.sqlite` file (local)

**Production:**
- Uses Supabase PostgreSQL
- Session storage: `Session` table in PostgreSQL

---

## 🔧 Switching Between Dev and Production

### To Start Development:

```bash
# 1. Make sure you're on the right branch
git checkout biki  # or your dev branch

# 2. Start dev server
npm run dev

# 3. Shopify CLI will:
#    - Create tunnel URL
#    - Update Shopify Partners URLs temporarily
#    - Show you the tunnel URL in terminal
```

### To Deploy to Production:

```bash
# 1. Commit your changes
git add .
git commit -m "Your changes"
git push origin biki

# 2. Merge to main (if ready)
git checkout main
git merge biki
git push origin main

# 3. Vercel automatically deploys from main branch
#    (or deploy manually: vercel --prod)
```

---

## 🎯 Common Scenarios

### Scenario 1: "I want to add a new feature"

1. **Start local dev:**
   ```bash
   npm run dev
   ```

2. **Make your changes** in the code

3. **Test locally** using the tunnel URL

4. **When ready, deploy:**
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin biki
   git checkout main
   git merge biki
   git push origin main
   ```

5. **Vercel automatically deploys** (or wait a few minutes)

### Scenario 2: "I want to test production locally"

You can't exactly "test production" locally, but you can:

1. **Set production environment variables** in your `.env`:
   ```env
   NODE_ENV=production
   DATABASE_URL=your_supabase_url
   # ... other production vars
   ```

2. **Build and run production build:**
   ```bash
   npm run build
   npm run start
   ```

3. **Test with production database** (be careful!)

### Scenario 3: "I'm getting errors in production but not locally"

1. **Check Vercel function logs:**
   - Vercel Dashboard → Your Project → Functions → `api/index.js` → Logs

2. **Compare environment variables:**
   - Local: Check `.env` file
   - Production: Check Vercel Dashboard → Settings → Environment Variables

3. **Check database:**
   - Local: SQLite file
   - Production: Supabase PostgreSQL

---

## ⚠️ Important Notes

### ✅ Safe to Do:
- Run `npm run dev` anytime - won't affect production
- Make changes locally and test
- Use test stores for development
- Deploy to Vercel when ready

### ❌ Don't Do:
- Don't test production features on live stores during development
- Don't modify production database directly during local dev
- Don't commit `.env` file (it's in `.gitignore`)

---

## 🔍 How to Verify You're in Dev Mode

### Check the Terminal Output:

When you run `npm run dev`, you'll see:
```
✓ Using tunnel URL: https://abc123.trycloudflare.com
✓ App URL updated in Shopify Partners
```

### Check Your Code:

The app automatically detects environment:
```typescript
// In shopify.server.ts
const appSessionStorage =
  process.env.NODE_ENV === "production"
    ? new PrismaSessionStorage(prisma)  // Production: PostgreSQL
    : new SQLiteSessionStorage("./sessions.sqlite");  // Dev: SQLite
```

---

## 📚 Quick Reference

| Action | Command | What It Does |
|--------|---------|--------------|
| Start local dev | `npm run dev` | Creates tunnel, starts local server |
| Stop local dev | `Ctrl+C` | Closes tunnel, restores production URLs |
| Deploy to Vercel | Push to `main` branch | Auto-deploys (or `vercel --prod`) |
| Check Vercel logs | Vercel Dashboard → Functions → Logs | See production errors |
| Update Shopify config | `npm run deploy` | Syncs `shopify.app.toml` to Shopify |

---

## 🆘 Troubleshooting

### "Tunnel URL not working"
- Check your internet connection
- Try restarting: `Ctrl+C` then `npm run dev` again
- Check if Cloudflare tunnel service is accessible

### "Production still showing old code"
- Wait 2-5 minutes for Vercel to rebuild
- Check Vercel Dashboard → Deployments (should show latest commit)
- Hard refresh browser: `Ctrl+Shift+R`

### "Can't connect to database in dev"
- Check `.env` file has `DATABASE_URL`
- Or use SQLite (default for dev) - no database needed

---

**Summary: You can safely run `npm run dev` anytime - it won't affect your Vercel deployment!** 🎉

