# Dataverse Solution Library

A comprehensive TypeScript library for managing Microsoft Dataverse solutions, including validation, import/export, and quality checks.

## Features

✅ **Solution Management**: Get, create, import, export, clone, and delete solutions
✅ **Import/Export**: Upload and download solutions via Web API
✅ **Async Operations**: Support for asynchronous import with progress tracking
✅ **Validation**: 20+ validation checks for solution quality and best practices
✅ **Workflow Management**: Validate and manage workflows and business rules
✅ **Component Analysis**: Find duplicate components, publisher mismatches, and more
✅ **Security Checks**: Identify security roles with excessive privileges
✅ **Metadata Management**: Update entity and attribute descriptions
✅ **Solution Checker Integration**: Run and track Solution Checker jobs
✅ **Integrated Authentication**: Windows Authentication support
✅ **TypeScript**: Full type definitions and IntelliSense support

## Installation

```bash
npm install @dataverse/solution-library
```

## Quick Start

```typescript
import { DataverseClient } from '@dataverse/solution-library';

// Initialize the client with integrated authentication
const client = new DataverseClient({
  baseUrl: 'https://your-org.crm.dynamics.com',
  useIntegratedAuth: true,  // Uses Windows Authentication
  apiVersion: '9.2',        // Optional, defaults to '9.2'
});

// Get all solutions
const solutions = await client.solutions.getSolutions();

// Import a solution
const solutionFile = fs.readFileSync('MySolution.zip');
const importResult = await client.solutions.importSolution(solutionFile, {
  OverwriteUnmanagedCustomizations: true,
  PublishWorkflows: true
});

// Export a solution
const zipBase64 = await client.solutions.exportSolution('MySolution', false);
fs.writeFileSync('MySolution.zip', Buffer.from(zipBase64, 'base64'));

// Run validation
const validationResult = await client.validation.validateSolution(solutionId);
console.log(`Status: ${validationResult.overallStatus}`);
console.log(`Issues: ${validationResult.totalIssues}`);
```

## Configuration

### DataverseClientConfig

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `baseUrl` | string | Yes | - | The base URL of your Dataverse instance |
| `useIntegratedAuth` | boolean | No | true | Use integrated Windows Authentication |
| `apiVersion` | string | No | '9.2' | API version to use |
| `timeout` | number | No | 30000 | Request timeout in milliseconds |

## API Reference

### DataverseClient

Main client for interacting with the Dataverse API.

```typescript
const client = new DataverseClient(config);

// Access services
client.solutions   // SolutionService
client.workflows   // WorkflowService
client.validation  // ValidationService
```

### SolutionService

Available via `client.solutions`

#### Solution Query Methods

```typescript
// Get all solutions with OData query options
getSolutions(options?: SolutionQueryOptions): Promise<Solution[]>

// Get solution by ID
getSolutionById(solutionId: string, options?: SolutionQueryOptions): Promise<Solution>

// Get solution by unique name
getSolutionByUniqueName(uniqueName: string, options?: SolutionQueryOptions): Promise<Solution | null>
```

#### Solution Import Methods

```typescript
// Import solution synchronously
importSolution(
  solutionFile: string | Buffer,
  options?: Partial<ImportSolutionRequest>
): Promise<ImportSolutionResult>

// Import solution asynchronously (returns job ID immediately)
importSolutionAsync(
  solutionFile: string | Buffer,
  options?: Partial<ImportSolutionRequest>
): Promise<string>

// Get import job status
getImportJobStatus(importJobId: string): Promise<AsyncImportJob | null>

// Wait for import to complete (with polling and timeout)
waitForImportCompletion(
  importJobId: string,
  pollIntervalMs?: number,
  timeoutMs?: number
): Promise<AsyncImportJob>
```

#### Solution Export Methods

```typescript
// Export solution as base64 encoded zip
exportSolution(
  solutionName: string,
  managed?: boolean,
  options?: Partial<ExportSolutionOptions>
): Promise<string>
```

#### Solution Management Methods

```typescript
// Delete solution by ID
deleteSolution(solutionId: string): Promise<void>

// Delete solution by unique name
deleteSolutionByUniqueName(uniqueName: string): Promise<void>

// Clone/create patch solution
cloneSolution(
  parentSolutionUniqueName: string,
  newUniqueName: string,
  newFriendlyName: string,
  newVersionNumber?: string
): Promise<Solution>
```

#### Component Methods

```typescript
// Get components in a solution
getSolutionComponentsBySolutionId(
  solutionId: string,
  options?: SolutionQueryOptions
): Promise<SolutionComponent[]>

// Find duplicate components across solutions
getSolutionComponentsFoundInOtherSolutions(
  options?: SolutionQueryOptions
): Promise<SolutionComponent[]>

// Remove component from solution
removeSolutionComponent(
  solutionId: string,
  componentId: string,
  componentType: number
): Promise<void>
```

#### Validation Methods

```typescript
// Check for connection references
doesSolutionHaveConnectionReferences(solutionId: string): Promise<boolean>

// Check for publisher mismatches
doesSolutionCustomizeComponentsWherePublisherDoesNotMatchSolutionPublisher(
  solutionId: string
): Promise<boolean>

// Check security role privileges
doesSecurityRoleGrantSystemCustomizerOrSystemAdmin(solutionId: string): Promise<boolean>

doesSecurityRoleGrantAccessToTableOutsideOfPublisher(solutionId: string): Promise<boolean>

// Find tables missing descriptions
allTablesModifiedBySolutionMissingDescription(solutionId: string): Promise<Entity[]>

// Update attribute description
updateAttributeDescription(attributeId: string, description: string): Promise<void>

// Solution Checker
hasSolutionCheckerBeenRun(solutionId: string): Promise<boolean>

runSolutionChecker(solutionId: string): Promise<string>
```

### WorkflowService

Available via `client.workflows`

```typescript
// Get workflows from solution
getWorkflowsFromSolutionId(
  solutionId: string,
  options?: SolutionQueryOptions
): Promise<Workflow[]>

// Find workflows missing scope
flowsMissingScopeStatement(solutionId: string): Promise<Workflow[]>

// Check if all workflows are enabled
areAllWorkflowsEnabled(solutionId: string): Promise<boolean>

// Check if all business rules are activated
areAllBusinessRulesActivated(solutionId: string): Promise<boolean>

// Validate email actions in workflows
validateWorkflowEmailActions(solutionId: string): Promise<boolean>

// Update email and approval workflow actions
updateEmailAndApprovalWorkflowActions(
  workflowId: string,
  email: string
): Promise<void>
```

### ValidationService

Available via `client.validation`

```typescript
// Run comprehensive validation on a solution
validateSolution(solutionId: string): Promise<SolutionValidationResult>
```

The validation result includes:
- Overall status (Pass, Warning, Fail)
- Total issue count by severity (Critical, Error, Warning, Info)
- Detailed issue list with descriptions and remediation steps
- Breakdown by validation category:
  - Workflow validation
  - Component validation
  - Security validation
  - Metadata validation
  - Quality validation

## Usage Examples

### Import a Solution

```typescript
import * as fs from 'fs';

const client = new DataverseClient({
  baseUrl: 'https://your-org.crm.dynamics.com',
  useIntegratedAuth: true
});

// Read solution file
const solutionFile = fs.readFileSync('./MySolution_1_0_0_0.zip');

// Import synchronously
const result = await client.solutions.importSolution(solutionFile, {
  OverwriteUnmanagedCustomizations: true,
  PublishWorkflows: true,
  ConvertToManaged: false
});

console.log('Import completed:', result);
```

### Import Solution Asynchronously

```typescript
// Start async import
const importJobId = await client.solutions.importSolutionAsync(solutionFile, {
  OverwriteUnmanagedCustomizations: false,
  PublishWorkflows: true
});

console.log('Import job started:', importJobId);

// Wait for completion (polls every 5 seconds, timeout after 5 minutes)
const job = await client.solutions.waitForImportCompletion(
  importJobId,
  5000,   // Poll interval
  300000  // Timeout
);

console.log('Import completed!', job);
```

### Export a Solution

```typescript
// Export as unmanaged
const unmanagedZip = await client.solutions.exportSolution('MySolution', false);

// Save to file
fs.writeFileSync(
  'MySolution_unmanaged.zip',
  Buffer.from(unmanagedZip, 'base64')
);

// Export as managed with settings
const managedZip = await client.solutions.exportSolution('MySolution', true, {
  ExportAutoNumberingSettings: true,
  ExportCalendarSettings: true,
  ExportCustomizationSettings: true
});

fs.writeFileSync(
  'MySolution_managed.zip',
  Buffer.from(managedZip, 'base64')
);
```

### Clone/Patch a Solution

```typescript
const patchSolution = await client.solutions.cloneSolution(
  'MySolution',           // Parent solution unique name
  'MySolution_Patch_1',   // New unique name
  'My Solution Patch 1',  // Display name
  '1.0.0.1'              // Version number (optional)
);

console.log('Patch created:', patchSolution);
```

### Backup All Solutions

```typescript
// Get all visible unmanaged solutions
const solutions = await client.solutions.getSolutions({
  $filter: 'isvisible eq true and ismanaged eq false',
  $select: ['solutionid', 'uniquename', 'version', 'friendlyname']
});

// Export each solution
for (const solution of solutions) {
  console.log(`Backing up ${solution.uniquename}...`);

  const zipBase64 = await client.solutions.exportSolution(solution.uniquename!, false);

  const filename = `${solution.uniquename}_${solution.version?.replace(/\./g, '_')}.zip`;
  fs.writeFileSync(filename, Buffer.from(zipBase64, 'base64'));

  console.log(`✓ Saved to ${filename}`);
}
```

### Migrate Solution Between Environments

```typescript
// Export from source environment
const sourceClient = new DataverseClient({
  baseUrl: 'https://source-org.crm.dynamics.com',
  useIntegratedAuth: true
});

const exportedSolution = await sourceClient.solutions.exportSolution('MySolution', false);

// Import to target environment
const targetClient = new DataverseClient({
  baseUrl: 'https://target-org.crm.dynamics.com',
  useIntegratedAuth: true
});

const importJobId = await targetClient.solutions.importSolutionAsync(exportedSolution, {
  OverwriteUnmanagedCustomizations: true,
  PublishWorkflows: true
});

await targetClient.solutions.waitForImportCompletion(importJobId);
console.log('Migration completed!');
```

### Validate a Solution

```typescript
const result = await client.validation.validateSolution(solutionId);

console.log(`Status: ${result.overallStatus}`);
console.log(`Total Issues: ${result.totalIssues}`);
console.log(`Critical: ${result.issuesBySeverity.critical}`);
console.log(`Errors: ${result.issuesBySeverity.error}`);
console.log(`Warnings: ${result.issuesBySeverity.warning}`);

// Show all issues
result.issues.forEach(issue => {
  console.log(`[${issue.severity}] ${issue.title}`);
  console.log(`  ${issue.description}`);
  console.log(`  Fix: ${issue.remediation}`);
});
```

### Query Solutions with OData

```typescript
// Get managed solutions only, ordered by name
const solutions = await client.solutions.getSolutions({
  $filter: 'ismanaged eq true and isvisible eq true',
  $select: ['solutionid', 'uniquename', 'friendlyname', 'version'],
  $orderby: 'friendlyname asc',
  $top: 10
});

// Get solution with expanded publisher info
const solution = await client.solutions.getSolutionById(solutionId, {
  $select: ['solutionid', 'uniquename', 'friendlyname', 'version'],
  $expand: ['publisherid']
});
```

## Examples

See `example.ts` for basic usage examples and `example-import-export.ts` for comprehensive import/export examples including:
- Synchronous and asynchronous imports
- Export with various options
- Solution cloning/patching
- Deleting solutions
- Backup workflows
- Environment migration

## Project Structure

```
src/
├── config/
│   └── client-config.ts    # Client configuration
├── services/
│   ├── solution-service.ts # Solution management (25+ methods)
│   ├── workflow-service.ts # Workflow management (8+ methods)
│   └── validation-service.ts # Validation orchestration
├── types/
│   ├── solution.ts         # Solution types
│   ├── workflow.ts         # Workflow types
│   └── validation.ts       # Validation result types
├── utils/
│   └── http-client.ts      # HTTP client wrapper
├── dataverse-client.ts     # Main client class
└── index.ts                # Public API exports
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

## Requirements

- Node.js 18+
- TypeScript 5.x
- Access to Microsoft Dataverse environment

## Authentication

This library uses integrated Windows Authentication by default. Ensure your application is running in an environment that can authenticate to Dataverse (same domain or properly configured CORS).

For production deployments, consider:
- Azure App Service with managed identity
- On-premises IIS with Windows Authentication
- VPN or ExpressRoute for secure connectivity

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

## Changelog

### v0.1.0
- Initial release
- Solution query and management
- Workflow validation
- Component analysis
- Security checks
- Metadata management
- Solution Checker integration
- Comprehensive validation service

### v0.2.0
- ✨ Added solution import/export via Web API
- ✨ Added asynchronous import with progress tracking
- ✨ Added solution deletion methods
- ✨ Added solution cloning/patching
- 🎯 Support for Buffer and base64 file uploads
- 📚 Comprehensive import/export examples
- 🔧 Added @types/node for Buffer support
