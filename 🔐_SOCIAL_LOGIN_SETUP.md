# 🔐 SOCIAL LOGIN - COMPLETE SETUP GUIDE

**Status:** ✅ Code Ready | ⚙️ Provider Configuration Needed

---

## 🎉 WHAT'S BEEN ADDED:

### ✅ **Supported Providers:**
1. **Google** 🔍 - Most popular
2. **Facebook** 📘 - Social login
3. **Apple** 🍎 - Required for iOS App Store
4. **Email/Password** 📧 - Traditional (already working)

---

## 📦 FILES CREATED/UPDATED:

### New Files:
1. `web/src/components/SocialLoginButtons.tsx` - Social login UI
2. `mobile/src/screens/SocialLoginScreen.js` - Mobile social login

### Updated Files:
1. `aws/cloudformation/cognito-user-pool.yaml` - Identity providers
2. `web/src/config/amplify.ts` - OAuth configuration
3. `web/src/pages/Login.tsx` - Integrated social buttons
4. `web/.env` - New OAuth variables

---

## 🚀 SETUP STEPS:

### STEP 1: Configure OAuth Providers

#### A. **Google OAuth Setup:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - **Authorized redirect URIs:**
     ```
     https://beatmatchme-dev.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
     http://localhost:5173
     ```
5. Copy **Client ID** and **Client Secret**

#### B. **Facebook OAuth Setup:**

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth Redirect URIs:
   ```
   https://beatmatchme-dev.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
   ```
5. Copy **App ID** and **App Secret**

#### C. **Apple Sign In Setup:**

1. Go to [Apple Developer](https://developer.apple.com/)
2. Create an App ID
3. Enable "Sign In with Apple"
4. Create a Service ID
5. Configure Return URLs:
   ```
   https://beatmatchme-dev.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
   ```
6. Create a private key
7. Copy **Service ID**, **Team ID**, **Key ID**, and **Private Key**

---

### STEP 2: Deploy Updated Cognito Config

#### Option A: Using CloudFormation

```bash
cd aws/cloudformation

# Edit cognito-user-pool.yaml and replace:
# - REPLACE_WITH_GOOGLE_CLIENT_ID
# - REPLACE_WITH_GOOGLE_CLIENT_SECRET
# - REPLACE_WITH_FACEBOOK_APP_ID
# - REPLACE_WITH_FACEBOOK_APP_SECRET
# - REPLACE_WITH_APPLE_SERVICE_ID
# - REPLACE_WITH_APPLE_TEAM_ID
# - REPLACE_WITH_APPLE_KEY_ID
# - REPLACE_WITH_APPLE_PRIVATE_KEY

# Deploy the stack
aws cloudformation update-stack \
  --stack-name beatmatchme-cognito \
  --template-body file://cognito-user-pool.yaml \
  --capabilities CAPABILITY_IAM

# Wait for completion
aws cloudformation wait stack-update-complete \
  --stack-name beatmatchme-cognito
```

#### Option B: Using AWS Console

1. Go to AWS Cognito Console
2. Select your User Pool
3. Go to "Sign-in experience" → "Federated identity provider sign-in"
4. Add identity providers:
   - **Google:** Enter Client ID & Secret
   - **Facebook:** Enter App ID & Secret
   - **Apple:** Enter Service ID, Team ID, Key ID, Private Key
5. Go to "App integration" → App clients
6. Edit your web client:
   - Add callback URLs
   - Add logout URLs
   - Enable OAuth flows
   - Add identity providers

---

### STEP 3: Create Cognito Domain

```bash
# Create a custom domain prefix for your Cognito User Pool
aws cognito-idp create-user-pool-domain \
  --domain beatmatchme-dev \
  --user-pool-id <YOUR_USER_POOL_ID>

# Or use AWS Console:
# Cognito → User Pool → App integration → Domain
```

---

### STEP 4: Update Environment Variables

Edit `web/.env`:

```bash
# Existing variables
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_USER_POOL_CLIENT_ID=XXXXXXXXX
VITE_IDENTITY_POOL_ID=us-east-1:XXXXX

# NEW: OAuth Configuration
VITE_COGNITO_DOMAIN=beatmatchme-dev.auth.us-east-1.amazoncognito.com
VITE_OAUTH_REDIRECT_SIGNIN=http://localhost:5173
VITE_OAUTH_REDIRECT_SIGNOUT=http://localhost:5173

# For production, use your domain:
# VITE_OAUTH_REDIRECT_SIGNIN=https://beatmatchme.com
# VITE_OAUTH_REDIRECT_SIGNOUT=https://beatmatchme.com
```

Edit `mobile/.env`:

```bash
# Add same OAuth variables
EXPO_PUBLIC_COGNITO_DOMAIN=beatmatchme-dev.auth.us-east-1.amazoncognito.com
EXPO_PUBLIC_OAUTH_REDIRECT_SIGNIN=myapp://
EXPO_PUBLIC_OAUTH_REDIRECT_SIGNOUT=myapp://
```

---

### STEP 5: Test Social Login

#### Web:
```bash
cd web
npm run dev
# Visit http://localhost:5173
# Click on Google/Facebook/Apple buttons
```

#### Mobile:
```bash
cd mobile
npm start
# Test on device/emulator
```

---

## 🎯 HOW IT WORKS:

### User Flow:
1. **User clicks "Continue with Google"**
2. **Redirected to Google login** (secure OAuth)
3. **Google authenticates user**
4. **Redirected back to app** with auth code
5. **Amplify exchanges code for tokens**
6. **User is logged in** ✅

### Security:
- ✅ No passwords stored in your app
- ✅ OAuth 2.0 standard
- ✅ Secure token exchange
- ✅ Managed by AWS Cognito
- ✅ HTTPS only in production

---

## 📱 MOBILE-SPECIFIC SETUP:

### iOS (Apple Sign In - Required):

Add to `mobile/app.json`:
```json
{
  "expo": {
    "ios": {
      "usesAppleSignIn": true,
      "bundleIdentifier": "com.beatmatchme.app"
    }
  }
}
```

### Android:

Add to `mobile/app.json`:
```json
{
  "expo": {
    "android": {
      "package": "com.beatmatchme.app",
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

---

## ✅ TESTING CHECKLIST:

### Web:
- [ ] Google login button appears
- [ ] Facebook login button appears
- [ ] Apple login button appears
- [ ] Clicking redirects to provider
- [ ] After authentication, redirects back
- [ ] User is logged in
- [ ] User profile shows correct name/email

### Mobile:
- [ ] Social login screen accessible
- [ ] All provider buttons visible
- [ ] OAuth flow works on iOS
- [ ] OAuth flow works on Android
- [ ] Deep linking configured

---

## 🔍 TROUBLESHOOTING:

### "Redirect URI mismatch"
**Fix:** Add all your redirect URIs to provider console:
- Development: `http://localhost:5173`
- Cognito: `https://[your-domain].auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
- Production: `https://beatmatchme.com`

### "Invalid client ID"
**Fix:** Double-check your Client ID in:
1. Provider console (Google/Facebook/Apple)
2. Cognito Identity Provider settings
3. Your `.env` file

### "User cancelled login"
**Normal:** User closed the OAuth popup/window

### "No hosted UI domain configured"
**Fix:** Create a Cognito domain (Step 3)

---

## 🎨 UI PREVIEW:

### Web Login Page:
```
┌─────────────────────────────────┐
│     🎵 BeatMatchMe              │
│                                  │
│  📧 Email    [................]  │
│  🔒 Password [................]  │
│                                  │
│  [      Login      ]            │
│  Forgot Password?               │
│  Don't have an account?         │
│                                  │
│  ─────── Or continue with ───── │
│                                  │
│  [  🔍 Continue with Google  ]  │
│  [  📘 Continue with Facebook ] │
│  [  🍎 Continue with Apple    ] │
└─────────────────────────────────┘
```

---

## 📊 PROVIDER COMPARISON:

| Provider | Setup Difficulty | User Trust | Mobile Support |
|----------|-----------------|------------|----------------|
| Google   | ⭐⭐ Easy       | ⭐⭐⭐⭐⭐ Very High | ✅ Excellent |
| Facebook | ⭐⭐ Easy       | ⭐⭐⭐ Good  | ✅ Excellent |
| Apple    | ⭐⭐⭐ Medium   | ⭐⭐⭐⭐ High | ✅ Required for iOS |
| Email    | ⭐ Very Easy   | ⭐⭐⭐ Good  | ✅ Universal |

---

## 🚀 RECOMMENDED SETUP ORDER:

1. **Start with Google** (easiest, most popular)
2. **Add Email/Password** (already working)
3. **Add Apple** (required for iOS)
4. **Add Facebook** (optional, good for social)

---

## 🎯 PRODUCTION CHECKLIST:

- [ ] All OAuth credentials created
- [ ] Cognito domain created
- [ ] Identity providers added to Cognito
- [ ] Callback URLs updated for production
- [ ] Environment variables set
- [ ] Tested on production domain
- [ ] Mobile deep linking configured
- [ ] Apple Sign In reviewed by Apple
- [ ] Facebook app reviewed
- [ ] Google OAuth verified

---

## 📝 QUICK START (Development):

### Minimal Setup - Google Only:

1. **Get Google OAuth credentials** (5 mins)
2. **Add to Cognito** via console (2 mins)
3. **Create Cognito domain** (1 min)
4. **Update `.env`** (1 min)
5. **Test!** ✅

Total: ~10 minutes

---

## 🎉 BENEFITS:

✅ **One-click login** - No forms to fill  
✅ **Higher conversion** - 3x more signups  
✅ **Better UX** - Users love social login  
✅ **Secure** - OAuth 2.0 standard  
✅ **Less passwords** - Fewer password resets  
✅ **Verified emails** - Providers verify emails  

---

## 📞 NEED HELP?

**Resources:**
- [AWS Cognito Social IdPs](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-social-idp.html)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login](https://developers.facebook.com/docs/facebook-login)
- [Apple Sign In](https://developer.apple.com/sign-in-with-apple/)

**Status:** 
- ✅ Code is ready
- ⚙️ Just need OAuth credentials
- 🚀 Can be live in 10 minutes!
