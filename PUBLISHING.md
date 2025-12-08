# Publishing Guide

This guide walks you through publishing your Brand Promoter KPI Tracker application to production.

## Pre-Publishing Checklist

Before publishing to production, ensure:

- [ ] All features are tested and working
- [ ] Build completes successfully (`npm run build`)
- [ ] Production preview looks correct (`npm run preview`)
- [ ] Environment variables are configured
- [ ] Firebase/Vercel/Netlify accounts are set up
- [ ] API keys are secured (not in source code)
- [ ] Domain name is ready (if using custom domain)

## Step-by-Step Publishing

### Option 1: Firebase Hosting (Recommended)

Firebase Hosting is the recommended option as the app is already configured with Firebase.

#### 1. Prerequisites

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login
```

#### 2. Verify Configuration

Ensure `firebase.json` is correctly configured:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{"source": "**", "destination": "/index.html"}]
  }
}
```

#### 3. Build for Production

```bash
npm run build
```

This creates optimized production files in the `dist/` directory.

#### 4. Test Locally

```bash
npm run preview
```

Open `http://localhost:4173` and verify everything works.

#### 5. Deploy to Firebase

```bash
firebase deploy
```

Or use the npm script:
```bash
npm run deploy:firebase
```

#### 6. Verify Deployment

Firebase will provide a URL like:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/tfw-bp/overview
Hosting URL: https://tfw-bp.web.app
```

Visit the URL to verify your deployment.

#### 7. Set Up Custom Domain (Optional)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Hosting → Add custom domain
4. Follow the DNS configuration instructions

### Option 2: Vercel

Vercel offers automatic deployments from GitHub.

#### Method A: Vercel Dashboard (Easiest)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Add Environment Variables:
   - Key: `API_KEY`
   - Value: Your Gemini API key
6. Click "Deploy"

Every push to main will automatically deploy!

#### Method B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
npm run deploy:vercel
# Or
vercel --prod
```

### Option 3: Netlify

#### Method A: Netlify Dashboard

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "New site from Git"
3. Connect GitHub repository
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add Environment Variables:
   - Go to Site settings → Environment
   - Add `API_KEY` with your Gemini API key
6. Deploy

#### Method B: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

## Setting Up Continuous Deployment

### GitHub Actions (Included)

This repository includes GitHub Actions workflows for CI/CD:

#### Enable GitHub Actions

1. Go to repository Settings → Actions
2. Enable "Allow all actions and reusable workflows"

#### Configure Secrets

**For Firebase Deployment:**

1. Go to repository Settings → Secrets and variables → Actions
2. Add secrets:
   - `API_KEY`: Your Gemini API key
   - `FIREBASE_SERVICE_ACCOUNT`: Your Firebase service account JSON

To get the Firebase service account:
```bash
firebase login
firebase init hosting:github
```

**For Vercel/Netlify:**

If using Vercel or Netlify, configure through their dashboards instead.

#### Workflow Triggers

- **build.yml**: Runs on every push/PR to main or develop
- **firebase-deploy.yml**: Deploys to production on push to main
- **preview.yml**: Creates preview deployments for PRs

## Environment Variables

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `API_KEY` | Gemini API Key | [Google AI Studio](https://aistudio.google.com/apikey) |

### Setting Variables by Platform

**Firebase Hosting:**
- Not directly supported for client-side apps
- Option 1: Use Firebase Functions as a proxy
- Option 2: Accept the API key in client code (development only)

**Vercel:**
```bash
vercel env add API_KEY
```
Or via Dashboard → Settings → Environment Variables

**Netlify:**
Dashboard → Site settings → Environment → Environment variables

## Custom Domain Setup

### Firebase Hosting

1. Firebase Console → Hosting
2. Add custom domain
3. Add DNS records (provided by Firebase)
4. Wait for SSL certificate (automatic)

### Vercel

1. Vercel Dashboard → Project → Settings → Domains
2. Add domain
3. Configure DNS as instructed
4. SSL is automatic

### Netlify

1. Netlify Dashboard → Domain settings
2. Add custom domain
3. Update DNS records
4. SSL is automatic (via Let's Encrypt)

## Post-Deployment

### Verify Everything Works

- [ ] Site loads correctly
- [ ] All pages are accessible
- [ ] Firebase connection works
- [ ] AI insights generate (if API key is configured)
- [ ] Forms submit correctly
- [ ] Data persists

### Monitor Your Site

**Firebase:**
- Performance monitoring in Firebase Console
- Hosting metrics and analytics

**Vercel:**
- Analytics in Vercel Dashboard
- Real-time logs and deployment history

**Netlify:**
- Analytics in Netlify Dashboard
- Deploy logs and functions logs

### Performance Optimization

1. **Enable Caching**: All platforms do this automatically
2. **Use CDN**: Included with Firebase, Vercel, and Netlify
3. **Monitor Bundle Size**: Check build warnings
4. **Optimize Images**: Compress images before deployment
5. **Enable Compression**: Automatic on all platforms

## Rollback

### Firebase

```bash
# View previous deployments
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:rollback
```

### Vercel

- Go to Deployments tab
- Find previous deployment
- Click "Promote to Production"

### Netlify

- Go to Deploys tab
- Find previous deploy
- Click "Publish deploy"

## Security Best Practices

1. **Never commit secrets**: Use environment variables
2. **Rotate API keys regularly**: Every 90 days recommended
3. **Monitor API usage**: Check Google AI Studio dashboard
4. **Enable HTTPS**: Automatic on all platforms
5. **Set up CORS properly**: If using API proxies
6. **Review permissions**: GitHub Actions, Firebase rules
7. **Keep dependencies updated**: Run `npm audit` regularly

## Troubleshooting

### Build Fails on CI/CD

1. Check Node.js version (should match your local version)
2. Verify environment variables are set
3. Check build logs for specific errors
4. Try running `npm ci` instead of `npm install`

### Site Not Loading

1. Check deployment status
2. Verify DNS configuration (if using custom domain)
3. Check browser console for errors
4. Clear browser cache

### API Key Not Working

1. Verify key is set in environment variables
2. Check key has no extra spaces/newlines
3. Verify key is active in Google AI Studio
4. Check API quotas

### Firebase Connection Issues

1. Check Firebase configuration in `storageService.ts`
2. Verify project ID is correct
3. Check browser console for Firebase errors
4. App will fallback to LocalStorage if Firebase unavailable

## Maintenance

### Regular Tasks

- **Weekly**: Monitor API usage and costs
- **Monthly**: Review analytics and performance
- **Quarterly**: Update dependencies (`npm update`)
- **Annually**: Rotate API keys and credentials

### Updating the App

1. Make changes locally
2. Test with `npm run dev`
3. Build with `npm run build`
4. Test with `npm run preview`
5. Push to GitHub (auto-deploys if CI/CD configured)
6. Or manually deploy: `npm run deploy:firebase`

## Support Resources

- **Firebase**: [Firebase Documentation](https://firebase.google.com/docs)
- **Vercel**: [Vercel Documentation](https://vercel.com/docs)
- **Netlify**: [Netlify Documentation](https://docs.netlify.com)
- **Vite**: [Vite Guide](https://vitejs.dev/guide/)
- **React**: [React Documentation](https://react.dev)

## Success Indicators

Your app is successfully published when:

✅ The URL is accessible publicly
✅ All features work correctly
✅ SSL/HTTPS is enabled
✅ Custom domain is configured (if applicable)
✅ CI/CD pipeline is working (if configured)
✅ Monitoring is set up
✅ Team has access to deployment dashboard

## Next Steps

After publishing:

1. Share the URL with stakeholders
2. Set up monitoring and alerts
3. Configure custom domain (if needed)
4. Document any custom configuration
5. Train team on how to use the deployed app
6. Set up regular backup procedures
7. Create a maintenance schedule

---

**Need Help?**

If you encounter issues:
1. Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
2. Review the [README.md](./README.md) documentation
3. Search for similar issues in the repository
4. Open an issue with detailed information
