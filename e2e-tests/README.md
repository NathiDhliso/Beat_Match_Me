# BeatMatchMe E2E Test Suite

Comprehensive end-to-end tests for BeatMatchMe using Playwright.

## 📋 Overview

This test suite covers:
- ✅ DJ Portal critical flows
- ✅ User Portal critical flows
- ✅ Payment integration
- ✅ Request lifecycle
- ✅ Mobile experience
- ✅ Theme system
- ✅ Offline support
- ✅ Performance (virtual scrolling)

## 🚀 Quick Start

### Installation

```bash
cd e2e-tests
npm install
npx playwright install
```

### Run Tests

```bash
# Run all tests
npm test

# Run with UI (interactive mode)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Run specific test file
npx playwright test tests/dj-portal.spec.ts

# Run tests for specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Generate Tests (Record)

```bash
# Record test actions
npm run test:codegen
```

## 📁 Test Structure

```
e2e-tests/
├── tests/
│   ├── dj-portal.spec.ts       # DJ workflow tests
│   ├── user-portal.spec.ts     # User workflow tests
│   └── payment.spec.ts         # Payment flow tests
├── test-data/
│   └── sample-tracks.csv       # Sample data for uploads
├── playwright.config.ts        # Test configuration
└── package.json
```

## 🧪 Test Coverage

### DJ Portal Tests

**Event Creation:**
- ✅ Create new event
- ✅ Upload tracklist
- ✅ Configure event settings

**Request Management:**
- ✅ View request queue
- ✅ Accept requests
- ✅ Veto requests
- ✅ Mark songs as playing

**Performance:**
- ✅ Virtual scrolling with 10,000+ tracks
- ✅ Lazy load images
- ✅ Smooth scrolling at 60 FPS

**Mobile:**
- ✅ Mobile navigation
- ✅ Swipe to dismiss panels
- ✅ Touch targets ≥44px

### User Portal Tests

**Event Discovery:**
- ✅ Browse events
- ✅ Search events
- ✅ Join event

**Song Requests:**
- ✅ Search songs
- ✅ Submit request
- ✅ View queue position
- ✅ Track wait time

**Real-time Updates:**
- ✅ Request status changes
- ✅ Acceptance notifications
- ✅ Queue position updates

**Offline Support:**
- ✅ Submit requests offline
- ✅ Auto-sync when online
- ✅ Offline indicator

**Mobile:**
- ✅ Bottom navigation
- ✅ Touch targets
- ✅ Lazy load images

**Theme System:**
- ✅ Switch themes
- ✅ Theme persistence

## 🎯 Test Configuration

### Browsers

Tests run on:
- ✅ **Chromium** (Desktop Chrome)
- ✅ **Firefox** (Desktop)
- ✅ **WebKit** (Desktop Safari)
- ✅ **Mobile Chrome** (Pixel 5)
- ✅ **Mobile Safari** (iPhone 12)

### Viewports

- Desktop: 1280x720
- Mobile Chrome: 393x851 (Pixel 5)
- Mobile Safari: 390x844 (iPhone 12)

## 📊 Reports

### View Test Results

```bash
# View HTML report
npm run test:report

# JSON results
cat test-results.json
```

### Screenshots & Videos

- Screenshots saved on failure: `test-results/`
- Videos saved on failure: `test-results/`
- Traces for debugging: `test-results/`

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
BASE_URL=http://localhost:3000
TEST_USER_EMAIL=user@test.com
TEST_USER_PASSWORD=password123
TEST_DJ_EMAIL=dj@test.com
TEST_DJ_PASSWORD=password123
```

### Test Data

Sample files in `test-data/`:
- `sample-tracks.csv` - 100 sample tracks
- `large-tracklist.csv` - 10,000 tracks for performance testing

## 🐛 Debugging

### Debug Mode

```bash
# Run in debug mode (step through tests)
npm run test:debug

# Run specific test in debug
npx playwright test tests/dj-portal.spec.ts --debug
```

### Trace Viewer

```bash
# View trace for failed test
npx playwright show-trace test-results/trace.zip
```

### Headed Mode

```bash
# See browser while testing
npm run test:headed
```

## 📝 Writing Tests

### Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await page.click('button');
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

### Best Practices

1. **Use data-testid for selectors**
   ```typescript
   await page.click('[data-testid="submit-button"]');
   ```

2. **Wait for elements properly**
   ```typescript
   await expect(page.locator('.element')).toBeVisible();
   ```

3. **Clean up after tests**
   ```typescript
   test.afterEach(async ({ page }) => {
     // Cleanup
   });
   ```

4. **Use descriptive test names**
   ```typescript
   test('User can submit song request and see it in queue', ...);
   ```

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd e2e-tests && npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: e2e-tests/playwright-report/
```

## 📋 Test Checklist

Before production deployment:

- [ ] All DJ Portal tests passing
- [ ] All User Portal tests passing
- [ ] Payment flow tested
- [ ] Mobile tests passing
- [ ] Theme switching working
- [ ] Offline support verified
- [ ] Performance tests passing
- [ ] Accessibility checks passing

## 🔗 Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

## 🆘 Troubleshooting

### Tests failing locally

1. Ensure dev server is running: `cd ../web && npm run dev`
2. Clear browser cache: `npx playwright clean`
3. Update Playwright: `npm update @playwright/test`
4. Reinstall browsers: `npx playwright install`

### Timeouts

Increase timeout in `playwright.config.ts`:
```typescript
use: {
  actionTimeout: 10000,
  navigationTimeout: 30000,
}
```

### Flaky tests

Use explicit waits:
```typescript
await page.waitForLoadState('networkidle');
await expect(element).toBeVisible({ timeout: 10000 });
```

---

**Last Updated:** November 6, 2025  
**Maintained by:** BeatMatchMe QA Team
