# BeatMatchMe Migration Guide

## 📋 Overview

This guide covers migrating BeatMatchMe from the legacy architecture (hardcoded colors, global CSS, manual modals) to the new modern architecture (theme system, CSS Modules, slide-out panels, performance optimizations).

**Migration Scope:**
- Theme system adoption
- CSS Modules conversion
- Modal → Panel conversions
- Performance optimizations
- Mobile improvements

**Estimated Timeline:** 2-4 weeks (depending on team size)

---

## 🎯 Phase 1: Theme System Migration (Week 1)

### Step 1: Remove Hardcoded Colors

**Before:**
```typescript
// ❌ Hardcoded purple everywhere
<div className="bg-purple-600 text-white">
  <button className="bg-pink-500 hover:bg-pink-600">
    Submit Request
  </button>
</div>
```

**After:**
```typescript
// ✅ Theme-aware classes
import { useThemeClasses } from '@/contexts/ThemeContext';

function MyComponent() {
  const theme = useThemeClasses();
  
  return (
    <div className={theme.bgPrimary}>
      <button className={theme.button.primary}>
        Submit Request
      </button>
    </div>
  );
}
```

### Step 2: Migration Utility

Use the automated migration tool:

```bash
# Run migration script
node web/src/utils/themeClassMigration.ts --component DJLibrary.tsx

# Output:
# ✅ Replaced 15 hardcoded colors
# ✅ Added useThemeClasses import
# ⚠️ Manual review needed for: conditional colors (lines 45, 67)
```

**Manual Review Areas:**
- Conditional colors based on state
- Dynamic opacity values
- CSS-in-JS or inline styles
- Third-party component colors

### Step 3: Common Replacements

| Legacy Class | Theme Class | Notes |
|--------------|-------------|-------|
| `bg-purple-600` | `theme.bgPrimary` | Primary background |
| `text-purple-600` | `theme.textPrimary` | Primary text |
| `bg-pink-500` | `theme.accent` | Accent color |
| `border-purple-400` | `theme.border` | Borders |
| `hover:bg-purple-700` | `theme.button.primary` | Buttons |
| `bg-white` | `theme.bgCard` | Card backgrounds |
| `bg-gray-900` | `theme.bgPage` | Page backgrounds |

### Step 4: Tier-Based Colors

**Before:**
```typescript
// ❌ Hardcoded tier colors
const tierColor = tier === 'gold' ? 'yellow-500' : 
                 tier === 'platinum' ? 'gray-300' : 'purple-600';
return <div className={`bg-${tierColor}`}>...</div>;
```

**After:**
```typescript
// ✅ Theme-aware tier colors
import { getTierClasses } from '@/utils/tierUtils';

const tierClasses = getTierClasses(tier);
return <div className={tierClasses.bg}>...</div>;
```

### Step 5: Verification

**Checklist:**
- [ ] All hardcoded `purple-*` classes removed
- [ ] All hardcoded `pink-*` classes removed
- [ ] Component imports `useThemeClasses`
- [ ] Theme switcher shows all colors correctly
- [ ] No console warnings about colors

**Test Cases:**
```typescript
// Test all 3 themes
describe('MyComponent theming', () => {
  it('renders with BeatByMe theme', () => {
    render(
      <ThemeProvider value="beatbyme">
        <MyComponent />
      </ThemeProvider>
    );
    expect(screen.getByRole('button')).toHaveClass('bg-purple-600');
  });

  it('renders with Gold theme', () => {
    render(
      <ThemeProvider value="gold">
        <MyComponent />
      </ThemeProvider>
    );
    expect(screen.getByRole('button')).toHaveClass('bg-amber-500');
  });
});
```

---

## 🎨 Phase 2: CSS Modules Migration (Week 2)

### Step 1: Create CSS Module

**Create `MyComponent.module.css`:**
```css
/* Component-specific styles */
.container {
  position: relative;
  padding: 1rem;
  border-radius: 0.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
}

.content {
  padding: 1rem;
}

/* Responsive */
@media (max-width: 640px) {
  .container {
    padding: 0.5rem;
  }
  
  .title {
    font-size: 1.25rem;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.container {
  animation: fadeIn 0.3s ease-out;
}
```

### Step 2: Convert Component

**Before:**
```typescript
// ❌ Tailwind classes everywhere
function MyComponent() {
  return (
    <div className="relative p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Title</h2>
      </div>
      <div className="p-4">
        Content
      </div>
    </div>
  );
}
```

**After:**
```typescript
// ✅ CSS Modules with theme
import styles from './MyComponent.module.css';
import { useThemeClasses } from '@/contexts/ThemeContext';

function MyComponent() {
  const theme = useThemeClasses();
  
  return (
    <div className={`${styles.container} ${theme.bgCard}`}>
      <div className={styles.header}>
        <h2 className={`${styles.title} ${theme.textPrimary}`}>
          Title
        </h2>
      </div>
      <div className={styles.content}>
        Content
      </div>
    </div>
  );
}
```

### Step 3: Keep Tailwind for Utilities

**Hybrid approach (recommended):**
```typescript
// ✅ CSS Modules for structure, Tailwind for utilities
<div className={`${styles.card} ${theme.bgCard} shadow-lg`}>
  <h3 className={`${styles.title} ${theme.textPrimary} font-bold`}>
    Title
  </h3>
  <p className={`${theme.textSecondary} text-sm mt-2`}>
    Description
  </p>
</div>
```

**When to use each:**
- **CSS Modules:** Component structure, animations, complex selectors
- **Tailwind:** Spacing, sizing, basic utilities, responsive modifiers
- **Theme classes:** Colors, shadows, borders

### Step 4: Migration Checklist

**Per Component:**
- [ ] Create `.module.css` file
- [ ] Move complex className strings to CSS
- [ ] Import styles
- [ ] Replace `className="..."` with `className={styles.*}`
- [ ] Combine with theme classes
- [ ] Keep Tailwind utilities
- [ ] Test responsiveness
- [ ] Verify animations

---

## 🚪 Phase 3: Modal → Panel Conversion (Week 2-3)

### Step 1: Identify Modal Usage

**Find all modals:**
```bash
# Search for modal components
grep -r "react-modal\|Modal\|modal" web/src/components/
```

**Common patterns:**
- Settings modal
- QR code display modal
- Event creator modal
- Request confirmation modal

### Step 2: Convert to Slide-Out Panel

**Before (Modal):**
```typescript
// ❌ Old modal approach
import Modal from 'react-modal';

function SettingsModal({ isOpen, onClose }: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content"
    >
      <div>
        <h2>Settings</h2>
        <button onClick={onClose}>Close</button>
        {/* Settings form */}
      </div>
    </Modal>
  );
}
```

**After (Panel):**
```typescript
// ✅ New panel approach
import { useSwipeToDismiss } from '@/hooks/useSwipeToDismiss';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import styles from './SettingsPanel.module.css';

function SettingsPanel({ isOpen, onClose }: Props) {
  const { ref, style } = useSwipeToDismiss(onClose);
  useEscapeKey(onClose);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={styles.backdrop}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        ref={ref}
        style={style}
        className={styles.panel}
      >
        <div className={styles.header}>
          <h2>Settings</h2>
          <button onClick={onClose} aria-label="Close">×</button>
        </div>
        
        <div className={styles.content}>
          {/* Settings form */}
        </div>
      </div>
    </>
  );
}
```

**Panel CSS:**
```css
/* SettingsPanel.module.css */
.backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 40;
  animation: fadeIn 0.2s ease-out;
}

.panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 400px;
  background-color: white;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
  z-index: 50;
  animation: slideInRight 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Step 3: Add Gestures

**Swipe to dismiss:**
```typescript
// hooks/useSwipeToDismiss.ts
import { useRef, useState, useEffect } from 'react';

export const useSwipeToDismiss = (onDismiss: () => void, threshold = 100) => {
  const ref = useRef<HTMLDivElement>(null);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      setStartX(e.touches[0].clientX);
      setIsDragging(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      setCurrentX(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
      if (currentX - startX > threshold) {
        onDismiss();
      }
      setIsDragging(false);
      setStartX(0);
      setCurrentX(0);
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, startX, currentX, threshold, onDismiss]);

  const style = isDragging && currentX > startX
    ? { transform: `translateX(${currentX - startX}px)` }
    : {};

  return { ref, style };
};
```

**ESC key to close:**
```typescript
// hooks/useEscapeKey.ts
import { useEffect } from 'react';

export const useEscapeKey = (callback: () => void) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') callback();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [callback]);
};
```

### Step 4: Migration Checklist

**Per Modal:**
- [ ] Create panel component
- [ ] Create `.module.css` with animations
- [ ] Add `useSwipeToDismiss` hook
- [ ] Add `useEscapeKey` hook
- [ ] Add backdrop with click-to-close
- [ ] Update parent component
- [ ] Remove old modal code
- [ ] Test on mobile (swipe)
- [ ] Test on desktop (ESC key)

---

## ⚡ Phase 4: Performance Optimizations (Week 3)

### Step 1: Install Dependencies

```bash
npm install --save react-window react-lazy-load-image-component
npm install --save-dev @types/react-window @types/react-lazy-load-image-component
```

### Step 2: Add Virtual Scrolling

**Before (renders 1000+ DOM nodes):**
```typescript
// ❌ Renders all tracks at once
function DJLibrary({ tracks }: Props) {
  return (
    <div className="track-list">
      {tracks.map(track => (
        <TrackCard key={track.id} track={track} />
      ))}
    </div>
  );
}
```

**After (renders only visible items):**
```typescript
// ✅ Virtual scrolling with react-window
import { FixedSizeList as List } from 'react-window';

function DJLibrary({ tracks }: Props) {
  const Row = ({ index, style }: any) => (
    <div style={style}>
      <TrackCard track={tracks[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={tracks.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

### Step 3: Add Lazy Loading for Images

**Before:**
```typescript
// ❌ All images load immediately
<img 
  src={track.albumArt} 
  alt={track.title}
  className="w-16 h-16"
/>
```

**After:**
```typescript
// ✅ Progressive image loading
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

<LazyLoadImage
  src={track.albumArt}
  alt={track.title}
  className="w-16 h-16"
  effect="blur"
  width={64}
  height={64}
  placeholderSrc="/placeholder.svg"
/>
```

### Step 4: Add Code Splitting

**Before:**
```typescript
// ❌ All portals in main bundle
import { DJPortalOrbital } from './pages/DJPortalOrbital';
import { UserPortalInnovative } from './pages/UserPortalInnovative';
```

**After:**
```typescript
// ✅ Route-based code splitting
import { lazy, Suspense } from 'react';

const DJPortal = lazy(() => 
  import('./pages/DJPortalOrbital').then(m => ({ default: m.DJPortalOrbital }))
);
const UserPortal = lazy(() =>
  import('./pages/UserPortalInnovative').then(m => ({ default: m.UserPortalInnovative }))
);

// In routes
<Route 
  path="/dj-portal" 
  element={
    <Suspense fallback={<LoadingScreen message="Loading DJ Portal..." />}>
      <DJPortal />
    </Suspense>
  } 
/>
```

### Step 5: Add Component Memoization

**Before:**
```typescript
// ❌ Re-renders on every parent update
function TrackCard({ track, onSelect }: Props) {
  return (
    <div onClick={() => onSelect(track)}>
      {track.title} - {track.artist}
    </div>
  );
}
```

**After:**
```typescript
// ✅ Only re-renders when props change
import { memo } from 'react';

export const TrackCard = memo(function TrackCard({ track, onSelect }: Props) {
  return (
    <div onClick={() => onSelect(track)}>
      {track.title} - {track.artist}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.track.id === nextProps.track.id;
});
```

### Step 6: Performance Checklist

- [ ] Virtual scrolling on large lists (>100 items)
- [ ] Lazy load all images
- [ ] Route-based code splitting
- [ ] Component memoization on pure components
- [ ] Remove unnecessary re-renders
- [ ] Optimize bundle size
- [ ] Test with Lighthouse (score >90)

---

## 📱 Phase 5: Mobile Improvements (Week 4)

### Step 1: Responsive Breakpoints

**Audit and standardize:**
```typescript
// ❌ Inconsistent breakpoints
<div className="w-full md:w-1/2 lg:w-1/3">
<div className="text-sm sm:text-base lg:text-lg">

// ✅ Consistent mobile-first approach
<div className="w-full sm:w-96 md:w-[28rem]">
<div className="text-base sm:text-lg">
```

**BeatMatchMe breakpoints:**
- `sm:` - 640px (tablet)
- `md:` - 768px (small desktop)
- `lg:` - 1024px (desktop)
- `xl:` - 1280px (large desktop)

### Step 2: Touch Targets

**Before:**
```typescript
// ❌ Too small to tap (32px)
<button className="w-8 h-8">
  <Icon />
</button>
```

**After:**
```typescript
// ✅ Minimum 44px touch target
<button className="w-11 h-11 sm:w-8 sm:h-8">
  <Icon />
</button>
```

### Step 3: Mobile Navigation

**Add bottom tab bar:**
```typescript
// components/MobileNavigation.tsx
function MobileNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
      <div className="flex justify-around">
        <NavButton icon={<HomeIcon />} label="Home" to="/" />
        <NavButton icon={<SearchIcon />} label="Browse" to="/browse" />
        <NavButton icon={<QueueIcon />} label="Queue" to="/queue" />
        <NavButton icon={<UserIcon />} label="Profile" to="/profile" />
      </div>
    </nav>
  );
}
```

### Step 4: Mobile Checklist

- [ ] All touch targets ≥44px
- [ ] Bottom navigation on mobile
- [ ] Swipe gestures work
- [ ] No horizontal scroll
- [ ] Safe area insets (notched devices)
- [ ] Test on real iOS device
- [ ] Test on real Android device

---

## 🧪 Phase 6: Testing (Week 4)

### Step 1: Theme Testing

```typescript
// __tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import MyComponent from './MyComponent';

describe('MyComponent theming', () => {
  it('renders with each theme', () => {
    const themes = ['beatbyme', 'gold', 'platinum'] as const;
    
    themes.forEach(theme => {
      const { rerender } = render(
        <ThemeProvider value={theme}>
          <MyComponent />
        </ThemeProvider>
      );
      
      expect(screen.getByRole('button')).toBeInTheDocument();
      rerender(<></>);
    });
  });
});
```

### Step 2: Performance Testing

```bash
# Lighthouse audit
lighthouse https://localhost:3000 --view

# Bundle analysis
npm run build -- --stats
npx webpack-bundle-analyzer build/bundle-stats.json
```

**Targets:**
- Performance: >90
- Bundle size: <1MB
- First Contentful Paint: <1.5s
- Time to Interactive: <3s

### Step 3: Mobile Testing

**Test on real devices:**
- iOS Safari (iPhone 12+)
- Android Chrome (Pixel 5+)
- Tablet (iPad)

**Test cases:**
- Swipe to dismiss panels
- Bottom navigation
- Touch targets
- Virtual keyboard behavior
- Landscape orientation

---

## 📊 Migration Progress Tracking

### Checklist

**Theme System:**
- [ ] All components use `useThemeClasses`
- [ ] No hardcoded purple/pink colors
- [ ] Tier colors use `getTierClasses`
- [ ] Theme switcher working
- [ ] All 3 themes tested

**CSS Modules:**
- [ ] High-priority components migrated
- [ ] CSS module template created
- [ ] Animation library documented
- [ ] Global styles cleaned up

**Modals → Panels:**
- [ ] Settings panel converted
- [ ] QR code panel converted
- [ ] Event creator panel converted
- [ ] Swipe gestures added
- [ ] ESC key support added

**Performance:**
- [ ] Virtual scrolling implemented
- [ ] Images lazy loaded
- [ ] Route code splitting added
- [ ] Component memoization applied
- [ ] Lighthouse score >90

**Mobile:**
- [ ] Touch targets ≥44px
- [ ] Bottom navigation added
- [ ] Breakpoints standardized
- [ ] Responsive orbital interface
- [ ] Tested on real devices

---

## 🚀 Post-Migration

### 1. Documentation
- Update README with new architecture
- Document theme system usage
- Document CSS Modules conventions
- Create video walkthrough

### 2. Team Training
- Theme system workshop
- CSS Modules best practices
- Performance optimization techniques
- Mobile-first development

### 3. Monitoring
- Set up performance monitoring
- Track bundle size over time
- Monitor error rates
- Gather user feedback

---

## 🆘 Troubleshooting

### Issue: Theme not applying
**Solution:** Ensure component is wrapped in ThemeProvider
```typescript
<ThemeProvider>
  <MyComponent />
</ThemeProvider>
```

### Issue: CSS Module classes not found
**Solution:** Check import path and file extension
```typescript
// ❌ Wrong
import styles from './MyComponent.css';

// ✅ Correct
import styles from './MyComponent.module.css';
```

### Issue: Performance not improving
**Solution:** Check React DevTools Profiler
- Look for excessive re-renders
- Add memoization to expensive components
- Use `useMemo` for expensive calculations

### Issue: Mobile gestures not working
**Solution:** Ensure touch events aren't prevented
```typescript
// Add passive: false to prevent defaults
element.addEventListener('touchstart', handler, { passive: false });
```

---

## 📚 Resources

- [THEME_SYSTEM_GUIDE.md](./THEME_SYSTEM_GUIDE.md) - Complete theme documentation
- [CSS_MODULES_GUIDE.md](./CSS_MODULES_GUIDE.md) - CSS Modules patterns
- [PERFORMANCE_GUIDE.md](./PERFORMANCE_GUIDE.md) - Performance optimizations
- [ANIMATION_LIBRARY.md](./ANIMATION_LIBRARY.md) - Animation catalog

---

**Migration Support:** engineering@beatmatchme.com  
**Last Updated:** November 6, 2025
