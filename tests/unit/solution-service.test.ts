/**
 * Unit tests for SolutionService
 */

import { SolutionService } from '../../src/services/solution-service';
import { HttpClient } from '../../src/utils/http-client';
import {
  mockSolution,
  mockManagedSolution,
  mockSolutionComponent,
  mockDataverseResponse,
  mockImportJob,
  mockCompletedImportJob,
  mockFailedImportJob
} from '../mocks/mock-data';

// Mock HttpClient
jest.mock('../../src/utils/http-client');

describe('SolutionService', () => {
  let solutionService: SolutionService;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = new HttpClient({
      baseUrl: 'https://test.crm.dynamics.com'
    }) as jest.Mocked<HttpClient>;

    solutionService = new SolutionService(mockHttpClient);
    jest.clearAllMocks();
  });

  describe('getSolutions', () => {
    it('should get all solutions', async () => {
      const mockResponse = mockDataverseResponse([mockSolution, mockManagedSolution]);
      mockHttpClient.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await solutionService.getSolutions();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/solutions');
      expect(result).toEqual(mockResponse.value);
      expect(result).toHaveLength(2);
    });

    it('should apply query options', async () => {
      const mockResponse = mockDataverseResponse([mockSolution]);
      mockHttpClient.get.mockResolvedValue({ data: mockResponse } as any);

      const options = {
        $select: ['solutionid', 'uniquename'],
        $filter: 'isvisible eq true',
        $top: 10
      };

      await solutionService.getSolutions(options);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('$select=solutionid,uniquename')
      );
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('$filter=')
      );
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('$top=10')
      );
    });
  });

  describe('getSolutionById', () => {
    it('should get solution by ID', async () => {
      mockHttpClient.get.mockResolvedValue({ data: mockSolution } as any);

      const result = await solutionService.getSolutionById(mockSolution.solutionid!);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/solutions(${mockSolution.solutionid})`
      );
      expect(result).toEqual(mockSolution);
    });
  });

  describe('getSolutionByUniqueName', () => {
    it('should get solution by unique name', async () => {
      const mockResponse = mockDataverseResponse([mockSolution]);
      mockHttpClient.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await solutionService.getSolutionByUniqueName('TestSolution');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining("uniquename eq 'TestSolution'")
      );
      expect(result).toEqual(mockSolution);
    });

    it('should return null if solution not found', async () => {
      const mockResponse = mockDataverseResponse([]);
      mockHttpClient.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await solutionService.getSolutionByUniqueName('NonExistent');

      expect(result).toBeNull();
    });
  });

  describe('getSolutionComponentsBySolutionId', () => {
    it('should get components for a solution', async () => {
      const mockResponse = mockDataverseResponse([mockSolutionComponent]);
      mockHttpClient.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await solutionService.getSolutionComponentsBySolutionId(
        mockSolution.solutionid!
      );

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining(`_solutionid_value eq '${mockSolution.solutionid}'`)
      );
      expect(result).toEqual(mockResponse.value);
    });
  });

  describe('importSolution', () => {
    it('should import solution from base64 string', async () => {
      const base64Content = 'UEsDBBQAAAAIAA==';
      const mockResponse = {
        ImportJobId: 'job-123',
        Success: true
      };
      mockHttpClient.post.mockResolvedValue({ data: mockResponse } as any);

      const result = await solutionService.importSolution(base64Content, {
        OverwriteUnmanagedCustomizations: true,
        PublishWorkflows: true
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/ImportSolution',
        expect.objectContaining({
          CustomizationFile: base64Content,
          OverwriteUnmanagedCustomizations: true,
          PublishWorkflows: true
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should import solution from Buffer', async () => {
      const buffer = Buffer.from('test solution content');
      const mockResponse = {
        ImportJobId: 'job-456',
        Success: true
      };
      mockHttpClient.post.mockResolvedValue({ data: mockResponse } as any);

      const result = await solutionService.importSolution(buffer);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/ImportSolution',
        expect.objectContaining({
          CustomizationFile: buffer.toString('base64')
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should use default import options', async () => {
      const base64Content = 'UEsDBBQAAAAIAA==';
      mockHttpClient.post.mockResolvedValue({ data: {} } as any);

      await solutionService.importSolution(base64Content);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/ImportSolution',
        expect.objectContaining({
          OverwriteUnmanagedCustomizations: false,
          PublishWorkflows: true,
          ConvertToManaged: false
        })
      );
    });
  });

  describe('importSolutionAsync', () => {
    it('should start async import and return job ID', async () => {
      const base64Content = 'UEsDBBQAAAAIAA==';
      mockHttpClient.post.mockResolvedValue({ data: {} } as any);

      const jobId = await solutionService.importSolutionAsync(base64Content);

      expect(jobId).toBeDefined();
      expect(typeof jobId).toBe('string');
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/ImportSolutionAsync',
        expect.objectContaining({
          ImportJobId: jobId,
          CustomizationFile: base64Content
        })
      );
    });
  });

  describe('getImportJobStatus', () => {
    it('should get import job status', async () => {
      mockHttpClient.get.mockResolvedValue({ data: mockImportJob } as any);

      const result = await solutionService.getImportJobStatus('job-123');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('importjobs(job-123)')
      );
      expect(result).toEqual(mockImportJob);
    });

    it('should return null if job not found', async () => {
      mockHttpClient.get.mockRejectedValue({
        response: { status: 404 }
      });

      const result = await solutionService.getImportJobStatus('non-existent');

      expect(result).toBeNull();
    });

    it('should throw error for other failures', async () => {
      mockHttpClient.get.mockRejectedValue({
        response: { status: 500 }
      });

      await expect(
        solutionService.getImportJobStatus('job-123')
      ).rejects.toBeDefined();
    });
  });

  describe('waitForImportCompletion', () => {
    it('should wait for import to complete', async () => {
      // First call: in progress
      mockHttpClient.get
        .mockResolvedValueOnce({ data: mockImportJob } as any)
        .mockResolvedValueOnce({ data: mockCompletedImportJob } as any);

      const result = await solutionService.waitForImportCompletion(
        'job-123',
        100, // 100ms poll interval
        5000 // 5 second timeout
      );

      expect(result).toEqual(mockCompletedImportJob);
      expect(result.statuscode).toBe(1); // Completed
    });

    it('should throw error if import fails', async () => {
      mockHttpClient.get.mockResolvedValue({ data: mockFailedImportJob } as any);

      await expect(
        solutionService.waitForImportCompletion('job-456', 100, 5000)
      ).rejects.toThrow('Import job failed');
    });

    it('should throw error on timeout', async () => {
      mockHttpClient.get.mockResolvedValue({ data: mockImportJob } as any);

      await expect(
        solutionService.waitForImportCompletion('job-123', 100, 200)
      ).rejects.toThrow('timed out');
    }, 10000);

    it('should throw error if job not found', async () => {
      mockHttpClient.get.mockRejectedValue({
        response: { status: 404 }
      });

      await expect(
        solutionService.waitForImportCompletion('non-existent', 100, 5000)
      ).rejects.toThrow('not found');
    });
  });

  describe('exportSolution', () => {
    it('should export solution as unmanaged', async () => {
      const base64Zip = 'UEsDBBQAAAAIAA==';
      mockHttpClient.post.mockResolvedValue({
        data: { ExportSolutionFile: base64Zip }
      } as any);

      const result = await solutionService.exportSolution('TestSolution', false);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/ExportSolution',
        expect.objectContaining({
          SolutionName: 'TestSolution',
          Managed: false
        })
      );
      expect(result).toBe(base64Zip);
    });

    it('should export solution as managed', async () => {
      const base64Zip = 'UEsDBBQAAAAIAA==';
      mockHttpClient.post.mockResolvedValue({
        data: { ExportSolutionFile: base64Zip }
      } as any);

      const result = await solutionService.exportSolution('TestSolution', true);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/ExportSolution',
        expect.objectContaining({
          SolutionName: 'TestSolution',
          Managed: true
        })
      );
      expect(result).toBe(base64Zip);
    });

    it('should include export options', async () => {
      const base64Zip = 'UEsDBBQAAAAIAA==';
      mockHttpClient.post.mockResolvedValue({
        data: { ExportSolutionFile: base64Zip }
      } as any);

      await solutionService.exportSolution('TestSolution', false, {
        ExportAutoNumberingSettings: true,
        ExportCalendarSettings: true
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/ExportSolution',
        expect.objectContaining({
          ExportAutoNumberingSettings: true,
          ExportCalendarSettings: true
        })
      );
    });

    it('should throw error if export fails', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: {}
      } as any);

      await expect(
        solutionService.exportSolution('TestSolution', false)
      ).rejects.toThrow('Export failed');
    });
  });

  describe('deleteSolution', () => {
    it('should delete solution by ID', async () => {
      mockHttpClient.delete.mockResolvedValue({ data: {} } as any);

      await solutionService.deleteSolution(mockSolution.solutionid!);

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        `/solutions(${mockSolution.solutionid})`
      );
    });
  });

  describe('deleteSolutionByUniqueName', () => {
    it('should delete solution by unique name', async () => {
      const mockResponse = mockDataverseResponse([mockSolution]);
      mockHttpClient.get.mockResolvedValue({ data: mockResponse } as any);
      mockHttpClient.delete.mockResolvedValue({ data: {} } as any);

      await solutionService.deleteSolutionByUniqueName('TestSolution');

      expect(mockHttpClient.get).toHaveBeenCalled();
      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        `/solutions(${mockSolution.solutionid})`
      );
    });

    it('should throw error if solution not found', async () => {
      const mockResponse = mockDataverseResponse([]);
      mockHttpClient.get.mockResolvedValue({ data: mockResponse } as any);

      await expect(
        solutionService.deleteSolutionByUniqueName('NonExistent')
      ).rejects.toThrow('not found');
    });
  });

  describe('cloneSolution', () => {
    it('should clone solution', async () => {
      const newSolution = { ...mockSolution, uniquename: 'TestSolution_Patch_1' };
      mockHttpClient.post.mockResolvedValue({ data: newSolution } as any);

      const result = await solutionService.cloneSolution(
        'TestSolution',
        'TestSolution_Patch_1',
        'Test Solution Patch 1',
        '1.0.0.1'
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/CloneSolution',
        expect.objectContaining({
          ParentSolutionUniqueName: 'TestSolution',
          UniqueName: 'TestSolution_Patch_1',
          DisplayName: 'Test Solution Patch 1',
          VersionNumber: '1.0.0.1'
        })
      );
      expect(result).toEqual(newSolution);
    });
  });

  describe('doesSolutionHaveConnectionReferences', () => {
    it('should return true if solution has connection references', async () => {
      const componentWithConnectionRef = {
        ...mockSolutionComponent,
        componenttype: 372 // ConnectionReference
      };
      const mockResponse = mockDataverseResponse([componentWithConnectionRef]);
      mockHttpClient.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await solutionService.doesSolutionHaveConnectionReferences(
        mockSolution.solutionid!
      );

      expect(result).toBe(true);
    });

    it('should return false if solution has no connection references', async () => {
      const mockResponse = mockDataverseResponse([]);
      mockHttpClient.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await solutionService.doesSolutionHaveConnectionReferences(
        mockSolution.solutionid!
      );

      expect(result).toBe(false);
    });
  });
});
