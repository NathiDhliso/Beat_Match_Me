# BeatMatchMe Animation Library

## 🎬 Overview

Centralized animation library providing reusable, performant animations with accessibility support.

**Location:** `web/src/styles/animations.css`

---

## 🌟 Available Animations

### Entrance Animations

#### fadeIn
```css
animation: fadeIn 0.3s ease-out;
```
**Use for:** Modal overlays, notifications  
**Duration:** 0.3s  
**Easing:** ease-out  

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

#### slideInRight
```css
animation: slideInRight 0.3s ease-out;
```
**Use for:** Side panels, slide-out menus  
**Duration:** 0.3s  
**Effect:** Slides in from right (100px)

#### slideInLeft  
```css
animation: slideInLeft 0.3s ease-out;
```
**Use for:** Side panels from left  
**Duration:** 0.3s  
**Effect:** Slides in from left (-100px)

#### slideUp
```css
animation: slideUp 0.3s ease-out;
```
**Use for:** Modals, bottom sheets  
**Duration:** 0.3s  
**Effect:** Slides up from bottom (20px)

#### scaleIn
```css
animation: scaleIn 0.2s ease-out;
```
**Use for:** Buttons, badges, cards  
**Duration:** 0.2s  
**Effect:** Scales from 0.95 to 1.0

#### bounceIn
```css
animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
```
**Use for:** Success confirmations, achievements  
**Duration:** 0.6s  
**Effect:** Playful bounce entrance

---

### Exit Animations

#### fadeOut
```css
animation: fadeOut 0.2s ease-in;
```
**Use for:** Closing modals, removing elements  
**Duration:** 0.2s  
**Easing:** ease-in

#### slideOutRight
```css
animation: slideOutRight 0.3s ease-in;
```
**Use for:** Dismissing panels  
**Duration:** 0.3s  
**Effect:** Slides out to right (100px)

#### scaleOut
```css
animation: scaleOut 0.2s ease-in;
```
**Use for:** Removing items  
**Duration:** 0.2s  
**Effect:** Scales down to 0.8

---

### Panel Animations

#### slidePanel
```css
animation: slidePanel 0.4s cubic-bezier(0.4, 0, 0.2, 1);
```
**Use for:** Full-screen panels  
**Duration:** 0.4s  
**Effect:** Smooth slide with fade

```css
@keyframes slidePanel {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

---

### Modal Animations

#### modalBackdrop
```css
animation: modalBackdrop 0.2s ease-out;
```
**Use for:** Modal background overlays  
**Duration:** 0.2s  
**Effect:** Fade in backdrop blur

#### modalContent
```css
animation: modalContent 0.3s ease-out;
```
**Use for:** Modal content containers  
**Duration:** 0.3s  
**Effect:** Slide up + fade in

---

### Swipe Animations

#### swipeDismiss
```css
animation: swipeDismiss 0.3s ease-in-out;
```
**Use for:** Swipe-to-dismiss actions  
**Duration:** 0.3s  
**Effect:** Slide out right + fade

```tsx
// Usage with gesture
<div 
  className="panel"
  style={{
    animation: isDismissing ? 'swipeDismiss 0.3s ease-in-out' : undefined
  }}
>
```

---

### Interactive Animations

#### pulse
```css
animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
```
**Use for:** Loading indicators, live status  
**Duration:** 2s (infinite)  
**Effect:** Gentle scale pulse

#### spin
```css
animation: spin 1s linear infinite;
```
**Use for:** Loading spinners  
**Duration:** 1s (infinite)  
**Effect:** 360° rotation

#### wiggle
```css
animation: wiggle 0.5s ease-in-out;
```
**Use for:** Error shake, attention  
**Duration:** 0.5s  
**Effect:** Horizontal shake

```css
@keyframes wiggle {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
```

---

### Orbital Animations

#### orbit
```css
animation: orbit 20s linear infinite;
```
**Use for:** Circular queue visualizer  
**Duration:** 20s (infinite)  
**Effect:** Smooth orbital rotation

```css
@keyframes orbit {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

### Celebration Animations

#### confetti
```css
animation: confetti 0.8s ease-out;
```
**Use for:** Success celebrations  
**Duration:** 0.8s  
**Effect:** Burst animation

#### starBurst
```css
animation: starBurst 0.6s ease-out;
```
**Use for:** Achievements, milestones  
**Duration:** 0.6s  
**Effect:** Expanding star burst

---

## 🎯 Usage Patterns

### Basic Usage

```tsx
import '../styles/animations.css';

function MyComponent() {
  return (
    <div className="animate-slideInRight">
      Content slides in from right
    </div>
  );
}
```

### With Tailwind Classes

```tsx
<div className="opacity-0 animate-fadeIn">
  Fades in smoothly
</div>
```

### Dynamic Animation

```tsx
const [isEntering, setIsEntering] = useState(true);

<div 
  style={{
    animation: isEntering 
      ? 'slideInRight 0.3s ease-out' 
      : 'slideOutRight 0.3s ease-in'
  }}
>
  Animated content
</div>
```

### Conditional Animation

```tsx
<div className={isVisible ? 'animate-fadeIn' : 'animate-fadeOut'}>
  Toggles visibility with animation
</div>
```

---

## ⚡ Performance Best Practices

### GPU Acceleration

All animations use GPU-accelerated properties:
- `transform` ✅
- `opacity` ✅
- `filter` (blur) ✅

Avoid:
- `width`, `height` ❌
- `top`, `left` ❌
- `margin`, `padding` ❌

### Will-Change Optimization

```css
.panel {
  will-change: transform, opacity;
}

/* Remove after animation */
.panel.static {
  will-change: auto;
}
```

### Animation Delays

```tsx
{items.map((item, index) => (
  <div 
    key={item.id}
    style={{
      animation: 'fadeIn 0.3s ease-out',
      animationDelay: `${index * 0.1}s`
    }}
  >
    {item.name}
  </div>
))}
```

---

## ♿ Accessibility

### Prefers Reduced Motion

All animations respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Usage in Components

```tsx
const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  setPrefersReducedMotion(mediaQuery.matches);
  
  const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}, []);

<div 
  style={{
    animation: prefersReducedMotion 
      ? 'none' 
      : 'slideInRight 0.3s ease-out'
  }}
>
```

---

## 🎨 Custom Animations

### Creating New Animations

1. **Define keyframes** in `animations.css`:

```css
@keyframes myCustomAnimation {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
  }
  50% {
    opacity: 0.5;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

2. **Use in component**:

```tsx
<div className="animate-myCustomAnimation">
  Custom animated content
</div>
```

### Animation Sequences

```css
.sequenceAnimation {
  animation: 
    fadeIn 0.3s ease-out,
    slideUp 0.3s ease-out,
    scaleIn 0.2s 0.3s ease-out;
}
```

---

## 📋 Animation Combinations

### Entrance + Exit

```tsx
const [isVisible, setIsVisible] = useState(false);

<div className={`
  ${isVisible ? 'animate-fadeIn' : 'animate-fadeOut'}
  ${isVisible ? 'animate-slideInRight' : 'animate-slideOutRight'}
`}>
  Combined animations
</div>
```

### Stagger Effects

```tsx
{notifications.map((notif, i) => (
  <div 
    key={notif.id}
    style={{
      animation: `slideInRight 0.3s ease-out ${i * 0.1}s both`
    }}
  >
    {notif.message}
  </div>
))}
```

---

## 🔧 Debugging Animations

### Chrome DevTools

1. Open DevTools > More Tools > Animations
2. Record interactions
3. Inspect animation timeline
4. Slow down animations (0.1x speed)

### CSS Inspection

```tsx
// Add data attribute for debugging
<div 
  data-animation="slideInRight"
  className="animate-slideInRight"
>
```

### Console Logging

```tsx
useEffect(() => {
  const element = ref.current;
  
  element?.addEventListener('animationstart', (e) => {
    console.log('Animation started:', e.animationName);
  });
  
  element?.addEventListener('animationend', (e) => {
    console.log('Animation ended:', e.animationName);
  });
}, []);
```

---

## 📊 Animation Catalog

| Animation | Type | Duration | Use Case |
|-----------|------|----------|----------|
| `fadeIn` | Entrance | 0.3s | Modals, overlays |
| `fadeOut` | Exit | 0.2s | Dismissing elements |
| `slideInRight` | Entrance | 0.3s | Side panels |
| `slideInLeft` | Entrance | 0.3s | Side panels |
| `slideUp` | Entrance | 0.3s | Bottom sheets, modals |
| `slideOutRight` | Exit | 0.3s | Dismissing panels |
| `scaleIn` | Entrance | 0.2s | Buttons, badges |
| `scaleOut` | Exit | 0.2s | Removing items |
| `bounceIn` | Entrance | 0.6s | Celebrations |
| `pulse` | Loop | 2s | Live indicators |
| `spin` | Loop | 1s | Loading spinners |
| `wiggle` | Interactive | 0.5s | Error shake |
| `orbit` | Loop | 20s | Circular motion |
| `confetti` | Celebration | 0.8s | Success moments |
| `starBurst` | Celebration | 0.6s | Achievements |

---

## 💡 Tips & Tricks

### 1. Animation Direction

```css
.panel {
  animation: slideInRight 0.3s ease-out;
  animation-direction: reverse; /* Slide out instead */
}
```

### 2. Fill Mode

```css
.modal {
  animation: fadeIn 0.3s ease-out forwards; /* Retain final state */
}
```

### 3. Play State

```tsx
<div style={{
  animation: 'pulse 2s infinite',
  animationPlayState: isPaused ? 'paused' : 'running'
}}>
```

### 4. Multiple Animations

```css
.card {
  animation: 
    fadeIn 0.3s ease-out,
    slideUp 0.3s ease-out,
    scaleIn 0.2s 0.3s ease-out;
}
```

---

## 🎓 Learning Resources

- [CSS Animations Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [Easing Functions](https://easings.net/)
- [Animation Performance](https://web.dev/animations/)
- [Reduced Motion](https://web.dev/prefers-reduced-motion/)

---

**Last Updated:** November 6, 2025  
**Maintained by:** BeatMatchMe Development Team
