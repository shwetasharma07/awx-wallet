# Quick Manual Deployment Guide

If GitHub Actions isn't working yet, here are alternative deployment methods:

## Option 1: Vercel Web Interface
1. Go to https://vercel.com/new
2. Import from GitHub: `shwetasharma07/awx-wallet`
3. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `echo 'Using pre-built files'`
   - **Output Directory**: `dist`
   - **Install Command**: `echo 'Skip install'`
4. Click **Deploy**

## Option 2: Drag & Drop Deployment
1. Go to https://vercel.com/new
2. Select **"Browse"** and upload the `dist/` folder
3. Click **Deploy**

## Option 3: Fix GitHub Actions
Add these secrets to GitHub repo settings:
- `VERCEL_TOKEN`: Your Vercel API token
- `PROJECT_ID`: Your Vercel project ID
- `ORG_ID`: Your Vercel team/user ID

## Current App Structure
```
dist/
├── index.html         # Main app
├── app.js            # Application logic
└── js/
    └── airwallex-api.js  # API wrapper
```

All methods will deploy your complete Airwallex-integrated wallet app!