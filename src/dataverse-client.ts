import { DataverseClientConfig } from './config/client-config';
import { HttpClient } from './utils/http-client';
import { SolutionService } from './services/solution-service';
import { WorkflowService } from './services/workflow-service';
import { ValidationService } from './services/validation-service';

/**
 * Main Dataverse API client
 * Uses integrated authentication (Windows Authentication) by default
 */
export class DataverseClient {
  private httpClient: HttpClient;

  // Services
  public readonly solutions: SolutionService;
  public readonly workflows: WorkflowService;
  public readonly validation: ValidationService;

  /**
   * Create a new Dataverse client
   * @param config Client configuration
   */
  constructor(config: DataverseClientConfig) {
    this.httpClient = new HttpClient(config);

    // Initialize services
    this.solutions = new SolutionService(this.httpClient);
    this.workflows = new WorkflowService(this.httpClient);
    this.validation = new ValidationService(this.solutions, this.workflows);
  }
}
