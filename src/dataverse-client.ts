import { DataverseClientConfig } from './config/client-config';
import { HttpClient } from './utils/http-client';
import { SolutionService } from './services/solution-service';
import { WorkflowService } from './services/workflow-service';

/**
 * Main Dataverse API client
 */
export class DataverseClient {
  private httpClient: HttpClient;

  // Services
  public readonly solutions: SolutionService;
  public readonly workflows: WorkflowService;

  /**
   * Create a new Dataverse client
   * @param config Client configuration
   */
  constructor(config: DataverseClientConfig) {
    this.httpClient = new HttpClient(config);

    // Initialize services
    this.solutions = new SolutionService(this.httpClient);
    this.workflows = new WorkflowService(this.httpClient);
  }

  /**
   * Update the access token for authentication
   * @param accessToken New access token
   */
  updateAccessToken(accessToken: string): void {
    this.httpClient.updateAccessToken(accessToken);
  }
}
