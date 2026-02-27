# Test Suite

This directory contains the test suite for the Dataverse Solution Library.

## Structure

```
tests/
├── unit/                      # Unit tests
│   ├── http-client.test.ts    # HttpClient tests
│   ├── solution-service.test.ts # SolutionService tests
│   ├── workflow-service.test.ts # WorkflowService tests
│   └── validation-service.test.ts # ValidationService tests
├── integration/               # Integration tests
│   └── dataverse-client.test.ts # DataverseClient integration tests
├── mocks/                     # Mock data and utilities
│   └── mock-data.ts          # Mock Dataverse objects
├── setup.ts                   # Test setup file
└── README.md                  # This file
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Verbose Output
```bash
npm run test:verbose
```

## Test Coverage

The test suite covers:

### Unit Tests
- **HttpClient**: HTTP request methods, configuration, interceptors
- **SolutionService**: All 25+ solution management methods including:
  - Query operations (getSolutions, getSolutionById, etc.)
  - Import operations (importSolution, importSolutionAsync, etc.)
  - Export operations (exportSolution)
  - Delete operations (deleteSolution, deleteSolutionByUniqueName)
  - Clone operations (cloneSolution)
  - Component operations
  - Validation helpers
- **WorkflowService**: All workflow management methods including:
  - Workflow queries
  - Scope validation
  - Email action validation
  - Business rule checks
- **ValidationService**: Comprehensive validation orchestration

### Integration Tests
- **DataverseClient**: Service initialization and integration
  - Client configuration
  - Service availability
  - Service integration
  - Error handling

## Writing Tests

### Unit Test Example

```typescript
import { SolutionService } from '../../src/services/solution-service';
import { HttpClient } from '../../src/utils/http-client';
import { mockSolution, mockDataverseResponse } from '../mocks/mock-data';

jest.mock('../../src/utils/http-client');

describe('SolutionService', () => {
  let solutionService: SolutionService;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = new HttpClient({
      baseUrl: 'https://test.crm.dynamics.com'
    }) as jest.Mocked<HttpClient>;

    solutionService = new SolutionService(mockHttpClient);
    jest.clearAllMocks();
  });

  it('should get solutions', async () => {
    const mockResponse = mockDataverseResponse([mockSolution]);
    mockHttpClient.get.mockResolvedValue({ data: mockResponse } as any);

    const result = await solutionService.getSolutions();

    expect(result).toEqual(mockResponse.value);
  });
});
```

### Integration Test Example

```typescript
import { DataverseClient } from '../../src/dataverse-client';

describe('DataverseClient Integration', () => {
  let client: DataverseClient;

  beforeEach(() => {
    client = new DataverseClient({
      baseUrl: 'https://test.crm.dynamics.com'
    });
  });

  it('should create client with all services', () => {
    expect(client.solutions).toBeDefined();
    expect(client.workflows).toBeDefined();
    expect(client.validation).toBeDefined();
  });
});
```

## Mock Data

Mock data is available in `tests/mocks/mock-data.ts`:

- `mockSolution` - Sample solution object
- `mockManagedSolution` - Sample managed solution
- `mockSolutionComponent` - Sample solution component
- `mockWorkflow` - Sample workflow
- `mockWorkflowMissingScope` - Workflow with invalid scope
- `mockImportJob` - Async import job (in progress)
- `mockCompletedImportJob` - Completed import job
- `mockFailedImportJob` - Failed import job
- `mockValidationResult` - Sample validation result
- `mockDataverseResponse<T>()` - Helper to create OData responses

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Mocking**: Mock external dependencies (HTTP calls, file system, etc.)
3. **Clarity**: Use descriptive test names that explain what is being tested
4. **Coverage**: Aim for high code coverage, especially for critical paths
5. **Fast**: Keep tests fast by avoiding unnecessary delays
6. **Assertions**: Make specific assertions rather than generic ones

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test

- name: Upload coverage
  run: npm run test:coverage
  uses: codecov/codecov-action@v3
```

## Troubleshooting

### Tests timing out
Increase timeout in `tests/setup.ts`:
```typescript
jest.setTimeout(30000); // 30 seconds
```

### Mock not working
Ensure mocks are cleared between tests:
```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### TypeScript errors
Run type check before tests:
```bash
npm run typecheck
```

## Future Enhancements

- [ ] E2E tests against real Dataverse instance
- [ ] Performance tests
- [ ] Load tests for async operations
- [ ] Visual regression tests (if applicable)
- [ ] Test fixtures for complex scenarios
