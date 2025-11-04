# 🎯 BeatMatchMe - Value Proposition Compliance & Guardrails

## 🚨 STRICT GUARDRAILS FOR AI CODING TOOLS

**This document defines the CORE VALUE PROPOSITION and must be respected at all times.**

---

## 📜 Core Value Proposition

### Primary Problem:
DJs lose money when audiences request songs they won't play.

### Solution:
A transparent request system where:
1. DJs set their own prices per song request
2. Audiences see prices upfront before requesting
3. DJs can veto requests (with refund) if inappropriate
4. Fair-Play Promise ensures audience trust

### Key Principles:
- **Transparency** - All prices visible before payment
- **DJ Control** - DJs set prices, can veto, manage their library
- **Audience Trust** - Fair-Play Promise, refunds for vetoed requests
- **Revenue Focus** - Help DJs monetize their craft

---

## ✅ MUST HAVE Features (Core Value Prop)

### For DJs (Performers):

#### 1. **Event Management**
- ✅ Create/manage events
- ✅ Set event status (active/inactive)
- ✅ View current event details
- ⚠️ **NEW: Toggle availability during event**
  - DJ can mark themselves as "Not Taking Requests" mid-set
  - DJ can turn requests back on when ready
  - Audiences get notified when DJ becomes available again

#### 2. **Pricing Control**
- ✅ Set base price per song request
- ✅ Set different prices per tier (Bronze/Silver/Gold/Platinum)
- ✅ Adjust prices in real-time

#### 3. **Library Management**
- ✅ Add songs to "willing to play" list
- ✅ Set individual song prices
- ✅ Mark songs as available/unavailable
- ✅ Search and filter library

#### 4. **Queue Management**
- ✅ View all incoming requests
- ✅ Veto requests (with automatic refund)
- ✅ See request details (song, requester, price paid)
- ✅ Approve/reject requests

#### 5. **Revenue Tracking**
- ✅ Real-time revenue dashboard
- ✅ View earnings per event
- ✅ Analytics on popular songs/genres

#### 6. **Profile Management** ⚠️ NEW
- ✅ Update DJ profile (name, bio, photo)
- ✅ Set genres/music style
- ✅ View performance history
- ✅ See tier status and benefits
- ✅ Upgrade tier (view what they'll get)

---

### For Audiences (Users):

#### 1. **Event Discovery** ⚠️ NEW
- ✅ Browse available events/venues
- ✅ **Find DJs by name, genre, or venue**
- ✅ See DJ availability status
- ✅ Filter by distance, genre, price range
- ✅ View DJ profiles and ratings

#### 2. **DJ Discovery** ⚠️ NEW CRITICAL
- ✅ **Search for specific DJs**
- ✅ **Browse list of DJs at an event**
- ✅ **See DJ's current availability status**
- ✅ **Get notified when DJ toggles availability ON**
- ✅ View DJ's willing-to-play list
- ✅ See DJ's pricing structure

#### 3. **Song Request Flow**
- ✅ Browse DJ's available songs
- ✅ See price BEFORE requesting
- ✅ Request song with payment
- ✅ Get confirmation ("Locked In")
- ✅ Track request in queue

#### 4. **Queue Tracking**
- ✅ See position in queue
- ✅ Energy beam visualization
- ✅ "Coming Up Next" notification
- ✅ Celebration when song plays

#### 5. **Fair-Play Promise**
- ✅ Automatic refund if DJ vetos
- ✅ Clear refund policy
- ✅ Trust indicators

#### 6. **Profile Management** ⚠️ NEW
- ✅ Update user profile (name, photo, preferences)
- ✅ View request history
- ✅ See tier status and benefits
- ✅ **View tier comparison (what they get at each tier)**
- ✅ **Upgrade tier with clear benefit display**
- ✅ Manage payment methods

#### 7. **Notifications** ⚠️ NEW CRITICAL
- ✅ DJ availability changes
- ✅ Request accepted/vetoed
- ✅ Song coming up next
- ✅ Song now playing
- ✅ Refund processed

---

## 🚫 MUST NOT HAVE Features (Out of Scope)

### ❌ Social Features (Not Core Value Prop):
- ❌ Social login (Google/Facebook) - Adds complexity, not needed
- ❌ Friend lists or social connections
- ❌ Chat between users
- ❌ Comments or reviews (for now)
- ❌ Sharing to social media

### ❌ Gamification (Not Core Value Prop):
- ❌ Points or badges
- ❌ Leaderboards
- ❌ Achievements
- ❌ Streaks

### ❌ Advanced Features (Not MVP):
- ❌ Group requests (splitting payment)
- ❌ Song battles or voting
- ❌ DJ vs DJ competitions
- ❌ Advanced analytics beyond revenue

### ❌ Exploratory Features:
- ❌ Constellation navigation (too complex)
- ❌ Viral growth mechanics (premature)
- ❌ Educational content (not core)

---

## ⚠️ NEW REQUIREMENTS (November 4, 2025)

### Critical UX Gaps Identified:

#### 1. **DJ Discovery Problem**
**Issue:** Users can't find DJs or see who's playing at an event.

**Solution Required:**
- Add "DJs at this Event" list in event discovery
- Add DJ search functionality
- Show DJ profile cards with:
  - Name, photo, genres
  - Current availability status
  - Base pricing
  - "View Library" button

**Implementation:**
- `EventDiscovery` component needs DJ list
- New `DJCard` component
- New `DJSearch` component
- Update `UserPortalInnovative` to show DJs

---

#### 2. **DJ Availability Toggle**
**Issue:** DJ can't control when they accept requests during a set.

**Solution Required:**
- Add "Accepting Requests" toggle in DJ Portal
- Toggle should be prominent (in floating action bubble or status arc)
- When OFF:
  - Audiences see "Not Taking Requests" status
  - Request button disabled
  - Queue still visible
- When turned back ON:
  - Audiences get push notification
  - "Now Accepting Requests!" banner

**Implementation:**
- Add `acceptingRequests` boolean to event state
- Add toggle in `DJPortalOrbital` (floating bubble menu)
- Update `StatusArc` to show availability
- Add notification trigger in `UserPortalInnovative`

---

#### 3. **Profile Management**
**Issue:** Users can't update profiles or see tier benefits.

**Solution Required:**

**For DJs:**
- Add "Profile" option in radial menu
- Profile screen with:
  - Edit name, bio, photo
  - Set genres/music style
  - View tier status
  - Tier comparison table
  - "Upgrade Tier" button with benefits

**For Audiences:**
- Add "Profile" button in header
- Profile screen with:
  - Edit name, photo, preferences
  - View request history
  - View tier status
  - **Tier comparison table showing:**
    - Current tier benefits
    - Next tier benefits
    - Price difference
    - "Upgrade Now" button
  - Payment methods

**Implementation:**
- New `ProfileScreen` component (DJ version)
- New `ProfileScreen` component (User version)
- New `TierComparison` component
- New `UpgradeTierModal` component
- Update navigation to include Profile

---

#### 4. **Notification System**
**Issue:** Users don't get notified of important events.

**Solution Required:**
- DJ availability changes
- Request status updates
- Queue position updates
- Song playing notifications

**Implementation:**
- Enhance `Notifications` component
- Add push notification support
- Add in-app notification center
- Add notification preferences in profile

---

#### 5. **🚨 CRITICAL: Discovery Workflow Gap** (November 4, 2025 - P0)
**Issue:** Chicken-and-egg problem - How does audience find DJ at physical venue?

**The Problem:**
- User is physically at Club XYZ
- Opens app
- How do they know which DJ is playing RIGHT NOW?
- How do they find the event?

**Solution Required - QR Code + Geolocation:**

**A. QR Code System:**
- Every event generates unique QR code
- DJ prints/displays QR code at venue
- User scans → Instantly joins event → Sees DJ library
- QR code includes: eventId, DJ name, venue, time

**B. Geolocation Discovery:**
- "Events Happening Now Near Me" (within 1km)
- Filter by ACTIVE events only (currently in progress)
- Sort by distance
- Show DJ name, venue, time remaining

**C. Event Creation Workflow:**
- **DJ creates event** (not venue, not system)
- DJ sets: Venue name, date/time, duration
- System generates QR code automatically
- DJ can mark event as "Active" when they start
- Only ONE DJ per event is "Active" (accepting requests)

**D. Multi-DJ Events:**
- Multiple DJs can create events at same venue/time
- Each DJ has own event, own queue, own QR code
- Users see "3 DJs at Club XYZ" and choose which to request from
- DJs coordinate turns manually (hand-off not automated)

**Implementation:**
- New `QRCodeGenerator` component
- New `GeolocationDiscovery` component
- New `EventCreationWizard` component
- Add `isActive` boolean to Event
- Add `qrCode` string to Event
- Add geolocation to event search
- Filter events by status (ACTIVE, UPCOMING, ENDED)

---

#### 6. **DJ Onboarding Flow** (November 4, 2025 - P1)
**Issue:** New DJs don't know how to get started.

**Solution Required:**
- Onboarding wizard on first login
- Step 1: Set genres/music style
- Step 2: Set base pricing (suggest based on tier)
- Step 3: Add 10-20 songs to library
- Step 4: Create first event
- Step 5: Download QR code

**Implementation:**
- New `DJOnboardingWizard` component
- Skip button for experienced DJs
- Progress indicator
- Sample library suggestions

---

#### 7. **Payment Settlement** (November 4, 2025 - P1)
**Issue:** When does DJ actually get paid?

**Solution Required:**
- Revenue shows as "Pending" during event
- Revenue becomes "Settled" at end of event
- Payout schedule: Weekly (every Monday)
- Minimum payout: R100
- Bank account setup in DJ profile

**Implementation:**
- Add `revenueStatus` (PENDING, SETTLED, PAID_OUT)
- Add `PayoutSettings` component
- Add bank account verification
- Add payout history

---

#### 8. **Veto Timing Rules** (November 4, 2025 - P1)
**Issue:** When can DJ veto a request?

**Solution Required:**
- DJ can veto BEFORE song plays ✅
- DJ CANNOT veto AFTER song starts ❌
- Automatic refund on veto ✅
- "Skip to Next" option (still refunds, moves to next song)

**Implementation:**
- Add `canVeto` flag based on song status
- Disable veto button once song starts
- Add "Skip" button as alternative

---

#### 9. **Availability Toggle Clarification** (November 4, 2025 - P1)
**Issue:** What happens to existing queue when DJ turns OFF requests?

**Solution Required:**
- Toggle affects NEW requests only
- Existing queue still plays through
- Show message: "Queue closing soon - last chance!"
- Display: "Not accepting new requests (5 songs still in queue)"

**Implementation:**
- Update availability toggle messaging
- Show queue count when unavailable
- Add "last chance" banner

---

#### 10. **Social Login / OAuth Sign-Up** (November 4, 2025 - P1)
**Issue:** Users want easy sign-up without creating new passwords.

**Rationale:**
- **NOT a social feature** - This is authentication, not social networking
- Reduces sign-up friction
- Industry standard for modern apps
- Users expect "Sign in with Google/Apple/Facebook"

**Solution Required:**
- Google OAuth
- Apple Sign In
- Facebook Login (optional)
- Still uses AWS Cognito (federated identities)
- Same custom attributes (role, tier)

**Implementation:**
- New `SocialLoginButtons` component
- Configure Cognito Identity Providers
- Add OAuth callback handling
- Maintain same user flow after login

**IMPORTANT:** This is **authentication convenience**, NOT social features. Users are NOT:
- ❌ Connecting with friends
- ❌ Sharing on social media
- ❌ Following other users
- ❌ Posting to feeds

---

#### 11. **Event Creation & Management** (November 4, 2025 - P0 CRITICAL)
**Issue:** DJs cannot create events, no way to start accepting requests.

**Rationale:**
- **Core workflow blocker** - DJs need events to accept requests
- Event is the container for all DJ-User interactions
- QR codes need event IDs to work
- Users need events to discover and join

**Solution Required:**
- Event Creator modal with venue, address, time, duration
- Event saved to backend (or localStorage in local mode)
- QR code generation for each event
- Event status management (ACTIVE/ENDED)
- "Show QR Code" button for DJs
- "End Event" button to close event

**Implementation:**
- ✅ Created `EventCreator.tsx` component
- ✅ Created `QRCodeDisplay.tsx` component
- ✅ Integrated into DJPortalOrbital
- ✅ Local mode fallback (USE_LOCAL_MODE flag)
- ✅ Event ID stored in localStorage
- ⚠️ Backend API integration pending

**IMPORTANT:** Local mode is temporary for testing. Backend must be configured with:
- AppSync Cognito User Pool auth
- `createEvent` mutation in schema
- Proper resolver authorization

---

#### 12. **Music Database Integration** (November 4, 2025 - P1)
**Issue:** Manually entering song details is tedious and error-prone.

**Rationale:**
- **UX improvement** - Reduce song entry from 30 seconds to 3 seconds
- **Data accuracy** - Auto-fill from official sources
- **Album art** - High-quality images from Spotify/iTunes
- **Industry standard** - All music apps use database search

**Solution Required:**
- Spotify Web API integration (primary)
- iTunes API fallback (no auth required)
- Song search modal with auto-complete
- One-click add to library
- Auto-fill: title, artist, genre, album art

**Implementation:**
- ✅ Created `MUSIC_DATABASE_INTEGRATION.md` guide
- ⚠️ Need to register Spotify app
- ⚠️ Need to create `SongSearchModal.tsx`
- ⚠️ Need to add "Search Online" button to DJLibrary

**IMPORTANT:** This is **data convenience**, NOT a social feature. DJs are NOT:
- ❌ Sharing playlists publicly
- ❌ Following other DJs
- ❌ Connecting Spotify accounts
- ✅ Just searching for song metadata

---

#### 13. **Editable Settings** (November 4, 2025 - P1)
**Issue:** DJ settings (price, requests/hour, etc.) were read-only.

**Rationale:**
- **DJ control** - DJs must be able to adjust pricing
- **Flexibility** - Settings change per venue/event
- **Value prop** - "DJs control their pricing" is core promise

**Solution Required:**
- Edit/Save button toggle in Settings view
- Editable inputs for base price, requests per hour, spotlight slots
- Save to backend (or component state temporarily)
- Validation (min/max values)

**Implementation:**
- ✅ Added edit mode to Settings view
- ✅ Input fields with proper validation
- ✅ Edit/Save button toggle
- ⚠️ Backend persistence pending

---

#### 14. **Component Cleanup & Build Fixes** (November 4, 2025 - P2)
**Issue:** Build failing with "Cannot find module" errors for deleted components.

**Rationale:**
- **Code hygiene** - Remove unused/deprecated components
- **Build stability** - Prevent import errors
- **Maintainability** - Clear what's active vs deprecated

**Solution Required:**
- Remove broken imports from `components/index.ts`
- Document which components were removed and why
- Keep only active components in exports

**Implementation:**
- ✅ Removed imports for deleted components:
  - StatusIndicators, TierBadge, AudioVisualizer, ConfettiAnimation
  - RequestHistory, SongSelection, RequestConfirmation
  - GroupRequest, RequestTracking, QueueViews
- ✅ Created `BUILD_FIXED.md` documentation
- ✅ Build now works without errors

**IMPORTANT:** Old components were part of previous UI iterations. New UI uses:
- ✅ Orbital Interface (DJ Portal)
- ✅ Innovative Interface (User Portal)
- ✅ Event management components

---

#### 15. **DJ-User Integration** (November 4, 2025 - P0 CRITICAL)
**Issue:** DJ and User portals completely disconnected, no data flow.

**Rationale:**
- **Core value prop** - Users must see DJ's songs to request
- **Real-time sync** - DJ adds song → User sees it immediately
- **Event discovery** - Users must find DJ's events

**Solution Required:**
- DJ creates event → Event appears in User discovery
- DJ adds songs → Songs sync to backend → Users see library
- User requests song → Request appears in DJ queue
- Real-time updates via GraphQL subscriptions

**Implementation:**
- ✅ Created `INTEGRATION_GAPS_FIXED.md` guide
- ✅ Event creation flow complete (UI)
- ✅ QR code generation working
- ⚠️ Backend API endpoints needed:
  - POST /events - Create event
  - GET /events/active - List active events
  - POST /tracklist - Sync DJ songs
  - GET /events/:id/tracklist - Fetch songs for users
  - PUT /events/:id/settings - Save settings

**IMPORTANT:** Integration requires:
1. Backend GraphQL mutations/queries
2. Real-time subscriptions for queue updates
3. Proper authentication (Cognito User Pool)
4. Event status management (ACTIVE/ENDED)

---

#### 16. **Local Mode / Offline Testing** (November 4, 2025 - P2)
**Issue:** Backend not ready, cannot test UI flows.

**Rationale:**
- **Development velocity** - Test UI without waiting for backend
- **Error resilience** - Graceful fallback when backend unavailable
- **Demo capability** - Show UI to stakeholders without backend

**Solution Required:**
- USE_LOCAL_MODE flag in components
- localStorage for temporary data storage
- Automatic fallback on backend errors
- Clear indicators when in local mode

**Implementation:**
- ✅ Added to EventCreator component
- ✅ Events saved to localStorage
- ✅ Automatic fallback on 401 errors
- ✅ Success messages indicate local mode

**IMPORTANT:** Local mode is **temporary**. Must switch to backend when ready:
- Set `USE_LOCAL_MODE = false`
- Configure AppSync with Cognito auth
- Deploy GraphQL schema with mutations
- Test end-to-end flow

---

## 🎨 UI/UX Guardrails

### Design Philosophy:
1. **Transparency First** - Always show prices before payment
2. **DJ Control** - DJs have full control over their experience
3. **Audience Trust** - Clear refund policy, Fair-Play Promise
4. **Celebration Moments** - Make requesting and playing fun
5. **Mobile-First** - Touch-optimized, gesture-friendly

### Orbital Interface (DJ Portal):
- ✅ Floating action bubble (draggable)
- ✅ Radial menu (4-6 options max)
- ✅ Status arc (availability, revenue, queue)
- ✅ Gesture navigation
- ⚠️ **Add availability toggle to radial menu**
- ⚠️ **Add profile option to radial menu**

### Event Companion (User Portal):
- ✅ Tinder-style event discovery
- ⚠️ **Add DJ list to event cards**
- ⚠️ **Add DJ search bar**
- ✅ Album art grid with parallax
- ✅ Massive request button
- ⚠️ **Disable button when DJ not accepting requests**
- ✅ Energy beam queue tracker
- ✅ Celebration moments
- ⚠️ **Add profile button to header**

---

## 📋 Implementation Checklist

### Phase 1A: 🚨 CRITICAL Discovery Workflow (P0 - DO FIRST)

#### QR Code System:
- [ ] Create `QRCodeGenerator` component
- [ ] Generate unique QR code for each event
- [ ] Add QR code to event creation flow
- [ ] Add "Download QR Code" button in DJ Portal
- [ ] QR code scanner in User Portal
- [ ] Deep link handling (qr code → event)

#### Geolocation Discovery:
- [ ] Create `GeolocationDiscovery` component
- [ ] Request user location permission
- [ ] "Events Near Me Right Now" view
- [ ] Filter by ACTIVE events only
- [ ] Sort by distance (within 1km)
- [ ] Show DJ name, venue, distance, time remaining

#### Event Creation Workflow:
- [ ] Create `EventCreationWizard` component
- [ ] Add venue name/location field
- [ ] Add date/time/duration fields
- [ ] Auto-generate QR code on creation
- [ ] Add `isActive` boolean to Event schema
- [ ] Add "Start Event" button (sets isActive = true)
- [ ] Add "End Event" button (sets isActive = false)

#### Event Status Management:
- [ ] Add event status filter (ACTIVE, UPCOMING, ENDED)
- [ ] Show only ACTIVE events by default in discovery
- [ ] Add event countdown timer
- [ ] Auto-end events after duration expires

---

### Phase 1B: Critical UX Fixes (IMMEDIATE)

#### DJ Discovery:
- [x] Create `DJCard` component ✅
- [x] Create `DJList` component in event discovery ✅
- [x] Add DJ search functionality ✅
- [x] Show DJ availability status ✅
- [x] Add "View Library" button ✅

#### DJ Availability Toggle:
- [ ] Add `acceptingRequests` to event state
- [ ] Add toggle to DJ floating action bubble
- [ ] Update status arc to show availability
- [ ] Disable user request button when DJ unavailable
- [ ] Add notification when DJ becomes available
- [ ] Show queue count when unavailable
- [ ] Add "Queue closing soon" banner

#### Profile Management:
- [x] Create `DJProfileScreen` component ✅
- [x] Create `UserProfileScreen` component ✅
- [x] Create `TierComparison` component ✅
- [ ] Create `UpgradeTierModal` component
- [ ] Add profile navigation

#### Notifications:
- [ ] Enhance notification system
- [ ] Add push notification support
- [ ] Add notification center
- [ ] Add notification preferences

---

### Phase 2: Polish & Enhancement

- [ ] Add DJ ratings/reviews (optional)
- [ ] Add favorite DJs (optional)
- [ ] Add request history details
- [ ] Add revenue export for DJs
- [ ] Add payment method management

---

## 🔄 Core Workflows (November 4, 2025)

### DJ Complete Workflow:
```
1. Sign Up → DJ Onboarding Wizard
   - Set genres/music style
   - Set base pricing
   - Add 10-20 songs to library

2. Create Event
   - Enter venue name/location
   - Set date, time, duration
   - System generates QR code
   - Download/print QR code

3. At Venue
   - Post QR code at DJ booth
   - Click "Start Event" (sets isActive = true)
   - Toggle "Accepting Requests" ON

4. During Set
   - View incoming requests in circular queue
   - Veto inappropriate requests (auto-refund)
   - Toggle requests OFF if needed (queue still plays)
   - Track revenue in real-time

5. End of Night
   - Click "End Event" (sets isActive = false)
   - Review total revenue (shows as "Settled")
   - Revenue paid out weekly (Mondays)
```

### Audience Complete Workflow:

**Scenario A: Physical Discovery (At Venue)**
```
1. User at Club XYZ
   - Opens app
   - Scans QR code at DJ booth
   OR
   - Clicks "Events Near Me Right Now"
   - Sees "DJ Steve at Club XYZ (0.2km away)"

2. Join Event
   - Instantly sees DJ's library
   - Browse songs with parallax grid
   - See prices upfront

3. Request Song
   - Select song
   - See price (e.g., R50)
   - Tap massive request button
   - Pay with card
   - See "Locked In!" animation

4. Track Request
   - Energy beam shows position in queue
   - Get notification: "Coming up next!"
   - Song plays → NOW PLAYING celebration
```

**Scenario B: Planning Ahead (Search)**
```
1. User wants to see DJ Steve
   - Search "DJ Steve"
   - See upcoming events
   - "Friday at Club XYZ, 10pm-2am"

2. Pre-browse Library
   - View DJ's willing-to-play list
   - See pricing
   - Plan requests

3. At Event
   - Check if event is ACTIVE
   - Join and request as normal
```

### Discovery Workflow (3 Methods):

**Method 1: QR Code (Fastest)**
```
User at venue → Scan QR → Instant event join → Browse library
```

**Method 2: Geolocation (Convenient)**
```
Open app → "Events Near Me" → See active events within 1km → Select DJ → Browse library
```

**Method 3: Search (Planning)**
```
Search DJ name → See events → Check if active → Join → Browse library
```

---

## 🔒 Compliance Rules for AI Tools

### When Adding Features:
1. **Check Value Prop** - Does this help DJs monetize or audiences request transparently?
2. **Check Guardrails** - Is this feature in the MUST HAVE list?
3. **Check Exclusions** - Is this feature in the MUST NOT HAVE list?
4. **Document Changes** - Update this file with any new requirements

### When Removing Features:
1. **Check Core Value** - Is this feature part of core value proposition?
2. **Get Approval** - Don't remove core features without explicit user request
3. **Document Removal** - Update this file

### When Refactoring:
1. **Preserve Core UX** - Don't break DJ control or audience transparency
2. **Keep Guardrails** - Don't add social/gamification features
3. **Test Core Flows** - Ensure request flow and veto flow still work

---

## 📊 Feature Priority Matrix

### P0 (Critical - Core Value Prop - MUST HAVE FOR LAUNCH):
- DJ pricing control ✅
- DJ library management ✅
- DJ veto with refund ✅
- Audience transparent pricing ✅
- Request flow with payment ✅
- Queue visualization ✅
- 🚨 **QR code generation** (NEW - CRITICAL)
- 🚨 **Geolocation discovery** (NEW - CRITICAL)
- 🚨 **Event status management** (NEW - CRITICAL)
- 🚨 **Active event filtering** (NEW - CRITICAL)
- ⚠️ **DJ availability toggle**
- ⚠️ **DJ discovery/search**

### P1 (Important - UX Enhancement - LAUNCH WEEK):
- Profile management (partially done)
- Tier comparison/upgrade (partially done)
- Notification system
- DJ onboarding wizard
- Payment settlement workflow
- Veto timing rules
- Availability toggle clarification

### P2 (Nice to Have - Polish - POST-LAUNCH):
- DJ ratings
- Favorite DJs
- Request history details
- Revenue export
- Multi-DJ event coordination

### P3 (Future - Not MVP):
- Group requests
- Advanced analytics
- Social features (if ever)

---

## 🎯 Success Metrics

### For DJs:
- Revenue per event
- Number of requests accepted
- Average price per request
- Veto rate (should be low)

### For Audiences:
- Request acceptance rate
- Time to song played
- Refund rate (should be low)
- Repeat requests

---

## 📝 Change Log

### November 4, 2025 - Morning Session:
- ✅ Restored VALUE_PROPOSITION_COMPLIANCE.md as core guardrails
- ⚠️ Added DJ Discovery requirement (search, list DJs at event)
- ⚠️ Added DJ Availability Toggle requirement
- ⚠️ Added Profile Management requirement (both DJ and User)
- ⚠️ Added Tier Comparison/Upgrade requirement
- ⚠️ Added Notification System enhancement requirement
- 📋 Created implementation checklist for Phase 1 critical fixes

### November 4, 2025 - Afternoon Session (CRITICAL UPDATE):
- 🚨 **IDENTIFIED CRITICAL WORKFLOW GAP:** Chicken-and-egg discovery problem
- 🚨 **ADDED P0 REQUIREMENT:** QR Code generation for every event
- 🚨 **ADDED P0 REQUIREMENT:** Geolocation-based discovery ("Events Near Me Right Now")
- 🚨 **ADDED P0 REQUIREMENT:** Event status management (ACTIVE, UPCOMING, ENDED)
- 🚨 **ADDED P0 REQUIREMENT:** Active event filtering (show only current events)
- 📋 **ADDED:** Complete DJ workflow documentation
- 📋 **ADDED:** Complete Audience workflow documentation (2 scenarios)
- 📋 **ADDED:** Discovery workflow documentation (3 methods)
- ⚠️ **CLARIFIED:** Event creation ownership (DJ creates, not venue)
- ⚠️ **CLARIFIED:** Multi-DJ event handling (separate events, separate queues)
- ⚠️ **ADDED P1:** DJ Onboarding Wizard requirement
- ⚠️ **ADDED P1:** Payment Settlement workflow
- ⚠️ **ADDED P1:** Veto timing rules
- ⚠️ **ADDED P1:** Availability toggle clarification (queue still plays)
- ⚠️ **ADDED P1:** Social Login / OAuth (Google, Apple, Facebook) - Authentication convenience
- 📊 **UPDATED:** Feature Priority Matrix with P0 discovery features
- ✅ **CREATED:** `QRCodeGenerator`, `GeolocationDiscovery`, `QRCodeScanner` components
- ✅ **CREATED:** `SocialLoginButtons`, `SocialLoginButtonsCompact` components

### November 4, 2025 - Evening Session (INTEGRATION & FIXES):
- 🚨 **ADDED P0 REQUIREMENT:** Event Creation & Management (Section 11)
  - ✅ Created `EventCreator.tsx` modal component
  - ✅ Created `QRCodeDisplay.tsx` component
  - ✅ Integrated into DJPortalOrbital
  - ✅ Local mode fallback for testing
  - ⚠️ Backend API integration pending
- ⚠️ **ADDED P1 REQUIREMENT:** Music Database Integration (Section 12)
  - ✅ Created `MUSIC_DATABASE_INTEGRATION.md` guide
  - ✅ Documented Spotify + iTunes integration
  - ⚠️ Need to implement `SongSearchModal.tsx`
- ⚠️ **ADDED P1 REQUIREMENT:** Editable Settings (Section 13)
  - ✅ Made DJ settings editable (price, requests/hour, spotlight slots)
  - ✅ Edit/Save button toggle
  - ⚠️ Backend persistence pending
- 🔧 **ADDED P2 REQUIREMENT:** Component Cleanup & Build Fixes (Section 14)
  - ✅ Removed broken imports from `components/index.ts`
  - ✅ Fixed build errors (StatusIndicators, TierBadge, etc.)
  - ✅ Created `BUILD_FIXED.md` documentation
- 🚨 **ADDED P0 REQUIREMENT:** DJ-User Integration (Section 15)
  - ✅ Created `INTEGRATION_GAPS_FIXED.md` guide
  - ✅ Documented missing integration points
  - ⚠️ Backend API endpoints needed (5 endpoints)
- 🔧 **ADDED P2 REQUIREMENT:** Local Mode / Offline Testing (Section 16)
  - ✅ Implemented USE_LOCAL_MODE flag in EventCreator
  - ✅ localStorage fallback for events
  - ✅ Automatic fallback on 401 errors
  - ✅ Created `AUTH_ERROR_FIX.md` guide
- 📊 **FIXED:** User Portal workflow order (discovery → browsing → requesting)
- 📊 **FIXED:** Floating Action Bubble radial menu (onClick handlers)
- 📊 **FIXED:** Settings now editable with validation
- 📊 **FIXED:** Build errors from deleted components
- 📋 **CREATED:** Multiple documentation files:
  - `MUSIC_DATABASE_INTEGRATION.md` - Spotify/iTunes integration
  - `INTEGRATION_GAPS_FIXED.md` - DJ-User connection guide
  - `BUILD_FIXED.md` - Build error fixes
  - `AUTH_ERROR_FIX.md` - 401 error workaround
  - `MOCK_DATA_REMOVED.md` - Mock data cleanup
  - `UI_VISUAL_GUIDE.md` - UI expectations

---

#### 17. **NO LOCAL/MOCK DATA POLICY** (November 4, 2025 - P0 CRITICAL)
**Issue:** Local storage and mock data cause production bugs and user confusion.

**Rationale:**
- **Production integrity** - Real backend or nothing
- **Data consistency** - No split between local and backend data
- **User trust** - Users see real, live data only
- **Debugging** - Easier to track issues without local fallbacks

**Policy:**
- ❌ **NO localStorage** for production features
- ❌ **NO mock data** in any component
- ❌ **NO local mode flags** (USE_LOCAL_MODE, etc.)
- ❌ **NO fallbacks** to local storage when backend fails
- ✅ **ONLY backend APIs** for all data
- ✅ **Show errors** when backend fails (don't hide with local data)

**Implementation:**
- ✅ Removed `USE_LOCAL_MODE` from EventCreator
- ✅ Removed localStorage fallback from useEvent
- ✅ Removed all mock data arrays
- ✅ All components fetch from backend only
- ✅ Errors shown to user (no silent fallbacks)

**IMPORTANT:** If backend is down, app should show error, NOT fake local data.

**Forbidden Code Patterns:**
```typescript
// ❌ NEVER DO THIS:
const USE_LOCAL_MODE = true;
localStorage.setItem('event', data);
const mockEvents = [{ ... }];
if (error) { /* fallback to localStorage */ }

// ✅ ALWAYS DO THIS:
const data = await fetchFromBackend();
if (error) { showErrorToUser(error); }
```

---

## 🚨 IMPORTANT NOTES

### For AI Coding Tools:
1. **ALWAYS** check this file before adding/removing features
2. **NEVER** add social/gamification features without explicit approval
3. **ALWAYS** preserve DJ control and audience transparency
4. **DOCUMENT** any changes to requirements in this file
5. **RESPECT** the core value proposition at all times
6. **NEVER** use localStorage, mock data, or local mode for production features
7. **NEVER** create fallbacks to local storage when backend fails
8. **ALWAYS** use real backend APIs - no fake/mock/local data allowed

### For Developers:
1. This file is the source of truth for feature scope
2. When in doubt, refer to this file
3. Update this file when requirements change
4. Get approval before deviating from guardrails

---

**Last Updated:** November 4, 2025  
**Status:** Active - Core Guardrails + Phase 1 Requirements Added
