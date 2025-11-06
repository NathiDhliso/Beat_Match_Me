/**
 * Queue Management End-to-End Tests
 * Tests atomic queue operations, race condition prevention, and capacity limits
 * Covers P0-3 and P0-4 fixes
 */

const AWS = require('aws-sdk');

// Create shared mock promise functions
const mockGetPromise = jest.fn();
const mockPutPromise = jest.fn();
const mockQueryPromise = jest.fn();
const mockUpdatePromise = jest.fn();
const mockTransactWritePromise = jest.fn();

// Mock AWS SDK
jest.mock('aws-sdk', () => {
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => ({
        get: jest.fn(() => ({ promise: mockGetPromise })),
        put: jest.fn(() => ({ promise: mockPutPromise })),
        query: jest.fn(() => ({ promise: mockQueryPromise })),
        update: jest.fn(() => ({ promise: mockUpdatePromise })),
        transactWrite: jest.fn(() => ({ promise: mockTransactWritePromise })),
      })),
    },
  };
});

const { handler: createRequest } = require('../../aws/lambda/createRequest/index.js');

describe('Queue Management E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset environment
    process.env.EVENTS_TABLE = 'beatmatchme-events-test';
    process.env.REQUESTS_TABLE = 'beatmatchme-requests-test';
    process.env.QUEUES_TABLE = 'beatmatchme-queues-test';
  });

  describe('✅ P0-3: Pre-Creation Validation', () => {
    test('should reject request for non-existent event', async () => {
      // Mock event not found
      mockGetPromise.mockResolvedValueOnce({});

      const event = {
        arguments: {
          input: {
            eventId: 'event_nonexistent',
            songTitle: 'Test Song',
            artistName: 'Test Artist',
            requestType: 'STANDARD',
          },
        },
        identity: { sub: 'user_123' },
      };

      await expect(createRequest(event)).rejects.toThrow('EVENT_NOT_FOUND');
    });

    test('should reject request for inactive event', async () => {
      // Mock inactive event
      mockGetPromise.mockResolvedValueOnce({
        Item: {
          eventId: 'event_inactive',
          status: 'ENDED',
          settings: { maxRequests: 100 },
        },
      });

      const event = {
        arguments: {
          input: {
            eventId: 'event_inactive',
            songTitle: 'Test Song',
            artistName: 'Test Artist',
            requestType: 'STANDARD',
          },
        },
        identity: { sub: 'user_123' },
      };

      await expect(createRequest(event)).rejects.toThrow('EVENT_NOT_ACTIVE');
    });

    test('should enforce rate limiting (max 3 requests per hour)', async () => {
      // Mock active event
      mockGetPromise.mockResolvedValueOnce({
        Item: {
          eventId: 'event_active',
          status: 'ACTIVE',
          settings: { standardPrice: 50, maxRequests: 100 },
        },
      });

      // Mock user exceeded rate limit (3 requests in last hour)
      mockQueryPromise.mockResolvedValueOnce({
        Count: 3, // Already hit limit
        Items: [],
      });

      const event = {
        arguments: {
          input: {
            eventId: 'event_active',
            songTitle: 'Test Song',
            artistName: 'Test Artist',
            requestType: 'STANDARD',
          },
        },
        identity: { sub: 'user_ratelimited' },
      };

      await expect(createRequest(event)).rejects.toThrow('RATE_LIMIT_EXCEEDED');
    });

    test('should reject duplicate song from same user in event', async () => {
      // Mock active event
      mockGetPromise.mockResolvedValueOnce({
        Item: {
          eventId: 'event_active',
          status: 'ACTIVE',
          settings: { standardPrice: 50, maxRequests: 100 },
        },
      });

      // Mock rate limit check (under limit)
      mockQueryPromise.mockResolvedValueOnce({
        Count: 1,
        Items: [],
      });

      // Mock recent duplicate check (no duplicates in 5 min)
      mockQueryPromise.mockResolvedValueOnce({
        Items: [],
      });

      // Mock duplicate song check (same song exists)
      mockQueryPromise.mockResolvedValueOnce({
        Items: [
          {
            requestId: 'req_existing',
            songTitle: 'Duplicate Song',
            artistName: 'Same Artist',
            status: 'PENDING',
          },
        ],
      });

      const event = {
        arguments: {
          input: {
            eventId: 'event_active',
            songTitle: 'Duplicate Song',
            artistName: 'Same Artist',
            requestType: 'STANDARD',
          },
        },
        identity: { sub: 'user_123' },
      };

      await expect(createRequest(event)).rejects.toThrow('DUPLICATE_SONG_REQUEST');
    });

    test('should enforce event capacity limits', async () => {
      // Mock active event with capacity limit
      mockGetPromise.mockResolvedValueOnce({
        Item: {
          eventId: 'event_full',
          status: 'ACTIVE',
          settings: { standardPrice: 50, maxRequests: 10 },
        },
      });

      // Mock rate limit check (under limit)
      mockQueryPromise.mockResolvedValueOnce({
        Count: 0,
        Items: [],
      });

      // Mock recent duplicate check
      mockQueryPromise.mockResolvedValueOnce({
        Items: [],
      });

      // Mock duplicate song check
      mockQueryPromise.mockResolvedValueOnce({
        Items: [],
      });

      // Mock capacity check (event is full)
      mockQueryPromise.mockResolvedValueOnce({
        Count: 10, // Already at max capacity
        Items: [],
      });

      const event = {
        arguments: {
          input: {
            eventId: 'event_full',
            songTitle: 'Test Song',
            artistName: 'Test Artist',
            requestType: 'STANDARD',
          },
        },
        identity: { sub: 'user_123' },
      };

      await expect(createRequest(event)).rejects.toThrow('EVENT_CAPACITY_EXCEEDED');
    });

    test('should validate payment transaction exists', async () => {
      // Mock active event
      mockGetPromise.mockResolvedValueOnce({
        Item: {
          eventId: 'event_paid',
          status: 'ACTIVE',
          settings: { standardPrice: 50, maxRequests: 100 },
        },
      });

      // Mock all validation checks pass
      mockQueryPromise.mockResolvedValueOnce({ Count: 0 });
      mockQueryPromise.mockResolvedValueOnce({ Items: [] });
      mockQueryPromise.mockResolvedValueOnce({ Items: [] });
      mockQueryPromise.mockResolvedValueOnce({ Count: 5 });

      // Mock transaction verification (transaction NOT found)
      mockGetPromise.mockResolvedValueOnce({});

      const event = {
        arguments: {
          input: {
            eventId: 'event_paid',
            songTitle: 'Test Song',
            artistName: 'Test Artist',
            requestType: 'STANDARD',
            transactionId: 'txn_nonexistent',
          },
        },
        identity: { sub: 'user_123' },
      };

      await expect(createRequest(event)).rejects.toThrow('PAYMENT_VERIFICATION_FAILED');
    });

    test('should validate price matches expected amount', async () => {
      // Mock active event
      mockGetPromise.mockResolvedValueOnce({
        Item: {
          eventId: 'event_price',
          status: 'ACTIVE',
          settings: { standardPrice: 50, maxRequests: 100 },
        },
      });

      // Mock validation checks pass
      mockQueryPromise.mockResolvedValueOnce({ Count: 0 });
      mockQueryPromise.mockResolvedValueOnce({ Items: [] });
      mockQueryPromise.mockResolvedValueOnce({ Items: [] });
      mockQueryPromise.mockResolvedValueOnce({ Count: 5 });

      // Mock transaction with WRONG price
      mockGetPromise.mockResolvedValueOnce({
        Item: {
          transactionId: 'txn_wrong_price',
          amount: 100, // Expected 50!
          status: 'COMPLETED',
        },
      });

      const event = {
        arguments: {
          input: {
            eventId: 'event_price',
            songTitle: 'Test Song',
            artistName: 'Test Artist',
            requestType: 'STANDARD',
            transactionId: 'txn_wrong_price',
          },
        },
        identity: { sub: 'user_123' },
      };

      await expect(createRequest(event)).rejects.toThrow('PRICE_MISMATCH');
    });
  });

  describe('✅ P0-4: Queue Race Condition Prevention', () => {
    test('should assign queue positions atomically for concurrent requests', async () => {
      const mockEvent = {
        Item: {
          eventId: 'event_concurrent',
          status: 'ACTIVE',
          settings: { standardPrice: 50, maxRequests: 100 },
        },
      };

      // Simulate 3 concurrent requests
      const concurrentRequests = [
        {
          arguments: {
            input: {
              eventId: 'event_concurrent',
              songTitle: 'Song 1',
              artistName: 'Artist 1',
              requestType: 'STANDARD',
            },
          },
          identity: { sub: 'user_1' },
        },
        {
          arguments: {
            input: {
              eventId: 'event_concurrent',
              songTitle: 'Song 2',
              artistName: 'Artist 2',
              requestType: 'STANDARD',
            },
          },
          identity: { sub: 'user_2' },
        },
        {
          arguments: {
            input: {
              eventId: 'event_concurrent',
              songTitle: 'Song 3',
              artistName: 'Artist 3',
              requestType: 'STANDARD',
            },
          },
          identity: { sub: 'user_3' },
        },
      ];

      // Mock setup for each request
      concurrentRequests.forEach((_, index) => {
        // Event lookup
        mockGetPromise.mockResolvedValueOnce(mockEvent);
        
        // Validation checks (all pass)
        mockQueryPromise.mockResolvedValueOnce({ Count: 0 }); // Rate limit
        mockQueryPromise.mockResolvedValueOnce({ Items: [] }); // Recent dupe
        mockQueryPromise.mockResolvedValueOnce({ Items: [] }); // Duplicate song
        mockQueryPromise.mockResolvedValueOnce({ Count: index }); // Capacity
        
        // Queue lookup (existing queue items)
        mockGetPromise.mockResolvedValueOnce({
          Item: {
            queueId: 'queue_concurrent',
            requests: Array(index).fill({ requestId: `existing_${index}` }),
          },
        });
        
        // Atomic queue update (using conditional write)
        mockUpdatePromise.mockResolvedValueOnce({});
        
        // Request creation
        mockPutPromise.mockResolvedValueOnce({});
      });

      // Execute all requests concurrently
      const results = await Promise.allSettled(
        concurrentRequests.map(req => createRequest(req))
      );

      // Verify all succeeded
      const succeeded = results.filter(r => r.status === 'fulfilled');
      expect(succeeded.length).toBe(3);

      // Verify atomic updates were used
      const updateCalls = mockDynamoDB.update.mock.calls;
      expect(updateCalls.length).toBe(3);
      
      // Verify conditional expressions (prevents race conditions)
      updateCalls.forEach(call => {
        const params = call[0];
        expect(params.UpdateExpression).toContain('list_append');
      });
    });

    test('should handle queue position conflicts gracefully', async () => {
      // Mock event
      mockGetPromise.mockResolvedValueOnce({
        Item: {
          eventId: 'event_conflict',
          status: 'ACTIVE',
          settings: { standardPrice: 50, maxRequests: 100 },
        },
      });

      // Mock validation checks pass
      mockQueryPromise.mockResolvedValueOnce({ Count: 0 });
      mockQueryPromise.mockResolvedValueOnce({ Items: [] });
      mockQueryPromise.mockResolvedValueOnce({ Items: [] });
      mockQueryPromise.mockResolvedValueOnce({ Count: 5 });

      // Mock queue lookup
      mockGetPromise.mockResolvedValueOnce({
        Item: {
          queueId: 'queue_conflict',
          requests: [
            { requestId: 'req_1', queuePosition: 1 },
            { requestId: 'req_2', queuePosition: 2 },
          ],
        },
      });

      // Mock atomic update (first attempt fails due to condition)
      const conditionalCheckError = new Error('ConditionalCheckFailedException');
      conditionalCheckError.code = 'ConditionalCheckFailedException';
      mockUpdatePromise.mockRejectedValueOnce(conditionalCheckError);

      // Mock retry with updated position
      mockGetPromise.mockResolvedValueOnce({
        Item: {
          queueId: 'queue_conflict',
          requests: [
            { requestId: 'req_1', queuePosition: 1 },
            { requestId: 'req_2', queuePosition: 2 },
            { requestId: 'req_3', queuePosition: 3 }, // New request added
          ],
        },
      });

      mockUpdatePromise.mockResolvedValueOnce({}); // Retry succeeds
      mockPutPromise.mockResolvedValueOnce({});

      const event = {
        arguments: {
          input: {
            eventId: 'event_conflict',
            songTitle: 'Test Song',
            artistName: 'Test Artist',
            requestType: 'STANDARD',
          },
        },
        identity: { sub: 'user_conflict' },
      };

      const result = await createRequest(event);

      // Should succeed after retry
      expect(result.success).toBe(true);
      expect(result.request.queuePosition).toBe(4); // Position 4 after 3 existing
    });
  });

  describe('🎯 P1-4: Request Deduplication (5-minute window)', () => {
    test('should return existing request for duplicate within 5 minutes', async () => {
      const existingRequest = {
        requestId: 'req_existing_recent',
        userId: 'user_123',
        eventId: 'event_active',
        songTitle: 'Same Song',
        artistName: 'Same Artist',
        queuePosition: 5,
        status: 'PENDING',
        price: 50,
        submittedAt: Date.now() - (2 * 60 * 1000), // 2 minutes ago
        transactionId: 'txn_existing',
      };

      // Mock event lookup
      mockGetPromise.mockResolvedValueOnce({
        Item: {
          eventId: 'event_active',
          status: 'ACTIVE',
          settings: { standardPrice: 50, maxRequests: 100 },
        },
      });

      // Mock rate limit check
      mockQueryPromise.mockResolvedValueOnce({ Count: 1 });

      // Mock recent duplicate check - FOUND!
      mockQueryPromise.mockResolvedValueOnce({
        Items: [existingRequest],
      });

      const event = {
        arguments: {
          input: {
            eventId: 'event_active',
            songTitle: 'Same Song',
            artistName: 'Same Artist',
            requestType: 'STANDARD',
          },
        },
        identity: { sub: 'user_123' },
      };

      const result = await createRequest(event);

      // Should return existing request (graceful handling)
      expect(result.success).toBe(true);
      expect(result.request.requestId).toBe('req_existing_recent');
      expect(result.request.queuePosition).toBe(5);
      
      // Should NOT create new request
      expect(mockDynamoDB.put).not.toHaveBeenCalled();
    });

    test('should create new request if duplicate is older than 5 minutes', async () => {
      // Mock event lookup
      mockGetPromise.mockResolvedValueOnce({
        Item: {
          eventId: 'event_active',
          status: 'ACTIVE',
          settings: { standardPrice: 50, maxRequests: 100 },
        },
      });

      // Mock validation checks
      mockQueryPromise.mockResolvedValueOnce({ Count: 1 }); // Rate limit
      mockQueryPromise.mockResolvedValueOnce({ Items: [] }); // No recent dupes
      mockQueryPromise.mockResolvedValueOnce({ Items: [] }); // No event dupes
      mockQueryPromise.mockResolvedValueOnce({ Count: 5 }); // Capacity OK

      // Mock queue operations
      mockGetPromise.mockResolvedValueOnce({
        Item: { queueId: 'queue_1', requests: [] },
      });
      mockUpdatePromise.mockResolvedValueOnce({});
      mockPutPromise.mockResolvedValueOnce({});

      const event = {
        arguments: {
          input: {
            eventId: 'event_active',
            songTitle: 'Old Song',
            artistName: 'Old Artist',
            requestType: 'STANDARD',
          },
        },
        identity: { sub: 'user_123' },
      };

      const result = await createRequest(event);

      // Should create NEW request
      expect(result.success).toBe(true);
      expect(mockDynamoDB.put).toHaveBeenCalled();
    });
  });

  describe('🎵 Request Type Priority Handling', () => {
    test('should place SPOTLIGHT request at position 1', async () => {
      // Mock event
      mockGetPromise.mockResolvedValueOnce({
        Item: {
          eventId: 'event_spotlight',
          status: 'ACTIVE',
          settings: { spotlightPrice: 200, maxRequests: 100 },
        },
      });

      // Mock validation checks
      mockQueryPromise.mockResolvedValueOnce({ Count: 0 });
      mockQueryPromise.mockResolvedValueOnce({ Items: [] });
      mockQueryPromise.mockResolvedValueOnce({ Items: [] });
      mockQueryPromise.mockResolvedValueOnce({ Count: 10 });

      // Mock queue with existing requests
      mockGetPromise.mockResolvedValueOnce({
        Item: {
          queueId: 'queue_spotlight',
          requests: [
            { requestId: 'req_std_1', queuePosition: 1, requestType: 'STANDARD' },
            { requestId: 'req_std_2', queuePosition: 2, requestType: 'STANDARD' },
          ],
        },
      });

      mockUpdatePromise.mockResolvedValueOnce({});
      mockPutPromise.mockResolvedValueOnce({});

      const event = {
        arguments: {
          input: {
            eventId: 'event_spotlight',
            songTitle: 'VIP Song',
            artistName: 'VIP Artist',
            requestType: 'SPOTLIGHT',
          },
        },
        identity: { sub: 'user_vip' },
      };

      const result = await createRequest(event);

      expect(result.success).toBe(true);
      expect(result.request.queuePosition).toBe(1); // SPOTLIGHT gets position 1
    });
  });
});

