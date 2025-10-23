/**
 * Dataverse Solution Library
 * TypeScript API library to get Dataverse solution values
 */

// Main client
export { DataverseClient } from './dataverse-client';

// Configuration
export { DataverseClientConfig, DEFAULT_CONFIG } from './config/client-config';

// Types
export {
  Solution,
  SolutionQueryOptions,
  SolutionComponent,
  DataverseResponse,
  DataverseError,
} from './types/solution';

// Services
export { SolutionService } from './services/solution-service';

// Utils
export { HttpClient } from './utils/http-client';
