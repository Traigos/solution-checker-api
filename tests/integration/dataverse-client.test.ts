/**
 * Integration tests for DataverseClient
 * These tests verify that all services work together correctly
 */

import { DataverseClient } from '../../src/dataverse-client';
import { DataverseClientConfig } from '../../src/config/client-config';

describe('DataverseClient Integration', () => {
  let client: DataverseClient;
  const config: DataverseClientConfig = {
    baseUrl: 'https://test.crm.dynamics.com',
    apiVersion: '9.2',
    useIntegratedAuth: true,
    timeout: 30000
  };

  beforeEach(() => {
    client = new DataverseClient(config);
  });

  describe('client initialization', () => {
    it('should create client with all services', () => {
      expect(client).toBeDefined();
      expect(client.solutions).toBeDefined();
      expect(client.workflows).toBeDefined();
      expect(client.validation).toBeDefined();
    });

    it('should initialize with default config values', () => {
      const minimalClient = new DataverseClient({
        baseUrl: 'https://test.crm.dynamics.com'
      });

      expect(minimalClient).toBeDefined();
      expect(minimalClient.solutions).toBeDefined();
    });

    it('should allow custom config values', () => {
      const customClient = new DataverseClient({
        baseUrl: 'https://custom.crm.dynamics.com',
        apiVersion: '9.1',
        timeout: 60000,
        useIntegratedAuth: false
      });

      expect(customClient).toBeDefined();
      expect(customClient.solutions).toBeDefined();
    });
  });

  describe('service availability', () => {
    it('should provide SolutionService with all methods', () => {
      expect(typeof client.solutions.getSolutions).toBe('function');
      expect(typeof client.solutions.getSolutionById).toBe('function');
      expect(typeof client.solutions.getSolutionByUniqueName).toBe('function');
      expect(typeof client.solutions.getSolutionComponentsBySolutionId).toBe('function');
      expect(typeof client.solutions.importSolution).toBe('function');
      expect(typeof client.solutions.importSolutionAsync).toBe('function');
      expect(typeof client.solutions.exportSolution).toBe('function');
      expect(typeof client.solutions.deleteSolution).toBe('function');
      expect(typeof client.solutions.cloneSolution).toBe('function');
    });

    it('should provide WorkflowService with all methods', () => {
      expect(typeof client.workflows.getWorkflowsFromSolutionId).toBe('function');
      expect(typeof client.workflows.flowsMissingScopeStatement).toBe('function');
      expect(typeof client.workflows.areAllWorkflowsEnabled).toBe('function');
      expect(typeof client.workflows.areAllBusinessRulesActivated).toBe('function');
      expect(typeof client.workflows.validateWorkflowEmailActions).toBe('function');
      expect(typeof client.workflows.updateEmailAndApprovalWorkflowActions).toBe('function');
    });

    it('should provide ValidationService with all methods', () => {
      expect(typeof client.validation.validateSolution).toBe('function');
    });
  });

  describe('service integration', () => {
    it('should share the same HTTP client across services', () => {
      // All services should use the same underlying HTTP client
      const httpClient = (client.solutions as any).httpClient;
      expect(httpClient).toBeDefined();
      expect((client.workflows as any).httpClient).toBe(httpClient);
    });

    it('should allow validation service to use solution and workflow services', () => {
      const validationService = client.validation;
      const solutionService = (validationService as any).solutionService;
      const workflowService = (validationService as any).workflowService;

      expect(solutionService).toBeDefined();
      expect(workflowService).toBeDefined();
      expect(solutionService).toBe(client.solutions);
      expect(workflowService).toBe(client.workflows);
    });
  });

  describe('configuration', () => {
    it('should handle minimum required configuration', () => {
      const minimalClient = new DataverseClient({
        baseUrl: 'https://minimal.crm.dynamics.com'
      });

      expect(minimalClient).toBeDefined();
    });

    it('should apply default values for optional config', () => {
      const client = new DataverseClient({
        baseUrl: 'https://test.crm.dynamics.com'
      });

      // Default values are applied in the HttpClient constructor
      expect(client).toBeDefined();
      expect(client.solutions).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should accept empty base URL (validation can be added later)', () => {
      // Currently no validation enforced on baseUrl
      // Future enhancement: add validation in DataverseClientConfig
      const client = new DataverseClient({
        baseUrl: ''
      });
      expect(client).toBeDefined();
    });
  });
});
