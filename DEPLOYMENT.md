# 🚀 Deployment Guide

## Quick Deploy (Recommended)

### Option 1: Deploy to Vercel + Render (Free)

#### Frontend (Vercel)
1. Go to https://vercel.com
2. Click "Import Project"
3. Connect your GitHub account
4. Select `tonicsouls/hrm-lms01`
5. Vercel will auto-detect settings from `vercel.json`
6. Click "Deploy"
7. Your frontend will be live at: `https://hrm-lms01.vercel.app`

#### Backend (Render)
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select `tonicsouls/hrm-lms01`
5. Configure:
   - **Name**: hrm-lms-backend
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     ```
     PORT=3000
     NODE_ENV=production
     JWT_SECRET=your-super-secret-key-change-this
     JWT_EXPIRES_IN=7d
     DATABASE_PATH=./src/database/lms.db
     CORS_ORIGIN=https://hrm-lms01.vercel.app
     ```
6. Click "Create Web Service"
7. Your backend will be live at: `https://hrm-lms-backend.onrender.com`

#### Connect Frontend to Backend
1. In Vercel, go to your project settings
2. Add Environment Variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://hrm-lms-backend.onrender.com`
3. Redeploy the frontend

---

### Option 2: GitHub Pages (Frontend Only - Static Demo)

**Note**: This only works for the frontend. Backend needs a separate service.

1. Go to your repository: https://github.com/tonicsouls/hrm-lms01
2. Click "Settings" → "Pages"
3. Source: Deploy from a branch
4. Branch: `main` → `/frontend/dist`
5. Click "Save"
6. Your site will be at: `https://tonicsouls.github.io/hrm-lms01`

**Limitation**: Without a backend, authentication and data won't work.

---

### Option 3: One-Click Deploy (Easiest)

I can set this up for you if you have accounts on:
- Vercel (for frontend)
- Render (for backend)

Just give me authorization and I'll deploy it automatically!

---

## What You'll Get

Once deployed, your team can access:
- **Live URL**: `https://hrm-lms01.vercel.app` (or your custom domain)
- **No installation needed** - just open the browser
- **All features working** - login, modules, quizzes, progress tracking
- **Demo accounts ready** - student@example.com / password123

---

## Cost

- **Vercel**: FREE (hobby tier)
- **Render**: FREE (with limitations: sleeps after 15 min inactivity)
- **Upgrade**: ~$7/month for Render to keep backend always active

---

## Current Status

✅ Code is on GitHub: https://github.com/tonicsouls/hrm-lms01
❌ Not yet deployed to a live URL
⏳ Waiting for deployment setup

---

## Need Help?

I can walk you through the deployment or do it for you if you provide access!
