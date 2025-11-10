# Testing Guide - Phase 6

**Date:** November 9, 2025  
**Status:** Ready for Implementation

---

## 🧪 Testing Strategy

### Testing Pyramid
```
        E2E Tests (10%)
       ↗            ↖
  Integration Tests (30%)
 ↗                      ↖
Unit Tests (60%)
```

---

## 📋 Phase 6.1: Testing Setup

### 1. Detox E2E Testing Setup

#### Installation
```bash
cd mobile
npm install --save-dev detox jest
```

#### Configuration Files

**detox.config.js:**
```javascript
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js'
    },
    jest: {
      setupTimeout: 120000
    }
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/BeatMatchMe.app',
      build: 'xcodebuild -workspace ios/BeatMatchMe.xcworkspace -scheme BeatMatchMe -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug && cd ..'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_5_API_31'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug'
    }
  }
};
```

#### E2E Test Examples

**e2e/auth.test.js:**
```javascript
describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show login screen on launch', async () => {
    await expect(element(by.id('login-screen'))).toBeVisible();
  });

  it('should login successfully with valid credentials', async () => {
    await element(by.id('email-input')).typeText('dj@beatmatchme.com');
    await element(by.id('password-input')).typeText('Test123!');
    await element(by.id('login-button')).tap();
    
    await waitFor(element(by.id('dj-portal')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should show error with invalid credentials', async () => {
    await element(by.id('email-input')).typeText('wrong@email.com');
    await element(by.id('password-input')).typeText('wrong');
    await element(by.id('login-button')).tap();
    
    await expect(element(by.text('Invalid credentials'))).toBeVisible();
  });

  it('should navigate to signup screen', async () => {
    await element(by.id('signup-link')).tap();
    await expect(element(by.id('signup-screen'))).toBeVisible();
  });
});
```

**e2e/djPortal.test.js:**
```javascript
describe('DJ Portal', () => {
  beforeAll(async () => {
    await device.launchApp();
    // Login as DJ
    await element(by.id('email-input')).typeText('dj@beatmatchme.com');
    await element(by.id('password-input')).typeText('Test123!');
    await element(by.id('login-button')).tap();
    await waitFor(element(by.id('dj-portal'))).toBeVisible().withTimeout(5000);
  });

  it('should display queue with requests', async () => {
    await expect(element(by.id('queue-list'))).toBeVisible();
  });

  it('should accept a request', async () => {
    await element(by.id('request-0')).swipe('up', 'fast');
    await expect(element(by.text('Request accepted'))).toBeVisible();
  });

  it('should veto a request', async () => {
    await element(by.id('request-1')).swipe('down', 'fast');
    await expect(element(by.text('Request vetoed'))).toBeVisible();
  });

  it('should toggle between orbital and list view', async () => {
    await element(by.id('view-toggle')).tap();
    await expect(element(by.id('list-view'))).toBeVisible();
    
    await element(by.id('view-toggle')).tap();
    await expect(element(by.id('orbital-view'))).toBeVisible();
  });

  it('should navigate to library', async () => {
    await element(by.id('library-tab')).tap();
    await expect(element(by.id('library-screen'))).toBeVisible();
  });

  it('should navigate to settings', async () => {
    await element(by.id('settings-tab')).tap();
    await expect(element(by.id('settings-screen'))).toBeVisible();
  });
});
```

**e2e/userPortal.test.js:**
```javascript
describe('User Portal', () => {
  beforeAll(async () => {
    await device.launchApp();
    // Login as User
    await element(by.id('email-input')).typeText('user@beatmatchme.com');
    await element(by.id('password-input')).typeText('Test123!');
    await element(by.id('login-button')).tap();
    await waitFor(element(by.id('user-portal'))).toBeVisible().withTimeout(5000);
  });

  it('should display event discovery', async () => {
    await expect(element(by.id('event-discovery'))).toBeVisible();
  });

  it('should swipe right to join event', async () => {
    await element(by.id('event-card')).swipe('right', 'fast');
    await expect(element(by.id('song-browsing'))).toBeVisible();
  });

  it('should browse songs', async () => {
    await element(by.id('event-0')).tap();
    await waitFor(element(by.id('song-list'))).toBeVisible().withTimeout(3000);
    await expect(element(by.id('song-0'))).toBeVisible();
  });

  it('should submit song request', async () => {
    await element(by.id('event-0')).tap();
    await waitFor(element(by.id('song-list'))).toBeVisible().withTimeout(3000);
    await element(by.id('song-0')).tap();
    
    await element(by.id('dedication-input')).typeText('Great song!');
    await element(by.id('submit-request')).tap();
    
    await expect(element(by.id('payment-screen'))).toBeVisible();
  });

  it('should track queue position', async () => {
    // After submitting request
    await expect(element(by.id('queue-position'))).toBeVisible();
    await expect(element(by.text('#1'))).toBeVisible();
  });
});
```

---

### 2. Unit Tests

#### Setup
```bash
npm install --save-dev @testing-library/react-native @testing-library/jest-native
```

#### Test Examples

**__tests__/utils/errorHandling.test.ts:**
```typescript
import { handleNetworkError, isNetworkError, isAuthError } from '../../src/utils/errorHandling';

describe('errorHandling', () => {
  describe('handleNetworkError', () => {
    it('should handle 401 error', () => {
      const error = { networkError: { statusCode: 401 } };
      const result = handleNetworkError(error);
      
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.message).toContain('Session expired');
    });

    it('should handle network failure', () => {
      const error = { networkError: { message: 'Network request failed' } };
      const result = handleNetworkError(error);
      
      expect(result.code).toBe('NO_CONNECTION');
      expect(result.message).toContain('No internet connection');
    });

    it('should handle GraphQL errors', () => {
      const error = {
        graphQLErrors: [{ message: 'Custom error', extensions: { code: 'CUSTOM' } }]
      };
      const result = handleNetworkError(error);
      
      expect(result.code).toBe('CUSTOM');
      expect(result.message).toBe('Custom error');
    });
  });

  describe('isNetworkError', () => {
    it('should return true for network errors', () => {
      expect(isNetworkError({ networkError: {} })).toBe(true);
      expect(isNetworkError({ message: 'Network request failed' })).toBe(true);
    });

    it('should return false for non-network errors', () => {
      expect(isNetworkError({ graphQLErrors: [] })).toBe(false);
    });
  });

  describe('isAuthError', () => {
    it('should return true for auth errors', () => {
      expect(isAuthError({ networkError: { statusCode: 401 } })).toBe(true);
    });

    it('should return false for non-auth errors', () => {
      expect(isAuthError({ networkError: { statusCode: 500 } })).toBe(false);
    });
  });
});
```

**__tests__/utils/caching.test.ts:**
```typescript
import { cacheManager, CACHE_KEYS } from '../../src/utils/caching';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

describe('cacheManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('set', () => {
    it('should store data in cache', async () => {
      const data = { test: 'value' };
      await cacheManager.set('test-key', data);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@BeatMatchMe:test-key',
        expect.stringContaining('"test":"value"')
      );
    });
  });

  describe('get', () => {
    it('should retrieve cached data', async () => {
      const data = { test: 'value' };
      const cacheItem = { data, timestamp: Date.now() };
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cacheItem));
      
      const result = await cacheManager.get('test-key');
      expect(result).toEqual(data);
    });

    it('should return null for expired cache', async () => {
      const data = { test: 'value' };
      const cacheItem = { data, timestamp: Date.now() - 10 * 60 * 1000 }; // 10 minutes ago
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cacheItem));
      
      const result = await cacheManager.get('test-key', 5 * 60 * 1000); // 5 minute expiry
      expect(result).toBeNull();
    });
  });

  describe('getOrFetch', () => {
    it('should return cached data if available', async () => {
      const cachedData = { test: 'cached' };
      jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedData);
      
      const fetchFn = jest.fn();
      const result = await cacheManager.getOrFetch('test-key', fetchFn);
      
      expect(result).toEqual(cachedData);
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('should fetch and cache if not available', async () => {
      const freshData = { test: 'fresh' };
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(cacheManager, 'set').mockResolvedValue();
      
      const fetchFn = jest.fn().mockResolvedValue(freshData);
      const result = await cacheManager.getOrFetch('test-key', fetchFn);
      
      expect(result).toEqual(freshData);
      expect(fetchFn).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith('test-key', freshData, expect.any(Number));
    });
  });
});
```

**__tests__/hooks/useQueue.test.ts:**
```typescript
import { renderHook, waitFor } from '@testing-library/react-native';
import { useQueue } from '../../src/hooks/useQueue';
import { useQuery } from '@apollo/client';

jest.mock('@apollo/client');

describe('useQueue', () => {
  it('should return queue data', async () => {
    const mockData = {
      getSet: {
        orderedRequests: [
          { id: '1', songTitle: 'Test Song' }
        ]
      }
    };

    (useQuery as jest.Mock).mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refetch: jest.fn()
    });

    const { result } = renderHook(() => useQueue('set-123'));

    await waitFor(() => {
      expect(result.current.queue).toEqual(mockData.getSet);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle loading state', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: jest.fn()
    });

    const { result } = renderHook(() => useQueue('set-123'));

    expect(result.current.loading).toBe(true);
    expect(result.current.queue).toBeNull();
  });

  it('should handle error state', () => {
    const mockError = new Error('Failed to fetch');
    
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: mockError,
      refetch: jest.fn()
    });

    const { result } = renderHook(() => useQueue('set-123'));

    expect(result.current.error).toEqual(mockError);
  });
});
```

---

### 3. Integration Tests

**__tests__/integration/requestFlow.test.tsx:**
```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MockedProvider } from '@apollo/client/testing';
import UserPortalScreen from '../../src/screens/UserPortal';
import { SUBMIT_REQUEST } from '../../src/services/graphql';

const mocks = [
  {
    request: {
      query: SUBMIT_REQUEST,
      variables: {
        input: {
          setId: 'set-123',
          songId: 'song-456',
          dedicationMessage: 'Test',
          price: 50
        }
      }
    },
    result: {
      data: {
        submitRequest: {
          id: 'request-789',
          status: 'PENDING'
        }
      }
    }
  }
];

describe('Request Flow Integration', () => {
  it('should complete full request flow', async () => {
    const { getByTestId, getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <UserPortalScreen />
      </MockedProvider>
    );

    // Select event
    fireEvent.press(getByTestId('event-0'));

    // Wait for songs to load
    await waitFor(() => {
      expect(getByTestId('song-list')).toBeTruthy();
    });

    // Select song
    fireEvent.press(getByTestId('song-0'));

    // Enter dedication
    fireEvent.changeText(getByTestId('dedication-input'), 'Test');

    // Submit request
    fireEvent.press(getByTestId('submit-button'));

    // Verify payment screen
    await waitFor(() => {
      expect(getByTestId('payment-screen')).toBeTruthy();
    });
  });
});
```

---

## 📊 Test Coverage Goals

### Minimum Coverage
- **Unit Tests:** 80% coverage
- **Integration Tests:** 60% coverage
- **E2E Tests:** Critical paths only

### Critical Paths to Test
1. Authentication (login/signup/logout)
2. DJ queue management (accept/veto)
3. User request flow (browse/request/pay)
4. Real-time updates
5. Error handling
6. Theme switching

---

## 🚀 Running Tests

### Unit Tests
```bash
npm test
npm test -- --coverage
npm test -- --watch
```

### E2E Tests
```bash
# iOS
detox build --configuration ios.sim.debug
detox test --configuration ios.sim.debug

# Android
detox build --configuration android.emu.debug
detox test --configuration android.emu.debug
```

### All Tests
```bash
npm run test:all
```

---

## ✅ Testing Checklist

### Unit Tests
- [ ] Error handling utilities
- [ ] Caching utilities
- [ ] Image optimization
- [ ] Haptic feedback
- [ ] All custom hooks
- [ ] Helper functions

### Integration Tests
- [ ] Authentication flow
- [ ] Request submission flow
- [ ] Queue management
- [ ] Real-time updates
- [ ] Payment integration

### E2E Tests
- [ ] Login/logout
- [ ] DJ Portal navigation
- [ ] User Portal navigation
- [ ] Request flow end-to-end
- [ ] Theme switching
- [ ] Offline scenarios

---

*Testing Guide Version: 1.0*  
*Ready for Phase 6 Implementation*
