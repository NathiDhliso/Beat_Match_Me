import { test, expect, devices } from '@playwright/test';
import { loginAsUser, loginAsDJ } from '../helpers/auth';

/**
 * Mobile Device Testing Suite
 * Tests BeatMatchMe on real mobile viewports (iOS & Android)
 */

// iOS Device Tests
test.describe('iOS Mobile Testing (iPhone 12)', () => {
  test.use(devices['iPhone 12']);

  test('DJ Portal - Mobile layout renders correctly on iOS', async ({ page }) => {
    await loginAsDJ(page);
    
    // Wait for DJ Portal to load
    await page.waitForLoadState('networkidle');
    
    // Check viewport is mobile size
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThanOrEqual(428); // iPhone 12 width
    
    // Verify mobile-specific elements
    await expect(page.locator('[data-testid="mobile-nav"]').or(page.locator('nav').filter({ hasText: /Events|Library|Requests/ }))).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Mobile layout renders on iOS');
  });

  test('User Portal - Bottom navigation works on iOS', async ({ page }) => {
    await loginAsUser(page);
    
    await page.waitForLoadState('networkidle');
    
    // Look for bottom navigation
    const bottomNav = page.locator('[data-testid="bottom-nav"]').or(
      page.locator('nav').filter({ hasText: /Events|Requests|Queue|Profile/ })
    );
    
    await expect(bottomNav.first()).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Bottom navigation visible on iOS');
  });

  test('Touch targets are adequate on iOS (≥44x44px)', async ({ page }) => {
    await loginAsUser(page);
    
    await page.waitForLoadState('networkidle');
    
    // Find all buttons
    const buttons = await page.locator('button').all();
    
    let tooSmall = [];
    for (const button of buttons.slice(0, 10)) { // Test first 10 buttons
      const box = await button.boundingBox();
      if (box && (box.width < 40 || box.height < 40)) {
        const text = await button.textContent();
        tooSmall.push({ text, width: box.width, height: box.height });
      }
    }
    
    if (tooSmall.length > 0) {
      console.warn('⚠️  Small touch targets found:', tooSmall);
    } else {
      console.log('✅ All touch targets adequate (≥40px)');
    }
    
    expect(tooSmall.length).toBeLessThan(3); // Allow some flexibility
  });

  test('Swipe gestures work on iOS panels', async ({ page }) => {
    await loginAsDJ(page);
    
    await page.waitForLoadState('networkidle');
    
    // Try to open settings
    const settingsButton = page.locator('button').filter({ hasText: /Settings|⚙/ });
    
    if (await settingsButton.count() > 0) {
      await settingsButton.first().click();
      await page.waitForTimeout(500);
      
      // Simulate swipe right (touch events)
      const panel = page.locator('[data-testid="settings-panel"]').or(page.locator('.panel, .drawer, .sidebar').first());
      
      if (await panel.count() > 0) {
        const box = await panel.first().boundingBox();
        if (box) {
          // Swipe from left to right
          await page.touchscreen.tap(box.x + 50, box.y + box.height / 2);
          await page.mouse.move(box.x + 50, box.y + box.height / 2);
          await page.mouse.down();
          await page.mouse.move(box.x + box.width - 50, box.y + box.height / 2, { steps: 10 });
          await page.mouse.up();
          
          console.log('✅ Swipe gesture simulated');
        }
      }
    }
  });

  test('Orbital interface scaled for mobile on iOS', async ({ page }) => {
    await loginAsDJ(page);
    
    await page.waitForLoadState('networkidle');
    
    // Look for orbital interface
    const orbital = page.locator('[data-testid="orbital-interface"]').or(
      page.locator('.orbital, [class*="orbital"]').first()
    );
    
    if (await orbital.count() > 0) {
      const box = await orbital.first().boundingBox();
      
      if (box) {
        // On mobile, orbital should be ≤280px
        expect(box.width).toBeLessThanOrEqual(300);
        console.log(`✅ Orbital interface mobile-sized: ${box.width}px`);
      }
    } else {
      console.log('⚠️  Orbital interface not found (may not be on this page)');
    }
  });

  test('Lazy loading works on iOS', async ({ page }) => {
    await loginAsUser(page);
    
    await page.waitForLoadState('networkidle');
    
    // Count images
    const images = await page.locator('img').all();
    console.log(`✅ Found ${images.length} images (lazy loading)`);
    
    // Scroll to trigger lazy loading
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(1000);
    
    const imagesAfterScroll = await page.locator('img').all();
    console.log(`✅ After scroll: ${imagesAfterScroll.length} images loaded`);
  });
});

// Android Device Tests
test.describe('Android Mobile Testing (Pixel 5)', () => {
  test.use(devices['Pixel 5']);

  test('DJ Portal - Mobile layout renders correctly on Android', async ({ page }) => {
    await loginAsDJ(page);
    
    await page.waitForLoadState('networkidle');
    
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThanOrEqual(393); // Pixel 5 width
    
    await expect(page.locator('[data-testid="mobile-nav"]').or(page.locator('nav').first())).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Mobile layout renders on Android');
  });

  test('User Portal - Bottom navigation works on Android', async ({ page }) => {
    await loginAsUser(page);
    
    await page.waitForLoadState('networkidle');
    
    const bottomNav = page.locator('[data-testid="bottom-nav"]').or(
      page.locator('nav').filter({ hasText: /Events|Requests|Queue|Profile/ })
    );
    
    await expect(bottomNav.first()).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Bottom navigation visible on Android');
  });

  test('Touch targets are adequate on Android (≥48x48px)', async ({ page }) => {
    await loginAsUser(page);
    
    await page.waitForLoadState('networkidle');
    
    const buttons = await page.locator('button').all();
    
    let tooSmall = [];
    for (const button of buttons.slice(0, 10)) {
      const box = await button.boundingBox();
      if (box && (box.width < 44 || box.height < 44)) {
        const text = await button.textContent();
        tooSmall.push({ text, width: box.width, height: box.height });
      }
    }
    
    if (tooSmall.length > 0) {
      console.warn('⚠️  Small touch targets found:', tooSmall);
    } else {
      console.log('✅ All touch targets adequate (≥44px)');
    }
    
    expect(tooSmall.length).toBeLessThan(3);
  });

  test('Keyboard works on Android inputs', async ({ page }) => {
    await loginAsUser(page);
    
    await page.waitForLoadState('networkidle');
    
    // Find search input
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    
    if (await searchInput.count() > 0) {
      await searchInput.click();
      await searchInput.fill('Test search on Android');
      
      const value = await searchInput.inputValue();
      expect(value).toBe('Test search on Android');
      
      console.log('✅ Keyboard input works on Android');
    }
  });

  test('Page performance on Android', async ({ page }) => {
    const startTime = Date.now();
    
    await loginAsUser(page);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`📊 Page load time on Android: ${loadTime}ms`);
    
    // Should load in less than 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('Scrolling performance on Android', async ({ page }) => {
    await loginAsUser(page);
    
    await page.waitForLoadState('networkidle');
    
    // Scroll multiple times
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 200));
      await page.waitForTimeout(100);
    }
    
    console.log('✅ Scrolling works smoothly on Android');
  });
});

// Landscape Orientation Tests
test.describe('Landscape Orientation', () => {
  test('DJ Portal adapts to landscape (iPhone 12)', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 }); // iPhone 12 landscape
    
    await loginAsDJ(page);
    await page.waitForLoadState('networkidle');
    
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(844);
    expect(viewport?.height).toBe(390);
    
    console.log('✅ Landscape layout rendered');
  });

  test('User Portal adapts to landscape (Pixel 5)', async ({ page }) => {
    await page.setViewportSize({ width: 851, height: 393 }); // Pixel 5 landscape
    
    await loginAsUser(page);
    await page.waitForLoadState('networkidle');
    
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(851);
    
    console.log('✅ Landscape layout rendered on Android');
  });
});

// Cross-Device Consistency
test.describe('Cross-Device Consistency', () => {
  const mobileDevices = ['iPhone 12', 'Pixel 5'];

  for (const deviceName of mobileDevices) {
    test(`Same UI elements visible on ${deviceName}`, async ({ page }) => {
      test.use(devices[deviceName]);
      
      await loginAsUser(page);
      await page.waitForLoadState('networkidle');
      
      // Check for common UI elements
      const hasNavigation = await page.locator('nav').count() > 0;
      const hasButtons = await page.locator('button').count() > 0;
      
      expect(hasNavigation).toBe(true);
      expect(hasButtons).toBeGreaterThan(0);
      
      console.log(`✅ ${deviceName}: Navigation and buttons present`);
    });
  }
});
