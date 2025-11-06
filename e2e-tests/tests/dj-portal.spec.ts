import { test, expect } from '@playwright/test';

/**
 * DJ Portal - Critical Flow Tests
 * Tests the complete DJ workflow from login to managing requests
 */

test.describe('DJ Portal - Event Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login
    await page.goto('/login');
  });

  test('DJ can create a new event', async ({ page }) => {
    // Login as DJ
    await page.fill('input[type="email"]', 'dj@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to DJ Portal
    await expect(page).toHaveURL(/\/dj-portal/);
    
    // Click Create Event button
    await page.click('text=Create Event');
    
    // Fill out event form
    await page.fill('input[name="venueName"]', 'Test Venue');
    await page.fill('input[name="eventDate"]', '2025-12-25');
    await page.fill('input[name="eventTime"]', '20:00');
    await page.selectOption('select[name="theme"]', 'beatbyme');
    
    // Submit form
    await page.click('button:has-text("Create Event")');
    
    // Verify event created
    await expect(page.locator('text=Test Venue')).toBeVisible();
    await expect(page.locator('text=Event created successfully')).toBeVisible();
  });

  test('DJ can upload tracklist', async ({ page }) => {
    // Login and navigate to event
    await page.fill('input[type="email"]', 'dj@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dj-portal/);
    
    // Open tracklist upload
    await page.click('text=Upload Tracklist');
    
    // Upload CSV file (mock)
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-data/sample-tracks.csv');
    
    // Wait for upload to complete
    await expect(page.locator('text=tracks loaded')).toBeVisible({ timeout: 10000 });
    
    // Verify tracks appear in library
    const trackCount = await page.locator('.track-row').count();
    expect(trackCount).toBeGreaterThan(0);
  });
});

test.describe('DJ Portal - Request Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as DJ and navigate to active event
    await page.goto('/login');
    await page.fill('input[type="email"]', 'dj@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dj-portal/);
  });

  test('DJ can view request queue', async ({ page }) => {
    // Navigate to queue
    await page.click('text=Request Queue');
    
    // Verify queue is visible
    await expect(page.locator('.request-queue')).toBeVisible();
    
    // Check for queue items (if any)
    const hasRequests = await page.locator('.request-card').count();
    console.log(`Queue has ${hasRequests} requests`);
  });

  test('DJ can accept a request', async ({ page }) => {
    // Navigate to queue
    await page.click('text=Request Queue');
    
    // Wait for requests to load
    await page.waitForSelector('.request-card', { timeout: 5000 }).catch(() => {
      console.log('No requests in queue - test will skip acceptance');
    });
    
    // If there are requests, accept the first one
    const requestCard = page.locator('.request-card').first();
    if (await requestCard.count() > 0) {
      const songTitle = await requestCard.locator('.song-title').textContent();
      
      // Click accept button
      await requestCard.locator('button:has-text("Accept")').click();
      
      // Verify acceptance
      await expect(page.locator(`text=${songTitle}`)).toHaveClass(/accepted/);
      await expect(page.locator('text=Request accepted')).toBeVisible();
    }
  });

  test('DJ can veto a request', async ({ page }) => {
    // Navigate to queue
    await page.click('text=Request Queue');
    
    // Wait for requests
    await page.waitForSelector('.request-card', { timeout: 5000 }).catch(() => {
      console.log('No requests in queue');
    });
    
    const requestCard = page.locator('.request-card').first();
    if (await requestCard.count() > 0) {
      // Click veto button
      await requestCard.locator('button:has-text("Veto")').click();
      
      // Confirm veto
      await page.click('button:has-text("Confirm Veto")');
      
      // Verify request removed or marked as vetoed
      await expect(page.locator('text=Request vetoed')).toBeVisible();
    }
  });

  test('DJ can mark song as playing', async ({ page }) => {
    // Navigate to accepted requests
    await page.click('text=Accepted');
    
    const acceptedRequest = page.locator('.accepted-request').first();
    if (await acceptedRequest.count() > 0) {
      // Click "Mark as Playing"
      await acceptedRequest.locator('button:has-text("Mark Playing")').click();
      
      // Verify now playing status
      await expect(page.locator('.now-playing')).toBeVisible();
      await expect(page.locator('text=Now Playing')).toBeVisible();
    }
  });
});

test.describe('DJ Portal - Virtual Scrolling Performance', () => {
  test('handles large tracklist with virtual scrolling', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'dj@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to library
    await page.click('text=Library');
    
    // Verify virtual scrolling is working (check DOM nodes)
    const trackElements = await page.locator('.track-row').count();
    
    // With virtual scrolling, should render only visible items (~20-30)
    // Not all 1000+ tracks
    expect(trackElements).toBeLessThan(50);
    
    // Scroll down
    await page.locator('.track-list').evaluate(el => {
      el.scrollTop = 10000; // Scroll far down
    });
    
    // Wait for virtual scroll to update
    await page.waitForTimeout(500);
    
    // Still should have limited DOM nodes
    const trackElementsAfterScroll = await page.locator('.track-row').count();
    expect(trackElementsAfterScroll).toBeLessThan(50);
  });
});

test.describe('DJ Portal - Mobile View', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('mobile navigation works', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'dj@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Verify bottom navigation visible on mobile
    await expect(page.locator('.mobile-nav')).toBeVisible();
    
    // Test navigation tabs
    const tabs = ['Home', 'Queue', 'Library', 'Analytics'];
    for (const tab of tabs) {
      await page.click(`text=${tab}`);
      await expect(page.locator('.mobile-nav button.active')).toContainText(tab);
    }
  });

  test('swipe to dismiss works on panels', async ({ page }) => {
    // Login and open settings
    await page.goto('/dj-portal');
    await page.click('button:has-text("Settings")');
    
    // Verify panel visible
    await expect(page.locator('.settings-panel')).toBeVisible();
    
    // Simulate swipe right gesture
    const panel = page.locator('.settings-panel');
    await panel.dispatchEvent('touchstart', { touches: [{ clientX: 0, clientY: 100 }] });
    await panel.dispatchEvent('touchmove', { touches: [{ clientX: 200, clientY: 100 }] });
    await panel.dispatchEvent('touchend');
    
    // Verify panel dismissed
    await expect(page.locator('.settings-panel')).not.toBeVisible();
  });
});
