/**
 * Dataverse Solution Library
 * TypeScript API library to get Dataverse solution values
 */

// Main client
export { DataverseClient } from './dataverse-client';

// Configuration
export { DataverseClientConfig, DEFAULT_CONFIG } from './config/client-config';

// Types - Solution
export {
  Solution,
  SolutionQueryOptions,
  SolutionComponent,
  DataverseResponse,
  DataverseError,
} from './types/solution';

// Types - Workflow
export {
  Workflow,
  WorkflowQueryOptions,
  WorkflowActionStep,
  EmailActionValidation,
  ComponentType,
} from './types/workflow';

// Services
export { SolutionService } from './services/solution-service';
export { WorkflowService } from './services/workflow-service';

// Utils
export { HttpClient } from './utils/http-client';
