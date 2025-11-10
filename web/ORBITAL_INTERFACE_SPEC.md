# Orbital Interface - Complete Feature Specification

## 🎯 Vision
A **revolutionary, gesture-first mobile DJ portal** that eliminates traditional navigation bars and sidebars. Instead, it uses **floating controls, swipe gestures, and orbital visualizations** to create an immersive, space-like interface where DJs manage their sets.

---

## 📱 Core Components

### 1. **GestureHandler** - Touch Navigation System
The foundation of the entire interface - handles all swipe gestures for navigation between views.

#### Required Features:
- ✅ **Touch Event Handling**
  - Capture touch start, move, and end events
  - Prevent default browser behaviors (scroll, zoom, refresh)
  - Support multi-touch (but only track primary finger)
  
- ✅ **Swipe Detection**
  - Detect 4 directions: Up, Down, Left, Right
  - Calculate swipe velocity, distance, and direction
  - Thresholds: distance 100px, velocity 0.3px/ms, min time 200ms
  - Distinguish between tap and swipe

- ✅ **Peek Preview Animation**
  - Show preview of next page sliding in from edge as user swipes
  - Current page moves 1:1 with finger
  - Next page slides from ±100% toward 0% (0.3x multiplier)
  - Opacity fades in over 150px swipe distance
  - Smooth snap-back on release if threshold not met
  
- ✅ **Visual Feedback**
  - Directional arrow (←→↑↓) center-screen during swipe
  - White rounded background with backdrop blur
  - fadeInScale animation on appearance
  
- 🔧 **Needs Addition**
  - Haptic feedback on iOS/Android when threshold reached
  - Spring physics on release (not just CSS cubic-bezier)
  - Progress indicator showing proximity to threshold

- ✅ **Performance Requirements**
  - Maintain 60fps during swipe
  - Memoized components (React.memo)
  - Hardware-accelerated transforms (translateX/Y)
  - No layout thrashing

#### Enhancements Needed:
- Proper peek content design (not just Music icons + text)
- Spring physics for snap-back animation
- Haptic feedback API integration
- Real device testing and tuning
- Remove all debug code (console.logs, red backgrounds)

---

### 2. **FloatingActionBubble** - Main Menu Control
A draggable floating button that opens a radial menu for quick actions.

#### Current Implementation:
- ✅ Draggable on desktop (mouse events)
- ✅ Radial menu that expands in circular pattern
- ✅ Smooth animations and hover effects
- ✅ Memoized for performance

#### Needs Enhancement:
- 🔧 Touch event handlers (currently mouse-only)
- 🔧 Snap-to-edge on release
- 🔧 Persist position (localStorage)
- 🔧 Context-aware menu options per view
- 🔧 Notification badges (new requests, earnings)
- 🔧 Keyboard navigation
- 🔧 ARIA labels and roles
- 🔧 44x44px minimum touch targets

---

### 3. **StatusArc** - Persistent Status Display
Top and bottom arcs showing system status, with floating counters for key metrics.

#### Current Implementation:
- ✅ Gradient arcs with glow effects
- ✅ Request counter (number of songs in queue)
- ✅ Revenue counter (money earned)
- ✅ Animated pulses and glows
- ✅ Memoized to prevent unnecessary re-renders

#### Needs Enhancement:
- 🔧 Smooth number animations (not instant jumps)
- 🔧 Celebration effects at milestones (100 requests, R1000 earned)
- 🔧 Status color changes (green = good, red = issues)
- 🔧 Active listeners count
- 🔧 Current set duration (elapsed time)
- 🔧 Next request ETA
- 🔧 Connection quality indicator
- 🔧 Tap counter for detailed breakdown
- 🔧 Expandable tooltips
- 🔧 Responsive stacking on small screens

---

### 4. **CircularQueueVisualizer** - Song Request Queue Display
The centerpiece - an orbital visualization of the next 5 song requests.

#### Current Implementation:
- ✅ Circular orbital layout with requests rotating
- ✅ Center music icon
- ✅ Swipe-to-accept/veto gestures on individual requests
- ✅ Color-coded by request type (standard, spotlight, dedication)
- ✅ Responsive sizing for mobile
- ✅ Position badges (#1, #2, etc.)

#### Needs Enhancement:
- 🔧 Smooth animate-in when request appears
- 🔧 Spring-based rotation when request removed
- 🔧 Parallax effect (closer = larger)
- 🔧 Album art thumbnails (not just music icon)
- 🔧 User avatar for requester
- 🔧 Price badge for paid requests
- 🔧 Dedication message preview
- 🔧 Premium user badge (VIP, Gold tier)
- 🔧 Long press for options menu
- 🔧 Drag to reorder requests
- 🔧 Pinch to zoom orbital view
- 🔧 Auto-rotation carousel mode
- 🔧 Pause rotation on touch
- 🔧 Variable rotation speed by queue length
- 🔧 Pulse brightness as play time approaches
- 🔧 Glow intensity by priority
- 🔧 Particle effects for premium requests
- 🔧 Trailing effect as requests orbit
- 🔧 Spotlight beam for spotlight requests

---

## 🎨 Design System Requirements

### Colors & Themes
- **Dynamic theme support** - Already implemented via ThemeContext
- **Request types have distinct colors:**
  - Standard: Blue (#3B82F6)
  - Spotlight: Yellow/Gold (#EAB308)
  - Dedication: Pink/Rose (#EC4899)
- **Status colors:**
  - Success/Accepted: Green (#10B981)
  - Rejected/Veto: Red (#EF4444)
  - Warning: Orange (#F59E0B)
  - Info: Cyan (#06B6D4)

### Typography
- **System font stack** for performance
- **Tabular numbers** for counters (prevent layout shift)
- **Font sizes:**
  - Mobile: 14-18px base
  - Desktop: 16-20px base
  - Counters: 24-32px (bold)

### Spacing & Sizing
- **Touch targets:** Minimum 44x44px (Apple HIG)
- **Safe areas:** Respect notches, home indicators
- **Responsive breakpoints:**
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

---

## 🚀 Performance Targets

### Critical Metrics
- **Initial Load:** < 2 seconds
- **Time to Interactive:** < 3 seconds
- **Animation FPS:** 60fps (no drops below 50fps)
- **Touch Response:** < 100ms from touch to visual feedback
- **Memory Usage:** < 100MB for interface components

### Optimization Strategies
- ✅ React.memo on all components
- 🔧 useMemo for expensive calculations
- 🔧 useCallback for event handlers
- 🔧 Lazy load heavy animations
- 🔧 Virtualize long lists (if queue > 50 items)
- 🔧 Use CSS transforms (not left/top/width/height)
- 🔧 Debounce/throttle scroll/resize handlers
- 🔧 Web Workers for heavy calculations

---

## 📱 Mobile-First Features

### Touch Gestures
- **Swipe Navigation:**
  - Left/Right: Switch between main views (Queue, Analytics, Settings)
  - Up: Open full queue list
  - Down: Minimize/close modals
  
- **Orbital Interactions:**
  - Tap request: View details
  - Swipe up on request: Accept
  - Swipe down on request: Veto
  - Long press: Options menu
  - Drag: Reorder queue

### Mobile Optimizations
- **Reduce animations** on low-end devices
- **Offline support** with service workers
- **Install as PWA** with app-like experience
- **Background updates** when DJ portal is inactive
- **Battery-efficient polling** (not constant WebSocket)

---

## 🔧 Technical Stack Recommendations

### Core Libraries (Current)
- ✅ React 18+ (with concurrent features)
- ✅ TypeScript (full type safety)
- ✅ Tailwind CSS (utility-first styling)
- ✅ Lucide React (icon library)

### Current Stack
- **CSS Transforms** - translateX/Y with cubic-bezier(0.23, 1, 0.32, 1)
- **CSS Transitions** - 400ms for page transitions
- **CSS Keyframes** - fadeInScale for arrow appearance
- **React State** - Manual touch tracking with useState

### Future Enhancements
- Spring physics library (Framer Motion or React Spring)
- Number counting animations (react-countup)
- Celebration effects (confetti)
- Haptic feedback (Navigator.vibrate API)

---

## 🎯 Implementation Phases

### Phase 1: Gesture System ✅ MOSTLY COMPLETE
- ✅ Implement peek preview animation
- ✅ Fix transform calculations (all 4 directions)
- ✅ Add directional arrow indicator
- 🔧 Remove debug code (console.logs, red backgrounds)
- 🔧 Design proper peek content (not Music icons)
- 🔧 Test on real mobile devices
- 🔧 Add haptic feedback
- 🔧 Spring physics on release
- 🔧 60fps performance guarantee

### Phase 2: Floating Bubble (Mobile Support)
- Touch event handlers
- Snap-to-edge behavior
- Context-aware menus
- Keyboard accessibility
- Notification badges

### Phase 3: Status Arc (Real-time Animations)
- Animated number counting
- Additional metrics (listeners, duration, ETA)
- Interactive tooltips
- Celebration effects at milestones
- Status color changes

### Phase 4: Orbital Visualizer (Polish)
- Album art and avatars
- Smooth rotation animations
- Drag-to-reorder
- Particle effects for premium requests
- Auto-rotation carousel mode
- Parallax and glow effects

### Phase 5: Final Polish
- Full accessibility audit
- Performance profiling
- Bundle size optimization
- Cross-browser testing
- Real device testing (iOS, Android)

---

## ✅ Success Criteria

1. Gestures work flawlessly on iOS and Android
2. Animations run at 60fps on mid-range devices
3. Peek previews are smooth and intuitive
4. Touch targets meet 44x44px minimum
5. Bundle size < 500kb gzipped
6. Works offline with service workers
7. Passes WCAG 2.1 AA accessibility
8. DJs can navigate without tutorial

---

**Last Updated:** November 9, 2025  
**Status:** Phase 1 - Gesture System (90% Complete)  
**Next:** Remove debug code, test on real devices, add haptic feedback
