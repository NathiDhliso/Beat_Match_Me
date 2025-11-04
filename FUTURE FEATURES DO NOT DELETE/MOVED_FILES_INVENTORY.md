# MOVED FILES SUMMARY

## ✅ Complete Inventory of Moved Files

This document provides a comprehensive list of ALL code files that have been moved to the "FUTURE FEATURES DO NOT DELETE" folder.

**Total Files Moved:** 17 items (5 Lambda folders, 5 React components, 6 documentation files, 1 README)

---

## 📂 Lambda Functions (Backend - Node.js)

### 1. `createGroupRequest/`
- **Path:** `aws/lambda/createGroupRequest/` → `FUTURE FEATURES DO NOT DELETE/createGroupRequest/`
- **Purpose:** Create new group-funded song requests
- **Status:** ✅ Complete implementation
- **Dependencies:** DynamoDB (group-requests table), Yoco payments
- **Related Feature:** Feature 19 - Group Request Pooling

### 2. `contributeToGroupRequest/`
- **Path:** `aws/lambda/contributeToGroupRequest/` → `FUTURE FEATURES DO NOT DELETE/contributeToGroupRequest/`
- **Purpose:** Add contributions to existing group requests
- **Status:** ✅ Complete implementation
- **Dependencies:** DynamoDB, payment processing, notifications
- **Related Feature:** Feature 19 - Group Request Pooling

### 3. `upvoteRequest/`
- **Path:** `aws/lambda/upvoteRequest/` → `FUTURE FEATURES DO NOT DELETE/upvoteRequest/`
- **Purpose:** Allow users to upvote/downvote requests in queue
- **Status:** ✅ Complete implementation
- **Dependencies:** DynamoDB (requests table, upvotes table)
- **Related Feature:** Feature 17 - Upvote Existing Requests

### 4. `updateTier/`
- **Path:** `aws/lambda/updateTier/` → `FUTURE FEATURES DO NOT DELETE/updateTier/`
- **Purpose:** Handle user subscription tier upgrades/downgrades
- **Status:** ✅ Complete implementation
- **Dependencies:** Cognito user management, DynamoDB users table, Yoco subscriptions
- **Related Feature:** Feature 20 - Tier Upgrade

### 5. `checkAchievements/`
- **Path:** `aws/lambda/checkAchievements/` → `FUTURE FEATURES DO NOT DELETE/checkAchievements/`
- **Purpose:** Track and unlock DJ achievements based on performance
- **Status:** ✅ Complete implementation
- **Dependencies:** DynamoDB (achievements table), SNS notifications
- **Related Feature:** Feature 13 - View Analytics and Revenue

---

## ⚛️ React Components (Frontend - TypeScript)

### 6. `Analytics.tsx`
- **Path:** `web/src/components/Analytics.tsx` → `FUTURE FEATURES DO NOT DELETE/Analytics.tsx`
- **Purpose:** DJ revenue dashboard with charts and export functionality
- **Size:** 15,106 bytes
- **Components:** RevenueCard, AnalyticsChart, ExportButton
- **Dependencies:** recharts, date-fns
- **Related Feature:** Feature 13 - View Analytics and Revenue

### 7. `DiscoveryWorkflow.tsx`
- **Path:** `web/src/components/DiscoveryWorkflow.tsx` → `FUTURE FEATURES DO NOT DELETE/DiscoveryWorkflow.tsx`
- **Purpose:** QR code generation, GPS discovery, event searching
- **Size:** 14,876 bytes
- **Components:** QRCodeGenerator, GeolocationDiscovery, QRCodeScanner
- **Dependencies:** qrcode library, geolocation API
- **Related Feature:** Feature 1 - Discover and Join an Event

### 8. `DJDiscovery.tsx`
- **Path:** `web/src/components/DJDiscovery.tsx` → `FUTURE FEATURES DO NOT DELETE/DJDiscovery.tsx`
- **Purpose:** DJ-specific event discovery and management interface
- **Size:** 9,378 bytes
- **Related Feature:** Feature 1 - Discover and Join an Event

### 9. `SpotlightSlots.tsx`
- **Path:** `web/src/components/SpotlightSlots.tsx` → `FUTURE FEATURES DO NOT DELETE/SpotlightSlots.tsx`
- **Purpose:** Premium spotlight request UI and slot availability display
- **Size:** 10,360 bytes
- **Components:** SpotlightSlots, SpotlightSettings
- **Related Feature:** Feature 18 - Spotlight Priority Slots

### 10. `TierModal.tsx`
- **Path:** `web/src/components/TierModal.tsx` → `FUTURE FEATURES DO NOT DELETE/TierModal.tsx`
- **Purpose:** Subscription tier comparison and upgrade modal
- **Size:** 7,211 bytes
- **Related Feature:** Feature 20 - Tier Upgrade

---

## 📄 Feature Documentation Files

### 11. `Feature-01-Discover-and-Join-Event.md`
- **Topic:** QR scanning, GPS discovery, event search
- **User Role:** Audience
- **Size:** 6,851 bytes

### 12. `Feature-13-View-Analytics-and-Revenue.md`
- **Topic:** DJ analytics dashboard, revenue tracking, data export
- **User Role:** DJ
- **Size:** 6,214 bytes

### 13. `Feature-17-Upvote-Existing-Requests.md`
- **Topic:** Request upvoting system, popularity tracking
- **User Role:** Audience
- **Size:** 1,836 bytes

### 14. `Feature-18-Spotlight-Priority-Slots.md`
- **Topic:** Premium priority queue placement
- **User Role:** Audience
- **Size:** 3,410 bytes

### 15. `Feature-19-Group-Request-Pooling.md`
- **Topic:** Collaborative request funding
- **User Role:** Audience
- **Size:** 2,869 bytes

### 16. `Feature-20-Tier-Upgrade.md`
- **Topic:** Subscription tiers (Bronze/Silver/Gold/Platinum)
- **User Role:** Audience
- **Size:** 5,154 bytes

---

## 📖 Master Documentation

### 17. `README.md`
- **Purpose:** Complete guide to future features, deployment instructions, feature status
- **Size:** 8,895 bytes
- **Sections:**
  - Contents overview
  - AppSync resolver configuration
  - DynamoDB table definitions
  - Deployment instructions
  - Feature status matrix
  - Implementation priority
  - Related documentation links

---

## 🗄️ Database Dependencies

### DynamoDB Tables Required (Not Moved - Infrastructure Config)

These tables are **defined** in CloudFormation/Terraform but may not be deployed:

1. **beatmatchme-group-requests**
   - Defined in: `aws/cloudformation/dynamodb-tables.yaml`
   - Used by: createGroupRequest, contributeToGroupRequest

2. **beatmatchme-upvotes**
   - Defined in: `terraform/dynamodb.tf`
   - Used by: upvoteRequest

3. **beatmatchme-achievements**
   - Defined in: `terraform/dynamodb.tf`
   - Used by: checkAchievements

4. **beatmatchme-users** (existing table, extended fields)
   - Fields added: tier, tierExpiresAt, subscriptionId
   - Used by: updateTier

---

## 🔌 AppSync Resolver Configuration

### Mutations Defined (in `infrastructure/appsync-resolvers.json`)

1. `createGroupRequest` → CreateGroupRequestLambda
2. `contributeToGroupRequest` → ContributeToGroupRequestLambda
3. `upvoteRequest` → UpvoteRequestLambda

**Status:** ✅ Resolvers defined but Lambda functions now in FUTURE FEATURES folder

---

## 📱 Mobile Implementation Status

**Status:** ❌ No mobile (React Native) components were found or moved

**Note:** The mobile app has UI elements that reference these features (e.g., upvote buttons in QueueScreen.js, spotlight pricing in RequestConfirmationScreen.js) but no dedicated feature components to move.

**Action Required:** Mobile UI components will need to be built when features are enabled.

---

## 🌐 Web Implementation Status

**Status:** ✅ 5 React components moved (Analytics, DiscoveryWorkflow, DJDiscovery, SpotlightSlots, TierModal)

**Note:** The web app has these components fully built but they were removed from the active codebase to prevent compilation errors due to missing backend functionality.

---

## 🚨 Breaking Changes When Moved

### Web App (`web/`)

The following exports were **removed** from `web/src/components/index.ts`:

```typescript
// REMOVED - Components moved to FUTURE FEATURES
// export { Analytics, RevenueCard, AnalyticsChart } from './Analytics';
// export { QRCodeGenerator, GeolocationDiscovery, QRCodeScanner } from './DiscoveryWorkflow';
// export { DJDiscovery } from './DJDiscovery';
// export { SpotlightSlots, SpotlightSettings } from './SpotlightSlots';
// export { TierModal } from './TierModal';
```

**Impact:** Any pages/components importing these will fail. Make sure to remove imports before building.

### Lambda Deployment (`infrastructure/deploy-lambdas.ps1`)

The following Lambda functions were **removed** from deployment script:

```powershell
# REMOVED - Moved to FUTURE FEATURES
# "createGroupRequest",
# "contributeToGroupRequest",
# "upvoteRequest",
# "updateTier",
# "checkAchievements"
```

**Impact:** These functions will not be deployed to AWS Lambda. AppSync resolvers will fail if called.

---

## ✅ Verification Checklist

- [x] All Lambda function folders moved
- [x] All React component files moved
- [x] All feature documentation moved
- [x] Master README created
- [x] Component exports removed from index.ts
- [x] Lambda deployment scripts updated
- [x] Mobile app checked (no files to move)
- [x] Database config left in place (infrastructure files)
- [x] AppSync config left in place (resolver definitions)

---

## 🔄 How to Restore Everything

See the detailed restoration instructions in `README.md` in the FUTURE FEATURES folder.

**Quick Summary:**
1. Move Lambda folders back to `aws/lambda/`
2. Move React components back to `web/src/components/`
3. Update `web/src/components/index.ts` exports
4. Update `infrastructure/deploy-lambdas.ps1`
5. Deploy Lambda functions
6. Deploy AppSync schema and resolvers
7. Create DynamoDB tables
8. Test features on staging

---

## 📊 Impact Assessment

| Area | Files Moved | Impact Level | Mitigation |
|------|-------------|--------------|------------|
| Backend Lambda | 5 folders | 🔴 High | Functions won't deploy, resolvers will fail |
| Frontend Web | 5 components | 🟡 Medium | Build errors if imports not removed |
| Frontend Mobile | 0 files | 🟢 Low | No mobile-specific components existed |
| Database | 0 files | 🟢 Low | Config files remain, tables not created |
| Documentation | 6 files | 🟢 Low | No impact, docs are future reference |

---

## 📅 Last Updated
**Date:** November 4, 2025  
**Action:** Initial move of all future feature files  
**By:** AI Assistant

---

## 🔗 Related Files NOT Moved

These files reference future features but are part of core infrastructure:

- `infrastructure/appsync-resolvers.json` - Resolver definitions (kept)
- `infrastructure/schema.graphql` - GraphQL schema with future types (kept)
- `aws/cloudformation/dynamodb-tables.yaml` - Table definitions (kept)
- `terraform/dynamodb.tf` - Terraform table config (kept)
- `terraform/lambda.tf` - Lambda resource definitions (kept)
- `VALUE_PROPOSITION_COMPLIANCE.md` - Product roadmap (kept)

**Reason:** These are active infrastructure files needed for current deployment.
