/**
 * Real Integration Tests - Payment Flow
 * Tests against actual AWS resources (DynamoDB, Lambda)
 * Requires: .env.test file with AWS credentials and Yoco sandbox keys
 */

require('dotenv').config({ path: '.env.test' });
const AWS = require('aws-sdk');
const crypto = require('crypto');

// Configure AWS SDK with test environment
AWS.config.update({ region: process.env.AWS_REGION || 'us-east-1' });

const dynamodb = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();

// Import Lambda handlers directly
const { handler: processPayment } = require('../../aws/lambda/processPayment/index.js');
const { handler: createRequest } = require('../../aws/lambda/createRequest/index.js');

// Test configuration
const TEST_CONFIG = {
  eventsTable: process.env.TEST_EVENTS_TABLE,
  requestsTable: process.env.TEST_REQUESTS_TABLE,
  transactionsTable: process.env.TEST_TRANSACTIONS_TABLE,
  yocoSecretKey: process.env.YOCO_SECRET_KEY,
};

// Test data generators
function generateTestEvent() {
  return {
    eventId: `evt_test_${crypto.randomUUID()}`,
    performerId: `perf_test_${Date.now()}`,
    name: 'Test Event',
    status: 'ACTIVE',
    settings: {
      basePrice: 50,
      maxRequestsPerUser: 5,
      allowDuplicates: false,
    },
    createdAt: new Date().toISOString(),
    startTime: Date.now(),  // Required for GSI
  };
}

function generateTestUser() {
  return {
    userId: `user_test_${crypto.randomUUID()}`,
    username: `testuser_${Date.now()}`,
  };
}

// Cleanup helper
async function cleanupTestData(items) {
  for (const item of items) {
    try {
      await dynamodb.delete({
        TableName: item.table,
        Key: item.key,
      }).promise();
    } catch (error) {
      console.warn(`Cleanup warning: ${error.message}`);
    }
  }
}

describe('🔥 REAL Integration Tests - Payment Flow', () => {
  let testEvent;
  let testUser;
  let cleanupItems = [];

  beforeAll(() => {
    // Verify test environment
    if (!TEST_CONFIG.eventsTable) {
      throw new Error('TEST_EVENTS_TABLE not set. Run setup-test-environment.ps1 first!');
    }
    
    if (!TEST_CONFIG.yocoSecretKey || TEST_CONFIG.yocoSecretKey.includes('YOUR_')) {
      console.warn('⚠️  WARNING: Yoco sandbox key not configured. Payment tests will be skipped.');
    }

    // Override environment variables for Lambda functions
    process.env.EVENTS_TABLE = TEST_CONFIG.eventsTable;
    process.env.REQUESTS_TABLE = TEST_CONFIG.requestsTable;
    process.env.TRANSACTIONS_TABLE = TEST_CONFIG.transactionsTable;
    process.env.QUEUES_TABLE = process.env.TEST_QUEUES_TABLE || 'beatmatchme-queues-dev';
    process.env.YOCO_SECRET_KEY = TEST_CONFIG.yocoSecretKey;
  });

  beforeEach(async () => {
    // Create test event
    testEvent = generateTestEvent();
    await dynamodb.put({
      TableName: TEST_CONFIG.eventsTable,
      Item: testEvent,
    }).promise();
    
    cleanupItems.push({
      table: TEST_CONFIG.eventsTable,
      key: { eventId: testEvent.eventId },
    });

    // Create test user
    testUser = generateTestUser();
  });

  afterEach(async () => {
    // Cleanup test data
    await cleanupTestData(cleanupItems);
    cleanupItems = [];
  });

  describe('✅ P0-3: Pre-Creation Validation', () => {
    test('should create request when all validations pass', async () => {
      const event = {
        arguments: {
          input: {
            eventId: testEvent.eventId,
            userId: testUser.userId,
            songTitle: 'Test Song',
            artistName: 'Test Artist',
          },
        },
        identity: { sub: testUser.userId },
      };

      const result = await createRequest(event);

      expect(result).toBeDefined();
      expect(result.requestId).toMatch(/^[a-f0-9-]{36}$/); // UUID format
      expect(result.status).toBe('UNPAID'); // UNPAID when no payment provided

      // Verify in DynamoDB
      const dbResult = await dynamodb.get({
        TableName: TEST_CONFIG.requestsTable,
        Key: { requestId: result.requestId },
      }).promise();

      expect(dbResult.Item).toBeDefined();
      expect(dbResult.Item.songTitle).toBe('Test Song');

      // Add to cleanup
      cleanupItems.push({
        table: TEST_CONFIG.requestsTable,
        key: { requestId: result.requestId },
      });
    });

    test('should reject request when event does not exist', async () => {
      const event = {
        arguments: {
          input: {
            requestId: `req_test_${crypto.randomUUID()}`,
            eventId: 'nonexistent_event',
            userId: testUser.userId,
            songTitle: 'Test Song',
            artistName: 'Test Artist',
          },
        },
        identity: { sub: testUser.userId },
      };

      await expect(createRequest(event)).rejects.toThrow();
    });

    test('should reject request when event is COMPLETED', async () => {
      // Update event status
      await dynamodb.update({
        TableName: TEST_CONFIG.eventsTable,
        Key: { eventId: testEvent.eventId },
        UpdateExpression: 'SET #status = :status',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':status': 'COMPLETED' },
      }).promise();

      const event = {
        arguments: {
          input: {
            requestId: `req_test_${crypto.randomUUID()}`,
            eventId: testEvent.eventId,
            userId: testUser.userId,
            songTitle: 'Test Song',
            artistName: 'Test Artist',
          },
        },
        identity: { sub: testUser.userId },
      };

      await expect(createRequest(event)).rejects.toThrow();
    });

    test('should enforce rate limiting (max 3 requests per hour)', async () => {
      // Create 3 requests rapidly
      for (let i = 0; i < 3; i++) {
        const event = {
          arguments: {
            input: {
              eventId: testEvent.eventId,
              userId: testUser.userId,
              songTitle: `Test Song ${i}`,
              artistName: 'Test Artist',
            },
          },
          identity: { sub: testUser.userId },
        };

        const result = await createRequest(event);
        expect(result.requestId).toMatch(/^[a-f0-9-]{36}$/);

        cleanupItems.push({
          table: TEST_CONFIG.requestsTable,
          key: { requestId: result.requestId },
        });
      }

      // 4th request should fail
      const event = {
        arguments: {
          input: {
            eventId: testEvent.eventId,
            userId: testUser.userId,
            songTitle: 'Test Song 4',
            artistName: 'Test Artist',
          },
        },
        identity: { sub: testUser.userId },
      };

      await expect(createRequest(event)).rejects.toThrow();
    }, 30000); // Increase timeout for this test

    test('should prevent duplicate song by same user in same event', async () => {
      // This test verifies that duplicate songs are properly handled
      // Note: The Lambda has two duplicate checks:
      // 1. Within 5 minutes: Gracefully returns existing request (prevents double-clicks)
      // 2. Outside 5 minutes: Throws DUPLICATE_SONG_REQUEST error
      
      // For testing purposes, we'll test the graceful behavior since waiting
      // 6+ minutes is impractical for a test suite
      
      // Create first request
      const event1 = {
        arguments: {
          input: {
            eventId: testEvent.eventId,
            userId: testUser.userId,
            songTitle: 'Duplicate Song Test',
            artistName: 'Duplicate Artist Test',
          },
        },
        identity: { sub: testUser.userId },
      };

      const result1 = await createRequest(event1);
      cleanupItems.push({
        table: TEST_CONFIG.requestsTable,
        key: { requestId: result1.requestId },
      });

      // Immediate duplicate (tests graceful 5-minute deduplication)
      const event2 = {
        arguments: {
          input: {
            eventId: testEvent.eventId,
            userId: testUser.userId,
            songTitle: 'Duplicate Song Test', // Same song!
            artistName: 'Duplicate Artist Test', // Same artist!
          },
        },
        identity: { sub: testUser.userId },
      };

      // Within 5 minutes: Should gracefully return existing request
      const result2 = await createRequest(event2);
      expect(result2.success).toBe(true);
      expect(result2.request.requestId).toBe(result1.requestId); // Same request
      expect(result2.request.songTitle).toBe('Duplicate Song Test');
      
      // This proves duplicate detection is working - it prevents creating duplicate requests
    });
  });

  describe('✅ P0-4: Queue Race Prevention', () => {
    test('should assign unique queue positions with concurrent requests', async () => {
      const promises = [];
      const timestamp = Date.now();

      // Create 5 concurrent requests with unique userIds to avoid rate limiting
      for (let i = 0; i < 5; i++) {
        const event = {
          arguments: {
            input: {
              eventId: testEvent.eventId,
              userId: `user_concurrent_${timestamp}_${i}`,
              songTitle: `Concurrent Song ${timestamp}_${i}`,
              artistName: 'Test Artist',
            },
          },
          identity: { sub: `user_concurrent_${timestamp}_${i}` },
        };

        promises.push(createRequest(event));
      }

      // Wait for all to complete
      const results = await Promise.all(promises);

      // Verify unique queue positions
      const positions = results.map(r => r.queuePosition);
      const uniquePositions = new Set(positions);
      
      expect(uniquePositions.size).toBe(5); // All positions should be unique

      // Cleanup
      for (const result of results) {
        cleanupItems.push({
          table: TEST_CONFIG.requestsTable,
          key: { requestId: result.requestId },
        });
      }
    }, 30000);
  });

  describe('✅ P1-4: Request Deduplication', () => {
    test('should return existing request for duplicate within 5 minutes', async () => {
      const event = {
        arguments: {
          input: {
            eventId: testEvent.eventId,
            userId: testUser.userId,
            songTitle: 'Dedup Test Song',
            artistName: 'Test Artist',
          },
        },
        identity: { sub: testUser.userId },
      };

      // First request
      const result1 = await createRequest(event);
      expect(result1.requestId).toMatch(/^[a-f0-9-]{36}$/);

      cleanupItems.push({
        table: TEST_CONFIG.requestsTable,
        key: { requestId: result1.requestId },
      });

      // Duplicate request (same song/user/event within 5 minutes)
      const result2 = await createRequest(event);
      
      // Lambda should return existing request from the response wrapper
      expect(result2.request).toBeDefined();
      expect(result2.request.requestId).toBe(result1.requestId);
      expect(result2.request.submittedAt).toBe(result1.submittedAt); // Same timestamp = same request
    });
  });

  describe('📊 Performance Metrics', () => {
    test('should complete request creation within 500ms', async () => {
      const event = {
        arguments: {
          input: {
            eventId: testEvent.eventId,
            userId: testUser.userId,
            songTitle: 'Performance Test',
            artistName: 'Test Artist',
          },
        },
        identity: { sub: testUser.userId },
      };

      const startTime = Date.now();
      const result = await createRequest(event);
      const duration = Date.now() - startTime;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(500); // Should be fast with GSIs

      console.log(`✅ Request creation took ${duration}ms`);

      cleanupItems.push({
        table: TEST_CONFIG.requestsTable,
        key: { requestId: result.requestId },
      });
    });

    test('should handle 10 concurrent requests without throttling', async () => {
      const promises = [];
      const timestamp = Date.now();

      for (let i = 0; i < 10; i++) {
        const event = {
          arguments: {
            input: {
              eventId: testEvent.eventId,
              userId: `user_perf_${timestamp}_${i}`,
              songTitle: `Perf Test Song ${timestamp}_${i}`,
              artistName: 'Test Artist',
            },
          },
          identity: { sub: `user_perf_${timestamp}_${i}` },
        };

        promises.push(createRequest(event));
      }

      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled').length;

      // Cleanup successful requests
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          cleanupItems.push({
            table: TEST_CONFIG.requestsTable,
            key: { requestId: result.value.requestId },
          });
        }
      });

      expect(successful).toBeGreaterThanOrEqual(8); // At least 80% success rate
      console.log(`✅ ${successful}/10 concurrent requests succeeded`);
    }, 30000);
  });
});

describe('🔍 Infrastructure Verification', () => {
  test('should have all required tables accessible', async () => {
    const tables = [
      TEST_CONFIG.eventsTable,
      TEST_CONFIG.requestsTable,
      TEST_CONFIG.transactionsTable,
    ];

    for (const tableName of tables) {
      const result = await dynamodb.scan({
        TableName: tableName,
        Limit: 1,
      }).promise();

      expect(result).toBeDefined();
      console.log(`✅ Table accessible: ${tableName}`);
    }
  });

  test('should have GSIs configured correctly', async () => {
    const db = new AWS.DynamoDB();
    
    // Check Requests table GSIs
    const requestsTable = await db.describeTable({
      TableName: TEST_CONFIG.requestsTable,
    }).promise();

    const gsiNames = requestsTable.Table.GlobalSecondaryIndexes.map(gsi => gsi.IndexName);
    
    expect(gsiNames).toContain('eventId-submittedAt-index');
    expect(gsiNames).toContain('userId-submittedAt-index');
    expect(gsiNames).toContain('eventId-status-index');

    console.log(`✅ GSIs configured: ${gsiNames.join(', ')}`);
  });
});
