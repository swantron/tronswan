# API Tests

API-level tests for tronswan backend endpoints. These tests are faster and more stable than UI tests for validating API contracts.

## Test Files

- `weather.api.spec.ts` - Weather API endpoint validation
- `mlb.api.spec.ts` - MLB data API endpoint validation
- `health.api.spec.ts` - Health check and status endpoints

## Running API Tests Only

```bash
# Run all API tests
npx playwright test tests/api/

# Run specific API test file
npx playwright test tests/api/weather.api.spec.ts

# Run with debugging
npx playwright test tests/api/ --debug
```

## Benefits of API Testing

- ⚡ **Faster**: No browser overhead, 10x faster than UI tests
- 🎯 **Focused**: Tests actual API contract, not rendering
- 🛡️ **Stable**: No DOM timing issues or flakiness
- 🔄 **Frequent**: Can run more often in CI/CD

## Test Coverage

### Weather API
- ✅ Valid data structure
- ✅ Temperature range validation
- ✅ Response time SLA
- ✅ Error handling
- ✅ Data consistency

### MLB API
- ✅ Games endpoint
- ✅ Standings endpoint
- ✅ Response time SLA
- ✅ Content type validation
- ✅ Error handling

### Health/Status API
- ✅ Health check endpoint
- ✅ Ready check endpoint
- ✅ Response time SLA
- ✅ Idempotency
- ✅ Dependency validation
