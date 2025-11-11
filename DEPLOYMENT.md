# Deployment Guide - BookMyForex

## Vercel Deployment (Frontend Only)

### Option 1: Deploy from Root (Monorepo Setup)

Your project has both backend and frontend in one repository. Vercel needs to know which part to deploy.

#### Step 1: Configure Vercel Project Settings

When importing your GitHub repository to Vercel:

1. **Framework Preset**: Select "Next.js"
2. **Root Directory**: Set to `frontend` (CRITICAL!)
3. **Build Command**: `npm run build` (default is fine)
4. **Output Directory**: `.next` (default is fine)
5. **Install Command**: `npm install` (default is fine)

#### Step 2: Set Environment Variables in Vercel Dashboard

Go to Project Settings → Environment Variables and add:

```
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_WS_URL=https://your-backend-api.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_key
```

#### Step 3: Deploy

```bash
# Push to GitHub (already done)
git push origin main

# Vercel will auto-deploy on push
# Or manually trigger from Vercel dashboard
```

### Option 2: Deploy Frontend Separately

If you want to deploy only the frontend as a separate repository:

```bash
# Create a new repository for frontend only
cd frontend
git init
git add .
git commit -m "Frontend deployment"
git remote add origin https://github.com/yourusername/bookmyforex-frontend.git
git push -u origin main

# Then import this repository to Vercel normally
```

---

## Backend Deployment Options

### Option 1: Railway.app (Recommended)

1. Go to https://railway.app/
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. **Root Directory**: Set to `backend`
5. Add environment variables from `.env.example`
6. Railway will auto-detect Node.js and deploy

### Option 2: Render.com

1. Go to https://render.com/
2. New → Web Service
3. Connect your GitHub repository
4. **Root Directory**: `backend`
5. **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
6. **Start Command**: `npm start`
7. Add environment variables
8. Create PostgreSQL database in Render
9. Deploy

### Option 3: Heroku

```bash
cd backend

# Login to Heroku
heroku login

# Create app
heroku create bookmyforex-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set RAZORPAY_KEY_ID=your_key
# ... add all other env vars

# Deploy
git subtree push --prefix backend heroku main

# Run migrations
heroku run npx prisma migrate deploy
heroku run npx prisma db seed
```

---

## Complete Production Setup

### 1. Backend Deployment (Railway Example)

**Environment Variables:**
```env
DATABASE_URL=postgresql://...  # Railway provides this
PORT=5000
NODE_ENV=production
JWT_SECRET=your-production-secret-min-32-chars
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG....
EMAIL_FROM=noreply@bookmyforex.com
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
FRONTEND_URL=https://bookmyforex.vercel.app
```

**After deployment, note your backend URL:**
```
https://bookmyforex-api.up.railway.app
```

### 2. Frontend Deployment (Vercel)

**Project Settings:**
- Root Directory: `frontend`
- Framework: Next.js
- Node Version: 18.x

**Environment Variables:**
```env
NEXT_PUBLIC_API_URL=https://bookmyforex-api.up.railway.app
NEXT_PUBLIC_WS_URL=https://bookmyforex-api.up.railway.app
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
```

### 3. Update Backend CORS

After deploying frontend, update backend `.env`:
```env
FRONTEND_URL=https://bookmyforex.vercel.app
```

Or update `backend/src/server.js` CORS configuration:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://bookmyforex.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

---

## Troubleshooting Vercel Errors

### Error: "NOT_FOUND"

**Causes:**
1. ❌ Root directory not set to `frontend`
2. ❌ Missing `public` folder in Next.js project
3. ❌ Wrong build configuration
4. ❌ Missing `package.json` in root directory

**Solutions:**
- ✅ Set Root Directory to `frontend` in Vercel project settings
- ✅ Ensure `frontend/public` folder exists (created above)
- ✅ Use the `vercel.json` configuration provided
- ✅ Or deploy frontend as separate repository

### Error: "BUILD_FAILED"

**Causes:**
1. Missing environment variables
2. TypeScript errors
3. Missing dependencies

**Solutions:**
```bash
# Test build locally first
cd frontend
npm install
npm run build

# Fix any errors before deploying
```

### Error: "FUNCTION_INVOCATION_TIMEOUT"

**Cause:** API calls timing out

**Solution:**
- Ensure backend is deployed and running
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend CORS allows frontend domain

### Error: "MODULE_NOT_FOUND"

**Cause:** Missing dependencies

**Solution:**
```bash
# Ensure all imports have corresponding packages
cd frontend
npm install
```

---

## Custom Domain Setup

### Vercel (Frontend)

1. Go to Project Settings → Domains
2. Add your domain: `www.bookmyforex.com`
3. Add DNS records as shown by Vercel
4. Wait for SSL certificate (automatic)

### Railway (Backend)

1. Go to Project Settings → Domains
2. Add custom domain: `api.bookmyforex.com`
3. Add CNAME record pointing to Railway
4. Update frontend env: `NEXT_PUBLIC_API_URL=https://api.bookmyforex.com`

---

## Monitoring & Logs

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# View logs
vercel logs

# View deployments
vercel ls
```

### Railway
- View logs in Railway dashboard
- Set up log drains for external monitoring

---

## Production Checklist

### Before Deployment:
- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] Seed data loaded
- [ ] API endpoints tested
- [ ] CORS configured correctly
- [ ] SSL certificates active
- [ ] Error tracking setup (Sentry)
- [ ] Analytics setup (Google Analytics)

### After Deployment:
- [ ] Test user registration
- [ ] Test login flow
- [ ] Test order creation
- [ ] Test payment flow
- [ ] Test admin dashboard
- [ ] Test email notifications
- [ ] Test SMS notifications
- [ ] Monitor error logs
- [ ] Set up uptime monitoring

---

## Rollback Strategy

### Vercel
```bash
# Rollback to previous deployment
vercel rollback
```

Or use Vercel dashboard → Deployments → Promote to Production

### Railway
- Use Railway dashboard to rollback
- Or redeploy previous commit from GitHub

---

## Cost Estimates

### Free Tier (Development/Testing)
- **Vercel**: Free (Hobby plan)
- **Railway**: $5/month credit (then pay-as-you-go)
- **PostgreSQL**: Included in Railway
- **Total**: ~$5-10/month

### Production (Low Traffic)
- **Vercel Pro**: $20/month
- **Railway**: ~$20-30/month
- **SendGrid**: Free (100 emails/day) or $15/month
- **Twilio**: Pay per SMS (~$0.01/SMS)
- **Total**: ~$40-70/month

---

## Support

For deployment issues:
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app/
- Next.js Deployment: https://nextjs.org/docs/deployment

---

**Ready to deploy! 🚀**
