# Integration Tests

## Overview

Comprehensive test suite for BeatMatchMe backend Lambda functions, focusing on payment verification, transaction rollback, and queue management.

## Test Files

- **`payment-flow.test.js`**: Payment processing integration tests (P0-1, P0-2 fixes)
- **`queue-e2e.test.js`**: Queue management E2E tests (P0-4 fix) - Coming soon

## Running Tests

### All Tests

```bash
npm test
```

### Payment Flow Tests Only

```bash
npm test -- payment-flow
```

### With Coverage Report

```bash
npm run test:coverage
```

### Watch Mode (Development)

```bash
npm run test:watch
```

## Test Coverage

### Payment Flow Tests

**Coverage Target**: 80%+ on payment-related Lambda functions

**Test Scenarios** (15 total):

1. ✅ **Successful Payment Verification**
   - Valid Yoco charge with correct status and amount
   - Transaction created successfully
   - Request updated with transaction ID
   - Performer balance updated

2. ✅ **Invalid Charge Status**
   - Charge status is 'failed' or 'pending'
   - Payment rejected with appropriate error

3. ✅ **Amount Mismatch**
   - Yoco charge amount ≠ expected amount
   - Payment rejected to prevent fraud

4. ✅ **Duplicate Charge Detection**
   - Same Yoco charge ID used for different request
   - Payment rejected with error

5. ✅ **Automatic Rollback on Database Failure**
   - Transaction creation fails
   - Refund Lambda invoked automatically
   - Failed transaction logged

6. ✅ **Rollback Failure Logging**
   - Refund Lambda fails or times out
   - Error logged for manual intervention
   - Transaction marked as ROLLBACK_FAILED

7. ✅ **Idempotency Key Handling**
   - Duplicate request with same idempotency key
   - Returns existing transaction
   - No duplicate charge created

8-12. ✅ **Error Code Mapping** (5 scenarios)
   - PAYMENT_VERIFICATION_FAILED
   - AMOUNT_MISMATCH
   - DUPLICATE_PAYMENT
   - PAYMENT_PROVIDER_ERROR
   - PAYMENT_PROCESSING_ERROR

13. ✅ **Payment Split Calculation**
   - 15% platform commission
   - 85% performer earnings
   - Correct amounts in transaction record

## Test Structure

Each test follows the **AAA pattern**:

```javascript
test('should do something', async () => {
  // ARRANGE: Set up mocks and test data
  mockDynamoDB.query().promise.mockResolvedValueOnce({ Items: [] });
  
  // ACT: Execute the function
  const result = await processPayment(event);
  
  // ASSERT: Verify behavior
  expect(result.status).toBe('COMPLETED');
});
```

## Mocking Strategy

### AWS SDK Mocks

- **DynamoDB DocumentClient**: All database operations mocked
- **Lambda Client**: Refund Lambda invocations mocked
- **HTTPS Module**: Yoco API calls mocked

### Mock Data

```javascript
// Example Yoco API response
const mockYocoResponse = {
  id: 'ch_test123',
  status: 'successful',
  amount: 5000, // cents
  currency: 'ZAR',
};

// Example DynamoDB transaction
const mockTransaction = {
  transactionId: 'txn_123',
  amount: 50,
  platformFee: 7.5,
  performerEarnings: 42.5,
  status: 'COMPLETED',
};
```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run Tests
  run: npm test

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

### Pre-commit Hook

```bash
# .husky/pre-commit
npm test
```

## Common Issues

### Mock Not Resetting

**Problem**: Test pollution from previous tests

**Solution**: Use `beforeEach()` to clear mocks

```javascript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### Async Test Timeout

**Problem**: Test exceeds default 5s timeout

**Solution**: Increase timeout in jest.config.js

```javascript
module.exports = {
  testTimeout: 10000, // 10 seconds
};
```

### Import Errors

**Problem**: Cannot find module '../aws/lambda/...'

**Solution**: Verify path is relative to test file location

```javascript
// Correct path from infrastructure/tests/
const { handler } = require('../../aws/lambda/processPayment/index.js');
```

## Test Data Generators

```javascript
// Helper to generate test event
function createPaymentEvent(overrides = {}) {
  return {
    arguments: {
      input: {
        requestId: 'req_test',
        eventId: 'event_test',
        performerId: 'perf_test',
        userId: 'user_test',
        amount: 50,
        yocoChargeId: 'ch_test',
        idempotencyKey: 'idem_test',
        ...overrides,
      },
    },
    identity: { sub: 'user_test' },
  };
}
```

## Performance Benchmarks

| Test Suite | Tests | Duration | Coverage |
|------------|-------|----------|----------|
| Payment Flow | 15 | ~2.5s | 85%+ |
| Queue E2E | TBD | TBD | TBD |

## Next Steps

1. ✅ **Payment Flow Tests** (Complete)
2. 🔄 **Queue Management E2E Tests** (In Progress)
3. 📋 **Request Validation Tests** (Planned)
4. 📋 **WebSocket Recovery Tests** (Planned)

## Related Documentation

- [Production Readiness Plan](../PRODUCTION_READINESS_PLAN.md)
- [Implementation Tracker](../IMPLEMENTATION_TRACKER.md)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
