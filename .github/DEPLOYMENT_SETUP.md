# GitHub Actions Auto-Deployment Setup

This repository is configured to automatically deploy to Vercel on every push to the `main` branch.

## Required GitHub Secrets

To set up auto-deployment, add these secrets to your GitHub repository:

### 1. Get Vercel Token
1. Go to https://vercel.com/account/tokens
2. Create a new token with the name "GitHub Actions"
3. Copy the token value

### 2. Get Project IDs
Run these commands in your terminal (after logging into Vercel):
```bash
npx vercel link
```
This will create a `.vercel/project.json` file with your project details.

### 3. Add Secrets to GitHub
Go to your GitHub repo → Settings → Secrets and variables → Actions

Add these repository secrets:

- **VERCEL_TOKEN**: Your Vercel token from step 1
- **ORG_ID**: Your Vercel organization ID (from .vercel/project.json)
- **PROJECT_ID**: Your Vercel project ID (from .vercel/project.json)

## How It Works

- **Push to main**: Automatically deploys to production
- **Pull requests**: Creates preview deployments
- **Manual trigger**: You can manually run the workflow from GitHub Actions tab

## Workflow Features

✅ Deploys pre-built files from `/dist` directory
✅ Uses existing `vercel.json` configuration
✅ Skips npm install (uses pre-built assets)
✅ Automatic production deployments
✅ Preview deployments for PRs

## Troubleshooting

If deployment fails:
1. Check GitHub Actions logs for error details
2. Verify all secrets are correctly set
3. Ensure `.vercel/project.json` exists and has correct IDs
4. Test local deployment with `npx vercel --prod`

## Files Structure

```
.github/
  workflows/
    deploy.yml          # GitHub Actions workflow
dist/                   # Pre-built app files
  index.html           # Main app
  app.js              # Application logic
  js/
    airwallex-api.js   # Airwallex integration
vercel.json            # Vercel configuration
```