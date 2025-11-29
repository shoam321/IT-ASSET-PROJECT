# Vercel Deployment Guide for IT Asset Tracker

## Prerequisites
- Vercel account (vercel.com)
- GitHub account with IT-ASSET-PROJECT repo
- Supabase PostgreSQL database URL

## Deployment Steps

### 1. Connect to Vercel

Visit https://vercel.com and:
1. Click "New Project"
2. Import your GitHub repository: `shoam321/IT-ASSET-PROJECT`
3. Select project scope and click "Import"

### 2. Configure Environment Variables

In Vercel Project Settings → Environment Variables, add:

```
DATABASE_URL=postgresql://postgres:PASSWORD@host:5432/postgres
REACT_APP_API_URL=https://your-vercel-url.vercel.app/api
REACT_APP_URL=https://your-vercel-url.vercel.app
```

Replace:
- `PASSWORD` with your Supabase password
- `your-vercel-url` with your Vercel deployment URL (shown after first deploy)

### 3. Configure Build Settings

**Root Directory**: (leave empty or set to `.`)

**Build Command**:
```bash
cd itam-saas/Client && npm install && npm run build
```

**Output Directory**: `itam-saas/Client/build`

**Install Command**:
```bash
npm install
```

### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Once deployed, Vercel will provide your live URL

### 5. Update Frontend API URL

After first deployment, update `.env` in `itam-saas/Client/`:

```
REACT_APP_API_URL=https://your-vercel-url.vercel.app/api
```

Then push to GitHub to trigger a redeploy.

## Troubleshooting

### Build Fails
- Ensure all dependencies are in package.json
- Check Node version compatibility (recommend 18+)
- View build logs in Vercel dashboard

### Database Connection Errors
- Verify DATABASE_URL is correct
- Check Supabase IP whitelist allows Vercel IPs
- Ensure tables exist in database

### API Not Working
- Check that `/api/` routes are properly configured
- Verify CORS settings allow your Vercel domain
- Check Vercel function logs

## Next Steps

1. **Add custom domain** (Settings → Domains)
2. **Set up CI/CD** (automatic deployments on push)
3. **Monitor performance** (Analytics in Vercel dashboard)
4. **Enable error tracking** (Vercel Monitoring)

## Local Development

To test before deploying:
```bash
# Terminal 1 - Backend
cd itam-saas/Agent
npm start

# Terminal 2 - Frontend
cd itam-saas/Client
npm start
```

Visit http://localhost:3000
