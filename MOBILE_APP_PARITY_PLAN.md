# Mobile App Parity Plan

## 1. Foundational Alignment

### 1.1 Architecture Audit
- Document web app flows (DJ portal, audience, auth, payments, GraphQL, sockets).
- Confirm APIs support mobile clients (pagination, error handling, auth tokens, sockets).

### 1.2 Design Inventory
- Export UI components, theme tokens, motion specs.
- Capture viewport constraints (fixed `dvh`, gestures, no-scroll layout).

## 2. Mobile Frontend Plan

### 2.1 Platform & Tooling
- Use React Native + Expo with TypeScript for shared logic.
- Share theme tokens and context via reusable package.

### 2.2 Component Replication
- Orbital Interface: status arcs, floating bubble, gestures (`react-native-gesture-handler`, SVG).
- DJ Library: virtualized list via `FlashList`/`RecyclerListView`, layout measurements.
- Revenue Dashboard: theme-aware cards, animations with `react-native-reanimated`.
- Settings View: responsive flex layouts, safe-area support, single logout action.
- Audience Interface: lazy-loaded images via `expo-image` with blur placeholders.

### 2.3 Navigation & Gestures
- Implement navigation using `React Navigation` (stack + modals).
- Replicate swipe gestures for queue interactions.

### 2.4 Theming & Styling
- Extract `ThemeContext` into shared package.
- Apply design tokens via `styled-components` or `tailwind-rn`.
- Manage viewport height with `SafeAreaView`, `Dimensions`, `react-native-safe-area-context`.

### 2.5 Offline & Performance
- Cache data with `react-query` + persistent storage.
- Optimize images, animations, and text rendering for 60fps.

## 3. Backend Integration

### 3.1 API Readiness
- Validate GraphQL schema for mobile (auth, batching, pagination).
- Introduce mobile-specific rate limits and error handling.

### 3.2 Authentication
- Reuse token-based auth with `expo-secure-store` for storage.
- Implement session management with refresh tokens and logout sync.

### 3.3 Real-time Features
- Ensure WebSocket/subscription support with reconnection logic.
- Handle background scenarios gracefully.

### 3.4 Payments
- Extend backend for Apple/Google Pay if needed.
- Maintain parity in payment confirmations and receipts.

### 3.5 CI/CD
- Extend pipeline to mobile builds/tests (Expo EAS, Detox).
- Configure beta delivery (TestFlight, Play Store internal).

## 4. Roadmap & Milestones

1. **Discovery (Weeks 1-2)**
   - Architecture & design inventory.
   - UX parity spec & component catalog.

2. **Foundation Setup (Weeks 3-4)**
   - Shared design-system repo.
   - Expo project bootstrap with auth scaffold.

3. **Feature Pods (Weeks 5-10)**
   - Pod A: DJ portal (status arcs, queue, revenue).
   - Pod B: Audience features (event discovery, request flow).
   - Pod C: Settings/admin utilities.

4. **Integration & QA (Weeks 11-12)**
   - End-to-end backend integration.
   - Accessibility, performance, offline tests.

5. **Release Prep (Week 13+)**
   - CI/CD hardening, app store prep, telemetry alignment.
   - Launch checklist with rollback plan.

## 5. Immediate Next Steps
- Schedule architecture & design workshops.
- Stand up shared theme/components repository.
- Bootstrap Expo project with auth proof of concept.
