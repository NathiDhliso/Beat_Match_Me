# Web Application TODO List

**Date:** November 9, 2025  
**Priority:** Achieve parity with mobile app (98% complete)  
**Timeline:** 1-2 weeks (24-37 hours)

---

## 🎯 Quick Start Guide

### Setup
1. Review `WEB_PARITY_REQUIREMENTS.md` for detailed context
2. Check existing web codebase structure
3. Install any missing dependencies (see below)
4. Start with Phase 1 (Critical features)

### Dependencies to Install
```bash
npm install yoco-sdk-web framer-motion react-hot-toast
```

---

## 📋 PHASE 1: CRITICAL FEATURES (10-15 hours)

### ✅ Task 1: Yoco Payment Integration (4-6 hours)
**Priority:** HIGHEST - Required for production revenue

**Files to Create:**
- `web/src/components/YocoPayment.tsx`
- `web/src/hooks/useYocoPayment.ts`

**Files to Update:**
- `web/src/pages/UserPortalInnovative.tsx` (add payment flow)

**Implementation Steps:**
1. Install Yoco web SDK
2. Create YocoPayment component with:
   - Card input form
   - Amount display
   - Secure payment processing
   - Error handling
3. Create useYocoPayment hook for:
   - Payment initialization
   - Token generation
   - Success/error callbacks
4. Update UserPortal to add payment state:
   - `requesting → payment → waiting`
5. Pass payment token to backend with request
6. Add loading states and error messages
7. Test payment flow end-to-end

**Reference:**
- Mobile: `mobile/src/components/YocoCardInput.js` (pattern to follow)
- Yoco docs: https://developer.yoco.com/online/

**Acceptance Criteria:**
- [ ] Payment form displays correctly
- [ ] Payment processes successfully
- [ ] Token sent to backend
- [ ] Error handling works
- [ ] Loading states clear
- [ ] Mobile parity achieved

---

### ✅ Task 2: Global Error Boundary (1-2 hours)
**Priority:** HIGH - Prevents crashes

**Files to Create:**
- `web/src/components/ErrorBoundary.tsx`

**Files to Update:**
- `web/src/App.tsx` (wrap with ErrorBoundary)

**Implementation Steps:**
1. Create ErrorBoundary class component:
   - `getDerivedStateFromError`
   - `componentDidCatch`
   - Error fallback UI
2. Add user-friendly error screen:
   - Error message
   - "Try Again" button
   - Dev mode error details
3. Wrap entire app in App.tsx
4. Test by throwing errors

**Reference:**
- Mobile: `mobile/src/components/ErrorBoundary.tsx` (copy pattern)

**Acceptance Criteria:**
- [ ] Catches all React errors
- [ ] Shows friendly error screen
- [ ] Try Again button works
- [ ] Dev mode shows details
- [ ] No app crashes

---

### ✅ Task 3: Network Error Handling (2-3 hours)
**Priority:** HIGH - Better reliability

**Files to Create:**
- `web/src/utils/errorHandling.ts`

**Files to Update:**
- `web/src/services/api.ts` (integrate error handler)
- Any components making API calls

**Implementation Steps:**
1. Create errorHandling utility with:
   - `handleNetworkError(error)` - Parse errors
   - `showErrorToast(error, title, onRetry)` - Display errors
   - `isNetworkError(error)` - Check network
   - `isAuthError(error)` - Check auth
   - `withErrorHandling(operation)` - Wrapper
2. Handle HTTP status codes:
   - 401: "Session expired"
   - 403: "No permission"
   - 404: "Not found"
   - 500: "Server error"
   - 503: "Service unavailable"
3. Add retry mechanisms
4. Integrate with Apollo Client error link
5. Use react-hot-toast for notifications

**Reference:**
- Mobile: `mobile/src/utils/errorHandling.ts` (copy logic)

**Acceptance Criteria:**
- [ ] All error types handled
- [ ] User-friendly messages
- [ ] Retry mechanisms work
- [ ] Toast notifications display
- [ ] Auth errors detected

---

### ✅ Task 4: Settings Page Enhancement (2-3 hours)
**Priority:** HIGH - Feature parity

**Files to Update:**
- `web/src/components/Settings.tsx` (enhance existing)
- `web/src/components/QRCodeDisplay.tsx` (create if missing)

**Implementation Steps:**
1. Add Theme Selector:
   - Dropdown or card grid
   - 3 themes (BeatMatchMe, Gold, Platinum)
   - Visual preview circles
   - Active theme highlight
2. Add Dark Mode Toggle:
   - Toggle switch
   - Sun/moon icons
   - Persist preference
3. Add QR Code Display:
   - Generate event QR code
   - `beatmatchme://event/{eventId}`
   - Scannable by mobile
   - Download button
4. Add Logout Button:
   - Confirmation dialog
   - Clear auth state
5. Organize in sections:
   - Appearance (theme + dark mode)
   - Event (QR code)
   - Account (logout)

**Reference:**
- Mobile: `mobile/src/screens/DJPortal.tsx` (Settings tab, lines 526-604)

**Acceptance Criteria:**
- [ ] Theme selector works
- [ ] Dark mode toggles
- [ ] QR code generates
- [ ] Logout confirms and works
- [ ] Settings persist
- [ ] Mobile parity achieved

---

## 📋 PHASE 2: FEATURE PARITY (8-12 hours)

### ✅ Task 5: Tinder-Style Swipe UI (3-4 hours)
**Priority:** MEDIUM - Better UX

**Files to Update:**
- `web/src/pages/UserPortalInnovative.tsx`
- `web/src/components/AudienceInterface.tsx`

**Implementation Steps:**
1. Update event discovery to card stack:
   - Show one event at a time
   - Large card display
   - Event counter (1 of X)
2. Connect existing gesture handlers:
   - Already has `GestureHandler` with peek animation
   - Already has swipe detection
   - Just needs UI implementation
3. Add swipe animations:
   - Card follows finger
   - Resistance effect (already implemented)
   - Smooth transitions
4. Add visual indicators:
   - Red "SKIP" badge (left)
   - Green "JOIN" badge (right)
   - Show during swipe
5. Add action buttons as fallback:
   - Skip button (red)
   - Join button (green)
6. Add swipe hint indicator:
   - Centered arrow
   - Shows direction
   - Fades in/out

**Reference:**
- Mobile: `mobile/src/screens/UserPortal.tsx` (renderDiscovery, lines 315-437)
- Web: `web/src/components/OrbitalInterface.tsx` (GestureHandler already has peek animation)

**Acceptance Criteria:**
- [ ] Card stack displays
- [ ] Swipe right joins event
- [ ] Swipe left skips
- [ ] Peek animation works
- [ ] Indicators show
- [ ] Buttons work as fallback
- [ ] Mobile parity achieved

---

### ✅ Task 6: Request Detail Modal (2-3 hours)
**Priority:** MEDIUM - Better workflow

**Files to Create:**
- `web/src/components/RequestDetailModal.tsx`

**Files to Update:**
- `web/src/pages/DJPortalOrbital.tsx` (add modal trigger)

**Implementation Steps:**
1. Create modal component with sections:
   - Song info (title, artist, genre)
   - User info (name, tier)
   - Price and status
   - Dedication message
   - Timestamps
   - Queue position
2. Add action buttons:
   - Accept (green) - for pending
   - Veto (red) - for pending
   - Refund (orange) - for accepted
3. Style with theme colors
4. Add status color coding:
   - ACCEPTED: green
   - PENDING: orange
   - VETOED: red
   - COMPLETED: purple
5. Make responsive (mobile + desktop)
6. Add close button and overlay click

**Reference:**
- Mobile: `mobile/src/components/RequestDetailModal.tsx` (copy structure)

**Acceptance Criteria:**
- [ ] Modal displays all details
- [ ] Actions work correctly
- [ ] Theme-aware styling
- [ ] Responsive design
- [ ] Close mechanisms work
- [ ] Mobile parity achieved

---

### ✅ Task 7: Animated Counters (1-2 hours)
**Priority:** LOW - Polish

**Files to Create:**
- `web/src/components/AnimatedCounter.tsx`

**Files to Update:**
- Revenue dashboard components

**Implementation Steps:**
1. Create AnimatedCounter with Framer Motion:
   - Smooth number transitions
   - Configurable duration
   - Prefix/suffix support
   - Decimal places control
2. Use spring animations
3. Apply to revenue counters:
   - Total earnings
   - Request counts
   - Average price
4. Add easing for smooth effect

**Reference:**
- Mobile: `mobile/src/components/AnimatedCounter.tsx` (pattern)
- Use Framer Motion instead of react-native-reanimated

**Acceptance Criteria:**
- [ ] Numbers animate smoothly
- [ ] Configurable options work
- [ ] Applied to revenue stats
- [ ] Performance good
- [ ] Mobile parity achieved

---

### ✅ Task 8: Advanced Search Enhancement (2-3 hours)
**Priority:** MEDIUM - User convenience

**Files to Update:**
- Song browsing components
- Event discovery components

**Implementation Steps:**
1. Add advanced filters:
   - Genre multi-select
   - Price range slider
   - Distance filter (if location available)
   - Date range
2. Add sort options:
   - Alphabetical
   - Price (low to high, high to low)
   - Recently added
   - Popularity
3. Add filter chips:
   - Show active filters
   - Click to remove
4. Persist filter preferences
5. Add "Clear all" button

**Acceptance Criteria:**
- [ ] Filters work correctly
- [ ] Sort options apply
- [ ] Filters persist
- [ ] Clear all works
- [ ] Good UX

---

## 📋 PHASE 3: NICE TO HAVE (6-10 hours)

### ✅ Task 9: Haptic Feedback (Web Vibration) (1-2 hours)
**Priority:** LOW - Enhancement

**Files to Create:**
- `web/src/utils/haptics.ts`

**Implementation Steps:**
1. Use Web Vibration API
2. Create haptic utility:
   - `light()` - 10ms
   - `medium()` - 20ms
   - `heavy()` - 30ms
   - `success()` - [10, 50, 10]
   - `error()` - [50, 100, 50]
3. Check browser support
4. Add to key actions:
   - Button presses
   - Swipes
   - Success/error events

**Reference:**
- Mobile: `mobile/src/utils/haptics.ts` (pattern)
- MDN: Vibration API

---

### ✅ Task 10: Offline Support (3-4 hours)
**Priority:** LOW - Enhancement

**Implementation Steps:**
1. Add service worker
2. Cache critical assets
3. Implement offline detection
4. Show offline banner
5. Queue mutations for retry
6. Sync when back online

---

### ✅ Task 11: PWA Features (2-4 hours)
**Priority:** LOW - Enhancement

**Implementation Steps:**
1. Add manifest.json
2. Configure service worker
3. Add install prompt
4. Add app icons
5. Test install flow

---

## 📊 Progress Tracking

### Phase 1 (Critical)
- [ ] Task 1: Yoco Payment (4-6h)
- [ ] Task 2: Error Boundary (1-2h)
- [ ] Task 3: Network Errors (2-3h)
- [ ] Task 4: Settings Page (2-3h)
**Total: 10-15 hours**

### Phase 2 (Important)
- [ ] Task 5: Tinder Swipe (3-4h)
- [ ] Task 6: Request Modal (2-3h)
- [ ] Task 7: Animated Counters (1-2h)
- [ ] Task 8: Advanced Search (2-3h)
**Total: 8-12 hours**

### Phase 3 (Nice to Have)
- [ ] Task 9: Haptics (1-2h)
- [ ] Task 10: Offline (3-4h)
- [ ] Task 11: PWA (2-4h)
**Total: 6-10 hours**

---

## 🎯 Success Criteria

### Phase 1 Complete When:
- ✅ Payments work end-to-end
- ✅ No app crashes (error boundary)
- ✅ Friendly error messages
- ✅ Settings fully functional

### Phase 2 Complete When:
- ✅ Tinder swipe smooth
- ✅ Request modal detailed
- ✅ Counters animated
- ✅ Search enhanced

### Full Parity When:
- ✅ All Phase 1 & 2 complete
- ✅ All tests passing
- ✅ Mobile and web feature equivalent

---

## 📚 Resources

### Documentation
- `WEB_PARITY_REQUIREMENTS.md` - Detailed requirements
- Mobile codebase - Reference implementations
- Yoco docs - Payment integration
- Framer Motion docs - Animations

### Key Mobile Files to Reference
- `mobile/src/components/YocoCardInput.js` - Payment
- `mobile/src/components/ErrorBoundary.tsx` - Error handling
- `mobile/src/utils/errorHandling.ts` - Error utilities
- `mobile/src/screens/DJPortal.tsx` - Settings tab
- `mobile/src/screens/UserPortal.tsx` - Tinder swipe
- `mobile/src/components/RequestDetailModal.tsx` - Modal
- `mobile/src/components/AnimatedCounter.tsx` - Animations

---

## 🚀 Getting Started

### Day 1-2: Yoco Payment
1. Read Yoco SDK docs
2. Create payment component
3. Test with test keys
4. Integrate into request flow
5. Test end-to-end

### Day 3: Error Handling
1. Copy ErrorBoundary from mobile
2. Create error utility
3. Integrate with Apollo
4. Add toast notifications
5. Test error scenarios

### Day 4: Settings
1. Enhance Settings component
2. Add theme selector
3. Add QR code display
4. Add logout button
5. Test all features

### Day 5: Testing
1. Test all Phase 1 features
2. Fix bugs
3. Code review
4. Documentation

### Week 2: Phase 2
Follow similar pattern for remaining tasks

---

## ❓ Questions?

Contact mobile developer for:
- Mobile code references
- Implementation patterns
- Testing strategies
- Code reuse opportunities

---

**Start with Phase 1, Task 1 (Yoco Payment) - Highest priority!**

*TODO List Created: November 9, 2025*  
*Target: 1-2 weeks to completion*  
*Priority: Phase 1 first, then Phase 2*
