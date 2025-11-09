/**
 * Prevent Pull-to-Refresh Utility
 * Smart detection to prevent browser pull-to-refresh while allowing swipe gestures
 */

let lastTouchY = 0;
let preventPullToRefresh = false;

/**
 * Initialize pull-to-refresh prevention
 * Call this once in your app initialization
 */
export const initPullToRefreshPrevention = () => {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  // Handle touchstart - record initial position
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    lastTouchY = e.touches[0].clientY;
    
    // Check if we're at the top of the scrollable area
    const target = e.target as HTMLElement;
    const scrollableParent = findScrollableParent(target);
    
    if (scrollableParent) {
      preventPullToRefresh = scrollableParent.scrollTop === 0;
    } else {
      preventPullToRefresh = window.scrollY === 0;
    }
  }, { passive: false });

  // Handle touchmove - prevent default if pulling down from top
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 1) return;
    
    const touchY = e.touches[0].clientY;
    const deltaY = touchY - lastTouchY;
    
    // Only prevent if:
    // 1. We're at the top of the page/scroll container
    // 2. User is pulling down (positive deltaY)
    // 3. The movement is significant (> 5px to avoid blocking small movements)
    if (preventPullToRefresh && deltaY > 5) {
      // This is a pull-down gesture from the top - prevent browser refresh
      e.preventDefault();
    }
  }, { passive: false });

  // Reset on touchend
  document.addEventListener('touchend', () => {
    preventPullToRefresh = false;
  }, { passive: true });
};

/**
 * Find the nearest scrollable parent element
 */
function findScrollableParent(element: HTMLElement | null): HTMLElement | null {
  if (!element) return null;
  
  const { overflow, overflowY } = window.getComputedStyle(element);
  const isScrollable = /(auto|scroll)/.test(overflow + overflowY);
  
  if (isScrollable && element.scrollHeight > element.clientHeight) {
    return element;
  }
  
  return findScrollableParent(element.parentElement);
}

/**
 * Cleanup function - call when unmounting
 */
export const cleanupPullToRefreshPrevention = () => {
  // Note: We don't actually remove listeners here because they're on document
  // and should persist for the app lifetime. This is here for completeness.
};
