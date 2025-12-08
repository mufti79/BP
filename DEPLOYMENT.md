# Deployment Guide

This guide provides detailed instructions for deploying the Brand Promoter KPI Tracker to various platforms.

## Table of Contents

1. [Pre-deployment Checklist](#pre-deployment-checklist)
2. [Firebase Hosting](#firebase-hosting)
3. [Vercel](#vercel)
4. [Netlify](#netlify)
5. [GitHub Pages](#github-pages)
6. [Environment Variables](#environment-variables)
7. [Continuous Deployment](#continuous-deployment)

## Pre-deployment Checklist

Before deploying, ensure:

- [ ] All dependencies are installed (`npm install`)
- [ ] The app builds successfully (`npm run build`)
- [ ] You have your Gemini API key ready
- [ ] Firebase configuration is correct (if using Firebase)
- [ ] All tests pass (if applicable)

## Firebase Hosting

Firebase Hosting provides fast and secure hosting for web apps.

### Initial Setup

1. **Install Firebase CLI globally**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project** (if not already done):
   ```bash
   firebase init hosting
   ```
   
   During initialization:
   - Select your Firebase project (or create a new one)
   - Set public directory to: `dist`
   - Configure as single-page app: `Yes`
   - Set up automatic builds: `No` (we'll build manually)
   - Don't overwrite `index.html`

### Deploy

**Quick Deploy**:
```bash
npm run deploy:firebase
```

**Manual Deploy**:
```bash
npm run build
firebase deploy
```

**Deploy Only Hosting**:
```bash
firebase deploy --only hosting
```

### Custom Domain

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

## Vercel

Vercel offers seamless deployment with automatic builds from GitHub.

### Method 1: Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   npm run deploy:vercel
   ```
   
   Or:
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables**:
   ```bash
   vercel env add API_KEY
   ```
   Then paste your Gemini API key when prompted.

### Method 2: GitHub Integration (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variable:
   - Name: `API_KEY`
   - Value: Your Gemini API key
6. Deploy

Every push to your main branch will automatically deploy.

## Netlify

Netlify provides continuous deployment and hosting.

### Method 1: Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**:
   ```bash
   netlify login
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

4. **Configure**:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Method 2: GitHub Integration

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add environment variable:
   - Go to Site settings → Environment → Environment variables
   - Add `API_KEY` with your Gemini API key
6. Deploy

### Custom Domain on Netlify

1. Go to Domain settings
2. Add custom domain
3. Configure DNS records as instructed

## GitHub Pages

GitHub Pages is free for public repositories.

### Setup

1. **Install gh-pages package**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json**:
   ```json
   {
     "scripts": {
       "deploy:github": "npm run build && gh-pages -d dist"
     }
   }
   ```

3. **Update vite.config.ts** for GitHub Pages:
   ```typescript
   export default defineConfig({
     base: '/BP/', // Replace with your repository name
     // ... rest of config
   });
   ```

4. **Deploy**:
   ```bash
   npm run deploy:github
   ```

5. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` → `/ (root)`
   - Save

Your site will be available at: `https://<username>.github.io/BP/`

## Environment Variables

### Development

Create `.env.local` file:
```
API_KEY=your_gemini_api_key_here
```

### Production

**Firebase**:
- Environment variables are not directly supported in static hosting
- Consider using Firebase Functions as a proxy
- Or accept the API key in the client (less secure)

**Vercel**:
```bash
vercel env add API_KEY
```

**Netlify**:
- Dashboard → Site settings → Environment → Environment variables
- Add `API_KEY`

**GitHub Pages**:
- Not recommended for sensitive keys
- Consider using a backend proxy

## Continuous Deployment

### GitHub Actions for Firebase

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          API_KEY: ${{ secrets.API_KEY }}
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: your-firebase-project-id
```

### Vercel

- Automatic via GitHub integration
- Configure in Vercel dashboard

### Netlify

- Automatic via GitHub integration
- Configure in Netlify dashboard

## Troubleshooting

### Build Fails

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check Node.js version (should be 16+)

### Environment Variables Not Working

- Ensure variable names match exactly
- Rebuild after changing environment variables
- Check if your hosting platform requires a specific prefix (e.g., `VITE_`)

### Firebase Deploy Fails

- Check if you're logged in: `firebase login`
- Verify project: `firebase projects:list`
- Ensure `dist` folder exists

## Security Best Practices

1. **Never commit `.env.local`** - it's in `.gitignore`
2. **Use environment variables** for all secrets
3. **Consider a backend proxy** for API keys in production
4. **Enable CORS** if using API proxies
5. **Use HTTPS** - all modern hosting platforms provide it
6. **Rotate API keys** regularly
7. **Monitor API usage** in Google AI Studio

## Performance Optimization

1. **Enable caching** - most platforms do this by default
2. **Use CDN** - Firebase, Vercel, and Netlify all provide CDNs
3. **Optimize images** - compress before deployment
4. **Code splitting** - consider using dynamic imports
5. **Monitor bundle size** - the build process warns about large chunks

## Support

For issues specific to:
- **Firebase**: [Firebase Support](https://firebase.google.com/support)
- **Vercel**: [Vercel Documentation](https://vercel.com/docs)
- **Netlify**: [Netlify Support](https://www.netlify.com/support/)
- **GitHub Pages**: [GitHub Pages Documentation](https://docs.github.com/pages)
