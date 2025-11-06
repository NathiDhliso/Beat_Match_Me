# BeatMatchMe Deployment Checklist

## 🚀 Pre-Deployment Verification

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] No console errors in browser
- [ ] ESLint warnings addressed
- [ ] Code formatted with Prettier
- [ ] No unused imports or variables

### Performance
- [ ] Lighthouse Performance score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Bundle size optimized (< 1MB initial)

### Functionality
- [ ] DJ Portal: Create event, upload tracklist, manage requests
- [ ] User Portal: Browse events, submit requests, make payments
- [ ] Theme system: All 3 themes working
- [ ] Mobile navigation: Bottom tab bar functional
- [ ] Offline mode: Queue and cache working
- [ ] Virtual scrolling: Smooth on 1000+ item lists
- [ ] Lazy loading: Images and modals load correctly

### Security
- [ ] API endpoints secured with authentication
- [ ] GraphQL queries use proper authorization
- [ ] No sensitive data in client-side code
- [ ] CORS configured correctly
- [ ] CSP headers implemented
- [ ] XSS protection enabled

### Accessibility
- [ ] Keyboard navigation works throughout
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Touch targets minimum 44x44px
- [ ] `prefers-reduced-motion` respected
- [ ] Alt text on all images

---

## 📦 Build Process

### 1. Clean Build
```bash
# Remove old builds
rm -rf build dist node_modules/.cache

# Fresh install
npm ci

# Build for production
npm run build
```

### 2. Environment Variables

Create `.env.production`:
```env
REACT_APP_ENV=production
REACT_APP_API_URL=https://api.beatmatchme.com
REACT_APP_GRAPHQL_URL=https://api.beatmatchme.com/graphql
REACT_APP_YOCO_PUBLIC_KEY=pk_live_...
REACT_APP_AWS_REGION=us-east-1
REACT_APP_AWS_USER_POOL_ID=...
REACT_APP_AWS_APP_CLIENT_ID=...
```

Verify:
- [ ] All environment variables set
- [ ] API URLs point to production
- [ ] Yoco uses live keys (not test)
- [ ] AWS Cognito production pool

### 3. Build Verification
```bash
# Analyze bundle
npm run build -- --stats
npx webpack-bundle-analyzer build/bundle-stats.json

# Serve locally and test
npx serve -s build
# Open http://localhost:3000
```

Checklist:
- [ ] Build completes without errors
- [ ] Bundle size acceptable (< 1MB gzipped)
- [ ] No missing dependencies
- [ ] Source maps generated
- [ ] Assets properly hashed

---

## 🌐 AWS Amplify Deployment

### 1. Amplify Configuration

**amplify.yml:**
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

Verify:
- [ ] Build command correct
- [ ] Build directory matches
- [ ] Cache configured

### 2. Deploy to Amplify
```bash
# Initialize (first time only)
amplify init

# Deploy backend
amplify push

# Publish frontend
amplify publish
```

Checklist:
- [ ] Backend deployed (AppSync, Cognito, DynamoDB)
- [ ] Frontend deployed to CloudFront
- [ ] Custom domain configured
- [ ] HTTPS certificate active
- [ ] Redirects working (SPA routing)

### 3. CloudFront Settings
- [ ] Cache policy: CachingOptimized
- [ ] Origin request policy: AllViewer
- [ ] Viewer protocol policy: Redirect HTTP to HTTPS
- [ ] Compress objects: Yes
- [ ] HTTP/2: Enabled
- [ ] HTTP/3: Enabled (if available)

---

## 🔧 Backend Verification

### GraphQL API (AppSync)
```bash
# Test query
curl -X POST https://your-api.appsync-api.region.amazonaws.com/graphql \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: YOUR_API_KEY' \
  -d '{"query":"{ listEvents { items { id venueName } } }"}'
```

Checklist:
- [ ] API endpoint accessible
- [ ] Authentication working
- [ ] Resolvers functioning
- [ ] Real-time subscriptions active
- [ ] Rate limiting configured

### DynamoDB Tables
- [ ] Events table: Provisioned or On-Demand
- [ ] Requests table: GSI indexes created
- [ ] Tracks table: Exists and accessible
- [ ] Backup enabled
- [ ] Point-in-time recovery enabled

### Cognito User Pool
- [ ] User pool created
- [ ] App client configured
- [ ] Custom attributes set
- [ ] Password policy enforced
- [ ] MFA optional/required
- [ ] Email verification working

### Yoco Payment Integration
- [ ] Live API keys configured
- [ ] Webhooks registered
- [ ] Test payment successful
- [ ] Refund flow tested
- [ ] Error handling verified

---

## 🔍 Post-Deployment Testing

### Smoke Tests (Production)

#### DJ Portal
```
1. Login as DJ (PERFORMER role)
   ✓ Redirects to /dj-portal
   
2. Create Event
   ✓ Form validation works
   ✓ Event created in DynamoDB
   ✓ QR code generated
   
3. Upload Tracklist
   ✓ CSV import works
   ✓ Tracks saved to database
   ✓ Virtual scrolling smooth
   
4. Manage Requests
   ✓ Real-time updates
   ✓ Accept/Veto working
   ✓ Mark playing functional
```

#### User Portal
```
1. Login as User (AUDIENCE role)
   ✓ Redirects to /user-portal
   
2. Browse Events
   ✓ Events load from API
   ✓ Images lazy load
   ✓ Join event works
   
3. Submit Request
   ✓ Song selection works
   ✓ Payment flow completes
   ✓ Request appears in queue
   
4. Offline Mode
   ✓ Requests queue when offline
   ✓ Syncs when back online
```

### Performance Testing

#### Lighthouse Audit
```bash
# Run on production URL
lighthouse https://beatmatchme.com --view
```

Targets:
- [ ] Performance: 90+
- [ ] Accessibility: 95+
- [ ] Best Practices: 95+
- [ ] SEO: 90+

#### Load Testing
```bash
# Use Artillery or k6
artillery quick --count 100 --num 10 https://beatmatchme.com
```

Verify:
- [ ] 100 concurrent users: < 200ms response
- [ ] 1000 concurrent users: < 500ms response
- [ ] No 5xx errors
- [ ] Graceful degradation

### Mobile Testing
- [ ] iOS Safari: All features work
- [ ] Android Chrome: All features work
- [ ] Swipe gestures functional
- [ ] Bottom navigation visible
- [ ] Touch targets easy to tap
- [ ] No layout shifts

---

## 📊 Monitoring Setup

### AWS CloudWatch
```bash
# Enable logging
aws logs create-log-group --log-group-name /aws/lambda/beatmatchme
aws logs put-retention-policy --log-group-name /aws/lambda/beatmatchme --retention-in-days 30
```

Dashboards:
- [ ] API latency metrics
- [ ] Error rate monitoring
- [ ] Database throughput
- [ ] Lambda invocations
- [ ] CloudFront cache hit ratio

### Alarms
- [ ] API 4xx errors > 100/min
- [ ] API 5xx errors > 10/min
- [ ] DynamoDB throttles > 0
- [ ] Lambda errors > 5/min
- [ ] CloudFront 5xx > 1%

### Error Tracking (Sentry)
```bash
npm install --save @sentry/react @sentry/tracing
```

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.REACT_APP_ENV,
  tracesSampleRate: 0.1,
});
```

Configure:
- [ ] Sentry project created
- [ ] Source maps uploaded
- [ ] Performance monitoring enabled
- [ ] User feedback widget added

---

## 🔐 Security Hardening

### Headers
Add to CloudFront or load balancer:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://js.yoco.com; style-src 'self' 'unsafe-inline'
```

Verify:
- [ ] All security headers present
- [ ] CSP policy tested
- [ ] HSTS enabled
- [ ] No mixed content warnings

### Secrets Management
- [ ] API keys in AWS Secrets Manager
- [ ] No secrets in environment variables
- [ ] Secrets rotated regularly
- [ ] IAM roles with least privilege

---

## 📝 Documentation Updates

- [ ] API documentation current
- [ ] User guide published
- [ ] DJ onboarding guide updated
- [ ] Troubleshooting FAQ created
- [ ] Release notes prepared

---

## 🎯 Go-Live Process

### 1. Pre-Launch (T-1 day)
- [ ] Final smoke tests pass
- [ ] Monitoring dashboards ready
- [ ] Support team briefed
- [ ] Rollback plan documented

### 2. Launch (T-0)
```bash
# 1. Deploy backend
amplify push --yes

# 2. Deploy frontend
amplify publish --yes

# 3. Verify deployment
curl -I https://beatmatchme.com
```

- [ ] Deployment successful
- [ ] DNS propagated
- [ ] SSL certificate valid
- [ ] Health check passing

### 3. Post-Launch (T+1 hour)
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Verify payments processing

### 4. Post-Launch (T+24 hours)
- [ ] Review CloudWatch logs
- [ ] Check Sentry errors
- [ ] Analyze Lighthouse scores
- [ ] Gather user feedback

---

## 🔄 Rollback Plan

### If Critical Issues Found

#### Option 1: Revert Deployment
```bash
# In Amplify Console
1. Go to App Settings > Build settings
2. Find previous successful build
3. Click "Redeploy this version"
```

#### Option 2: Emergency Hotfix
```bash
# Create hotfix branch
git checkout -b hotfix/critical-fix

# Make minimal fix
# ... code changes ...

# Deploy immediately
git push origin hotfix/critical-fix
# Amplify auto-deploys
```

---

## ✅ Final Verification

Before marking deployment complete:
- [ ] All critical paths tested in production
- [ ] No errors in CloudWatch logs
- [ ] Performance targets met
- [ ] Security scan passed
- [ ] Team notified of successful deployment
- [ ] Status page updated
- [ ] Documentation published

---

## 📞 Support Contacts

- **DevOps Lead:** [Name] - [Email]
- **Backend Team:** [Email]
- **Frontend Team:** [Email]
- **AWS Support:** [Case Number]
- **Yoco Support:** [Email]

---

**Deployment Date:** ___________  
**Deployed By:** ___________  
**Build Number:** ___________  
**Release Version:** v1.0.0

---

**Last Updated:** November 6, 2025  
**Maintained by:** BeatMatchMe Development Team
