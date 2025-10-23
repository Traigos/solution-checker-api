# Dataverse Solution Library

TypeScript API library to get Dataverse solution values.

## Installation

```bash
npm install @dataverse/solution-library
```

## Quick Start

```typescript
import { DataverseClient } from '@dataverse/solution-library';

// Initialize the client
const client = new DataverseClient({
  baseUrl: 'https://your-org.crm.dynamics.com',
  accessToken: 'your-access-token',
  apiVersion: '9.2', // optional, defaults to '9.2'
});

// Get all solutions
const solutions = await client.solutions.getSolutions();

// Get a specific solution by ID
const solution = await client.solutions.getSolutionById('solution-id');
```

## Configuration

### DataverseClientConfig

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `baseUrl` | string | Yes | - | The base URL of your Dataverse instance |
| `accessToken` | string | Yes | - | Authentication token for API requests |
| `apiVersion` | string | No | '9.2' | API version to use |
| `timeout` | number | No | 30000 | Request timeout in milliseconds |

## API Reference

### DataverseClient

Main client for interacting with the Dataverse API.

#### Constructor

```typescript
new DataverseClient(config: DataverseClientConfig)
```

#### Methods

- `updateAccessToken(accessToken: string): void` - Update the authentication token

### SolutionService

Service for interacting with Dataverse solutions.

Available via `client.solutions`

#### Methods

- `getSolutions(options?: SolutionQueryOptions): Promise<Solution[]>` - Get all solutions
- `getSolutionById(solutionId: string, options?: SolutionQueryOptions): Promise<Solution>` - Get a solution by ID
- `getSolutionByUniqueName(uniqueName: string, options?: SolutionQueryOptions): Promise<Solution | null>` - Get a solution by unique name

## Type Definitions

### TODO: Define Your Interfaces

The following type definitions need to be filled in based on your Dataverse schema:

1. **Solution** (`src/types/solution.ts`)
   - Define the structure of a Dataverse solution
   - Add properties like `solutionid`, `uniquename`, `friendlyname`, `version`, etc.

2. **SolutionQueryOptions** (`src/types/solution.ts`)
   - Define query options for OData queries
   - Add properties like `$select`, `$filter`, `$orderby`, `$top`, `$skip`

3. **SolutionComponent** (`src/types/solution.ts`)
   - Define the structure of solution components
   - Add properties based on your schema

After defining these interfaces, update the corresponding service methods in `src/services/solution-service.ts`.

## Project Structure

```
src/
├── config/
│   └── client-config.ts    # Client configuration types
├── services/
│   └── solution-service.ts # Solution service implementation
├── types/
│   └── solution.ts          # Type definitions (TODO: Define interfaces)
├── utils/
│   └── http-client.ts       # HTTP client wrapper
├── dataverse-client.ts      # Main client class
└── index.ts                 # Public API exports
```

## Development

### Build

```bash
npm run build
```

### Watch mode

```bash
npm run dev
```

### Type checking

```bash
npm run typecheck
```

### Clean build artifacts

```bash
npm run clean
```

## Usage Examples

### Basic Usage

```typescript
import { DataverseClient } from '@dataverse/solution-library';

const client = new DataverseClient({
  baseUrl: 'https://contoso.crm.dynamics.com',
  accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGc...',
});

// Get all solutions
const allSolutions = await client.solutions.getSolutions();
console.log('Solutions:', allSolutions);
```

### With Query Options

```typescript
// TODO: Update after defining SolutionQueryOptions interface
const solutions = await client.solutions.getSolutions({
  // $select: ['solutionid', 'uniquename', 'friendlyname'],
  // $top: 10,
});
```

### Update Access Token

```typescript
// Update the token when it expires
client.updateAccessToken('new-access-token');
```

## Next Steps

1. Define your interfaces in `src/types/solution.ts`
2. Update the `buildQueryParams` method in `src/services/solution-service.ts`
3. Add additional services as needed in `src/services/`
4. Extend the `DataverseClient` class with new services

## License

MIT
