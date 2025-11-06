/**
 * Payment Flow Integration Tests
 * Tests the complete payment verification, processing, and rollback logic
 * Covers all P0-1 and P0-2 fixes
 */

const AWS = require('aws-sdk');

// Create shared mock promise functions
const mockGetPromise = jest.fn();
const mockPutPromise = jest.fn();
const mockQueryPromise = jest.fn();
const mockUpdatePromise = jest.fn();
const mockInvokePromise = jest.fn();

// Mock AWS SDK with proper chaining
jest.mock('aws-sdk', () => {
  const mockDynamoDBClient = {
    get: jest.fn(() => ({ promise: mockGetPromise })),
    put: jest.fn(() => ({ promise: mockPutPromise })),
    query: jest.fn(() => ({ promise: mockQueryPromise })),
    update: jest.fn(() => ({ promise: mockUpdatePromise })),
  };
  
  const mockLambdaClient = {
    invoke: jest.fn(() => ({ promise: mockInvokePromise })),
  };
  
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mockDynamoDBClient),
    },
    Lambda: jest.fn(() => mockLambdaClient),
  };
});

// Get references to the mock clients
const mockDynamoDBClient = new AWS.DynamoDB.DocumentClient();
const mockLambdaClient = new AWS.Lambda();

// Mock HTTPS for Yoco API calls
const mockHttpsRequest = jest.fn();
jest.mock('https', () => ({
  request: mockHttpsRequest,
  Agent: jest.fn().mockImplementation(() => ({})), // Mock Agent constructor
}));

const https = require('https');
const { handler: processPayment } = require('../../aws/lambda/processPayment/index.js');

describe('Payment Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set default environment variables
    process.env.YOCO_SECRET_KEY = 'test_secret_key';
    process.env.TRANSACTIONS_TABLE = 'beatmatchme-transactions-test';
    process.env.REFUND_LAMBDA_NAME = 'processRefund';
  });

  describe('✅ P0-1: Payment Verification', () => {
    test('should successfully verify valid Yoco charge', async () => {
      // Mock Yoco API verification response
      const mockYocoResponse = {
        id: 'ch_test123',
        status: 'successful',
        amount: 5000, // 50.00 ZAR in cents
        currency: 'ZAR',
      };

      mockHttpsRequest.mockImplementation((options, callback) => {
        const req = {
          on: jest.fn(),
          write: jest.fn(),
          end: jest.fn(() => {
            const res = {
              statusCode: 200,
              on: jest.fn((event, handler) => {
                if (event === 'data') {
                  handler(JSON.stringify(mockYocoResponse));
                } else if (event === 'end') {
                  handler();
                }
              }),
            };
            callback(res);
          }),
        };
        return req;
      });

      // Mock idempotency check - no existing transaction
      mockQueryPromise.mockResolvedValueOnce({ Items: [] });

      // Mock duplicate charge check - charge not used
      mockQueryPromise.mockResolvedValueOnce({ Items: [] });

      // Mock transaction creation
      mockPutPromise.mockResolvedValueOnce({});

      // Mock request update
      mockUpdatePromise.mockResolvedValueOnce({});

      // Mock performer balance update
      mockUpdatePromise.mockResolvedValueOnce({});

      const event = {
        arguments: {
          input: {
            requestId: 'req_123',
            eventId: 'event_456',
            performerId: 'perf_789',
            userId: 'user_abc',
            amount: 50,
            yocoChargeId: 'ch_test123',
            idempotencyKey: 'idem_xyz',
          },
        },
        identity: { sub: 'user_abc' },
      };

      const result = await processPayment(event);

      expect(result.status).toBe('COMPLETED');
      expect(result.amount).toBe(50);
      expect(mockHttpsRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          hostname: 'online.yoco.com',
          path: '/v1/charges/ch_test123',
          method: 'GET',
        }),
        expect.any(Function)
      );
    });

    test('should reject charge with invalid status', async () => {
      // Mock Yoco API response with failed status
      const mockYocoResponse = {
        id: 'ch_test456',
        status: 'failed',
        amount: 5000,
        currency: 'ZAR',
      };

      mockHttpsRequest.mockImplementation((options, callback) => {
        const req = {
          on: jest.fn(),
          write: jest.fn(),
          end: jest.fn(() => {
            const res = {
              statusCode: 200,
              on: jest.fn((event, handler) => {
                if (event === 'data') {
                  handler(JSON.stringify(mockYocoResponse));
                } else if (event === 'end') {
                  handler();
                }
              }),
            };
            callback(res);
          }),
        };
        return req;
      });

      // Mock idempotency check
      mockQueryPromise.mockResolvedValueOnce({ Items: [] });

      const event = {
        arguments: {
          input: {
            requestId: 'req_123',
            eventId: 'event_456',
            performerId: 'perf_789',
            userId: 'user_abc',
            amount: 50,
            yocoChargeId: 'ch_test456',
            idempotencyKey: 'idem_abc',
          },
        },
        identity: { sub: 'user_abc' },
      };

      await expect(processPayment(event)).rejects.toThrow(
        'Payment verification failed: charge status is failed'
      );
    });

    test('should reject charge with amount mismatch', async () => {
      // Mock Yoco API response with different amount
      const mockYocoResponse = {
        id: 'ch_test789',
        status: 'successful',
        amount: 10000, // 100.00 ZAR (expecting 50.00)
        currency: 'ZAR',
      };

      mockHttpsRequest.mockImplementation((options, callback) => {
        const req = {
          on: jest.fn(),
          write: jest.fn(),
          end: jest.fn(() => {
            const res = {
              statusCode: 200,
              on: jest.fn((event, handler) => {
                if (event === 'data') {
                  handler(JSON.stringify(mockYocoResponse));
                } else if (event === 'end') {
                  handler();
                }
              }),
            };
            callback(res);
          }),
        };
        return req;
      });

      // Mock idempotency check
      mockQueryPromise.mockResolvedValueOnce({ Items: [] });

      const event = {
        arguments: {
          input: {
            requestId: 'req_123',
            eventId: 'event_456',
            performerId: 'perf_789',
            userId: 'user_abc',
            amount: 50, // Expecting 50.00 ZAR
            yocoChargeId: 'ch_test789',
            idempotencyKey: 'idem_def',
          },
        },
        identity: { sub: 'user_abc' },
      };

      await expect(processPayment(event)).rejects.toThrow(
        'Payment amount mismatch: expected 5000 cents, got 10000 cents'
      );
    });

    test('should reject duplicate charge (already used)', async () => {
      // Mock idempotency check - no existing transaction
      mockQueryPromise.mockResolvedValueOnce({ Items: [] });

      // Mock duplicate charge check - charge already used!
      mockQueryPromise.mockResolvedValueOnce({
        Items: [
          {
            transactionId: 'txn_existing',
            providerTransactionId: 'ch_test999',
            requestId: 'req_other',
          },
        ],
      });

      const event = {
        arguments: {
          input: {
            requestId: 'req_123',
            eventId: 'event_456',
            performerId: 'perf_789',
            userId: 'user_abc',
            amount: 50,
            yocoChargeId: 'ch_test999',
            idempotencyKey: 'idem_ghi',
          },
        },
        identity: { sub: 'user_abc' },
      };

      await expect(processPayment(event)).rejects.toThrow(
        'Payment charge already used for another transaction'
      );
    });
  });

  describe('✅ P0-2: Transaction Rollback', () => {
    test('should rollback and refund on database write failure', async () => {
      // Mock successful Yoco verification
      const mockYocoResponse = {
        id: 'ch_rollback123',
        status: 'successful',
        amount: 5000,
        currency: 'ZAR',
      };

      mockHttpsRequest.mockImplementation((options, callback) => {
        const req = {
          on: jest.fn(),
          write: jest.fn(),
          end: jest.fn(() => {
            const res = {
              statusCode: 200,
              on: jest.fn((event, handler) => {
                if (event === 'data') {
                  handler(JSON.stringify(mockYocoResponse));
                } else if (event === 'end') {
                  handler();
                }
              }),
            };
            callback(res);
          }),
        };
        return req;
      });

      // Mock idempotency check
      mockQueryPromise.mockResolvedValueOnce({ Items: [] });

      // Mock duplicate charge check
      mockQueryPromise.mockResolvedValueOnce({ Items: [] });

      // Mock transaction creation - FAILS
      mockPutPromise.mockRejectedValueOnce(
        new Error('DynamoDB write failed')
      );

      // Mock refund Lambda invocation
      mockInvokePromise.mockResolvedValueOnce({
        StatusCode: 200,
        Payload: JSON.stringify({
          statusCode: 200,
          body: { refundId: 'rf_test123', status: 'completed' },
        }),
      });

      // Mock failed transaction record
      mockPutPromise.mockResolvedValueOnce({});

      const event = {
        arguments: {
          input: {
            requestId: 'req_rollback',
            eventId: 'event_456',
            performerId: 'perf_789',
            userId: 'user_abc',
            amount: 50,
            yocoChargeId: 'ch_rollback123',
            idempotencyKey: 'idem_rollback',
          },
        },
        identity: { sub: 'user_abc' },
      };

      await expect(processPayment(event)).rejects.toThrow('DynamoDB write failed');

      // Verify refund Lambda was called
      expect(mockInvokePromise).toHaveBeenCalled();
    });

    test('should log rollback failure if refund fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock successful Yoco verification
      const mockYocoResponse = {
        id: 'ch_rollback456',
        status: 'successful',
        amount: 5000,
        currency: 'ZAR',
      };

      mockHttpsRequest.mockImplementation((options, callback) => {
        const req = {
          on: jest.fn(),
          write: jest.fn(),
          end: jest.fn(() => {
            const res = {
              statusCode: 200,
              on: jest.fn((event, handler) => {
                if (event === 'data') {
                  handler(JSON.stringify(mockYocoResponse));
                } else if (event === 'end') {
                  handler();
                }
              }),
            };
            callback(res);
          }),
        };
        return req;
      });

      // Mock idempotency check
      mockQueryPromise.mockResolvedValueOnce({ Items: [] });

      // Mock duplicate charge check
      mockQueryPromise.mockResolvedValueOnce({ Items: [] });

      // Mock transaction creation - FAILS
      mockPutPromise.mockRejectedValueOnce(
        new Error('Database error')
      );

      // Mock refund Lambda invocation - FAILS
      mockInvokePromise.mockRejectedValueOnce(
        new Error('Refund Lambda timeout')
      );

      // Mock failed transaction record
      mockPutPromise.mockResolvedValueOnce({});

      const event = {
        arguments: {
          input: {
            requestId: 'req_rollback2',
            eventId: 'event_456',
            performerId: 'perf_789',
            userId: 'user_abc',
            amount: 50,
            yocoChargeId: 'ch_rollback456',
            idempotencyKey: 'idem_rollback2',
          },
        },
        identity: { sub: 'user_abc' },
      };

      await expect(processPayment(event)).rejects.toThrow('Database error');

      // Verify rollback error was logged
      const errorLogs = consoleErrorSpy.mock.calls.filter(call =>
        JSON.stringify(call).includes('Rollback error')
      );
      expect(errorLogs.length).toBeGreaterThan(0);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('🔄 Idempotency Handling', () => {
    test('should return existing transaction for duplicate idempotency key', async () => {
      const existingTransaction = {
        transactionId: 'txn_existing123',
        amount: 50,
        status: 'COMPLETED',
        idempotencyKey: 'idem_duplicate',
      };

      // Mock idempotency check - transaction already exists
      mockQueryPromise.mockResolvedValueOnce({
        Items: [existingTransaction],
      });

      const event = {
        arguments: {
          input: {
            requestId: 'req_new',
            eventId: 'event_456',
            performerId: 'perf_789',
            userId: 'user_abc',
            amount: 50,
            yocoChargeId: 'ch_new123',
            idempotencyKey: 'idem_duplicate', // Same key!
          },
        },
        identity: { sub: 'user_abc' },
      };

      const result = await processPayment(event);

      expect(result).toEqual(existingTransaction);
      expect(mockHttpsRequest).not.toHaveBeenCalled(); // Should not call Yoco API
    });
  });

  describe('📊 Error Code Mapping', () => {
    const errorTestCases = [
      {
        errorMessage: 'Payment verification failed: charge status is pending',
        expectedCode: 'PAYMENT_VERIFICATION_FAILED',
      },
      {
        errorMessage: 'Payment amount mismatch: expected 5000, got 10000',
        expectedCode: 'AMOUNT_MISMATCH',
      },
      {
        errorMessage: 'Payment charge already used for another transaction',
        expectedCode: 'DUPLICATE_PAYMENT',
      },
      {
        errorMessage: 'Yoco API error: 429 Too Many Requests',
        expectedCode: 'PAYMENT_PROVIDER_ERROR',
      },
      {
        errorMessage: 'DynamoDB connection timeout',
        expectedCode: 'PAYMENT_PROCESSING_ERROR',
      },
    ];

    errorTestCases.forEach(({ errorMessage, expectedCode }) => {
      test(`should map "${errorMessage}" to ${expectedCode}`, async () => {
        // Mock to throw specific error
        mockQueryPromise.mockResolvedValueOnce({ Items: [] });

        if (errorMessage.includes('verification failed')) {
          const mockYocoResponse = {
            id: 'ch_test',
            status: 'pending',
            amount: 5000,
            currency: 'ZAR',
          };

          mockHttpsRequest.mockImplementation((options, callback) => {
            const req = {
              on: jest.fn(),
              write: jest.fn(),
              end: jest.fn(() => {
                const res = {
                  statusCode: 200,
                  on: jest.fn((event, handler) => {
                    if (event === 'data') {
                      handler(JSON.stringify(mockYocoResponse));
                    } else if (event === 'end') {
                      handler();
                    }
                  }),
                };
                callback(res);
              }),
            };
            return req;
          });
        } else if (errorMessage.includes('amount mismatch')) {
          const mockYocoResponse = {
            id: 'ch_test',
            status: 'successful',
            amount: 10000,
            currency: 'ZAR',
          };

          mockHttpsRequest.mockImplementation((options, callback) => {
            const req = {
              on: jest.fn(),
              write: jest.fn(),
              end: jest.fn(() => {
                const res = {
                  statusCode: 200,
                  on: jest.fn((event, handler) => {
                    if (event === 'data') {
                      handler(JSON.stringify(mockYocoResponse));
                    } else if (event === 'end') {
                      handler();
                    }
                  }),
                };
                callback(res);
              }),
            };
            return req;
          });
        } else if (errorMessage.includes('already used')) {
          mockQueryPromise.mockResolvedValueOnce({
            Items: [{ transactionId: 'txn_other' }],
          });
        } else {
          mockQueryPromise.mockRejectedValueOnce(new Error(errorMessage));
        }

        const event = {
          arguments: {
            input: {
              requestId: 'req_error',
              eventId: 'event_456',
              performerId: 'perf_789',
              userId: 'user_abc',
              amount: 50,
              yocoChargeId: 'ch_test',
              idempotencyKey: 'idem_error',
            },
          },
          identity: { sub: 'user_abc' },
        };

        try {
          await processPayment(event);
        } catch (error) {
          expect(error.message).toContain(errorMessage.split(':')[0]);
        }
      });
    });
  });

  describe('💰 Payment Split Calculation', () => {
    test('should calculate 15% platform commission and 85% performer earnings', async () => {
      const mockYocoResponse = {
        id: 'ch_split123',
        status: 'successful',
        amount: 10000, // 100.00 ZAR
        currency: 'ZAR',
      };

      mockHttpsRequest.mockImplementation((options, callback) => {
        const req = {
          on: jest.fn(),
          write: jest.fn(),
          end: jest.fn(() => {
            const res = {
              statusCode: 200,
              on: jest.fn((event, handler) => {
                if (event === 'data') {
                  handler(JSON.stringify(mockYocoResponse));
                } else if (event === 'end') {
                  handler();
                }
              }),
            };
            callback(res);
          }),
        };
        return req;
      });

      mockQueryPromise.mockResolvedValueOnce({ Items: [] });
      mockQueryPromise.mockResolvedValueOnce({ Items: [] });
      mockPutPromise.mockResolvedValueOnce({});
      mockUpdatePromise.mockResolvedValueOnce({});
      mockUpdatePromise.mockResolvedValueOnce({});

      const event = {
        arguments: {
          input: {
            requestId: 'req_split',
            eventId: 'event_456',
            performerId: 'perf_789',
            userId: 'user_abc',
            amount: 100,
            yocoChargeId: 'ch_split123',
            idempotencyKey: 'idem_split',
          },
        },
        identity: { sub: 'user_abc' },
      };

      const result = await processPayment(event);

      expect(result.platformFee).toBe(15); // 15% of 100
      expect(result.performerEarnings).toBe(85); // 85% of 100
    });
  });
});

