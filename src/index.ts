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
  Entity,
  Attribute,
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

// Types - Validation
export {
  SolutionValidationResult,
  ValidationIssue,
  ValidationSeverity,
  WorkflowValidationResults,
  ComponentValidationResults,
  SecurityValidationResults,
  MetadataValidationResults,
  QualityValidationResults,
} from './types/validation';

// Services
export { SolutionService } from './services/solution-service';
export { WorkflowService } from './services/workflow-service';
export { ValidationService } from './services/validation-service';

// Utils
export { HttpClient } from './utils/http-client';
