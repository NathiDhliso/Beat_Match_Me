# 🔍 GOOGLE OAUTH SETUP - STEP BY STEP

**Time Required:** ~10 minutes  
**Difficulty:** Easy ⭐⭐

---

## 📋 WHAT YOU'LL GET:
- Google Client ID
- Google Client Secret
- Working "Continue with Google" button

---

## 🚀 STEP-BY-STEP GUIDE:

### STEP 1: Go to Google Cloud Console (2 mins)

1. **Open:** [Google Cloud Console](https://console.cloud.google.com/)
2. **Sign in** with your Google account
3. **Create a new project:**
   - Click the project dropdown (top left)
   - Click "NEW PROJECT"
   - **Project name:** `BeatMatchMe`
   - Click "CREATE"
   - Wait for project to be created (~30 seconds)
   - Select the new project

---

### STEP 2: Enable Google+ API (1 min)

1. **In the left menu:** Click "APIs & Services" → "Library"
2. **Search for:** `Google+ API`
3. **Click** on "Google+ API"
4. **Click** "ENABLE"
5. Wait for it to enable (~10 seconds)

---

### STEP 3: Configure OAuth Consent Screen (3 mins)

1. **Left menu:** "APIs & Services" → "OAuth consent screen"
2. **User Type:** Select "External"
3. **Click** "CREATE"

**Fill out the form:**

**App Information:**
- **App name:** `BeatMatchMe`
- **User support email:** Your email
- **App logo:** (Optional - can skip for now)

**App Domain:**
- **Application home page:** `http://localhost:5173` (for now)
- **Authorized domains:** Leave blank (for now)

**Developer contact:**
- **Email addresses:** Your email

4. **Click** "SAVE AND CONTINUE"

**Scopes:**
5. **Click** "ADD OR REMOVE SCOPES"
6. **Select these scopes:**
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
7. **Click** "UPDATE"
8. **Click** "SAVE AND CONTINUE"

**Test users:**
9. **Click** "ADD USERS"
10. **Add your email** (for testing)
11. **Click** "ADD"
12. **Click** "SAVE AND CONTINUE"
13. **Click** "BACK TO DASHBOARD"

---

### STEP 4: Create OAuth Credentials (2 mins)

1. **Left menu:** "APIs & Services" → "Credentials"
2. **Click** "CREATE CREDENTIALS" → "OAuth client ID"
3. **Application type:** Select "Web application"
4. **Name:** `BeatMatchMe Web Client`

**Authorized JavaScript origins:**
5. **Click** "ADD URI"
6. **Add:** `http://localhost:5173`
7. **Click** "ADD URI" again
8. **Add:** `https://beatmatchme.com` (for production later)

**Authorized redirect URIs:**
9. **Click** "ADD URI"
10. **Add:** `http://localhost:5173`
11. **Click** "ADD URI" again
12. **Add:** `https://YOUR-COGNITO-DOMAIN.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
    
    Example: `https://beatmatchme-dev.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
    
    ⚠️ **IMPORTANT:** You need to create your Cognito domain first (see Step 5)

13. **Click** "CREATE"

---

### STEP 5: Save Your Credentials ✅

A popup will show:
- **Your Client ID:** `123456789-xxxxx.apps.googleusercontent.com`
- **Your Client Secret:** `GOCSPX-xxxxxxxxxxxxx`

**COPY BOTH OF THESE!** You'll need them next.

📋 **Save them somewhere safe (like a password manager)**

---

### STEP 6: Create Cognito Domain (2 mins)

**Option A: Using AWS CLI:**
```bash
# Replace with your actual User Pool ID
aws cognito-idp create-user-pool-domain \
  --domain beatmatchme-dev \
  --user-pool-id us-east-1_XXXXXXXXX
```

**Option B: Using AWS Console:**
1. Go to [AWS Cognito Console](https://console.aws.amazon.com/cognito/)
2. Click your User Pool
3. Click "App integration" tab
4. Scroll to "Domain"
5. Click "Actions" → "Create Cognito domain"
6. **Domain prefix:** `beatmatchme-dev` (or your choice)
7. Click "Create Cognito domain"
8. **Copy the full domain:** `beatmatchme-dev.auth.us-east-1.amazoncognito.com`

---

### STEP 7: Add Google as Identity Provider in Cognito (3 mins)

**Option A: Using AWS Console:**
1. In your Cognito User Pool
2. Click "Sign-in experience" tab
3. Scroll to "Federated identity provider sign-in"
4. Click "Add identity provider"
5. Select "Google"
6. **Client ID:** Paste your Google Client ID
7. **Client secret:** Paste your Google Client Secret
8. **Authorized scopes:** `profile email openid`
9. **Map attributes:**
   - `email` → `email`
   - `name` → `name`
   - `picture` → `picture` (optional)
10. Click "Add identity provider"

**Option B: Using CloudFormation:**
```bash
# Edit cognito-user-pool.yaml
# Replace REPLACE_WITH_GOOGLE_CLIENT_ID with your Client ID
# Replace REPLACE_WITH_GOOGLE_CLIENT_SECRET with your Client Secret

# Then update stack:
aws cloudformation update-stack \
  --stack-name beatmatchme-cognito \
  --template-body file://cognito-user-pool.yaml \
  --capabilities CAPABILITY_IAM
```

---

### STEP 8: Update App Client Settings (2 mins)

1. In Cognito, go to "App integration" tab
2. Click on your app client
3. Click "Edit"
4. **Callback URLs:** Add these:
   - `http://localhost:5173`
   - `https://beatmatchme.com`
5. **Sign out URLs:** Add these:
   - `http://localhost:5173`
   - `https://beatmatchme.com`
6. **Identity providers:** Check "Google"
7. **OAuth 2.0 grant types:** Check "Authorization code grant"
8. **OpenID Connect scopes:** Check all:
   - `openid`
   - `email`
   - `profile`
9. Click "Save changes"

---

### STEP 9: Update Your .env File (1 min)

Edit `web/.env`:

```bash
# Your existing config
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_USER_POOL_CLIENT_ID=XXXXXXXXX
VITE_IDENTITY_POOL_ID=us-east-1:XXXXXX

# Add these NEW lines:
VITE_COGNITO_DOMAIN=beatmatchme-dev.auth.us-east-1.amazoncognito.com
VITE_OAUTH_REDIRECT_SIGNIN=http://localhost:5173
VITE_OAUTH_REDIRECT_SIGNOUT=http://localhost:5173
```

**⚠️ IMPORTANT:** Replace `beatmatchme-dev` with YOUR domain prefix from Step 6

---

### STEP 10: Test It! (1 min)

```bash
cd web
npm run dev
```

1. **Open:** http://localhost:5173
2. **You should see:** Google login button
3. **Click:** "Continue with Google"
4. **What happens:**
   - Redirects to Google login
   - You login with Google
   - Redirects back to your app
   - You're logged in! ✅

---

## ✅ TROUBLESHOOTING:

### "Redirect URI mismatch"
**Problem:** Google doesn't recognize the redirect URL  
**Fix:** Go back to Step 4, make sure you added:
- `https://beatmatchme-dev.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
- Replace `beatmatchme-dev` with YOUR Cognito domain

### "Invalid client"
**Problem:** Wrong Client ID or Secret  
**Fix:** Double-check you copied both correctly

### "No hosted UI domain"
**Problem:** Cognito domain not created  
**Fix:** Complete Step 6

### Button doesn't appear
**Problem:** Missing environment variables  
**Fix:** Check Step 9, restart dev server

---

## 🎯 WHAT YOU NOW HAVE:

✅ Google OAuth credentials  
✅ Cognito domain created  
✅ Google identity provider configured  
✅ Environment variables set  
✅ Working "Continue with Google" button  

---

## 📸 VISUAL GUIDE:

### Google Cloud Console:
```
Google Cloud Console
├── Create Project "BeatMatchMe"
├── Enable Google+ API
├── OAuth Consent Screen
│   ├── App name: BeatMatchMe
│   ├── Scopes: email, profile, openid
│   └── Test users: your.email@gmail.com
└── Credentials
    └── OAuth 2.0 Client
        ├── Type: Web application
        ├── Authorized origins: localhost:5173
        └── Redirect URIs: Cognito + localhost
```

### AWS Cognito:
```
Cognito User Pool
├── App integration
│   └── Domain: beatmatchme-dev
└── Sign-in experience
    └── Identity providers
        └── Google (with your Client ID/Secret)
```

---

## 🚀 NEXT STEPS:

**Now that Google works, you can:**
1. ✅ Test thoroughly with different Google accounts
2. 📱 Add Facebook (similar process)
3. 🍎 Add Apple (required for iOS)
4. 🌐 Deploy to production with real domain
5. 📊 Monitor usage in Google Cloud Console

---

## 🎉 SUCCESS!

Users can now login with Google in **ONE CLICK**! 

No more:
- ❌ Filling out forms
- ❌ Creating passwords
- ❌ Email verification
- ❌ Password resets

Just:
- ✅ Click "Continue with Google"
- ✅ Done!

---

## 📝 SUMMARY CHECKLIST:

- [ ] Created Google Cloud project
- [ ] Enabled Google+ API
- [ ] Configured OAuth consent screen
- [ ] Created OAuth credentials
- [ ] Saved Client ID & Secret
- [ ] Created Cognito domain
- [ ] Added Google to Cognito
- [ ] Updated app client settings
- [ ] Updated .env file
- [ ] Tested Google login
- [ ] ✅ IT WORKS!

**Time spent:** ~10 minutes  
**Result:** Professional social login ✨
