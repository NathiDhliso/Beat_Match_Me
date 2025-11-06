# BeatMatchMe Testing Plan

## 📋 Overview

Comprehensive testing plan for BeatMatchMe production readiness, covering theme system, mobile devices, performance, accessibility, and end-to-end flows.

**Testing Timeline:** 1-2 weeks
**Team Required:** 2-3 QA engineers + 1 developer
**Devices Needed:** iOS device, Android device, tablet

---

## 🎨 Theme System Testing

### Test Coverage

#### 1. Visual Regression Testing

**All 3 Themes Must Be Tested:**
- BeatByMe (Purple + Pink)
- Gold (Gold + Amber)
- Platinum (Platinum + Slate)

**Components to Test:**
```
✓ Navigation bar
✓ Login page
✓ DJ Portal
  - Event creation form
  - Tracklist manager
  - Request queue
  - Accept request panel
  - Analytics dashboard
✓ User Portal
  - Event browser
  - Song search
  - Request confirmation
  - Queue tracker
✓ Settings panel
✓ QR code display
✓ Mobile navigation
✓ Buttons (primary, secondary, danger)
✓ Cards (event, track, request)
✓ Forms (inputs, selects, checkboxes)
✓ Modals and panels
```

#### 2. Theme Switching

**Test Cases:**
```typescript
// TC-THEME-001: Switch between themes
1. Login as user
2. Open settings panel
3. Switch from BeatByMe → Gold
   Expected: All colors update immediately
4. Switch from Gold → Platinum
   Expected: All colors update immediately
5. Refresh page
   Expected: Platinum theme persists

// TC-THEME-002: Tier-based theming
1. Login as BASIC tier user
   Expected: BeatByMe theme
2. Upgrade to GOLD tier
   Expected: Theme switches to Gold automatically
3. Upgrade to PLATINUM tier
   Expected: Theme switches to Platinum automatically
```

#### 3. Color Contrast (WCAG AA)

**Requirements:**
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

**Tools:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools Accessibility panel

**Test Each Theme:**
```bash
# BeatByMe theme
Primary (#8B5CF6) on white: ___ (must be ≥4.5:1)
White on Primary (#8B5CF6): ___ (must be ≥4.5:1)
Accent (#EC4899) on white: ___ (must be ≥4.5:1)

# Gold theme
Primary (#D4AF37) on black: ___ (must be ≥4.5:1)
Accent (#F59E0B) on black: ___ (must be ≥4.5:1)

# Platinum theme
Primary (#E5E4E2) on dark gray: ___ (must be ≥4.5:1)
Accent (#94A3B8) on white: ___ (must be ≥4.5:1)
```

#### 4. Test Checklist

- [ ] All components render in BeatByMe theme
- [ ] All components render in Gold theme
- [ ] All components render in Platinum theme
- [ ] Theme switching works without refresh
- [ ] Theme persists after page reload
- [ ] Tier-based auto-theming works
- [ ] All text meets WCAG AA contrast
- [ ] All buttons meet WCAG AA contrast
- [ ] No hardcoded purple/pink colors remain
- [ ] No visual glitches during theme switch

---

## 📱 Mobile Device Testing

### Device Coverage

**Minimum Required Devices:**
- iPhone 12 or newer (iOS 15+)
- Samsung Galaxy S21 or newer (Android 11+)
- iPad (tablet testing)

### Test Scenarios

#### 1. Touch Targets

**TC-MOBILE-001: Minimum touch target size**
```
1. Open DJ Portal on mobile
2. Measure all interactive elements
   Expected: All buttons ≥44x44px
3. Try tapping small buttons
   Expected: Easy to tap without mistakes
```

**Elements to Check:**
- [ ] Navigation buttons: ≥44x44px
- [ ] Accept/Veto buttons: ≥44x44px
- [ ] Play/Pause buttons: ≥44x44px
- [ ] Close/Dismiss buttons: ≥44x44px
- [ ] Form inputs: ≥44px height
- [ ] Checkbox/radio buttons: ≥44x44px

#### 2. Swipe Gestures

**TC-MOBILE-002: Right-swipe to dismiss**
```
1. Open Settings panel on mobile
2. Swipe right from left edge
   Expected: Panel dismisses smoothly
3. Swipe partially (<50%)
   Expected: Panel snaps back
4. Swipe fully (>50%)
   Expected: Panel dismisses

Test on:
- [ ] Settings panel
- [ ] QRCodeDisplay panel
- [ ] AcceptRequestPanel
```

#### 3. Bottom Navigation

**TC-MOBILE-003: Mobile bottom nav**
```
1. Open User Portal on mobile (portrait)
2. Verify bottom nav visible
   Expected: 4 tabs (Home, Browse, Queue, Profile)
3. Tap each tab
   Expected: Navigation works, active state shows
4. Rotate to landscape
   Expected: Bottom nav still functional
5. Switch to desktop (>768px)
   Expected: Bottom nav hidden
```

#### 4. Responsive Orbital Interface

**TC-MOBILE-004: Orbital sizing**
```
1. Open DJ Portal on mobile
2. Navigate to orbital interface
   Measure: Container = 280px, Orbit = 110px
3. Switch to tablet (640px+)
   Expected: Container = 384px, Orbit = 140px
4. Test request cards
   Mobile: 56px (14×14 w-14 h-14)
   Desktop: 96px (24×24 w-24 h-24)
```

#### 5. Viewport Tests

**Screen Sizes to Test:**
- 320px (iPhone SE)
- 375px (iPhone 12)
- 414px (iPhone 12 Pro Max)
- 768px (iPad portrait)
- 1024px (iPad landscape)

**Test Cases:**
```
For each screen size:
- [ ] No horizontal scroll
- [ ] All content visible
- [ ] Text readable (≥16px)
- [ ] Images scale properly
- [ ] Forms are usable
- [ ] Buttons are tappable
```

#### 6. Safe Area Insets (Notched Devices)

**TC-MOBILE-005: iPhone notch handling**
```
1. Open app on iPhone 12+ (with notch)
2. Check top navigation
   Expected: Doesn't overlap notch
3. Check bottom navigation
   Expected: Clears home indicator
4. Open full-screen modal
   Expected: Content within safe area
```

#### 7. Virtual Keyboard

**TC-MOBILE-006: Keyboard behavior**
```
1. Open song search on mobile
2. Tap search input
   Expected: Keyboard appears, input visible
3. Type query
   Expected: Input not hidden by keyboard
4. Submit form
   Expected: Keyboard dismisses
```

#### 8. Mobile Checklist

- [ ] All touch targets ≥44x44px
- [ ] Swipe to dismiss works on all panels
- [ ] Bottom navigation visible and functional
- [ ] Orbital interface responsive
- [ ] No horizontal scroll on any page
- [ ] Safe area insets respected
- [ ] Virtual keyboard doesn't hide inputs
- [ ] Landscape orientation works
- [ ] Pull-to-refresh disabled (if not needed)
- [ ] Tested on real iOS device
- [ ] Tested on real Android device
- [ ] Tested on tablet

---

## ⚡ Performance Benchmarking

### Tools Required

```bash
npm install -g lighthouse
npm install -g webpack-bundle-analyzer
```

### 1. Lighthouse Audits

**Run on Production URL:**
```bash
# Desktop
lighthouse https://beatmatchme.com \
  --preset=desktop \
  --output=html \
  --output-path=./reports/lighthouse-desktop.html

# Mobile
lighthouse https://beatmatchme.com \
  --preset=mobile \
  --output=html \
  --output-path=./reports/lighthouse-mobile.html
```

**Target Scores:**
- Performance: ≥90
- Accessibility: ≥95
- Best Practices: ≥95
- SEO: ≥90

**Key Metrics:**
```
First Contentful Paint (FCP): <1.5s
Largest Contentful Paint (LCP): <2.5s
Time to Interactive (TTI): <3.0s
Cumulative Layout Shift (CLS): <0.1
First Input Delay (FID): <100ms
Total Blocking Time (TBT): <300ms
Speed Index: <3.0s
```

### 2. Bundle Size Analysis

**Analyze Production Build:**
```bash
cd web
npm run build -- --stats

# Generate report
npx webpack-bundle-analyzer build/bundle-stats.json
```

**Target Sizes:**
- Initial bundle: <1MB (gzipped <300KB)
- Total bundle: <3MB (gzipped <1MB)
- Lazy chunks: <500KB each

**Check for:**
- [ ] No duplicate dependencies
- [ ] Tree shaking working
- [ ] Large libraries code-split
- [ ] Unused code removed

### 3. Runtime Performance

**Chrome DevTools Performance:**
```
1. Open Chrome DevTools
2. Go to Performance tab
3. Record page load
4. Analyze:
   - Scripting time
   - Rendering time
   - Painting time
   - Layout shifts
```

**Test Scenarios:**
```
TC-PERF-001: DJ Library with 10,000 tracks
1. Load DJ Portal
2. Upload 10,000 track CSV
3. Measure:
   - Initial render: <1s
   - Scroll FPS: 60fps
   - Memory usage: <200MB

TC-PERF-002: Virtual scrolling
1. Open track list with 5,000+ items
2. Scroll rapidly
3. Measure:
   - FPS: 60fps (no jank)
   - DOM nodes: <100 (virtual scrolling working)

TC-PERF-003: Image lazy loading
1. Open event browser (50+ events)
2. Monitor network tab
3. Expected:
   - Only visible images load initially
   - Images load progressively on scroll
   - Blur effect on load

TC-PERF-004: Route code splitting
1. Clear cache
2. Load /dj-portal
3. Check network tab
   Expected: UserPortal bundle NOT loaded
4. Navigate to /user-portal
   Expected: UserPortal bundle loads now
```

### 4. Network Performance

**Test on Different Connections:**
```bash
# Simulate 3G
Chrome DevTools → Network → Slow 3G
- Page load: <10s
- Images: Progressive loading
- Critical content: <5s

# Simulate 4G
Chrome DevTools → Network → Fast 3G
- Page load: <5s
- Interactive: <3s

# Desktop
Chrome DevTools → Network → No throttling
- Page load: <2s
- Interactive: <1s
```

### 5. Performance Checklist

- [ ] Lighthouse Performance ≥90 (desktop)
- [ ] Lighthouse Performance ≥80 (mobile)
- [ ] LCP <2.5s
- [ ] FID <100ms
- [ ] CLS <0.1
- [ ] Initial bundle <1MB
- [ ] Virtual scrolling handles 10,000+ items at 60fps
- [ ] Images lazy load progressively
- [ ] Route code splitting reduces initial load
- [ ] Component memoization prevents unnecessary re-renders
- [ ] No memory leaks (check with DevTools heap snapshots)

---

## ♿ Accessibility Audit

### Tools

- [axe DevTools](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd)
- [WAVE](https://wave.webaim.org/)
- Chrome DevTools Lighthouse
- Screen readers: NVDA (Windows), VoiceOver (Mac/iOS)

### 1. WCAG Compliance

**Level AA Requirements:**

**Perceivable:**
- [ ] Text alternatives for images
- [ ] Captions for audio/video
- [ ] Color not sole means of conveying info
- [ ] Text contrast ≥4.5:1 (normal), ≥3:1 (large)

**Operable:**
- [ ] All functionality via keyboard
- [ ] No keyboard traps
- [ ] Skip links present
- [ ] Focus indicators visible
- [ ] Touch targets ≥44x44px

**Understandable:**
- [ ] Language attribute set (`<html lang="en">`)
- [ ] Form labels present
- [ ] Error messages clear
- [ ] Navigation consistent

**Robust:**
- [ ] Valid HTML
- [ ] ARIA attributes correct
- [ ] Compatible with assistive tech

### 2. Keyboard Navigation

**TC-A11Y-001: Keyboard-only navigation**
```
1. Open DJ Portal
2. Press Tab repeatedly
   Expected: Focus moves through all interactive elements
3. Press Shift+Tab
   Expected: Focus moves backward
4. Press Enter on button
   Expected: Button activates
5. Press Escape on modal
   Expected: Modal closes
6. Test all components

Check:
- [ ] Tab order logical
- [ ] Focus visible (outline/ring)
- [ ] No keyboard traps
- [ ] Skip to main content link
- [ ] Dropdowns accessible via keyboard
- [ ] Modals/panels close with ESC
```

### 3. Screen Reader Testing

**NVDA (Windows) / VoiceOver (Mac):**

**TC-A11Y-002: Screen reader compatibility**
```
1. Enable screen reader
2. Navigate DJ Portal
   Expected: All content announced
3. Test forms
   Expected: Labels, errors, hints read
4. Test buttons
   Expected: Role and state announced
5. Test images
   Expected: Alt text read

Check:
- [ ] Headings structured (h1 → h6)
- [ ] Landmark regions (<nav>, <main>, <aside>)
- [ ] Form labels associated
- [ ] Button purposes clear
- [ ] Image alt text descriptive
- [ ] ARIA labels on icons
- [ ] Live regions for updates
```

### 4. ARIA Attributes

**Components to Audit:**
```typescript
// Buttons
<button aria-label="Close panel">×</button>

// Icons
<svg aria-hidden="true" focusable="false">...</svg>
<span className="sr-only">Play</span>

// Modals
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Settings</h2>
</div>

// Live regions
<div role="status" aria-live="polite">
  Request submitted successfully
</div>

// Tab panels
<div role="tabpanel" aria-labelledby="tab-1">...</div>
```

**Check:**
- [ ] `aria-label` on icon buttons
- [ ] `aria-labelledby` / `aria-describedby` used correctly
- [ ] `aria-live` for dynamic content
- [ ] `aria-hidden` on decorative elements
- [ ] `role` attributes appropriate
- [ ] `aria-expanded` on toggles
- [ ] `aria-current` on navigation

### 5. Focus Management

**TC-A11Y-003: Focus trapping in modals**
```
1. Open Settings panel
2. Press Tab
   Expected: Focus stays within panel
3. Press Shift+Tab from first element
   Expected: Focus moves to last element
4. Close panel
   Expected: Focus returns to trigger button
```

### 6. Reduced Motion

**TC-A11Y-004: prefers-reduced-motion**
```
1. Enable reduced motion:
   Windows: Settings → Ease of Access → Display → Show animations
   Mac: System Preferences → Accessibility → Display → Reduce motion
2. Open app
   Expected: Animations disabled or simplified
3. Test:
   - Panel slide-ins → Instant
   - Fade animations → Instant
   - Transitions → Instant
```

**CSS Check:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 7. Accessibility Checklist

- [ ] axe DevTools: 0 violations
- [ ] WAVE: 0 errors
- [ ] Lighthouse Accessibility: ≥95
- [ ] All images have alt text
- [ ] Color contrast WCAG AA compliant
- [ ] Keyboard navigation works completely
- [ ] No keyboard traps
- [ ] Focus indicators visible
- [ ] Screen reader compatible
- [ ] ARIA attributes correct
- [ ] Headings properly structured
- [ ] Forms fully labeled
- [ ] Reduced motion support

---

## 🧪 End-to-End Test Suite

### Test Framework

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### 1. DJ Portal Critical Flows

**TC-E2E-001: Create event and manage requests**
```typescript
test('DJ can create event and manage requests', async ({ page }) => {
  // Login as DJ
  await page.goto('/login');
  await page.fill('input[type="email"]', 'dj@test.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Verify redirect to DJ Portal
  await expect(page).toHaveURL('/dj-portal');
  
  // Create event
  await page.click('text=Create Event');
  await page.fill('input[name="venueName"]', 'Test Venue');
  await page.fill('input[name="eventDate"]', '2025-12-01');
  await page.click('button:has-text("Create")');
  
  // Verify event created
  await expect(page.locator('text=Test Venue')).toBeVisible();
  
  // Upload tracklist (mock)
  const fileInput = await page.locator('input[type="file"]');
  await fileInput.setInputFiles('./test-data/tracks.csv');
  
  // Verify tracks loaded
  await expect(page.locator('text=1000 tracks loaded')).toBeVisible();
  
  // Accept request (when one comes in)
  // This would be triggered by another test or manual action
});
```

**TC-E2E-002: Upload and manage tracklist**
```typescript
test('DJ can upload and filter tracklist', async ({ page }) => {
  // ... login and create event
  
  // Upload tracklist
  await page.setInputFiles('input[type="file"]', './tracks.csv');
  await expect(page.locator('.track-count')).toContainText('5000');
  
  // Search tracks
  await page.fill('input[placeholder="Search tracks"]', 'Beyoncé');
  await expect(page.locator('.track-row')).toHaveCount(15);
  
  // Virtual scrolling check
  const trackList = page.locator('.track-list');
  await trackList.evaluate(el => el.scrollTop = 10000);
  await page.waitForTimeout(100);
  // Should still be smooth, no crashes
});
```

### 2. User Portal Critical Flows

**TC-E2E-003: Browse events and submit request**
```typescript
test('User can browse events and submit song request', async ({ page }) => {
  // Login as user
  await page.goto('/login');
  await page.fill('input[type="email"]', 'user@test.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Browse events
  await expect(page).toHaveURL('/user-portal');
  await expect(page.locator('.event-card')).toHaveCount(10);
  
  // Join event
  await page.click('.event-card:first-child');
  await page.click('text=Join Event');
  
  // Search for song
  await page.fill('input[placeholder="Search songs"]', 'Formation');
  await page.waitForSelector('.song-result');
  
  // Select song
  await page.click('.song-result:first-child');
  
  // Verify request confirmation
  await expect(page.locator('text=Request Confirmation')).toBeVisible();
  await expect(page.locator('text=Formation')).toBeVisible();
  await expect(page.locator('text=R50.00')).toBeVisible(); // BASIC tier
});
```

**TC-E2E-004: Track request in queue**
```typescript
test('User can track request position in queue', async ({ page }) => {
  // ... submit request
  
  // Verify queue tracker appears
  await expect(page.locator('.queue-tracker')).toBeVisible();
  await expect(page.locator('text=Position: #5')).toBeVisible();
  await expect(page.locator('text=~15 min')).toBeVisible();
  
  // Check for live updates (mock WebSocket)
  // Position should update when other requests are accepted/played
});
```

### 3. Payment Flow

**TC-E2E-005: Complete payment with Yoco**
```typescript
test('User can complete payment flow', async ({ page }) => {
  // ... submit request
  
  // Click pay now
  await page.click('text=Pay Now');
  
  // Yoco popup should appear (iframe)
  const yocoFrame = page.frameLocator('iframe[src*="yoco"]');
  await yocoFrame.locator('input[name="cardNumber"]').fill('4111111111111111');
  await yocoFrame.locator('input[name="expiryDate"]').fill('12/25');
  await yocoFrame.locator('input[name="cvv"]').fill('123');
  await yocoFrame.locator('button:has-text("Pay")').click();
  
  // Verify success
  await expect(page.locator('text=Payment Successful')).toBeVisible();
  await expect(page.locator('text=Your request has been submitted')).toBeVisible();
});
```

### 4. Request Lifecycle

**TC-E2E-006: Full request lifecycle**
```typescript
test('Request lifecycle from submission to playing', async ({ browser }) => {
  // Create two contexts (DJ and User)
  const djContext = await browser.newContext();
  const userContext = await browser.newContext();
  
  const djPage = await djContext.newPage();
  const userPage = await userContext.newPage();
  
  // DJ creates event
  await djPage.goto('/login');
  // ... DJ login and create event
  
  // User submits request
  await userPage.goto('/login');
  // ... User login, join event, submit request
  
  // DJ sees request in queue
  await djPage.waitForSelector('.request-card');
  await expect(djPage.locator('.request-card')).toContainText('Formation');
  
  // DJ accepts request
  await djPage.click('.request-card button:has-text("Accept")');
  
  // User sees acceptance notification
  await expect(userPage.locator('.notification')).toContainText('accepted');
  
  // DJ marks as playing
  await djPage.click('button:has-text("Mark Playing")');
  
  // User sees "Now Playing" status
  await expect(userPage.locator('.status')).toContainText('Now Playing');
  
  // Cleanup
  await djContext.close();
  await userContext.close();
});
```

### 5. E2E Checklist

- [ ] DJ can create event
- [ ] DJ can upload tracklist
- [ ] DJ can search/filter tracks
- [ ] DJ can view request queue
- [ ] DJ can accept requests
- [ ] DJ can veto requests
- [ ] DJ can mark songs as playing
- [ ] User can browse events
- [ ] User can join event
- [ ] User can search songs
- [ ] User can submit request
- [ ] User can complete payment
- [ ] User can track queue position
- [ ] User sees real-time updates
- [ ] Offline mode queues requests
- [ ] Requests sync when back online
- [ ] Theme switching persists
- [ ] Mobile navigation works
- [ ] All critical flows work on mobile

---

## 📊 Test Execution Tracking

### Test Run Template

```markdown
## Test Run: [Date]
**Tester:** [Name]
**Environment:** Production / Staging
**Build:** v1.0.0
**Devices:** iPhone 12, Samsung S21, Desktop Chrome

### Theme System Testing
- [ ] BeatByMe theme: PASS / FAIL
- [ ] Gold theme: PASS / FAIL
- [ ] Platinum theme: PASS / FAIL
- [ ] Theme switching: PASS / FAIL
- [ ] Color contrast: PASS / FAIL

### Mobile Testing
- [ ] Touch targets: PASS / FAIL
- [ ] Swipe gestures: PASS / FAIL
- [ ] Bottom navigation: PASS / FAIL
- [ ] Responsive orbital: PASS / FAIL
- [ ] No horizontal scroll: PASS / FAIL

### Performance
- [ ] Lighthouse Desktop: ___ / 100
- [ ] Lighthouse Mobile: ___ / 100
- [ ] Bundle size: ___ MB
- [ ] Virtual scrolling: PASS / FAIL

### Accessibility
- [ ] axe violations: ___
- [ ] Keyboard navigation: PASS / FAIL
- [ ] Screen reader: PASS / FAIL
- [ ] ARIA attributes: PASS / FAIL

### E2E Tests
- [ ] DJ Portal flows: PASS / FAIL
- [ ] User Portal flows: PASS / FAIL
- [ ] Payment flow: PASS / FAIL
- [ ] Request lifecycle: PASS / FAIL

### Issues Found
1. [Issue description]
2. [Issue description]

### Overall Status: PASS / FAIL / PARTIAL
```

---

## 🎯 Success Criteria

**Ready for Production When:**
- ✅ All 3 themes working across all components
- ✅ Color contrast meets WCAG AA
- ✅ Mobile tested on real iOS and Android devices
- ✅ Lighthouse Performance ≥90 (desktop), ≥80 (mobile)
- ✅ Lighthouse Accessibility ≥95
- ✅ Bundle size <1MB initial load
- ✅ Virtual scrolling handles 10,000+ items smoothly
- ✅ All touch targets ≥44x44px
- ✅ Keyboard navigation works completely
- ✅ Screen reader compatible
- ✅ Critical E2E flows passing
- ✅ Zero high-severity bugs

---

**Last Updated:** November 6, 2025  
**Test Lead:** [Name]  
**Next Review:** [Date]
