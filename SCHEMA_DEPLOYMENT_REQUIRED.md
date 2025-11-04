# Schema Deployment Required

## Issue Summary

The web application is experiencing GraphQL errors because the **deployed AppSync schema** is outdated and missing critical fields and queries.

### Current State

**Deployed Schema** (`infrastructure/deployed-schema.graphql`):
- ❌ `listActiveEvents` returns `[Event!]!` (array) instead of `EventConnection`
- ❌ `Event` type missing `venueLocation` field
- ❌ Missing all DJ Sets queries: `listEventDJSets`, `getDJSet`, `listPerformerSets`
- ❌ Missing `EventSettings`, `DJSet`, and other critical types
- ❌ Very minimal schema with only basic Event and Song types

**Target Schema** (`infrastructure/schema.graphql`):
- ✅ Complete schema with all types
- ✅ `listActiveEvents` returns `EventConnection` with pagination
- ✅ `Event` type includes `venueLocation` and all fields
- ✅ All DJ Sets queries and mutations
- ✅ Complete Request, Queue, Transaction types

## Immediate Fix Applied

Updated `UserPortalInnovative.tsx` to:
1. ✅ Query only fields that exist in the deployed schema
2. ✅ Handle array response instead of `EventConnection`
3. ✅ Gracefully fallback when DJ Sets queries fail
4. ✅ Provide clear console warnings about missing schema features

## Required Actions

### 1. Deploy Updated Schema

Run the schema deployment script:

```powershell
cd infrastructure
.\deploy-schema-and-resolvers.ps1
```

Or deploy schema only:

```powershell
cd infrastructure
.\deploy-schema-only.ps1
```

### 2. Verify Deployment

After deployment, verify these queries work in AppSync console:

```graphql
# Test 1: List Active Events with pagination
query ListActiveEvents {
  listActiveEvents(limit: 10) {
    items {
      eventId
      venueName
      venueLocation {
        address
        city
        province
      }
      startTime
      endTime
      status
      performerId
    }
    nextToken
  }
}

# Test 2: List DJ Sets for an Event
query ListEventDJSets($eventId: ID!) {
  listEventDJSets(eventId: $eventId) {
    setId
    eventId
    performerId
    setStartTime
    setEndTime
    status
    isAcceptingRequests
    settings {
      basePrice
      requestCapPerHour
      spotlightSlotsPerBlock
      allowDedications
      allowGroupRequests
    }
  }
}

# Test 3: Get Event Tracklist
query GetEventTracklist($eventId: ID!) {
  getEventTracklist(eventId: $eventId) {
    trackId
    title
    artist
    genre
    basePrice
    albumArt
    isEnabled
  }
}
```

### 3. Update Component After Schema Deployment

Once the full schema is deployed, update `UserPortalInnovative.tsx` to use the correct structure:

```typescript
// Restore EventConnection response structure
const response: any = await client.graphql({
  query: `
    query ListActiveEvents {
      listActiveEvents {
        items {
          eventId
          venueName
          venueLocation {
            address
            city
            province
          }
          startTime
          endTime
          status
          performerId
        }
        nextToken
      }
    }
  `
});

const rawEvents = response.data.listActiveEvents?.items || [];
```

## Files That Need Schema Deployment

| File | Status | Purpose |
|------|--------|---------|
| `infrastructure/schema.graphql` | ✅ Ready | Full schema definition |
| `infrastructure/resolvers/Query.listActiveEvents.*.vtl` | ✅ Ready | Event listing resolver |
| `infrastructure/resolvers/Query.listEventDJSets.*.vtl` | ✅ Ready | DJ Sets listing resolver |
| `infrastructure/resolvers/Query.getEventTracklist.*.vtl` | ✅ Ready | Tracklist resolver |
| `infrastructure/appsync-resolvers.json` | ✅ Ready | Resolver configurations |

## Temporary Workarounds in Place

The web app will now:
1. ✅ Load events successfully (using limited fields)
2. ✅ Show helpful error messages if DJ Sets queries fail
3. ✅ Automatically fallback to browsing mode when DJ Sets unavailable
4. ✅ Log clear warnings in console about missing features

## Expected Behavior After Deployment

Once schema is deployed:
1. ✅ Events will load with full venue location data
2. ✅ DJ Sets lineup will display correctly
3. ✅ Users can browse multiple DJ sets at an event
4. ✅ Tracklist loading will work properly
5. ✅ All GraphQL queries will return complete data

## Next Steps

1. **Deploy schema**: Run `infrastructure/deploy-schema-and-resolvers.ps1`
2. **Test in AppSync console**: Verify all queries work
3. **Restore full queries**: Update component to use EventConnection
4. **Test web app**: Verify event discovery and DJ set selection
5. **Monitor**: Check CloudWatch logs for any resolver errors

---

**Status**: 🟡 Partial functionality with fallbacks
**Priority**: 🔴 High - Schema deployment required for full features
**ETA**: ~10 minutes to deploy and verify
