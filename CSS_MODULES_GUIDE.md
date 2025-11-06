# BeatMatchMe CSS Modules Guide

## 📦 Overview

BeatMatchMe uses CSS Modules for component-scoped styling, providing better maintainability, performance, and preventing style conflicts.

---

## 🎯 Why CSS Modules?

### Benefits
✅ **Scoped Styles** - No global namespace pollution  
✅ **Better Tree-Shaking** - Unused styles removed from bundle  
✅ **Type Safety** - TypeScript support for class names  
✅ **Colocation** - Styles live next to components  
✅ **Performance** - Smaller CSS bundles  

### Migration from Global CSS
- Global: `className="panel-header"`
- CSS Modules: `className={styles.panelHeader}`

---

## 🏗️ File Structure

### Standard Pattern
```
components/
├── Settings.tsx              # Component
├── Settings.module.css       # Scoped styles
├── AcceptRequestPanel.tsx
├── AcceptRequestPanel.module.css
└── QRCodeDisplay.tsx
    └── QRCodeDisplay.module.css
```

### Naming Convention
- Component: `PascalCase.tsx`
- CSS Module: `PascalCase.module.css`
- Class names: `camelCase`

---

## 📝 Creating a CSS Module

### 1. Create the CSS File

**File:** `MyComponent.module.css`

```css
/* Container */
.container {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
  z-index: 50;
  
  display: flex;
  align-items: center;
  justify-center;
  padding: 1rem;
}

/* Panel */
.panel {
  background: linear-gradient(to bottom right, 
    rgba(139, 92, 246, 0.1), 
    rgba(236, 72, 153, 0.1));
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 1.5rem;
  padding: 1.5rem;
  max-width: 32rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  
  animation: slideUp 0.3s ease-out;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

/* Close button */
.closeButton {
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transition: background 0.2s;
}

.closeButton:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Animations */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile responsive */
@media (max-width: 640px) {
  .panel {
    max-width: 100%;
    border-radius: 1rem;
  }
  
  .title {
    font-size: 1.25rem;
  }
}
```

### 2. Import and Use in Component

**File:** `MyComponent.tsx`

```tsx
import React from 'react';
import { X } from 'lucide-react';
import styles from './MyComponent.module.css';

interface MyComponentProps {
  onClose: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ onClose }) => {
  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>My Component</h2>
          <button 
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
      </div>
    </div>
  );
};
```

---

## 🎨 CSS Module Patterns

### Combining Classes

```tsx
// Multiple classes
<div className={`${styles.panel} ${styles.active}`}>

// Conditional classes
<div className={`${styles.card} ${isSelected ? styles.selected : ''}`}>

// With utility classes (Tailwind)
<div className={`${styles.container} flex items-center gap-4`}>
```

### Dynamic Class Names

```tsx
// Using classnames library
import classNames from 'classnames';

<div className={classNames(
  styles.button,
  {
    [styles.primary]: variant === 'primary',
    [styles.secondary]: variant === 'secondary',
    [styles.disabled]: disabled,
  }
)}>
```

### Composition

```css
/* Base styles */
.button {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
}

/* Compose with base */
.primaryButton {
  composes: button;
  background: linear-gradient(to right, #8B5CF6, #EC4899);
  color: white;
}

.secondaryButton {
  composes: button;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

```tsx
// Usage
<button className={styles.primaryButton}>Primary</button>
<button className={styles.secondaryButton}>Secondary</button>
```

---

## 🔧 Advanced Techniques

### CSS Variables in Modules

```css
.panel {
  --panel-bg: rgba(139, 92, 246, 0.1);
  --panel-border: rgba(139, 92, 246, 0.3);
  
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
}

.panel[data-theme="gold"] {
  --panel-bg: rgba(212, 175, 55, 0.1);
  --panel-border: rgba(212, 175, 55, 0.3);
}
```

### Global Exports

```css
/* Export specific classes globally */
:global(.modal-open) {
  overflow: hidden;
}

/* Mix local and global */
.container :global(.lucide-icon) {
  width: 1.5rem;
  height: 1.5rem;
}
```

### Media Query Organization

```css
/* Mobile-first approach */
.card {
  padding: 1rem;
  font-size: 0.875rem;
}

@media (min-width: 640px) {
  .card {
    padding: 1.5rem;
    font-size: 1rem;
  }
}

@media (min-width: 768px) {
  .card {
    padding: 2rem;
    font-size: 1.125rem;
  }
}
```

---

## 📋 Standard Module Template

Use this as a starting point for new components:

```css
/* ============================================
   [ComponentName] Styles
   Scoped component styles using CSS Modules
   ============================================ */

/* Container/Overlay */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-center;
  padding: 1rem;
  animation: fadeIn 0.2s ease-out;
}

/* Main Panel */
.panel {
  background: linear-gradient(to bottom right, 
    rgba(139, 92, 246, 0.1), 
    rgba(236, 72, 153, 0.1));
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 1.5rem;
  padding: 2rem;
  max-width: 32rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
}

/* Header Section */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.closeButton {
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transition: background 0.2s;
  cursor: pointer;
  border: none;
}

.closeButton:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Content Section */
.content {
  /* Component-specific content styles */
}

/* Footer/Actions */
.footer {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Buttons */
.button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.primaryButton {
  composes: button;
  background: linear-gradient(to right, #8B5CF6, #EC4899);
  color: white;
}

.primaryButton:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3);
}

.secondaryButton {
  composes: button;
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.secondaryButton:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .panel {
    padding: 1.5rem;
    border-radius: 1rem;
  }
  
  .title {
    font-size: 1.25rem;
  }
  
  .footer {
    flex-direction: column;
  }
  
  .button {
    width: 100%;
  }
}

/* Accessibility */
.panel:focus {
  outline: 2px solid #8B5CF6;
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .overlay,
  .panel {
    animation: none;
  }
  
  .button,
  .closeButton {
    transition: none;
  }
}
```

---

## 🎯 BeatMatchMe Conventions

### Class Naming
- Container: `.container`, `.overlay`, `.wrapper`
- Panels: `.panel`, `.modal`, `.slideout`
- Headers: `.header`, `.title`, `.subtitle`
- Content: `.content`, `.body`, `.section`
- Actions: `.footer`, `.actions`, `.buttons`
- Elements: `.button`, `.input`, `.card`, `.badge`

### Color Usage
Prefer CSS variables or theme integration:

```css
/* ❌ Avoid hardcoded colors */
.panel {
  background: #8B5CF6;
}

/* ✅ Use rgba for transparency */
.panel {
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
}

/* ✅ Or use CSS variables */
.panel {
  background: var(--theme-primary-10);
  border: 1px solid var(--theme-primary-30);
}
```

### Animations
Use centralized animations from `animations.css`:

```css
/* Import global animations */
@import '../styles/animations.css';

.panel {
  animation: slideInRight 0.3s ease-out;
}

/* Or define locally if specific */
@keyframes customSlide {
  /* ... */
}
```

---

## 🔍 Debugging CSS Modules

### Inspect Class Names
CSS Modules generate unique class names:

```html
<!-- Before (source) -->
<div class="panel">

<!-- After (rendered) -->
<div class="Settings_panel__a8c9f">
```

### Common Issues

**Class not applying:**
```tsx
// ❌ Wrong - using string
<div className="panel">

// ✅ Correct - using styles object
<div className={styles.panel}>
```

**Class name not found:**
```tsx
// Check import
import styles from './MyComponent.module.css'; // ✅

// Check class exists in CSS
.myClass { } // Must exist in CSS file
```

**Styles not updating:**
```bash
# Clear cache and rebuild
rm -rf node_modules/.cache
npm run build
```

---

## 📊 Performance Tips

### 1. Minimize Selectors
```css
/* ❌ Avoid deep nesting */
.panel .header .title .icon {
  /* ... */
}

/* ✅ Use flat structure */
.headerIcon {
  /* ... */
}
```

### 2. Use Composition
```css
/* ✅ Compose instead of duplicate */
.baseButton {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

.primaryButton {
  composes: baseButton;
  background: purple;
}
```

### 3. Lazy Load Heavy Styles
```tsx
// Load animation-heavy styles only when needed
const [showPanel, setShowPanel] = useState(false);

{showPanel && (
  <div className={styles.panel}> {/* Styles loaded on demand */}
    ...
  </div>
)}
```

---

## 🧪 Testing Styled Components

### Visual Regression Tests
```typescript
import { render } from '@testing-library/react';
import { MyComponent } from './MyComponent';

it('renders correctly', () => {
  const { container } = render(<MyComponent />);
  expect(container.firstChild).toMatchSnapshot();
});
```

### Style Checks
```typescript
it('applies correct styles', () => {
  const { container } = render(<MyComponent />);
  const panel = container.querySelector('[class*="panel"]');
  
  expect(panel).toHaveStyle({
    borderRadius: '1.5rem',
    padding: '2rem',
  });
});
```

---

## 📚 Resources

- [CSS Modules Documentation](https://github.com/css-modules/css-modules)
- [Create React App - CSS Modules](https://create-react-app.dev/docs/adding-a-css-modules-stylesheet/)
- [BEM Naming Convention](http://getbem.com/)

---

**Last Updated:** November 6, 2025  
**Maintained by:** BeatMatchMe Development Team
