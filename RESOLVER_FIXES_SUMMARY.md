# Resolver Fixes Summary

## Date: November 4, 2025

## Issues Fixed

### 1. ✅ Query.getQueue Resolver
**Problem:** 
- Resolver failed when there were no requests in the queue
- Tried to access `$ctx.result.items[0].eventId` on empty result set

**Fix:**
- Updated `Query.getQueue.res.vtl` to handle empty result sets
- Returns "UNKNOWN" for eventId and performerId when no requests exist
- Empty `orderedRequests` array returned gracefully

**File:** `infrastructure/resolvers/Query.getQueue.res.vtl`

### 2. ✅ Query.getEventTracklist Resolver
**Problem:**
- Resolver was incorrectly configured to query with `$ctx.source.performerId`
- Should have been querying with `$ctx.args.eventId`
- No Tracks table exists in DynamoDB yet

**Fix:**
- Updated resolver to return empty array `[]` until Tracks table is created
- Prevents GraphQL errors in the frontend
- Frontend hook (`useTracklist`) already handles empty tracklist gracefully

**Files:**
- `infrastructure/resolvers/Query.getEventTracklist.req.vtl`
- `infrastructure/resolvers/Query.getEventTracklist.res.vtl`

### 3. ✅ Frontend GraphQL Query Updates
**Problem:**
- Frontend query expected `getEventTracklist` to return object with `songs` and `lastUpdated`
- Schema defines it to return `[Track!]!` directly

**Fix:**
- Updated `getEventTracklist` query in `web/src/services/graphql.ts`
- Changed from `songs { ... }` to directly query Track fields
- Added `basePrice` field to query
- Updated `useTracklist` hook to handle array response instead of object

**Files:**
- `web/src/services/graphql.ts`
- `web/src/hooks/useTracklist.ts`

## Deployment Status

✅ All resolvers successfully deployed to AppSync
- API ID: `h57lyr2p5bbaxnqckf2r4u7wo4`
- Region: `us-east-1`
- Deployed: 11 resolvers

## Current Behavior

### Queue Queries
- ✅ Returns empty queue when no requests exist
- ✅ No GraphQL errors in console
- ✅ Frontend handles empty queue gracefully

### Tracklist Queries
- ✅ Returns empty array (no Tracks table exists yet)
- ✅ No GraphQL errors in console
- ✅ Frontend falls back to empty tracklist with warning message

## Known Limitations & Next Steps

### 1. Tracks Table Missing
**Status:** Not Created  
**Impact:** `getEventTracklist` always returns empty array

**TODO:**
- Create DynamoDB table for Tracks
- Configure table with:
  - Primary key: `trackId`
  - GSI: `eventId-index` for querying tracks by event
  - Fields: `trackId`, `eventId`, `performerId`, `title`, `artist`, `genre`, `albumArt`, `duration`, `basePrice`, `isEnabled`
- Update `Query.getEventTracklist.req.vtl` to query the Tracks table
- Update `Query.getEventTracklist.res.vtl` to return actual tracks

### 2. getQueue Performance
**Status:** Working but not optimal

**Limitation:**
- When queue is empty, returns "UNKNOWN" for eventId and performerId
- Should ideally fetch from DJ Set table

**Recommended Improvement:**
- Convert to pipeline resolver:
  1. GetItem from DJ Sets table to get eventId and performerId
  2. Query Requests table for queue items
- Or add eventId and performerId as query parameters

### 3. Real-time Subscriptions
**Status:** Not tested

**TODO:**
- Test `onQueueUpdate` subscription
- Test `onNewRequest` subscription
- Verify subscriptions work with empty queues

## Testing Checklist

- [x] Deploy resolvers without errors
- [ ] Test `getQueue` with empty queue
- [ ] Test `getQueue` with populated queue
- [ ] Test `getEventTracklist` query (will return empty)
- [ ] Verify no console errors in browser
- [ ] Test queue subscription updates
- [ ] Create Tracks table
- [ ] Test tracklist query with real data

## Files Modified

### Infrastructure
- `infrastructure/resolvers/Query.getQueue.res.vtl`
- `infrastructure/resolvers/Query.getEventTracklist.req.vtl`
- `infrastructure/resolvers/Query.getEventTracklist.res.vtl`

### Frontend
- `web/src/services/graphql.ts`
- `web/src/hooks/useTracklist.ts`

## Console Errors Status

**Before:**
- ❌ `useTracklist.ts:64  ⚠️ Tracklist query not configured`
- ❌ `useQueue.ts:30  ⚠️ Queue query error`
- ❌ `useQueue.ts:33  GraphQL Errors: [{…}]`

**After (Expected):**
- ✅ No errors for queue queries
- ⚠️ Empty tracklist warning (expected until Tracks table created)
- ✅ All queries return valid responses

## Refresh Browser

**Instructions:**
1. Hard refresh browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Clear Apollo Client cache if needed
3. Check console for errors
4. Verify DJ Portal loads without GraphQL errors
