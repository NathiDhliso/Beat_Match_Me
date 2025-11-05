# 🚀 Quick Deployment Checklist

**Goal:** Deploy backend mutations to AWS AppSync staging  
**Time:** 30 minutes  
**Deadline:** Production launch December 5, 2025

## Pre-Deployment ✅

- [x] All integration tests passing (11/11)
- [x] GraphQL schema updated with new mutations
- [x] VTL resolvers created for both mutations
- [x] Frontend code ready (djSettings.ts service)
- [x] Dev server running without errors

## Deployment Steps

### 1. Deploy Schema (5 min)
```
□ Open AWS AppSync Console
□ Navigate to: https://console.aws.amazon.com/appsync/home?region=us-east-1#/h57lyr2p5bbaxnqckf2r4u7wo4/v1/schema
□ Click "Edit Schema"
□ Copy content from: infrastructure/schema.graphql
□ Paste and replace all
□ Click "Save Schema"
□ Wait for "Schema saved successfully"
```

### 2. Deploy updateDJSetSettings Resolver (5 min)
```
□ In AppSync Console → Schema → Mutation → updateDJSetSettings
□ Click "Attach resolver"
□ Data source: Select "beatmatchme-djsets" (or events table)
□ Request mapping: Copy from infrastructure/resolvers/Mutation.updateDJSetSettings.req.vtl
□ Response mapping: Copy from infrastructure/resolvers/Mutation.updateDJSetSettings.res.vtl
□ Click "Save Resolver"
```

### 3. Deploy updateDJProfile Resolver (5 min)
```
□ In AppSync Console → Schema → Mutation → updateDJProfile
□ Click "Attach resolver"  
□ Data source: Select "beatmatchme-users"
□ Request mapping: Copy from infrastructure/resolvers/Mutation.updateDJProfile.req.vtl
□ Response mapping: Copy from infrastructure/resolvers/Mutation.updateDJProfile.res.vtl
□ Click "Save Resolver"
```

### 4. Test Mutations (10 min)
```graphql
# Test in AppSync Console → Queries

# Test 1: Update DJ Set Settings
mutation TestSettings {
  updateDJSetSettings(
    setId: "your-set-id"
    input: {
      requestCapPerHour: 15
      basePrice: 75.0
      isSoldOut: false
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

# Test 2: Update DJ Profile
mutation TestProfile {
  updateDJProfile(
    userId: "your-user-id"
    input: {
      name: "DJ Test"
      bio: "Test bio"
      genres: ["House", "Techno"]
    }
  ) {
    userId
    name
    bio
    genres
  }
}
```

### 5. Frontend Smoke Test (5 min)
```
□ Open http://localhost:5174
□ Login as DJ
□ Open Settings → Request Cap Manager
□ Change request cap
□ Verify success notification
□ Open Manage Profile
□ Update bio and genres
□ Verify success notification
□ Check browser console - no errors
```

## Success Criteria ✅

- [ ] Schema shows both new mutations
- [ ] Both resolvers attached and working
- [ ] Test mutations return data (no errors)
- [ ] Frontend saves settings successfully
- [ ] Frontend saves profile successfully
- [ ] No errors in browser console
- [ ] No errors in CloudWatch logs

## If Something Goes Wrong 🐛

**Schema won't save:**
- Check for syntax errors in schema.graphql
- Verify all types are defined
- Try manual copy-paste in console

**Resolver errors:**
- Check CloudWatch logs for details
- Verify data source table name is correct
- Test VTL syntax in AppSync playground

**Frontend can't connect:**
- Verify aws-exports.ts has correct endpoint
- Check user is authenticated (Cognito)
- Look for CORS errors in console

## AWS Console Links

- **AppSync API:** https://console.aws.amazon.com/appsync/home?region=us-east-1#/h57lyr2p5bbaxnqckf2r4u7wo4
- **Schema Editor:** https://console.aws.amazon.com/appsync/home?region=us-east-1#/h57lyr2p5bbaxnqckf2r4u7wo4/v1/schema
- **Query Editor:** https://console.aws.amazon.com/appsync/home?region=us-east-1#/h57lyr2p5bbaxnqckf2r4u7wo4/v1/queries
- **CloudWatch Logs:** https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups

## Configuration

**API ID:** h57lyr2p5bbaxnqckf2r4u7wo4  
**Region:** us-east-1  
**Endpoint:** https://v7emm7lqsjbkvoligy4udwru6i.appsync-api.us-east-1.amazonaws.com/graphql

## After Deployment

- [ ] Update STAGING_DEPLOYMENT_GUIDE.md with results
- [ ] Document any issues encountered
- [ ] Plan production deployment for Dec 5
- [ ] Celebrate! 🎉

---

**Estimated Time:** 30 minutes  
**Difficulty:** Easy  
**Risk:** Low (can rollback easily)
