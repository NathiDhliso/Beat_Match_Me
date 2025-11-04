# 🎯 BeatMatchMe - Value Proposition Compliance & Guardrails

## 🚨 STRICT GUARDRAILS FOR AI CODING TOOLS

**This document defines the CORE VALUE PROPOSITION and must be respected at all times.**

### 📋 Document Maintenance Guidelines

**This document should contain:**
- ✅ **WHAT** (requirements, principles, priorities)
- ❌ **NOT HOW** (implementation details, code examples, task tracking)

**Keep sections:**
- Core value proposition (Problem + Solution + Principles)
- MUST HAVE / MUST NOT HAVE features (outcome-focused)
- Feature priority matrix (P0, P1, P2, P3)
- Compliance rules for AI tools (behavior guardrails)
- High-level change log (date + what changed, 1-2 sentences)

**Remove from this document:**
- ❌ Code examples and ASCII diagrams → Move to style guides
- ❌ Implementation status and checklists → Move to project trackers
- ❌ Step-by-step UI flows → Move to design docs
- ❌ DevOps processes → Move to deployment guides
- ❌ Git-style change tracking → Git commits are sufficient
- ❌ Redundant enforcement rules → Keep one master list

**When updating this document:**
1. Ask: "Is this a WHAT or a HOW?"
2. If HOW → Move to appropriate technical doc
3. If WHAT → Keep it concise (principles, not examples)
4. Maximum 3 bullet points per principle
5. No code blocks unless absolutely critical to understanding

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

#### 18. **NO HARDCODED VALUES - RESPONSIVE DESIGN POLICY** (November 4, 2025 - P0 CRITICAL)
**Issue:** Hardcoded pixel values break responsive design and create poor mobile/tablet experiences.

**Rationale:**
- **Mobile-first design** - App must work perfectly on all screen sizes
- **Centralized sizing** - All dimensions should scale based on device size
- **Maintainability** - Responsive utilities are easier to update than hardcoded values
- **Consistency** - Tailwind breakpoints ensure predictable behavior across devices
- **User experience** - Touch targets, text, and spacing must adapt to screen size

**Policy:**
- ❌ **NO hardcoded padding/margin** (px-4, py-3, gap-2, etc.) - Use responsive variants
- ❌ **NO hardcoded widths/heights** (w-16, h-32, etc.) - Use responsive variants
- ❌ **NO hardcoded text sizes** (text-2xl, text-sm, etc.) - Use responsive variants
- ❌ **NO hardcoded gaps/spacing** (gap-4, space-y-6, etc.) - Use responsive variants
- ✅ **ALWAYS use Tailwind responsive utilities** (sm:, md:, lg:, xl:)
- ✅ **Mobile-first approach** - Base styles for mobile, then scale up
- ✅ **Consistent breakpoints** - Follow Tailwind's standard breakpoints

**Tailwind Breakpoints Reference:**
```css
/* Default (Mobile): 0px - 639px */
/* sm: 640px and up (Tablet) */
/* md: 768px and up (Small Desktop) */
/* lg: 1024px and up (Desktop) */
/* xl: 1280px and up (Large Desktop) */
/* 2xl: 1536px and up (Extra Large) */
```

**Implementation Examples:**

**❌ BAD - Hardcoded:**
```typescript
<button className="px-4 py-3 text-xl w-16 h-16 gap-2">
  <Icon className="w-6 h-6" />
  Click Me
</button>

<div className="p-6 mb-4 rounded-2xl">
  <h2 className="text-2xl mb-6">Title</h2>
</div>
```

**✅ GOOD - Responsive:**
```typescript
// Button scales: mobile → tablet → desktop
<button className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-base sm:text-lg md:text-xl w-14 sm:w-16 md:w-20 h-14 sm:h-16 md:h-20 gap-1.5 sm:gap-2 md:gap-3">
  <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
  Click Me
</button>

// Container adapts padding and spacing
<div className="p-4 sm:p-6 md:p-8 mb-3 sm:mb-4 md:mb-6 rounded-xl sm:rounded-2xl md:rounded-3xl">
  <h2 className="text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-6 md:mb-8">Title</h2>
</div>
```

**Responsive Sizing Patterns:**

**Small Elements (Icons, Buttons):**
```typescript
// Icons: 3.5 → 4 → 5 (14px → 16px → 20px)
className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5"

// Small buttons: 12 → 14 → 16 (48px → 56px → 64px)
className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
```

**Medium Elements (Cards, Containers):**
```typescript
// Padding: 3 → 4 → 6 (12px → 16px → 24px)
className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4"

// Medium containers: 16 → 20 → 24 (64px → 80px → 96px)
className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
```

**Large Elements (Headers, Modals):**
```typescript
// Large text: xl → 2xl → 3xl
className="text-xl sm:text-2xl md:text-3xl"

// Large spacing: 4 → 6 → 8 (16px → 24px → 32px)
className="gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-6 md:mb-8"
```

**Layout Adaptations:**
```typescript
// Stack on mobile, horizontal on tablet+
className="flex flex-col sm:flex-row gap-2 sm:gap-4"

// Full width on mobile, auto on tablet+
className="w-full sm:w-auto flex-1 sm:flex-none"

// Hide on mobile, show on tablet+
className="hidden sm:block"

// Different grid columns per breakpoint
className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
```

**Enforcement Rules:**

1. **Code Review Checklist:**
   - [ ] No hardcoded px/py values without sm:/md: variants
   - [ ] No hardcoded w/h values without sm:/md: variants
   - [ ] No hardcoded text sizes without sm:/md: variants
   - [ ] No hardcoded gap/space values without sm:/md: variants
   - [ ] All components tested on mobile (375px), tablet (768px), desktop (1280px)

2. **AI Tool Instructions:**
   - **ALWAYS** replace hardcoded values with responsive variants
   - **NEVER** use fixed sizing (px-4, w-16, text-2xl) alone
   - **ALWAYS** include at least mobile + tablet (sm:) variants
   - **CONSIDER** desktop (md:) variants for critical UI elements
   - **TEST** mental model: "Would this work on iPhone SE and iPad Pro?"

3. **Component Patterns:**
   ```typescript
   // ✅ Responsive Component Template
   export const MyComponent = () => {
     return (
       <div className="p-3 sm:p-4 md:p-6">
         {/* Header */}
         <h2 className="text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 md:mb-6">
           Title
         </h2>
         
         {/* Content */}
         <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
           <button className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base md:text-lg">
             <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
             Action
           </button>
         </div>
       </div>
     );
   };
   ```

4. **Exception Cases** (Rare - Document Why):
   - Color opacity values (bg-black/80 is OK)
   - Border widths (border-2 is OK if consistent across breakpoints)
   - Z-index values (z-50 is OK - not responsive)
   - Animation delays (delay-100 is OK - not responsive)
   - Fixed aspect ratios (aspect-square is OK)

**Implementation Status:**
- ✅ Updated `DJLibrary.tsx` - All buttons responsive
- ✅ Updated `EventCreator.tsx` - Form inputs and modals responsive
- ✅ Updated `OrbitalInterface.tsx` - Floating bubble and status counters responsive
- ⚠️ **TODO:** Audit remaining 40+ components for hardcoded values
- ⚠️ **TODO:** Add responsive design linter rules to ESLint config

**IMPORTANT:** This is a **design system requirement**, not optional. All UI components MUST be responsive. Hardcoded values will be rejected in code review.

---

#### 19. **NO HARDCODED DATA - DYNAMIC CONTENT POLICY** (November 4, 2025 - P0 CRITICAL)
**Issue:** Hardcoded dropdown options, fixed genre lists, and static form data exclude global markets and limit scalability.

**Real-World Problem Identified:**
```typescript
// ❌ CURRENT BROKEN CODE in DJLibrary.tsx:
<select>
  <option value="Pop">Pop</option>
  <option value="Rock">Rock</option>
  <option value="Hip Hop">Hip Hop</option>
  <option value="R&B">R&B</option>
  <option value="Electronic">Electronic</option>
  <option value="Country">Country</option>
  <option value="Jazz">Jazz</option>
  <option value="Other">Other</option>
</select>

// 🚨 CRITICAL ISSUES:
// 1. NO Amapiano (South Africa's #1 genre)
// 2. NO Gqom (South African house music)
// 3. NO Kwaito (South African genre)
// 4. NO Afrobeats (African/Global)
// 5. NO Reggaeton (Latin America)
// 6. NO K-Pop (Asia)
// 7. Western-centric bias excludes global DJs
// 8. Static list can't adapt to new genres
// 9. "Other" is lazy and unhelpful for users
```

**Rationale:**
- **Global inclusivity** - App must work for DJs worldwide, not just Western markets
- **Market adaptability** - South Africa, Nigeria, Brazil, India all have unique music cultures
- **User empowerment** - Don't make users work hard; let them type what they know
- **Future-proof** - New genres emerge constantly (Amapiano didn't exist 10 years ago)
- **Searchability** - User-entered genres enable better filtering and discovery
- **Respect culture** - Forcing "Other" for Amapiano is disrespectful to SA DJs

**Policy:**

1. **NO Hardcoded Dropdown Options for Cultural/Creative Data:**
   - ❌ **NO hardcoded genres** - Use free text input with autocomplete suggestions
   - ❌ **NO hardcoded venue types** - Let users define their own
   - ❌ **NO hardcoded music styles** - Users know their music better than we do
   - ❌ **NO hardcoded languages** - Support global audience
   - ✅ **ALWAYS allow custom user input** for creative/cultural fields
   - ✅ **PROVIDE suggestions** from backend/database, not hardcoded lists
   - ✅ **LEARN from users** - Popular entries become future suggestions

2. **Form Input Hierarchy - User Effort Minimization:**

   **Primary Method: Manual Entry (Default UI)**
   ```typescript
   // ✅ User types freely - NO restrictions
   <input 
     type="text"
     placeholder="Genre (e.g., Amapiano, Afrobeats, Hip Hop)"
     value={genre}
     onChange={(e) => setGenre(e.target.value)}
   />
   
   // Auto-suggest from database as user types
   {suggestions.length > 0 && (
     <ul className="suggestions">
       {suggestions.map(s => (
         <li onClick={() => setGenre(s)}>{s}</li>
       ))}
     </ul>
   )}
   ```

   **Secondary Method: Autocomplete from Backend**
   ```typescript
   // ✅ Fetch popular genres from actual user data
   const suggestions = await fetchPopularGenres({
     region: userLocation, // SA → Amapiano, Gqom
     limit: 10,
     userGenres: djProfile.preferredGenres
   });
   ```

   **Tertiary Method: Music Database Integration (Optional Enhancement)**
   ```typescript
   // ✅ Spotify/iTunes search auto-fills genre
   const songData = await searchSpotify(songTitle, artist);
   // Auto-populate: genre, album art, release year
   // User can still override if needed
   ```

3. **Smart Form Auto-Population:**

   **When User Types Song Title + Artist:**
   ```typescript
   // ✅ Trigger search after 2 fields filled
   useEffect(() => {
     if (songTitle && artist && !genre) {
       // Auto-search Spotify/iTunes
       searchMusicDatabase(songTitle, artist).then(data => {
         // Suggest (don't force) auto-fill
         setSuggestions({
           genre: data.genre,
           albumArt: data.albumArt,
           releaseYear: data.year,
           duration: data.duration
         });
       });
     }
   }, [songTitle, artist]);
   
   // Show "Auto-fill from Spotify?" button
   // User clicks → All fields populate
   // User can still edit any field
   ```

4. **Regional Intelligence:**

   **Detect User Location → Prioritize Local Genres:**
   ```typescript
   const getGenreSuggestions = (userCountry: string) => {
     const regionalGenres = {
       'ZA': ['Amapiano', 'Gqom', 'Kwaito', 'Afro House', 'Deep House'],
       'NG': ['Afrobeats', 'Afro-fusion', 'Highlife', 'Juju'],
       'BR': ['Funk Carioca', 'Samba', 'Forró', 'Sertanejo'],
       'US': ['Hip Hop', 'R&B', 'Pop', 'Country', 'Rock'],
       'KR': ['K-Pop', 'K-Hip Hop', 'K-R&B'],
       // ...
     };
     
     return [
       ...regionalGenres[userCountry] || [],
       ...globalGenres // Common genres worldwide
     ];
   };
   ```

5. **Database Schema - Store User Input Directly:**

   **✅ GOOD Schema:**
   ```graphql
   type Track {
     id: ID!
     title: String!
     artist: String!
     genre: String!  # Free text - user can enter ANYTHING
     albumArt: String
     duration: Int
     # ...
   }
   
   # Separate table for genre analytics
   type GenrePopularity {
     genre: String!
     count: Int!
     region: String!
     trending: Boolean!
   }
   ```

   **❌ BAD Schema:**
   ```graphql
   enum Genre {
     POP
     ROCK
     HIP_HOP  # ❌ Forces users into boxes
     OTHER    # ❌ Lazy and disrespectful
   }
   ```

**Implementation Requirements:**

**Form Flow - User Experience:**
```
1. User opens "Add Track" modal
   
2. Default UI shows:
   ┌─────────────────────────────────┐
   │ Song Title *                    │
   │ [_____________________________] │
   │                                 │
   │ Artist *                        │
   │ [_____________________________] │
   │                                 │
   │ Genre                           │
   │ [Amapiano___________________]   │ ← Free text input
   │ ↳ Suggestions:                  │
   │   • Amapiano                    │ ← From database
   │   • Afrobeats                   │
   │   • Gqom                        │
   │                                 │
   │ [Search Spotify for details] ← Button
   │                                 │
   │ Base Price (R)                  │
   │ [50__]                          │
   │                                 │
   │ [Cancel]  [Add Track]           │
   └─────────────────────────────────┘

3. If user clicks "Search Spotify":
   - Searches: songTitle + artist
   - Auto-fills: genre, album art, duration
   - User can override any field
   - Click "Add Track" → Done

4. If user types manually:
   - No database search needed
   - User enters all fields
   - Suggestions appear as they type
   - Click "Add Track" → Done
```

**Code Pattern - Correct Implementation:**

```typescript
// ✅ CORRECT - Free text input with smart suggestions
interface AddTrackFormProps {
  onAdd: (track: TrackInput) => void;
}

const AddTrackForm: React.FC<AddTrackFormProps> = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: '',  // ✅ Free text - no restrictions
    basePrice: 50
  });
  
  const [genreSuggestions, setGenreSuggestions] = useState<string[]>([]);
  const [spotifySuggestion, setSpotifySuggestion] = useState<any>(null);
  
  // Auto-suggest genres as user types
  const handleGenreChange = async (value: string) => {
    setFormData({ ...formData, genre: value });
    
    if (value.length >= 2) {
      // Fetch suggestions from backend
      const suggestions = await fetchGenreSuggestions(value);
      setGenreSuggestions(suggestions);
    }
  };
  
  // Auto-search Spotify when title + artist filled
  useEffect(() => {
    if (formData.title && formData.artist && !formData.genre) {
      searchSpotify(formData.title, formData.artist).then(data => {
        setSpotifySuggestion(data);
      });
    }
  }, [formData.title, formData.artist]);
  
  const handleAutoFill = () => {
    if (spotifySuggestion) {
      setFormData({
        ...formData,
        genre: spotifySuggestion.genre,
        // Don't override user input, just suggest
      });
    }
  };
  
  return (
    <form>
      {/* Title & Artist fields */}
      
      {/* Genre - FREE TEXT INPUT */}
      <div>
        <label>Genre</label>
        <input
          type="text"
          placeholder="e.g., Amapiano, Afrobeats, Hip Hop"
          value={formData.genre}
          onChange={(e) => handleGenreChange(e.target.value)}
        />
        
        {/* Show suggestions */}
        {genreSuggestions.length > 0 && (
          <ul className="suggestions">
            {genreSuggestions.map(genre => (
              <li 
                key={genre}
                onClick={() => setFormData({ ...formData, genre })}
              >
                {genre}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Optional: Spotify auto-fill suggestion */}
      {spotifySuggestion && (
        <button type="button" onClick={handleAutoFill}>
          Auto-fill from Spotify: {spotifySuggestion.genre}
        </button>
      )}
      
      {/* Rest of form */}
    </form>
  );
};
```

**Forbidden Patterns:**

```typescript
// ❌ NEVER DO THIS - Hardcoded dropdowns for creative data
<select name="genre">
  <option>Pop</option>
  <option>Rock</option>
  <option>Other</option> {/* Disrespectful */}
</select>

// ❌ NEVER DO THIS - Enum restrictions
enum Genre {
  POP = "Pop",
  ROCK = "Rock",
  OTHER = "Other"  // Forces SA DJs to use "Other" for Amapiano
}

// ❌ NEVER DO THIS - Validation that rejects valid input
if (!ALLOWED_GENRES.includes(genre)) {
  throw new Error("Invalid genre");  // Rejects Amapiano!
}
```

**Allowed Patterns:**

```typescript
// ✅ ALWAYS DO THIS - Free text with suggestions
<input 
  type="text" 
  placeholder="Genre (e.g., Amapiano, Gqom, Hip Hop)"
  list="genre-suggestions"
/>
<datalist id="genre-suggestions">
  {popularGenres.map(g => <option key={g} value={g} />)}
</datalist>

// ✅ ALWAYS DO THIS - Store any user input
const genre: string;  // Not an enum - free text

// ✅ ALWAYS DO THIS - Suggest, don't force
const suggestions = await getPopularGenres(userRegion);
// User can ignore suggestions and type anything
```

**Backend Requirements:**

1. **Genre Tracking Table:**
   ```sql
   CREATE TABLE genre_popularity (
     id UUID PRIMARY KEY,
     genre VARCHAR(100) NOT NULL,  -- Free text
     count INT DEFAULT 1,
     region VARCHAR(10),  -- ZA, NG, US, etc.
     last_used TIMESTAMP,
     trending BOOLEAN DEFAULT FALSE
   );
   
   -- When user enters "Amapiano":
   INSERT INTO genre_popularity (genre, region) 
   VALUES ('Amapiano', 'ZA')
   ON CONFLICT (genre, region) 
   DO UPDATE SET count = count + 1, last_used = NOW();
   ```

2. **Suggestion API:**
   ```graphql
   type Query {
     suggestGenres(
       query: String!
       region: String
       limit: Int = 10
     ): [GenreSuggestion!]!
   }
   
   type GenreSuggestion {
     genre: String!
     popularity: Int!
     trending: Boolean!
   }
   ```

**Cultural Sensitivity Rules:**

1. **NEVER force "Other" for non-Western genres**
   - Amapiano is NOT "Other" - it's a valid genre
   - Gqom is NOT "Other" - it's a valid genre
   - K-Pop is NOT "Other" - it's a valid genre

2. **Regional genre lists should reflect actual popularity:**
   ```typescript
   // ✅ South Africa suggestions (2025)
   const zaGenres = [
     'Amapiano',     // #1 in SA
     'Gqom',         // #2 in SA
     'Afro House',   // #3 in SA
     'Deep House',
     'Kwaito',
     'Hip Hop',
     'Afrobeats'
   ];
   
   // ❌ Don't show this to SA users:
   const badList = ['Country', 'Jazz', 'Classical'];
   ```

3. **Learn from your users:**
   - If 1000 SA DJs enter "Amapiano", add it to suggestions
   - If "Lo-fi Hip Hop" becomes popular, add it
   - If a new genre emerges, users can add it immediately

**Enforcement:**

1. **Code Review Checklist:**
   - [ ] NO hardcoded `<select>` dropdowns for genres/creative fields
   - [ ] ALL creative fields use free text input
   - [ ] Suggestions come from backend/database, not hardcoded arrays
   - [ ] Forms support manual entry as PRIMARY method
   - [ ] Auto-fill is OPTIONAL enhancement, not requirement
   - [ ] Regional awareness (SA gets Amapiano, not Country)

2. **AI Tool Instructions:**
   - **NEVER** create hardcoded dropdown lists for genres, venues, styles
   - **ALWAYS** use free text input with autocomplete
   - **ALWAYS** respect cultural context (SA ≠ US ≠ Nigeria ≠ Brazil)
   - **NEVER** use "Other" as a genre option
   - **ALWAYS** let users define their own categories

**Implementation Status:**
- ⚠️ **CRITICAL FIX NEEDED:** DJLibrary.tsx genre dropdown
- ⚠️ **CRITICAL FIX NEEDED:** Replace hardcoded genre list with free text + suggestions
- ⚠️ **TODO:** Add genre_popularity table to backend
- ⚠️ **TODO:** Create genre suggestion API
- ⚠️ **TODO:** Implement regional genre intelligence
- ⚠️ **TODO:** Add Spotify/iTunes auto-fill integration

**IMPORTANT:** This is a **global inclusivity requirement**. Hardcoded cultural data excludes markets and disrespects users. South African DJs should NOT have to select "Other" for Amapiano. Let users define their own culture.

---

## 20. NO DANGLING RESOLVERS - SCHEMA DEPLOYMENT POLICY

### The Problem
Creating VTL resolver files (`.req.vtl` and `.res.vtl`) does NOT automatically deploy them to AWS AppSync. This leads to:

1. **Console Errors**
   - "Queue query not configured"
   - "Tracklist query not configured"  
   - "Subscription field undefined"

2. **Schema Mismatch**
   - Local `schema.graphql` has full definitions
   - Deployed AppSync schema is incomplete/outdated
   - New types/queries don't exist in deployed schema

3. **Developer Confusion**
   - Resolver files exist in `infrastructure/resolvers/`
   - Code looks correct in VTL templates
   - But frontend gets "field undefined" errors

### Root Cause
AWS AppSync requires **manual deployment** of:
1. **Schema updates** (add new types, queries, mutations, subscriptions)
2. **Resolver attachments** (link VTL templates to GraphQL fields)

Creating files locally ≠ deploying to AWS infrastructure.

---

### The Policy

#### Rule 1: Schema Deployment is MANDATORY
**NEVER** assume local schema changes are automatically deployed.

**Before deploying schema:**
```graphql
# ❌ BAD: Add type to schema.graphql and assume it's deployed
type Track {
  trackId: ID!
  title: String!
  artist: String!
}
```

**After deploying schema:**
```bash
# ✅ GOOD: Deploy schema to AppSync after changes
.\infrastructure\deploy-schema-and-resolvers.ps1 -ApiId "your-api-id" -Region "us-east-1"
```

#### Rule 2: Resolver Attachment is MANDATORY
**NEVER** create VTL files without attaching them to AppSync.

**Before attaching resolver:**
```bash
# ❌ BAD: Just create files
infrastructure/resolvers/
  Query.getQueue.req.vtl
  Query.getQueue.res.vtl
  # Files exist but not deployed = console errors
```

**After attaching resolver:**
```bash
# ✅ GOOD: Deploy resolvers to AppSync
.\infrastructure\deploy-schema-and-resolvers.ps1 -ApiId "your-api-id" -Region "us-east-1"
# Script attaches all .vtl files to their respective fields
```

#### Rule 3: Test Deployment in AppSync Console
**NEVER** commit resolver changes without testing in AppSync.

**Testing workflow:**
1. Deploy schema + resolvers
2. Go to AppSync Console → Queries tab
3. Run test query:
   ```graphql
   query TestQueue {
     getQueue(eventId: "test-event-123") {
       queuePosition
       songTitle
     }
   }
   ```
4. Check for errors in response
5. Check CloudWatch logs if errors occur

#### Rule 4: Document Deployment Requirements
**NEVER** add new schema fields without updating deployment docs.

**Required documentation:**
1. **In Code Comments:**
   ```typescript
   // DEPLOYMENT REQUIRED: New query getEventTracklist
   // Run: .\infrastructure\deploy-schema-and-resolvers.ps1
   const { data } = await client.query({
     query: GET_EVENT_TRACKLIST,
     variables: { eventId }
   });
   ```

2. **In Pull Requests:**
   ```markdown
   ### Deployment Checklist
   - [ ] Schema deployed to AppSync
   - [ ] Resolvers attached to fields
   - [ ] Tested in AppSync console
   - [ ] CloudWatch logs checked
   ```

---

### Implementation Patterns

#### Pattern 1: Adding New Query
**Step-by-step workflow:**

1. **Update Schema**
   ```graphql
   # infrastructure/schema.graphql
   type Query {
     getQueue(eventId: ID!): [QueueItem!]!
     getEventTracklist(eventId: ID!): [Track!]!  # NEW
   }
   
   type Track {  # NEW TYPE
     trackId: ID!
     title: String!
     artist: String!
   }
   ```

2. **Create VTL Resolvers**
   ```velocity
   ## infrastructure/resolvers/Query.getEventTracklist.req.vtl
   {
     "version": "2017-02-28",
     "operation": "Query",
     "query": {
       "expression": "eventId = :eventId",
       "expressionValues": {
         ":eventId": $util.dynamodb.toDynamoDBJson($ctx.args.eventId)
       }
     }
   }
   ```
   
   ```velocity
   ## infrastructure/resolvers/Query.getEventTracklist.res.vtl
   $util.toJson($ctx.result.items)
   ```

3. **Deploy to AppSync**
   ```powershell
   .\infrastructure\deploy-schema-and-resolvers.ps1 `
     -ApiId "h57lyr2p5bbaxnqckf2r4u7wo4" `
     -Region "us-east-1"
   ```

4. **Test in Console**
   ```graphql
   query TestTracklist {
     getEventTracklist(eventId: "391dd1fe-1234-5678-abcd-ef1234567890") {
       trackId
       title
       artist
     }
   }
   ```

5. **Update Frontend**
   ```typescript
   // web/src/hooks/useTracklist.ts
   export const GET_EVENT_TRACKLIST = gql`
     query GetEventTracklist($eventId: ID!) {
       getEventTracklist(eventId: $eventId) {
         trackId
         title
         artist
       }
     }
   `;
   ```

#### Pattern 2: Adding Subscription
**Subscriptions require additional configuration:**

1. **Update Schema**
   ```graphql
   type Subscription {
     onQueueUpdate(eventId: ID!): QueueUpdate
   }
   
   type QueueUpdate {
     eventId: ID!
     queuePosition: Int!
     updatedAt: AWSTimestamp!
   }
   ```

2. **Create Subscription Resolver**
   ```velocity
   ## infrastructure/resolvers/Subscription.onQueueUpdate.req.vtl
   {
     "version": "2017-02-28",
     "payload": {}
   }
   ```

3. **Configure in AppSync Console**
   - Go to AppSync → Schema → Subscriptions
   - Attach `onQueueUpdate` to `Mutation.upvoteRequest`
   - Attach `onQueueUpdate` to `Mutation.reorderQueue`
   - Set filter: `$ctx.args.eventId == $ctx.result.eventId`

4. **Test Subscription**
   ```graphql
   subscription TestQueueUpdates {
     onQueueUpdate(eventId: "391dd1fe-1234-5678-abcd-ef1234567890") {
       queuePosition
       updatedAt
     }
   }
   ```

#### Pattern 3: Schema Migration
**When schema changes break existing queries:**

1. **Add New Field (Non-Breaking)**
   ```graphql
   type Track {
     trackId: ID!
     title: String!
     artist: String!
     genre: String  # NEW - Optional field
   }
   ```

2. **Deprecate Old Field (Breaking Change)**
   ```graphql
   type Track {
     trackId: ID!
     title: String!
     artist: String!
     genre: String @deprecated(reason: "Use genreTag instead")
     genreTag: String  # NEW - Replacement field
   }
   ```

3. **Update All Queries Simultaneously**
   ```typescript
   // ❌ BAD: Deploy schema before updating queries
   // Results in: frontend requests deprecated field
   
   // ✅ GOOD: Update frontend BEFORE deploying schema
   // 1. Update all components to use genreTag
   // 2. Deploy schema with deprecation warning
   // 3. Monitor CloudWatch for old field usage
   // 4. Remove deprecated field after 30 days
   ```

---

### Enforcement Rules

#### For AI Coding Tools:
1. **NEVER** assume schema changes are automatically deployed
2. **ALWAYS** remind developer to run deployment script after schema changes
3. **ALWAYS** create VTL resolvers when adding GraphQL fields
4. **NEVER** create resolvers without deployment instructions
5. **ALWAYS** check AppSync console URL in deployment output
6. **ALWAYS** suggest testing new queries in AppSync console
7. **NEVER** commit frontend code that relies on undeployed schema fields

#### For Developers:
1. **Schema changes = manual deployment** (no exceptions)
2. **VTL files = manual attachment** (no auto-deploy)
3. **Test in AppSync console** before testing in frontend
4. **Check CloudWatch logs** for resolver errors
5. **Document deployment steps** in PR description
6. **Version schema changes** using git tags/commits
7. **Monitor AppSync metrics** after deployment

#### Deployment Checklist:
Every schema/resolver change MUST complete:
- [ ] Local schema updated (`infrastructure/schema.graphql`)
- [ ] VTL resolvers created (`.req.vtl` + `.res.vtl`)
- [ ] Deployment script executed (`deploy-schema-and-resolvers.ps1`)
- [ ] Schema validated in AppSync console (no red errors)
- [ ] Resolvers attached to correct fields (check Data Sources)
- [ ] Test query executed in AppSync Queries tab
- [ ] CloudWatch logs checked for errors
- [ ] Frontend code updated to use new fields
- [ ] Frontend tested in browser (no "field undefined" errors)
- [ ] Deployment documented in PR/commit message

---

### Common Pitfalls

#### Pitfall 1: "Field is undefined" Error
**Symptom:**
```
⚠️ Queue query not configured: Field 'getQueue' in type 'Query' is undefined
```

**Root Cause:**
- Schema field exists in `schema.graphql`
- But schema NOT deployed to AppSync

**Fix:**
```powershell
.\infrastructure\deploy-schema-only.ps1 -ApiId "your-api-id"
```

#### Pitfall 2: "Resolver not found" Error
**Symptom:**
```
GraphQL error: Cannot return null for non-nullable field Query.getQueue
```

**Root Cause:**
- Schema field exists in AppSync
- But resolver NOT attached to field

**Fix:**
Run deployment script (attaches all resolvers automatically)

#### Pitfall 3: Schema Drift
**Symptom:**
- Local schema has 50 fields
- AppSync schema has 30 fields
- Frontend breaks unexpectedly

**Root Cause:**
- Developers update local schema
- Never deploy to AppSync
- Drift accumulates over time

**Fix:**
```powershell
# Compare local vs deployed schema
aws appsync get-introspection-schema --api-id "your-api-id" --format SDL --region us-east-1 deployed-schema.graphql
diff infrastructure/schema.graphql deployed-schema.graphql

# Deploy missing changes
.\infrastructure\deploy-schema-only.ps1 -ApiId "your-api-id"
.\infrastructure\deploy-schema-and-resolvers.ps1 -ApiId "your-api-id"
```

#### Pitfall 4: Querying Nested Types Incorrectly
**Symptom:**
```
Validation error of type FieldUndefined: Field 'eventId' in type 'EventConnection' is undefined @ 'listActiveEvents/eventId'
```

**Root Cause:**
- Query requests fields directly on connection type
- Should request fields on `items` array

**Wrong Query:**
```graphql
# ❌ BAD: Queries fields on EventConnection
query ListActiveEvents {
  listActiveEvents {
    eventId      # ERROR: eventId is on Event, not EventConnection
    venueName    # ERROR: venueName is on Event, not EventConnection
    status       # ERROR: status is on Event, not EventConnection
  }
}
```

**Correct Query:**
```graphql
# ✅ GOOD: Queries fields on items array
query ListActiveEvents {
  listActiveEvents {
    items {
      eventId      # ✅ Correct: eventId is on Event type
      venueName    # ✅ Correct: venueName is on Event type
      status       # ✅ Correct: status is on Event type
    }
    nextToken      # ✅ Optional: for pagination
  }
}
```

**Schema Structure:**
```graphql
type EventConnection {
  items: [Event!]!    # <-- Events are here
  nextToken: String   # <-- Pagination token
}

type Event {
  eventId: ID!        # <-- Fields are on Event, not EventConnection
  venueName: String!
  status: EventStatus!
}
```

**Frontend Fix:**
```typescript
// ❌ WRONG: Assumes listActiveEvents returns [Event!]!
const rawEvents = response.data.listActiveEvents || [];

// ✅ CORRECT: Handles EventConnection response
const rawEvents = response.data.listActiveEvents?.items || [];
```

**Lesson:** Always check schema for connection types (`EventConnection`, `RequestConnection`, etc.). These wrapper types contain `items` array and pagination fields, not the data fields directly.

---

### Deployment Script Reference

#### Script: `deploy-schema-and-resolvers.ps1`
**Location:** `infrastructure/deploy-schema-and-resolvers.ps1`

**Usage:**
```powershell
.\infrastructure\deploy-schema-and-resolvers.ps1 `
  -ApiId "h57lyr2p5bbaxnqckf2r4u7wo4" `
  -Region "us-east-1"
```

**What it does:**
1. Prompts to deploy schema via AWS Console (CLI doesn't support schema updates)
2. Discovers all DynamoDB data sources
3. Scans `infrastructure/resolvers/` for `.req.vtl` files
4. Attaches each resolver to corresponding GraphQL field
5. Reports success/failure for each resolver

**Output:**
```
🚀 Deploying GraphQL Schema and Resolvers to AppSync
API ID: h57lyr2p5bbaxnqckf2r4u7wo4
Region: us-east-1

📋 Step 1: Deploying GraphQL Schema...
⚠️  Schema deployment requires AWS Console:
1. Go to: https://console.aws.amazon.com/appsync/home?region=us-east-1#/h57lyr2p5bbaxnqckf2r4u7wo4/v1/schema
2. Click 'Edit Schema'
3. Replace with content from: C:\...\infrastructure\schema.graphql
4. Click 'Save Schema'

📊 Step 2: Getting DynamoDB Data Sources...
✅ Found Events Data Source: beatmatchme-events-dev-datasource
✅ Found Requests Data Source: beatmatchme-requests-dev-datasource

🔧 Step 3: Deploying Resolvers...
Deploying: Query.getQueue
  ✅ Deployed successfully
Deploying: Query.getEventTracklist
  ✅ Deployed successfully

═══════════════════════════════════════
📊 Deployment Summary
═══════════════════════════════════════
✅ Successfully deployed: 2 resolvers
```

---

### Integration with Development Workflow

#### Pre-Commit Hooks
```bash
# .git/hooks/pre-commit
#!/bin/bash

# Check if schema.graphql was modified
if git diff --cached --name-only | grep -q "infrastructure/schema.graphql"; then
  echo "⚠️  WARNING: schema.graphql modified"
  echo "Remember to deploy schema after merge:"
  echo "  .\infrastructure\deploy-schema-and-resolvers.ps1 -ApiId 'your-api-id'"
fi
```

#### CI/CD Pipeline
```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend Schema

on:
  push:
    branches: [main]
    paths:
      - 'infrastructure/schema.graphql'
      - 'infrastructure/resolvers/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Schema
        run: |
          echo "Schema changed - manual deployment required"
          echo "Run: .\infrastructure\deploy-schema-and-resolvers.ps1"
          exit 1  # Fail CI to force manual review
```

---

### Monitoring and Validation

#### CloudWatch Metrics to Monitor:
1. **Resolver Errors**
   - Metric: `4XXError` in AppSync
   - Alert if > 5% of requests

2. **Latency**
   - Metric: `Latency` in AppSync
   - Alert if P99 > 1000ms

3. **Resolver Invocations**
   - Metric: `Invocation` per resolver
   - Track which resolvers are actually used

#### Validation Queries:
```graphql
# Test all critical paths
query ValidateBackend {
  # Events
  getEvent(eventId: "test-id") { eventId }
  
  # Queue
  getQueue(eventId: "test-id") { queuePosition }
  
  # Tracklist
  getEventTracklist(eventId: "test-id") { trackId }
}
```

---

### Example: Real Console Error Fix

#### Before Fix:
```
Console Error:
⚠️ Queue query not configured: Field 'getQueue' in type 'Query' is undefined

Code:
// web/src/hooks/useQueue.ts
const { data } = useQuery(GET_QUEUE, {
  variables: { eventId }
});

Schema:
// infrastructure/schema.graphql
type Query {
  getQueue(eventId: ID!): [QueueItem!]!  # Exists locally
}

AppSync:
// Deployed schema MISSING getQueue field
```

#### After Fix:
```powershell
# Step 1: Deploy schema
.\infrastructure\deploy-schema-and-resolvers.ps1 -ApiId "h57lyr2p5bbaxnqckf2r4u7wo4"

# Step 2: Verify in console
# Go to AppSync → Queries tab
query TestQueue {
  getQueue(eventId: "391dd1fe-1234-5678-abcd-ef1234567890") {
    queuePosition
    songTitle
  }
}

# Step 3: Frontend now works
✅ Queue data loaded successfully
```

---

**IMPORTANT:** Schema deployment is a **critical infrastructure task**. Skipping deployment = production bugs. ALWAYS deploy schema changes immediately after merging.

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
9. **NEVER** use hardcoded pixel values - ALWAYS use responsive Tailwind utilities
10. **ALWAYS** test components on mobile, tablet, and desktop breakpoints
11. **NEVER** hardcode dropdown options for genres, venues, or cultural data
12. **ALWAYS** use free text input with backend-powered suggestions
13. **NEVER** force users to select "Other" - respect cultural context
14. **ALWAYS** prioritize manual entry as primary method (minimize user work)
15. **ALWAYS** provide smart auto-fill as optional enhancement, not requirement
16. **NEVER** assume schema changes are automatically deployed to AppSync
17. **ALWAYS** remind developer to run deployment script after schema/resolver changes
18. **NEVER** create VTL resolvers without deployment instructions in response
19. **ALWAYS** suggest testing new queries in AppSync console after deployment
20. **NEVER** commit frontend code that relies on undeployed schema fields
21. **ALWAYS** check schema for connection types (EventConnection, RequestConnection) before writing queries
22. **NEVER** query fields directly on connection types - use `items { ... }` wrapper
23. **ALWAYS** handle `items` array and optional `nextToken` for paginated queries

### For Developers:
1. This file is the source of truth for feature scope
2. When in doubt, refer to this file
3. Update this file when requirements change
4. Get approval before deviating from guardrails
5. All components must be fully responsive - no exceptions
6. All cultural/creative data must be user-defined, not hardcoded
7. Global inclusivity is mandatory - SA DJs get Amapiano, not "Other"
8. **Schema changes = manual deployment** (run `deploy-schema-only.ps1` then `deploy-schema-and-resolvers.ps1`)
9. **VTL files ≠ deployed resolvers** (files must be attached to AppSync)
10. **Test in AppSync console BEFORE testing in frontend** (catch errors early)
11. **Connection types return `{ items: [...], nextToken }` not raw arrays** - always query `items { ... }`

---

**Last Updated:** November 4, 2025  
**Status:** Active - Core Guardrails + Phase 1 Requirements Added
