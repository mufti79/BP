<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Brand Promoter KPI Tracker

A comprehensive dashboard for amusement park brand promoters to track sales, manage customer data, and verify KPIs.

View your app in AI Studio: https://ai.studio/apps/drive/1_qVN-yRHvm568ZAiiVs0ZX3o34EUsHbT

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 16 or later)
- **npm** (comes with Node.js)
- A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/apikey)

### Installation & Setup

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd BP
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure API Key**:
   - Copy the `.env.example` file to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Edit `.env.local` and replace `your_gemini_api_key_here` with your actual Gemini API key:
     ```
     API_KEY=your_actual_api_key_here
     ```

4. **Run the app locally**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## 📦 Building for Production

To create a production build:

```bash
npm run build
```

This creates optimized files in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

## 🌐 Deployment Options

### Option 1: Firebase Hosting

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase** (if not already done):
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set public directory to `dist`
   - Configure as single-page app: Yes
   - Don't overwrite existing files

4. **Deploy to Firebase**:
   ```bash
   npm run deploy:firebase
   ```
   Or manually:
   ```bash
   npm run build
   firebase deploy
   ```

### Option 2: Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   npm run deploy:vercel
   ```
   Or use the Vercel dashboard to connect your GitHub repository for automatic deployments.

3. **Set Environment Variables in Vercel**:
   - Go to your project settings in Vercel
   - Add `API_KEY` environment variable with your Gemini API key

### Option 3: GitHub Pages

1. **Install gh-pages package**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add deploy script to package.json**:
   ```json
   "scripts": {
     "deploy:github": "npm run build && gh-pages -d dist"
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy:github
   ```

### Option 4: Netlify

1. **Install Netlify CLI** (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy to Netlify**:
   ```bash
   netlify deploy --prod
   ```
   - Build command: `npm run build`
   - Publish directory: `dist`

## 🔧 Configuration

### Firebase Configuration

The app is pre-configured to use Firebase Firestore for data storage. The Firebase configuration is located in `services/storageService.ts`. The app will work in offline mode using LocalStorage as a fallback if Firebase is unavailable.

### Environment Variables

- `API_KEY`: Your Gemini API key for AI-powered insights

**Important**: Never commit `.env.local` file to version control. It's already included in `.gitignore`.

## 🏗️ Project Structure

```
BP/
├── components/          # React components
├── services/           # API services (Firebase, Gemini)
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
├── types.ts            # TypeScript type definitions
├── firebase.json       # Firebase configuration
├── vercel.json         # Vercel configuration
├── vite.config.ts      # Vite build configuration
└── package.json        # Project dependencies and scripts
```

## 🔐 Security Notes

- **Never expose your API key in client-side code** for production applications
- Consider using a backend proxy to secure your API key
- The `.env.local` file is ignored by git to prevent accidental commits
- For production deployments, set environment variables through your hosting platform's dashboard

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run deploy:firebase` - Build and deploy to Firebase
- `npm run deploy:vercel` - Deploy to Vercel
- `npm run test:build` - Build and preview to test production build

## 📝 Features

- Real-time KPI tracking for brand promoters
- Sales verification system
- Customer complaint management
- Feedback collection
- AI-powered performance insights (using Gemini)
- Floor/location management
- Offline support with LocalStorage fallback

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.
