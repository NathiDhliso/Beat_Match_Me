# BeatMatchMe Theme System Guide

## 🎨 Overview

BeatMatchMe features a comprehensive 3-theme system designed for both DJs and audiences. Each theme provides distinct visual identity while maintaining brand consistency.

---

## 🌈 Available Themes

### 1. BeatMatchMe (Default)
**Colors:**
- Primary: Purple `#8B5CF6`
- Secondary: Pink `#EC4899`
- Accent: Violet `#A78BFA`

**Personality:** Energetic, vibrant, party-focused  
**Best for:** General events, mixed crowds, high-energy nights

### 2. Gold
**Colors:**
- Primary: Rich Gold `#D4AF37`
- Secondary: Amber `#F59E0B`
- Accent: Yellow `#FCD34D`

**Personality:** Premium, luxurious, exclusive  
**Best for:** VIP events, upscale venues, special occasions

### 3. Platinum
**Colors:**
- Primary: Platinum `#E5E4E2`
- Secondary: Slate `#94A3B8`
- Accent: Silver `#CBD5E1`

**Personality:** Sophisticated, elegant, minimalist  
**Best for:** Corporate events, refined atmospheres, contemporary venues

---

## 🏗️ Architecture

### Design Tokens
**Location:** `web/src/theme/tokens.ts`

Centralized theme configuration:

```typescript
export const themes = {
  BeatMatchMe: {
    id: 'BeatMatchMe',
    name: 'BeatMatchMe',
    colors: {
      primary: '#8B5CF6',
      secondary: '#EC4899',
      accent: '#A78BFA',
      // ... more colors
    },
    gradients: {
      primary: 'from-purple-600 to-pink-600',
      secondary: 'from-pink-500 to-purple-500',
      // ... more gradients
    }
  },
  // ... other themes
};

export type ThemeName = keyof typeof themes;
export type Theme = typeof themes.BeatMatchMe;
```

### Theme Context
**Location:** `web/src/context/ThemeContext.tsx`

React Context for global theme state:

```typescript
interface ThemeContextValue {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  theme: Theme;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('BeatMatchMe');
  
  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, theme: themes[currentTheme] }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### Theme Hook
**Usage in components:**

```typescript
import { useTheme, useThemeClasses } from '../context/ThemeContext';

function MyComponent() {
  const { currentTheme, theme } = useTheme();
  const themeClasses = useThemeClasses();
  
  return (
    <div className={themeClasses.gradientPrimary}>
      {/* Content styled with current theme */}
    </div>
  );
}
```

---

## 🎯 Using the Theme System

### 1. Basic Usage - Theme Classes

**Recommended approach** for consistent theming:

```tsx
import { useThemeClasses } from '../context/ThemeContext';

function RequestCard() {
  const themeClasses = useThemeClasses();
  
  return (
    <div className={`bg-black/80 border-2 ${themeClasses.borderPrimary}`}>
      <h3 className={themeClasses.textPrimary}>Song Title</h3>
      <button className={`px-4 py-2 ${themeClasses.gradientPrimary}`}>
        Request
      </button>
    </div>
  );
}
```

**Available Theme Classes:**
```typescript
{
  // Text colors
  textPrimary: 'text-purple-500' | 'text-gold-500' | 'text-platinum-400',
  textSecondary: 'text-pink-500' | 'text-amber-500' | 'text-slate-400',
  
  // Background colors
  bgPrimary: 'bg-purple-600' | 'bg-gold-600' | 'bg-platinum-600',
  bgSecondary: 'bg-pink-600' | 'bg-amber-600' | 'bg-slate-600',
  
  // Borders
  borderPrimary: 'border-purple-500' | 'border-gold-500' | 'border-platinum-500',
  borderSecondary: 'border-pink-500' | 'border-amber-500' | 'border-slate-500',
  
  // Gradients
  gradientPrimary: 'from-purple-600 to-pink-600' | 'from-gold-600 to-amber-600' | ...,
  gradientSecondary: 'from-pink-500 to-purple-500' | 'from-amber-500 to-gold-500' | ...,
  
  // Hover states
  hoverPrimary: 'hover:bg-purple-700' | 'hover:bg-gold-700' | 'hover:bg-platinum-700',
  
  // Ring/Focus states
  ringPrimary: 'ring-purple-500' | 'ring-gold-500' | 'ring-platinum-500',
}
```

### 2. Dynamic Colors - Direct Access

For computed styles or dynamic values:

```tsx
import { useTheme } from '../context/ThemeContext';

function PriceDisplay({ amount }: { amount: number }) {
  const { theme } = useTheme();
  
  return (
    <div style={{ 
      color: theme.colors.primary,
      borderColor: theme.colors.accent,
    }}>
      R{amount}
    </div>
  );
}
```

### 3. Tier-Based Theming

Special utilities for user tier badges:

```tsx
import { getTierColor, getTierGradient, getTierBackgroundColor } from '../theme/tokens';

function TierBadge({ tier }: { tier: UserTier }) {
  return (
    <div 
      className={`px-3 py-1 rounded-full ${getTierBackgroundColor(tier)}`}
      style={{ color: getTierColor(tier) }}
    >
      {tier}
    </div>
  );
}
```

**Tier Colors:**
- BRONZE: `#CD7F32`
- SILVER: `#C0C0C0`
- GOLD: `#FFD700`
- PLATINUM: `#E5E4E2`
- DIAMOND: `#B9F2FF`

---

## 🔧 Theme Switcher Component

**Location:** `web/src/components/ThemeSwitcher.tsx`

Built-in component for theme selection:

```tsx
import { ThemeSwitcher } from '../components/ThemeSwitcher';

function Settings() {
  return (
    <div>
      <h2>Choose Your Theme</h2>
      <ThemeSwitcher />
    </div>
  );
}
```

**Features:**
- Visual preview of each theme
- Instant theme switching
- Persists selection to localStorage
- Smooth transitions

---

## 📱 Responsive Theming

### Mobile-First Approach

```tsx
function HeroSection() {
  const themeClasses = useThemeClasses();
  
  return (
    <div className={`
      ${themeClasses.gradientPrimary}
      p-4 sm:p-8 md:p-12
      rounded-lg sm:rounded-xl md:rounded-2xl
    `}>
      {/* Content scales with viewport */}
    </div>
  );
}
```

### Dark Mode Compatibility

All themes work in dark mode (BeatMatchMe default):

```tsx
// Themes already optimized for dark backgrounds
<div className="bg-gray-900">
  <div className={themeClasses.textPrimary}>
    {/* High contrast on dark background */}
  </div>
</div>
```

---

## 🎨 Custom Theme Implementation

### Adding a New Theme

1. **Define tokens** in `tokens.ts`:

```typescript
export const themes = {
  // ... existing themes
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    colors: {
      primary: '#10B981',
      secondary: '#34D399',
      accent: '#6EE7B7',
      background: '#064E3B',
      text: '#ECFDF5',
    },
    gradients: {
      primary: 'from-emerald-600 to-green-600',
      secondary: 'from-green-500 to-emerald-500',
      accent: 'from-teal-400 to-emerald-400',
    }
  }
};
```

2. **Add to ThemeContext** (automatic if using tokens):

```typescript
// Already handled by ThemeContext reading from tokens
```

3. **Update ThemeSwitcher UI**:

```tsx
// Add emerald preview to ThemeSwitcher component
<button onClick={() => setTheme('emerald')}>
  <div className="bg-gradient-to-br from-emerald-600 to-green-600">
    Emerald
  </div>
</button>
```

---

## 🔍 Theme Class Reference

### Complete List

```typescript
// Text Colors
themeClasses.textPrimary      // Main brand color text
themeClasses.textSecondary    // Secondary accent text
themeClasses.textAccent       // Highlight text

// Backgrounds
themeClasses.bgPrimary        // Solid primary background
themeClasses.bgSecondary      // Solid secondary background
themeClasses.bgAccent         // Solid accent background

// Borders
themeClasses.borderPrimary    // Primary color border
themeClasses.borderSecondary  // Secondary color border
themeClasses.borderAccent     // Accent color border

// Gradients (use with bg-gradient-to-*)
themeClasses.gradientPrimary     // Main brand gradient
themeClasses.gradientSecondary   // Secondary gradient
themeClasses.gradientAccent      // Accent gradient

// Interactive States
themeClasses.hoverPrimary     // Hover state for primary
themeClasses.hoverSecondary   // Hover state for secondary
themeClasses.activePrimary    // Active/pressed state
themeClasses.focusPrimary     // Focus ring color

// Shadows & Glows
themeClasses.shadowPrimary    // Primary color shadow
themeClasses.glowPrimary      // Primary glow effect
```

---

## 🧪 Testing Themes

### Manual Testing Checklist

For each theme, verify:
- [ ] Text readable on all backgrounds
- [ ] Sufficient contrast (WCAG AA minimum)
- [ ] Gradients render smoothly
- [ ] Hover states clearly visible
- [ ] Focus indicators prominent
- [ ] Mobile view looks good
- [ ] Dark mode compatible
- [ ] Tier badges distinguishable

### Automated Testing

```typescript
// Example theme contrast test
import { themes } from './tokens';

describe('Theme Contrast', () => {
  Object.entries(themes).forEach(([name, theme]) => {
    it(`${name} has sufficient contrast`, () => {
      const contrast = calculateContrast(theme.colors.primary, theme.colors.background);
      expect(contrast).toBeGreaterThan(4.5); // WCAG AA
    });
  });
});
```

---

## 💡 Best Practices

### DO ✅
- Use `themeClasses` for consistent theming
- Test all themes during development
- Use semantic naming (primary, secondary, accent)
- Maintain color contrast ratios
- Document custom theme additions

### DON'T ❌
- Hardcode color values (use theme system)
- Mix theme system with inline colors
- Forget to test mobile view
- Ignore accessibility guidelines
- Override theme colors in components

---

## 🐛 Troubleshooting

### Theme not applying?
1. Check ThemeProvider wraps your app
2. Verify `useThemeClasses()` is called inside component
3. Ensure Tailwind classes are not purged

### Colors look wrong?
1. Check current theme: `console.log(currentTheme)`
2. Verify theme colors in tokens.ts
3. Test in incognito (clears localStorage)

### Tailwind classes not working?
1. Verify class in safelist (tailwind.config.js)
2. Check for typos in theme class names
3. Rebuild Tailwind: `npm run build:css`

---

## 📚 Related Documentation

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Context Guide](https://react.dev/reference/react/useContext)
- [WCAG Color Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum)

---

**Last Updated:** November 6, 2025  
**Maintained by:** BeatMatchMe Development Team
