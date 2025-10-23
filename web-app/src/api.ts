import { Solution, SolutionValidationResult } from './types';

// API base URL - this would point to your backend API
const API_BASE_URL = '/api';

/**
 * Fetch all solutions from Dataverse
 */
export async function fetchSolutions(): Promise<Solution[]> {
  const response = await fetch(`${API_BASE_URL}/solutions`);

  if (!response.ok) {
    throw new Error('Failed to fetch solutions');
  }

  return response.json();
}

/**
 * Run validation checks on a solution
 */
export async function validateSolution(solutionId: string): Promise<SolutionValidationResult> {
  const response = await fetch(`${API_BASE_URL}/solutions/${solutionId}/validate`, {
    method: 'POST'
  });

  if (!response.ok) {
    throw new Error('Failed to validate solution');
  }

  return response.json();
}

// Mock data for development
export const mockSolutions: Solution[] = [
  {
    solutionid: '00000000-0000-0000-0000-000000000001',
    uniquename: 'SampleSolution1',
    friendlyname: 'Sample Solution 1',
    version: '1.0.0.0',
    ismanaged: false
  },
  {
    solutionid: '00000000-0000-0000-0000-000000000002',
    uniquename: 'SampleSolution2',
    friendlyname: 'Sample Solution 2',
    version: '1.2.0.0',
    ismanaged: true
  },
  {
    solutionid: '00000000-0000-0000-0000-000000000003',
    uniquename: 'TestSolution',
    friendlyname: 'Test Solution',
    version: '2.0.0.0',
    ismanaged: false
  }
];

/**
 * Mock validation result
 */
export function mockValidateResult(solutionId: string): SolutionValidationResult {
  const solution = mockSolutions.find(s => s.solutionid === solutionId);

  return {
    solutionId,
    solutionUniqueName: solution?.uniquename,
    solutionFriendlyName: solution?.friendlyname,
    validatedAt: new Date(),
    overallStatus: 'Warning',
    totalIssues: 5,
    issuesBySeverity: {
      critical: 0,
      error: 2,
      warning: 2,
      info: 1
    },
    issues: [
      {
        code: 'WORKFLOW_MISSING_SCOPE',
        severity: 'Error' as any,
        message: 'Workflow "Send Welcome Email" is missing a valid scope statement',
        componentName: 'Send Welcome Email'
      },
      {
        code: 'EMAIL_ACTIONS_INVALID',
        severity: 'Error' as any,
        message: 'Some workflow email actions are missing required "from" or "replyto" fields'
      },
      {
        code: 'TABLE_MISSING_DESCRIPTION',
        severity: 'Warning' as any,
        message: 'Table "custom_account" is missing a description',
        componentName: 'custom_account'
      },
      {
        code: 'MISMATCHED_PUBLISHERS',
        severity: 'Warning' as any,
        message: 'Solution contains components from different publishers'
      },
      {
        code: 'SOLUTION_CHECKER_NOT_RUN',
        severity: 'Info' as any,
        message: 'Solution Checker has not been run on this solution'
      }
    ],
    checks: {
      workflows: {
        workflowsMissingScope: [],
        allWorkflowsEnabled: false,
        allBusinessRulesActivated: true,
        emailActionsValid: false,
        totalWorkflows: 5
      },
      components: {
        duplicateComponents: [],
        hasConnectionInDisplayName: false,
        hasConnectionReferences: true,
        hasMismatchedPublishers: true,
        totalComponents: 42
      },
      security: {
        grantsElevatedPrivileges: false,
        grantsAccessOutsidePublisher: false,
        totalSecurityRoles: 2
      },
      metadata: {
        tablesMissingDescription: [],
        totalTables: 8
      },
      quality: {
        solutionCheckerRun: false
      }
    }
  };
}
