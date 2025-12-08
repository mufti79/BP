# Quick Start Guide

Get your Brand Promoter KPI Tracker up and running in 5 minutes!

## 📋 Prerequisites

- Node.js 16 or later ([Download here](https://nodejs.org/))
- A Gemini API Key ([Get one here](https://aistudio.google.com/apikey))

## 🚀 Installation (3 Steps)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure API Key

Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Gemini API key:
```
API_KEY=your_actual_gemini_api_key_here
```

### Step 3: Run the App

```bash
npm run dev
```

That's it! 🎉 Open your browser to `http://localhost:5173`

## 🏗️ Building for Production

```bash
npm run build
```

## 🌐 Deploying

### Quick Deploy Options

**Firebase Hosting:**
```bash
npm run deploy:firebase
```

**Vercel:**
```bash
npm run deploy:vercel
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🔍 What's Included?

- ✅ React + TypeScript
- ✅ Vite for fast development
- ✅ Firebase integration (with offline fallback)
- ✅ AI-powered insights via Gemini
- ✅ Production-ready build configuration
- ✅ CI/CD workflows for GitHub Actions

## 📚 Documentation

- [Full README](./README.md) - Complete documentation
- [Deployment Guide](./DEPLOYMENT.md) - Detailed deployment instructions
- [Security Guide](./SECURITY.md) - Security best practices

## ❓ Troubleshooting

**Build fails?**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Port 5173 already in use?**
```bash
npm run dev -- --port 3000
```

**API key not working?**
- Make sure `.env.local` exists
- Check the key has no extra spaces
- Restart the dev server after changing `.env.local`

## 🤝 Need Help?

- Check the [full documentation](./README.md)
- Review [deployment options](./DEPLOYMENT.md)
- Open an issue on GitHub
