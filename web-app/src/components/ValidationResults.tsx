import React from 'react';
import { SolutionValidationResult, ValidationSeverity } from '../types';

interface ValidationResultsProps {
  result: SolutionValidationResult | null;
  loading: boolean;
}

export const ValidationResults: React.FC<ValidationResultsProps> = ({ result, loading }) => {
  if (loading) {
    return (
      <div className="validation-results">
        <div className="loading">Running validation checks...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="validation-results">
        <div className="empty">Select a solution and click "Run Validation" to see results</div>
      </div>
    );
  }

  const getSeverityClass = (severity: ValidationSeverity): string => {
    return severity.toLowerCase();
  };

  const getStatusClass = (status: string): string => {
    return status.toLowerCase();
  };

  return (
    <div className="validation-results">
      <div className="result-header">
        <h2>Validation Results</h2>
        <div className={`overall-status ${getStatusClass(result.overallStatus)}`}>
          {result.overallStatus}
        </div>
      </div>

      <div className="result-info">
        <div className="result-info-item">
          <strong>Solution:</strong> {result.solutionFriendlyName}
        </div>
        <div className="result-info-item">
          <strong>Validated:</strong> {new Date(result.validatedAt).toLocaleString()}
        </div>
        <div className="result-info-item">
          <strong>Total Issues:</strong> {result.totalIssues}
        </div>
      </div>

      <div className="severity-summary">
        <div className="severity-item critical">
          <div className="severity-count">{result.issuesBySeverity.critical}</div>
          <div className="severity-label">Critical</div>
        </div>
        <div className="severity-item error">
          <div className="severity-count">{result.issuesBySeverity.error}</div>
          <div className="severity-label">Errors</div>
        </div>
        <div className="severity-item warning">
          <div className="severity-count">{result.issuesBySeverity.warning}</div>
          <div className="severity-label">Warnings</div>
        </div>
        <div className="severity-item info">
          <div className="severity-count">{result.issuesBySeverity.info}</div>
          <div className="severity-label">Info</div>
        </div>
      </div>

      <div className="issues-list">
        <h3>Issues Found</h3>
        {result.issues.length === 0 ? (
          <div className="no-issues">No issues found - solution is valid!</div>
        ) : (
          result.issues.map((issue, index) => (
            <div key={index} className={`issue-item ${getSeverityClass(issue.severity)}`}>
              <div className="issue-header">
                <span className={`issue-severity ${getSeverityClass(issue.severity)}`}>
                  {issue.severity}
                </span>
                <span className="issue-code">{issue.code}</span>
              </div>
              <div className="issue-message">{issue.message}</div>
              {issue.componentName && (
                <div className="issue-component">Component: {issue.componentName}</div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="check-details">
        <h3>Check Details</h3>
        <div className="check-category">
          <h4>Workflows</h4>
          <div className="check-stats">
            <div>Total Workflows: {result.checks.workflows.totalWorkflows}</div>
            <div>All Enabled: {result.checks.workflows.allWorkflowsEnabled ? 'Yes' : 'No'}</div>
            <div>Email Actions Valid: {result.checks.workflows.emailActionsValid ? 'Yes' : 'No'}</div>
          </div>
        </div>

        <div className="check-category">
          <h4>Components</h4>
          <div className="check-stats">
            <div>Total Components: {result.checks.components.totalComponents}</div>
            <div>Has Connection References: {result.checks.components.hasConnectionReferences ? 'Yes' : 'No'}</div>
            <div>Mismatched Publishers: {result.checks.components.hasMismatchedPublishers ? 'Yes' : 'No'}</div>
          </div>
        </div>

        <div className="check-category">
          <h4>Security</h4>
          <div className="check-stats">
            <div>Total Security Roles: {result.checks.security.totalSecurityRoles}</div>
            <div>Grants Elevated Privileges: {result.checks.security.grantsElevatedPrivileges ? 'Yes' : 'No'}</div>
          </div>
        </div>

        <div className="check-category">
          <h4>Metadata</h4>
          <div className="check-stats">
            <div>Total Tables: {result.checks.metadata.totalTables}</div>
            <div>Tables Missing Description: {result.checks.metadata.tablesMissingDescription?.length || 0}</div>
          </div>
        </div>

        <div className="check-category">
          <h4>Quality</h4>
          <div className="check-stats">
            <div>Solution Checker Run: {result.checks.quality.solutionCheckerRun ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
