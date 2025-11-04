# FUTURE FEATURES - DO NOT DELETE

This folder contains implementation code and documentation for future features that are not yet enabled in production but are being prepared for future releases.

## ⚠️ Important Notes

- **DO NOT DELETE** these files - they contain valuable implementation work
- These features are **NOT CURRENTLY ACTIVE** in production
- Code is complete but disabled in AppSync resolver configuration
- Features require additional testing and QA before production deployment

---

## 📁 Contents

### Feature Documentation (User Journeys & Specs)

1. **Feature-01-Discover-and-Join-Event.md**
   - QR code scanning
   - GPS-based event discovery
   - Manual search functionality

2. **Feature-13-View-Analytics-and-Revenue.md**
   - DJ revenue dashboard
   - Analytics and metrics
   - Data export functionality

3. **Feature-17-Upvote-Existing-Requests.md**
   - Audience upvoting system
   - Request popularity tracking
   - DJ prioritization hints

4. **Feature-18-Spotlight-Priority-Slots.md**
   - Premium priority queue placement
   - Spotlight request pricing
   - Limited slot availability

5. **Feature-19-Group-Request-Pooling.md**
   - Collaborative request funding
   - Multi-contributor payments
   - Group request management

6. **Feature-20-Tier-Upgrade.md**
   - Subscription tier system (Bronze/Silver/Gold/Platinum)
   - Tier benefits and discounts
   - Subscription management

### Lambda Function Implementations

#### Group Request Features
- **`createGroupRequest/`** - Create new group-funded requests
- **`contributeToGroupRequest/`** - Add contributions to existing group requests

#### Engagement Features
- **`upvoteRequest/`** - Allow users to upvote existing requests in queue

#### Subscription Features
- **`updateTier/`** - Handle user tier upgrades and subscription management

#### Analytics Features
- **`checkAchievements/`** - Track and award DJ achievements and milestones

### React/Web Components (TypeScript)

#### Event Discovery
- **`DiscoveryWorkflow.tsx`** - QR code generation, GPS-based discovery, and scanning components
- **`DJDiscovery.tsx`** - DJ event discovery interface

#### Premium Features
- **`SpotlightSlots.tsx`** - Spotlight request UI and slot management
- **`TierModal.tsx`** - Tier comparison and upgrade modal

#### Analytics & Revenue
- **`Analytics.tsx`** - DJ revenue dashboard and analytics visualization

---

## 🔧 AppSync Resolver Configuration

These Lambda functions are **registered in AppSync** but currently commented out or disabled in the resolver configuration:

**File:** `infrastructure/appsync-resolvers.json`

```json
{
  "resolvers": [
    {
      "typeName": "Mutation",
      "fieldName": "createGroupRequest",
      "dataSourceName": "CreateGroupRequestLambda"
    },
    {
      "typeName": "Mutation",
      "fieldName": "contributeToGroupRequest",
      "dataSourceName": "ContributeToGroupRequestLambda"
    },
    {
      "typeName": "Mutation",
      "fieldName": "upvoteRequest",
      "dataSourceName": "UpvoteRequestLambda"
    }
  ],
  "dataSources": [
    {
      "name": "CreateGroupRequestLambda",
      "type": "AWS_LAMBDA",
      "config": {
        "functionName": "beatmatchme-createGroupRequest"
      }
    },
    {
      "name": "ContributeToGroupRequestLambda",
      "type": "AWS_LAMBDA",
      "config": {
        "functionName": "beatmatchme-contributeToGroupRequest"
      }
    },
    {
      "name": "UpvoteRequestLambda",
      "type": "AWS_LAMBDA",
      "config": {
        "functionName": "beatmatchme-upvoteRequest"
      }
    }
  ]
}
```

---

## 🗄️ DynamoDB Table Configuration

**File:** `aws/cloudformation/dynamodb-tables.yaml`

The following table is defined but may not be created in current deployments:

```yaml
GroupRequestsTable:
  Type: AWS::DynamoDB::Table
  Properties:
    AttributeDefinitions:
      - AttributeName: groupRequestId
        AttributeType: S
    KeySchema:
      - AttributeName: groupRequestId
        KeyType: HASH
    BillingMode: PAY_PER_REQUEST
```

---

## 🚀 Enabling These Features

To enable these features in the future:

### 1. Deploy Lambda Functions

Move the Lambda function folders back to `aws/lambda/`:

```powershell
# From project root
Move-Item "FUTURE FEATURES DO NOT DELETE\createGroupRequest" "aws\lambda\"
Move-Item "FUTURE FEATURES DO NOT DELETE\contributeToGroupRequest" "aws\lambda\"
Move-Item "FUTURE FEATURES DO NOT DELETE\upvoteRequest" "aws\lambda\"
Move-Item "FUTURE FEATURES DO NOT DELETE\updateTier" "aws\lambda\"
Move-Item "FUTURE FEATURES DO NOT DELETE\checkAchievements" "aws\lambda\"
```

### 2. Restore Web Components

Move React components back to web app:

```powershell
# From project root
Move-Item "FUTURE FEATURES DO NOT DELETE\DiscoveryWorkflow.tsx" "web\src\components\"
Move-Item "FUTURE FEATURES DO NOT DELETE\DJDiscovery.tsx" "web\src\components\"
Move-Item "FUTURE FEATURES DO NOT DELETE\SpotlightSlots.tsx" "web\src\components\"
Move-Item "FUTURE FEATURES DO NOT DELETE\TierModal.tsx" "web\src\components\"
Move-Item "FUTURE FEATURES DO NOT DELETE\Analytics.tsx" "web\src\components\"
```

### 3. Update Component Exports

Update `web/src/components/index.ts` to export the restored components:

```typescript
// Event Discovery
export { QRCodeGenerator, GeolocationDiscovery, QRCodeScanner } from './DiscoveryWorkflow';
export { DJDiscovery } from './DJDiscovery';

// Premium Features
export { SpotlightSlots, SpotlightSettings } from './SpotlightSlots';
export { TierModal } from './TierModal';

// Analytics
export { Analytics, RevenueCard, AnalyticsChart } from './Analytics';
```

### 4. Deploy Lambda Functions to AWS

```powershell
cd infrastructure
.\deploy-lambdas.ps1
```

### 3. Update GraphQL Schema

Ensure the schema includes the required mutations/queries in `schema.graphql`:

```graphql
type Mutation {
  createGroupRequest(...): GroupRequest
  contributeToGroupRequest(...): GroupRequest
  upvoteRequest(...): Request
  upgradeTier(...): User
}
```

### 4. Deploy AppSync Schema and Resolvers

```powershell
cd infrastructure
.\deploy-schema-and-resolvers.ps1
```

### 5. Create DynamoDB Tables

```powershell
cd aws
aws cloudformation deploy --template-file cloudformation/dynamodb-tables.yaml --stack-name beatmatchme-tables
```

### 6. Update Mobile/Web Apps

Update the frontend code to expose these features in the UI.

### 7. Testing

- Run integration tests for each feature
- Perform QA testing on staging environment
- Verify payment flows (especially group requests)
- Load testing for upvote functionality

---

## 📊 Feature Status

| Feature | Lambda Code | AppSync Config | DynamoDB Table | Frontend (Web) | Frontend (Mobile) | Status |
|---------|-------------|----------------|----------------|----------------|-------------------|--------|
| Group Requests | ✅ Complete | ✅ Defined | ✅ Defined | ❌ Not Built | ❌ Not Built | 🟡 Backend Ready |
| Upvote Requests | ✅ Complete | ✅ Defined | ✅ Defined | ❌ Not Built | ❌ Not Built | 🟡 Backend Ready |
| Spotlight Slots | ❌ Not Built | ✅ Schema Defined | ❌ Not Needed | ✅ Component Ready | ✅ UI Partial | � Partial |
| Tier Upgrade | ✅ Complete | ✅ Schema Defined | ❌ Uses User table | ✅ Component Ready | ❌ Not Built | 🟡 Partial |
| Analytics Export | ✅ Partial | ❌ Not Defined | ✅ Achievements Table | ✅ Component Ready | ❌ Not Built | 🟡 Partial |
| Event Discovery | ❌ Not Built | ❌ Not Defined | ❌ Uses existing | ✅ Component Ready | ❌ Not Built | � Frontend Ready |

---

## 💡 Implementation Priority

Recommended order for implementing these features:

1. **Upvote Requests** (simplest, high engagement)
2. **Tier Upgrade** (revenue generator)
3. **Analytics Export** (DJ value-add)
4. **Group Requests** (complex but unique differentiator)
5. **Spotlight Slots** (requires tier system first)
6. **Event Discovery** (foundation for growth)

---

## 📝 Notes

- All Lambda functions follow the same structure as existing functions
- Error handling and logging already implemented
- Payment integration uses existing Yoco setup
- Real-time updates use existing AppSync subscriptions
- No breaking changes to existing schema

---

## 🔗 Related Documentation

- Main Schema: `schema.graphql`
- AppSync Config: `infrastructure/appsync-resolvers.json`
- DynamoDB Tables: `aws/cloudformation/dynamodb-tables.yaml`
- Value Proposition: `VALUE_PROPOSITION_COMPLIANCE.md`

---

**Last Updated:** November 4, 2025  
**Maintainer:** Development Team  
**Status:** Future Release - Not Production Ready
