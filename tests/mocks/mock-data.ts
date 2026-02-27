/**
 * Mock data for testing
 */

import { Solution, SolutionComponent, AsyncImportJob } from '../../src/types/solution';
import { Workflow } from '../../src/types/workflow';
import { SolutionValidationResult, ValidationSeverity } from '../../src/types/validation';

export const mockSolution: Solution = {
  solutionid: '12345678-1234-1234-1234-123456789012',
  uniquename: 'TestSolution',
  friendlyname: 'Test Solution',
  version: '1.0.0.0',
  ismanaged: false,
  isvisible: true,
  description: 'A test solution',
  installedon: '2024-01-01T00:00:00Z',
  publisherid: {
    publisherid: 'pub-123',
    uniquename: 'testpublisher',
    friendlyname: 'Test Publisher',
    customizationprefix: 'test'
  }
};

export const mockManagedSolution: Solution = {
  solutionid: '87654321-4321-4321-4321-210987654321',
  uniquename: 'ManagedSolution',
  friendlyname: 'Managed Solution',
  version: '2.0.0.0',
  ismanaged: true,
  isvisible: true,
  description: 'A managed test solution',
  installedon: '2024-02-01T00:00:00Z'
};

export const mockSolutionComponent: SolutionComponent = {
  solutioncomponentid: 'comp-123',
  solutionid: '12345678-1234-1234-1234-123456789012',
  _solutionid_value: '12345678-1234-1234-1234-123456789012',
  componenttype: 1, // Entity
  objectid: 'entity-123',
  rootcomponentbehavior: 0,
  createdon: '2024-01-01T00:00:00Z'
};

export const mockWorkflow: Workflow = {
  workflowid: 'workflow-123',
  name: 'Test Workflow',
  type: 1,
  category: 0,
  primaryentity: 'account',
  statecode: 1,
  statuscode: 2,
  scope: 4,
  xaml: '<Activity></Activity>'
};

export const mockWorkflowMissingScope: Workflow = {
  workflowid: 'workflow-456',
  name: 'Workflow Missing Scope',
  type: 1,
  category: 0,
  primaryentity: 'contact',
  statecode: 1,
  statuscode: 2,
  scope: 0, // Invalid scope
  xaml: '<Activity></Activity>'
};

export const mockImportJob: AsyncImportJob = {
  importjobid: 'job-123',
  progress: 50,
  statuscode: 0, // In Progress
  data: '',
  solutionname: 'TestSolution',
  createdon: '2024-01-01T00:00:00Z'
};

export const mockCompletedImportJob: AsyncImportJob = {
  importjobid: 'job-123',
  progress: 100,
  statuscode: 1, // Completed
  data: 'Import completed successfully',
  solutionname: 'TestSolution',
  completedon: '2024-01-01T00:01:00Z',
  createdon: '2024-01-01T00:00:00Z'
};

export const mockFailedImportJob: AsyncImportJob = {
  importjobid: 'job-456',
  progress: 30,
  statuscode: 2, // Failed
  data: 'Import failed: Missing dependencies',
  solutionname: 'TestSolution',
  createdon: '2024-01-01T00:00:00Z'
};

export const mockValidationResult: SolutionValidationResult = {
  solutionId: '12345678-1234-1234-1234-123456789012',
  solutionUniqueName: 'TestSolution',
  solutionFriendlyName: 'Test Solution',
  validatedAt: new Date('2024-01-01T00:00:00Z'),
  overallStatus: 'Warning',
  totalIssues: 3,
  issuesBySeverity: {
    critical: 0,
    error: 1,
    warning: 2,
    info: 0
  },
  issues: [
    {
      code: 'WF001',
      severity: ValidationSeverity.Error,
      message: 'Workflow does not have a valid scope defined',
      componentId: 'workflow-456',
      componentName: 'Workflow Missing Scope'
    },
    {
      code: 'COMP001',
      severity: ValidationSeverity.Warning,
      message: 'Component exists in multiple solutions',
      componentId: 'entity-123',
      componentName: 'Account'
    },
    {
      code: 'META001',
      severity: ValidationSeverity.Warning,
      message: 'Table does not have a description',
      componentId: 'account',
      componentName: 'account'
    }
  ],
  checks: {
    workflows: {
      totalWorkflows: 5,
      workflowsMissingScope: [mockWorkflowMissingScope],
      allWorkflowsEnabled: false,
      allBusinessRulesActivated: true,
      emailActionsValid: true
    },
    components: {
      totalComponents: 20,
      duplicateComponents: [mockSolutionComponent],
      hasConnectionInDisplayName: false,
      hasConnectionReferences: false,
      hasMismatchedPublishers: false
    },
    security: {
      totalSecurityRoles: 2,
      grantsElevatedPrivileges: false,
      grantsAccessOutsidePublisher: false
    },
    metadata: {
      totalTables: 5,
      tablesMissingDescription: []
    },
    quality: {
      solutionCheckerRun: false,
      solutionCheckerLastRun: undefined
    }
  }
};

export const mockDataverseResponse = <T>(value: T[]) => ({
  value,
  '@odata.count': value.length
});
