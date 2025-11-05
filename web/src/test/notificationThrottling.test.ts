import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Notification Throttling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should throttle notifications to minimum 2-second intervals (DJ Portal)', () => {
    const lastNotificationTime = { current: 0 };
    const notificationType = 'new_request';
    
    // Helper function (same as in DJPortalOrbital)
    const canNotify = (type: string): boolean => {
      const now = Date.now();
      const minInterval = 2000; // 2 seconds minimum between notifications
      
      if (now - lastNotificationTime.current < minInterval) {
        console.log(`Throttling ${type} notification - too soon`);
        return false;
      }
      
      lastNotificationTime.current = now;
      return true;
    };

    // First notification should go through
    expect(canNotify(notificationType)).toBe(true);
    
    // Immediate second notification should be throttled
    expect(canNotify(notificationType)).toBe(false);
    
    // Advance time by 1 second - still throttled
    vi.advanceTimersByTime(1000);
    expect(canNotify(notificationType)).toBe(false);
    
    // Advance time by another 1 second (total 2s) - should go through
    vi.advanceTimersByTime(1000);
    expect(canNotify(notificationType)).toBe(true);
  });

  it('should throttle notifications to minimum 5-second intervals (User Portal)', () => {
    const lastNotificationTimes = new Map<string, number>();
    
    // Helper function (same as in UserPortalInnovative)
    const shouldShowNotification = (type: string): boolean => {
      const now = Date.now();
      const lastTime = lastNotificationTimes.get(type) || 0;
      const minInterval = 5000; // 5 seconds minimum between same notification type
      
      if (now - lastTime < minInterval) {
        return false;
      }
      
      lastNotificationTimes.set(type, now);
      return true;
    };

    // First notification should go through
    expect(shouldShowNotification('position_update')).toBe(true);
    
    // Immediate second notification should be throttled
    expect(shouldShowNotification('position_update')).toBe(false);
    
    // Advance time by 3 seconds - still throttled
    vi.advanceTimersByTime(3000);
    expect(shouldShowNotification('position_update')).toBe(false);
    
    // Advance time by another 2 seconds (total 5s) - should go through
    vi.advanceTimersByTime(2000);
    expect(shouldShowNotification('position_update')).toBe(true);
  });

  it('should allow different notification types independently (User Portal)', () => {
    const lastNotificationTimes = new Map<string, number>();
    
    const shouldShowNotification = (type: string): boolean => {
      const now = Date.now();
      const lastTime = lastNotificationTimes.get(type) || 0;
      const minInterval = 5000;
      
      if (now - lastTime < minInterval) {
        return false;
      }
      
      lastNotificationTimes.set(type, now);
      return true;
    };

    // First notification type A
    expect(shouldShowNotification('position_update')).toBe(true);
    
    // Different notification type B should also go through
    expect(shouldShowNotification('request_accepted')).toBe(true);
    
    // Type A throttled
    expect(shouldShowNotification('position_update')).toBe(false);
    
    // Type B also throttled
    expect(shouldShowNotification('request_accepted')).toBe(false);
    
    // Advance 5 seconds
    vi.advanceTimersByTime(5000);
    
    // Both types should now be allowed
    expect(shouldShowNotification('position_update')).toBe(true);
    expect(shouldShowNotification('request_accepted')).toBe(true);
  });

  it('should prevent notification spam with rapid queue updates', () => {
    let notificationCount = 0;
    const lastNotificationTime = { current: 0 };
    
    const tryNotify = (): boolean => {
      const now = Date.now();
      if (now - lastNotificationTime.current < 2000) {
        return false;
      }
      lastNotificationTime.current = now;
      notificationCount++;
      return true;
    };

    // Simulate 100 rapid queue updates (unrealistic but tests throttling)
    for (let i = 0; i < 100; i++) {
      tryNotify();
      vi.advanceTimersByTime(100); // 100ms between updates
    }

    // With 100ms intervals over 100 updates = 10 seconds total
    // At 2-second throttle: expect max 5-6 notifications
    expect(notificationCount).toBeLessThanOrEqual(6);
    expect(notificationCount).toBeGreaterThanOrEqual(4);
  });

  it('should reset throttle after sufficient time has passed', () => {
    const lastNotificationTime = { current: 0 };
    
    const canNotify = (): boolean => {
      const now = Date.now();
      if (now - lastNotificationTime.current < 2000) {
        return false;
      }
      lastNotificationTime.current = now;
      return true;
    };

    // First notification
    expect(canNotify()).toBe(true);
    
    // Wait 10 seconds (way past throttle interval)
    vi.advanceTimersByTime(10000);
    
    // Should definitely be allowed
    expect(canNotify()).toBe(true);
  });
});
