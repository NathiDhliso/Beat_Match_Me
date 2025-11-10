# 🎯 Complete Swipe Animation Flow - What Happens When You Swipe

## The Black Background Issue Explained

When you swipe, you're seeing **black background on the left side** because the **PeekPreview layer is positioned incorrectly** and the **parent container doesn't have a background**.

---

## 📂 Files Involved in Swipe Detection (In Order)

### 1. **`src/pages/DJPortalOrbital.tsx`** (Your Current Page)
**Lines 980-1020** - Where it all starts

```tsx
return (
  <GestureHandler
    onSwipeUp={handleSwipeUp}
    onSwipeDown={handleSwipeDown}
    onSwipeLeft={handleSwipeLeft}
    onSwipeRight={handleSwipeRight}
    peekContent={{
      left: (<div>← Previous</div>),
      right: (<div>Next →</div>),
      up: (<div>Queue</div>),
      down: (<div>Library</div>),
    }}
  >
    <div className="absolute inset-0 h-dvh animate-vinyl-spin"
         style={{ background: 'linear-gradient(...)' }}>
      {/* Your DJ portal content */}
    </div>
  </GestureHandler>
);
```

**What this does:**
- Wraps your entire DJ portal in a `<GestureHandler>` component
- Passes callback functions for each swipe direction
- Provides `peekContent` - the preview shown when swiping
- Your main content (with gradient background) is inside as children

---

### 2. **`src/components/core/GestureHandler/GestureHandler.tsx`**
**The Wrapper Component**

```tsx
export const GestureHandler: React.FC<GestureHandlerProps> = ({
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  children,        // Your DJ portal content
  peekContent,     // Preview content for each direction
}) => {
  // Get touch state from custom hook
  const { currentDelta, isPeeking, handlers } = useSwipeDetection({
    onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight,
  });

  // Calculate which preview to show
  const peekPreview = usePeekPreview(currentDelta, isPeeking, peekContent);

  return (
    <div {...handlers} className="h-full w-full" style={{ position: 'relative' }}>
      
      {/* LAYER 1: Peek Preview (z-index: 0) - BEHIND main content */}
      {peekPreview && <PeekPreview peekPreview={peekPreview} />}
      
      {/* LAYER 2: Your Main Content (z-index: 1) - SLIDES with your finger */}
      <div style={{
        transform: isPeeking ? `translate(${currentDelta.x}px, ${currentDelta.y}px)` : 'translate(0, 0)',
        zIndex: 1,
      }}>
        {children}  {/* Your DJ portal renders here */}
      </div>
      
      {/* LAYER 3: Direction Arrow (on top) */}
      {peekPreview && <DirectionArrow direction={peekPreview.direction} />}
    </div>
  );
};
```

**What happens here:**
1. Creates 3 layers (preview behind, content middle, arrow on top)
2. Attaches touch event handlers to the wrapper div
3. When you touch and drag, the main content SLIDES revealing preview behind
4. **THE PROBLEM**: The wrapper div has NO background, so black shows through

---

### 3. **`src/components/core/GestureHandler/useSwipeDetection.ts`**
**Touch Event Handler**

```tsx
export const useSwipeDetection = (callbacks: SwipeCallbacks) => {
  const [touchStart, setTouchStart] = useState<TouchPoint | null>(null);
  const [currentDelta, setCurrentDelta] = useState<Delta>({ x: 0, y: 0 });
  const [isPeeking, setIsPeeking] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    logger.debug('👆 Touch START:', e.touches[0].clientX, e.touches[0].clientY);
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    });
    setIsPeeking(true);  // ← START PEEKING MODE
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - touchStart.x;
    const deltaY = e.touches[0].clientY - touchStart.y;
    
    logger.debug('👉 Touch MOVE - Delta:', { deltaX, deltaY });
    
    setCurrentDelta({ x: deltaX, y: deltaY });  // ← UPDATE POSITION
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    logger.debug('👋 Touch END');
    
    // Calculate if swipe was fast/far enough
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;
    
    if (distance > 100 && velocity > 0.3) {
      // TRIGGER NAVIGATION
      if (deltaX > 0) callbacks.onSwipeRight();
      else if (deltaX < 0) callbacks.onSwipeLeft();
      // ... etc
    }
    
    // Reset position
    setCurrentDelta({ x: 0, y: 0 });
    setIsPeeking(false);  // ← END PEEKING MODE
  };

  return {
    currentDelta,   // Current drag position (x, y)
    isPeeking,      // Whether user is currently dragging
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};
```

**What happens during your swipe:**
1. **Touch Start**: Records starting position (x, y), sets `isPeeking = true`
2. **Touch Move**: Calculates delta (how far you've moved), updates `currentDelta`
3. **Touch End**: Checks if swipe was valid, calls callback, resets to (0, 0)

---

### 4. **`src/components/core/GestureHandler/usePeekPreview.ts`**
**Preview Calculator**

```tsx
export const usePeekPreview = (
  currentDelta: Delta,      // { x: 150, y: 20 } (example)
  isPeeking: boolean,       // true (while dragging)
  peekContent?: PeekContent // Your preview content
): PeekPreview | null => {
  
  if (!isPeeking || !peekContent) return null;
  
  const absX = Math.abs(currentDelta.x);  // 150
  const absY = Math.abs(currentDelta.y);  // 20
  
  // Need at least 10px movement to show preview
  if (absX < 10 && absY < 10) return null;
  
  // Determine direction (horizontal vs vertical)
  if (absX > absY) {
    // HORIZONTAL SWIPE
    if (currentDelta.x > 0 && peekContent.right) {
      // SWIPING RIGHT (finger moving right)
      return { 
        content: peekContent.right,  // "Next →" content
        direction: 'right',
        offset: currentDelta.x       // 150px
      };
    } else if (currentDelta.x < 0 && peekContent.left) {
      // SWIPING LEFT (finger moving left)
      return { 
        content: peekContent.left,   // "← Previous" content
        direction: 'left',
        offset: currentDelta.x       // -150px
      };
    }
  } else {
    // VERTICAL SWIPE (similar logic for up/down)
  }
  
  return null;
};
```

**What this decides:**
- Which direction you're swiping (left/right/up/down)
- How far you've swiped (offset in pixels)
- Which preview content to show

---

### 5. **`src/components/core/GestureHandler/PeekPreview.tsx`**
**The Visual Preview Layer**

```tsx
export const PeekPreview: React.FC<PeekPreviewProps> = ({ peekPreview }) => {
  const { direction, offset } = peekPreview;
  const absOffset = Math.abs(offset);
  
  // Calculate opacity (fade in as you swipe)
  const opacity = Math.min(absOffset / 100, 0.95);
  
  // Calculate position based on direction
  const getPosition = () => {
    switch (direction) {
      case 'right':
        // Slides in FROM LEFT edge
        return {
          left: 0,
          transform: `translateX(${Math.min(0, -100 + absOffset)}%)`,
        };
      case 'left':
        // Slides in FROM RIGHT edge
        return {
          right: 0,
          transform: `translateX(${Math.max(0, 100 - absOffset)}%)`,
        };
      // ... similar for up/down
    }
  };

  return (
    <div
      className="absolute z-0"  // ← z-index: 0 (BEHIND main content)
      style={{
        ...getPosition(),
        opacity,
        // ⚠️ THIS IS WHERE THE PREVIEW APPEARS
      }}
    >
      {/* Colorful gradient background */}
      <div style={{
        background: direction === 'right' 
          ? 'linear-gradient(-90deg, rgba(236, 72, 153, 0.3) 0%, ...)'
          : 'linear-gradient(90deg, rgba(139, 92, 246, 0.3) 0%, ...)',
        backdropFilter: 'blur(20px)',
      }}>
        {peekPreview.content}  {/* Your "Next →" or "← Previous" */}
      </div>
    </div>
  );
};
```

**Position calculation example:**
- You swipe RIGHT 150px
- Preview starts at `left: 0`, `translateX(-100%)` (fully off-screen left)
- As you swipe, it moves to `translateX(-100 + 150)` = `translateX(50%)`
- Preview is now 50% visible sliding in from left

---

## 🎬 Complete Animation Sequence (When You Swipe Right →)

### Step-by-Step What Happens:

**Frame 1: Touch Start (t=0ms)**
```
File: useSwipeDetection.ts
Action: handleTouchStart()
State: 
  - touchStart = { x: 100, y: 500 }
  - isPeeking = true
  - currentDelta = { x: 0, y: 0 }
```

**Frame 2: Touch Move (t=50ms, moved 30px right)**
```
File: useSwipeDetection.ts
Action: handleTouchMove()
State:
  - currentDelta = { x: 30, y: 2 }
  
File: usePeekPreview.ts
Action: Calculate preview
Return: { direction: 'right', offset: 30, content: <div>Next →</div> }

File: PeekPreview.tsx
Action: Render preview layer
Position: translateX(-70%) (sliding in from left)
Opacity: 0.3 (30/100)

File: GestureHandler.tsx
Action: Move main content
Transform: translate(30px, 2px) (content slides right with your finger)
```

**Visual State at 30px:**
```
┌─────────────────────────────┐
│  BLACK (no background)      │  ← THE PROBLEM
│     ┌────────────┐          │
│     │ Preview    │          │  ← z-0, sliding in from left
│     │ (gradient) │          │     opacity: 0.3
│     └────────────┘          │
│          ┌──────────────────┤
│          │ Your DJ Portal   │  ← z-1, moved right 30px
│          │ (main content)   │
│          └──────────────────┤
└─────────────────────────────┘
```

**Frame 3: Touch Move (t=100ms, moved 150px right)**
```
State:
  - currentDelta = { x: 150, y: 5 }

Preview Position: translateX(50%) (now 50% visible)
Preview Opacity: 0.95 (maxed out at 150/100)
Main Content: translate(150px, 5px)
```

**Visual State at 150px:**
```
┌─────────────────────────────┐
│  BLACK BG      ▓▓▓▓▓▓▓▓     │  ← BLACK shows on left
│  (exposed)     ▓Preview▓     │  ← Preview half visible
│                ▓▓▓▓▓▓▓▓     │
│                  ┌──────────┤
│                  │ DJ Portal│  ← Content moved far right
│                  └──────────┤
└─────────────────────────────┘
```

**Frame 4: Touch End (swipe complete)**
```
File: useSwipeDetection.ts
Action: handleTouchEnd()
Logic:
  - distance = 150px (threshold is 100px ✓)
  - velocity = 0.6 px/ms (threshold is 0.3 ✓)
  - VALID SWIPE!
  
File: DJPortalOrbital.tsx
Action: handleSwipeRight() called
Result: Navigate to next page

Cleanup:
  - currentDelta = { x: 0, y: 0 }
  - isPeeking = false
  - Preview fades out
  - Content animates back to (0, 0)
```

---

## 🐛 THE BLACK BACKGROUND PROBLEM

### What's Happening:

**File: `GestureHandler.tsx` (Line 54-62)**
```tsx
<div
  {...handlers}
  className="h-full w-full"
  style={{ 
    position: 'relative',
    overflow: 'visible'  // ← Allows preview to extend outside
  }}
>
  {/* NO BACKGROUND COLOR SET! */}
```

**Result:**
1. When you swipe RIGHT, your main content moves right
2. This exposes the LEFT side of the wrapper div
3. Wrapper div has NO background
4. Browser default background (black) shows through
5. Preview is BEHIND your content (z-0) but only partially covers exposed area

### Why Preview Doesn't Fill the Gap:

**File: `PeekPreview.tsx` (Lines 42-50)**
```tsx
const getPosition = () => {
  switch (direction) {
    case 'right':
      return {
        left: 0,              // ← Starts at left edge
        right: 'auto',
        transform: `translateX(${Math.min(0, -100 + absOffset)}%)`,
      };
  }
};
```

The preview:
- Starts fully off-screen left (`translateX(-100%)`)
- Slides in as you drag
- But it's positioned at `left: 0` of the wrapper
- When main content moves right 150px, the exposed area is OUTSIDE the preview's position

---

## 🔧 THE FIX

### Option 1: Add Background to Wrapper (Simple)

**File: `src/components/core/GestureHandler/GestureHandler.tsx`**

Change line 54-62:
```tsx
<div
  {...handlers}
  className="h-full w-full"
  style={{ 
    position: 'relative',
    overflow: 'visible',
    background: 'linear-gradient(to bottom right, rgb(17, 24, 39), rgb(88, 28, 135), rgb(17, 24, 39))',  // ← ADD THIS
  }}
>
```

### Option 2: Make Preview Cover Full Width (Better)

**File: `src/components/core/GestureHandler/PeekPreview.tsx`**

Change the position calculation:
```tsx
<div
  className="absolute z-0"
  style={{
    top: 0,
    bottom: 0,
    left: 0,        // ← Always at left edge
    right: 0,       // ← Always at right edge
    width: '100%',  // ← Full width
    transform: ..., // ← Only transform, no left/right positioning
    opacity,
  }}
>
```

---

## 📊 Summary

**Files Involved (in order of execution):**
1. `DJPortalOrbital.tsx` - Wraps content in GestureHandler, provides callbacks
2. `GestureHandler.tsx` - Creates 3-layer structure, applies transforms
3. `useSwipeDetection.ts` - Tracks touch position, calculates deltas
4. `usePeekPreview.ts` - Determines which preview to show and where
5. `PeekPreview.tsx` - Renders the sliding preview layer

**The Black Background:**
- Wrapper div has no background
- Main content slides away exposing wrapper
- Preview doesn't cover exposed area
- Browser default black shows through

**The Animation Flow:**
```
Touch → Delta Updates → Preview Calculated → Layers Transform → Visual Feedback
  ↓          ↓              ↓                    ↓                 ↓
  0ms       50ms          100ms               150ms            200ms
```

Would you like me to implement one of the fixes to eliminate the black background?
