// Copy the types from the parent library
// In a real app, you'd import these from the published package

export interface Solution {
  solutionid?: string;
  uniquename?: string;
  friendlyname?: string;
  version?: string;
  ismanaged?: boolean;
}

export enum ValidationSeverity {
  Info = 'Info',
  Warning = 'Warning',
  Error = 'Error',
  Critical = 'Critical'
}

export interface ValidationIssue {
  code: string;
  severity: ValidationSeverity;
  message: string;
  componentId?: string;
  componentName?: string;
  details?: any;
}

export interface SolutionValidationResult {
  solutionId: string;
  solutionUniqueName?: string;
  solutionFriendlyName?: string;
  validatedAt: Date;
  overallStatus: 'Pass' | 'Warning' | 'Fail';
  totalIssues: number;
  issuesBySeverity: {
    critical: number;
    error: number;
    warning: number;
    info: number;
  };
  issues: ValidationIssue[];
  checks: {
    workflows: any;
    components: any;
    security: any;
    metadata: any;
    quality: any;
  };
}
