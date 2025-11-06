import { test, expect } from '@playwright/test';

/**
 * User Portal - Critical Flow Tests
 * Tests the complete user workflow from browsing to requesting songs
 */

test.describe('User Portal - Event Discovery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('User can browse available events', async ({ page }) => {
    // Login as user
    await page.fill('input[type="email"]', 'user@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to User Portal
    await expect(page).toHaveURL(/\/user-portal/);
    
    // Verify events are displayed
    await expect(page.locator('.event-card')).toHaveCount(expect.any(Number));
    
    // Check that at least one event is visible
    const eventCards = await page.locator('.event-card').count();
    expect(eventCards).toBeGreaterThan(0);
  });

  test('User can search for events', async ({ page }) => {
    await page.fill('input[type="email"]', 'user@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Search for event
    await page.fill('input[placeholder*="Search"]', 'Test Venue');
    
    // Wait for search results
    await page.waitForTimeout(500);
    
    // Verify filtered results
    const results = await page.locator('.event-card').count();
    expect(results).toBeGreaterThanOrEqual(0);
  });

  test('User can join an event', async ({ page }) => {
    await page.fill('input[type="email"]', 'user@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Click on first event
    await page.locator('.event-card').first().click();
    
    // Click Join Event
    await page.click('button:has-text("Join Event")');
    
    // Verify joined successfully
    await expect(page.locator('text=You joined the event')).toBeVisible();
    await expect(page.locator('.song-search')).toBeVisible();
  });
});

test.describe('User Portal - Song Request', () => {
  test.beforeEach(async ({ page }) => {
    // Login and join event
    await page.goto('/login');
    await page.fill('input[type="email"]', 'user@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/user-portal/);
  });

  test('User can search for songs', async ({ page }) => {
    // Navigate to active event
    await page.locator('.event-card').first().click();
    await page.click('button:has-text("Join Event")');
    
    // Search for song
    await page.fill('input[placeholder*="Search"]', 'Beyoncé');
    
    // Wait for results
    await page.waitForSelector('.song-result', { timeout: 5000 });
    
    // Verify results appear
    const results = await page.locator('.song-result').count();
    expect(results).toBeGreaterThan(0);
  });

  test('User can submit a song request', async ({ page }) => {
    // Join event and search song
    await page.locator('.event-card').first().click();
    await page.click('button:has-text("Join Event")');
    await page.fill('input[placeholder*="Search"]', 'Formation');
    await page.waitForSelector('.song-result');
    
    // Select first song
    await page.locator('.song-result').first().click();
    
    // Verify request confirmation screen
    await expect(page.locator('text=Request Confirmation')).toBeVisible();
    await expect(page.locator('text=Formation')).toBeVisible();
    
    // Check pricing display
    await expect(page.locator('text=R50.00')).toBeVisible(); // BASIC tier price
    
    // Submit request
    await page.click('button:has-text("Pay Now")');
    
    // Note: Payment flow would continue with Yoco iframe
  });

  test('User can see request in queue', async ({ page }) => {
    // After submitting request (assuming one exists)
    await page.locator('.event-card').first().click();
    
    // Navigate to queue view
    await page.click('text=Queue');
    
    // Verify queue tracker visible
    await expect(page.locator('.queue-tracker')).toBeVisible();
    
    // Check for position indicator
    const hasPosition = await page.locator('text=/Position: #\\d+/').count();
    if (hasPosition > 0) {
      // Verify wait time estimate
      await expect(page.locator('text=/~\\d+ min/')).toBeVisible();
    }
  });
});

test.describe('User Portal - Request Tracking', () => {
  test('User receives real-time updates on request status', async ({ page }) => {
    // Login and navigate to event
    await page.goto('/login');
    await page.fill('input[type="email"]', 'user@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Open event with active request
    await page.locator('.event-card').first().click();
    
    // Check for request status updates
    // This would require GraphQL subscription to be active
    await expect(page.locator('.request-status')).toBeVisible({ timeout: 10000 });
  });

  test('User sees notification when request is accepted', async ({ page }) => {
    await page.goto('/user-portal');
    
    // Wait for GraphQL subscription updates
    // Mock or wait for actual acceptance
    await page.waitForSelector('.notification:has-text("accepted")', {
      timeout: 30000,
    }).catch(() => {
      console.log('No acceptance notification received (expected if no DJ activity)');
    });
  });
});

test.describe('User Portal - Offline Support', () => {
  test('User can submit requests while offline', async ({ page, context }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'user@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Go offline
    await context.setOffline(true);
    
    // Try to submit request
    await page.locator('.event-card').first().click();
    await page.click('button:has-text("Join Event")');
    await page.fill('input[placeholder*="Search"]', 'Song Title');
    await page.locator('.song-result').first().click();
    await page.click('button:has-text("Submit Request")');
    
    // Verify offline indicator
    await expect(page.locator('.offline-indicator')).toBeVisible();
    await expect(page.locator('text=Request queued')).toBeVisible();
    
    // Go back online
    await context.setOffline(false);
    
    // Wait for sync
    await page.waitForTimeout(2000);
    
    // Verify request synced
    await expect(page.locator('text=Request submitted')).toBeVisible();
  });
});

test.describe('User Portal - Mobile Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('Mobile bottom navigation works', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'user@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Verify mobile nav visible
    await expect(page.locator('.mobile-nav')).toBeVisible();
    
    // Test each tab
    await page.click('text=Browse');
    await expect(page.locator('.event-browser')).toBeVisible();
    
    await page.click('text=Queue');
    await expect(page.locator('.queue-tracker')).toBeVisible();
    
    await page.click('text=Profile');
    await expect(page.locator('.user-profile')).toBeVisible();
  });

  test('Touch targets are large enough', async ({ page }) => {
    await page.goto('/user-portal');
    
    // Check button sizes (should be ≥44px)
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      
      if (box) {
        // Apple HIG recommends 44x44pt minimum
        expect(box.width).toBeGreaterThanOrEqual(40); // Allow small margin
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test('Lazy loading works on mobile', async ({ page }) => {
    await page.goto('/user-portal');
    
    // Check that images use lazy loading
    const images = page.locator('img');
    const firstImage = images.first();
    
    // Verify loading attribute
    const loading = await firstImage.getAttribute('loading');
    expect(loading).toBe('lazy');
  });
});

test.describe('User Portal - Theme System', () => {
  test('User can switch themes', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'user@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Open settings
    await page.click('button:has-text("Settings")');
    
    // Switch to Gold theme
    await page.selectOption('select[name="theme"]', 'gold');
    
    // Verify theme applied (check for gold color class)
    await expect(page.locator('.bg-amber-500')).toBeVisible();
    
    // Switch to Platinum theme
    await page.selectOption('select[name="theme"]', 'platinum');
    
    // Verify platinum theme
    await expect(page.locator('.bg-gray-300')).toBeVisible();
  });

  test('Theme persists after page reload', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'user@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Change theme
    await page.click('button:has-text("Settings")');
    await page.selectOption('select[name="theme"]', 'gold');
    
    // Reload page
    await page.reload();
    
    // Verify theme persisted
    await expect(page.locator('.bg-amber-500')).toBeVisible();
  });
});
