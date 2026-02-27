/**
 * Unit tests for ValidationService
 */

import { ValidationService } from '../../src/services/validation-service';
import { SolutionService } from '../../src/services/solution-service';
import { WorkflowService } from '../../src/services/workflow-service';

// Mock the services
jest.mock('../../src/services/solution-service');
jest.mock('../../src/services/workflow-service');

describe('ValidationService', () => {
  let validationService: ValidationService;
  let mockSolutionService: jest.Mocked<SolutionService>;
  let mockWorkflowService: jest.Mocked<WorkflowService>;
  const solutionId = '12345678-1234-1234-1234-123456789012';

  beforeEach(() => {
    mockSolutionService = new SolutionService({} as any) as jest.Mocked<SolutionService>;
    mockWorkflowService = new WorkflowService({} as any) as jest.Mocked<WorkflowService>;
    validationService = new ValidationService(mockSolutionService, mockWorkflowService);
    jest.clearAllMocks();
  });

  describe('validateSolution', () => {
    it('should run all validation checks', async () => {
      // Mock getSolutionById first
      const mockSolution = {
        solutionid: solutionId,
        uniquename: 'TestSolution',
        friendlyname: 'Test Solution'
      };
      mockSolutionService.getSolutionById.mockResolvedValue(mockSolution as any);

      // Mock all check methods
      mockWorkflowService.getWorkflowsFromSolutionId.mockResolvedValue([]);
      mockWorkflowService.flowsMissingScopeStatement.mockResolvedValue([]);
      mockWorkflowService.areAllWorkflowsEnabled.mockResolvedValue(true);
      mockWorkflowService.areAllBusinessRulesActivated.mockResolvedValue(true);
      mockWorkflowService.validateWorkflowEmailActions.mockResolvedValue(true);
      mockSolutionService.getSolutionComponentsBySolutionId.mockResolvedValue([]);
      mockSolutionService.getSolutionComponentsFoundInOtherSolutions.mockResolvedValue([]);
      mockSolutionService.doesSolutionHaveConnectionReferences.mockResolvedValue(false);
      mockSolutionService.doesSolutionCustomizeComponentsWherePublisherDoesNotMatchSolutionPublisher
        .mockResolvedValue(false);
      mockSolutionService.doesSecurityRoleGrantSystemCustomizerOrSystemAdmin
        .mockResolvedValue(false);
      mockSolutionService.doesSecurityRoleGrantAccessToTableOutsideOfPublisher
        .mockResolvedValue(false);
      mockSolutionService.allTablesModifiedBySolutionMissingDescription.mockResolvedValue([]);
      mockSolutionService.hasSolutionCheckerBeenRun.mockResolvedValue(false);

      const result = await validationService.validateSolution(solutionId);

      expect(result).toBeDefined();
      expect(result.solutionId).toBe(solutionId);
      expect(result.overallStatus).toBeDefined();
      expect(result.totalIssues).toBeDefined();
      expect(result.issues).toBeInstanceOf(Array);
      expect(result.checks).toBeDefined();
    });

    it('should return Pass status when no issues found', async () => {
      // Mock getSolutionById
      mockSolutionService.getSolutionById.mockResolvedValue({
        solutionid: solutionId,
        uniquename: 'TestSolution',
        friendlyname: 'Test Solution'
      } as any);

      // Mock all checks to pass
      mockWorkflowService.getWorkflowsFromSolutionId.mockResolvedValue([]);
      mockWorkflowService.flowsMissingScopeStatement.mockResolvedValue([]);
      mockWorkflowService.areAllWorkflowsEnabled.mockResolvedValue(true);
      mockWorkflowService.areAllBusinessRulesActivated.mockResolvedValue(true);
      mockWorkflowService.validateWorkflowEmailActions.mockResolvedValue(true);
      mockSolutionService.getSolutionComponentsBySolutionId.mockResolvedValue([]);
      mockSolutionService.getSolutionComponentsFoundInOtherSolutions.mockResolvedValue([]);
      mockSolutionService.doesSolutionHaveConnectionReferences.mockResolvedValue(false);
      mockSolutionService.doesSolutionCustomizeComponentsWherePublisherDoesNotMatchSolutionPublisher
        .mockResolvedValue(false);
      mockSolutionService.doesSecurityRoleGrantSystemCustomizerOrSystemAdmin
        .mockResolvedValue(false);
      mockSolutionService.doesSecurityRoleGrantAccessToTableOutsideOfPublisher
        .mockResolvedValue(false);
      mockSolutionService.allTablesModifiedBySolutionMissingDescription.mockResolvedValue([]);
      mockSolutionService.hasSolutionCheckerBeenRun.mockResolvedValue(true);

      const result = await validationService.validateSolution(solutionId);

      expect(result.overallStatus).toBe('Pass');
      expect(result.totalIssues).toBe(0);
      expect(result.issuesBySeverity.critical).toBe(0);
      expect(result.issuesBySeverity.error).toBe(0);
    });

    it('should return Fail status when critical/error issues found', async () => {
      // Mock getSolutionById
      mockSolutionService.getSolutionById.mockResolvedValue({
        solutionid: solutionId,
        uniquename: 'TestSolution',
        friendlyname: 'Test Solution'
      } as any);

      // Mock checks with failures
      mockWorkflowService.getWorkflowsFromSolutionId.mockResolvedValue([]);
      mockWorkflowService.flowsMissingScopeStatement.mockResolvedValue([
        { workflowid: 'wf-1', name: 'Test Workflow', scope: 0 } as any
      ]);
      mockWorkflowService.areAllWorkflowsEnabled.mockResolvedValue(false);
      mockWorkflowService.areAllBusinessRulesActivated.mockResolvedValue(true);
      mockWorkflowService.validateWorkflowEmailActions.mockResolvedValue(false);
      mockSolutionService.getSolutionComponentsBySolutionId.mockResolvedValue([]);
      mockSolutionService.getSolutionComponentsFoundInOtherSolutions.mockResolvedValue([]);
      mockSolutionService.doesSolutionHaveConnectionReferences.mockResolvedValue(false);
      mockSolutionService.doesSolutionCustomizeComponentsWherePublisherDoesNotMatchSolutionPublisher
        .mockResolvedValue(false);
      mockSolutionService.doesSecurityRoleGrantSystemCustomizerOrSystemAdmin
        .mockResolvedValue(false);
      mockSolutionService.doesSecurityRoleGrantAccessToTableOutsideOfPublisher
        .mockResolvedValue(false);
      mockSolutionService.allTablesModifiedBySolutionMissingDescription.mockResolvedValue([]);
      mockSolutionService.hasSolutionCheckerBeenRun.mockResolvedValue(false);

      const result = await validationService.validateSolution(solutionId);

      expect(result.overallStatus).toBe('Fail');
      expect(result.totalIssues).toBeGreaterThan(0);
    });

    it('should return Warning status when only warnings found', async () => {
      // Mock getSolutionById
      mockSolutionService.getSolutionById.mockResolvedValue({
        solutionid: solutionId,
        uniquename: 'TestSolution',
        friendlyname: 'Test Solution'
      } as any);

      // Mock checks with warnings only
      mockWorkflowService.getWorkflowsFromSolutionId.mockResolvedValue([]);
      mockWorkflowService.flowsMissingScopeStatement.mockResolvedValue([]);
      mockWorkflowService.areAllWorkflowsEnabled.mockResolvedValue(true);
      mockWorkflowService.areAllBusinessRulesActivated.mockResolvedValue(true);
      mockWorkflowService.validateWorkflowEmailActions.mockResolvedValue(true);
      mockSolutionService.getSolutionComponentsBySolutionId.mockResolvedValue([]);
      mockSolutionService.getSolutionComponentsFoundInOtherSolutions.mockResolvedValue([
        { objectid: 'obj-1', componenttype: 1 } as any
      ]);
      mockSolutionService.doesSolutionHaveConnectionReferences.mockResolvedValue(false);
      mockSolutionService.doesSolutionCustomizeComponentsWherePublisherDoesNotMatchSolutionPublisher
        .mockResolvedValue(false);
      mockSolutionService.doesSecurityRoleGrantSystemCustomizerOrSystemAdmin
        .mockResolvedValue(false);
      mockSolutionService.doesSecurityRoleGrantAccessToTableOutsideOfPublisher
        .mockResolvedValue(false);
      mockSolutionService.allTablesModifiedBySolutionMissingDescription.mockResolvedValue([]);
      mockSolutionService.hasSolutionCheckerBeenRun.mockResolvedValue(false);

      const result = await validationService.validateSolution(solutionId);

      expect(result.overallStatus).toBe('Warning');
      expect(result.totalIssues).toBeGreaterThan(0);
      expect(result.issuesBySeverity.critical).toBe(0);
      expect(result.issuesBySeverity.error).toBe(0);
    });

    it('should aggregate issues by severity', async () => {
      // Mock getSolutionById
      mockSolutionService.getSolutionById.mockResolvedValue({
        solutionid: solutionId,
        uniquename: 'TestSolution',
        friendlyname: 'Test Solution'
      } as any);

      mockWorkflowService.getWorkflowsFromSolutionId.mockResolvedValue([]);
      mockWorkflowService.flowsMissingScopeStatement.mockResolvedValue([
        { workflowid: 'wf-1' } as any
      ]);
      mockWorkflowService.areAllWorkflowsEnabled.mockResolvedValue(false);
      mockWorkflowService.areAllBusinessRulesActivated.mockResolvedValue(false);
      mockWorkflowService.validateWorkflowEmailActions.mockResolvedValue(true);
      mockSolutionService.getSolutionComponentsBySolutionId.mockResolvedValue([]);
      mockSolutionService.getSolutionComponentsFoundInOtherSolutions.mockResolvedValue([
        { objectid: 'obj-1' } as any
      ]);
      mockSolutionService.doesSolutionHaveConnectionReferences.mockResolvedValue(false);
      mockSolutionService.doesSolutionCustomizeComponentsWherePublisherDoesNotMatchSolutionPublisher
        .mockResolvedValue(false);
      mockSolutionService.doesSecurityRoleGrantSystemCustomizerOrSystemAdmin
        .mockResolvedValue(false);
      mockSolutionService.doesSecurityRoleGrantAccessToTableOutsideOfPublisher
        .mockResolvedValue(false);
      mockSolutionService.allTablesModifiedBySolutionMissingDescription.mockResolvedValue([]);
      mockSolutionService.hasSolutionCheckerBeenRun.mockResolvedValue(false);

      const result = await validationService.validateSolution(solutionId);

      expect(result.issuesBySeverity).toBeDefined();
      expect(result.totalIssues).toBe(
        result.issuesBySeverity.critical +
        result.issuesBySeverity.error +
        result.issuesBySeverity.warning +
        result.issuesBySeverity.info
      );
    });

    it('should include detailed check results', async () => {
      // Mock getSolutionById
      mockSolutionService.getSolutionById.mockResolvedValue({
        solutionid: solutionId,
        uniquename: 'TestSolution',
        friendlyname: 'Test Solution'
      } as any);

      mockWorkflowService.getWorkflowsFromSolutionId.mockResolvedValue([]);
      mockWorkflowService.flowsMissingScopeStatement.mockResolvedValue([]);
      mockWorkflowService.areAllWorkflowsEnabled.mockResolvedValue(true);
      mockWorkflowService.areAllBusinessRulesActivated.mockResolvedValue(true);
      mockWorkflowService.validateWorkflowEmailActions.mockResolvedValue(true);
      mockSolutionService.getSolutionComponentsBySolutionId.mockResolvedValue([]);
      mockSolutionService.getSolutionComponentsFoundInOtherSolutions.mockResolvedValue([]);
      mockSolutionService.doesSolutionHaveConnectionReferences.mockResolvedValue(false);
      mockSolutionService.doesSolutionCustomizeComponentsWherePublisherDoesNotMatchSolutionPublisher
        .mockResolvedValue(false);
      mockSolutionService.doesSecurityRoleGrantSystemCustomizerOrSystemAdmin
        .mockResolvedValue(false);
      mockSolutionService.doesSecurityRoleGrantAccessToTableOutsideOfPublisher
        .mockResolvedValue(false);
      mockSolutionService.allTablesModifiedBySolutionMissingDescription.mockResolvedValue([]);
      mockSolutionService.hasSolutionCheckerBeenRun.mockResolvedValue(false);

      const result = await validationService.validateSolution(solutionId);

      expect(result.checks.workflows).toBeDefined();
      expect(result.checks.components).toBeDefined();
      expect(result.checks.security).toBeDefined();
      expect(result.checks.metadata).toBeDefined();
      expect(result.checks.quality).toBeDefined();
    });
  });
});
