# Deployment Guide for TaskFlow

## Frontend Deployment (Vercel)

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Enter: `https://github.com/WasayBaig10/to-do-nextjs-app`
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
   - **Output Directory**: `.next`

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```

6. Click "Deploy"

### Option 2: Deploy via CLI

```bash
# Authenticate first (this will open browser)
vercel login

# Navigate to frontend folder
cd frontend

# Deploy
vercel

# For production deployment
vercel --prod
```

## Backend Deployment

### Option 1: Render (Free, Recommended)

1. Go to https://render.com
2. Sign up/login
3. Click "New" → "Web Service"
4. Connect your GitHub repo
5. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt` (or use pyproject.toml)
   - **Start Command**: `python -m uvicorn src.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables**:
     ```
     DATABASE_URL=your-neon-database-url
     BETTER_AUTH_SECRET=your-secret-key
     ```

6. Click "Deploy"

### Option 2: Railway

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `to-do-nextjs-app`
4. Select backend folder
5. Add environment variables
6. Deploy

### Option 3: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Initialize
cd backend
flyctl launch

# Deploy
flyctl deploy
```

## Environment Variables Setup

### Frontend (.env)
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

### Backend (.env)
```bash
DATABASE_URL=your-production-database-url
BETTER_AUTH_SECRET=your-secure-secret-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=TaskFlow
EMAILS_ENABLED=true
```

## Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and accessible
- [ ] Update `NEXT_PUBLIC_API_URL` in frontend to point to production backend
- [ ] Test authentication flow
- [ ] Test task creation/deletion
- [ ] Test password reset email
- [ ] Verify dark mode works
- [ ] Check responsive design on mobile
- [ ] Verify animations work

## Custom Domain (Optional)

1. Go to Vercel dashboard
2. Select your project
3. Go to "Settings" → "Domains"
4. Add your custom domain
5. Update DNS records as instructed

## Monitoring

### Vercel Dashboard
- View logs: https://vercel.com/dashboard
- Analytics: Deployment metrics, performance
- Deployments: Rollback if needed

### Backend Monitoring (Render)
- Logs available in Render dashboard
- Automatic restarts on crashes
- SSL certificates included

## Troubleshooting

### Frontend Issues
- **Build fails**: Check `package.json` dependencies
- **API errors**: Verify `NEXT_PUBLIC_API_URL` is correct
- **Blank page**: Check browser console for errors

### Backend Issues
- **Database connection**: Verify DATABASE_URL
- **CORS errors**: Update CORS origins in `main.py`
- **Email not sending**: Check email credentials

## Cost Estimate

### Free Tier Options:
- **Vercel**: Free for personal projects (100GB bandwidth/month)
- **Render**: Free tier available (750 hours/month)
- **Railway**: $5 free credit/month
- **Fly.io**: Free tier with 3 small VMs

### Total Cost: $0/month (using free tiers)

---

**Status**: Ready for deployment!
