# 🔧 Fix Vercel 404 NOT_FOUND Error

## The Problem

You're seeing: `404: NOT_FOUND` because Vercel is looking at your repository root, but your Next.js app is in the `frontend/` subdirectory.

## ✅ Solution: Configure Root Directory in Vercel

### Step 1: Go to Your Vercel Project Settings

1. Open https://vercel.com/dashboard
2. Click on your `bookmyforex-com-rename` project
3. Click **Settings** (top navigation)
4. Click **General** (left sidebar)

### Step 2: Set Root Directory

Scroll down to **Root Directory** section:

```
Root Directory: frontend
```

**IMPORTANT:** Type exactly `frontend` (no slashes, no quotes)

Click **Save**

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click the three dots (...) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

---

## Alternative: Delete and Re-import Project

If the above doesn't work, try this:

### Step 1: Delete Current Project

1. Go to Project Settings → General
2. Scroll to bottom
3. Click **Delete Project**
4. Confirm deletion

### Step 2: Re-import with Correct Settings

1. Click **Add New** → **Project**
2. Select your GitHub repository: `bookmyforex.com-rename`
3. **BEFORE clicking Deploy**, configure:

   **Framework Preset:** Next.js
   
   **Root Directory:** `frontend` ⚠️ **CRITICAL - Click "Edit" and type "frontend"**
   
   **Build Command:** `npm run build` (default)
   
   **Output Directory:** `.next` (default)
   
   **Install Command:** `npm install` (default)

4. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_WS_URL=http://localhost:5000
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
   ```

5. Click **Deploy**

---

## Verify It's Working

After deployment completes, you should see:

✅ **Build Logs showing:**
```
Building Next.js app...
Compiled successfully
```

✅ **Your site loads** at the Vercel URL (e.g., `bookmyforex-com-rename.vercel.app`)

✅ **No 404 errors**

---

## Still Getting 404?

### Check These Common Issues:

#### 1. Root Directory Not Set
```
❌ Root Directory: (blank)
✅ Root Directory: frontend
```

#### 2. Wrong Framework
```
❌ Framework: Other
✅ Framework: Next.js
```

#### 3. Missing Environment Variables
- Check that all `NEXT_PUBLIC_*` variables are set
- They should be in Project Settings → Environment Variables

#### 4. Build Errors
- Check deployment logs for errors
- Look for TypeScript errors or missing dependencies

---

## Understanding the Error

### What Vercel Was Doing:

```
1. Vercel looks at repository root
2. Tries to find: package.json, next.config.js, app/ directory
3. Finds: README.md, backend/, frontend/ (but no Next.js files at root)
4. Result: "I don't know what to build here" → 404 NOT_FOUND
```

### What Vercel Needs:

```
Option A (Root Directory Setting):
1. You tell Vercel: "Look in the 'frontend' folder"
2. Vercel goes to frontend/
3. Finds: package.json ✅, next.config.js ✅, app/ ✅
4. Result: "Found Next.js app!" → Builds successfully

Option B (Separate Repo):
1. Create new repo with only frontend code
2. Vercel finds everything at root
3. Result: Builds successfully
```

---

## Quick Checklist

Before deploying, verify:

- [ ] Root Directory is set to `frontend`
- [ ] Framework is set to `Next.js`
- [ ] Environment variables are added
- [ ] `frontend/package.json` exists
- [ ] `frontend/next.config.js` exists
- [ ] `frontend/app/` directory exists
- [ ] `frontend/public/` directory exists

---

## Test Locally First

Before deploying, always test the build locally:

```bash
cd frontend
npm install
npm run build
npm start
```

If this works locally, it should work on Vercel (with correct Root Directory setting).

---

## Need More Help?

1. **Check Vercel Logs:**
   - Go to Deployments → Click on failed deployment → View logs
   
2. **Vercel Support Docs:**
   - https://vercel.com/docs/concepts/monorepos
   - https://vercel.com/docs/concepts/projects/overview#root-directory

3. **Common Vercel Errors:**
   - https://vercel.com/docs/errors

---

## Summary

**The Fix:** Set `Root Directory` to `frontend` in Vercel project settings, then redeploy.

**Why:** Your Next.js app is in a subdirectory, not at the repository root. Vercel needs to be told where to look.

**Result:** Vercel will find your Next.js app and deploy it successfully! 🚀
