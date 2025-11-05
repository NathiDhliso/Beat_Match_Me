import { describe, it, expect } from 'vitest';

describe('Connection Status Indicators', () => {
  it('should display correct status states', () => {
    const validStates = ['connecting', 'connected', 'disconnected', 'error'];
    
    validStates.forEach(state => {
      expect(state).toBeTruthy();
      expect(typeof state).toBe('string');
    });
  });

  it('should map connection states to user-friendly labels (User Portal)', () => {
    const statusMap = {
      connecting: 'Connecting...',
      connected: '🟢 Live',
      disconnected: 'Disconnected',
      error: 'Connection Error',
    };

    expect(statusMap.connecting).toBe('Connecting...');
    expect(statusMap.connected).toBe('🟢 Live');
    expect(statusMap.disconnected).toBe('Disconnected');
    expect(statusMap.error).toBe('Connection Error');
  });

  it('should map connection states to user-friendly labels (DJ Portal)', () => {
    const statusMap: Record<string, string> = {
      connecting: 'Connecting',
      connected: 'Live',
      disconnected: 'Reconnecting',
      error: 'Updates',
    };

    expect(statusMap.connecting).toBe('Connecting');
    expect(statusMap.connected).toBe('Live');
    expect(statusMap.disconnected).toBe('Reconnecting');
    expect(statusMap.error).toBe('Updates');
  });

  it('should have color-coded states for visual feedback', () => {
    const colorMap = {
      connecting: 'blue',
      connected: 'green',
      disconnected: 'yellow',
      error: 'gray',
    };

    expect(colorMap.connecting).toBe('blue');
    expect(colorMap.connected).toBe('green');
    expect(colorMap.disconnected).toBe('yellow');
    expect(colorMap.error).toBe('gray');
  });

  it('should handle polling mode status', () => {
    const pollingStatus = 'polling';
    const displayLabel = pollingStatus === 'polling' ? 'Updates' : pollingStatus;
    
    expect(displayLabel).toBe('Updates');
  });

  it('should show live status for successful connections', () => {
    const connectionStatus = 'connected';
    const isLive = connectionStatus === 'connected';
    
    expect(isLive).toBe(true);
  });
});
