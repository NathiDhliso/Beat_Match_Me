# DJ Sets End-to-End Testing Plan

## Test Environment
- **Region:** us-east-1
- **AppSync API:** h57lyr2p5bbaxnqckf2r4u7wo4
- **Tables:** beatmatchme-events-dev, beatmatchme-djsets-dev, beatmatchme-requests-dev
- **Test User:** PERFORMER (userId: 540824f8-0021-70ee-ead7-dccd9a91c4ce)

---

## Test Suite 1: Event & DJ Set Creation

### Test 1.1: Create Event with DJ Set (DJ Portal)
**Actor:** DJ (PERFORMER)

**Steps:**
1. Login as DJ/PERFORMER
2. Click "Create Event + Set" button
3. Fill in Event Details:
   - Venue Name: "Test Venue"
   - Event Start: [Today 8PM]
   - Event Duration: 8 hours
4. Fill in DJ Set Details:
   - Set Start: [Today 10PM]
   - Set Duration: 2 hours
   - Base Price: R50
   - Requests/Hour: 10
5. Click "Create Event + Set"

**Expected Results:**
- ✅ Event created in `beatmatchme-events-dev`
  - `venueName`: "Test Venue"
  - `createdBy`: User's ID
  - `status`: "ACTIVE"
  - NO `performerId` field
- ✅ DJ Set created in `beatmatchme-djsets-dev`
  - `eventId`: Links to created event
  - `performerId`: User's ID
  - `setStartTime`: Today 10PM (timestamp)
  - `setEndTime`: Today 12AM (timestamp)
  - `status`: "SCHEDULED"
  - `settings.basePrice`: 50.0
  - `settings.requestCapPerHour`: 10
- ✅ DJ Portal shows new set in selector: "Test Venue (10PM-12AM)"
- ✅ Set is auto-selected after creation

---

### Test 1.2: Create Multiple Sets for Same Event
**Actor:** DJ (PERFORMER)

**Steps:**
1. Create first event: "Club XYZ" (8PM-4AM)
   - DJ Set 1: 10PM-12AM
2. Switch to different test DJ account
3. Create DJ Set for existing event:
   - Event ID: [Use existing "Club XYZ" eventId]
   - Set Start: 12AM
   - Set Duration: 2 hours

**Expected Results:**
- ✅ Second DJ Set created for same event
- ✅ Both sets appear in event's DJ lineup
- ✅ Each DJ only sees their own set in DJ Portal selector
- ✅ Audience sees both DJs in lineup for "Club XYZ"

**Note:** Currently EventCreator creates Event + Set in one step. To add second DJ, need to either:
- Option A: Create separate "Add DJ Set to Existing Event" flow
- Option B: Manually create via AppSync console for testing

---

## Test Suite 2: Audience Discovery & Lineup

### Test 2.1: View Event with Single DJ
**Actor:** Audience (USER)

**Steps:**
1. Login as USER
2. View Event Discovery page
3. Find event with only 1 DJ set
4. Click on event card

**Expected Results:**
- ✅ Auto-navigates to library (skips lineup view)
- ✅ Shows DJ's tracklist
- ✅ Can browse and select songs
- ✅ Back button returns to Event Discovery

---

### Test 2.2: View Event with Multiple DJs
**Actor:** Audience (USER)

**Steps:**
1. Login as USER
2. View Event Discovery page
3. Find event with 2+ DJ sets (from Test 1.2)
4. Click on event card

**Expected Results:**
- ✅ Shows "DJ Lineup" view (not library)
- ✅ Displays all DJ sets sorted by set start time
- ✅ Each set card shows:
   - Set time range (e.g., "10PM-12AM")
   - DJ ID (or name if available)
   - Base price (R50)
   - Requests/hour (10)
   - Status badge ("LIVE NOW" if active)
   - Disabled state if not accepting requests
- ✅ Can click on any accepting DJ to browse library
- ✅ Back button returns to Event Discovery

---

### Test 2.3: Browse DJ Library
**Actor:** Audience (USER)

**Steps:**
1. From lineup view, select a DJ
2. Browse their library
3. Select a song

**Expected Results:**
- ✅ Shows selected DJ's tracklist
- ✅ Song selection works
- ✅ "Request" button appears
- ✅ Back button returns to lineup (not discovery)

---

## Test Suite 3: Request Submission & Queue

### Test 3.1: Submit Song Request
**Actor:** Audience (USER)

**Steps:**
1. Browse DJ's library
2. Select song "Test Song" by "Test Artist"
3. Click massive request button
4. Confirm request

**Expected Results:**
- ✅ Request created in `beatmatchme-requests-dev`
  - `setId`: Current DJ set ID
  - `performerId`: Selected DJ's ID
  - `eventId`: Parent event ID
  - `userId`: Current user's ID
  - `songTitle`: "Test Song"
  - `artistName`: "Test Artist"
  - `status`: "PENDING"
- ✅ Shows "Locked In" animation
- ✅ Transitions to "waiting" view
- ✅ Request appears in DJ's queue (real-time)

---

### Test 3.2: DJ Views Queue
**Actor:** DJ (PERFORMER)

**Steps:**
1. Login as DJ who owns the set
2. View DJ Portal
3. Ensure correct set is selected in selector
4. View queue

**Expected Results:**
- ✅ Queue loads using `getQueue(setId)` query
- ✅ Only shows requests for current DJ set
- ✅ Does NOT show requests from other DJs' sets at same event
- ✅ Queue displays:
   - Song title & artist
   - Requester name
   - Request type (standard/spotlight)
   - Position number
- ✅ Can veto requests
- ✅ Real-time updates when new requests arrive

---

### Test 3.3: Switch Between Sets
**Actor:** DJ (PERFORMER with multiple sets)

**Steps:**
1. Login as DJ with 2+ sets
2. View DJ Portal
3. Click set selector dropdown
4. Switch to different set

**Expected Results:**
- ✅ Dropdown shows all DJ's sets sorted by time
- ✅ Each set shows: Venue name, set time, status
- ✅ Current set has green indicator dot
- ✅ Clicking set switches `currentSetId`
- ✅ Queue reloads with new set's requests
- ✅ Queue is empty for newly created sets
- ✅ Queue shows correct requests after switching back

---

## Test Suite 4: Queue Management

### Test 4.1: Reorder Queue
**Actor:** DJ (PERFORMER)

**Steps:**
1. Have 3+ requests in queue
2. Drag request from position 3 to position 1
3. Save reorder

**Expected Results:**
- ✅ `reorderQueue(setId, orderedRequestIds)` mutation called
- ✅ All requests updated with new `queuePosition` values
- ✅ Queue re-renders with new order
- ✅ Real-time subscribers see update
- ✅ Only affects current set's queue (not other sets)

---

### Test 4.2: Cross-Set Isolation
**Actor:** Setup with 2 DJs at same event

**Setup:**
- Event: "Club XYZ"
- DJ Set 1: DJ A (10PM-12AM) - 3 requests
- DJ Set 2: DJ B (12AM-2AM) - 2 requests

**Test:**
1. Login as DJ A
2. View queue → Should see 3 requests
3. Reorder queue
4. Login as DJ B (different account)
5. View queue → Should see 2 requests

**Expected Results:**
- ✅ DJ A only sees their 3 requests
- ✅ DJ B only sees their 2 requests
- ✅ Reordering DJ A's queue doesn't affect DJ B
- ✅ No cross-contamination between sets
- ✅ Each queue uses correct `setId` in query

---

## Test Suite 5: Set Status Management

### Test 5.1: Set Status Lifecycle
**Actor:** DJ (PERFORMER)

**Steps:**
1. Create set with status "SCHEDULED"
2. Start performing → Update to "ACTIVE"
3. Finish set → Update to "COMPLETED"

**Expected Results:**
- ✅ SCHEDULED sets show in lineup but may not accept requests
- ✅ ACTIVE sets show "LIVE NOW" badge
- ✅ COMPLETED sets show "Set completed" and don't accept requests
- ✅ Status change reflects in audience lineup view immediately

**Note:** Status update currently requires AppSync mutation:
```graphql
mutation {
  updateDJSetStatus(setId: "...", status: ACTIVE) {
    setId
    status
  }
}
```

---

### Test 5.2: Request Acceptance Toggle
**Actor:** DJ (PERFORMER)

**Steps:**
1. Set `isAcceptingRequests` to false
2. Attempt to browse as audience

**Expected Results:**
- ✅ Set appears disabled in lineup
- ✅ Cannot click to browse library
- ✅ Shows "Not accepting requests" message
- ✅ Toggle back to true → Re-enables browsing

---

## Test Suite 6: Data Migration Verification

### Test 6.1: Migrated Event Structure
**Query DynamoDB:**

**Event Table:**
```
eventId: "9a3f2dae-b5a2-4a43-bb80-491a93ca0c65"
venueName: "Should work"
createdBy: "540824f8-0021-70ee-ead7-dccd9a91c4ce"
status: "ACTIVE"
// Should NOT have performerId field
```

**DJ Sets Table:**
```
setId: "SET-1762268683045-zz2kcoov6"
eventId: "9a3f2dae-b5a2-4a43-bb80-491a93ca0c65"
performerId: "540824f8-0021-70ee-ead7-dccd9a91c4ce"
status: "SCHEDULED"
// Linked to event above
```

**Expected:**
- ✅ All 7 migrated events have `createdBy` field
- ✅ All 7 migrated events have NO `performerId` field
- ✅ All 7 DJ sets link to correct events
- ✅ DJ sets preserve original performer ownership

---

## Test Suite 7: Edge Cases

### Test 7.1: No DJ Sets for Event
**Setup:** Event with no DJ sets

**Expected:**
- ✅ Lineup view shows "No DJ sets scheduled"
- ✅ Cannot proceed to library
- ✅ Back button returns to discovery

---

### Test 7.2: Concurrent Set Updates
**Setup:** 2 DJs updating their sets simultaneously

**Test:**
1. DJ A reorders queue
2. DJ B reorders queue (different set)
3. Both save at same time

**Expected:**
- ✅ Both updates succeed
- ✅ No conflicts (different setIds)
- ✅ Each DJ's queue reflects their changes

---

### Test 7.3: Invalid SetId
**Test:**
1. Manually change URL/state to invalid setId
2. Attempt to load queue

**Expected:**
- ✅ Query returns null/empty
- ✅ UI shows "Set not found" or similar
- ✅ No crash

---

## Performance Benchmarks

### Query Performance
| Query | Target | Index Used |
|-------|--------|------------|
| `getQueue(setId)` | <500ms | setId-submittedAt-index |
| `listEventDJSets(eventId)` | <300ms | eventId-setStartTime-index |
| `listPerformerSets(performerId)` | <300ms | performerId-createdAt-index |

### Real-Time Updates
- ✅ Queue subscription delivers updates <1s
- ✅ Set selector updates <1s when new set created

---

## Regression Tests

### Test R.1: Event Discovery Still Works
**Verify:**
- ✅ `listActiveEvents` query still works
- ✅ Events display in discovery view
- ✅ Event cards show correct venue name, time, status

---

### Test R.2: Existing Hooks Still Function
**Verify:**
- ✅ `useEvent(eventId)` returns event details
- ✅ `useQueue(setId)` returns queue (updated parameter)
- ✅ `useTracklist(eventId)` returns songs

---

## Test Results Template

```
## Test Execution: [Date]

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| 1.1 | Create Event with DJ Set | ⏳ | |
| 1.2 | Multiple Sets Same Event | ⏳ | |
| 2.1 | Single DJ Event | ⏳ | |
| 2.2 | Multiple DJ Lineup | ⏳ | |
| 2.3 | Browse DJ Library | ⏳ | |
| 3.1 | Submit Song Request | ⏳ | |
| 3.2 | DJ Views Queue | ⏳ | |
| 3.3 | Switch Between Sets | ⏳ | |
| 4.1 | Reorder Queue | ⏳ | |
| 4.2 | Cross-Set Isolation | ⏳ | |
| 5.1 | Set Status Lifecycle | ⏳ | |
| 5.2 | Request Acceptance Toggle | ⏳ | |
| 6.1 | Migration Verification | ✅ | 7/7 events migrated |
| 7.1 | No DJ Sets Edge Case | ⏳ | |
| 7.2 | Concurrent Updates | ⏳ | |
| 7.3 | Invalid SetId | ⏳ | |
| R.1 | Event Discovery Regression | ⏳ | |
| R.2 | Existing Hooks Regression | ⏳ | |

**Overall Status:** [PASS/FAIL/IN PROGRESS]
**Critical Issues:** [None/List]
**Notes:** [Any observations]
```

---

## Ready to Test?

✅ **Backend:** 100% deployed and verified  
✅ **Frontend:** 100% code changes complete  
✅ **Migration:** 7 events successfully migrated  
🔄 **Testing:** Awaiting execution

**Next Step:** Run through Test Suite 1.1 to verify end-to-end flow!
