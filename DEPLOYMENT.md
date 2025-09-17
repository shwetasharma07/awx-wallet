# Digital Wallet - Deployment Guide

## Prerequisites
- Node.js and npm installed
- Expo account (free at expo.dev)
- For iOS: Apple Developer Account ($99/year)
- For Android: Google Play Developer Account ($25 one-time)

## Deployment Options

### Option 1: Deploy as Web App (Free & Fastest)

1. Build for web:
```bash
npm run build:web
```

2. Deploy to Vercel (recommended):
```bash
npx vercel
```

3. Or deploy to Netlify:
```bash
# Install Netlify CLI
npm install -g netlify-cli
# Deploy
netlify deploy --prod --dir=dist
```

### Option 2: Build APK for Android (Testing)

1. Login to EAS:
```bash
eas login
```

2. Configure your project:
```bash
eas build:configure
```

3. Build APK for testing:
```bash
npm run build:android
```

4. Download the APK from the link provided after build completes

### Option 3: Build for iOS (Requires Apple Developer Account)

1. Login to EAS:
```bash
eas login
```

2. Build for iOS:
```bash
npm run build:ios
```

3. Download the .ipa file or use TestFlight for testing

### Option 4: Production Deployment

1. Update version in app.json

2. Build for production:
```bash
npm run build:production
```

3. Submit to stores:
```bash
eas submit --platform android
eas submit --platform ios
```

## Local Testing

### Android
```bash
npm run android
```

### iOS (Mac only)
```bash
npm run ios
```

### Web
```bash
npm run web
```

## Environment Variables

Create a `.env` file for production:
```
API_URL=https://your-api-url.com
```

## Important Notes

1. **Bundle Identifiers**: Update the bundle identifiers in app.json:
   - iOS: `com.yourcompany.digitalwallet`
   - Android: `com.yourcompany.digitalwallet`

2. **Icons & Splash Screens**: The app uses default Expo icons. Replace these in the `/assets` folder for production.

3. **API Keys**: The current implementation uses mock data. Replace with real API endpoints before production deployment.

4. **Authentication**: Currently using local storage for demo. Implement proper backend authentication for production.

## Quick Deploy to Web

For the fastest deployment:

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Build and deploy:
```bash
expo export --platform web
vercel --prod
```

The app will be live at the URL provided by Vercel!

## Troubleshooting

- If build fails, try clearing cache: `expo start -c`
- For EAS build issues: `eas build --clear-cache`
- Check logs: `eas build:list`

## Support

For issues with deployment, check:
- Expo Documentation: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction