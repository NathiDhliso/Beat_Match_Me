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

1. **Event Management**
   - Create/manage events (venues/nights with multiple DJ sets)
   - Create DJ sets within events (set times, pricing, settings)
   - Set DJ set status (scheduled/active/completed/cancelled)
   - Toggle availability during set ("Not Taking Requests" mode)

2. **Pricing Control**
   - Set base price per song request (per DJ set)
   - Set different prices per tier (Bronze/Silver/Gold/Platinum)
   - Adjust prices per set in real-time

3. **Library Management**
   - Add songs to "willing to play" list
   - Set individual song prices
   - Mark songs as available/unavailable

4. **Queue Management**
   - View all incoming requests for your DJ set
   - Veto requests (with automatic refund)
   - See request details (song, requester, price paid)
   - Approve/reject requests
   - Switch between multiple sets at same event

5. **Revenue Tracking**
   - Real-time revenue dashboard (per DJ set)
   - View earnings per event and per set
   - Analytics on popular songs/genres

6. **Profile Management**
   - Update DJ profile (name, bio, photo)
   - Set genres/music style
   - View performance history

---

### For Audiences (Users):

1. **Event Discovery**
   - Browse available events/venues
   - Find DJs by name, genre, or venue
   - See DJ availability status
   - Filter by distance, genre, price range

2. **DJ Discovery**
   - Search for specific DJs
   - Browse list of DJs at an event
   - See DJ's current availability status
   - Get notified when DJ toggles availability ON
   - View DJ's willing-to-play list

3. **Song Request Flow**
   - Browse DJ's available songs
   - See price BEFORE requesting
   - Request song with payment
   - Get confirmation ("Locked In")
   - Track request in queue

4. **Queue Tracking**
   - See position in queue
   - Energy beam visualization
   - "Coming Up Next" notification
   - Celebration when song plays

5. **Payment Integration**
   - Secure payment (Yoco/PayFast/Ozow)
   - Automatic refund on veto
   - Payment history

6. **Profile Management**
   - Update user profile
   - View request history
   - Track spending

7. **Fair-Play Promise**
   - Transparent pricing
   - Guaranteed refund on veto
   - Clear queue position visibility

---

## 🚫 MUST NOT HAVE Features (Out of Scope)

### Social Features:
1. ❌ **No Chat/Messaging** - Not a social app
2. ❌ **No Friend Lists** - Not a social network
3. ❌ **No User-to-User Connections** - Focus is DJ-to-Audience
4. ❌ **No Social Sharing** - No "Share to Instagram" features

### Gamification:
5. ❌ **No Leaderboards** - No competitive rankings
6. ❌ **No Badges/Achievements** - No gamification mechanics
7. ❌ **No Loyalty Points** - Simple tier system only

### DJ Control Violations:
8. ❌ **No Forced Requests** - DJ always has veto power
9. ❌ **No Audience Voting to Override DJ** - DJ decision is final
10. ❌ **No "Most Popular Wins" Auto-Play** - DJ curates their set

### Complexity Creep:
11. ❌ **No Venue Management Portal** - Focus on DJ + Audience only

---

## ⚠️ Critical Updates (November 2025)

### Phase 1 Additions:

1. **DJ Availability Toggle**
   - DJs must be able to pause requests mid-event ("Not Taking Requests" mode)
   - Audiences get notified when DJ becomes available again

2. **Event Discovery for Audiences**
   - Browse events by venue, location, genre
   - Search for specific DJs by name
   - See which DJs are at which events

3. **DJ Discovery at Events**
   - List all DJs performing at an event (lineup view)
   - View each DJ's set times (e.g., "10PM-12AM")
   - View each DJ's profile and pricing
   - See DJ's current availability status
   - Select DJ to browse their library

4. **Real-Time Queue Updates**
   - Queue position updates automatically when requests are vetoed/approved
   - "Coming Up Next" notification (3 songs before yours)
   - Visual feedback when your song is playing

5. **Proper Event-DJ-Request Linking**
   - Backend must link: User → Request → DJ Set → Event
   - Frontend must fetch: Event → DJ Sets → DJ Profile → Queue → Request Details
   - Queues scoped to DJ sets (not events)

6. **Responsive Design (Mobile-First)**
   - All components must use responsive Tailwind utilities (sm:, md:, lg:)
   - No hardcoded pixel values (px-4, py-3, w-16, etc.)
   - Test on mobile, tablet, and desktop breakpoints

7. **Dynamic Content (No Hardcoded Data)**
   - No hardcoded genre dropdowns (allow free text input)
   - Backend-powered suggestions (regional intelligence: SA gets Amapiano, not Country)
   - Cultural inclusivity: never force users to select "Other"

8. **Real Backend Integration (No Mock Data)**
   - No localStorage, no local mode, no fallbacks to mock data
   - Always use AWS AppSync GraphQL API
   - Fail gracefully with error messages if backend unavailable

9. **Schema Deployment Process**
   - Schema changes require manual deployment to AppSync
   - VTL resolver files must be attached to API (not just created locally)
   - Connection types (EventConnection) require querying `items { ... }` wrapper

10. **Fair-Play Promise Enforcement**
    - Refunds must be automatic on veto (not manual)
    - Queue position must update in real-time
    - Pricing must be visible BEFORE payment

---

## 🎨 UI/UX Guardrails

### Design Philosophy:

1. **Mobile-First**
   - Design for smallest screen first, scale up
   - Touch-friendly targets (min 44px tap area)
   - Responsive utilities required (no hardcoded sizing)

2. **Transparency Over Everything**
   - Prices visible BEFORE payment
   - Queue position always visible
   - DJ availability status always clear

3. **Minimize User Effort**
   - Default to manual entry (user control)
   - Auto-fill as optional enhancement
   - Never require unnecessary steps

4. **Cultural Inclusivity**
   - No hardcoded genres, venues, or cultural data
   - Free text input with smart suggestions
   - Regional intelligence (SA context: Amapiano, Gqom, Kwaito)

5. **Trust Through Clarity**
   - Clear refund policy
   - Visible queue updates
   - Honest status messages (no "loading..." when backend failed)

---

## 📊 Feature Priority Matrix

### P0 (Must Have - Launch Blockers):
- ✅ Event creation/management (DJ)
- ✅ DJ Set creation within events (DJ)
- ✅ Multi-DJ event support (lineup view)
- ✅ Song request flow with payment (Audience) - **Feature 3 COMPLETE - Mobile + Web**
- ✅ Queue management per DJ set (DJ)
- ✅ Payment integration (Yoco) - **Feature 3 COMPLETE - Mobile + Web**
- ✅ Pricing control per DJ set (DJ)
- ✅ Event discovery (Audience)
- ✅ DJ lineup discovery at events (Audience)
- ✅ DJ set availability toggle (DJ)
- ✅ Real-time queue tracking (Audience) - **Feature 4 COMPLETE - Mobile + Web**
- Real backend integration (no mock data) - **Frontend ready, pending AppSync GraphQL subscriptions**
- ✅ Responsive design (mobile/tablet/desktop)

### P1 (Should Have - First Month):
- Revenue analytics (DJ)
- Request history (Audience)
- DJ profile customization
- Genre suggestions API
- Spotify/iTunes auto-fill (optional)
- Profile management (both personas)

### P2 (Nice to Have - Quarter 1):
- Advanced filtering (events by genre, price, distance)
- DJ performance history
- Tier benefits visualization
- Group request pooling

### P3 (Future Enhancements):
- DJ collaboration features (shared queues)
- Venue management portal
- Advanced analytics dashboard
- Export reports (CSV)

---

## 🎯 Success Metrics

### For DJs:
1. **Revenue Per Event** - Average earnings per night
2. **Request Acceptance Rate** - % of requests approved (not vetoed)
3. **Queue Throughput** - Songs played per hour
4. **Pricing Optimization** - Revenue impact of price changes

### For Audiences:
1. **Request Success Rate** - % of requests that get played
2. **Average Wait Time** - Time from request to play
3. **Repeat Request Rate** - Users making multiple requests per event
4. **Payment Completion Rate** - % who complete payment after seeing price

### Platform Health:
1. **Veto Rate** - Should be <10% (high veto = bad DJ library match)
2. **Refund Processing Time** - Must be <5 minutes
3. **Queue Update Latency** - Real-time updates <2 seconds
4. **Mobile Usage** - Should be >80% of traffic
5. **Schema Sync** - Deployed schema matches local schema (no drift)

---

## 🔒 Compliance Rules for AI Tools

### When Adding Features:
1. **Check Must-Not-Have List** - Verify feature isn't explicitly excluded
2. **Verify Core Value Prop Alignment** - Does it support DJ revenue or audience transparency?
3. **Check Priority Matrix** - Is it P0/P1, or can it wait?
4. **No Mock Data** - Must integrate with real backend (AWS AppSync)
5. **Mobile-First** - Must be responsive (no hardcoded px/py/w/h values)

### When Removing Features:
1. **Check Must-Have List** - Never remove P0 features
2. **Document Reason** - Update change log with justification
3. **Consider Dependencies** - Will removal break other features?

### When Refactoring:
1. **Preserve Core Behavior** - User experience must remain identical
2. **No Regressions** - Test on mobile/tablet/desktop after changes
3. **Update Tests** - Ensure coverage for refactored code

### Schema/Backend Changes:
1. **Deploy Schema First** - Run `deploy-schema-only.ps1` before creating frontend queries
2. **Attach Resolvers** - Run `deploy-schema-and-resolvers.ps1` to link VTL files to AppSync
3. **Test in AppSync Console** - Verify queries work BEFORE testing in frontend
4. **Query Connection Types Correctly** - AppSync returns `{ items: [...] }` wrapper for list queries

### Data Guidelines:
1. **No Hardcoded Dropdowns** - Use free text + backend suggestions
2. **Cultural Inclusivity** - Never force "Other" for genres/venues
3. **Regional Intelligence** - South African context (Amapiano, not Country)

---

## 🚨 IMPORTANT NOTES

### For AI Coding Tools:
1. **ALWAYS** check this file before adding/removing features
2. **NEVER** add social/gamification features without explicit approval
3. **ALWAYS** preserve DJ control and audience transparency
4. **NEVER** use localStorage, mock data, or local mode for production features
5. **NEVER** use hardcoded pixel values - ALWAYS use responsive Tailwind utilities
6. **NEVER** hardcode dropdown options for genres, venues, or cultural data
7. **NEVER** assume schema changes are automatically deployed to AppSync
8. **ALWAYS** check schema for connection types before writing queries (use `items { ... }`)

### For Developers:
1. This file is the source of truth for feature scope
2. When in doubt, refer to this file
3. Update this file when requirements change (but keep it concise)
4. All components must be fully responsive - no exceptions
5. All cultural/creative data must be user-defined, not hardcoded
6. Schema changes = manual deployment (run `deploy-schema-only.ps1` then `deploy-schema-and-resolvers.ps1`)
7. Connection types return `{ items: [...], nextToken }` not raw arrays

---

## 📝 Change Log

### November 2025 (Latest) - Features 3 & 4 Complete
- Completed Feature 3 "Submit Song Request with Payment" (mobile + web frontend)
- Completed Feature 4 "Track Request in Queue with Real-Time Updates" (mobile + web frontend)
- Backend integration pending: GraphQL subscriptions for real-time queue updates

### November 4, 2025 (PM) - DJ Sets Architecture
- **BREAKING CHANGE:** Implemented DJ Sets architecture (Events ≠ Performances)
- Events now represent venues/nights, DJ Sets represent individual DJ performances
- Event schema updated: removed `performerId`, added `createdBy`, added `djSets` relationship
- Request schema updated: added `setId` and `performerId` (required fields)
- Queue operations now scoped to DJ sets (not events)
- Multi-DJ events now supported (P3 → P0): multiple DJs can perform at same venue/night
- Migration: 7 existing events converted to Event + DJSet pairs
- Frontend: DJ Portal shows set selector, Event Creator creates Event + Set, User Portal shows DJ lineups
- All resolvers deployed: createDJSet, getDJSet, listEventDJSets, listPerformerSets, updated getQueue/reorderQueue/createRequest

### November 4, 2025 (AM)
- Added DJ availability toggle requirement (P0)
- Added event/DJ discovery requirements (P0)
- Added responsive design policy (all components mobile-first)
- Added dynamic content policy (no hardcoded genres/venues)
- Added schema deployment process requirements
- Streamlined document: removed code examples, implementation details, and task tracking
- Fixed schema: `Event.venueLocation` now nullable, added `userName`/`userTier` to Request type
- Fixed `getQueue` resolver: Added GSI index + all required fields (currentlyPlaying, userTier, etc.)
- Fixed DJ Portal: Auto-loads most recent ACTIVE event + event selector dropdown for switching between multiple events
- Note: `getEventTracklist` warnings expected (P1 feature - no tracks table yet, uses empty fallback)

### October 2025
- Initial value proposition defined
- Must-Have and Must-Not-Have features established
- Feature priority matrix created (P0-P3)

---

**Last Updated:** November 4, 2025 (PM)  
**Status:** Active - DJ Sets architecture implemented and deployed
