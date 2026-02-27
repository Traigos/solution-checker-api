/**
 * Unit tests for WorkflowService
 */

import { WorkflowService } from '../../src/services/workflow-service';
import { HttpClient } from '../../src/utils/http-client';
import {
  mockWorkflow,
  mockWorkflowMissingScope,
  mockDataverseResponse,
  mockSolutionComponent
} from '../mocks/mock-data';

// Mock HttpClient
jest.mock('../../src/utils/http-client');

describe('WorkflowService', () => {
  let workflowService: WorkflowService;
  let mockHttpClient: jest.Mocked<HttpClient>;
  const solutionId = '12345678-1234-1234-1234-123456789012';

  beforeEach(() => {
    mockHttpClient = new HttpClient({
      baseUrl: 'https://test.crm.dynamics.com'
    }) as jest.Mocked<HttpClient>;

    workflowService = new WorkflowService(mockHttpClient);
    jest.clearAllMocks();
  });

  describe('getWorkflowsFromSolutionId', () => {
    it('should get workflows for a solution', async () => {
      const workflowComponent = {
        ...mockSolutionComponent,
        componenttype: 29, // Workflow
        objectid: mockWorkflow.workflowid
      };
      mockHttpClient.get
        .mockResolvedValueOnce({
          data: mockDataverseResponse([workflowComponent])
        } as any)
        .mockResolvedValueOnce({
          data: mockWorkflow
        } as any);

      const result = await workflowService.getWorkflowsFromSolutionId(solutionId);

      expect(result).toEqual([mockWorkflow]);
      expect(mockHttpClient.get).toHaveBeenCalledTimes(2);
    });

    it('should apply query options', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: mockDataverseResponse([])
      } as any);

      const options = {
        $select: ['workflowid', 'name'],
        $filter: 'statecode eq 1'
      };

      await workflowService.getWorkflowsFromSolutionId(solutionId, options);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('$select=workflowid,name')
      );
    });

    it('should handle empty workflow list', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: mockDataverseResponse([])
      } as any);

      const result = await workflowService.getWorkflowsFromSolutionId(solutionId);

      expect(result).toEqual([]);
    });
  });

  describe('flowsMissingScopeStatement', () => {
    it('should find workflows missing valid scope', async () => {
      const workflowComponent1 = {
        ...mockSolutionComponent,
        componenttype: 29,
        objectid: mockWorkflow.workflowid
      };
      const workflowComponent2 = {
        ...mockSolutionComponent,
        componenttype: 29,
        objectid: mockWorkflowMissingScope.workflowid
      };

      mockHttpClient.get
        .mockResolvedValueOnce({
          data: mockDataverseResponse([workflowComponent1, workflowComponent2])
        } as any)
        .mockResolvedValueOnce({ data: mockWorkflow } as any)
        .mockResolvedValueOnce({ data: mockWorkflowMissingScope } as any);

      const result = await workflowService.flowsMissingScopeStatement(solutionId);

      expect(result).toHaveLength(1);
      expect(result[0].workflowid).toBe(mockWorkflowMissingScope.workflowid);
      expect(result[0].scope).toBe(0);
    });

    it('should return empty array if all workflows have valid scope', async () => {
      const workflowComponent = {
        ...mockSolutionComponent,
        componenttype: 29,
        objectid: mockWorkflow.workflowid
      };

      mockHttpClient.get
        .mockResolvedValueOnce({
          data: mockDataverseResponse([workflowComponent])
        } as any)
        .mockResolvedValueOnce({ data: mockWorkflow } as any);

      const result = await workflowService.flowsMissingScopeStatement(solutionId);

      expect(result).toEqual([]);
    });

    it('should identify workflows with undefined scope', async () => {
      const workflowWithoutScope = {
        ...mockWorkflow,
        scope: undefined
      };
      const workflowComponent = {
        ...mockSolutionComponent,
        componenttype: 29,
        objectid: workflowWithoutScope.workflowid
      };

      mockHttpClient.get
        .mockResolvedValueOnce({
          data: mockDataverseResponse([workflowComponent])
        } as any)
        .mockResolvedValueOnce({ data: workflowWithoutScope } as any);

      const result = await workflowService.flowsMissingScopeStatement(solutionId);

      expect(result).toHaveLength(1);
    });
  });

  describe('areAllWorkflowsEnabled', () => {
    it('should return true if all workflows are enabled', async () => {
      const enabledWorkflow = { ...mockWorkflow, statecode: 1 };
      const workflowComponent = {
        ...mockSolutionComponent,
        componenttype: 29,
        objectid: enabledWorkflow.workflowid
      };

      mockHttpClient.get
        .mockResolvedValueOnce({
          data: mockDataverseResponse([workflowComponent])
        } as any)
        .mockResolvedValueOnce({ data: enabledWorkflow } as any);

      const result = await workflowService.areAllWorkflowsEnabled(solutionId);

      expect(result).toBe(true);
    });

    it('should return false if any workflow is disabled', async () => {
      const disabledWorkflow = { ...mockWorkflow, statecode: 0 };
      const workflowComponent = {
        ...mockSolutionComponent,
        componenttype: 29,
        objectid: disabledWorkflow.workflowid
      };

      mockHttpClient.get
        .mockResolvedValueOnce({
          data: mockDataverseResponse([workflowComponent])
        } as any)
        .mockResolvedValueOnce({ data: disabledWorkflow } as any);

      const result = await workflowService.areAllWorkflowsEnabled(solutionId);

      expect(result).toBe(false);
    });

    it('should return true if no workflows exist', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: mockDataverseResponse([])
      } as any);

      const result = await workflowService.areAllWorkflowsEnabled(solutionId);

      expect(result).toBe(true);
    });
  });

  describe('areAllBusinessRulesActivated', () => {
    it('should return true if all business rules are activated', async () => {
      const activatedBusinessRule = {
        ...mockWorkflow,
        category: 2, // Business Rule
        statecode: 1,
        statuscode: 2
      };
      const businessRuleComponent = {
        ...mockSolutionComponent,
        componenttype: 29,
        objectid: activatedBusinessRule.workflowid
      };

      mockHttpClient.get
        .mockResolvedValueOnce({
          data: mockDataverseResponse([businessRuleComponent])
        } as any)
        .mockResolvedValueOnce({ data: activatedBusinessRule } as any);

      const result = await workflowService.areAllBusinessRulesActivated(solutionId);

      expect(result).toBe(true);
    });

    it('should return false if any business rule is not activated', async () => {
      const draftBusinessRule = {
        ...mockWorkflow,
        category: 2,
        statecode: 0,
        statuscode: 1
      };
      const businessRuleComponent = {
        ...mockSolutionComponent,
        componenttype: 29,
        objectid: draftBusinessRule.workflowid
      };

      mockHttpClient.get
        .mockResolvedValueOnce({
          data: mockDataverseResponse([businessRuleComponent])
        } as any)
        .mockResolvedValueOnce({ data: draftBusinessRule } as any);

      const result = await workflowService.areAllBusinessRulesActivated(solutionId);

      expect(result).toBe(false);
    });

    it('should return true if no business rules exist', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: mockDataverseResponse([])
      } as any);

      const result = await workflowService.areAllBusinessRulesActivated(solutionId);

      expect(result).toBe(true);
    });
  });

  describe('validateWorkflowEmailActions', () => {
    it('should return true if all email actions are valid', async () => {
      const validEmailXaml = `
        <Activity>
          <SendEmail From="test@example.com" ReplyTo="reply@example.com">
            <To>recipient@example.com</To>
          </SendEmail>
        </Activity>
      `;
      const workflowWithEmail = { ...mockWorkflow, xaml: validEmailXaml };
      const workflowComponent = {
        ...mockSolutionComponent,
        componenttype: 29,
        objectid: workflowWithEmail.workflowid
      };

      mockHttpClient.get
        .mockResolvedValueOnce({
          data: mockDataverseResponse([workflowComponent])
        } as any)
        .mockResolvedValueOnce({ data: workflowWithEmail } as any);

      const result = await workflowService.validateWorkflowEmailActions(solutionId);

      expect(result).toBe(true);
    });

    it('should return true if no email actions exist', async () => {
      const workflowComponent = {
        ...mockSolutionComponent,
        componenttype: 29,
        objectid: mockWorkflow.workflowid
      };

      mockHttpClient.get
        .mockResolvedValueOnce({
          data: mockDataverseResponse([workflowComponent])
        } as any)
        .mockResolvedValueOnce({ data: mockWorkflow } as any);

      const result = await workflowService.validateWorkflowEmailActions(solutionId);

      expect(result).toBe(true);
    });
  });

  describe('updateEmailAndApprovalWorkflowActions', () => {
    it('should update workflow XAML with email address', async () => {
      const xaml = `
        <Activity>
          <SendEmail From="" ReplyTo="">
            <To>recipient@example.com</To>
          </SendEmail>
        </Activity>
      `;
      const workflow = { ...mockWorkflow, xaml };

      mockHttpClient.get.mockResolvedValue({ data: workflow } as any);
      mockHttpClient.put.mockResolvedValue({ data: {} } as any);

      await workflowService.updateEmailAndApprovalWorkflowActions(
        mockWorkflow.workflowid!,
        'new-email@example.com'
      );

      expect(mockHttpClient.get).toHaveBeenCalled();
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        expect.stringContaining(mockWorkflow.workflowid!),
        expect.objectContaining({
          xaml: expect.stringContaining('new-email@example.com')
        })
      );
    });
  });
});
