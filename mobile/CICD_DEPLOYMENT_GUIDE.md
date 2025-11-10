# CI/CD & Deployment Guide - Phase 7

**Date:** November 9, 2025  
**Status:** Ready for Implementation

---

## 🚀 Phase 7.1: CI/CD Setup

### Expo EAS Build Configuration

#### 1. Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

#### 2. Initialize EAS
```bash
cd mobile
eas build:configure
```

#### 3. EAS Configuration File

**eas.json:**
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "autoIncrement": true
      },
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDE12345"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

---

### GitHub Actions Workflow

**.github/workflows/build.yml:**
```yaml
name: Build and Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd mobile
          npm ci
      
      - name: Run linter
        run: |
          cd mobile
          npm run lint
      
      - name: Run tests
        run: |
          cd mobile
          npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./mobile/coverage/lcov.info

  build-ios:
    needs: test
    runs-on: macos-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: |
          cd mobile
          npm ci
      
      - name: Build iOS
        run: |
          cd mobile
          eas build --platform ios --profile production --non-interactive

  build-android:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: |
          cd mobile
          npm ci
      
      - name: Build Android
        run: |
          cd mobile
          eas build --platform android --profile production --non-interactive
```

---

### Environment Configuration

**.env.production:**
```env
API_URL=https://api.beatmatchme.com/graphql
WS_URL=wss://api.beatmatchme.com/graphql
AWS_REGION=us-east-1
AWS_USER_POOL_ID=us-east-1_XXXXXXXXX
AWS_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
YOCO_PUBLIC_KEY=pk_live_XXXXXXXXXXXXXXXX
SENTRY_DSN=https://XXXX@sentry.io/XXXX
```

**.env.staging:**
```env
API_URL=https://staging-api.beatmatchme.com/graphql
WS_URL=wss://staging-api.beatmatchme.com/graphql
AWS_REGION=us-east-1
AWS_USER_POOL_ID=us-east-1_STAGING_XXX
AWS_USER_POOL_CLIENT_ID=STAGING_XXXXXXXXXXXXXXXXXX
YOCO_PUBLIC_KEY=pk_test_XXXXXXXXXXXXXXXX
SENTRY_DSN=https://XXXX@sentry.io/XXXX
```

---

### Version Management

**app.json:**
```json
{
  "expo": {
    "name": "BeatMatchMe",
    "slug": "beatmatchme",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#8B5CF6"
    },
    "updates": {
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/YOUR_PROJECT_ID"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.beatmatchme.app",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#8B5CF6"
      },
      "package": "com.beatmatchme.app",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

---

### OTA Updates Configuration

**Setup EAS Update:**
```bash
eas update:configure
```

**Publish Update:**
```bash
# Staging
eas update --branch staging --message "Bug fixes"

# Production
eas update --branch production --message "New features"
```

**Auto-update in App:**
```typescript
// App.tsx
import * as Updates from 'expo-updates';

useEffect(() => {
  async function checkForUpdates() {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }
  
  checkForUpdates();
}, []);
```

---

### Rollback Plan

**Rollback to Previous Version:**
```bash
# Revert to previous build
eas build:list
eas submit --id BUILD_ID

# Or rollback OTA update
eas update --branch production --message "Rollback" --republish
```

**Emergency Rollback Script:**
```bash
#!/bin/bash
# rollback.sh

echo "Rolling back to previous version..."

# Get previous build ID
PREVIOUS_BUILD=$(eas build:list --platform all --status finished --limit 2 --json | jq -r '.[1].id')

echo "Rolling back to build: $PREVIOUS_BUILD"

# Submit previous build
eas submit --id $PREVIOUS_BUILD --platform ios
eas submit --id $PREVIOUS_BUILD --platform android

echo "Rollback complete!"
```

---

## 📱 Phase 7.2: App Store Preparation

### iOS App Store

#### 1. App Store Connect Setup
- Create app in App Store Connect
- Set bundle identifier: `com.beatmatchme.app`
- Configure app information
- Set age rating
- Add privacy policy URL

#### 2. Required Screenshots

**iPhone 6.7" (1290x2796) - Required:**
- Event discovery screen
- DJ queue management
- Song request flow
- Payment screen
- Settings screen

**iPhone 6.5" (1242x2688) - Required:**
- Same as above

**iPhone 5.5" (1242x2208) - Required:**
- Same as above

**iPad Pro 12.9" (2048x2732) - Required:**
- Same as above (optimized for tablet)

#### 3. App Description

**Title (30 chars):**
```
BeatMatchMe - DJ Song Requests
```

**Subtitle (30 chars):**
```
Request songs at live events
```

**Description (4000 chars):**
```
BeatMatchMe connects you with DJs at live events, allowing you to request your favorite songs and see them played in real-time.

FOR MUSIC LOVERS:
• Discover live events near you
• Browse DJ's music library
• Request songs with dedications
• Track your request in the queue
• Secure payment with Yoco
• Real-time queue updates

FOR DJs:
• Manage song requests efficiently
• Accept or veto requests with swipe gestures
• Track earnings in real-time
• Manage your music library
• Orbital queue visualization
• Multiple theme options

FEATURES:
✓ Real-time WebSocket updates
✓ Secure payment processing
✓ Beautiful Tinder-style interface
✓ Dark mode support
✓ Multiple theme options
✓ Haptic feedback
✓ QR code event joining

Perfect for clubs, bars, weddings, and private events!

Download now and never miss your favorite song at a live event!
```

**Keywords (100 chars):**
```
dj,music,requests,events,clubs,songs,live,party,wedding,nightlife
```

#### 4. App Review Information
```
Demo Account:
Email: demo-dj@beatmatchme.com
Password: DemoPass123!

Notes:
This app requires an active event to test full functionality.
Demo account has access to test event with sample songs.
Payment uses Yoco test keys in review build.
```

---

### Android Play Store

#### 1. Play Console Setup
- Create app in Play Console
- Set package name: `com.beatmatchme.app`
- Configure app information
- Set content rating
- Add privacy policy URL

#### 2. Required Screenshots

**Phone (16:9) - 2-8 required:**
- Event discovery
- DJ queue
- Song request
- Payment
- Settings

**Tablet (16:9) - 2-8 required:**
- Same as above (tablet optimized)

#### 3. Store Listing

**Short Description (80 chars):**
```
Request songs at live events. Connect with DJs. Track your requests in real-time.
```

**Full Description (4000 chars):**
```
Same as iOS description
```

#### 4. Content Rating
- Complete questionnaire
- Select appropriate rating
- Submit for review

---

### Privacy Policy & Terms

**Privacy Policy URL:**
```
https://beatmatchme.com/privacy
```

**Terms of Service URL:**
```
https://beatmatchme.com/terms
```

**Support URL:**
```
https://beatmatchme.com/support
```

**Support Email:**
```
support@beatmatchme.com
```

---

## 🚀 Phase 7.3: Launch

### Pre-Launch Checklist

#### Technical
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Performance optimized
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Push notifications working
- [ ] Deep linking tested

#### Business
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Support channels ready
- [ ] Marketing materials prepared
- [ ] Press release written
- [ ] Social media posts scheduled

#### App Stores
- [ ] Screenshots uploaded
- [ ] Descriptions written
- [ ] Keywords optimized
- [ ] App icons uploaded
- [ ] Demo accounts created
- [ ] Review information provided

---

### Launch Day Monitoring

**Monitoring Dashboard:**
```typescript
// monitoring.ts
export const monitoring = {
  // Error rate
  errorRate: () => {
    // Track with Sentry
  },
  
  // Crash rate
  crashRate: () => {
    // Track with Crashlytics
  },
  
  // Active users
  activeUsers: () => {
    // Track with Analytics
  },
  
  // API response times
  apiPerformance: () => {
    // Track with custom metrics
  }
};
```

**Alert Thresholds:**
- Error rate > 5%: Warning
- Error rate > 10%: Critical
- Crash rate > 1%: Warning
- Crash rate > 2%: Critical
- API response > 2s: Warning
- API response > 5s: Critical

---

### Post-Launch

#### Week 1
- [ ] Monitor error rates daily
- [ ] Respond to user reviews
- [ ] Track download numbers
- [ ] Check crash reports
- [ ] Monitor API performance

#### Week 2-4
- [ ] Analyze user feedback
- [ ] Plan hot-fixes if needed
- [ ] Track retention metrics
- [ ] Monitor payment success rate
- [ ] Gather feature requests

#### Month 2+
- [ ] Plan version 1.1
- [ ] Implement user feedback
- [ ] Add requested features
- [ ] Optimize based on metrics
- [ ] Expand marketing

---

## 📊 Success Metrics

### Week 1
- Downloads: 100+
- Active users: 50+
- Crash rate: < 1%
- Error rate: < 5%
- Rating: > 4.0 stars

### Month 1
- Downloads: 1,000+
- Active users: 500+
- Paying users: 100+
- Crash rate: < 0.5%
- Rating: > 4.5 stars

### Month 3
- Downloads: 5,000+
- Active users: 2,000+
- Paying users: 500+
- Crash rate: < 0.3%
- Rating: > 4.7 stars

---

*CI/CD & Deployment Guide Version: 1.0*  
*Ready for Phase 7 Implementation*
