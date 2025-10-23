import { SolutionService } from './solution-service';
import { WorkflowService } from './workflow-service';
import {
  SolutionValidationResult,
  ValidationIssue,
  ValidationSeverity,
  WorkflowValidationResults,
  ComponentValidationResults,
  SecurityValidationResults,
  MetadataValidationResults,
  QualityValidationResults
} from '../types/validation';

/**
 * Service for comprehensive solution validation
 * Orchestrates all validation checks and produces detailed reports
 */
export class ValidationService {
  private solutionService: SolutionService;
  private workflowService: WorkflowService;

  constructor(solutionService: SolutionService, workflowService: WorkflowService) {
    this.solutionService = solutionService;
    this.workflowService = workflowService;
  }

  /**
   * Perform comprehensive validation on a solution
   * Runs all validation checks and produces a detailed report
   * @param solutionId The unique identifier of the solution (GUID)
   * @returns Promise with comprehensive validation results
   */
  async validateSolution(solutionId: string): Promise<SolutionValidationResult> {
    // Get solution details
    const solution = await this.solutionService.getSolutionById(solutionId, {
      $select: ['solutionid', 'uniquename', 'friendlyname']
    });

    const issues: ValidationIssue[] = [];

    // Run all validation checks in parallel where possible
    const [
      workflowResults,
      componentResults,
      securityResults,
      metadataResults,
      qualityResults
    ] = await Promise.all([
      this.validateWorkflows(solutionId, issues),
      this.validateComponents(solutionId, issues),
      this.validateSecurity(solutionId, issues),
      this.validateMetadata(solutionId, issues),
      this.validateQuality(solutionId, issues)
    ]);

    // Calculate issue counts by severity
    const issuesBySeverity = {
      critical: issues.filter(i => i.severity === ValidationSeverity.Critical).length,
      error: issues.filter(i => i.severity === ValidationSeverity.Error).length,
      warning: issues.filter(i => i.severity === ValidationSeverity.Warning).length,
      info: issues.filter(i => i.severity === ValidationSeverity.Info).length
    };

    // Determine overall status
    let overallStatus: 'Pass' | 'Warning' | 'Fail';
    if (issuesBySeverity.critical > 0 || issuesBySeverity.error > 0) {
      overallStatus = 'Fail';
    } else if (issuesBySeverity.warning > 0) {
      overallStatus = 'Warning';
    } else {
      overallStatus = 'Pass';
    }

    return {
      solutionId: solution.solutionid || solutionId,
      solutionUniqueName: solution.uniquename,
      solutionFriendlyName: solution.friendlyname,
      validatedAt: new Date(),
      overallStatus,
      totalIssues: issues.length,
      issuesBySeverity,
      issues,
      checks: {
        workflows: workflowResults,
        components: componentResults,
        security: securityResults,
        metadata: metadataResults,
        quality: qualityResults
      }
    };
  }

  /**
   * Validate workflow-related issues
   * @private
   */
  private async validateWorkflows(
    solutionId: string,
    issues: ValidationIssue[]
  ): Promise<WorkflowValidationResults> {
    // Get workflows missing scope
    const workflowsMissingScope = await this.workflowService.flowsMissingScopeStatement(solutionId);

    if (workflowsMissingScope.length > 0) {
      for (const workflow of workflowsMissingScope) {
        issues.push({
          code: 'WORKFLOW_MISSING_SCOPE',
          severity: ValidationSeverity.Error,
          message: `Workflow "${workflow.name}" is missing a valid scope statement`,
          componentId: workflow.workflowid,
          componentName: workflow.name,
          details: { workflow }
        });
      }
    }

    // Check if all workflows are enabled
    const allWorkflowsEnabled = await this.workflowService.areAllWorkflowsEnabled(solutionId);

    if (!allWorkflowsEnabled) {
      issues.push({
        code: 'WORKFLOWS_NOT_ENABLED',
        severity: ValidationSeverity.Warning,
        message: 'Not all workflows in the solution are enabled/activated',
        details: { allWorkflowsEnabled }
      });
    }

    // Check if all business rules are activated
    const allBusinessRulesActivated = await this.workflowService.areAllBusinessRulesActivated(solutionId);

    if (!allBusinessRulesActivated) {
      issues.push({
        code: 'BUSINESS_RULES_NOT_ACTIVATED',
        severity: ValidationSeverity.Warning,
        message: 'Not all business rules in the solution are activated',
        details: { allBusinessRulesActivated }
      });
    }

    // Validate email actions
    const emailActionsValid = await this.workflowService.validateWorkflowEmailActions(solutionId);

    if (!emailActionsValid) {
      issues.push({
        code: 'EMAIL_ACTIONS_INVALID',
        severity: ValidationSeverity.Error,
        message: 'Some workflow email actions are missing required "from" or "replyto" fields',
        details: { emailActionsValid }
      });
    }

    // Get total workflow count
    const allWorkflows = await this.workflowService.getWorkflowsFromSolutionId(solutionId, {
      $select: ['workflowid']
    });

    return {
      workflowsMissingScope,
      allWorkflowsEnabled,
      allBusinessRulesActivated,
      emailActionsValid,
      totalWorkflows: allWorkflows.length
    };
  }

  /**
   * Validate component-related issues
   * @private
   */
  private async validateComponents(
    solutionId: string,
    issues: ValidationIssue[]
  ): Promise<ComponentValidationResults> {
    // Check for duplicate components
    const duplicateComponents = await this.solutionService.getSolutionComponentsFoundInOtherSolutions();

    const duplicatesInThisSolution = duplicateComponents.filter(
      c => c._solutionid_value === solutionId || c.solutionid === solutionId
    );

    if (duplicatesInThisSolution.length > 0) {
      issues.push({
        code: 'DUPLICATE_COMPONENTS',
        severity: ValidationSeverity.Warning,
        message: `Found ${duplicatesInThisSolution.length} component(s) that exist in multiple solutions`,
        details: { duplicateComponents: duplicatesInThisSolution }
      });
    }

    // Check for connection references in display name
    const hasConnectionInDisplayName = await this.solutionService.doesSolutionHaveConnectionOrConnectionReferencesInDisplayName(solutionId);

    if (hasConnectionInDisplayName) {
      issues.push({
        code: 'CONNECTION_IN_DISPLAY_NAME',
        severity: ValidationSeverity.Info,
        message: 'Solution display name contains "connection" or "connection reference" keywords',
        details: { hasConnectionInDisplayName }
      });
    }

    // Check for connection references
    const hasConnectionReferences = await this.solutionService.doesSolutionHaveConnectionReferences(solutionId);

    if (hasConnectionReferences) {
      issues.push({
        code: 'HAS_CONNECTION_REFERENCES',
        severity: ValidationSeverity.Info,
        message: 'Solution contains connection reference components',
        details: { hasConnectionReferences }
      });
    }

    // Check for mismatched publishers
    const hasMismatchedPublishers = await this.solutionService.doesSolutionCustomizeComponentsWherePublisherDoesNotMatchSolutionPublisher(solutionId);

    if (hasMismatchedPublishers) {
      issues.push({
        code: 'MISMATCHED_PUBLISHERS',
        severity: ValidationSeverity.Warning,
        message: 'Solution contains components from different publishers',
        details: { hasMismatchedPublishers }
      });
    }

    // Get total component count
    const allComponents = await this.solutionService.getSolutionComponentsBySolutionId(solutionId, {
      $select: ['solutioncomponentid']
    });

    return {
      duplicateComponents: duplicatesInThisSolution,
      hasConnectionInDisplayName,
      hasConnectionReferences,
      hasMismatchedPublishers,
      totalComponents: allComponents.length
    };
  }

  /**
   * Validate security-related issues
   * @private
   */
  private async validateSecurity(
    solutionId: string,
    issues: ValidationIssue[]
  ): Promise<SecurityValidationResults> {
    // Check for elevated privileges
    const grantsElevatedPrivileges = await this.solutionService.doesSecurityRoleGrantSystemCustomizerOrSystemAdmin(solutionId);

    if (grantsElevatedPrivileges) {
      issues.push({
        code: 'GRANTS_ELEVATED_PRIVILEGES',
        severity: ValidationSeverity.Critical,
        message: 'Solution contains security roles that grant System Customizer or System Administrator privileges',
        details: { grantsElevatedPrivileges }
      });
    }

    // Check for access outside publisher
    const grantsAccessOutsidePublisher = await this.solutionService.doesSecurityRoleGrantAccessToTableOutsideOfPublisher(solutionId);

    if (grantsAccessOutsidePublisher) {
      issues.push({
        code: 'GRANTS_ACCESS_OUTSIDE_PUBLISHER',
        severity: ValidationSeverity.Warning,
        message: 'Solution security roles grant access to tables outside of the solution publisher',
        details: { grantsAccessOutsidePublisher }
      });
    }

    // Get total security role count
    const securityRoleComponents = await this.solutionService.getSolutionComponentsBySolutionId(solutionId, {
      $filter: 'componenttype eq 20',
      $select: ['solutioncomponentid']
    });

    return {
      grantsElevatedPrivileges,
      grantsAccessOutsidePublisher,
      totalSecurityRoles: securityRoleComponents.length
    };
  }

  /**
   * Validate metadata-related issues
   * @private
   */
  private async validateMetadata(
    solutionId: string,
    issues: ValidationIssue[]
  ): Promise<MetadataValidationResults> {
    // Check for tables missing descriptions
    const tablesMissingDescription = await this.solutionService.allTablesModifiedBySolutionMissingDescription(solutionId);

    if (tablesMissingDescription.length > 0) {
      for (const table of tablesMissingDescription) {
        issues.push({
          code: 'TABLE_MISSING_DESCRIPTION',
          severity: ValidationSeverity.Warning,
          message: `Table "${table.LogicalName}" is missing a description`,
          componentId: table.MetadataId,
          componentName: table.LogicalName,
          details: { table }
        });
      }
    }

    // Get total table count
    const tableComponents = await this.solutionService.getSolutionComponentsBySolutionId(solutionId, {
      $filter: 'componenttype eq 1',
      $select: ['solutioncomponentid']
    });

    return {
      tablesMissingDescription,
      totalTables: tableComponents.length
    };
  }

  /**
   * Validate quality-related issues
   * @private
   */
  private async validateQuality(
    solutionId: string,
    issues: ValidationIssue[]
  ): Promise<QualityValidationResults> {
    // Check if Solution Checker has been run
    const solutionCheckerRun = await this.solutionService.hasSolutionCheckerBeenRun(solutionId);

    if (!solutionCheckerRun) {
      issues.push({
        code: 'SOLUTION_CHECKER_NOT_RUN',
        severity: ValidationSeverity.Info,
        message: 'Solution Checker has not been run on this solution',
        details: { solutionCheckerRun }
      });
    }

    return {
      solutionCheckerRun,
      solutionCheckerLastRun: undefined // Could be enhanced to get actual date
    };
  }
}
