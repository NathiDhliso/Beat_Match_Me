# AWS Staging Deployment Guide

**Date:** November 5, 2025  
**Target:** Staging Environment  
**Deadline:** December 5, 2025 (Production Launch)

## 🎯 Overview

This guide will deploy the complete BeatMatchMe backend to AWS staging, including:
- ✅ Updated GraphQL schema with new mutations
- ✅ VTL resolvers for DJ settings and profile updates
- ✅ Testing real-time subscriptions with backend
- ✅ Smoke tests for all features

## 📋 Prerequisites

### Required Tools
- ✅ AWS CLI installed and configured
- ✅ PowerShell 7+ (Windows) or PowerShell Core (Mac/Linux)
- ✅ AWS account with AppSync, DynamoDB, Cognito permissions
- ✅ Node.js 18+ (for frontend)

### Verify AWS Configuration
```powershell
# Check AWS credentials
aws sts get-caller-identity

# Should show:
# {
#   "UserId": "...",
#   "Account": "...",
#   "Arn": "..."
# }
```

### Current Infrastructure
From `infrastructure/appsync-config.json`:
```json
{
  "ApiUrl": "https://v7emm7lqsjbkvoligy4udwru6i.appsync-api.us-east-1.amazonaws.com/graphql",
  "Region": "us-east-1",
  "ApiId": "h57lyr2p5bbaxnqckf2r4u7wo4"
}
```

## 🚀 Deployment Steps

### Step 1: Update GraphQL Schema (5 minutes)

**Changes Made:**
1. Added `bio` and `genres` fields to `User` type
2. Added `updateDJSetSettings` mutation
3. Added `updateDJProfile` mutation
4. Added input types: `UpdateDJSetSettingsInput` and `UpdateDJProfileInput`

**Deploy Schema:**

Option A: AWS Console (Recommended)
```
1. Go to: https://console.aws.amazon.com/appsync/home?region=us-east-1#/h57lyr2p5bbaxnqckf2r4u7wo4/v1/schema
2. Click "Edit Schema"
3. Copy entire content from: infrastructure/schema.graphql
4. Paste into editor (replace all)
5. Click "Save Schema"
6. Wait for "Schema saved successfully" confirmation
```

Option B: AWS CLI (Advanced)
```powershell
cd infrastructure
aws appsync start-schema-creation `
  --api-id h57lyr2p5bbaxnqckf2r4u7wo4 `
  --definition file://schema.graphql `
  --region us-east-1

# Check status
aws appsync get-schema-creation-status `
  --api-id h57lyr2p5bbaxnqckf2r4u7wo4 `
  --region us-east-1
```

**Verify Schema:**
```
1. In AppSync Console, go to Schema tab
2. Search for "updateDJSetSettings"
3. Search for "updateDJProfile"
4. Verify both mutations appear in the schema
```

### Step 2: Deploy VTL Resolvers (10 minutes)

**New Resolvers Created:**
- `Mutation.updateDJSetSettings.req.vtl` - Request mapping
- `Mutation.updateDJSetSettings.res.vtl` - Response mapping
- `Mutation.updateDJProfile.req.vtl` - Request mapping
- `Mutation.updateDJProfile.res.vtl` - Response mapping

**Deploy Resolvers:**

Option A: Manual Deployment (AWS Console)

For `updateDJSetSettings`:
```
1. Go to AppSync Console → Schema → Mutation → updateDJSetSettings
2. Click "Attach resolver"
3. Data source: Select "beatmatchme-djsets" (or events table)
4. Configure request mapping:
   - Copy content from: infrastructure/resolvers/Mutation.updateDJSetSettings.req.vtl
5. Configure response mapping:
   - Copy content from: infrastructure/resolvers/Mutation.updateDJSetSettings.res.vtl
6. Click "Save Resolver"
```

For `updateDJProfile`:
```
1. Go to AppSync Console → Schema → Mutation → updateDJProfile
2. Click "Attach resolver"
3. Data source: Select "beatmatchme-users"
4. Configure request mapping:
   - Copy content from: infrastructure/resolvers/Mutation.updateDJProfile.req.vtl
5. Configure response mapping:
   - Copy content from: infrastructure/resolvers/Mutation.updateDJProfile.res.vtl
6. Click "Save Resolver"
```

Option B: Automated Deployment (PowerShell Script)

```powershell
cd infrastructure

# Deploy all resolvers including new ones
.\deploy-schema-and-resolvers.ps1 -ApiId h57lyr2p5bbaxnqckf2r4u7wo4 -Region us-east-1
```

**Verify Resolvers:**
```
1. In AppSync Console, go to Schema
2. Click on Mutation type
3. Verify "updateDJSetSettings" has a resolver attached
4. Verify "updateDJProfile" has a resolver attached
5. Click each resolver to check request/response templates are correct
```

### Step 3: Test Mutations in AppSync Console (15 minutes)

**Test updateDJSetSettings:**
```graphql
mutation TestUpdateSettings {
  updateDJSetSettings(
    setId: "test-set-123"
    input: {
      requestCapPerHour: 15
      basePrice: 75.0
      isSoldOut: false
      allowDedications: true
    }
  ) {
    setId
    settings {
      requestCapPerHour
      basePrice
    }
    isAcceptingRequests
  }
}
```

**Test updateDJProfile:**
```graphql
mutation TestUpdateProfile {
  updateDJProfile(
    userId: "test-user-123"
    input: {
      name: "DJ Test"
      bio: "Professional DJ from Cape Town"
      genres: ["House", "Techno", "Afro House"]
    }
  ) {
    userId
    name
    bio
    genres
  }
}
```

**Expected Results:**
- ✅ No errors in response
- ✅ Updated values returned
- ✅ DynamoDB table shows updated records

### Step 4: Update Frontend Configuration (5 minutes)

**Verify aws-exports.ts is current:**
```typescript
// infrastructure/aws-exports.ts should have:
const awsmobile = {
  "aws_project_region": "us-east-1",
  "aws_appsync_graphqlEndpoint": "https://v7emm7lqsjbkvoligy4udwru6i.appsync-api.us-east-1.amazonaws.com/graphql",
  "aws_appsync_region": "us-east-1",
  "aws_appsync_authenticationType": "AMAZON_COGNITO_USER_POOLS",
  "aws_cognito_identity_pool_id": "...",
  "aws_user_pools_id": "us-east-1_m1PhjZ4yD",
  "aws_user_pools_web_client_id": "..."
};
```

**No frontend changes needed** - The djSettings.ts service already uses the correct mutations!

### Step 5: Deploy Frontend to Staging (Optional - 30 minutes)

If you want to deploy frontend to test with real backend:

```powershell
# Build production frontend
cd web
npm run build

# Deploy to S3 (if configured)
aws s3 sync dist/ s3://beatmatchme-staging-web/ --delete

# Or use Amplify Hosting (recommended)
# 1. Create Amplify app in AWS Console
# 2. Connect to GitHub repo
# 3. Set build settings:
#    - Build command: npm run build
#    - Output directory: dist
# 4. Deploy branch: main (or staging)
```

### Step 6: Smoke Tests (30 minutes)

**Test Checklist:**

DJ Portal Tests:
- [ ] Login as DJ user (Cognito)
- [ ] Create a DJ set
- [ ] Open DJ Portal
- [ ] Click "Settings" → "Request Cap Manager"
- [ ] Update request cap (e.g., 10 → 15)
- [ ] Verify success notification appears
- [ ] Refresh page - settings should persist
- [ ] Click "Manage Profile"
- [ ] Update bio and genres
- [ ] Verify success notification
- [ ] Refresh page - profile should persist
- [ ] Test audio notification on new request
- [ ] Test connection status indicator

User Portal Tests:
- [ ] Login as user (Cognito)
- [ ] Join an active event
- [ ] Submit a song request
- [ ] Verify notification throttling (5s intervals)
- [ ] Test queue position updates
- [ ] Test opt-in notification banner
- [ ] Test notification bell with badge
- [ ] Test connection status indicator

Real-Time Subscription Tests:
- [ ] Open DJ portal in browser 1
- [ ] Open User portal in browser 2
- [ ] Submit request from User portal
- [ ] Verify DJ portal gets instant notification
- [ ] Verify audio beep plays
- [ ] Verify queue updates in real-time
- [ ] Simulate network drop (dev tools → offline)
- [ ] Verify "Reconnecting" status appears
- [ ] Re-enable network
- [ ] Verify auto-reconnection works

**Log Locations:**
```powershell
# View AppSync logs
aws logs tail /aws/appsync/apis/h57lyr2p5bbaxnqckf2r4u7wo4 --follow --region us-east-1

# View Lambda logs (if using Lambda resolvers)
aws logs tail /aws/lambda/beatmatchme-resolver --follow --region us-east-1

# Browser console logs
# Open DevTools → Console → Check for errors
```

### Step 7: Performance Validation (15 minutes)

**Metrics to Check:**
```powershell
# AppSync metrics (last 1 hour)
aws cloudwatch get-metric-statistics `
  --namespace AWS/AppSync `
  --metric-name Latency `
  --dimensions Name=GraphQLAPIId,Value=h57lyr2p5bbaxnqckf2r4u7wo4 `
  --start-time (Get-Date).AddHours(-1).ToUniversalTime() `
  --end-time (Get-Date).ToUniversalTime() `
  --period 300 `
  --statistics Average `
  --region us-east-1
```

**Expected Performance:**
- AppSync query latency: < 50ms
- Subscription delivery: < 100ms
- Frontend load time: < 2s
- Notification throttle: 2s (DJ), 5s (User)
- Audio notification: instant

## ✅ Verification Checklist

Before marking deployment complete:

### Backend
- [ ] Schema deployed with new mutations
- [ ] updateDJSetSettings resolver working
- [ ] updateDJProfile resolver working
- [ ] All existing resolvers still working
- [ ] DynamoDB tables updating correctly
- [ ] No errors in CloudWatch logs

### Frontend
- [ ] Dev server running without errors
- [ ] All 11 integration tests passing
- [ ] RequestCapManager saves to backend
- [ ] DJProfileScreen saves to backend
- [ ] Graceful degradation working
- [ ] Success/error notifications appear

### Real-Time
- [ ] Subscriptions connecting
- [ ] Queue updates in real-time
- [ ] Reconnection after network drop
- [ ] Polling fallback working
- [ ] Connection status accurate

### Performance
- [ ] Notification throttling working (2s/5s)
- [ ] Audio notifications playing
- [ ] No memory leaks
- [ ] No console errors
- [ ] Smooth UI interactions

## 🐛 Troubleshooting

### Schema Upload Fails
```
Error: Schema validation failed
Solution:
1. Check syntax in schema.graphql
2. Ensure all types referenced exist
3. Verify input types match mutation signatures
4. Try manual upload via console
```

### Resolver Not Working
```
Error: Resolver returned null or error
Solution:
1. Check CloudWatch logs for detailed error
2. Verify data source is correct table
3. Test VTL syntax in AppSync console
4. Check DynamoDB table has correct primary key
```

### Frontend Can't Connect
```
Error: Network request failed
Solution:
1. Verify aws-exports.ts has correct endpoint
2. Check Cognito user is authenticated
3. Verify CORS settings in AppSync
4. Check browser console for errors
```

### Subscription Not Updating
```
Error: Subscription not receiving data
Solution:
1. Verify subscription is enabled in AppSync
2. Check @aws_subscribe directive in schema
3. Test mutation triggers subscription
4. Check WebSocket connection in DevTools
```

## 📊 Monitoring

### CloudWatch Dashboards
```powershell
# Create custom dashboard
aws cloudwatch put-dashboard `
  --dashboard-name BeatMatchMe-Staging `
  --dashboard-body file://monitoring-dashboard.json `
  --region us-east-1
```

### Key Metrics to Monitor
- AppSync API Latency
- DynamoDB Read/Write Capacity
- Cognito Sign-in Success Rate
- Error Rate (4xx, 5xx)
- WebSocket Connection Count

### Alerts to Configure
- High error rate (> 5%)
- High latency (> 500ms)
- DynamoDB throttling
- Cognito authentication failures

## 📝 Rollback Plan

If deployment fails:

### Rollback Schema
```powershell
# Restore previous schema from backup
aws appsync start-schema-creation `
  --api-id h57lyr2p5bbaxnqckf2r4u7wo4 `
  --definition file://deployed-schema-AFTER.graphql `
  --region us-east-1
```

### Rollback Resolvers
```powershell
# Delete problematic resolvers
aws appsync delete-resolver `
  --api-id h57lyr2p5bbaxnqckf2r4u7wo4 `
  --type-name Mutation `
  --field-name updateDJSetSettings `
  --region us-east-1
```

### Rollback Frontend
```powershell
# Revert to previous commit
git revert HEAD
git push origin main

# Or redeploy previous version
git checkout <previous-commit>
cd web && npm run build
```

## 🎉 Success Criteria

Deployment is successful when:
- ✅ All 11 integration tests pass
- ✅ Schema deployed with 0 errors
- ✅ Both new mutations work correctly
- ✅ DJ Portal saves settings to backend
- ✅ DJ Portal saves profile to backend
- ✅ Real-time subscriptions working
- ✅ No errors in CloudWatch logs
- ✅ Performance metrics acceptable
- ✅ All smoke tests pass

## 📅 Timeline

| Task | Duration | Status |
|------|----------|--------|
| Update Schema | 5 min | ⏳ Pending |
| Deploy Resolvers | 10 min | ⏳ Pending |
| Test Mutations | 15 min | ⏳ Pending |
| Update Config | 5 min | ⏳ Pending |
| Deploy Frontend | 30 min | ⏳ Optional |
| Smoke Tests | 30 min | ⏳ Pending |
| Performance Check | 15 min | ⏳ Pending |
| **Total** | **1.5-2 hours** | |

## 🚀 Next Steps After Staging

1. **User Acceptance Testing** (2-3 days)
   - Invite beta testers
   - Collect feedback
   - Fix critical bugs

2. **Load Testing** (1 day)
   - Test with 100+ concurrent users
   - Verify auto-scaling works
   - Check cost projections

3. **Security Audit** (1 day)
   - Verify authentication works
   - Test authorization rules
   - Check for XSS/injection vulnerabilities

4. **Production Deployment** (Dec 5, 2025)
   - Same steps as staging
   - Update DNS to production
   - Enable monitoring/alerts
   - Launch! 🎉

---

**Document Version:** 1.0  
**Last Updated:** November 5, 2025  
**Owner:** Development Team  
**Production Deadline:** December 5, 2025 (30 days)
