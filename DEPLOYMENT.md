# Kusmani Finance - Deployment Guide

## Overview
- **Frontend**: Deployed on Vercel (auto-deploy from main branch)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **CI/CD**: GitHub Actions (lint, type-check, build validation)

## Prerequisites
1. GitHub account with SSH key configured
2. Vercel account (free tier available)
3. Supabase project already created

## Step 1: Create GitHub Repository

```bash
cd /path/to/kusmani
git add .
git commit -m "Initial commit: Kusmani Finance setup with CI/CD"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kusmani.git
git push -u origin main
```

## Step 2: Connect Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repo "kusmani"
4. Configure:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm ci`

5. Add Environment Variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

6. Click "Deploy"

## Step 3: GitHub Secrets (for CI/CD)

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

These are used by GitHub Actions during the build process.

## Step 4: Verify CI/CD Pipeline

1. Push a test commit:
   ```bash
   git commit --allow-empty -m "test: trigger CI"
   git push origin main
   ```

2. Go to your GitHub repo → Actions tab
3. Watch the workflow run:
   - ✅ Dependencies installed
   - ✅ Linting passed
   - ✅ Type checking passed
   - ✅ Build successful

4. If all checks pass, Vercel will automatically deploy

## Workflow

### Local Development
```bash
npm run dev
```

### Before Push
```bash
# Lint check
npm run lint

# Type check
npm run type-check

# Build test
npm run build
```

### Push to Deploy
```bash
git add .
git commit -m "feat: description"
git push origin main
```

The GitHub Actions CI will run automatically. If it passes, Vercel will deploy to production.

## Troubleshooting

### Build fails on Vercel
- Check the Vercel deployment logs
- Ensure all environment variables are set
- Run `npm run build` locally to reproduce

### CI fails on GitHub Actions
- Check the Actions tab for detailed error logs
- Common issues:
  - Missing dependencies: `npm ci`
  - Linting errors: `npm run lint`
  - Type errors: `npm run type-check`

### Database migrations not applied
- Supabase migrations must be applied manually:
  ```bash
  npx supabase db push
  ```
- This is separate from Vercel deployment

## Environment Variables

### Required for build
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Optional
- `VITE_GROQ_API_KEY` (for local development only, not needed for production with Supabase functions)

## Monitoring

### Vercel Dashboard
- https://vercel.com/dashboard
- View deployments, logs, and analytics

### GitHub Actions
- Go to your repo → Actions tab
- See all CI runs and logs

### Supabase Dashboard
- https://app.supabase.com
- Monitor database, users, and real-time stats

## Production Checklist

Before considering production-ready:

- [ ] GitHub repo is public/private as desired
- [ ] CI/CD pipeline is green on main branch
- [ ] Vercel deployment is successful
- [ ] Production URL works
- [ ] Database RLS policies are enforced
- [ ] Audit logging is active
- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] Environment variables are secure (not in code)
