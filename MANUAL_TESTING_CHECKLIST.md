# BeatMatchMe Manual Testing Checklist

**Date:** November 6, 2025  
**Production Readiness:** 95.8% Complete  
**Status:** Ready for Manual Testing Phase

---

## 📋 Overview

This checklist covers the final manual testing requirements before production deployment. All automated testing is complete. The following tests require human verification with real devices and accessibility tools.

### Automated Testing Complete ✅
- ✅ Performance benchmarking (12.45s build, 1.12MB bundle)
- ✅ Accessibility audit automation (1 minor warning only)
- ✅ E2E test infrastructure (45+ tests created)
- ✅ Semantic HTML landmarks added

### Manual Testing Required ⏳
- ⏳ Theme color contrast testing (WCAG AA)
- ⏳ Real device testing (iOS/Android)
- ⏳ Screen reader accessibility testing

---

## 🎨 1. Theme Testing (2-3 hours)

### Objective
Verify all 3 themes meet WCAG AA color contrast requirements (4.5:1 for normal text, 3:1 for large text/UI).

### Tools Required
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools Color Picker
- BeatMatchMe app running locally

### Themes to Test
1. **BeatByMe Theme** (Default/BASIC tier)
2. **Gold Theme** (GOLD tier)
3. **Platinum Theme** (PLATINUM tier)

### Test Procedure

#### For Each Theme:

**Step 1: Activate Theme**
- [ ] Login to app
- [ ] Navigate to Settings → Theme Switcher
- [ ] Select theme to test
- [ ] Verify theme applies globally

**Step 2: Test Text Contrast**

Test these combinations:

| Element | Foreground | Background | Min Ratio | Test Result |
|---------|-----------|------------|-----------|-------------|
| Body text | Text color | Page bg | 4.5:1 | ⬜ Pass / ⬜ Fail |
| Headings | Heading color | Page bg | 4.5:1 | ⬜ Pass / ⬜ Fail |
| Button text | Button text | Button bg | 4.5:1 | ⬜ Pass / ⬜ Fail |
| Link text | Link color | Page bg | 4.5:1 | ⬜ Pass / ⬜ Fail |
| Placeholder | Placeholder | Input bg | 4.5:1 | ⬜ Pass / ⬜ Fail |

**Step 3: Test UI Component Contrast**

| Element | Foreground | Background | Min Ratio | Test Result |
|---------|-----------|------------|-----------|-------------|
| Primary button | Button bg | Page bg | 3:1 | ⬜ Pass / ⬜ Fail |
| Secondary button | Button bg | Page bg | 3:1 | ⬜ Pass / ⬜ Fail |
| Input border | Border | Input bg | 3:1 | ⬜ Pass / ⬜ Fail |
| Card border | Border | Card bg | 3:1 | ⬜ Pass / ⬜ Fail |
| Focus indicator | Indicator | Element bg | 3:1 | ⬜ Pass / ⬜ Fail |

**Step 4: Test Interactive States**

- [ ] Hover states have sufficient contrast
- [ ] Focus states are clearly visible
- [ ] Active/pressed states are distinguishable
- [ ] Disabled states are visually distinct

**Step 5: Document Issues**

For any failures:
```
Theme: [BeatByMe/Gold/Platinum]
Element: [Description]
Foreground: #XXXXXX
Background: #XXXXXX
Contrast Ratio: X.XX:1
Required: X.X:1
Status: FAIL
Fix: [Suggested color adjustment]
```

### BeatByMe Theme Results

#### Text Contrast
- [ ] Body text: _____ ratio (Required: 4.5:1)
- [ ] Headings: _____ ratio (Required: 4.5:1)
- [ ] Buttons: _____ ratio (Required: 4.5:1)
- [ ] Links: _____ ratio (Required: 4.5:1)

#### UI Components
- [ ] Primary button: _____ ratio (Required: 3:1)
- [ ] Secondary button: _____ ratio (Required: 3:1)
- [ ] Input borders: _____ ratio (Required: 3:1)
- [ ] Focus indicators: _____ ratio (Required: 3:1)

**Notes:**
```
[Add any issues or observations here]
```

### Gold Theme Results

#### Text Contrast
- [ ] Body text: _____ ratio (Required: 4.5:1)
- [ ] Headings: _____ ratio (Required: 4.5:1)
- [ ] Buttons: _____ ratio (Required: 4.5:1)
- [ ] Links: _____ ratio (Required: 4.5:1)

#### UI Components
- [ ] Primary button: _____ ratio (Required: 3:1)
- [ ] Secondary button: _____ ratio (Required: 3:1)
- [ ] Input borders: _____ ratio (Required: 3:1)
- [ ] Focus indicators: _____ ratio (Required: 3:1)

**Notes:**
```
[Add any issues or observations here]
```

### Platinum Theme Results

#### Text Contrast
- [ ] Body text: _____ ratio (Required: 4.5:1)
- [ ] Headings: _____ ratio (Required: 4.5:1)
- [ ] Buttons: _____ ratio (Required: 4.5:1)
- [ ] Links: _____ ratio (Required: 4.5:1)

#### UI Components
- [ ] Primary button: _____ ratio (Required: 3:1)
- [ ] Secondary button: _____ ratio (Required: 3:1)
- [ ] Input borders: _____ ratio (Required: 3:1)
- [ ] Focus indicators: _____ ratio (Required: 3:1)

**Notes:**
```
[Add any issues or observations here]
```

---

## 📱 2. Mobile Device Testing (4-6 hours)

### Objective
Test BeatMatchMe on real iOS and Android devices to verify mobile-specific functionality.

### Devices Required
- **iOS:** iPhone 12 or newer (iOS 15+)
- **Android:** Pixel 5 or equivalent (Android 11+)

### Test Procedure

### iOS Testing (iPhone 12+)

**Step 1: Initial Setup**
- [ ] Open Safari on iPhone
- [ ] Navigate to `http://[YOUR_IP]:5173`
- [ ] Login as DJ user
- [ ] Login as Audience user (separate session)

**Step 2: DJ Portal - Portrait Mode**

- [ ] **Event Creation**
  - [ ] Create new event button tappable (≥44x44px)
  - [ ] Event form inputs work with iOS keyboard
  - [ ] Date picker works properly
  - [ ] Event creates successfully

- [ ] **Tracklist Management**
  - [ ] Upload CSV button tappable
  - [ ] Virtual scrolling smooth (no lag with 1000+ tracks)
  - [ ] Track cards visible and readable
  - [ ] Search input works with iOS keyboard

- [ ] **Orbital Interface**
  - [ ] Orbital interface scaled correctly (280px container)
  - [ ] Request cards readable (14px minimum)
  - [ ] Touch targets on cards ≥44x44px
  - [ ] Smooth rotation animation

- [ ] **Request Management**
  - [ ] Request queue scrolls smoothly
  - [ ] Accept button tappable
  - [ ] Veto button tappable
  - [ ] "Mark Playing" button tappable
  - [ ] Confirmation panels slide in smoothly

- [ ] **Swipe Gestures**
  - [ ] Right-swipe dismisses Settings panel
  - [ ] Right-swipe dismisses QR Code panel
  - [ ] Right-swipe dismisses Accept Request panel
  - [ ] Swipe animations smooth (60 FPS)

**Step 3: DJ Portal - Landscape Mode**

- [ ] Layout adapts to landscape
- [ ] Orbital interface still functional
- [ ] No horizontal scrolling issues
- [ ] All buttons still tappable

**Step 4: User Portal - Portrait Mode**

- [ ] **Event Discovery**
  - [ ] Event cards display correctly
  - [ ] Search bar works with iOS keyboard
  - [ ] Event images lazy load properly
  - [ ] Join event button tappable

- [ ] **Song Request Flow**
  - [ ] Search for songs works
  - [ ] Song cards readable
  - [ ] Request button tappable (≥44x44px)
  - [ ] Price clearly visible (R50.00 for BASIC)
  - [ ] Confirmation dialog shows correctly

- [ ] **Queue Tracker**
  - [ ] Queue position visible
  - [ ] Wait time updates
  - [ ] Activity indicator animates smoothly
  - [ ] Real-time updates work

- [ ] **Mobile Bottom Navigation**
  - [ ] Navigation bar fixed at bottom
  - [ ] All 4 tabs tappable (≥44x44px)
  - [ ] Active tab highlighted
  - [ ] Navigation switches views correctly
  - [ ] Icons clearly visible

- [ ] **Theme Switching**
  - [ ] Theme switcher accessible
  - [ ] Themes apply immediately
  - [ ] Theme persists after page reload
  - [ ] No visual glitches during switch

**Step 5: User Portal - Landscape Mode**

- [ ] Bottom navigation adapts
- [ ] Content layout adapts
- [ ] No usability issues

**Step 6: Offline Support (iOS)**

- [ ] Enable Airplane Mode
- [ ] Submit song request
- [ ] See "offline" indicator
- [ ] Request queued locally
- [ ] Disable Airplane Mode
- [ ] Request syncs automatically
- [ ] Confirmation shown

**Step 7: Performance (iOS)**

- [ ] Page loads in <3 seconds
- [ ] Lazy loading works (images load as you scroll)
- [ ] No jank during scrolling
- [ ] Animations smooth (60 FPS)
- [ ] Virtual scrolling handles 1000+ items

**iOS Testing Notes:**
```
Device: [Model and iOS version]
Issues Found:
- [List any issues]

Performance:
- Page load time: _____s
- Scroll smoothness: ⬜ Excellent ⬜ Good ⬜ Poor
- Animation smoothness: ⬜ Excellent ⬜ Good ⬜ Poor

Photos/Screenshots:
- [Attach screenshots of any issues]
```

---

### Android Testing (Pixel 5+)

**Step 1: Initial Setup**
- [ ] Open Chrome on Android
- [ ] Navigate to `http://[YOUR_IP]:5173`
- [ ] Login as DJ user
- [ ] Login as Audience user (separate session)

**Step 2: DJ Portal - Portrait Mode**

- [ ] **Event Creation**
  - [ ] Create new event button tappable (≥44x44px)
  - [ ] Event form inputs work with Android keyboard
  - [ ] Date picker works properly
  - [ ] Event creates successfully

- [ ] **Tracklist Management**
  - [ ] Upload CSV button tappable
  - [ ] Virtual scrolling smooth (no lag with 1000+ tracks)
  - [ ] Track cards visible and readable
  - [ ] Search input works with Android keyboard

- [ ] **Orbital Interface**
  - [ ] Orbital interface scaled correctly (280px container)
  - [ ] Request cards readable (14px minimum)
  - [ ] Touch targets on cards ≥44x44px
  - [ ] Smooth rotation animation

- [ ] **Request Management**
  - [ ] Request queue scrolls smoothly
  - [ ] Accept button tappable
  - [ ] Veto button tappable
  - [ ] "Mark Playing" button tappable
  - [ ] Confirmation panels slide in smoothly

- [ ] **Swipe Gestures**
  - [ ] Right-swipe dismisses Settings panel
  - [ ] Right-swipe dismisses QR Code panel
  - [ ] Right-swipe dismisses Accept Request panel
  - [ ] Swipe animations smooth (60 FPS)

**Step 3: DJ Portal - Landscape Mode**

- [ ] Layout adapts to landscape
- [ ] Orbital interface still functional
- [ ] No horizontal scrolling issues
- [ ] All buttons still tappable

**Step 4: User Portal - Portrait Mode**

- [ ] **Event Discovery**
  - [ ] Event cards display correctly
  - [ ] Search bar works with Android keyboard
  - [ ] Event images lazy load properly
  - [ ] Join event button tappable

- [ ] **Song Request Flow**
  - [ ] Search for songs works
  - [ ] Song cards readable
  - [ ] Request button tappable (≥44x44px)
  - [ ] Price clearly visible (R50.00 for BASIC)
  - [ ] Confirmation dialog shows correctly

- [ ] **Queue Tracker**
  - [ ] Queue position visible
  - [ ] Wait time updates
  - [ ] Activity indicator animates smoothly
  - [ ] Real-time updates work

- [ ] **Mobile Bottom Navigation**
  - [ ] Navigation bar fixed at bottom
  - [ ] All 4 tabs tappable (≥44x44px)
  - [ ] Active tab highlighted
  - [ ] Navigation switches views correctly
  - [ ] Icons clearly visible

- [ ] **Theme Switching**
  - [ ] Theme switcher accessible
  - [ ] Themes apply immediately
  - [ ] Theme persists after page reload
  - [ ] No visual glitches during switch

**Step 5: User Portal - Landscape Mode**

- [ ] Bottom navigation adapts
- [ ] Content layout adapts
- [ ] No usability issues

**Step 6: Offline Support (Android)**

- [ ] Enable Airplane Mode
- [ ] Submit song request
- [ ] See "offline" indicator
- [ ] Request queued locally
- [ ] Disable Airplane Mode
- [ ] Request syncs automatically
- [ ] Confirmation shown

**Step 7: Performance (Android)**

- [ ] Page loads in <3 seconds
- [ ] Lazy loading works (images load as you scroll)
- [ ] No jank during scrolling
- [ ] Animations smooth (60 FPS)
- [ ] Virtual scrolling handles 1000+ items

**Android Testing Notes:**
```
Device: [Model and Android version]
Issues Found:
- [List any issues]

Performance:
- Page load time: _____s
- Scroll smoothness: ⬜ Excellent ⬜ Good ⬜ Poor
- Animation smoothness: ⬜ Excellent ⬜ Good ⬜ Poor

Photos/Screenshots:
- [Attach screenshots of any issues]
```

---

## ♿ 3. Accessibility Testing (3-4 hours)

### Objective
Test BeatMatchMe with screen readers and keyboard-only navigation to ensure accessibility for users with disabilities.

### Tools Required
- **Windows:** NVDA (free screen reader)
- **Mac:** VoiceOver (built-in)
- **iOS:** VoiceOver (Settings → Accessibility)

---

### Windows - NVDA Testing

**Step 1: Setup**
- [ ] Download and install [NVDA](https://www.nvaccess.org/download/)
- [ ] Launch NVDA (Ctrl+Alt+N)
- [ ] Open Chrome/Edge
- [ ] Navigate to BeatMatchMe

**Step 2: Navigation Testing**

- [ ] **Landmarks**
  - [ ] NVDA announces "banner" region (header)
  - [ ] NVDA announces "main" region
  - [ ] NVDA announces page title
  - [ ] Can navigate between landmarks (D key)

- [ ] **Headings**
  - [ ] NVDA announces heading levels (H key)
  - [ ] Heading hierarchy makes sense (H1 → H2 → H3)
  - [ ] Can navigate by heading

- [ ] **Forms**
  - [ ] NVDA announces input labels
  - [ ] NVDA announces input types (text, email, etc.)
  - [ ] NVDA announces required fields
  - [ ] NVDA announces error messages
  - [ ] Form validation messages are read aloud

- [ ] **Buttons**
  - [ ] NVDA announces button labels
  - [ ] NVDA announces button states (pressed, expanded, etc.)
  - [ ] Can activate buttons with Enter/Space

- [ ] **Links**
  - [ ] NVDA announces link text
  - [ ] Link purpose is clear from text alone
  - [ ] Can navigate links (K key)

**Step 3: Interactive Elements**

- [ ] **Orbital Interface**
  - [ ] Request cards announced
  - [ ] Can navigate to cards with Tab
  - [ ] Accept/Veto buttons clearly labeled

- [ ] **Slide-out Panels**
  - [ ] Panel opening announced
  - [ ] Panel contents accessible
  - [ ] Close button clearly labeled
  - [ ] ESC key closes panel

- [ ] **Theme Switcher**
  - [ ] Current theme announced
  - [ ] Can change theme with keyboard
  - [ ] Theme change confirmed

**Step 4: Content Reading**

- [ ] Browse mode works (arrow keys)
- [ ] All content readable
- [ ] No "clickable" without labels
- [ ] Images have alt text or aria-hidden

**NVDA Testing Notes:**
```
NVDA Version: _____
Browser: _____
Issues Found:
- [List any issues]

Critical Issues (blocks usage):
- [List any blockers]

Minor Issues (reduces usability):
- [List minor issues]
```

---

### Mac - VoiceOver Testing

**Step 1: Setup**
- [ ] Enable VoiceOver (Cmd+F5)
- [ ] Open Safari
- [ ] Navigate to BeatMatchMe

**Step 2: Navigation Testing**

- [ ] **Landmarks**
  - [ ] VoiceOver announces "banner" landmark
  - [ ] VoiceOver announces "main" landmark
  - [ ] Can navigate landmarks (Cmd+Option+U, then Landmarks)

- [ ] **Headings**
  - [ ] VoiceOver announces headings correctly
  - [ ] Can navigate headings (Cmd+Option+H)
  - [ ] Heading hierarchy logical

- [ ] **Forms**
  - [ ] VoiceOver announces labels
  - [ ] VoiceOver announces input types
  - [ ] VoiceOver announces validation errors
  - [ ] Can fill out forms with VoiceOver

- [ ] **Buttons**
  - [ ] VoiceOver announces button text
  - [ ] VoiceOver announces button state
  - [ ] Can activate with VO+Space

- [ ] **Links**
  - [ ] VoiceOver announces link text
  - [ ] Link purpose clear
  - [ ] Can navigate links

**Step 3: Interactive Elements**

- [ ] Orbital interface accessible
- [ ] Slide-out panels accessible
- [ ] Theme switcher accessible
- [ ] All controls operable

**VoiceOver Testing Notes:**
```
macOS Version: _____
Issues Found:
- [List any issues]
```

---

### iOS - VoiceOver Testing

**Step 1: Setup**
- [ ] Settings → Accessibility → VoiceOver → On
- [ ] Or triple-click side button (if configured)
- [ ] Open Safari
- [ ] Navigate to BeatMatchMe

**Step 2: Navigation Testing**

- [ ] **Touch Exploration**
  - [ ] Swipe right navigates elements
  - [ ] VoiceOver announces element type
  - [ ] VoiceOver announces element label
  - [ ] Double-tap activates elements

- [ ] **Headings Navigation**
  - [ ] Rotor set to Headings
  - [ ] Can swipe down to jump between headings
  - [ ] Headings announced correctly

- [ ] **Forms**
  - [ ] Input labels announced
  - [ ] Can type with VoiceOver keyboard
  - [ ] Validation errors announced

- [ ] **Buttons**
  - [ ] Button labels clear
  - [ ] Button states announced
  - [ ] Double-tap activates

**Step 3: Mobile Specific**

- [ ] Bottom navigation accessible
- [ ] Swipe gestures don't conflict with VoiceOver
- [ ] Song request flow works with VoiceOver
- [ ] Queue tracker information announced

**iOS VoiceOver Testing Notes:**
```
iOS Version: _____
Device: _____
Issues Found:
- [List any issues]
```

---

### Keyboard-Only Navigation Testing

**Step 1: Setup**
- [ ] Disable mouse/trackpad
- [ ] Open browser with keyboard only (Alt+Tab)
- [ ] Navigate to BeatMatchMe

**Step 2: Navigation Testing**

- [ ] **Tab Order**
  - [ ] Tab key navigates forward logically
  - [ ] Shift+Tab navigates backward
  - [ ] Tab order follows visual layout
  - [ ] No keyboard traps (can always escape)

- [ ] **Focus Indicators**
  - [ ] Focus visible on all interactive elements
  - [ ] Focus indicator has ≥3:1 contrast
  - [ ] Focus doesn't disappear

- [ ] **Keyboard Shortcuts**
  - [ ] ESC closes panels/dialogs
  - [ ] Enter submits forms
  - [ ] Space activates buttons
  - [ ] Arrow keys navigate where appropriate

**Step 3: Complete User Flows**

- [ ] **DJ Portal**
  - [ ] Login with keyboard only
  - [ ] Create event with keyboard only
  - [ ] Accept request with keyboard only
  - [ ] Navigate all features with keyboard only

- [ ] **User Portal**
  - [ ] Login with keyboard only
  - [ ] Join event with keyboard only
  - [ ] Submit request with keyboard only
  - [ ] Navigate all features with keyboard only

**Keyboard Testing Notes:**
```
Browser: _____
Issues Found:
- [List any issues]

Keyboard Traps (critical):
- [List any areas where keyboard gets stuck]

Missing Focus Indicators:
- [List elements with no visible focus]
```

---

## 📊 Testing Summary

### Theme Testing Results
- [ ] BeatByMe theme: ⬜ PASS ⬜ FAIL
- [ ] Gold theme: ⬜ PASS ⬜ FAIL
- [ ] Platinum theme: ⬜ PASS ⬜ FAIL

**Total contrast issues found:** _____

### Mobile Testing Results
- [ ] iOS testing: ⬜ PASS ⬜ FAIL
- [ ] Android testing: ⬜ PASS ⬜ FAIL

**Total mobile issues found:** _____

### Accessibility Testing Results
- [ ] NVDA testing: ⬜ PASS ⬜ FAIL
- [ ] VoiceOver (Mac) testing: ⬜ PASS ⬜ FAIL
- [ ] VoiceOver (iOS) testing: ⬜ PASS ⬜ FAIL
- [ ] Keyboard-only testing: ⬜ PASS ⬜ FAIL

**Total accessibility issues found:** _____

---

## ✅ Production Readiness Sign-Off

**All tests completed:** ⬜ YES ⬜ NO

**Critical issues found:** ⬜ YES ⬜ NO  
_If yes, list below:_
```
[Critical issues that block production]
```

**Minor issues found:** ⬜ YES ⬜ NO  
_If yes, list below (can be fixed post-launch):_
```
[Minor issues that can be addressed later]
```

**Tested by:** _____________________  
**Date completed:** _____________________  
**Approved for production:** ⬜ YES ⬜ NO

**Approver:** _____________________  
**Date approved:** _____________________

---

## 📝 Next Steps After Testing

### If Tests Pass
1. Fix any minor issues found
2. Update documentation with test results
3. Create production deployment plan
4. Schedule production deployment

### If Tests Fail
1. Document all failures
2. Prioritize fixes (critical vs. minor)
3. Assign fixes to development team
4. Re-test after fixes
5. Repeat until all tests pass

---

**Generated:** November 6, 2025  
**Version:** 1.0  
**Maintained by:** BeatMatchMe QA Team
