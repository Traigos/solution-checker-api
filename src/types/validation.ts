/**
 * Solution Validation Types
 * Comprehensive validation result structures
 */

import { Entity, SolutionComponent } from './solution';
import { Workflow } from './workflow';

/**
 * Validation severity levels
 */
export enum ValidationSeverity {
  Info = 'Info',
  Warning = 'Warning',
  Error = 'Error',
  Critical = 'Critical'
}

/**
 * Individual validation issue
 */
export interface ValidationIssue {
  /** Unique code for this issue type */
  code: string;

  /** Severity of the issue */
  severity: ValidationSeverity;

  /** Human-readable description */
  message: string;

  /** Affected component ID (if applicable) */
  componentId?: string;

  /** Affected component name (if applicable) */
  componentName?: string;

  /** Additional details */
  details?: any;
}

/**
 * Solution validation result
 * Comprehensive report of all validation checks
 */
export interface SolutionValidationResult {
  /** Solution ID that was validated */
  solutionId: string;

  /** Solution unique name */
  solutionUniqueName?: string;

  /** Solution friendly name */
  solutionFriendlyName?: string;

  /** Timestamp when validation was run */
  validatedAt: Date;

  /** Overall validation status */
  overallStatus: 'Pass' | 'Warning' | 'Fail';

  /** Total number of issues found */
  totalIssues: number;

  /** Issues by severity */
  issuesBySeverity: {
    critical: number;
    error: number;
    warning: number;
    info: number;
  };

  /** All validation issues found */
  issues: ValidationIssue[];

  /** Detailed check results */
  checks: {
    workflows: WorkflowValidationResults;
    components: ComponentValidationResults;
    security: SecurityValidationResults;
    metadata: MetadataValidationResults;
    quality: QualityValidationResults;
  };
}

/**
 * Workflow validation results
 */
export interface WorkflowValidationResults {
  /** Workflows missing scope statement */
  workflowsMissingScope: Workflow[];

  /** All workflows enabled status */
  allWorkflowsEnabled: boolean;

  /** All business rules activated status */
  allBusinessRulesActivated: boolean;

  /** Email actions validation passed */
  emailActionsValid: boolean;

  /** Count of workflows checked */
  totalWorkflows: number;
}

/**
 * Component validation results
 */
export interface ComponentValidationResults {
  /** Components found in multiple solutions */
  duplicateComponents: SolutionComponent[];

  /** Has connection references in display name */
  hasConnectionInDisplayName: boolean;

  /** Has connection reference components */
  hasConnectionReferences: boolean;

  /** Components with mismatched publishers */
  hasMismatchedPublishers: boolean;

  /** Count of components checked */
  totalComponents: number;
}

/**
 * Security validation results
 */
export interface SecurityValidationResults {
  /** Security roles grant System Customizer or Admin */
  grantsElevatedPrivileges: boolean;

  /** Security roles grant access outside publisher */
  grantsAccessOutsidePublisher: boolean;

  /** Count of security roles checked */
  totalSecurityRoles: number;
}

/**
 * Metadata validation results
 */
export interface MetadataValidationResults {
  /** Tables missing descriptions */
  tablesMissingDescription: Entity[];

  /** Count of tables checked */
  totalTables: number;
}

/**
 * Quality validation results
 */
export interface QualityValidationResults {
  /** Solution Checker has been run */
  solutionCheckerRun: boolean;

  /** Solution Checker last run date (if available) */
  solutionCheckerLastRun?: Date;
}
