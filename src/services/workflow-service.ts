import { HttpClient } from '../utils/http-client';
import {
  Workflow,
  WorkflowQueryOptions,
  DataverseResponse,
  EmailActionValidation,
  ComponentType
} from '../types';

/**
 * Service for interacting with Dataverse Workflows
 */
export class WorkflowService {
  private httpClient: HttpClient;
  private readonly PROCESSES_ENDPOINT = '/processes';
  private readonly SOLUTION_COMPONENTS_ENDPOINT = '/solutioncomponents';

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * Get workflows by solution ID
   * Retrieves all workflows that belong to a specific solution
   * @param solutionId The unique identifier of the solution (GUID)
   * @param options Query options for filtering, selecting, and ordering
   * @returns Promise with array of workflows
   */
  async getWorkflowsFromSolutionId(solutionId: string, options?: WorkflowQueryOptions): Promise<Workflow[]> {
    // Build the filter to get workflows from solution components
    // First, we need to get solution components of type Workflow (29)
    const componentFilter = `_solutionid_value eq '${solutionId}' and componenttype eq ${ComponentType.Workflow}`;
    const componentsUrl = `${this.SOLUTION_COMPONENTS_ENDPOINT}?$filter=${encodeURIComponent(componentFilter)}&$select=objectid`;

    // Get the workflow IDs from solution components
    const componentsResponse = await this.httpClient.get<DataverseResponse<{ objectid: string }>>(componentsUrl);
    const workflowIds = componentsResponse.data.value.map(c => c.objectid);

    if (workflowIds.length === 0) {
      return [];
    }

    // Build filter for workflows using the IDs
    const workflowFilter = workflowIds.map(id => `workflowid eq ${id}`).join(' or ');
    const workflowOptions: WorkflowQueryOptions = {
      ...options,
      $filter: options?.$filter ? `(${workflowFilter}) and (${options.$filter})` : workflowFilter
    };

    const queryParams = this.buildQueryParams(workflowOptions);
    const url = `${this.PROCESSES_ENDPOINT}${queryParams}`;

    const response = await this.httpClient.get<DataverseResponse<Workflow>>(url);
    return response.data.value;
  }

  /**
   * Get a workflow by ID
   * @param workflowId The unique identifier of the workflow (GUID)
   * @param options Query options for selecting specific fields
   * @returns Promise with the workflow
   */
  async getWorkflowById(workflowId: string, options?: WorkflowQueryOptions): Promise<Workflow> {
    const queryParams = this.buildQueryParams(options);
    const url = `${this.PROCESSES_ENDPOINT}(${workflowId})${queryParams}`;

    const response = await this.httpClient.get<Workflow>(url);
    return response.data;
  }

  /**
   * Get workflows missing scope statement from a solution
   * Identifies workflows that don't have a valid scope defined
   * @param solutionId The unique identifier of the solution (GUID)
   * @returns Promise with array of workflows missing scope
   */
  async flowsMissingScopeStatement(solutionId: string): Promise<Workflow[]> {
    // Get all workflows from the solution with scope field
    const workflows = await this.getWorkflowsFromSolutionId(solutionId, {
      $select: ['workflowid', 'name', 'scope', 'category', 'type', 'primaryentity', 'statecode', 'statuscode']
    });

    // Filter workflows that have missing or invalid scope
    // Valid scope values are:
    // 1 = User
    // 2 = Business Unit
    // 3 = Parent: Child Business Units
    // 4 = Organization
    const workflowsMissingScope = workflows.filter(workflow => {
      // Check if scope is missing (null/undefined) or invalid (not 1-4)
      return workflow.scope === undefined ||
             workflow.scope === null ||
             workflow.scope < 1 ||
             workflow.scope > 4;
    });

    return workflowsMissingScope;
  }

  /**
   * Validate that workflow email actions have 'from' and 'replyto' fields populated
   * Checks all workflows in a solution for email or approval actions
   * @param solutionId The unique identifier of the solution (GUID)
   * @returns Promise<boolean> - true if all email/approval actions have required fields populated
   */
  async validateWorkflowEmailActions(solutionId: string): Promise<boolean> {
    // Get all workflows from the solution
    const workflows = await this.getWorkflowsFromSolutionId(solutionId, {
      $select: ['workflowid', 'name', 'xaml', 'category']
    });

    // Check each workflow for email/approval actions
    for (const workflow of workflows) {
      // Category 3 = Action, which includes approval actions
      // We need to check the XAML for email activities
      if (workflow.xaml) {
        const hasEmailActions = this.checkForEmailActions(workflow.xaml);

        if (hasEmailActions) {
          const isValid = this.validateEmailActionFields(workflow.xaml);
          if (!isValid) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Get detailed validation results for workflow email actions
   * Provides detailed information about which workflows need attention
   * @param solutionId The unique identifier of the solution (GUID)
   * @returns Promise with array of validation results
   */
  async getEmailActionValidationDetails(solutionId: string): Promise<EmailActionValidation[]> {
    const workflows = await this.getWorkflowsFromSolutionId(solutionId, {
      $select: ['workflowid', 'name', 'xaml', 'category']
    });

    const validationResults: EmailActionValidation[] = [];

    for (const workflow of workflows) {
      if (workflow.xaml && workflow.workflowid && workflow.name) {
        const hasEmailActions = this.checkForEmailActions(workflow.xaml);

        if (hasEmailActions) {
          const validation = this.analyzeEmailActionFields(workflow.xaml);

          validationResults.push({
            workflowId: workflow.workflowid,
            workflowName: workflow.name,
            hasEmailOrApprovalActions: true,
            hasFromPopulated: validation.hasFrom,
            hasReplyToPopulated: validation.hasReplyTo,
            actionsNeedingAttention: validation.actionsNeedingAttention
          });
        }
      }
    }

    return validationResults;
  }

  /**
   * Update email and approval workflow action fields
   * Updates the 'from' and 'replyto' fields for email actions in a workflow
   * @param workflowId The unique identifier of the workflow (GUID)
   * @param email The email address to set for 'from' and 'replyto' fields
   * @returns Promise<void>
   */
  async updateEmailAndApprovalWorkflowActions(workflowId: string, email: string): Promise<void> {
    // Get the workflow with XAML
    const workflow = await this.getWorkflowById(workflowId, {
      $select: ['workflowid', 'xaml', 'name']
    });

    if (!workflow.xaml) {
      throw new Error(`Workflow ${workflowId} does not have XAML definition`);
    }

    // Update the XAML with new email addresses
    const updatedXaml = this.updateEmailFieldsInXaml(workflow.xaml, email);

    // Update the workflow
    const url = `${this.PROCESSES_ENDPOINT}(${workflowId})`;
    await this.httpClient.patch(url, {
      xaml: updatedXaml
    });
  }

  /**
   * Check if XAML contains email actions
   * @private
   */
  private checkForEmailActions(xaml: string): boolean {
    // Check for SendEmail activity or email-related activities
    const emailPatterns = [
      /<.*SendEmail.*>/i,
      /<.*EmailActivity.*>/i,
      /<.*msdyn\.SendEmail.*>/i,
      /activityName="SendEmail"/i,
      /type="SendEmail"/i
    ];

    return emailPatterns.some(pattern => pattern.test(xaml));
  }

  /**
   * Validate that email action fields are populated
   * @private
   */
  private validateEmailActionFields(xaml: string): boolean {
    // Parse XAML and check for 'from' and 'replyto' attributes
    // This is a simplified check - in production, you'd use an XML parser

    // Check for empty or missing 'from' attribute
    const fromPattern = /from\s*=\s*["'][\s]*["']/i;
    const replyToPattern = /replyto\s*=\s*["'][\s]*["']/i;

    // Check for presence of populated fields
    const hasPopulatedFrom = /from\s*=\s*["'][^"']+["']/i.test(xaml);
    const hasPopulatedReplyTo = /replyto\s*=\s*["'][^"']+["']/i.test(xaml);

    // If there are empty fields, return false
    if (fromPattern.test(xaml) || replyToPattern.test(xaml)) {
      return false;
    }

    // Both should be populated if email actions exist
    return hasPopulatedFrom && hasPopulatedReplyTo;
  }

  /**
   * Analyze email action fields in detail
   * @private
   */
  private analyzeEmailActionFields(xaml: string): {
    hasFrom: boolean;
    hasReplyTo: boolean;
    actionsNeedingAttention: Array<{
      actionId: string;
      actionName: string;
      missingFields: string[];
    }>;
  } {
    const actionsNeedingAttention: Array<{
      actionId: string;
      actionName: string;
      missingFields: string[];
    }> = [];

    // This is a simplified analysis
    // In production, use a proper XML parser
    const hasFrom = /from\s*=\s*["'][^"'\s]+["']/i.test(xaml);
    const hasReplyTo = /replyto\s*=\s*["'][^"'\s]+["']/i.test(xaml);

    if (!hasFrom || !hasReplyTo) {
      const missingFields: string[] = [];
      if (!hasFrom) missingFields.push('from');
      if (!hasReplyTo) missingFields.push('replyto');

      actionsNeedingAttention.push({
        actionId: 'email-action-1',
        actionName: 'Email Action',
        missingFields
      });
    }

    return {
      hasFrom,
      hasReplyTo,
      actionsNeedingAttention
    };
  }

  /**
   * Update email fields in XAML
   * @private
   */
  private updateEmailFieldsInXaml(xaml: string, email: string): string {
    let updatedXaml = xaml;

    // Update 'from' attribute - match empty or existing values
    updatedXaml = updatedXaml.replace(
      /from\s*=\s*["'][^"']*["']/gi,
      `from="${email}"`
    );

    // Update 'replyto' attribute - match empty or existing values
    updatedXaml = updatedXaml.replace(
      /replyto\s*=\s*["'][^"']*["']/gi,
      `replyto="${email}"`
    );

    // If attributes don't exist, we'd need to add them
    // This would require proper XML parsing and manipulation
    // For now, this handles the update case

    return updatedXaml;
  }

  /**
   * Build query parameters from options
   * Converts WorkflowQueryOptions to OData query string
   * @private
   */
  private buildQueryParams(options?: WorkflowQueryOptions): string {
    if (!options) {
      return '';
    }

    const params: string[] = [];

    // Build $select parameter for selecting specific fields
    if (options.$select && options.$select.length > 0) {
      params.push(`$select=${options.$select.join(',')}`);
    }

    // Build $filter parameter for filtering results
    if (options.$filter) {
      params.push(`$filter=${encodeURIComponent(options.$filter)}`);
    }

    // Build $orderby parameter for sorting results
    if (options.$orderby) {
      params.push(`$orderby=${options.$orderby}`);
    }

    // Build $expand parameter for expanding related entities
    if (options.$expand && options.$expand.length > 0) {
      params.push(`$expand=${options.$expand.join(',')}`);
    }

    // Build $top parameter for limiting results
    if (options.$top !== undefined && options.$top > 0) {
      params.push(`$top=${options.$top}`);
    }

    // Build $skip parameter for pagination
    if (options.$skip !== undefined && options.$skip > 0) {
      params.push(`$skip=${options.$skip}`);
    }

    // Build $count parameter to include total count
    if (options.$count === true) {
      params.push('$count=true');
    }

    return params.length > 0 ? `?${params.join('&')}` : '';
  }
}
