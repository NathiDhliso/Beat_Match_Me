import { Page, expect } from '@playwright/test';

/**
 * Authentication helpers for BeatMatchMe E2E tests
 */

// Load environment variables
const DJ_EMAIL = process.env.DJ_EMAIL || 'nkosinathi.dhliso@gmail.com';
const DJ_PASSWORD = process.env.DJ_PASSWORD || 'Magnox271991!';
const USER_EMAIL = process.env.USER_EMAIL || 'nkosimano@gmail.com';
const USER_PASSWORD = process.env.USER_PASSWORD || 'Magnox271991!';

/**
 * Login as DJ user
 */
export async function loginAsDJ(page: Page) {
  console.log('🎧 Logging in as DJ:', DJ_EMAIL);
  
  // Navigate to login page
  await page.goto('/login');
  
  // Wait for login form to be visible
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  
  // Fill in credentials
  await page.fill('input[type="email"]', DJ_EMAIL);
  await page.fill('input[type="password"]', DJ_PASSWORD);
  
  // Click login button
  await page.click('button[type="submit"]');
  
  // Wait for navigation to DJ Portal
  await page.waitForURL('**/dj-portal', { timeout: 30000 });
  
  // Verify we're on DJ Portal
  await expect(page).toHaveURL(/\/dj-portal/);
  
  console.log('✅ DJ login successful');
}

/**
 * Login as Audience user
 */
export async function loginAsUser(page: Page) {
  console.log('🎵 Logging in as Audience:', USER_EMAIL);
  
  // Navigate to login page
  await page.goto('/login');
  
  // Wait for login form to be visible
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  
  // Fill in credentials
  await page.fill('input[type="email"]', USER_EMAIL);
  await page.fill('input[type="password"]', USER_PASSWORD);
  
  // Click login button
  await page.click('button[type="submit"]');
  
  // Wait for navigation to User Portal
  await page.waitForURL('**/user-portal', { timeout: 30000 });
  
  // Verify we're on User Portal
  await expect(page).toHaveURL(/\/user-portal/);
  
  console.log('✅ User login successful');
}

/**
 * Logout current user
 */
export async function logout(page: Page) {
  console.log('🚪 Logging out...');
  
  // Try to find and click logout button
  // This may vary based on your UI - adjust selector as needed
  const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), [data-testid="logout-button"]').first();
  
  if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await logoutButton.click();
    await page.waitForURL('**/login', { timeout: 10000 });
    console.log('✅ Logout successful');
  } else {
    // If no logout button, clear storage and navigate to login
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    console.log('✅ Session cleared');
  }
}

/**
 * Wait for GraphQL response
 */
export async function waitForGraphQL(page: Page, operationName: string, timeout = 30000) {
  console.log(`⏳ Waiting for GraphQL operation: ${operationName}`);
  
  return page.waitForResponse(
    (response) => {
      const url = response.url();
      const isGraphQL = url.includes('/graphql') || url.includes('appsync');
      
      if (!isGraphQL) return false;
      
      // Check if this is the operation we're looking for
      return response.request().postDataJSON?.()?.operationName === operationName;
    },
    { timeout }
  );
}

/**
 * Wait for page to be fully loaded (no network activity)
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: 30000 });
  console.log('✅ Page fully loaded');
}

/**
 * Take screenshot with timestamp
 */
export async function takeTimestampedScreenshot(page: Page, name: string) {
  const timestamp = new Date().getTime();
  const path = `screenshots/${name}-${timestamp}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`📸 Screenshot saved: ${path}`);
  return path;
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    const currentUrl = page.url();
    return !currentUrl.includes('/login') && (
      currentUrl.includes('/dj-portal') || 
      currentUrl.includes('/user-portal')
    );
  } catch {
    return false;
  }
}

/**
 * Wait for element with retry
 */
export async function waitForElement(
  page: Page, 
  selector: string, 
  options: { timeout?: number; visible?: boolean } = {}
) {
  const { timeout = 10000, visible = true } = options;
  
  console.log(`⏳ Waiting for element: ${selector}`);
  
  const element = page.locator(selector);
  
  if (visible) {
    await element.waitFor({ state: 'visible', timeout });
  } else {
    await element.waitFor({ state: 'attached', timeout });
  }
  
  console.log(`✅ Element found: ${selector}`);
  return element;
}
